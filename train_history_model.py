"""train_history_model.py
Train a ML model from existing MongoDB heart rate + user profile data.
Dự đoán severity/status (mục tiêu) dựa trên dữ liệu đã ghi nhận.

Yêu cầu:
  - MONGODB_URI trong environment (.env)
  - Python packages: pandas, numpy, scikit-learn, joblib, pymongo (mongoose không dùng được trực tiếp)

Cách chạy:
  source ai_env/bin/activate
  python train_history_model.py --label-source aiDiagnosis.severity --days 30

Artifacts:
  - heart_model/history_model.pkl : pickle chứa {'model','scaler','feature_names','conditions_used'}
  - heart_model/history_features.json : metadata feature order & encodings
"""

import os
import sys
import json
import math
import argparse
from datetime import datetime, timedelta
from collections import Counter

import numpy as np
import pandas as pd
from pymongo import MongoClient
from bson import ObjectId
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight
import joblib

DEFAULT_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/be_project")
ARTIFACT_DIR = os.path.join("heart_model")
os.makedirs(ARTIFACT_DIR, exist_ok=True)

# ------------------------------- Data Fetch ---------------------------------

def fetch_records(uri: str, days: int | None, start_date: str | None, end_date: str | None):
    client = MongoClient(uri)
    db = client.get_default_database() if uri.endswith("be_project") else client.get_database()
    data_col = db["datas"] if "datas" in db.list_collection_names() else db["data"] if "data" in db.list_collection_names() else db["Data"]
    users_col = db["users"] if "users" in db.list_collection_names() else db["user"] if "user" in db.list_collection_names() else db["User"]

    time_filter = {}
    if start_date or end_date:
        time_filter["createdAt"] = {}
        if start_date:
            time_filter["createdAt"]["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            time_filter["createdAt"]["$lte"] = datetime.fromisoformat(end_date)
    elif days:
        since = datetime.utcnow() - timedelta(days=days)
        time_filter["createdAt"] = {"$gte": since}

    query = time_filter if time_filter else {}
    records = list(data_col.find(query))

    # Attach user profile
    user_cache = {}
    for r in records:
        uid = r.get("userId")
        if isinstance(uid, ObjectId):
            uid_str = str(uid)
        else:
            uid_str = uid
        if uid_str and uid_str not in user_cache:
            user_doc = users_col.find_one({"_id": ObjectId(uid_str)}) if ObjectId.is_valid(uid_str) else users_col.find_one({"_id": uid_str})
            user_cache[uid_str] = user_doc or {}
        r["_user"] = user_cache.get(uid_str, {})
    client.close()
    return records

# ----------------------------- Feature Engineering ---------------------------

def build_dataframe(records, label_source: str):
    rows = []
    for r in records:
        user = r.get("_user", {})
        ai_diag = r.get("aiDiagnosis", {})
        severity = ai_diag.get("severity")  # 'low','medium','high','critical'
        status = r.get("status")  # 'normal','warning','critical'

        # Pick label
        label = None
        if label_source == "aiDiagnosis.severity":
            label = severity
        elif label_source == "status":
            label = status
        else:
            label = severity or status

        if not label:
            continue  # skip unlabeled

        row = {
            "heartRate": r.get("heartRate"),
            "age": user.get("age"),
            "gender": user.get("gender"),
            "weight": user.get("weight"),
            "conditions": user.get("conditions", []),
            "label": label,
            "created_hour": r.get("createdAt", datetime.utcnow()).hour if r.get("createdAt") else None,
            "is_night": 1 if r.get("createdAt") and (r.get("createdAt").hour < 6 or r.get("createdAt").hour >= 22) else 0,
        }
        rows.append(row)

    df = pd.DataFrame(rows)
    # Clean
    df = df.dropna(subset=["heartRate"])  # heartRate is required
    return df

CONDITION_LIMIT = 20  # limit distinct conditions for one-hot


def encode_features(df: pd.DataFrame):
    # Normalize gender
    df["gender"] = df["gender"].fillna("other").astype(str)
    gender_map = {"male": 0, "female": 1, "other": 2}
    df["gender_enc"] = df["gender"].map(gender_map).fillna(2)

    # Fill age / weight missing with median
    for col in ["age", "weight"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            df[col] = df[col].fillna(df[col].median())

    # Conditions flatten & top-k frequency one-hot
    all_conditions = [c.lower() for arr in df["conditions"].tolist() for c in (arr if isinstance(arr, list) else [])]
    top_conditions = [c for c, _ in Counter(all_conditions).most_common(CONDITION_LIMIT)]

    def cond_vector(conds):
        vec = []
        lower = [c.lower() for c in conds] if isinstance(conds, list) else []
        for c in top_conditions:
            vec.append(1 if c in lower else 0)
        return vec

    cond_matrix = df["conditions"].apply(cond_vector).tolist()
    cond_cols = [f"cond_{c}" for c in top_conditions]
    cond_df = pd.DataFrame(cond_matrix, columns=cond_cols)

    # Risk engineered features
    df["hr_is_low"] = (df["heartRate"] < 60).astype(int)
    df["hr_is_high"] = (df["heartRate"] > 100).astype(int)

    # Assemble final
    feature_df = pd.concat([
        df[["heartRate", "age", "weight", "gender_enc", "created_hour", "is_night", "hr_is_low", "hr_is_high"]].reset_index(drop=True),
        cond_df.reset_index(drop=True)
    ], axis=1)

    return feature_df, df["label"], {
        "gender_map": gender_map,
        "conditions_used": top_conditions,
        "feature_columns": list(feature_df.columns),
    }

# ------------------------------- Label Encoding ------------------------------

LABEL_ORDER = ["low", "medium", "high", "critical", "normal", "warning"]  # union


def encode_labels(labels: pd.Series):
    unique = sorted(set(labels.tolist()))
    mapping = {l: i for i, l in enumerate(LABEL_ORDER) if l in unique}
    encoded = labels.map(mapping)
    return encoded, mapping

# ------------------------------- Training -----------------------------------

def train(df: pd.DataFrame):
    features, labels_raw, meta = encode_features(df)
    labels_enc, label_map = encode_labels(labels_raw)

    # Drop rows with NaN labels
    mask = ~labels_enc.isna()
    features = features[mask]
    labels_enc = labels_enc[mask]
    labels_raw = labels_raw[mask]

    if len(features) < 50:
        print("⚠️ Dữ liệu quá ít (<50) kết quả có thể không ổn định.")

    X_train, X_test, y_train, y_test = train_test_split(features, labels_enc, test_size=0.2, random_state=42, stratify=labels_enc)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    class_weights = compute_class_weight(class_weight="balanced", classes=np.unique(y_train), y=y_train)
    weight_dict = {cls: w for cls, w in zip(np.unique(y_train), class_weights)}

    model = RandomForestClassifier(n_estimators=300, max_depth=None, min_samples_split=4, min_samples_leaf=2, random_state=42, class_weight=weight_dict)
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred, digits=3))
    print("\n🔢 Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    artifacts = {
        "model": model,
        "scaler": scaler,
        "feature_names": meta["feature_columns"],
        "label_map": label_map,
        "conditions_used": meta["conditions_used"],
    }
    return artifacts

# ------------------------------- Save/Load ----------------------------------

def save_artifacts(artifacts, path=os.path.join(ARTIFACT_DIR, "history_model.pkl")):
    joblib.dump(artifacts, path)
    meta_path = os.path.join(ARTIFACT_DIR, "history_features.json")
    meta_json = {
        "feature_names": artifacts["feature_names"],
        "label_map": artifacts["label_map"],
        "conditions_used": artifacts["conditions_used"],
        "saved_at": datetime.utcnow().isoformat()
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta_json, f, ensure_ascii=False, indent=2)
    print(f"💾 Saved model to {path}")
    print(f"🧾 Saved metadata to {meta_path}")

# ------------------------------- Main ---------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Train heart history model from MongoDB data")
    parser.add_argument("--uri", default=DEFAULT_URI, help="MongoDB URI")
    parser.add_argument("--days", type=int, default=30, help="Số ngày lấy dữ liệu gần nhất (bỏ qua nếu set start/end)")
    parser.add_argument("--startDate", type=str, default=None, help="ISO start date (YYYY-MM-DD)")
    parser.add_argument("--endDate", type=str, default=None, help="ISO end date (YYYY-MM-DD)")
    parser.add_argument("--label-source", type=str, default="aiDiagnosis.severity", choices=["aiDiagnosis.severity", "status", "auto"], help="Nguồn nhãn để train")
    args = parser.parse_args()

    print("🫀 Training history-based model")
    print("URI:", args.uri)

    records = fetch_records(args.uri, args.days, args.startDate, args.endDate)
    print(f"📦 Fetched {len(records)} raw records")

    df = build_dataframe(records, args.label_source)
    print(f"🧹 After cleaning: {len(df)} usable rows")

    if df.empty:
        print("🚫 Không có dữ liệu đủ để train.")
        sys.exit(1)

    # Show label distribution
    print("🎯 Label distribution:")
    print(df["label"].value_counts())

    artifacts = train(df)
    save_artifacts(artifacts)
    print("✅ Done")

if __name__ == "__main__":
    main()

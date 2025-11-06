"""predict_history_model.py
Dùng model đã train (history_model.pkl) để dự đoán label từ input mới.
Usage:
  python predict_history_model.py --heartRate 78 --age 55 --gender female --weight 62 \
      --conditions hypertension,diabetes
Output: JSON string to stdout.
"""
import os, json, argparse, sys
import numpy as np
import joblib

ARTIFACT_MODEL = os.path.join('heart_model', 'history_model.pkl')
ARTIFACT_META = os.path.join('heart_model', 'history_features.json')

GENDER_MAP = {"male":0, "female":1, "other":2}

def load_artifacts():
    if not os.path.exists(ARTIFACT_MODEL):
        print(json.dumps({"error":"Model file not found","path":ARTIFACT_MODEL}), file=sys.stdout)
        sys.exit(1)
    bundle = joblib.load(ARTIFACT_MODEL)
    meta = {}
    if os.path.exists(ARTIFACT_META):
        with open(ARTIFACT_META,'r',encoding='utf-8') as f:
            meta = json.load(f)
    return bundle, meta

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--heartRate', type=float, required=True)
    p.add_argument('--age', type=float, default=50)
    p.add_argument('--gender', type=str, default='other')
    p.add_argument('--weight', type=float, default=65)
    p.add_argument('--conditions', type=str, default='')
    p.add_argument('--hour', type=int, default=None)
    return p.parse_args()

def build_vector(args, meta):
    feature_names = meta.get('feature_names', [])
    conditions_used = meta.get('conditions_used', [])

    gender_enc = GENDER_MAP.get(args.gender.lower(), 2)
    created_hour = args.hour if args.hour is not None else 12
    is_night = 1 if created_hour < 6 or created_hour >= 22 else 0
    hr_is_low = 1 if args.heartRate < 60 else 0
    hr_is_high = 1 if args.heartRate > 100 else 0

    cond_list = [c.strip().lower() for c in args.conditions.split(',') if c.strip()]
    cond_vec = [1 if c in cond_list else 0 for c in conditions_used]

    # Build in same order as training
    base_values = {
        'heartRate': args.heartRate,
        'age': args.age,
        'weight': args.weight,
        'gender_enc': gender_enc,
        'created_hour': created_hour,
        'is_night': is_night,
        'hr_is_low': hr_is_low,
        'hr_is_high': hr_is_high
    }

    vec = []
    for name in feature_names:
        if name.startswith('cond_'):
            cond_name = name[len('cond_'):]
            vec.append(1 if cond_name in cond_list else 0)
        else:
            vec.append(base_values.get(name, 0))
    return np.array(vec, dtype=float), {
        'gender_enc': gender_enc,
        'conditions_used': conditions_used,
        'provided_conditions': cond_list
    }

def main():
    args = parse_args()
    bundle, meta = load_artifacts()
    model = bundle['model']
    scaler = bundle['scaler']
    label_map = bundle.get('label_map', {})

    vec, extra = build_vector(args, meta)
    scaled = scaler.transform([vec])
    pred_index = int(model.predict(scaled)[0])
    probs = model.predict_proba(scaled)[0]

    inv_label_map = {v:k for k,v in label_map.items()}
    label = inv_label_map.get(pred_index, 'unknown')

    out = {
        'success': True,
        'prediction': {
            'label': label,
            'label_index': pred_index,
            'probabilities': probs.tolist(),
            'label_map': label_map,
        },
        'input': {
            'heartRate': args.heartRate,
            'age': args.age,
            'gender': args.gender,
            'weight': args.weight,
            'conditions': extra['provided_conditions'],
            'hour': args.hour
        },
        'meta': {
            'feature_names_count': len(meta.get('feature_names', [])),
            'conditions_vector_count': len(extra['conditions_used']),
        }
    }
    print(json.dumps(out, ensure_ascii=False))

if __name__ == '__main__':
    main()

# ai_heart_diagnosis.py
"""
AI Heart Rate Diagnosis System
Sử dụng machine learning để chẩn đoán nhịp tim thông minh hơn
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from imblearn.over_sampling import SMOTE
import warnings
warnings.filterwarnings('ignore')

class HeartDiagnosisAI:
    def __init__(self):
        self.models = {}
        self.scaler = StandardScaler()
        self.best_model = None

    def load_and_preprocess_data(self, filepath='heart.csv'):
        """Load và tiền xử lý dữ liệu"""
        print("🔄 Đang tải dữ liệu...")

        # Đọc dữ liệu (UCI Heart Disease dataset)
        columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
                  'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target']
        df = pd.read_csv(filepath, names=columns, na_values='?')

        # Xử lý missing values
        df = df.dropna()

        # Convert target to severity levels (0-4)
        df['severity'] = df['target']

        print(f"📊 Dataset shape: {df.shape}")
        print(f"🎯 Target distribution:\n{df['severity'].value_counts()}")

        return df

    def feature_engineering(self, df):
        """Tạo features mới từ dữ liệu hiện có"""
        print("🔧 Đang tạo features...")

        # Tạo features mới
        df['age_group'] = pd.cut(df['age'], bins=[0, 40, 50, 60, 70, 100],
                                labels=['young', 'middle', 'senior', 'old', 'very_old'])

        df['bp_category'] = pd.cut(df['trestbps'], bins=[0, 120, 140, 160, 200],
                                  labels=['normal', 'elevated', 'high1', 'high2'])

        df['chol_category'] = pd.cut(df['chol'], bins=[0, 200, 240, 300, 600],
                                    labels=['good', 'borderline', 'high', 'very_high'])

        # Risk score calculation
        df['risk_score'] = (
            (df['age'] > 50).astype(int) +
            (df['trestbps'] > 140).astype(int) +
            (df['chol'] > 240).astype(int) +
            (df['thalach'] < 120).astype(int) +
            df['exang']
        )

        # Encode categorical variables
        categorical_cols = ['sex', 'cp', 'fbs', 'restecg', 'slope', 'ca', 'thal',
                           'age_group', 'bp_category', 'chol_category']

        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))

        return df

    def train_models(self, X, y):
        """Train multiple models và chọn best"""
        print("🤖 Đang train models...")

        # Handle class imbalance
        smote = SMOTE(random_state=42)
        X_resampled, y_resampled = smote.fit_resample(X, y)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_resampled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled
        )

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Define models
        models = {
            'RandomForest': RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                class_weight='balanced'
            ),
            'SVM': SVC(
                kernel='rbf',
                C=1.0,
                gamma='scale',
                probability=True,
                random_state=42,
                class_weight='balanced'
            ),
            'NeuralNetwork': MLPClassifier(
                hidden_layer_sizes=(64, 32, 16),
                activation='relu',
                solver='adam',
                alpha=0.001,
                learning_rate='adaptive',
                max_iter=1000,
                random_state=42
            )
        }

        best_score = 0
        best_model_name = None

        # Train và evaluate từng model
        for name, model in models.items():
            print(f"\n🏃 Training {name}...")

            # Cross validation
            cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='f1_macro')
            print(".3f")

            # Train on full training data
            model.fit(X_train_scaled, y_train)

            # Test performance
            y_pred = model.predict(X_test_scaled)
            test_score = model.score(X_test_scaled, y_test)

            print(".3f")
            print(f"📋 Classification Report:\n{classification_report(y_test, y_pred)}")

            self.models[name] = model

            if test_score > best_score:
                best_score = test_score
                best_model_name = name
                self.best_model = model

        print(f"\n🏆 Best model: {best_model_name} with accuracy: {best_score:.3f}")
        return best_model_name

    def analyze_feature_importance(self, X, feature_names):
        """Phân tích feature importance"""
        if hasattr(self.best_model, 'feature_importances_'):
            importances = self.best_model.feature_importances_
            indices = np.argsort(importances)[::-1]

            print("\n📊 Feature Importance:")
            for i in range(min(10, len(feature_names))):
                print(".3f")

            # Plot feature importance
            plt.figure(figsize=(10, 6))
            plt.title("Feature Importances")
            plt.bar(range(min(10, len(feature_names))),
                   importances[indices[:10]],
                   align="center")
            plt.xticks(range(min(10, len(feature_names))), [feature_names[i] for i in indices[:10]], rotation=45)
            plt.tight_layout()
            plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
            plt.close()

    def predict_heart_rate_risk(self, heart_rate_data):
        """Dự đoán risk dựa trên nhịp tim và các features khác"""
        # Chuẩn bị input data với feature engineering
        age = heart_rate_data.get('age', 50)
        trestbps = heart_rate_data.get('trestbps', 120)
        chol = heart_rate_data.get('chol', 200)
        thalach = heart_rate_data.get('thalach', heart_rate_data.get('heartRate', 80))

        # Feature engineering (phải match với training)
        age_group = 0  # default
        if age <= 40:
            age_group = 0  # young
        elif age <= 50:
            age_group = 1  # middle
        elif age <= 60:
            age_group = 2  # senior
        elif age <= 70:
            age_group = 3  # old
        else:
            age_group = 4  # very_old

        bp_category = 0  # default
        if trestbps <= 120:
            bp_category = 0  # normal
        elif trestbps <= 140:
            bp_category = 1  # elevated
        elif trestbps <= 160:
            bp_category = 2  # high1
        else:
            bp_category = 3  # high2

        chol_category = 0  # default
        if chol <= 200:
            chol_category = 0  # good
        elif chol <= 240:
            chol_category = 1  # borderline
        elif chol <= 300:
            chol_category = 2  # high
        else:
            chol_category = 3  # very_high

        risk_score = (
            (age > 50) +
            (trestbps > 140) +
            (chol > 240) +
            (thalach < 120) +
            heart_rate_data.get('exang', 0)
        )

        # Tạo feature array với 17 features (13 original + 4 engineered)
        features = np.array([[
            age,
            heart_rate_data.get('sex', 1),
            heart_rate_data.get('cp', 0),
            trestbps,
            chol,
            heart_rate_data.get('fbs', 0),
            heart_rate_data.get('restecg', 0),
            thalach,
            heart_rate_data.get('exang', 0),
            heart_rate_data.get('oldpeak', 0),
            heart_rate_data.get('slope', 1),
            heart_rate_data.get('ca', 0),
            heart_rate_data.get('thal', 2),
            age_group,
            bp_category,
            chol_category,
            risk_score
        ]])

        # Scale features
        features_scaled = self.scaler.transform(features)

        # Get predictions
        severity_pred = self.best_model.predict(features_scaled)[0]
        probabilities = self.best_model.predict_proba(features_scaled)[0]

        confidence = np.max(probabilities) * 100

        return {
            'severity': int(severity_pred),
            'confidence': round(confidence, 2),
            'probabilities': probabilities.tolist(),
            'risk_level': self._map_severity_to_risk(severity_pred)
        }

    def _map_severity_to_risk(self, severity):
        """Map severity level to risk description"""
        risk_map = {
            0: 'very_low',
            1: 'low',
            2: 'medium',
            3: 'high',
            4: 'critical'
        }
        return risk_map.get(severity, 'unknown')

    def save_model(self, filepath='heart_diagnosis_model.pkl'):
        """Lưu model đã train"""
        model_data = {
            'model': self.best_model,
            'scaler': self.scaler,
            'models': self.models
        }
        joblib.dump(model_data, filepath)
        print(f"💾 Model saved to {filepath}")

    def load_model(self, filepath='heart_diagnosis_model.pkl'):
        """Load model đã train"""
        model_data = joblib.load(filepath)
        self.best_model = model_data['model']
        self.scaler = model_data['scaler']
        self.models = model_data['models']
        print(f"📂 Model loaded from {filepath}")

    def generate_insights(self, heart_rate_data):
        """Generate AI insights dựa trên prediction"""
        prediction = self.predict_heart_rate_risk(heart_rate_data)

        insights = {
            'severity': prediction['severity'],
            'confidence': prediction['confidence'],
            'risk_assessment': self._generate_risk_assessment(prediction),
            'recommendations': self._generate_recommendations(prediction, heart_rate_data),
            'risk_factors': self._generate_risk_factors(prediction, heart_rate_data),
            'preventive_measures': self._generate_preventive_measures(prediction)
        }

        return insights

    def _generate_risk_assessment(self, prediction):
        """Generate detailed risk assessment"""
        severity = prediction['severity']
        confidence = prediction['confidence']

        assessments = {
            0: f"AI đánh giá: Rủi ro tim mạch rất thấp ({confidence:.1f}% confidence). Nhịp tim và các chỉ số khác trong phạm vi bình thường.",
            1: f"AI phát hiện: Rủi ro tim mạch thấp ({confidence:.1f}% confidence). Cần theo dõi và duy trì lối sống lành mạnh.",
            2: f"AI cảnh báo: Rủi ro tim mạch trung bình ({confidence:.1f}% confidence). Khuyến nghị kiểm tra sức khỏe định kỳ.",
            3: f"AI cảnh báo nghiêm trọng: Rủi ro tim mạch cao ({confidence:.1f}% confidence). Cần can thiệp y tế sớm.",
            4: f"AI CẨN TRỌNG: Rủi ro tim mạch rất cao ({confidence:.1f}% confidence). Yêu cầu xử lý y tế khẩn cấp!"
        }

        return assessments.get(severity, "Không thể đánh giá")

    def _generate_recommendations(self, prediction, heart_rate_data):
        """Generate personalized recommendations"""
        severity = prediction['severity']
        heart_rate = heart_rate_data.get('heartRate', 80)

        base_recs = []

        # Heart rate specific recommendations
        if heart_rate < 60:
            base_recs.extend(["Tăng cường hoạt động thể chất nhẹ nhàng", "Theo dõi nhịp tim hàng ngày"])
        elif heart_rate > 100:
            base_recs.extend(["Giảm caffeine và chất kích thích", "Thực hiện kỹ thuật thư giãn"])

        # Severity specific recommendations
        severity_recs = {
            0: ["Duy trì chế độ ăn uống cân bằng", "Tập thể dục đều đặn", "Khám sức khỏe định kỳ"],
            1: ["Theo dõi huyết áp tại nhà", "Học kỹ thuật quản lý stress", "Khám tim mạch 6 tháng/lần"],
            2: ["Khám tim mạch trong vòng 3 tháng", "Thực hiện điện tâm đồ", "Kiểm tra cholesterol"],
            3: ["Thăm khám chuyên khoa tim mạch ngay", "Bắt đầu chế độ ăn kiêng tim mạch", "Tư vấn bác sĩ chuyên khoa"],
            4: ["Đến phòng cấp cứu ngay lập tức", "Không lái xe một mình", "Chuẩn bị thông tin bệnh sử"]
        }

        base_recs.extend(severity_recs.get(severity, []))
        return list(set(base_recs))  # Remove duplicates

    def _generate_risk_factors(self, prediction, heart_rate_data):
        """Generate personalized risk factors"""
        severity = prediction['severity']
        heart_rate = heart_rate_data.get('heartRate', 80)

        risk_factors = []

        # Heart rate specific risk factors
        if heart_rate < 50:
            risk_factors.extend(["Tuổi tác cao", "Sử dụng thuốc điều trị tim mạch"])
        elif heart_rate > 120:
            risk_factors.extend(["Stress kéo dài", "Thiếu ngủ mạn tính"])

        # Severity specific risk factors
        severity_risks = {
            1: ["Lối sống ít vận động", "Hút thuốc lá"],
            2: ["Tăng huyết áp", "Cholesterol máu cao", "Tiền sử gia đình"],
            3: ["Béo phì", "Đái tháo đường type 2", "Rối loạn lipid máu"],
            4: ["Bệnh mạch vành", "Suy tim sung huyết", "Rối loạn nhịp tim nặng"]
        }

        risk_factors.extend(severity_risks.get(severity, []))
        return list(set(risk_factors))  # Remove duplicates

    def _generate_preventive_measures(self, prediction):
        """Generate preventive measures"""
        severity = prediction['severity']

        measures = {
            0: ["Duy trì cân nặng hợp lý", "Không hút thuốc", "Giới hạn rượu bia"],
            1: ["Kiểm soát stress", "Ngủ đủ 7-8 tiếng/đêm", "Ăn nhiều rau củ quả"],
            2: ["Theo dõi huyết áp hàng tuần", "Đi bộ 30 phút/ngày", "Hạn chế muối"],
            3: ["Tập aerobic 3-4 lần/tuần", "Theo dõi cholesterol", "Thăm khám định kỳ"],
            4: ["Tuân thủ tuyệt đối chỉ định bác sĩ", "Theo dõi dấu hiệu khẩn cấp", "Chuẩn bị thuốc cấp cứu"]
        }

        return measures.get(severity, [])


def main():
    """Main function để train và test model"""
    print("🫀 AI Heart Diagnosis System")
    print("=" * 50)

    ai = HeartDiagnosisAI()

    # Load và preprocess data
    df = ai.load_and_preprocess_data()

    # Feature engineering
    df = ai.feature_engineering(df)

    # Prepare features và target
    feature_cols = [col for col in df.columns if col not in ['target', 'severity']]
    X = df[feature_cols]
    y = df['severity']

    print(f"🔍 Features: {len(feature_cols)}")
    print(f"📈 Target classes: {sorted(y.unique())}")

    # Train models
    best_model = ai.train_models(X, y)

    # Analyze feature importance
    ai.analyze_feature_importance(X, feature_cols)

    # Save model
    ai.save_model()

    # Test prediction
    # Test prediction với data đầy đủ
    test_data = {
        'age': 45,
        'sex': 1,
        'cp': 2,  # chest pain type
        'trestbps': 130,  # resting blood pressure
        'chol': 220,  # cholesterol
        'fbs': 0,  # fasting blood sugar
        'restecg': 0,  # resting electrocardiographic results
        'thalach': 85,  # maximum heart rate achieved (heart rate)
        'exang': 0,  # exercise induced angina
        'oldpeak': 1.0,  # ST depression induced by exercise
        'slope': 1,  # slope of the peak exercise ST segment
        'ca': 0,  # number of major vessels colored by flourosopy
        'thal': 2  # thalassemia
    }

    result = ai.predict_heart_rate_risk(test_data)
    print(f"Severity: {result['severity']}")
    print(f"Confidence: {result['confidence']:.1f}%")
    print(f"Risk Level: {result['risk_level']}")

    insights = ai.generate_insights(test_data)
    print(f"Risk Assessment: {insights['risk_assessment']}")
    print(f"Recommendations: {insights['recommendations'][:3]}")  # Show first 3
    print(f"Risk Factors: {insights['risk_factors'][:3]}")  # Show first 3

    print("\n✅ AI Heart Diagnosis System ready!")


if __name__ == "__main__":
    main()
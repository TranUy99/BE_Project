#!/usr/bin/env python3
# run_ai.py
"""
Script để chạy AI chẩn đoán nhịp tim
Được gọi từ Node.js service
"""

import sys
import json
import os
from ai_heart_diagnosis import HeartDiagnosisAI

def run_ai_diagnosis(heart_rate, age=50, sex=1, trestbps=120, chol=200):
    """Chạy AI diagnosis với các tham số đầu vào"""

    try:
        # Khởi tạo AI
        ai = HeartDiagnosisAI()

        # Load model đã được train
        model_path = 'heart_diagnosis_model.pkl'
        if not os.path.exists(model_path):
            print(f"❌ Model file không tồn tại: {model_path}")
            return None

        ai.load_model(model_path)

        # Chuẩn bị dữ liệu đầu vào
        input_data = {
            'age': age,
            'sex': sex,
            'cp': 0,  # chest pain type (default)
            'trestbps': trestbps,  # resting blood pressure
            'chol': chol,  # cholesterol
            'fbs': 0,  # fasting blood sugar
            'restecg': 0,  # resting electrocardiographic results
            'thalach': heart_rate,  # maximum heart rate achieved
            'exang': 0,  # exercise induced angina
            'oldpeak': 0.0,  # ST depression induced by exercise
            'slope': 0,  # slope of the peak exercise ST segment
            'ca': 0,  # number of major vessels colored by flourosopy
            'thal': 0  # thalassemia
        }

        # Dự đoán
        result = ai.predict_heart_rate_risk(input_data)

        # Tạo insights thông minh
        insights = ai.generate_insights(input_data)

        return {
            'severity': result['severity'],
            'confidence': result['confidence'],
            'risk_assessment': insights['risk_assessment'],
            'recommendations': insights['recommendations'],
            'risk_factors': insights['risk_factors']
        }

    except Exception as e:
        print(f"❌ Lỗi khi chạy AI: {str(e)}")
        return None

def main():
    """Main function khi chạy từ command line"""
    if len(sys.argv) < 2:
        print("❌ Cần ít nhất 1 tham số: heart_rate")
        print("📝 Cách dùng: python3 run_ai.py <heart_rate> [age] [sex] [trestbps] [chol]")
        sys.exit(1)

    try:
        # Parse arguments
        heart_rate = float(sys.argv[1])
        age = float(sys.argv[2]) if len(sys.argv) > 2 else 50
        sex = int(sys.argv[3]) if len(sys.argv) > 3 else 1
        trestbps = float(sys.argv[4]) if len(sys.argv) > 4 else 120
        chol = float(sys.argv[5]) if len(sys.argv) > 5 else 200

        print(f"🔍 Đang chẩn đoán với nhịp tim: {heart_rate} bpm")
        print(f"📊 Thông tin bổ sung: Tuổi {age}, Giới tính {sex}, HA {trestbps}, Cholesterol {chol}")

        # Chạy AI diagnosis
        result = run_ai_diagnosis(heart_rate, age, sex, trestbps, chol)

        if result:
            # Lưu kết quả vào file JSON để Node.js đọc
            with open('ai_result.json', 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)

            # In kết quả ra console
            print("\n" + "="*50)
            print("🩺 KẾT QUẢ CHẨN ĐOÁN AI")
            print("="*50)
            print(f"🔴 Mức độ nghiêm trọng: {result['severity']}/4")
            print(f"📊 Độ tin cậy: {result['confidence']:.1f}%")
            print(f"\n💬 Đánh giá rủi ro:\n{result['risk_assessment']}")
            print(f"\n💡 Khuyến nghị ({len(result['recommendations'])}):")
            for i, rec in enumerate(result['recommendations'], 1):
                print(f"  {i}. {rec}")
            print(f"\n⚠️  Yếu tố rủi ro ({len(result['risk_factors'])}):")
            for i, risk in enumerate(result['risk_factors'], 1):
                print(f"  {i}. {risk}")
            print("="*50)

        else:
            print("❌ Không thể chạy AI diagnosis")
            sys.exit(1)

    except ValueError as e:
        print(f"❌ Lỗi dữ liệu đầu vào: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Lỗi không mong muốn: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()

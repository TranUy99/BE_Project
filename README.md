# Heart Rate Monitoring System with AI Diagnosis 🫀🤖

Hệ thống theo dõi nhịp tim với tính năng chuẩn đoán tự động bằng AI.

## 🚀 Cài đặt

```bash
# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Cập nhật OPENAI_API_KEY trong file .env
```

## 📋 Các tính năng AI

### 1. **Chuẩn đoán tự động khi đo nhịp tim**
Khi user gửi dữ liệu nhịp tim, AI sẽ tự động:
- Phân tích nhịp tim
- Đưa ra chuẩn đoán chính xác
- Xác định mức độ nghiêm trọng
- Đề xuất khuyến nghị cụ thể
- Nhận diện yếu tố nguy cơ

### 2. **Phân tích xu hướng**
AI phân tích lịch sử nhịp tim để:
- Xác định xu hướng tăng/giảm/ổn định
- Phát hiện mối lo ngại tiềm ẩn
- Đưa ra khuyến nghị dựa trên xu hướng

### 3. **Hệ thống cảnh báo thông minh**
- Tự động phát hiện trường hợp cần chú ý
- Phân loại theo mức độ nghiêm trọng
- Đề xuất hành động cụ thể

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/register - Đăng ký
POST /api/auth/login    - Đăng nhập
```
Đăng ký có thể thêm các trường sức khoẻ cơ bản:
```jsonc
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret123",
  "age": 55,
  "gender": "female", // male | female | other
  "weight": 62,         // kg
  "conditions": ["hypertension", "diabetes"] // bệnh nền hoặc từ khoá: athlete, obesity, thyroid
}
```

### Heart Rate Monitoring (Cần token)

#### 1. Ghi nhận nhịp tim (với AI diagnosis)
```http
POST /api/heartrate/record
Headers: { Authorization: "Bearer <token>" }
Body: {
  "heartRate": 75,
  "ecg": 123,
  "acc": [1, 2, 3],
  "notes": "Đo sau khi đăng nhập"
}

Response: {
  "message": "Heart rate recorded successfully",
  "data": { ... },
  "aiDiagnosis": {
    "diagnosis": "Nhịp tim bình thường",
    "severity": "low",
    "analysis": "Nhịp tim 75 bpm nằm trong khoảng bình thường...",
    "recommendations": ["Duy trì lối sống lành mạnh", ...],
    "riskFactors": [],
    "needsAttention": false,
    "urgencyLevel": "routine"
  }
}
```

#### 2. Lấy lịch sử nhịp tim
```http
GET /api/heartrate/history?limit=10&startDate=2025-01-01
Headers: { Authorization: "Bearer <token>" }
```

#### 3. Lấy nhịp tim mới nhất
```http
GET /api/heartrate/latest
Headers: { Authorization: "Bearer <token>" }
```

#### 4. Thống kê nhịp tim
```http
GET /api/heartrate/stats?days=7
Headers: { Authorization: "Bearer <token>" }

Response: {
  "period": "Last 7 days",
  "stats": {
    "avgHeartRate": 78.5,
    "minHeartRate": 65,
    "maxHeartRate": 95,
    "totalRecords": 42
  }
}
```

#### 5. Phân tích xu hướng bằng AI 🤖
```http
GET /api/heartrate/trend?days=7
Headers: { Authorization: "Bearer <token>" }

Response: {
  "period": "Last 7 days",
  "dataPoints": 42,
  "trendAnalysis": {
    "trend": "stable",
    "analysis": "Nhịp tim của bạn ổn định trong 7 ngày qua...",
    "concerns": [],
    "positivePoints": ["Nhịp tim đều đặn", "Không có biến động bất thường"],
    "recommendations": ["Tiếp tục duy trì lối sống hiện tại"]
  }
}
```

#### 6. Chuẩn đoán lại một record 🤖
```http
POST /api/heartrate/re-diagnose/:recordId
Headers: { Authorization: "Bearer <token>" }

Response: {
  "message": "Re-diagnosis completed",
  "data": { ... },
  "newDiagnosis": { ... }
}
```

#### 7. Lấy cảnh báo và trường hợp cần chú ý 🚨
```http
GET /api/heartrate/alerts
Headers: { Authorization: "Bearer <token>" }

Response: {
  "totalAlerts": 5,
  "criticalCount": 1,
  "urgentCount": 2,
  "alerts": [
    {
      "id": "...",
      "heartRate": 145,
      "diagnosis": "Nhịp tim nhanh nghiêm trọng",
      "severity": "critical",
      "urgencyLevel": "emergency",
      "recommendations": ["CẦN KHÁM Y TẾ KHẨN CẤP", ...],
      "createdAt": "2025-11-05T10:30:00Z"
    }
  ]
}
```

### Health Dashboard (Cần token)
Tổng hợp hồ sơ sức khoẻ, phạm vi nhịp tim lý tưởng cá nhân hoá, record mới nhất và thống kê 7 ngày.
```http
GET /api/health/dashboard
Headers: { Authorization: "Bearer <token>" }

Response: {
  "success": true,
  "dashboard": {
    "user": {
      "id": "...",
      "username": "alice",
      "age": 55,
      "gender": "female",
      "weight": 62,
      "conditions": ["hypertension", "diabetes"]
    },
    "heartMetrics": {
      "resting": { "min": 66, "max": 91 },
      "max": 170,
      "targetZones": { "light": 85, "moderate": 119, "vigorous": 145 },
      "assumptions": null
    },
    "latestRecord": {
      "heartRate": 78,
      "status": "normal",
      "recordedAt": "2025-11-05T10:30:00.000Z",
      "aiDiagnosis": { "diagnosis": "Nhịp tim bình thường", ... }
    },
    "stats7d": {
      "avgHeartRate": 79,
      "minHeartRate": 65,
      "maxHeartRate": 95,
      "totalRecords": 42
    },
    "riskNotes": [
      "Cần kiểm soát huyết áp và hạn chế muối.",
      "Theo dõi đường huyết giúp giảm biến chứng tim mạch."
    ],
    "generatedAt": "2025-11-05T10:31:12.000Z"
  }
}
```

### Phân tích chuyên sâu nhịp tim (Analysis) 🤖
Tính toán thống kê, biến thiên (HRV proxy), xu hướng và phân bố ngoài phạm vi lý tưởng.
```http
GET /api/health/analysis?days=7&limit=200
GET /api/health/analysis?startDate=2025-11-01&endDate=2025-11-06
Headers: { Authorization: "Bearer <token>" }

Response: {
  "success": true,
  "analysis": {
    "rangeQuery": { "days": 7, "limit": 200, "startDate": null, "endDate": null },
    "totalRecords": 120,
    "stats": {
      "average": 78.42,
      "min": 55,
      "max": 132,
      "sd": 7.35,
      "hrvProxy": "moderate", // very-low | low | moderate | high
      "variabilityNote": null
    },
    "distribution": { "outOfRangePct": 18.3 },
    "trend": { "dominant": "increasing", "longestStreak": 5 },
    "samplePreview": [
      { "heartRate": 88, "at": "2025-11-06T10:32:11.000Z", "status": "warning" },
      { "heartRate": 76, "at": "2025-11-06T09:58:02.000Z", "status": "normal" }
    ],
    "generatedAt": "2025-11-06T10:33:05.000Z"
  }
}
```

### Dự đoán nhanh bằng History ML Model
Sử dụng model RandomForest huấn luyện từ dữ liệu thật (`train_history_model.py`).
```http
POST /api/health/predict-history
Headers: { Authorization: "Bearer <token>", "Content-Type": "application/json" }
Body: {
  "heartRate": 78,
  "age": 55,
  "gender": "female",
  "weight": 62,
  "conditions": ["hypertension", "diabetes"],
  "hour": 10
}

Response: {
  "success": true,
  "prediction": {
    "label": "medium",
    "label_index": 1,
    "probabilities": [0.05,0.62,0.20,0.08,0.05],
    "label_map": {"low":0,"medium":1,"high":2,"critical":3}
  },
  "input": { "heartRate":78, "age":55, "gender":"female", "weight":62, "conditions":["hypertension","diabetes"], "hour":10 },
  "meta": { "feature_names_count": 30, "conditions_vector_count": 12 }
}
```

## 📊 Phân loại mức độ nghiêm trọng

### Severity Levels:
- **low**: Bình thường (60-100 bpm)
- **medium**: Cần theo dõi (<60 hoặc 100-140 bpm)
- **high**: Cần khám bác sĩ
- **critical**: Khẩn cấp (<40 hoặc >140 bpm)

### Urgency Levels:
- **routine**: Kiểm tra định kỳ
- **urgent**: Cần gặp bác sĩ sớm
- **emergency**: Cần cấp cứu ngay

## 🤖 AI Models

Hệ thống sử dụng:
1. **GPT-4O Mini** (OpenAI) - Chuẩn đoán chính
2. **Rule-based fallback** - Dự phòng khi AI không khả dụng
3. **History ML Model** - Mô hình RandomForest huấn luyện từ dữ liệu thật trong MongoDB (`train_history_model.py`)

## 💡 Ví dụ sử dụng

```javascript
// 1. Đăng nhập
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();

// 2. Gửi dữ liệu nhịp tim (AI sẽ tự động chuẩn đoán)
const recordResponse = await fetch('http://localhost:3000/api/heartrate/record', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    heartRate: 145,
    ecg: 150,
    acc: [1.2, 0.8, 1.5],
    notes: 'Sau khi chạy bộ'
  })
});
const result = await recordResponse.json();
console.log('AI Diagnosis:', result.aiDiagnosis);

// 3. Xem xu hướng
const trendResponse = await fetch('http://localhost:3000/api/heartrate/trend?days=7', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const trend = await trendResponse.json();
console.log('Trend Analysis:', trend.trendAnalysis);
```

## 🛠 Huấn luyện mô hình từ dữ liệu thực tế

Script: `train_history_model.py`

```bash
# Kích hoạt môi trường
source ai_env/bin/activate

# Cài thêm dependency mới nếu chưa có
pip install -r requirements.txt

# Train dựa trên 30 ngày gần nhất, nhãn lấy từ aiDiagnosis.severity
python train_history_model.py --days 30 --label-source aiDiagnosis.severity

# Train dựa trên status thay vì severity
python train_history_model.py --days 14 --label-source status

# Train theo khoảng ngày cụ thể
python train_history_model.py --startDate 2025-10-01 --endDate 2025-11-01 --label-source auto
```

Artifacts tạo ra:
```
heart_model/history_model.pkl          # Model + scaler + metadata
heart_model/history_features.json      # Thứ tự feature, conditions, label map
```

Sử dụng lại model trong Python:
```python
import joblib, json
model_bundle = joblib.load('heart_model/history_model.pkl')
model = model_bundle['model']
scaler = model_bundle['scaler']
feature_names = model_bundle['feature_names']

# Chuẩn bị vector input tương ứng feature_names
import numpy as np
input_vector = np.zeros(len(feature_names))
# set giá trị thực tế vào input_vector[...] theo thứ tự feature_names
prediction = model.predict(scaler.transform([input_vector]))[0]
print('Pred label index:', prediction)
```

## ⚙️ Cấu hình

Trong file `.env`:
```env
OPENAI_API_KEY=sk-proj-xxxxx  # Bắt buộc để sử dụng AI
JWT_SECRET=your_secret_key
MONGODB_URI=mongodb://localhost:27017/be_project
PORT=3000
```

## 🔒 Bảo mật

- Tất cả endpoints đều yêu cầu JWT authentication
- Mỗi user chỉ có thể xem/quản lý dữ liệu của chính mình
- API key được lưu trong biến môi trường

## 📝 Lưu ý

- Kết quả AI chỉ mang tính chất tham khảo
- Không thay thế ý kiến của bác sĩ chuyên khoa
- Trường hợp nghiêm trọng cần gặp bác sĩ ngay lập tức

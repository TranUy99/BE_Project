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

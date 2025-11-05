# 🧪 Hướng dẫn Test API với Postman

## 📋 Thứ tự test

### 1️⃣ ĐĂNG KÝ (Register)
```
Method: POST
URL: http://localhost:3000/api/auth/register
Headers: 
  Content-Type: application/json

Body (JSON):
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}

Expected Response:
{
  "message": "User registered successfully"
}
```

---

### 2️⃣ ĐĂNG NHẬP (Login)
```
Method: POST
URL: http://localhost:3000/api/auth/login
Headers: 
  Content-Type: application/json

Body (JSON):
{
  "email": "test@example.com",
  "password": "password123"
}

Expected Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

⚠️ LƯU Ý: Copy token này để dùng cho các request tiếp theo!
```

---

### 3️⃣ GHI NHẬN NHỊP TIM - Trường hợp BÌNH THƯỜNG (60-100 bpm) ✅
```
Method: POST
URL: http://localhost:3000/api/heartrate/record
Headers: 
  Content-Type: application/json
  Authorization: Bearer <YOUR_TOKEN_HERE>

Body (JSON):
{
  "heartRate": 75,
  "ecg": 120,
  "acc": [1.2, 0.8, 1.5],
  "notes": "Nghỉ ngơi buổi sáng"
}

Expected Response:
{
  "message": "Heart rate recorded successfully",
  "data": { ... },
  "aiDiagnosis": {
    "diagnosis": "Nhịp tim bình thường",
    "severity": "low",
    "analysis": "Nhịp tim 75 bpm nằm trong khoảng bình thường...",
    "recommendations": [
      "Duy trì lối sống lành mạnh",
      "Tập thể dục đều đặn",
      ...
    ],
    "needsAttention": false,
    "urgencyLevel": "routine"
  }
}
```

---

### 4️⃣ GHI NHẬN NHỊP TIM - Trường hợp NHANH (Tachycardia) ⚠️
```
Method: POST
URL: http://localhost:3000/api/heartrate/record
Headers: 
  Content-Type: application/json
  Authorization: Bearer <YOUR_TOKEN_HERE>

Body (JSON):
{
  "heartRate": 125,
  "ecg": 145,
  "acc": [2.5, 1.8, 2.2],
  "notes": "Sau khi chạy bộ hoặc lo lắng"
}

Expected Response:
{
  "aiDiagnosis": {
    "diagnosis": "Nhịp tim nhanh (Tachycardia)",
    "severity": "medium",
    "urgencyLevel": "urgent",
    "recommendations": [
      "Hạn chế caffeine và chất kích thích",
      "Quản lý stress hiệu quả",
      ...
    ]
  }
}
```

---

### 5️⃣ GHI NHẬN NHỊP TIM - Trường hợp CHẬM (Bradycardia) ⚠️
```
Method: POST
URL: http://localhost:3000/api/heartrate/record
Headers: 
  Content-Type: application/json
  Authorization: Bearer <YOUR_TOKEN_HERE>

Body (JSON):
{
  "heartRate": 52,
  "ecg": 90,
  "acc": [0.5, 0.3, 0.6],
  "notes": "Buổi sáng sớm"
}

Expected Response:
{
  "aiDiagnosis": {
    "diagnosis": "Nhịp tim chậm (Bradycardia)",
    "severity": "medium",
    "urgencyLevel": "urgent",
    ...
  }
}
```

---

### 6️⃣ GHI NHẬN NHỊP TIM - Trường hợp NGUY HIỂM 🚨
```
Method: POST
URL: http://localhost:3000/api/heartrate/record
Headers: 
  Content-Type: application/json
  Authorization: Bearer <YOUR_TOKEN_HERE>

Body (JSON):
{
  "heartRate": 155,
  "ecg": 180,
  "acc": [3.5, 2.8, 3.2],
  "notes": "Cảm thấy hồi hộp, đau ngực"
}

Expected Response:
{
  "aiDiagnosis": {
    "diagnosis": "Nhịp tim nhanh nghiêm trọng",
    "severity": "critical",
    "urgencyLevel": "emergency",
    "needsAttention": true,
    "recommendations": [
      "CẦN KHÁM Y TẾ KHẨN CẤP",
      "Ngồi hoặc nằm nghỉ ngay",
      ...
    ]
  }
}
```

---

### 7️⃣ XEM LỊCH SỬ NHỊP TIM
```
Method: GET
URL: http://localhost:3000/api/heartrate/history?limit=10
Headers: 
  Authorization: Bearer <YOUR_TOKEN_HERE>

Expected Response:
{
  "count": 5,
  "data": [
    { "heartRate": 155, "aiDiagnosis": {...}, ... },
    { "heartRate": 125, "aiDiagnosis": {...}, ... },
    ...
  ]
}
```

---

### 8️⃣ XEM NHỊP TIM MỚI NHẤT
```
Method: GET
URL: http://localhost:3000/api/heartrate/latest
Headers: 
  Authorization: Bearer <YOUR_TOKEN_HERE>

Expected Response:
{
  "data": {
    "heartRate": 155,
    "aiDiagnosis": { ... },
    ...
  }
}
```

---

### 9️⃣ THỐNG KÊ NHỊP TIM (7 ngày)
```
Method: GET
URL: http://localhost:3000/api/heartrate/stats?days=7
Headers: 
  Authorization: Bearer <YOUR_TOKEN_HERE>

Expected Response:
{
  "period": "Last 7 days",
  "stats": {
    "avgHeartRate": 101.4,
    "minHeartRate": 52,
    "maxHeartRate": 155,
    "totalRecords": 5
  }
}
```

---

### 🔟 PHÂN TÍCH XU HƯỚNG BẰNG AI 🤖
```
Method: GET
URL: http://localhost:3000/api/heartrate/trend?days=7
Headers: 
  Authorization: Bearer <YOUR_TOKEN_HERE>

Expected Response:
{
  "period": "Last 7 days",
  "dataPoints": 5,
  "trendAnalysis": {
    "trend": "fluctuating",
    "analysis": "Nhịp tim của bạn có biến động đáng kể...",
    "concerns": [
      "Có lần nhịp tim lên tới 155 bpm",
      "Biến động từ 52 đến 155 bpm"
    ],
    "positivePoints": [...],
    "recommendations": [
      "Nên gặp bác sĩ tim mạch để kiểm tra",
      ...
    ]
  }
}
```

---

### 1️⃣1️⃣ XEM CẢNH BÁO VÀ TRƯỜNG HỢP CẦN CHÚ Ý 🚨
```
Method: GET
URL: http://localhost:3000/api/heartrate/alerts
Headers: 
  Authorization: Bearer <YOUR_TOKEN_HERE>

Expected Response:
{
  "totalAlerts": 3,
  "criticalCount": 1,
  "urgentCount": 2,
  "alerts": [
    {
      "id": "...",
      "heartRate": 155,
      "diagnosis": "Nhịp tim nhanh nghiêm trọng",
      "severity": "critical",
      "urgencyLevel": "emergency",
      "recommendations": ["CẦN KHÁM Y TẾ KHẨN CẤP"],
      "createdAt": "2025-11-05T..."
    },
    ...
  ]
}
```

---

### 1️⃣2️⃣ CHUẨN ĐOÁN LẠI MỘT RECORD
```
Method: POST
URL: http://localhost:3000/api/heartrate/re-diagnose/<RECORD_ID>
Headers: 
  Authorization: Bearer <YOUR_TOKEN_HERE>

Note: Lấy RECORD_ID từ response của các request trước (field "_id")

Expected Response:
{
  "message": "Re-diagnosis completed",
  "data": { ... },
  "newDiagnosis": { ... }
}
```

---

## 📝 Kịch bản test đầy đủ:

### Bước 1: Tạo tài khoản và đăng nhập
1. Register user mới
2. Login và lưu token

### Bước 2: Tạo dữ liệu fake (5-10 records)
Gửi nhiều requests với các giá trị nhịp tim khác nhau:
- 75 bpm (bình thường)
- 52 bpm (chậm)
- 85 bpm (bình thường)
- 125 bpm (nhanh)
- 155 bpm (nguy hiểm)
- 68 bpm (bình thường)
- 110 bpm (hơi nhanh)

### Bước 3: Xem kết quả AI
1. Xem lịch sử với AI diagnosis
2. Xem thống kê
3. Xem xu hướng (AI sẽ phân tích)
4. Xem alerts

---

## 💡 Tips:

1. **Lưu Token**: Sau khi login, copy token và dùng cho tất cả requests
2. **Authorization Header**: Format chính xác: `Bearer <token>` (có dấu cách)
3. **Content-Type**: Nhớ set `application/json` cho POST requests
4. **Test nhiều trường hợp**: Nhịp tim thấp, cao, bình thường để xem AI phân tích
5. **Kiểm tra Console**: Server sẽ log "🤖 Đang phân tích dữ liệu bằng AI..."

---

## ⚠️ Lưu ý quan trọng:

- Cần có `OPENAI_API_KEY` trong file `.env` để AI hoạt động
- Nếu không có API key, hệ thống sẽ dùng rule-based diagnosis (vẫn work!)
- Server chạy tại: `http://localhost:3000`
- MongoDB phải đang chạy

---

## 🎯 Kết quả mong đợi:

Sau khi test xong, bạn sẽ thấy:
- ✅ AI phân tích chính xác từng trường hợp nhịp tim
- ✅ Đưa ra khuyến nghị cụ thể
- ✅ Phân tích xu hướng thông minh
- ✅ Cảnh báo các trường hợp nguy hiểm
- ✅ Recommendations phù hợp với từng mức độ nghiêm trọng

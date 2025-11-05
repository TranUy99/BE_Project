# 🚀 QUICK START - Test với Postman

## Cách 1: Import Postman Collection (KHUYẾN NGHỊ) ⭐

1. Mở Postman
2. Click **Import** 
3. Chọn file: `Heart_Rate_Monitor_API.postman_collection.json`
4. Click **Import**

### Chạy test tự động:
1. Chọn folder "1. Authentication"
2. Click **Register** → **Send**
3. Click **Login** → **Send** (Token sẽ tự động lưu!)
4. Chọn folder "2. Heart Rate Recording"
5. Click từng request và **Send** (thứ tự bất kỳ)
6. Chọn folder "3. Query & Analytics" để xem kết quả
7. Chọn folder "4. AI Analysis" để xem AI phân tích

---

## Cách 2: Test thủ công

### BƯỚC 1: Đăng ký
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### BƯỚC 2: Đăng nhập
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

→ Copy token từ response
```

### BƯỚC 3: Gửi dữ liệu nhịp tim (thay YOUR_TOKEN)

**Test 1 - Bình thường (75 bpm):**
```
POST http://localhost:3000/api/heartrate/record
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "heartRate": 75,
  "ecg": 120,
  "acc": [1.2, 0.8, 1.5],
  "notes": "Bình thường"
}
```

**Test 2 - Chậm (52 bpm):**
```
POST http://localhost:3000/api/heartrate/record
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "heartRate": 52,
  "ecg": 90,
  "acc": [0.5, 0.3, 0.6],
  "notes": "Nhịp chậm"
}
```

**Test 3 - Nhanh (125 bpm):**
```
POST http://localhost:3000/api/heartrate/record
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "heartRate": 125,
  "ecg": 145,
  "acc": [2.5, 1.8, 2.2],
  "notes": "Nhịp nhanh"
}
```

**Test 4 - Nguy hiểm (155 bpm):**
```
POST http://localhost:3000/api/heartrate/record
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "heartRate": 155,
  "ecg": 180,
  "acc": [3.5, 2.8, 3.2],
  "notes": "NGUY HIỂM!"
}
```

### BƯỚC 4: Xem kết quả AI

**Xem lịch sử:**
```
GET http://localhost:3000/api/heartrate/history?limit=10
Authorization: Bearer YOUR_TOKEN
```

**Xem xu hướng (AI phân tích):**
```
GET http://localhost:3000/api/heartrate/trend?days=7
Authorization: Bearer YOUR_TOKEN
```

**Xem cảnh báo:**
```
GET http://localhost:3000/api/heartrate/alerts
Authorization: Bearer YOUR_TOKEN
```

---

## ✅ Checklist Test

- [ ] Server đang chạy (`npm start`)
- [ ] Đăng ký thành công
- [ ] Đăng nhập được và có token
- [ ] Gửi được dữ liệu nhịp tim bình thường (75 bpm)
- [ ] Gửi được dữ liệu nhịp tim chậm (52 bpm)
- [ ] Gửi được dữ liệu nhịp tim nhanh (125 bpm)
- [ ] Gửi được dữ liệu nhịp tim nguy hiểm (155 bpm)
- [ ] AI trả về diagnosis cho mỗi trường hợp
- [ ] Xem được lịch sử
- [ ] Xem được xu hướng (AI analysis)
- [ ] Xem được alerts

---

## 🎯 Kết quả mong đợi

Sau khi test xong, response sẽ có dạng:

```json
{
  "message": "Heart rate recorded successfully",
  "data": {
    "_id": "...",
    "heartRate": 125,
    "status": "warning",
    "aiDiagnosis": {
      "diagnosis": "Nhịp tim nhanh (Tachycardia)",
      "severity": "medium",
      "analysis": "Nhịp tim 125 bpm cao hơn bình thường. Có thể do stress, caffeine...",
      "recommendations": [
        "Hạn chế caffeine và chất kích thích",
        "Quản lý stress hiệu quả",
        "Gặp bác sĩ nếu tình trạng kéo dài"
      ],
      "riskFactors": ["Stress", "Anxiety", "Thiếu ngủ"],
      "needsAttention": true,
      "urgencyLevel": "urgent"
    }
  },
  "aiDiagnosis": { ... }
}
```

---

## 📊 Server Logs

Khi gửi request, server sẽ log:
```
🤖 Đang phân tích dữ liệu bằng AI...
```

Nếu thấy message này → AI đang hoạt động! ✅

---

## ⚠️ Troubleshooting

**Lỗi "Access denied"**: 
- Check Authorization header: `Bearer <token>` (có dấu cách)
- Token đúng chưa?

**AI không hoạt động**:
- Check có `OPENAI_API_KEY` trong `.env` chưa?
- Hệ thống vẫn work với rule-based nếu không có API key

**Server không chạy**:
```bash
npm start
```

**MongoDB lỗi**:
- Check MongoDB đang chạy chưa?
- Connection string trong `server.js` đúng chưa?

import express from 'express';
import {
  recordHeartRate,
  getHeartRateHistory,
  getLatestHeartRate,
  getHeartRateStats,
  getHeartRateTrend,
  reDiagnose,
  getAlertsAndWarnings,
} from '../controllers/heartrate.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticate);

// Lưu dữ liệu nhịp tim (với AI diagnosis tự động)
router.post('/record', recordHeartRate);

// Lấy lịch sử nhịp tim
router.get('/history', getHeartRateHistory);

// Lấy nhịp tim mới nhất
router.get('/latest', getLatestHeartRate);

// Lấy thống kê nhịp tim
router.get('/stats', getHeartRateStats);

// AI Analysis endpoints
// Phân tích xu hướng nhịp tim bằng AI
router.get('/trend', getHeartRateTrend);

// Chuẩn đoán lại một record cụ thể
router.post('/re-diagnose/:recordId', reDiagnose);

// Lấy danh sách cảnh báo và trường hợp cần chú ý
router.get('/alerts', getAlertsAndWarnings);

export default router;

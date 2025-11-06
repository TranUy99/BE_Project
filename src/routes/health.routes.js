import express from 'express';
import { getHealthDashboard, getHeartRateAnalysis, postPredictHistory } from '../controllers/health.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Bật auth khi cần; hiện có thể test nhanh không token bằng query userId
// router.use(authenticate);
router.get('/dashboard', authenticate, getHealthDashboard); // yêu cầu token; fallback query userId khi chưa login
router.get('/analysis', authenticate, getHeartRateAnalysis); // phân tích chuyên sâu nhịp tim (stats, HRV proxy)
router.post('/predict-history', authenticate, postPredictHistory); // dự đoán severity bằng model lịch sử

export default router;

// src/controllers/health.controller.js
import { buildHealthDashboard } from "../services/health.service.js";
import { analyzeHeartRate } from "../services/analysis.service.js";
import { predictHistoryModel } from "../services/historyModel.service.js";

// GET /api/health/dashboard
export const getHealthDashboard = async (req, res) => {
  try {
    const userId = req.userId || req.query.userId || req.params.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const dashboard = await buildHealthDashboard(userId);
    res.json({ success: true, dashboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/health/analysis
export const getHeartRateAnalysis = async (req, res) => {
  try {
    const userId = req.userId || req.query.userId || req.params.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const { days, limit, startDate, endDate } = req.query;
    const analysis = await analyzeHeartRate(userId, { days, limit, startDate, endDate });
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/health/predict-history
export const postPredictHistory = async (req, res) => {
  try {
    const { heartRate, age, gender, weight, conditions, hour } = req.body;
    if (heartRate === undefined) return res.status(400).json({ error: 'heartRate is required' });
    const result = await predictHistoryModel({ heartRate: Number(heartRate), age, gender, weight, conditions, hour });
    res.json({ success: true, prediction: result.prediction, input: result.input, meta: result.meta });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default { getHealthDashboard, getHeartRateAnalysis, postPredictHistory };

// src/services/health.service.js
// Service to compute personalized cardiovascular health metrics based on user profile
import User from "../models/user.model.js";
import Data from "../models/data.model.js";
import mongoose from "mongoose";

/**
 * Compute the range for resting heart rate, maximum heart rate, and target zones.
 * The algorithm is simplified but allows for personal adjustments.
 * @param {Object} profile - { age, gender, weight, conditions }
 * @returns {Object} metrics
 */
export function computeIdealHeartMetrics(profile = {}) {
  const { age, gender, weight, conditions = [] } = profile;

  // Base resting range
  let minRest = 60;
  let maxRest = 80;

  if (typeof age === "number") {
    if (age > 50) {
      minRest += 2; // slight increase with age
      maxRest += 4;
    }
    if (age > 65) {
      minRest += 3;
      maxRest += 6;
    }
  }

  if (gender === "female") {
    minRest += 2;
    maxRest += 3; // females typically have slightly higher rates
  }

  // Athlete condition lowers resting HR
  if (conditions.includes("athlete") || conditions.includes("van_dong_vien")) {
    minRest -= 10;
    maxRest -= 10;
  }

  // Metabolic / cardiovascular conditions tend to raise
  const raiseSet = ["hypertension", "tang_huyet_ap", "diabetes", "obesity", "tuyen_giap", "thyroid", "copd"];
  let raises = 0;
  conditions.forEach((c) => {
    if (raiseSet.includes(c.toLowerCase())) raises += 1;
  });
  if (raises) {
    minRest += 2 * raises;
    maxRest += 4 * raises;
  }

  // Clamp sensible range
  minRest = Math.max(45, Math.min(minRest, 85));
  maxRest = Math.max(minRest + 5, Math.min(maxRest, 100));

  // Max heart rate (Tanaka formula slightly more accurate than 220-age)
  const ageVal = typeof age === "number" ? age : 40;
  const maxHr = Math.round(208 - 0.7 * ageVal);

  const targetZones = {
    light: Math.round(maxHr * 0.5),
    moderate: Math.round(maxHr * 0.7),
    vigorous: Math.round(maxHr * 0.85),
  };

  return {
    resting: { min: Math.round(minRest), max: Math.round(maxRest) },
    max: maxHr,
    targetZones,
    assumptions: !age || !gender || !weight ? "Some default values were used due to missing data" : null,
  };
}

/**
 * Create a health dashboard for the user.
 * @param {String|ObjectId} userId
 * @returns {Promise<Object>} dashboard
 */
export async function buildHealthDashboard(userId) {
  const id = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : userId;
  const user = await User.findById(id).lean();
  if (!user) throw new Error("User not found");

  const profile = {
    age: user.age,
    gender: user.gender,
    weight: user.weight,
    conditions: user.conditions || [],
  };

  const metrics = computeIdealHeartMetrics(profile);

  // Get latest record
  const latest = await Data.findOne({ userId: id }).sort({ createdAt: -1 }).lean();

  // Statistics for the last 7 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const statsAgg = await Data.aggregate([
    { $match: { userId: id, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        avgHeartRate: { $avg: "$heartRate" },
        minHeartRate: { $min: "$heartRate" },
        maxHeartRate: { $max: "$heartRate" },
        totalRecords: { $sum: 1 },
      },
    },
  ]);

  // Risk notes based on conditions
  const conditionRiskMap = {
    hypertension: "Control your blood pressure and limit salt intake.",
    diabetes: "Monitor blood glucose to reduce cardiovascular complications.",
    obesity: "Weight loss can improve heart rate and blood pressure.",
    thyroid: "Thyroid disorders directly affect heart rate.",
    athlete: "Low resting heart rate is normal for well-trained athletes.",
  };
  const riskNotes = profile.conditions
    .map((c) => conditionRiskMap[c.toLowerCase()])
    .filter(Boolean);

  return {
    user: {
      id: user._id,
      username: user.username,
      age: profile.age ?? null,
      gender: profile.gender ?? null,
      weight: profile.weight ?? null,
      conditions: profile.conditions,
    },
    heartMetrics: metrics,
    latestRecord: latest
      ? {
          heartRate: latest.heartRate,
          status: latest.status,
          recordedAt: latest.createdAt,
          aiDiagnosis: latest.aiDiagnosis || null,
        }
      : null,
    stats7d: statsAgg.length
      ? {
          avgHeartRate: Math.round(statsAgg[0].avgHeartRate),
          minHeartRate: statsAgg[0].minHeartRate,
          maxHeartRate: statsAgg[0].maxHeartRate,
          totalRecords: statsAgg[0].totalRecords,
        }
      : null,
    riskNotes,
    generatedAt: new Date(),
  };
}

export default { computeIdealHeartMetrics, buildHealthDashboard };

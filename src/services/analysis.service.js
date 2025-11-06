// src/services/analysis.service.js
// Phân tích thống kê nhịp tim & HRV proxy
import Data from "../models/data.model.js";
import mongoose from "mongoose";

export const computeBasicStats = (arr) => {
  if (!arr || arr.length === 0) return { count: 0 };
  const sum = arr.reduce((s, x) => s + x, 0);
  const avg = sum / arr.length;
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const variance = arr.reduce((s, x) => s + Math.pow(x - avg, 2), 0) / arr.length;
  const sd = Math.sqrt(variance);
  return { count: arr.length, avg, min, max, sd };
};

/**
 * Phân tích dữ liệu nhịp tim theo khoảng thời gian hoặc số lượng gần nhất.
 * @param {String|ObjectId} userId
 * @param {Object} opts { days, limit, startDate, endDate }
 */
export async function analyzeHeartRate(userId, opts = {}) {
  const { days = 7, limit = 200, startDate, endDate } = opts;
  const id = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : userId;

  let timeFilter = {};
  if (startDate || endDate) {
    timeFilter.createdAt = {};
    if (startDate) timeFilter.createdAt.$gte = new Date(startDate);
    if (endDate) timeFilter.createdAt.$lte = new Date(endDate);
  } else {
    const from = new Date();
    from.setDate(from.getDate() - parseInt(days));
    timeFilter.createdAt = { $gte: from };
  }

  const records = await Data.find({ userId: id, ...timeFilter }).sort({ createdAt: -1 }).limit(parseInt(limit));
  const heartRates = records.map(r => r.heartRate).filter(hr => typeof hr === 'number');
  const stats = computeBasicStats(heartRates);

  // HRV proxy classification (sd ~ variability)
  let hrvQuality = null;
  if (stats.count > 4) {
    if (stats.sd < 3) hrvQuality = 'very-low';
    else if (stats.sd < 6) hrvQuality = 'low';
    else if (stats.sd < 10) hrvQuality = 'moderate';
    else hrvQuality = 'high';
  }

  // % outside typical range (60-100)
  const outOfRange = heartRates.filter(hr => hr < 60 || hr > 100).length;
  const outOfRangePct = stats.count ? +(outOfRange * 100 / stats.count).toFixed(1) : 0;

  // consecutive increasing or decreasing trend length
  let trendType = 'stable';
  let streak = 1, maxStreak = 1;
  for (let i = 1; i < heartRates.length; i++) {
    const prev = heartRates[i - 1];
    const cur = heartRates[i];
    if ((cur > prev && trendType === 'increasing') || (cur < prev && trendType === 'decreasing')) {
      streak++;
    } else {
      trendType = cur > prev ? 'increasing' : cur < prev ? 'decreasing' : 'stable';
      streak = 1;
    }
    maxStreak = Math.max(maxStreak, streak);
  }

  const variabilityNote = hrvQuality === 'high'
    ? 'Biến thiên nhịp tim lớn - có thể do stress, hoạt động mạnh hoặc bất thường.'
    : hrvQuality === 'very-low'
      ? 'Biến thiên rất thấp - ở vận động viên có thể bình thường, nếu không có thể cần kiểm tra.'
      : null;

  return {
    rangeQuery: { days, limit, startDate: startDate || null, endDate: endDate || null },
    totalRecords: stats.count,
    stats: {
      average: stats.count ? +stats.avg.toFixed(2) : null,
      min: stats.min ?? null,
      max: stats.max ?? null,
      sd: stats.count ? +stats.sd.toFixed(2) : null,
      hrvProxy: hrvQuality,
      variabilityNote,
    },
    distribution: {
      outOfRangePct,
    },
    trend: {
      dominant: trendType,
      longestStreak: maxStreak,
    },
    samplePreview: records.slice(0, 10).map(r => ({ heartRate: r.heartRate, at: r.createdAt, status: r.status })),
    generatedAt: new Date(),
  };
}

export default { computeBasicStats, analyzeHeartRate };

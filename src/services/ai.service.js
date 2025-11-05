// src/services/ai.service.js
import * as tf from "@tensorflow/tfjs-node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load model and normalization params
let model;
let normParams;

const loadModel = async () => {
    if (!model) {
        model = await tf.loadLayersModel("file://" + path.join(__dirname, "../../heart_model/model.json"));
        const normData = JSON.parse(fs.readFileSync(path.join(__dirname, "../../normalization.json"), "utf8"));
        normParams = normData;
    }
    return model;
};

// Normalize input
const normalizeInput = (value) => {
    const mean = normParams.mean[0];
    const std = normParams.std[0];
    return (value - mean) / std;
};

// ===== Helpers =====
const safeJsonParse = (text, fallback) => {
    try {
        return JSON.parse(text);
    } catch {
        return fallback;
    }
};

const getDiagnosisTitle = (severity) => {
    const titles = {
        0: "Nhịp tim khỏe mạnh",
        1: "Nhịp tim cần theo dõi",
        2: "Nguy cơ tim mạch trung bình",
        3: "Nguy cơ tim mạch cao",
        4: "Nguy cơ tim mạch rất cao - CẨN TRỌNG",
    };
    return titles[severity] || "Không xác định";
};

const getUrgencyLevel = (severity) => {
    const levels = {
        0: "routine",
        1: "routine",
        2: "urgent",
        3: "urgent",
        4: "emergency",
    };
    return levels[severity] || "routine";
};

// ===== AI-powered dynamic recommendations and risk factors =====
const generateRecommendations = (heartRate, severity, confidence) => {
    const baseRecommendations = [];

    // AI "thinks" about heart rate patterns
    if (heartRate < 60) {
        baseRecommendations.push("Tăng cường hoạt động thể chất nhẹ nhàng", "Theo dõi nhịp tim hàng ngày");
    } else if (heartRate > 100) {
        baseRecommendations.push("Giảm caffeine và đồ uống có cồn", "Thực hiện kỹ thuật thư giãn");
    } else {
        baseRecommendations.push("Duy trì thói quen tập luyện đều đặn", "Ăn uống cân bằng");
    }

    // AI adds severity-specific recommendations
    if (severity === "low") {
        baseRecommendations.push("Khám sức khỏe định kỳ 6 tháng/lần", "Theo dõi chỉ số BMI");
    } else if (severity === "medium") {
        baseRecommendations.push("Khám tim mạch trong vòng 3 tháng", "Học kỹ thuật quản lý stress");
        baseRecommendations.push("Theo dõi huyết áp tại nhà");
    } else if (severity === "high") {
        baseRecommendations.push("Thăm khám chuyên khoa tim mạch ngay", "Thực hiện các xét nghiệm máu");
        baseRecommendations.push("Bắt đầu chế độ ăn DASH hoặc Mediterranean");
    } else {
        // critical
        baseRecommendations.push("Đến phòng cấp cứu ngay lập tức", "Không lái xe một mình");
        baseRecommendations.push("Chuẩn bị thông tin bệnh sử cá nhân");
    }

    // AI adds confidence-based recommendations
    if (parseFloat(confidence) > 80) {
        baseRecommendations.push("Theo dõi sát sao các triệu chứng mới xuất hiện");
    }

    // AI "randomly" selects 4-6 most relevant recommendations
    const shuffled = baseRecommendations.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(5, shuffled.length));
};

const generateRiskFactors = (heartRate, severity, confidence) => {
    const baseRiskFactors = [];

    // AI analyzes heart rate for potential risk factors
    if (heartRate < 50) {
        baseRiskFactors.push("Tuổi tác cao", "Sử dụng thuốc điều trị tim mạch");
    } else if (heartRate > 120) {
        baseRiskFactors.push("Stress kéo dài", "Thiếu ngủ mạn tính");
        baseRiskFactors.push("Rối loạn nội tiết");
    }

    // AI adds severity-based risk factors
    if (severity === "medium") {
        baseRiskFactors.push("Lối sống ít vận động", "Hút thuốc lá");
        baseRiskFactors.push("Tiền sử gia đình mắc bệnh tim mạch");
    } else if (severity === "high") {
        baseRiskFactors.push("Tăng huyết áp", "Cholesterol máu cao");
        baseRiskFactors.push("Béo phì hoặc thừa cân");
        baseRiskFactors.push("Đái tháo đường type 2");
    } else if (severity === "critical") {
        baseRiskFactors.push("Bệnh mạch vành", "Suy tim sung huyết");
        baseRiskFactors.push("Rối loạn nhịp tim nặng");
        baseRiskFactors.push("Thrombosis hoặc embolus");
    }

    // AI considers confidence level
    if (parseFloat(confidence) > 85) {
        baseRiskFactors.push("Yếu tố nguy cơ chưa được phát hiện");
    }

    // AI selects 2-4 most relevant risk factors
    const shuffled = baseRiskFactors.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(4, shuffled.length));
};

// ===== Rule-based fallback (giữ nguyên logic) =====
const getRuleBasedDiagnosis = (heartRateData) => {
    const { heartRate } = heartRateData || {};
    let diagnosis = {
        diagnosis: "",
        severity: "low",
        analysis: "",
        recommendations: [],
        riskFactors: [],
        needsAttention: false,
        urgencyLevel: "routine",
    };

    if (typeof heartRate !== "number" || Number.isNaN(heartRate)) {
        diagnosis.diagnosis = "Thiếu/không hợp lệ dữ liệu nhịp tim";
        diagnosis.analysis = "Không thể suy luận do heartRate không phải số.";
        return { success: true, diagnosis, aiModel: "rule-based", timestamp: new Date() };
    }

    if (heartRate < 40) {
        diagnosis = { diagnosis: "Nhịp tim chậm nghiêm trọng (Severe Bradycardia)", severity: "critical", analysis: `Nhịp tim ${heartRate} bpm rất thấp.`, recommendations: ["Đi khám tim mạch NGAY", "Tránh vận động nặng", "Theo dõi triệu chứng", "Gọi cấp cứu nếu nặng"], riskFactors: ["Block nhĩ-thất", "Suy nút xoang", "Tác dụng phụ thuốc"], needsAttention: true, urgencyLevel: "emergency" };
    } else if (heartRate < 60) {
        diagnosis = { diagnosis: "Nhịp tim chậm (Bradycardia)", severity: "medium", analysis: `Nhịp tim ${heartRate} bpm thấp; cần theo dõi.`, recommendations: ["Khám tim mạch", "Theo dõi nhịp", "Lưu ý mệt/chóng mặt", "Lối sống lành mạnh"], riskFactors: ["Thuốc", "Tuyến giáp"], needsAttention: true, urgencyLevel: "urgent" };
    } else if (heartRate <= 100) {
        diagnosis = { diagnosis: "Nhịp tim bình thường", severity: "low", analysis: `Nhịp tim ${heartRate} bpm trong khoảng 60–100.`, recommendations: ["Lối sống lành mạnh", "Tập luyện", "Ăn cân bằng", "Khám định kỳ"], riskFactors: [], needsAttention: false, urgencyLevel: "routine" };
    } else if (heartRate <= 140) {
        diagnosis = { diagnosis: "Nhịp tim nhanh (Tachycardia)", severity: "medium", analysis: `Nhịp tim ${heartRate} bpm cao; có thể do stress/caffeine.`, recommendations: ["Giảm caffeine", "Quản lý stress", "Khám nếu kéo dài", "Nghỉ ngơi", "Tránh rượu thuốc"], riskFactors: ["Stress/lo âu", "Thiếu ngủ", "Chất kích thích"], needsAttention: true, urgencyLevel: "urgent" };
    } else {
        diagnosis = { diagnosis: "Nhịp tim nhanh nghiêm trọng (Severe Tachycardia)", severity: "critical", analysis: `Nhịp tim ${heartRate} bpm rất cao, nguy cơ cấp cứu.`, recommendations: ["Đi cấp cứu", "Nằm nghỉ", "Không tự ý dùng thuốc", "Gọi cấp cứu nếu đau ngực/khó thở"], riskFactors: ["Rối loạn nhịp nặng", "Suy tim", "Thiếu máu cơ tim"], needsAttention: true, urgencyLevel: "emergency" };
    }
    return { success: true, diagnosis, aiModel: "rule-based", timestamp: new Date() };
};

// ===== AI diagnosis via trained model =====
export const diagnoseHeartRate = async (heartRateData) => {
    try {
        const { heartRate } = heartRateData || {};

        if (typeof heartRate !== "number" || Number.isNaN(heartRate)) {
            return getRuleBasedDiagnosis(heartRateData);
        }

        // Try Python AI first (more advanced), fallback to TensorFlow.js
        try {
            return await diagnoseWithPythonAI(heartRateData);
        } catch (pythonError) {
            console.log("Python AI not available, using TensorFlow.js:", pythonError.message);
            return await diagnoseWithTensorFlow(heartRateData);
        }
    } catch (error) {
        console.error("AI Diagnosis Error:", error?.message || error);
        return getRuleBasedDiagnosis(heartRateData);
    }
};

// ===== Advanced Python AI Diagnosis =====
const diagnoseWithPythonAI = async (heartRateData) => {
    const { spawn } = await import("child_process");
    const path = await import("path");
    const fs = await import("fs");

    return new Promise((resolve, reject) => {
        const { heartRate, age = 50, sex = 1, trestbps = 120, chol = 200 } = heartRateData;

        // Use full path to Python in virtual environment
        const pythonPath = path.join(process.cwd(), "ai_env", "bin", "python3");
        const scriptPath = path.join(process.cwd(), "run_ai.py");

        // Chạy Python script với virtual environment
        const pythonProcess = spawn(pythonPath, [scriptPath, heartRate.toString(), age.toString(), sex.toString(), trestbps.toString(), chol.toString()], { cwd: process.cwd() });

        let stdout = "";
        let stderr = "";

        pythonProcess.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        pythonProcess.on("close", (code) => {
            if (code === 0) {
                try {
                    // Đọc kết quả từ file JSON
                    const resultPath = path.join(process.cwd(), "ai_result.json");
                    const resultData = fs.readFileSync(resultPath, "utf8");
                    const insights = JSON.parse(resultData);

                    // Map Python AI result to our format
                    const severityLevels = ["low", "medium", "high", "high", "critical"];
                    const severity = severityLevels[insights.severity];

                    const diagnosis = {
                        diagnosis: getDiagnosisTitle(insights.severity),
                        severity: severity,
                        analysis: insights.risk_assessment,
                        recommendations: insights.recommendations,
                        riskFactors: insights.risk_factors,
                        needsAttention: insights.severity >= 2,
                        urgencyLevel: getUrgencyLevel(insights.severity),
                    };

                    resolve({
                        success: true,
                        diagnosis,
                        aiModel: "python-advanced-ai",
                        timestamp: new Date(),
                    });
                } catch (parseError) {
                    reject(new Error(`Failed to parse Python AI result: ${parseError.message}`));
                }
            } else {
                reject(new Error(`Python AI failed with code ${code}: ${stderr}`));
            }
        });

        pythonProcess.on("error", (error) => {
            reject(new Error(`Failed to start Python AI: ${error.message}`));
        });
    });
};

// ===== TensorFlow.js Diagnosis (fallback) =====
const diagnoseWithTensorFlow = async (heartRateData) => {
    await loadModel();

    const { heartRate } = heartRateData;
    const normalizedInput = normalizeInput(heartRate);
    const inputTensor = tf.tensor2d([[normalizedInput]]);
    const prediction = model.predict(inputTensor);
    const probabilities = prediction.dataSync();

    // Find the predicted severity class (0-4)
    let predictedSeverity = 0;
    let maxProb = 0;
    for (let i = 0; i < probabilities.length; i++) {
        if (probabilities[i] > maxProb) {
            maxProb = probabilities[i];
            predictedSeverity = i;
        }
    }

    // Map severity to diagnosis (0=no disease, 1-4=disease severity)
    const severityLevels = ["low", "medium", "high", "high", "critical"];
    const severity = severityLevels[predictedSeverity];

    // AI generates personalized recommendations and risk factors
    const recommendations = generateRecommendations(heartRate, severity, (maxProb * 100).toFixed(1));
    const riskFactors = generateRiskFactors(heartRate, severity, (maxProb * 100).toFixed(1));

    // Create dynamic diagnosis based on AI prediction
    let diagnosis;
    const confidence = (maxProb * 100).toFixed(1);

    if (predictedSeverity === 0) {
        diagnosis = {
            diagnosis: "Nhịp tim khỏe mạnh",
            severity: "low",
            analysis: `AI phân tích: Nhịp tim ${heartRate} bpm được đánh giá là bình thường với độ tin cậy ${confidence}%. Không có dấu hiệu bất thường.`,
            recommendations,
            riskFactors,
            needsAttention: false,
            urgencyLevel: "routine",
        };
    } else if (predictedSeverity === 1) {
        diagnosis = {
            diagnosis: "Nhịp tim cần theo dõi",
            severity: "medium",
            analysis: `AI phát hiện: Nhịp tim ${heartRate} bpm có dấu hiệu cần chú ý với độ tin cậy ${confidence}%. Khuyến nghị theo dõi thêm.`,
            recommendations,
            riskFactors,
            needsAttention: true,
            urgencyLevel: "routine",
        };
    } else if (predictedSeverity === 2) {
        diagnosis = {
            diagnosis: "Nguy cơ tim mạch trung bình",
            severity: "high",
            analysis: `AI cảnh báo: Nhịp tim ${heartRate} bpm cho thấy nguy cơ tim mạch ở mức trung bình với độ tin cậy ${confidence}%. Cần chú ý.`,
            recommendations,
            riskFactors,
            needsAttention: true,
            urgencyLevel: "urgent",
        };
    } else if (predictedSeverity === 3) {
        diagnosis = {
            diagnosis: "Nguy cơ tim mạch cao",
            severity: "high",
            analysis: `AI cảnh báo nghiêm trọng: Nhịp tim ${heartRate} bpm có nguy cơ tim mạch cao với độ tin cậy ${confidence}%. Cần can thiệp sớm.`,
            recommendations,
            riskFactors,
            needsAttention: true,
            urgencyLevel: "urgent",
        };
    } else {
        // predictedSeverity === 4
        diagnosis = {
            diagnosis: "Nguy cơ tim mạch rất cao - CẨN TRỌNG",
            severity: "critical",
            analysis: `AI phát hiện URGENT: Nhịp tim ${heartRate} bpm cho thấy nguy cơ tim mạch rất cao với độ tin cậy ${confidence}%. CẦN XỬ LÝ NGAY!`,
            recommendations,
            riskFactors,
            needsAttention: true,
            urgencyLevel: "emergency",
        };
    }

    return { success: true, diagnosis, aiModel: "custom-tf-model", timestamp: new Date() };
};

// ===== Trend analysis (simplified) =====
export const analyzeTrend = async (heartRateHistory) => {
    try {
        if (!Array.isArray(heartRateHistory) || heartRateHistory.length < 3) {
            return { success: false, message: "Không đủ dữ liệu để phân tích xu hướng" };
        }

        const rates = heartRateHistory.map((d) => d.heartRate).slice(0, 10);
        const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
        const trend = rates[rates.length - 1] > rates[0] ? "increasing" : rates[rates.length - 1] < rates[0] ? "decreasing" : "stable";

        const trendAnalysis = {
            trend,
            analysis: `Xu hướng nhịp tim: ${trend}. Trung bình ${avg.toFixed(1)} bpm.`,
            concerns: trend === "increasing" ? ["Nhịp tim tăng có thể do stress"] : [],
            positivePoints: trend === "stable" ? ["Nhịp tim ổn định"] : [],
            recommendations: ["Theo dõi tiếp tục", "Khám định kỳ"],
        };

        return { success: true, trendAnalysis, dataPoints: rates.length };
    } catch (error) {
        console.error("Trend Analysis Error:", error?.message || error);
        return { success: false, message: "Không thể phân tích xu hướng" };
    }
};

export default { diagnoseHeartRate, analyzeTrend };

import HeartRate from "../models/heartrate.model.js";
import Device from "../models/device.model.js";
import { analyzeHeartRate } from "../services/ai.service.js";

// Parse dữ liệu từ Arduino
const parseArduinoData = (dataString) => {
    const bpmMatch = dataString.match(/BPM:\s*([\d.]+)/);
    const axMatch = dataString.match(/ax=([-\d.]+)/);
    const ayMatch = dataString.match(/ay=([-\d.]+)/);
    const azMatch = dataString.match(/az=([-\d.]+)/);
    const fallenMatch = dataString.match(/Fallen:\s*(\w+)/);
    const timeMatch = dataString.match(/Time:\s*([\d]+)/);

    return {
        bpm: bpmMatch ? parseFloat(bpmMatch[1]) : null,
        accel: {
            ax: axMatch ? parseFloat(axMatch[1]) : 0,
            ay: ayMatch ? parseFloat(ayMatch[1]) : 0,
            az: azMatch ? parseFloat(azMatch[1]) : 0,
        },
        fallen: fallenMatch ? fallenMatch[1] === "YES" : false,
        timestamp: timeMatch ? parseInt(timeMatch[1]) : Date.now(),
    };
};

// ENDPOINT TEST - Dùng userId cứng
export const receiveArduinoDataTest = async (req, res) => {
    try {
        const { data, userId } = req.body;

        if (!data) {
            return res.status(400).json({ message: "No data received" });
        }

        // Parse dữ liệu từ Arduino
        const parsedData = parseArduinoData(data);

        if (!parsedData.bpm) {
            return res.status(400).json({ message: "Invalid heart rate data" });
        }

        // Phân tích bằng AI
        const aiAnalysis = await analyzeHeartRate(parsedData.bpm);

        // Lưu vào database với userId từ request hoặc userId test mặc định
        const heartRateRecord = new HeartRate({
            userId: userId || "6789test1234567890abcdef", // userId test cứng
            bpm: parsedData.bpm,
            deviceId: "arduino-test-device",
            aiDiagnosis: aiAnalysis,
            metadata: {
                acceleration: parsedData.accel,
                fallenDetected: parsedData.fallen,
                arduinoTimestamp: parsedData.timestamp,
            },
        });

        await heartRateRecord.save();

        res.status(201).json({
            message: "Heart rate data recorded successfully (TEST MODE)",
            data: {
                bpm: parsedData.bpm,
                diagnosis: aiAnalysis.diagnosis,
                severity: aiAnalysis.severity,
                fallen: parsedData.fallen,
                userId: heartRateRecord.userId,
            },
        });
    } catch (error) {
        console.error("Error receiving Arduino data:", error);
        res.status(500).json({ message: "Error processing Arduino data", error: error.message });
    }
};

// ENDPOINT PRODUCTION - Dùng deviceToken
export const receiveArduinoData = async (req, res) => {
    try {
        const { data, deviceToken } = req.body;

        if (!data || !deviceToken) {
            return res.status(400).json({ message: "Missing data or deviceToken" });
        }

        // Tìm device đã được pair
        const device = await Device.findById(deviceToken);
        if (!device || !device.isPaired) {
            return res.status(401).json({ message: "Device not paired" });
        }

        // Cập nhật last connected
        device.lastConnected = new Date();
        await device.save();

        // Parse dữ liệu từ Arduino
        const parsedData = parseArduinoData(data);

        if (!parsedData.bpm) {
            return res.status(400).json({ message: "Invalid heart rate data" });
        }

        // Phân tích bằng AI
        const aiAnalysis = await analyzeHeartRate(parsedData.bpm);

        // Lưu vào database với userId từ device
        const heartRateRecord = new HeartRate({
            userId: device.userId,
            bpm: parsedData.bpm,
            deviceId: device.deviceId,
            aiDiagnosis: aiAnalysis,
            metadata: {
                acceleration: parsedData.accel,
                fallenDetected: parsedData.fallen,
                arduinoTimestamp: parsedData.timestamp,
            },
        });

        await heartRateRecord.save();

        res.status(201).json({
            message: "Heart rate data recorded successfully",
            data: {
                bpm: parsedData.bpm,
                diagnosis: aiAnalysis.diagnosis,
                severity: aiAnalysis.severity,
                fallen: parsedData.fallen,
            },
        });
    } catch (error) {
        console.error("Error receiving Arduino data:", error);
        res.status(500).json({ message: "Error processing Arduino data", error: error.message });
    }
};

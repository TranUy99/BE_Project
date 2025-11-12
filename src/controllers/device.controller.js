import Device from "../models/device.model.js";
import crypto from "crypto";

// Tạo mã pairing code cho thiết bị
export const generatePairingCode = async (req, res) => {
    try {
        const { userId } = req.user; // Từ authentication middleware
        const { deviceName } = req.body;

        // Tạo mã pairing 6 chữ số
        const pairingCode = crypto.randomInt(100000, 999999).toString();

        const device = new Device({
            userId,
            deviceName: deviceName || "Arduino Sensor",
            pairingCode,
            isPaired: false,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Hết hạn sau 10 phút
        });

        await device.save();

        res.status(201).json({
            message: "Pairing code generated",
            pairingCode,
            expiresIn: "10 minutes",
        });
    } catch (error) {
        res.status(500).json({ message: "Error generating pairing code", error: error.message });
    }
};

// Arduino kết nối bằng pairing code
export const pairDevice = async (req, res) => {
    try {
        const { pairingCode, deviceId } = req.body;

        const device = await Device.findOne({
            pairingCode,
            isPaired: false,
            expiresAt: { $gt: new Date() },
        });

        if (!device) {
            return res.status(404).json({ message: "Invalid or expired pairing code" });
        }

        // Cập nhật device
        device.deviceId = deviceId;
        device.isPaired = true;
        device.lastConnected = new Date();
        await device.save();

        res.status(200).json({
            message: "Device paired successfully",
            deviceToken: device._id, // Arduino lưu token này
            userId: device.userId,
        });
    } catch (error) {
        res.status(500).json({ message: "Error pairing device", error: error.message });
    }
};

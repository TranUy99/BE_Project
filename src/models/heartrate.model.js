import mongoose from "mongoose";

const heartRateSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bpm: {
            type: Number,
            required: true,
        },
        deviceId: {
            type: String,
            default: "unknown",
        },
        aiDiagnosis: {
            diagnosis: String,
            severity: String,
            recommendations: [String],
            confidence: Number,
        },
        metadata: {
            acceleration: {
                ax: Number,
                ay: Number,
                az: Number,
            },
            fallenDetected: Boolean,
            arduinoTimestamp: Number,
        },
        recordedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Index để tìm kiếm nhanh hơn
heartRateSchema.index({ userId: 1, recordedAt: -1 });
heartRateSchema.index({ userId: 1, "aiDiagnosis.severity": 1 });

export default mongoose.model("HeartRate", heartRateSchema);

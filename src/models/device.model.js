import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        deviceId: String,
        deviceName: String,
        pairingCode: String,
        isPaired: {
            type: Boolean,
            default: false,
        },
        expiresAt: Date,
        lastConnected: Date,
    },
    { timestamps: true }
);

export default mongoose.model("Device", deviceSchema);

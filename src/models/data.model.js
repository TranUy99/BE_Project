import mongoose from "mongoose";

const DataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    heartRate: {
        type: Number,
        required: true
    },
    ecg: Number,
    acc: [Number],
    status: {
        type: String,
        enum: ['normal', 'warning', 'critical'],
        default: 'normal'
    },
    notes: String,
    // AI Diagnosis fields
    aiDiagnosis: {
        diagnosis: String,
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical']
        },
        analysis: String,
        recommendations: [String],
        riskFactors: [String],
        needsAttention: Boolean,
        urgencyLevel: {
            type: String,
            enum: ['routine', 'urgent', 'emergency']
        },
        aiModel: String,
        diagnosedAt: Date,
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

export default mongoose.model("Data", DataSchema);

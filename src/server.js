import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dataRoutes from "./routes/data.routes.js";
import authRoutes from "./routes/auth.routes.js";
import heartRateRoutes from "./routes/heartrate.routes.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔐 Dùng encodeURIComponent cho password
const username = "uytran_db_user";
const password = encodeURIComponent("Uytran123!");
// Ưu tiên dùng biến môi trường MONGODB_URI (Railway plugin tự set), fallback local
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/be_project";

try {
	await mongoose.connect(uri, {
		// bufferCommands: false // (optionally disable buffering)
	});
	console.log("✅ MongoDB connected ->", uri.includes('localhost') ? 'local' : 'remote');
} catch (err) {
	console.error("❌ MongoDB connection failed:", err.message);
	process.exit(1);
}

// Routes
app.use("/api/data", dataRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/heartrate", heartRateRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

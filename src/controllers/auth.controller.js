import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { username, email, password, age, gender, weight, conditions } = req.body;

        // Basic validation (password already required by schema)
        if (!username || !email || !password) {
            return res.status(400).json({ error: "username, email, password đều bắt buộc" });
        }

        // Normalize conditions to array
        let normalizedConditions = [];
        if (Array.isArray(conditions)) normalizedConditions = conditions;
        else if (typeof conditions === "string" && conditions.trim().length) {
            normalizedConditions = conditions.split(/[,;]/).map((c) => c.trim()).filter(Boolean);
        }

        const user = new User({ username, email, password, age, gender, weight, conditions: normalizedConditions });
        await user.save();
        res.status(201).json({ message: "User registered successfully", userId: user._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
        res.json({ token, userId: user._id, username: user.username, email: user.email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

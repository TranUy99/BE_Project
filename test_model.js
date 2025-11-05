// test_model.js - Test cả Python AI và TensorFlow.js
import { diagnoseHeartRate } from "./src/services/ai.service.js";

const testCases = [
    { heartRate: 65, age: 35, sex: 0, trestbps: 110, chol: 180 },
    { heartRate: 85, age: 45, sex: 1, trestbps: 130, chol: 220 },
    { heartRate: 110, age: 55, sex: 1, trestbps: 150, chol: 260 },
    { heartRate: 140, age: 65, sex: 1, trestbps: 170, chol: 300 },
];

const runTests = async () => {
    console.log("🧪 Testing AI Heart Diagnosis System");
    console.log("=====================================\n");

    for (const testData of testCases) {
        console.log(`=== Testing: ${testData.heartRate} bpm (Age: ${testData.age}, Sex: ${testData.sex}, BP: ${testData.trestbps}, Chol: ${testData.chol}) ===`);

        try {
            const result = await diagnoseHeartRate(testData);

            console.log(`🤖 AI Model: ${result.aiModel}`);
            console.log(`📋 Diagnosis: ${result.diagnosis.diagnosis}`);
            console.log(`⚡ Severity: ${result.diagnosis.severity}`);
            console.log(`📊 Analysis: ${result.diagnosis.analysis}`);

            console.log(`💊 Recommendations (${result.diagnosis.recommendations.length}):`);
            result.diagnosis.recommendations.slice(0, 3).forEach((rec, i) => {
                console.log(`   ${i + 1}. ${rec}`);
            });
            if (result.diagnosis.recommendations.length > 3) {
                console.log(`   ... and ${result.diagnosis.recommendations.length - 3} more`);
            }

            console.log(`⚠️  Risk Factors (${result.diagnosis.riskFactors.length}):`);
            result.diagnosis.riskFactors.slice(0, 3).forEach((risk, i) => {
                console.log(`   ${i + 1}. ${risk}`);
            });
            if (result.diagnosis.riskFactors.length > 3) {
                console.log(`   ... and ${result.diagnosis.riskFactors.length - 3} more`);
            }
        } catch (err) {
            console.error("❌ Error:", err.message);
        }

        console.log(""); // Empty line between tests
    }

    console.log("✅ AI Testing completed!");
    console.log("\n💡 Note: AI will try Python first, fallback to TensorFlow.js if Python unavailable");
};

runTests().catch(console.error);

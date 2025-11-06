// Quick manual test for analysis service
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { analyzeHeartRate } from './src/services/analysis.service.js';

dotenv.config();

const uri = process.env.MONGODB_URI?.trim() || 'mongodb://localhost:27017/be_project';

async function main() {
  try {
    await mongoose.connect(uri);
    const userId = process.argv[2];
    if (!userId) {
      console.error('Usage: node test_analysis.js <userId> [days]');
      process.exit(1);
    }
    const days = process.argv[3] || 7;
    const result = await analyzeHeartRate(userId, { days });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

main();

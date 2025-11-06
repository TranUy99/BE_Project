// Quick manual test for predict-history endpoint without HTTP (direct service)
import { predictHistoryModel } from './src/services/historyModel.service.js';

async function main() {
  try {
    const result = await predictHistoryModel({ heartRate: 78, age: 55, gender: 'female', weight: 62, conditions: ['hypertension','diabetes'], hour: 10 });
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();

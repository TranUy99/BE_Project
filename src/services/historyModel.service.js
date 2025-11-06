// src/services/historyModel.service.js
// Service gọi Python script predict_history_model.py để dự đoán bằng history model
import { spawn } from 'child_process';
import path from 'path';

const PYTHON_PATH = path.join(process.cwd(), 'ai_env', 'bin', 'python3');
const SCRIPT_PATH = path.join(process.cwd(), 'predict_history_model.py');

export function predictHistoryModel({ heartRate, age, gender, weight, conditions = [], hour }) {
  return new Promise((resolve, reject) => {
    if (typeof heartRate !== 'number') {
      return reject(new Error('heartRate must be number'));
    }
    const condArg = Array.isArray(conditions) ? conditions.join(',') : String(conditions || '');
    const args = [SCRIPT_PATH, '--heartRate', heartRate.toString(), '--age', String(age ?? ''), '--gender', String(gender ?? 'other'), '--weight', String(weight ?? ''), '--conditions', condArg];
    if (typeof hour === 'number') args.push('--hour', hour.toString());

    const py = spawn(PYTHON_PATH, args, { cwd: process.cwd() });
    let stdout = ''; let stderr = '';
    py.stdout.on('data', d => { stdout += d.toString(); });
    py.stderr.on('data', d => { stderr += d.toString(); });
    py.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`Python exited ${code}: ${stderr}`));
      }
      try {
        const json = JSON.parse(stdout.trim());
        resolve(json);
      } catch (e) {
        reject(new Error('Failed to parse python output: ' + e.message + ' raw=' + stdout));
      }
    });
    py.on('error', err => reject(err));
  });
}

export default { predictHistoryModel };

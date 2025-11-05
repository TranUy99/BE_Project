// train.js
import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load and preprocess data
const loadData = () => {
    const data = fs.readFileSync(path.join(__dirname, 'heart.csv'), 'utf8');
    const lines = data.trim().split('\n');
    const features = [];
    const labels = [];

    lines.forEach(line => {
        const values = line.split(',').map(v => v.trim());
        if (values.length >= 14) {
            // Use thalach (max heart rate) as feature
            const thalach = parseFloat(values[7]);
            const target = parseInt(values[13]); // 0-4 severity levels
            if (!isNaN(thalach) && !isNaN(target)) {
                features.push([thalach]);
                labels.push(target);
            }
        }
    });

    return { features, labels };
};

// Normalize data
const normalize = (data) => {
    const tensor = tf.tensor2d(data);
    const { mean, variance } = tf.moments(tensor, 0);
    const std = tf.sqrt(variance);
    return {
        normalized: tensor.sub(mean).div(std),
        mean: mean.dataSync(),
        std: std.dataSync()
    };
};

// Train model for severity prediction (0-4)
const trainModel = async () => {
    const { features, labels } = loadData();
    const { normalized, mean, std } = normalize(features);

    const xs = normalized;
    const ys = tf.tensor1d(labels, 'int32');

    // Neural network for multi-class classification
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [1], units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 5, activation: 'softmax' })); // 5 classes (0-4)

    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy']
    });

    await model.fit(xs, ys, {
        epochs: 200,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                if (epoch % 20 === 0) console.log(`Epoch ${epoch}: loss=${logs.loss.toFixed(4)}, acc=${logs.acc.toFixed(4)}, val_acc=${logs.val_acc.toFixed(4)}`);
            }
        }
    });

    // Save model
    await model.save('file://./heart_model');

    // Save normalization params
    fs.writeFileSync('normalization.json', JSON.stringify({ mean: Array.from(mean), std: Array.from(std) }));

    console.log('Model trained and saved!');
};

trainModel().catch(console.error);
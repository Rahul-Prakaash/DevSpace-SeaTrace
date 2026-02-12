import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
    hazardType: {
        type: String,
        required: true,
    },
    riskScore: {
        type: Number,
        min: 0,
        max: 1,
        required: true,
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        required: true,
    },
    affectedArea: {
        type: String,
        required: true,
    },
    lat: {
        type: Number,
        required: true,
    },
    lng: {
        type: Number,
        required: true,
    },
    modelVersion: {
        type: String,
        default: 'v1.0',
    },
}, {
    timestamps: true,
});

predictionSchema.index({ createdAt: -1 });
predictionSchema.index({ riskScore: -1 });

export const Prediction = mongoose.model('Prediction', predictionSchema);

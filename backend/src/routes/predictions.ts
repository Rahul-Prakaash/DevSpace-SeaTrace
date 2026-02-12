import { Router } from 'express';
import { Prediction } from '../models/Prediction.js';

const router = Router();

// GET /api/predictions - Get latest predictions
router.get('/', async (req, res) => {
    try {
        const predictions = await Prediction.find()
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(predictions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});

// POST /api/predictions/generate - Trigger ML prediction
router.post('/generate', async (req, res) => {
    try {
        // TODO: Call Python ML service
        // For now, create a simulated prediction
        const prediction = new Prediction({
            hazardType: 'storm_surge',
            riskScore: 0.75,
            confidence: 0.82,
            affectedArea: 'Chennai Coast',
            lat: 13.0827,
            lng: 80.2707,
        });

        await prediction.save();
        res.status(201).json(prediction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate prediction' });
    }
});

export default router;

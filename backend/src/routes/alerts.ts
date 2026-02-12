import { Router } from 'express';
import { Alert } from '../models/Alert.js';

const router = Router();

// GET /api/alerts - Get active alerts
router.get('/', async (req, res) => {
    try {
        const now = new Date();
        const alerts = await Alert.find({
            expiresAt: { $gt: now },
        }).sort({ issuedAt: -1 });

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// POST /api/alerts - Create new alert
router.post('/', async (req, res) => {
    try {
        const alert = new Alert(req.body);
        await alert.save();
        res.status(201).json(alert);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create alert' });
    }
});

export default router;

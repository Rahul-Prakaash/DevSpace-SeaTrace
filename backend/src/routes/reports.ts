import { Router } from 'express';
import { Hazard } from '../models/Hazard.js';

const router = Router();

// GET /api/reports - Get crowdsourced reports
router.get('/', async (req, res) => {
    try {
        const reports = await Hazard.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// POST /api/reports - Submit new report
router.post('/', async (req, res) => {
    try {
        const report = new Hazard({
            ...req.body,
            verified: false,
            upvotes: 0,
        });
        await report.save();
        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ error: 'Failed to submit report' });
    }
});

// PATCH /api/reports/:id/verify - Verify a report
router.patch('/:id/verify', async (req, res) => {
    try {
        const report = await Hazard.findByIdAndUpdate(
            req.params.id,
            { verified: true },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify report' });
    }
});

// PATCH /api/reports/:id/upvote - Upvote a report
router.patch('/:id/upvote', async (req, res) => {
    try {
        const report = await Hazard.findByIdAndUpdate(
            req.params.id,
            { $inc: { upvotes: 1 } },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upvote report' });
    }
});

export default router;

import { Router } from 'express';
import { Hazard } from '../models/Hazard.js';

const router = Router();

// GET /api/hazards - List all hazards with optional filters
router.get('/', async (req, res) => {
    try {
        const { type, severity } = req.query;
        const filter: any = {};

        if (type) filter.type = type;
        if (severity) filter.severity = severity;

        const hazards = await Hazard.find(filter).sort({ createdAt: -1 });
        res.json(hazards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hazards' });
    }
});

// GET /api/hazards/:id - Get specific hazard
router.get('/:id', async (req, res) => {
    try {
        const hazard = await Hazard.findById(req.params.id);
        if (!hazard) {
            return res.status(404).json({ error: 'Hazard not found' });
        }
        res.json(hazard);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hazard' });
    }
});

// POST /api/hazards - Create new hazard (admin/ML)
router.post('/', async (req, res) => {
    try {
        const hazard = new Hazard(req.body);
        await hazard.save();
        res.status(201).json(hazard);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create hazard' });
    }
});

export default router;

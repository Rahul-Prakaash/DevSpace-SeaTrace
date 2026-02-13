import { Router } from 'express';
import { SocialNotification } from '../models/SocialNotification.js';
import { NewsArticle } from '../models/NewsArticle.js';

const router = Router();

// GET /api/social-notifications
// Query params: ?from=ISO&to=ISO&hazardType=cyclone&state=Kerala&limit=50
router.get('/social-notifications', async (req, res) => {
    try {
        const { from, to, hazardType, state, limit = '50' } = req.query;

        const filter: any = {};

        if (from || to) {
            filter.timestamp = {};
            if (from) filter.timestamp.$gte = new Date(from as string);
            if (to) filter.timestamp.$lte = new Date(to as string);
        }

        if (hazardType) filter.hazardType = hazardType;
        if (state) filter['location.state'] = state;

        const notifications = await SocialNotification
            .find(filter)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit as string));

        res.json({
            count: notifications.length,
            notifications,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// GET /api/news
// Query params: ?from=ISO&to=ISO&hazardType=cyclone&state=Tamil+Nadu&limit=20
router.get('/news', async (req, res) => {
    try {
        const { from, to, hazardType, state, limit = '20' } = req.query;

        const filter: any = {};

        if (from || to) {
            filter.timestamp = {};
            if (from) filter.timestamp.$gte = new Date(from as string);
            if (to) filter.timestamp.$lte = new Date(to as string);
        }

        if (hazardType) filter.hazardType = hazardType;
        if (state) filter.state = state;

        const articles = await NewsArticle
            .find(filter)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit as string));

        res.json({
            count: articles.length,
            articles,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

export default router;

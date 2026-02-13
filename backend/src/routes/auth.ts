import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'seatrace-dev-secret-change-in-prod';
const JWT_EXPIRES_IN = '7d';

// Generate JWT token
function generateToken(userId: string, username: string): string {
    return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Helper: format user for response (consistent shape everywhere)
function formatUser(user: any) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        authProvider: user.authProvider,
        region: user.region || undefined,
        createdAt: user.createdAt,
    };
}

// ─── POST /api/auth/signup ───
// Create a new account with username + email + password
router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                return res.status(409).json({ error: 'Email already registered' });
            }
            return res.status(409).json({ error: 'Username already taken' });
        }

        // Create user (password is auto-hashed by the pre-save hook)
        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password,
            authProvider: 'local',
        });

        const token = generateToken(user._id.toString(), user.username);

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: formatUser(user),
        });
    } catch (err: any) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

// ─── POST /api/auth/login ───
// Login with email/username + password
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password) {
            return res.status(400).json({ error: 'Email/username and password are required' });
        }

        // Find by email or username
        const user = await User.findOne({
            $or: [
                { email: emailOrUsername.toLowerCase() },
                { username: emailOrUsername },
            ]
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.authProvider === 'google') {
            return res.status(400).json({ error: 'This account uses Google sign-in. Please login with Google.' });
        }

        // Check password
        const isMatch = await (user as any).comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user._id.toString(), user.username);

        res.json({
            message: 'Login successful',
            token,
            user: formatUser(user),
        });
    } catch (err: any) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ─── POST /api/auth/google ───
// Login or register with Google account info
router.post('/google', async (req: Request, res: Response) => {
    try {
        const { googleId, email, displayName, avatarUrl } = req.body;

        if (!googleId || !email) {
            return res.status(400).json({ error: 'Google ID and email are required' });
        }

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId });

        if (!user) {
            // Check if email is already registered with local auth
            const existingByEmail = await User.findOne({ email: email.toLowerCase() });
            if (existingByEmail) {
                // Link Google to existing account
                existingByEmail.googleId = googleId;
                existingByEmail.authProvider = 'google';
                if (displayName) existingByEmail.displayName = displayName;
                if (avatarUrl) existingByEmail.avatarUrl = avatarUrl;
                await existingByEmail.save();
                user = existingByEmail;
            } else {
                // Create new user from Google data
                const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
                user = await User.create({
                    username,
                    email: email.toLowerCase(),
                    password: undefined,
                    authProvider: 'google',
                    googleId,
                    displayName,
                    avatarUrl,
                });
            }
        }

        const token = generateToken(user._id.toString(), user.username);

        res.json({
            message: 'Google login successful',
            token,
            user: formatUser(user),
        });
    } catch (err: any) {
        console.error('Google auth error:', err);
        res.status(500).json({ error: 'Google authentication failed' });
    }
});

// ─── GET /api/auth/me ───
// Get current user from JWT token
router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: formatUser(user) });
    } catch (err: any) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// ─── PUT /api/auth/location ───
// Update user's region / location (city-level only)
router.put('/location', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };

        const { regionName, state, bbox } = req.body;

        if (!regionName || !bbox || !Array.isArray(bbox) || bbox.length !== 4) {
            return res.status(400).json({ error: 'regionName and bbox (array of 4 numbers) are required' });
        }

        // Validate bbox values are reasonable
        const [south, west, north, east] = bbox;
        if (
            typeof south !== 'number' || typeof west !== 'number' ||
            typeof north !== 'number' || typeof east !== 'number' ||
            south < -90 || south > 90 || north < -90 || north > 90 ||
            west < -180 || west > 180 || east < -180 || east > 180 ||
            south > north
        ) {
            return res.status(400).json({ error: 'Invalid bbox coordinates' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.region = { name: regionName, state: state || '', bbox: bbox as [number, number, number, number] };
        await user.save();

        res.json({ user: formatUser(user) });
    } catch (err: any) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        console.error('Location update error:', err);
        res.status(500).json({ error: 'Failed to update location' });
    }
});

export default router;

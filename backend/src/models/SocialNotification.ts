import mongoose from 'mongoose';

const socialNotificationSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true,
        enum: ['twitter', 'instagram', 'facebook', 'whatsapp', 'telegram', 'youtube'],
    },
    username: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    verificationStatus: {
        type: String,
        enum: ['verified', 'unverified', 'ambiguous'],
        default: 'unverified',
    },
    location: {
        name: { type: String },
        lat: { type: Number },
        lng: { type: Number },
        state: { type: String },
    },
    hazardType: {
        type: String,
        enum: ['tsunami', 'cyclone', 'storm_surge', 'high_tide', 'coastal_flood', 'rip_current', 'erosion'],
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
    },
    engagement: {
        likes: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
    },
    mediaUrl: { type: String },
    isAlert: { type: Boolean, default: false },
}, { timestamps: true });

socialNotificationSchema.index({ timestamp: -1 });
socialNotificationSchema.index({ hazardType: 1 });
socialNotificationSchema.index({ 'location.state': 1 });

export const SocialNotification = mongoose.model('SocialNotification', socialNotificationSchema);

import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['warning', 'watch', 'advisory'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    issuedAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

export const Alert = mongoose.model('Alert', alertSchema);

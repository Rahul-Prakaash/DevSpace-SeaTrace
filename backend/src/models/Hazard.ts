import mongoose from 'mongoose';

const hazardSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['tsunami', 'storm_surge', 'high_tide', 'erosion', 'rip_current'],
        required: true,
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
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
    reporter: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    upvotes: {
        type: Number,
        default: 0,
    },
    imageUrl: String,
}, {
    timestamps: true,
});

// Index for geospatial queries
hazardSchema.index({ lat: 1, lng: 1 });
hazardSchema.index({ type: 1 });
hazardSchema.index({ severity: 1 });

export const Hazard = mongoose.model('Hazard', hazardSchema);

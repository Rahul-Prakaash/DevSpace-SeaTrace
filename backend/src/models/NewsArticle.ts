import mongoose from 'mongoose';

const newsArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    source: {
        type: String,
        required: true,
        enum: ['NDTV', 'Times of India', 'The Hindu', 'India Today', 'NDMA',
            'INCOIS', 'IMD', 'Down To Earth', 'Scroll.in', 'The Wire'],
    },
    content: { type: String, required: true },
    summary: { type: String },
    url: { type: String },
    timestamp: { type: Date, required: true, default: Date.now },
    hazardType: {
        type: String,
        enum: ['tsunami', 'cyclone', 'storm_surge', 'high_tide', 'coastal_flood', 'rip_current', 'erosion'],
    },
    region: { type: String },
    state: { type: String },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
    },
    isBreaking: { type: Boolean, default: false },
    tags: [{ type: String }],
}, { timestamps: true });

newsArticleSchema.index({ timestamp: -1 });
newsArticleSchema.index({ hazardType: 1 });
newsArticleSchema.index({ state: 1 });

export const NewsArticle = mongoose.model('NewsArticle', newsArticleSchema);

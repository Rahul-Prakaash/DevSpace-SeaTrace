import mongoose from 'mongoose';
import { Hazard } from '../models/Hazard.js';
import { Alert } from '../models/Alert.js';
import { connectDatabase } from '../config/database.js';

const seedData = async () => {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await Hazard.deleteMany({});
    await Alert.deleteMany({});

    // Seed hazards
    const hazards = [
        {
            type: 'storm_surge',
            severity: 'high',
            title: 'Storm surge detected at Marina Bay',
            description: 'Water levels rising rapidly. Estimated 2.5m above normal high tide. Evacuate low-lying areas immediately.',
            lat: 13.0827,
            lng: 80.2707,
            reporter: 'CoastalWatch_TN',
            verified: true,
            upvotes: 47,
        },
        {
            type: 'high_tide',
            severity: 'medium',
            title: 'Abnormal high tide at Besant Nagar',
            description: 'Tide levels 1.2m above predicted. Beach access restricted. Monitor situation closely.',
            lat: 13.0002,
            lng: 80.2718,
            reporter: 'TideMonitor_IN',
            verified: true,
            upvotes: 23,
        },
        {
            type: 'rip_current',
            severity: 'high',
            title: 'Strong rip current near Kovalam',
            description: 'Dangerous rip current observed 200m offshore. Multiple swimmers caught. Avoid swimming.',
            lat: 12.7897,
            lng: 80.2547,
            reporter: 'LifeguardUnit_07',
            verified: true,
            upvotes: 62,
        },
        {
            type: 'erosion',
            severity: 'low',
            title: 'Coastal erosion at ECR stretch',
            description: 'Gradual erosion observed along 500m stretch. No immediate danger but long-term monitoring needed.',
            lat: 12.8500,
            lng: 80.2500,
            reporter: 'GeoSurvey_Team',
            verified: false,
            upvotes: 8,
        },
        {
            type: 'tsunami',
            severity: 'critical',
            title: 'Tsunami advisory — Bay of Bengal',
            description: 'Seismic activity detected. Potential tsunami threat. Move to higher ground immediately.',
            lat: 13.1500,
            lng: 80.3000,
            reporter: 'INCOIS_Alert',
            verified: true,
            upvotes: 156,
        },
        {
            type: 'storm_surge',
            severity: 'medium',
            title: 'Moderate surge at Pondicherry coast',
            description: 'Wave heights increasing. Fishing boats advised to return to shore.',
            lat: 11.9416,
            lng: 79.8083,
            reporter: 'FisherNet_PY',
            verified: true,
            upvotes: 19,
        },
        {
            type: 'high_tide',
            severity: 'low',
            title: 'Spring tide at Mahabalipuram',
            description: 'Expected spring tide. Normal seasonal variation. Exercise caution near shore temples.',
            lat: 12.6169,
            lng: 80.1991,
            reporter: 'Heritage_Watch',
            verified: false,
            upvotes: 5,
        },
    ];

    await Hazard.insertMany(hazards);
    console.log(`✅ Seeded ${hazards.length} hazards`);

    // Seed alerts
    const alerts = [
        {
            type: 'warning',
            message: 'Tsunami advisory active for Tamil Nadu coast. Seismic activity detected in Bay of Bengal.',
            region: 'Tamil Nadu Coast',
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        },
        {
            type: 'watch',
            message: 'Storm surge watch in effect. Expected surge of 1.5-2.5m above normal tide levels.',
            region: 'Chennai — Marina to Besant Nagar',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
    ];

    await Alert.insertMany(alerts);
    console.log(`✅ Seeded ${alerts.length} alerts`);

    console.log('✨ Database seeding completed!');
    process.exit(0);
};

connectDatabase().then(seedData);

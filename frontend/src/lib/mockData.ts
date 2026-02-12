export interface HazardReport {
    id: string;
    type: 'tsunami' | 'storm_surge' | 'high_tide' | 'erosion' | 'rip_current' | 'cyclone';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    lat: number;
    lng: number;
    reporter: string;
    timestamp: string;
    verified: boolean;
    upvotes: number;
    imageUrl?: string;
    isPrediction?: boolean;
}

export interface AlertData {
    id: string;
    type: 'warning' | 'watch' | 'advisory';
    message: string;
    region: string;
    issuedAt: string;
    expiresAt: string;
}

export interface SocialNotification {
    id: string;
    platform: 'twitter' | 'facebook' | 'instagram' | 'telegram';
    username: string;
    content: string;
    timestamp: string;
    verificationStatus: 'verified' | 'unverified' | 'ambiguous';
    location?: string;
    hazardType?: HazardReport['type'];
}

export interface Prediction {
    id: string;
    hazardType: string;
    riskScore: number;
    confidence: number;
    affectedArea: string;
    lat: number;
    lng: number;
    timestamp: string;
}

// Disaster type colors (vibrant, translucent glass effect)
export const disasterColors: Record<HazardReport['type'], { solid: string; gradient: string; border: string }> = {
    tsunami: {
        solid: 'rgba(139, 69, 255, 0.7)',
        gradient: 'linear-gradient(135deg, rgba(139, 69, 255, 0.6), rgba(88, 28, 200, 0.8))',
        border: '#8B45FF'
    },
    cyclone: {
        solid: 'rgba(255, 107, 107, 0.7)',
        gradient: 'linear-gradient(135deg, rgba(255, 107, 107, 0.6), rgba(220, 38, 38, 0.8))',
        border: '#FF6B6B'
    },
    storm_surge: {
        solid: 'rgba(52, 211, 153, 0.7)',
        gradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.6), rgba(16, 185, 129, 0.8))',
        border: '#34D399'
    },
    high_tide: {
        solid: 'rgba(96, 165, 250, 0.7)',
        gradient: 'linear-gradient(135deg, rgba(96, 165, 250, 0.6), rgba(37, 99, 235, 0.8))',
        border: '#60A5FA'
    },
    erosion: {
        solid: 'rgba(251, 191, 36, 0.7)',
        gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.6), rgba(245, 158, 11, 0.8))',
        border: '#FBBF24'
    },
    rip_current: {
        solid: 'rgba(248, 113, 113, 0.7)',
        gradient: 'linear-gradient(135deg, rgba(248, 113, 113, 0.6), rgba(239, 68, 68, 0.8))',
        border: '#F87171'
    },
};

// Generate temporal data for timeline (past 7 days + future 3 days)
function generateTemporalData(): HazardReport[] {
    const now = new Date('2026-02-13T00:00:00Z');
    const reports: HazardReport[] = [];

    // Past week data
    const pastReports: Partial<HazardReport>[] = [
        { type: 'high_tide', severity: 'low', title: 'Minor tidal variation', lat: 13.05, lng: 80.25, verified: true, upvotes: 12 },
        { type: 'erosion', severity: 'low', title: 'Beach erosion observed', lat: 12.85, lng: 80.24, verified: false, upvotes: 5 },
        { type: 'storm_surge', severity: 'medium', title: 'Moderate wave activity', lat: 13.08, lng: 80.27, verified: true, upvotes: 28 },
        { type: 'rip_current', severity: 'high', title: 'Dangerous currents reported', lat: 12.79, lng: 80.25, verified: true, upvotes: 45 },
        { type: 'high_tide', severity: 'medium', title: 'Spring tide warning', lat: 13.00, lng: 80.27, verified: true, upvotes: 34 },
        { type: 'cyclone', severity: 'high', title: 'Cyclonic disturbance', lat: 13.15, lng: 80.30, verified: true, upvotes: 87 },
        { type: 'storm_surge', severity: 'high', title: 'Storm surge at Marina', lat: 13.08, lng: 80.27, verified: true, upvotes: 47 },
    ];

    pastReports.forEach((report, idx) => {
        const daysAgo = 6 - idx;
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - daysAgo);
        reports.push({
            id: `past-${idx}`,
            type: report.type!,
            severity: report.severity!,
            title: report.title!,
            description: `Historical data from ${daysAgo} days ago`,
            lat: report.lat!,
            lng: report.lng!,
            reporter: 'Historical_Data',
            timestamp: timestamp.toISOString(),
            verified: report.verified!,
            upvotes: report.upvotes!,
            isPrediction: false,
        });
    });

    // Future predictions (next 3 days)
    const futureReports: Partial<HazardReport>[] = [
        { type: 'high_tide', severity: 'medium', title: 'Predicted high tide event', lat: 13.02, lng: 80.26, verified: true, upvotes: 0 },
        { type: 'storm_surge', severity: 'high', title: 'Predicted storm surge', lat: 13.10, lng: 80.28, verified: true, upvotes: 0 },
        { type: 'cyclone', severity: 'critical', title: 'Potential cyclone formation', lat: 13.20, lng: 80.32, verified: true, upvotes: 0 },
    ];

    futureReports.forEach((report, idx) => {
        const daysAhead = idx + 1;
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() + daysAhead);
        reports.push({
            id: `future-${idx}`,
            type: report.type!,
            severity: report.severity!,
            title: report.title!,
            description: `ML prediction for ${daysAhead} day(s) ahead`,
            lat: report.lat!,
            lng: report.lng!,
            reporter: 'ML_Predictor',
            timestamp: timestamp.toISOString(),
            verified: report.verified!,
            upvotes: report.upvotes!,
            isPrediction: true,
        });
    });

    return reports;
}

export const temporalHazardReports = generateTemporalData();

// Current reports (for backward compatibility)
export const hazardReports: HazardReport[] = temporalHazardReports.filter(r => !r.isPrediction).slice(-7);

// Social media notifications with platform-specific styling
export const socialNotifications: SocialNotification[] = [
    {
        id: 'sn-001',
        platform: 'twitter',
        username: '@ChennaiCoastWatch',
        content: 'URGENT: High waves observed at Marina Beach. Authorities advising people to stay away from the shore. #ChennaiRains #CoastalAlert',
        timestamp: '2026-02-12T22:45:00Z',
        verificationStatus: 'verified',
        location: 'Marina Beach, Chennai',
        hazardType: 'storm_surge',
    },
    {
        id: 'sn-002',
        platform: 'facebook',
        username: 'Tamil Nadu Weather Updates',
        content: 'Storm surge warning issued for coastal areas. Expected surge of 2-3 meters above normal tide levels. Please take necessary precautions.',
        timestamp: '2026-02-12T21:30:00Z',
        verificationStatus: 'verified',
        location: 'Tamil Nadu Coast',
        hazardType: 'storm_surge',
    },
    {
        id: 'sn-003',
        platform: 'instagram',
        username: '@beach_lif3guard_official',
        content: 'Red flag posted at Elliot\'s Beach due to dangerous rip currents. Swimming strictly prohibited. Stay safe! 🚫🌊',
        timestamp: '2026-02-12T20:15:00Z',
        verificationStatus: 'verified',
        location: 'Elliots Beach, Chennai',
        hazardType: 'rip_current',
    },
    {
        id: 'sn-004',
        platform: 'telegram',
        username: 'INCOIS Alerts',
        content: 'Tsunami advisory issued for Bay of Bengal following seismic activity. Coastal residents move to higher ground immediately.',
        timestamp: '2026-02-12T19:00:00Z',
        verificationStatus: 'verified',
        location: 'Bay of Bengal',
        hazardType: 'tsunami',
    },
    {
        id: 'sn-005',
        platform: 'twitter',
        username: '@localfisherman_raj',
        content: 'guys be careful near kovalam beach, saw some weird wave patterns, might be dangerous',
        timestamp: '2026-02-12T18:45:00Z',
        verificationStatus: 'unverified',
        location: 'Kovalam Beach',
        hazardType: 'rip_current',
    },
    {
        id: 'sn-006',
        platform: 'facebook',
        username: 'Chennai Residents Group',
        content: 'Hearing reports of flooding in some coastal areas. Can anyone confirm?',
        timestamp: '2026-02-12T18:20:00Z',
        verificationStatus: 'ambiguous',
        location: 'Chennai',
    },
];

export const activeAlerts: AlertData[] = [
    {
        id: 'al-001',
        type: 'warning',
        message: 'Tsunami advisory active for Tamil Nadu coast. Seismic activity detected in Bay of Bengal.',
        region: 'Tamil Nadu Coast',
        issuedAt: '2026-02-12T10:12:00Z',
        expiresAt: '2026-02-12T22:00:00Z',
    },
    {
        id: 'al-002',
        type: 'watch',
        message: 'Storm surge watch in effect. Expected surge of 1.5-2.5m above normal tide levels.',
        region: 'Chennai — Marina to Besant Nagar',
        issuedAt: '2026-02-12T08:00:00Z',
        expiresAt: '2026-02-13T08:00:00Z',
    },
];

// Heatmap points [lat, lng, intensity, type]
export const heatmapPoints: [number, number, number][] = [
    [13.0827, 80.2707, 0.9],
    [13.0500, 80.2600, 0.7],
    [13.0002, 80.2718, 0.5],
    [12.9800, 80.2650, 0.4],
    [12.8500, 80.2500, 0.3],
    [12.7897, 80.2547, 0.8],
    [12.6169, 80.1991, 0.2],
    [13.1500, 80.3000, 1.0],
    [13.1200, 80.2800, 0.85],
    [13.0600, 80.2750, 0.6],
    [11.9416, 79.8083, 0.55],
    [12.0000, 79.8500, 0.4],
    [12.5000, 80.1800, 0.35],
    [12.7000, 80.2300, 0.45],
    [13.0300, 80.2680, 0.65],
];

export const coastalStats = {
    activeHazards: 7,
    reportsToday: 23,
    activeAlerts: 2,
    monitoredZones: 14,
    verifiedReports: 5,
    avgResponseTime: '4.2 min',
};

export const severityColor = {
    low: 'hazard-low',
    medium: 'hazard-medium',
    high: 'hazard-high',
    critical: 'hazard-critical',
} as const;

export const typeIcons = {
    tsunami: '🌊',
    storm_surge: '⛈️',
    high_tide: '🌕',
    erosion: '🏖️',
    rip_current: '🌀',
    cyclone: '🌪️',
} as const;

export const typeLabels = {
    tsunami: 'Tsunami',
    storm_surge: 'Storm Surge',
    high_tide: 'High Tide',
    erosion: 'Erosion',
    rip_current: 'Rip Current',
    cyclone: 'Cyclone',
} as const;

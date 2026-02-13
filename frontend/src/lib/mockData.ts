export interface HazardReport {
    id: string;
    type: 'tsunami' | 'storm_surge' | 'high_tide' | 'erosion' | 'rip_current' | 'cyclone' | 'coastal_flood';
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
    state?: string;
    source?: 'agency' | 'social' | 'news';
    verificationStatus?: 'verified' | 'unverified' | 'ambiguous' | 'false_alert';
    durationHours?: number; // how long this hazard stays active on the map
}

// Realistic default durations (hours) per hazard type
// These control how long a report stays visible on the map before expiring
export const HAZARD_DURATION_HOURS: Record<HazardReport['type'], number> = {
    rip_current: 6,     // hours — localized, short-lived
    high_tide: 12,    // single tidal cycle
    storm_surge: 48,    // 2 days — tied to weather system
    tsunami: 24,    // initial wave + aftershocks monitoring
    coastal_flood: 72,    // 3 days — recedes slowly
    cyclone: 120,   // 5 days — formation to dissipation
    erosion: 336,   // 14 days — slow process, lingers
};

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
    platform: 'twitter' | 'facebook' | 'instagram' | 'reddit';
    username: string;
    content: string;
    timestamp: string;
    verificationStatus: 'verified' | 'unverified' | 'ambiguous';
    location?: string;
    hazardType?: HazardReport['type'];
    lat?: number;
    lng?: number;
    state?: string;
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

// ── Disaster type colors ──
export const disasterColors: Record<HazardReport['type'], { solid: string; gradient: string; border: string }> = {
    tsunami: { solid: 'rgba(139, 69, 255, 0.7)', gradient: 'linear-gradient(135deg, rgba(139, 69, 255, 0.6), rgba(88, 28, 200, 0.8))', border: '#8B45FF' },
    cyclone: { solid: 'rgba(255, 107, 107, 0.7)', gradient: 'linear-gradient(135deg, rgba(255, 107, 107, 0.6), rgba(220, 38, 38, 0.8))', border: '#FF6B6B' },
    storm_surge: { solid: 'rgba(52, 211, 153, 0.7)', gradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.6), rgba(16, 185, 129, 0.8))', border: '#34D399' },
    high_tide: { solid: 'rgba(96, 165, 250, 0.7)', gradient: 'linear-gradient(135deg, rgba(96, 165, 250, 0.6), rgba(37, 99, 235, 0.8)', border: '#60A5FA' },
    erosion: { solid: 'rgba(251, 191, 36, 0.7)', gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.6), rgba(245, 158, 11, 0.8))', border: '#FBBF24' },
    rip_current: { solid: 'rgba(248, 113, 113, 0.7)', gradient: 'linear-gradient(135deg, rgba(248, 113, 113, 0.6), rgba(239, 68, 68, 0.8))', border: '#F87171' },
    coastal_flood: { solid: 'rgba(56, 189, 248, 0.7)', gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.6), rgba(14, 165, 233, 0.8))', border: '#38BDF8' },
};

// ── All-India temporal hazard data (past 7 days + future 3 days) ──
// Spread naturally across the entire Indian coastline
function generateTemporalData(): HazardReport[] {
    const now = new Date('2026-02-13T00:00:00Z');
    const reports: HazardReport[] = [];

    // ─── PAST REPORTS: Verified agency data (circles on map) ───
    // Day -7 to Day 0, distributed across India
    const agencyReports: Array<Omit<HazardReport, 'id' | 'timestamp'> & { daysAgo: number; hoursOffset?: number }> = [
        // Day -7: Gujarat coast — moderate storm surge
        {
            daysAgo: 7, type: 'storm_surge', severity: 'medium', title: 'Moderate surge at Mandvi, Gujarat',
            description: 'IMD reports 1.2m surge above normal. Fishing boats advised to return.', lat: 22.83, lng: 69.35,
            reporter: 'IMD_Gujarat', verified: true, upvotes: 34, state: 'Gujarat', source: 'agency', verificationStatus: 'verified'
        },

        // Day -7: Erosion in Kerala
        {
            daysAgo: 7, hoursOffset: 6, type: 'erosion', severity: 'medium', title: 'Coastal erosion at Chellanam, Kerala',
            description: 'Sea wall breached at 2 points. NDMA monitoring.', lat: 9.85, lng: 76.28,
            reporter: 'NDMA_Kerala', verified: true, upvotes: 28, state: 'Kerala', source: 'agency', verificationStatus: 'verified'
        },

        // Day -6: Rip currents in Goa
        {
            daysAgo: 6, type: 'rip_current', severity: 'high', title: 'Dangerous rip currents at Calangute, Goa',
            description: 'Multiple rescues reported. Red flag raised at 5 beach sections.', lat: 15.54, lng: 73.75,
            reporter: 'Goa_Lifeguard', verified: true, upvotes: 67, state: 'Goa', source: 'agency', verificationStatus: 'verified'
        },

        // Day -6: High tide in Mumbai
        {
            daysAgo: 6, hoursOffset: 8, type: 'high_tide', severity: 'high', title: 'Spring tide warning — Mumbai',
            description: 'BMC reports 4.87m tide expected. Low-lying areas on alert.', lat: 18.975, lng: 72.825,
            reporter: 'BMC_Mumbai', verified: true, upvotes: 156, state: 'Maharashtra', source: 'agency', verificationStatus: 'verified'
        },

        // Day -5: Cyclone forming in Bay of Bengal (off Odisha)
        {
            daysAgo: 5, type: 'cyclone', severity: 'high', title: 'Cyclonic disturbance — Bay of Bengal',
            description: 'Deep depression 350km ESE of Paradip. IMD tracking closely.', lat: 19.50, lng: 88.50,
            reporter: 'IMD_Cyclone', verified: true, upvotes: 234, state: 'Odisha', source: 'agency', verificationStatus: 'verified'
        },

        // Day -5: Storm surge at Visakhapatnam
        {
            daysAgo: 5, hoursOffset: 4, type: 'storm_surge', severity: 'medium', title: 'Wave activity increasing — Vizag coast',
            description: 'Significant wave height 2.8m. INCOIS advisory for AP coast.', lat: 17.68, lng: 83.21,
            reporter: 'INCOIS', verified: true, upvotes: 89, state: 'Andhra Pradesh', source: 'agency', verificationStatus: 'verified'
        },

        // Day -4: Erosion at Sundarbans
        {
            daysAgo: 4, type: 'erosion', severity: 'high', title: 'Accelerated erosion — Sagar Island, Sundarbans',
            description: 'GSI survey shows 5m/yr erosion rate. 50 families relocated.', lat: 21.65, lng: 88.05,
            reporter: 'GSI_India', verified: true, upvotes: 45, state: 'West Bengal', source: 'agency', verificationStatus: 'verified'
        },

        // Day -4: High tide at Puri
        {
            daysAgo: 4, hoursOffset: 6, type: 'high_tide', severity: 'medium', title: 'Abnormal tide at Puri beach',
            description: 'Tide 0.8m above predicted. Beach access restricted near Jagannath temple.', lat: 19.81, lng: 85.83,
            reporter: 'OSCDMA', verified: true, upvotes: 23, state: 'Odisha', source: 'agency', verificationStatus: 'verified'
        },

        // Day -3: Cyclone intensifies, now tracked near Kolkata
        {
            daysAgo: 3, type: 'cyclone', severity: 'critical', title: 'Cyclone alert — West Bengal coast',
            description: 'System intensified. Expected landfall near Sagar Island in 48h. NDRF pre-positioned.', lat: 21.80, lng: 88.20,
            reporter: 'IMD_Kolkata', verified: true, upvotes: 456, state: 'West Bengal', source: 'agency', verificationStatus: 'verified'
        },

        // Day -3: Storm surge Gujarat
        {
            daysAgo: 3, hoursOffset: 10, type: 'storm_surge', severity: 'high', title: 'Storm surge alert — Okha, Gujarat',
            description: 'Wind-driven surge 1.8m above normal. Fishermen evacuated.', lat: 22.46, lng: 69.07,
            reporter: 'GSDMA', verified: true, upvotes: 78, state: 'Gujarat', source: 'agency', verificationStatus: 'verified'
        },

        // Day -2: Coastal flood in Chennai
        {
            daysAgo: 2, type: 'coastal_flood', severity: 'high', title: 'Coastal flooding — North Chennai',
            description: 'Heavy rainfall + high tide causing waterlogging in Royapuram, Tondiarpet.', lat: 13.12, lng: 80.28,
            reporter: 'GCC_Chennai', verified: true, upvotes: 134, state: 'Tamil Nadu', source: 'agency', verificationStatus: 'verified'
        },

        // Day -2: Rip current in Andaman
        {
            daysAgo: 2, hoursOffset: 5, type: 'rip_current', severity: 'medium', title: 'Rip currents — Radhanagar Beach, Havelock',
            description: 'Moderate rip currents. Swimming advisory issued by A&N administration.', lat: 11.98, lng: 92.95,
            reporter: 'AN_Admin', verified: true, upvotes: 12, state: 'Andaman & Nicobar', source: 'agency', verificationStatus: 'verified'
        },

        // Day -2: Tsunami monitoring
        {
            daysAgo: 2, hoursOffset: 8, type: 'tsunami', severity: 'medium', title: 'Seismic activity — Andaman Sea',
            description: 'M5.2 earthquake detected 120km SW of Car Nicobar. INCOIS monitoring.', lat: 8.50, lng: 92.00,
            reporter: 'INCOIS', verified: true, upvotes: 189, state: 'Andaman & Nicobar', source: 'agency', verificationStatus: 'verified'
        },

        // Day -1: Cyclone makes landfall
        {
            daysAgo: 1, type: 'cyclone', severity: 'critical', title: 'Cyclone landfall — Digha, West Bengal',
            description: 'Wind speed 135 km/h. Storm surge 3.2m. Emergency response activated.', lat: 21.67, lng: 87.52,
            reporter: 'IMD_Kolkata', verified: true, upvotes: 890, state: 'West Bengal', source: 'agency', verificationStatus: 'verified'
        },

        // Day -1: Flooding in Kolkata
        {
            daysAgo: 1, hoursOffset: 6, type: 'coastal_flood', severity: 'critical', title: 'Severe flooding — Kolkata suburbs',
            description: 'Multiple areas inundated. Army deployed for rescue operations.', lat: 22.50, lng: 88.35,
            reporter: 'NDMA', verified: true, upvotes: 567, state: 'West Bengal', source: 'agency', verificationStatus: 'verified'
        },

        // Day -1: Karnataka coast storm surge
        {
            daysAgo: 1, hoursOffset: 3, type: 'storm_surge', severity: 'medium', title: 'Elevated waves at Malpe beach, Udupi',
            description: 'INCOIS reports 2.1m significant wave height along Karnataka coast.', lat: 13.35, lng: 74.70,
            reporter: 'INCOIS', verified: true, upvotes: 23, state: 'Karnataka', source: 'agency', verificationStatus: 'verified'
        },

        // Day 0 (today): Post-landfall erosion
        {
            daysAgo: 0, type: 'erosion', severity: 'high', title: 'Post-cyclone erosion — Digha coast',
            description: 'Significant beach loss observed after cyclone. Coastal road damaged.', lat: 21.62, lng: 87.50,
            reporter: 'GSI_India', verified: true, upvotes: 67, state: 'West Bengal', source: 'agency', verificationStatus: 'verified'
        },

        // Day 0: Continuing alerts
        {
            daysAgo: 0, hoursOffset: 4, type: 'storm_surge', severity: 'high', title: 'Residual surge — Paradip, Odisha',
            description: 'Surge levels still 1.5m above normal. Ports closed.', lat: 20.31, lng: 86.60,
            reporter: 'IMD_Bhubaneswar', verified: true, upvotes: 45, state: 'Odisha', source: 'agency', verificationStatus: 'verified'
        },

        // Day 0: Rip current Pondicherry
        {
            daysAgo: 0, hoursOffset: 2, type: 'rip_current', severity: 'high', title: 'Rip current alert — Pondicherry',
            description: 'Lifeguards rescued 3 swimmers. Red flags at all beaches.', lat: 11.94, lng: 79.80,
            reporter: 'PY_Coastal', verified: true, upvotes: 56, state: 'Tamil Nadu', source: 'agency', verificationStatus: 'verified'
        },
    ];

    // ─── NEWS/SOCIAL REPORTS: Show as heatmap hues ───
    const newsReports: Array<Omit<HazardReport, 'id' | 'timestamp'> & { daysAgo: number; hoursOffset?: number }> = [
        // Verified news — bright glow
        {
            daysAgo: 6, type: 'cyclone', severity: 'high', title: 'NDTV: Depression forming over Bay of Bengal',
            description: 'Reported by NDTV based on IMD bulletin.', lat: 18.00, lng: 87.00,
            reporter: 'NDTV', verified: false, upvotes: 0, source: 'news', verificationStatus: 'verified', state: 'Odisha'
        },

        {
            daysAgo: 5, type: 'coastal_flood', severity: 'high', title: 'The Hindu: Mumbai low-lying areas flooded',
            description: 'Confirmed by Times of India and BMC.', lat: 19.02, lng: 72.85,
            reporter: 'The Hindu', verified: false, upvotes: 0, source: 'news', verificationStatus: 'verified', state: 'Maharashtra'
        },

        {
            daysAgo: 4, type: 'erosion', severity: 'medium', title: 'Down To Earth: Kerala erosion worsens',
            description: 'Field report confirms erosion at multiple points.', lat: 9.90, lng: 76.30,
            reporter: 'Down To Earth', verified: false, upvotes: 0, source: 'news', verificationStatus: 'verified', state: 'Kerala'
        },

        {
            daysAgo: 3, type: 'cyclone', severity: 'critical', title: 'India Today: Cyclone to hit Bengal coast',
            description: 'Corroborated by IMD red alert.', lat: 21.50, lng: 87.80,
            reporter: 'India Today', verified: false, upvotes: 0, source: 'news', verificationStatus: 'verified', state: 'West Bengal'
        },

        {
            daysAgo: 2, type: 'storm_surge', severity: 'high', title: 'INCOIS bulletin: AP coast high wave alert',
            description: 'Official INCOIS warning for Andhra Pradesh coastline.', lat: 16.50, lng: 82.00,
            reporter: 'INCOIS', verified: false, upvotes: 0, source: 'news', verificationStatus: 'verified', state: 'Andhra Pradesh'
        },

        {
            daysAgo: 1, type: 'coastal_flood', severity: 'critical', title: 'NDTV: Army rescue ops in Kolkata',
            description: 'Confirmed multi-source report of severe flooding.', lat: 22.60, lng: 88.40,
            reporter: 'NDTV', verified: false, upvotes: 0, source: 'news', verificationStatus: 'verified', state: 'West Bengal'
        },

        {
            daysAgo: 0, type: 'storm_surge', severity: 'medium', title: 'TOI: Gujarat coast residual surge',
            description: 'Local reporters confirm elevated water levels.', lat: 21.20, lng: 72.80,
            reporter: 'TOI', verified: false, upvotes: 0, source: 'news', verificationStatus: 'verified', state: 'Gujarat'
        },

        {
            daysAgo: 1, type: 'rip_current', severity: 'high', title: 'Scroll: Goa beach safety concerns',
            description: 'Confirmed by lifeguard reports.', lat: 15.50, lng: 73.80,
            reporter: 'Scroll.in', verified: false, upvotes: 0, source: 'news', verificationStatus: 'verified', state: 'Goa'
        },

        // Ambiguous — fainter glow
        {
            daysAgo: 5, type: 'tsunami', severity: 'medium', title: 'Social: Tremor felt in Andaman',
            description: 'Unconfirmed reports from local WhatsApp groups.', lat: 11.50, lng: 92.70,
            reporter: 'WhatsApp Forward', verified: false, upvotes: 0, source: 'social', verificationStatus: 'ambiguous', state: 'Andaman & Nicobar'
        },

        {
            daysAgo: 4, type: 'coastal_flood', severity: 'medium', title: 'Twitter: Flooding reported near Nagapattinam',
            description: 'Single unverified tweet. No official confirmation.', lat: 10.76, lng: 79.84,
            reporter: '@local_user', verified: false, upvotes: 0, source: 'social', verificationStatus: 'ambiguous', state: 'Tamil Nadu'
        },

        {
            daysAgo: 3, type: 'rip_current', severity: 'medium', title: 'Instagram: Strong currents at Kovalam',
            description: 'Tourist post. Partially matches lifeguard data.', lat: 8.40, lng: 76.98,
            reporter: '@tourist_vibes', verified: false, upvotes: 0, source: 'social', verificationStatus: 'ambiguous', state: 'Kerala'
        },

        {
            daysAgo: 2, type: 'storm_surge', severity: 'high', title: 'WhatsApp: High waves near Ratnagiri',
            description: 'Forwarded message. Location partially matches INCOIS data.', lat: 16.99, lng: 73.30,
            reporter: 'WhatsApp Forward', verified: false, upvotes: 0, source: 'social', verificationStatus: 'ambiguous', state: 'Maharashtra'
        },

        {
            daysAgo: 1, type: 'erosion', severity: 'medium', title: 'Facebook: Road collapse near Mangalore beach',
            description: 'Photos shared but location not precisely confirmed.', lat: 12.88, lng: 74.85,
            reporter: 'Mangalore News FB', verified: false, upvotes: 0, source: 'social', verificationStatus: 'ambiguous', state: 'Karnataka'
        },

        {
            daysAgo: 0, type: 'cyclone', severity: 'medium', title: 'Telegram: Another cyclone forming?',
            description: 'Based on satellite images shared in weather group. Not confirmed by IMD.', lat: 15.00, lng: 86.00,
            reporter: 'Weather Watchers', verified: false, upvotes: 0, source: 'social', verificationStatus: 'ambiguous', state: 'Andhra Pradesh'
        },

        // False alerts — should NOT display on heatmap
        {
            daysAgo: 4, type: 'tsunami', severity: 'critical', title: 'FAKE: Tsunami hitting Chennai',
            description: 'Viral WhatsApp forward debunked by INCOIS.', lat: 13.08, lng: 80.27,
            reporter: 'SPAM', verified: false, upvotes: 0, source: 'social', verificationStatus: 'false_alert', state: 'Tamil Nadu'
        },

        {
            daysAgo: 2, type: 'cyclone', severity: 'critical', title: 'FAKE: Category 5 cyclone heading to Mumbai',
            description: 'Fear-mongering post. No basis in IMD data.', lat: 18.97, lng: 72.82,
            reporter: 'SPAM', verified: false, upvotes: 0, source: 'social', verificationStatus: 'false_alert', state: 'Maharashtra'
        },
    ];

    // Build timestamped reports
    [...agencyReports, ...newsReports].forEach((report, idx) => {
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - report.daysAgo);
        if (report.hoursOffset) timestamp.setHours(timestamp.getHours() + report.hoursOffset);

        reports.push({
            id: `report-${idx}`,
            type: report.type,
            severity: report.severity,
            title: report.title,
            description: report.description,
            lat: report.lat,
            lng: report.lng,
            reporter: report.reporter,
            timestamp: timestamp.toISOString(),
            verified: report.verified,
            upvotes: report.upvotes,
            isPrediction: false,
            state: report.state,
            source: report.source,
            verificationStatus: report.verificationStatus,
            durationHours: HAZARD_DURATION_HOURS[report.type],
        });
    });

    // ─── FUTURE PREDICTIONS (next 3 days) ───
    const predictions: Array<Omit<HazardReport, 'id' | 'timestamp'> & { daysAhead: number }> = [
        {
            daysAhead: 1, type: 'cyclone', severity: 'high', title: 'Predicted: Residual cyclone effects — Odisha',
            description: 'ML model predicts continued high wind and rain in Odisha coast.', lat: 20.00, lng: 86.00,
            reporter: 'ML_Predictor', verified: true, upvotes: 0, state: 'Odisha', source: 'agency', verificationStatus: 'verified'
        },

        {
            daysAhead: 1, type: 'storm_surge', severity: 'medium', title: 'Predicted: Elevated waves — Tamil Nadu',
            description: 'ML model predicts 1.5m surge for northern TN coast.', lat: 12.50, lng: 80.20,
            reporter: 'ML_Predictor', verified: true, upvotes: 0, state: 'Tamil Nadu', source: 'agency', verificationStatus: 'verified'
        },

        {
            daysAhead: 2, type: 'high_tide', severity: 'high', title: 'Predicted: Spring tide — Gulf of Khambhat',
            description: 'ML model predicts 9.5m tide at Bhavnagar.', lat: 21.76, lng: 72.15,
            reporter: 'ML_Predictor', verified: true, upvotes: 0, state: 'Gujarat', source: 'agency', verificationStatus: 'verified'
        },

        {
            daysAhead: 2, type: 'coastal_flood', severity: 'medium', title: 'Predicted: Waterlogging risk — Mumbai',
            description: 'High tide + rainfall forecast creates flood risk.', lat: 19.00, lng: 72.85,
            reporter: 'ML_Predictor', verified: true, upvotes: 0, state: 'Maharashtra', source: 'agency', verificationStatus: 'verified'
        },

        {
            daysAhead: 3, type: 'cyclone', severity: 'medium', title: 'Predicted: New depression possible in BoB',
            description: 'ML model shows 40% chance of cyclogenesis south of Andaman.', lat: 10.00, lng: 90.00,
            reporter: 'ML_Predictor', verified: true, upvotes: 0, state: 'Andaman & Nicobar', source: 'agency', verificationStatus: 'verified'
        },

        {
            daysAhead: 3, type: 'erosion', severity: 'medium', title: 'Predicted: Continued erosion — Kerala coast',
            description: 'ML model predicts monsoon-driven erosion at Alappuzha.', lat: 9.49, lng: 76.33,
            reporter: 'ML_Predictor', verified: true, upvotes: 0, state: 'Kerala', source: 'agency', verificationStatus: 'verified'
        },
    ];

    predictions.forEach((p, idx) => {
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() + p.daysAhead);
        reports.push({
            id: `pred-${idx}`,
            type: p.type,
            severity: p.severity,
            title: p.title,
            description: p.description,
            lat: p.lat,
            lng: p.lng,
            reporter: p.reporter,
            timestamp: timestamp.toISOString(),
            verified: p.verified,
            upvotes: p.upvotes,
            isPrediction: true,
            state: p.state,
            source: p.source,
            verificationStatus: p.verificationStatus,
            durationHours: HAZARD_DURATION_HOURS[p.type],
        });
    });

    return reports;
}

export const temporalHazardReports = generateTemporalData();
export const hazardReports: HazardReport[] = temporalHazardReports.filter(r => !r.isPrediction && r.source === 'agency');

// ── Social media notifications (all-India) ──
export const socialNotifications: SocialNotification[] = [
    {
        id: 'sn-001', platform: 'twitter', username: '@IMDWeather',
        content: 'Deep depression over Bay of Bengal likely to intensify. Odisha & WB on high alert. #CycloneAlert',
        timestamp: '2026-02-11T06:00:00Z', verificationStatus: 'verified', location: 'Bay of Bengal',
        hazardType: 'cyclone', lat: 19.50, lng: 88.50, state: 'Odisha'
    },

    {
        id: 'sn-002', platform: 'twitter', username: '@ABORALA_SAT',
        content: 'High wave alert: 3.5-4.2m expected along Tamil Nadu coast. Fishermen advised not to venture into sea.',
        timestamp: '2026-02-11T10:00:00Z', verificationStatus: 'verified', location: 'Tamil Nadu Coast',
        hazardType: 'storm_surge', lat: 12.00, lng: 80.00, state: 'Tamil Nadu'
    },

    {
        id: 'sn-003', platform: 'twitter', username: '@NDMA_India',
        content: 'Coastal erosion increasing along WB Sundarbans. Climate change accelerating land loss.',
        timestamp: '2026-02-10T08:00:00Z', verificationStatus: 'verified', location: 'Sundarbans',
        hazardType: 'erosion', lat: 21.95, lng: 88.90, state: 'West Bengal'
    },

    {
        id: 'sn-004', platform: 'twitter', username: '@mumbai_BMC',
        content: 'High tide 4.87m at 12:30 PM. Avoid low-lying areas. #MumbaiRains',
        timestamp: '2026-02-12T05:00:00Z', verificationStatus: 'verified', location: 'Mumbai',
        hazardType: 'high_tide', lat: 18.975, lng: 72.825, state: 'Maharashtra'
    },

    {
        id: 'sn-005', platform: 'instagram', username: '@kerala_fishermen',
        content: 'Strong rip current at Kovalam this morning. Two tourists rescued. Stay safe! #KovalamBeach',
        timestamp: '2026-02-11T04:00:00Z', verificationStatus: 'verified', location: 'Kovalam, Kerala',
        hazardType: 'rip_current', lat: 8.40, lng: 76.98, state: 'Kerala'
    },

    {
        id: 'sn-006', platform: 'instagram', username: '@goa_beach_patrol',
        content: 'Rip currents frequent at Calangute. Look for warning flags before entering water.',
        timestamp: '2026-02-10T12:00:00Z', verificationStatus: 'verified', location: 'Calangute, Goa',
        hazardType: 'rip_current', lat: 15.54, lng: 73.75, state: 'Goa'
    },

    {
        id: 'sn-007', platform: 'facebook', username: 'Vizag Coastal Updates',
        content: 'Fishermen report unusually rough seas. IMD yellow alert for AP coast. Stay away from beaches.',
        timestamp: '2026-02-11T09:00:00Z', verificationStatus: 'verified', location: 'Visakhapatnam',
        hazardType: 'storm_surge', lat: 17.68, lng: 83.21, state: 'Andhra Pradesh'
    },

    {
        id: 'sn-008', platform: 'facebook', username: 'Kolkata Weather Watch',
        content: 'Cyclone track models show landfall near Sagar Island. NDRF pre-positioned. Evacuation underway.',
        timestamp: '2026-02-11T22:00:00Z', verificationStatus: 'verified', location: 'Sagar Island, WB',
        hazardType: 'cyclone', lat: 21.65, lng: 88.05, state: 'West Bengal'
    },

    {
        id: 'sn-009', platform: 'reddit', username: 'u/IndianWeatherWatch',
        content: 'M5.2 earthquake detected in Andaman Sea. INCOIS says no tsunami threat currently. Stay alert if you are on the coast. Source: INCOIS bulletin.',
        timestamp: '2026-02-12T16:00:00Z', verificationStatus: 'verified', location: 'Andaman Sea',
        hazardType: 'tsunami', lat: 8.50, lng: 92.00, state: 'Andaman & Nicobar'
    },

    {
        id: 'sn-010', platform: 'reddit', username: 'u/ParadipFisherForum',
        content: 'Boats called back to harbor at Paradip. IMD red alert issued. Can anyone confirm the surge level? Hearing different numbers from locals.',
        timestamp: '2026-02-12T06:30:00Z', verificationStatus: 'ambiguous', location: 'Paradip, Odisha',
        hazardType: 'storm_surge', lat: 20.31, lng: 86.60, state: 'Odisha'
    },

    {
        id: 'sn-011', platform: 'reddit', username: 'u/MangaloreCoastal',
        content: 'Serious erosion near Panambur beach. Road partially damaged, BMC put barricades but it looks pretty bad. Pics in comments.',
        timestamp: '2026-02-10T14:00:00Z', verificationStatus: 'ambiguous', location: 'Mangalore, Karnataka',
        hazardType: 'erosion', lat: 12.91, lng: 74.85, state: 'Karnataka'
    },

    {
        id: 'sn-012', platform: 'twitter', username: '@ChennaiRains',
        content: 'Rough seas along ECR. Mahabalipuram shore temple area flooded during high tide.',
        timestamp: '2026-02-10T15:00:00Z', verificationStatus: 'ambiguous', location: 'Mahabalipuram, TN',
        hazardType: 'high_tide', lat: 12.61, lng: 80.19, state: 'Tamil Nadu'
    },

    {
        id: 'sn-013', platform: 'facebook', username: 'Digha Beach Info',
        content: 'High tide submerged parts of promenade. Water reached market area.',
        timestamp: '2026-02-11T17:00:00Z', verificationStatus: 'ambiguous', location: 'Digha, WB',
        hazardType: 'high_tide', lat: 21.67, lng: 87.52, state: 'West Bengal'
    },

    {
        id: 'sn-014', platform: 'reddit', username: 'u/BayOfBengalTracker',
        content: 'Cyclone path models from 3 agencies converging on Odisha coast. IMD cone covers Paradip to Chandbali. Thread with full analysis and satellite imagery.',
        timestamp: '2026-02-11T12:00:00Z', verificationStatus: 'verified', location: 'Bay of Bengal',
        hazardType: 'cyclone', lat: 17.00, lng: 85.00, state: 'Odisha'
    },
];

// ── Alerts (all-India) ──
export const activeAlerts: AlertData[] = [
    {
        id: 'al-001', type: 'warning', message: 'Cyclone alert for Odisha-West Bengal coast. Heavy rainfall expected.',
        region: 'Odisha & West Bengal Coast', issuedAt: '2026-02-11T00:00:00Z', expiresAt: '2026-02-13T12:00:00Z'
    },
    {
        id: 'al-002', type: 'watch', message: 'Storm surge watch for Gujarat coast. Expected surge 1.5-2m.',
        region: 'Gujarat Coast', issuedAt: '2026-02-10T06:00:00Z', expiresAt: '2026-02-13T06:00:00Z'
    },
    {
        id: 'al-003', type: 'advisory', message: 'High tide advisory for Mumbai. Waterlogging expected in low-lying areas.',
        region: 'Mumbai Metropolitan', issuedAt: '2026-02-12T02:00:00Z', expiresAt: '2026-02-13T02:00:00Z'
    },
    {
        id: 'al-004', type: 'warning', message: 'INCOIS tsunami bulletin — Andaman Sea. M5.2 earthquake. Monitoring.',
        region: 'Andaman & Nicobar', issuedAt: '2026-02-12T16:00:00Z', expiresAt: '2026-02-13T16:00:00Z'
    },
];

// ── Heatmap base points (legacy compatibility — spread across India) ──
export const heatmapPoints: [number, number, number][] = [
    // West Bengal / Odisha — cyclone zone
    [21.67, 87.53, 0.9], [22.00, 88.10, 0.85], [20.31, 86.60, 0.7],
    [19.81, 85.83, 0.5], [21.50, 87.80, 0.95],
    // Andhra Pradesh
    [17.68, 83.21, 0.6], [16.50, 82.00, 0.4], [14.44, 79.98, 0.3],
    // Tamil Nadu
    [13.08, 80.27, 0.55], [11.94, 79.80, 0.5], [10.76, 79.84, 0.35],
    [12.61, 80.19, 0.4], [8.08, 77.53, 0.2],
    // Kerala
    [9.93, 76.26, 0.45], [8.52, 76.93, 0.35], [9.49, 76.33, 0.5],
    [9.85, 76.28, 0.6],
    // Karnataka / Goa
    [12.91, 74.85, 0.35], [15.54, 73.75, 0.4], [14.80, 74.12, 0.25],
    // Maharashtra
    [18.97, 72.82, 0.65], [16.99, 73.30, 0.3],
    // Gujarat
    [21.17, 72.83, 0.5], [22.83, 69.35, 0.55], [20.90, 70.36, 0.3],
    [22.46, 69.07, 0.6], [21.76, 72.15, 0.4],
    // Andaman & Nicobar
    [11.62, 92.72, 0.45], [9.15, 92.81, 0.3], [8.50, 92.00, 0.5],
];

export const coastalStats = {
    activeHazards: hazardReports.length,
    reportsToday: temporalHazardReports.filter(r => {
        const d = new Date(r.timestamp);
        return d.toDateString() === new Date('2026-02-13T00:00:00Z').toDateString();
    }).length,
    activeAlerts: activeAlerts.length,
    monitoredZones: 32,
    verifiedReports: temporalHazardReports.filter(r => r.source === 'agency' && r.verified).length,
    avgResponseTime: '3.8 min',
};

export const severityColor = {
    low: 'hazard-low',
    medium: 'hazard-medium',
    high: 'hazard-high',
    critical: 'hazard-critical',
} as const;

export const typeIcons = {
    tsunami: '\u{1F30A}',
    storm_surge: '\u26C8\uFE0F',
    high_tide: '\u{1F315}',
    erosion: '\u{1F3D6}\uFE0F',
    rip_current: '\u{1F300}',
    cyclone: '\u{1F32A}\uFE0F',
    coastal_flood: '\u{1F4A7}',
} as const;

export const typeLabels = {
    tsunami: 'Tsunami',
    storm_surge: 'Storm Surge',
    high_tide: 'High Tide',
    erosion: 'Erosion',
    rip_current: 'Rip Current',
    cyclone: 'Cyclone',
    coastal_flood: 'Coastal Flood',
} as const;

import mongoose from 'mongoose';
import { Hazard } from '../models/Hazard.js';
import { Alert } from '../models/Alert.js';
import { SocialNotification } from '../models/SocialNotification.js';
import { NewsArticle } from '../models/NewsArticle.js';
import { connectDatabase } from '../config/database.js';

const seedData = async () => {
    console.log('🌱 Seeding database with all-India data...');

    await Hazard.deleteMany({});
    await Alert.deleteMany({});
    await SocialNotification.deleteMany({});
    await NewsArticle.deleteMany({});

    // ─── Hazards (all-India) ───
    const hazards = [
        {
            type: 'storm_surge', severity: 'high', title: 'Storm surge at Marina Beach, Chennai',
            description: 'Water levels rising 2.5m above normal. Evacuate low-lying areas.', lat: 13.0827, lng: 80.2707,
            reporter: 'CoastalWatch_TN', verified: true, upvotes: 47
        },
        {
            type: 'cyclone', severity: 'critical', title: 'Cyclone warning — Bay of Bengal',
            description: 'Deep depression intensifying into cyclonic storm. Odisha and West Bengal on alert.',
            lat: 19.8135, lng: 85.8312, reporter: 'IMD_Cyclone', verified: true, upvotes: 234
        },
        {
            type: 'high_tide', severity: 'medium', title: 'Abnormal high tide at Besant Nagar',
            description: 'Tide levels 1.2m above predicted. Beach access restricted.', lat: 13.0002, lng: 80.2718,
            reporter: 'TideMonitor_IN', verified: true, upvotes: 23
        },
        {
            type: 'rip_current', severity: 'high', title: 'Dangerous rip current at Goa beaches',
            description: 'Multiple rip currents observed at Calangute and Baga beaches. Swimmers exercise extreme caution.',
            lat: 15.5449, lng: 73.7550, reporter: 'GoaLifeguards', verified: true, upvotes: 89
        },
        {
            type: 'erosion', severity: 'medium', title: 'Coastal erosion accelerating at Alappuzha',
            description: 'Sea wall breached at 3 points. 200m stretch affected. Residents relocated.',
            lat: 9.4981, lng: 76.3388, reporter: 'KeralaDisaster', verified: true, upvotes: 45
        },
        {
            type: 'tsunami', severity: 'critical', title: 'Tsunami advisory — Andaman Sea',
            description: 'Seismic activity detected. Potential tsunami threat to Andaman & Nicobar.',
            lat: 11.6234, lng: 92.7265, reporter: 'INCOIS_Alert', verified: true, upvotes: 312
        },
        {
            type: 'coastal_flood', severity: 'high', title: 'Flooding in low-lying areas of Mumbai',
            description: 'Heavy rainfall combined with high tide causing waterlogging in Andheri, Bandra.',
            lat: 18.9750, lng: 72.8258, reporter: 'MumbaiFloodWatch', verified: true, upvotes: 178
        },
        {
            type: 'storm_surge', severity: 'high', title: 'Storm surge warning — Gujarat coast',
            description: 'Wind-driven surge expected at Mandvi and Okha. 1.5-2m above normal.',
            lat: 22.8326, lng: 69.3510, reporter: 'GujWeather', verified: true, upvotes: 56
        },
        {
            type: 'cyclone', severity: 'high', title: 'Depression intensifying off Vizag coast',
            description: 'Low-pressure system may strengthen. Fishing boats advised to return.',
            lat: 17.6868, lng: 83.2185, reporter: 'AP_Disaster', verified: true, upvotes: 132
        },
        {
            type: 'rip_current', severity: 'medium', title: 'Rip currents along Puri beach',
            description: 'Moderate rip currents observed. Swimming not recommended at several points.',
            lat: 19.8135, lng: 85.8312, reporter: 'OdishaLifeguard', verified: true, upvotes: 34
        },
    ];

    await Hazard.insertMany(hazards);
    console.log(`✅ Seeded ${hazards.length} hazards (all-India)`);

    // ─── Alerts ───
    const alerts = [
        {
            type: 'warning', message: 'Cyclone alert for Odisha-West Bengal coast. Heavy rainfall expected.',
            region: 'Odisha & West Bengal Coast', expiresAt: new Date(Date.now() + 12 * 3600000)
        },
        {
            type: 'watch', message: 'Storm surge watch for Gujarat coast. Expected 1.5-2m above normal.',
            region: 'Gujarat Coast', expiresAt: new Date(Date.now() + 24 * 3600000)
        },
        {
            type: 'advisory', message: 'High tide advisory for Mumbai. Waterlogging expected in low-lying areas.',
            region: 'Mumbai Metropolitan', expiresAt: new Date(Date.now() + 8 * 3600000)
        },
    ];

    await Alert.insertMany(alerts);
    console.log(`✅ Seeded ${alerts.length} alerts`);

    // ─── Social Notifications (mock data across India) ───
    const now = Date.now();
    const hour = 3600000;

    const socialNotifications = [
        // Twitter / X
        {
            platform: 'twitter', username: '@IMDWeather', content: '⚠️ Deep depression over Bay of Bengal likely to intensify into cyclonic storm. Odisha & WB coast on high alert. #CycloneAlert #BayOfBengal',
            timestamp: new Date(now - 2 * hour), verificationStatus: 'verified',
            location: { name: 'Bay of Bengal', lat: 18.5, lng: 86.0, state: 'Odisha' },
            hazardType: 'cyclone', severity: 'high', engagement: { likes: 2340, shares: 890, comments: 156 }, isAlert: true
        },

        {
            platform: 'twitter', username: '@ABORALA_SAT', content: '🌊 High wave alert: Significant wave height 3.5-4.2m expected along Tamil Nadu coast. Fishermen advised not to venture into sea.',
            timestamp: new Date(now - 4 * hour), verificationStatus: 'verified',
            location: { name: 'Tamil Nadu Coast', lat: 12.0, lng: 80.0, state: 'Tamil Nadu' },
            hazardType: 'storm_surge', severity: 'high', engagement: { likes: 567, shares: 234, comments: 45 }, isAlert: true
        },

        {
            platform: 'twitter', username: '@ndaborala', content: 'Flooding reported in Surat as Tapi river rises above danger level. Multiple areas waterlogged. Rescue teams deployed.',
            timestamp: new Date(now - 6 * hour), verificationStatus: 'verified',
            location: { name: 'Surat', lat: 21.17, lng: 72.83, state: 'Gujarat' },
            hazardType: 'coastal_flood', severity: 'critical', engagement: { likes: 3456, shares: 1200, comments: 567 }, isAlert: true
        },

        {
            platform: 'twitter', username: '@mumbaborala', content: '🌧️ High tide at 4.87m expected at 12:30 PM today in Mumbai. Avoid low-lying areas. #MumbaiRains',
            timestamp: new Date(now - 1 * hour), verificationStatus: 'verified',
            location: { name: 'Mumbai', lat: 18.975, lng: 72.825, state: 'Maharashtra' },
            hazardType: 'high_tide', severity: 'high', engagement: { likes: 1890, shares: 567, comments: 234 }, isAlert: true
        },

        // Instagram
        {
            platform: 'instagram', username: '@kerala_fishermen', content: '🚨 Strong rip current spotted near Kovalam beach today morning. Two tourists rescued by local swimmers. Stay safe everyone! #KovalamBeach',
            timestamp: new Date(now - 3 * hour), verificationStatus: 'verified',
            location: { name: 'Kovalam', lat: 8.40, lng: 76.98, state: 'Kerala' },
            hazardType: 'rip_current', severity: 'high', engagement: { likes: 890, shares: 123, comments: 67 }
        },

        {
            platform: 'instagram', username: '@goa_beach_patrol', content: 'Season advisory: Rip currents more frequent at Calangute. Look for warning flags 🚩 before entering water. #GoaBeaches #SafeSwimming',
            timestamp: new Date(now - 8 * hour), verificationStatus: 'verified',
            location: { name: 'Calangute', lat: 15.54, lng: 73.75, state: 'Goa' },
            hazardType: 'rip_current', severity: 'medium', engagement: { likes: 456, shares: 89, comments: 34 }
        },

        {
            platform: 'instagram', username: '@coast_watch_india', content: 'Shocking erosion at Chellanam, Kerala. Sea has advanced 15m inland this monsoon season. Residents demand sea wall repairs. 📸',
            timestamp: new Date(now - 12 * hour), verificationStatus: 'verified',
            location: { name: 'Chellanam', lat: 9.85, lng: 76.28, state: 'Kerala' },
            hazardType: 'erosion', severity: 'high', engagement: { likes: 2345, shares: 678, comments: 189 }
        },

        // Facebook
        {
            platform: 'facebook', username: 'Vizag Coastal Updates', content: 'Fishermen from Visakhapatnam report unusually rough seas since yesterday. IMD has issued yellow alert for AP coast. Stay away from beaches.',
            timestamp: new Date(now - 5 * hour), verificationStatus: 'verified',
            location: { name: 'Visakhapatnam', lat: 17.68, lng: 83.21, state: 'Andhra Pradesh' },
            hazardType: 'storm_surge', severity: 'medium', engagement: { likes: 345, shares: 123, comments: 56 }
        },

        {
            platform: 'facebook', username: 'Digha Beach Info', content: 'High tide submerged parts of Digha beach promenade today. Photos show water reaching up to the market area. Tourists asked to be cautious.',
            timestamp: new Date(now - 7 * hour), verificationStatus: 'unverified',
            location: { name: 'Digha', lat: 21.67, lng: 87.52, state: 'West Bengal' },
            hazardType: 'high_tide', severity: 'medium', engagement: { likes: 567, shares: 189, comments: 78 }
        },

        {
            platform: 'facebook', username: 'Kolkata Weather Watch', content: 'Sundarbans alert: Cyclone track models show landfall near Sagar Island. NDRF teams pre-positioned. Evacuation underway in low-lying areas.',
            timestamp: new Date(now - 2.5 * hour), verificationStatus: 'verified',
            location: { name: 'Sagar Island', lat: 21.65, lng: 88.05, state: 'West Bengal' },
            hazardType: 'cyclone', severity: 'critical', engagement: { likes: 4567, shares: 2345, comments: 890 }, isAlert: true
        },

        // WhatsApp (forwarded reports)
        {
            platform: 'whatsapp', username: 'Paradip Fisher Group', content: 'All boats called back to harbor. IMD red alert for Paradip coast. Very heavy rain + storm surge expected next 24 hours.',
            timestamp: new Date(now - 1.5 * hour), verificationStatus: 'ambiguous',
            location: { name: 'Paradip', lat: 20.31, lng: 86.60, state: 'Odisha' },
            hazardType: 'storm_surge', severity: 'high', engagement: { likes: 0, shares: 456, comments: 0 }
        },

        {
            platform: 'whatsapp', username: 'Mangalore Coast Alert', content: 'Sea erosion has damaged the road near Panambur beach. BMC has installed barricades. Avoid the stretch after dark.',
            timestamp: new Date(now - 10 * hour), verificationStatus: 'unverified',
            location: { name: 'Mangalore', lat: 12.91, lng: 74.85, state: 'Karnataka' },
            hazardType: 'erosion', severity: 'medium', engagement: { likes: 0, shares: 234, comments: 0 }
        },

        // Telegram
        {
            platform: 'telegram', username: 'INCOIS Alerts Channel', content: '🔴 TSUNAMI BULLETIN: M5.8 earthquake detected in Andaman Sea. No tsunami threat at this time. Monitoring continues. Next update in 2 hours.',
            timestamp: new Date(now - 0.5 * hour), verificationStatus: 'verified',
            location: { name: 'Andaman Sea', lat: 10.5, lng: 92.5, state: 'Andaman & Nicobar' },
            hazardType: 'tsunami', severity: 'medium', engagement: { likes: 890, shares: 567, comments: 45 }, isAlert: true
        },

        {
            platform: 'telegram', username: 'Kerala Disaster Updates', content: 'Flash flood warning for Alappuzha district. Water level rising in Kuttanad. SDRF on standby.',
            timestamp: new Date(now - 4.5 * hour), verificationStatus: 'verified',
            location: { name: 'Alappuzha', lat: 9.49, lng: 76.33, state: 'Kerala' },
            hazardType: 'coastal_flood', severity: 'high', engagement: { likes: 345, shares: 234, comments: 89 }, isAlert: true
        },

        // YouTube
        {
            platform: 'youtube', username: 'India Weather Live', content: '🔴 LIVE: Tracking cyclone formation over Bay of Bengal | Path prediction | Impact on Odisha coast | Expert analysis',
            timestamp: new Date(now - 3 * hour), verificationStatus: 'verified',
            location: { name: 'Bay of Bengal', lat: 17.0, lng: 85.0, state: 'Odisha' },
            hazardType: 'cyclone', severity: 'high', engagement: { likes: 5678, shares: 890, comments: 1234 }
        },

        // Additional Twitter posts
        {
            platform: 'twitter', username: '@ChennaiRains', content: 'Rough sea conditions continue along ECR. Mahabalipuram shore temple area flooded during high tide. #ChennaiCoast',
            timestamp: new Date(now - 9 * hour), verificationStatus: 'unverified',
            location: { name: 'Mahabalipuram', lat: 12.61, lng: 80.19, state: 'Tamil Nadu' },
            hazardType: 'high_tide', severity: 'medium', engagement: { likes: 678, shares: 123, comments: 45 }
        },

        {
            platform: 'twitter', username: '@NDMA_India', content: '⚠️ Advisory: Coastal erosion increasing along West Bengal Sundarbans delta. Climate change accelerating land loss. Communities at risk.',
            timestamp: new Date(now - 15 * hour), verificationStatus: 'verified',
            location: { name: 'Sundarbans', lat: 21.95, lng: 88.90, state: 'West Bengal' },
            hazardType: 'erosion', severity: 'high', engagement: { likes: 1234, shares: 567, comments: 234 }, isAlert: true
        },

        {
            platform: 'twitter', username: '@Aborala_port', content: 'Port Blair: Slight tremor felt in southern Andaman this morning. INCOIS monitoring. No tsunami warning issued.',
            timestamp: new Date(now - 11 * hour), verificationStatus: 'verified',
            location: { name: 'Port Blair', lat: 11.62, lng: 92.72, state: 'Andaman & Nicobar' },
            hazardType: 'tsunami', severity: 'low', engagement: { likes: 234, shares: 89, comments: 23 }
        },

        {
            platform: 'twitter', username: '@RatnagiriCoast', content: 'Beautiful but dangerous: Strong undercurrents at Ganpatipule beach today. Two lifeguard rescues already. Please swim only in designated zones.',
            timestamp: new Date(now - 6 * hour), verificationStatus: 'verified',
            location: { name: 'Ganpatipule', lat: 17.14, lng: 73.26, state: 'Maharashtra' },
            hazardType: 'rip_current', severity: 'medium', engagement: { likes: 345, shares: 67, comments: 23 }
        },
    ];

    await SocialNotification.insertMany(socialNotifications);
    console.log(`✅ Seeded ${socialNotifications.length} social notifications`);

    // ─── News Articles ───
    const newsArticles = [
        {
            title: 'Cyclonic storm likely to cross Odisha coast in 48 hours: IMD',
            source: 'NDTV', content: 'The India Meteorological Department has issued a warning as a deep depression over the Bay of Bengal is likely to intensify into a cyclonic storm and cross the Odisha coast between Paradip and Chandbali in the next 48 hours.',
            summary: 'IMD warns of cyclone landfall on Odisha coast within 48 hours.',
            timestamp: new Date(now - 2 * hour), hazardType: 'cyclone', region: 'Odisha Coast', state: 'Odisha',
            severity: 'high', isBreaking: true, tags: ['cyclone', 'odisha', 'IMD', 'alert']
        },

        {
            title: 'Mumbai braces for season\'s highest tide amid heavy rainfall',
            source: 'Times of India', content: 'With the BMC issuing a high tide warning of 4.87m expected at 12:30 PM today, Mumbaikars have been advised to avoid venturing near the sea. The combination of heavy rainfall and high tide is expected to cause severe waterlogging.',
            summary: 'Mumbai faces 4.87m high tide combined with heavy rainfall.',
            timestamp: new Date(now - 3 * hour), hazardType: 'high_tide', region: 'Mumbai', state: 'Maharashtra',
            severity: 'high', isBreaking: true, tags: ['mumbai', 'high-tide', 'flooding', 'BMC']
        },

        {
            title: 'Kerala coastal erosion worsens: 200 families relocated from Chellanam',
            source: 'The Hindu', content: 'The relentless coastal erosion at Chellanam in Ernakulam district has forced the relocation of nearly 200 families. The sea has advanced about 15 metres inland during this monsoon season. Residents have demanded immediate construction of seawalls.',
            summary: 'Severe erosion at Chellanam displaces 200 families.',
            timestamp: new Date(now - 8 * hour), hazardType: 'erosion', region: 'Kerala Coast', state: 'Kerala',
            severity: 'high', isBreaking: false, tags: ['erosion', 'kerala', 'chellanam', 'displacement']
        },

        {
            title: 'INCOIS issues tsunami bulletin after M5.8 earthquake in Andaman Sea',
            source: 'INCOIS', content: 'The Indian National Centre for Ocean Information Services (INCOIS) issued a tsunami bulletin after a magnitude 5.8 earthquake was detected in the Andaman Sea. While no tsunami threat has been identified, monitoring continues.',
            summary: 'INCOIS monitoring Andaman Sea after 5.8 magnitude earthquake.',
            timestamp: new Date(now - 1 * hour), hazardType: 'tsunami', region: 'Andaman & Nicobar', state: 'Andaman & Nicobar',
            severity: 'medium', isBreaking: true, tags: ['tsunami', 'earthquake', 'andaman', 'INCOIS']
        },

        {
            title: 'Gujarat coast on alert: Storm surge expected to reach 2m',
            source: 'India Today', content: 'The Gujarat coast is bracing for a significant storm surge of up to 2 metres above normal tide levels. The Mandvi and Okha coastline is particularly vulnerable. Fishermen have been advised to avoid venturing into the sea.',
            summary: 'Gujarat coast faces 2m storm surge warning.',
            timestamp: new Date(now - 5 * hour), hazardType: 'storm_surge', region: 'Gujarat Coast', state: 'Gujarat',
            severity: 'high', isBreaking: false, tags: ['storm-surge', 'gujarat', 'mandvi', 'okha']
        },

        {
            title: 'Rip currents claim two lives at Goa beaches this season',
            source: 'Scroll.in', content: 'Two tourists drowned at Goa beaches this season due to rip currents. Lifeguards have intensified patrols at Calangute and Baga beaches. Authorities urge swimmers to look for warning flags before entering water.',
            summary: 'Rip current deaths at Goa beaches prompt safety warnings.',
            timestamp: new Date(now - 14 * hour), hazardType: 'rip_current', region: 'Goa Coast', state: 'Goa',
            severity: 'high', isBreaking: false, tags: ['rip-current', 'goa', 'drowning', 'safety']
        },

        {
            title: 'Sundarbans losing land at alarming rate, satellite data shows',
            source: 'Down To Earth', content: 'Satellite imagery analysis reveals the Sundarbans delta in West Bengal is losing land at an unprecedented rate due to rising sea levels and increased erosion. Multiple inhabited islands have shrunk significantly over the past decade.',
            summary: 'Satellite data confirms accelerating land loss in Sundarbans.',
            timestamp: new Date(now - 20 * hour), hazardType: 'erosion', region: 'Sundarbans, West Bengal', state: 'West Bengal',
            severity: 'high', isBreaking: false, tags: ['erosion', 'sundarbans', 'climate-change', 'satellite']
        },

        {
            title: 'IMD predicts above-normal cyclone activity in Bay of Bengal this season',
            source: 'IMD', content: 'The India Meteorological Department has predicted above-normal cyclone activity in the Bay of Bengal during the current season. States along the east coast have been asked to keep their disaster response machinery ready.',
            summary: 'IMD forecasts more cyclones in Bay of Bengal this season.',
            timestamp: new Date(now - 24 * hour), hazardType: 'cyclone', region: 'Bay of Bengal', state: 'Odisha',
            severity: 'medium', isBreaking: false, tags: ['cyclone', 'IMD', 'forecast', 'bay-of-bengal']
        },

        {
            title: 'Visakhapatnam fishermen report unusual sea behaviour ahead of weather system',
            source: 'The Hindu', content: 'Fishermen at Visakhapatnam have reported unusually rough seas and changes in fish migration patterns, often precursors to severe weather. The AP disaster management authority has sounded a yellow alert.',
            summary: 'Vizag fishermen report rough seas, yellow alert issued.',
            timestamp: new Date(now - 6 * hour), hazardType: 'storm_surge', region: 'AP Coast', state: 'Andhra Pradesh',
            severity: 'medium', isBreaking: false, tags: ['vizag', 'storm', 'fishermen', 'yellow-alert']
        },

        {
            title: 'NDMA releases updated guidelines for coastal flood preparedness',
            source: 'NDMA', content: 'The National Disaster Management Authority has released updated guidelines for coastal flood preparedness, incorporating lessons from recent events in Mumbai, Chennai, and Kerala. The guidelines emphasize community-level early warning systems.',
            summary: 'NDMA updates coastal flood preparedness guidelines.',
            timestamp: new Date(now - 48 * hour), hazardType: 'coastal_flood', region: 'All India', state: 'Maharashtra',
            severity: 'low', isBreaking: false, tags: ['NDMA', 'guidelines', 'flood', 'preparedness']
        },
    ];

    await NewsArticle.insertMany(newsArticles);
    console.log(`✅ Seeded ${newsArticles.length} news articles`);

    console.log('\n✨ All-India database seeding completed!');
    console.log(`   ${hazards.length} hazards | ${alerts.length} alerts | ${socialNotifications.length} social | ${newsArticles.length} news`);
    process.exit(0);
};

connectDatabase().then(seedData);

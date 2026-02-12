# 🌊 SeaTrace: Collective Hazard Mapping for Safer Shores

**Team PrismShift** | Devspace 2026

SeaTrace is a sophisticated coastal safety platform that empowers communities through collective hazard mapping and predictive analytics. The project addresses the critical need for real-time, localized data on coastal threats like tsunamis, storm surges, and high-tide flooding.

![SeaTrace Dashboard](https://img.shields.io/badge/Status-Demo%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 Features

### Core Capabilities
- **Interactive Coastal Map**: Leaflet-powered dark-theme map centered on Indian coastal regions
- **Real-Time Hazard Visualization**: Dynamic markers and heatmaps showing threat intensity
- **ML-Powered Predictions**: Risk forecasting based on NOAA historical data patterns
- **Crowdsourced Reporting**: Community-driven hazard submissions with verification system
- **Alert System**: Automated warnings for high-risk zones
- **Statistics Dashboard**: Live metrics on active hazards, reports, and response times

### Technical Highlights
- **Responsive Design**: Mobile-first approach with glassmorphism effects
- **Dark Ocean Theme**: Custom Tailwind theme with cyan/teal accents
- **Animated UI**: Framer Motion for smooth transitions and micro-interactions
- **Real-Time Updates**: React Query for efficient data fetching and caching

## 🏗️ Architecture

```
SeaTrace/
├── frontend/          # React + Vite + TypeScript + Tailwind
├── backend/           # Node.js + Express + MongoDB
└── ml/                # Python + Flask (ML predictions)
```

### Tech Stack

**Frontend**
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS + shadcn/ui components
- Leaflet.js for interactive maps
- Framer Motion for animations
- React Query for state management

**Backend**
- Node.js + Express
- MongoDB with Mongoose ODM
- RESTful API architecture
- CORS enabled for development

**ML Component**
- Python 3.x
- Flask API server
- NumPy for computations
- Simulated NOAA-based predictions

## 🚀 Quick Start

### Prerequisites
- Node.js v20+ and npm
- Python 3.10+
- MongoDB running locally or connection URI
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Devspace
```

2. **Set up Frontend**
```bash
cd frontend
npm install
cp .env.example .env
```

3. **Set up Backend**
```bash
cd ../backend
npm install
cp .env.example .env
# Edit .env and add your MongoDB URI
```

4. **Set up ML Service**
```bash
cd ../ml
python -m venv venv
# Windows:
venv\\Scripts\\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

### Running the Application

**Terminal 1: Start MongoDB** (if running locally)
```bash
mongod
```

**Terminal 2: Start Backend**
```bash
cd backend
npm run dev
```

**Terminal 3: Seed Database** (first time only)
```bash
cd backend
npm run seed
```

**Terminal 4: Start ML API**
```bash
cd ml
# Activate venv first
python src/api.py
```

**Terminal 5: Start Frontend**
```bash
cd frontend
npm run dev
```

**Access the application:** http://localhost:5173

## 📊 NOAA Data Integration

SeaTrace leverages open-source datasets from NOAA (National Oceanic and Atmospheric Administration):

1. **Global Historical Tsunami Database** - 2,400+ events from 2100 BC to present
2. **SLOSH Storm Surge Models** - Hurricane inundation predictions
3. **Coastal Ocean Reanalysis (CORA)** - 40+ years of water level data
4. **High Tide Flooding Records** - Coastal flooding patterns

> **Note**: The ML component simulates predictions based on NOAA patterns for this demo. In production, it would process actual datasets.

## 🎨 Design Philosophy

- **Dark Ocean Theme**: Deep blues and teals reflecting the marine environment
- **Glassmorphism**: Frosted glass effects for modern aesthetics
- **Micro-Animations**: Subtle movements (wave-float, hazard-pulse) for engagement
- **Responsive Layout**: Collapsible sidebar, mobile-optimized controls

**Design Refinements from Reference:**
- ✅ Fixed title gradient rendering
- ✅ Perfect stats ribbon centering with `left-1/2 -translate-x-1/2`
- ✅ Consistent glass panel effects
- ✅ Smooth animated transitions

## 📡 API Endpoints

### Backend (Port 3000)
- `GET /api/hazards` - List all hazards (filterable by type, severity)
- `GET /api/hazards/:id` - Get specific hazard details
- `POST /api/reports` - Submit crowdsourced report
- `PATCH /api/reports/:id/verify` - Verify a report (admin)
- `PATCH /api/reports/:id/upvote` - Upvote a report
- `GET /api/alerts` - Get active coastal alerts
- `GET /api/predictions` - Get ML predictions
- `POST /api/predictions/generate` - Trigger new prediction

### ML Service (Port 5000)
- `GET /health` - Health check
- `POST /predict` - Generate single location prediction
- `POST /predict/bulk` - Bulk predictions for multiple locations

## 🧪 Testing & Verification

### Frontend Build Test
```bash
cd frontend
npm run build
```

### Backend Health Check
```bash
curl http://localhost:3000/health
```

### ML API Health Check
```bash
curl http://localhost:5000/health
```

### Test Prediction
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"lat": 13.0827, "lng": 80.2707, "hazardType": "storm_surge"}'
```

## 🗺️ Demo Locations

The demo is pre-loaded with data from Tamil Nadu coast:
- **Chennai (Marina Bay)**: 13.0827, 80.2707
- **Besant Nagar**: 13.0002, 80.2718
- **Kovalam**: 12.7897, 80.2547
- **Mahabalipuram**: 12.6169, 80.1991
- **Pondicherry**: 11.9416, 79.8083

## 🛠️ Development

### Project Structure

```
frontend/src/
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── Header.tsx
│   ├── MapView.tsx
│   ├── StatsBar.tsx
│   ├── AlertBanner.tsx
│   ├── HazardSidebar.tsx
│   └── ReportDetail.tsx
├── lib/             # Utilities and data
│   ├── api.ts       # API client
│   ├── mockData.ts  # Demo data
│   └── utils.ts     # Helper functions
└── pages/
    └── Index.tsx    # Main dashboard

backend/src/
├── config/          # Database config
├── models/          # Mongoose schemas
├── routes/          # API routes
└── scripts/         # Seed scripts

ml/src/
├── predict.py       # ML predictor class
└── api.py           # Flask server
```

### Adding New Hazard Types

1. Update `mockData.ts` with new type in `HazardReport` interface
2. Add icon mapping in `HazardSidebar.tsx`
3. Update Mongoose schema in `backend/src/models/Hazard.ts`
4. Add risk scoring logic in `ml/src/predict.py`

## 🤝 Contributing

This is a Devspace project, but suggestions are welcome!

## 📄 License

MIT License - Team PrismShift

## 🙏 Acknowledgments

- NOAA for open-source coastal hazard datasets
- OpenStreetMap contributors
- CARTO for map tiles
- Leaflet.js community
- shadcn/ui for component library

---

**Built with ❤️ by Team PrismShift for Devspace 2026**

# 🌊 SeaTrace: Collective Hazard Mapping for Safer Shores

**Team PrismShift** | DevSpace 2026

**SeaTrace** is a sophisticated coastal safety platform that empowers communities through collective hazard mapping and predictive analytics. The project addresses the critical need for real-time, localized data on coastal threats like tsunamis, storm surges, and high-tide flooding.

![SeaTrace Dashboard](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Python%20ML-blue?style=for-the-badge)

## 🎯 Key Features

### 🌍 Real-Time Hazard Intelligence
-   **Interactive Map**: Leaflet-powered dark-theme interface with dynamic heatmaps and hazard markers.
-   **Live Data Integration**: Visualizes data from verified agency sources (NOAA, INCOIS) and crowd-sourced reports.
-   **Smart Filtering**: Filter hazards by type (Cyclone, Tsunami, Erosion) and severity.
-   **Temporal Timeline**: Rewind/forward time to see past events or future ML predictions.

### 🤖 AI Assessment & Social Signals
-   **ML-Powered Predictions**: Python/Scikit-Learn models predicting coastal risks based on historical NOAA data.
-   **Social Sentinel**: Analyzes social media signals (tweets/posts) to detect emerging threats before official confirmation.
-   **News Verification**: Automatically cross-references news reports with official data for "Verified" badges.

### 👤 User-Centric Experience
-   **Location Profiling**: Users can set their coastal region (e.g., "Marina Beach, Chennai") to auto-focus the map and filter relevant alerts.
-   **Resilient Auth**: Secure JWT authentication with session persistence and graceful error handling.
-   **Community Reporting**: Submit hazard reports with geolocation and upvote/verify community submissions.

## 🏗️ Technical Architecture

### Frontend (React + Vite)
-   **Framework**: React 18 with TypeScript
-   **Styling**: Tailwind CSS with custom "Ocean Dark" theme & Glassmorphism
-   **State Management**: Zustand (Auth/Timeline/Maps)
-   **Maps**: Leaflet.js with custom dark tiles & Heatmap layers
-   **UI Components**: Radix UI primitives for accessible, robust interactives

### Backend (Node.js + Express)
-   **API**: RESTful architecture with resilient error handling
-   **Database**: MongoDB (Mongoose ODM) with geospatial indexing
-   **Auth**: Custom JWT-based secure authentication
-   **Services**: Dedicated routes for Hazards, Social Intelligence, and User Profiles

### ML Service (Python + Flask)
-   **Model**: Random Forest Classifier trained on Indian Coastal datasets
-   **API**: Flask server exposing `/predict` endpoints
-   **Data Engineering**: Pipelines for processing NOAA historical data

## 🚀 Quick Start

### Prerequisites
-   Node.js v18+
-   Python 3.10+
-   MongoDB (Local or Atlas)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Rahul-Prakaash/DevSpace-SeaTrace.git
    cd DevSpace-SeaTrace
    ```

2.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    # Create .env based on .env.example
    npm run dev
    ```

3.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Configure your MONGODB_URI in .env
    npm run dev
    ```

4.  **ML Service Setup**
    ```bash
    cd ml
    python -m venv venv
    source venv/bin/activate  # or venv\Scripts\activate on Windows
    pip install -r requirements.txt
    python src/api.py
    ```

## 🎨 Design Philosophy
SeaTrace features a **"Deep Ocean"** aesthetic designed for clarity in low-light conditions:
-   **Glassmorphism**: Translucent floating panels for map controls and overlays.
-   **Fluid Animations**: Wave-like micro-interactions and smooth map fly-to transitions.
-   **Hierarchical Layout**: Critical alerts take precedence; historical data fades into the background.

---

**Built by Team PrismShift**

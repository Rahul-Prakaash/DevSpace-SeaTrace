# 🚀 SeaTrace Quick Start Guide

## One-Click Setup & Launch

SeaTrace now includes automated batch scripts for Windows to make setup and launching effortless!

### First Time Setup (One-Time Only)

1. **Install Dependencies**
   ```bash
   # Double-click or run:
   install.bat
   ```
   This will:
   - Check for Node.js and Python
   - Install all npm packages (frontend + backend)
   - Create Python virtual environment
   - Install Python ML dependencies
   - Create .env files

2. **Start MongoDB**
   ```bash
   # Option A: Run as service
   net start MongoDB
   
   # Option B: Run in terminal
   mongod
   ```

3. **Seed Database** (Optional but recommended)
   ```bash
   # Double-click or run:
   seed-database.bat
   ```
   Populates MongoDB with 7 sample hazard reports and 2 alerts.

### Launching SeaTrace

**🎯 One-Click Launch:**
```bash
# Double-click this file:
start-seatrace.bat
```

This will automatically:
1. ✅ Check MongoDB connection
2. ✅ Train ML models on Indian data (if not already trained)
3. ✅ Start Backend API (port 3000)
4. ✅ Start ML Service (port 5000)
5. ✅ Start Frontend Dev Server (port 5173)
6. ✅ Open browser to http://localhost:5173

**That's it! Just double-click `start-seatrace.bat` and you're ready for your demo!**

### Manual Training (Optional)

If you want to re-train the ML models:
```bash
train-models.bat
```

This trains Random Forest models on:
- 2000 synthetic samples based on INCOIS patterns
- Historical events (2004 tsunami, cyclones)
- State-wise risk profiles
- Seasonal patterns

Training takes ~30-60 seconds.

### Stopping Services

```bash
# Double-click or run:
stop-seatrace.bat
```

Or just close all the command windows that opened.

---

## Batch Scripts Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `install.bat` | Install all dependencies | First time setup only |
| `seed-database.bat` | Populate MongoDB with sample data | After MongoDB is running, before first launch |
| `train-models.bat` | Train ML models on Indian data | Optional - done automatically by start script |
| `start-seatrace.bat` | **Launch everything** | Every time you want to run the app |
| `stop-seatrace.bat` | Stop all services | When you're done |

---

## What Happens During Launch?

### 1. ML Model Training (First Run Only)
```
🇮🇳 Indian Coastal Hazard Data Preparation
================================================
📊 Generating synthetic training data...
✅ Saved 2000 training samples to ml/data/...
✅ Loaded 7 historical events

🤖 Training ML models on Indian coastal data...
   Training risk score model...
   ✅ Risk model R² score: 0.892
   Training severity classification model...
   ✅ Severity model accuracy: 0.956
💾 Models saved to ml/data/trained_models.pkl
```

### 2. Services Start
```
Backend API → http://localhost:3000
ML Service  → http://localhost:5000  
Frontend    → http://localhost:5173
```

### 3. Browser Opens Automatically
Your default browser will open to the SeaTrace dashboard!

---

## Troubleshooting

### "MongoDB is not running"
**Solution:**
```bash
# Start MongoDB service
net start MongoDB

# OR run in a separate terminal:
mongod
```

### "Models training failed"
**Cause:** Missing Python packages

**Solution:**
```bash
cd ml
venv\Scripts\activate
pip install -r requirements.txt
```

### "npm install failed"
**Cause:** Node.js not installed or outdated

**Solution:**
- Download Node.js v20+ from https://nodejs.org
- Run `install.bat` again

### Services won't start
**Solution:**
1. Close all command windows
2. Run `stop-seatrace.bat`
3. Check ports aren't in use:
   ```bash
   netstat -ano | findstr "3000 5000 5173"
   ```
4. Try `start-seatrace.bat` again

---

## Demo Day Checklist

### Before Presentation
- [ ] Run `install.bat` (if first time)
- [ ] Start MongoDB
- [ ] Run `seed-database.bat`
- [ ] Test launch with `start-seatrace.bat`
- [ ] Verify all 3 service windows open
- [ ] Confirm browser opens to dashboard
- [ ] Close and retry to ensure smooth demo

### During Demo
1. **Just double-click** `start-seatrace.bat`
2. Wait ~10 seconds for all services
3. Browser auto-opens
4. Start presenting!

### After Demo
- Click `stop-seatrace.bat` or close windows

---

## Advanced: Manual Launch

If you prefer manual control:

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```

**Terminal 2: ML Service**
```bash
cd ml
venv\Scripts\activate
python src/api.py
```

**Terminal 3: Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 4: Open Browser**
```bash
start http://localhost:5173
```

---

## Indian Data Sources (Integrated)

The ML models are trained on patterns from:

✅ **INCOIS** - Indian National Centre for Ocean Information Services  
✅ **Historical Events**: 2004 Tsunami, Cyclone Fani, Ockhi, Amphan  
✅ **State Profiles**: Tamil Nadu, Kerala, Odisha, West Bengal, Gujarat, Maharashtra, Andhra Pradesh  
✅ **Seasonal Patterns**: Monsoon cycles, spring tides  
✅ **Sea Regions**: Bay of Bengal vs Arabian Sea risk differences  

---

**Ready to impress at Devspace? Just run `start-seatrace.bat`! 🌊**

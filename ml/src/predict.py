"""
Enhanced SeaTrace ML Prediction Service — All-India Coverage
Supports 7 hazard types, 17 features including bathymetry and geological data.
Trained on expanded all-India dataset with temporal+spatial+oceanographic features.
"""

import numpy as np
import pandas as pd
import os
from datetime import datetime
from typing import Dict, List, Tuple
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import cross_val_score
import pickle

class EnhancedHazardPredictor:
    """
    All-India ML coastal hazard predictor.
    17 features: spatial + temporal + oceanographic + geological.
    7 hazard types: tsunami, cyclone, storm_surge, high_tide, coastal_flood, rip_current, erosion.
    """

    def __init__(self, data_dir='data'):
        self.data_dir = data_dir
        self.risk_model = None
        self.severity_model = None
        self.intensity_model = None
        self.label_encoders = {}
        self.feature_columns = []
        self.is_trained = False
        self.load_models()

    def train(self, training_data: pd.DataFrame):
        """Train on expanded all-India dataset with 17 features."""
        print("\n" + "=" * 70)
        print("[TRAINING] All-India Enhanced ML Models")
        print("=" * 70)
        print(f"\n[DATA] Shape: {training_data.shape}")

        # Encode categorical features
        categorical_cols = ['sea_region', 'hazard_type', 'season', 'severity', 'intensity_bin']
        for col in categorical_cols:
            if col in training_data.columns:
                self.label_encoders[col] = LabelEncoder()
                training_data[f'{col}_encoded'] = self.label_encoders[col].fit_transform(training_data[col])

        # 17 features: spatial(2) + temporal(4) + ocean(5) + geological(3) + categorical(3)
        self.feature_columns = [
            'lat', 'lng',
            'month', 'day_of_year', 'is_monsoon', 'is_cyclone_season',
            'sst_celsius', 'wave_height_m', 'wind_speed_kmh', 'current_velocity_ms', 'tide_level_m',
            'bathymetry_depth_m', 'coastal_slope_deg', 'tidal_range_m',
            'sea_region_encoded', 'hazard_type_encoded', 'season_encoded',
        ]

        X = training_data[self.feature_columns].values
        y_risk = training_data['risk_score'].values
        y_severity = training_data['severity_encoded'].values
        y_intensity = training_data['intensity_bin_encoded'].values

        print(f"   Features: {len(self.feature_columns)}")
        print(f"   Samples: {X.shape[0]:,}")

        # Risk Score Model (Gradient Boosting)
        print("\n[MODEL 1] Risk score regression (Gradient Boosting)...")
        self.risk_model = GradientBoostingRegressor(
            n_estimators=250, max_depth=8, learning_rate=0.1,
            subsample=0.8, random_state=42)
        self.risk_model.fit(X, y_risk)
        r2 = self.risk_model.score(X, y_risk)
        print(f"   R² = {r2:.4f}")

        # Cross-validation
        cv_scores = cross_val_score(self.risk_model, X, y_risk, cv=5, scoring='r2')
        print(f"   CV R² = {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

        # Severity Classification Model
        print("\n[MODEL 2] Severity classification (Random Forest)...")
        self.severity_model = RandomForestClassifier(
            n_estimators=200, max_depth=12, min_samples_split=5,
            random_state=42, n_jobs=-1)
        self.severity_model.fit(X, y_severity)
        acc = self.severity_model.score(X, y_severity)
        print(f"   Accuracy = {acc:.4f}")

        # Intensity Bin Classification Model
        print("\n[MODEL 3] Intensity classification (Random Forest)...")
        self.intensity_model = RandomForestClassifier(
            n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)
        self.intensity_model.fit(X, y_intensity)
        int_acc = self.intensity_model.score(X, y_intensity)
        print(f"   Accuracy = {int_acc:.4f}")

        # Feature importance
        print("\n[FEATURES] Top 10 Important Features (Risk):")
        fi = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.risk_model.feature_importances_
        }).sort_values('importance', ascending=False).head(10)
        for _, row in fi.iterrows():
            bar = "#" * int(row['importance'] * 50)
            print(f"   {row['feature']:.<30} {row['importance']:.4f} {bar}")

        self.is_trained = True
        self.save_models()
        print("\n" + "=" * 70)
        print("[SUCCESS] All-India Model Training Complete!")
        print("=" * 70)

    def save_models(self):
        os.makedirs(self.data_dir, exist_ok=True)
        path = os.path.join(self.data_dir, 'trained_models_enhanced.pkl')
        with open(path, 'wb') as f:
            pickle.dump({
                'risk_model': self.risk_model,
                'severity_model': self.severity_model,
                'intensity_model': self.intensity_model,
                'label_encoders': self.label_encoders,
                'feature_columns': self.feature_columns,
            }, f)
        print(f"[SAVED] Models -> {path}")

    def load_models(self):
        path = os.path.join(self.data_dir, 'trained_models_enhanced.pkl')
        if os.path.exists(path):
            print(f"[LOADING] Models from {path}")
            with open(path, 'rb') as f:
                data = pickle.load(f)
                self.risk_model = data['risk_model']
                self.severity_model = data['severity_model']
                self.intensity_model = data['intensity_model']
                self.label_encoders = data['label_encoders']
                self.feature_columns = data['feature_columns']
                self.is_trained = True
            print("[OK] Models loaded")
        else:
            print("[INFO] No pre-trained models found.")

    def _get_sea_region(self, lat: float, lng: float) -> str:
        if lng > 90: return 'Andaman Sea'
        elif lng > 77: return 'Bay of Bengal'
        else: return 'Arabian Sea'

    def _estimate_oceanographic_conditions(self, lat, lng, hazard_type='storm_surge') -> Dict:
        """Estimate current oceanographic conditions for prediction."""
        month = datetime.now().month
        sea_region = self._get_sea_region(lat, lng)

        if month in [6, 7, 8, 9]:
            sst, wave, wind = 29.0, 3.0, 22.0
        elif month in [12, 1, 2]:
            sst, wave, wind = 26.5, 1.5, 12.0
        else:
            sst, wave, wind = 30.0, 2.0, 15.0

        if sea_region == 'Bay of Bengal': sst += 0.5; wave += 0.2
        elif sea_region == 'Andaman Sea': sst += 1.0; wave += 0.5

        # Gujarat tidal extremes
        if sea_region == 'Arabian Sea' and lat > 20:
            tide = 4.0 + np.random.normal(0, 0.5)
        else:
            tide = 0.8 + np.random.normal(0, 0.3)

        return {
            'sst_celsius': np.clip(sst + np.random.normal(0, 0.5), 24.0, 33.0),
            'wave_height_m': np.clip(wave + np.random.normal(0, 0.4), 0.3, 8.0),
            'wind_speed_kmh': np.clip(wind + np.random.normal(0, 3.0), 2.0, 55.0),
            'current_velocity_ms': np.clip(0.8 + np.random.normal(0, 0.3), 0.05, 3.0),
            'tide_level_m': np.clip(tide, -1.0, 6.0),
        }

    def _estimate_geological_features(self, lat, lng) -> Dict:
        """Estimate geological features for a location."""
        sea_region = self._get_sea_region(lat, lng)

        if sea_region == 'Arabian Sea' and lat > 20:
            bathy, slope, tidal = 15.0, 1.5, 8.0
        elif sea_region == 'Andaman Sea':
            bathy, slope, tidal = 120.0, 3.5, 1.5
        elif sea_region == 'Bay of Bengal' and lat > 20:
            bathy, slope, tidal = 25.0, 2.0, 4.5
        else:
            bathy, slope, tidal = 40.0, 2.5, 1.5

        return {
            'bathymetry_depth_m': bathy + np.random.normal(0, 5),
            'coastal_slope_deg': max(0.5, slope + np.random.normal(0, 0.5)),
            'tidal_range_m': max(0.3, tidal + np.random.normal(0, 0.3)),
        }

    def predict_risk(self, lat: float, lng: float, hazard_type: str = 'storm_surge') -> Dict:
        """Generate prediction for ANY location along the Indian coast."""
        if not self.is_trained:
            raise ValueError("Models not trained!")

        now = datetime.now()
        month = now.month
        day_of_year = now.timetuple().tm_yday
        is_monsoon = 1 if month in [6, 7, 8, 9] else 0
        is_cyclone_season = 1 if month in [4, 5, 10, 11, 12] else 0

        if month in [12, 1, 2]: season = 'winter'
        elif month in [3, 4, 5]: season = 'summer'
        elif month in [6, 7, 8, 9]: season = 'monsoon'
        else: season = 'post_monsoon'

        sea_region = self._get_sea_region(lat, lng)
        ocean = self._estimate_oceanographic_conditions(lat, lng, hazard_type)
        geo = self._estimate_geological_features(lat, lng)

        try:
            sr_enc = self.label_encoders['sea_region'].transform([sea_region])[0]
            ht_enc = self.label_encoders['hazard_type'].transform([hazard_type])[0]
            se_enc = self.label_encoders['season'].transform([season])[0]
        except (ValueError, KeyError):
            sr_enc, ht_enc, se_enc = 0, 0, 0

        features = np.array([[
            lat, lng, month, day_of_year, is_monsoon, is_cyclone_season,
            ocean['sst_celsius'], ocean['wave_height_m'], ocean['wind_speed_kmh'],
            ocean['current_velocity_ms'], ocean['tide_level_m'],
            geo['bathymetry_depth_m'], geo['coastal_slope_deg'], geo['tidal_range_m'],
            sr_enc, ht_enc, se_enc,
        ]])

        risk_score = float(np.clip(self.risk_model.predict(features)[0], 0.0, 1.0))
        severity_enc = self.severity_model.predict(features)[0]
        severity = self.label_encoders['severity'].inverse_transform([severity_enc])[0]
        intensity_enc = self.intensity_model.predict(features)[0]
        intensity_bin = self.label_encoders['intensity_bin'].inverse_transform([intensity_enc])[0]

        severity_probs = self.severity_model.predict_proba(features)[0]
        confidence = float(np.clip(np.max(severity_probs), 0.6, 0.98))

        # Top contributing factors
        feature_contribs = list(zip(self.feature_columns, features[0]))
        top_factors = sorted(
            [(name, abs(val * self.risk_model.feature_importances_[i]))
             for i, (name, val) in enumerate(feature_contribs)],
            key=lambda x: x[1], reverse=True
        )[:3]

        return {
            'hazardType': hazard_type,
            'riskScore': round(risk_score, 3),
            'confidence': round(confidence, 3),
            'severity': severity,
            'intensityBin': intensity_bin,
            'affectedArea': self._get_affected_area(lat, lng),
            'seaRegion': sea_region,
            'season': season,
            'lat': lat, 'lng': lng,
            'timestamp': now.isoformat(),
            'oceanographicConditions': {
                'sst': round(ocean['sst_celsius'], 2),
                'waveHeight': round(ocean['wave_height_m'], 2),
                'windSpeed': round(ocean['wind_speed_kmh'], 1),
                'currentVelocity': round(ocean['current_velocity_ms'], 2),
                'tideLevel': round(ocean['tide_level_m'], 2),
            },
            'geologicalFeatures': {
                'bathymetryDepth': round(geo['bathymetry_depth_m'], 1),
                'coastalSlope': round(geo['coastal_slope_deg'], 2),
                'tidalRange': round(geo['tidal_range_m'], 2),
            },
            'topContributingFactors': [
                {'feature': f[0], 'contribution': round(f[1], 4)} for f in top_factors
            ],
            'modelVersion': 'v4.0-all-india',
            'dataSource': 'INCOIS + IMD + NDMA (All-India Expanded Dataset)',
        }

    def _get_affected_area(self, lat: float, lng: float) -> str:
        """Determine affected area from coordinates — covers ALL of India."""
        areas = [
            (22.0, 23.5, 87.0, 89.0, 'Sundarbans / West Bengal Coast'),
            (21.0, 22.0, 86.5, 88.0, 'Digha / West Bengal Coast'),
            (19.5, 21.0, 84.5, 87.5, 'Odisha Coast'),
            (17.0, 19.5, 82.0, 84.5, 'Andhra Pradesh Coast'),
            (15.0, 17.0, 80.0, 82.5, 'Andhra Pradesh South Coast'),
            (12.5, 15.0, 79.5, 80.5, 'Chennai Metropolitan Area'),
            (10.5, 12.5, 79.0, 80.5, 'Tamil Nadu Central Coast'),
            (8.0, 10.5, 77.0, 80.0, 'Tamil Nadu South Coast'),
            (8.0, 10.0, 76.0, 77.0, 'Kerala South Coast'),
            (10.0, 12.5, 75.0, 76.5, 'Kerala Central Coast'),
            (12.5, 14.0, 74.0, 75.5, 'Karnataka Coast'),
            (14.0, 16.0, 73.5, 74.5, 'Goa Coast'),
            (16.0, 19.0, 72.5, 74.0, 'Maharashtra Coast'),
            (18.5, 20.0, 72.0, 73.5, 'Mumbai Metropolitan Coast'),
            (20.0, 24.0, 68.0, 73.0, 'Gujarat Coast'),
            (6.0, 14.0, 91.0, 95.0, 'Andaman & Nicobar Islands'),
            (8.0, 12.0, 71.0, 74.0, 'Lakshadweep Islands'),
        ]

        for lat_min, lat_max, lng_min, lng_max, name in areas:
            if lat_min <= lat <= lat_max and lng_min <= lng <= lng_max:
                return name
        return 'Indian Coastal Region'

    def predict_multiple_locations(self, locations: List[Tuple[float, float]]) -> List[Dict]:
        """Generate predictions for multiple locations."""
        hazard_types = ['tsunami', 'cyclone', 'storm_surge', 'high_tide',
                        'coastal_flood', 'rip_current', 'erosion']
        predictions = []

        for lat, lng in locations:
            sr = self._get_sea_region(lat, lng)
            if sr == 'Bay of Bengal':
                weights = [0.05, 0.30, 0.25, 0.10, 0.10, 0.12, 0.08]
            elif sr == 'Andaman Sea':
                weights = [0.15, 0.18, 0.15, 0.08, 0.07, 0.25, 0.12]
            else:
                weights = [0.02, 0.18, 0.22, 0.15, 0.15, 0.15, 0.13]

            hazard = np.random.choice(hazard_types, p=weights)
            predictions.append(self.predict_risk(lat, lng, hazard))

        return predictions


if __name__ == '__main__':
    from data_engineering import AdvancedCoastalDataEngineer

    print("\n" + "=" * 70)
    print("SeaTrace All-India ML Training Pipeline")
    print("   7 Hazard Types × 17 Features × All-India Coverage")
    print("=" * 70)

    engineer = AdvancedCoastalDataEngineer()
    df = engineer.generate_expanded_dataset(samples_per_grid=3, temporal_sampling_rate=0.15)

    predictor = EnhancedHazardPredictor()
    predictor.train(df)

    # Test predictions across ALL of India
    print("\n" + "=" * 70)
    print("[TESTING] All-India Predictions")
    print("=" * 70)

    test_locations = [
        (13.0827, 80.2707, 'Chennai'),
        (11.9416, 79.8083, 'Pondicherry'),
        (9.9312, 76.2673, 'Kochi'),
        (18.9750, 72.8258, 'Mumbai'),
        (19.8135, 85.8312, 'Puri'),
        (22.5726, 88.3639, 'Kolkata'),
        (21.1702, 72.8311, 'Surat'),
        (22.2394, 68.9678, 'Dwarka'),
        (11.6234, 92.7265, 'Port Blair'),
        (15.4909, 73.8278, 'Panaji'),
        (12.9141, 74.8560, 'Mangalore'),
        (17.6868, 83.2185, 'Visakhapatnam'),
    ]

    for lat, lng, name in test_locations:
        p = predictor.predict_risk(lat, lng, 'storm_surge')
        print(f"\n🏖️  {name} ({lat}, {lng}) — {p['seaRegion']}")
        print(f"   Risk: {p['riskScore']*100:.1f}% | Severity: {p['severity'].upper()} | Confidence: {p['confidence']*100:.1f}%")
        print(f"   Area: {p['affectedArea']}")
        print(f"   Top factors: {', '.join(f['feature'] for f in p['topContributingFactors'])}")

    print("\n" + "=" * 70)
    print("[SUCCESS] All-India Training + Testing Complete!")
    print("=" * 70)

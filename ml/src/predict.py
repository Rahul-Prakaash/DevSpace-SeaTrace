"""
Enhanced SeaTrace ML Prediction Service with Expanded Training Dataset
Uses temporal windowing, spatial gridding, and oceanographic features
"""

import numpy as np
import pandas as pd
import os
from datetime import datetime
from typing import Dict, List, Tuple
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
import pickle

class EnhancedHazardPredictor:
    """
    Advanced ML-based coastal hazard predictor trained on expanded dataset.
    Features:
    - Temporal and spatial features
    - Oceanographic conditions (SST, wave height, wind, current, tide)
    - Seasonal risk modeling
    - Intensity classification
    """
    
    def __init__(self, data_dir='data'):
        self.data_dir = data_dir
        self.risk_model = None
        self.severity_model = None
        self.intensity_model = None
        self.label_encoders = {}
        self.feature_columns = []
        self.is_trained = False
        
        # Try to load pre-trained models
        self.load_models()
    
    def train(self, training_data: pd.DataFrame):
        """
        Train prediction models on expanded dataset with oceanographic features.
        """
        print("\n" + "=" * 70)
        print("[TRAINING] Enhanced ML Models")
        print("=" * 70)
        print(f"\n[DATA] Training data shape: {training_data.shape}")
        print(f"   Features: {training_data.shape[1]}")
        print(f"   Samples: {training_data.shape[0]:,}")
        
        # Encode categorical features
        print("\n[ENCODING] Categorical features...")
        categorical_cols = ['sea_region', 'hazard_type', 'season', 'severity', 'intensity_bin']
        
        for col in categorical_cols:
            if col in training_data.columns:
                self.label_encoders[col] = LabelEncoder()
                training_data[f'{col}_encoded'] = self.label_encoders[col].fit_transform(
                    training_data[col]
                )
        
        # Define feature set
        self.feature_columns = [
            # Spatial features
            'lat', 'lng',
            
            # Temporal features  
            'month', 'day_of_year',
            'is_monsoon', 'is_cyclone_season',
            
            # Oceanographic features
            'sst_celsius', 'wave_height_m', 'wind_speed_kmh',
            'current_velocity_ms', 'tide_level_m',
            
            # Encoded categoricals
            'sea_region_encoded', 'hazard_type_encoded', 'season_encoded',
        ]
        
        # Prepare X and y
        X = training_data[self.feature_columns].values
        y_risk = training_data['risk_score'].values
        y_severity = training_data['severity_encoded'].values
        y_intensity = training_data['intensity_bin_encoded'].values
        
        print(f"\n[SUCCESS] Feature matrix shape: {X.shape}")
        print(f"   Features used: {len(self.feature_columns)}")
        
        # Train Risk Score Regression Model (Gradient Boosting for better performance)
        print("\n[MODEL] Training risk score model (Gradient Boosting)...")
        self.risk_model = GradientBoostingRegressor(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.1,
            subsample=0.8,
            random_state=42,
        )
        self.risk_model.fit(X, y_risk)
        risk_score = self.risk_model.score(X, y_risk)
        print(f"   [OK] Risk model R² score: {risk_score:.4f}")
        
        # Train Severity Classification Model
        print("\n[MODEL] Training severity classification model (Random Forest)...")
        self.severity_model = RandomForestClassifier(
            n_estimators=150,
            max_depth=12,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        self.severity_model.fit(X, y_severity)
        severity_score = self.severity_model.score(X, y_severity)
        print(f"   [OK] Severity model accuracy: {severity_score:.4f}")
        
        # Train Intensity Bin Classification Model
        print("\n[MODEL] Training intensity classification model (Random Forest)...")
        self.intensity_model = RandomForestClassifier(
            n_estimators=150,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.intensity_model.fit(X, y_intensity)
        intensity_score = self.intensity_model.score(X, y_intensity)
        print(f"   [OK] Intensity model accuracy: {intensity_score:.4f}")
        
        # Feature importance analysis
        print("\n[FEATURES] Top 10 Important Features (Risk Prediction):")
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.risk_model.feature_importances_
        }).sort_values('importance', ascending=False).head(10)
        
        for idx, row in feature_importance.iterrows():
            print(f"   {row['feature']:.<30} {row['importance']:.4f}")
        
        self.is_trained = True
        
        # Save models
        self.save_models()
        
        print("\n" + "=" * 70)
        print("[SUCCESS] Model Training Complete!")
        print("=" * 70)
    
    def save_models(self):
        """Save trained models to disk."""
        os.makedirs(self.data_dir, exist_ok=True)
        
        model_path = os.path.join(self.data_dir, 'trained_models_enhanced.pkl')
        with open(model_path, 'wb') as f:
            pickle.dump({
                'risk_model': self.risk_model,
                'severity_model': self.severity_model,
                'intensity_model': self.intensity_model,
                'label_encoders': self.label_encoders,
                'feature_columns': self.feature_columns,
            }, f)
        
        print(f"\n[SAVED] Models saved to {model_path}")
    
    def load_models(self):
        """Load pre-trained models from disk."""
        model_path = os.path.join(self.data_dir, 'trained_models_enhanced.pkl')
        
        if os.path.exists(model_path):
            print(f"[LOADING] Enhanced models from {model_path}")
            with open(model_path, 'rb') as f:
                data = pickle.load(f)
                self.risk_model = data['risk_model']
                self.severity_model = data['severity_model']
                self.intensity_model = data['intensity_model']
                self.label_encoders = data['label_encoders']
                self.feature_columns = data['feature_columns']
                self.is_trained = True
            print("[SUCCESS] Enhanced models loaded successfully!")
        else:
            print("[INFO] No enhanced models found. Will train on first run.")
    
    def _estimate_oceanographic_conditions(self, 
                                          lat: float, 
                                          lng: float, 
                                          hazard_type: str = 'storm_surge') -> Dict:
        """
        Estimate current oceanographic conditions for prediction.
        In production, this would fetch real-time buoy/satellite data from INCOIS.
        """
        month = datetime.now().month
        
        # Seasonal base values
        if month in [6, 7, 8, 9]:  # Monsoon
            sst = 29.0 + np.random.normal(0, 0.5)
            wave_height = 3.0 + np.random.normal(0, 0.5)
            wind_speed = 22.0 + np.random.normal(0, 4.0)
        elif month in [12, 1, 2]:  # Winter
            sst = 27.0 + np.random.normal(0, 0.3)
            wave_height = 1.5 + np.random.normal(0, 0.3)
            wind_speed = 12.0 + np.random.normal(0, 2.0)
        else:  # Summer
            sst = 30.0 + np.random.normal(0, 0.4)
            wave_height = 2.0 + np.random.normal(0, 0.4)
            wind_speed = 15.0 + np.random.normal(0, 3.0)
        
        # Regional adjustments
        if lng > 77:  # Bay of Bengal
            sst += 0.5
            wave_height += 0.2
        
        return {
            'sst_celsius': np.clip(sst, 26.0, 32.0),
            'wave_height_m': np.clip(wave_height, 0.5, 6.0),
            'wind_speed_kmh': np.clip(wind_speed, 2.0, 40.0),
            'current_velocity_ms': np.clip(0.8 + np.random.normal(0, 0.3), 0.1, 2.5),
            'tide_level_m': np.clip(1.0 + np.random.normal(0, 0.4), -0.5, 2.5),
        }
    
    def predict_risk(self, lat: float, lng: float, hazard_type: str = 'storm_surge') -> Dict:
        """
        Generate risk prediction using trained models with oceanographic features.
        """
        if not self.is_trained:
            raise ValueError("Models not trained! Run train() first or ensure trained models exist.")
        
        # Current temporal features
        now = datetime.now()
        month = now.month
        day_of_year = now.timetuple().tm_yday
        is_monsoon = 1 if month in [6, 7, 8, 9] else 0
        is_cyclone_season = 1 if month in [4, 5, 10, 11, 12] else 0
        
        # Determine season
        if month in [12, 1, 2]:
            season = 'winter'
        elif month in [3, 4, 5]:
            season = 'summer'
        elif month in [6, 7, 8, 9]:
            season = 'monsoon'
        else:
            season = 'post_monsoon'
        
        # Determine sea region
        sea_region = 'Bay of Bengal' if lng > 77 else 'Arabian Sea'
        
        # Get oceanographic conditions
        ocean_conditions = self._estimate_oceanographic_conditions(lat, lng, hazard_type)
        
        # Encode categorical features
        try:
            sea_region_encoded = self.label_encoders['sea_region'].transform([sea_region])[0]
            hazard_type_encoded = self.label_encoders['hazard_type'].transform([hazard_type])[0]
            season_encoded = self.label_encoders['season'].transform([season])[0]
        except (ValueError, KeyError):
            # Fallback if not in training data
            sea_region_encoded = 0
            hazard_type_encoded = 0
            season_encoded = 0
        
        # Prepare feature vector
        features = np.array([[
            lat, lng,
            month, day_of_year,
            is_monsoon, is_cyclone_season,
            ocean_conditions['sst_celsius'],
            ocean_conditions['wave_height_m'],
            ocean_conditions['wind_speed_kmh'],
            ocean_conditions['current_velocity_ms'],
            ocean_conditions['tide_level_m'],
            sea_region_encoded,
            hazard_type_encoded,
            season_encoded,
        ]])
        
        # Predict risk score
        risk_score = float(self.risk_model.predict(features)[0])
        risk_score = np.clip(risk_score, 0.0, 1.0)
        
        # Predict severity
        severity_encoded = self.severity_model.predict(features)[0]
        severity = self.label_encoders['severity'].inverse_transform([severity_encoded])[0]
        
        # Predict intensity bin
        intensity_encoded = self.intensity_model.predict(features)[0]
        intensity_bin = self.label_encoders['intensity_bin'].inverse_transform([intensity_encoded])[0]
        
        # Calculate confidence from severity model (RandomForest)
        # Use the maximum probability from the severity classifier as confidence
        severity_probs = self.severity_model.predict_proba(features)[0]
        confidence = float(np.max(severity_probs))
        confidence = np.clip(confidence, 0.6, 0.98)
        
        # Affected area determination
        affected_area = self._get_affected_area(lat, lng)
        
        return {
            'hazardType': hazard_type,
            'riskScore': round(float(risk_score), 3),
            'confidence': round(float(confidence), 3),
            'severity': severity,
            'intensityBin': intensity_bin,
            'affectedArea': affected_area,
            'seaRegion': sea_region,
            'season': season,
            'lat': lat,
            'lng': lng,
            'timestamp': now.isoformat(),
            'oceanographicConditions': {
                'sst': round(ocean_conditions['sst_celsius'], 2),
                'waveHeight': round(ocean_conditions['wave_height_m'], 2),
                'windSpeed': round(ocean_conditions['wind_speed_kmh'], 1),
                'currentVelocity': round(ocean_conditions['current_velocity_ms'], 2),
                'tideLevel': round(ocean_conditions['tide_level_m'], 2),
            },
            'modelVersion': 'v3.0-enhanced-oceanographic',
            'dataSource': 'INCOIS + Expanded Dataset (Temporal/Spatial)',
        }
    
    def _get_affected_area(self, lat: float, lng: float) -> str:
        """Determine affected area name based on coordinates."""
        if 12.5 <= lat <= 13.5 and 79.5 <= lng <= 80.5:
            return 'Chennai Metropolitan Area'
        elif 11.5 <= lat <= 12.5 and 79.0 <= lng <= 80.0:
            return 'Pondicherry Coast'
        elif 8.0 <= lat <= 9.5 and 76.0 <= lng <= 77.0:
            return 'Kerala Coast'
        elif 18.5 <= lat <= 19.5 and 72.5 <= lng <= 73.0:
            return 'Mumbai Coast'
        elif 19.5 <= lat <= 20.5 and 85.0 <= lng <= 86.0:
            return 'Odisha Coast'
        elif 21.5 <= lat <= 23.0 and 87.5 <= lng <= 88.5:
            return 'West Bengal Coast'
        elif 16.5 <= lat <= 18.0 and 82.5 <= lng <= 83.5:
            return 'Andhra Pradesh Coast'
        else:
            return 'Indian Coastal Region'
    
    def predict_multiple_locations(self, locations: List[Tuple[float, float]]) -> List[Dict]:
        """Generate predictions for multiple locations."""
        predictions = []
        hazard_types = ['tsunami', 'cyclone', 'storm_surge', 'high_tide', 'coastal_flood']
        
        for lat, lng in locations:
            sea_region = 'Bay of Bengal' if lng > 77 else 'Arabian Sea'
            if sea_region == 'Bay of Bengal':
                hazard = np.random.choice(hazard_types, p=[0.05, 0.35, 0.35, 0.15, 0.10])
            else:
                hazard = np.random.choice(hazard_types, p=[0.02, 0.20, 0.30, 0.25, 0.23])
            
            prediction = self.predict_risk(lat, lng, hazard)
            predictions.append(prediction)
        
        return predictions


# Example usage and testing
if __name__ == '__main__':
    from data_engineering import AdvancedCoastalDataEngineer
    
    print("\n" + "=" * 70)
    print("SeaTrace Enhanced ML Training Pipeline")
    print("   Temporal Windowing + Spatial Gridding + Oceanographic Features")
    print("=" * 70)
    
    # Generate expanded dataset
    engineer = AdvancedCoastalDataEngineer()
    df = engineer.generate_expanded_dataset(
        samples_per_grid=3,
        temporal_sampling_rate=0.15
    )
    
    # Train enhanced model
    print("\n")
    predictor = EnhancedHazardPredictor()
    predictor.train(df)
    
    # Test predictions
    print("\n" + "=" * 70)
    print("[TESTING] Enhanced Predictions")
    print("=" * 70)
    
    test_locations = [
        (13.0827, 80.2707, 'Chennai'),
        (11.9416, 79.8083, 'Pondicherry'),
        (9.9312, 76.2673, 'Kochi'),
        (18.9750, 72.8258, 'Mumbai'),
        (19.8135, 85.8312, 'Puri'),
    ]
    
    for lat, lng, name in test_locations:
        prediction = predictor.predict_risk(lat, lng, 'storm_surge')
        print(f"\n[LOCATION] {name} ({lat}, {lng})")
        print(f"   Risk Score: {prediction['riskScore']} ({prediction['riskScore']*100:.1f}%)")
        print(f"   Severity: {prediction['severity'].upper()}")
        print(f"   Intensity: {prediction['intensityBin']}")
        print(f"   Confidence: {prediction['confidence']} ({prediction['confidence']*100:.1f}%)")
        print(f"   Season: {prediction['season']}")
        print(f"   Oceanographic:")
        print(f"      SST: {prediction['oceanographicConditions']['sst']}°C")
        print(f"      Wave Height: {prediction['oceanographicConditions']['waveHeight']}m")
        print(f"      Wind Speed: {prediction['oceanographicConditions']['windSpeed']}km/h")
    
    print("\n" + "=" * 70)
    print("[SUCCESS] Enhanced Training and Testing Complete!")
    print("=" * 70)

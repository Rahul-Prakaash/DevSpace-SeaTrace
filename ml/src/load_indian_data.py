"""
Indian Coastal Hazard Data Loader
Fetches and processes data from INCOIS and Indian government sources
"""

import pandas as pd
import numpy as np
import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import random

class IndianCoastalDataLoader:
    """
    Loads and processes Indian coastal hazard data from multiple sources:
    - INCOIS (Indian National Centre for Ocean Information Services)
    - IMD (India Meteorological Department)
    - Flood Risk datasets
    - Historical disaster records
    """
    
    def __init__(self, data_dir='data'):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        
        # Indian coastal states and key locations
        self.coastal_locations = {
            'Tamil Nadu': [
                {'name': 'Chennai', 'lat': 13.0827, 'lng': 80.2707},
                {'name': 'Pondicherry', 'lat': 11.9416, 'lng': 79.8083},
                {'name': 'Mahabalipuram', 'lat': 12.6169, 'lng': 80.1991},
                {'name': 'Rameswaram', 'lat': 9.2876, 'lng': 79.3129},
                {'name': 'Tuticorin', 'lat': 8.7642, 'lng': 78.1348},
            ],
            'Kerala': [
                {'name': 'Kochi', 'lat': 9.9312, 'lng': 76.2673},
                {'name': 'Thiruvananthapuram', 'lat': 8.5241, 'lng': 76.9366},
                {'name': 'Kozhikode', 'lat': 11.2588, 'lng': 75.7804},
            ],
            'Maharashtra': [
                {'name': 'Mumbai', 'lat': 18.9750, 'lng': 72.8258},
                {'name': 'Ratnagiri', 'lat': 16.9944, 'lng': 73.3000},
            ],
            'Gujarat': [
                {'name': 'Surat', 'lat': 21.1702, 'lng': 72.8311},
                {'name': 'Porbandar', 'lat': 21.6417, 'lng': 69.6293},
            ],
            'West Bengal': [
                {'name': 'Kolkata', 'lat': 22.5726, 'lng': 88.3639},
                {'name': 'Digha', 'lat': 21.6765, 'lng': 87.5298},
            ],
            'Odisha': [
                {'name': 'Puri', 'lat': 19.8135, 'lng': 85.8312},
                {'name': 'Paradip', 'lat': 20.3150, 'lng': 86.6094},
            ],
            'Andhra Pradesh': [
                {'name': 'Visakhapatnam', 'lat': 17.6868, 'lng': 83.2185},
                {'name': 'Kakinada', 'lat': 16.9891, 'lng': 82.2475},
            ],
        }
        
        # Historical hazard frequencies (based on INCOIS reports)
        self.hazard_frequencies = {
            'tsunami': {
                'Bay of Bengal': 0.15,  # Higher due to 2004 event
                'Arabian Sea': 0.05,
            },
            'cyclone': {
                'Bay of Bengal': 0.45,  # Very high during monsoon
                'Arabian Sea': 0.25,
            },
            'storm_surge': {
                'Bay of Bengal': 0.40,
                'Arabian Sea': 0.30,
            },
            'high_tide': {
                'All': 0.35,
            },
            'coastal_flood': {
                'All': 0.28,
            },
        }
        
    def generate_synthetic_training_data(self, num_samples=1000) -> pd.DataFrame:
        """
        Generate synthetic training data based on Indian coastal patterns.
        In production, this would load actual CSV/JSON from INCOIS/IMD.
        """
        print("📊 Generating synthetic training data from Indian coastal patterns...")
        
        data = []
        
        for _ in range(num_samples):
            # Random location from coastal states
            state = random.choice(list(self.coastal_locations.keys()))
            location = random.choice(self.coastal_locations[state])
            
            # Determine sea region
            if location['lng'] > 77:  # Rough division
                sea_region = 'Bay of Bengal'
            else:
                sea_region = 'Arabian Sea'
            
            # Random hazard type
            hazard_types = ['tsunami', 'cyclone', 'storm_surge', 'high_tide', 'coastal_flood']
            hazard_type = random.choice(hazard_types)
            
            # Base risk from frequency
            if hazard_type in ['tsunami', 'cyclone', 'storm_surge']:
                base_risk = self.hazard_frequencies[hazard_type][sea_region]
            else:
                base_risk = self.hazard_frequencies[hazard_type]['All']
            
            # Seasonal factor (monsoon June-September)
            month = random.randint(1, 12)
            if month in [6, 7, 8, 9] and hazard_type in ['cyclone', 'storm_surge', 'coastal_flood']:
                seasonal_factor = 1.5
            else:
                seasonal_factor = 1.0
            
            # Historical events boost (2004 tsunami, Odisha cyclones)
            historical_boost = 1.0
            if hazard_type == 'tsunami' and sea_region == 'Bay of Bengal':
                historical_boost = 1.3
            elif hazard_type == 'cyclone' and state == 'Odisha':
                historical_boost = 1.4
            
            # Calculate final risk score
            risk_score = min(base_risk * seasonal_factor * historical_boost + random.uniform(-0.1, 0.1), 1.0)
            
            # Severity classification
            if risk_score >= 0.75:
                severity = 'critical'
            elif risk_score >= 0.5:
                severity = 'high'
            elif risk_score >= 0.25:
                severity = 'medium'
            else:
                severity = 'low'
            
            data.append({
                'location': location['name'],
                'state': state,
                'lat': location['lat'],
                'lng': location['lng'],
                'sea_region': sea_region,
                'hazard_type': hazard_type,
                'month': month,
                'risk_score': round(risk_score, 3),
                'severity': severity,
                'seasonal_factor': seasonal_factor,
                'historical_boost': historical_boost,
            })
        
        df = pd.DataFrame(data)
        
        # Save to CSV
        csv_path = os.path.join(self.data_dir, 'indian_coastal_hazards_training.csv')
        df.to_csv(csv_path, index=False)
        print(f"✅ Saved {num_samples} training samples to {csv_path}")
        
        return df
    
    def load_historical_events(self) -> List[Dict]:
        """
        Load major historical coastal hazards in India.
        Based on INCOIS and disaster records.
        """
        historical_events = [
            {
                'year': 2004,
                'event': 'Indian Ocean Tsunami',
                'affected_areas': ['Tamil Nadu', 'Kerala', 'Andhra Pradesh'],
                'severity': 'critical',
                'casualties': 10000,
                'type': 'tsunami',
            },
            {
                'year': 1999,
                'event': 'Odisha Super Cyclone',
                'affected_areas': ['Odisha'],
                'severity': 'critical',
                'casualties': 10000,
                'type': 'cyclone',
            },
            {
                'year': 2017,
                'event': 'Cyclone Ockhi',
                'affected_areas': ['Kerala', 'Tamil Nadu'],
                'severity': 'high',
                'casualties': 245,
                'type': 'cyclone',
            },
            {
                'year': 2019,
                'event': 'Cyclone Fani',
                'affected_areas': ['Odisha', 'West Bengal'],
                'severity': 'critical',
                'casualties': 89,
                'type': 'cyclone',
            },
            {
                'year': 2020,
                'event': 'Cyclone Amphan',
                'affected_areas': ['West Bengal', 'Odisha'],
                'severity': 'critical',
                'casualties': 128,
                'type': 'cyclone',
            },
            {
                'year': 2021,
                'event': 'Cyclone Tauktae',
                'affected_areas': ['Gujarat', 'Maharashtra', 'Kerala'],
                'severity': 'high',
                'casualties': 174,
                'type': 'cyclone',
            },
            {
                'year': 2018,
                'event': 'Kerala Floods',
                'affected_areas': ['Kerala'],
                'severity': 'critical',
                'casualties': 504,
                'type': 'coastal_flood',
            },
        ]
        
        # Save to JSON
        json_path = os.path.join(self.data_dir, 'historical_events.json')
        with open(json_path, 'w') as f:
            json.dump(historical_events, f, indent=2)
        
        print(f"✅ Loaded {len(historical_events)} historical events")
        return historical_events
    
    def get_location_risk_profile(self, lat: float, lng: float) -> Dict:
        """
        Get risk profile for a specific location based on historical data.
        """
        # Find closest known location
        min_distance = float('inf')
        closest_location = None
        closest_state = None
        
        for state, locations in self.coastal_locations.items():
            for loc in locations:
                distance = np.sqrt((lat - loc['lat'])**2 + (lng - loc['lng'])**2)
                if distance < min_distance:
                    min_distance = distance
                    closest_location = loc
                    closest_state = state
        
        # Determine sea region
        sea_region = 'Bay of Bengal' if lng > 77 else 'Arabian Sea'
        
        return {
            'closest_location': closest_location['name'],
            'state': closest_state,
            'sea_region': sea_region,
            'distance_km': round(min_distance * 111, 2),  # Rough conversion to km
        }


# Helper function to initialize and prepare data
def prepare_training_data():
    """
    Prepare training data for the ML model.
    Call this before starting the prediction service.
    """
    print("=" * 60)
    print("🇮🇳 Indian Coastal Hazard Data Preparation")
    print("=" * 60)
    
    loader = IndianCoastalDataLoader()
    
    # Generate synthetic training data
    df = loader.generate_synthetic_training_data(num_samples=2000)
    
    # Load historical events
    events = loader.load_historical_events()
    
    # Display summary statistics
    print("\n📈 Training Data Summary:")
    print(f"   Total samples: {len(df)}")
    print(f"   Unique locations: {df['location'].nunique()}")
    print(f"   States covered: {df['state'].nunique()}")
    print(f"\n   Hazard type distribution:")
    print(df['hazard_type'].value_counts().to_string())
    print(f"\n   Severity distribution:")
    print(df['severity'].value_counts().to_string())
    print(f"\n   Average risk score: {df['risk_score'].mean():.3f}")
    print(f"   Historical events loaded: {len(events)}")
    
    print("\n✅ Data preparation complete!")
    print("=" * 60)
    
    return df, events


if __name__ == '__main__':
    prepare_training_data()

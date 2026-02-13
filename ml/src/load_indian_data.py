"""
Indian Coastal Hazard Data Loader — All-India Coverage
Covers the entire Indian coastline: Gujarat to West Bengal (east coast)
and Gujarat to Kerala (west coast), including island territories.
Data patterns calibrated from INCOIS, IMD, and NDMA records.
"""

import pandas as pd
import numpy as np
import os
import json
from datetime import datetime, timedelta
from typing import Dict, List
import random

class IndianCoastalDataLoader:
    """
    All-India coastal hazard data loader.
    Sources modeled: INCOIS, IMD, Geological Survey of India, NDMA.
    """

    def __init__(self, data_dir='data'):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)

        # Comprehensive coastal locations across ALL Indian coastal states + UTs
        self.coastal_locations = {
            # ─── East Coast (Bay of Bengal) ───
            'West Bengal': [
                {'name': 'Kolkata', 'lat': 22.5726, 'lng': 88.3639},
                {'name': 'Digha', 'lat': 21.6765, 'lng': 87.5298},
                {'name': 'Haldia', 'lat': 22.0667, 'lng': 88.0698},
                {'name': 'Sagar Island', 'lat': 21.6500, 'lng': 88.0500},
                {'name': 'Bakkhali', 'lat': 21.5600, 'lng': 88.2500},
            ],
            'Odisha': [
                {'name': 'Puri', 'lat': 19.8135, 'lng': 85.8312},
                {'name': 'Paradip', 'lat': 20.3150, 'lng': 86.6094},
                {'name': 'Gopalpur', 'lat': 19.2590, 'lng': 84.9018},
                {'name': 'Chandipur', 'lat': 21.4650, 'lng': 87.0150},
                {'name': 'Konark', 'lat': 19.8876, 'lng': 86.0945},
                {'name': 'Chilika Lake Coast', 'lat': 19.7000, 'lng': 85.3200},
            ],
            'Andhra Pradesh': [
                {'name': 'Visakhapatnam', 'lat': 17.6868, 'lng': 83.2185},
                {'name': 'Kakinada', 'lat': 16.9891, 'lng': 82.2475},
                {'name': 'Machilipatnam', 'lat': 16.1875, 'lng': 81.1389},
                {'name': 'Nellore', 'lat': 14.4426, 'lng': 79.9865},
                {'name': 'Srikakulam Coast', 'lat': 18.2949, 'lng': 83.8938},
                {'name': 'Krishnapatnam', 'lat': 14.2500, 'lng': 80.1300},
            ],
            'Tamil Nadu': [
                {'name': 'Chennai', 'lat': 13.0827, 'lng': 80.2707},
                {'name': 'Pondicherry', 'lat': 11.9416, 'lng': 79.8083},
                {'name': 'Mahabalipuram', 'lat': 12.6169, 'lng': 80.1991},
                {'name': 'Rameswaram', 'lat': 9.2876, 'lng': 79.3129},
                {'name': 'Tuticorin', 'lat': 8.7642, 'lng': 78.1348},
                {'name': 'Nagapattinam', 'lat': 10.7672, 'lng': 79.8449},
                {'name': 'Cuddalore', 'lat': 11.7480, 'lng': 79.7714},
                {'name': 'Kanyakumari', 'lat': 8.0883, 'lng': 77.5385},
                {'name': 'Karaikal', 'lat': 10.9254, 'lng': 79.8380},
                {'name': 'Velankanni', 'lat': 10.6800, 'lng': 79.8500},
            ],
            # ─── West Coast (Arabian Sea) ───
            'Kerala': [
                {'name': 'Kochi', 'lat': 9.9312, 'lng': 76.2673},
                {'name': 'Thiruvananthapuram', 'lat': 8.5241, 'lng': 76.9366},
                {'name': 'Kozhikode', 'lat': 11.2588, 'lng': 75.7804},
                {'name': 'Alappuzha', 'lat': 9.4981, 'lng': 76.3388},
                {'name': 'Kollam', 'lat': 8.8932, 'lng': 76.6141},
                {'name': 'Kannur', 'lat': 11.8745, 'lng': 75.3704},
                {'name': 'Kasaragod', 'lat': 12.4996, 'lng': 74.9869},
                {'name': 'Beypore', 'lat': 11.1700, 'lng': 75.8100},
            ],
            'Karnataka': [
                {'name': 'Mangalore', 'lat': 12.9141, 'lng': 74.8560},
                {'name': 'Udupi', 'lat': 13.3409, 'lng': 74.7421},
                {'name': 'Karwar', 'lat': 14.8024, 'lng': 74.1240},
                {'name': 'Malpe', 'lat': 13.3500, 'lng': 74.7000},
                {'name': 'Bhatkal', 'lat': 13.9700, 'lng': 74.5600},
            ],
            'Goa': [
                {'name': 'Panaji', 'lat': 15.4909, 'lng': 73.8278},
                {'name': 'Vasco da Gama', 'lat': 15.3982, 'lng': 73.8113},
                {'name': 'Calangute', 'lat': 15.5449, 'lng': 73.7550},
                {'name': 'Palolem', 'lat': 15.0100, 'lng': 74.0230},
            ],
            'Maharashtra': [
                {'name': 'Mumbai', 'lat': 18.9750, 'lng': 72.8258},
                {'name': 'Ratnagiri', 'lat': 16.9944, 'lng': 73.3000},
                {'name': 'Sindhudurg', 'lat': 16.3500, 'lng': 73.5500},
                {'name': 'Alibag', 'lat': 18.6414, 'lng': 72.8727},
                {'name': 'Dahanu', 'lat': 19.9663, 'lng': 72.7111},
                {'name': 'Ganpatipule', 'lat': 17.1450, 'lng': 73.2660},
            ],
            'Gujarat': [
                {'name': 'Surat', 'lat': 21.1702, 'lng': 72.8311},
                {'name': 'Porbandar', 'lat': 21.6417, 'lng': 69.6293},
                {'name': 'Dwarka', 'lat': 22.2394, 'lng': 68.9678},
                {'name': 'Mandvi', 'lat': 22.8326, 'lng': 69.3510},
                {'name': 'Veraval', 'lat': 20.9000, 'lng': 70.3667},
                {'name': 'Okha', 'lat': 22.4670, 'lng': 69.0710},
                {'name': 'Diu', 'lat': 20.7144, 'lng': 70.9874},
                {'name': 'Bhavnagar', 'lat': 21.7645, 'lng': 72.1519},
                {'name': 'Jamnagar', 'lat': 22.4707, 'lng': 70.0577},
            ],
            # ─── Island Territories ───
            'Andaman & Nicobar': [
                {'name': 'Port Blair', 'lat': 11.6234, 'lng': 92.7265},
                {'name': 'Car Nicobar', 'lat': 9.1538, 'lng': 92.8198},
                {'name': 'Havelock Island', 'lat': 12.0170, 'lng': 93.0040},
                {'name': 'Campbell Bay', 'lat': 7.0000, 'lng': 93.9300},
            ],
            'Lakshadweep': [
                {'name': 'Kavaratti', 'lat': 10.5593, 'lng': 72.6358},
                {'name': 'Minicoy', 'lat': 8.2742, 'lng': 73.0466},
                {'name': 'Agatti', 'lat': 10.8565, 'lng': 72.1760},
            ],
        }

        # All-India hazard type frequencies (based on NDMA/INCOIS records)
        self.hazard_frequencies = {
            'tsunami': {'Bay of Bengal': 0.12, 'Arabian Sea': 0.04, 'Andaman Sea': 0.25},
            'cyclone': {'Bay of Bengal': 0.45, 'Arabian Sea': 0.25, 'Andaman Sea': 0.30},
            'storm_surge': {'Bay of Bengal': 0.40, 'Arabian Sea': 0.30, 'Andaman Sea': 0.20},
            'high_tide': {'Bay of Bengal': 0.30, 'Arabian Sea': 0.35, 'Andaman Sea': 0.15},
            'coastal_flood': {'Bay of Bengal': 0.28, 'Arabian Sea': 0.32, 'Andaman Sea': 0.10},
            'rip_current': {'Bay of Bengal': 0.35, 'Arabian Sea': 0.25, 'Andaman Sea': 0.40},
            'erosion': {'Bay of Bengal': 0.30, 'Arabian Sea': 0.28, 'Andaman Sea': 0.15},
        }

    def _get_sea_region(self, lat: float, lng: float) -> str:
        """Determine sea region from coordinates."""
        if lng > 90:
            return 'Andaman Sea'
        elif lng > 77:
            return 'Bay of Bengal'
        else:
            return 'Arabian Sea'

    def generate_synthetic_training_data(self, num_samples=5000) -> pd.DataFrame:
        """
        Generate expanded synthetic training data covering ALL Indian coastal states.
        Calibrated from INCOIS, IMD, and NDMA historical patterns.
        """
        print("📊 Generating all-India synthetic training data...")

        data = []
        hazard_types = ['tsunami', 'cyclone', 'storm_surge', 'high_tide',
                        'coastal_flood', 'rip_current', 'erosion']

        all_locations = []
        for state, locs in self.coastal_locations.items():
            for loc in locs:
                all_locations.append({**loc, 'state': state})

        for _ in range(num_samples):
            loc = random.choice(all_locations)
            sea_region = self._get_sea_region(loc['lat'], loc['lng'])

            # Weighted hazard selection by region
            if sea_region == 'Bay of Bengal':
                weights = [0.05, 0.30, 0.25, 0.10, 0.10, 0.12, 0.08]
            elif sea_region == 'Andaman Sea':
                weights = [0.15, 0.20, 0.15, 0.08, 0.07, 0.25, 0.10]
            else:  # Arabian Sea
                weights = [0.02, 0.18, 0.22, 0.15, 0.15, 0.15, 0.13]

            hazard_type = np.random.choice(hazard_types, p=weights)

            # Base risk from frequency table
            freq_table = self.hazard_frequencies.get(hazard_type, {})
            base_risk = freq_table.get(sea_region, freq_table.get('Bay of Bengal', 0.2))

            # Seasonal factor
            month = random.randint(1, 12)
            seasonal_factor = 1.0
            if month in [6, 7, 8, 9] and hazard_type in ['cyclone', 'storm_surge', 'coastal_flood']:
                seasonal_factor = 1.6
            elif month in [10, 11, 12] and hazard_type == 'cyclone' and sea_region == 'Bay of Bengal':
                seasonal_factor = 1.8  # Post-monsoon cyclone season in BoB
            elif month in [5, 6] and hazard_type == 'cyclone' and sea_region == 'Arabian Sea':
                seasonal_factor = 1.5  # Pre-monsoon Arabian Sea cyclones
            elif hazard_type == 'rip_current' and month in [4, 5, 6]:
                seasonal_factor = 1.4  # Pre-monsoon rip currents
            elif hazard_type == 'erosion':
                seasonal_factor = 1.0 + (0.3 if month in [6, 7, 8, 9] else 0.0)

            # Historical boost for known disaster-prone areas
            historical_boost = 1.0
            if hazard_type == 'tsunami' and sea_region in ['Bay of Bengal', 'Andaman Sea']:
                historical_boost = 1.3
            elif hazard_type == 'cyclone' and loc['state'] == 'Odisha':
                historical_boost = 1.5
            elif hazard_type == 'cyclone' and loc['state'] == 'Andhra Pradesh':
                historical_boost = 1.3
            elif hazard_type == 'cyclone' and loc['state'] == 'West Bengal':
                historical_boost = 1.4
            elif hazard_type == 'coastal_flood' and loc['state'] == 'Kerala':
                historical_boost = 1.4
            elif hazard_type == 'coastal_flood' and loc['name'] == 'Mumbai':
                historical_boost = 1.5
            elif hazard_type == 'storm_surge' and loc['state'] == 'Gujarat':
                historical_boost = 1.3
            elif hazard_type == 'erosion' and loc['state'] in ['Kerala', 'West Bengal']:
                historical_boost = 1.4
            elif hazard_type == 'rip_current' and loc['state'] in ['Goa', 'Kerala']:
                historical_boost = 1.3

            # Bathymetry proxy (shallow vs deep shelf)
            if loc['state'] in ['Gujarat', 'West Bengal']:
                bathymetry_depth = random.uniform(5, 30)  # Shallow continental shelf
            elif loc['state'] in ['Andaman & Nicobar']:
                bathymetry_depth = random.uniform(50, 200)  # Deep shelf
            else:
                bathymetry_depth = random.uniform(15, 80)

            # Coastal slope (steeper = higher wave impact)
            coastal_slope = random.uniform(0.5, 5.0)  # degrees
            if hazard_type in ['erosion', 'rip_current']:
                coastal_slope *= 1.3

            # Tidal range
            if loc['state'] == 'Gujarat':
                tidal_range = random.uniform(6.0, 11.0)  # Huge tides (Gulf of Khambhat)
            elif loc['state'] in ['West Bengal']:
                tidal_range = random.uniform(3.0, 6.0)  # Moderate-high
            else:
                tidal_range = random.uniform(0.5, 2.5)  # Typical

            # Final risk calculation
            risk_score = min(
                base_risk * seasonal_factor * historical_boost +
                random.uniform(-0.08, 0.08) +
                (bathymetry_depth < 20) * 0.05 +  # Shallow water boost
                (coastal_slope > 3) * 0.03,  # Steep coast boost
                1.0
            )
            risk_score = max(risk_score, 0.01)

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
                'location': loc['name'],
                'state': loc['state'],
                'lat': loc['lat'] + random.uniform(-0.05, 0.05),
                'lng': loc['lng'] + random.uniform(-0.05, 0.05),
                'sea_region': sea_region,
                'hazard_type': hazard_type,
                'month': month,
                'risk_score': round(risk_score, 4),
                'severity': severity,
                'seasonal_factor': round(seasonal_factor, 2),
                'historical_boost': round(historical_boost, 2),
                'bathymetry_depth_m': round(bathymetry_depth, 1),
                'coastal_slope_deg': round(coastal_slope, 2),
                'tidal_range_m': round(tidal_range, 2),
            })

        df = pd.DataFrame(data)

        csv_path = os.path.join(self.data_dir, 'indian_coastal_hazards_training.csv')
        df.to_csv(csv_path, index=False)

        print(f"✅ Generated {num_samples:,} all-India training samples")
        print(f"   States covered: {df['state'].nunique()}")
        print(f"   Locations: {df['location'].nunique()}")
        print(f"   Sea regions: {df['sea_region'].unique().tolist()}")
        print(f"   Hazard types: {df['hazard_type'].nunique()}")
        print(f"   Saved to: {csv_path}")

        return df

    def load_historical_events(self) -> List[Dict]:
        """
        Comprehensive historical coastal hazard events across India.
        Based on INCOIS, IMD, and NDMA records.
        """
        historical_events = [
            # ─── Tsunamis ───
            {'year': 2004, 'event': 'Indian Ocean Tsunami', 'type': 'tsunami',
             'affected_areas': ['Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Andaman & Nicobar'],
             'severity': 'critical', 'casualties': 10749, 'wave_height_m': 10.0},

            # ─── Cyclones (Bay of Bengal) ───
            {'year': 1999, 'event': 'Odisha Super Cyclone', 'type': 'cyclone',
             'affected_areas': ['Odisha'], 'severity': 'critical', 'casualties': 9887, 'wind_speed_kmh': 260},
            {'year': 2013, 'event': 'Cyclone Phailin', 'type': 'cyclone',
             'affected_areas': ['Odisha', 'Andhra Pradesh'], 'severity': 'high', 'casualties': 45, 'wind_speed_kmh': 215},
            {'year': 2014, 'event': 'Cyclone Hudhud', 'type': 'cyclone',
             'affected_areas': ['Andhra Pradesh'], 'severity': 'critical', 'casualties': 124, 'wind_speed_kmh': 195},
            {'year': 2017, 'event': 'Cyclone Ockhi', 'type': 'cyclone',
             'affected_areas': ['Kerala', 'Tamil Nadu', 'Lakshadweep'], 'severity': 'high', 'casualties': 245, 'wind_speed_kmh': 155},
            {'year': 2018, 'event': 'Cyclone Gaja', 'type': 'cyclone',
             'affected_areas': ['Tamil Nadu'], 'severity': 'high', 'casualties': 45, 'wind_speed_kmh': 120},
            {'year': 2019, 'event': 'Cyclone Fani', 'type': 'cyclone',
             'affected_areas': ['Odisha', 'West Bengal'], 'severity': 'critical', 'casualties': 89, 'wind_speed_kmh': 215},
            {'year': 2020, 'event': 'Cyclone Amphan', 'type': 'cyclone',
             'affected_areas': ['West Bengal', 'Odisha'], 'severity': 'critical', 'casualties': 128, 'wind_speed_kmh': 240},
            {'year': 2020, 'event': 'Cyclone Nisarga', 'type': 'cyclone',
             'affected_areas': ['Maharashtra', 'Gujarat'], 'severity': 'high', 'casualties': 6, 'wind_speed_kmh': 120},
            {'year': 2021, 'event': 'Cyclone Yaas', 'type': 'cyclone',
             'affected_areas': ['Odisha', 'West Bengal'], 'severity': 'high', 'casualties': 20, 'wind_speed_kmh': 140},
            {'year': 2023, 'event': 'Cyclone Biparjoy', 'type': 'cyclone',
             'affected_areas': ['Gujarat'], 'severity': 'high', 'casualties': 2, 'wind_speed_kmh': 150},
            {'year': 2023, 'event': 'Cyclone Michaung', 'type': 'cyclone',
             'affected_areas': ['Tamil Nadu', 'Andhra Pradesh'], 'severity': 'high', 'casualties': 17, 'wind_speed_kmh': 100},
            {'year': 2024, 'event': 'Cyclone Remal', 'type': 'cyclone',
             'affected_areas': ['West Bengal'], 'severity': 'high', 'casualties': 45, 'wind_speed_kmh': 135},

            # ─── Cyclones (Arabian Sea) ───
            {'year': 2021, 'event': 'Cyclone Tauktae', 'type': 'cyclone',
             'affected_areas': ['Gujarat', 'Maharashtra', 'Goa', 'Kerala', 'Karnataka'],
             'severity': 'critical', 'casualties': 174, 'wind_speed_kmh': 185},
            {'year': 2019, 'event': 'Cyclone Vayu', 'type': 'cyclone',
             'affected_areas': ['Gujarat'], 'severity': 'high', 'casualties': 8, 'wind_speed_kmh': 145},

            # ─── Coastal Floods ───
            {'year': 2018, 'event': 'Kerala Floods', 'type': 'coastal_flood',
             'affected_areas': ['Kerala'], 'severity': 'critical', 'casualties': 504, 'rainfall_mm': 2346},
            {'year': 2005, 'event': 'Mumbai Floods', 'type': 'coastal_flood',
             'affected_areas': ['Maharashtra'], 'severity': 'critical', 'casualties': 1094, 'rainfall_mm': 944},
            {'year': 2015, 'event': 'Chennai Floods', 'type': 'coastal_flood',
             'affected_areas': ['Tamil Nadu'], 'severity': 'critical', 'casualties': 269, 'rainfall_mm': 1049},
            {'year': 2020, 'event': 'Hyderabad Floods', 'type': 'coastal_flood',
             'affected_areas': ['Andhra Pradesh'], 'severity': 'high', 'casualties': 74, 'rainfall_mm': 320},

            # ─── Storm Surges ───
            {'year': 2020, 'event': 'Amphan Storm Surge', 'type': 'storm_surge',
             'affected_areas': ['West Bengal'], 'severity': 'critical', 'surge_height_m': 5.0},
            {'year': 1999, 'event': 'Odisha Super Cyclone Surge', 'type': 'storm_surge',
             'affected_areas': ['Odisha'], 'severity': 'critical', 'surge_height_m': 7.0},
            {'year': 2023, 'event': 'Biparjoy Storm Surge', 'type': 'storm_surge',
             'affected_areas': ['Gujarat'], 'severity': 'high', 'surge_height_m': 2.5},

            # ─── Erosion ───
            {'year': 2022, 'event': 'Kerala Coastal Erosion', 'type': 'erosion',
             'affected_areas': ['Kerala'], 'severity': 'medium', 'erosion_rate_m_per_year': 3.5},
            {'year': 2021, 'event': 'Sundarbans Erosion', 'type': 'erosion',
             'affected_areas': ['West Bengal'], 'severity': 'high', 'erosion_rate_m_per_year': 5.0},
        ]

        json_path = os.path.join(self.data_dir, 'historical_events.json')
        with open(json_path, 'w') as f:
            json.dump(historical_events, f, indent=2, default=str)

        print(f"✅ Loaded {len(historical_events)} historical events across India")
        return historical_events

    def get_location_risk_profile(self, lat: float, lng: float) -> Dict:
        """Get risk profile for any location along the Indian coast."""
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

        sea_region = self._get_sea_region(lng, lat)

        return {
            'closest_location': closest_location['name'],
            'state': closest_state,
            'sea_region': sea_region,
            'distance_km': round(min_distance * 111, 2),
        }


def prepare_training_data():
    """Full all-India training data preparation pipeline."""
    print("=" * 60)
    print("🇮🇳 All-India Coastal Hazard Data Preparation")
    print("=" * 60)

    loader = IndianCoastalDataLoader()
    df = loader.generate_synthetic_training_data(num_samples=5000)
    events = loader.load_historical_events()

    print("\n📈 Training Data Summary:")
    print(f"   Total samples: {len(df):,}")
    print(f"   Unique locations: {df['location'].nunique()}")
    print(f"   States covered: {df['state'].nunique()}")
    print(f"\n   Hazard type distribution:")
    print(df['hazard_type'].value_counts().to_string())
    print(f"\n   Sea region distribution:")
    print(df['sea_region'].value_counts().to_string())
    print(f"\n   Severity distribution:")
    print(df['severity'].value_counts().to_string())
    print(f"\n   Average risk score: {df['risk_score'].mean():.3f}")
    print(f"   Historical events loaded: {len(events)}")

    print("\n✅ All-India data preparation complete!")
    print("=" * 60)

    return df, events


if __name__ == '__main__':
    prepare_training_data()

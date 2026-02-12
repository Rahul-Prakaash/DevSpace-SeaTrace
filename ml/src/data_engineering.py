"""
Advanced Data Engineering for Indian Coastal Hazard Training
Implements temporal windowing, spatial gridding, and oceanographic feature integration
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import random
from itertools import product

class AdvancedCoastalDataEngineer:
    """
    Enhanced data engineering for coastal hazard ML training.
    Implements:
    - Temporal windowing (hourly/daily time slices)
    - Spatial gridding (coastal grid cells)
    - Oceanographic feature integration (SST, wave height, wind speed)
    - Derived labels (intensity bins, seasonal risk)
    """
    
    def __init__(self):
        # Define coastal grid cells (lat, lng boundaries)
        self.grid_cells = self._create_spatial_grid()
        
        # Temporal windows (simulate 365 days x 24 hours)
        self.temporal_windows = self._create_temporal_windows()
        
        # Oceanographic feature ranges (based on INCOIS data patterns)
        self.oceanographic_ranges = {
            'sst': (26.0, 32.0),  # Sea Surface Temperature (°C)
            'wave_height': (0.5, 6.0),  # Significant Wave Height (m)
            'wind_speed': (2.0, 40.0),  # Wind Speed (km/h)
            'current_velocity': (0.1, 2.5),  # Ocean Current (m/s)
            'tide_level': (-0.5, 2.5),  # Tide Level relative to mean (m)
        }
        
        # Hazard intensity binning
        self.intensity_bins = {
            'very_low': (0.0, 0.2),
            'low': (0.2, 0.4),
            'moderate': (0.4, 0.6),
            'high': (0.6, 0.8),
            'very_high': (0.8, 1.0),
        }
        
    def _create_spatial_grid(self) -> List[Dict]:
        """
        Create spatial grid cells covering Indian coast.
        Each cell is ~50km x 50km (~0.5 degrees)
        """
        grid_cells = []
        
        # East Coast (Bay of Bengal) - Tamil Nadu to West Bengal
        east_coast_lat = np.arange(8.0, 22.5, 0.5)  # ~29 cells
        east_coast_lng = np.arange(77.0, 90.0, 0.5)  # ~26 cells
        
        # West Coast (Arabian Sea) - Kerala to Gujarat
        west_coast_lat = np.arange(8.0, 23.0, 0.5)  # ~30 cells
        west_coast_lng = np.arange(68.0, 77.0, 0.5)  # ~18 cells
        
        cell_id = 0
        for lat, lng in product(east_coast_lat, east_coast_lng):
            if lng > 77:  # Bay of Bengal cells
                grid_cells.append({
                    'cell_id': f'BOB_{cell_id:04d}',
                    'lat_center': lat,
                    'lng_center': lng,
                    'lat_min': lat - 0.25,
                    'lat_max': lat + 0.25,
                    'lng_min': lng - 0.25,
                    'lng_max': lng + 0.25,
                    'sea_region': 'Bay of Bengal',
                })
                cell_id += 1
        
        cell_id = 0
        for lat, lng in product(west_coast_lat, west_coast_lng):
            if lng < 77:  # Arabian Sea cells
                grid_cells.append({
                    'cell_id': f'AS_{cell_id:04d}',
                    'lat_center': lat,
                    'lng_center': lng,
                    'lat_min': lat - 0.25,
                    'lat_max': lat + 0.25,
                    'lng_min': lng - 0.25,
                    'lng_max': lng + 0.25,
                    'sea_region': 'Arabian Sea',
                })
                cell_id += 1
        
        print(f"[GRID] Created {len(grid_cells)} spatial grid cells")
        return grid_cells
    
    def _create_temporal_windows(self) -> List[Dict]:
        """
        Create temporal windows for training.
        Simulate 2 years of data with daily granularity.
        """
        windows = []
        start_date = datetime(2023, 1, 1)
        
        for day_offset in range(730):  # 2 years
            timestamp = start_date + timedelta(days=day_offset)
            
            windows.append({
                'timestamp': timestamp,
                'year': timestamp.year,
                'month': timestamp.month,
                'day': timestamp.day,
                'day_of_year': timestamp.timetuple().tm_yday,
                'season': self._get_season(timestamp.month),
                'is_monsoon': timestamp.month in [6, 7, 8, 9],
                'is_cyclone_season': timestamp.month in [4, 5, 10, 11, 12],
            })
        
        print(f"[TIME] Created {len(windows)} temporal windows (2 years daily)")
        return windows
    
    def _get_season(self, month: int) -> str:
        """Get Indian season from month"""
        if month in [12, 1, 2]:
            return 'winter'
        elif month in [3, 4, 5]:
            return 'summer'
        elif month in [6, 7, 8, 9]:
            return 'monsoon'
        else:
            return 'post_monsoon'
    
    def _generate_oceanographic_features(self, 
                                        lat: float, 
                                        lng: float, 
                                        timestamp: datetime,
                                        hazard_type: str) -> Dict:
        """
        Generate realistic oceanographic features based on location and time.
        Simulates INCOIS buoy and satellite data.
        """
        month = timestamp.month
        sea_region = 'Bay of Bengal' if lng > 77 else 'Arabian Sea'
        
        # Base values vary by season
        if month in [6, 7, 8, 9]:  # Monsoon
            sst_base = 29.0
            wave_base = 3.5
            wind_base = 25.0
        elif month in [12, 1, 2]:  # Winter
            sst_base = 27.0
            wave_base = 1.5
            wind_base = 12.0
        else:  # Summer/Pre-monsoon
            sst_base = 30.5
            wave_base = 2.0
            wind_base = 15.0
        
        # Add regional variation
        if sea_region == 'Bay of Bengal':
            sst_base += 0.5  # Warmer
            wave_base += 0.3
        
        # Add hazard-specific perturbations
        hazard_multipliers = {
            'tsunami': {'wave': 3.0, 'current': 5.0},
            'cyclone': {'wind': 2.5, 'wave': 2.0, 'sst': 1.1},
            'storm_surge': {'tide': 2.0, 'wind': 1.8, 'wave': 1.5},
            'high_tide': {'tide': 1.5},
            'coastal_flood': {'tide': 1.3, 'wave': 1.2},
        }
        
        multiplier = hazard_multipliers.get(hazard_type, {})
        
        # Generate features with realistic noise
        features = {
            'sst_celsius': np.clip(
                sst_base * multiplier.get('sst', 1.0) + np.random.normal(0, 0.5),
                *self.oceanographic_ranges['sst']
            ),
            'wave_height_m': np.clip(
                wave_base * multiplier.get('wave', 1.0) + np.random.normal(0, 0.3),
                *self.oceanographic_ranges['wave_height']
            ),
            'wind_speed_kmh': np.clip(
                wind_base * multiplier.get('wind', 1.0) + np.random.normal(0, 3.0),
                *self.oceanographic_ranges['wind_speed']
            ),
            'current_velocity_ms': np.clip(
                0.5 * multiplier.get('current', 1.0) + np.random.normal(0, 0.2),
                *self.oceanographic_ranges['current_velocity']
            ),
            'tide_level_m': np.clip(
                0.8 * multiplier.get('tide', 1.0) + np.random.normal(0, 0.3),
                *self.oceanographic_ranges['tide_level']
            ),
        }
        
        return features
    
    def _calculate_intensity_bin(self, risk_score: float) -> str:
        """Classify risk score into intensity bins"""
        for bin_name, (min_val, max_val) in self.intensity_bins.items():
            if min_val <= risk_score < max_val:
                return bin_name
        return 'very_high'  # Fallback
    
    def _calculate_seasonal_risk(self, 
                                 hazard_type: str, 
                                 season: str,
                                 sea_region: str) -> float:
        """
        Calculate seasonal risk multiplier based on historical patterns.
        """
        risk_matrix = {
            'tsunami': {
                'Bay of Bengal': {'winter': 1.2, 'summer': 1.0, 'monsoon': 1.3, 'post_monsoon': 1.1},
                'Arabian Sea': {'winter': 0.8, 'summer': 0.9, 'monsoon': 1.0, 'post_monsoon': 0.9},
            },
            'cyclone': {
                'Bay of Bengal': {'winter': 0.5, 'summer': 1.2, 'monsoon': 1.8, 'post_monsoon': 1.6},
                'Arabian Sea': {'winter': 0.3, 'summer': 1.1, 'monsoon': 1.4, 'post_monsoon': 1.2},
            },
            'storm_surge': {
                'Bay of Bengal': {'winter': 0.6, 'summer': 1.0, 'monsoon': 1.7, 'post_monsoon': 1.3},
                'Arabian Sea': {'winter': 0.5, 'summer': 0.9, 'monsoon': 1.5, 'post_monsoon': 1.1},
            },
            'high_tide': {
                'Bay of Bengal': {'winter': 0.9, 'summer': 1.2, 'monsoon': 1.1, 'post_monsoon': 1.0},
                'Arabian Sea': {'winter': 0.8, 'summer': 1.1, 'monsoon': 1.0, 'post_monsoon': 0.9},
            },
            'coastal_flood': {
                'Bay of Bengal': {'winter': 0.7, 'summer': 0.9, 'monsoon': 1.6, 'post_monsoon': 1.2},
                'Arabian Sea': {'winter': 0.6, 'summer': 0.8, 'monsoon': 1.4, 'post_monsoon': 1.0},
            },
        }
        
        return risk_matrix.get(hazard_type, {}).get(sea_region, {}).get(season, 1.0)
    
    def generate_expanded_dataset(self, 
                                  samples_per_grid: int = 5,
                                  temporal_sampling_rate: float = 0.1) -> pd.DataFrame:
        """
        Generate massively expanded training dataset using:
        - Spatial gridding
        - Temporal windowing
        - Oceanographic features
        - Derived labels
        """
        print("\n" + "=" * 70)
        print("[DATA ENGINEERING] Advanced Data Engineering Pipeline")
        print("=" * 70)
        
        # Sample grid cells (use subset for manageable size)
        sampled_grids = random.sample(self.grid_cells, min(100, len(self.grid_cells)))
        sampled_windows = random.sample(self.temporal_windows, 
                                       int(len(self.temporal_windows) * temporal_sampling_rate))
        
        print(f"\n[CONFIG] Dataset Configuration:")
        print(f"   Spatial grid cells: {len(sampled_grids)}")
        print(f"   Temporal windows: {len(sampled_windows)}")
        print(f"   Samples per grid: {samples_per_grid}")
        print(f"   Expected samples: {len(sampled_grids) * len(sampled_windows) * samples_per_grid:,}")
        
        dataset = []
        hazard_types = ['tsunami', 'cyclone', 'storm_surge', 'high_tide', 'coastal_flood']
        
        print("\n[GENERATING] Generating samples...")
        for grid in sampled_grids:
            for window in sampled_windows:
                for _ in range(samples_per_grid):
                    # Random hazard type with regional preferences
                    if grid['sea_region'] == 'Bay of Bengal':
                        hazard_type = np.random.choice(
                            hazard_types, 
                            p=[0.08, 0.40, 0.30, 0.12, 0.10]
                        )
                    else:
                        hazard_type = np.random.choice(
                            hazard_types,
                            p=[0.03, 0.25, 0.35, 0.20, 0.17]
                        )
                    
                    # Generate oceanographic features
                    ocean_features = self._generate_oceanographic_features(
                        grid['lat_center'],
                        grid['lng_center'],
                        window['timestamp'],
                        hazard_type
                    )
                    
                    # Calculate seasonal risk
                    seasonal_risk = self._calculate_seasonal_risk(
                        hazard_type,
                        window['season'],
                        grid['sea_region']
                    )
                    
                    # Base risk calculation with oceanographic influences
                    base_risk = {
                        'tsunami': 0.12,
                        'cyclone': 0.35,
                        'storm_surge': 0.38,
                        'high_tide': 0.28,
                        'coastal_flood': 0.25,
                    }[hazard_type]
                    
                    # Risk influenced by oceanographic conditions
                    ocean_risk_factor = (
                        (ocean_features['sst_celsius'] / 30.0) * 0.3 +
                        (ocean_features['wave_height_m'] / 4.0) * 0.4 +
                        (ocean_features['wind_speed_kmh'] / 35.0) * 0.3
                    )
                    
                    final_risk = np.clip(
                        base_risk * seasonal_risk * (0.7 + ocean_risk_factor * 0.6) + 
                        np.random.normal(0, 0.05),
                        0.0, 1.0
                    )
                    
                    # Derived labels
                    intensity_bin = self._calculate_intensity_bin(final_risk)
                    
                    if final_risk >= 0.75:
                        severity = 'critical'
                    elif final_risk >= 0.5:
                        severity = 'high'
                    elif final_risk >= 0.25:
                        severity = 'medium'
                    else:
                        severity = 'low'
                    
                    # Compile sample
                    sample = {
                        # Spatial features
                        'cell_id': grid['cell_id'],
                        'lat': grid['lat_center'],
                        'lng': grid['lng_center'],
                        'sea_region': grid['sea_region'],
                        
                        # Temporal features
                        'timestamp': window['timestamp'],
                        'year': window['year'],
                        'month': window['month'],
                        'day_of_year': window['day_of_year'],
                        'season': window['season'],
                        'is_monsoon': window['is_monsoon'],
                        'is_cyclone_season': window['is_cyclone_season'],
                        
                        # Oceanographic features
                        **ocean_features,
                        
                        # Hazard features
                        'hazard_type': hazard_type,
                        'risk_score': round(final_risk, 4),
                        'seasonal_risk_multiplier': round(seasonal_risk, 3),
                        
                        # Derived labels
                        'severity': severity,
                        'intensity_bin': intensity_bin,
                    }
                    
                    dataset.append(sample)
        
        df = pd.DataFrame(dataset)
        
        print(f"\n[SUCCESS] Generated {len(df):,} training samples")
        print(f"\n[STATS] Dataset Statistics:")
        print(f"   Unique grid cells: {df['cell_id'].nunique()}")
        print(f"   Temporal span: {df['timestamp'].min()} to {df['timestamp'].max()}")
        print(f"   Hazard types: {df['hazard_type'].nunique()}")
        print(f"   Seasons: {df['season'].nunique()}")
        
        print(f"\n[DISTRIBUTION] Hazard Distribution:")
        print(df['hazard_type'].value_counts().to_string())
        
        print(f"\n[OCEAN] Oceanographic Feature Ranges:")
        for col in ['sst_celsius', 'wave_height_m', 'wind_speed_kmh']:
            print(f"   {col}: {df[col].min():.2f} - {df[col].max():.2f}")
        
        print(f"\n[INTENSITY] Intensity Distribution:")
        print(df['intensity_bin'].value_counts().to_string())
        
        return df


if __name__ == '__main__':
    engineer = AdvancedCoastalDataEngineer()
    
    # Generate expanded dataset
    df = engineer.generate_expanded_dataset(
        samples_per_grid=3,
        temporal_sampling_rate=0.15
    )
    
    # Save to CSV
    output_path = 'data/expanded_coastal_training.csv'
    df.to_csv(output_path, index=False)
    print(f"\n[SAVED] Saved to {output_path}")
    print("=" * 70)

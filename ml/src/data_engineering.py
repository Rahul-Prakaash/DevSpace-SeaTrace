"""
Advanced Data Engineering for All-India Coastal Hazard Training
Temporal windowing, spatial gridding, oceanographic features, bathymetry
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List
import random
from itertools import product

class AdvancedCoastalDataEngineer:
    """
    Enhanced data engineering covering the entire Indian coastline.
    Features: temporal windowing, spatial gridding, oceanographic + geological features.
    """

    def __init__(self):
        self.grid_cells = self._create_spatial_grid()
        self.temporal_windows = self._create_temporal_windows()

        # Oceanographic feature ranges (calibrated from INCOIS buoy data)
        self.oceanographic_ranges = {
            'sst': (24.0, 33.0),
            'wave_height': (0.3, 8.0),
            'wind_speed': (2.0, 55.0),
            'current_velocity': (0.05, 3.0),
            'tide_level': (-1.0, 6.0),  # Extended for Gulf of Khambhat
        }

        self.intensity_bins = {
            'very_low': (0.0, 0.2),
            'low': (0.2, 0.4),
            'moderate': (0.4, 0.6),
            'high': (0.6, 0.8),
            'very_high': (0.8, 1.0),
        }

    def _create_spatial_grid(self) -> List[Dict]:
        """
        Create spatial grid cells covering ENTIRE Indian coastline.
        Covers: Bay of Bengal, Arabian Sea, Andaman Sea.
        """
        grid_cells = []
        cell_id = 0

        # Bay of Bengal coast (Tamil Nadu to West Bengal): lat 8-23, lng 77-90
        for lat in np.arange(8.0, 23.0, 0.5):
            for lng in np.arange(77.0, 90.0, 0.5):
                if lng > 77:
                    grid_cells.append({
                        'cell_id': f'BOB_{cell_id:04d}',
                        'lat_center': lat, 'lng_center': lng,
                        'lat_min': lat - 0.25, 'lat_max': lat + 0.25,
                        'lng_min': lng - 0.25, 'lng_max': lng + 0.25,
                        'sea_region': 'Bay of Bengal',
                    })
                    cell_id += 1

        # Arabian Sea coast (Kerala to Gujarat): lat 8-24, lng 66-77
        cell_id = 0
        for lat in np.arange(8.0, 24.0, 0.5):
            for lng in np.arange(66.0, 77.5, 0.5):
                if lng < 77:
                    grid_cells.append({
                        'cell_id': f'AS_{cell_id:04d}',
                        'lat_center': lat, 'lng_center': lng,
                        'lat_min': lat - 0.25, 'lat_max': lat + 0.25,
                        'lng_min': lng - 0.25, 'lng_max': lng + 0.25,
                        'sea_region': 'Arabian Sea',
                    })
                    cell_id += 1

        # Andaman Sea (Andaman & Nicobar): lat 6-14, lng 91-94
        cell_id = 0
        for lat in np.arange(6.0, 14.0, 0.5):
            for lng in np.arange(91.0, 94.5, 0.5):
                grid_cells.append({
                    'cell_id': f'AND_{cell_id:04d}',
                    'lat_center': lat, 'lng_center': lng,
                    'lat_min': lat - 0.25, 'lat_max': lat + 0.25,
                    'lng_min': lng - 0.25, 'lng_max': lng + 0.25,
                    'sea_region': 'Andaman Sea',
                })
                cell_id += 1

        print(f"[GRID] Created {len(grid_cells)} spatial grid cells (BoB + AS + Andaman)")
        return grid_cells

    def _create_temporal_windows(self) -> List[Dict]:
        """Create 2 years of daily temporal windows."""
        windows = []
        start_date = datetime(2023, 1, 1)

        for day_offset in range(730):
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
        if month in [12, 1, 2]: return 'winter'
        elif month in [3, 4, 5]: return 'summer'
        elif month in [6, 7, 8, 9]: return 'monsoon'
        else: return 'post_monsoon'

    def _generate_oceanographic_features(self, lat, lng, timestamp, hazard_type, sea_region) -> Dict:
        """Generate realistic oceanographic features varying by region, season, and hazard."""
        month = timestamp.month

        # Base values by season
        if month in [6, 7, 8, 9]:  # Monsoon
            sst_base, wave_base, wind_base = 29.0, 3.5, 25.0
        elif month in [12, 1, 2]:  # Winter
            sst_base, wave_base, wind_base = 26.5, 1.5, 12.0
        else:  # Summer/Pre-monsoon
            sst_base, wave_base, wind_base = 30.5, 2.0, 15.0

        # Regional variation
        if sea_region == 'Bay of Bengal':
            sst_base += 0.5; wave_base += 0.3
        elif sea_region == 'Andaman Sea':
            sst_base += 1.0; wave_base += 0.5
        # Arabian Sea: generally calmer except monsoon

        # Latitude variation (warmer near equator)
        sst_base += (12.0 - lat) * 0.05

        # Gujarat tidal extremes
        if sea_region == 'Arabian Sea' and lat > 20:
            tide_base = 4.0 + np.random.normal(0, 1.0)
        else:
            tide_base = 0.8 + np.random.normal(0, 0.3)

        # Hazard-specific perturbations
        multipliers = {
            'tsunami': {'wave': 3.0, 'current': 5.0},
            'cyclone': {'wind': 2.5, 'wave': 2.0, 'sst': 1.1},
            'storm_surge': {'tide': 2.0, 'wind': 1.8, 'wave': 1.5},
            'high_tide': {'tide': 1.5},
            'coastal_flood': {'tide': 1.3, 'wave': 1.2},
            'rip_current': {'current': 2.0, 'wave': 1.3},
            'erosion': {'wave': 1.2, 'current': 1.5},
        }
        m = multipliers.get(hazard_type, {})

        features = {
            'sst_celsius': np.clip(sst_base * m.get('sst', 1.0) + np.random.normal(0, 0.5), *self.oceanographic_ranges['sst']),
            'wave_height_m': np.clip(wave_base * m.get('wave', 1.0) + np.random.normal(0, 0.3), *self.oceanographic_ranges['wave_height']),
            'wind_speed_kmh': np.clip(wind_base * m.get('wind', 1.0) + np.random.normal(0, 3.0), *self.oceanographic_ranges['wind_speed']),
            'current_velocity_ms': np.clip(0.5 * m.get('current', 1.0) + np.random.normal(0, 0.2), *self.oceanographic_ranges['current_velocity']),
            'tide_level_m': np.clip(tide_base * m.get('tide', 1.0) + np.random.normal(0, 0.3), *self.oceanographic_ranges['tide_level']),
        }
        return features

    def _generate_geological_features(self, lat, lng, sea_region) -> Dict:
        """Generate bathymetry, coastal slope, and tidal range features."""
        # Bathymetry (continental shelf depth)
        if sea_region == 'Arabian Sea' and lat > 20:  # Gujarat - wide shallow shelf
            bathymetry = random.uniform(5, 30)
        elif sea_region == 'Andaman Sea':  # Deep waters
            bathymetry = random.uniform(50, 300)
        elif sea_region == 'Bay of Bengal' and lat > 20:  # Bengal shelf
            bathymetry = random.uniform(10, 40)
        else:
            bathymetry = random.uniform(15, 100)

        # Coastal slope
        coastal_slope = random.uniform(0.5, 5.0)

        # Tidal range (Gujarat >> rest of India)
        if sea_region == 'Arabian Sea' and lat > 20:
            tidal_range = random.uniform(6.0, 11.0)
        elif sea_region == 'Bay of Bengal' and lat > 20:
            tidal_range = random.uniform(3.0, 6.0)
        else:
            tidal_range = random.uniform(0.5, 2.5)

        return {
            'bathymetry_depth_m': round(bathymetry, 1),
            'coastal_slope_deg': round(coastal_slope, 2),
            'tidal_range_m': round(tidal_range, 2),
        }

    def _calculate_intensity_bin(self, risk_score: float) -> str:
        for bin_name, (min_val, max_val) in self.intensity_bins.items():
            if min_val <= risk_score < max_val:
                return bin_name
        return 'very_high'

    def _calculate_seasonal_risk(self, hazard_type, season, sea_region) -> float:
        risk_matrix = {
            'tsunami': {
                'Bay of Bengal': {'winter': 1.2, 'summer': 1.0, 'monsoon': 1.3, 'post_monsoon': 1.1},
                'Arabian Sea': {'winter': 0.8, 'summer': 0.9, 'monsoon': 1.0, 'post_monsoon': 0.9},
                'Andaman Sea': {'winter': 1.3, 'summer': 1.1, 'monsoon': 1.4, 'post_monsoon': 1.2},
            },
            'cyclone': {
                'Bay of Bengal': {'winter': 0.5, 'summer': 1.2, 'monsoon': 1.8, 'post_monsoon': 1.6},
                'Arabian Sea': {'winter': 0.3, 'summer': 1.5, 'monsoon': 1.4, 'post_monsoon': 1.0},
                'Andaman Sea': {'winter': 0.6, 'summer': 1.0, 'monsoon': 1.5, 'post_monsoon': 1.3},
            },
            'storm_surge': {
                'Bay of Bengal': {'winter': 0.6, 'summer': 1.0, 'monsoon': 1.7, 'post_monsoon': 1.3},
                'Arabian Sea': {'winter': 0.5, 'summer': 0.9, 'monsoon': 1.5, 'post_monsoon': 1.1},
                'Andaman Sea': {'winter': 0.5, 'summer': 0.8, 'monsoon': 1.3, 'post_monsoon': 1.0},
            },
            'high_tide': {
                'Bay of Bengal': {'winter': 0.9, 'summer': 1.2, 'monsoon': 1.1, 'post_monsoon': 1.0},
                'Arabian Sea': {'winter': 1.0, 'summer': 1.3, 'monsoon': 1.1, 'post_monsoon': 1.0},
                'Andaman Sea': {'winter': 0.8, 'summer': 1.0, 'monsoon': 0.9, 'post_monsoon': 0.8},
            },
            'coastal_flood': {
                'Bay of Bengal': {'winter': 0.7, 'summer': 0.9, 'monsoon': 1.6, 'post_monsoon': 1.2},
                'Arabian Sea': {'winter': 0.6, 'summer': 0.8, 'monsoon': 1.5, 'post_monsoon': 1.0},
                'Andaman Sea': {'winter': 0.5, 'summer': 0.7, 'monsoon': 1.3, 'post_monsoon': 0.9},
            },
            'rip_current': {
                'Bay of Bengal': {'winter': 0.8, 'summer': 1.3, 'monsoon': 1.0, 'post_monsoon': 0.9},
                'Arabian Sea': {'winter': 0.7, 'summer': 1.2, 'monsoon': 0.9, 'post_monsoon': 0.8},
                'Andaman Sea': {'winter': 1.0, 'summer': 1.4, 'monsoon': 0.8, 'post_monsoon': 0.9},
            },
            'erosion': {
                'Bay of Bengal': {'winter': 0.8, 'summer': 0.9, 'monsoon': 1.5, 'post_monsoon': 1.2},
                'Arabian Sea': {'winter': 0.7, 'summer': 0.8, 'monsoon': 1.4, 'post_monsoon': 1.1},
                'Andaman Sea': {'winter': 0.6, 'summer': 0.7, 'monsoon': 1.2, 'post_monsoon': 0.9},
            },
        }
        return risk_matrix.get(hazard_type, {}).get(sea_region, {}).get(season, 1.0)

    def generate_expanded_dataset(self, samples_per_grid=3, temporal_sampling_rate=0.15) -> pd.DataFrame:
        """Generate massively expanded all-India training dataset."""
        print("\n" + "=" * 70)
        print("[DATA ENGINEERING] All-India Advanced Data Pipeline")
        print("=" * 70)

        sampled_grids = random.sample(self.grid_cells, min(150, len(self.grid_cells)))
        sampled_windows = random.sample(self.temporal_windows,
                                       int(len(self.temporal_windows) * temporal_sampling_rate))

        print(f"\n[CONFIG] Dataset Configuration:")
        print(f"   Spatial grid cells: {len(sampled_grids)}")
        print(f"   Temporal windows: {len(sampled_windows)}")
        print(f"   Samples per grid: {samples_per_grid}")
        print(f"   Expected samples: ~{len(sampled_grids) * len(sampled_windows) * samples_per_grid:,}")

        dataset = []
        hazard_types = ['tsunami', 'cyclone', 'storm_surge', 'high_tide',
                        'coastal_flood', 'rip_current', 'erosion']

        print("\n[GENERATING] Generating samples...")
        for grid in sampled_grids:
            sea_region = grid['sea_region']
            geo_features = self._generate_geological_features(
                grid['lat_center'], grid['lng_center'], sea_region)

            for window in sampled_windows:
                for _ in range(samples_per_grid):
                    # Regional hazard weights
                    if sea_region == 'Bay of Bengal':
                        weights = [0.05, 0.30, 0.25, 0.10, 0.10, 0.12, 0.08]
                    elif sea_region == 'Andaman Sea':
                        weights = [0.15, 0.18, 0.15, 0.08, 0.07, 0.25, 0.12]
                    else:
                        weights = [0.02, 0.18, 0.22, 0.15, 0.15, 0.15, 0.13]

                    hazard_type = np.random.choice(hazard_types, p=weights)

                    ocean_features = self._generate_oceanographic_features(
                        grid['lat_center'], grid['lng_center'],
                        window['timestamp'], hazard_type, sea_region)

                    seasonal_risk = self._calculate_seasonal_risk(
                        hazard_type, window['season'], sea_region)

                    base_risk = {
                        'tsunami': 0.12, 'cyclone': 0.35, 'storm_surge': 0.38,
                        'high_tide': 0.28, 'coastal_flood': 0.25,
                        'rip_current': 0.30, 'erosion': 0.22,
                    }[hazard_type]

                    ocean_risk_factor = (
                        (ocean_features['sst_celsius'] / 30.0) * 0.25 +
                        (ocean_features['wave_height_m'] / 4.0) * 0.35 +
                        (ocean_features['wind_speed_kmh'] / 35.0) * 0.25 +
                        (geo_features['bathymetry_depth_m'] < 30) * 0.08 +
                        (geo_features['coastal_slope_deg'] > 3) * 0.07
                    )

                    final_risk = np.clip(
                        base_risk * seasonal_risk * (0.7 + ocean_risk_factor * 0.6) +
                        np.random.normal(0, 0.05), 0.0, 1.0)

                    intensity_bin = self._calculate_intensity_bin(final_risk)
                    if final_risk >= 0.75: severity = 'critical'
                    elif final_risk >= 0.5: severity = 'high'
                    elif final_risk >= 0.25: severity = 'medium'
                    else: severity = 'low'

                    sample = {
                        'cell_id': grid['cell_id'],
                        'lat': grid['lat_center'],
                        'lng': grid['lng_center'],
                        'sea_region': sea_region,
                        'timestamp': window['timestamp'],
                        'year': window['year'],
                        'month': window['month'],
                        'day_of_year': window['day_of_year'],
                        'season': window['season'],
                        'is_monsoon': window['is_monsoon'],
                        'is_cyclone_season': window['is_cyclone_season'],
                        **ocean_features,
                        **geo_features,
                        'hazard_type': hazard_type,
                        'risk_score': round(final_risk, 4),
                        'seasonal_risk_multiplier': round(seasonal_risk, 3),
                        'severity': severity,
                        'intensity_bin': intensity_bin,
                    }
                    dataset.append(sample)

        df = pd.DataFrame(dataset)

        print(f"\n[SUCCESS] Generated {len(df):,} training samples")
        print(f"   Unique grid cells: {df['cell_id'].nunique()}")
        print(f"   Sea regions: {df['sea_region'].unique().tolist()}")
        print(f"   Hazard types: {df['hazard_type'].nunique()}")
        print(f"\n[DISTRIBUTION] Hazard Distribution:")
        print(df['hazard_type'].value_counts().to_string())
        print(f"\n[OCEAN] Oceanographic Feature Ranges:")
        for col in ['sst_celsius', 'wave_height_m', 'wind_speed_kmh', 'bathymetry_depth_m', 'tidal_range_m']:
            print(f"   {col}: {df[col].min():.2f} — {df[col].max():.2f}")

        return df


if __name__ == '__main__':
    engineer = AdvancedCoastalDataEngineer()
    df = engineer.generate_expanded_dataset(samples_per_grid=3, temporal_sampling_rate=0.15)
    df.to_csv('data/expanded_coastal_training.csv', index=False)
    print(f"\n[SAVED] Saved to data/expanded_coastal_training.csv")

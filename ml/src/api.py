"""
Flask API for ML predictions — All-India Coverage
7 hazard types, 17 features, timeline endpoint
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import EnhancedHazardPredictor
from data_engineering import AdvancedCoastalDataEngineer
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

print("🚀 Initializing SeaTrace All-India ML Predictor...")
predictor = EnhancedHazardPredictor()

if not predictor.is_trained:
    print("⚠️  No trained models found. Training on expanded all-India dataset...")
    engineer = AdvancedCoastalDataEngineer()
    df = engineer.generate_expanded_dataset(samples_per_grid=3, temporal_sampling_rate=0.15)
    predictor.train(df)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'SeaTrace ML API',
        'version': 'v4.0-all-india',
        'coverage': 'All Indian coastal states + island territories',
        'hazardTypes': ['tsunami', 'cyclone', 'storm_surge', 'high_tide',
                        'coastal_flood', 'rip_current', 'erosion'],
        'features': 17,
    })


@app.route('/predict', methods=['POST'])
def predict():
    """Single-location prediction."""
    try:
        data = request.get_json()
        if not data or 'lat' not in data or 'lng' not in data:
            return jsonify({'error': 'Missing lat/lng'}), 400

        lat = float(data['lat'])
        lng = float(data['lng'])
        hazard_type = data.get('hazardType', 'storm_surge')

        prediction = predictor.predict_risk(lat, lng, hazard_type)
        return jsonify(prediction)

    except ValueError as e:
        return jsonify({'error': f'Invalid parameters: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@app.route('/predict/bulk', methods=['POST'])
def predict_bulk():
    """Multi-location predictions."""
    try:
        data = request.get_json()
        if not data or 'locations' not in data:
            return jsonify({'error': 'Missing locations'}), 400

        predictions = predictor.predict_multiple_locations(data['locations'])
        return jsonify({'predictions': predictions})

    except Exception as e:
        return jsonify({'error': f'Bulk prediction failed: {str(e)}'}), 500


@app.route('/predict/timeline', methods=['POST'])
def predict_timeline():
    """
    Predictions across a time range for a location.
    Body: { lat, lng, hazardType, hours: 72 }
    Returns predictions at 6-hour intervals.
    """
    try:
        data = request.get_json()
        lat = float(data['lat'])
        lng = float(data['lng'])
        hazard_type = data.get('hazardType', 'storm_surge')
        hours = int(data.get('hours', 72))

        predictions = []
        for h in range(0, hours, 6):
            p = predictor.predict_risk(lat, lng, hazard_type)
            p['timeOffset_hours'] = h
            predictions.append(p)

        return jsonify({'timeline': predictions, 'intervalHours': 6})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/model/info', methods=['GET'])
def model_info():
    """Model metadata and training stats."""
    return jsonify({
        'modelVersion': 'v4.0-all-india',
        'features': predictor.feature_columns,
        'featureCount': len(predictor.feature_columns),
        'hazardTypes': list(predictor.label_encoders.get('hazard_type', {}).classes_)
            if 'hazard_type' in predictor.label_encoders else [],
        'seaRegions': list(predictor.label_encoders.get('sea_region', {}).classes_)
            if 'sea_region' in predictor.label_encoders else [],
        'trained': predictor.is_trained,
        'dataSource': 'INCOIS + IMD + NDMA calibrated all-India dataset',
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'

    print(f'🤖 SeaTrace ML API — All-India')
    print(f'📡 Port {port}')
    print(f'🗺️  Coverage: 12 states + 2 UTs, 70+ locations')

    app.run(host='0.0.0.0', port=port, debug=debug)

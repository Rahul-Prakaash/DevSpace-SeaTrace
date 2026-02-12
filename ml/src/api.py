"""
Flask API for ML predictions with Enhanced Indian-trained models
Trained on expanded dataset with oceanographic features
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import EnhancedHazardPredictor
from data_engineering import AdvancedCoastalDataEngineer
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize enhanced predictor
print("🚀 Initializing SeaTrace Enhanced ML Predictor...")
predictor = EnhancedHazardPredictor()

# If not trained, train it now with expanded dataset
if not predictor.is_trained:
    print("⚠️  No trained models found. Generating expanded dataset and training...")
    engineer = AdvancedCoastalDataEngineer()
    df = engineer.generate_expanded_dataset(samples_per_grid=3, temporal_sampling_rate=0.15)
    predictor.train(df)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'SeaTrace ML API'})

@app.route('/predict', methods=['POST'])
def predict():
    """
    Generate hazard prediction for a location.
    
    Request body:
    {
        "lat": 13.0827,
        "lng": 80.2707,
        "hazardType": "storm_surge"  # optional
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'lat' not in data or 'lng' not in data:
            return jsonify({'error': 'Missing lat/lng parameters'}), 400
        
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
    """
    Generate predictions for multiple locations.
    
    Request body:
    {
        "locations": [
            [13.0827, 80.2707],
            [11.9416, 79.8083]
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'locations' not in data:
            return jsonify({'error': 'Missing locations parameter'}), 400
        
        locations = data['locations']
        predictions = predictor.predict_multiple_locations(locations)
        
        return jsonify({'predictions': predictions})
    
    except Exception as e:
        return jsonify({'error': f'Bulk prediction failed: {str(e)}'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    print('🤖 Starting SeaTrace ML API...')
    print(f'📡 Listening on port {port}')
    print('📊 NOAA-based hazard prediction ready')
    
    app.run(host='0.0.0.0', port=port, debug=debug)

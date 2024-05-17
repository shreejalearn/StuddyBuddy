from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS from flask_cors module

app = Flask(__name__)
CORS(app)  # Apply CORS to your Flask app

# Mock machine learning model function
def predict(input_data):
    # Your machine learning model prediction logic here
    return "Result"

@app.route('/predict', methods=['POST'])
def handle_prediction():
    input_data = request.json.get('input_data')
    return jsonify({'result': input_data})

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)

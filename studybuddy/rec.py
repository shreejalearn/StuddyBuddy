import os
import numpy as np
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
from sklearn.neighbors import NearestNeighbors
from dotenv import load_dotenv
from flask import Flask, jsonify

# Load environment variables
load_dotenv()

# Get the service key path from environment variable
service_key_path = os.getenv('FIREBASE_SERVICE_KEY_PATH')

if service_key_path is None:
    raise ValueError("The environment variable FIREBASE_SERVICE_KEY_PATH is not set.")

# Initialize Firebase
cred = credentials.Certificate(service_key_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Fetch all collection titles from Firestore
def fetch_collection_titles():
    collection_titles = []
    collection_docs = db.collection('collections').stream()
    for doc in collection_docs:
        title = doc.get('data', {}).get('title', '')
        if title:
            collection_titles.append(title)
    return collection_titles

# Create a dummy relevancy matrix based on collection titles
def create_relevancy_matrix(collection_titles):
    num_collections = len(collection_titles)
    dummy_relevancy_matrix = np.random.rand(num_collections, num_collections)
    dummy_relevancy_matrix = (dummy_relevancy_matrix + dummy_relevancy_matrix.T) / 2
    np.fill_diagonal(dummy_relevancy_matrix, 1)
    return pd.DataFrame(dummy_relevancy_matrix, index=collection_titles, columns=collection_titles)

# Initialize and fit the NearestNeighbors model
def build_recommendation_model(matrix):
    cf_knn_model = NearestNeighbors(metric='cosine', algorithm='brute', n_neighbors=10, n_jobs=-1)
    cf_knn_model.fit(matrix)
    return cf_knn_model

# Fetch collection titles
collection_titles = fetch_collection_titles()

# Create relevancy matrix
relevancy_matrix = create_relevancy_matrix(collection_titles)

# Build recommendation model
recommendation_model = build_recommendation_model(relevancy_matrix)

# Flask application
app = Flask(__name__)

# Endpoint to return all available titles
@app.route('/get_all_titles', methods=['GET'])
def get_all_titles():
    return jsonify({'titles': collection_titles})

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
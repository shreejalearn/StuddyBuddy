# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from PIL import Image
# import pytesseract
# import io
# import os
# import firebase_admin
# from firebase_admin import credentials, firestore

# app = Flask(__name__)
# CORS(app)

# # Specify the full path to the Tesseract executable
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# # Initialize Firebase Admin SDK
# cred = credentials.Certificate("serviceKey.json")
# firebase_admin.initialize_app(cred)

# # Initialize Firestore client
# db = firestore.client()

# @app.route('/recognize', methods=['POST'])
# def recognize_handwriting():
#     if 'image' not in request.files:
#         return jsonify({'error': 'No image uploaded'})

#     image_file = request.files['image']
#     image_stream = io.BytesIO(image_file.read())
#     image = Image.open(image_stream)

#     recognized_text = pytesseract.image_to_string(image)

#     # Store recognized_text in Cloud Firestore
#     doc_ref = db.collection('recognized_texts').document()
#     doc_ref.set({'text': recognized_text})

#     return jsonify({'text': recognized_text})

# if __name__ == '__main__':
#     app.run(host='localhost', port=5000, debug=True)


from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from PIL import Image
import pytesseract
import io
import os

app = Flask(__name__)
CORS(app)

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Initialize Firebase Admin SDK
cred = credentials.Certificate("serviceKey.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()

@app.route('/create_collection', methods=['POST'])
def create_collection():
    data = request.get_json()
    if 'collection_name' not in data:
        return jsonify({'error': 'Collection name not provided'})

    collection_name = data['collection_name']
    notes = data.get('notes', '')

    # Check if the collection name is "math" and set notes accordingly
    if collection_name == 'math':
        image_file = request.files['image']
        image_stream = io.BytesIO(image_file.read())
        image = Image.open(image_stream)

        recognized_text = pytesseract.image_to_string(image)
        doc_ref = db.collection('collections').document(collection_name)
        doc_ref.set({'name': collection_name, 'notes': recognized_text})
        return jsonify({'message': f'Collection {collection_name} created successfully with notes: {notes}'})

    # For other collections, just store the collection name
    else:
        doc_ref = db.collection('collections').document(collection_name)
        doc_ref.set({'name': collection_name})
        return jsonify({'message': f'Collection {collection_name} created successfully'})

@app.route('/get_collections', methods=['GET'])
def get_collections():
    collections = []
    collection_docs = db.collection('collections').stream()
    for doc in collection_docs:
        collections.append(doc.id)

    return jsonify({'collections': collections})

@app.route('/recognize', methods=['POST'])
def recognize_handwriting():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'})

    image_file = request.files['image']
    image_stream = io.BytesIO(image_file.read())
    image = Image.open(image_stream)

    recognized_text = pytesseract.image_to_string(image)

    # Store recognized_text in Cloud Firestore
    doc_ref = db.collection('recognized_texts').document()
    doc_ref.set({'text': recognized_text})

    return jsonify({'text': recognized_text})


if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)


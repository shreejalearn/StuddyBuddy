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
import asyncio
import os
from sydney import SydneyClient
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import auth


import json

load_dotenv()

bing_cookies_key = os.getenv('BING_COOKIES')

if bing_cookies_key is None:
    print("Error: BING_COOKIES environment variable is not set.")
    exit(1)

os.environ["BING_COOKIES"] = bing_cookies_key

async def ask_sydney(question):
    async with SydneyClient() as sydney:
        response = await sydney.ask(question, citations=True)
        return response

app = Flask(__name__)
CORS(app)

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Initialize Firebase Admin SDK
cred = credentials.Certificate("./serviceKey.json")
# firebase_admin.initialize_app(cred)
firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()

@app.route('/get_my_collections', methods=['GET'])
def get_my_collections():
    username = request.args.get('username')
    if not username:
        return jsonify({'error': 'Username not provided'})

    collections = []
    collection_docs = db.collection('collections').where('username', '==', username).stream()
    for doc in collection_docs:
        # Access the 'data' field and then retrieve the 'title' from it
        title = doc.to_dict().get('data', {}).get('title', '')
        collections.append({'id': doc.id, 'title': title})

    return jsonify({'collections': collections})

@app.route('/protected_resource', methods=['GET'])
def protected_resource():
    # Get the ID token from the request headers
    id_token = request.headers.get('Authorization')
    if not id_token:
        return jsonify({'error': 'Authorization token missing'}), 401

    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token['uid']
        # User is authenticated, serve the resource
        return jsonify({'message': 'You are authenticated!'})
    except auth.InvalidIdTokenError:
        return jsonify({'error': 'Invalid ID token'}), 401

@app.route('/answer_question', methods=['GET','POST'])
def answer_question():
    data = request.json  
    username = data.get('username')
    user_class = data.get('class')
    question = data.get('data')

    if not username or not user_class:
        return jsonify({'error': 'Username or class not provided'})

    user_notes = []
    notes_docs = db.collection('collections').where('username', '==', username).where('class', '==', user_class).stream()
    for doc in notes_docs:
        notes = doc.to_dict().get('data', {}).get('notes', '')
        user_notes.append(notes)

    # Combine the notes into a single string
    combined_notes = ' '.join(user_notes)

    # Ask Sydney a question based on the combined notes
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    response = loop.run_until_complete(ask_sydney(question + " based on these notes: "+combined_notes))

    return jsonify({'response': response})


@app.route('/ask_sydney', methods=['POST'])
def ask_sydney_route():
    data = request.get_json()
    if 'prompt' not in data:
        return jsonify({'error': 'Prompt not provided'})

    prompt = data['prompt']

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    response = loop.run_until_complete(ask_sydney(prompt))

    return jsonify({'response': response})

@app.route('/create_collection', methods=['POST'])
def create_collection():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'})

    collection_name = data.get('collection_name')
    notes = data.get('notes', '')
    username = data.get('username')

    if not collection_name:
        return jsonify({'error': 'Collection name not provided'})

    if not username:
        return jsonify({'error': 'Username not provided'})

    # Store the collection in Firestore
    doc_ref = db.collection('collections').document()
    doc_ref.set({
        'username': username,
        'collectionIdentification': doc_ref.id,  # Using Firestore auto-generated ID
        'data': {
            'title': collection_name,
            'text': notes
        }
    })

    return jsonify({'message': 'Collection created successfully'})

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


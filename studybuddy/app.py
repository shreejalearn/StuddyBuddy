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
import googleapiclient.discovery
from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs


import json

load_dotenv()

bing_cookies_key = os.getenv('BING_COOKIES')
transcript_key = os.getenv('TRANSCRIPT_API')

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



@app.route('/get_transcript', methods=['POST'])
def get_transcript():
    video_url = request.form.get('url')
    print(video_url)
    url_parts = urlparse(video_url)

    query_params = parse_qs(url_parts.query)

    video_id = query_params.get('v')

    if not video_id:
        return jsonify({'error': 'Invalid video URL format'+video_url})
    else:
        video_id = video_id[0]
        print("Video ID:", video_id)
    youtube=build('youtube','v3', developerKey=transcript_key)
    captions = youtube.captions().list(part='snippet', videoId=video_id).execute()
    caption = captions['items'][0]['id']
    transcript_list = YouTubeTranscriptApi.get_transcript(video_id)

    transcript_txt=""

    for transcript in transcript_list:
        transcript_txt+=transcript['text']


    return jsonify({'response': transcript_txt})


@app.route('/get_sections', methods=['GET'])
def get_sections():
    collection_id = request.args.get('collection_id')
    if not collection_id:
        return jsonify({'error': 'Collection ID not provided'})

    sections = []
    sections_docs = db.collection('collections').document(collection_id).collection('sections').stream()
    for doc in sections_docs:
        sections.append({'id': doc.id, 'section_name': doc.to_dict().get('section_name', '')})

    return jsonify({'sections': sections})




@app.route('/get_chapters', methods=['GET'])
def get_chapters():
    collection_id = request.args.get('collection_id')
    if not collection_id:
        return jsonify({'error': 'Collection ID not provided'})

    sections = []
    sections_docs = db.collection('chapters').document(collection_id).collection('colection_id').stream()
    for doc in sections_docs:
        sections.append({'id': doc.id, 'section_name': doc.to_dict().get('collection_id', '')})

    return jsonify({'chapters': sections})

@app.route('/create_section', methods=['POST'])
def create_section():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'})

    collection_id = data.get('collection_id')
    section_name = data.get('section_name')
    notes = data.get('notes', '')

    if not collection_id or not section_name:
        return jsonify({'error': 'Collection ID or Section name not provided'})

    collection_ref = db.collection('collections').document(collection_id)
    sections_ref = collection_ref.collection('sections').document()
    sections_ref.set({
        'section_name': section_name,
        'notes': notes
    })

    return jsonify({'message': 'Section created successfully'})


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


@app.route('/get_sources', methods=['GET'])
def get_sources():
    chapter_id = request.args.get('chapter_id')
    if not chapter_id:
        return jsonify({'error': 'Chapter ID not provided'})

    sources = []
    sources_docs = db.collection('collections').document(chapter_id).collection('sources').get()

    for doc in sources_docs:
        source_data = doc.to_dict()
        source_data['id'] = doc.id
        sources.append(source_data)

    return jsonify({'sources': sources})
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


@app.route('/section_visibility', methods=['GET', 'POST'])
def visibility():
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            app.logger.error('No data provided')
            return jsonify({'error': 'No data provided'}), 400

        collection_id = data.get('collection_id')
        section_id = data.get('section_id')
        visibility = data.get('visibility')

        if not collection_id or not section_id or not visibility:
            app.logger.error('Collection ID, Section ID or visibility not provided')
            return jsonify({'error': 'Collection ID, Section ID or visibility not provided'}), 400

        section_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id)
        
        try:
            section_ref.update({'visibility': visibility})
            app.logger.info(f'Visibility updated to {visibility} for collection {collection_id}, section {section_id}')
        except Exception as e:
            app.logger.error(f'Error updating visibility: {e}')
            return jsonify({'error': 'Failed to update visibility'}), 500

        return jsonify({'message': 'Visibility updated successfully'})

    elif request.method == 'GET':
        collection_id = request.args.get('collection_id')
        section_id = request.args.get('section_id')

        if not collection_id or not section_id:
            app.logger.error('Collection ID or Section ID not provided')
            return jsonify({'error': 'Collection ID or Section ID not provided'}), 400

        section_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id)
        section = section_ref.get()

        if not section.exists:
            app.logger.error('Section not found')
            return jsonify({'error': 'Section not found'}), 404

        return jsonify({'section': section.to_dict()})

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)


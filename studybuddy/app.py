from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from PIL import Image
import pytesseract
import io
import os
import asyncio
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
import os
from sydney import SydneyClient
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import auth
import googleapiclient.discovery
from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
from typing import OrderedDict
from sentence_transformers import SentenceTransformer
from transformers import T5ForConditionalGeneration, T5Tokenizer, BertTokenizer, BertModel, AutoTokenizer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import torch
import spacy
from transformers import BertTokenizer as BTokenizer, BertModel as BModel
from warnings import filterwarnings as ignore_warnings
from transformers import pipeline

import json

load_dotenv()

bing_cookies_key = os.getenv('BING_COOKIES')
transcript_key = os.getenv('TRANSCRIPT_API')

if bing_cookies_key is None:
    print("Error: BING_COOKIES environment variable is not set.")
    exit(1)

os.environ["BING_COOKIES"] = bing_cookies_key
qa_pipeline = pipeline('question-answering', model='distilbert-base-cased-distilled-squad')
t5_model = T5ForConditionalGeneration.from_pretrained('ramsrigouthamg/t5_squad_v1')
t5_tokenizer = AutoTokenizer.from_pretrained('ramsrigouthamg/t5_squad_v1')
sentence_model = SentenceTransformer('distilbert-base-nli-mean-tokens')
nlp = spacy.load("en_core_web_sm")

ignore_warnings('ignore')

qa_pipeline = pipeline('question-answering', model='distilbert-base-cased-distilled-squad')


async def generate_question(sentence, answer):
    text = f"context: {sentence} answer: {answer}"
    max_len = 256
    encoding = t5_tokenizer.encode_plus(text, max_length=max_len, pad_to_max_length=False, truncation=True, return_tensors="pt")

    input_ids, attention_mask = encoding["input_ids"], encoding["attention_mask"]

    outputs = t5_model.generate(input_ids=input_ids,
                                 attention_mask=attention_mask,
                                 early_stopping=True,
                                 num_beams=15,
                                 num_return_sequences=10,
                                 no_repeat_ngram_size=20,
                                 max_length=300)

    decoded_outputs = [t5_tokenizer.decode(ids, skip_special_tokens=True) for ids in outputs]

    question = decoded_outputs[0].replace("question:", "").strip()
    return question

async def calculate_embedding(doc):
    tokens = BTokenizer.from_pretrained('bert-base-uncased').tokenize(doc)
    token_ids = BTokenizer.from_pretrained('bert-base-uncased').convert_tokens_to_ids(tokens)
    segment_ids = [1] * len(tokens)

    torch_tokens = torch.tensor([token_ids])
    torch_segments = torch.tensor([segment_ids])

    return BModel.from_pretrained("bert-base-uncased")(torch_tokens, torch_segments)[-1].detach().numpy()

async def get_parts_of_speech(context):
  doc = nlp(context)
  pos_tags = [token.pos_ for token in doc]
  return pos_tags, context.split()

async def get_sentences(context):
  doc = nlp(context)
  return list(doc.sents)

async def get_vectorizer(doc):
  stop_words = "english"
  n_gram_range = (1,1)
  vectorizer = CountVectorizer(ngram_range = n_gram_range, stop_words = stop_words).fit([doc])
  return vectorizer.get_feature_names_out()

async def get_keywords(context, module_type='t'):
    keywords = []
    top_n = 5
    sentences = list(nlp(context).sents)

    for sentence in sentences:
        key_words = CountVectorizer(ngram_range=(1, 1), stop_words="english").fit([str(sentence)]).get_feature_names_out()
        
        if module_type == 't':
            sentence_embedding = await calculate_embedding(str(sentence))
            keyword_embedding = await calculate_embedding(' '.join(key_words))
        else:
            sentence_embedding = sentence_model.encode([str(sentence)])
            keyword_embedding = sentence_model.encode(key_words)
        
        distances = cosine_similarity(sentence_embedding, keyword_embedding)
        keywords += [(key_words[index], str(sentence)) for index in distances.argsort()[0][-top_n:]]

    return keywords

async def ask_sydney(question):
    async with SydneyClient() as sydney:
        response = await sydney.ask(question, citations=True)
        return response
    
async def ask_sydney_with_retry(question, max_retries=3):
    retries = 0
    while retries < max_retries:
        try:
            return await ask_sydney(question)
        except Exception as e:
            print(f"Request throttled. Retrying in {2**retries} seconds...")
            await asyncio.sleep(2**retries)
            retries += 1
    raise Exception("Exceeded maximum number of retries")

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


@app.route('/get_my_sections', methods=['GET'])
def get_my_sections():
    username = request.args.get('username')
    if not username:
        return jsonify({'error': 'Username not provided'})

    collections = []
    collection_docs = db.collection('collections').where('username', '==', username).collection('sections').stream()
    for doc in collection_docs:
        # Access the 'data' field and then retrieve the 'title' from it
        title = doc.to_dict().get('data', {}).get('section_name', '')
        visibility = doc.to_dict().get('data', {}).get('visibility', '')
        access = doc.to_dict().get('data', {}).get('last_accessed', '')
        collections.append({'id': doc.id, 'title': title, 'visibility': visibility, 'access': access})

        
    return jsonify({'collections': collections})

@app.route('/get_my_sections_recent', methods=['GET'])
def get_my_sections_recent():
    username = request.args.get('username')
    if not username:
        return jsonify({'error': 'Username not provided'})

    collections = []
    collection_docs = db.collection('collections').collection('sections').stream()
    for doc in collection_docs:
        doc_data = doc.to_dict().get('data', {})
        title = doc_data.get('section_name', '')
        visibility = doc_data.get('visibility', '')
        access = doc_data.get('last_accessed', '')

        # If access is empty, continue to next document
        if not access:
            continue

        # Try to parse the 'last_accessed' string to a datetime object
        try:
            access_date = parser.parse(access)
        except ValueError:
            continue  # Skip if date format is incorrect

        collections.append({'id': doc.id, 'title': title, 'visibility': visibility, 'access': access_date})

    # Sort the collections by 'access' date in descending order
    collections.sort(key=lambda x: x['access'], reverse=True)

    # Convert datetime objects back to strings if needed
    for collection in collections:
        collection['access'] = collection['access'].isoformat()  # Adjust format as needed

    return jsonify({'collections': collections})


@app.route('/get_all_sections', methods=['GET'])
def get_all_sections():
    collections = []
    collection_docs = db.collection('collections').collection('sections').stream()
    for doc in collection_docs:
        # Access the 'data' field and then retrieve the 'title' from it
        title = doc.to_dict().get('data', {}).get('section_name', '')
        visibility = doc.to_dict().get('data', {}).get('visibility', '')
        access = doc.to_dict().get('data', {}).get('last_accessed', '')
        collections.append({'id': doc.id, 'title': title, 'visibility': visibility, 'access': access})
        
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

@app.route('/update_access_time', methods=['POST'])
def update_access_time():
    data = request.get_json()
    collection_id = data.get('collection_id')
    section_id = data.get('section_id')

    if not collection_id or not section_id:
        return jsonify({'error': 'Missing parameters'}), 400

    try:
        section_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id)
        section_ref.update({'last_accessed': firestore.SERVER_TIMESTAMP})
        return jsonify({'message': 'Access time updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/delete_note', methods=['DELETE'])
def delete_note():
    collection_id = request.args.get('collection_id')
    section_id = request.args.get('section_id')
    note_id = request.args.get('note_id')

    if not collection_id or not section_id or not note_id:
        return jsonify({'error': 'Collection ID, Section ID, or Note ID not provided'}), 400

    try:
        note_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section').document(note_id)
        note_ref.delete()
        return jsonify({'message': 'Note deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


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
    response = loop.run_until_complete(ask_sydney_with_retry(question + " based on these notes: "+combined_notes))

    return jsonify({'response': response})



@app.route('/get_transcript', methods=['POST'])
def get_transcript():
    
    collection_id = request.form.get('collection_id')
    section_id = request.form.get('section_id')

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
    video_response = youtube.videos().list(
        part="snippet",
        id=video_id
    ).execute()

    video_title = video_response['items'][0]['snippet']['title']
    notes_collection_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section')
    note_ref = notes_collection_ref.document()  # Automatically generate a new document ID
    note_ref.set({'notes': transcript_txt, 'tldr':("Video: "+video_title)})


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
        'notes': notes,
        'visibility': 'public'
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
    response = loop.run_until_complete(ask_sydney_with_retry(prompt))
    response = jsonify({'response': response})
    response.headers.add('Access-Control-Allow-Origin', '*')  # Adjust the origin as needed
    return response


@app.route('/get_notes', methods=['GET'])
def get_notes():
    collection_id = request.args.get('collection_id')
    section_id = request.args.get('section_id')

    if not collection_id or not section_id:
        return jsonify({'error': 'Collection ID or Section ID not provided'}), 400

    try:
        notes = []
        notes_docs = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section').stream()
        for doc in notes_docs:
            note_data = doc.to_dict()
            note_data['id'] = doc.id
            notes.append(note_data)
        return jsonify({'notes': notes}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

    collection_id = request.form.get('collection_id')
    section_id = request.form.get('section_id')

    if not collection_id or not section_id:
        return jsonify({'error': 'Collection ID or Section ID not provided'}), 400

    image_file = request.files['image']
    image_stream = io.BytesIO(image_file.read())
    image = Image.open(image_stream)

    recognized_text = pytesseract.image_to_string(image)

    try:
        notes_collection_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section')
        note_ref = notes_collection_ref.document()  
        parser = PlaintextParser.from_string(recognized_text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        tldr = summarizer(parser.document, sentences_count=1)  

        tldr = " ".join(str(sentence) for sentence in tldr)


        note_ref.set({'notes': recognized_text, 'tldr':("Notes: "+tldr)})

        return jsonify({'text': recognized_text, 'tldr':tldr, 'message': 'Text recognized and stored successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/save_response', methods=['POST'])
def save_response():
    data = request.get_json()
   
    collection_id = data.get('collection_id')
    section_id = data.get('section_id')
    response = data.get('response')

    if not collection_id or not section_id:
        return jsonify({'error': 'Collection ID or Section id not provided'})

    parser = PlaintextParser.from_string(response, Tokenizer("english"))
    summarizer = LsaSummarizer()
    tldr = summarizer(parser.document, sentences_count=1)  
    tldr = " ".join(str(sentence) for sentence in tldr)


    responses = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('saved_responses').document()
    responses.set({
        'data': response,
        'tldr': tldr
    })
    return jsonify({'success'}), 200

@app.route('/get_saved_responses', methods=['GET'])
def get_saved_responses():
    collection_id = request.args.get('collection_id')
    section_id = request.args.get('section_id')

    if not collection_id or not section_id:
        return jsonify({'error': 'Collection ID or Section ID not provided'}), 400

    try:
        notes = []
        notes_docs = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('saved_responses').stream()
        for doc in notes_docs:
            note_data = doc.to_dict()
            note_data['id'] = doc.id
            notes.append(note_data)
        return jsonify({'notes': notes}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/delete_response', methods=['DELETE'])
def delete_response():
    collection_id = request.args.get('collection_id')
    section_id = request.args.get('section_id')
    response_id = request.args.get('response_id')

    if not collection_id or not section_id or not response_id:
        return jsonify({'error': 'Collection ID, Section ID, or Response ID not provided'}), 400

    try:
        db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('saved_responses').document(response_id).delete()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/add_response_to_notes', methods=['POST'])
def add_to_notes():
    data = request.get_json()
    collection_id = data.get('collection_id')
    section_id = data.get('section_id')
    response_id = data.get('response_id')

    if not collection_id or not section_id or not response_id:
        return jsonify({'error': 'Collection ID, Section ID, or Response ID not provided'}), 400

    try:
        response_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('saved_responses').document(response_id)
        response_doc = response_ref.get()

        if response_doc.exists:
            response_data = response_doc.to_dict()

            notes_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section').document()
            notes_ref.set({
                'notes': response_data['data'],
                'tldr': response_data['Saved Response: '+'tldr']
            })

            response_ref.delete()

            return jsonify({'success': True}), 200
        else:
            return jsonify({'error': 'Response not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate_qna', methods=['POST'])
async def generate_qna():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    collection_id = data.get('collection_id')
    section_id = data.get('section_id')
    num_questions = data.get('num_questions')

    if not num_questions:
        return jsonify({'error': 'Number of questions not provided'}), 400

    if not collection_id or not section_id:
        return jsonify({'error': 'Collection ID or Section ID not provided'}), 400

    try:
        notes_docs = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section').stream()
        all_text = ''
        for doc in notes_docs:
            note_data = doc.to_dict().get('notes', '')
            all_text += note_data + ' '

        if not all_text:
            return jsonify({'error': 'No notes found in the specified section'}), 404

        keywords = await get_keywords(all_text, 't')
        qa_pairs = []
        answer_dict = OrderedDict()

        for answer, context in keywords:
            if len(qa_pairs) >= num_questions:
                break
            question = await generate_question(context, answer)
            # if answer not in answer_dict:
            #     answer_dict[answer] = question
            #     qa_pairs.append({'question': question, 'answer': answer})
            answer_dict[answer] = question
            qa_pairs.append({'question': question, 'answer': answer})

        return jsonify({'qa_pairs': qa_pairs}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


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


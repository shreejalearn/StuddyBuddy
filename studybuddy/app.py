from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from PIL import Image
import pytesseract
import io
import logging
import os
import asyncio
import PyPDF2
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
import uuid
import re
import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from fastcore.all import *
from gtts import gTTS
from moviepy.editor import ImageSequenceClip, AudioFileClip, concatenate_videoclips, concatenate_audioclips
# from gensim.models import Word2Vec

import sys
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

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


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
logging.basicConfig(level=logging.DEBUG)

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Initialize Firebase Admin SDK
cred = credentials.Certificate("serviceKey.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()

# @app.route('/get_my_collections', methods=['GET'])
@app.route('/get_my_collections')
def get_my_collections():
    try:
        username = request.args.get('username')
        if not username:
            return jsonify({'error': 'Username not provided'})

        collections = []
        collection_docs = db.collection('collections').where('username', '==', username).stream()
        for doc in collection_docs:
            title = doc.to_dict().get('data', {}).get('title', '')
            collections.append({'id': doc.id, 'title': title})

        return jsonify({'collections': collections})
    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({'error': str(e)})


@app.route('/get_video_paths', methods=['GET'])
def get_video_paths():
    collection_id = request.args.get('collection_id')
    section_id = request.args.get('section_id')
    
    if not collection_id or not section_id:
        return jsonify({'error': 'Collection ID or Section ID not provided'}), 400

    video_paths = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('videos').stream()
    video_paths_list = [video.to_dict() for video in video_paths]
    
    return jsonify({'videoPaths': video_paths_list})

def extract_main_concepts(text):
    # Process the text with spaCy
    doc = nlp(text)
    
    # Initialize an empty list to store main concepts
    main_concepts = []
    
    # Iterate over each noun chunk in the document
    for chunk in doc.noun_chunks:
        # Extract the text of the noun chunk
        chunk_text = chunk.text.strip()
        # Extract only the first word as the main concept
        main_concept = re.match(r'^\w+', chunk_text)
        if main_concept:
            main_concepts.append(main_concept.group())
    
    return main_concepts
def generate_audio(text):
    tts = gTTS(text=text, lang='en')
    return tts

# Function to search for images based on a given term
def search_images(term, max_images=30):
    print(f"Searching for '{term}'")
    ddgs = DDGS()
    return L(ddgs.images(keywords=term, max_results=max_images)).itemgot('image')

# Function to download an image from a URL
def download_image(url, folder):
    filename = os.path.join(folder, os.path.basename(url))
    with open(filename, 'wb') as f:
        response = requests.get(url)
        f.write(response.content)
    return filename

def resize_images(image_paths, output_folder, target_size=(1280, 720)):
    resized_paths = []
    
    # Create the output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    for image_path in image_paths:
        image = Image.open(image_path)
        image = image.resize(target_size)  # Apply anti-aliasing here
        resized_path = os.path.join(output_folder, os.path.basename(image_path))
        image.save(resized_path)
        resized_paths.append(resized_path)
    
    return resized_paths

def calculate_reading_time(text, wpm=200):
    words = len(text.split())
    reading_time_minutes = words / wpm
    return reading_time_minutes * 60  # convert to seconds

@app.route('/generate_video_from_notes', methods=['POST'])
def generate_video_from_notes():
    try:
        collection_id = request.json.get('collection_id')
        section_id = request.json.get('section_id')
        selected_notes = request.json.get('selected_notes')
        
        if not collection_id or not section_id or not selected_notes:
            return jsonify({'error': 'Collection ID, Section ID, or Note IDs not provided'}), 400

        
        response = ""
        for note in selected_notes:
            response += note
        print(f"Constructed response: {response}")
# Parse the response and extract concept names, search phrases, and summaries
        matches = re.findall(r"\*\*([^*]+)\*\*:.*?Search\s*phrases:\s*\"(.*?)\".*?Summary:\s*(.*?)(?:\[|$)", response)

        print('matches: '+str(matches))
        # Create a dictionary to store the concepts, search phrases, and summaries
        concepts = {}

        # Populate the dictionry with the extracted information
        for match in matches:
            concept_name = match[0].strip()
            search_phrases = match[1].strip().split('", "')
            summary = match[2].strip()
            concepts[concept_name] = {"search_phrases": search_phrases, "summary": summary}

        # Create a list to store the paths of downloaded images
        image_paths = []

        # Fetch relevant images for each concept
        for concept, data in concepts.items():
            concept_images = []
            for phrase in data["search_phrases"]:
                images = search_images(phrase, max_images=1)
                if images:
                    concept_images.append(images[0])
            concepts[concept]["images"] = concept_images

            # Download images
            print(f"Downloading images for concept: {concept}")
            concept_folder = os.path.join(os.getcwd(), "images", concept)
            os.makedirs(concept_folder, exist_ok=True)
            for i, image_url in enumerate(data['images']):
                image_path = download_image(image_url, concept_folder)
                image_paths.append(image_path)
                print(f"Downloaded image {i + 1}: {image_path}")

        # Resize the downloaded images
        image_paths = resize_images(image_paths, "resized_images")

        # Process each concept and its summary
        concept_audio_paths = []
        concept_video_clips = []

        for concept, data in concepts.items():
            summary = data["summary"]
            images = data["images"]
            image_durations = []
            image_clips = []

            # Generate audio for the summary
            tts = generate_audio(summary)
            audio_path = f"audio_{concept}.mp3"
            tts.save(audio_path)
            concept_audio_paths.append(audio_path)

            # Load the audio file to get its duration
            audio_clip = AudioFileClip(audio_path)
            audio_duration = audio_clip.duration

            # Calculate duration for each image
            duration_per_image = audio_duration / len(images)
            for i, image in enumerate(images):
                image_path = os.path.join("resized_images", os.path.basename(image))
                image_clips.append((image_path, duration_per_image))

            # Create video clips for each image with the respective duration
            for image_path, duration in image_clips:
                img_clip = ImageSequenceClip([image_path], durations=[duration])
                concept_video_clips.append(img_clip)

        # Concatenate all video clips and set the audio
        final_video_clip = concatenate_videoclips(concept_video_clips)
        final_audio_clip = concatenate_audioclips([AudioFileClip(p) for p in concept_audio_paths])
        final_video_clip = final_video_clip.set_audio(final_audio_clip)

        # Write the final video file
        output_video_path = "output_video.mp4"
        final_video_clip.write_videofile(output_video_path, fps=24)

        return jsonify({'video_path': 'final_video.mp4'})

    except Exception as e:
        print(f"Error generating video: {e}")
        return jsonify({'error': str(e)}), 500





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
        return jsonify({'error': 'Username not provided'}), 400

    collection_docs = db.collection('collections').where('username', '==', username).stream()

    collections = []

    for doc in collection_docs:
        collection_id = doc.id
        collection_name = doc.to_dict().get('data', {}).get('title', None)
        section_docs = db.collection('collections').document(collection_id).collection('sections').order_by('last_accessed', direction=firestore.Query.DESCENDING).limit(5).stream()
        
        for section_doc in section_docs:
            doc_data = section_doc.to_dict()

            title = doc_data.get('section_name', None)
            visibility = doc_data.get('visibility', None)
            access = doc_data.get('last_accessed', None)

            collections.append({
                'collection_id': collection_id,
                'id': section_doc.id,
                'title': title,
                'visibility': visibility,
                'access': access,
                'collName': collection_name

            })

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

@app.route('/process_text', methods=['POST'])
def process_text():
    collection_id = request.form.get('collection_id')
    section_id = request.form.get('section_id')
    raw_text = request.form.get('raw_text')
    parser = PlaintextParser.from_string(raw_text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    tldr = summarizer(parser.document, sentences_count=1)  

    tldr = " ".join(str(sentence) for sentence in tldr)


    try:
        notes_collection_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section')
        note_ref = notes_collection_ref.document()
        note_ref.set({'notes': raw_text, 'tldr': f"Raw Text: {tldr}"})
        
        return jsonify({'response': 'Raw text uploaded successfully'})
    except Exception as e:
        return jsonify({'error': str(e)})
    
# @app.route('/process_pdf', methods=['POST'])
# def process_pdf():
#     collection_id = request.form.get('collection_id')
#     section_id = request.form.get('section_id')
#     pdf_file = request.files.get('pdf_file')

#     if not pdf_file:
#         return jsonify({'error': 'No PDF file uploaded'}), 400

#     try:
#         # Read the PDF file
#         pdf_reader = PyPDF2.PdfFileReader(pdf_file)
#         text_content = ''
        
#         for page_num in range(pdf_reader.numPages):
#             page = pdf_reader.getPage(page_num)
#             text_content += page.extract_text()

#         # Save the text content to Firestore
#         notes_collection_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section')
#         note_ref = notes_collection_ref.document()
#         note_ref.set({'notes': text_content, 'tldr': "Text from PDF Uploaded"})
        
#         return jsonify({'response': 'PDF text uploaded successfully'})
#     except Exception as e:
#         return jsonify({'error': str(e)})

@app.route('/process_pdf', methods=['POST'])
def process_pdf():
    collection_id = request.form.get('collection_id')
    section_id = request.form.get('section_id')
    pdf_file = request.files.get('pdf_file')

    if not pdf_file:
        return jsonify({'error': 'No PDF file uploaded'}), 400

    try:
        # Read the PDF file
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text_content = ''
        
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text_content += page.extract_text()
            

        parser = PlaintextParser.from_string(text_content, Tokenizer("english"))
        summarizer = LsaSummarizer()
        tldr = summarizer(parser.document, sentences_count=1)  

        tldr = " ".join(str(sentence) for sentence in tldr)


        
        # Save the text content to Firestore
        notes_collection_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section')
        note_ref = notes_collection_ref.document()
        note_ref.set({'notes': text_content, 'tldr': f"PDF: {tldr}"})
        
        return jsonify({'response': 'PDF text uploaded successfully'}), 200
    except PyPDF2.utils.PdfReadError:
        return jsonify({'error': 'Failed to read PDF file'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/process_link', methods=['POST'])
def process_link():
    collection_id = request.form.get('collection_id')
    section_id = request.form.get('section_id')
    link = request.form.get('link')

    try:
        # Fetch the webpage content
        response = requests.get(link)
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract text content from the webpage
        text_content = ' '.join([p.text for p in soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])])

        parser = PlaintextParser.from_string(text_content, Tokenizer("english"))
        summarizer = LsaSummarizer()
        tldr = summarizer(parser.document, sentences_count=1)  

        tldr = " ".join(str(sentence) for sentence in tldr)

        # Save the text content to Firestore
        notes_collection_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section')
        note_ref = notes_collection_ref.document()
        note_ref.set({'notes': text_content, 'tldr': f"Text from Link: {tldr}"})
        
        return jsonify({'response': 'Text and headings uploaded successfully'})
    except Exception as e:
        return jsonify({'error': str(e)})

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
def get_notess(collection_id, section_id):
    notes_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section').stream()
    notes = [note.to_dict().get('notes', '') for note in notes_ref]
    return notes

@app.route('/get_notes', methods=['GET'])
def get_notes():
    section_id = request.args.get('section_id')

    if not section_id:
        return jsonify({'error': 'Section ID not provided'}), 400

    try:
        notes = []
        collections = db.collection('collections').stream()
        for collection in collections:
            notes_docs = db.collection('collections').document(collection.id).collection('sections').document(section_id).collection('notes_in_section').stream()
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
        collection_data = doc.to_dict()
        collection_data['id'] = doc.id
        collections.append(collection_data)

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

@app.route('/search_public_sections', methods=['GET'])
def search_public_sections():
    search_term = request.args.get('search_term')
    name = request.args.get('name')

    if not search_term:
        return jsonify({'error': 'Search term not provided'})

    public_sections = []
    
    section_docs = db.collection('collections').where('username', '!=', name).stream()
    for doc in section_docs:
        section_ref = doc.reference.collection('sections').where('visibility', '==', 'public').stream()
        for section_doc in section_ref:
            section_data = section_doc.to_dict()
            print("Section Data:", section_data)
            title = section_data.get('section_name', '')
            print("Title:", title)
            if search_term.lower() in title.lower():
                public_sections.append({'id': section_doc.id, 'title': title})

    return jsonify({'sections': public_sections})

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
            parser = PlaintextParser.from_string(response_data['data'], Tokenizer("english"))
            summarizer = LsaSummarizer()
            tldr = summarizer(parser.document, sentences_count=1)  

            tldr = " ".join(str(sentence) for sentence in tldr)

            print(tldr)

            notes_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section').document()
            notes_ref.set({
                'notes': response_data['data'],
                'tldr': f"Sydney AI Response: {tldr}"
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
@app.route('/clone_section', methods=['POST'])
def clone_section():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    section_id = data.get('sectionId')
    if not section_id:
        return jsonify({'error': 'Section ID not provided'}), 400

    try:
        # Query all collections to find the section
        collections = db.collection('collections').stream()
        for collection in collections:
            section_ref = collection.reference.collection('sections').document(section_id)
            section_doc = section_ref.get()
            if section_doc.exists:
                # Section found, retrieve associated notes
                notes_ref = section_ref.collection('notes_in_section')
                notes = [note.to_dict() for note in notes_ref.stream()]
                break
        else:
            # Section not found in any collection
            return jsonify({'error': 'Section not found'}), 404

        # Get the payload data
        add_to_existing = data.get('addToExisting')
        if add_to_existing is None:
            return jsonify({'error': 'Parameter "addToExisting" not provided'}), 400

        if add_to_existing:
            # Add to an existing collection
            collection_id = data.get('collectionId')
            if not collection_id:
                return jsonify({'error': 'Collection ID not provided'}), 400

            # Check if the specified collection exists
            collection_ref = db.collection('collections').document(collection_id)
            if not collection_ref.get().exists:
                return jsonify({'error': 'Collection not found'}), 404

            # Copy the section to the specified collection
            new_section_ref = collection_ref.collection('sections').document()
            new_section_ref.set(section_doc.to_dict())
            # Copy associated notes
            for note in notes:
                new_note_ref = new_section_ref.collection('notes_in_section').document()
                new_note_ref.set(note)

        else:
            # Create a new collection and add the section to it
            username = data.get('username')
            if not username:
                return jsonify({'error': 'Username not provided'}), 400

            collection_name = data.get('collectionName')
            if not collection_name:
                return jsonify({'error': 'Collection name not provided'}), 400

            # Create a new collection with the specified username and title
            new_collection_ref = db.collection('collections').document()
            new_collection_ref.set({'collectionIdentification':new_collection_ref.id,'username': username, 'data': {'title': collection_name}})

            # Copy the section to the new collection
            new_section_ref = new_collection_ref.collection('sections').document()
            new_section_ref.set(section_doc.to_dict())
            # Copy associated notes
            for note in notes:
                new_note_ref = new_section_ref.collection('notes_in_section').document()
                new_note_ref.set(note)

        return jsonify({'message': 'Section cloned successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
# @app.route('/recommend_sections', methods=['GET'])
# def recommend_sections():
#     username = request.args.get('username')
#     if not username:
#         return jsonify({'error': 'Username not provided'}), 400

#     # Retrieve the user's recent sections
#     user_sections = db.collection('collections').where('username', '==', username).stream()

#     recent_sections = []
#     for doc in user_sections:
#         collection_id = doc.id
#         section_docs = db.collection('collections').document(collection_id).collection('sections').order_by('last_accessed', direction=firestore.Query.DESCENDING).limit(5).stream()

#         for section_doc in section_docs:
#             doc_data = section_doc.to_dict()
#             recent_sections.append(section_doc.id)

#     # Find users with similar recent sections
#     similar_users = db.collection('collections').where('sections', 'array_contains_any', recent_sections).stream()

#     recommended_sections = []
#     for doc in similar_users:
#         if doc.to_dict()['username'] != username:  # Exclude current user
#             collection_id = doc.id
#             section_docs = db.collection('collections').document(collection_id).collection('sections').where('visibility', '==', 'public').stream()

#             for section_doc in section_docs:
#                 section_data = section_doc.to_dict()
#                 title = section_data.get('section_name', '')
#                 if section_doc.id not in recent_sections:  # Exclude sections user already has
#                     recommended_sections.append({'id': section_doc.id, 'title': title})

#     return jsonify({'recommended_sections': recommended_sections})

# app.route('/clone_section', methods=['POST'])
# def clone_section():
#     data = request.get_json()
#     if not data:
#         return jsonify({'error': 'No data provided'}), 400

#     section_id = data.get('sectionId')
#     add_to_existing = data.get('addToExisting', False)
#     collection_id = data.get('collectionId')  # If add_to_existing is True
#     collection_name = data.get('collectionName')  # If add_to_existing is False

#     if not section_id:
#         return jsonify({'error': 'Section ID not provided'}), 400

#     if not add_to_existing and not collection_name:
#         return jsonify({'error': 'Collection name not provided for creating a new collection'}), 400

#     try:
#         # Get the section data from the database based on the provided section_id
#         section_ref = db.collection('sections').document(section_id)
#         section_data = section_ref.get().to_dict()

#         if not section_data:
#             return jsonify({'error': 'Section not found'}), 404

#         if add_to_existing:
#             if not collection_id:
#                 return jsonify({'error': 'Collection ID not provided for adding to an existing collection'}), 400

#             # Add the cloned section to the specified existing collection
#             collection_ref = db.collection('collections').document(collection_id)
#             new_section_ref = collection_ref.collection('sections').document()
#             new_section_ref.set(section_data)
#             new_section_ref.headers.add('Access-Control-Allow-Origin', '*')  # Adjust the origin as needed

#             return jsonify({'message': 'Section cloned and added to the existing collection successfully', 'newSectionId': new_section_ref.id}), 500
#         else:
#             # Create a new collection and add the cloned section to it
#             new_collection_ref = db.collection('collections').document()
#             new_collection_name = collection_name.strip()
#             new_section_ref = new_collection_ref.collection('sections').document()
#             new_section_ref.set(section_data)
#             new_collection_ref.set({
#                 'name': new_collection_name,
#                 'sections': [new_section_ref.id]
#             })
#             new_collection_ref.headers.add('Access-Control-Allow-Origin', '*')  # Adjust the origin as needed

#             return jsonify({'message': 'Section cloned and added to a new collection successfully', 'newCollectionId': new_collection_ref.id, 'newSectionId': new_section_ref.id}), 500
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
# # Load pre-trained word embeddings model (you need to train or download one)
# word_embeddings_model = Word2Vec.load("word2vec.model")

# @app.route('/recommend_public_sections', methods=['GET'])
# def recommend_public_sections():
#     username = request.args.get('username')

#     if not username:
#         return jsonify({'error': 'Username not provided'}), 400

#     user_sections = []
#     public_sections = []

#     # Get user's sections
#     user_section_docs = db.collection('collections').where('username', '==', username).stream()
#     for doc in user_section_docs:
#         collection_id = doc.id
#         section_docs = db.collection('collections').document(collection_id).collection('sections').stream()
        
#         for section_doc in section_docs:
#             doc_data = section_doc.to_dict()
#             title = doc_data.get('section_name', '')
#             user_sections.append(title)

#     # Get public sections
#     section_docs = db.collection('collections').stream()
#     for doc in section_docs:
#         section_ref = doc.reference.collection('sections').where('visibility', '==', 'public').stream()
#         for section_doc in section_ref:
#             section_data = section_doc.to_dict()
#             title = section_data.get('section_name', '')
#             # Calculate semantic similarity using word embeddings
#             similarity_scores = [word_embeddings_model.wv.similarity(title.lower(), user_section.lower()) for user_section in user_sections]
#             average_similarity = sum(similarity_scores) / len(similarity_scores)
#             if average_similarity > 0.5:  # You can adjust this threshold based on your requirements
#                 public_sections.append({'id': section_doc.id, 'title': title, 'similarity': average_similarity})

#     # Sort recommended sections by similarity score
#     public_sections.sort(key=lambda x: x['similarity'], reverse=True)

#     return jsonify({'recommended_sections': public_sections})


if __name__ == '__main__':
    # app.run(host='localhost', port=5000, debug=True)
    app.run(debug=True, port=5000)
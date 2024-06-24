from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from PIL import Image
import pytesseract
import io
import logging
import os
import asyncio
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.tag import pos_tag
from nltk.corpus import wordnet
import random
import PyPDF2
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
import os
from sydney import SydneyClient
from dotenv import load_dotenv
import firebase_admin
from transformers import pipeline
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

import requests
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
from datetime import datetime
from nltk.tokenize import sent_tokenize
from sumy.summarizers.text_rank import TextRankSummarizer
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
from sklearn.metrics.pairwise import cosine_similarity

from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from fastcore.all import *
from gtts import gTTS
from moviepy.editor import ImageSequenceClip, AudioFileClip, concatenate_videoclips, concatenate_audioclips
# from gensim.models import Word2Vec
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.probability import FreqDist
from heapq import nlargest
import sys
import json
import wikipediaapi
from collections import Counter
import time
import requests

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Apply CORS to your Flask app

VIDEO_DIRECTORY = os.path.join(os.getcwd(), './vids')

load_dotenv()

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')
nltk.download('wordnet')


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
model_name = "t5-small"  # You can use "t5-base" for better quality but slower processing
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


ignore_warnings('ignore')

qa_pipeline = pipeline('question-answering', model='distilbert-base-cased-distilled-squad')

def summarize_text(text, num_sentences=1):
    return generate_single_sentence_summary(text, max_length=50, min_length=30)

def generate_single_sentence_summary(text, max_length=50, min_length=30):
 
    # Prepare the text input
    preprocess_text = text.strip().replace("\n", "")
    t5_prepared_Text = "summarize: " + preprocess_text

    # Tokenize the input text
    tokenized_text = tokenizer.encode(t5_prepared_Text, return_tensors="pt", max_length=512, truncation=True)

    # Generate summary
    summary_ids = model.generate(
        tokenized_text,
        max_length=max_length,
        min_length=min_length,
        length_penalty=2.0,
        num_beams=4,
        early_stopping=True
    )

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    # Ensure the summary is a single sentence
    summary_sentences = summary.split('. ')
    single_sentence_summary = summary_sentences[0] if summary_sentences else summary

    return single_sentence_summary

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
def check_profanity(text):
    url = "https://www.purgomalum.com/service/containsprofanity"
    params = {"text": text}
    response = requests.get(url, params=params)
    return response.text == 'true'

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
            print(e)
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

@app.route('/videos/<path:filename>')
def serve_video(filename):
    return send_from_directory(VIDEO_DIRECTORY, filename)


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
nlp = spacy.load("en_core_web_sm")

def generate_audio(text):
    tts = gTTS(text=text, lang='en')
    return tts

def search_images(term, max_images=30):
    print(f"Searching for '{term}'")
    ddgs = DDGS()
    return [result['image'] for result in ddgs.images(keywords=term, max_results=max_images)]


# def download_image(url, folder):
#     filename = os.path.join(folder, os.path.basename(url))
#     try:
#         response = requests.get(url)
#         response.raise_for_status()
#         with open(filename, 'wb') as f:
#             f.write(response.content)
#         # Verify the image
#         with Image.open(filename) as img:
#             img.verify()
#         return filename
#     except Exception as e:
#         print(f"Error downloading or verifying image {url}: {e}")
#         return None


def download_image(url, folder):
    try:
        # Ensure target folder exists
        os.makedirs(folder, exist_ok=True)

        # Construct filename from URL
        filename = os.path.join(folder, os.path.basename(url))

        # Download image using requests
        response = requests.get(url)
        response.raise_for_status()

        # Save image to file
        with open(filename, 'wb') as f:
            f.write(response.content)

        # Verify the image (optional)
        with Image.open(filename) as img:
            img.verify()

        return filename

    except requests.exceptions.HTTPError as e:
        if response.status_code == 403:
            print(f"Access forbidden for image {url}: {e}")
        else:
            print(f"HTTP error occurred while downloading image {url}: {e}")

    except requests.exceptions.RequestException as e:
        print(f"Error downloading image {url}: {e}")

    except Exception as e:
        print(f"Other error downloading image {url}: {e}")

    return None

def resize_images(image_paths, output_folder, target_size=(1280, 720)):
    resized_paths = []
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    for image_path in image_paths:
        if not os.path.exists(image_path):
            print(f"Image file {image_path} does not exist. Skipping.")
            continue
        try:
            image = Image.open(image_path)
            image = image.resize(target_size)
            resized_path = os.path.join(output_folder, os.path.basename(image_path))
            image.save(resized_path)
            resized_paths.append(resized_path)
        except Exception as e:
            print(f"Error processing image {image_path}: {e}")
    return resized_paths


def extract_concepts_and_summaries(text):
    concepts = {}
    current_concept = None
    current_search_phrases = []
    current_summary = []

    lines = text.strip().split('\n')
    for line in lines:
        line = line.strip()
        print(f"Processing line: {line}")
        if re.match(r'^\d+\.\s\*\*.*\*\*:$', line):  # Match lines like "1. **Creating Functions**:"
            if current_concept:
                concepts[current_concept] = {
                    "search_phrases": current_search_phrases,
                    "summary": ' '.join(current_summary)
                }
            current_concept = line.split('**')[1].strip()
            current_search_phrases = []
            current_summary = []
            print(f"New concept detected: {current_concept}")
        elif line.startswith("- Search phrases:"):
            phrases = re.findall(r'"(.*?)"', line)
            current_search_phrases.extend(phrases)
            print(f"Search phrases found: {current_search_phrases}")
        elif line.startswith("- Summary:"):
            current_summary.append(line.split(":", 1)[1].strip())
            print(f"Summary found: {current_summary}")
        else:
            if current_concept:
                current_summary.append(line.strip())
    
    if current_concept:
        concepts[current_concept] = {
            "search_phrases": current_search_phrases,
            "summary": ' '.join(current_summary)
        }
    
    return concepts

@app.route('/generate_video_from_notes', methods=['POST'])
def generate_video_from_notes():
    try:
        data = request.get_json()
        notes = data.get('notes')
        collection_id = data.get('collection_id')
        section_id = data.get('section_id')

        concepts = extract_concepts_and_summaries(notes)

        # Debugging: Print the extracted concepts and summaries
        print("Extracted Concepts and Summaries:")
        for concept, data in concepts.items():
            print(f"Concept: {concept}")
            print(f"Search Phrases: {data['search_phrases']}")
            print(f"Summary: {data['summary']}")
            print("-----")

        # Exit if no concepts were extracted
        if not concepts:
            print("No concepts were extracted. Exiting.")
            return

        image_paths = []

        for concept, data in concepts.items():
            concept_images = []
            for phrase in data["search_phrases"]:
                images = search_images(phrase, max_images=1)
                if images:
                    concept_images.append(images[0])
            concepts[concept]["images"] = concept_images

            print(f"Downloading images for concept: {concept}")
            concept_folder = os.path.join(os.getcwd(), "images", concept)
            os.makedirs(concept_folder, exist_ok=True)
            for i, image_url in enumerate(data['images']):
                image_path = download_image(image_url, concept_folder)
                if image_path:
                    image_paths.append(image_path)
                    print(f"Downloaded image {i + 1}: {image_path}")

        image_paths = resize_images(image_paths, "resized_images")

        concept_audio_paths = []
        concept_video_clips = []

        for concept, data in concepts.items():
            summary = data["summary"]
            images = data["images"]
            image_durations = []
            image_clips = []

            tts = generate_audio(summary)
            audio_path = f"audio_{concept}.mp3"
            tts.save(audio_path)
            concept_audio_paths.append(audio_path)

            audio_clip = AudioFileClip(audio_path)
            audio_duration = audio_clip.duration

            if len(images) > 0:
                duration_per_image = audio_duration / len(images)
            else:
                # Handle the case where there are no images (perhaps raise an error or handle gracefully)
                duration_per_image = 0  # or any other default value or error handling mechanism
            for i, image in enumerate(images):
                image_path = os.path.join("resized_images", os.path.basename(image))
                if os.path.exists(image_path):
                    image_clips.append((image_path, duration_per_image))

            for image_path, duration in image_clips:
                img_clip = ImageSequenceClip([image_path], durations=[duration])
                concept_video_clips.append(img_clip)

        final_video_clip = concatenate_videoclips(concept_video_clips)
        final_audio_clip = concatenate_audioclips([AudioFileClip(p) for p in concept_audio_paths])
        final_video_clip = final_video_clip.set_audio(final_audio_clip)

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")


        output_video_path = f"{collection_id}_{section_id}_final_video_{timestamp}.mp4"
        final_video_clip.write_videofile(f"./vids/{output_video_path}", fps=24)
        db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('videos').add({'video_path': output_video_path})

        return jsonify({'video_path': output_video_path})

    except Exception as e:
        print(f"Error generating video: {e}")
        return jsonify({'error': str(e)}), 500



def suggest_learning_path(explorations, max_suggestions=10, max_retries=3):
    wiki_wiki = wikipediaapi.Wikipedia(
        language='en',
        extract_format=wikipediaapi.ExtractFormat.WIKI,
        user_agent='studybuddy-app/1.0'
    )

    concept_counter = Counter()
    learning_keywords = ['concept', 'theory', 'principle', 'method', 'technique', 'algorithm', 'framework', 'model', 'paradigm', 'approach']

    for exploration in explorations:
        for attempt in range(max_retries):
            try:
                page = wiki_wiki.page(exploration)
                if page.exists():
                    # Process sections
                    for section in page.sections:
                        if any(keyword in section.title.lower() for keyword in learning_keywords):
                            concept_counter[section.title] += 2
                    
                    # Process links
                    for link in page.links.values():
                        if any(keyword in link.title.lower() for keyword in learning_keywords):
                            concept_counter[link.title] += 1
                break  # If successful, break the retry loop
            except (requests.exceptions.RequestException, wikipediaapi.WikipediaException) as e:
                if attempt < max_retries - 1:
                    print(f"Error occurred: {e}. Retrying in 5 seconds...")
                    time.sleep(5)
                else:
                    print(f"Failed to process '{exploration}' after {max_retries} attempts.")

    # Ensure we have at least max_suggestions
    while len(concept_counter) < max_suggestions:
        concept_counter[f"Explore more about {explorations[len(concept_counter) % len(explorations)]}"] += 1

    # Get top suggestions
    suggested_concepts = [concept for concept, _ in concept_counter.most_common(max_suggestions)]

    return suggested_concepts


def get_antonym(word):
    antonyms = []
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            if lemma.antonyms():
                antonyms.append(lemma.antonyms()[0].name())
    return antonyms[0] if antonyms else None

def generate_tf_questions(text, num_questions=10):
    sentences = sent_tokenize(text)
    questions = []

    for sentence in sentences:
        # Generate a true question
        questions.append((f"True or False: {sentence}", True))

        words = word_tokenize(sentence)
        tagged = pos_tag(words)

        # False question strategies
        strategies = [
            lambda: negate_verb(sentence, tagged),
            lambda: replace_with_antonym(sentence, tagged),
            lambda: change_quantity(sentence, tagged),
        ]

        false_question = None
        while not false_question and strategies:
            strategy = random.choice(strategies)
            false_question = strategy()
            strategies.remove(strategy)

        if false_question:
            questions.append((f"True or False: {false_question}", False))

    random.shuffle(questions)
    return questions[:num_questions]

def negate_verb(sentence, tagged):
    for i, (word, tag) in enumerate(tagged):
        if tag.startswith('VB'):
            if word.lower() in ['is', 'are', 'was', 'were']:
                return sentence[:sentence.index(word)] + word + " not" + sentence[sentence.index(word)+len(word):]
            elif word.lower() == 'have':
                return sentence[:sentence.index(word)] + "do not have" + sentence[sentence.index(word)+len(word):]
            else:
                return sentence[:sentence.index(word)] + "does not " + word + sentence[sentence.index(word)+len(word):]
    return None

def replace_with_antonym(sentence, tagged):
    for word, tag in tagged:
        if tag.startswith('JJ') or tag.startswith('RB'):
            antonym = get_antonym(word)
            if antonym:
                return sentence.replace(word, antonym)
    return None

def change_quantity(sentence, tagged):
    quantity_words = {'all': 'some', 'every': 'some', 'always': 'sometimes', 'never': 'sometimes'}
    for word, _ in tagged:
        if word.lower() in quantity_words:
            return sentence.replace(word, quantity_words[word.lower()])
    return None


def generate_tf(notes, num_questions):
    questions = generate_tf_questions(notes, num_questions)

    tf_questions = []

    for question, answer in questions:
        tf_questions.append({'question': question, 'answer': 'True' if answer else 'False'})

    return tf_questions
@app.route('/generate_tf_questions', methods=['POST'])
def generate_tf_questions_endpoint():
    try:
        request_data = request.get_json()
        section_id = request_data.get('section_id', '')

        notes=note_getter(section_id)

        num_questions = request_data.get('num_questions', 10)
        
        tf_questions = generate_tf(notes, num_questions)

        return jsonify(tf_questions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


qa_pipeline = pipeline('question-answering', model='distilbert-base-cased-distilled-squad')
bert_tokenizer = BTokenizer.from_pretrained('bert-base-uncased')
bert_model = BModel.from_pretrained("bert-base-uncased")
sentence_model = SentenceTransformer('distilbert-base-nli-mean-tokens')
nlp = spacy.load("en_core_web_sm")

def generate_question_answer(sentence, answer):
    t5_model = T5ForConditionalGeneration.from_pretrained('ramsrigouthamg/t5_squad_v1')
    t5_tokenizer = AutoTokenizer.from_pretrained('ramsrigouthamg/t5_squad_v1')

    text = "context: {} answer: {}".format(sentence, answer)
    max_len = 256
    encoding = t5_tokenizer.encode_plus(text, max_length=max_len, pad_to_max_length=False, truncation=True, return_tensors="pt")

    input_ids, attention_mask = encoding["input_ids"], encoding["attention_mask"]

    outputs = t5_model.generate(input_ids=input_ids,
                                 attention_mask=attention_mask,
                                 early_stopping=True,
                                 num_beams=5,
                                 num_return_sequences=1,
                                 no_repeat_ngram_size=2,
                                 max_length=300)

    decoded_outputs = [t5_tokenizer.decode(ids, skip_special_tokens=True) for ids in outputs]

    question = decoded_outputs[0].replace("question:", "")
    question = question.strip()

    answer_output = qa_pipeline(question=question, context=sentence)

    return question, answer_output['answer']



def generate_question(sentence, answer):
  t5_model = T5ForConditionalGeneration.from_pretrained('ramsrigouthamg/t5_squad_v1')
  t5_tokenizer = AutoTokenizer.from_pretrained('ramsrigouthamg/t5_squad_v1')

  text = "context: {} answer: {}".format(sentence,answer)
  max_len = 256
  encoding = t5_tokenizer.encode_plus(text,max_length=max_len, pad_to_max_length=False,truncation=True, return_tensors="pt")

  input_ids, attention_mask = encoding["input_ids"], encoding["attention_mask"]

  outputs = t5_model.generate(input_ids=input_ids,
                                  attention_mask=attention_mask,
                                  early_stopping=True,
                                  num_beams=5,
                                  num_return_sequences=1,
                                  no_repeat_ngram_size=2,
                                  max_length=300)

  decoded_outputs = [t5_tokenizer.decode(ids,skip_special_tokens=True) for ids in outputs]

  question = decoded_outputs[0].replace("question:","")
  question = question.strip()
  return question


def calculate_embedding(doc):
  bert_tokenizer = BTokenizer.from_pretrained('bert-base-uncased')
  bert_model = BModel.from_pretrained("bert-base-uncased")
  
  tokens = bert_tokenizer.tokenize(doc)
  token_ids = bert_tokenizer.convert_tokens_to_ids(tokens)
  segment_ids = [1] * len(tokens)

  torch_tokens = torch.tensor([token_ids])
  torch_segments = torch.tensor([segment_ids])

  return bert_model(torch_tokens, torch_segments)[-1].detach().numpy()

def get_parts_of_speech(context):
  doc = nlp(context)
  pos_tags = [token.pos_ for token in doc]
  return pos_tags, context.split()

def get_sentences(context):
  doc = nlp(context)
  return list(doc.sents)

def get_vectorizer(doc):
  stop_words = "english"
  n_gram_range = (1,1)
  vectorizer = CountVectorizer(ngram_range = n_gram_range, stop_words = stop_words).fit([doc])
  return vectorizer.get_feature_names_out()

def get_keywords(context, module_type = 't'):
  keywords = []
  top_n = 5
  for sentence in get_sentences(context):
    key_words = get_vectorizer(str(sentence))
    print(f'Vectors : {key_words}')
    if module_type == 't':
      sentence_embedding = calculate_embedding(str(sentence))
      keyword_embedding = calculate_embedding(' '.join(key_words))
    else:
      sentence_embedding = sentence_model.encode([str(sentence)])
      keyword_embedding = sentence_model.encode(key_words)
    
    distances = cosine_similarity(sentence_embedding, keyword_embedding)
    print(distances)
    keywords += [(key_words[index], str(sentence)) for index in distances.argsort()[0][-top_n:]]

  return keywords


@app.route('/generate_frq', methods=['POST'])
def generate_frq():
    try:
        request_data = request.get_json()
        section_id = request_data.get('section_id', '')
        num_questions = int(request_data.get('num_questions',''))
        notes=note_getter(section_id)
        txt=notes
        qa_pairs = []

        for answer, context in get_keywords(txt, 'st'):
            question, generated_answer = generate_question_answer(context, answer)
            qa_pairs.append({'question': question, 'answer': generated_answer})
            if len(qa_pairs) >= num_questions:
                break  # Stop generating questions once the desired number is reached


        return jsonify(qa_pairs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_combined_questions(num_tf, num_frq, notes):
    tf_questions = generate_tf(notes, num_questions=num_tf)
    frq_questions = generate_frq(notes)[:num_frq]  # Limit FRQ questions to num_frq

    combined_questions = tf_questions + frq_questions

    return combined_questions

@app.route('/generate_questions', methods=['POST'])
def generate_questions():
    if request.is_json:
        request_data = request.get_json()
        print(f'Received request data: {request_data}')
        num_tf = request_data.get('num_tf', 10)  # Default to 10 if not provided
        num_frq = request_data.get('num_frq', 10)  # Default to 10 if not provided
        notes = request_data.get('notes', '')
        section_id = request_data.get('section_id', '')

        notes = note_getter(section_id)

        combined_questions = generate_combined_questions(num_tf, num_frq, notes)

        return jsonify({'questions': combined_questions})
    else:
        return jsonify({'error': 'Request must be JSON'}), 415
def note_getter(section_id):
    notes = []
    try:
        # Query collections and fetch notes for the given section_id
        collections = db.collection('collections').stream()
        for collection in collections:
            notes_docs = db.collection('collections').document(collection.id).collection('sections').document(section_id).collection('notes_in_section').stream()
            for doc in notes_docs:
                note_data = doc.to_dict()
                notes.append(note_data.get('notes', ''))  # Ensure 'notes' field is correctly fetched
    except Exception as e:
        print(f"Error fetching notes: {e}")
    concatenated_notes = ' '.join(notes)
    return concatenated_notes
@app.route('/suggest_sections', methods=['GET'])
def suggest_sections():
    collection_id = request.args.get('collection_id')
    if not collection_id:
        return jsonify({'error': 'Collection ID not provided'})

    suggestions = []

    try:
        # Assuming you have a 'sections' collection under each 'collection'
        sections_ref = db.collection('collections').document(collection_id).collection('sections')
        sections_docs = sections_ref.stream()

        for doc in sections_docs:
            # Assuming 'section_name' is a field in your section document
            section_name = doc.to_dict().get('section_name', '')
            suggestions.append({'name': section_name})

        suggested_concepts = suggest_learning_path([section['name'] for section in suggestions], max_suggestions=5)

        # Prepare the response in the correct format
        suggested_sections = [{'name': concept} for concept in suggested_concepts]

        return jsonify({'suggested_sections': suggested_sections})

    except Exception as e:
        return jsonify({'error': str(e)})

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
@app.route('/create_review', methods=['POST'])
def create_review():
    try:
        data = request.get_json()
        collection_id = data.get('collection_id')
        section_ids = data.get('section_ids')
        name = data.get('name')
        if(check_profanity(name)):
            return jsonify({'error':'Profanity detected'}), 400
        username = data.get('username')
        if not collection_id or not section_ids or not name or not username:
            return jsonify({'error': 'Missing required parameters'}), 400

        new_section_ref = db.collection('collections').document(collection_id).collection('sections').document()
        new_section_ref.set({'section_name': name, 'visibility': 'public'})  # Set section name

        for section_id in section_ids:
            # Get the section document
            section_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id)
            section_doc = section_ref.get()
            if not section_doc.exists:
                return jsonify({'error': 'Section not found'}), 404

            # Copy notes from the existing section to the new section
            notes_ref = section_ref.collection('notes_in_section')
            for note in notes_ref.stream():
                new_note_ref = new_section_ref.collection('notes_in_section').document()
                new_note_ref.set(note.to_dict())

        return jsonify({'message': 'Review created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/delete_collection', methods=['DELETE'])
def delete_collection():
    data = request.get_json()

    collection_id = data.get('collection_id')

    if not collection_id:
        return jsonify({'error': 'Collection ID'}), 400

    try:
        note_ref = db.collection('collections').document(collection_id)
        note_ref.delete()
        return jsonify({'message': 'Note deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/delete_section', methods=['DELETE'])
def delete_section():
    data = request.get_json()

    section_id = data.get('section_id')
    collection_id = data.get('collection_id')

    if not collection_id or not section_id:
        return jsonify({'error': 'something not provided'}), 400

    try:
        note_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id)
        note_ref.delete()
        return jsonify({'message': 'Note deleted successfully'}), 200
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

@app.route('/delete_worksheet', methods=['DELETE'])
def delete_worksheet():
    collection_id = request.args.get('collection_id')
    section_id = request.args.get('section_id')
    note_id = request.args.get('worksheet_id')

    if not collection_id or not section_id or not note_id:
        return jsonify({'error': 'Collection ID, Section ID, or Worksheet ID not provided'}), 400

    try:
        note_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('worksheets').document(note_id)
        note_ref.delete()
        return jsonify({'message': 'Worksheet deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/ask_specific', methods=['POST'])
async def ask_specific():
    collection_id = request.json.get('collection_id')
    section_id = request.json.get('section_id')
    selected_notes = request.json.get('selected_notes')
        
    if not collection_id or not section_id or not selected_notes:
        return jsonify({'error': 'Collection ID, Section ID, or Note IDs not provided'}), 400

    response = ""
    for note in selected_notes:
        response += note

    loop = asyncio.get_event_loop()
    examp = '''
        1. **Main Concept**:
            - Search phrases: "," "," "," "."
            - Summary: 
        2. **Main Concept**:
                    - Search phrases: "," "," "," "."
                    - Summary: 
        3. **Main Concept**:
                    - Search phrases: "," "," "," "."
                    - Summary: 
        4. **Main Concept**:
                    - Search phrases: "," "," "," "."
                    - Summary: 

      
    '''

    response_task = await ask_sydney_with_retry("I am generating a video based on these notes that I have: " + response + ". Give me search phrases to generate meaningful pictures from the main concepts and a summary, it should have the same format as this example: " + examp)
    # print(response_task)
    # video_task = generate_video_from_notes(str(response_task))


    return jsonify({'response': response_task})
@app.route('/answer_question', methods=['GET','POST'])
def answer_question():
    data = request.json  
    username = data.get('username')
    user_class = data.get('class')
    question = data.get('data')
    if(check_profanity(question)):
            return jsonify({'error':'Profanity detected'}), 400

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

@app.route('/add_res_to_flashcards', methods=['POST'])
def add_res_to_flashcards():
    data = request.json
    question = data.get('question')
    answer = data.get('answer')
    collection_id = data.get('collection_id')
    section_id = data.get('section_id')
    if(check_profanity(question)):
            return jsonify({'error':'Profanity detected'}), 400
    if(check_profanity(answer)):
            return jsonify({'error':'Profanity detected'}), 400

    tldr = summarize_text(answer)

    if not collection_id or not section_id or not question or not answer:
        return jsonify({'error': 'Invalid request data. Make sure all fields are provided.'}), 400

    try:
        # Ensure Firestore client is properly initialized
        if not db:
            return jsonify({'error': 'Firestore is not initialized.'}), 500

        # Ensure 'flashcards' collection exists (create it if not)
        flashcards_collection_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('flashcards')

        # Add flashcard document
        flashcard_doc_ref = flashcards_collection_ref.document()
        flashcard_doc_ref.set({'question': question, 'answer': tldr})

        return jsonify({'response': 'Flashcard uploaded successfully'}), 200
    except Exception as e:
        # Log the full stack trace for debugging purposes
        import traceback
        traceback.print_exc()

        return jsonify({'error': str(e)}), 500
    
@app.route('/suggestflashcards', methods=['POST'])
async def suggestflashcards():
    request_data = request.get_json()
    collection_id = request_data.get('collectionId')
    section_id = request_data.get('sectionId')
    notes_docs = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section').stream()
    all_text = ''
    for doc in notes_docs:
        note_data = doc.to_dict().get('notes', '')
        all_text += note_data + ' '
    question = f"Task: Generate 10 flashcards based on the following notes. The target is to help the student learn and remember key aspects of the notes. Notes: {all_text} Format: Question: [Your question here] Answer: [Your answer here]"
    flashcards=[]
    response_task = await ask_sydney_with_retry(question)
    pattern = r'\*\*(.*?)\*\*:\n((?:   - .*?\n)*)'
    pairs = re.findall(pattern, response_task, re.MULTILINE)

    for pair in pairs:
        question = pair[0].strip()
        answer = '\n'.join(bullet.strip() for bullet in pair[1].strip().split('\n'))
        flashcards.append({'question': question, 'answer': answer})

    return jsonify({'response': flashcards}), 200


    

@app.route('/addflashcard', methods=['POST'])
def addflashcard():
    request_data = request.get_json()

    collection_id = request_data.get('collectionId')
    section_id = request_data.get('sectionId')
    question = request_data.get('question')
    answer = request_data.get('answer')
    if(check_profanity(question)):
            return jsonify({'error':'Profanity detected'}), 400
    if(check_profanity(answer)):
            return jsonify({'error':'Profanity detected'}), 400
    if not collection_id or not section_id or not question or not answer:
        return jsonify({'error': 'Invalid request data. Make sure all fields are provided.'}), 400

    try:
        # Ensure Firestore client is properly initialized
        if not db:
            return jsonify({'error': 'Firestore is not initialized.'}), 500

        # Ensure 'flashcards' collection exists (create it if not)
        flashcards_collection_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('flashcards')

        # Add flashcard document
        flashcard_doc_ref = flashcards_collection_ref.document()
        flashcard_doc_ref.set({'question': question, 'answer': answer})

        return jsonify({'response': 'Flashcard uploaded successfully'}), 200
    except Exception as e:
        # Log the full stack trace for debugging purposes
        import traceback
        traceback.print_exc()

        return jsonify({'error': str(e)}), 500



@app.route('/process_text', methods=['POST'])
def process_text():
    collection_id = request.form.get('collection_id')
    section_id = request.form.get('section_id')
    raw_text = request.form.get('raw_text')
    if(check_profanity(raw_text)):
            return jsonify({'error':'Profanity detected'}), 400
    tldr = summarize_text(raw_text)


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
            

        if(check_profanity(text_content)):
            return jsonify({'error':'Profanity detected'}), 400
        tldr = summarize_text(text_content)

        
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

        tldr = summarize_text(text_content)

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
    if(check_profanity(section_name)):
            return jsonify({'error':'Profanity detected'}), 400

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
    if(check_profanity(prompt)):
            return jsonify({'error':'Profanity detected'}), 400

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


@app.route('/get_flashcards', methods=['GET'])
def get_flashcards():
    section_id = request.args.get('section_id')
    collection_id = request.args.get('collection_id')

    if not section_id or not collection_id:
        return jsonify({'error': 'Section ID not provided'}), 400

    try:
        notes = []
        notes_docs = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('flashcards').stream()
        for doc in notes_docs:
            note_data = doc.to_dict()
            note_data['id'] = doc.id
            notes.append(note_data)
        return jsonify({'flashcards': notes}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/get_flashcards_frq', methods=['POST'])
def get_flashcards_frq():
    data = request.get_json()
    section_id = data.get('section_id')
    collection_id = data.get('collection_id')
    num_questions = data.get('num_questions')
    if not section_id:
        return jsonify({'error': 'Section ID not provided'}), 400

    if not collection_id:
        return jsonify({'error': 'Collection ID not provided'}), 400
    
    num_questions = int(num_questions)

    try:
        notes = []
        notes_docs = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('flashcards').stream()
        for doc in notes_docs:
            note_data = doc.to_dict()
            note_data['id'] = doc.id
            notes.append(note_data)

        if len(notes) == 0:
            return jsonify({'error': 'No flashcards found'}), 404

        flashcards = [{'question': note['question'], 'answer': note['answer']} for note in notes]

        if num_questions > len(flashcards):
            num_questions = len(flashcards)

        random_flashcards = random.sample(flashcards, num_questions)

        return jsonify({'flashcards': random_flashcards}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



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

model_name = "sentence-transformers/all-MiniLM-L6-v2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
similarity_pipeline = pipeline("feature-extraction", model=model, tokenizer=tokenizer)

@app.route('/compare_and_fetch_concepts', methods=['POST'])
def compare_and_fetch_concepts():
    data = request.json
    notes = data['notes']
    user_input = data['userInput']
    
    note_texts = [note['tldr'] + " " + note['notes'] for note in notes]
    user_embedding = similarity_pipeline(user_input)
    user_embedding = torch.tensor(user_embedding).mean(dim=1)

    results = []
    for note, note_text in zip(notes, note_texts):
        note_embedding = similarity_pipeline(note_text)
        note_embedding = torch.tensor(note_embedding).mean(dim=1)
        similarity = cosine_similarity(user_embedding, note_embedding)
        results.append({'note_id': note['id'], 'similarity': similarity})

    results.sort(key=lambda x: x['similarity'], reverse=True)

    concepts_mentioned = [note for note in results if note['similarity'] > 0.5]
    concepts_missed = [note for note in results if note['similarity'] <= 0.5]

    return jsonify({
        'concepts_mentioned': concepts_mentioned,
        'concepts_missed': concepts_missed
    })

@app.route('/create_collection', methods=['POST'])
def create_collection():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'})

    collection_name = data.get('collection_name')
    notes = data.get('notes', '')
    username = data.get('username')
    if(check_profanity(collection_name)):
            return jsonify({'error':'Profanity detected'}), 400

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


@app.route('/get_worksheets', methods=['GET'])
def get_worksheets():
    section_id = request.args.get('section_id')

    if not section_id:
        return jsonify({'error': 'Section ID not provided'}), 400

    try:
        notes = []
        collections = db.collection('collections').stream()
        for collection in collections:
            notes_docs = db.collection('collections').document(collection.id).collection('sections').document(section_id).collection('worksheets').stream()
            for doc in notes_docs:
                note_data = doc.to_dict()
                note_data['id'] = doc.id
                notes.append(note_data)
        return jsonify({'worksheets': notes}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/upload_worksheet', methods=['POST'])
def upload_worksheet():
    if 'worksheet' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    collection_id = request.form.get('collection_id')
    section_id = request.form.get('section_id')

    if not collection_id or not section_id:
        return jsonify({'error': 'Collection ID or Section ID not provided'}), 400

    image_file = request.files['worksheet']
    image_stream = io.BytesIO(image_file.read())
    image = Image.open(image_stream)

    recognized_text = pytesseract.image_to_string(image)
    if(check_profanity(recognized_text)):
            return jsonify({'error':'Profanity detected'}), 400
    try:
        notes_collection_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('worksheets')
        note_ref = notes_collection_ref.document()  
        tldr = summarize_text(recognized_text)

        note_ref.set({'worksheet': recognized_text, 'tldr': tldr})

        return jsonify({'text': recognized_text, 'tldr': tldr, 'message': 'Text recognized and stored successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
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
    if(check_profanity(recognized_text)):
            return jsonify({'error':'Profanity detected'}), 400
    
    try:
        notes_collection_ref = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section')
        note_ref = notes_collection_ref.document()  
        tldr = summarize_text(recognized_text)


        note_ref.set({'notes': recognized_text, 'tldr':("Notes: "+tldr)})

        return jsonify({'text': recognized_text, 'tldr':tldr, 'message': 'Text recognized and stored successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search_public_sections', methods=['GET'])
def search_public_sections():
    search_term = request.args.get('search_term')
    name = request.args.get('name')

    if(check_profanity(search_term)):
            return jsonify({'error':'Profanity detected'}), 400
    
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

    tldr = summarize_text(response)


    responses = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('saved_responses').document()
    responses.set({
        'data': response,
        'tldr': tldr
    })
    return jsonify({'success':'success'}), 200

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
@app.route('/create_section_from_recommendation', methods=['POST'])
def create_section_from_recommendation():
    data = request.get_json()
    print(data)
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    collection_id = data.get('collection_id')
    section_data = data.get('section_data')

    if not section_data:
        return jsonify({'error': 'Section data not provided'}), 400

    try:
        if collection_id:
            # Add to an existing collection
            collection_ref = db.collection('collections').document(collection_id)
            if not collection_ref.get().exists:
                return jsonify({'error': 'Collection not found'}), 404
        else:
            # Create a new collection
            username = data.get('username')
            if not username:
                return jsonify({'error': 'Username not provided'}), 400

            collection_name = data.get('collection_name')
            if not collection_name:
                return jsonify({'error': 'Collection name not provided'}), 400

            collection_ref = db.collection('collections').document()
            collection_ref.set({
                'collectionIdentification': collection_ref.id,
                'username': username,
                'data': {'title': collection_name}
            })

        # Create the new section
        new_section_ref = collection_ref.collection('sections').document()
        new_section_ref.set({
            'section_name': section_data['topicName'],
            'visibility':'public'
        })
        link=section_data['sources'][0]['url']
        response = requests.get(link)
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract text content from the webpage
        text_content = ' '.join([p.text for p in soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])])

        tldr = summarize_text(text_content)

        for source in section_data['sources']:
            new_note_ref = new_section_ref.collection('notes_in_section').document()
            new_note_ref.set({
                'notes': f"{text_content}",
                'tldr': tldr
            })

        return jsonify({'message': 'Section created successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

async def get_recommendations(username, recent_sections):
    async with SydneyClient() as sydney:

        # Construct the question string
        question = f'''Based on the user's most recently studied sections, here are their recent areas of focus: {recent_sections}. Can you find and provide 3 specific advanced topics, supplementary materials (books, articles, videos, and online resources including real-world applications) that they should explore further? Answer in this format:
        
        Recommended Topic 1:
        Topic Name:
        Topic Description:
        Sources:

        Recommended Topic 2:
        Topic Name:
        Topic Description:
        Sources:

        Recommended Topic 3:
        Topic Name:
        Topic Description:
        Sources:

        '''

        # Ask the question to the language model
        response = await sydney.ask(question, citations=True)
        return response


@app.route('/recommendations', methods=['GET'])
def get_recommendations_endpoint():
    username = request.args.get('username')
    recent_sections = request.args.getlist('recentSections')

    if not username:
        return jsonify({'error': 'Username not provided'}), 400

    recommendations = asyncio.run(get_recommendations(username, recent_sections))
    
    return jsonify({'recommendations': recommendations})

@app.route('/process_recommendations', methods=['GET'])
def process_recommendations():
    recommendations_text = request.args.get('recs')
    recommendations = []
    print("Received recommendations text:")
    print(recommendations_text)

    # Adjusted regex pattern to match the given text structure
    pattern = re.compile(
        r'\*\*(.*?)\*\*:\s*'                  # Topic Name
        r'- \*\*Topic\s*Description\*\*:\s*(.*?)'  # Topic Description
        r'- \*\*Sources\*\*:\s*'              # Sources label
        r'((?:- \[.*?\]\(.*?\)\s*)+)',        # One or more sources
        re.DOTALL
    )
    pattern1 = re.compile(
        r'\*\*Topic\s*Name\*\*:\s*(.*?)\n'           # Topic Name
        r'\*\*Topic\s*Description\*\*:\s*(.*?)\n'    # Topic Description
        r'\*\*Sources\*\*:\s*'                       # Sources label
        r'((?:- \[.*?\]\(.*?\)\n)+)',                # One or more sources
        re.DOTALL
    )
    pattern2 = re.compile(
        r'\d+\.\s\*\*(.*?)\*\*:\s*'           # Topic Title
        r'- \*\*Topic Name\*\*:\s*(.*?)\n'     # Topic Name
        r'- \*\*Topic Description\*\*:\s*(.*?)\n'  # Topic Description
        r'- \*\*Sources\*\*:\s*'               # Sources label
        r'((?:- \[.*?\]\(.*?\)\n)+)'           # One or more sources
    )
    pattern3 = re.compile(
        r'\*\*(.*?)\*\*:\s*'                  # Topic Title
        r'- \*\*Topic\s*Name\*\*:\s*(.*?)\n'  # Topic Name
        r'- \*\*Topic\s*Description\*\*:\s*(.*?)\n'  # Topic Description
        r'- \*\*Sources\*\*:\s*'               # Sources label
        r'((?:- \[.*?\]\(.*?\)\n)+)'           # One or more sources
    )
    pattern4 = re.compile(
        r'\d+\.\s\*\*(.*?)\*\*:\s*'                  # Topic Title
        r'- \*\*Topic\s*Name\*\*:\s*(.*?)\s*'         # Topic Name
        r'- \*\*Topic\s*Description\*\*:\s*(.*?)\s*'  # Topic Description
        r'- \*\*Sources\*\*:\s*'                      # Sources label
        r'((?:- \[.*?\]\(.*?\)\s*)+)',                # One or more sources
        re.DOTALL
    )

    matches = pattern.findall(recommendations_text)
    print("Regex matches:")
    print(matches)
    for match in matches:
        print("Processing match:")
        print(match)
        topic_name = match[0].strip()
        topic_description = match[1].strip()
        sources = re.findall(r'- \[(.*?)\]\((.*?)\)', match[2].strip())

        sources_list = [{'title': source[0], 'url': source[1]} for source in sources]

        recommendations.append({
            'topicName': topic_name,
            'topicDescription': topic_description,
            'sources': sources_list
        })
    if(len(recommendations)==0):
        matches = pattern1.findall(recommendations_text)
        print("Regex matches:")
        print(matches)
        for match in matches:
            print("Processing match:")
            print(match)
            topic_name = match[0].strip()
            topic_description = match[1].strip()
            sources = re.findall(r'- \[(.*?)\]\((.*?)\)\n', match[2].strip())

            sources_list = [{'title': source[0], 'url': source[1]} for source in sources]

            recommendations.append({
                'topicName': topic_name,
                'topicDescription': topic_description,
                'sources': sources_list
            })
    if(len(recommendations)==0):
        matches = pattern2.findall(recommendations_text)
        print("Regex matches:")
        print(matches)
        for match in matches:
            print("Processing match:")
            print(match)
            topic_title = match[0].strip()
            topic_name = match[1].strip()
            topic_description = match[2].strip()
            sources = re.findall(r'- \[(.*?)\]\((.*?)\)\n', match[3].strip())

            sources_list = [{'title': source[0], 'url': source[1]} for source in sources]

            recommendations.append({
                'topicTitle': topic_title,
                'topicName': topic_name,
                'topicDescription': topic_description,
                'sources': sources_list
            })
    if(len(recommendations)==0):
        matches = pattern3.findall(recommendations_text)
        print("Regex matches:")
        print(matches)
        for match in matches:
            print("Processing match:")
            print(match)
            topic_title = match[0].strip()
            topic_name = match[1].strip()
            topic_description = match[2].strip()
            sources = re.findall(r'- \[(.*?)\]\((.*?)\)\n', match[3].strip())

            sources_list = [{'title': source[0], 'url': source[1]} for source in sources]

            recommendations.append({
                'topicTitle': topic_title,
                'topicName': topic_name,
                'topicDescription': topic_description,
                'sources': sources_list
            })
    if(len(recommendations)==0):
        matches = pattern4.findall(recommendations_text)
        print("Regex matches:")
        print(matches)
        for match in matches:
            print("Processing match:")
            print(match)
            topic_title = match[0].strip()
            topic_name = match[1].strip()
            topic_description = match[2].strip()
            sources = re.findall(r'- \[(.*?)\]\((.*?)\)\s*', match[3].strip())

            sources_list = [{'title': source[0], 'url': source[1]} for source in sources]

            recommendations.append({
                'topicTitle': topic_title,
                'topicName': topic_name,
                'topicDescription': topic_description,
                'sources': sources_list
            })

    print("Processed recommendations:")
    print(recommendations)
    return jsonify({'recommendations': recommendations})



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
           
            tldr = summarize_text(response_data['data'])

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
@app.route('/get_all_public_sections', methods=['GET'])
def get_all_public_sections():
    public_sections = []

    try:
        section_docs = db.collection('collections').stream()
        for doc in section_docs:
            section_ref = doc.reference.collection('sections').where('visibility', '==', 'public').stream()
            for section_doc in section_ref:
                section_data = section_doc.to_dict()
                title = section_data.get('section_name', '')
                public_sections.append({'id': section_doc.id, 'title': title})
    except Exception as e:
        print("Error fetching public sections:", e)
        return jsonify({'error': 'Failed to fetch public sections'}), 500

    return jsonify({'sections': public_sections})

# @app.route('/generate_questions', methods=['POST'])
# async def generate_questions():
#     data = request.get_json()
#     if not data:
#         return jsonify({'error': 'No data provided'}), 400

#     collection_id = data.get('collection_id')
#     section_id = data.get('section_id')
#     num_questions = data.get('num_questions')

#     if not num_questions:
#         return jsonify({'error': 'Number of questions not provided'}), 400

#     if not collection_id or not section_id:
#         return jsonify({'error': 'Collection ID or Section ID not provided'}), 400

#     try:
#         notes_docs = db.collection('collections').document(collection_id).collection('sections').document(section_id).collection('notes_in_section').stream()
#         all_text = ''
#         for doc in notes_docs:
#             note_data = doc.to_dict().get('notes', '')
#             all_text += note_data + ' '

#         if not all_text:
#             return jsonify({'error': 'No notes found in the specified section'}), 404

#         async with SydneyClient() as sydney:
#             question = f'''
#             Task: Generate 10 practice test questions based on the following notes. The question should cover the main topics. Ensure the question is of difficulty difficulty and is question_type.

#             Notes:
#             {all_text}

#             Question Format: Multiple Choice
#             Question: [Your question here]
#             Options: [Option 1, Option 2, Option 3, Option 4]
#             Answer: [Correct answer]
#             '''
#             response = await sydney.ask(question, citations=True)
#             return jsonify({'response': response}), 200

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

@app.route('/parse_questions', methods=['POST'])
async def parse_questions():
    # data = request.get_json()
    # if not data:
    #     return jsonify({'error': 'No data provided'}), 400

    # response = data.get('response')
    # if not response:
    #     return jsonify({'error': 'No response provided'}), 400
    # try:
            # question_pattern = re.compile(r"\d+\.\s\*\*Question\*\*:\s(.*?)\n((?:\s+-\s.*?\n)*?)\s+-\s\*\*Answer\*\*:\s(.*?)\n", re.DOTALL)
            # question_pattern1 = re.compile(r"(\d+)\. \*\*Question\*\*: (.+?)\n((?:\s+- [A-D]\) .+?\n)+)\n\[\d+\]\s+\*\*Answer\*\*: ([A-D]\)) (.+?)\n", re.MULTILINE)
            # question_pattern2 = r'\d+\.\s+\*\*Question\*\*: (.+?)\n\s+-\s+A\)\s(.+?)\n\s+-\s+B\)\s(.+?)\n\s+-\s+C\)\s(.+?)\n\s+-\s+D\)\s(.+?)\n\s+\*\*Answer\*\*: (.+?)\n\n'
            # question_pattern3 = re.compile(r'\d+\.\s+\*\*Question\*\*: (.*?)\n((?:\s+- [A-D]\) .+?\n)+)\*\*Answer\*\*: ([A-D]\)) (.+?)\n', re.MULTILINE | re.DOTALL)
            # question_pattern4 = re.compile(r'\d+\.\s+(.*?)\n((?:\s+- [A-D]\. .+?\n)+)\*\*Answer: ([A-D])\. (.+?)\*\*', re.DOTALL)
            # question_pattern5 = re.compile(r'\d+\.\s+(.*?)\n((?:\s+- [A-D]\) .+?\n)+)\*\*Answer: ([A-D])\) (.+?)\*\*', re.DOTALL)

            # question_pattern = re.compile(r"(\d+)\.\s*\*\*Question\*\*:\s*(.*?)\n\s*-\s*A\)\s*(.*?)\n\s*-\s*B\)\s*(.*?)\n\s*-\s*C\)\s*(.*?)\n\s*-\s*D\)\s*(.*?)\n\s*\*\*Answer\*\*:\s*(.*?)\n")

            # matches = question_pattern.findall(response)
            
            # # Log the intermediate matches
            # print(f"Matches: {matches}")
        try:
            qna_pairs = []
            # for match in matches:
            #     question_number = match[0]
            #     question_text = match[1].strip()
            #     options = [
            #         {"option": "A", "text": match[2].strip()},
            #         {"option": "B", "text": match[3].strip()},
            #         {"option": "C", "text": match[4].strip()},
            #         {"option": "D", "text": match[5].strip()}
            #     ]
            #     answer = match[6].strip()

            #     # Log each question and its options
            #     print(f"Question {question_number}: {question_text}")
            #     print(f"Options: {options}")
            #     print(f"Answer: {answer}")

            #     qna_pairs.append({
            #         "question": question_text,
            #         "options": options,
            #         "answer": answer
            #     })
            # if len(qna_pairs) == 0:
            qna_pairs.append({
                    "question": "What is recursion in programming?",
                    "options": [
                        ("A", "A method to iterate over data."),
                        ("B", "A way to solve problems by breaking them down into smaller instances."),
                        ("C", "A type of loop in programming."),
                        ("D", "A sorting algorithm.")
                    ],
                    "answer": ("B", "A way to solve problems by breaking them down into smaller instances.")
                    }, {
                    "question": "What is the base case in recursion?",
                    "options": [
                        ("A", "The case where the function stops calling itself."),
                        ("B", "The smallest instance of the problem that can be solved directly."),
                        ("C", "A recursive function."),
                        ("D", "An iterative solution.")
                    ],
                    "answer": ("B", "The smallest instance of the problem that can be solved directly.")
                },
                {
                    "question": "What happens if a recursive function does not have a base case?",
                    "options": [
                        ("A", "The function will cause a stack overflow."),
                        ("B", "The function will run forever."),
                        ("C", "The function will return incorrect results."),
                        ("D", "All of the above.")
                    ],
                    "answer": ("D", "All of the above.")
                },
                {
                    "question": "Which of the following data structures uses recursion inherently?",
                    "options": [
                        ("A", "Array"),
                        ("B", "Linked List"),
                        ("C", "Queue"),
                        ("D", "Binary Tree")
                    ],
                    "answer": ("D", "Binary Tree")
                },
                {
                    "question": "What is the time complexity of recursive Fibonacci function?",
                    "options": [
                        ("A", "O(1)"),
                        ("B", "O(n)"),
                        ("C", "O(2^n)"),
                        ("D", "O(log n)")
                    ],
                    "answer": ("C", "O(2^n)")
                },
                {
                    "question": "Which of the following problems can be solved using recursion?",
                    "options": [
                        ("A", "Finding factorial of a number"),
                        ("B", "Finding shortest path in a graph"),
                        ("C", "Sorting an array"),
                        ("D", "All of the above")
                    ],
                    "answer": ("D", "All of the above")
                },
                {
                    "question": "What is tail recursion?",
                    "options": [
                        ("A", "A type of recursion that uses an explicit stack."),
                        ("B", "A type of recursion where the recursive call is the last thing executed by the function."),
                        ("C", "A type of recursion that involves multiple recursive calls."),
                        ("D", "A type of recursion that is slower than iterative solutions.")
                    ],
                    "answer": ("B", "A type of recursion where the recursive call is the last thing executed by the function.")
                },
                {
                    "question": "Which of the following is NOT required for a recursive function?",
                    "options": [
                        ("A", "Base case"),
                        ("B", "Recursive case"),
                        ("C", "Initialization"),
                        ("D", "Iteration")
                    ],
                    "answer": ("D", "Iteration")
                },
                {
                    "question": "What is indirect recursion?",
                    "options": [
                        ("A", "A recursion that calls itself indirectly through another function."),
                        ("B", "A recursion that does not have a base case."),
                        ("C", "A recursion that is faster than direct recursion."),
                        ("D", "A recursion that has only one recursive call.")
                    ],
                    "answer": ("A", "A recursion that calls itself indirectly through another function.")
                },
                {
                    "question": "Which of the following algorithms uses recursion?",
                    "options": [
                        ("A", "Merge Sort"),
                        ("B", "Bubble Sort"),
                        ("C", "Insertion Sort"),
                        ("D", "Selection Sort")
                    ],
                    "answer": ("A", "Merge Sort")
                })


            
            return jsonify({'r': qna_pairs}), 200
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
            if(check_profanity(collection_name)):
                return jsonify({'error':'Profanity detected'}), 400
    
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
    

async def practtest() -> str:  # Change the return type to str
    notes = request.args.get('notes')

    async with SydneyClient() as sydney:
        question = f'''
        Task: Generate 10 practice test questions based on the following notes. The question should cover the main topics. Ensure the question is of difficulty difficulty and is question_type.

        Notes:
        {notes}

        Question Format: Multiple Choice
        Question: [Your question here]
        Options: [Option 1, Option 2, Option 3, Option 4]
        Answer: [Correct answer]
        '''
        response = await sydney.ask(question, citations=True)
    return response

@app.route('/generatepracticetest', methods=['GET'])
async def generatepracticetest():
    response = await practtest()
    return jsonify({'questions': response})


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
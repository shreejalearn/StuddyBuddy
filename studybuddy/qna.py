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

ignore_warnings('ignore')

qa_pipeline = pipeline('question-answering', model='distilbert-base-cased-distilled-squad')

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

    answer_output = qa_pipeline(question=question, context=txt)

    return question, answer_output['answer']

bert_tokenizer = BTokenizer.from_pretrained('bert-base-uncased')
bert_model = BModel.from_pretrained("bert-base-uncased")
sentence_model = SentenceTransformer('distilbert-base-nli-mean-tokens')
nlp = spacy.load("en_core_web_sm")

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

txt = """
The Battle of Waterloo was fought on Sunday, 18 June 1815, near Waterloo in Belgium,
part of the United Kingdom of the Netherlands at the time. A French army under the
command of Napoleon Bonaparte was defeated by two of the armies of the Seventh Coalition:
an Anglo-led Allied army under the command of the Duke of Wellington, and a Prussian army
under the command of Field Marshal von Blücher. The battle marked the end of the Napoleonic Wars.
"""
qa_pairs = []
answer_dict = OrderedDict()

for answer, context in get_keywords(txt, 'st'):
    question, generated_answer = generate_question_answer(context, answer)
    if generated_answer not in answer_dict:
        answer_dict[generated_answer] = question
        qa_pairs.append((question, generated_answer))

print("Unique Question-Answer Pairs:")
for qa_pair in qa_pairs:
    print(f"Question: {qa_pair[0]}")
    print(f"Answer: {qa_pair[1]}")
    print()
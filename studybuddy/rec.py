import firebase_admin
from firebase_admin import credentials, firestore
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Initialize Firebase Admin SDK (replace 'path/to/serviceAccountKey.json' with your own service account key file)
cred = credentials.Certificate("./serviceKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

def get_collection_titles(username):
    collections_ref = db.collection('collections').where('username', '==', username).stream()

    titles = []
    for collection in collections_ref:
        for document in collection.to_dict().get('document', []):
            data = document.get('data', [])
            for item in data:
                if 'title' in item:
                    titles.append(item['title'])
    
    return titles

def suggest_similar_titles(username):
    titles = get_collection_titles(username)
    
    if not titles:
        print("No titles found for user:", username)
        return []

    # Vectorize titles using TF-IDF
    vectorizer = TfidfVectorizer().fit_transform(titles)
    vectors = vectorizer.toarray()
    
    # Compute cosine similarity matrix
    cosine_matrix = cosine_similarity(vectors)
    
    # Get similarity scores for the first title against all other titles
    similarity_scores = list(enumerate(cosine_matrix[0]))
    
    # Sort by similarity score in descending order
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)
    
    # Get top 5 most similar titles (excluding the first one which is the title itself)
    top_5_similar = [titles[i] for i, _ in similarity_scores[1:6]]
    
    return top_5_similar

# Example usage
if __name__ == "__main__":
    username = 'annekm26@bergen.org'
    similar_titles = suggest_similar_titles(username)
    print("Top 5 similar titles for user:", username)
    for title in similar_titles:
        print(title)

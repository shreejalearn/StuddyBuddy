import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, jsonify

# Initialize Flask app
app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("./serviceKey.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()

# @app.route('/get_my_collections')
# def get_my_collections():
#     username = "shrs26@bergen.org"
#     if not username:
#         return jsonify({'error': 'Username not provided'})

#     collections = []
#     collection_docs = db.collection('collections').where('username', '==', username).stream()
#     for doc in collection_docs:
#         title = doc.to_dict().get('data', {}).get('title', '')
#         collections.append({'id': doc.id, 'title': title})

#     return jsonify({'collections': collections})

# For direct function testing
def test_get_my_collections():
    username = "shrdas26@bergen.org"
    if not username:
        return {'error': 'Username not provided'}

    collections = []
    collection_docs = db.collection('collections').where('username', '==', username).stream()
    for doc in collection_docs:
        title = doc.to_dict().get('data', {}).get('title', '')
        collections.append({'id': doc.id, 'title': title})

    return {'collections': collections}

# Test the function
if __name__ == '__main__':
    print(test_get_my_collections())

    # Uncomment the line below to run the Flask app for API testing
    # app.run(debug=True)
import asyncio
import os
from sydney import SydneyClient
from dotenv import load_dotenv
from duckduckgo_search import DDGS
from fastcore.all import *
import re
import requests

load_dotenv()

bing_cookies_key = os.getenv('BING_COOKIES')

if bing_cookies_key is None:
    print("Error: BING_COOKIES environment variable is not set.")
    exit(1)

os.environ["BING_COOKIES"] = bing_cookies_key

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

async def main() -> None:
    async with SydneyClient() as sydney:
        question = 'Given these notes: "Review (basics): #Creating functions def my_functionQ: pass #Decomposition * Breaking down big ideas to small helper functions (think back to library exercise we did last time) #While loops - indefinite loops (till something is false) while condition: pass #For loops- definite loops (run a fixed number of times) for iin range(10): pass ". Identify key search phrases that I could use to generate relevant static images to accompany each concept. These images will serve as visual aids to enhance student comprehension. Consider the context and keywords associated with each concept to ensure the images are directly related and supportive of the provided summary'
        response = await sydney.ask(question, citations=True)

        # Parse the response and extract concept names, search phrases, and summaries
        matches = re.findall(r"\*\*([^*]+)\*\*:[\s\S]*?- Search phrases:\s*\"(.*?)\"[\s\S]*?Summary: (.*?)\[\^", response)

        # Create a dictionary to store the concepts, search phrases, and summaries
        concepts = {}

        # Populate the dictionary with the extracted information
        for match in matches:
            concept_name = match[0].strip()
            search_phrases = match[1].strip().split('", "')
            summary = match[2].strip()
            concepts[concept_name] = {"search_phrases": search_phrases, "summary": summary}

        # Fetch relevant images for each concept
        for concept, data in concepts.items():
            concept_images = []
            for phrase in data["search_phrases"]:
                images = search_images(phrase, max_images=1)
                if images:
                    concept_images.append(images[0])
            concepts[concept]["images"] = concept_images

        # Download images
        for concept, data in concepts.items():
            print(f"Downloading images for concept: {concept}")
            concept_folder = os.path.join(os.getcwd(), "images", concept)
            os.makedirs(concept_folder, exist_ok=True)
            for i, image_url in enumerate(data['images']):
                image_path = download_image(image_url, concept_folder)
                print(f"Downloaded image {i + 1}: {image_path}")

if __name__ == "__main__":
    asyncio.run(main())
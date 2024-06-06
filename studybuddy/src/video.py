import asyncio
import os
import re
import requests
from sydney import SydneyClient
from dotenv import load_dotenv
from duckduckgo_search import DDGS
from fastcore.all import *
from gtts import gTTS
from moviepy.editor import ImageSequenceClip, AudioFileClip, concatenate_videoclips, concatenate_audioclips
from PIL import Image


load_dotenv()

bing_cookies_key = os.getenv('BING_COOKIES')

if bing_cookies_key is None:
    print("Error: BING_COOKIES environment variable is not set.")
    exit(1)

os.environ["BING_COOKIES"] = bing_cookies_key

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

async def main() -> None:
    async with SydneyClient() as sydney:
        response = '''
        Sydney: [1]: https://www.freecodecamp.org/news/functions-in-python-a-beginners-guide/ ""
        [2]: https://www.classes.cs.uchicago.edu/archive/2021/spring/11111-1/happycoding/p5js/creating-functions.html ""
        [3]: https://happycoding.io/tutorials/processing/creating-functions ""
        [4]: https://learn-javascript.dev/docs/functions/ ""
        [5]: https://en.wikipedia.org/wiki/Decomposition_%28computer_science%29 ""
        [6]: https://cs.stanford.edu/people/nick/compdocs/Decomposition_and_Style.pdf ""
        [7]: https://www.knowitallninja.com/lessons/decomposition/ ""
        [8]: https://jarednielsen.com/decomposition/ ""
        [9]: https://www.geeksforgeeks.org/while-loop-in-programming/ ""
        [10]: https://www.geeksforgeeks.org/loops-programming/ ""
        [11]: https://en.wikipedia.org/wiki/While_loop ""
        [12]: https://www.geeksforgeeks.org/while-loop-syntax/ ""
        [13]: https://www.geeksforgeeks.org/for-loop-in-programming/ ""
        [14]: https://en.wikipedia.org/wiki/For_loop ""
        [15]: https://press.rebus.community/programmingfundamentals/chapter/for-loop/ ""

        Certainly! Let's break down each concept and identify key search phrases for relevant static images:

        1. **Creating Functions**:
            - Search phrases: "defining functions in Python," "user-defined functions," "function parameters," "return statement."
            - Summary: Functions in programming allow you to encapsulate reusable code. They take input (parameters), perform specific tasks, and optionally return a result. The syntax for defining a function in Python is straightforward: `def function_name(parameters):`. The body of the function contains the code to be executed when the function is called[^1^][1].

        2. **Decomposition**:
            - Search phrases: "Algorithmic decomposition," "structured analysis," "object-oriented decomposition," "functional decomposition."
            - Summary: Decomposition involves breaking down complex problems or systems into smaller, manageable parts. Different types of decomposition exist, including algorithmic decomposition (structured steps), structured analysis (system functions and data entities), and object-oriented decomposition (classes or objects). Functional decomposition replaces a system's functional model with subsystem models[^2^][5].

        3. **While Loops**:
            - Search phrases: "While loop in programming," "entry-controlled loops," "condition-based repetition."
            - Summary: While loops execute a block of code repeatedly as long as a specified condition remains true. They evaluate the condition before each iteration, execute the code block if the condition is true, and terminate when the condition becomes false. Useful for uncertain or dynamically changing situations[^3^][9].

        4. **For Loops**:
            - Search phrases: "For loop in programming," "iterating over a sequence," "fixed number of iterations."
            - Summary: For loops execute a set of statements repetitively based on a specified condition. They are commonly used when you know how many times you want to execute a block of code. The syntax includes initialization, condition, and increment (or decrement) components. Useful for iterating over sequences or performing a fixed number of tasks[^4^][13].

        Feel free to use these search phrases to find relevant static images that enhance student comprehension!
        '''

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

if __name__ == "__main__":
    asyncio.run(main())

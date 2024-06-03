# # # # import asyncio
# # # # import os
# # # # from sydney import SydneyClient
# # # # from dotenv import load_dotenv
# # # # from duckduckgo_search import DDGS
# # # # from fastcore.all import *
# # # # import re
# # # # import requests
# # # # from gtts import gTTS

# # # # load_dotenv()

# # # # bing_cookies_key = os.getenv('BING_COOKIES')

# # # # if bing_cookies_key is None:
# # # #     print("Error: BING_COOKIES environment variable is not set.")
# # # #     exit(1)

# # # # os.environ["BING_COOKIES"] = bing_cookies_key

# # # # def generate_audio(text, output_audio_path):
# # # #     tts = gTTS(text=text, lang='en')
# # # #     tts.save(output_audio_path)

# # # # # Function to search for images based on a given term
# # # # def search_images(term, max_images=30):
# # # #     print(f"Searching for '{term}'")
# # # #     ddgs = DDGS()
# # # #     return L(ddgs.images(keywords=term, max_results=max_images)).itemgot('image')

# # # # # Function to download an image from a URL
# # # # def download_image(url, folder):
# # # #     filename = os.path.join(folder, os.path.basename(url))
# # # #     with open(filename, 'wb') as f:
# # # #         response = requests.get(url)
# # # #         f.write(response.content)
# # # #     return filename

# # # # async def main() -> None:
# # # #     async with SydneyClient() as sydney:
# # # #         question = 'Given these notes: "Review (basics): #Creating functions def my_functionQ: pass #Decomposition * Breaking down big ideas to small helper functions (think back to library exercise we did last time) #While loops - indefinite loops (till something is false) while condition: pass #For loops- definite loops (run a fixed number of times) for iin range(10): pass ". Identify key search phrases that I could use to generate relevant static images to accompany each concept. These images will serve as visual aids to enhance student comprehension. Consider the context and keywords associated with each concept to ensure the images are directly related and supportive of the provided summary'
# # # #         response = await sydney.ask(question, citations=True)

# # # #         # Parse the response and extract concept names, search phrases, and summaries
# # # #         matches = re.findall(r"\*\*([^*]+)\*\*:[\s\S]*?- Search phrases:\s*\"(.*?)\"[\s\S]*?Summary: (.*?)\[\^", response)

# # # #         # Create a dictionary to store the concepts, search phrases, and summaries
# # # #         concepts = {}

# # # #         # Populate the dictionary with the extracted information
# # # #         for match in matches:
# # # #             concept_name = match[0].strip()
# # # #             search_phrases = match[1].strip().split('", "')
# # # #             summary = match[2].strip()
# # # #             concepts[concept_name] = {"search_phrases": search_phrases, "summary": summary}

# # # #         # Fetch relevant images for each concept
# # # #         for concept, data in concepts.items():
# # # #             concept_images = []
# # # #             for phrase in data["search_phrases"]:
# # # #                 images = search_images(phrase, max_images=1)
# # # #                 if images:
# # # #                     concept_images.append(images[0])
# # # #             concepts[concept]["images"] = concept_images

# # # #         # Download images
# # # #         for concept, data in concepts.items():
# # # #             print(f"Downloading images for concept: {concept}")
# # # #             concept_folder = os.path.join(os.getcwd(), "images", concept)
# # # #             os.makedirs(concept_folder, exist_ok=True)
# # # #             for i, image_url in enumerate(data['images']):
# # # #                 image_path = download_image(image_url, concept_folder)
# # # #                 print(f"Downloaded image {i + 1}: {image_path}")

# # # # if __name__ == "__main__":
# # # #     asyncio.run(main())

# # # import asyncio
# # # import os
# # # from sydney import SydneyClient
# # # from dotenv import load_dotenv
# # # from duckduckgo_search import DDGS
# # # from fastcore.all import *
# # # import re
# # # import requests
# # # from gtts import gTTS

# # # load_dotenv()

# # # bing_cookies_key = os.getenv('BING_COOKIES')

# # # if bing_cookies_key is None:
# # #     print("Error: BING_COOKIES environment variable is not set.")
# # #     exit(1)

# # # os.environ["BING_COOKIES"] = bing_cookies_key

# # # def generate_audio(text, output_audio_path):
# # #     tts = gTTS(text=text, lang='en')
# # #     tts.save(output_audio_path)

# # # # Function to search for images based on a given term
# # # def search_images(term, max_images=30):
# # #     print(f"Searching for '{term}'")
# # #     ddgs = DDGS()
# # #     return L(ddgs.images(keywords=term, max_results=max_images)).itemgot('image')

# # # # Function to download an image from a URL
# # # def download_image(url, folder):
# # #     filename = os.path.join(folder, os.path.basename(url))
# # #     with open(filename, 'wb') as f:
# # #         response = requests.get(url)
# # #         f.write(response.content)
# # #     return filename

# # # async def main() -> None:
# # #     async with SydneyClient() as sydney:
# # #         # question = 'Given these notes: "Review (basics): #Creating functions def my_functionQ: pass #Decomposition * Breaking down big ideas to small helper functions (think back to library exercise we did last time) #While loops - indefinite loops (till something is false) while condition: pass #For loops- definite loops (run a fixed number of times) for iin range(10): pass ". Identify key search phrases that I could use to generate relevant static images to accompany each concept. These images will serve as visual aids to enhance student comprehension. Consider the context and keywords associated with each concept to ensure the images are directly related and supportive of the provided summary'
# # #         # response = await sydney.ask(question, citations=True)
# # #         response = '''
# # # Sydney: [1]: https://www.freecodecamp.org/news/functions-in-python-a-beginners-guide/ ""
# # # [2]: https://www.classes.cs.uchicago.edu/archive/2021/spring/11111-1/happycoding/p5js/creating-functions.html ""
# # # [3]: https://happycoding.io/tutorials/processing/creating-functions ""
# # # [4]: https://learn-javascript.dev/docs/functions/ ""
# # # [5]: https://en.wikipedia.org/wiki/Decomposition_%28computer_science%29 ""
# # # [6]: https://cs.stanford.edu/people/nick/compdocs/Decomposition_and_Style.pdf ""
# # # [7]: https://www.knowitallninja.com/lessons/decomposition/ ""
# # # [8]: https://jarednielsen.com/decomposition/ ""
# # # [9]: https://www.geeksforgeeks.org/while-loop-in-programming/ ""
# # # [10]: https://www.geeksforgeeks.org/loops-programming/ ""
# # # [11]: https://en.wikipedia.org/wiki/While_loop ""
# # # [12]: https://www.geeksforgeeks.org/while-loop-syntax/ ""
# # # [13]: https://www.geeksforgeeks.org/for-loop-in-programming/ ""
# # # [14]: https://en.wikipedia.org/wiki/For_loop ""
# # # [15]: https://press.rebus.community/programmingfundamentals/chapter/for-loop/ ""

# # # Certainly! Let's break down each concept and identify key search phrases for relevant static images:

# # # 1. **Creating Functions**:
# # #     - Search phrases: "defining functions in Python," "user-defined functions," "function parameters," "return statement."
# # #     - Summary: Functions in programming allow you to encapsulate reusable code. They take input (parameters), perform specific tasks, and optionally return a result. The syntax for defining a function in Python is straightforward: `def function_name(parameters):`. The body of the function contains the code to be executed when the function is called[^1^][1].

# # # 2. **Decomposition**:
# # #     - Search phrases: "Algorithmic decomposition," "structured analysis," "object-oriented decomposition," "functional decomposition."
# # #     - Summary: Decomposition involves breaking down complex problems or systems into smaller, manageable parts. Different types of decomposition exist, including algorithmic decomposition (structured steps), structured analysis (system functions and data entities), and object-oriented decomposition (classes or objects). Functional decomposition replaces a system's functional model with subsystem models[^2^][5].

# # # 3. **While Loops**:
# # #     - Search phrases: "While loop in programming," "entry-controlled loops," "condition-based repetition."
# # #     - Summary: While loops execute a block of code repeatedly as long as a specified condition remains true. They evaluate the condition before each iteration, execute the code block if the condition is true, and terminate when the condition becomes false. Useful for uncertain or dynamically changing situations[^3^][9].

# # # 4. **For Loops**:
# # #     - Search phrases: "For loop in programming," "iterating over a sequence," "fixed number of iterations."
# # #     - Summary: For loops execute a set of statements repetitively based on a specified condition. They are commonly used when you know how many times you want to execute a block of code. The syntax includes initialization, condition, and increment (or decrement) components. Useful for iterating over sequences or performing a fixed number of tasks[^4^][13].

# # # Feel free to use these search phrases to find relevant static images that enhance student comprehension!
# # # '''

# # #         # Parse the response and extract concept names, search phrases, and summaries
# # #         matches = re.findall(r"\*\*([^*]+)\*\*:[\s\S]*?- Search phrases:\s*\"(.*?)\"[\s\S]*?Summary: (.*?)\[\^", response)

# # #         # Create a dictionary to store the concepts, search phrases, and summaries
# # #         concepts = {}

# # #         # Populate the dictionary with the extracted information
# # #         for match in matches:
# # #             concept_name = match[0].strip()
# # #             search_phrases = match[1].strip().split('", "')
# # #             summary = match[2].strip()
# # #             concepts[concept_name] = {"search_phrases": search_phrases, "summary": summary}

# # #         # Accumulate all summary text
# # #         all_summary_text = ""

# # #         # Generate audio from each summary text and accumulate
# # #         for concept, data in concepts.items():
# # #             all_summary_text += data["summary"] + " "

# # #         # Generate audio from all accumulated summary text
# # #         output_audio_path = "all_summary_audio.mp3"
# # #         generate_audio(all_summary_text, output_audio_path)
# # #         print("Audio generated from all summary text.")

# # #         # Fetch relevant images for each concept
# # #         for concept, data in concepts.items():
# # #             concept_images = []
# # #             for phrase in data["search_phrases"]:
# # #                 images = search_images(phrase, max_images=1)
# # #                 if images:
# # #                     concept_images.append(images[0])
# # #             concepts[concept]["images"] = concept_images

# # #         # Download images
# # #         for concept, data in concepts.items():
# # #             print(f"Downloading images for concept: {concept}")
# # #             concept_folder = os.path.join(os.getcwd(), "images", concept)
# # #             os.makedirs(concept_folder, exist_ok=True)
# # #             for i, image_url in enumerate(data['images']):
# # #                 image_path = download_image(image_url, concept_folder)
# # #                 print(f"Downloaded image {i + 1}: {image_path}")

# # # if __name__ == "__main__":
# # #     asyncio.run(main())


# # import asyncio
# # import os
# # import re
# # import requests
# # from sydney import SydneyClient
# # from dotenv import load_dotenv
# # from duckduckgo_search import DDGS
# # from fastcore.all import *
# # from gtts import gTTS

# # load_dotenv()

# # bing_cookies_key = os.getenv('BING_COOKIES')

# # if bing_cookies_key is None:
# #     print("Error: BING_COOKIES environment variable is not set.")
# #     exit(1)

# # os.environ["BING_COOKIES"] = bing_cookies_key

# # def generate_audio(text, output_audio_path):
# #     tts = gTTS(text=text, lang='en')
# #     tts.save(output_audio_path)

# # # Function to search for images based on a given term
# # def search_images(term, max_images=30):
# #     print(f"Searching for '{term}'")
# #     ddgs = DDGS()
# #     return L(ddgs.images(keywords=term, max_results=max_images)).itemgot('image')

# # # Function to download an image from a URL
# # def download_image(url, folder):
# #     filename = os.path.join(folder, os.path.basename(url))
# #     with open(filename, 'wb') as f:
# #         response = requests.get(url)
# #         f.write(response.content)
# #     return filename

# # async def main() -> None:
# #     async with SydneyClient() as sydney:
# #         response = '''
# # Sydney: [1]: https://www.freecodecamp.org/news/functions-in-python-a-beginners-guide/ ""
# # [2]: https://www.classes.cs.uchicago.edu/archive/2021/spring/11111-1/happycoding/p5js/creating-functions.html ""
# # [3]: https://happycoding.io/tutorials/processing/creating-functions ""
# # [4]: https://learn-javascript.dev/docs/functions/ ""
# # [5]: https://en.wikipedia.org/wiki/Decomposition_%28computer_science%29 ""
# # [6]: https://cs.stanford.edu/people/nick/compdocs/Decomposition_and_Style.pdf ""
# # [7]: https://www.knowitallninja.com/lessons/decomposition/ ""
# # [8]: https://jarednielsen.com/decomposition/ ""
# # [9]: https://www.geeksforgeeks.org/while-loop-in-programming/ ""
# # [10]: https://www.geeksforgeeks.org/loops-programming/ ""
# # [11]: https://en.wikipedia.org/wiki/While_loop ""
# # [12]: https://www.geeksforgeeks.org/while-loop-syntax/ ""
# # [13]: https://www.geeksforgeeks.org/for-loop-in-programming/ ""
# # [14]: https://en.wikipedia.org/wiki/For_loop ""
# # [15]: https://press.rebus.community/programmingfundamentals/chapter/for-loop/ ""

# # Certainly! Let's break down each concept and identify key search phrases for relevant static images:

# # 1. **Creating Functions**:
# #     - Search phrases: "defining functions in Python," "user-defined functions," "function parameters," "return statement."
# #     - Summary: Functions in programming allow you to encapsulate reusable code. They take input (parameters), perform specific tasks, and optionally return a result. The syntax for defining a function in Python is straightforward: `def function_name(parameters):`. The body of the function contains the code to be executed when the function is called[^1^][1].

# # 2. **Decomposition**:
# #     - Search phrases: "Algorithmic decomposition," "structured analysis," "object-oriented decomposition," "functional decomposition."
# #     - Summary: Decomposition involves breaking down complex problems or systems into smaller, manageable parts. Different types of decomposition exist, including algorithmic decomposition (structured steps), structured analysis (system functions and data entities), and object-oriented decomposition (classes or objects). Functional decomposition replaces a system's functional model with subsystem models[^2^][5].

# # 3. **While Loops**:
# #     - Search phrases: "While loop in programming," "entry-controlled loops," "condition-based repetition."
# #     - Summary: While loops execute a block of code repeatedly as long as a specified condition remains true. They evaluate the condition before each iteration, execute the code block if the condition is true, and terminate when the condition becomes false. Useful for uncertain or dynamically changing situations[^3^][9].

# # 4. **For Loops**:
# #     - Search phrases: "For loop in programming," "iterating over a sequence," "fixed number of iterations."
# #     - Summary: For loops execute a set of statements repetitively based on a specified condition. They are commonly used when you know how many times you want to execute a block of code. The syntax includes initialization, condition, and increment (or decrement) components. Useful for iterating over sequences or performing a fixed number of tasks[^4^][13].

# # Feel free to use these search phrases to find relevant static images that enhance student comprehension!
# # '''

# #         # Parse the response and extract concept names, search phrases, and summaries
# #         matches = re.findall(r"\*\*([^*]+)\*\*:[\s\S]*?- Search phrases:\s*\"(.*?)\"[\s\S]*?Summary: (.*?)\[\^", response)

# #         # Create a dictionary to store the concepts, search phrases, and summaries
# #         concepts = {}

# #         # Populate the dictionary with the extracted information
# #         for match in matches:
# #             concept_name = match[0].strip()
# #             search_phrases = match[1].strip().split('", "')
# #             summary = match[2].strip()
# #             concepts[concept_name] = {"search_phrases": search_phrases, "summary": summary}

# #         # Accumulate all summary text with gaps between each concept
# #         all_summary_text = ""

# #         # Generate audio from each summary text and accumulate
# #         for i, (concept, data) in enumerate(concepts.items()):
# #             # Add a gap before the summary of each concept except for the first one
# #             if i > 0:
# #                 all_summary_text += " " * 300  # Adding a 300 milliseconds pause
# #             all_summary_text += data["summary"] + " "

# #         # Generate audio from all accumulated summary text
# #         output_audio_path = "all_summary_audio.mp3"
# #         generate_audio(all_summary_text, output_audio_path)
# #         print("Audio generated from all summary text.")

# #         # Fetch relevant images for each concept
# #         for concept, data in concepts.items():
# #             concept_images = []
# #             for phrase in data["search_phrases"]:
# #                 images = search_images(phrase, max_images=1)
# #                 if images:
# #                     concept_images.append(images[0])
# #             concepts[concept]["images"] = concept_images

# #         # Download images
# #         for concept, data in concepts.items():
# #             print(f"Downloading images for concept: {concept}")
# #             concept_folder = os.path.join(os.getcwd(), "images", concept)
# #             os.makedirs(concept_folder, exist_ok=True)
# #             for i, image_url in enumerate(data['images']):
# #                 image_path = download_image(image_url, concept_folder)
# #                 print(f"Downloaded image {i + 1}: {image_path}")

# # if __name__ == "__main__":
# #     asyncio.run(main())


# import asyncio
# import os
# import re
# import requests
# from sydney import SydneyClient
# from dotenv import load_dotenv
# from duckduckgo_search import DDGS
# from fastcore.all import *
# from gtts import gTTS
# from moviepy.editor import ImageSequenceClip
# from PIL import Image


# load_dotenv()

# bing_cookies_key = os.getenv('BING_COOKIES')

# if bing_cookies_key is None:
#     print("Error: BING_COOKIES environment variable is not set.")
#     exit(1)

# os.environ["BING_COOKIES"] = bing_cookies_key

# def generate_audio(text, output_audio_path):
#     tts = gTTS(text=text, lang='en')
#     tts.save(output_audio_path)

# # Function to search for images based on a given term
# def search_images(term, max_images=30):
#     print(f"Searching for '{term}'")
#     ddgs = DDGS()
#     return L(ddgs.images(keywords=term, max_results=max_images)).itemgot('image')

# # Function to download an image from a URL
# def download_image(url, folder):
#     filename = os.path.join(folder, os.path.basename(url))
#     with open(filename, 'wb') as f:
#         response = requests.get(url)
#         f.write(response.content)
#     return filename

# def resize_images(image_paths, output_folder, target_size=(1280, 720)):
#     resized_paths = []
    
#     # Create the output folder if it doesn't exist
#     if not os.path.exists(output_folder):
#         os.makedirs(output_folder)
    
#     for image_path in image_paths:
#         image = Image.open(image_path)
#         image = image.resize(target_size)  # Apply anti-aliasing here
#         resized_path = os.path.join(output_folder, os.path.basename(image_path))
#         image.save(resized_path)
#         resized_paths.append(resized_path)
    
#     return resized_paths

# async def main() -> None:
#     async with SydneyClient() as sydney:
#         response = '''
#         Sydney: [1]: https://www.freecodecamp.org/news/functions-in-python-a-beginners-guide/ ""
#         [2]: https://www.classes.cs.uchicago.edu/archive/2021/spring/11111-1/happycoding/p5js/creating-functions.html ""
#         [3]: https://happycoding.io/tutorials/processing/creating-functions ""
#         [4]: https://learn-javascript.dev/docs/functions/ ""
#         [5]: https://en.wikipedia.org/wiki/Decomposition_%28computer_science%29 ""
#         [6]: https://cs.stanford.edu/people/nick/compdocs/Decomposition_and_Style.pdf ""
#         [7]: https://www.knowitallninja.com/lessons/decomposition/ ""
#         [8]: https://jarednielsen.com/decomposition/ ""
#         [9]: https://www.geeksforgeeks.org/while-loop-in-programming/ ""
#         [10]: https://www.geeksforgeeks.org/loops-programming/ ""
#         [11]: https://en.wikipedia.org/wiki/While_loop ""
#         [12]: https://www.geeksforgeeks.org/while-loop-syntax/ ""
#         [13]: https://www.geeksforgeeks.org/for-loop-in-programming/ ""
#         [14]: https://en.wikipedia.org/wiki/For_loop ""
#         [15]: https://press.rebus.community/programmingfundamentals/chapter/for-loop/ ""

#         Certainly! Let's break down each concept and identify key search phrases for relevant static images:

#         1. **Creating Functions**:
#             - Search phrases: "defining functions in Python," "user-defined functions," "function parameters," "return statement."
#             - Summary: Functions in programming allow you to encapsulate reusable code. They take input (parameters), perform specific tasks, and optionally return a result. The syntax for defining a function in Python is straightforward: `def function_name(parameters):`. The body of the function contains the code to be executed when the function is called[^1^][1].

#         2. **Decomposition**:
#             - Search phrases: "Algorithmic decomposition," "structured analysis," "object-oriented decomposition," "functional decomposition."
#             - Summary: Decomposition involves breaking down complex problems or systems into smaller, manageable parts. Different types of decomposition exist, including algorithmic decomposition (structured steps), structured analysis (system functions and data entities), and object-oriented decomposition (classes or objects). Functional decomposition replaces a system's functional model with subsystem models[^2^][5].

#         3. **While Loops**:
#             - Search phrases: "While loop in programming," "entry-controlled loops," "condition-based repetition."
#             - Summary: While loops execute a block of code repeatedly as long as a specified condition remains true. They evaluate the condition before each iteration, execute the code block if the condition is true, and terminate when the condition becomes false. Useful for uncertain or dynamically changing situations[^3^][9].

#         4. **For Loops**:
#             - Search phrases: "For loop in programming," "iterating over a sequence," "fixed number of iterations."
#             - Summary: For loops execute a set of statements repetitively based on a specified condition. They are commonly used when you know how many times you want to execute a block of code. The syntax includes initialization, condition, and increment (or decrement) components. Useful for iterating over sequences or performing a fixed number of tasks[^4^][13].

#         Feel free to use these search phrases to find relevant static images that enhance student comprehension!
#         '''

#         # Parse the response and extract concept names, search phrases, and summaries
#         matches = re.findall(r"\*\*([^*]+)\*\*:[\s\S]*?- Search phrases:\s*\"(.*?)\"[\s\S]*?Summary: (.*?)\[\^", response)

#         # Create a dictionary to store the concepts, search phrases, and summaries
#         concepts = {}

#         # Populate the dictionary with the extracted information
#         for match in matches:
#             concept_name = match[0].strip()
#             search_phrases = match[1].strip().split('", "')
#             summary = match[2].strip()
#             concepts[concept_name] = {"search_phrases": search_phrases, "summary": summary}

#         # Accumulate all summary text with gaps between each concept
#         all_summary_text = ""

#         # Generate audio from each summary text and accumulate
#         for i, (concept, data) in enumerate(concepts.items()):
#             # Add a gap before the summary of each concept except for the first one
#             if i > 0:
#                 all_summary_text += " " * 300  # Adding a 300 milliseconds pause
#             all_summary_text += data["summary"] + " "

#         # Generate audio from all accumulated summary text
#         output_audio_path = "all_summary_audio.mp3"
#         generate_audio(all_summary_text, output_audio_path)
#         print("Audio generated from all summary text.")

#         # Create a list to store the paths of downloaded images
#         image_paths = []

#         # Fetch relevant images for each concept
#         for concept, data in concepts.items():
#             concept_images = []
#             for phrase in data["search_phrases"]:
#                 images = search_images(phrase, max_images=1)
#                 if images:
#                     concept_images.append(images[0])
#             concepts[concept]["images"] = concept_images

#             # Download images
#             print(f"Downloading images for concept: {concept}")
#             concept_folder = os.path.join(os.getcwd(), "images", concept)
#             os.makedirs(concept_folder, exist_ok=True)
#             for i, image_url in enumerate(data['images']):
#                 image_path = download_image(image_url, concept_folder)
#                 image_paths.append(image_path)
#                 print(f"Downloaded image {i + 1}: {image_path}")

#         # Create a video from the downloaded images and audio
#         image_paths = resize_images(image_paths, concept_folder)
#         clip = ImageSequenceClip(image_paths, fps=1)
#         # clip = clip.set_audio(output_audio_path)
#         output_video_path = "output_video.mp4"
#         clip.write_videofile(output_video_path, codec="libx264", audio_codec="mp3", temp_audiofile="temp_audio.m4a", remove_temp=True, verbose=True)

# if __name__ == "__main__":
#     asyncio.run(main())


import asyncio
import os
import re
import requests
from sydney import SydneyClient
from dotenv import load_dotenv
from duckduckgo_search import DDGS
from fastcore.all import *
from gtts import gTTS
from moviepy.editor import ImageSequenceClip, AudioFileClip
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

        # Accumulate all summary text with gaps between each concept
        all_summary_text = ""

        # Generate audio from each summary text and accumulate
        for i, (concept, data) in enumerate(concepts.items()):
            # Add a gap before the summary of each concept except for the first one
            if i > 0:
                all_summary_text += " " * 300  # Adding a 300 milliseconds pause
            all_summary_text += data["summary"] + " "

        # Generate audio from all accumulated summary text
        tts = generate_audio(all_summary_text)
        output_audio_path = "all_summary_audio.mp3"
        tts.save(output_audio_path)
        print("Audio generated from all summary text.")

        # Create a list to store the paths of downloaded images
        image_paths = []

        # Fetch relevant images for each concept
        for concept, data in concepts.items():
            concept_images = []
            for phrase in data["search_phrases"]:
                images = search_images(phrase, max_images=1)
                if images:                    concept_images.append(images[0])
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
        image_paths = resize_images(image_paths, concept_folder)

        # Load the audio file to get its duration
        audio_clip = AudioFileClip(output_audio_path)
        audio_duration = audio_clip.duration

        # Calculate the frames per second (fps) based on the audio duration
        fps = len(image_paths) / audio_duration

        # Create the video clip
        clip = ImageSequenceClip(image_paths, fps=fps)

        # Add the audio to the video clip
        # clip = clip.set_audio("all_summary_audio.mp3")

        # Write the video file
        output_video_path = "output_video.mp4"
        clip.write_videofile(output_video_path, codec="libx264", temp_audiofile="all_summary_audio.mp3", remove_temp=True, verbose=True)

if __name__ == "__main__":
    asyncio.run(main())

# import asyncio
# import os
# from sydney import SydneyClient
# from dotenv import load_dotenv

# import json

# load_dotenv()

# bing_cookies_key = os.getenv('BING_COOKIES')

# if bing_cookies_key is None:
#     print("Error: BING_COOKIES environment variable is not set.")
#     exit(1)

# os.environ["BING_COOKIES"] = bing_cookies_key


# async def main() -> None:
#     async with SydneyClient() as sydney:
#         question = '''
        
# Task: Generate 10 practice questions based on the following notes. The questions should cover the main topics. Ensure the questions are of medium-hard difficulty and are either multiple choice (with options) or true/false.

# Notes:

# Creating functions:
# def my_functionQ: pass
# Decomposition:
# Breaking down big ideas into small helper functions (e.g., the library exercise)
# While loops:
# Indefinite loops (run until a condition is false)
# while condition: pass
# For loops:
# Definite loops (run a fixed number of times)
# for i in range(10): pass

# Question Format:

# Question: [Your question here]
# Answer: [Correct answer]
# Difficulty: Medium-Hard
# Type: Multiple Choice/True or False
# Citation: Derived from provided notes
# For Multiple Choice Questions:

# Provide four options labeled a, b, c, and d.
# Example:

# Question 1:

# Question: Which of the following correctly defines a function named my_functionQ?
# a) def my_functionQ(): pass
# b) def my_functionQ: pass
# c) function my_functionQ() {}
# d) def my_functionQ() pass
# Answer: a) def my_functionQ(): pass
# Difficulty: Medium-Hard
# Type: Multiple Choice
# Citation: Derived from provided notes
# '''

#     response = await sydney.ask(question, citations=True)
#     print("Sydney:", response.encode('ascii', 'ignore').decode('ascii'))

# if __name__ == "__main__":
#     asyncio.run(main())

import asyncio
import os
from sydney import SydneyClient
from dotenv import load_dotenv
import json

load_dotenv()

bing_cookies_key = os.getenv('BING_COOKIES')

if bing_cookies_key is None:
    print("Error: BING_COOKIES environment variable is not set.")
    exit(1)

os.environ["BING_COOKIES"] = bing_cookies_key

async def main() -> None:
    async with SydneyClient() as sydney:
        question = '''
        
Task: Generate 10 practice questions based on the following notes. The questions should cover the main topics. Ensure the questions are of medium-hard difficulty and are either multiple choice (with options) or true/false.

Notes:

Creating functions:
def my_functionQ: pass
Decomposition:
Breaking down big ideas into small helper functions (e.g., the library exercise)
While loops:
Indefinite loops (run until a condition is false)
while condition: pass
For loops:
Definite loops (run a fixed number of times)
for i in range(10): pass

Question Format:

Question: [Your question here]
Answer: [Correct answer]
Difficulty: Medium-Hard
Type: Multiple Choice/True or False
Citation: Derived from provided notes
For Multiple Choice Questions:

Provide four options labeled a, b, c, and d.
Example:

Question 1:

Question: Which of the following correctly defines a function named my_functionQ?
a) def my_functionQ(): pass
b) def my_functionQ: pass
c) function my_functionQ() {}
d) def my_functionQ() pass
Answer: a) def my_functionQ(): pass
Difficulty: Medium-Hard
Type: Multiple Choice
Citation: Derived from provided notes
'''

        response = await sydney.ask(question, citations=True)
        print("Sydney:", response.encode('ascii', 'ignore').decode('ascii'))

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except RuntimeError as e:
        if str(e).startswith('Event loop is closed'):
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(main())

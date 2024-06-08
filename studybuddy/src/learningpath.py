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
        question = "Given an user's most recently studied sections, generate recommended learning paths/topics that might interest them. Here are recently studied topics: Trig, Equilibrium,Ionization, Molarity, Enthalpy"
        response = await sydney.ask(question, citations=True)
        print("Sydney:", response.encode('ascii', 'ignore').decode('ascii'))

if __name__ == "__main__":
    asyncio.run(main())
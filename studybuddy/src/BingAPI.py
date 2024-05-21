import asyncio
import os
from sydney import SydneyClient
from dotenv import load_dotenv

import json

# Load environment variables from .env file
load_dotenv()

config_path = os.getenv('CONFIG_PATH')

# Load the configuration from the JSON file
with open(config_path, 'r') as config_file:
    config = json.load(config_file)

# Set the environment variables
os.environ["BING_COOKIES"] = config["BING_COOKIES"]


async def main() -> None:
    async with SydneyClient() as sydney:
        question = 'Given these notes: The Anatomy of a Revolution Natese 12/12/23 • Brinton: a revolution is an overthrow of power which then subsides to a more moderate time again •he said it was like a fever -symptomatic: breakdown of the body in power -raging: clear the people cannot tolerate the fever so the rage is replaced with ann improved body of power and thus happier people -essentially, change, fever, resolution• theory was based an pre-1945 revolutions however •"The Anatomy of a Revolution" shows the commonalities. between English, American, French, and Russian revolutions 1917 • notes cycle: ald order → moderate regime-7 radical regime → Thermidorian reaction - Phase 1 - Preliminary stage Symptoms (the old order) -economically weak- gave must tax -politically weak - and cant enforce policy -intellectuals desert-reformers speak out -class antagonism - new regime vs new forces Phase 2- First Stage Symptoms (maderate regime) -financial break down wackers - symbolic/dramatic actions-protests -role of force - gov. cannot repress rebellion ・dual sovereignty- better gav mare abeyed -moderates attain power-constitution, fight war, etc. Phase 3-Crisis Stage symptoms (Radical Regime) -radicals take control, small # radicals gavern -war (Civil + foreign)centralization of power, one dude terror and virtue - forced conformity, gaspel of revolution- Cant-'
        response = await sydney.ask(question, citations=True)
        print("Sydney:", response.encode('ascii', 'ignore').decode('ascii'))

if __name__ == "__main__":
    asyncio.run(main())
from stackapi import StackAPI

# Initialize StackAPI client for Stack Overflow
SITE = StackAPI('stackoverflow')

def search_stackoverflow(question):
    try:
        # Search for questions related to the input question
        response = SITE.fetch('search', intitle=question, sort='relevance')
        if response['items']:
            # Return the link to the top answer/question on Stack Overflow
            return response['items'][0]['link']
        else:
            return "No relevant answer found on Stack Overflow."
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    question = input("Enter your programming question: ")
    response = search_stackoverflow(question)
    if response:
        print("Top answer/question on Stack Overflow:")
        print(response)
    else:
        print("Failed to fetch an answer from Stack Overflow.")

if __name__ == "__main__":
    main()

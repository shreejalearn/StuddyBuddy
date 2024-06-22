import wikipediaapi

def suggest_related_concepts(explorations, max_suggestions=10):
    # Initialize Wikipedia API with a specified user agent
    wiki_wiki = wikipediaapi.Wikipedia(
        language='en',
        extract_format=wikipediaapi.ExtractFormat.WIKI,
        user_agent='studybuddy-app/1.0'
    )

    suggested_concepts = set()
    for exploration in explorations:
        page = wiki_wiki.page(exploration)
        if page.exists():
            for link in page.links:
                suggested_concepts.add(link)
        
        # Limit the number of suggestions
        if len(suggested_concepts) >= max_suggestions:
            break

    return list(suggested_concepts)[:max_suggestions]

# Example usage
explorations = [
    "Artificial intelligence",
    "Machine learning",
    "Natural language processing",
    "Data analysis"
]

max_suggestions = 5  # Set your desired maximum number of suggestions
suggested_concepts = suggest_related_concepts(explorations, max_suggestions=max_suggestions)
print(f"Suggested Concepts to Explore (up to {max_suggestions}):")
for concept in suggested_concepts:
    print(f"- {concept}")

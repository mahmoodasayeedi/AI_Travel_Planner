import os
from openai import OpenAI

# theme -> (keywords to look for, minimum keyword hits, scene to draw)
# Order matters: if two themes tie, the earlier one wins.
THEMES = {
    "hiking": (
        ("hik", "trail", "trek", "summit", "mountain", "national park", "waterfall"),
        2,
        "a hiking scene: a winding trail through mountains, forest or an alpine "
        "lake, with one or two small hikers carrying backpacks, seen from far away",
    ),
    "beach": (
        ("beach", "snorkel", "swim", "surf", "island", "coast", "boat trip", "sail"),
        2,
        "a beach scene: clear water, sand, boats or palm trees, and relaxed "
        "travellers far away on the shore",
    ),
    "culture": (
        ("museum", "gallery", "temple", "cathedral", "palace", "castle", "old town", "historic", "monument"),
        2,
        "a cultural sightseeing scene: historic streets and architecture, "
        "museums or temples, with small groups of visitors far away",
    ),
    "nightlife": (
        ("nightlife", "club", "rooftop", "live music", "cocktail"),
        2,
        "an evening city scene with glowing lights, rooftop views and a lively "
        "street atmosphere",
    ),
    "shopping": (
        ("shopping", "boutique", "souvenir", "mall", "bazaar"),
        2,
        "a busy shopping street or colourful bazaar with market stalls",
    ),
    "food": (
        ("street food", "food tour", "market", "cooking class", "tasting", "local cuisine", "bakery", "cafe"),
        3,
        "a food scene: a lively local market or cafe terrace with fresh dishes "
        "and ingredients typical of the destination",
    ),
}

DEFAULT_SCENE = "the most beautiful scenery and atmosphere of the destination"


def pick_scene(text):
    """Choose the scene that matches the trip's main activity."""
    text = text.lower()
    best, best_score = None, 0
    for keywords, min_hits, scene in THEMES.values():
        score = sum(text.count(k) for k in keywords)
        if score >= min_hits and score > best_score:
            best, best_score = scene, score
    return best or DEFAULT_SCENE


def generate_destination_image(
    destination,
    itinerary_summary,
    image_style="illustrated travel poster",
):
    """Generate an image that matches the destination and the trip's main activity."""

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    scene = pick_scene(itinerary_summary)

    prompt = f"""
Create a {image_style} of {destination}.

Main subject: {scene}
Make this activity the focus of the image, set in the real scenery of {destination}.
Include at most one recognizable landmark or natural feature of {destination},
small and in the background, not the main subject.

Trip context (for mood only): {itinerary_summary[:600]}

Rules: wide scenic composition. People only small and seen from far away,
no close-up faces. No text, captions, watermarks, logos, signs with writing
or maps.
"""

    try:
        response = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1024x1024",
            output_format="jpeg",
            quality="medium",
        )

        if response is None or not response.data:
            return None

        return response.data[0].b64_json

    except Exception as exc:
        print(f"Image generation failed: {exc}")
        return None
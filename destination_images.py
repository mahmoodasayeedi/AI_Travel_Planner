
import os
from openai import OpenAI


def generate_destination_image(
    destination,
    itinerary_summary,
    image_style="illustrated travel poster",
):
    """
    Generate an image representing a travel destination
    and its planned activities.
    """

    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY")
    )

    prompt = f"""
    Create a beautiful travel image for {destination}.

    Travel plan:
    {itinerary_summary}

    Visual style: {image_style}

    Show recognizable destination landmarks and scenery,
    together with visual elements representing the planned
    activities. Make the image attractive, coherent, and
    suitable for a travel-planning application.

    Avoid text, captions, watermarks, and logos.
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

import json
from http.server import BaseHTTPRequestHandler

from _destination_images import generate_destination_image
from _util import read_json, send_json


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            b = read_json(self)
            destination = str(b.get("destination", "")).strip()[:100]
            summary = str(b.get("itinerary_summary", ""))[:4000]
        except (ValueError, json.JSONDecodeError):
            return send_json(self, 400, {"error": "Invalid request."})
        if not destination:
            return send_json(self, 400, {"error": "Missing destination."})
        data = generate_destination_image(destination, summary)
        if not data:
            return send_json(self, 502, {"error": "Image generation failed."})
        send_json(self, 200, {"image_b64": data, "mime": "image/jpeg"})

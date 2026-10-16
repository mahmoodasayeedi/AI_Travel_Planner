import json
from http.server import BaseHTTPRequestHandler

from _travel_tools import get_weather
from _util import read_json, send_json


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            city = str(read_json(self).get("city", "")).strip()[:80]
        except (ValueError, json.JSONDecodeError):
            return send_json(self, 400, {"error": "Invalid request."})
        if not city:
            return send_json(self, 400, {"error": "Please enter a city."})
        send_json(self, 200, get_weather(city))

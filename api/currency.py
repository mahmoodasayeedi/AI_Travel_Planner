import json
from http.server import BaseHTTPRequestHandler

from _travel_tools import convert_currency
from _util import read_json, send_json

ALLOWED = {"EUR", "USD", "GBP", "INR", "CHF"}


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            b = read_json(self)
            amount = float(b.get("amount"))
            src, dst = str(b.get("from", "")).upper(), str(b.get("to", "")).upper()
        except (ValueError, TypeError, json.JSONDecodeError):
            return send_json(self, 400, {"error": "Invalid request."})
        if not (0 < amount < 1e9) or src not in ALLOWED or dst not in ALLOWED:
            return send_json(self, 400, {"error": "Unsupported amount or currency."})
        send_json(self, 200, convert_currency(amount, src, dst))

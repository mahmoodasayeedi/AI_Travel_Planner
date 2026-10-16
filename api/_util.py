import json


def read_json(handler, max_bytes=300_000):
    length = int(handler.headers.get("Content-Length") or 0)
    if length <= 0 or length > max_bytes:
        raise ValueError("Request body missing or too large")
    return json.loads(handler.rfile.read(length))


def send_json(handler, status, payload):
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(body)

from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
model = SentenceTransformer("all-MiniLM-L6-v2")
@app.route("/embed", methods=["POST"])
def embed():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400
    vector = model.encode(data["text"]).tolist()
    return jsonify({"embedding": vector})

@app.route("/", methods=["GET"])
def health():
    return "✅ SBERT Embed Service is running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

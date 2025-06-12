from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

model = None

@app.route("/embed", methods=["POST"])
def embed():
    try:
        global model
        data = request.get_json()
        print(" Nhận được request:", data)

        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' field"}), 400
        if model is None:
            print(" Đang load model SBERT...")
            model = SentenceTransformer("all-MiniLM-L6-v2")

        # Encode
        vector = model.encode(data["text"]).tolist()
        return jsonify({"embedding": vector})

    except Exception as e:
        print("Lỗi khi xử lý /embed:", str(e))
        return jsonify({
            "error": "Internal Server Error",
            "detail": str(e)
        }), 500

@app.route("/", methods=["GET"])
def health():
    return "✅ SBERT Embed Service is running"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print(f" Đang chạy trên cổng {port}")
    app.run(host="0.0.0.0", port=port)


import os

from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = Flask(__name__)

api_key = os.getenv("GROQ_API_KEY")
model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

client = OpenAI(
api_key=api_key,
base_url="https://api.groq.com/openai/v1"
) if api_key else None

SYSTEM_INSTRUCTIONS = """
You are Nova AI, a friendly and helpful AI assistant.
Explain concepts clearly, especially for beginners.
Use examples when useful.
If you are unsure about something, say so honestly.
Keep answers organized and easy to understand.
"""


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    if client is None:
        return jsonify({
            "error": "API key is missing. Please configure your .env file."
        }), 500

    data = request.get_json(silent=True) or {}
    messages = data.get("messages")

    if not isinstance(messages, list) or not messages:
        return jsonify({"error": "Please send a message."}), 400

    if len(messages) > 20:
        return jsonify({
            "error": "Too many messages. Start a new chat."
        }), 400

    conversation = []

    for message in messages:
        if not isinstance(message, dict):
            return jsonify({"error": "Invalid message format."}), 400

        role = message.get("role")
        content = message.get("content")

        if role not in ("user", "assistant"):
            return jsonify({"error": "Invalid message role."}), 400

        if not isinstance(content, str) or not content.strip():
            return jsonify({"error": "Messages cannot be empty."}), 400

        if len(content) > 4000:
            return jsonify({
                "error": "Each message must be under 4000 characters."
            }), 400

        conversation.append({
            "role": role,
            "content": content.strip()
        })

    if conversation[-1]["role"] != "user":
        return jsonify({
            "error": "The latest message must be from the user."
        }), 400

    try:
        response = client.responses.create(
            model=model,
            instructions=SYSTEM_INSTRUCTIONS,
            input=conversation[-12:]
        )

        answer = response.output_text

        if not answer:
            answer = "I couldn't generate a response. Please try again."

        return jsonify({"reply": answer})

    except Exception:
        app.logger.exception("AI request failed")
        return jsonify({
            "error": (
                "The AI request failed. Check your API key, "
                "model access, billing, and internet connection."
            )
        }), 502


if __name__ == "__main__":
    app.run(debug=True)

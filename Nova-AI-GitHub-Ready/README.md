# Nova AI Chatbot

Nova AI is a browser-based conversational assistant built with **Python, Flask, HTML, CSS, and JavaScript**. It connects to the Groq API using the OpenAI-compatible Python client and displays generated responses in a web chat interface.

## Features

- Dark-themed chat interface
- Suggested starter prompts
- New chat and clear chat interactions
- Conversation messages sent to a Flask backend
- AI responses generated through the configured Groq model
- Input validation and readable API error handling
- API credentials loaded from environment variables

## Technology Stack

- Python
- Flask
- HTML5, CSS3, JavaScript
- OpenAI Python SDK (configured with Groq's OpenAI-compatible API)
- python-dotenv

## Project Structure

```text
Nova-AI/
├── app.py
├── requirements.txt
├── .env.example
├── .gitignore
├── templates/
│   └── index.html
├── static/
│   ├── style.css
│   └── script.js
└── docs/
    └── Nova_AI_Chatbot_Research_Report.pdf
```

## Setup and Run

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/Nova-AI-Chatbot.git
cd Nova-AI-Chatbot
```

### 2. Create and activate a virtual environment

Windows (Git Bash):

```bash
python -m venv .venv
source .venv/Scripts/activate
```

Windows (Command Prompt):

```bat
.venv\Scripts\activate
```

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Configure the API key

Copy `.env.example` to a new file named `.env`, then add your own Groq API key:

```env
GROQ_API_KEY=your_actual_api_key
GROQ_MODEL=openai/gpt-oss-20b
```

Keep `.env` private. It is excluded by `.gitignore`; never commit or share your real API key.

### 5. Start the application

```bash
python app.py
```

Open `http://127.0.0.1:5000` in your browser.

## Documentation

The `docs/` folder contains the project research report, including the overview, objectives, literature review, system architecture, methodology, implementation, testing plan, limitations, and future scope.

## Important Notes

- This project integrates an external language-model API; it does **not** train a language model from scratch.
- API availability, rate limits, and costs depend on the provider and account.
- Do not expose API credentials in frontend JavaScript, screenshots, commits, or public issues.

## Author

**Muhammed Fayas**

# Nova AI — Intelligent AI Chatbot

Nova AI is a web-based AI chatbot designed to provide an interactive conversational experience through a modern interface. Built using Python Flask and frontend technologies, it integrates an AI model API with chat management features and a responsive user interface.

## ✨ Features

- AI-powered conversational interface
- Multiple conversation management
- Create and switch between chats
- Search conversation history
- Rename and delete conversations
- Edit and resend user messages
- Regenerate AI responses
- Copy AI responses
- Copy code snippets
- Markdown rendering for AI responses
- Local chat history persistence
- Smooth message animations
- Scroll-to-latest-message button
- Responsive, dark-themed interface

## 🛠️ Tech Stack

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Python
- Flask

**AI Integration**
- Groq API
- OpenAI-compatible API client

**Additional Tools**
- Marked.js
- DOMPurify
- LocalStorage

## 📂 Project Structure

```text
Nova-AI-Chatbot/
│
├── app.py
├── requirements.txt
├── .env
├── .gitignore
│
├── static/
│   ├── script.js
│   └── style.css
│
├── templates/
│   └── index.html
│
└── README.md
```

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/VfFayas-hidden/Nova-AI-Chatbot.git
cd Nova-AI-Chatbot
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

### 3. Activate the virtual environment

**Windows:**

```bash
.venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Create a `.env` file in the project root and add your API credentials and configuration.

Never commit your real API key to GitHub.

### 6. Start the application

```bash
python app.py
```

Open the local URL shown in your terminal.

## ☁️ Deployment

Nova AI's Flask backend can be deployed as a web service on Render.

Deployment requires the application's Python dependencies, the correct Flask start command, and API credentials configured securely as environment variables on the hosting platform.

## 🔐 Security

- API credentials are stored in environment variables.
- `.env` is excluded from Git.
- Never expose API keys in frontend JavaScript or public repositories.
- Keep production secrets in your hosting provider's environment-variable settings.

## 🎯 Project Objective

Nova AI was developed to explore the integration of generative AI with full-stack web development, including API integration, conversational interfaces, frontend interaction, conversation management, and deployment.

## 👨‍💻 Author

**VF Mohammed Fayas**

GitHub: [VfFayas-hidden](https://github.com/VfFayas-hidden)

Project Repository: [Nova AI Chatbot](https://github.com/VfFayas-hidden/Nova-AI-Chatbot)

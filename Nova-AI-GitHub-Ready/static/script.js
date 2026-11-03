
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messagesContainer = document.getElementById("chat-messages");
const welcome = document.getElementById("welcome");

let messages = [];
let busy = false;

function updateWelcome() {
  welcome.hidden = messages.length > 0;
  messagesContainer.hidden = messages.length === 0;
}

function addMessage(role, content, isLoading = false) {
  const row = document.createElement("div");
  row.className = `message ${role}`;

  if (role === "assistant") {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "✦";
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = content;

 if (role === "assistant" && !isLoading) {
  bubble.innerHTML = DOMPurify.sanitize(marked.parse(content));
} else {
  bubble.textContent = content;
}

  row.appendChild(bubble);
  messagesContainer.appendChild(row);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  return { row, bubble };
}

function setBusy(value) {
  busy = value;
  sendButton.disabled = value;
  input.disabled = value;
  sendButton.textContent = value ? "…" : "↑";
}

async function sendMessage(text) {
  text = text.trim();

  if (!text || busy) return;

  messages.push({ role: "user", content: text });
  updateWelcome();
  addMessage("user", text);

  input.value = "";
  input.style.height = "auto";
  setBusy(true);

  const loading = addMessage("assistant", "", true);

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages.slice(-12)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

  loading.bubble.innerHTML = DOMPurify.sanitize(
  marked.parse(data.reply)
);
loading.bubble.style.opacity = "1";
loading.bubble.removeAttribute("aria-label");

    messages.push({
      role: "assistant",
      content: data.reply
    });
  } catch (error) {
    loading.bubble.textContent =
      error.message || "Could not connect to the server.";
    loading.bubble.style.opacity = "1";
    loading.bubble.style.color = "#ffaaaa";

    // Don't include failed turns in the next AI request.
    messages.pop();
  } finally {
    setBusy(false);
    input.focus();
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll(".suggestion").forEach((button) => {
  button.addEventListener("click", () => {
    sendMessage(button.dataset.prompt);
  });
});

function resetChat() {
  if (busy) return;

  messages = [];
  messagesContainer.replaceChildren();
  updateWelcome();
  input.value = "";
  input.style.height = "auto";
  input.focus();
}

document.getElementById("new-chat").addEventListener("click", resetChat);
document.getElementById("clear-chat").addEventListener("click", resetChat);

updateWelcome();

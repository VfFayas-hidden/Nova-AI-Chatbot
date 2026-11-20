
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messagesContainer = document.getElementById("chat-messages");
const welcome = document.getElementById("welcome");

let messages = [];
let busy = false;

function addCodeCopyButtons(container) {
  container.querySelectorAll("pre").forEach((pre) => {
    if (pre.querySelector(".code-copy-btn")) return;

    const code = pre.querySelector("code");
    if (!code) return;

    const button = document.createElement("button");
    button.className = "code-copy-btn";
    button.type = "button";
    button.textContent = "Copy code";

    button.addEventListener("click", async () => {
      try {
  await navigator.clipboard.writeText(code.innerText);
  button.textContent = "Copied!";

  setTimeout(() => {
    button.textContent = "Copy code";
  }, 2000);
} catch (error) {
  button.textContent = "Failed";

  setTimeout(() => {
    button.textContent = "Copy code";
  }, 2000);
}   
});

    pre.appendChild(button);
  });
}

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

  if (role === "assistant" && !isLoading) {
    bubble.innerHTML = DOMPurify.sanitize(marked.parse(content));
    addCodeCopyButtons(bubble);
  } else {
    bubble.textContent = content;
  }

  row.appendChild(bubble);

  // Copy button for completed AI responses
  if (role === "assistant" && !isLoading) {
    const copyButton = document.createElement("button");
    copyButton.className = "copy-btn";
    copyButton.textContent = "📋 Copy";
    copyButton.type = "button";
    copyButton.title = "Copy response";

    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(content);
        copyButton.textContent = "✓ Copied!";

        setTimeout(() => {
          copyButton.textContent = "📋 Copy";
        }, 2000);
      } catch (error) {
        copyButton.textContent = "Copy failed";

        setTimeout(() => {
          copyButton.textContent = "📋 Copy";
        }, 2000);
      }
    });

    row.appendChild(copyButton);
  }

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

let lastUserPrompt = "";

async function sendMessage(text) {
  text = text.trim();

  if (!text || busy) return;
  lastUserPrompt = text;

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

if (typeof data.reply !== "string" || !data.reply.trim()) {
  throw new Error("Nova AI returned an invalid response. Please try again.");
}

const formattedReply = data.reply.replace(
  /\n[ \t]*\n(?=[ \t]*\|)/g,
  "\n"
);

loading.bubble.innerHTML = DOMPurify.sanitize(
  marked.parse(formattedReply));
  addCodeCopyButtons(loading.bubble);


loading.bubble.style.opacity = "1";
loading.bubble.removeAttribute("aria-label");
// Add copy button after the AI response is ready
const copyButton = document.createElement("button");
copyButton.className = "copy-btn";
copyButton.textContent = "📋 Copy";
copyButton.type = "button";

copyButton.addEventListener("click", async () => {
  try {
    const cleanCopy = loading.bubble.cloneNode(true);

cleanCopy.querySelectorAll(".code-copy-btn").forEach((button) => {
  button.remove();
});

await navigator.clipboard.writeText(cleanCopy.innerText.trim());
    copyButton.textContent = "✓ Copied!";

    setTimeout(() => {
      copyButton.textContent = "📋 Copy";
    }, 2000);
  } catch (error) {
    copyButton.textContent = "Copy failed";

    setTimeout(() => {
      copyButton.textContent = "📋 Copy";
    }, 2000);
  }
});

loading.row.appendChild(copyButton);

const regenerateButton = document.createElement("button");
regenerateButton.className = "copy-btn";
regenerateButton.textContent = "↻ Regenerate";
regenerateButton.type = "button";

regenerateButton.addEventListener("click", () => {
  regenerateResponse(loading.bubble, regenerateButton);
});

loading.row.appendChild(regenerateButton);
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

async function regenerateResponse(bubble, button) {
  if (busy || !lastUserPrompt) return;

  setBusy(true);
  button.disabled = true;
  button.textContent = "Regenerating…";

  // Remove the previous AI answer from conversation history
  if (messages[messages.length - 1]?.role === "assistant") {
    messages.pop();
  }

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
      throw new Error(data.error || "Regeneration failed.");
    }

    bubble.innerHTML = DOMPurify.sanitize(marked.parse(data.reply));
    addCodeCopyButtons(bubble);

    // Replace the old response in conversation history
    messages.push({
      role: "assistant",
      content: data.reply
    });

    button.textContent = "↻ Regenerate";
  } catch (error) {
    button.textContent = "Regenerate failed";
  } finally {
    button.disabled = false;
    setBusy(false);
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

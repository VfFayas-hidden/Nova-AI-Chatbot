
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messagesContainer = document.getElementById("chat-messages");
const welcome = document.getElementById("welcome");

let messages = [];
let busy = false;

const CHAT_STORAGE_KEY = "nova_ai_chat";
const CHATS_STORAGE_KEY = "nova_ai_chats";

let chats = [];
let currentChatId = null;

function saveChat() {
  if (!messages.length || !currentChatId) return;

  const existingChatIndex = chats.findIndex(
    (chat) => chat.id === currentChatId
  );

  const chatData = {
    id: currentChatId,
   title:
  existingChatIndex !== -1 && chats[existingChatIndex].isRenamed
    ? chats[existingChatIndex].title
    : messages.find((message) => message.role === "user")
    ?.content
?.replace(/\s+/g, " ")
?.trim()
?.slice(0, 40) || "New Chat",
isRenamed:
  existingChatIndex !== -1
    ? chats[existingChatIndex].isRenamed || false
    : false,
    messages: messages,
    updatedAt: Date.now()
  };

  if (existingChatIndex !== -1) {
    chats[existingChatIndex] = chatData;
  } else {
    chats.unshift(chatData);
  }

  localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  renderChatHistory();
}

function loadChat() {
  try {
    // Load existing multiple chats
    const savedChats = localStorage.getItem(CHATS_STORAGE_KEY);

    if (savedChats) {
      chats = JSON.parse(savedChats);
    }

    // Migrate old single-chat history if needed
    if (chats.length === 0) {
      const oldChat = localStorage.getItem(CHAT_STORAGE_KEY);

      if (oldChat) {
        const oldMessages = JSON.parse(oldChat);

        if (oldMessages.length > 0) {
          const migratedChat = {
            id: Date.now().toString(),
            title:
              oldMessages.find((message) => message.role === "user")
                ?.content?.slice(0, 40) || "Previous Chat",
            messages: oldMessages,
            updatedAt: Date.now()
          };

          chats.push(migratedChat);

          localStorage.setItem(
            CHATS_STORAGE_KEY,
            JSON.stringify(chats)
          );
          
        }
      }
    }

    // Load the latest chat
    if (chats.length > 0) {
const latestChat = [...chats].sort(
  (a, b) => b.updatedAt - a.updatedAt
)[0];
      currentChatId = latestChat.id;
      messages = latestChat.messages || [];

      messages.forEach((message) => {
        addMessage(message.role, message.content);
      });

      const lastUserMessage = [...messages]
        .reverse()
        .find((message) => message.role === "user");

      if (lastUserMessage) {
        lastUserPrompt = lastUserMessage.content;
      }
    } else {
      messages = [];
      currentChatId = Date.now().toString();
    }

    updateWelcome();
    renderChatHistory();

  } catch (error) {
    console.error("Error loading chats:", error);

    messages = [];
    chats = [];
    currentChatId = Date.now().toString();
  }
}

function renderChatHistory() {
  const historyContainer = document.getElementById("chat-history");

  if (!historyContainer) return;

  historyContainer.replaceChildren();

  const searchInput = document.getElementById("chat-search");
const searchTerm = searchInput
  ? searchInput.value.trim().toLowerCase()
  : "";

const sortedChats = [...chats]
  .filter((chat) =>
    (chat.title || "New Chat").toLowerCase().includes(searchTerm)
  )
  .sort((a, b) => b.updatedAt - a.updatedAt);

  sortedChats.forEach((chat) => {
    const chatItem = document.createElement("div");
    chatItem.className = "history-item";

    if (chat.id === currentChatId) {
      chatItem.classList.add("active");
    }

    const title = document.createElement("span");
    title.textContent = chat.title || "New Chat";

    chatItem.appendChild(title);
    const deleteButton = document.createElement("button");
deleteButton.className = "delete-chat-btn";
deleteButton.textContent = "×";
deleteButton.type = "button";
deleteButton.title = "Delete chat";

const renameButton = document.createElement("button");
renameButton.className = "rename-chat-btn";
renameButton.textContent = "✎";
renameButton.type = "button";
renameButton.title = "Rename chat";

renameButton.addEventListener("click", (event) => {
  event.stopPropagation();

  const newTitle = prompt("Enter a new chat name:", chat.title || "New Chat");

  if (newTitle === null || !newTitle.trim()) return;

  chat.title = newTitle.trim();
chat.isRenamed = true;
chat.updatedAt = Date.now();

  localStorage.setItem(
    CHATS_STORAGE_KEY,
    JSON.stringify(chats)
  );

  renderChatHistory();
});

chatItem.appendChild(renameButton);

deleteButton.addEventListener("click", (event) => {
  event.stopPropagation();

  const confirmed = confirm(
    `Delete "${chat.title || "New Chat"}"?`
  );

  if (!confirmed) return;

  chats = chats.filter((item) => item.id !== chat.id);

  localStorage.setItem(
    CHATS_STORAGE_KEY,
    JSON.stringify(chats)
  );

  // If the deleted chat is currently open
  if (chat.id === currentChatId) {
    const nextChat = [...chats].sort(
      (a, b) => b.updatedAt - a.updatedAt
    )[0];

    if (nextChat) {
      currentChatId = nextChat.id;
      messages = nextChat.messages || [];
    } else {
      currentChatId = Date.now().toString();
      messages = [];
    }

    messagesContainer.replaceChildren();

    messages.forEach((message) => {
      addMessage(message.role, message.content);
    });

    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    lastUserPrompt = lastUserMessage
      ? lastUserMessage.content
      : "";

    editingMessageIndex = null;
    sendButton.textContent = "↑";
    input.value = "";
    input.style.height = "auto";

    updateWelcome();
  }

  renderChatHistory();
});

chatItem.appendChild(deleteButton);
    // Switch to the selected conversation
    chatItem.addEventListener("click", () => {
      if (busy || chat.id === currentChatId) return;

      saveChat();

      currentChatId = chat.id;
      messages = chat.messages || [];

      messagesContainer.replaceChildren();

      messages.forEach((message) => {
        addMessage(message.role, message.content);
      });

      const lastUserMessage = [...messages]
        .reverse()
        .find((message) => message.role === "user");

      lastUserPrompt = lastUserMessage
        ? lastUserMessage.content
        : "";

      editingMessageIndex = null;
      sendButton.textContent = "↑";

      updateWelcome();
      renderChatHistory();

      input.value = "";
      input.style.height = "auto";
    });

    historyContainer.appendChild(chatItem);
  });
}

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
  if (role === "user") {
  const editButton = document.createElement("button");
  editButton.className = "edit-btn";
  editButton.textContent = "✏️ Edit";
  editButton.type = "button";

  editButton.addEventListener("click", () => {
  const userMessageIndex = messages.findIndex(
    (message) => message.role === "user" && message.content === content
  );

  editingMessageIndex = userMessageIndex;

  input.value = content;
  input.focus();
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;

  sendButton.textContent = "Update";
});

  row.appendChild(editButton);
}

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
let editingMessageIndex = null;

async function sendMessage(text) {
  text = text.trim();

  if (!text || busy) return;
  lastUserPrompt = text;
  

  if (editingMessageIndex !== null) {
  // Replace the edited user message
  messages[editingMessageIndex] = {
    role: "user",
    content: text
  };

  // Remove all conversation messages after the edited message
  messages = messages.slice(0, editingMessageIndex + 1);

  // Update the visible chat
  messagesContainer.replaceChildren();

  messages.forEach((message) => {
    addMessage(message.role, message.content);
  });

  editingMessageIndex = null;
  sendButton.textContent = "↑";
} else {
  // Normal message sending
  messages.push({ role: "user", content: text });
  updateWelcome();
  addMessage("user", text);
}

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
    saveChat();
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

  // Save the current conversation first
  saveChat();

  // Create a new conversation ID
  currentChatId = Date.now().toString();

  // Start with empty messages
  messages = [];

  // Clear the chat screen
  messagesContainer.replaceChildren();

  // Reset UI
  editingMessageIndex = null;
  lastUserPrompt = "";
  input.value = "";
  input.style.height = "auto";
  sendButton.textContent = "↑";

  updateWelcome();
  input.focus();
}

document.getElementById("new-chat").addEventListener("click", resetChat);
document.getElementById("clear-chat").addEventListener("click", resetChat);

const chatSearchInput = document.getElementById("chat-search");

if (chatSearchInput) {
  chatSearchInput.addEventListener("input", () => {
    renderChatHistory();
  });
}

loadChat();
updateWelcome();

// Scroll to latest message
// Scroll to bottom button
const scrollToBottomButton = document.getElementById("scroll-to-bottom");

scrollToBottomButton.addEventListener("click", () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: "smooth"
  });
});

window.addEventListener("scroll", () => {
  const isNearBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 150;

  scrollToBottomButton.classList.toggle("visible", !isNearBottom);
});
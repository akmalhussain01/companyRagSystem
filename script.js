// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
// Point this at your backend endpoint that wraps chatbot.js / your RAG logic.
// It should accept POST { question: string } and return JSON { answer: string }.
const API_URL = "http://localhost:3000/api/ask";

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------
const log = document.getElementById("log");
const composer = document.getElementById("composer");
const input = document.getElementById("question-input");
const sendBtn = document.getElementById("send-btn");
const statusPill = document.getElementById("status-pill");

let isLoading = false;

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------
function scrollToBottom() {
  log.scrollTop = log.scrollHeight;
}

function appendUserMessage(text) {
  const row = document.createElement("div");
  row.className = "flex justify-end";
  row.innerHTML = `
    <div class="bg-gold text-ink rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed max-w-[85%] sm:max-w-[75%] whitespace-pre-wrap"></div>
  `;
  row.querySelector("div").textContent = text;
  log.appendChild(row);
  scrollToBottom();
}

function appendAssistantMessage(text) {
  const row = document.createElement("div");
  row.className = "flex gap-3";
  row.innerHTML = `
    <div class="h-7 w-7 rounded-md bg-panel border border-line flex items-center justify-center text-gold text-xs font-semibold shrink-0">NX</div>
    <div class="bg-panel border border-line rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed max-w-[85%] sm:max-w-[75%] whitespace-pre-wrap"></div>
  `;
  row.querySelector("div:last-child").textContent = text;
  log.appendChild(row);
  scrollToBottom();
}

function appendErrorMessage(text) {
  const row = document.createElement("div");
  row.className = "flex gap-3";
  row.innerHTML = `
    <div class="h-7 w-7 rounded-md bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xs font-semibold shrink-0">!</div>
    <div class="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed max-w-[85%] sm:max-w-[75%]"></div>
  `;
  row.querySelector("div:last-child").textContent = text;
  log.appendChild(row);
  scrollToBottom();
}

function showTypingIndicator() {
  const row = document.createElement("div");
  row.id = "typing-indicator";
  row.className = "flex gap-3";
  row.innerHTML = `
    <div class="h-7 w-7 rounded-md bg-panel border border-line flex items-center justify-center text-gold text-xs font-semibold shrink-0">NX</div>
    <div class="bg-panel border border-line rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
      <span class="dot h-1.5 w-1.5 rounded-full bg-slate-400 inline-block"></span>
      <span class="dot h-1.5 w-1.5 rounded-full bg-slate-400 inline-block"></span>
      <span class="dot h-1.5 w-1.5 rounded-full bg-slate-400 inline-block"></span>
    </div>
  `;
  log.appendChild(row);
  scrollToBottom();
}

function removeTypingIndicator() {
  document.getElementById("typing-indicator")?.remove();
}

function setLoading(loading) {
  isLoading = loading;
  sendBtn.disabled = loading;
  input.disabled = loading;
  if (statusPill) {
    statusPill.innerHTML = loading
      ? `<span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Thinking`
      : `<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Ready`;
  }
}

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------
async function askQuestion(question) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();

  // Adjust this line if your backend's response shape differs,
  // e.g. data.answer, data.response, data.result, etc.
  return data.answer ?? data.response ?? data.result ?? "No answer returned.";
}

// ---------------------------------------------------------------------------
// Textarea auto-resize
// ---------------------------------------------------------------------------
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 160) + "px";
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    composer.requestSubmit();
  }
});

// ---------------------------------------------------------------------------
// Submit handler
// ---------------------------------------------------------------------------
composer.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = input.value.trim();
  if (!question || isLoading) return;

  appendUserMessage(question);
  input.value = "";
  input.style.height = "auto";
  setLoading(true);
  showTypingIndicator();

  try {
    const answer = await askQuestion(question);
    removeTypingIndicator();
    appendAssistantMessage(answer);
  } catch (err) {
    removeTypingIndicator();
    appendErrorMessage(
      `Couldn't reach the assistant (${err.message}). Check that your backend is running at ${API_URL}.`
    );
  } finally {
    setLoading(false);
    input.focus();
  }
});
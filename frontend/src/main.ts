/**
 * Application entry-point.
 *
 * Wires together:
 *  - Supabase auth (sign-in / sign-up)
 *  - Three.js + WebXR AR scene
 *  - FastAPI chat endpoint
 */

import { ARScene } from "./ar-scene";
import { getPersonalities, sendMessage } from "./services/api";
import { signIn, signUp, signOut, getSession } from "./services/auth";
import type { ChatMessage, Personality } from "./types/types";

// ── DOM refs ─────────────────────────────────────────────────────────────────

const canvas = document.getElementById("ar-canvas") as HTMLCanvasElement;
const authOverlay = document.getElementById("auth-overlay") as HTMLDivElement;
const authSubmit = document.getElementById("auth-submit") as HTMLButtonElement;
const authSwitch = document.getElementById("auth-switch") as HTMLSpanElement;
const authError = document.getElementById("auth-error") as HTMLDivElement;
const authEmail = document.getElementById("auth-email") as HTMLInputElement;
const authPassword = document.getElementById(
  "auth-password",
) as HTMLInputElement;
const messageInput = document.getElementById(
  "message-input",
) as HTMLInputElement;
const sendBtn = document.getElementById("send-btn") as HTMLButtonElement;
const arBtn = document.getElementById("ar-btn") as HTMLButtonElement;
const authToggleText = document.getElementById(
  "auth-toggle-text",
) as HTMLSpanElement;
const chatMessages = document.getElementById("chat-messages") as HTMLDivElement;
const personalitySelect = document.getElementById(
  "personality-select",
) as HTMLSelectElement;
const personalityDescription = document.getElementById(
  "personality-description",
) as HTMLDivElement;

// ── App state ─────────────────────────────────────────────────────────────────

let accessToken: string | null = null;
let sessionId: string | undefined;
let isSignUpMode = false;
const messages: ChatMessage[] = [];
let scene: ARScene;
let personalities: Personality[] = [];
let selectedPersonalityId = "aria";

// ── Helpers ───────────────────────────────────────────────────────────────────

function appendMessage(msg: ChatMessage): void {
  messages.push(msg);
  const el = document.createElement("div");
  el.className = `msg ${msg.role}`;
  el.textContent = msg.content;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setError(text: string): void {
  authError.textContent = text;
}

function hideAuthOverlay(): void {
  authOverlay.style.display = "none";
}

function getPersonalityName(personalityId: string): string {
  const found = personalities.find((p) => p.id === personalityId);
  return found?.name ?? "Aria";
}

function getToneLabel(personality: Personality): string {
  if (personality.id === "aria") return "Empathetic";
  if (personality.id === "coach") return "Action-focused";
  if (personality.id === "reflective") return "Thoughtful";

  const description = personality.description.toLowerCase();
  if (description.includes("empathetic") || description.includes("warm"))
    return "Empathetic";
  if (description.includes("action") || description.includes("motivational"))
    return "Action-focused";
  if (description.includes("reflect") || description.includes("thoughtful"))
    return "Thoughtful";
  return "Custom";
}

function renderPersonalityOptions(items: Personality[]): void {
  const toneOrder = ["Empathetic", "Action-focused", "Thoughtful", "Custom"];
  const grouped = new Map<string, Personality[]>();

  for (const item of items) {
    const tone = getToneLabel(item);
    const existing = grouped.get(tone) ?? [];
    existing.push(item);
    grouped.set(tone, existing);
  }

  personalitySelect.innerHTML = "";
  for (const tone of toneOrder) {
    const groupItems = (grouped.get(tone) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    if (!groupItems.length) continue;

    const group = document.createElement("optgroup");
    group.label = tone;

    for (const item of groupItems) {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      option.title = item.description;
      group.appendChild(option);
    }

    personalitySelect.appendChild(group);
  }
}

function updatePersonalityDescription(personalityId: string): void {
  const found = personalities.find((p) => p.id === personalityId);
  personalityDescription.textContent =
    found?.description ?? "Warm and empathetic AI friend.";
}

async function loadPersonalities(): Promise<void> {
  try {
    personalities = await getPersonalities();
  } catch {
    personalities = [
      {
        id: "aria",
        name: "Aria",
        description: "Warm and empathetic AI friend.",
      },
    ];
  }

  renderPersonalityOptions(personalities);

  const hasSelected = personalities.some((p) => p.id === selectedPersonalityId);
  const ariaDefault = personalities.find((p) => p.id === "aria")?.id;
  selectedPersonalityId = hasSelected
    ? selectedPersonalityId
    : (ariaDefault ?? personalities[0]?.id ?? "aria");
  personalitySelect.value = selectedPersonalityId;
  updatePersonalityDescription(selectedPersonalityId);
}

personalitySelect.addEventListener("change", () => {
  selectedPersonalityId = personalitySelect.value;
  updatePersonalityDescription(selectedPersonalityId);
});

// ── Auth flow ─────────────────────────────────────────────────────────────────

authSwitch.addEventListener("click", () => {
  isSignUpMode = !isSignUpMode;
  authSubmit.textContent = isSignUpMode ? "Sign Up" : "Sign In";
  authSwitch.textContent = isSignUpMode ? "Sign In" : "Sign Up";
  authToggleText.textContent = isSignUpMode
    ? "Already have an account? "
    : "Don't have an account? ";
  setError("");
});

authSubmit.addEventListener("click", async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value;
  setError("");

  if (!email || !password) {
    setError("Please enter your email and password.");
    return;
  }

  try {
    authSubmit.disabled = true;
    const response = isSignUpMode
      ? await signUp(email, password)
      : await signIn(email, password);

    accessToken = response.access_token;
    hideAuthOverlay();
    appendMessage({
      role: "assistant",
      content: `Hi! I'm ${getPersonalityName(selectedPersonalityId)}. How are you doing?`,
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : "Authentication failed.");
  } finally {
    authSubmit.disabled = false;
  }
});

// ── Chat flow ─────────────────────────────────────────────────────────────────

async function handleSend(): Promise<void> {
  const text = messageInput.value.trim();
  if (!text || !accessToken) return;

  messageInput.value = "";
  appendMessage({ role: "user", content: text });
  sendBtn.disabled = true;

  try {
    const response = await sendMessage(
      text,
      accessToken,
      sessionId,
      selectedPersonalityId,
    );
    sessionId = response.session_id;
    appendMessage({ role: "assistant", content: response.reply });
    selectedPersonalityId = response.personality_id;
    personalitySelect.value = selectedPersonalityId;
    updatePersonalityDescription(selectedPersonalityId);
    scene.triggerTalkAnimation();
  } catch (err) {
    appendMessage({
      role: "assistant",
      content: "Sorry, I couldn't connect right now. Please try again.",
    });
  } finally {
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

sendBtn.addEventListener("click", handleSend);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSend();
});

// ── AR button ─────────────────────────────────────────────────────────────────

arBtn.addEventListener("click", async () => {
  if (scene.inXR) {
    await scene.stopAR();
    arBtn.textContent = "Start AR";
  } else {
    const started = await scene.startAR();
    if (started) {
      arBtn.textContent = "Stop AR";
    } else {
      alert(
        "WebXR AR is not supported on this device/browser.\n" +
          "Try Chrome on an Android device, or use the 3-D view in desktop mode.",
      );
    }
  }
});

// ── Sign-out (keyboard shortcut: Escape) ─────────────────────────────────────

document.addEventListener("keydown", async (e) => {
  if (e.key === "Escape" && accessToken) {
    await signOut();
    accessToken = null;
    sessionId = undefined;
    messages.length = 0;
    chatMessages.innerHTML = "";
    authOverlay.style.display = "flex";
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────

async function init(): Promise<void> {
  scene = new ARScene(canvas);
  await loadPersonalities();

  // Check for an existing Supabase session
  const existing = await getSession();
  if (existing) {
    accessToken = existing.access_token;
    hideAuthOverlay();
    appendMessage({
      role: "assistant",
      content: `Welcome back! ${getPersonalityName(selectedPersonalityId)} is ready to chat.`,
    });
  }
}

init();

/**
 * Application entry-point.
 *
 * Wires together:
 *  - Supabase auth (sign-in / sign-up)
 *  - Three.js + WebXR AR scene
 *  - FastAPI chat endpoint
 */

import { ARScene } from "./ar-scene";
import { sendMessage } from "./api";
import { signIn, signUp, signOut, getSession } from "./auth";
import type { ChatMessage } from "./types";

// ── DOM refs ─────────────────────────────────────────────────────────────────

const canvas = document.getElementById("ar-canvas") as HTMLCanvasElement;
const authOverlay = document.getElementById("auth-overlay") as HTMLDivElement;
const authSubmit = document.getElementById("auth-submit") as HTMLButtonElement;
const authSwitch = document.getElementById("auth-switch") as HTMLSpanElement;
const authError = document.getElementById("auth-error") as HTMLDivElement;
const authEmail = document.getElementById("auth-email") as HTMLInputElement;
const authPassword = document.getElementById("auth-password") as HTMLInputElement;
const messageInput = document.getElementById("message-input") as HTMLInputElement;
const sendBtn = document.getElementById("send-btn") as HTMLButtonElement;
const arBtn = document.getElementById("ar-btn") as HTMLButtonElement;
const authToggleText = document.getElementById("auth-toggle-text") as HTMLSpanElement;
const chatMessages = document.getElementById("chat-messages") as HTMLDivElement;

// ── App state ─────────────────────────────────────────────────────────────────

let accessToken: string | null = null;
let sessionId: string | undefined;
let isSignUpMode = false;
const messages: ChatMessage[] = [];
let scene: ARScene;

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
    appendMessage({ role: "aria", content: "Hi! I'm Aria, your AI friend. How are you doing?" });
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
    const response = await sendMessage(text, accessToken, sessionId);
    sessionId = response.session_id;
    appendMessage({ role: "aria", content: response.reply });
    scene.triggerTalkAnimation();
  } catch (err) {
    appendMessage({
      role: "aria",
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

  // Check for an existing Supabase session
  const existing = await getSession();
  if (existing) {
    accessToken = existing.access_token;
    hideAuthOverlay();
    appendMessage({ role: "aria", content: "Welcome back! Great to see you again." });
  }
}

init();

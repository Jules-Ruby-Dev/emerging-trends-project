import { useEffect, useRef, useState } from "react";
import { ARScene } from "./ar-scene";
import { sendMessage } from "./api";
import { signIn, signUp, signOut, getSession } from "./auth";
import type { ChatMessage } from "./types";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize AR scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new ARScene(canvasRef.current);

    // Cleanup on unmount
    return () => {
      scene.dispose?.();
    };
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        setAccessToken(session.access_token);
        setIsAuthenticated(true);
      }
    };
    checkSession();
  }, []);

  // Handle auth
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      if (isSignUpMode) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      const session = await getSession();
      if (session) {
        setAccessToken(session.access_token);
        setIsAuthenticated(true);
      }
      setEmail("");
      setPassword("");
    } catch (error: any) {
      setAuthError(error.message || "Authentication failed");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    setIsAuthenticated(false);
    setAccessToken(null);
    setMessages([]);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !accessToken) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: messageInput,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessageInput("");
    setIsLoading(true);

    try {
      const response = await sendMessage(messageInput, accessToken, sessionId);
      const ariaMsg: ChatMessage = {
        role: "aria",
        content: response.reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, ariaMsg]);
      setSessionId(response.session_id);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated, show auth overlay
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black">
        <div className="w-96 p-8 bg-gray-900 rounded-lg shadow-2xl border border-gray-800">
          <h1 className="text-3xl font-bold mb-2 text-white">AI Friend AR</h1>
          <p className="text-gray-400 mb-6 text-sm">
            {isSignUpMode ? "Create your account" : "Sign in to continue"}
          </p>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {authError && <p className="text-red-500 text-sm">{authError}</p>}

            <Button type="submit" className="w-full">
              {isSignUpMode ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-400">
            {isSignUpMode ? "Have an account?" : "New user?"}{" "}
            <button
              onClick={() => setIsSignUpMode(!isSignUpMode)}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {isSignUpMode ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Main app with AR scene
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Full-screen AR Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* UI Overlay - positioned on top */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">AI Friend AR</h1>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Bottom chat interface */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-auto">
          {/* Messages */}
          <div className="mb-4 max-h-48 overflow-y-auto space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input row */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Chat with Aria..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !messageInput.trim()}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

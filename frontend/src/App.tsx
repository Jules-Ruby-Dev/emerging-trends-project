import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { ARScene } from "./ar-scene";
import { sendMessage } from "./api";
import { signIn, signUp, signOut, getSession } from "./auth";
import type { ChatMessage } from "./types";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./pages/HomePage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PretendFriendPage } from "./pages/PretendFriendPage";
import { LoginPage } from "./pages/LoginPage";

// Debug logging
if (typeof window !== "undefined") {
  console.log("✅ App loading...");
}

function AppContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Get current page from route
  const getCurrentPage = () => {
    if (location.pathname === "/history") return "history";
    if (location.pathname === "/settings") return "settings";
    if (location.pathname === "/pretend-friend") return "pretend";
    return "home";
  };

  // Initialize AR scene only on home page
  useEffect(() => {
    if (location.pathname === "/" && !isAuthenticated) return;
    if (location.pathname !== "/") {
      return;
    }

    if (!canvasRef.current) return;

    const scene = new ARScene(canvasRef.current);

    return () => {
      scene.dispose?.();
    };
  }, [location.pathname, isAuthenticated]);

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
        navigate("/");
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
    navigate("/");
  };

  // Handle send message
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) {
      console.warn("Empty message, not sending");
      return;
    }
    if (!accessToken) {
      console.error("No access token available");
      setAuthError("Not authenticated. Please sign in first.");
      return;
    }

    console.log("Sending message:", text);

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      console.log("Calling sendMessage API...");
      const response = await sendMessage(text, accessToken, sessionId);
      console.log("API response:", response);

      const ariaMsg: ChatMessage = {
        role: "aria",
        content: response.reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, ariaMsg]);
      setSessionId(response.session_id);
    } catch (error: any) {
      console.error("Failed to send message:", error);
      const errorMsg: ChatMessage = {
        role: "aria",
        content: `Error: ${error.message || "Something went wrong"}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <LoginPage
        isSignUp={isSignUpMode}
        email={email}
        password={password}
        error={authError}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleAuthSubmit}
        onToggleMode={() => setIsSignUpMode(!isSignUpMode)}
      />
    );
  }

  // Main app with routing
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Canvas only on home page */}
      {location.pathname === "/" && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}

      {/* Pages */}
      <div className="absolute inset-0 w-full h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  messages={messages}
                  messageInput={messageInput}
                  isLoading={isLoading}
                  onSendMessage={handleSendMessage}
                  onInputChange={setMessageInput}
                />
              }
            />
            <Route path="/history" element={<HistoryPage />} />
            <Route
              path="/settings"
              element={<SettingsPage onLogout={handleLogout} />}
            />
            <Route path="/pretend-friend" element={<PretendFriendPage />} />
          </Routes>
        </div>

        {/* Navigation - Fixed at bottom */}
        <Navigation currentPage={getCurrentPage()} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

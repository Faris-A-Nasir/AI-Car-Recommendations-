import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import {
  Send,
  Car,
  LogOut,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Chat() {
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessionDirty, setSessionDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchSessions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/chat", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch sessions");
        const data = await res.json();
        setChatSessions(data);
      } catch (err) {
        console.error("Error loading chat sessions:", err);
      }
    };
    fetchSessions();
  }, [user]);

  const saveFullSession = async (chatMessages, sessionId = null) => {
    if (!chatMessages || chatMessages.length === 0) return;
    const chatContent = JSON.stringify(chatMessages);
    try {
      const res = await fetch("http://localhost:5000/api/chat/save-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ chatContent }),
      });
      if (!res.ok) throw new Error("Failed to save session");
      const data = await res.json();
      if (sessionId) {
        setChatSessions((prev) =>
          prev.map((sess) => (sess._id === sessionId ? data.session : sess))
        );
      } else {
        setChatSessions((prev) => [data.session, ...prev]);
      }
      return data.session;
    } catch (err) {
      console.error("Error saving chat session:", err);
    }
  };

  const startNewChat = async () => {
    if (messages.length > 0 && sessionDirty) {
      await saveFullSession(messages, currentSessionId);
      setSessionDirty(false);
    }
    setCurrentSessionId(null);
    setSessionDirty(false);
    setMessages([]);
    setMessage("");
  };

  const loadSession = async (session) => {
    if (session._id === currentSessionId) return;
    if (messages.length > 0) {
      await saveFullSession(messages, currentSessionId);
    }
    let loadedMessages = [];
    try {
      loadedMessages = JSON.parse(session.chatContent);
    } catch (err) {
      console.error("Error parsing chat content:", err);
    }
    setCurrentSessionId(session._id);
    setMessages(loadedMessages);
    setMessage("");
  };

  const deleteSession = async (sessionId) => {
    setSessionToDelete(sessionId);
    setShowConfirm(true);

    try {
      const res = await fetch(`http://localhost:5000/api/chat/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete session");
      setChatSessions((prev) => prev.filter((sess) => sess._id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const userMsg = {
      type: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    // ✅ Updated to use functional state update
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      setSessionDirty(true);
      return updated;
    });

    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();

      const aiMsg = {
        type: "ai",
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => {
        const updated = [...prev, aiMsg];
        setSessionDirty(true);
        return updated;
      });
    } catch (error) {
      console.error("Error calling AI:", error);
      const errorMsg = {
        type: "ai",
        content: "Something went wrong. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // ✅ Updated to use saveFullSession
  const handleLogout = async () => {
    try {
      if (sessionDirty && messages.length > 0) {
        await saveFullSession(messages, currentSessionId);
        setSessionDirty(false);
      }
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Error saving chat before logout:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div
        className={`fixed md:relative h-full bg-blue shadow-lg transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-0 md:w-16 overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <div
              className={`flex items-center space-x-2 ${
                !sidebarOpen && "md:hidden"
              }`}
            >
              <Car className="w-6 h-6 text-blue-500" />
              <span className="font-semibold text-lg">CarAI Advisor</span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>

          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {user && (
              <>
                <button
                  onClick={startNewChat}
                  className={`w-full flex items-center space-x-2 text-gray-700 hover:text-blue-500 bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors ${
                    !sidebarOpen && "md:justify-center"
                  }`}
                >
                  <PlusCircle className="w-5 h-5" />
                  {sidebarOpen && <span>New Chat</span>}
                </button>

                {chatSessions.length === 0 && sidebarOpen && (
                  <div className="mt-4 text-gray-500 text-sm text-center">
                    No previous chats
                  </div>
                )}

                {chatSessions.map((session) => (
                  <div
                    key={session._id}
                    className={`w-full flex items-center justify-between group p-2 rounded-lg hover:bg-blue-100 transition-colors ${
                      currentSessionId === session._id
                        ? "bg-blue-200 text-blue-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    <button
                      onClick={() => loadSession(session)}
                      className="flex-1 text-left truncate" // Add truncate here to limit long titles
                      title={session.title} // optional, show full title on hover
                    >
                      {session.title || "Untitled Session"}{" "}
                      {/* Show title instead of date */}
                    </button>

                    <button
                      onClick={() => {
                        setSessionToDelete(session._id);
                        setShowConfirm(true);
                      }}
                      className="ml-2 p-1 rounded hover:bg-red-100"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-700" />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="mb-2 flex items-center space-x-2 text-gray-600">
              <User className="w-5 h-5" />
              {sidebarOpen && (
                <span className="font-medium">{user?.name || "Guest"}</span>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center space-x-2 text-gray-700 hover:text-red-500 p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                !sidebarOpen && "md:justify-center"
              }`}
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-center">
            <div className="text-gray-500 text-sm max-w-xl text-center p-2 bg-gray-100 rounded-md">
              السَّلَامُ عَلَيْكُمْ Welcome to CarAdvisor – your car
              recommendation assistant.
            </div>
          </div>

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.type === "system"
                  ? "justify-center"
                  : msg.type === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {msg.type === "system" ? (
                <div className="text-gray-500 text-sm">{msg.content}</div>
              ) : (
                <div
                  className={`max-w-xl rounded-lg p-4 ${
                    msg.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800"
                  } shadow`}
                >
                  {msg.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSend} className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                currentSessionId
                  ? "Viewing previous chat. Start a new chat to ask more."
                  : "Ask about car recommendations..."
              }
              disabled={!!currentSessionId}
              className={`flex-1 border rounded-lg px-4 py-2 focus:outline-none ${
                currentSessionId
                  ? "bg-gray-100 cursor-not-allowed text-gray-500"
                  : "focus:ring-2 focus:ring-blue-500"
              }`}
            />
            <button
              type="submit"
              disabled={!!currentSessionId}
              className={`rounded-lg px-4 py-2 focus:outline-none ${
                currentSessionId
                  ? "bg-gray-300 text-white cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Delete Chat Session</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this chat session? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSessionToDelete(null);
                }}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `http://localhost:5000/api/chat/${sessionToDelete}`,
                      {
                        method: "DELETE",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                        },
                      }
                    );
                    if (!res.ok) throw new Error("Failed to delete session");
                    setChatSessions((prev) =>
                      prev.filter((sess) => sess._id !== sessionToDelete)
                    );
                    if (currentSessionId === sessionToDelete) {
                      setCurrentSessionId(null);
                      setMessages([]);
                    }
                  } catch (err) {
                    console.error("Error deleting session:", err);
                  } finally {
                    setShowConfirm(false);
                    setSessionToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;

// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const authenticate = require('../middleware/auth');
const ChatSession = require('../models/ChatMessage');

// Route to get AI response
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post("http://localhost:5000/predict", { message });
    res.json({ reply: response.data.reply });
  } catch (err) {
    res.status(500).json({ reply: "Error contacting AI model" });
  }
});

// DELETE /api/chat/:id
router.delete('/:id', authenticate, async (req, res) => {
  const sessionId = req.params.id;

  try {
    // Assuming you have a ChatSession mongoose model
    const deletedSession = await ChatSession.findByIdAndDelete(sessionId);

    if (!deletedSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    return res.json({ message: 'Chat session deleted successfully' });
  } catch (err) {
    console.error('Error deleting chat session:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Route to save full chat session
router.post("/save-session", authenticate, async (req, res) => {
  try {
    const { chatContent } = req.body;

    if (!chatContent || typeof chatContent !== "string") {
      return res.status(400).json({ error: "chatContent must be a string." });
    }

    let title = "New Chat";

    try {
      // Parse chatContent assuming it's a JSON string of message objects
      const messages = JSON.parse(chatContent);

      if (Array.isArray(messages) && messages.length > 0) {
        // Find first message that has content (usually user message)
        const firstMessage = messages.find(msg => msg.content && msg.content.trim());

        if (firstMessage) {
          // Clean up and trim to 25 characters
          title = firstMessage.content.replace(/\s+/g, ' ').trim().slice(0, 25);
        }
      }
    } catch (parseErr) {
      // If JSON parsing fails, fallback to raw chatContent snippet
      title = chatContent.replace(/\s+/g, ' ').trim().slice(0, 25);
    }

    const session = new ChatSession({
      userId: req.user._id,
      chatContent,
      title: title || "New Chat",
    });

    await session.save();

    res.status(201).json({ message: "Chat session saved successfully", session });
  } catch (err) {
    console.error("Save session error:", err.message);
    res.status(500).json({ error: "Failed to save chat session" });
  }
});



// Route to get all chat sessions for logged-in user
router.get("/", authenticate, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error("Fetch sessions error:", err.message);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
});

module.exports = router;

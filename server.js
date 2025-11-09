require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// --- FIX: Specific CORS Configuration for Local Host and Live Site ---
const allowedOrigins = [
    'http://localhost:5174', // Your local frontend dev server (port may vary)
    'https://00shaima.github.io' // YOUR LIVE GITHUB PAGES DOMAIN
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true); 
        
        // Allow if the origin is in our list
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // Block requests from unauthorized origins
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// --------------------------------------------------------------------

app.use(express.json());

// --- ROUTES (No changes needed below here) ---

// ✅ POST /api/feedback (Save new feedback)
app.post("/api/feedback", async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Feedback data is required" });
    }

    const newFeedback = await prisma.feedback.create({
      data: {
        answers: req.body,
      },
    });

    res.status(201).json(newFeedback);
  } catch (error) {
    console.error("❌ Error saving feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/feedback (Get all feedbacks)
app.get("/api/feedback", async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(feedbacks);
  } catch (error) {
    console.error("❌ Error fetching feedbacks:", error);
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
});


// ✅ DELETE /api/feedback/:id
app.delete("/api/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    await prisma.feedback.delete({ where: { id } });
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting feedback:", error);
    res.status(500).json({ error: "Failed to delete feedback" });
  }
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Feedback API (MongoDB + Prisma) is running!");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
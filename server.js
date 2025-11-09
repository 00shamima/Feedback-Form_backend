require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// --------------------------------------------------------------------
// ✅ FIX & CONFIGURATION: CORS Setup
// --------------------------------------------------------------------

// NOTE: Please verify these origins match your setup exactly.
// 1. 'http://localhost:5173' is the common Vite dev port (yours was 5174 in the comment)
// 2. 'https://00shamima.github.io' is your live frontend URL
const allowedOrigins = [
    'http://localhost:5173', // Adjust this to your local Vite port if it's different
    'http://localhost:5174',
    'https://00shamima.github.io', // YOUR LIVE GITHUB PAGES DOMAIN
    'https://feedback-form-frontend-iiky4.onrender.com' // If you also deployed the FE to Render
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or curl requests)
        // AND allow all listed origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Block requests from unauthorized origins
            console.log(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// --------------------------------------------------------------------

app.use(express.json());

// --- ROUTES ---

// ✅ POST /api/feedback (Save new feedback)
app.post("/api/feedback", async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Feedback data is required" });
        }

        // We are saving the entire request body as the 'answers' field (assuming a JSON column)
        const newFeedback = await prisma.feedback.create({
            data: {
                answers: req.body,
                // Add a string field if needed, e.g., topic: req.body.topic,
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
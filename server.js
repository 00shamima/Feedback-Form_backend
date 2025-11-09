  require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

/* ---------------------------------------------
 ✅ POST /api/feedback
 Save new feedback (store form as JSON)
--------------------------------------------- */
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

/* ---------------------------------------------
 ✅ GET /api/feedback
 Get all feedbacks
--------------------------------------------- */
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

/* ---------------------------------------------
 ✅ GET /api/feedback/:id
 Get single feedback by ID
--------------------------------------------- */
app.get("/api/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json(feedback);
  } catch (error) {
    console.error("❌ Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

/* ---------------------------------------------
 ✅ PUT /api/feedback/:id
 Update feedback (edit form)
--------------------------------------------- */
app.put("/api/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: { answers: updatedData },
    });

    res.json(updatedFeedback);
  } catch (error) {
    console.error("❌ Error updating feedback:", error);
    res.status(500).json({ error: "Failed to update feedback" });
  }
});

/* ---------------------------------------------
 ✅ DELETE /api/feedback/:id
 Delete a feedback
--------------------------------------------- */
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

/* ---------------------------------------------
 ✅ Root route
--------------------------------------------- */
app.get("/", (req, res) => {
  res.send("✅ Feedback API (MongoDB + Prisma) is running!");
});

/* ---------------------------------------------
 ✅ Start server
--------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);  
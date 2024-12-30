const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config(); // Load environment variables

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Mock database (replace with a real database if needed)
const databasePath = "./database.json";

// Load or initialize the database
let database = fs.existsSync(databasePath)
  ? JSON.parse(fs.readFileSync(databasePath, "utf8"))
  : { questions: [] };

// API: Get all questions and answers
app.get("/api/questions", (req, res) => {
  res.json(database.questions);
});

// API: Post a new question
app.post("/api/questions", (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Question cannot be empty." });
  }

  const newQuestion = {
    id: database.questions.length + 1,
    question,
    answers: [],
  };
  database.questions.push(newQuestion);
  fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
  res.json(newQuestion);
});

// API: Post an answer to a question
app.post("/api/answers/:id", (req, res) => {
  const questionId = parseInt(req.params.id);
  const { answer } = req.body;

  const question = database.questions.find((q) => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: "Question not found." });
  }

  question.answers.push(answer);
  fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
  res.json(question);
});

// API: AI Chatbot
app.post("/api/ai-chatbot", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Question cannot be empty." });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    res.json({ answer: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "AI chatbot failed to respond." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

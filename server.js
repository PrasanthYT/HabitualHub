const express = require("express");
const connectDB = require("./database/db");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const habitsRoutes = require("./routes/habit");
const GitRoutes = require("./routes/git");
const JournalRoutes = require("./routes/journal");

dotenv.config();

const app = express();
app.use(express.json()); // For parsing JSON payloads

app.use(cors());

// Connect to the database
connectDB();

// Simple test route
app.get("/", (req, res) => res.send("API is running"));

// Define your routes (we'll add the signup route here)
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitsRoutes);
app.use("/api/git", GitRoutes);
app.use("/api/journal", JournalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

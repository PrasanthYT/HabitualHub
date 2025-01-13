const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Journal = require("../models/Journal");

// Get all journals
router.get("/", auth, async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(journals);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Get single journal
router.get("/:id", auth, async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!journal) return res.status(404).json({ msg: "Journal not found" });
    res.json(journal);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Create journal
router.post("/", auth, async (req, res) => {
  try {
    const newJournal = new Journal({
      title: req.body.title,
      content: req.body.content,
      mood: req.body.mood,
      userId: req.user.id,
    });

    const journal = await newJournal.save();
    res.json(journal);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Update journal
router.put("/:id", auth, async (req, res) => {
  try {
    let journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!journal) return res.status(404).json({ msg: "Journal not found" });

    journal = await Journal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(journal);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Delete journal entry
router.delete("/:id", auth, async (req, res) => {
  try {
    // Validate ID
    if (!req.params.id) {
      return res.status(400).json({ message: "Invalid ID provided" });
    }

    // Find and delete the journal entry
    const journal = await Journal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    res.json({ message: "Journal entry deleted successfully" });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ 
      message: "Server Error", 
      error: err.message 
    });
  }
});

// Search journals
router.get("/search/:query", auth, async (req, res) => {
  try {
    const journals = await Journal.find({
      userId: req.user.id,
      $text: { $search: req.params.query },
    }).sort({ createdAt: -1 });
    res.json(journals);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;

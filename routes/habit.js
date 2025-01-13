const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Habit = require("../models/Habits");

// @route   GET /api/habits
// @desc    Get all habits for user
router.get("/", auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/habits
// @desc    Create a new habit
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, frequency } =
      req.body;

    const habit = new Habit({
      title,
      description,
      frequency,
      userId: req.user.id,
    });

    const savedHabit = await habit.save();
    res.json(savedHabit);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/habits/:id
// @desc    Update habit
router.put("/:id", auth, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    if (habit.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedHabit = await Habit.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedHabit);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/habits/:id
// @desc    Delete habit
router.delete("/:id", auth, async (req, res) => {
    try {
      const habit = await Habit.findById(req.params.id);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
  
      if (habit.userId.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }
  
      await Habit.deleteOne({ _id: req.params.id });
      
      return res.json({ 
        success: true,
        message: "Habit deleted successfully" 
      });
  
    } catch (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ 
        message: "Error deleting habit",
        error: err.message 
      });
    }
  });

// @route   PUT /api/habits/:id/complete
// @desc    Toggle habit completion
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    if (habit.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    habit.isCompleted = !habit.isCompleted;
    habit.lastCompletedAt = habit.isCompleted ? new Date() : null;

    if (habit.isCompleted) {
      habit.completionHistory.push({
        date: new Date(),
        completed: true,
      });
      habit.completionStreak += 1;
    } else {
      habit.completionStreak = 0;
    }

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

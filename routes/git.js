const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const GitGoal = require("../models/Git");

// @route   GET /api/git/goals
// @desc    Get all goals
router.get("/", auth, async (req, res) => {
  try {
    const goals = await GitGoal.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/git/goals
// @desc    Create goal
router.post("/", auth, async (req, res) => {
  try {
    const { repoId, repoName, goalName, description, dueDate } = req.body;

    const goal = new GitGoal({
      userId: req.user.id,
      repoId,
      repoName,
      goalName,
      description,
      dueDate,
    });

    const savedGoal = await goal.save();
    res.json(savedGoal);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/git/goals/:id
// @desc    Update goal
router.put("/:id", auth, async (req, res) => {
  try {
    let goal = await GitGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (req.body.status === "completed" && !goal.completedAt) {
      req.body.completedAt = new Date();
    }

    goal = await GitGoal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/git/goals/:id
// @desc    Delete goal
router.delete("/:id", auth, async (req, res) => {
  try {
    const goal = await GitGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await GitGoal.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "Goal removed" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

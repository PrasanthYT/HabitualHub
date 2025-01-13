const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const auth = require("../middleware/auth");

const generateAvatar = (seed) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

router.get("/avatar/:seed", (req, res) => {
  const avatarUrl = generateAvatar(req.params.seed);
  res.json({ avatarUrl });
});

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const avatarUrl = generateAvatar(email);

    // Create a new user
    user = new User({
      firstName,
      lastName,
      email,
      password,
      avatar: avatarUrl,
    });

    // Encrypt password using bcrypt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Send the token in the response
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// @route   POST /api/auth/login
// @desc    Login a user
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Email" });
    }

    // Compare password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Password" });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Send the token in the response
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/auth/user/:id
// @desc    Get user by ID
// @access  Private
router.get("/user/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .select("-__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if requesting user has permission
    if (req.user.id !== req.params.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar || generateAvatar(user.email),
        githubToken: user.githubToken,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/auth/edit/:id
// @desc    Update user password
// @access  Private
router.put("/edit/:id", auth, async (req, res) => {
  const { currentPassword, newPassword, githubToken } = req.body;

  try {
    // Check if user ID from token matches requested user ID
    if (req.user.id !== req.params.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Get user from database
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.avatar = user.avatar || generateAvatar(user.email);
    user.githubToken = githubToken;
    user.updatedAt = Date.now();

    // Save updated password
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Update password error:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/github/token
// @desc    Save GitHub personal token
// @access  Private
// router.post("/github/token", auth, async (req, res) => {
//   const { githubToken } = req.body;

//   if (!githubToken) {
//     return res.status(400).json({ message: "GitHub token is required" });
//   }

//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Hash the GitHub token
//     const salt = await bcrypt.genSalt(10);
//     const hashedToken = await bcrypt.hash(githubToken, salt);

//     // Save the hashed token to the user document
//     user.githubToken = hashedToken;
//     await user.save();

//     res.json({
//       success: true,
//       message: "GitHub token saved successfully",
//     });
//   } catch (error) {
//     console.error("Error saving GitHub token:", error.message);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// @route   POST /api/auth/github/token
// @desc    Save GitHub personal token
// @access  Private
router.post("/github/token", auth, async (req, res) => {
  const { githubToken } = req.body;

  if (!githubToken) {
    return res.status(400).json({ message: "GitHub token is required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save the GitHub token directly to the user document
    user.githubToken = githubToken;
    user.avatar = user.avatar || generateAvatar(user.email),
    await user.save();

    res.json({
      success: true,
      message: "GitHub token saved successfully",
    });
  } catch (error) {
    console.error("Error saving GitHub token:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/github/token/:id
// @desc    Retrieve GitHub personal token by userId
// @access  Private
router.get("/github/token/:id", auth, async (req, res) => {
  const { id } = req.params; // Retrieve userId from URL parameter

  try {
    const user = await User.findById(id); // Use userId from URL parameter
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.githubToken) {
      return res.status(404).json({ message: "GitHub token not found" });
    }

    res.json({
      success: true,
      githubToken: user.githubToken,
    });
  } catch (error) {
    console.error("Error retrieving GitHub token:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

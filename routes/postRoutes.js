const express = require("express");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a post
router.post("/", authMiddleware, async (req, res) => {
    try {
        const post = new Post({ ...req.body, author: req.user.id });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a single post
router.get("/:id", async (req, res) => {
    const post = await Post.findById(req.params.id).populate("author", "username");
    res.json(post);
});

// Update a post
router.put("/:id", authMiddleware, async (req, res) => {
    const post = await Post.findById(req.params.id);

    // Checks if the post exists and if the logged-in user is the author
    if (!post || post.author.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized "});
    }
    Object.assign(post, req.body); // Updates post
    await post.save(); // Save the updated post
    res.json(post); // Respond with the updated post in JSON format
});

// Delete a post
router.delete("/:id", authMiddleware, async (req, res) => {
    const post = await Post.findById(req.params.id); // Finds post by ID.
    if (!post || post.author.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
    }
    await post.remove(); // Removes the post
    res.json({ message: "Post deleted" }); // Responds with a confirmation message
})

module.exports = router; // Exports the router so it can be used in other parts of the app.
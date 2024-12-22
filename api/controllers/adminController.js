const Article = require("../models/Article");
const Admin = require("../models/Admin");
const mongoose = require("mongoose");

// Create Article
const createArticle = async (req, res) => {
  try {
    const { title, content, category, tags, status, featuredImage } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: "Title, content, and category are required." });
    }

    const newArticle = await Article.create({
      title,
      content,
      category,
      tags,
      status: status || "Draft", // Default to "Draft"
      featuredImage,
      author: req.user._id, // Link to the logged-in admin
    });

    // Link the article to the Admin
    await Admin.findOneAndUpdate(
      { user: req.user._id },
      { $push: { articles: newArticle._id } }
    );

    res.status(201).json({ message: "Article created successfully.", article: newArticle });
  } catch (error) {
    res.status(500).json({ message: "Error creating article", error });
  }
};

// Edit Article
const editArticle = async (req, res) => {
  try {
    const articleId = req.params.id;
    const { title, content, category, tags, featuredImage } = req.body;

    const article = await Article.findOneAndUpdate(
      { _id: articleId, author: req.user._id },
      { title, content, category, tags, featuredImage },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: "Article not found or you're not authorized to edit." });
    }

    res.status(200).json({ message: "Article updated successfully.", article });
  } catch (error) {
    res.status(500).json({ message: "Error updating article", error });
  }
};

// Delete Article
const deleteArticle = async (req, res) => {
  try {
    const articleId = req.params.id;

    const article = await Article.findOneAndDelete({
      _id: articleId,
      author: req.user._id,
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found or you're not authorized to delete." });
    }

    // Remove the article from Admin's articles list
    await Admin.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { articles: articleId } }
    );

    res.status(200).json({ message: "Article deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting article", error });
  }
};

// Get Admin's Articles
const getAdminArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const articles = await Article.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const count = await Article.countDocuments({ author: req.user._id });

    res.status(200).json({
      message: "Articles fetched successfully.",
      articles,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching articles", error });
  }
};

// Publish/Draft Article
const toggleArticleStatus = async (req, res) => {
  try {
    const articleId = req.params.id;

    const article = await Article.findOne({
      _id: articleId,
      author: req.user._id,
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found or you're not authorized to modify." });
    }

    article.status = article.status === "Published" ? "Draft" : "Published";
    await article.save();

    res.status(200).json({ message: `Article status changed to ${article.status}.`, article });
  } catch (error) {
    res.status(500).json({ message: "Error toggling article status", error });
  }
};

module.exports = {
  createArticle,
  editArticle,
  deleteArticle,
  getAdminArticles,
  toggleArticleStatus,
};

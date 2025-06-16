const Blog = require('../models/blogModel');
const calculateReadingTime = require('../utils/calculateReadingTime');
const mongoose = require('mongoose');

exports.createBlog = async (req, res) => {
  try {
    const { title, description, tags, body } = req.body;
    const reading_time = calculateReadingTime(body);

    const blog = await Blog.create({
      title,
      description,
      tags,
      body,
      author: req.user._id,
      state: 'draft',
      read_count: 0,
      reading_time,
      timestamp: new Date()
    });

    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateBlogState = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, author: req.user._id });

    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    blog.state = 'published';
    await blog.save();

    res.json({ message: 'Blog published successfully', blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, author: req.user._id });

    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const { title, body, tags, description } = req.body;

    if (title) blog.title = title;
    if (body) {
      blog.body = body;
      blog.reading_time = calculateReadingTime(body);
    }
    if (tags) blog.tags = tags;
    if (description) blog.description = description;

    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, author: req.user._id });

    if (!blog) return res.status(404).json({ error: 'Blog not found or not yours' });

    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPublishedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, state, author, title, tags, orderBy = 'timestamp', order = 'desc' } = req.query;

    const filter = { state: 'published' };
    if (author) filter.author = new RegExp(author, 'i');
    if (title) filter.title = new RegExp(title, 'i');
    if (tags) filter.tags = { $in: tags.split(',') };
    if (state) filter.state = state;

    const sort = { [orderBy]: order === 'asc' ? 1 : -1 };

    const totalBlogs = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
      .populate('author', 'first_name last_name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: parseInt(page),
      blogsPerPage: parseInt(limit),
      blogs
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, state: 'published' },
      { $inc: { read_count: 1 } },
      { new: true }
    ).populate('author', 'first_name last_name email');

    if (!blog) return res.status(404).json({ error: 'Blog not found or not published' });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

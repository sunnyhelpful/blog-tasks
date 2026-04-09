const Blog = require("../../models/blog");

// INDEX → get all blogs
const index = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: blogs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// STORE → create blog
const store = async (req, res) => {
  try {
    const { title, description, content, slug } = req.body;

    let blogImages = [];
    if (req.files && req.files.blogImages) {
      blogImages = req.files.blogImages.map(file => file.path);
    }

    const blog = await Blog.create({
      title,
      description,
      content,
      slug,
      blogImages,
    });

    return res.status(201).json({ success: true, data: blog });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// SHOW → single blog
const show = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.json({ success: true, data: blog });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// EDIT → return editable fields
const edit = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.json({
      success: true,
      data: {
        title: blog.title,
        description: blog.description,
        content: blog.content,
        slug: blog.slug,
        blogImages: blog.blogImages || [],
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE → update blog
const update = async (req, res) => {
  try {
    const { title, description, content, slug } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    blog.title = title ?? blog.title;
    blog.description = description ?? blog.description;
    blog.content = content ?? blog.content;
    blog.slug = slug ?? blog.slug;

    if (req.files && req.files.blogImages) {
      const newImages = req.files.blogImages.map(file => file.path);
      blog.blogImages = newImages; // or append if needed
      // blog.blogImages = [...(blog.blogImages || []), ...newImages];
    }

    await blog.save();

    return res.json({ success: true, data: blog });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE → delete blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  index,
  store,
  show,
  edit,
  update,
  delete: deleteBlog,
};
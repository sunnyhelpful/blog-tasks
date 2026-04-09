const { isValidObjectId } = require("mongoose");
const { prepareMongooseDataTablesParams } = require("../../utils/helper");
const Blog = require("../../models/blog");
const { saveUpload } = require("../../utils/saveUpload");
const blogTransformer = require("../../transformers/backend/blogTransformer");

// validation
const validateBlog = ({ title, description }, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || title !== undefined) {
    if (!title || title.trim().length < 3) {
      errors.push("Title must be at least 3 characters");
    }
  }

  if (!isUpdate || description !== undefined) {
    if (!description || description.trim().length < 5) {
      errors.push("Description must be at least 5 characters");
    }
  }

  return errors;
};

// INDEX
const index = async (req, res) => {
  try {
    if (!req.xhr && !req.headers.accept.includes("json")) {
      return res.render("backend/blogs/index");
    }

    const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } =
      prepareMongooseDataTablesParams(req, ["title", "createdAt"], Blog.schema);

    const totalCount = await Blog.countDocuments({});
    const filteredCount = await Blog.countDocuments({ ...searchFilter });

    const blogs = await Blog.find({ ...searchFilter })
      .skip(pageStart)
      .limit(pageSize)
      .sort({ [sortColumn || "createdAt"]: sortOrder === "ASC" ? 1 : -1 });

    return res.json({
      draw: parseInt(req.query.draw) || 1,
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
      data: blogTransformer.transformCollection(blogs),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// CREATE
const create = async (req, res) => {
  return res.render("backend/blogs/create", { blog: {} });
};

// STORE
const store = async (req, res) => {
  try {
    const { title, description, image_type, image_url } = req.body;

    const errors = validateBlog({ title, description });
    if (errors.length) {
      return res.status(400).json({ status: false, errors });
    }

    const blog = await Blog.create({
      title: title.trim(),
      description: description.trim(),
      externalImageUrl: image_type === "url" ? image_url : null,
    });

    // file upload
    if (image_type === "file" && req.file) {
      await saveUpload(blog._id, "Blog", req.file);
    }

    const updatedBlog = await Blog.findById(blog._id).populate("blogImages");

    return res.status(201).json({
      status: true,
      data: updatedBlog,
      message: "Blog created successfully",
      redirectUrl: "/admin/blogs",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// SHOW
const show = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid ID",
      });
    }

    const blog = await Blog.findById(id).populate("blogImages");

    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "Blog not found",
      });
    }

    return res.json({
      status: true,
      data: blog,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// EDIT
const edit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid ID",
      });
    }

    const blog = await Blog.findById(id).populate("blogImages");

    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "Blog not found",
      });
    }
    console.log('blog.. ', blog);

    return res.render("backend/blogs/edit", { blog });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// UPDATE
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_type, image_url } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid ID",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "Blog not found",
      });
    }

    const errors = validateBlog({ title, description }, true);
    if (errors.length) {
      return res.status(400).json({ status: false, errors });
    }

    blog.title = title?.trim() ?? blog.title;
    blog.description = description?.trim() ?? blog.description;

    // handle image type
    if (image_type === "url") {
      blog.externalImageUrl = image_url;
    } else {
      blog.externalImageUrl = null;
    }

    await blog.save();

    // file upload
    if (image_type === "file" && req.file) {
      await saveUpload(blog._id, "Blog", req.file);
    }

    const updatedBlog = await Blog.findById(blog._id).populate("blogImages");

    return res.json({
      status: true,
      data: updatedBlog,
      message: "Blog updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// DELETE
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid ID",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "Blog not found",
      });
    }

    const Upload = require("../../models/upload");

    await Upload.updateMany(
      { uploadsable_id: blog._id, uploadsable_type: "Blog" },
      { deletedAt: new Date() }
    );

    await blog.deleteOne();

    return res.json({
      status: true,
      message: "Blog deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

module.exports = {
  index,
  create,
  store,
  show,
  edit,
  update,
  delete: deleteBlog,
};
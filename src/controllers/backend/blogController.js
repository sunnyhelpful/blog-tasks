const { isValidObjectId } = require("mongoose");
const { prepareMongooseDataTablesParams } = require("../../utils/helper");
const Blog = require("../../models/blog");
const { saveUpload } = require("../../utils/saveUpload");
const blogTransformer = require('../../transformers/backend/blogTransformer');
// helper validation
const validateBlog = (
  { title, description },
  isUpdate = false,
) => {
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
async function index(req, res) {
    try {
        if (!req.xhr && !req.headers.accept.includes('json')) {
            return res.render('backend/blogs/index');
        }

        const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(req, ['title', 'createdAt'], Blog.schema);
        const finalSortColumn = sortColumn || 'createdAt';
        const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;

        const totalCount = await Blog.countDocuments({ });
        const filteredCount = await Blog.countDocuments({ ...searchFilter });

        const blogs = await Blog.find({ ...searchFilter })
            .skip(pageStart)
            .limit(pageSize)
            .sort({ [finalSortColumn]: finalSortOrder });

        const transformedBlogs = blogTransformer.transformCollection(blogs);

        return res.json({
            draw: parseInt(req.query.draw) || 1,
            recordsTotal: totalCount,
            recordsFiltered: filteredCount,
            data: transformedBlogs,
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.BRAND,
            })
        ));
    }
}

const create = async (req, res) => {
  try {
    return res.render("backend/blogs/create", {
      blog: {},
    });
  } catch (error) {
    
  }
}

// STORE
const store = async (req, res) => {
  try {
    const { title, description } = req.body;

    // validation
    const errors = validateBlog({ title, description });
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    const blog = await Blog.create({
      title: title.trim(),
      description: description.trim(),
    });

    // uploads
    if (req.files && req.files.blogImages) {
      for (const file of req.files.blogImages) {
        await saveUpload(blog._id, "Blog", file);
      }
    }

    const updatedBlog = await Blog.findById(blog._id).populate("blogImages");

    return res.status(201).json({ success: true, data: updatedBlog });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// SHOW
const show = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const blog = await Blog.findById(id).populate("blogImages");

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    return res.json({ success: true, data: blog });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// EDIT
const edit = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }
    const blog = await Blog.findById(req.params.id).populate("blogImages");

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    return res.json({
      success: true,
      data: {
        title: blog.title,
        description: blog.description,
        content: blog.content,
        blogImages: blog.blogImages || [],
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
const update = async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // validation (partial allowed)
    const errors = validateBlog({ title, description, content }, true);
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    blog.title = title?.trim() ?? blog.title;
    blog.description = description?.trim() ?? blog.description;
    blog.content = content?.trim() ?? blog.content;
    await blog.save();

    // uploads
    if (req.files && req.files.blogImages) {
      for (const file of req.files.blogImages) {
        await saveUpload(blog._id, "Blog", file);
      }
    }

    const updatedBlog = await Blog.findById(blog._id).populate("blogImages");

    return res.json({ success: true, data: updatedBlog });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    const Upload = require("../../models/upload");

    await Upload.updateMany(
      { uploadsable_id: blog._id, uploadsable_type: "Blog" },
      { deletedAt: new Date() },
    );

    await blog.deleteOne();

    return res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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

const { isValidObjectId } = require("mongoose");
const Blog = require("../../models/blog");

async function index(req, res) {
  try {
    if (!req.xhr && !req.headers.accept.includes("json")) {
      return res.render("web/blogs/index", {
        layout: 'layouts/webLayout',
        title: 'ProConnect - Professional Network'
      });
    }

    let { offset = 0, limit = 10 } = req.query;

    offset = parseInt(offset);
    limit = parseInt(limit);

    if (offset < 0) offset = 0;
    if (limit <= 0 || limit > 100) limit = 10;

    const blogs = await Blog.find({})
      .populate("blogImages")
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Blog.countDocuments();

    return res.json({
      success: true,
      data: blogs,
      meta: {
        total,
        offset,
        limit,
        count: blogs.length,
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);

    return res.status(500).json(
      internalServerErrorResponse(
        req.t(req.trans.messages.oops_something_went_wrong, {
          attribute: req.trans.cruds.MODULE.BRAND,
        })
      )
    );
  }
}

module.exports = {
  index,
};
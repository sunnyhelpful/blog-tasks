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
            return res.render('web/blogs/index');
        }

        
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.BRAND,
            })
        ));
    }
}

module.exports = {
  index,
};

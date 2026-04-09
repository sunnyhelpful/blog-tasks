const Joi = require("joi");
const Category = require("../../models/category");

const addRequestProduct = async (req) => {
  const schema = Joi.object({
    main_category: Joi.string()
      .max(24)
      .required()
      .messages({
        "any.required": req.t("validation.string_required", {
          attribute: req.trans.cruds.REQUEST_PRODUCT.fields.main_category,
        }),
        "string.empty": req.t("validation.string_required", {
          attribute: req.trans.cruds.REQUEST_PRODUCT.fields.main_category,
        }),
        "string.max": req.t("validation.string_max", {
          attribute: req.trans.cruds.REQUEST_PRODUCT.fields.main_category,
          max: 24,
        }),
      }),
    category: Joi.string()
      .max(24)
      .optional(null, '')
      .messages({
        "string.empty": req.t("validation.string_required", {
          attribute: req.trans.cruds.REQUEST_PRODUCT.fields.category,
        }),
        "string.max": req.t("validation.string_max", {
          attribute: req.trans.cruds.REQUEST_PRODUCT.fields.category,
          max: 24,
        }),
      }),
    sub_category: Joi.string()
      .max(24)
      .optional(null, '')
      .messages({
        "string.empty": req.t("validation.string_required", {
          attribute: req.trans.cruds.REQUEST_PRODUCT.fields.sub_category,
        }),
        "string.max": req.t("validation.string_max", {
          attribute: req.trans.cruds.REQUEST_PRODUCT.fields.sub_category,
          max: 24,
        }),
        "any.required": req.t("validation.string_required", {
          attribute: req.trans.cruds.REQUEST_PRODUCT.fields.sub_category,
        }),
      }),
    title: Joi.string()
      .max(150)
      .required()
      .messages({
        "any.required": req.t("validation.string_required", {
          attribute: req.trans.cruds.REQUEST_PRODUCT.fields.title,
        }),
        "string.empty": req.t("validation.string_required", {
          attribute: req.trans.cruds.REQUEST_PRODUCT.fields.title,
        }),
        "string.max": req.t("validation.string_max", {
          attribute: req.trans.cruds.REQUEST_PRODUCT.fields.title,
          max: 150,
        }),
      }),
    description: Joi.string().allow("", null),
  }).unknown(true);

  const { error } = schema.validate(req.body, { abortEarly: false });

  const errors = {};
  if (error) {
    error.details.forEach((err) => {
      errors[err.context.key] = err.message.replace(/\"/g, "");
    });
  } else {
    const { title, main_category, sub_category, category, description } =
      req.body;

    // now check for a valid category, and sub category
    const childCategory = await Category.findOne({
      _id: category,
      isDeleted: false,
    });

    if (!childCategory || childCategory.parentId != main_category) {
      // give error here that main category and category not match
      errors.category = req.t("validation.invalid_value", {
        attribute: req.trans.cruds.REQUEST_PRODUCT.fields.category,
      });
    }

    // now check for childCategory' child -> subCategory
    const subCategoryRecord = await Category.findOne({
      _id: sub_category,
      isDeleted: false,
    });
    if (!subCategoryRecord || subCategoryRecord.parentId != category) {
      // give error that sub category and category do not match
      errors.sub_category = req.t("validation.invalid_value", {
        attribute: req.trans.cruds.REQUEST_PRODUCT.fields.sub_category,
      });
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = {
  addRequestProduct,
};

const RequestProduct = require("../../models/requestProduct");;
const {
  addRequestProduct,
} = require("../../requests/api/requestProductRequest");

const {
  successResponse,
  errorResponse,
  internalServerErrorResponse,
} = require("../../utils/apiResponses");

async function create(req, res) {
  try {
    const validationErrors = await addRequestProduct(req);
    if (validationErrors) {
      return res.status(400).json(
        errorResponse(req.trans.auth.validation_error, {
          error_type: "VALIDATION_ERROR",
          ...validationErrors,
        })
      );
    }

    const { title, main_category, sub_category, category, description } = req.body;

    const requestProductData = new RequestProduct({
      main_category,
      category,
      sub_category,
      title,
      description,
      createdBy: req.user._id,
    });

    const requestProduct = await RequestProduct.create(requestProductData);
    return res.status(201).json(
      successResponse(
        req.t(req.trans.messages.add_success_message, {
          attribute: req.trans.cruds.MODULE.REQUEST_PRODUCT,
        }),{ 
          requestProduct
    },null, null, null));
  } catch (error) {
    logInfo("Error creating category:", error);
    return res.status(500).json(
      internalServerErrorResponse(
        req.t(req.trans.messages.oops_something_went_wrong, {
          attribute: req.trans.cruds.MODULE.REQUEST_PRODUCT,
        })
      )
    );
  }
}

module.exports = {
  create,
};

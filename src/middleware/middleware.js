
/**
 * set flash messages.
 * @param {*} req
 * @param {*} res
 */
module.exports.setFlash = function (req, res, next) {
    res.locals.flash = {
      success: req.flash("success"),
      error: req.flash("error"),
      info: req.flash("info"),
      warning: req.flash("warning"),
      /* For Popup */
      success_with_popup: req.flash("success_with_popup"),
      error_with_popup: req.flash("error_with_popup"),
      info_with_popup: req.flash("info_with_popup"),
      warning_with_popup: req.flash("warning_with_popup"),
    };
    next();
  };
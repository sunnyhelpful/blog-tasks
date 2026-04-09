const express = require("express");
const router = express.Router();
const {uploadFile} = require("../../utils/uploadFile");
const blogController = require("../controllers/blog.controller");


router.get("/", blogController.index);

router.post(
  "/",
  uploadFile("blogImages"),
  blogController.store
);

router.get("/:id", blogController.show);

router.get("/:id/edit", blogController.edit);

router.put(
  "/:id",
  uploadFile("blogImages"),
  blogController.update
);

router.delete("/:id", blogController.delete);

module.exports = router;
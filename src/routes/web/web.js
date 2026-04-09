const express = require("express");
const router = express.Router();

const blogController = require("../../controllers/web/blogController");

/* blog */
router.get('/', blogController.index);

module.exports = router;

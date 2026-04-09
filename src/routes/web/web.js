const express = require("express");
const router = express.Router();

const blogController = require("../../controllers/web/blogController");

/* blog */
router.get('/', blogController.index);
router.get('/blogs', blogController.index);
router.get('/blogs/:slug', blogController.show);
router.get('/api/blogs/feed', blogController.getFeedBlogs);

module.exports = router;

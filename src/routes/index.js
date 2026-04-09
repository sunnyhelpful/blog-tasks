const express = require('express');
const router = express.Router();

// router.use('/api', require('./auth'));  // route added for auth.
router.use('/admin/', require('./backend/backend'));

module.exports = router;
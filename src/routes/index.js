const express = require('express');
const router = express.Router();

const userRoutes = require('../routes/userRouters');
const petRoutes = require('../routes/petRouters');

// user routes
router.use('/user', userRoutes);
// pet routes
router.use('/pet', petRoutes);

module.exports = router
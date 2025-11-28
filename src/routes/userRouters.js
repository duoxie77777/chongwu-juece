const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAllUsers } = require('../controllers/userRoutes');

router.get('/users', getAllUsers);

// 需要认证的路由
router.use(auth);

module.exports = router;
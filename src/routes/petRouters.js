const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAllPets, getPetDetails } = require('../controllers/petRoutes');

router.get('/getAllPets', getAllPets)
router.get('/getPetDetails', getPetDetails)

// 需要认证的路由
router.use(auth);
module.exports = router;
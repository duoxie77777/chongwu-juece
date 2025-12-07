const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    createDonation,
    getUserDonations,
    getDonationStats,
    getDonationRanking
} = require('../controllers/donationRoutes');

// 公开路由
router.get('/stats', getDonationStats);
router.get('/ranking', getDonationRanking);

// 需要认证的路由
router.post('/', createDonation); // 创建捐赠（可选认证，未登录用户也可以捐赠）
router.get('/list', auth, getUserDonations); // 获取用户自己的捐赠列表

module.exports = router;



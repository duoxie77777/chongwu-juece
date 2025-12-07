const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getAllAdoptionApplications,
    getAdoptionApplicationDetail,
    updateAdoptionApplicationStatus,
    getAdoptionApplicationStats
} = require('../controllers/adoptionRoutes');

// 需要认证的路由（管理员）
router.use(auth);

// 获取所有申请列表
router.get('/list', getAllAdoptionApplications);

// 获取申请统计
router.get('/stats', getAdoptionApplicationStats);

// 获取申请详情
router.get('/:id', getAdoptionApplicationDetail);

// 更新申请状态
router.put('/:id/status', updateAdoptionApplicationStatus);

module.exports = router;




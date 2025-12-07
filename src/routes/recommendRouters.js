const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const {
    getRecommendedPets,
    recordViewBehavior,
    recordApplyBehavior,
    recordLikeBehavior
} = require('../controllers/recommendRoutes');
const { checkBehaviorData } = require('../controllers/checkRecommendData');

// 获取推荐宠物（支持可选认证，登录用户使用协同过滤，未登录用户返回热门）
router.get('/pets', optionalAuth, getRecommendedPets);

// 记录用户浏览行为（公开接口，登录用户会记录行为，使用可选认证）
router.post('/behavior/view/:petId', optionalAuth, recordViewBehavior);

// 需要登录的行为记录
router.post('/behavior/apply', auth, recordApplyBehavior);
router.post('/behavior/like', auth, recordLikeBehavior);

// 数据检查接口（用于调试）
router.get('/check-data', checkBehaviorData);

module.exports = router;


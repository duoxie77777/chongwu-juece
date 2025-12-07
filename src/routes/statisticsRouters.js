const express = require('express');
const router = express.Router();

const {
    getOverviewStats,
    getTrendData,
    getCategoryStats,
    getDailyStats,
    getHotData,
    getHomepageStats
} = require('../controllers/statisticsRoutes');

// 获取首页统计数据
router.get('/homepage', getHomepageStats);

// 获取数据总览统计
router.get('/overview', getOverviewStats);

// 获取趋势数据
router.get('/trend', getTrendData);

// 获取分类统计
router.get('/category', getCategoryStats);

// 获取每日统计
router.get('/daily', getDailyStats);

// 获取热门数据
router.get('/hot', getHotData);

module.exports = router;

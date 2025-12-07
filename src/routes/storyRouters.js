/**
 * 领养故事路由
 */
const express = require('express')
const router = express.Router()
const storyController = require('../controllers/storyRoutes')

// 获取故事统计
router.get('/stats', storyController.getStoryStats)

// 获取推荐故事
router.get('/featured', storyController.getFeaturedStories)

// 获取热门故事
router.get('/popular', storyController.getPopularStories)

// 获取故事列表
router.get('/list', storyController.getStoryList)

// 获取故事详情
router.get('/:id', storyController.getStoryDetail)

// 创建故事
router.post('/', storyController.createStory)

// 更新故事
router.put('/:id', storyController.updateStory)

// 发布故事
router.put('/:id/publish', storyController.publishStory)

// 点赞故事
router.post('/:id/like', storyController.likeStory)

// 删除故事
router.delete('/:id', storyController.deleteStory)

module.exports = router

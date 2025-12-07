/**
 * 故事评论路由
 */
const express = require('express')
const router = express.Router()
const commentController = require('../controllers/storyCommentRoutes')

// 获取评论统计
router.get('/stats', commentController.getCommentStats)

// 获取评论列表
router.get('/list', commentController.getCommentList)

// 获取指定故事的评论
router.get('/story/:storyId', commentController.getCommentsByStoryId)

// 获取评论详情
router.get('/:id', commentController.getCommentDetail)

// 创建评论
router.post('/', commentController.createComment)

// 更新评论
router.put('/:id', commentController.updateComment)

// 点赞评论
router.put('/:id/like', commentController.likeComment)

// 删除评论
router.delete('/:id', commentController.deleteComment)

module.exports = router

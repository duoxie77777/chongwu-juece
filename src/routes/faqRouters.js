/**
 * 常见问题路由
 */
const express = require('express')
const router = express.Router()
const faqController = require('../controllers/faqRoutes')

// 获取FAQ统计
router.get('/stats', faqController.getFaqStats)

// 获取FAQ列表
router.get('/list', faqController.getFaqList)

// 获取FAQ详情
router.get('/:id', faqController.getFaqDetail)

// 创建FAQ
router.post('/', faqController.createFaq)

// 更新FAQ
router.put('/:id', faqController.updateFaq)

// 删除FAQ
router.delete('/:id', faqController.deleteFaq)

module.exports = router

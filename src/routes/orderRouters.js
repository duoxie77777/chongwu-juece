const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getAllOrders,
    getOrderDetail,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderStats
} = require('../controllers/orderRoutes');

// 公开路由（获取统计可公开）
router.get('/stats', getOrderStats);

// 需要认证的路由
router.use(auth);
router.get('/list', getAllOrders);
router.get('/:id', getOrderDetail);
router.post('/', createOrder);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

module.exports = router;

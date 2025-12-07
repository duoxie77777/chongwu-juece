const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getCartItems,
    addToCart,
    updateCartItem,
    removeCartItem,
    batchRemoveCartItems,
    clearCart
} = require('../controllers/cartRoutes');

// 所有购物车路由都需要认证
router.use(auth);

// 获取购物车列表
router.get('/', getCartItems);

// 添加商品到购物车
router.post('/', addToCart);

// 更新购物车商品数量
router.put('/:id', updateCartItem);

// 删除购物车商品
router.delete('/:id', removeCartItem);

// 批量删除购物车商品
router.post('/batch-delete', batchRemoveCartItems);

// 清空购物车
router.delete('/', clearCart);

module.exports = router;


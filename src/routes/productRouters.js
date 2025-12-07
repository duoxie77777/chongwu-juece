const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getAllProducts,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStats
} = require('../controllers/productRoutes');

// 公开路由
router.get('/list', getAllProducts);
router.get('/stats', getProductStats);
router.get('/:id', getProductDetail);

// 需要认证的路由
router.use(auth);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;

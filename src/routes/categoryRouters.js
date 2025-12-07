const express = require('express');
const router = express.Router();
const {
    getPetCategories,
    getPetCategoryDetail,
    createPetCategory,
    updatePetCategory,
    deletePetCategory,
    getProductCategories,
    getProductCategoryDetail,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory
} = require('../controllers/categoryRoutes');

// ============ 宠物分类路由 ============

// GET /api/category/pets - 获取所有宠物分类
router.get('/pets', getPetCategories);

// GET /api/category/pets/:id - 获取宠物分类详情
router.get('/pets/:id', getPetCategoryDetail);

// POST /api/category/pets - 创建宠物分类
router.post('/pets', createPetCategory);

// PUT /api/category/pets/:id - 更新宠物分类
router.put('/pets/:id', updatePetCategory);

// DELETE /api/category/pets/:id - 删除宠物分类
router.delete('/pets/:id', deletePetCategory);

// ============ 商品分类路由 ============

// GET /api/category/products - 获取所有商品分类
router.get('/products', getProductCategories);

// GET /api/category/products/:id - 获取商品分类详情
router.get('/products/:id', getProductCategoryDetail);

// POST /api/category/products - 创建商品分类
router.post('/products', createProductCategory);

// PUT /api/category/products/:id - 更新商品分类
router.put('/products/:id', updateProductCategory);

// DELETE /api/category/products/:id - 删除商品分类
router.delete('/products/:id', deleteProductCategory);

module.exports = router;

const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const {
    uploadSingleImage,
    uploadMultipleImages,
    deleteImage,
    getUploadedImages
} = require('../controllers/uploadRoutes');
const { auth } = require('../middleware/auth');

// 公开路由 - 获取已上传的图片列表
router.get('/images', getUploadedImages);

// 需要认证的路由
// router.use(auth);

// 上传单张图片 - 默认路由（POST /api/upload）
router.post('/', uploadSingle, uploadSingleImage);

// 上传单张图片 - 具体路由
router.post('/single', uploadSingle, uploadSingleImage);

// 上传多张图片
router.post('/multiple', uploadMultiple, uploadMultipleImages);

// 删除图片
router.delete('/:filename', deleteImage);

module.exports = router;

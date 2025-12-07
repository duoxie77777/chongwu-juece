const fs = require('fs');
const path = require('path');

/**
 * 上传单张图片
 */
const uploadSingleImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                code: 400,
                message: '请选择要上传的文件'
            });
        }

        // 生成图片 URL 路径
        const imageUrl = `/uploads/${req.file.filename}`;

        res.json({
            code: 200,
            message: '图片上传成功',
            data: {
                url: imageUrl,
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype,
                uploadTime: new Date().toISOString()
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * 上传多张图片
 */
const uploadMultipleImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '请选择要上传的文件'
            });
        }

        const images = req.files.map(file => ({
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype
        }));

        res.json({
            code: 200,
            message: '图片上传成功',
            data: {
                images: images,
                count: images.length,
                uploadTime: new Date().toISOString()
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * 删除图片
 */
const deleteImage = async (req, res, next) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            return res.status(400).json({
                code: 400,
                message: '文件名不能为空'
            });
        }

        // 防止路径遍历攻击
        if (filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({
                code: 400,
                message: '无效的文件名'
            });
        }

        const filePath = path.join(__dirname, `../../uploads/${filename}`);

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                code: 404,
                message: '文件不存在'
            });
        }

        // 删除文件
        fs.unlinkSync(filePath);

        res.json({
            code: 200,
            message: '图片删除成功',
            data: {
                filename: filename
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * 获取上传的图片列表
 */
const getUploadedImages = async (req, res, next) => {
    try {
        const uploadsDir = path.join(__dirname, '../../uploads');

        // 检查目录是否存在
        if (!fs.existsSync(uploadsDir)) {
            return res.json({
                code: 200,
                message: '获取成功',
                data: {
                    images: [],
                    count: 0
                }
            });
        }

        // 读取目录中的文件
        const files = fs.readdirSync(uploadsDir);
        
        // 过滤图片文件
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const images = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return imageExtensions.includes(ext);
            })
            .map(file => {
                const filePath = path.join(uploadsDir, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    url: `/uploads/${file}`,
                    size: stats.size,
                    uploadTime: stats.mtime.toISOString()
                };
            });

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                images: images,
                count: images.length
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    uploadSingleImage,
    uploadMultipleImages,
    deleteImage,
    getUploadedImages
};

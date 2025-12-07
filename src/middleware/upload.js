const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 定义上传目录
const uploadDir = path.join(__dirname, '../../uploads');

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // 生成唯一的文件名：时间戳 + 随机数 + 原始扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
    // 允许的图片格式
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('仅支持 JPG、PNG、GIF、WebP 格式的图片'));
    }
};

// 创建 multer 实例
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB 限制
    }
});

// 单文件上传中间件 - 使用 any() 接受任何字段名
const uploadSingle = (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                code: 400,
                message: err.message || '文件上传失败'
            });
        }
        
        // 将 files 数组中的第一个文件赋值给 file
        if (req.files && req.files.length > 0) {
            req.file = req.files[0];
        }
        
        next();
    });
};

// 多文件上传中间件 - 使用 any() 接受任何字段名
const uploadMultiple = (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                code: 400,
                message: err.message || '文件上传失败'
            });
        }
        
        // files 已经是数组了，直接使用
        next();
    });
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    upload
};

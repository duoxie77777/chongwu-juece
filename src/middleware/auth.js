const jwt = require('jsonwebtoken')

// 认证中间件
const auth = (req, res, next) => {
    try {
        // 请求头获取token
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.send({
                code: 401,
                message: '请先登录'
            });
        };

        // 验证JWT密钥
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT密钥未设置');
        };

        // 验证token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 将用户信息添加到请求对象
        req.user = decoded;

        // 放行
        next();
    } catch (err) {
        res.send({
            code: 401,
            message: '无效token，请重新登录'
        });
    };
};


// 可选认证中间件（不强制要求登录，但如果提供了token则验证）
const optionalAuth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            // 如果有token，验证并设置用户信息
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT密钥未设置');
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            } catch (err) {
                // token无效，但不阻止请求，只是不设置用户信息
                req.user = null;
            }
        } else {
            // 没有token，不设置用户信息
            req.user = null;
        }

        next();
    } catch (err) {
        // 发生错误时，不设置用户信息，但继续处理请求
        req.user = null;
        next();
    }
};

module.exports = { auth, optionalAuth };
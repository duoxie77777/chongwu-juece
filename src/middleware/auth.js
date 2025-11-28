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


module.exports = { auth };
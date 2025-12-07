require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

// 确保JWT_SECRET存在
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = '456$%^654^%$';
}

// 检查环境变量是否存在
console.log('Environment variables loaded:', {
    PORT: process.env.PORT,
    DB_NAME: process.env.DB_NAME,
    JWT_SECRET: process.env.JWT_SECRET
})

const app = express();

// 中间件配置
app.use(cors()); // 处理跨域
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // 允许跨域资源访问
    contentSecurityPolicy: false // 禁用CSP，允许图片跨域加载
})); // 添加安全相关的http头
app.use(morgan('dev')); // http请求日志
app.use(express.json()); // 解析json数据
app.use(express.urlencoded({ extended: true })); // 解析urlencoded数据

// 配置静态文件服务 - 用于访问上传的图片
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 注册路由 - 以api开头
app.use('/api', routes);

// 全局错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 8889;

// 连接数据库并启动服务器
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Error connecting to database:', error);
    process.exit(1);
});

module.exports = app;
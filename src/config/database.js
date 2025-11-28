const mysql = require('mysql2/promise');

// 创建数据库连接池
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'stray_pet_adopt',
    connectionLimit: 10,
    queueLimit: 0,
});

// 测试数据库连接
const connectDB = async () => {
    try {
        const connection = await db.getConnection();
        console.log('Connected to database');
        connection.release();
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
};

module.exports = {
    db,
    connectDB,
};
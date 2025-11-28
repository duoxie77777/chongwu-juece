const { db } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 查询所有用户
const getAllUsers = async (req, res, next) => {
    try {
        const sql = 'SELECT * FROM users';
        const [result] = await db.query(sql);
        res.send({
            code: 200,
            data: result
        });
    } catch (err) {
        next(err)
    }
}

module.exports = { getAllUsers };
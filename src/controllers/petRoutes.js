const { db } = require('../config/database');
// 库
const pets = 'pet_core_info'
// 查询所有宠物
const getAllPets = async (req, res, next) => {
    try {
        // 获取查询参数
        const { keyword = '', page = 1, size = 10 } = req.query;

        // 转换分页参数为整数
        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(size, 10) || 10;

        // 计算偏移量
        const offset = (parsedPage - 1) * parsedLimit;

        // 构建 SQL 查询
        let sql = `SELECT * FROM ${pets} WHERE delete_time IS NULL`;
        const params = [];

        // 如果有关键字，则添加搜索条件
        if (keyword) {
            sql += ' AND pet_name LIKE ?';
            params.push(`%${keyword}%`);
        }

        // 添加分页限制
        sql += ' LIMIT ? OFFSET ?';
        params.push(parsedLimit, offset);

        // 执行查询
        const [results] = await db.query(sql, params);

        // 查询总数（用于计算总页数）
        const countSql = `SELECT COUNT(*) AS total FROM ${pets} WHERE 1=1` + (keyword ? ' AND pet_name LIKE ?' : '');
        const countParams = keyword ? [`%${keyword}%`] : [];
        const [countResult] = await db.query(countSql, countParams);
        const total = countResult[0].total;

        // 返回结果
        res.send({
            code: 200,
            data: results,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total,
                totalPages: Math.ceil(total / parsedLimit)
            }
        });
    } catch (err) {
        next(err);
    }
};

// 获取宠物详情
const getPetDetails = async (req, res, next) => {
    try {
        // 获取查询参数
        const { id } = req.query;

        const sql = `SELECT * FROM ${pets} WHERE id = ?`;
        const [results] = await db.query(sql, [id]);
        res.send({
            code: 200,
            data: results
        })
    } catch (err) {
        next(err);
    }
}

module.exports = { getAllPets, getPetDetails };
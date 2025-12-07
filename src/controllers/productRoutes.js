const { db } = require('../config/database');

// ============ 商品管理接口 ============

// 获取商品列表（支持分页、搜索、过滤、排序）
const getAllProducts = async (req, res, next) => {
    try {
        const { keyword = '', category_id = '', status = '', page = 1, size = 10, sort = '' } = req.query;

        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(size, 10) || 10;
        const offset = (parsedPage - 1) * parsedLimit;

        let sql = `SELECT p.*, c.name as category_name 
                   FROM products p 
                   LEFT JOIN product_categories c ON p.category_id = c.id 
                   WHERE 1=1`;
        const params = [];

        // 搜索条件
        if (keyword) {
            sql += ' AND p.name LIKE ?';
            params.push(`%${keyword}%`);
        }

        // 分类过滤
        if (category_id) {
            sql += ' AND p.category_id = ?';
            params.push(category_id);
        }

        // 状态过滤
        if (status !== '') {
            sql += ' AND p.status = ?';
            params.push(status);
        }

        // 获取总数
        const countSql = sql.replace(/SELECT p\.\*, c\.name as category_name/, 'SELECT COUNT(*) AS total');
        const [countResult] = await db.query(countSql, params);
        const total = countResult[0].total;

        // 排序处理
        let orderBy = 'p.create_time DESC';
        switch (sort) {
            case 'price_asc':
                orderBy = 'p.price ASC';
                break;
            case 'price_desc':
                orderBy = 'p.price DESC';
                break;
            case 'sales_desc':
                orderBy = 'p.sales_count DESC';
                break;
            case 'rating_desc':
                orderBy = 'p.rating DESC';
                break;
            default:
                orderBy = 'p.create_time DESC';
                break;
        }

        // 排序和分页
        sql += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
        params.push(parsedLimit, offset);

        const [results] = await db.query(sql, params);

        res.json({
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

// 获取商品详情
const getProductDetail = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '商品 ID 不能为空'
            });
        }

        const sql = `SELECT p.*, c.name as category_name 
                     FROM products p 
                     LEFT JOIN product_categories c ON p.category_id = c.id 
                     WHERE p.id = ?`;
        const [results] = await db.query(sql, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在'
            });
        }

        res.json({
            code: 200,
            data: results[0]
        });
    } catch (err) {
        next(err);
    }
};

// 创建商品
const createProduct = async (req, res, next) => {
    try {
        const {
            category_id,
            name,
            description,
            price,
            original_price,
            stock,
            image_url,
            images,
            specifications,
            is_hot,
            is_new,
            status
        } = req.body;

        // 验证必填字段
        if (!name || !price) {
            return res.status(400).json({
                code: 400,
                message: '商品名称和价格为必填项'
            });
        }

        const sql = `
            INSERT INTO products (
                category_id, name, description, price, original_price, stock,
                image_url, images, specifications, is_hot, is_new, status, create_time, update_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const params = [
            category_id || null,
            name,
            description || null,
            price,
            original_price || null,
            stock || 0,
            image_url || null,
            images ? JSON.stringify(images) : null,
            specifications || null,
            is_hot || 0,
            is_new || 0,
            status !== undefined ? status : 1
        ];

        const [result] = await db.query(sql, params);

        res.status(201).json({
            code: 201,
            message: '商品创建成功',
            data: {
                id: result.insertId,
                name
            }
        });
    } catch (err) {
        next(err);
    }
};

// 更新商品
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '商品 ID 不能为空'
            });
        }

        // 检查商品是否存在
        const [existingProduct] = await db.query(`SELECT id FROM products WHERE id = ?`, [id]);
        if (existingProduct.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在'
            });
        }

        // 构建动态 UPDATE 语句
        const updateFields = [];
        const params = [];

        const allowedFields = [
            'category_id', 'name', 'description', 'price', 'original_price', 'stock',
            'image_url', 'images', 'specifications', 'is_hot', 'is_new', 'status'
        ];

        for (const field of allowedFields) {
            if (field in updates) {
                updateFields.push(`${field} = ?`);
                if (field === 'images' && typeof updates[field] === 'object') {
                    params.push(JSON.stringify(updates[field]));
                } else {
                    params.push(updates[field]);
                }
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '没有要更新的字段'
            });
        }

        updateFields.push('update_time = NOW()');
        const sql = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
        params.push(id);

        await db.query(sql, params);

        res.json({
            code: 200,
            message: '商品更新成功'
        });
    } catch (err) {
        next(err);
    }
};

// 删除商品
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '商品 ID 不能为空'
            });
        }

        // 检查商品是否存在
        const [existingProduct] = await db.query(`SELECT id FROM products WHERE id = ?`, [id]);
        if (existingProduct.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在'
            });
        }

        // 直接删除
        await db.query(`DELETE FROM products WHERE id = ?`, [id]);

        res.json({
            code: 200,
            message: '商品已删除'
        });
    } catch (err) {
        next(err);
    }
};

// 获取商品统计
const getProductStats = async (req, res, next) => {
    try {
        const [totalResult] = await db.query(`SELECT COUNT(*) as total FROM products WHERE status = 1`);
        const [salesResult] = await db.query(`SELECT SUM(price * sales_count) as totalSales, SUM(sales_count) as totalSalesCount FROM products`);
        const [ratingResult] = await db.query(`SELECT AVG(rating) as avgRating FROM products WHERE status = 1`);

        res.json({
            code: 200,
            data: {
                total: totalResult[0].total || 0,
                totalSales: salesResult[0].totalSales || 0,
                totalSalesCount: salesResult[0].totalSalesCount || 0,
                avgRating: ratingResult[0].avgRating ? parseFloat(ratingResult[0].avgRating).toFixed(1) : '5.0'
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllProducts,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStats
};

const { db } = require('../config/database');

// ============ 订单管理接口 ============

// 获取订单列表（支持分页、搜索、过滤）
const getAllOrders = async (req, res, next) => {
    try {
        const { keyword = '', status = '', page = 1, size = 10 } = req.query;
        const userId = req.user ? req.user.id : null; // 如果已登录，获取用户ID

        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(size, 10) || 10;
        const offset = (parsedPage - 1) * parsedLimit;

        let sql = `SELECT * FROM orders WHERE 1=1`;
        const params = [];

        // 如果已登录且不是管理员，只查询当前用户的订单
        if (userId && req.user.role !== 'admin') {
            sql += ' AND user_id = ?';
            params.push(userId);
        }

        // 搜索条件（订单号或用户名）
        if (keyword) {
            sql += ' AND (order_no LIKE ? OR user_name LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        // 状态过滤
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        // 获取总数
        const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) AS total');
        const [countResult] = await db.query(countSql, params);
        const total = countResult[0].total;

        // 排序和分页
        sql += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
        params.push(parsedLimit, offset);

        const [results] = await db.query(sql, params);

        // 获取每个订单的商品详情
        for (let order of results) {
            const [items] = await db.query(
                `SELECT * FROM order_items WHERE order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

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

// 获取订单详情
const getOrderDetail = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '订单 ID 不能为空'
            });
        }

        const [results] = await db.query(`SELECT * FROM orders WHERE id = ?`, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在'
            });
        }

        const order = results[0];

        // 获取订单商品
        const [items] = await db.query(
            `SELECT * FROM order_items WHERE order_id = ?`,
            [order.id]
        );
        order.items = items;

        res.json({
            code: 200,
            data: order
        });
    } catch (err) {
        next(err);
    }
};

// 创建订单
const createOrder = async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const {
            user_id,
            user_name,
            user_phone,
            user_address,
            items,
            shipping_fee,
            payment_method,
            remark
        } = req.body;

        // 验证必填字段
        if (!user_name || !user_phone || !user_address || !items || items.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                code: 400,
                message: '用户信息和商品信息为必填项'
            });
        }

        // 检查库存并验证商品信息
        const productChecks = [];
        for (const item of items) {
            if (!item.product_id || !item.quantity || item.quantity <= 0) {
                await connection.rollback();
                return res.status(400).json({
                    code: 400,
                    message: '商品信息不完整'
                });
            }

            // 查询商品信息
            const [products] = await connection.query(
                `SELECT id, name, price, stock, image_url, status FROM products WHERE id = ? AND status = 1`,
                [item.product_id]
            );

            if (products.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    code: 400,
                    message: `商品ID ${item.product_id} 不存在或已下架`
                });
            }

            const product = products[0];

            // 检查库存
            if (product.stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({
                    code: 400,
                    message: `商品"${product.name}"库存不足，当前库存：${product.stock}`
                });
            }

            // 使用商品的实际价格（防止前端篡改）
            item.actual_price = parseFloat(product.price);
            item.product_name = item.product_name || product.name;
            item.product_image = item.product_image || product.image_url;
            productChecks.push({ product, item });
        }

        // 生成订单号
        const orderNo = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

        // 计算总金额（使用实际价格）
        let totalAmount = 0;
        for (const { item } of productChecks) {
            totalAmount += item.actual_price * item.quantity;
        }
        totalAmount += (shipping_fee || 0);

        // 创建订单
        const orderSql = `
            INSERT INTO orders (
                order_no, user_id, user_name, user_phone, user_address,
                total_amount, shipping_fee, payment_method, remark, status, create_time, update_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
        `;

        const [orderResult] = await connection.query(orderSql, [
            orderNo,
            user_id || null,
            user_name,
            user_phone,
            user_address,
            totalAmount,
            shipping_fee || 0,
            payment_method || null,
            remark || null
        ]);

        const orderId = orderResult.insertId;

        // 创建订单商品并扣减库存
        for (const { item } of productChecks) {
            // 插入订单商品
            await connection.query(`
                INSERT INTO order_items (
                    order_id, product_id, product_name, product_image, price, quantity, subtotal, create_time
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `, [
                orderId,
                item.product_id,
                item.product_name,
                item.product_image || null,
                item.actual_price,
                item.quantity,
                item.actual_price * item.quantity
            ]);

            // 扣减库存
            await connection.query(
                `UPDATE products SET stock = stock - ?, sales_count = sales_count + ? WHERE id = ?`,
                [item.quantity, item.quantity, item.product_id]
            );
        }

        // 如果用户已登录，清空购物车
        if (user_id) {
            await connection.query(
                `DELETE FROM shopping_cart WHERE user_id = ?`,
                [user_id]
            );
        }

        // 模拟支付：自动将订单状态更新为已支付
        await connection.query(
            `UPDATE orders SET status = 'paid', payment_time = NOW(), update_time = NOW() WHERE id = ?`,
            [orderId]
        );

        await connection.commit();

        // 获取完整的订单信息
        const [orderDetails] = await connection.query(
            `SELECT * FROM orders WHERE id = ?`,
            [orderId]
        );

        const [orderItems] = await connection.query(
            `SELECT * FROM order_items WHERE order_id = ?`,
            [orderId]
        );

        res.status(201).json({
            code: 201,
            message: '订单创建成功并已自动支付',
            data: {
                ...orderDetails[0],
                items: orderItems
            }
        });
    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
};

// 更新订单状态
const updateOrderStatus = async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { status, payment_time } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!id) {
            await connection.rollback();
            return res.status(400).json({
                code: 400,
                message: '订单 ID 不能为空'
            });
        }

        // 检查订单是否存在
        const [existingOrder] = await connection.query(
            `SELECT id, status, user_id FROM orders WHERE id = ?`,
            [id]
        );
        if (existingOrder.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                code: 404,
                message: '订单不存在'
            });
        }

        const order = existingOrder[0];

        // 如果用户不是管理员，只能操作自己的订单
        if (userId && req.user.role !== 'admin' && order.user_id !== userId) {
            await connection.rollback();
            return res.status(403).json({
                code: 403,
                message: '无权操作此订单'
            });
        }

        // 验证状态
        const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
        if (status && !validStatuses.includes(status)) {
            await connection.rollback();
            return res.status(400).json({
                code: 400,
                message: `订单状态必须是以下之一: ${validStatuses.join(', ')}`
            });
        }

        // 如果取消订单，恢复库存
        if (status === 'cancelled' && order.status !== 'cancelled') {
            const [orderItems] = await connection.query(
                `SELECT product_id, quantity FROM order_items WHERE order_id = ?`,
                [id]
            );

            for (const item of orderItems) {
                await connection.query(
                    `UPDATE products SET stock = stock + ? WHERE id = ?`,
                    [item.quantity, item.product_id]
                );
            }
        }

        let sql = `UPDATE orders SET status = ?, update_time = NOW()`;
        const params = [status];

        if (payment_time) {
            sql += `, payment_time = ?`;
            params.push(payment_time);
        } else if (status === 'paid') {
            sql += `, payment_time = NOW()`;
        }

        sql += ` WHERE id = ?`;
        params.push(id);

        await connection.query(sql, params);
        await connection.commit();

        res.json({
            code: 200,
            message: '订单状态更新成功'
        });
    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
};

// 删除订单
const deleteOrder = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '订单 ID 不能为空'
            });
        }

        // 检查订单是否存在
        const [existingOrder] = await db.query(`SELECT id FROM orders WHERE id = ?`, [id]);
        if (existingOrder.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在'
            });
        }

        // 删除订单商品
        await db.query(`DELETE FROM order_items WHERE order_id = ?`, [id]);

        // 删除订单
        await db.query(`DELETE FROM orders WHERE id = ?`, [id]);

        res.json({
            code: 200,
            message: '订单已删除'
        });
    } catch (err) {
        next(err);
    }
};

// 获取订单统计
const getOrderStats = async (req, res, next) => {
    try {
        const [totalResult] = await db.query(`SELECT COUNT(*) as total FROM orders`);
        const [amountResult] = await db.query(`SELECT SUM(total_amount) as totalAmount FROM orders WHERE status != 'cancelled'`);
        const [completedResult] = await db.query(`SELECT COUNT(*) as completed FROM orders WHERE status = 'completed'`);
        const [pendingResult] = await db.query(`SELECT COUNT(*) as pending FROM orders WHERE status IN ('pending', 'paid')`);

        res.json({
            code: 200,
            data: {
                total: totalResult[0].total || 0,
                totalAmount: amountResult[0].totalAmount || 0,
                completedCount: completedResult[0].completed || 0,
                pendingCount: pendingResult[0].pending || 0
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllOrders,
    getOrderDetail,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderStats
};

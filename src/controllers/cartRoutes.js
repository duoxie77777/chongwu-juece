const { db } = require('../config/database');

// ============ 购物车管理接口 ============

// 获取购物车列表
const getCartItems = async (req, res, next) => {
    try {
        const userId = req.user.id; // 从JWT中获取用户ID

        // 查询购物车商品，关联商品表获取商品信息
        const sql = `
            SELECT 
                c.id as cart_id,
                c.product_id,
                c.quantity,
                c.create_time,
                c.update_time,
                p.name,
                p.price,
                p.original_price,
                p.image_url,
                p.images,
                p.description,
                p.stock,
                p.status as product_status
            FROM shopping_cart c
            LEFT JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
            ORDER BY c.create_time DESC
        `;
        const [results] = await db.query(sql, [userId]);

        // 处理数据，转换为前端需要的格式
        const cartItems = results.map(item => {
            // 处理图片URL
            let imageUrl = item.image_url || '';
            if (!imageUrl && item.images) {
                try {
                    const images = JSON.parse(item.images);
                    if (Array.isArray(images) && images.length > 0) {
                        imageUrl = images[0];
                    }
                } catch (e) {
                    // 不是JSON，直接使用
                }
            }

            return {
                id: item.cart_id,
                cart_id: item.cart_id,
                product_id: item.product_id,
                name: item.name,
                price: parseFloat(item.price) || 0,
                original_price: item.original_price ? parseFloat(item.original_price) : null,
                image: imageUrl,
                description: item.description || '',
                quantity: parseInt(item.quantity) || 1,
                stock: parseInt(item.stock) || 0,
                product_status: item.product_status,
                checked: true // 默认选中
            };
        });

        res.json({
            code: 200,
            data: cartItems
        });
    } catch (err) {
        next(err);
    }
};

// 添加商品到购物车
const addToCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({
                code: 400,
                message: '商品ID不能为空'
            });
        }

        // 检查商品是否存在且上架
        const [productResult] = await db.query(
            'SELECT id, stock, status FROM products WHERE id = ?',
            [product_id]
        );

        if (productResult.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在'
            });
        }

        const product = productResult[0];
        if (product.status !== 1) {
            return res.status(400).json({
                code: 400,
                message: '商品已下架'
            });
        }

        // 检查库存
        const qty = parseInt(quantity) || 1;
        if (qty > product.stock) {
            return res.status(400).json({
                code: 400,
                message: `库存不足，当前库存：${product.stock}`
            });
        }

        // 检查购物车中是否已有该商品
        const [existingCart] = await db.query(
            'SELECT id, quantity FROM shopping_cart WHERE user_id = ? AND product_id = ?',
            [userId, product_id]
        );

        if (existingCart.length > 0) {
            // 更新数量
            const newQuantity = existingCart[0].quantity + qty;
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    code: 400,
                    message: `库存不足，当前库存：${product.stock}，购物车已有：${existingCart[0].quantity}`
                });
            }

            await db.query(
                'UPDATE shopping_cart SET quantity = ?, update_time = NOW() WHERE id = ?',
                [newQuantity, existingCart[0].id]
            );

            res.json({
                code: 200,
                message: '已更新购物车商品数量',
                data: {
                    cart_id: existingCart[0].id,
                    quantity: newQuantity
                }
            });
        } else {
            // 新增购物车项
            const [result] = await db.query(
                'INSERT INTO shopping_cart (user_id, product_id, quantity, create_time, update_time) VALUES (?, ?, ?, NOW(), NOW())',
                [userId, product_id, qty]
            );

            res.json({
                code: 200,
                message: '已添加到购物车',
                data: {
                    cart_id: result.insertId,
                    quantity: qty
                }
            });
        }
    } catch (err) {
        next(err);
    }
};

// 更新购物车商品数量
const updateCartItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params; // 购物车项ID
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                code: 400,
                message: '数量必须大于0'
            });
        }

        // 检查购物车项是否存在且属于当前用户
        const [cartItem] = await db.query(
            `SELECT c.*, p.stock, p.status as product_status 
             FROM shopping_cart c 
             LEFT JOIN products p ON c.product_id = p.id 
             WHERE c.id = ? AND c.user_id = ?`,
            [id, userId]
        );

        if (cartItem.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '购物车项不存在'
            });
        }

        const item = cartItem[0];

        // 检查商品状态
        if (item.product_status !== 1) {
            return res.status(400).json({
                code: 400,
                message: '商品已下架'
            });
        }

        // 检查库存
        const qty = parseInt(quantity);
        if (qty > item.stock) {
            return res.status(400).json({
                code: 400,
                message: `库存不足，当前库存：${item.stock}`
            });
        }

        // 更新数量
        await db.query(
            'UPDATE shopping_cart SET quantity = ?, update_time = NOW() WHERE id = ?',
            [qty, id]
        );

        res.json({
            code: 200,
            message: '更新成功',
            data: {
                cart_id: parseInt(id),
                quantity: qty
            }
        });
    } catch (err) {
        next(err);
    }
};

// 删除购物车商品
const removeCartItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params; // 购物车项ID

        // 检查购物车项是否存在且属于当前用户
        const [cartItem] = await db.query(
            'SELECT id FROM shopping_cart WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (cartItem.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '购物车项不存在'
            });
        }

        // 删除购物车项
        await db.query('DELETE FROM shopping_cart WHERE id = ?', [id]);

        res.json({
            code: 200,
            message: '删除成功'
        });
    } catch (err) {
        next(err);
    }
};

// 批量删除购物车商品
const batchRemoveCartItems = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { ids } = req.body; // 购物车项ID数组

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '请选择要删除的商品'
            });
        }

        // 构建占位符
        const placeholders = ids.map(() => '?').join(',');

        // 检查购物车项是否都属于当前用户
        const [cartItems] = await db.query(
            `SELECT id FROM shopping_cart WHERE id IN (${placeholders}) AND user_id = ?`,
            [...ids, userId]
        );

        if (cartItems.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '没有找到要删除的购物车项'
            });
        }

        // 删除购物车项
        await db.query(
            `DELETE FROM shopping_cart WHERE id IN (${placeholders}) AND user_id = ?`,
            [...ids, userId]
        );

        res.json({
            code: 200,
            message: `成功删除 ${cartItems.length} 件商品`
        });
    } catch (err) {
        next(err);
    }
};

// 清空购物车
const clearCart = async (req, res, next) => {
    try {
        const userId = req.user.id;

        await db.query('DELETE FROM shopping_cart WHERE user_id = ?', [userId]);

        res.json({
            code: 200,
            message: '购物车已清空'
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getCartItems,
    addToCart,
    updateCartItem,
    removeCartItem,
    batchRemoveCartItems,
    clearCart
};


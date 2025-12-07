const { db } = require('../config/database');

// ============ 宠物分类接口 ============

/**
 * 获取所有宠物分类
 */
const getPetCategories = async (req, res, next) => {
    try {
        const sql = `SELECT id, name, description, icon, sort_order, status, create_time, update_time 
                     FROM pet_categories 
                     WHERE status = 1 
                     ORDER BY sort_order ASC, id ASC`;
        
        const [results] = await db.query(sql);

        res.json({
            code: 200,
            data: results
        });
    } catch (err) {
        next(err);
    }
};

/**
 * 获取宠物分类详情
 */
const getPetCategoryDetail = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '分类 ID 不能为空'
            });
        }

        const sql = `SELECT id, name, description, icon, sort_order, status, create_time, update_time 
                     FROM pet_categories 
                     WHERE id = ?`;
        const [results] = await db.query(sql, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '分类不存在'
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

/**
 * 创建宠物分类
 */
const createPetCategory = async (req, res, next) => {
    try {
        const { name, description, icon, sort_order } = req.body;

        // 验证必填字段
        if (!name) {
            return res.status(400).json({
                code: 400,
                message: '分类名称必填'
            });
        }

        const sql = `INSERT INTO pet_categories (name, description, icon, sort_order, status, create_time, update_time) 
                     VALUES (?, ?, ?, ?, 1, NOW(), NOW())`;
        
        const params = [
            name,
            description || null,
            icon || 1,
            sort_order || 0
        ];

        const [result] = await db.query(sql, params);

        res.status(201).json({
            code: 201,
            message: '宠物分类创建成功',
            data: {
                id: result.insertId,
                name,
                icon: icon || 1
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * 更新宠物分类
 */
const updatePetCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, icon, sort_order, status } = req.body;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '分类 ID 不能为空'
            });
        }

        // 检查分类是否存在
        const [existingCategory] = await db.query(`SELECT id FROM pet_categories WHERE id = ?`, [id]);
        if (existingCategory.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '分类不存在'
            });
        }

        // 构建动态 UPDATE 语句
        const updateFields = [];
        const params = [];

        if (name !== undefined) {
            updateFields.push('name = ?');
            params.push(name);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            params.push(description);
        }
        if (icon !== undefined) {
            updateFields.push('icon = ?');
            params.push(icon);
        }
        if (sort_order !== undefined) {
            updateFields.push('sort_order = ?');
            params.push(sort_order);
        }
        if (status !== undefined) {
            updateFields.push('status = ?');
            params.push(status);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '没有要更新的字段'
            });
        }

        updateFields.push('update_time = NOW()');
        const sql = `UPDATE pet_categories SET ${updateFields.join(', ')} WHERE id = ?`;
        params.push(id);

        await db.query(sql, params);

        res.json({
            code: 200,
            message: '宠物分类更新成功'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * 删除宠物分类
 */
const deletePetCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '分类 ID 不能为空'
            });
        }

        // 检查分类是否存在
        const [existingCategory] = await db.query(`SELECT id FROM pet_categories WHERE id = ?`, [id]);
        if (existingCategory.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '分类不存在'
            });
        }

        // 检查分类下是否有宠物
        const [pets] = await db.query(`SELECT COUNT(*) as count FROM pet_core_info WHERE category_id = ?`, [id]);
        if (pets[0].count > 0) {
            return res.status(400).json({
                code: 400,
                message: '分类下有宠物，无法删除'
            });
        }

        // 软删除：更新状态为0
        const sql = `UPDATE pet_categories SET status = 0, update_time = NOW() WHERE id = ?`;
        await db.query(sql, [id]);

        res.json({
            code: 200,
            message: '宠物分类已删除'
        });
    } catch (err) {
        next(err);
    }
};

// ============ 商品分类接口 ============

/**
 * 获取所有商品分类
 */
const getProductCategories = async (req, res, next) => {
    try {
        const sql = `SELECT id, name, description, icon, sort_order, status, create_time, update_time 
                     FROM product_categories 
                     WHERE status = 1 
                     ORDER BY sort_order ASC, id ASC`;
        
        const [results] = await db.query(sql);

        res.json({
            code: 200,
            data: results
        });
    } catch (err) {
        next(err);
    }
};

/**
 * 获取商品分类详情
 */
const getProductCategoryDetail = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '分类 ID 不能为空'
            });
        }

        const sql = `SELECT id, name, description, icon, sort_order, status, create_time, update_time 
                     FROM product_categories 
                     WHERE id = ?`;
        const [results] = await db.query(sql, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '分类不存在'
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

/**
 * 创建商品分类
 */
const createProductCategory = async (req, res, next) => {
    try {
        const { name, description, icon, sort_order } = req.body;

        // 验证必填字段
        if (!name) {
            return res.status(400).json({
                code: 400,
                message: '分类名称必填'
            });
        }

        const sql = `INSERT INTO product_categories (name, description, icon, sort_order, status, create_time, update_time) 
                     VALUES (?, ?, ?, ?, 1, NOW(), NOW())`;
        
        const params = [
            name,
            description || null,
            icon || 1,
            sort_order || 0
        ];

        const [result] = await db.query(sql, params);

        res.status(201).json({
            code: 201,
            message: '商品分类创建成功',
            data: {
                id: result.insertId,
                name,
                icon: icon || 1
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * 更新商品分类
 */
const updateProductCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, icon, sort_order, status } = req.body;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '分类 ID 不能为空'
            });
        }

        // 检查分类是否存在
        const [existingCategory] = await db.query(`SELECT id FROM product_categories WHERE id = ?`, [id]);
        if (existingCategory.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '分类不存在'
            });
        }

        // 构建动态 UPDATE 语句
        const updateFields = [];
        const params = [];

        if (name !== undefined) {
            updateFields.push('name = ?');
            params.push(name);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            params.push(description);
        }
        if (icon !== undefined) {
            updateFields.push('icon = ?');
            params.push(icon);
        }
        if (sort_order !== undefined) {
            updateFields.push('sort_order = ?');
            params.push(sort_order);
        }
        if (status !== undefined) {
            updateFields.push('status = ?');
            params.push(status);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '没有要更新的字段'
            });
        }

        updateFields.push('update_time = NOW()');
        const sql = `UPDATE product_categories SET ${updateFields.join(', ')} WHERE id = ?`;
        params.push(id);

        await db.query(sql, params);

        res.json({
            code: 200,
            message: '商品分类更新成功'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * 删除商品分类
 */
const deleteProductCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '分类 ID 不能为空'
            });
        }

        // 检查分类是否存在
        const [existingCategory] = await db.query(`SELECT id FROM product_categories WHERE id = ?`, [id]);
        if (existingCategory.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '分类不存在'
            });
        }

        // 检查分类下是否有商品
        const [products] = await db.query(`SELECT COUNT(*) as count FROM products WHERE category_id = ?`, [id]);
        if (products[0].count > 0) {
            return res.status(400).json({
                code: 400,
                message: '分类下有商品，无法删除'
            });
        }

        // 软删除：更新状态为0
        const sql = `UPDATE product_categories SET status = 0, update_time = NOW() WHERE id = ?`;
        await db.query(sql, [id]);

        res.json({
            code: 200,
            message: '商品分类已删除'
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    // 宠物分类
    getPetCategories,
    getPetCategoryDetail,
    createPetCategory,
    updatePetCategory,
    deletePetCategory,
    
    // 商品分类
    getProductCategories,
    getProductCategoryDetail,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory
};

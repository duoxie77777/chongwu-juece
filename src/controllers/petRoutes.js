const { db } = require('../config/database');
const pets = 'pet_core_info';

// ============ 查询接口 ============

// 查询所有宠物（支持分页、搜索、过滤）
const getAllPets = async (req, res, next) => {
    try {
        const { keyword = '', status = '', pet_type = '', age_min = '', age_max = '', page = 1, size = 10 } = req.query;

        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(size, 10) || 10;
        const offset = (parsedPage - 1) * parsedLimit;

        let sql = `SELECT * FROM ${pets} WHERE delete_time IS NULL`;
        const params = [];

        // 搜索条件
        if (keyword) {
            sql += ' AND pet_name LIKE ?';
            params.push(`%${keyword}%`);
        }

        // 状态过滤
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        // 类型过滤
        if (pet_type) {
            sql += ' AND pet_type = ?';
            params.push(pet_type);
        }

        // 年龄过滤
        if (age_min !== '') {
            const minAge = parseInt(age_min, 10);
            if (!isNaN(minAge)) {
                sql += ' AND age >= ?';
                params.push(minAge);
            }
        }
        if (age_max !== '') {
            const maxAge = parseInt(age_max, 10);
            if (!isNaN(maxAge)) {
                sql += ' AND age <= ?';
                params.push(maxAge);
            }
        }

        // 获取总数
        const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) AS total');
        const [countResult] = await db.query(countSql, params);
        const total = countResult[0].total;

        // 排序和分页
        sql += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
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

// 获取宠物详情
const getPetDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id; // 可选，如果用户已登录

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '宠物 ID 不能为空'
            });
        }

        const sql = `SELECT * FROM ${pets} WHERE id = ? AND delete_time IS NULL`;
        const [results] = await db.query(sql, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '宠物不存在'
            });
        }

        // 如果用户已登录，记录浏览行为（异步，不阻塞响应）
        if (userId) {
            const { recordUserBehavior } = require('./recommendRoutes');
            recordUserBehavior(userId, parseInt(id), 'view', 1.0)
                .then(() => {
                    console.log(`[推荐系统] 已记录用户 ${userId} 浏览宠物 ${id} 的行为`);
                })
                .catch(err => {
                    console.error('[推荐系统] 记录浏览行为失败:', err);
                });
        } else {
            console.log(`[推荐系统] 用户未登录，跳过行为记录（宠物ID: ${id}）`);
        }

        // 更新宠物的浏览量（异步）
        db.query(`UPDATE ${pets} SET views = views + 1 WHERE id = ?`, [id]).catch(err => {
            console.error('更新浏览量失败:', err);
        });

        res.json({
            code: 200,
            data: results[0]
        });
    } catch (err) {
        next(err);
    }
};

// ============ 创建接口 ============

// 创建宠物
const createPet = async (req, res, next) => {
    try {
        const {
            pet_name,
            category_id,
            pet_type,
            breed,
            age,
            gender,
            color,
            size,
            weight,
            health_status,
            vaccination,
            sterilization,
            description,
            character,
            image_url,
            images,
            status,
            rescue_date,
            rescue_location,
            rescue_story
        } = req.body;

        // 验证必填字段
        if (!pet_name || !pet_type) {
            return res.status(400).json({
                code: 400,
                message: '宠物名称和类型必填'
            });
        }

        // 验证枚举字段
        const validSizes = ['small', 'medium', 'large'];
        const validGenders = ['male', 'female', 'unknown'];
        const validPetTypes = ['dog', 'cat', 'other'];
        const validStatuses = ['available', 'adopted', 'reserved', 'unavailable'];

        if (size && !validSizes.includes(size)) {
            return res.status(400).json({
                code: 400,
                message: `宠物体型必须是以下之一: ${validSizes.join(', ')}`
            });
        }

        if (gender && !validGenders.includes(gender)) {
            return res.status(400).json({
                code: 400,
                message: `宠物性别必须是以下之一: ${validGenders.join(', ')}`
            });
        }

        if (!validPetTypes.includes(pet_type)) {
            return res.status(400).json({
                code: 400,
                message: `宠物类型必须是以下之一: ${validPetTypes.join(', ')}`
            });
        }

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                code: 400,
                message: `宠物状态必须是以下之一: ${validStatuses.join(', ')}`
            });
        }

        // 转换日期格式：ISO 8601 -> DATE (YYYY-MM-DD)
        const formatDate = (dateStr) => {
            if (!dateStr) return null;
            const date = new Date(dateStr);
            return date.toISOString().split('T')[0];
        };

        const sql = `
            INSERT INTO ${pets} (
                pet_name, category_id, pet_type, breed, age, gender, color, size, weight,
                health_status, vaccination, sterilization, description, ` + '`character`' + `, image_url,
                images, status, rescue_date, rescue_location, rescue_story, create_user_id, create_time, update_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const params = [
            pet_name,
            category_id || null,
            pet_type,
            breed || null,
            age || null,
            gender || 'unknown',
            color || null,
            size || null,
            weight || null,
            health_status || null,
            vaccination || 0,
            sterilization || 0,
            description || null,
            character || null,
            image_url || null,
            images ? JSON.stringify(images) : null,
            status || 'available',
            formatDate(rescue_date),
            rescue_location || null,
            rescue_story || null,
            req.user?.id || null
        ];

        const [result] = await db.query(sql, params);

        res.status(201).json({
            code: 201,
            message: '宠物创建成功',
            data: {
                id: result.insertId,
                pet_name
            }
        });
    } catch (err) {
        next(err);
    }
};

// ============ 更新接口 ============

// 更新宠物信息
const updatePet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '宠物 ID 不能为空'
            });
        }

        // 检查宠物是否存在
        const [existingPet] = await db.query(`SELECT id FROM ${pets} WHERE id = ? AND delete_time IS NULL`, [id]);
        if (existingPet.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '宠物不存在'
            });
        }

        // 验证枚举字段
        const validSizes = ['small', 'medium', 'large'];
        const validGenders = ['male', 'female', 'unknown'];
        const validPetTypes = ['dog', 'cat', 'other'];
        const validStatuses = ['available', 'adopted', 'reserved', 'unavailable'];

        if (updates.size && !validSizes.includes(updates.size)) {
            return res.status(400).json({
                code: 400,
                message: `宠物体型必须是以下之一: ${validSizes.join(', ')}`
            });
        }

        if (updates.gender && !validGenders.includes(updates.gender)) {
            return res.status(400).json({
                code: 400,
                message: `宠物性别必须是以下之一: ${validGenders.join(', ')}`
            });
        }

        if (updates.pet_type && !validPetTypes.includes(updates.pet_type)) {
            return res.status(400).json({
                code: 400,
                message: `宠物类型必须是以下之一: ${validPetTypes.join(', ')}`
            });
        }

        if (updates.status && !validStatuses.includes(updates.status)) {
            return res.status(400).json({
                code: 400,
                message: `宠物状态必须是以下之一: ${validStatuses.join(', ')}`
            });
        }

        // 转换日期格式：ISO 8601 -> DATE (YYYY-MM-DD)
        const formatDate = (dateStr) => {
            if (!dateStr) return null;
            const date = new Date(dateStr);
            return date.toISOString().split('T')[0];
        };

        // 构建动态 UPDATE 语句
        const updateFields = [];
        const params = [];

        const allowedFields = [
            'pet_name', 'category_id', 'pet_type', 'breed', 'age', 'gender', 'color',
            'size', 'weight', 'health_status', 'vaccination', 'sterilization', 'description',
            '`character`', 'image_url', 'images', 'status', 'rescue_date', 'rescue_location', 'rescue_story'
        ];

        for (const field of allowedFields) {
            if (field in updates) {
                updateFields.push(`${field} = ?`);
                // 如果是 images 字段，需要转换为 JSON 字符串
                if (field === 'images' && typeof updates[field] === 'object') {
                    params.push(JSON.stringify(updates[field]));
                } else if (field === 'rescue_date') {
                    // 如果是 rescue_date，需要转换日期格式
                    params.push(formatDate(updates[field]));
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
        const sql = `UPDATE ${pets} SET ${updateFields.join(', ')} WHERE id = ?`;
        params.push(id);

        await db.query(sql, params);

        res.json({
            code: 200,
            message: '宠物信息更新成功'
        });
    } catch (err) {
        next(err);
    }
};

// ============ 删除接口 ============

// 软删除宠物
const deletePet = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '宠物 ID 不能为空'
            });
        }

        // 检查宠物是否存在
        const [existingPet] = await db.query(`SELECT id FROM ${pets} WHERE id = ? AND delete_time IS NULL`, [id]);
        if (existingPet.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '宠物不存在'
            });
        }

        // 软删除
        const sql = `UPDATE ${pets} SET delete_time = NOW() WHERE id = ?`;
        await db.query(sql, [id]);

        res.json({
            code: 200,
            message: '宠物已删除'
        });
    } catch (err) {
        next(err);
    }
};

// 批量删除宠物
const batchDeletePets = async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '请提供有效的宠物 ID 列表'
            });
        }

        const placeholders = ids.map(() => '?').join(',');
        const sql = `UPDATE ${pets} SET delete_time = NOW() WHERE id IN (${placeholders}) AND delete_time IS NULL`;
        
        const [result] = await db.query(sql, ids);

        res.json({
            code: 200,
            message: `成功删除 ${result.affectedRows} 只宠物`
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllPets,
    getPetDetails,
    createPet,
    updatePet,
    deletePet,
    batchDeletePets
};
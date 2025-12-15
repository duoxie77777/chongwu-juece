const { db } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 查询所有用户（支持分页、搜索、过滤）
const getAllUsers = async (req, res, next) => {
    try {
        const { keyword = '', status = '', role = '', page = 1, size = 10 } = req.query;

        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(size, 10) || 10;
        const offset = (parsedPage - 1) * parsedLimit;

        let sql = `SELECT id, username, real_name, email, phone, avatar, role, status, gender, address, create_time, update_time FROM users WHERE delete_time IS NULL`;
        const params = [];

        // 搜索条件（用户名或邮箱）
        if (keyword) {
            sql += ' AND (username LIKE ? OR email LIKE ? OR real_name LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        }

        // 状态过滤
        if (status !== '') {
            sql += ' AND status = ?';
            params.push(status);
        }

        // 角色过滤
        if (role) {
            sql += ' AND role = ?';
            params.push(role);
        }

        // 获取总数
        const countSql = sql.replace(/SELECT .* FROM/, 'SELECT COUNT(*) AS total FROM');
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

// 获取用户详情
const getUserDetail = async (req, res, next) => {
    try {
        // 优先使用JWT中的用户ID（用于当前用户请求）
        let userId = req.user ? req.user.id : null;
        
        // 如果没有JWT用户ID，则尝试从URL参数获取（管理员查看其他用户）
        if (!userId && req.params.id) {
            userId = req.params.id;
        }

        if (!userId) {
            return res.status(400).json({
                code: 400,
                message: '用户 ID 不能为空'
            });
        }

        const sql = `SELECT id, username, real_name, email, phone, avatar, role, status, gender, address, create_time, update_time FROM users WHERE id = ? AND delete_time IS NULL`;
        const [results] = await db.query(sql, [userId]);

        if (results.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
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

// 更新用户信息（管理员）
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const currentUserRole = req.user.role; // 获取当前登录用户的角色

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '用户 ID 不能为空'
            });
        }

        // 检查用户是否存在
        const [existingUser] = await db.query(`SELECT id FROM users WHERE id = ? AND delete_time IS NULL`, [id]);
        if (existingUser.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }

        // 如果当前用户是志愿者，禁止修改角色和状态
        if (currentUserRole === 'volunteer') {
            if (updates.role !== undefined) {
                return res.status(403).json({
                    code: 403,
                    message: '志愿者无权修改用户角色'
                });
            }
            if (updates.status !== undefined) {
                return res.status(403).json({
                    code: 403,
                    message: '志愿者无权修改用户状态'
                });
            }
        }

        // 验证角色（仅管理员可以修改）
        const validRoles = ['admin', 'volunteer', 'user'];
        if (updates.role && !validRoles.includes(updates.role)) {
            return res.status(400).json({
                code: 400,
                message: `角色必须是以下之一: ${validRoles.join(', ')}`
            });
        }

        // 验证状态（仅管理员可以修改）
        if (updates.status !== undefined && ![0, 1].includes(Number(updates.status))) {
            return res.status(400).json({
                code: 400,
                message: '状态值无效'
            });
        }

        // 构建动态 UPDATE 语句
        const updateFields = [];
        const params = [];

        // 志愿者只能修改基本信息，不能修改角色和状态
        const allowedFields = currentUserRole === 'volunteer' 
            ? ['real_name', 'email', 'phone', 'avatar', 'gender', 'address']
            : ['real_name', 'email', 'phone', 'avatar', 'role', 'status', 'gender', 'address'];

        for (const field of allowedFields) {
            if (field in updates) {
                updateFields.push(`${field} = ?`);
                params.push(updates[field]);
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '没有要更新的字段'
            });
        }

        updateFields.push('update_time = NOW()');
        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        params.push(id);

        await db.query(sql, params);

        res.json({
            code: 200,
            message: '用户信息更新成功'
        });
    } catch (err) {
        next(err);
    }
};

// 创建用户（管理员）
const createUser = async (req, res, next) => {
    try {
        const { username, email, password, real_name, phone, avatar, role, status, gender, address } = req.body;
        const currentUserRole = req.user.role; // 获取当前登录用户的角色

        // 志愿者无权创建用户
        if (currentUserRole === 'volunteer') {
            return res.status(403).json({
                code: 403,
                message: '志愿者无权创建用户'
            });
        }

        // 1. 参数验证
        if (!username || !email || !password) {
            return res.status(400).json({
                code: 400,
                message: '用户名、邮箱和密码为必填项'
            });
        }

        // 2. 密码长度验证
        if (password.length < 6) {
            return res.status(400).json({
                code: 400,
                message: '密码长度不能少于6位'
            });
        }

        // 3. 验证角色
        const validRoles = ['admin', 'volunteer', 'user'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({
                code: 400,
                message: `角色必须是以下之一: ${validRoles.join(', ')}`
            });
        }

        // 4. 检查用户名是否已存在
        const checkUsernameSql = 'SELECT id FROM users WHERE username = ? AND delete_time IS NULL';
        const [usernameResult] = await db.query(checkUsernameSql, [username]);
        if (usernameResult.length > 0) {
            return res.status(409).json({
                code: 409,
                message: '用户名已存在'
            });
        }

        // 5. 检查邮箱是否已存在
        const checkEmailSql = 'SELECT id FROM users WHERE email = ? AND delete_time IS NULL';
        const [emailResult] = await db.query(checkEmailSql, [email]);
        if (emailResult.length > 0) {
            return res.status(409).json({
                code: 409,
                message: '邮箱已被注册'
            });
        }

        // 6. 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7. 插入新用户
        const sql = `
            INSERT INTO users (username, email, password, real_name, phone, avatar, role, status, gender, address, create_time, update_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        const params = [
            username,
            email,
            hashedPassword,
            real_name || null,
            phone || null,
            avatar || null,
            role || 'user',
            status !== undefined ? status : 1,
            gender || null,
            address || null
        ];

        const [result] = await db.query(sql, params);

        res.status(201).json({
            code: 201,
            message: '用户创建成功',
            data: {
                id: result.insertId,
                username,
                email
            }
        });
    } catch (err) {
        next(err);
    }
};

// 软删除用户
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role; // 获取当前登录用户的角色

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '用户 ID 不能为空'
            });
        }

        // 志愿者无权删除用户
        if (currentUserRole === 'volunteer') {
            return res.status(403).json({
                code: 403,
                message: '志愿者无权删除用户'
            });
        }

        // 检查用户是否存在
        const [existingUser] = await db.query(`SELECT id, role FROM users WHERE id = ? AND delete_time IS NULL`, [id]);
        if (existingUser.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }

        // 不能删除管理员
        if (existingUser[0].role === 'admin') {
            return res.status(403).json({
                code: 403,
                message: '不能删除管理员账号'
            });
        }

        // 软删除
        const sql = `UPDATE users SET delete_time = NOW() WHERE id = ?`;
        await db.query(sql, [id]);

        res.json({
            code: 200,
            message: '用户已删除'
        });
    } catch (err) {
        next(err);
    }
};

// 用户注册
const register = async (req, res, next) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // 1. 参数验证
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({
                code: 400,
                message: '请填写所有必填项'
            });
        }

        // 2. 验证两次密码是否一致
        if (password !== confirmPassword) {
            return res.status(400).json({
                code: 400,
                message: '两次输入的密码不一致'
            });
        }

        // 3. 密码长度验证
        if (password.length < 6) {
            return res.status(400).json({
                code: 400,
                message: '密码长度不能少于6位'
            });
        }

        // 4. 检查用户名是否已存在
        const checkUsernameSql = 'SELECT id FROM users WHERE username = ?';
        const [usernameResult] = await db.query(checkUsernameSql, [username]);
        if (usernameResult.length > 0) {
            return res.status(409).json({
                code: 409,
                message: '用户名已存在'
            });
        }

        // 5. 检查邮箱是否已存在
        const checkEmailSql = 'SELECT id FROM users WHERE email = ?';
        const [emailResult] = await db.query(checkEmailSql, [email]);
        if (emailResult.length > 0) {
            return res.status(409).json({
                code: 409,
                message: '邮箱已被注册'
            });
        }

        // 6. 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7. 插入新用户
        const registerSql = 'INSERT INTO users (username, email, password, role, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
        await db.query(registerSql, [username, email, hashedPassword, 'user', 1]);

        res.status(201).json({
            code: 201,
            message: '注册成功',
            data: {
                username,
                email
            }
        });
    } catch (err) {
        next(err);
    }
}

// 用户登录
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // 1. 参数验证
        if (!username || !password) {
            return res.status(400).json({
                code: 400,
                message: '请输入用户名和密码'
            });
        }

        // 2. 查询用户
        const sql = 'SELECT * FROM users WHERE username = ? OR email = ?';
        const [result] = await db.query(sql, [username, username]);

        if (result.length === 0) {
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误'
            });
        }

        const user = result[0];

        // 3. 检查用户状态
        if (user.status === 0) {
            return res.status(403).json({
                code: 403,
                message: '该账号已被禁用'
            });
        }

        // 4. 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误'
            });
        }

        // 5. 生成JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || '456$%^654^%$',
            { expiresIn: '7d' }
        );

        // 6. 构建返回的用户信息（排除敏感字段和不需要的字段）
        const userInfo = {
            id: user.id,
            username: user.username,
            real_name: user.real_name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            status: user.status,
            gender: user.gender,
            address: user.address,
            create_time: user.create_time,
            update_time: user.update_time
        };

        // 7. 返回登录成功
        res.json({
            code: 200,
            message: '登录成功',
            data: {
                token,
                user: userInfo
            }
        });
    } catch (err) {
        next(err);
    }
}

// 更新当前用户个人资料
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id; // 从JWT中获取用户ID
        const updates = req.body;

        // 调试日志：查看接收到的原始数据
        console.log('接收到的更新数据:', JSON.stringify(updates, null, 2));
        console.log('接收到的字段:', Object.keys(updates));

        // 检查用户是否存在
        const [existingUser] = await db.query(`SELECT id FROM users WHERE id = ? AND delete_time IS NULL`, [userId]);
        if (existingUser.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }

        // 只允许更新的字段（与数据库表字段对应）
        const allowedFields = ['real_name', 'email', 'phone', 'avatar', 'gender', 'address'];

        // 过滤请求体，只保留允许的字段 - 使用白名单方式
        const filteredUpdates = {};
        for (const field of allowedFields) {
            if (updates.hasOwnProperty(field)) {
                let value = updates[field];
                
                // 特殊处理：如果 address 是对象，转换为字符串
                if (field === 'address' && typeof value === 'object' && value !== null) {
                    // 如果是地址对象，拼接成字符串
                    if (value.province || value.city || value.district || value.address) {
                        const addressParts = [
                            value.province,
                            value.city,
                            value.district,
                            value.address
                        ].filter(part => part).join(' ');
                        value = addressParts || null;
                    } else {
                        // 否则转换为 JSON 字符串（如果对象有其他属性）
                        value = JSON.stringify(value);
                    }
                }
                
                filteredUpdates[field] = value !== undefined && value !== '' ? value : null;
            }
        }

        // 检查是否有不允许的字段
        const receivedFields = Object.keys(updates);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            console.warn(`收到不允许的字段: ${invalidFields.join(', ')}`);
            console.warn(`这些字段将被忽略，不会更新到数据库`);
        }

        // 调试日志：查看过滤后的数据
        console.log('过滤后的更新数据:', JSON.stringify(filteredUpdates, null, 2));
        console.log('过滤后的字段:', Object.keys(filteredUpdates));

        if (Object.keys(filteredUpdates).length === 0) {
            return res.status(400).json({
                code: 400,
                message: '没有要更新的字段'
            });
        }

        // 构建动态 UPDATE 语句 - 只使用白名单中的字段
        const updateFields = [];
        const params = [];

        // 严格按照白名单构建 SQL，不信任任何其他字段
        // 双重验证：确保字段在白名单中
        for (const field of allowedFields) {
            if (filteredUpdates.hasOwnProperty(field) && allowedFields.includes(field)) {
                updateFields.push(`\`${field}\` = ?`);
                params.push(filteredUpdates[field]);
            }
        }

        // 最终验证：确保 updateFields 中不包含任何不允许的字段
        const invalidFieldsInSQL = updateFields.filter(field => {
            const fieldName = field.replace(/`/g, '').split(' =')[0];
            return !allowedFields.includes(fieldName) && fieldName !== 'update_time';
        });
        
        if (invalidFieldsInSQL.length > 0) {
            console.error('错误：SQL 中包含不允许的字段:', invalidFieldsInSQL);
            return res.status(400).json({
                code: 400,
                message: `SQL 构建错误：包含不允许的字段 ${invalidFieldsInSQL.join(', ')}`
            });
        }

        updateFields.push('`update_time` = NOW()');
        const sql = `UPDATE \`users\` SET ${updateFields.join(', ')} WHERE \`id\` = ?`;
        params.push(userId);

        // 调试日志：查看构建的 SQL
        console.log('构建的 SQL:', sql);
        console.log('SQL 参数:', params);
        console.log('updateFields:', updateFields);

        // 最终检查：确保 SQL 中不包含 'name' 字段
        if (sql.includes('`name`') || sql.includes(' name ') || sql.includes('name =')) {
            console.error('错误：SQL 中包含 name 字段！');
            console.error('完整 SQL:', sql);
            return res.status(400).json({
                code: 400,
                message: 'SQL 构建错误：检测到不允许的字段 name'
            });
        }

        await db.query(sql, params);

        // 获取更新后的用户信息
        const [updatedUser] = await db.query(
            `SELECT id, username, real_name, email, phone, avatar, role, status, gender, address, create_time, update_time FROM users WHERE id = ? AND delete_time IS NULL`,
            [userId]
        );

        res.json({
            code: 200,
            message: '个人资料更新成功',
            data: updatedUser[0]
        });
    } catch (err) {
        next(err);
    }
};

// 修改密码
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id; // 从JWT中获取用户ID
        const { oldPassword, newPassword } = req.body;

        // 参数验证
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                code: 400,
                message: '请提供原密码和新密码'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                code: 400,
                message: '新密码长度不能少于6位'
            });
        }

        // 获取用户当前密码
        const [userResult] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (userResult.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }

        // 验证原密码
        const isOldPasswordValid = await bcrypt.compare(oldPassword, userResult[0].password);
        if (!isOldPasswordValid) {
            return res.status(400).json({
                code: 400,
                message: '原密码错误'
            });
        }

        // 加密新密码
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 更新密码
        await db.query(
            'UPDATE users SET password = ?, update_time = NOW() WHERE id = ?',
            [hashedNewPassword, userId]
        );

        res.json({
            code: 200,
            message: '密码修改成功'
        });
    } catch (err) {
        next(err);
    }
};

// 创建领养申请
const createAdoptionApplication = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        const {
            pet_id,
            applicant_name,
            applicant_phone,
            applicant_email,
            applicant_address,
            occupation,
            housing_type,
            has_experience,
            has_other_pets,
            family_agree,
            reason,
            commitment
        } = req.body;

        // 验证必填字段
        if (!pet_id) {
            return res.status(400).json({
                code: 400,
                message: '请选择要领养的宠物'
            });
        }

        if (!applicant_name || !applicant_phone) {
            return res.status(400).json({
                code: 400,
                message: '请填写姓名和联系电话'
            });
        }

        // 检查宠物是否存在且可领养
        const [petCheck] = await db.query(
            'SELECT id, status FROM pet_core_info WHERE id = ? AND delete_time IS NULL',
            [pet_id]
        );

        if (petCheck.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '宠物不存在'
            });
        }

        if (petCheck[0].status !== 'available') {
            return res.status(400).json({
                code: 400,
                message: '该宠物当前不可领养'
            });
        }

        // 检查是否已有待审核的申请
        if (userId) {
            const [existingApp] = await db.query(
                'SELECT id FROM adoption_applications WHERE pet_id = ? AND user_id = ? AND status = "pending"',
                [pet_id, userId]
            );

            if (existingApp.length > 0) {
                return res.status(400).json({
                    code: 400,
                    message: '您已提交过该宠物的领养申请，请等待审核'
                });
            }
        }

        // 构建承诺文本
        const commitmentText = commitment || '我承诺将这只动物视为家庭成员，给予它足够的爱与关怀。';

        // 插入领养申请
        const sql = `
            INSERT INTO adoption_applications (
                pet_id, user_id, applicant_name, applicant_phone, applicant_email,
                applicant_address, occupation, housing_type, has_experience,
                has_other_pets, family_agree, reason, commitment, status, create_time, update_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
        `;

        const params = [
            pet_id,
            userId,
            applicant_name,
            applicant_phone,
            applicant_email || null,
            applicant_address || null,
            occupation || null,
            housing_type || null,
            has_experience ? 1 : 0,
            has_other_pets ? 1 : 0,
            family_agree ? 1 : 0,
            reason || null,
            commitmentText
        ];

        const [result] = await db.query(sql, params);

        // 如果用户已登录，记录申请领养行为（用于推荐系统）
        if (userId) {
            try {
                const { recordUserBehavior } = require('./recommendRoutes');
                await recordUserBehavior(userId, parseInt(pet_id), 'apply', 5.0);
                console.log(`[推荐系统] 已记录用户 ${userId} 申请领养宠物 ${pet_id} 的行为`);
            } catch (err) {
                // 记录行为失败不影响申请提交，只记录错误日志
                console.error('[推荐系统] 记录申请行为失败:', err);
            }
        }

        res.status(201).json({
            code: 201,
            message: '领养申请提交成功，我们会在24-48小时内与您联系',
            data: {
                id: result.insertId
            }
        });
    } catch (err) {
        next(err);
    }
};

// 获取用户收养记录
const getUserAdoptions = async (req, res, next) => {
    try {
        const userId = req.user.id; // 从JWT中获取用户ID
        const { page = 1, limit = 10 } = req.query;
        
        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(limit, 10) || 10;
        const offset = (parsedPage - 1) * parsedLimit;

        // 查询用户的领养申请，包含更多宠物和审核信息
        const sql = `
            SELECT 
                a.*,
                p.pet_name,
                p.pet_type,
                p.image_url,
                p.age as pet_age,
                p.gender as pet_gender,
                p.breed as pet_breed,
                p.size as pet_size,
                p.color as pet_color,
                p.health_status as pet_health_status,
                p.vaccination as pet_vaccination,
                p.sterilization as pet_sterilization,
                p.rescue_date as pet_rescue_date,
                p.rescue_location as pet_rescue_location,
                u.username as reviewer_name
            FROM adoption_applications a
            LEFT JOIN pet_core_info p ON a.pet_id = p.id
            LEFT JOIN users u ON a.reviewer_id = u.id
            WHERE a.user_id = ?
            ORDER BY a.create_time DESC
            LIMIT ? OFFSET ?
        `;
        const params = [userId, parsedLimit, offset];

        const [results] = await db.query(sql, params);

        // 获取总数
        const [countResult] = await db.query(
            'SELECT COUNT(*) AS total FROM adoption_applications WHERE user_id = ?',
            [userId]
        );
        const total = countResult[0].total;

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

// 获取用户订单记录
const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id; // 从JWT中获取用户ID
        
        if (!userId) {
            return res.status(401).json({
                code: 401,
                message: '用户未登录'
            });
        }

        const { page = 1, limit = 10, size = 10, status = '' } = req.query;
        
        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(limit || size, 10) || 10;
        const offset = (parsedPage - 1) * parsedLimit;

        // 构建SQL查询，支持状态筛选
        let orderSql = `
            SELECT o.*
            FROM orders o
            WHERE o.user_id = ?
        `;
        const sqlParams = [userId];
        
        // 如果指定了状态，添加状态过滤条件
        if (status && status !== 'all') {
            orderSql += ' AND o.status = ?';
            sqlParams.push(status);
        }
        
        orderSql += ' ORDER BY o.create_time DESC LIMIT ? OFFSET ?';
        sqlParams.push(parsedLimit, offset);
        
        const [orders] = await db.query(orderSql, sqlParams);
        
        // 如果没有订单，直接返回空数组
        if (!orders || orders.length === 0) {
            return res.json({
                code: 200,
                data: [],
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total: 0,
                    totalPages: 0
                }
            });
        }

        // 为每个订单获取订单项
        const ordersWithItems = [];
        for (const order of orders) {
            try {
                const [items] = await db.query(
                    `SELECT 
                        id,
                        product_id,
                        product_name,
                        product_image,
                        price,
                        quantity,
                        subtotal
                     FROM order_items 
                     WHERE order_id = ?`,
                    [order.id]
                );
                ordersWithItems.push({
                    ...order,
                    items: Array.isArray(items) ? items : []
                });
            } catch (itemError) {
                console.error(`Error fetching items for order ${order.id}:`, itemError);
                ordersWithItems.push({
                    ...order,
                    items: []
                });
            }
        }

        // 获取总数（也需要考虑状态筛选）
        let countSql = 'SELECT COUNT(*) AS total FROM orders WHERE user_id = ?';
        const countParams = [userId];
        
        if (status && status !== 'all') {
            countSql += ' AND status = ?';
            countParams.push(status);
        }
        
        const [countResult] = await db.query(countSql, countParams);
        const total = countResult[0].total;

        res.json({
            code: 200,
            data: ordersWithItems,
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

// 获取用户志愿者信息
const getUserVolunteerInfo = async (req, res, next) => {
    try {
        const userId = req.user.id; // 从JWT中获取用户ID

        // 查询用户志愿者信息
        const sql = `
            SELECT v.*, u.real_name, u.email, u.phone
            FROM volunteers v
            JOIN users u ON v.user_id = u.id
            WHERE v.user_id = ?
        `;
        const [results] = await db.query(sql, [userId]);

        // 检查用户是否为志愿者
        if (results.length === 0) {
            return res.json({
                code: 200,
                data: null,
                message: '您还未成为志愿者'
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

// 申请成为志愿者
const applyVolunteer = async (req, res, next) => {
    try {
        const userId = req.user.id; // 从JWT中获取用户ID（需要登录）
        const { 
            name, age, gender, phone, email, address,
            roles, availableTime, workDays,
            background, experience, skills,
            allergies, health,
            motivation, expectation
        } = req.body;

        // 调试日志：查看接收到的数据
        console.log('接收到的志愿者申请数据:', JSON.stringify(req.body, null, 2));
        console.log('字段值检查:', {
            name: name,
            phone: phone,
            email: email,
            address: address,
            nameType: typeof name,
            phoneType: typeof phone,
            emailType: typeof email,
            addressType: typeof address,
            nameTruthy: !!name,
            phoneTruthy: !!phone,
            emailTruthy: !!email,
            addressTruthy: !!address
        });

        // 参数验证（使用 trim() 去除空格，并检查是否为空字符串）
        const missingFields = [];
        
        if (!name || typeof name !== 'string' || name.trim() === '') {
            missingFields.push('姓名');
        }
        if (!phone || typeof phone !== 'string' || phone.trim() === '') {
            missingFields.push('手机号码');
        }
        if (!email || typeof email !== 'string' || email.trim() === '') {
            missingFields.push('邮箱地址');
        }
        if (!address || typeof address !== 'string' || address.trim() === '') {
            missingFields.push('地址');
        }
        
        if (missingFields.length > 0) {
            console.log('缺少的字段:', missingFields);
            return res.status(400).json({
                code: 400,
                message: `请填写所有必填项：${missingFields.join('、')}`
            });
        }

        // 如果用户已登录，检查是否已经是志愿者
        if (userId) {
            const [existingVolunteer] = await db.query(
                'SELECT id FROM volunteers WHERE user_id = ?',
                [userId]
            );
            
            if (existingVolunteer.length > 0) {
                return res.status(400).json({
                    code: 400,
                    message: '您已经是志愿者了'
                });
            }
        }

        // 处理 roles 数组，转换为字符串
        const rolesStr = Array.isArray(roles) ? roles.join(',') : (roles || '');
        
        // 处理 workDays 数组，转换为字符串
        const workDaysStr = Array.isArray(workDays) ? workDays.join(',') : (workDays || '');

        // 构建可用时间字符串（包含可用时间和工作日偏好）
        let availableTimeStr = availableTime || '';
        if (workDaysStr) {
            availableTimeStr = workDaysStr ? `${availableTimeStr} (${workDaysStr})` : availableTimeStr;
        }

        // 构建经验描述（包含背景、经验、技能）
        let experienceStr = experience || '';
        if (background) {
            experienceStr = `背景：${background}\n${experienceStr}`;
        }
        if (skills) {
            experienceStr = `${experienceStr}\n技能：${skills}`;
        }

        // 构建申请理由（包含动机和期望）
        let reasonStr = motivation || '';
        if (expectation) {
            reasonStr = `${reasonStr}\n期望：${expectation}`;
        }
        if (allergies) {
            reasonStr = `${reasonStr}\n过敏情况：${allergies}`;
        }
        if (health) {
            reasonStr = `${reasonStr}\n健康状况：${health}`;
        }

        // 创建志愿者申请记录（包含user_id）
        const applicationSql = `
            INSERT INTO volunteer_applications (
                user_id, name, age, gender, phone, email, address,
                occupation, education, roles, available_time,
                experience, reason, status, create_time, update_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
        `;
        
        const applicationParams = [
            userId || null,
            name,
            age || null,
            gender || null,
            phone,
            email,
            address,
            background || null, // 使用 background 作为 occupation
            null, // education 暂时为空
            rolesStr,
            availableTimeStr,
            experienceStr,
            reasonStr
        ];
        
        await db.query(applicationSql, applicationParams);

        // 同时创建志愿者记录（待审核状态）
        const volunteerSql = `
            INSERT INTO volunteers (user_id, level, service_hours, activity_count, join_date, skills, available_time, certification, status, create_time, update_time)
            VALUES (?, 'junior', 0, 0, CURDATE(), ?, ?, NULL, 'inactive', NOW(), NOW())
        `;
        const volunteerParams = [
            userId,
            skills || '',
            availableTimeStr
        ];
        await db.query(volunteerSql, volunteerParams);

        // 注意：不直接更新用户角色为志愿者，等管理员审核通过后再更新角色

        res.status(201).json({
            code: 201,
            message: '志愿者申请提交成功，请等待审核'
        });
    } catch (err) {
        next(err);
    }
};

// 获取所有志愿者申请列表
const getVolunteerApplications = async (req, res, next) => {
    try {
        const { page = 1, size = 10, status, keyword } = req.query;
        const offset = (page - 1) * size;
        
        let sql = `
            SELECT va.*, u.username, u.avatar
            FROM volunteer_applications va
            LEFT JOIN users u ON va.phone = u.phone OR va.email = u.email
            WHERE 1=1
        `;
        const params = [];
        
        if (status) {
            sql += ' AND va.status = ?';
            params.push(status);
        }
        
        if (keyword) {
            sql += ' AND (va.name LIKE ? OR va.phone LIKE ? OR va.email LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        }
        
        // 获取总数
        const countSql = sql.replace('SELECT va.*, u.username, u.avatar', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countSql, params);
        const total = countResult[0].total;
        
        // 添加排序和分页
        sql += ' ORDER BY va.create_time DESC LIMIT ? OFFSET ?';
        params.push(parseInt(size), parseInt(offset));
        
        const [applications] = await db.query(sql, params);
        
        res.json({
            code: 200,
            data: applications,
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total
            }
        });
    } catch (err) {
        next(err);
    }
};

// 获取志愿者申请统计
const getVolunteerApplicationStats = async (req, res, next) => {
    try {
        const [result] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM volunteer_applications
        `);
        
        res.json({
            code: 200,
            data: result[0]
        });
    } catch (err) {
        next(err);
    }
};

// 获取志愿者申请详情
const getVolunteerApplicationDetail = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const [applications] = await db.query(`
            SELECT va.*, u.id as user_id, u.username, u.avatar
            FROM volunteer_applications va
            LEFT JOIN users u ON va.phone = u.phone OR va.email = u.email
            WHERE va.id = ?
        `, [id]);
        
        if (applications.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '申请不存在'
            });
        }
        
        res.json({
            code: 200,
            data: applications[0]
        });
    } catch (err) {
        next(err);
    }
};

// 审批志愿者申请
const updateVolunteerApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, review_comment } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                code: 400,
                message: '无效的状态值'
            });
        }
        
        // 获取申请信息
        const [applications] = await db.query(
            'SELECT * FROM volunteer_applications WHERE id = ?',
            [id]
        );
        
        if (applications.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '申请不存在'
            });
        }
        
        const application = applications[0];
        
        // 更新申请状态
        await db.query(
            `UPDATE volunteer_applications 
             SET status = ?, review_comment = ?, review_time = NOW(), update_time = NOW() 
             WHERE id = ?`,
            [status, review_comment || null, id]
        );
        
        // 如果审批通过，更新用户角色和志愿者状态
        if (status === 'approved') {
            let userId = application.user_id;
            
            // 如果没有user_id，尝试通过phone或email匹配
            if (!userId) {
                const [users] = await db.query(
                    'SELECT id FROM users WHERE phone = ? OR email = ?',
                    [application.phone, application.email]
                );
                if (users.length > 0) {
                    userId = users[0].id;
                }
            }
            
            if (userId) {
                // 更新用户角色为志愿者
                await db.query(
                    'UPDATE users SET role = ?, update_time = NOW() WHERE id = ?',
                    ['volunteer', userId]
                );
                
                // 检查志愿者记录是否存在，不存在则创建
                const [existingVolunteer] = await db.query(
                    'SELECT id FROM volunteers WHERE user_id = ?',
                    [userId]
                );
                
                if (existingVolunteer.length > 0) {
                    // 更新志愿者状态为活跃
                    await db.query(
                        'UPDATE volunteers SET status = ?, update_time = NOW() WHERE user_id = ?',
                        ['active', userId]
                    );
                } else {
                    // 创建志愿者记录
                    await db.query(
                        `INSERT INTO volunteers (user_id, level, service_hours, activity_count, join_date, status, create_time, update_time)
                         VALUES (?, 'junior', 0, 0, CURDATE(), 'active', NOW(), NOW())`,
                        [userId]
                    );
                }
            }
        }
        
        res.json({
            code: 200,
            message: status === 'approved' ? '申请已通过' : '申请已拒绝'
        });
    } catch (err) {
        next(err);
    }
};

// 管理员重置用户密码
const adminResetPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                code: 400,
                message: '密码长度不能少于6位'
            });
        }
        
        // 检查用户是否存在
        const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }
        
        // 加密新密码
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // 更新密码
        await db.query(
            'UPDATE users SET password = ?, update_time = NOW() WHERE id = ?',
            [hashedPassword, id]
        );
        
        res.json({
            code: 200,
            message: '密码重置成功'
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { 
    getAllUsers, 
    getUserDetail, 
    createUser,
    createAdoptionApplication, 
    updateUser, 
    deleteUser, 
    register, 
    login, 
    updateProfile,
    changePassword,
    getUserAdoptions,
    getUserVolunteerInfo,
    applyVolunteer,
    getUserOrders,
    getVolunteerApplications,
    getVolunteerApplicationStats,
    getVolunteerApplicationDetail,
    updateVolunteerApplicationStatus,
    adminResetPassword
};
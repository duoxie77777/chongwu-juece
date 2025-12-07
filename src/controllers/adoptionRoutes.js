const { db } = require('../config/database');

// 获取所有领养申请（管理员）
const getAllAdoptionApplications = async (req, res, next) => {
    try {
        const { keyword = '', status = '', page = 1, size = 10, startDate = '', endDate = '' } = req.query;

        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(size, 10) || 10;
        const offset = (parsedPage - 1) * parsedLimit;

        let sql = `
            SELECT 
                a.*,
                p.pet_name,
                p.pet_type,
                p.image_url,
                u.username,
                u.email as user_email
            FROM adoption_applications a
            LEFT JOIN pet_core_info p ON a.pet_id = p.id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        // 关键词搜索（申请者姓名、宠物名称）
        if (keyword) {
            sql += ' AND (a.applicant_name LIKE ? OR p.pet_name LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        // 状态过滤
        if (status) {
            sql += ' AND a.status = ?';
            params.push(status);
        }

        // 日期范围过滤
        if (startDate) {
            sql += ' AND DATE(a.create_time) >= ?';
            params.push(startDate);
        }
        if (endDate) {
            sql += ' AND DATE(a.create_time) <= ?';
            params.push(endDate);
        }

        // 获取总数
        const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) AS total FROM');
        const [countResult] = await db.query(countSql, params);
        const total = countResult[0].total;

        // 排序和分页
        sql += ' ORDER BY a.create_time DESC LIMIT ? OFFSET ?';
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

// 获取申请详情
const getAdoptionApplicationDetail = async (req, res, next) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT 
                a.*,
                p.pet_name,
                p.pet_type,
                p.image_url,
                p.age as pet_age,
                p.gender as pet_gender,
                p.breed as pet_breed,
                u.username,
                u.email as user_email
            FROM adoption_applications a
            LEFT JOIN pet_core_info p ON a.pet_id = p.id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.id = ?
        `;

        const [results] = await db.query(sql, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '申请不存在'
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

// 更新申请状态（审核通过/拒绝）
const updateAdoptionApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, review_comment } = req.body;
        const reviewerId = req.user ? req.user.id : null;

        // 验证状态
        const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                code: 400,
                message: `状态必须是以下之一: ${validStatuses.join(', ')}`
            });
        }

        // 检查申请是否存在
        const [checkResult] = await db.query(
            'SELECT id, status, pet_id FROM adoption_applications WHERE id = ?',
            [id]
        );

        if (checkResult.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '申请不存在'
            });
        }

        const application = checkResult[0];

        // 如果审核通过，更新宠物状态为已预订
        if (status === 'approved' && application.status === 'pending') {
            await db.query(
                'UPDATE pet_core_info SET status = "reserved" WHERE id = ?',
                [application.pet_id]
            );
        }

        // 如果拒绝或取消，且之前是已预订，将宠物状态改回可领养
        if ((status === 'rejected' || status === 'cancelled') && application.status === 'approved') {
            await db.query(
                'UPDATE pet_core_info SET status = "available" WHERE id = ?',
                [application.pet_id]
            );
        }

        // 更新申请状态
        const updateSql = `
            UPDATE adoption_applications 
            SET status = ?,
                reviewer_id = ?,
                review_time = NOW(),
                review_comment = ?,
                update_time = NOW()
            WHERE id = ?
        `;

        await db.query(updateSql, [
            status,
            reviewerId,
            review_comment || null,
            id
        ]);

        res.json({
            code: 200,
            message: status === 'approved' ? '申请已通过' : status === 'rejected' ? '申请已拒绝' : '状态已更新',
            data: { id: parseInt(id), status }
        });
    } catch (err) {
        next(err);
    }
};

// 获取申请统计
const getAdoptionApplicationStats = async (req, res, next) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
            FROM adoption_applications
        `);

        res.json({
            code: 200,
            data: {
                total: stats[0].total || 0,
                pending: stats[0].pending || 0,
                approved: stats[0].approved || 0,
                rejected: stats[0].rejected || 0,
                cancelled: stats[0].cancelled || 0
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllAdoptionApplications,
    getAdoptionApplicationDetail,
    updateAdoptionApplicationStatus,
    getAdoptionApplicationStats
};




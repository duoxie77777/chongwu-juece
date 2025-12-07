const { db } = require('../config/database');

// 创建捐赠记录
const createDonation = async (req, res, next) => {
    try {
        const {
            donation_type,
            amount,
            goods_name,
            goods_quantity,
            goods_description,
            donor_name,
            donor_phone,
            donor_email,
            payment_method,
            is_anonymous,
            message,
            location,
            delivery_method
        } = req.body;

        const userId = req.user ? req.user.id : null;

        // 验证必填字段
        if (!donation_type || !['monetary', 'goods'].includes(donation_type)) {
            return res.status(400).json({
                code: 400,
                message: '捐赠类型必须是 monetary（金钱）或 goods（物资）'
            });
        }

        // 金钱捐赠验证
        if (donation_type === 'monetary') {
            if (!amount || amount <= 0) {
                return res.status(400).json({
                    code: 400,
                    message: '请输入有效的捐赠金额'
                });
            }
            if (!donor_name) {
                return res.status(400).json({
                    code: 400,
                    message: '请输入捐赠名义'
                });
            }
        }

        // 物资捐赠验证
        if (donation_type === 'goods') {
            if (!goods_name && !goods_description) {
                return res.status(400).json({
                    code: 400,
                    message: '请填写物资名称或描述'
                });
            }
            if (!donor_name || !donor_phone) {
                return res.status(400).json({
                    code: 400,
                    message: '请填写捐赠人姓名和联系电话'
                });
            }
        }

        // 生成捐赠编号
        const donationNo = 'DON' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

        // 插入捐赠记录
        const sql = `
            INSERT INTO donations (
                donation_no, user_id, donor_name, donor_phone, donor_email,
                donation_type, amount, goods_name, goods_quantity, goods_description,
                payment_method, is_anonymous, message, status, create_time, update_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW(), NOW())
        `;

        const params = [
            donationNo,
            userId,
            donor_name,
            donor_phone || null,
            donor_email || null,
            donation_type,
            donation_type === 'monetary' ? amount : null,
            donation_type === 'goods' ? goods_name : null,
            donation_type === 'goods' ? goods_quantity : null,
            donation_type === 'goods' ? goods_description : null,
            payment_method || null,
            is_anonymous ? 1 : 0,
            message || null
        ];

        const [result] = await db.query(sql, params);

        // 获取创建的捐赠记录
        const [donation] = await db.query(
            'SELECT * FROM donations WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            code: 201,
            message: donation_type === 'monetary' ? '金钱捐赠成功' : '物资捐赠信息已提交',
            data: donation[0]
        });
    } catch (err) {
        next(err);
    }
};

// 获取捐赠列表（用户自己的）
const getUserDonations = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        const { page = 1, size = 10, donation_type = '' } = req.query;

        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(size, 10) || 10;
        const offset = (parsedPage - 1) * parsedLimit;

        let sql = 'SELECT * FROM donations WHERE 1=1';
        const params = [];

        if (userId) {
            sql += ' AND user_id = ?';
            params.push(userId);
        }

        if (donation_type && donation_type !== 'all') {
            sql += ' AND donation_type = ?';
            params.push(donation_type);
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

// 获取捐赠统计
const getDonationStats = async (req, res, next) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) AS total_donations,
                SUM(CASE WHEN donation_type = 'monetary' THEN amount ELSE 0 END) AS total_amount,
                SUM(CASE WHEN donation_type = 'monetary' THEN 1 ELSE 0 END) AS monetary_count,
                SUM(CASE WHEN donation_type = 'goods' THEN 1 ELSE 0 END) AS goods_count
            FROM donations
            WHERE status = 'completed'
        `);

        res.json({
            code: 200,
            data: {
                totalDonations: stats[0].total_donations || 0,
                totalAmount: parseFloat(stats[0].total_amount || 0).toFixed(2),
                monetaryCount: stats[0].monetary_count || 0,
                goodsCount: stats[0].goods_count || 0
            }
        });
    } catch (err) {
        next(err);
    }
};

// 获取捐赠排行榜
const getDonationRanking = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const parsedLimit = parseInt(limit, 10) || 10;

        const [results] = await db.query(`
            SELECT 
                donor_name,
                SUM(amount) AS total_amount,
                MAX(create_time) AS last_donation_date,
                MAX(is_anonymous) AS is_anonymous
            FROM donations
            WHERE donation_type = 'monetary' 
                AND status = 'completed'
                AND amount IS NOT NULL
            GROUP BY donor_name
            ORDER BY total_amount DESC
            LIMIT ?
        `, [parsedLimit]);

        res.json({
            code: 200,
            data: results.map((item, index) => ({
                rank: index + 1,
                donorName: item.is_anonymous ? '匿名' : item.donor_name,
                totalAmount: parseFloat(item.total_amount || 0),
                lastDonationDate: item.last_donation_date,
                anonymous: item.is_anonymous === 1
            }))
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createDonation,
    getUserDonations,
    getDonationStats,
    getDonationRanking
};



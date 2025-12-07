/**
 * 报告生成相关接口
 */
const { db } = require('../config/database');

/**
 * 生成统计报告
 */
const generateReport = async (req, res) => {
    try {
        const { type = 'weekly', startDate, endDate } = req.query;
        
        // 计算日期范围
        let start, end;
        const now = new Date();
        
        switch (type) {
            case 'daily':
                start = new Date(now.setHours(0, 0, 0, 0));
                end = new Date();
                break;
            case 'weekly':
                start = new Date(now.setDate(now.getDate() - 7));
                end = new Date();
                break;
            case 'monthly':
                start = new Date(now.setMonth(now.getMonth() - 1));
                end = new Date();
                break;
            case 'custom':
                start = startDate ? new Date(startDate) : new Date(now.setDate(now.getDate() - 30));
                end = endDate ? new Date(endDate) : new Date();
                break;
            default:
                start = new Date(now.setDate(now.getDate() - 7));
                end = new Date();
        }

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        // 用户统计
        const [userStats] = await db.query(`
            SELECT 
                COUNT(*) as newUsers,
                (SELECT COUNT(*) FROM users WHERE delete_time IS NULL) as totalUsers
            FROM users 
            WHERE create_time BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY) AND delete_time IS NULL
        `, [startStr, endStr]);

        // 宠物统计
        const [petStats] = await db.query(`
            SELECT 
                COUNT(*) as newPets,
                (SELECT COUNT(*) FROM pet_core_info WHERE status = 'available' AND delete_time IS NULL) as availablePets,
                (SELECT COUNT(*) FROM pet_core_info WHERE status = 'adopted' AND delete_time IS NULL) as adoptedPets
            FROM pet_core_info 
            WHERE create_time BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY) AND delete_time IS NULL
        `, [startStr, endStr]);

        // 领养申请统计
        const [adoptionStats] = await db.query(`
            SELECT 
                COUNT(*) as totalApplications,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingApplications,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedApplications,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedApplications
            FROM adoption_applications 
            WHERE create_time BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
        `, [startStr, endStr]);

        // 订单统计
        const [orderStats] = await db.query(`
            SELECT 
                COUNT(*) as totalOrders,
                SUM(CASE WHEN status IN ('paid', 'shipped', 'completed') THEN total_amount ELSE 0 END) as totalRevenue,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedOrders,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingOrders
            FROM orders 
            WHERE create_time BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
        `, [startStr, endStr]);

        // 故事统计
        const [storyStats] = await db.query(`
            SELECT 
                COUNT(*) as newStories,
                SUM(views) as totalViews,
                SUM(likes) as totalLikes
            FROM adoption_stories 
            WHERE create_time BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
        `, [startStr, endStr]);

        // 评论统计
        const [commentStats] = await db.query(`
            SELECT COUNT(*) as newComments
            FROM story_comments 
            WHERE create_time BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
        `, [startStr, endStr]);

        // 每日趋势数据
        const [dailyTrend] = await db.query(`
            SELECT 
                dates.date,
                COALESCE(u.count, 0) as newUsers,
                COALESCE(p.count, 0) as newPets,
                COALESCE(a.count, 0) as adoptionApplications,
                COALESCE(o.count, 0) as orders,
                COALESCE(o.amount, 0) as orderAmount
            FROM (
                SELECT DATE_ADD(?, INTERVAL n DAY) as date
                FROM (
                    SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
                    UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
                    UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
                    UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
                    UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24
                    UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29
                    UNION SELECT 30
                ) numbers
                WHERE DATE_ADD(?, INTERVAL n DAY) <= ?
            ) dates
            LEFT JOIN (
                SELECT DATE(create_time) as date, COUNT(*) as count
                FROM users WHERE delete_time IS NULL
                GROUP BY DATE(create_time)
            ) u ON dates.date = u.date
            LEFT JOIN (
                SELECT DATE(create_time) as date, COUNT(*) as count
                FROM pet_core_info WHERE delete_time IS NULL
                GROUP BY DATE(create_time)
            ) p ON dates.date = p.date
            LEFT JOIN (
                SELECT DATE(create_time) as date, COUNT(*) as count
                FROM adoption_applications
                GROUP BY DATE(create_time)
            ) a ON dates.date = a.date
            LEFT JOIN (
                SELECT DATE(create_time) as date, COUNT(*) as count, SUM(total_amount) as amount
                FROM orders
                GROUP BY DATE(create_time)
            ) o ON dates.date = o.date
            ORDER BY dates.date ASC
        `, [startStr, startStr, endStr]);

        // 计算领养成功率
        const adoptionSuccessRate = adoptionStats[0].totalApplications > 0 
            ? ((adoptionStats[0].approvedApplications / adoptionStats[0].totalApplications) * 100).toFixed(1)
            : 0;

        res.json({
            code: 200,
            message: '报告生成成功',
            data: {
                reportType: type,
                dateRange: {
                    start: startStr,
                    end: endStr
                },
                summary: {
                    users: {
                        new: userStats[0].newUsers || 0,
                        total: userStats[0].totalUsers || 0
                    },
                    pets: {
                        new: petStats[0].newPets || 0,
                        available: petStats[0].availablePets || 0,
                        adopted: petStats[0].adoptedPets || 0
                    },
                    adoptions: {
                        total: adoptionStats[0].totalApplications || 0,
                        pending: adoptionStats[0].pendingApplications || 0,
                        approved: adoptionStats[0].approvedApplications || 0,
                        rejected: adoptionStats[0].rejectedApplications || 0,
                        successRate: adoptionSuccessRate
                    },
                    orders: {
                        total: orderStats[0].totalOrders || 0,
                        completed: orderStats[0].completedOrders || 0,
                        pending: orderStats[0].pendingOrders || 0,
                        revenue: orderStats[0].totalRevenue || 0
                    },
                    content: {
                        newStories: storyStats[0].newStories || 0,
                        storyViews: storyStats[0].totalViews || 0,
                        storyLikes: storyStats[0].totalLikes || 0,
                        newComments: commentStats[0].newComments || 0
                    }
                },
                dailyTrend,
                generatedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('生成报告失败:', error);
        res.status(500).json({
            code: 500,
            message: '生成报告失败',
            error: error.message
        });
    }
};

/**
 * 导出报告数据
 */
const exportReport = async (req, res) => {
    try {
        const { format = 'json', startDate, endDate, days = 30 } = req.query;
        
        // 计算日期范围
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
        
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        // 获取每日详细数据
        const [dailyData] = await db.query(`
            SELECT 
                dates.date,
                COALESCE(u.new_users, 0) as newUsers,
                COALESCE(a.applications, 0) as adoptionApplications,
                COALESCE(a.approved, 0) as approvedAdoptions,
                COALESCE(o.orders, 0) as orders,
                COALESCE(o.amount, 0) as orderAmount,
                COALESCE(p.new_pets, 0) as newPets,
                COALESCE(c.comments, 0) as comments
            FROM (
                SELECT DATE_ADD(?, INTERVAL n DAY) as date
                FROM (
                    SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
                    UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
                    UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
                    UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
                    UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24
                    UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29
                    UNION SELECT 30 UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34
                    UNION SELECT 35 UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39
                    UNION SELECT 40 UNION SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44
                    UNION SELECT 45 UNION SELECT 46 UNION SELECT 47 UNION SELECT 48 UNION SELECT 49
                    UNION SELECT 50 UNION SELECT 51 UNION SELECT 52 UNION SELECT 53 UNION SELECT 54
                    UNION SELECT 55 UNION SELECT 56 UNION SELECT 57 UNION SELECT 58 UNION SELECT 59
                    UNION SELECT 60 UNION SELECT 61 UNION SELECT 62 UNION SELECT 63 UNION SELECT 64
                    UNION SELECT 65 UNION SELECT 66 UNION SELECT 67 UNION SELECT 68 UNION SELECT 69
                    UNION SELECT 70 UNION SELECT 71 UNION SELECT 72 UNION SELECT 73 UNION SELECT 74
                    UNION SELECT 75 UNION SELECT 76 UNION SELECT 77 UNION SELECT 78 UNION SELECT 79
                    UNION SELECT 80 UNION SELECT 81 UNION SELECT 82 UNION SELECT 83 UNION SELECT 84
                    UNION SELECT 85 UNION SELECT 86 UNION SELECT 87 UNION SELECT 88 UNION SELECT 89
                    UNION SELECT 90
                ) numbers
                WHERE DATE_ADD(?, INTERVAL n DAY) <= ?
            ) dates
            LEFT JOIN (
                SELECT DATE(create_time) as date, COUNT(*) as new_users
                FROM users WHERE delete_time IS NULL
                GROUP BY DATE(create_time)
            ) u ON dates.date = u.date
            LEFT JOIN (
                SELECT DATE(create_time) as date, 
                       COUNT(*) as applications,
                       SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved
                FROM adoption_applications
                GROUP BY DATE(create_time)
            ) a ON dates.date = a.date
            LEFT JOIN (
                SELECT DATE(create_time) as date, COUNT(*) as orders, SUM(total_amount) as amount
                FROM orders
                GROUP BY DATE(create_time)
            ) o ON dates.date = o.date
            LEFT JOIN (
                SELECT DATE(create_time) as date, COUNT(*) as new_pets
                FROM pet_core_info WHERE delete_time IS NULL
                GROUP BY DATE(create_time)
            ) p ON dates.date = p.date
            LEFT JOIN (
                SELECT DATE(create_time) as date, COUNT(*) as comments
                FROM story_comments
                GROUP BY DATE(create_time)
            ) c ON dates.date = c.date
            ORDER BY dates.date ASC
        `, [startStr, startStr, endStr]);

        if (format === 'csv') {
            // 生成CSV格式
            const headers = ['日期', '新增用户', '新增宠物', '领养申请', '通过申请', '订单数', '订单金额', '评论数'];
            const csvRows = [headers.join(',')];
            
            dailyData.forEach(row => {
                const values = [
                    row.date,
                    row.newUsers,
                    row.newPets,
                    row.adoptionApplications,
                    row.approvedAdoptions,
                    row.orders,
                    row.orderAmount,
                    row.comments
                ];
                csvRows.push(values.join(','));
            });
            
            const csvContent = csvRows.join('\n');
            
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=report_${startStr}_${endStr}.csv`);
            res.send('\uFEFF' + csvContent); // 添加BOM以支持中文
        } else {
            // JSON格式
            res.json({
                code: 200,
                message: '导出成功',
                data: {
                    dateRange: {
                        start: startStr,
                        end: endStr
                    },
                    records: dailyData,
                    exportedAt: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        console.error('导出报告失败:', error);
        res.status(500).json({
            code: 500,
            message: '导出报告失败',
            error: error.message
        });
    }
};

/**
 * 获取报告列表
 */
const getReportList = async (req, res) => {
    try {
        const { type, status, keyword, page = 1, size = 10 } = req.query;
        const offset = (page - 1) * size;
        
        let sql = 'SELECT * FROM reports WHERE 1=1';
        const params = [];
        
        if (type) {
            sql += ' AND type = ?';
            params.push(type);
        }
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }
        if (keyword) {
            sql += ' AND title LIKE ?';
            params.push(`%${keyword}%`);
        }
        
        // 获取总数
        const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countSql, params);
        const total = countResult[0].total;
        
        // 分页查询
        sql += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
        params.push(parseInt(size), offset);
        
        const [reports] = await db.query(sql, params);
        
        res.json({
            code: 200,
            message: '获取成功',
            data: {
                list: reports.map(r => ({
                    id: r.id,
                    title: r.title,
                    type: r.type,
                    description: r.description,
                    startDate: r.start_date,
                    endDate: r.end_date,
                    sections: r.sections ? JSON.parse(r.sections) : [],
                    status: r.status,
                    createdBy: r.created_by_name || '管理员',
                    createdAt: r.create_time
                })),
                total,
                page: parseInt(page),
                size: parseInt(size)
            }
        });
    } catch (error) {
        console.error('获取报告列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取报告列表失败',
            error: error.message
        });
    }
};

/**
 * 获取报告详情
 */
const getReportDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [reports] = await db.query('SELECT * FROM reports WHERE id = ?', [id]);
        
        if (reports.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '报告不存在'
            });
        }
        
        const report = reports[0];
        
        res.json({
            code: 200,
            message: '获取成功',
            data: {
                id: report.id,
                title: report.title,
                type: report.type,
                description: report.description,
                startDate: report.start_date,
                endDate: report.end_date,
                sections: report.sections ? JSON.parse(report.sections) : [],
                reportData: report.report_data ? JSON.parse(report.report_data) : null,
                status: report.status,
                createdBy: report.created_by_name || '管理员',
                createdAt: report.create_time
            }
        });
    } catch (error) {
        console.error('获取报告详情失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取报告详情失败',
            error: error.message
        });
    }
};

/**
 * 创建报告
 */
const createReport = async (req, res) => {
    try {
        const { title, type, description, startDate, endDate, sections } = req.body;
        const userId = req.user?.id || null;
        const userName = req.user?.username || '管理员';
        
        // 生成报告数据
        const startStr = startDate;
        const endStr = endDate;
        
        // 用户统计
        const [userStats] = await db.query(`
            SELECT 
                COUNT(*) as newUsers,
                (SELECT COUNT(*) FROM users WHERE delete_time IS NULL) as totalUsers
            FROM users 
            WHERE create_time BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY) AND delete_time IS NULL
        `, [startStr, endStr]);

        // 宠物统计
        const [petStats] = await db.query(`
            SELECT 
                COUNT(*) as newPets,
                (SELECT COUNT(*) FROM pet_core_info WHERE status = 'available' AND delete_time IS NULL) as availablePets,
                (SELECT COUNT(*) FROM pet_core_info WHERE status = 'adopted' AND delete_time IS NULL) as adoptedPets
            FROM pet_core_info 
            WHERE create_time BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY) AND delete_time IS NULL
        `, [startStr, endStr]);

        // 领养申请统计
        const [adoptionStats] = await db.query(`
            SELECT 
                COUNT(*) as totalApplications,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedApplications
            FROM adoption_applications 
            WHERE create_time BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
        `, [startStr, endStr]);

        // 订单统计
        const [orderStats] = await db.query(`
            SELECT 
                COUNT(*) as totalOrders,
                SUM(CASE WHEN status IN ('paid', 'shipped', 'completed') THEN total_amount ELSE 0 END) as totalRevenue
            FROM orders 
            WHERE create_time BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
        `, [startStr, endStr]);

        const reportData = {
            summary: {
                users: {
                    new: userStats[0].newUsers || 0,
                    total: userStats[0].totalUsers || 0
                },
                pets: {
                    new: petStats[0].newPets || 0,
                    available: petStats[0].availablePets || 0,
                    adopted: petStats[0].adoptedPets || 0
                },
                adoptions: {
                    total: adoptionStats[0].totalApplications || 0,
                    approved: adoptionStats[0].approvedApplications || 0
                },
                orders: {
                    total: orderStats[0].totalOrders || 0,
                    revenue: orderStats[0].totalRevenue || 0
                }
            },
            generatedAt: new Date().toISOString()
        };
        
        const [result] = await db.query(
            `INSERT INTO reports (title, type, description, start_date, end_date, sections, report_data, status, created_by, created_by_name) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
            [title, type, description, startDate, endDate, JSON.stringify(sections), JSON.stringify(reportData), userId, userName]
        );
        
        res.json({
            code: 200,
            message: '报告创建成功',
            data: {
                id: result.insertId
            }
        });
    } catch (error) {
        console.error('创建报告失败:', error);
        res.status(500).json({
            code: 500,
            message: '创建报告失败',
            error: error.message
        });
    }
};

/**
 * 更新报告
 */
const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, description, startDate, endDate, sections } = req.body;
        
        const [existing] = await db.query('SELECT * FROM reports WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '报告不存在'
            });
        }
        
        await db.query(
            `UPDATE reports SET title = ?, type = ?, description = ?, start_date = ?, end_date = ?, sections = ? WHERE id = ?`,
            [title, type, description, startDate, endDate, JSON.stringify(sections), id]
        );
        
        res.json({
            code: 200,
            message: '报告更新成功'
        });
    } catch (error) {
        console.error('更新报告失败:', error);
        res.status(500).json({
            code: 500,
            message: '更新报告失败',
            error: error.message
        });
    }
};

/**
 * 删除报告
 */
const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [existing] = await db.query('SELECT * FROM reports WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '报告不存在'
            });
        }
        
        await db.query('DELETE FROM reports WHERE id = ?', [id]);
        
        res.json({
            code: 200,
            message: '报告删除成功'
        });
    } catch (error) {
        console.error('删除报告失败:', error);
        res.status(500).json({
            code: 500,
            message: '删除报告失败',
            error: error.message
        });
    }
};

/**
 * 发布报告
 */
const publishReport = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [existing] = await db.query('SELECT * FROM reports WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '报告不存在'
            });
        }
        
        await db.query('UPDATE reports SET status = ? WHERE id = ?', ['published', id]);
        
        res.json({
            code: 200,
            message: '报告发布成功'
        });
    } catch (error) {
        console.error('发布报告失败:', error);
        res.status(500).json({
            code: 500,
            message: '发布报告失败',
            error: error.message
        });
    }
};

/**
 * 归档报告
 */
const archiveReport = async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query('UPDATE reports SET status = ? WHERE id = ?', ['archived', id]);
        
        res.json({
            code: 200,
            message: '报告已归档'
        });
    } catch (error) {
        console.error('归档报告失败:', error);
        res.status(500).json({
            code: 500,
            message: '归档报告失败',
            error: error.message
        });
    }
};

module.exports = {
    generateReport,
    exportReport,
    getReportList,
    getReportDetail,
    createReport,
    updateReport,
    deleteReport,
    publishReport,
    archiveReport
};

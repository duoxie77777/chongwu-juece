/**
 * 统计数据相关接口
 */
const { db } = require('../config/database');

/**
 * 获取数据总览统计
 */
const getOverviewStats = async (req, res) => {
    try {
        // 用户统计
        const [userStats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN DATE(create_time) = CURDATE() THEN 1 ELSE 0 END) as today,
                SUM(CASE WHEN create_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as thisMonth,
                SUM(CASE WHEN create_time >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) AND create_time < DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as lastMonth
            FROM users WHERE delete_time IS NULL
        `)

        // 宠物统计
        const [petStats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN status = 'adopted' THEN 1 ELSE 0 END) as adopted,
                SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
                SUM(CASE WHEN DATE(create_time) = CURDATE() THEN 1 ELSE 0 END) as today,
                SUM(CASE WHEN create_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as thisMonth,
                SUM(CASE WHEN create_time >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) AND create_time < DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as lastMonth
            FROM pet_core_info WHERE delete_time IS NULL
        `)

        // 领养申请统计
        const [adoptionStats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN DATE(create_time) = CURDATE() THEN 1 ELSE 0 END) as today,
                SUM(CASE WHEN create_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as thisMonth,
                SUM(CASE WHEN create_time >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) AND create_time < DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as lastMonth
            FROM adoption_applications
        `)

        // 故事统计
        const [storyStats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as published,
                SUM(views) as totalViews,
                SUM(likes) as totalLikes
            FROM adoption_stories
        `)

        // 评论统计
        const [commentStats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN DATE(create_time) = CURDATE() THEN 1 ELSE 0 END) as today,
                SUM(likes) as totalLikes
            FROM story_comments
        `)

        // 订单统计
        const [orderStats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'paid' OR status = 'shipped' OR status = 'completed' THEN total_amount ELSE 0 END) as totalAmount,
                SUM(CASE WHEN DATE(create_time) = CURDATE() THEN 1 ELSE 0 END) as today,
                SUM(CASE WHEN create_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as thisMonth
            FROM orders
        `)

        // 捐赠统计
        const [donationStats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as totalAmount,
                SUM(CASE WHEN DATE(create_time) = CURDATE() THEN 1 ELSE 0 END) as today
            FROM donations
        `)

        // 志愿者统计
        const [volunteerStats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(service_hours) as totalServiceHours
            FROM volunteers
        `)

        // 计算增长率
        const calcGrowth = (thisMonth, lastMonth) => {
            if (lastMonth === 0) return thisMonth > 0 ? 100 : 0
            return Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
        }

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                users: {
                    total: userStats[0].total || 0,
                    today: userStats[0].today || 0,
                    thisMonth: userStats[0].thisMonth || 0,
                    growth: calcGrowth(userStats[0].thisMonth || 0, userStats[0].lastMonth || 0)
                },
                pets: {
                    total: petStats[0].total || 0,
                    available: petStats[0].available || 0,
                    adopted: petStats[0].adopted || 0,
                    reserved: petStats[0].reserved || 0,
                    today: petStats[0].today || 0,
                    thisMonth: petStats[0].thisMonth || 0,
                    growth: calcGrowth(petStats[0].thisMonth || 0, petStats[0].lastMonth || 0)
                },
                adoptions: {
                    total: adoptionStats[0].total || 0,
                    pending: adoptionStats[0].pending || 0,
                    approved: adoptionStats[0].approved || 0,
                    rejected: adoptionStats[0].rejected || 0,
                    today: adoptionStats[0].today || 0,
                    thisMonth: adoptionStats[0].thisMonth || 0,
                    growth: calcGrowth(adoptionStats[0].thisMonth || 0, adoptionStats[0].lastMonth || 0)
                },
                stories: {
                    total: storyStats[0].total || 0,
                    published: storyStats[0].published || 0,
                    totalViews: storyStats[0].totalViews || 0,
                    totalLikes: storyStats[0].totalLikes || 0
                },
                comments: {
                    total: commentStats[0].total || 0,
                    today: commentStats[0].today || 0,
                    totalLikes: commentStats[0].totalLikes || 0
                },
                orders: {
                    total: orderStats[0].total || 0,
                    pending: orderStats[0].pending || 0,
                    completed: orderStats[0].completed || 0,
                    totalAmount: orderStats[0].totalAmount || 0,
                    today: orderStats[0].today || 0,
                    thisMonth: orderStats[0].thisMonth || 0
                },
                donations: {
                    total: donationStats[0].total || 0,
                    totalAmount: donationStats[0].totalAmount || 0,
                    today: donationStats[0].today || 0
                },
                volunteers: {
                    total: volunteerStats[0].total || 0,
                    active: volunteerStats[0].active || 0,
                    totalServiceHours: volunteerStats[0].totalServiceHours || 0
                }
            }
        })
    } catch (error) {
        console.error('获取统计数据失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取统计数据失败',
            error: error.message
        })
    }
}

/**
 * 获取趋势数据（按日期）
 */
const getTrendData = async (req, res) => {
    try {
        const { days = 30 } = req.query

        // 用户注册趋势
        const [userTrend] = await db.query(`
            SELECT DATE(create_time) as date, COUNT(*) as count
            FROM users 
            WHERE create_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND delete_time IS NULL
            GROUP BY DATE(create_time)
            ORDER BY date
        `, [parseInt(days)])

        // 领养申请趋势
        const [adoptionTrend] = await db.query(`
            SELECT DATE(create_time) as date, COUNT(*) as count,
                   SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved
            FROM adoption_applications 
            WHERE create_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(create_time)
            ORDER BY date
        `, [parseInt(days)])

        // 宠物入库趋势
        const [petTrend] = await db.query(`
            SELECT DATE(create_time) as date, COUNT(*) as count
            FROM pet_core_info 
            WHERE create_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND delete_time IS NULL
            GROUP BY DATE(create_time)
            ORDER BY date
        `, [parseInt(days)])

        // 订单趋势
        const [orderTrend] = await db.query(`
            SELECT DATE(create_time) as date, COUNT(*) as count, SUM(total_amount) as amount
            FROM orders 
            WHERE create_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(create_time)
            ORDER BY date
        `, [parseInt(days)])

        // 故事浏览趋势（按故事发布日期）
        const [storyTrend] = await db.query(`
            SELECT DATE(create_time) as date, COUNT(*) as count, SUM(views) as views
            FROM adoption_stories 
            WHERE create_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(create_time)
            ORDER BY date
        `, [parseInt(days)])

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                userTrend,
                adoptionTrend,
                petTrend,
                orderTrend,
                storyTrend
            }
        })
    } catch (error) {
        console.error('获取趋势数据失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取趋势数据失败',
            error: error.message
        })
    }
}

/**
 * 获取分类统计数据
 */
const getCategoryStats = async (req, res) => {
    try {
        // 宠物类型分布
        const [petTypeStats] = await db.query(`
            SELECT pet_type, COUNT(*) as count
            FROM pet_core_info 
            WHERE delete_time IS NULL
            GROUP BY pet_type
        `)

        // 宠物分类分布
        const [petCategoryStats] = await db.query(`
            SELECT c.name, COUNT(p.id) as count
            FROM pet_categories c
            LEFT JOIN pet_core_info p ON c.id = p.category_id AND p.delete_time IS NULL
            WHERE c.status = 1
            GROUP BY c.id, c.name
        `)

        // 商品分类分布
        const [productCategoryStats] = await db.query(`
            SELECT c.name, COUNT(p.id) as count, SUM(p.sales_count) as sales
            FROM product_categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.status = 1
            WHERE c.status = 1
            GROUP BY c.id, c.name
        `)

        // 用户角色分布
        const [userRoleStats] = await db.query(`
            SELECT role, COUNT(*) as count
            FROM users 
            WHERE delete_time IS NULL
            GROUP BY role
        `)

        // 领养申请状态分布
        const [adoptionStatusStats] = await db.query(`
            SELECT status, COUNT(*) as count
            FROM adoption_applications
            GROUP BY status
        `)

        // 订单状态分布
        const [orderStatusStats] = await db.query(`
            SELECT status, COUNT(*) as count
            FROM orders
            GROUP BY status
        `)

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                petTypeStats,
                petCategoryStats,
                productCategoryStats,
                userRoleStats,
                adoptionStatusStats,
                orderStatusStats
            }
        })
    } catch (error) {
        console.error('获取分类统计失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取分类统计失败',
            error: error.message
        })
    }
}

/**
 * 获取每日统计数据
 */
const getDailyStats = async (req, res) => {
    try {
        const { days = 30 } = req.query

        const [dailyData] = await db.query(`
            SELECT 
                dates.date,
                COALESCE(u.new_users, 0) as newUsers,
                COALESCE(a.applications, 0) as adoptionApplications,
                COALESCE(a.approved, 0) as approvedAdoptions,
                COALESCE(o.orders, 0) as orders,
                COALESCE(o.amount, 0) as orderAmount,
                COALESCE(p.new_pets, 0) as newPets,
                COALESCE(c.comments, 0) as comments,
                COALESCE(s.views, 0) as storyViews
            FROM (
                SELECT DATE_SUB(CURDATE(), INTERVAL n DAY) as date
                FROM (
                    SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
                    UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
                    UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
                    UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
                    UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24
                    UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29
                ) numbers
                WHERE n < ?
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
            LEFT JOIN (
                SELECT DATE(create_time) as date, SUM(views) as views
                FROM adoption_stories
                GROUP BY DATE(create_time)
            ) s ON dates.date = s.date
            ORDER BY dates.date DESC
        `, [parseInt(days)])

        res.json({
            code: 200,
            message: '获取成功',
            data: dailyData
        })
    } catch (error) {
        console.error('获取每日统计失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取每日统计失败',
            error: error.message
        })
    }
}

/**
 * 获取热门数据
 */
const getHotData = async (req, res) => {
    try {
        // 热门宠物（按浏览量）
        const [hotPets] = await db.query(`
            SELECT id, pet_name, pet_type, views, likes, status
            FROM pet_core_info 
            WHERE delete_time IS NULL
            ORDER BY views DESC
            LIMIT 10
        `)

        // 热门故事（按浏览量）
        const [hotStories] = await db.query(`
            SELECT id, title, author, views, likes
            FROM adoption_stories 
            WHERE status = 1
            ORDER BY views DESC
            LIMIT 10
        `)

        // 热销商品
        const [hotProducts] = await db.query(`
            SELECT id, name, price, sales_count, rating
            FROM products 
            WHERE status = 1
            ORDER BY sales_count DESC
            LIMIT 10
        `)

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                hotPets,
                hotStories,
                hotProducts
            }
        })
    } catch (error) {
        console.error('获取热门数据失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取热门数据失败',
            error: error.message
        })
    }
}

/**
 * 获取首页统计数据（简化版）
 */
const getHomepageStats = async (req, res) => {
    try {
        // 成功领养数（已批准的申请）
        const [adoptionStats] = await db.query(`
            SELECT COUNT(*) as approved_count
            FROM adoption_applications
            WHERE status = 'approved'
        `)

        // 志愿工作者数（活跃志愿者）
        const [volunteerStats] = await db.query(`
            SELECT COUNT(*) as active_count
            FROM volunteers
            WHERE status = 'active'
        `)

        // 救助动物数（所有宠物总数）
        const [petStats] = await db.query(`
            SELECT COUNT(*) as total_count
            FROM pet_core_info
            WHERE delete_time IS NULL
        `)

        // 合作机构数（这里暂时返回固定值，如果有机构表可以查询）
        const partnerCount = 28

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                approvedAdoptions: adoptionStats[0].approved_count || 0,
                activeVolunteers: volunteerStats[0].active_count || 0,
                rescuedAnimals: petStats[0].total_count || 0,
                partnerInstitutions: partnerCount
            }
        })
    } catch (error) {
        console.error('获取首页统计失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取首页统计失败',
            error: error.message
        })
    }
}

module.exports = {
    getOverviewStats,
    getTrendData,
    getCategoryStats,
    getDailyStats,
    getHotData,
    getHomepageStats
}

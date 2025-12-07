/**
 * 检查推荐系统数据收集情况
 * 用于调试和验证数据收集是否正常工作
 */
const { db } = require('../config/database');

/**
 * 检查用户行为数据统计
 */
const checkBehaviorData = async (req, res, next) => {
    try {
        // 检查表是否存在
        const [tableCheck] = await db.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
             WHERE table_schema = DATABASE() AND table_name = 'user_behaviors'`
        );

        if (tableCheck[0].count === 0) {
            return res.json({
                code: 404,
                message: '用户行为表不存在，请先执行 sql_user_behaviors.sql 创建表',
                data: {
                    tableExists: false
                }
            });
        }

        // 统计总行为数
        const [totalCount] = await db.query(
            'SELECT COUNT(*) as total FROM user_behaviors'
        );

        // 按行为类型统计
        const [typeStats] = await db.query(
            `SELECT behavior_type, COUNT(*) as count, AVG(behavior_value) as avg_value
             FROM user_behaviors 
             GROUP BY behavior_type`
        );

        // 按用户统计
        const [userStats] = await db.query(
            `SELECT user_id, COUNT(*) as behavior_count
             FROM user_behaviors 
             GROUP BY user_id 
             ORDER BY behavior_count DESC 
             LIMIT 10`
        );

        // 按宠物统计
        const [petStats] = await db.query(
            `SELECT pet_id, COUNT(*) as behavior_count
             FROM user_behaviors 
             GROUP BY pet_id 
             ORDER BY behavior_count DESC 
             LIMIT 10`
        );

        // 最近的行为记录
        const [recentBehaviors] = await db.query(
            `SELECT user_id, pet_id, behavior_type, behavior_value, create_time
             FROM user_behaviors 
             ORDER BY create_time DESC 
             LIMIT 20`
        );

        res.json({
            code: 200,
            message: '数据检查完成',
            data: {
                tableExists: true,
                totalBehaviors: totalCount[0].total,
                typeStatistics: typeStats,
                topUsers: userStats,
                topPets: petStats,
                recentBehaviors: recentBehaviors
            }
        });
    } catch (error) {
        console.error('检查推荐数据失败:', error);
        next(error);
    }
};

module.exports = {
    checkBehaviorData
};


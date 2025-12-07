const { db } = require('../config/database');
const { hybridCF, userBasedCF, itemBasedCF } = require('../utils/collaborativeFilter');

/**
 * 记录用户行为
 * @param {number} userId - 用户ID
 * @param {number} petId - 宠物ID
 * @param {string} behaviorType - 行为类型：view, apply, like, favorite
 * @param {number} behaviorValue - 行为权重值
 */
const recordUserBehavior = async (userId, petId, behaviorType, behaviorValue = null) => {
    try {
        // 根据行为类型设置默认权重
        const defaultValues = {
            'view': 1.0,
            'apply': 5.0,
            'like': 2.0,
            'favorite': 3.0
        };

        const value = behaviorValue || defaultValues[behaviorType] || 1.0;

        // 检查是否已存在相同的行为记录（同一用户对同一宠物的同一行为）
        const [existing] = await db.query(
            `SELECT id FROM user_behaviors 
             WHERE user_id = ? AND pet_id = ? AND behavior_type = ? 
             ORDER BY create_time DESC LIMIT 1`,
            [userId, petId, behaviorType]
        );

        if (existing.length > 0) {
            // 更新现有记录的行为值（取较大值）和时间
            await db.query(
                `UPDATE user_behaviors 
                 SET behavior_value = GREATEST(behavior_value, ?), create_time = NOW() 
                 WHERE id = ?`,
                [value, existing[0].id]
            );
            console.log(`[推荐系统] 更新用户 ${userId} 对宠物 ${petId} 的 ${behaviorType} 行为`);
        } else {
            // 插入新记录
            await db.query(
                `INSERT INTO user_behaviors (user_id, pet_id, behavior_type, behavior_value, create_time) 
                 VALUES (?, ?, ?, ?, NOW())`,
                [userId, petId, behaviorType, value]
            );
            console.log(`[推荐系统] 新增用户 ${userId} 对宠物 ${petId} 的 ${behaviorType} 行为（权重: ${value}）`);
        }
    } catch (error) {
        console.error('记录用户行为失败:', error);
        throw error;
    }
};

/**
 * 获取推荐宠物（混合协同过滤）
 */
const getRecommendedPets = async (req, res, next) => {
    try {
        const userId = req.user?.id; // 从JWT中获取用户ID（可选）
        const { limit = 10, algorithm = 'hybrid' } = req.query;
        const topN = parseInt(limit) || 10;

        // 如果用户未登录，返回热门宠物
        if (!userId) {
            const [hotPets] = await db.query(
                `SELECT * FROM pet_core_info 
                 WHERE delete_time IS NULL AND status = 'available' 
                 ORDER BY views DESC, likes DESC, create_time DESC 
                 LIMIT ?`,
                [topN]
            );

            return res.json({
                code: 200,
                message: '获取推荐成功',
                data: hotPets,
                algorithm: 'popular' // 热门推荐
            });
        }

        // 获取所有用户行为数据
        const [behaviors] = await db.query(
            `SELECT user_id, pet_id, behavior_type, behavior_value, create_time 
             FROM user_behaviors 
             ORDER BY create_time DESC`
        );

        console.log(`[推荐系统] 用户 ${userId} 请求推荐，当前行为数据总数: ${behaviors.length}`);

        if (behaviors.length === 0) {
            // 如果没有行为数据，返回热门宠物
            const [hotPets] = await db.query(
                `SELECT * FROM pet_core_info 
                 WHERE delete_time IS NULL AND status = 'available' 
                 ORDER BY views DESC, likes DESC, create_time DESC 
                 LIMIT ?`,
                [topN]
            );

            return res.json({
                code: 200,
                message: '获取推荐成功',
                data: hotPets,
                algorithm: 'popular'
            });
        }

        // 根据算法类型选择推荐方法
        let recommendedPetIds = [];
        
        console.log(`[推荐系统] 使用算法: ${algorithm}, 目标用户ID: ${userId}`);
        
        switch (algorithm) {
            case 'user':
                recommendedPetIds = userBasedCF(userId, behaviors, topN);
                break;
            case 'item':
                recommendedPetIds = itemBasedCF(userId, behaviors, topN);
                break;
            case 'hybrid':
            default:
                recommendedPetIds = hybridCF(userId, behaviors, topN);
                break;
        }
        
        console.log(`[推荐系统] 算法返回 ${recommendedPetIds.length} 个推荐宠物ID:`, recommendedPetIds);

        // 如果推荐结果不足，用热门宠物补充
        if (recommendedPetIds.length < topN) {
            const [hotPets] = await db.query(
                `SELECT id FROM pet_core_info 
                 WHERE delete_time IS NULL AND status = 'available' 
                 AND id NOT IN (${recommendedPetIds.length > 0 ? recommendedPetIds.join(',') : '0'})
                 ORDER BY views DESC, likes DESC, create_time DESC 
                 LIMIT ?`,
                [topN - recommendedPetIds.length]
            );
            
            recommendedPetIds = recommendedPetIds.concat(hotPets.map(p => p.id));
        }

        // 获取推荐的宠物详细信息
        if (recommendedPetIds.length === 0) {
            return res.json({
                code: 200,
                message: '暂无推荐',
                data: [],
                algorithm: algorithm
            });
        }

        const placeholders = recommendedPetIds.map(() => '?').join(',');
        const [recommendedPets] = await db.query(
            `SELECT * FROM pet_core_info 
             WHERE id IN (${placeholders}) AND delete_time IS NULL AND status = 'available'
             ORDER BY FIELD(id, ${placeholders})`,
            [...recommendedPetIds, ...recommendedPetIds]
        );

        res.json({
            code: 200,
            message: '获取推荐成功',
            data: recommendedPets,
            algorithm: algorithm,
            recommendedIds: recommendedPetIds
        });
    } catch (error) {
        console.error('获取推荐宠物失败:', error);
        next(error);
    }
};

/**
 * 记录用户浏览行为（公开接口，不需要登录）
 */
const recordViewBehavior = async (req, res, next) => {
    try {
        const { petId } = req.params;
        const userId = req.user?.id; // 可选，如果用户已登录

        if (!petId) {
            return res.status(400).json({
                code: 400,
                message: '宠物ID不能为空'
            });
        }

        // 如果用户已登录，记录行为
        if (userId) {
            await recordUserBehavior(userId, parseInt(petId), 'view', 1.0);
        }

        // 更新宠物的浏览量
        await db.query(
            `UPDATE pet_core_info SET views = views + 1 WHERE id = ?`,
            [petId]
        );

        res.json({
            code: 200,
            message: '记录成功'
        });
    } catch (error) {
        console.error('记录浏览行为失败:', error);
        next(error);
    }
};

/**
 * 记录用户申请领养行为（需要登录）
 */
const recordApplyBehavior = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { petId } = req.body;

        if (!petId) {
            return res.status(400).json({
                code: 400,
                message: '宠物ID不能为空'
            });
        }

        await recordUserBehavior(userId, parseInt(petId), 'apply', 5.0);

        res.json({
            code: 200,
            message: '记录成功'
        });
    } catch (error) {
        console.error('记录申请行为失败:', error);
        next(error);
    }
};

/**
 * 记录用户点赞行为（需要登录）
 */
const recordLikeBehavior = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { petId } = req.body;

        if (!petId) {
            return res.status(400).json({
                code: 400,
                message: '宠物ID不能为空'
            });
        }

        await recordUserBehavior(userId, parseInt(petId), 'like', 2.0);

        // 更新宠物的点赞数
        await db.query(
            `UPDATE pet_core_info SET likes = likes + 1 WHERE id = ?`,
            [petId]
        );

        res.json({
            code: 200,
            message: '记录成功'
        });
    } catch (error) {
        console.error('记录点赞行为失败:', error);
        next(error);
    }
};

module.exports = {
    getRecommendedPets,
    recordViewBehavior,
    recordApplyBehavior,
    recordLikeBehavior,
    recordUserBehavior
};


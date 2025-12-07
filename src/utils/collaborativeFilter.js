/**
 * 协同过滤推荐算法
 * 支持基于用户的协同过滤（User-based CF）和基于物品的协同过滤（Item-based CF）
 */

/**
 * 计算两个用户的余弦相似度
 * @param {Object} user1Ratings - 用户1的评分对象 {petId: score, ...}
 * @param {Object} user2Ratings - 用户2的评分对象 {petId: score, ...}
 * @returns {number} 相似度值（0-1之间）
 */
function cosineSimilarity(user1Ratings, user2Ratings) {
    const commonItems = Object.keys(user1Ratings).filter(
        petId => user2Ratings.hasOwnProperty(petId)
    );

    if (commonItems.length === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const petId of commonItems) {
        const score1 = user1Ratings[petId];
        const score2 = user2Ratings[petId];
        dotProduct += score1 * score2;
        norm1 += score1 * score1;
        norm2 += score2 * score2;
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * 计算两个宠物的余弦相似度（基于物品的协同过滤）
 * @param {Object} pet1Ratings - 宠物1的评分对象 {userId: score, ...}
 * @param {Object} pet2Ratings - 宠物2的评分对象 {userId: score, ...}
 * @returns {number} 相似度值（0-1之间）
 */
function itemCosineSimilarity(pet1Ratings, pet2Ratings) {
    const commonUsers = Object.keys(pet1Ratings).filter(
        userId => pet2Ratings.hasOwnProperty(userId)
    );

    if (commonUsers.length === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const userId of commonUsers) {
        const score1 = pet1Ratings[userId];
        const score2 = pet2Ratings[userId];
        dotProduct += score1 * score2;
        norm1 += score1 * score1;
        norm2 += score2 * score2;
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * 基于用户的协同过滤推荐
 * @param {number} targetUserId - 目标用户ID
 * @param {Array} userBehaviors - 所有用户行为数据
 * @param {number} topN - 返回前N个推荐
 * @returns {Array} 推荐的宠物ID数组，按推荐分数降序排列
 */
function userBasedCF(targetUserId, userBehaviors, topN = 10) {
    // 构建用户-宠物评分矩阵
    const userPetMatrix = {};
    
    userBehaviors.forEach(behavior => {
        const userId = behavior.user_id;
        const petId = behavior.pet_id;
        const score = parseFloat(behavior.behavior_value) || 1.0;

        if (!userPetMatrix[userId]) {
            userPetMatrix[userId] = {};
        }
        
        // 如果用户对同一宠物有多个行为，取最大值
        if (!userPetMatrix[userId][petId] || userPetMatrix[userId][petId] < score) {
            userPetMatrix[userId][petId] = score;
        }
    });

    // 获取目标用户的评分
    const targetUserRatings = userPetMatrix[targetUserId] || {};
    
    if (Object.keys(targetUserRatings).length === 0) {
        return []; // 目标用户没有行为数据，无法推荐
    }

    // 计算目标用户与其他用户的相似度
    const userSimilarities = [];
    
    for (const userId in userPetMatrix) {
        if (userId == targetUserId) continue; // 跳过自己
        
        const otherUserRatings = userPetMatrix[userId];
        const similarity = cosineSimilarity(targetUserRatings, otherUserRatings);
        
        if (similarity > 0) {
            userSimilarities.push({
                userId: parseInt(userId),
                similarity: similarity,
                ratings: otherUserRatings
            });
        }
    }

    // 按相似度排序
    userSimilarities.sort((a, b) => b.similarity - a.similarity);

    // 计算推荐分数
    const petScores = {};
    const targetUserPetIds = new Set(Object.keys(targetUserRatings).map(Number));

    // 取前K个相似用户（K=50）
    const topSimilarUsers = userSimilarities.slice(0, 50);

    for (const similarUser of topSimilarUsers) {
        const similarity = similarUser.similarity;
        const ratings = similarUser.ratings;

        for (const petId in ratings) {
            const petIdNum = parseInt(petId);
            
            // 跳过目标用户已经交互过的宠物
            if (targetUserPetIds.has(petIdNum)) continue;

            if (!petScores[petIdNum]) {
                petScores[petIdNum] = {
                    petId: petIdNum,
                    score: 0,
                    count: 0
                };
            }

            // 加权平均：相似度 * 评分
            petScores[petIdNum].score += similarity * ratings[petId];
            petScores[petIdNum].count += 1;
        }
    }

    // 计算平均分数并排序
    const recommendations = Object.values(petScores)
        .map(item => ({
            petId: item.petId,
            score: item.count > 0 ? item.score / item.count : 0
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topN)
        .map(item => item.petId);

    return recommendations;
}

/**
 * 基于物品的协同过滤推荐
 * @param {number} targetUserId - 目标用户ID
 * @param {Array} userBehaviors - 所有用户行为数据
 * @param {number} topN - 返回前N个推荐
 * @returns {Array} 推荐的宠物ID数组，按推荐分数降序排列
 */
function itemBasedCF(targetUserId, userBehaviors, topN = 10) {
    // 构建用户-宠物评分矩阵
    const userPetMatrix = {};
    // 构建宠物-用户评分矩阵
    const petUserMatrix = {};
    
    userBehaviors.forEach(behavior => {
        const userId = behavior.user_id;
        const petId = behavior.pet_id;
        const score = parseFloat(behavior.behavior_value) || 1.0;

        // 用户-宠物矩阵
        if (!userPetMatrix[userId]) {
            userPetMatrix[userId] = {};
        }
        if (!userPetMatrix[userId][petId] || userPetMatrix[userId][petId] < score) {
            userPetMatrix[userId][petId] = score;
        }

        // 宠物-用户矩阵
        if (!petUserMatrix[petId]) {
            petUserMatrix[petId] = {};
        }
        if (!petUserMatrix[petId][userId] || petUserMatrix[petId][userId] < score) {
            petUserMatrix[petId][userId] = score;
        }
    });

    // 获取目标用户交互过的宠物
    const targetUserRatings = userPetMatrix[targetUserId] || {};
    const targetUserPetIds = Object.keys(targetUserRatings).map(Number);

    if (targetUserPetIds.length === 0) {
        return []; // 目标用户没有行为数据，无法推荐
    }

    // 计算推荐分数
    const petScores = {};
    const allPetIds = new Set();

    // 收集所有宠物ID
    for (const petId in petUserMatrix) {
        allPetIds.add(parseInt(petId));
    }

    // 对目标用户交互过的每个宠物，找到相似宠物
    for (const interactedPetId of targetUserPetIds) {
        const interactedPetRatings = petUserMatrix[interactedPetId] || {};
        const userScore = targetUserRatings[interactedPetId] || 1.0;

        // 计算与其他宠物的相似度
        for (const candidatePetId of allPetIds) {
            // 跳过已交互的宠物
            if (targetUserPetIds.includes(candidatePetId)) continue;

            const candidatePetRatings = petUserMatrix[candidatePetId] || {};
            const similarity = itemCosineSimilarity(interactedPetRatings, candidatePetRatings);

            if (similarity > 0) {
                if (!petScores[candidatePetId]) {
                    petScores[candidatePetId] = {
                        petId: candidatePetId,
                        score: 0
                    };
                }

                // 加权：用户对交互宠物的评分 * 相似度
                petScores[candidatePetId].score += userScore * similarity;
            }
        }
    }

    // 排序并返回
    const recommendations = Object.values(petScores)
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topN)
        .map(item => item.petId);

    return recommendations;
}

/**
 * 混合推荐：结合基于用户和基于物品的协同过滤
 * @param {number} targetUserId - 目标用户ID
 * @param {Array} userBehaviors - 所有用户行为数据
 * @param {number} topN - 返回前N个推荐
 * @param {number} userWeight - 基于用户的权重（0-1）
 * @param {number} itemWeight - 基于物品的权重（0-1）
 * @returns {Array} 推荐的宠物ID数组
 */
function hybridCF(targetUserId, userBehaviors, topN = 10, userWeight = 0.5, itemWeight = 0.5) {
    const userBasedRecs = userBasedCF(targetUserId, userBehaviors, topN * 2);
    const itemBasedRecs = itemBasedCF(targetUserId, userBehaviors, topN * 2);

    // 合并推荐结果
    const petScores = {};

    // 基于用户的推荐
    userBasedRecs.forEach((petId, index) => {
        if (!petScores[petId]) {
            petScores[petId] = 0;
        }
        // 排名越靠前，分数越高
        petScores[petId] += userWeight * (topN * 2 - index);
    });

    // 基于物品的推荐
    itemBasedRecs.forEach((petId, index) => {
        if (!petScores[petId]) {
            petScores[petId] = 0;
        }
        petScores[petId] += itemWeight * (topN * 2 - index);
    });

    // 排序并返回
    const recommendations = Object.entries(petScores)
        .map(([petId, score]) => ({
            petId: parseInt(petId),
            score: score
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topN)
        .map(item => item.petId);

    return recommendations;
}

module.exports = {
    userBasedCF,
    itemBasedCF,
    hybridCF,
    cosineSimilarity,
    itemCosineSimilarity
};


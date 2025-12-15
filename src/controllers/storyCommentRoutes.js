/**
 * 故事评论管理接口
 */
const { db } = require('../config/database');
const { analyzeSentiment, getSentimentStats } = require('../utils/sentimentAnalyzer');

/**
 * 获取故事评论列表（支持分页）
 */
const getCommentList = async (req, res) => {
    try {
        const { story_id, keyword, page = 1, size = 10 } = req.query
        const offset = (parseInt(page) - 1) * parseInt(size)
        const limit = parseInt(size)

        let sql = `SELECT sc.*, as_.title as story_title 
                   FROM story_comments sc 
                   LEFT JOIN adoption_stories as_ ON sc.story_id = as_.id 
                   WHERE 1=1`
        let countSql = `SELECT COUNT(*) as total FROM story_comments WHERE 1=1`
        const params = []
        const countParams = []

        // 按故事ID过滤
        if (story_id) {
            sql += ` AND sc.story_id = ?`
            countSql += ` AND story_id = ?`
            params.push(story_id)
            countParams.push(story_id)
        }

        // 关键词搜索
        if (keyword) {
            sql += ` AND (sc.user_name LIKE ? OR sc.content LIKE ?)`
            countSql += ` AND (user_name LIKE ? OR content LIKE ?)`
            const keywordParam = `%${keyword}%`
            params.push(keywordParam, keywordParam)
            countParams.push(keywordParam, keywordParam)
        }

        sql += ` ORDER BY sc.create_time DESC LIMIT ? OFFSET ?`
        params.push(limit, offset)

        const [comments] = await db.query(sql, params)
        const [countResult] = await db.query(countSql, countParams)

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                list: comments,
                total: countResult[0].total,
                page: parseInt(page),
                size: parseInt(size)
            }
        })
    } catch (error) {
        console.error('获取评论列表失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取评论列表失败',
            error: error.message
        })
    }
}

/**
 * 获取指定故事的评论列表
 */
const getCommentsByStoryId = async (req, res) => {
    try {
        const { storyId } = req.params
        const { page = 1, size = 10 } = req.query
        const offset = (parseInt(page) - 1) * parseInt(size)
        const limit = parseInt(size)

        const [comments] = await db.query(
            `SELECT id, story_id, user_name, content, likes, create_time
             FROM story_comments 
             WHERE story_id = ? 
             ORDER BY create_time DESC 
             LIMIT ? OFFSET ?`,
            [storyId, limit, offset]
        )

        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM story_comments WHERE story_id = ?`,
            [storyId]
        )

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                list: comments,
                total: countResult[0].total,
                page: parseInt(page),
                size: parseInt(size)
            }
        })
    } catch (error) {
        console.error('获取故事评论失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取故事评论失败',
            error: error.message
        })
    }
}

/**
 * 获取评论详情
 */
const getCommentDetail = async (req, res) => {
    try {
        const { id } = req.params

        const [comments] = await db.query(
            `SELECT sc.*, as_.title as story_title 
             FROM story_comments sc 
             LEFT JOIN adoption_stories as_ ON sc.story_id = as_.id 
             WHERE sc.id = ?`,
            [id]
        )

        if (comments.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '评论不存在'
            })
        }

        res.json({
            code: 200,
            message: '获取成功',
            data: comments[0]
        })
    } catch (error) {
        console.error('获取评论详情失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取评论详情失败',
            error: error.message
        })
    }
}

/**
 * 创建评论
 */
const createComment = async (req, res) => {
    try {
        const { story_id, user_name, content } = req.body

        if (!story_id || !user_name || !content) {
            return res.status(400).json({
                code: 400,
                message: '故事ID、用户名和评论内容不能为空'
            })
        }

        // 检查故事是否存在
        const [stories] = await db.query(
            `SELECT * FROM adoption_stories WHERE id = ?`,
            [story_id]
        )

        if (stories.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '故事不存在'
            })
        }

        // 情感分析
        const sentimentResult = analyzeSentiment(content)

        const [result] = await db.query(
            `INSERT INTO story_comments 
             (story_id, user_name, content, sentiment_score, sentiment_label) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                story_id, 
                user_name, 
                content,
                sentimentResult.score,
                sentimentResult.label
            ]
        )

        res.json({
            code: 200,
            message: '评论成功',
            data: { 
                id: result.insertId,
                sentiment: sentimentResult
            }
        })
    } catch (error) {
        console.error('创建评论失败:', error)
        res.status(500).json({
            code: 500,
            message: '创建评论失败',
            error: error.message
        })
    }
}

/**
 * 更新评论
 */
const updateComment = async (req, res) => {
    try {
        const { id } = req.params
        const { user_name, content } = req.body

        // 检查评论是否存在
        const [existing] = await db.query(
            `SELECT * FROM story_comments WHERE id = ?`,
            [id]
        )

        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '评论不存在'
            })
        }

        const updateFields = []
        const updateValues = []

        if (user_name !== undefined) {
            updateFields.push('user_name = ?')
            updateValues.push(user_name)
        }
        if (content !== undefined) {
            updateFields.push('content = ?')
            updateValues.push(content)
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '没有要更新的字段'
            })
        }

        updateValues.push(id)

        await db.query(
            `UPDATE story_comments SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        )

        res.json({
            code: 200,
            message: '更新成功'
        })
    } catch (error) {
        console.error('更新评论失败:', error)
        res.status(500).json({
            code: 500,
            message: '更新评论失败',
            error: error.message
        })
    }
}

/**
 * 删除评论
 */
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params

        const [existing] = await db.query(
            `SELECT * FROM story_comments WHERE id = ?`,
            [id]
        )

        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '评论不存在'
            })
        }

        await db.query(`DELETE FROM story_comments WHERE id = ?`, [id])

        res.json({
            code: 200,
            message: '删除成功'
        })
    } catch (error) {
        console.error('删除评论失败:', error)
        res.status(500).json({
            code: 500,
            message: '删除评论失败',
            error: error.message
        })
    }
}

/**
 * 点赞评论
 */
const likeComment = async (req, res) => {
    try {
        const { id } = req.params

        const [existing] = await db.query(
            `SELECT * FROM story_comments WHERE id = ?`,
            [id]
        )

        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '评论不存在'
            })
        }

        await db.query(
            `UPDATE story_comments SET likes = likes + 1 WHERE id = ?`,
            [id]
        )

        res.json({
            code: 200,
            message: '点赞成功'
        })
    } catch (error) {
        console.error('点赞失败:', error)
        res.status(500).json({
            code: 500,
            message: '点赞失败',
            error: error.message
        })
    }
}

/**
 * 获取评论统计
 */
const getCommentStats = async (req, res) => {
    try {
        const [totalResult] = await db.query(
            `SELECT COUNT(*) as total FROM story_comments`
        )
        const [todayResult] = await db.query(
            `SELECT COUNT(*) as count FROM story_comments WHERE DATE(create_time) = CURDATE()`
        )
        const [likesResult] = await db.query(
            `SELECT SUM(likes) as totalLikes FROM story_comments`
        )

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                total: totalResult[0].total,
                today: todayResult[0].count,
                totalLikes: likesResult[0].totalLikes || 0
            }
        })
    } catch (error) {
        console.error('获取评论统计失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取评论统计失败',
            error: error.message
        })
    }
}

/**
 * 获取评论情感统计
 */
const getSentimentAnalysis = async (req, res) => {
    try {
        const { story_id } = req.query

        let sql = `SELECT sentiment_label, COUNT(*) as count FROM story_comments WHERE sentiment_label IS NOT NULL`
        const params = []

        if (story_id) {
            sql += ` AND story_id = ?`
            params.push(story_id)
        }

        sql += ` GROUP BY sentiment_label`

        const [sentimentCounts] = await db.query(sql, params)

        // 获取平均情感分数
        let avgSql = `SELECT AVG(sentiment_score) as avgScore FROM story_comments WHERE sentiment_score IS NOT NULL`
        if (story_id) {
            avgSql += ` AND story_id = ?`
        }
        const [avgResult] = await db.query(avgSql, story_id ? [story_id] : [])

        // 整理统计数据
        const stats = {
            positive: 0,
            negative: 0,
            neutral: 0,
            total: 0,
            averageScore: avgResult[0].avgScore ? Math.round(avgResult[0].avgScore * 100) / 100 : 0
        }

        for (const item of sentimentCounts) {
            if (item.sentiment_label === '积极') stats.positive = item.count
            else if (item.sentiment_label === '消极') stats.negative = item.count
            else if (item.sentiment_label === '中性') stats.neutral = item.count
            stats.total += item.count
        }

        // 计算百分比
        const percentages = {
            positive: stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0,
            negative: stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0,
            neutral: stats.total > 0 ? Math.round((stats.neutral / stats.total) * 100) : 0
        }

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                counts: stats,
                percentages,
                averageScore: stats.averageScore
            }
        })
    } catch (error) {
        console.error('获取情感统计失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取情感统计失败',
            error: error.message
        })
    }
}

/**
 * 单独分析文本情感（不保存）
 */
const analyzeText = async (req, res) => {
    try {
        const { text } = req.body

        if (!text) {
            return res.status(400).json({
                code: 400,
                message: '文本内容不能为空'
            })
        }

        const result = analyzeSentiment(text)

        res.json({
            code: 200,
            message: '分析成功',
            data: result
        })
    } catch (error) {
        console.error('情感分析失败:', error)
        res.status(500).json({
            code: 500,
            message: '情感分析失败',
            error: error.message
        })
    }
}

module.exports = {
    getCommentList,
    getCommentsByStoryId,
    getCommentDetail,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    getCommentStats,
    getSentimentAnalysis,
    analyzeText
}

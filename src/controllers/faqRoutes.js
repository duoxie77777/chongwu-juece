/**
 * 常见问题管理接口
 */
const { db } = require('../config/database');

/**
 * 获取FAQ列表（支持分页、搜索、过滤）
 */
const getFaqList = async (req, res) => {
    try {
        const { keyword, category, page = 1, size = 10 } = req.query
        const offset = (parseInt(page) - 1) * parseInt(size)
        const limit = parseInt(size)

        let sql = `SELECT * FROM faqs WHERE status = 1`
        let countSql = `SELECT COUNT(*) as total FROM faqs WHERE status = 1`
        const params = []
        const countParams = []

        // 关键词搜索
        if (keyword) {
            sql += ` AND (question LIKE ? OR answer LIKE ?)`
            countSql += ` AND (question LIKE ? OR answer LIKE ?)`
            const keywordParam = `%${keyword}%`
            params.push(keywordParam, keywordParam)
            countParams.push(keywordParam, keywordParam)
        }

        // 分类过滤
        if (category) {
            sql += ` AND category = ?`
            countSql += ` AND category = ?`
            params.push(category)
            countParams.push(category)
        }

        sql += ` ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`
        params.push(limit, offset)

        const [faqs] = await db.query(sql, params)
        const [countResult] = await db.query(countSql, countParams)

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                list: faqs,
                total: countResult[0].total,
                page: parseInt(page),
                size: parseInt(size)
            }
        })
    } catch (error) {
        console.error('获取FAQ列表失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取FAQ列表失败',
            error: error.message
        })
    }
}

/**
 * 获取FAQ详情
 */
const getFaqDetail = async (req, res) => {
    try {
        const { id } = req.params

        const [faqs] = await db.query(
            `SELECT * FROM faqs WHERE id = ?`,
            [id]
        )

        if (faqs.length === 0) {
            return res.status(404).json({
                code: 404,
                message: 'FAQ不存在'
            })
        }

        res.json({
            code: 200,
            message: '获取成功',
            data: faqs[0]
        })
    } catch (error) {
        console.error('获取FAQ详情失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取FAQ详情失败',
            error: error.message
        })
    }
}

/**
 * 创建FAQ
 */
const createFaq = async (req, res) => {
    try {
        const {
            category,
            question,
            answer,
            sort_order = 0,
            is_hot = 0
        } = req.body

        if (!category || !question || !answer) {
            return res.status(400).json({
                code: 400,
                message: '分类、问题和答案不能为空'
            })
        }

        const [result] = await db.query(
            `INSERT INTO faqs (category, question, answer, sort_order, is_hot, status) 
            VALUES (?, ?, ?, ?, ?, 1)`,
            [category, question, answer, sort_order, is_hot]
        )

        res.json({
            code: 200,
            message: '创建成功',
            data: { id: result.insertId }
        })
    } catch (error) {
        console.error('创建FAQ失败:', error)
        res.status(500).json({
            code: 500,
            message: '创建FAQ失败',
            error: error.message
        })
    }
}

/**
 * 更新FAQ
 */
const updateFaq = async (req, res) => {
    try {
        const { id } = req.params
        const {
            category,
            question,
            answer,
            sort_order,
            is_hot,
            status
        } = req.body

        // 检查FAQ是否存在
        const [existing] = await db.query(
            `SELECT * FROM faqs WHERE id = ?`,
            [id]
        )

        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: 'FAQ不存在'
            })
        }

        const updateFields = []
        const updateValues = []

        if (category !== undefined) {
            updateFields.push('category = ?')
            updateValues.push(category)
        }
        if (question !== undefined) {
            updateFields.push('question = ?')
            updateValues.push(question)
        }
        if (answer !== undefined) {
            updateFields.push('answer = ?')
            updateValues.push(answer)
        }
        if (sort_order !== undefined) {
            updateFields.push('sort_order = ?')
            updateValues.push(sort_order)
        }
        if (is_hot !== undefined) {
            updateFields.push('is_hot = ?')
            updateValues.push(is_hot)
        }
        if (status !== undefined) {
            updateFields.push('status = ?')
            updateValues.push(status)
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '没有要更新的字段'
            })
        }

        updateValues.push(id)

        await db.query(
            `UPDATE faqs SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        )

        res.json({
            code: 200,
            message: '更新成功'
        })
    } catch (error) {
        console.error('更新FAQ失败:', error)
        res.status(500).json({
            code: 500,
            message: '更新FAQ失败',
            error: error.message
        })
    }
}

/**
 * 删除FAQ
 */
const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params

        const [existing] = await db.query(
            `SELECT * FROM faqs WHERE id = ?`,
            [id]
        )

        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: 'FAQ不存在'
            })
        }

        // 软删除
        await db.query(`UPDATE faqs SET status = 0 WHERE id = ?`, [id])

        res.json({
            code: 200,
            message: '删除成功'
        })
    } catch (error) {
        console.error('删除FAQ失败:', error)
        res.status(500).json({
            code: 500,
            message: '删除FAQ失败',
            error: error.message
        })
    }
}

/**
 * 获取FAQ统计
 */
const getFaqStats = async (req, res) => {
    try {
        const [totalResult] = await db.query(
            `SELECT COUNT(*) as total FROM faqs WHERE status = 1`
        )
        const [adoptionResult] = await db.query(
            `SELECT COUNT(*) as count FROM faqs WHERE status = 1 AND category = 'adoption'`
        )
        const [careResult] = await db.query(
            `SELECT COUNT(*) as count FROM faqs WHERE status = 1 AND category = 'care'`
        )
        const [accountResult] = await db.query(
            `SELECT COUNT(*) as count FROM faqs WHERE status = 1 AND category = 'account'`
        )
        const [otherResult] = await db.query(
            `SELECT COUNT(*) as count FROM faqs WHERE status = 1 AND category = 'other'`
        )

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                total: totalResult[0].total,
                adoption: adoptionResult[0].count,
                care: careResult[0].count,
                account: accountResult[0].count,
                other: otherResult[0].count
            }
        })
    } catch (error) {
        console.error('获取FAQ统计失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取FAQ统计失败',
            error: error.message
        })
    }
}

module.exports = {
    getFaqList,
    getFaqDetail,
    createFaq,
    updateFaq,
    deleteFaq,
    getFaqStats
}

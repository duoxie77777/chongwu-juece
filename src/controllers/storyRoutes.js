/**
 * 领养故事管理接口
 */
const { db } = require('../config/database');

/**
 * 获取故事列表（支持分页、搜索、过滤）
 */
const getStoryList = async (req, res) => {
    try {
        const { keyword, status, is_featured, pet_id, tag, sort = 'create_time', order = 'DESC', page = 1, size = 10 } = req.query
        const offset = (parseInt(page) - 1) * parseInt(size)
        const limit = parseInt(size)

        let sql = `SELECT s.*, 
                   (SELECT COUNT(*) FROM story_comments WHERE story_id = s.id) as comment_count,
                   p.pet_name, p.pet_type, p.image_url as pet_image
                   FROM adoption_stories s 
                   LEFT JOIN pet_core_info p ON s.pet_id = p.id
                   WHERE 1=1`
        let countSql = `SELECT COUNT(*) as total FROM adoption_stories s WHERE 1=1`
        const params = []
        const countParams = []

        // 关键词搜索
        if (keyword) {
            sql += ` AND (s.title LIKE ? OR s.author LIKE ? OR s.content LIKE ?)`
            countSql += ` AND (s.title LIKE ? OR s.author LIKE ? OR s.content LIKE ?)`
            const keywordParam = `%${keyword}%`
            params.push(keywordParam, keywordParam, keywordParam)
            countParams.push(keywordParam, keywordParam, keywordParam)
        }

        // 状态过滤
        if (status) {
            if (status === 'all') {
                // 如果状态是'all'，不添加状态过滤（显示所有状态）
                // 这通常用于后台管理页面
            } else {
                sql += ` AND s.status = ?`
                countSql += ` AND s.status = ?`
                params.push(status === 'published' ? 1 : 0)
                countParams.push(status === 'published' ? 1 : 0)
            }
        } else {
            // 默认只显示已发布的故事（前端用户）
            sql += ` AND s.status = 1`
            countSql += ` AND s.status = 1`
        }

        // 推荐过滤
        if (is_featured !== undefined) {
            sql += ` AND s.is_featured = ?`
            countSql += ` AND s.is_featured = ?`
            params.push(is_featured === '1' || is_featured === 1 ? 1 : 0)
            countParams.push(is_featured === '1' || is_featured === 1 ? 1 : 0)
        }

        // 宠物过滤
        if (pet_id) {
            sql += ` AND s.pet_id = ?`
            countSql += ` AND s.pet_id = ?`
            params.push(pet_id)
            countParams.push(pet_id)
        }

        // 标签过滤
        if (tag) {
            sql += ` AND s.tags LIKE ?`
            countSql += ` AND s.tags LIKE ?`
            const tagParam = `%${tag}%`
            params.push(tagParam)
            countParams.push(tagParam)
        }

        // 排序
        const validSortFields = ['create_time', 'publish_date', 'views', 'likes', 'comment_count']
        const sortField = validSortFields.includes(sort) ? sort : 'create_time'
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
        
        if (sortField === 'comment_count') {
            sql += ` ORDER BY comment_count ${sortOrder}, s.create_time DESC`
        } else {
            sql += ` ORDER BY s.${sortField} ${sortOrder}`
        }
        
        sql += ` LIMIT ? OFFSET ?`
        params.push(limit, offset)

        const [stories] = await db.query(sql, params)
        const [countResult] = await db.query(countSql, countParams)

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                list: stories.map(story => ({
                    ...story,
                    status: story.status === 1 ? 'published' : 'draft',
                    is_featured: story.is_featured === 1,
                    tags: story.tags ? story.tags.split(',').map(t => t.trim()) : []
                })),
                total: countResult[0].total,
                page: parseInt(page),
                size: parseInt(size),
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        })
    } catch (error) {
        console.error('获取故事列表失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取故事列表失败',
            error: error.message
        })
    }
}

/**
 * 获取故事详情
 */
const getStoryDetail = async (req, res) => {
    try {
        const { id } = req.params

        // 查询故事详情，包含宠物信息和评论数
        const [stories] = await db.query(
            `SELECT s.*, 
                    p.pet_name, p.pet_type, p.breed, p.age, p.gender, 
                    p.image_url as pet_image, p.status as pet_status,
                    (SELECT COUNT(*) FROM story_comments WHERE story_id = s.id) as comment_count
             FROM adoption_stories s 
             LEFT JOIN pet_core_info p ON s.pet_id = p.id
             WHERE s.id = ?`,
            [id]
        )

        if (stories.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '故事不存在'
            })
        }

        const story = stories[0]
        story.status = story.status === 1 ? 'published' : 'draft'
        story.is_featured = story.is_featured === 1
        story.tags = story.tags ? story.tags.split(',').map(t => t.trim()) : []
        story.images = story.images ? (typeof story.images === 'string' ? JSON.parse(story.images) : story.images) : []

        // 增加浏览量
        await db.query(
            `UPDATE adoption_stories SET views = views + 1 WHERE id = ?`,
            [id]
        )
        story.views = (story.views || 0) + 1

        res.json({
            code: 200,
            message: '获取成功',
            data: story
        })
    } catch (error) {
        console.error('获取故事详情失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取故事详情失败',
            error: error.message
        })
    }
}

/**
 * 创建故事
 */
const createStory = async (req, res) => {
    try {
        const {
            title,
            author,
            author_contact,
            content,
            image_url,
            images,
            tags,
            status = 'draft',
            is_featured = 0,
            pet_id
        } = req.body

        if (!title || !author || !content) {
            return res.status(400).json({
                code: 400,
                message: '标题、作者和内容不能为空'
            })
        }

        const [result] = await db.query(
            `INSERT INTO adoption_stories 
            (title, author, author_contact, content, image_url, images, tags, status, is_featured, pet_id, publish_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                author,
                author_contact || null,
                content,
                image_url || null,
                images || null,
                tags || null,
                status === 'published' ? 1 : 0,
                is_featured,
                pet_id || null,
                status === 'published' ? new Date() : null
            ]
        )

        res.json({
            code: 200,
            message: '创建成功',
            data: { id: result.insertId }
        })
    } catch (error) {
        console.error('创建故事失败:', error)
        res.status(500).json({
            code: 500,
            message: '创建故事失败',
            error: error.message
        })
    }
}

/**
 * 更新故事
 */
const updateStory = async (req, res) => {
    try {
        const { id } = req.params
        const {
            title,
            author,
            author_contact,
            content,
            image_url,
            images,
            tags,
            status,
            is_featured,
            pet_id
        } = req.body

        // 检查故事是否存在
        const [existing] = await db.query(
            `SELECT * FROM adoption_stories WHERE id = ?`,
            [id]
        )

        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '故事不存在'
            })
        }

        const updateFields = []
        const updateValues = []

        if (title !== undefined) {
            updateFields.push('title = ?')
            updateValues.push(title)
        }
        if (author !== undefined) {
            updateFields.push('author = ?')
            updateValues.push(author)
        }
        if (author_contact !== undefined) {
            updateFields.push('author_contact = ?')
            updateValues.push(author_contact)
        }
        if (content !== undefined) {
            updateFields.push('content = ?')
            updateValues.push(content)
        }
        if (image_url !== undefined) {
            updateFields.push('image_url = ?')
            updateValues.push(image_url)
        }
        if (images !== undefined) {
            updateFields.push('images = ?')
            updateValues.push(images)
        }
        if (tags !== undefined) {
            updateFields.push('tags = ?')
            updateValues.push(tags)
        }
        if (status !== undefined) {
            updateFields.push('status = ?')
            updateValues.push(status === 'published' ? 1 : 0)
            // 如果发布，更新发布日期
            if (status === 'published' && existing[0].status === 0) {
                updateFields.push('publish_date = ?')
                updateValues.push(new Date())
            }
        }
        if (is_featured !== undefined) {
            updateFields.push('is_featured = ?')
            updateValues.push(is_featured)
        }
        if (pet_id !== undefined) {
            updateFields.push('pet_id = ?')
            updateValues.push(pet_id)
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '没有要更新的字段'
            })
        }

        updateValues.push(id)

        await db.query(
            `UPDATE adoption_stories SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        )

        res.json({
            code: 200,
            message: '更新成功'
        })
    } catch (error) {
        console.error('更新故事失败:', error)
        res.status(500).json({
            code: 500,
            message: '更新故事失败',
            error: error.message
        })
    }
}

/**
 * 删除故事
 */
const deleteStory = async (req, res) => {
    try {
        const { id } = req.params

        const [existing] = await db.query(
            `SELECT * FROM adoption_stories WHERE id = ?`,
            [id]
        )

        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '故事不存在'
            })
        }

        await db.query(`DELETE FROM adoption_stories WHERE id = ?`, [id])

        res.json({
            code: 200,
            message: '删除成功'
        })
    } catch (error) {
        console.error('删除故事失败:', error)
        res.status(500).json({
            code: 500,
            message: '删除故事失败',
            error: error.message
        })
    }
}

/**
 * 获取故事统计
 */
const getStoryStats = async (req, res) => {
    try {
        const [totalResult] = await db.query(
            `SELECT COUNT(*) as total FROM adoption_stories`
        )
        const [publishedResult] = await db.query(
            `SELECT COUNT(*) as count FROM adoption_stories WHERE status = 1`
        )
        const [draftResult] = await db.query(
            `SELECT COUNT(*) as count FROM adoption_stories WHERE status = 0`
        )
        const [viewsResult] = await db.query(
            `SELECT SUM(views) as totalViews FROM adoption_stories`
        )

        res.json({
            code: 200,
            message: '获取成功',
            data: {
                total: totalResult[0].total,
                published: publishedResult[0].count,
                draft: draftResult[0].count,
                totalViews: viewsResult[0].totalViews || 0
            }
        })
    } catch (error) {
        console.error('获取故事统计失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取故事统计失败',
            error: error.message
        })
    }
}

/**
 * 发布故事
 */
const publishStory = async (req, res) => {
    try {
        const { id } = req.params

        const [existing] = await db.query(
            `SELECT * FROM adoption_stories WHERE id = ?`,
            [id]
        )

        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '故事不存在'
            })
        }

        await db.query(
            `UPDATE adoption_stories SET status = 1, publish_date = ? WHERE id = ?`,
            [new Date(), id]
        )

        res.json({
            code: 200,
            message: '发布成功'
        })
    } catch (error) {
        console.error('发布故事失败:', error)
        res.status(500).json({
            code: 500,
            message: '发布故事失败',
            error: error.message
        })
    }
}

/**
 * 增加故事点赞数
 */
const likeStory = async (req, res) => {
    try {
        const { id } = req.params

        const [existing] = await db.query(
            `SELECT * FROM adoption_stories WHERE id = ?`,
            [id]
        )

        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '故事不存在'
            })
        }

        await db.query(
            `UPDATE adoption_stories SET likes = likes + 1 WHERE id = ?`,
            [id]
        )

        const [updated] = await db.query(
            `SELECT likes FROM adoption_stories WHERE id = ?`,
            [id]
        )

        res.json({
            code: 200,
            message: '点赞成功',
            data: {
                likes: updated[0].likes
            }
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
 * 获取推荐故事
 */
const getFeaturedStories = async (req, res) => {
    try {
        const { limit = 5 } = req.query
        const parsedLimit = parseInt(limit) || 5

        const [stories] = await db.query(
            `SELECT s.*, 
                    (SELECT COUNT(*) FROM story_comments WHERE story_id = s.id) as comment_count,
                    p.pet_name, p.pet_type, p.image_url as pet_image
             FROM adoption_stories s 
             LEFT JOIN pet_core_info p ON s.pet_id = p.id
             WHERE s.status = 1 AND s.is_featured = 1
             ORDER BY s.create_time DESC
             LIMIT ?`,
            [parsedLimit]
        )

        res.json({
            code: 200,
            message: '获取成功',
            data: stories.map(story => ({
                ...story,
                status: story.status === 1 ? 'published' : 'draft',
                is_featured: story.is_featured === 1,
                tags: story.tags ? story.tags.split(',').map(t => t.trim()) : []
            }))
        })
    } catch (error) {
        console.error('获取推荐故事失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取推荐故事失败',
            error: error.message
        })
    }
}

/**
 * 获取热门故事（按浏览量或点赞数）
 */
const getPopularStories = async (req, res) => {
    try {
        const { limit = 10, sort = 'views' } = req.query
        const parsedLimit = parseInt(limit) || 10
        const sortField = sort === 'likes' ? 'likes' : 'views'

        const [stories] = await db.query(
            `SELECT s.*, 
                    (SELECT COUNT(*) FROM story_comments WHERE story_id = s.id) as comment_count,
                    p.pet_name, p.pet_type, p.image_url as pet_image
             FROM adoption_stories s 
             LEFT JOIN pet_core_info p ON s.pet_id = p.id
             WHERE s.status = 1
             ORDER BY s.${sortField} DESC, s.create_time DESC
             LIMIT ?`,
            [parsedLimit]
        )

        res.json({
            code: 200,
            message: '获取成功',
            data: stories.map(story => ({
                ...story,
                status: story.status === 1 ? 'published' : 'draft',
                is_featured: story.is_featured === 1,
                tags: story.tags ? story.tags.split(',').map(t => t.trim()) : []
            }))
        })
    } catch (error) {
        console.error('获取热门故事失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取热门故事失败',
            error: error.message
        })
    }
}

module.exports = {
    getStoryList,
    getStoryDetail,
    createStory,
    updateStory,
    deleteStory,
    getStoryStats,
    publishStory,
    likeStory,
    getFeaturedStories,
    getPopularStories
}

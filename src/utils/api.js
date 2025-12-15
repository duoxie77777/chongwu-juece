/**
 * 统一的 API 请求工具
 * 使用 fetch API
 */

// 统一的 BASE_URL 配置
const API_BASE_URL = 'http://localhost:8889/api'

/**
 * 发送 fetch 请求
 * @param {string} url - 请求的相对路径（不包含 BASE_URL）
 * @param {Object} options - 请求配置
 * @param {string} options.method - HTTP 方法，默认 GET
 * @param {Object} options.headers - 请求头
 * @param {Object|string} options.body - 请求体
 * @returns {Promise}
 */
const request = async (url, options = {}) => {
    const {
        method = 'GET',
        headers = {},
        body = null,
        ...rest
    } = options

    // 构建完整的 URL
    const fullUrl = `${API_BASE_URL}${url}`

    // 默认请求头
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...headers
    }

    // 获取存储的 token
    const token = localStorage.getItem('token')
    
    // POST 和 PUT 请求需要登录验证
    const needAuth = method === 'POST' || method === 'PUT'
    
    // 定义不需要登录的公开接口（注册、登录等）
    const publicEndpoints = [
        '/user/register',
        '/user/login',
        '/user/forget-password',
        '/user/reset-password'
    ]
    
    // 检查是否为公开接口
    const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint))
    
    // 如果需要认证但不是公开接口，检查 token
    if (needAuth && !isPublicEndpoint) {
        if (!token) {
            const error = new Error('请先登录后再进行操作')
            error.status = 401
            error.code = 'UNAUTHORIZED'
            error.data = {
                code: 401,
                message: '请先登录后再进行操作'
            }
            throw error
        }
    }
    
    // 如果有 token，添加到请求头
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`
    }

    // 构建 fetch 配置
    const config = {
        method,
        headers: defaultHeaders,
        ...rest
    }

    // 处理请求体
    if (body) {
        if (body instanceof FormData) {
            // FormData 类型，不设置 Content-Type，浏览器会自动处理
            delete config.headers['Content-Type']
            config.body = body
        } else if (typeof body === 'object') {
            config.body = JSON.stringify(body)
        } else {
            config.body = body
        }
    }

    try {
        const response = await fetch(fullUrl, config)

        // 处理响应
        const contentType = response.headers.get('content-type')
        let data

        if (contentType && contentType.includes('application/json')) {
            data = await response.json()
        } else if (contentType && contentType.includes('text')) {
            data = await response.text()
        } else {
            data = await response.blob()
        }

        // 检查 HTTP 状态码
        if (!response.ok) {
            // 如果是 401 未授权，清除 token 并提示登录
            if (response.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                const error = new Error('登录已过期，请重新登录')
                error.status = 401
                error.code = 'UNAUTHORIZED'
                error.data = {
                    code: 401,
                    message: '登录已过期，请重新登录'
                }
                throw error
            }
            
            const error = new Error(data?.message || `HTTP Error ${response.status}`)
            error.status = response.status
            error.data = data
            throw error
        }

        return {
            status: response.status,
            data,
            headers: response.headers
        }
    } catch (error) {
        console.error('API request failed:', error)
        throw error
    }
}

// ============ 用户相关接口 ============

/**
 * 用户注册
 */
export const register = (userData) => {
    return request('/user/register', {
        method: 'POST',
        body: userData
    })
}

/**
 * 用户登录
 */
export const login = (loginData) => {
    return request('/user/login', {
        method: 'POST',
        body: loginData
    })
}

/**
 * 获取所有用户
 */
export const getAllUsers = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/user/users?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取用户详情
 */
export const getUserDetail = (id) => {
    return request(`/user/users/${id}`, {
        method: 'GET'
    })
}

/**
 * 更新用户信息（管理员）
 */
export const updateUser = (id, userData) => {
    return request(`/user/users/${id}`, {
        method: 'PUT',
        body: userData
    })
}

/**
 * 删除用户（管理员）
 */
export const deleteUser = (id) => {
    return request(`/user/users/${id}`, {
        method: 'DELETE'
    })
}

/**
 * 管理员重置用户密码
 */
export const adminResetPassword = (id, data) => {
    return request(`/user/users/${id}/reset-password`, {
        method: 'POST',
        body: data
    })
}

/**
 * 上传文件
 */
export const uploadFile = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    }).then(res => res.json()).then(data => ({ data }))
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
    return request('/user/profile', {
        method: 'GET'
    })
}

/**
 * 更新用户信息
 */
export const updateUserProfile = (userData) => {
    return request('/user/profile', {
        method: 'PUT',
        body: userData
    })
}

/**
 * 修改密码
 */
export const changePassword = (passwordData) => {
    return request('/user/change-password', {
        method: 'POST',
        body: passwordData
    })
}

/**
 * 重置密码
 */
export const resetPassword = (resetData) => {
    return request('/user/reset-password', {
        method: 'POST',
        body: resetData
    })
}

/**
 * 发送验证码
 */
export const sendVerificationCode = (data) => {
    return request('/user/send-code', {
        method: 'POST',
        body: data
    })
}

/**
 * 获取用户收养记录
 */
/**
 * 创建领养申请
 * @param {Object} applicationData - 领养申请数据
 */
export const createAdoptionApplication = (applicationData) => {
    return request('/user/adoptions', {
        method: 'POST',
        body: applicationData
    })
}

export const getUserAdoptions = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/user/adoptions?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取所有领养申请（管理员）
 * @param {Object} params - 查询参数
 */
export const getAllAdoptionApplications = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/adoption-application/list?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取申请详情
 * @param {number} id - 申请ID
 */
export const getAdoptionApplicationDetail = (id) => {
    return request(`/adoption-application/${id}`, {
        method: 'GET'
    })
}

/**
 * 更新申请状态
 * @param {number} id - 申请ID
 * @param {Object} data - 更新数据 { status, review_comment }
 */
export const updateAdoptionApplicationStatus = (id, data) => {
    return request(`/adoption-application/${id}/status`, {
        method: 'PUT',
        body: data
    })
}

/**
 * 获取申请统计
 */
export const getAdoptionApplicationStats = () => {
    return request('/adoption-application/stats', {
        method: 'GET'
    })
}

/**
 * 获取用户志愿者信息
 */
export const getUserVolunteerInfo = () => {
    return request('/user/volunteer', {
        method: 'GET'
    })
}

/**
 * 申请成为志愿者
 */
export const applyVolunteer = (data) => {
    return request('/user/volunteer', {
        method: 'POST',
        body: data
    })
}

/**
 * 获取志愿者申请列表（管理员）
 */
export const getVolunteerApplications = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/user/volunteer-applications?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取志愿者申请统计（管理员）
 */
export const getVolunteerApplicationStats = () => {
    return request('/user/volunteer-applications/stats', {
        method: 'GET'
    })
}

/**
 * 获取志愿者申请详情（管理员）
 */
export const getVolunteerApplicationDetail = (id) => {
    return request(`/user/volunteer-applications/${id}`, {
        method: 'GET'
    })
}

/**
 * 审批志愿者申请（管理员）
 */
export const updateVolunteerApplicationStatus = (id, data) => {
    return request(`/user/volunteer-applications/${id}`, {
        method: 'PUT',
        body: data
    })
}

/**
 * 获取用户订单记录
 */
export const getUserOrders = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/user/orders?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取所有宠物分类
 */
export const getPetCategories = () => {
    return request('/category/pets', {
        method: 'GET'
    })
}

/**
 * 获取宠物分类详情
 * @param {number} id - 分类 ID
 */
export const getPetCategoryDetail = (id) => {
    return request(`/category/pets/${id}`, {
        method: 'GET'
    })
}

/**
 * 创建宠物分类
 * @param {Object} categoryData - 分类数据
 */
export const createPetCategory = (categoryData) => {
    return request('/category/pets', {
        method: 'POST',
        body: categoryData
    })
}

/**
 * 更新宠物分类
 * @param {number} id - 分类 ID
 * @param {Object} categoryData - 分类数据
 */
export const updatePetCategory = (id, categoryData) => {
    return request(`/category/pets/${id}`, {
        method: 'PUT',
        body: categoryData
    })
}

/**
 * 删除宠物分类
 * @param {number} id - 分类 ID
 */
export const deletePetCategory = (id) => {
    return request(`/category/pets/${id}`, {
        method: 'DELETE'
    })
}

/**
 * 获取所有商品分类
 */
export const getProductCategories = () => {
    return request('/category/products', {
        method: 'GET'
    })
}

/**
 * 获取商品分类详情
 * @param {number} id - 分类 ID
 */
export const getProductCategoryDetail = (id) => {
    return request(`/category/products/${id}`, {
        method: 'GET'
    })
}

/**
 * 创建商品分类
 * @param {Object} categoryData - 分类数据
 */
export const createProductCategory = (categoryData) => {
    return request('/category/products', {
        method: 'POST',
        body: categoryData
    })
}

/**
 * 更新商品分类
 * @param {number} id - 分类 ID
 * @param {Object} categoryData - 分类数据
 */
export const updateProductCategory = (id, categoryData) => {
    return request(`/category/products/${id}`, {
        method: 'PUT',
        body: categoryData
    })
}

/**
 * 删除商品分类
 * @param {number} id - 分类 ID
 */
export const deleteProductCategory = (id) => {
    return request(`/category/products/${id}`, {
        method: 'DELETE'
    })
}

// ============ 宠物相关接口 ============

/**
 * 获取宠物列表（支持分页、搜索、过滤）
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.status - 宠物状态
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 */
export const getPetList = (params) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/pet/list?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取宠物详情
 * @param {number} id - 宠物 ID
 */
export const getPetDetail = (id) => {
    return request(`/pet/${id}`, {
        method: 'GET'
    })
}

/**
 * 获取推荐宠物（协同过滤推荐）
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 返回数量，默认10
 * @param {string} params.algorithm - 算法类型：'hybrid'（混合）| 'user'（基于用户）| 'item'（基于物品），默认'hybrid'
 */
export const getRecommendedPets = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    // 接口支持可选认证，登录用户使用协同过滤，未登录用户返回热门
    return request(`/recommend/pets${queryString ? '?' + queryString : ''}`, {
        method: 'GET'
    })
}

/**
 * 记录用户浏览行为
 * @param {number} petId - 宠物 ID
 */
export const recordViewBehavior = (petId) => {
    return request(`/recommend/behavior/view/${petId}`, {
        method: 'POST'
    })
}

/**
 * 记录用户申请领养行为（需要登录）
 * @param {number} petId - 宠物 ID
 */
export const recordApplyBehavior = (petId) => {
    return request('/recommend/behavior/apply', {
        method: 'POST',
        body: { petId }
    })
}

/**
 * 记录用户点赞行为（需要登录）
 * @param {number} petId - 宠物 ID
 */
export const recordLikeBehavior = (petId) => {
    return request('/recommend/behavior/like', {
        method: 'POST',
        body: { petId }
    })
}

/**
 * 检查推荐系统数据收集情况（用于调试）
 */
export const checkRecommendData = () => {
    return request('/recommend/check-data', {
        method: 'GET'
    })
}

/**
 * 创建宠物
 * @param {Object} petData - 宠物数据
 */
export const createPet = (petData) => {
    return request('/pet', {
        method: 'POST',
        body: petData
    })
}

/**
 * 更新宠物信息
 * @param {number} id - 宠物 ID
 * @param {Object} petData - 宠物数据
 */
export const updatePet = (id, petData) => {
    return request(`/pet/${id}`, {
        method: 'PUT',
        body: petData
    })
}

/**
 * 删除宠物（软删除）
 * @param {number} id - 宠物 ID
 */
export const deletePet = (id) => {
    return request(`/pet/${id}`, {
        method: 'DELETE'
    })
}

/**
 * 批量删除宠物
 * @param {Array<number>} ids - 宠物 ID 列表
 */
export const batchDeletePets = (ids) => {
    return request('/pet/batch-delete', {
        method: 'POST',
        body: { ids }
    })
}

// ============ 图片上传相关接口 ============

/**
 * 上传单张图片
 * @param {File} file - 图片文件
 */
export const uploadImage = (file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    return request('/upload/single', {
        method: 'POST',
        headers: {},
        body: formData
    })
}

/**
 * 上传多张图片
 * @param {FileList|File[]} files - 图片文件列表
 */
export const uploadImages = (files) => {
    const formData = new FormData()
    
    if (files instanceof FileList) {
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i])
        }
    } else if (Array.isArray(files)) {
        files.forEach(file => {
            formData.append('images', file)
        })
    }
    
    return request('/upload/multiple', {
        method: 'POST',
        headers: {},
        body: formData
    })
}

/**
 * 删除图片
 * @param {string} filename - 文件名
 */
export const deleteImage = (filename) => {
    return request(`/upload/${filename}`, {
        method: 'DELETE'
    })
}

/**
 * 获取已上传的图片列表
 */
export const getUploadedImages = () => {
    return request('/upload/images', {
        method: 'GET'
    })
}

// ============ 统计相关接口 ============

/**
 * 获取数据总览统计
 */
/**
 * 获取首页统计数据
 */
export const getHomepageStats = () => {
    return request('/statistics/homepage', {
        method: 'GET'
    })
}

export const getOverviewStats = () => {
    return request('/statistics/overview', {
        method: 'GET'
    })
}

/**
 * 获取趋势数据
 * @param {Object} params - 查询参数
 * @param {number} params.days - 天数
 */
export const getTrendData = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/statistics/trend?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取分类统计数据
 */
export const getCategoryStats = () => {
    return request('/statistics/category', {
        method: 'GET'
    })
}

/**
 * 获取每日统计数据
 * @param {Object} params - 查询参数
 * @param {number} params.days - 天数
 */
export const getDailyStats = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/statistics/daily?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取热门数据
 */
export const getHotData = () => {
    return request('/statistics/hot', {
        method: 'GET'
    })
}

/**
 * 生成统计报告
 * @param {Object} params - 报告参数
 * @param {string} params.type - 报告类型 (daily/weekly/monthly/custom)
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 */
export const generateReport = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/report/generate?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 导出报告数据
 * @param {Object} params - 导出参数
 * @param {string} params.format - 导出格式 (json/csv)
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 */
export const exportReport = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/report/export?${queryString}`, {
        method: 'GET'
    })
}

// ============ 报告管理接口 ============

/**
 * 获取报告列表
 * @param {Object} params - 查询参数
 */
export const getReportList = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/report/list?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取报告详情
 * @param {number} id - 报告ID
 */
export const getReportDetail = (id) => {
    return request(`/report/${id}`, {
        method: 'GET'
    })
}

/**
 * 创建报告
 * @param {Object} data - 报告数据
 */
export const createReportRecord = (data) => {
    return request('/report', {
        method: 'POST',
        body: data
    })
}

/**
 * 更新报告
 * @param {number} id - 报告ID
 * @param {Object} data - 报告数据
 */
export const updateReportRecord = (id, data) => {
    return request(`/report/${id}`, {
        method: 'PUT',
        body: data
    })
}

/**
 * 删除报告
 * @param {number} id - 报告ID
 */
export const deleteReportRecord = (id) => {
    return request(`/report/${id}`, {
        method: 'DELETE'
    })
}

/**
 * 发布报告
 * @param {number} id - 报告ID
 */
export const publishReportRecord = (id) => {
    return request(`/report/${id}/publish`, {
        method: 'PUT'
    })
}

/**
 * 归档报告
 * @param {number} id - 报告ID
 */
export const archiveReportRecord = (id) => {
    return request(`/report/${id}/archive`, {
        method: 'PUT'
    })
}

// ============ FAQ常见问题接口 ============

/**
 * 获取FAQ列表
 * @param {Object} params - 查询参数
 */
export const getFaqList = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/faq/list?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取FAQ详情
 * @param {number} id - FAQ ID
 */
export const getFaqDetail = (id) => {
    return request(`/faq/${id}`, {
        method: 'GET'
    })
}

/**
 * 创建FAQ
 * @param {Object} data - FAQ数据
 */
export const createFaq = (data) => {
    return request('/faq', {
        method: 'POST',
        body: data
    })
}

/**
 * 更新FAQ
 * @param {number} id - FAQ ID
 * @param {Object} data - FAQ数据
 */
export const updateFaq = (id, data) => {
    return request(`/faq/${id}`, {
        method: 'PUT',
        body: data
    })
}

/**
 * 删除FAQ
 * @param {number} id - FAQ ID
 */
export const deleteFaq = (id) => {
    return request(`/faq/${id}`, {
        method: 'DELETE'
    })
}

/**
 * 获取FAQ统计
 */
export const getFaqStats = () => {
    return request('/faq/stats', {
        method: 'GET'
    })
}

// ============ 领养故事接口 ============

/**
 * 获取故事列表
 * @param {Object} params - 查询参数
 */
export const getStoryList = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/story/list?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取故事详情
 * @param {number} id - 故事ID
 */
export const getStoryDetail = (id) => {
    return request(`/story/${id}`, {
        method: 'GET'
    })
}

/**
 * 创建故事
 * @param {Object} data - 故事数据
 */
export const createStory = (data) => {
    return request('/story', {
        method: 'POST',
        body: data
    })
}

/**
 * 更新故事
 * @param {number} id - 故事ID
 * @param {Object} data - 故事数据
 */
export const updateStory = (id, data) => {
    return request(`/story/${id}`, {
        method: 'PUT',
        body: data
    })
}

/**
 * 删除故事
 * @param {number} id - 故事ID
 */
export const deleteStory = (id) => {
    return request(`/story/${id}`, {
        method: 'DELETE'
    })
}

/**
 * 发布故事
 * @param {number} id - 故事ID
 */
export const publishStory = (id) => {
    return request(`/story/${id}/publish`, {
        method: 'PUT'
    })
}

/**
 * 获取故事统计
 */
export const getStoryStats = () => {
    return request('/story/stats', {
        method: 'GET'
    })
}

/**
 * 获取推荐故事
 * @param {Object} params - 查询参数
 */
/**
 * 获取推荐故事
 * @param {Object|number} params - 查询参数或返回数量（兼容旧版本）
 */
export const getFeaturedStories = (params = {}) => {
    // 兼容旧版本：如果传入的是数字，转换为对象
    if (typeof params === 'number') {
        params = { limit: params }
    }
    const queryString = new URLSearchParams(params).toString()
    return request(`/story/featured${queryString ? '?' + queryString : ''}`, {
        method: 'GET'
    })
}

/**
 * 获取热门故事
 * @param {Object} params - 查询参数
 */
export const getPopularStories = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/story/popular?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 点赞故事
 * @param {number} id - 故事ID
 */
export const likeStory = (id) => {
    return request(`/story/${id}/like`, {
        method: 'POST'
    })
}

// ============ 商品管理接口 ============

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 */
export const getProductList = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/product/list?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取商品详情
 * @param {number} id - 商品ID
 */
export const getProductDetail = (id) => {
    return request(`/product/${id}`, {
        method: 'GET'
    })
}

/**
 * 创建商品
 * @param {Object} data - 商品数据
 */
export const createProduct = (data) => {
    return request('/product', {
        method: 'POST',
        body: data
    })
}

/**
 * 更新商品
 * @param {number} id - 商品ID
 * @param {Object} data - 商品数据
 */
export const updateProduct = (id, data) => {
    return request(`/product/${id}`, {
        method: 'PUT',
        body: data
    })
}

/**
 * 删除商品
 * @param {number} id - 商品ID
 */
export const deleteProduct = (id) => {
    return request(`/product/${id}`, {
        method: 'DELETE'
    })
}

/**
 * 获取商品统计
 */
export const getProductStats = () => {
    return request('/product/stats', {
        method: 'GET'
    })
}

// ============ 购物车接口 ============

/**
 * 获取购物车列表
 */
export const getCartItems = () => {
    return request('/cart', {
        method: 'GET'
    })
}

/**
 * 添加商品到购物车
 * @param {Object} data - 购物车数据 { product_id, quantity }
 */
export const addToCartAPI = (data) => {
    return request('/cart', {
        method: 'POST',
        body: data
    })
}

/**
 * 更新购物车商品数量
 * @param {number} id - 购物车项ID
 * @param {Object} data - 更新数据 { quantity }
 */
export const updateCartItem = (id, data) => {
    return request(`/cart/${id}`, {
        method: 'PUT',
        body: data
    })
}

/**
 * 删除购物车商品
 * @param {number} id - 购物车项ID
 */
export const removeCartItem = (id) => {
    return request(`/cart/${id}`, {
        method: 'DELETE'
    })
}

/**
 * 批量删除购物车商品
 * @param {Array<number>} ids - 购物车项ID数组
 */
export const batchRemoveCartItems = (ids) => {
    return request('/cart/batch-delete', {
        method: 'POST',
        body: { ids }
    })
}

/**
 * 清空购物车
 */
export const clearCart = () => {
    return request('/cart', {
        method: 'DELETE'
    })
}

// ============ 订单管理接口 ============

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 */
export const getOrderList = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/order/list?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取订单详情
 * @param {number} id - 订单ID
 */
export const getOrderDetail = (id) => {
    return request(`/order/${id}`, {
        method: 'GET'
    })
}

/**
 * 创建订单
 * @param {Object} data - 订单数据
 */
export const createOrder = (data) => {
    return request('/order', {
        method: 'POST',
        body: data
    })
}

/**
 * 更新订单状态
 * @param {number} id - 订单ID
 * @param {Object} data - 状态数据
 */
export const updateOrderStatus = (id, data) => {
    return request(`/order/${id}/status`, {
        method: 'PUT',
        body: data
    })
}

/**
 * 删除订单
 * @param {number} id - 订单ID
 */
export const deleteOrder = (id) => {
    return request(`/order/${id}`, {
        method: 'DELETE'
    })
}

/**
 * 获取订单统计
 */
export const getOrderStats = () => {
    return request('/order/stats', {
        method: 'GET'
    })
}

// ============ 捐赠接口 ============

/**
 * 创建捐赠
 * @param {Object} data - 捐赠数据
 */
export const createDonation = (data) => {
    return request('/donation', {
        method: 'POST',
        body: data
    })
}

/**
 * 获取用户捐赠列表
 * @param {Object} params - 查询参数
 */
export const getUserDonations = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/donation/list?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取捐赠统计
 */
export const getDonationStats = () => {
    return request('/donation/stats', {
        method: 'GET'
    })
}

/**
 * 获取捐赠排行榜
 * @param {Object} params - 查询参数
 */
export const getDonationRanking = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/donation/ranking?${queryString}`, {
        method: 'GET'
    })
}

// ============ 故事评论接口 ============

/**
 * 获取评论列表
 * @param {Object} params - 查询参数
 */
export const getStoryCommentList = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/story-comment/list?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取指定故事的评论
 * @param {number} storyId - 故事ID
 * @param {Object} params - 查询参数
 */
export const getCommentsByStoryId = (storyId, params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/story-comment/story/${storyId}?${queryString}`, {
        method: 'GET'
    })
}

/**
 * 获取评论详情
 * @param {number} id - 评论ID
 */
export const getStoryCommentDetail = (id) => {
    return request(`/story-comment/${id}`, {
        method: 'GET'
    })
}

/**
 * 创建评论
 * @param {Object} data - 评论数据
 */
export const createStoryComment = (data) => {
    return request('/story-comment', {
        method: 'POST',
        body: data
    })
}

/**
 * 更新评论
 * @param {number} id - 评论ID
 * @param {Object} data - 评论数据
 */
export const updateStoryComment = (id, data) => {
    return request(`/story-comment/${id}`, {
        method: 'PUT',
        body: data
    })
}

/**
 * 删除评论
 * @param {number} id - 评论ID
 */
export const deleteStoryComment = (id) => {
    return request(`/story-comment/${id}`, {
        method: 'DELETE'
    })
}

/**
 * 点赞评论
 * @param {number} id - 评论ID
 */
export const likeStoryComment = (id) => {
    return request(`/story-comment/${id}/like`, {
        method: 'PUT'
    })
}

/**
 * 获取评论统计
 */
export const getStoryCommentStats = () => {
    return request('/story-comment/stats', {
        method: 'GET'
    })
}

// ============ 导出工具 ============

export { API_BASE_URL, request }

export default {
    // 用户接口
    register,
    login,
    getAllUsers,
    getUserDetail,
    updateUser,
    deleteUser,
    getCurrentUser,
    updateUserProfile,
    changePassword,
    resetPassword,
    sendVerificationCode,
    
    // 分类接口
    getPetCategories,
    getPetCategoryDetail,
    createPetCategory,
    updatePetCategory,
    deletePetCategory,
    getProductCategories,
    getProductCategoryDetail,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    
    // 宠物接口
    getPetList,
    getPetDetail,
    createPet,
    updatePet,
    deletePet,
    batchDeletePets,
    
    // 图片上传接口
    uploadImage,
    uploadImages,
    deleteImage,
    getUploadedImages,
    
    // 统计接口
    getHomepageStats,
    getOverviewStats,
    getTrendData,
    getCategoryStats,
    getDailyStats,
    getHotData,
    generateReport,
    exportReport,
    
    // 报告管理接口
    getReportList,
    getReportDetail,
    createReportRecord,
    updateReportRecord,
    deleteReportRecord,
    publishReportRecord,
    archiveReportRecord,
    
    // FAQ常见问题接口
    getFaqList,
    getFaqDetail,
    createFaq,
    updateFaq,
    deleteFaq,
    getFaqStats,
    
    // 领养故事接口
    getStoryList,
    getStoryDetail,
    createStory,
    updateStory,
    deleteStory,
    publishStory,
    getStoryStats,
    getFeaturedStories,
    getPopularStories,
    likeStory,
    
    // 故事评论接口
    getStoryCommentList,
    getCommentsByStoryId,
    getStoryCommentDetail,
    createStoryComment,
    updateStoryComment,
    deleteStoryComment,
    likeStoryComment,
    getStoryCommentStats,
    
    // 商品管理接口
    getProductList,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStats,
    
    // 购物车接口
    getCartItems,
    addToCartAPI,
    updateCartItem,
    removeCartItem,
    batchRemoveCartItems,
    clearCart,
    
    // 订单管理接口
    getOrderList,
    getOrderDetail,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderStats,
    
    // 捐赠接口
    createDonation,
    getUserDonations,
    getDonationStats,
    getDonationRanking,
    
    // 领养申请接口
    createAdoptionApplication,
    getUserAdoptions,
    
    // 管理员领养申请接口
    getAllAdoptionApplications,
    getAdoptionApplicationDetail,
    updateAdoptionApplicationStatus,
    getAdoptionApplicationStats,
    
    // 工具
    request,
    API_BASE_URL
}

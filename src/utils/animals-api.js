/**
 * 动物管理相关的 API 接口
 */

import axios from 'axios'

const BASE_URL = '/api/admin'

/**
 * 获取动物列表
 * @param {Object} params - 查询参数
 * @param {string} params.name - 动物名称
 * @param {string} params.category - 动物分类
 * @param {string} params.status - 动物状态 (available/adopted/offline)
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export const getAnimalList = (params) => {
    return axios.get(`${BASE_URL}/animals`, { params })
}

/**
 * 获取动物详情
 * @param {number} id - 动物 ID
 * @returns {Promise}
 */
export const getAnimalDetail = (id) => {
    return axios.get(`${BASE_URL}/animals/${id}`)
}

/**
 * 创建动物
 * @param {Object} data - 动物数据
 * @returns {Promise}
 */
export const createAnimal = (data) => {
    return axios.post(`${BASE_URL}/animals`, data)
}

/**
 * 更新动物信息
 * @param {number} id - 动物 ID
 * @param {Object} data - 动物数据
 * @returns {Promise}
 */
export const updateAnimal = (id, data) => {
    return axios.put(`${BASE_URL}/animals/${id}`, data)
}

/**
 * 删除动物
 * @param {number} id - 动物 ID
 * @returns {Promise}
 */
export const deleteAnimal = (id) => {
    return axios.delete(`${BASE_URL}/animals/${id}`)
}

/**
 * 批量删除动物
 * @param {Array<number>} ids - 动物 ID 列表
 * @returns {Promise}
 */
export const batchDeleteAnimals = (ids) => {
    return axios.post(`${BASE_URL}/animals/batch-delete`, { ids })
}

/**
 * 获取动物分类列表
 * @returns {Promise}
 */
export const getCategories = () => {
    return axios.get(`${BASE_URL}/animals/categories`)
}

/**
 * 创建动物分类
 * @param {Object} data - 分类数据
 * @returns {Promise}
 */
export const createCategory = (data) => {
    return axios.post(`${BASE_URL}/animals/categories`, data)
}

/**
 * 更新动物分类
 * @param {number} id - 分类 ID
 * @param {Object} data - 分类数据
 * @returns {Promise}
 */
export const updateCategory = (id, data) => {
    return axios.put(`${BASE_URL}/animals/categories/${id}`, data)
}

/**
 * 删除动物分类
 * @param {number} id - 分类 ID
 * @returns {Promise}
 */
export const deleteCategory = (id) => {
    return axios.delete(`${BASE_URL}/animals/categories/${id}`)
}

/**
 * 上传动物图片
 * @param {FormData} formData - 表单数据
 * @returns {Promise}
 */
export const uploadAnimalImage = (formData) => {
    return axios.post(`${BASE_URL}/animals/upload-image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 批量上传图片
 * @param {FormData} formData - 表单数据
 * @returns {Promise}
 */
export const uploadMultipleImages = (formData) => {
    return axios.post(`${BASE_URL}/animals/upload-images`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 修改动物状态
 * @param {number} id - 动物 ID
 * @param {string} status - 新状态
 * @returns {Promise}
 */
export const updateAnimalStatus = (id, status) => {
    return axios.patch(`${BASE_URL}/animals/${id}/status`, { status })
}

/**
 * 导出动物列表为 CSV
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const exportAnimalList = (params) => {
    return axios.get(`${BASE_URL}/animals/export`, {
        params,
        responseType: 'blob'
    })
}

/**
 * 获取动物统计信息
 * @returns {Promise}
 */
export const getAnimalStatistics = () => {
    return axios.get(`${BASE_URL}/animals/statistics`)
}

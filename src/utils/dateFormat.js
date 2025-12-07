/**
 * 统一的时间格式化工具
 */

/**
 * 格式化日期时间
 * @param {string|number|Date} dateTime - 日期时间（可以是时间戳、日期字符串或Date对象）
 * @param {string} format - 格式类型：'date' | 'datetime' | 'time'
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(dateTime, format = 'datetime') {
    if (!dateTime) return '-'

    let date

    // 处理不同类型的输入
    if (dateTime instanceof Date) {
        date = dateTime
    } else if (typeof dateTime === 'number') {
        // 时间戳（可能是秒或毫秒）
        date = new Date(dateTime > 1000000000000 ? dateTime : dateTime * 1000)
    } else if (typeof dateTime === 'string') {
        // 字符串日期
        // 如果是纯数字字符串，当作时间戳处理
        if (/^\d+$/.test(dateTime)) {
            const timestamp = parseInt(dateTime)
            date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000)
        } else {
            date = new Date(dateTime)
        }
    } else {
        return '-'
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
        return '-'
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    switch (format) {
        case 'date':
            return `${year}-${month}-${day}`
        case 'time':
            return `${hours}:${minutes}:${seconds}`
        case 'datetime':
        default:
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
}

/**
 * 格式化日期（仅日期部分）
 * @param {string|number|Date} dateTime - 日期时间
 * @returns {string} 格式化后的日期字符串 YYYY-MM-DD
 */
export function formatDate(dateTime) {
    return formatDateTime(dateTime, 'date')
}

/**
 * 格式化时间（仅时间部分）
 * @param {string|number|Date} dateTime - 日期时间
 * @returns {string} 格式化后的时间字符串 HH:mm:ss
 */
export function formatTime(dateTime) {
    return formatDateTime(dateTime, 'time')
}

/**
 * 格式化日期时间（用于API请求）
 * @param {Date|string} date - 日期对象或日期字符串
 * @returns {string} YYYY-MM-DD 格式的字符串
 */
export function formatDateForAPI(date) {
    if (!date) return ''
    
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return ''
    
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
}


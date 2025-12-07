/**
 * 图标映射工具
 * 用于将数字转换为对应的图标/emoji
 */

// 图标映射表 - 可根据需要扩展
export const iconMap = {
    1: '🐕',      // 狗狗
    2: '🐈',      // 猫咪
    3: '🐰',      // 兔子
    4: '🐹',      // 仓鼠
    5: '🦜',      // 鹦鹉
    6: '🐠',      // 鱼
    7: '🦎',      // 蜥蜴
    8: '🐢',      // 乌龟
    9: '🦔',      // 刺猬
    10: '🐇',     // 小兔
};

// 商品分类图标
export const productIconMap = {
    1: '🦴',      // 狗狗用品
    2: '🧶',      // 猫咪用品
    3: '🍖',      // 食品营养
    4: '💊',      // 药品保健
    5: '🛏️',      // 窝/床
    6: '🎾',      // 玩具
    7: '📚',      // 用品
    8: '👕',      // 衣服
};

/**
 * 根据分类ID获取图标
 * @param {number} iconId - 图标ID
 * @param {string} type - 分类类型: 'pet' | 'product'
 * @returns {string} 返回对应的图标emoji
 */
export const getIconById = (iconId, type = 'pet') => {
    if (type === 'product') {
        return productIconMap[iconId] || '📦';
    }
    return iconMap[iconId] || '🐾';
};

/**
 * 获取所有可用的图标列表
 * @param {string} type - 分类类型: 'pet' | 'product'
 * @returns {Array} 返回图标列表 [{id, icon, label}]
 */
export const getAllIcons = (type = 'pet') => {
    const map = type === 'product' ? productIconMap : iconMap;
    return Object.entries(map).map(([id, icon]) => ({
        id: parseInt(id),
        icon,
        label: `${icon} (ID: ${id})`
    }));
};

/**
 * 根据分类数据获取格式化的分类信息
 * @param {Object} category - 分类对象 {id, name, icon, ...}
 * @param {string} type - 分类类型: 'pet' | 'product'
 * @returns {Object} 返回格式化后的分类对象
 */
export const formatCategoryWithIcon = (category, type = 'pet') => {
    if (!category) return null;
    
    return {
        ...category,
        iconEmoji: getIconById(category.icon, type),
        displayName: `${getIconById(category.icon, type)} ${category.name}`
    };
};

/**
 * 格式化分类列表
 * @param {Array} categories - 分类列表
 * @param {string} type - 分类类型: 'pet' | 'product'
 * @returns {Array} 返回格式化后的分类列表
 */
export const formatCategoriesWithIcons = (categories, type = 'pet') => {
    if (!Array.isArray(categories)) return [];
    return categories.map(category => formatCategoryWithIcon(category, type));
};

export default {
    iconMap,
    productIconMap,
    getIconById,
    getAllIcons,
    formatCategoryWithIcon,
    formatCategoriesWithIcons
};

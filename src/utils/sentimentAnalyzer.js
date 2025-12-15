/**
 * 中文情感分析工具
 * 基于情感词典的简单情感分析实现
 */

// 积极情感词汇
const positiveWords = [
    // 通用积极词
    '好', '棒', '赞', '优秀', '出色', '完美', '精彩', '太棒了', '很好', '非常好',
    '喜欢', '爱', '开心', '高兴', '快乐', '幸福', '满意', '满足', '欣慰', '感动',
    '感谢', '谢谢', '感恩', '温暖', '温馨', '美好', '美丽', '漂亮', '可爱', '萌',
    '支持', '加油', '鼓励', '希望', '期待', '祝福', '祝愿', '恭喜', '庆祝',
    '成功', '胜利', '进步', '提升', '改善', '优化', '创新', '突破',
    '真棒', '厉害', '牛', '强', '帅', '酷', '给力', '666', 'nice', 'good',
    
    // 领养相关积极词
    '领养', '收养', '救助', '帮助', '照顾', '陪伴', '守护', '呵护', '关爱', '关心',
    '健康', '活泼', '乖巧', '听话', '聪明', '机灵', '粘人', '亲人', '温顺', '友好',
    '治愈', '暖心', '贴心', '懂事', '忠诚', '信任', '依赖', '安心', '放心',
    '新家', '家庭', '幸运', '缘分', '命运', '相遇', '相伴', '一起', '永远',
    '融入', '适应', '习惯', '接受', '欢迎', '迎接',
    
    // 志愿者相关
    '志愿者', '奉献', '付出', '贡献', '无私', '伟大', '敬佩', '尊敬', '致敬', '点赞'
];

// 消极情感词汇
const negativeWords = [
    // 通用消极词
    '差', '烂', '糟糕', '失望', '遗憾', '可惜', '难过', '伤心', '悲伤', '痛苦',
    '讨厌', '厌恶', '反感', '恶心', '无聊', '烦', '烦躁', '焦虑', '担心', '害怕',
    '生气', '愤怒', '恼火', '不满', '抱怨', '投诉', '批评', '指责', '责怪',
    '失败', '错误', '问题', '麻烦', '困难', '障碍', '阻碍',
    '垃圾', '废物', '骗子', '欺骗', '虚假', '假的', '坑', '黑心',
    '不好', '不行', '不对', '不是', '不能', '不会', '不想', '不要',
    
    // 动物相关消极词
    '虐待', '遗弃', '抛弃', '丢弃', '流浪', '可怜', '心疼', '难受',
    '生病', '受伤', '疾病', '死亡', '去世', '离开', '分离',
    '攻击', '咬人', '凶', '危险', '不安全'
];

// 程度副词（增强情感强度）
const intensifiers = {
    '非常': 2,
    '特别': 2,
    '十分': 2,
    '极其': 2.5,
    '超级': 2,
    '太': 1.8,
    '真': 1.5,
    '好': 1.3,
    '很': 1.5,
    '挺': 1.3,
    '相当': 1.5,
    '格外': 1.8,
    '尤其': 1.5,
    '更': 1.3,
    '最': 2,
    '极': 2
};

// 否定词（反转情感）
const negations = ['不', '没', '无', '非', '别', '莫', '未', '勿', '休', '否'];

/**
 * 分析文本情感
 * @param {string} text - 要分析的文本
 * @returns {object} - 情感分析结果
 */
function analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
        return {
            score: 0,
            sentiment: 'neutral',
            label: '中性',
            confidence: 0,
            details: {
                positiveCount: 0,
                negativeCount: 0,
                positiveWords: [],
                negativeWords: []
            }
        };
    }

    // 清理文本
    const cleanText = text.toLowerCase().trim();
    
    let positiveScore = 0;
    let negativeScore = 0;
    const foundPositive = [];
    const foundNegative = [];
    
    // 检测积极词汇
    for (const word of positiveWords) {
        if (cleanText.includes(word)) {
            let score = 1;
            
            // 检查是否有程度副词
            for (const [intensifier, multiplier] of Object.entries(intensifiers)) {
                if (cleanText.includes(intensifier + word)) {
                    score *= multiplier;
                    break;
                }
            }
            
            // 检查是否有否定词
            let negated = false;
            for (const negation of negations) {
                // 检查否定词是否在情感词前面（简单检测）
                const negIndex = cleanText.indexOf(negation);
                const wordIndex = cleanText.indexOf(word);
                if (negIndex !== -1 && wordIndex !== -1 && negIndex < wordIndex && wordIndex - negIndex <= 3) {
                    negated = true;
                    break;
                }
            }
            
            if (negated) {
                negativeScore += score;
                foundNegative.push('不' + word);
            } else {
                positiveScore += score;
                foundPositive.push(word);
            }
        }
    }
    
    // 检测消极词汇
    for (const word of negativeWords) {
        if (cleanText.includes(word)) {
            let score = 1;
            
            // 检查是否有程度副词
            for (const [intensifier, multiplier] of Object.entries(intensifiers)) {
                if (cleanText.includes(intensifier + word)) {
                    score *= multiplier;
                    break;
                }
            }
            
            // 检查是否有否定词（否定消极词变积极）
            let negated = false;
            for (const negation of negations) {
                const negIndex = cleanText.indexOf(negation);
                const wordIndex = cleanText.indexOf(word);
                if (negIndex !== -1 && wordIndex !== -1 && negIndex < wordIndex && wordIndex - negIndex <= 3) {
                    negated = true;
                    break;
                }
            }
            
            if (negated) {
                positiveScore += score * 0.5; // 否定消极词的积极程度较弱
                foundPositive.push('不' + word);
            } else {
                negativeScore += score;
                foundNegative.push(word);
            }
        }
    }
    
    // 计算最终得分 (-1 到 1 之间)
    const totalScore = positiveScore - negativeScore;
    const maxPossibleScore = Math.max(positiveScore + negativeScore, 1);
    const normalizedScore = Math.max(-1, Math.min(1, totalScore / maxPossibleScore));
    
    // 确定情感类别
    let sentiment, label;
    if (normalizedScore > 0.2) {
        sentiment = 'positive';
        label = '积极';
    } else if (normalizedScore < -0.2) {
        sentiment = 'negative';
        label = '消极';
    } else {
        sentiment = 'neutral';
        label = '中性';
    }
    
    // 计算置信度
    const confidence = Math.min(1, (positiveScore + negativeScore) / 3);
    
    return {
        score: Math.round(normalizedScore * 100) / 100,
        sentiment,
        label,
        confidence: Math.round(confidence * 100) / 100,
        details: {
            positiveCount: foundPositive.length,
            negativeCount: foundNegative.length,
            positiveWords: [...new Set(foundPositive)].slice(0, 5),
            negativeWords: [...new Set(foundNegative)].slice(0, 5)
        }
    };
}

/**
 * 批量分析情感
 * @param {string[]} texts - 文本数组
 * @returns {object[]} - 情感分析结果数组
 */
function analyzeBatch(texts) {
    return texts.map(text => analyzeSentiment(text));
}

/**
 * 获取情感统计
 * @param {object[]} results - 情感分析结果数组
 * @returns {object} - 统计信息
 */
function getSentimentStats(results) {
    const stats = {
        total: results.length,
        positive: 0,
        negative: 0,
        neutral: 0,
        averageScore: 0
    };
    
    let totalScore = 0;
    for (const result of results) {
        totalScore += result.score;
        if (result.sentiment === 'positive') stats.positive++;
        else if (result.sentiment === 'negative') stats.negative++;
        else stats.neutral++;
    }
    
    stats.averageScore = results.length > 0 
        ? Math.round((totalScore / results.length) * 100) / 100 
        : 0;
    
    return stats;
}

module.exports = {
    analyzeSentiment,
    analyzeBatch,
    getSentimentStats
};

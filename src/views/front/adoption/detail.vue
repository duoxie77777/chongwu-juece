<template>
    <div class="pet-detail-page">
        <header-layout></header-layout>

        <div v-loading="loading" class="detail-container">
            <div v-if="petInfo" class="detail-content">
                <!-- 返回按钮 -->
                <div class="back-button">
                    <el-button icon="el-icon-arrow-left" @click="goBack">返回列表</el-button>
                </div>

                <!-- 宠物信息卡片 -->
                <div class="pet-info-card">
                    <div class="pet-image-section">
                        <img :src="petImage" :alt="petInfo.pet_name" class="main-image">
                        <div class="status-badge" :class="petInfo.status">
                            {{ getStatusText(petInfo.status) }}
                        </div>
                    </div>

                    <div class="pet-details-section">
                        <h1 class="pet-name">{{ petInfo.pet_name }}</h1>
                        <div class="pet-tags">
                            <span class="tag type-tag">{{ getTypeName(petInfo.pet_type) }}</span>
                            <span class="tag" v-if="petInfo.breed">{{ petInfo.breed }}</span>
                            <span class="tag" v-if="petInfo.gender">{{ getGenderName(petInfo.gender) }}</span>
                        </div>

                        <div class="info-grid">
                            <div class="info-item">
                                <i class="el-icon-time"></i>
                                <span class="label">年龄：</span>
                                <span class="value">{{ petInfo.age ? `${petInfo.age}岁` : '未知' }}</span>
                            </div>
                            <div class="info-item">
                                <i class="el-icon-sort"></i>
                                <span class="label">体型：</span>
                                <span class="value">{{ getSizeName(petInfo.size) }}</span>
                            </div>
                            <div class="info-item">
                                <i class="el-icon-s-data"></i>
                                <span class="label">体重：</span>
                                <span class="value">{{ petInfo.weight ? `${petInfo.weight}kg` : '未知' }}</span>
                            </div>
                            <div class="info-item">
                                <i class="el-icon-brush"></i>
                                <span class="label">颜色：</span>
                                <span class="value">{{ petInfo.color || '未知' }}</span>
                            </div>
                            <div class="info-item" v-if="petInfo.breed">
                                <i class="el-icon-star-on"></i>
                                <span class="label">品种：</span>
                                <span class="value">{{ petInfo.breed }}</span>
                            </div>
                            <div class="info-item" v-if="petInfo.rescue_date">
                                <i class="el-icon-date"></i>
                                <span class="label">救助日期：</span>
                                <span class="value">{{ formatDate(petInfo.rescue_date) }}</span>
                            </div>
                        </div>

                        <div class="health-info">
                            <h3><i class="el-icon-first-aid-kit"></i> 健康信息</h3>
                            <div class="health-grid">
                                <div class="health-item">
                                    <i class="el-icon-check" :class="{ checked: petInfo.vaccination }"></i>
                                    <span>{{ petInfo.vaccination ? '已接种疫苗' : '未接种疫苗' }}</span>
                                </div>
                                <div class="health-item">
                                    <i class="el-icon-check" :class="{ checked: petInfo.sterilization }"></i>
                                    <span>{{ petInfo.sterilization ? '已绝育' : '未绝育' }}</span>
                                </div>
                                <div class="health-item">
                                    <i class="el-icon-info"></i>
                                    <span>健康状况：<strong>{{ petInfo.health_status || '良好' }}</strong></span>
                                </div>
                            </div>
                        </div>

                        <div class="action-buttons">
                            <el-button 
                                type="primary" 
                                size="large"
                                @click="goToAdopt"
                                :disabled="petInfo.status !== 'available'"
                                class="adopt-button">
                                <i class="el-icon-heart"></i>
                                {{ petInfo.status === 'available' ? '立即领养' : '暂不可领养' }}
                            </el-button>
                        </div>
                    </div>
                </div>

                <!-- 详细信息 -->
                <div class="detail-sections">
                    <div class="section-card">
                        <h2><i class="el-icon-info"></i> 关于我</h2>
                        <div class="description-content">
                            <p class="description">{{ petInfo.description || '暂无描述' }}</p>
                            <div v-if="!petInfo.description" class="empty-tip">
                                <i class="el-icon-warning"></i>
                                <span>暂无详细描述信息</span>
                            </div>
                        </div>
                    </div>

                    <div class="section-card" v-if="petInfo.character">
                        <h2><i class="el-icon-star-on"></i> 性格特点</h2>
                        <div class="character-content">
                            <p>{{ petInfo.character }}</p>
                        </div>
                    </div>

                    <div class="section-card" v-if="petInfo.rescue_story">
                        <h2><i class="el-icon-document"></i> 救助故事</h2>
                        <div class="story-content">
                            <p>{{ petInfo.rescue_story }}</p>
                            <div v-if="petInfo.rescue_date || petInfo.rescue_location" class="rescue-info">
                                <div class="rescue-item" v-if="petInfo.rescue_date">
                                    <i class="el-icon-date"></i>
                                    <div>
                                        <strong>救助日期：</strong>
                                        <span>{{ formatDate(petInfo.rescue_date) }}</span>
                                    </div>
                                </div>
                                <div class="rescue-item" v-if="petInfo.rescue_location">
                                    <i class="el-icon-location"></i>
                                    <div>
                                        <strong>救助地点：</strong>
                                        <span>{{ petInfo.rescue_location }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 饲养建议 -->
                    <div class="section-card">
                        <h2><i class="el-icon-reading"></i> 饲养建议</h2>
                        <div class="care-tips">
                            <div class="tip-item">
                                <i class="el-icon-food"></i>
                                <div>
                                    <h4>饮食建议</h4>
                                    <p>建议选择适合{{ getTypeName(petInfo.pet_type) }}的优质宠物食品，每日定时定量喂食，保证充足的新鲜水源。</p>
                                </div>
                            </div>
                            <div class="tip-item">
                                <i class="el-icon-first-aid-kit"></i>
                                <div>
                                    <h4>健康护理</h4>
                                    <p>定期进行健康检查，按时接种疫苗和驱虫。保持宠物的清洁卫生，定期洗澡和梳理毛发。</p>
                                </div>
                            </div>
                            <div class="tip-item">
                                <i class="el-icon-s-home"></i>
                                <div>
                                    <h4>生活环境</h4>
                                    <p>为宠物提供舒适安全的生活环境，准备合适的窝、玩具和活动空间。保持室内温度适宜，避免极端天气。</p>
                                </div>
                            </div>
                            <div class="tip-item">
                                <i class="el-icon-user"></i>
                                <div>
                                    <h4>陪伴互动</h4>
                                    <p>给予宠物足够的陪伴和关爱，定期进行互动游戏和训练。建立良好的信任关系，让宠物感受到家的温暖。</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 领养要求 -->
                    <div class="section-card">
                        <h2><i class="el-icon-document-checked"></i> 领养要求</h2>
                        <div class="requirements">
                            <div class="requirement-item">
                                <i class="el-icon-check"></i>
                                <span>年满18周岁，有稳定的经济来源</span>
                            </div>
                            <div class="requirement-item">
                                <i class="el-icon-check"></i>
                                <span>有固定的住所，能够为宠物提供安全舒适的生活环境</span>
                            </div>
                            <div class="requirement-item">
                                <i class="el-icon-check"></i>
                                <span>家庭成员同意领养，能够承担长期照顾责任</span>
                            </div>
                            <div class="requirement-item">
                                <i class="el-icon-check"></i>
                                <span>愿意接受我们的回访，确保宠物得到妥善照顾</span>
                            </div>
                            <div class="requirement-item">
                                <i class="el-icon-check"></i>
                                <span>承诺不遗弃、不虐待，如无法继续饲养需联系我们</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="!loading" class="no-data">
                <p>宠物信息不存在</p>
                <el-button @click="goBack">返回列表</el-button>
            </div>
        </div>

        <footer-layout></footer-layout>
    </div>
</template>

<script>
import { getPetDetail, recordViewBehavior } from '@/utils/api'

const API_BASE_URL = 'http://localhost:8889'

export default {
    name: 'PetDetail',
    data() {
        return {
            loading: false,
            petInfo: null,
            petId: null
        }
    },
    computed: {
        petImage() {
            if (!this.petInfo || !this.petInfo.image_url) {
                return require('@/assets/front/index/wrapper-1.jpg')
            }
            if (this.petInfo.image_url.startsWith('http')) {
                return this.petInfo.image_url
            }
            return `${API_BASE_URL}${this.petInfo.image_url}`
        }
    },
    mounted() {
        this.petId = this.$route.query.id
        if (this.petId) {
            this.loadPetDetail()
        } else {
            this.$message.error('缺少宠物ID')
            this.goBack()
        }
    },
    methods: {
        async loadPetDetail() {
            this.loading = true
            try {
                const response = await getPetDetail(this.petId)
                if (response.data && response.data.code === 200) {
                    this.petInfo = response.data.data
                    
                    // 记录用户浏览行为（用于推荐系统）
                    this.recordViewBehavior()
                } else {
                    this.$message.error('获取宠物信息失败')
                    this.goBack()
                }
            } catch (error) {
                console.error('加载宠物详情失败:', error)
                this.$message.error('加载宠物信息失败')
                this.goBack()
            } finally {
                this.loading = false
            }
        },
        
        // 记录浏览行为
        async recordViewBehavior() {
            if (!this.petId) return
            
            try {
                // 静默记录，不显示错误（避免影响用户体验）
                await recordViewBehavior(this.petId)
                console.log(`[推荐系统] 已记录浏览宠物 ${this.petId} 的行为`)
            } catch (error) {
                // 静默失败，不影响页面显示
                console.log(`[推荐系统] 记录浏览行为失败（可能未登录）:`, error)
            }
        },

        getTypeName(petType) {
            const typeMap = {
                'dog': '狗狗',
                'cat': '猫咪',
                'other': '其他'
            }
            return typeMap[petType] || '其他'
        },

        getGenderName(gender) {
            const genderMap = {
                'male': '公',
                'female': '母',
                'unknown': '未知'
            }
            return genderMap[gender] || '未知'
        },

        getSizeName(size) {
            const sizeMap = {
                'small': '小型',
                'medium': '中型',
                'large': '大型'
            }
            return sizeMap[size] || '未知'
        },

        getStatusText(status) {
            const statusMap = {
                'available': '待领养',
                'adopted': '已领养',
                'reserved': '已预订',
                'unavailable': '不可领养'
            }
            return statusMap[status] || '未知'
        },

        formatDate(date) {
            if (!date) return '未知'
            
            // 如果是时间戳（数字）
            if (typeof date === 'number' || /^\d+$/.test(date)) {
                const d = new Date(parseInt(date))
                if (isNaN(d.getTime())) return date
                const year = d.getFullYear()
                const month = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
            }
            
            // 如果是日期字符串，尝试解析
            try {
                const d = new Date(date)
                if (!isNaN(d.getTime())) {
                    const year = d.getFullYear()
                    const month = String(d.getMonth() + 1).padStart(2, '0')
                    const day = String(d.getDate()).padStart(2, '0')
                    return `${year}-${month}-${day}`
                }
            } catch (e) {
                // 解析失败，返回原值
            }
            
            // 如果已经是 YYYY-MM-DD 格式，直接返回
            if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
                return date.split(' ')[0] // 如果有时间部分，只取日期部分
            }
            
            return date
        },

        goToAdopt() {
            if (this.petId) {
                this.$router.push(`/adoption/adopt?id=${this.petId}`)
            } else {
                this.$router.push('/adoption/adopt')
            }
        },

        goBack() {
            this.$router.push('/adoption/list')
        }
    }
}
</script>

<style lang="less" scoped>
.pet-detail-page {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
}

.back-button {
    margin-bottom: 20px;
}

.pet-info-card {
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 40px;
    margin-bottom: 30px;

    .pet-image-section {
        position: relative;

        .main-image {
            width: 100%;
            height: 400px;
            object-fit: cover;
            border-radius: 12px;
        }

        .status-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            color: white;

            &.available {
                background-color: #52c41a;
            }

            &.adopted {
                background-color: #999;
            }

            &.reserved {
                background-color: #faad14;
            }

            &.unavailable {
                background-color: #ff4d4f;
            }
        }
    }

    .pet-details-section {
        .pet-name {
            font-size: 32px;
            color: #333;
            margin: 0 0 20px 0;
            font-weight: bold;
        }

        .pet-tags {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;

            .tag {
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 14px;
                background-color: #f0f0f0;
                color: #666;

                &.type-tag {
                    background-color: #d52b1e;
                    color: white;
                }
            }
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #fafafa;
            border-radius: 8px;

            .info-item {
                display: flex;
                align-items: center;
                gap: 8px;

                i {
                    color: #d52b1e;
                    font-size: 16px;
                }

                .label {
                    color: #999;
                    margin-right: 4px;
                }

                .value {
                    color: #333;
                    font-weight: 500;
                }
            }
        }

        .health-info {
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f0f9ff;
            border-radius: 8px;

            h3 {
                font-size: 18px;
                color: #333;
                margin: 0 0 15px 0;
            }

            .health-grid {
                display: flex;
                flex-direction: column;
                gap: 10px;

                .health-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #666;

                    i {
                        color: #ccc;

                        &.checked {
                            color: #52c41a;
                        }
                    }
                }
            }
        }

        .action-buttons {
            margin-top: 30px;

            .adopt-button {
                width: 100%;
                background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
                border: none;
                font-size: 18px;
                font-weight: bold;
                height: 50px;
                box-shadow: 0 4px 12px rgba(213, 43, 30, 0.3);
                transition: all 0.3s ease;

                &:hover:not(:disabled) {
                    background: linear-gradient(135deg, #c21d0f 0%, #d7442f 100%);
                    box-shadow: 0 6px 20px rgba(213, 43, 30, 0.4);
                    transform: translateY(-2px);
                }

                &:active:not(:disabled) {
                    transform: translateY(0);
                }

                &:disabled {
                    background: #ccc;
                    box-shadow: none;
                }

                i {
                    margin-right: 8px;
                    font-size: 20px;
                }
            }
        }
    }
}

.detail-sections {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .section-card {
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

        h2 {
            font-size: 22px;
            color: #333;
            margin: 0 0 20px 0;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
            display: flex;
            align-items: center;
            gap: 10px;

            i {
                color: #d52b1e;
                font-size: 24px;
            }
        }

        p {
            color: #666;
            line-height: 1.8;
            margin: 0;
        }

        .description-content {
            .description {
                font-size: 16px;
                line-height: 2;
                text-align: justify;
            }

            .empty-tip {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #999;
                padding: 20px;
                background-color: #fafafa;
                border-radius: 8px;

                i {
                    font-size: 18px;
                }
            }
        }

        .character-content,
        .story-content {
            p {
                font-size: 16px;
                line-height: 2;
                text-align: justify;
            }
        }

        .rescue-info {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid #f0f0f0;
            display: flex;
            flex-direction: column;
            gap: 15px;

            .rescue-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 12px;
                background-color: #fafafa;
                border-radius: 8px;

                i {
                    color: #d52b1e;
                    font-size: 18px;
                    margin-top: 2px;
                }

                div {
                    flex: 1;

                    strong {
                        color: #333;
                        margin-right: 8px;
                    }

                    span {
                        color: #666;
                    }
                }
            }
        }

        .care-tips {
            display: flex;
            flex-direction: column;
            gap: 20px;

            .tip-item {
                display: flex;
                gap: 15px;
                padding: 20px;
                background-color: #fafafa;
                border-radius: 8px;
                border-left: 4px solid #d52b1e;
                transition: all 0.3s ease;

                &:hover {
                    background-color: #f5f5f5;
                    transform: translateX(5px);
                }

                i {
                    color: #d52b1e;
                    font-size: 24px;
                    flex-shrink: 0;
                }

                div {
                    flex: 1;

                    h4 {
                        font-size: 16px;
                        color: #333;
                        margin: 0 0 8px 0;
                        font-weight: bold;
                    }

                    p {
                        font-size: 14px;
                        color: #666;
                        line-height: 1.8;
                        margin: 0;
                    }
                }
            }
        }

        .requirements {
            display: flex;
            flex-direction: column;
            gap: 15px;

            .requirement-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 15px;
                background-color: #fff5f5;
                border-radius: 8px;
                border: 1px solid #ffe8e8;
                transition: all 0.3s ease;

                &:hover {
                    background-color: #fff0f0;
                    border-color: #d52b1e;
                }

                i {
                    color: #d52b1e;
                    font-size: 18px;
                    flex-shrink: 0;
                }

                span {
                    color: #666;
                    font-size: 15px;
                    line-height: 1.6;
                }
            }
        }
    }
}

.no-data {
    text-align: center;
    padding: 100px 20px;

    p {
        font-size: 18px;
        color: #999;
        margin-bottom: 20px;
    }
}

@media (max-width: 768px) {
    .pet-info-card {
        grid-template-columns: 1fr;
        padding: 20px;

        .pet-image-section .main-image {
            height: 300px;
        }
    }

    .info-grid {
        grid-template-columns: 1fr !important;
    }
}
</style>


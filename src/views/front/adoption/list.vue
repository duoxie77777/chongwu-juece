<template>
    <div class="adoption-list-page">
        <!-- 页面标题区域 -->
        <section class="page-header">
            <div class="header-content">
                <h1>找到你的伙伴</h1>
                <p>选择一个需要温暖家庭的动物朋友</p>
            </div>
        </section>

        <!-- 筛选区域 -->
        <section class="filter-section">
            <div class="filter-container">
                <div class="filter-group">
                    <label>动物类型：</label>
                    <div class="filter-options">
                        <button 
                            v-for="type in animalTypes" 
                            :key="type"
                            :class="['filter-btn', { active: selectedType === type }]"
                            @click="selectedType = type"
                        >
                            {{ type }}
                        </button>
                    </div>
                </div>
                <div class="filter-group">
                    <label>年龄范围：</label>
                    <div class="filter-options">
                        <button 
                            v-for="age in ageRanges" 
                            :key="age"
                            :class="['filter-btn', { active: selectedAge === age }]"
                            @click="selectedAge = age"
                        >
                            {{ age }}
                        </button>
                    </div>
                </div>
                <div class="filter-group">
                    <label>搜索：</label>
                    <input 
                        v-model="searchKeyword"
                        type="text" 
                        placeholder="输入动物名称..."
                        class="search-input"
                    >
                </div>
            </div>
        </section>

        <!-- 动物列表区域 -->
        <section class="animals-section">
            <div class="animals-container">
                <div v-loading="loading" class="loading-container">
                    <div v-if="animals.length > 0" class="animals-grid">
                        <div v-for="animal in animals" :key="animal.id" class="animal-card">
                            <div class="card-image">
                                <img :src="animal.image" :alt="animal.name">
                                <div class="tag" :style="{ backgroundColor: animal.tagColor }">
                                    {{ animal.type }}
                                </div>
                            </div>
                            <div class="card-content">
                                <h3>{{ animal.name }}</h3>
                                <div class="info-row">
                                    <span class="label">年龄：</span>
                                    <span class="value">{{ animal.age }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">性别：</span>
                                    <span class="value">{{ animal.gender }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">性格：</span>
                                    <span class="value">{{ animal.personality }}</span>
                                </div>
                                <p class="description">{{ animal.description }}</p>
                                <div class="card-footer">
                                    <button class="detail-btn" @click="goToDetail(animal.id)">了解更多</button>
                                    <button class="adopt-btn" @click="goToAdopt(animal.id)">立即领养</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="!loading" class="no-results">
                        <p>😿 暂无符合条件的动物</p>
                        <button @click="resetFilters" class="reset-btn">清除筛选条件</button>
                    </div>
                </div>

                <!-- 分页 -->
                <div v-if="pagination.totalPages > 1 && !loading" class="pagination-container">
                    <el-pagination
                        @current-change="handlePageChange"
                        :current-page="pagination.page"
                        :page-size="pagination.size"
                        :total="pagination.total"
                        layout="prev, pager, next, jumper, total"
                        background>
                    </el-pagination>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { getPetList } from '@/utils/api'

const API_BASE_URL = 'http://localhost:8889'

export default {
    name: 'adoptionList',
    data() {
        return {
            loading: false,
            selectedType: '全部',
            selectedAge: '全部',
            searchKeyword: '',
            animalTypes: ['全部', '狗狗', '猫咪', '其他'],
            ageRanges: ['全部', '0-1岁', '1-3岁', '3-5岁', '5岁以上'],
            animals: [],
            pagination: {
                page: 1,
                size: 12,
                total: 0,
                totalPages: 0
            },
            // 类型映射：前端显示 -> 后端字段
            typeMap: {
                '全部': '',
                '狗狗': 'dog',
                '猫咪': 'cat',
                '其他': 'other'
            }
        }
    },
    watch: {
        selectedType() {
            this.pagination.page = 1
            this.loadAnimals()
        },
        selectedAge() {
            this.pagination.page = 1
            this.loadAnimals()
        },
        searchKeyword() {
            // 防抖处理
            clearTimeout(this.searchTimer)
            this.searchTimer = setTimeout(() => {
                this.pagination.page = 1
                this.loadAnimals()
            }, 500)
        }
    },
    mounted() {
        this.loadAnimals()
    },
    methods: {
        async loadAnimals() {
            this.loading = true
            try {
                // 构建查询参数
                const params = {
                    status: 'available', // 只显示待收养的
                    page: this.pagination.page,
                    size: this.pagination.size
                }

                // 添加搜索关键词
                if (this.searchKeyword) {
                    params.keyword = this.searchKeyword
                }

                // 添加类型筛选
                const petType = this.typeMap[this.selectedType]
                if (petType) {
                    params.pet_type = petType
                }

                // 添加年龄筛选
                const ageRange = this.getAgeRange(this.selectedAge)
                if (ageRange.min !== null) {
                    params.age_min = ageRange.min
                }
                if (ageRange.max !== null) {
                    params.age_max = ageRange.max
                }

                const response = await getPetList(params)
                
                if (response.data && response.data.code === 200) {
                    this.animals = response.data.data.map(item => ({
                        id: item.id,
                        name: item.pet_name,
                        type: this.getTypeName(item.pet_type),
                        age: item.age ? `${item.age}岁` : '未知',
                        ageNum: item.age || 0,
                        gender: this.getGenderName(item.gender),
                        personality: item.character || '待了解',
                        description: item.description || '暂无描述',
                        image: this.getPetImage(item.image_url),
                        tagColor: this.getTagColor(item.pet_type)
                    }))
                    
                    if (response.data.pagination) {
                        this.pagination.total = response.data.pagination.total
                        this.pagination.totalPages = response.data.pagination.totalPages
                    }
                }
            } catch (error) {
                console.error('加载宠物列表失败:', error)
                this.$message.error('加载宠物列表失败，请稍后重试')
            } finally {
                this.loading = false
            }
        },

        getAgeRange(ageRange) {
            switch (ageRange) {
                case '0-1岁':
                    return { min: 0, max: 1 }
                case '1-3岁':
                    return { min: 1, max: 3 }
                case '3-5岁':
                    return { min: 3, max: 5 }
                case '5岁以上':
                    return { min: 5, max: null }
                default:
                    return { min: null, max: null }
            }
        },

        getTypeName(petType) {
            const typeNameMap = {
                'dog': '狗狗',
                'cat': '猫咪',
                'other': '其他'
            }
            return typeNameMap[petType] || '其他'
        },

        getGenderName(gender) {
            const genderMap = {
                'male': '公',
                'female': '母',
                'unknown': '未知'
            }
            return genderMap[gender] || '未知'
        },

        getTagColor(petType) {
            const colorMap = {
                'dog': '#d52b1e',
                'cat': '#ff9f9f',
                'other': '#ffc0cb'
            }
            return colorMap[petType] || '#d52b1e'
        },

        getPetImage(imageUrl) {
            if (!imageUrl) {
                return require('@/assets/front/index/wrapper-1.jpg')
            }
            if (imageUrl.startsWith('http')) {
                return imageUrl
            }
            return `${API_BASE_URL}${imageUrl}`
        },

        resetFilters() {
            this.selectedType = '全部'
            this.selectedAge = '全部'
            this.searchKeyword = ''
            this.pagination.page = 1
            this.loadAnimals()
        },

        goToAdopt(animalId) {
            if (animalId) {
                this.$router.push(`/adoption/adopt?id=${animalId}`)
            } else {
                this.$router.push('/adoption/adopt')
            }
        },

        goToDetail(animalId) {
            this.$router.push(`/adoption/detail?id=${animalId}`)
        },

        handlePageChange(page) {
            this.pagination.page = page
            this.loadAnimals()
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }
}
</script>

<style lang="less" scoped>
.adoption-list-page {
    width: 100%;
    background-color: #f5f5f5;
}

/* 页面标题区域 */
.page-header {
    background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
    padding: 80px 0;
    color: white;
    text-align: center;

    .header-content {
        h1 {
            font-size: 3rem;
            margin-bottom: 15px;
            font-weight: bold;
        }

        p {
            font-size: 1.3rem;
            opacity: 0.95;
        }
    }
}

/* 筛选区域 */
.filter-section {
    background-color: white;
    padding: 40px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    position: sticky;
    top: 60px;
    z-index: 10;

    .filter-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;

        .filter-group {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;

            &:last-child {
                margin-bottom: 0;
            }

            label {
                font-size: 1.1rem;
                color: #333;
                font-weight: 600;
                min-width: 100px;
            }

            .filter-options {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;

                .filter-btn {
                    padding: 8px 18px;
                    background-color: #f5f5f5;
                    border: 2px solid transparent;
                    border-radius: 25px;
                    font-size: 0.95rem;
                    color: #666;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;

                    &:hover {
                        border-color: #d52b1e;
                        color: #d52b1e;
                    }

                    &.active {
                        background-color: #d52b1e;
                        color: white;
                        border-color: #d52b1e;
                    }
                }
            }

            .search-input {
                padding: 8px 15px;
                border: 2px solid #ddd;
                border-radius: 25px;
                font-size: 0.95rem;
                min-width: 200px;
                transition: border-color 0.3s ease;

                &:focus {
                    outline: none;
                    border-color: #d52b1e;
                }
            }
        }
    }
}

/* 动物列表区域 */
.animals-section {
    padding: 60px 0;

    .animals-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;

        .loading-container {
            min-height: 400px;
        }

        .pagination-container {
            margin-top: 40px;
            display: flex;
            justify-content: center;
        }

        .animals-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 30px;

            .animal-card {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                cursor: pointer;

                &:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                }

                .card-image {
                    position: relative;
                    overflow: hidden;
                    height: 250px;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.3s ease;
                    }

                    &:hover img {
                        transform: scale(1.08);
                    }

                    .tag {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        padding: 6px 14px;
                        background-color: #d52b1e;
                        color: white;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        font-weight: bold;
                    }
                }

                .card-content {
                    padding: 20px;

                    h3 {
                        font-size: 1.4rem;
                        color: #333;
                        margin-bottom: 15px;
                        font-weight: bold;
                    }

                    .info-row {
                        display: flex;
                        margin-bottom: 10px;
                        font-size: 0.95rem;

                        .label {
                            color: #999;
                            min-width: 50px;
                        }

                        .value {
                            color: #333;
                            font-weight: 500;
                        }
                    }

                    .description {
                        font-size: 0.9rem;
                        color: #666;
                        line-height: 1.5;
                        margin: 15px 0;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    .card-footer {
                        display: flex;
                        gap: 10px;
                        margin-top: 15px;

                        .detail-btn {
                            flex: 1;
                            padding: 10px 0;
                            background-color: #f5f5f5;
                            color: #333;
                            border: 2px solid #d52b1e;
                            border-radius: 6px;
                            font-size: 0.95rem;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s ease;

                            &:hover {
                                background-color: #d52b1e;
                                color: white;
                            }
                        }

                        .adopt-btn {
                            flex: 1;
                            padding: 10px 0;
                            background-color: #d52b1e;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            font-size: 0.95rem;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s ease;

                            &:hover {
                                background-color: #b8240a;
                            }
                        }
                    }
                }
            }
        }

        .no-results {
            text-align: center;
            padding: 100px 20px;
            color: #999;

            p {
                font-size: 1.5rem;
                margin-bottom: 20px;
            }

            .reset-btn {
                padding: 12px 30px;
                background-color: #d52b1e;
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    background-color: #b8240a;
                    transform: translateY(-3px);
                }
            }
        }
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .page-header .header-content {
        h1 {
            font-size: 2rem;
        }

        p {
            font-size: 1rem;
        }
    }

    .filter-section .filter-container .filter-group {
        flex-direction: column;
        align-items: flex-start;

        label {
            min-width: auto;
        }

        .filter-options,
        .search-input {
            width: 100%;
        }

        .search-input {
            min-width: 100%;
        }
    }

    .animals-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
        gap: 20px !important;
    }
}
</style>

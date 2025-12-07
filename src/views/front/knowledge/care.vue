<template>
    <div class="adoption-stories-page">
        <!-- 页面标题区域 -->
        <section class="page-header">
            <div class="header-content">
                <h1>领养故事</h1>
                <p>分享温暖，传递爱心</p>
            </div>
        </section>

        <!-- 快速导航 -->
        <section class="nav-section">
            <div class="nav-container">
                <div class="nav-grid">
                    <div v-for="(category, index) in categories" :key="index" class="nav-item"
                        @click="handleCategoryChange(category.id)" :class="{ active: activeCategory === category.id }">
                        <span class="nav-icon">{{ category.icon }}</span>
                        <span class="nav-text">{{ category.name }}</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- 故事卡片区域 -->
        <section class="stories-section">
            <div class="stories-container">
                <div v-if="loading" class="loading-wrapper">
                    <i class="el-icon-loading"></i>
                    <span>加载中...</span>
                </div>
                <div v-else-if="stories.length === 0" class="empty-wrapper">
                    <i class="el-icon-document"></i>
                    <p>暂无故事</p>
                </div>
                <div v-else class="stories-grid">
                    <div v-for="story in stories" :key="story.id" class="story-card" @click="goToStoryDetail(story.id)">
                        <div class="card-tag" v-if="story.is_featured">推荐</div>
                        <div class="card-image" :style="{ backgroundImage: `url(${getStoryImage(story.image_url)})` }"></div>
                        <div class="card-content">
                            <h3>{{ story.title }}</h3>
                            <p class="card-desc">{{ getStoryExcerpt(story.content) }}</p>
                            <div class="card-meta">
                                <span class="meta-item">
                                    <i class="el-icon-user"></i>
                                    {{ story.author }}
                                </span>
                                <span class="meta-item">
                                    <i class="el-icon-time"></i>
                                    {{ formatDate(story.publish_date || story.create_time) }}
                                </span>
                            </div>
                            <div class="card-stats">
                                <span class="stat-item">
                                    <i class="el-icon-view"></i>
                                    {{ formatNumber(story.views || 0) }}
                                </span>
                                <span class="stat-item">
                                    <i class="el-icon-star-on"></i>
                                    {{ formatNumber(story.likes || 0) }}
                                </span>
                                <span class="stat-item">
                                    <i class="el-icon-chat-line-square"></i>
                                    {{ formatNumber(story.comment_count || 0) }}
                                </span>
                            </div>
                            <div class="card-tags" v-if="story.tags && story.tags.length > 0">
                                <el-tag v-for="(tag, idx) in story.tags.slice(0, 3)" :key="idx" size="small" class="tag-item">
                                    {{ tag }}
                                </el-tag>
                            </div>
                            <button class="read-btn" @click.stop="goToStoryDetail(story.id)">阅读全文</button>
                        </div>
                    </div>
                </div>
                <!-- 分页 -->
                <div class="pagination-wrapper" v-if="pagination.total > pagination.pageSize">
                    <el-pagination
                        @current-change="handlePageChange"
                        :current-page="pagination.currentPage"
                        :page-size="pagination.pageSize"
                        :total="pagination.total"
                        layout="prev, pager, next">
                    </el-pagination>
                </div>
            </div>
        </section>

        <!-- 热门推荐 -->
        <section class="recommend-section">
            <div class="recommend-container">
                <h2>热门推荐</h2>
                <div v-if="popularStoriesLoading" class="loading-wrapper">
                    <i class="el-icon-loading"></i>
                </div>
                <div v-else class="recommend-grid">
                    <div v-for="(story, index) in popularStories" :key="story.id" class="recommend-item" @click="goToStoryDetail(story.id)">
                        <div class="recommend-num">{{ index + 1 }}</div>
                        <div class="recommend-content">
                            <h4>{{ story.title }}</h4>
                            <p>{{ getStoryExcerpt(story.content, 50) }}</p>
                        </div>
                        <div class="recommend-views">
                            <i class="el-icon-view"></i> {{ formatNumber(story.views || 0) }}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 推荐故事 -->
        <section class="featured-section" v-if="featuredStories.length > 0">
            <div class="featured-container">
                <h2>精选故事</h2>
                <div class="featured-grid">
                    <div v-for="story in featuredStories" :key="story.id" class="featured-card" @click="goToStoryDetail(story.id)">
                        <div class="featured-image" :style="{ backgroundImage: `url(${getStoryImage(story.image_url)})` }"></div>
                        <div class="featured-content">
                            <div class="featured-badge">推荐</div>
                            <h3>{{ story.title }}</h3>
                            <p>{{ getStoryExcerpt(story.content, 80) }}</p>
                            <div class="featured-meta">
                                <span><i class="el-icon-user"></i> {{ story.author }}</span>
                                <span><i class="el-icon-view"></i> {{ formatNumber(story.views || 0) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { getStoryList, getFeaturedStories, getPopularStories } from '@/utils/api'
import { formatDate } from '@/utils/dateFormat'

export default {
    name: 'adoptionStories',
    data() {
        return {
            activeCategory: 'all',
            loading: false,
            stories: [],
            popularStories: [],
            popularStoriesLoading: false,
            featuredStories: [],
            pagination: {
                currentPage: 1,
                pageSize: 12,
                total: 0
            },
            categories: [
                { id: 'all', name: '全部', icon: '📚' },
                { id: 'featured', name: '推荐', icon: '⭐' },
                { id: 'dog', name: '狗狗', icon: '🐕' },
                { id: 'cat', name: '猫咪', icon: '🐈' },
                { id: 'other', name: '其他', icon: '🐾' }
            ],
            API_BASE_URL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8889'
        }
    },
    mounted() {
        this.loadStories()
        this.loadPopularStories()
        this.loadFeaturedStories()
    },
    methods: {
        async loadStories() {
            this.loading = true
            try {
                const params = {
                    page: this.pagination.currentPage,
                    size: this.pagination.pageSize,
                    status: 'published'
                }

                // 根据分类添加过滤条件
                if (this.activeCategory === 'featured') {
                    params.is_featured = 1
                } else if (this.activeCategory !== 'all') {
                    // 这里可以根据pet_type过滤，但需要后端支持
                    // 暂时只处理推荐
                }

                const response = await getStoryList(params)
                if (response.data && response.data.code === 200) {
                    this.stories = response.data.data.list || []
                    if (response.data.data.total !== undefined) {
                        this.pagination.total = response.data.data.total
                    }
                }
            } catch (error) {
                console.error('加载故事列表失败:', error)
                this.$message.error('加载故事列表失败')
            } finally {
                this.loading = false
            }
        },

        async loadPopularStories() {
            this.popularStoriesLoading = true
            try {
                const response = await getPopularStories({ limit: 5, sort: 'views' })
                if (response.data && response.data.code === 200) {
                    this.popularStories = response.data.data || []
                }
            } catch (error) {
                console.error('加载热门故事失败:', error)
            } finally {
                this.popularStoriesLoading = false
            }
        },

        async loadFeaturedStories() {
            try {
                const response = await getFeaturedStories({ limit: 3 })
                if (response.data && response.data.code === 200) {
                    this.featuredStories = response.data.data || []
                }
            } catch (error) {
                console.error('加载推荐故事失败:', error)
            }
        },

        handleCategoryChange(categoryId) {
            this.activeCategory = categoryId
            this.pagination.currentPage = 1
            this.loadStories()
        },

        handlePageChange(page) {
            this.pagination.currentPage = page
            this.loadStories()
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        goToStoryDetail(id) {
            this.$router.push(`/stories/detail/${id}`)
        },

        getStoryImage(imageUrl) {
            if (!imageUrl) {
                return require('@/assets/front/index/wrapper-1.jpg')
            }
            if (imageUrl.startsWith('http')) {
                return imageUrl
            }
            return `${this.API_BASE_URL}${imageUrl}`
        },

        getStoryExcerpt(content, maxLength = 100) {
            if (!content) return '暂无描述'
            const text = content.replace(/<[^>]*>/g, '').trim()
            if (text.length <= maxLength) return text
            return text.substring(0, maxLength) + '...'
        },

        formatDate(dateTime) {
            return formatDate(dateTime)
        },

        formatNumber(num) {
            if (num >= 10000) {
                return (num / 10000).toFixed(1) + 'w'
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'k'
            }
            return num.toString()
        }
    }
}
</script>

<style lang="less" scoped>
.adoption-stories-page {
    width: 100%;
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

/* 快速导航 */
.nav-section {
    background-color: #fff;
    padding: 40px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    position: sticky;
    top: 60px;
    z-index: 10;

    .nav-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;

        .nav-grid {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            justify-content: center;

            .nav-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 24px;
                background-color: #f5f5f5;
                border: 2px solid transparent;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
                color: #666;

                .nav-icon {
                    font-size: 1.2rem;
                }

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
    }
}

/* 故事卡片区域 */
.stories-section {
    background-color: #f8f8f8;
    padding: 80px 0;

    .stories-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;

        .loading-wrapper,
        .empty-wrapper {
            text-align: center;
            padding: 60px 20px;
            color: #999;

            i {
                font-size: 48px;
                margin-bottom: 20px;
                display: block;
            }
        }

        .stories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;

            .story-card {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                transition: all 0.3s ease;
                position: relative;
                cursor: pointer;

                &:hover {
                    transform: translateY(-12px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
                }

                .card-tag {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background-color: #d52b1e;
                    color: white;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: bold;
                    z-index: 1;
                }

                .card-image {
                    width: 100%;
                    height: 200px;
                    background-size: cover;
                    background-position: center;
                    transition: transform 0.3s ease;
                }

                &:hover .card-image {
                    transform: scale(1.05);
                }

                .card-content {
                    padding: 25px;

                    h3 {
                        font-size: 1.2rem;
                        color: #333;
                        margin-bottom: 12px;
                        font-weight: bold;
                        line-height: 1.4;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    .card-desc {
                        font-size: 0.9rem;
                        color: #666;
                        line-height: 1.5;
                        margin-bottom: 15px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    .card-meta {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 12px;
                        font-size: 0.85rem;
                        color: #999;

                        .meta-item {
                            display: flex;
                            align-items: center;
                            gap: 6px;

                            i {
                                font-size: 0.95rem;
                            }
                        }
                    }

                    .card-stats {
                        display: flex;
                        gap: 15px;
                        margin-bottom: 12px;
                        font-size: 0.85rem;
                        color: #999;

                        .stat-item {
                            display: flex;
                            align-items: center;
                            gap: 4px;

                            i {
                                font-size: 0.9rem;
                            }
                        }
                    }

                    .card-tags {
                        display: flex;
                        gap: 8px;
                        flex-wrap: wrap;
                        margin-bottom: 15px;

                        .tag-item {
                            background-color: #f0f0f0;
                            border: none;
                        }
                    }

                    .read-btn {
                        width: 100%;
                        padding: 12px 0;
                        background-color: #d52b1e;
                        color: white;
                        border: none;
                        border-radius: 6px;
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

        .pagination-wrapper {
            margin-top: 40px;
            display: flex;
            justify-content: center;
        }
    }
}

/* 热门推荐 */
.recommend-section {
    background-color: #fff;
    padding: 80px 0;

    .recommend-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;

        h2 {
            text-align: center;
            font-size: 2.8rem;
            margin-bottom: 60px;
            color: #333;
            font-weight: bold;
            position: relative;
            display: inline-block;
            width: 100%;
            padding-bottom: 20px;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 4px;
                background: linear-gradient(90deg, #d52b1e 0%, #e85541 100%);
                border-radius: 2px;
            }
        }

        .loading-wrapper {
            text-align: center;
            padding: 40px;
        }

        .recommend-grid {
            display: grid;
            gap: 20px;

            .recommend-item {
                display: flex;
                align-items: center;
                gap: 25px;
                padding: 20px;
                background-color: #f8f8f8;
                border-radius: 12px;
                border-left: 4px solid #d52b1e;
                transition: all 0.3s ease;
                cursor: pointer;

                &:hover {
                    background-color: #fff5f5;
                    transform: translateX(8px);
                }

                .recommend-num {
                    font-size: 2.5rem;
                    font-weight: bold;
                    color: #d52b1e;
                    min-width: 60px;
                    text-align: center;
                }

                .recommend-content {
                    flex: 1;

                    h4 {
                        font-size: 1.1rem;
                        color: #333;
                        margin-bottom: 8px;
                        font-weight: bold;
                    }

                    p {
                        font-size: 0.9rem;
                        color: #999;
                        margin: 0;
                    }
                }

                .recommend-views {
                    font-size: 0.95rem;
                    color: #d52b1e;
                    font-weight: bold;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
            }
        }
    }
}

/* 推荐故事 */
.featured-section {
    background-color: #f8f8f8;
    padding: 80px 0;

    .featured-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;

        h2 {
            text-align: center;
            font-size: 2.8rem;
            margin-bottom: 60px;
            color: #333;
            font-weight: bold;
            position: relative;
            display: inline-block;
            width: 100%;
            padding-bottom: 20px;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 4px;
                background: linear-gradient(90deg, #d52b1e 0%, #e85541 100%);
                border-radius: 2px;
            }
        }

        .featured-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;

            .featured-card {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                transition: all 0.3s ease;
                cursor: pointer;

                &:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
                }

                .featured-image {
                    width: 100%;
                    height: 250px;
                    background-size: cover;
                    background-position: center;
                }

                .featured-content {
                    padding: 25px;
                    position: relative;

                    .featured-badge {
                        position: absolute;
                        top: -15px;
                        right: 25px;
                        background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
                        color: white;
                        padding: 6px 16px;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        font-weight: bold;
                    }

                    h3 {
                        font-size: 1.3rem;
                        color: #333;
                        margin-bottom: 12px;
                        font-weight: bold;
                        line-height: 1.4;
                    }

                    p {
                        font-size: 0.95rem;
                        color: #666;
                        line-height: 1.6;
                        margin-bottom: 15px;
                        display: -webkit-box;
                        -webkit-line-clamp: 3;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    .featured-meta {
                        display: flex;
                        gap: 20px;
                        font-size: 0.85rem;
                        color: #999;

                        span {
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        }
                    }
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

    .nav-section .nav-container .nav-grid {
        gap: 10px;

        .nav-item {
            padding: 10px 16px;
            font-size: 0.9rem;
        }
    }

    .stories-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
    }

    .featured-grid {
        grid-template-columns: 1fr !important;
    }
}

@media (max-width: 480px) {
    .page-header .header-content h1 {
        font-size: 1.5rem;
    }

    .stories-grid {
        grid-template-columns: 1fr !important;
    }
}
</style>

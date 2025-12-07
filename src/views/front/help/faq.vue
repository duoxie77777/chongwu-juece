<template>
    <div class="faq-page">

        <!-- 页面标题区域 -->
        <section class="page-header">
            <div class="header-content">
                <h1>常见问题</h1>
                <p>您的疑问，我们的答案</p>
            </div>
        </section>

        <!-- 搜索区域 -->
        <section class="search-section">
            <div class="search-container">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input 
                        v-model="searchKeyword"
                        type="text"
                        placeholder="输入关键词搜索问题..."
                        class="search-input"
                    >
                </div>
                <div v-if="searchResults.length > 0" class="search-results">
                    <div 
                        v-for="result in searchResults" 
                        :key="result.id"
                        class="search-result-item"
                        @click="selectFaq(result.categoryId, result.id)"
                    >
                        <span class="result-icon">{{ result.icon }}</span>
                        <span class="result-text">{{ result.question }}</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- 分类导航 -->
        <section class="category-section">
            <div class="category-container">
                <div class="category-grid">
                    <div 
                        v-for="category in categories" 
                        :key="category.id"
                        class="category-item"
                        @click="activeCategory = category.id"
                        :class="{ active: activeCategory === category.id }"
                    >
                        <div class="category-icon">{{ category.icon }}</div>
                        <div class="category-text">
                            <h3>{{ category.name }}</h3>
                            <p>{{ category.count }}个问题</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ列表 -->
        <section class="faq-list-section">
            <div class="faq-list-container">
                <h2>{{ currentCategoryName }}</h2>
                <div class="faq-accordion">
                    <div 
                        v-for="faq in filteredFaqs" 
                        :key="faq.id"
                        class="faq-accordion-item"
                        :class="{ active: expandedFaq === faq.id }"
                    >
                        <div class="faq-header" @click="toggleFaq(faq.id)">
                            <div class="header-left">
                                <span class="faq-icon">{{ expandedFaq === faq.id ? '−' : '+' }}</span>
                                <h3 class="faq-question">{{ faq.question }}</h3>
                            </div>
                            <span class="helpful-badge">{{ faq.helpful }}人觉得有帮助</span>
                        </div>
                        <div v-if="expandedFaq === faq.id" class="faq-body">
                            <p class="faq-answer">{{ faq.answer }}</p>
                            <div class="faq-footer">
                                <span class="helpful-text">这个回答是否有帮助？</span>
                                <div class="helpful-buttons">
                                    <button class="helpful-btn" @click="helpful(faq.id)">👍 有帮助</button>
                                    <button class="unhelpful-btn" @click="unhelpful(faq.id)">👎 没帮助</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 相关问题推荐 -->
        <section class="related-section">
            <div class="related-container">
                <h2>相关问题推荐</h2>
                <div class="related-grid">
                    <div v-for="item in relatedQuestions" :key="item.id" class="related-item">
                        <div class="related-icon">{{ item.icon }}</div>
                        <h3>{{ item.question }}</h3>
                        <p>{{ item.brief }}</p>
                        <button class="related-btn">查看答案</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- 联系我们 -->
        <section class="contact-section">
            <div class="contact-container">
                <h2>仍未找到答案？</h2>
                <p>我们的客服团队随时准备帮助您</p>
                <div class="contact-methods">
                    <div class="contact-method">
                        <div class="method-icon">💬</div>
                        <h3>在线客服</h3>
                        <p>实时在线，随时回答您的问题</p>
                        <button class="method-btn">开始聊天</button>
                    </div>
                    <div class="contact-method">
                        <div class="method-icon">📧</div>
                        <h3>邮件咨询</h3>
                        <p>详细描述问题，我们24小时内回复</p>
                        <button class="method-btn">发送邮件</button>
                    </div>
                    <div class="contact-method">
                        <div class="method-icon">📞</div>
                        <h3>电话支持</h3>
                        <p>400-123-4567 周一至周日 09:00-18:00</p>
                        <button class="method-btn">拨打电话</button>
                    </div>
                </div>
            </div>
        </section>

    </div>
</template>

<script>
import { getFaqList, getFaqStats } from '@/utils/api'

export default {
    name: 'faqPage',
    data() {
        return {
            activeCategory: 'adoption',
            expandedFaq: null,
            searchKeyword: '',
            loading: false,
            categories: [
                { id: 'adoption', name: '领养相关', icon: '🐾', count: 0 },
                { id: 'care', name: '养护知识', icon: '🏥', count: 0 },
                { id: 'account', name: '账户问题', icon: '👤', count: 0 },
                { id: 'other', name: '其他问题', icon: '❓', count: 0 }
            ],
            faqData: [],
            relatedQuestions: [
                {
                    id: 1,
                    icon: '🏥',
                    question: '宠物紧急情况如何处理？',
                    brief: '了解常见紧急情况的应急措施...'
                },
                {
                    id: 2,
                    icon: '💊',
                    question: '宠物驱虫怎样才能做好？',
                    brief: '详细的驱虫计划和注意事项...'
                },
                {
                    id: 3,
                    icon: '🐾',
                    question: '宠物社交和适应新环境',
                    brief: '帮助宠物适应新生活的方法...'
                }
            ]
        }
    },
    computed: {
        filteredFaqs() {
            return this.faqData.filter(faq => faq.category === this.activeCategory)
        },
        currentCategoryName() {
            const category = this.categories.find(c => c.id === this.activeCategory)
            return category ? category.name : '全部问题'
        },
        searchResults() {
            if (!this.searchKeyword.trim()) return []
            const keyword = this.searchKeyword.toLowerCase()
            return this.faqData.filter(faq => 
                faq.question.toLowerCase().includes(keyword) ||
                faq.answer.toLowerCase().includes(keyword)
            ).map(faq => ({
                ...faq,
                categoryId: faq.category,
                icon: this.categories.find(c => c.id === faq.category)?.icon || '❓'
            })).slice(0, 5)
        }
    },
    methods: {
        async loadFaqData() {
            this.loading = true
            try {
                const response = await getFaqList({ page: 1, size: 100 })
                if (response.data.code === 200) {
                    this.faqData = response.data.data.list.map(item => ({
                        ...item,
                        helpful: item.views || 0
                    }))
                }
            } catch (error) {
                console.error('获取FAQ数据失败:', error)
            } finally {
                this.loading = false
            }
        },
        async loadStats() {
            try {
                const response = await getFaqStats()
                if (response.data.code === 200) {
                    const stats = response.data.data
                    this.categories.forEach(cat => {
                        if (stats[cat.id] !== undefined) {
                            cat.count = stats[cat.id]
                        }
                    })
                }
            } catch (error) {
                console.error('获取FAQ统计失败:', error)
            }
        },
        toggleFaq(id) {
            this.expandedFaq = this.expandedFaq === id ? null : id
        },
        selectFaq(categoryId, faqId) {
            this.activeCategory = categoryId
            this.$nextTick(() => {
                this.expandedFaq = faqId
                document.querySelector('.faq-list-section').scrollIntoView({ behavior: 'smooth' })
            })
            this.searchKeyword = ''
        },
        helpful(id) {
            const faq = this.faqData.find(f => f.id === id)
            if (faq) {
                faq.helpful += 1
                this.$message.success('感谢您的反馈！')
            }
        },
        unhelpful() {
            this.$message.info('感谢反馈，我们会改进这个回答。')
        }
    },
    mounted() {
        this.loadFaqData()
        this.loadStats()
    }
}
</script>

<style lang="less" scoped>
.faq-page {
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

/* 搜索区域 */
.search-section {
    background-color: #f8f8f8;
    padding: 60px 0;

    .search-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 20px;
        position: relative;

        .search-box {
            display: flex;
            align-items: center;
            background-color: white;
            border-radius: 50px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            padding: 0 25px;
            overflow: hidden;

            .search-icon {
                font-size: 1.3rem;
                margin-right: 15px;
            }

            .search-input {
                flex: 1;
                border: none;
                outline: none;
                padding: 18px 0;
                font-size: 1rem;
                color: #333;

                &::placeholder {
                    color: #999;
                }
            }
        }

        .search-results {
            position: absolute;
            top: calc(100% + 10px);
            left: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            max-height: 400px;
            overflow-y: auto;
            z-index: 10;

            .search-result-item {
                padding: 15px 20px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.2s ease;

                &:hover {
                    background-color: #f8f8f8;
                }

                .result-icon {
                    font-size: 1.1rem;
                }

                .result-text {
                    color: #333;
                    font-size: 0.95rem;
                }

                &:last-child {
                    border-bottom: none;
                }
            }
        }
    }
}

/* 分类导航 */
.category-section {
    background-color: #fff;
    padding: 60px 0;
    border-bottom: 1px solid #f0f0f0;

    .category-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;

        .category-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;

            .category-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px;
                background-color: #f8f8f8;
                border-radius: 12px;
                border: 2px solid transparent;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    border-color: #d52b1e;
                    background-color: #fff5f5;
                }

                &.active {
                    background-color: #d52b1e;
                    color: white;
                    border-color: #d52b1e;

                    .category-text h3,
                    .category-text p {
                        color: white;
                    }
                }

                .category-icon {
                    font-size: 2rem;
                }

                .category-text {
                    h3 {
                        font-size: 1.1rem;
                        color: #333;
                        margin: 0 0 4px 0;
                        font-weight: bold;
                    }

                    p {
                        font-size: 0.85rem;
                        color: #999;
                        margin: 0;
                    }
                }
            }
        }
    }
}

/* FAQ列表 */
.faq-list-section {
    background-color: #f8f8f8;
    padding: 80px 0;

    .faq-list-container {
        max-width: 900px;
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

        .faq-accordion {
            .faq-accordion-item {
                background: white;
                margin-bottom: 15px;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                transition: all 0.3s ease;

                &.active {
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
                }

                .faq-header {
                    padding: 22px;
                    cursor: pointer;
                    background-color: #f8f8f8;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    &:hover {
                        background-color: #f0f0f0;
                    }

                    .header-left {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        flex: 1;

                        .faq-icon {
                            font-size: 1.3rem;
                            color: #d52b1e;
                            min-width: 20px;
                            text-align: center;
                            font-weight: bold;
                        }

                        .faq-question {
                            font-size: 1.05rem;
                            color: #333;
                            margin: 0;
                            font-weight: 600;
                            text-align: left;
                        }
                    }

                    .helpful-badge {
                        background-color: #fff5f5;
                        color: #d52b1e;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        white-space: nowrap;
                        margin-left: 15px;
                    }
                }

                .faq-body {
                    padding: 25px;
                    background-color: white;
                    border-top: 1px solid #f0f0f0;
                    animation: slideDown 0.3s ease;

                    .faq-answer {
                        font-size: 0.95rem;
                        color: #666;
                        line-height: 1.8;
                        margin: 0 0 20px 0;
                    }

                    .faq-footer {
                        padding-top: 20px;
                        border-top: 1px solid #f0f0f0;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;

                        .helpful-text {
                            font-size: 0.9rem;
                            color: #999;
                        }

                        .helpful-buttons {
                            display: flex;
                            gap: 10px;

                            .helpful-btn,
                            .unhelpful-btn {
                                padding: 8px 15px;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                background-color: white;
                                cursor: pointer;
                                font-size: 0.9rem;
                                transition: all 0.3s ease;

                                &:hover {
                                    border-color: #d52b1e;
                                    color: #d52b1e;
                                    background-color: #fff5f5;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 相关问题推荐 */
.related-section {
    background-color: #fff;
    padding: 80px 0;

    .related-container {
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

        .related-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;

            .related-item {
                background: #f8f8f8;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                transition: all 0.3s ease;

                &:hover {
                    background-color: #fff;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    transform: translateY(-8px);
                }

                .related-icon {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                    display: block;
                }

                h3 {
                    font-size: 1.2rem;
                    color: #333;
                    margin-bottom: 10px;
                    font-weight: bold;
                }

                p {
                    font-size: 0.9rem;
                    color: #999;
                    margin-bottom: 20px;
                }

                .related-btn {
                    padding: 12px 25px;
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
}

/* 联系我们 */
.contact-section {
    background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
    padding: 80px 0;
    color: white;

    .contact-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;

        h2 {
            text-align: center;
            font-size: 2.8rem;
            margin-bottom: 15px;
            font-weight: bold;
        }

        > p {
            text-align: center;
            font-size: 1.1rem;
            margin-bottom: 50px;
            opacity: 0.95;
        }

        .contact-methods {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 30px;

            .contact-method {
                background-color: rgba(255, 255, 255, 0.15);
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;

                &:hover {
                    background-color: rgba(255, 255, 255, 0.25);
                    transform: translateY(-8px);
                }

                .method-icon {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                }

                h3 {
                    font-size: 1.3rem;
                    margin-bottom: 10px;
                    font-weight: bold;
                }

                p {
                    font-size: 0.95rem;
                    margin-bottom: 20px;
                    opacity: 0.9;
                }

                .method-btn {
                    padding: 12px 28px;
                    background-color: white;
                    color: #d52b1e;
                    border: none;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;

                    &:hover {
                        transform: scale(1.05);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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

    .faq-list-section .faq-list-container .faq-accordion .faq-accordion-item .faq-header {
        flex-direction: column;
        align-items: flex-start;

        .helpful-badge {
            margin-left: 0;
            margin-top: 10px;
            align-self: flex-start;
        }
    }

    .category-section .category-container .category-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
    }
}

@media (max-width: 480px) {
    .page-header .header-content h1 {
        font-size: 1.5rem;
    }

    .category-section .category-container .category-grid {
        grid-template-columns: 1fr !important;
    }

    .related-section .related-container .related-grid {
        grid-template-columns: 1fr !important;
    }
}
</style>

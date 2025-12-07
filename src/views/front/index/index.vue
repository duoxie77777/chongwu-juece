<template>
    <div class="frontIndexPage">
        <header-layout></header-layout>

        <!-- banner部分 -->
        <section>
            <div class="banner-section">
                <video autoplay muted loop playsinline class="banner-video">
                    <source src="@/assets/front/index/banner-video.mp4" type="video/mp4">
                    您的浏览器不支持视频播放。
                </video>
                <!-- 添加透黑遮罩层 -->
                <div class="overlay"></div>
                <!-- 添加居中文字 -->
                <div class="banner-text">
                    <h1>终身致力于送它们回家</h1>
                    <p>每一只小动物都值得被温柔以待</p>
                    <p>让我们一起为它们找到温暖的家</p>
                </div>
            </div>
        </section>

        <section class="service-section-wrapper">
            <div class="service">
                <h2>我们的服务</h2>
                <div class="service-section">
                    <div v-for="(item, index) in serviceItems" :key="index" class="service-item">
                        <div class="service-icon">{{ item.icon }}</div>
                        <h3>{{ item.title }}</h3>
                        <p>{{ item.description }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="stats-section">
            <h2>我们的成就</h2>
            <div class="stats-container">
                <div v-for="(stat, index) in statsData" :key="index" class="stat-item">
                    <div class="stat-number">{{ stat.number }}+</div>
                    <div class="stat-label">{{ stat.label }}</div>
                </div>
            </div>
        </section>

        <section class="four-column-section">
            <h2>我们的工作</h2>
            <div class="four-column-wrapper">
                <div class="four-column-container">
                    <div v-for="(item, index) in fourColumnItems" :key="index" class="four-column-item">
                        <!-- 添加遮罩层 -->
                        <div class="item-overlay" :style="{ backgroundImage: 'url(' + item.image + ')' }"></div>
                        <div class="item-content">
                            <h3>{{ item.title }}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 领养列表部分 -->
        <section class="adoption-list-section">
            <div class="adoption-list-container">
                <h2>
                    找到你的伙伴
                    <span v-if="adoptionAnimals.length > 0 && adoptionAnimals[0]?.isRecommended" class="recommend-badge">✨ 为您推荐</span>
                </h2>
                <div class="adoption-list-wrapper">
                    <div class="adoption-list-grid">
                        <div v-for="(animal, index) in adoptionAnimals" :key="animal.id || index" 
                             class="adoption-list-item" 
                             :class="{ 'placeholder-item': animal.isPlaceholder }"
                             @click="goToPetDetail(animal)">
                            <div class="animal-image" :style="{ backgroundImage: 'url(' + animal.image + ')' }"></div>
                            <div class="animal-info">
                                <h4>{{ animal.name }}</h4>
                                <p class="animal-type">{{ animal.type }}</p>
                                <p class="animal-desc">{{ animal.description }}</p>
                                <button class="adoption-detail-btn" @click.stop="goToPetDetail(animal)">
                                    {{ animal.isPlaceholder ? '敬请期待' : '了解详情' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="view-all-btn-wrapper">
                    <button class="view-all-btn" @click="goToAllPets">查看全部</button>
                </div>
            </div>
        </section>

        <!-- 领养流程部分 -->
        <section class="adoption-process">
            <div class="adoption-container">
                <h2>领养流程</h2>
                <div class="process-steps">
                    <div v-for="(step, index) in adoptionSteps" :key="index" class="process-step">
                        <div class="step-number">{{ step.number }}</div>
                        <div class="step-title">{{ step.title }}</div>
                        <div class="step-desc">{{ step.description }}</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 最新领养故事部分 -->
        <section class="adoption-stories">
            <div class="stories-container">
                <div class="stories-header">
                    <h2>领养故事</h2>
                    <router-link to="/stories/submit" class="share-btn">分享你的故事</router-link>
                </div>
                <div class="stories-grid">
                    <div v-for="(story, index) in adoptionStories" 
                         :key="story.id || index" 
                         class="story-card" 
                         :class="{ 'placeholder-item': story.isPlaceholder }"
                         @click="goToStoryDetail(story)">
                        <div class="story-image" :style="{ backgroundImage: 'url(' + story.image + ')' }"></div>
                        <div class="story-content">
                            <h3>{{ story.title }}</h3>
                            <p class="story-text">{{ story.text }}</p>
                            <p class="story-author">— {{ story.author }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 常见问题部分 -->
        <section class="faq-section">
            <div class="faq-container">
                <h2>常见问题</h2>
                <div class="faq-list">
                    <div v-for="(faq, index) in faqItems" :key="index" class="faq-item">
                        <div class="faq-question" @click="faq.open = !faq.open">
                            <span class="faq-icon">{{ faq.open ? '−' : '+' }}</span>
                            <span class="faq-title">{{ faq.question }}</span>
                        </div>
                        <div v-if="faq.open" class="faq-answer">{{ faq.answer }}</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 志愿者招募部分 -->
        <section class="volunteer-section">
            <div class="volunteer-container">
                <h2>加入我们</h2>
                <div class="volunteer-info">
                    <p class="volunteer-title">我们需要您的帮助</p>
                    <p class="volunteer-desc">无论您是学生、上班族还是退休人士，都可以加入我们的志愿者团队，为动物们做出改变。</p>
                    <button class="volunteer-btn" @click="goToVolunteerApply">成为志愿者</button>
                </div>
            </div>
        </section>

        <footer-layout></footer-layout>
    </div>
</template>

<script>
import { getStoryList, getHomepageStats, getPetList, getFaqList, getRecommendedPets, API_BASE_URL } from '@/utils/api'

export default {
    name: "frontIndexPage",
    data() {
        return {
            loading: {
                stats: false,
                pets: false,
                stories: false,
                faq: false
            },
            serviceItems: [
                {
                    icon: '🐾',
                    title: '领养',
                    description: '给流浪动物一个温暖的家'
                },
                {
                    icon: '❤️',
                    title: '捐赠',
                    description: '您的爱心帮助更多生命'
                },
                {
                    icon: '🤝',
                    title: '志愿者',
                    description: '加入我们成为动物守护者'
                }
            ],
            fourColumnItems: [
                {
                    title: '救·保护',
                    image: require('@/assets/front/index/wrapper-1.jpg')
                },
                {
                    title: '送养·家访',
                    image: require('@/assets/front/index/wrapper-2.jpg')
                },
                {
                    title: '人畜共患病',
                    image: require('@/assets/front/index/wrapper-3.jpg')
                },
                {
                    title: '教育·活动',
                    image: require('@/assets/front/index/wrapper-4.jpg')
                }
            ],
            statsData: [
                { number: "0", label: "成功领养" },
                { number: "0", label: "志愿工作者" },
                { number: "0", label: "救助动物" },
                { number: "28", label: "合作机构" }
            ],
            adoptionSteps: [
                { number: "01", title: "了解信息", description: "浏览我们的动物档案库，了解每只宠物的性格和需求" },
                { number: "02", title: "预约看望", description: "联系我们预约时间，来亲自见见您心仪的小伙伴" },
                { number: "03", title: "评估申请", description: "我们会了解您的生活环境，确保最好的匹配" },
                { number: "04", title: "签署合同", description: "完成必要的手续和签署领养协议" },
                { number: "05", title: "带回家", description: "准备好了吗？带上您的新家庭成员回家吧" }
            ],
            adoptionStories: [],
            defaultImages: [
                require('@/assets/front/index/wrapper-1.jpg'),
                require('@/assets/front/index/wrapper-2.jpg'),
                require('@/assets/front/index/wrapper-3.jpg'),
                require('@/assets/front/index/wrapper-4.jpg')
            ],
            adoptionAnimals: [],
            faqItems: []
        }
    },
    mounted() {
        this.loadAllData()
    },
    methods: {
        async loadAllData() {
            await Promise.all([
                this.loadStats(),
                this.loadPets(),
                this.loadAdoptionStories(),
                this.loadFaq()
            ])
        },
        async loadStats() {
            this.loading.stats = true
            try {
                const response = await getHomepageStats()
                if (response.data && response.data.code === 200) {
                    const data = response.data.data
                    this.statsData = [
                        { number: String(data.approvedAdoptions || 0), label: "成功领养" },
                        { number: String(data.activeVolunteers || 0), label: "志愿工作者" },
                        { number: String(data.rescuedAnimals || 0), label: "救助动物" },
                        { number: String(data.partnerInstitutions || 28), label: "合作机构" }
                    ]
                }
            } catch (error) {
                console.error('加载统计数据失败:', error)
            } finally {
                this.loading.stats = false
            }
        },
        async loadPets() {
            this.loading.pets = true
            // 先清空数组
            this.adoptionAnimals = []
            try {
                // 优先尝试获取推荐宠物（协同过滤）
                let pets = []
                let useRecommended = false
                
                try {
                    const recommendResponse = await getRecommendedPets({ limit: 4, algorithm: 'hybrid' })
                    if (recommendResponse.data && recommendResponse.data.code === 200 && recommendResponse.data.data) {
                        pets = Array.isArray(recommendResponse.data.data) 
                            ? recommendResponse.data.data 
                            : (recommendResponse.data.data.list || [])
                        useRecommended = pets.length > 0
                    }
                } catch (recommendError) {
                    console.log('获取推荐宠物失败，使用普通列表:', recommendError)
                }
                
                // 如果推荐为空，使用普通列表
                if (!useRecommended || pets.length === 0) {
                    const response = await getPetList({ status: 'available', page: 1, size: 4 })
                    if (response.data && response.data.code === 200 && response.data.data) {
                        pets = response.data.data.list || []
                    }
                }
                
                // 加载真实数据
                if (pets.length > 0) {
                    this.adoptionAnimals = pets.map((pet, index) => ({
                        id: pet.id,
                        name: pet.pet_name || '未命名',
                        type: `${this.getTypeName(pet.pet_type)} · ${pet.age || '未知'}岁`,
                        description: pet.description || '暂无描述',
                        image: this.getPetImage(pet.image_url, index),
                        isRecommended: useRecommended // 标记是否为推荐
                    }))
                }
                // 如果数据不足4个，用占位元素补齐
                while (this.adoptionAnimals.length < 4) {
                    const index = this.adoptionAnimals.length
                    this.adoptionAnimals.push({
                        id: `placeholder-${index}`,
                        name: '待领养',
                        type: '等待中',
                        description: '更多可爱的小动物即将到来',
                        image: this.defaultImages[index % 4],
                        isPlaceholder: true
                    })
                }
            } catch (error) {
                console.error('加载宠物列表失败:', error)
                // 加载失败时，如果还没有数据，使用占位数据
                if (this.adoptionAnimals.length === 0) {
                    this.adoptionAnimals = this.defaultImages.slice(0, 4).map((img, index) => ({
                        id: `placeholder-${index}`,
                        name: '待领养',
                        type: '等待中',
                        description: '更多可爱的小动物即将到来',
                        image: img,
                        isPlaceholder: true
                    }))
                } else {
                    // 如果已经有部分数据，补齐到4个
                    while (this.adoptionAnimals.length < 4) {
                        const index = this.adoptionAnimals.length
                        this.adoptionAnimals.push({
                            id: `placeholder-${index}`,
                            name: '待领养',
                            type: '等待中',
                            description: '更多可爱的小动物即将到来',
                            image: this.defaultImages[index % 4],
                            isPlaceholder: true
                        })
                    }
                }
            } finally {
                this.loading.pets = false
            }
        },
        async loadAdoptionStories() {
            this.loading.stories = true
            // 先清空数组
            this.adoptionStories = []
            try {
                const response = await getStoryList({ status: 'published', size: 3 })
                if (response.data && response.data.code === 200 && response.data.data) {
                    const stories = response.data.data.list || []
                    // 加载真实数据
                    this.adoptionStories = stories.map((story, index) => ({
                        id: story.id,
                        title: story.title,
                        image: this.getStoryImage(story.image_url, index),
                        text: this.getStoryExcerpt(story.content),
                        author: story.author
                    }))
                }
                // 如果数据不足3个，用占位元素补齐
                while (this.adoptionStories.length < 3) {
                    const index = this.adoptionStories.length
                    this.adoptionStories.push({
                        id: `placeholder-story-${index}`,
                        title: '等待故事',
                        image: this.defaultImages[index % 3],
                        text: '更多温暖的故事即将分享...',
                        author: '待分享',
                        isPlaceholder: true
                    })
                }
            } catch (error) {
                console.error('加载领养故事失败:', error)
                // 加载失败时，如果还没有数据，使用占位数据
                if (this.adoptionStories.length === 0) {
                    this.adoptionStories = this.defaultImages.slice(0, 3).map((img, index) => ({
                        id: `placeholder-story-${index}`,
                        title: '等待故事',
                        image: img,
                        text: '更多温暖的故事即将分享...',
                        author: '待分享',
                        isPlaceholder: true
                    }))
                } else {
                    // 如果已经有部分数据，补齐到3个
                    while (this.adoptionStories.length < 3) {
                        const index = this.adoptionStories.length
                        this.adoptionStories.push({
                            id: `placeholder-story-${index}`,
                            title: '等待故事',
                            image: this.defaultImages[index % 3],
                            text: '更多温暖的故事即将分享...',
                            author: '待分享',
                            isPlaceholder: true
                        })
                    }
                }
            } finally {
                this.loading.stories = false
            }
        },
        async loadFaq() {
            this.loading.faq = true
            try {
                const response = await getFaqList({ page: 1, size: 5 })
                if (response.data && response.data.code === 200 && response.data.data.list) {
                    this.faqItems = response.data.data.list.map(faq => ({
                        id: faq.id,
                        question: faq.question,
                        answer: faq.answer,
                        open: false
                    }))
                }
                // 如果数据不足5个，用占位元素补齐
                const defaultFaqs = [
                    { question: "领养需要什么条件？", answer: "我们需要您有稳定的住所、充足的时间照顾宠物，以及对动物的爱心和耐心。我们会进行家访评估。" },
                    { question: "领养费用是多少？", answer: "领养费用通常在500-2000元之间，包括疫苗、绝育等必要的医疗服务。具体根据动物的情况而定。" },
                    { question: "如果无法继续养该怎么办？", answer: "如果您遇到困难，可以随时联系我们。我们会尽力帮助您，必要时可以接回宠物，不会有任何处罚。" },
                    { question: "宠物是否都已接种疫苗？", answer: "是的，所有待领养的宠物都已接种基础疫苗、驱虫和绝育。我们会提供完整的医疗证明。" },
                    { question: "可以先试养吗？", answer: "对于某些情况，我们可以提供7-14天的试养期。这样您和宠物都能更好地了解彼此。" }
                ]
                while (this.faqItems.length < 5) {
                    const index = this.faqItems.length
                    this.faqItems.push({
                        id: `placeholder-faq-${index}`,
                        question: defaultFaqs[index]?.question || '常见问题',
                        answer: defaultFaqs[index]?.answer || '更多信息请咨询我们',
                        open: false,
                        isPlaceholder: true
                    })
                }
            } catch (error) {
                console.error('加载FAQ失败:', error)
                // 加载失败时使用默认数据
                this.faqItems = [
                    { id: 1, question: "领养需要什么条件？", answer: "我们需要您有稳定的住所、充足的时间照顾宠物，以及对动物的爱心和耐心。我们会进行家访评估。", open: false },
                    { id: 2, question: "领养费用是多少？", answer: "领养费用通常在500-2000元之间，包括疫苗、绝育等必要的医疗服务。具体根据动物的情况而定。", open: false },
                    { id: 3, question: "如果无法继续养该怎么办？", answer: "如果您遇到困难，可以随时联系我们。我们会尽力帮助您，必要时可以接回宠物，不会有任何处罚。", open: false },
                    { id: 4, question: "宠物是否都已接种疫苗？", answer: "是的，所有待领养的宠物都已接种基础疫苗、驱虫和绝育。我们会提供完整的医疗证明。", open: false },
                    { id: 5, question: "可以先试养吗？", answer: "对于某些情况，我们可以提供7-14天的试养期。这样您和宠物都能更好地了解彼此。", open: false }
                ]
            } finally {
                this.loading.faq = false
            }
        },
        getTypeName(type) {
            const typeMap = {
                'dog': '狗狗',
                'cat': '猫咪',
                'other': '其他'
            }
            return typeMap[type] || '未知'
        },
        getPetImage(imageUrl, index) {
            if (!imageUrl) {
                return this.defaultImages[index % 4]
            }
            if (imageUrl.startsWith('http')) {
                return imageUrl
            }
            return `${API_BASE_URL.replace('/api', '')}${imageUrl}`
        },
        getStoryImage(imageUrl, index) {
            if (!imageUrl) {
                return this.defaultImages[index % 3]
            }
            if (imageUrl.startsWith('http')) {
                return imageUrl
            }
            return `${API_BASE_URL.replace('/api', '')}${imageUrl}`
        },
        getStoryExcerpt(content) {
            if (!content) return '暂无描述'
            const text = content.replace(/<[^>]*>/g, '').trim()
            if (text.length <= 100) return text
            return text.substring(0, 100) + '...'
        },
        goToStoryDetail(story) {
            if (story.isPlaceholder) return
            this.$router.push({
                name: 'storiesDetail',
                params: { id: story.id }
            })
        },
        goToPetDetail(animal) {
            if (animal.isPlaceholder) return
            this.$router.push({
                path: '/adoption/detail',
                query: { id: animal.id }
            })
        },
        goToAllPets() {
            this.$router.push('/adoption/list')
        },
        goToVolunteerApply() {
            this.$router.push('/volunteer/apply')
        }
    }
}
</script>

<style lang="less" scoped>
.frontIndexPage {
    width: 100%;
}

.banner-section {
    width: 100%;
    height: calc(100vh - 60px);
    position: relative;
    overflow: hidden;

    .banner-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .banner-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 1;
    }

    .banner-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        text-align: center;
        z-index: 2;
        width: 100%;
        cursor: default;
        user-select: none;
        pointer-events: none;

        h1 {
            font-size: 5rem;
            margin-bottom: 1rem;
            font-weight: bold;
        }

        p {
            font-size: 2.5rem;
            margin: 0.5rem 0;
        }
    }
}

.service-section-wrapper {
    background-color: #f1f1f1;
    padding: 80px 0;
}

.service {
    background-color: transparent;

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

    .service-section {
        max-width: 1400px;
        padding: 0;
        margin: auto;
        display: flex;
        justify-content: space-around;
        gap: 50px;
        cursor: pointer;
        user-select: none;

        .service-item {
            text-align: center;
            width: 30%;
            padding: 30px;
            border-radius: 10px;
            transition: all 0.3s ease;
            background: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

            &:hover {
                transform: translateY(-10px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            }

            .service-icon {
                font-size: 3rem;
                margin-bottom: 20px;
            }

            h3 {
                font-size: 1.8rem;
                margin-bottom: 15px;
                color: #333;
            }

            p {
                font-size: 1.2rem;
                color: #666;
            }
        }
    }
}

.stats-section {
    background-color: #fff;
    padding: 100px 0 80px;

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

    .stats-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        gap: 60px;

        .stat-item {
            text-align: center;
            flex: 1;
            min-width: 180px;

            .stat-number {
                font-size: 3.5rem;
                font-weight: bold;
                color: #d52b1e;
                margin-bottom: 15px;
            }

            .stat-label {
                font-size: 1.1rem;
                color: #666;
                font-weight: 500;
            }
        }
    }
}

.four-column-section {
    background-color: #f8f9ff;
    padding: 100px 0;

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
}

.four-column-wrapper {
    padding: 0;
    background-color: transparent;

    .four-column-container {
        max-width: 1300px;
        margin: 0 auto;
        display: flex;
        justify-content: space-around;

        .four-column-item {
            width: 300px;
            height: 450px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            overflow: hidden;
            cursor: pointer;

            // 背景图片和遮罩层
            .item-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-size: cover;
                background-position: center;
                transition: transform 0.5s ease;
                z-index: 1;

                // 添加黑色半透明遮罩
            &::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }
            }

            // 内容区域
            .item-content {
                position: relative;
                z-index: 2;
                color: white;
                padding: 20px;

                h3 {
                    font-size: 1.5rem;
                    margin-bottom: 15px;
                    color: white;
                }

                p {
                    font-size: 1rem;
                    color: rgba(255, 255, 255, 0.9);
                }
            }

            // 悬停效果：背景放大
            &:hover {
                .item-overlay {
                    transform: scale(1.1);
                }
            }
        }
    }
}

/* 领养列表样式 */
.adoption-list-section {
    background-color: #fff;
    padding: 100px 0;

    .adoption-list-container {
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
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;

            .recommend-badge {
                font-size: 1rem;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                color: white;
                padding: 6px 16px;
                border-radius: 20px;
                font-weight: 500;
                box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }
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

        .adoption-list-wrapper {
            margin-bottom: 50px;

            .adoption-list-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 30px;

                        .adoption-list-item {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.3s ease;

                    &:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                    }

                    &.placeholder-item {
                        opacity: 0.7;
                        cursor: default;
                    }

                    .animal-image {
                        width: 100%;
                        height: 250px;
                        background-size: cover;
                        background-position: center;
                        overflow: hidden;
                    }

                    .animal-info {
                        padding: 20px;

                        h4 {
                            font-size: 1.4rem;
                            color: #333;
                            margin-bottom: 8px;
                            font-weight: bold;
                        }

                        .animal-type {
                            font-size: 0.95rem;
                            color: #d52b1e;
                            margin-bottom: 12px;
                            font-weight: 500;
                        }

                        .animal-desc {
                            font-size: 0.95rem;
                            color: #666;
                            margin-bottom: 15px;
                            line-height: 1.5;
                            height: 2.85em;
                            overflow: hidden;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                        }

                        .adoption-detail-btn {
                            width: 100%;
                            padding: 10px 0;
                            background: #d52b1e;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            font-size: 1rem;
                            font-weight: bold;
                            cursor: pointer;
                        }
                    }
                }
            }
        }

        .view-all-btn-wrapper {
            text-align: center;

            .view-all-btn {
                padding: 15px 50px;
                background-color: #d52b1e;
                color: white;
                border: 2px solid #d52b1e;
                border-radius: 50px;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
            }
        }
    }
}

/* 领养流程样式 */
.adoption-process {
    background-color: #f8f8f8;
    padding: 80px 5%;

    .adoption-container {
        max-width: 1400px;
        margin: 0 auto;

        h2 {
            text-align: center;
            font-size: 2.5rem;
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

        .process-steps {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            flex-wrap: wrap;

            .process-step {
                flex: 1;
                min-width: 180px;
                text-align: center;
                padding: 0 15px;
                position: relative;

                .step-number {
                    font-size: 3rem;
                    font-weight: bold;
                    color: #d52b1e;
                    margin-bottom: 15px;
                }

                .step-title {
                    font-size: 1.3rem;
                    color: #333;
                    margin-bottom: 10px;
                    font-weight: bold;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .step-desc {
                    font-size: 1rem;
                    color: #666;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.4;
                }

                &::after {
                    content: '→';
                    position: absolute;
                    right: -30px;
                    top: 10px;
                    font-size: 2rem;
                    color: #d52b1e;
                }

                &:last-child::after {
                    display: none;
                }
            }
        }
    }
}

/* 领养故事样式 */
.adoption-stories {
    background-color: #fff;
    padding: 80px 0;

    .stories-container {
        max-width: 1300px;
        margin: 0 auto;

        .stories-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 60px;
            flex-wrap: wrap;
            gap: 20px;

            h2 {
                font-size: 2.5rem;
                color: #333;
                font-weight: bold;
                position: relative;
                padding-bottom: 20px;
                flex: 1;
                min-width: 200px;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 80px;
                    height: 4px;
                    background: linear-gradient(90deg, #d52b1e 0%, #e85541 100%);
                    border-radius: 2px;
                }
            }

            .share-btn {
                padding: 12px 25px;
                background-color: #d52b1e;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 0.95rem;
                font-weight: bold;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                transition: all 0.3s ease;

                &:hover {
                    background-color: #b52318;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(213, 43, 30, 0.3);
                }
            }
        }

        h2 {
            text-align: center;
            font-size: 2.5rem;
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

        .stories-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;

            .story-card {
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
                cursor: pointer;

                &:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                }

                &.placeholder-item {
                    opacity: 0.7;
                    cursor: default;
                }

                .story-image {
                    width: 100%;
                    height: 250px;
                    background-size: cover;
                    background-position: center;
                }

                .story-content {
                    padding: 20px;

                    h3 {
                        font-size: 1.2rem;
                        color: #333;
                        margin-bottom: 10px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .story-text {
                        font-size: 0.95rem;
                        color: #666;
                        line-height: 1.5;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        margin-bottom: 10px;
                    }

                    .story-author {
                        font-size: 0.9rem;
                        color: #999;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
            }
        }
    }
}

/* 常见问题样式 */
.faq-section {
    background-color: #f8f8f8;
    padding: 80px 0;

    .faq-container {
        max-width: 900px;
        margin: 0 auto;

        h2 {
            text-align: center;
            font-size: 2.5rem;
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

        .faq-list {
            .faq-item {
                background: white;
                margin-bottom: 15px;
                border-radius: 5px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

                .faq-question {
                    padding: 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    background-color: #f5f5f5;
                    transition: background-color 0.3s ease;

                    &:hover {
                        background-color: #efefef;
                    }

                    .faq-icon {
                        font-size: 1.5rem;
                        color: #d52b1e;
                        margin-right: 15px;
                        min-width: 30px;
                    }

                    .faq-title {
                        font-size: 1.1rem;
                        color: #333;
                        font-weight: bold;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }

                .faq-answer {
                    padding: 20px;
                    background-color: white;
                    border-top: 1px solid #eee;
                    font-size: 1rem;
                    color: #666;
                    line-height: 1.6;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }
    }
}

/* 志愿者招募样式 */
.volunteer-section {
    padding: 80px 0;
    background:url('@/assets/front/index/jiaru.jpg') center;
    background-size: cover;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 1;
    }

    .volunteer-container {
        position: relative;
        z-index: 2;
        max-width: 1000px;
        margin: 0 auto;
        text-align: center;

        h2 {
            font-size: 2.5rem;
            color: white;
            margin-bottom: 40px;
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
                background: linear-gradient(90deg, #ffffff 0%, #d4d4d4 100%);
                border-radius: 2px;
            }
        }

        .volunteer-info {
            .volunteer-title {
                font-size: 1.8rem;
                color: white;
                margin-bottom: 20px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .volunteer-desc {
                font-size: 1.1rem;
                color: rgba(255, 255, 255, 0.9);
                margin-bottom: 30px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .volunteer-btn {
                background-color: white;
                color: #ca2b1e;
                border: none;
                padding: 15px 40px;
                font-size: 1.1rem;
                border-radius: 50px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                white-space: nowrap;

                &:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                }
            }
        }
    }
}
</style>
<template>
    <div class="stories-detail-page">
        <header-layout></header-layout>

        <!-- 面包屑导航 -->
        <div class="breadcrumb-wrapper">
            <div class="breadcrumb-container">
                <router-link to="/">首页</router-link>
                <span class="separator">></span>
                <span>领养故事</span>
                <span class="separator">></span>
                <span class="current">{{ story.title }}</span>
            </div>
        </div>

        <!-- 故事详情内容 -->
        <section class="detail-content-wrapper" v-loading="loading">
            <div class="detail-content">
                <div class="story-detail">
                    <!-- 故事图片 -->
                    <div class="detail-image-wrapper">
                        <img :src="storyImage" :alt="story.title" class="detail-image">
                    </div>

                    <!-- 故事信息 -->
                    <div class="detail-info">
                        <h1 class="story-title">{{ story.title }}</h1>
                        <div class="story-meta">
                            <span class="author">📝 {{ story.author }}</span>
                            <span class="date">📅 {{ story.date }}</span>
                        </div>

                        <!-- 故事内容 -->
                        <div class="story-body">
                            <p>{{ story.fullText }}</p>
                        </div>

                        <!-- 故事标签 -->
                        <div class="story-tags" v-if="story.tags && story.tags.length > 0">
                            <span class="tag-label">标签：</span>
                            <span v-for="(tag, index) in story.tags" :key="index" class="tag">{{ tag }}</span>
                        </div>

                        <!-- 动作按钮 -->
                        <div class="action-buttons">
                            <button class="btn btn-primary" @click="handleAdopt">了解领养</button>
                            <button class="btn btn-secondary" @click="handleShare">分享故事</button>
                            <button class="btn btn-secondary" @click="goBack">返回</button>
                        </div>
                    </div>
                </div>

                <!-- 评论区域 -->
                <div class="comments-section">
                    <h3>读者评论</h3>
                    
                    <!-- 评论表单 -->
                    <div class="comment-form">
                        <h4>发表评论</h4>
                        <div v-if="!isAuthenticated" class="login-tip">
                            <i class="el-icon-warning"></i>
                            <span>请先登录后再发表评论</span>
                            <el-button type="text" @click="goToLogin" class="login-link">立即登录</el-button>
                        </div>
                        <el-form :model="commentForm" @submit.native.prevent v-else>
                            <div class="user-info-display">
                                <div class="user-avatar">
                                    <span>{{ currentUserDisplayName.charAt(0) }}</span>
                                </div>
                                <div class="user-name">{{ currentUserDisplayName }}</div>
                            </div>
                            <el-form-item label="评论内容">
                                <el-input 
                                    v-model="commentForm.content" 
                                    type="textarea"
                                    placeholder="请分享您的想法和感受..."
                                    maxlength="500"
                                    show-word-limit
                                    :rows="5">
                                </el-input>
                            </el-form-item>
                            <el-button type="primary" @click="submitComment" class="submit-btn" :loading="commentLoading">
                                <i class="el-icon-edit"></i>
                                发表评论
                            </el-button>
                        </el-form>
                    </div>

                    <!-- 评论列表 -->
                    <div class="comments-list" v-if="comments.length > 0">
                        <h4>{{ comments.length }} 条评论</h4>
                        <div v-for="(comment, index) in comments" :key="index" class="comment-item">
                            <div class="comment-avatar">
                                <span class="avatar-text">{{ comment.name.charAt(0) }}</span>
                            </div>
                            <div class="comment-body">
                                <div class="comment-header">
                                    <span class="comment-name">{{ comment.name }}</span>
                                    <span class="comment-time">{{ formatTime(comment.time) }}</span>
                                </div>
                                <p class="comment-text">{{ comment.content }}</p>
                                <div class="comment-actions">
                                    <span class="action-btn" @click="likeComment(index)">
                                        <i :class="['el-icon-thumb', comment.liked ? 'liked' : '']"></i>
                                        赞 {{ comment.likes > 0 ? comment.likes : '' }}
                                    </span>
                                    <span class="action-btn" @click="deleteComment(index)">删除</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="empty-comments">
                        <p>暂无评论，来发表第一条评论吧！</p>
                    </div>
                </div>

                <!-- 相关故事推荐 -->
                <div class="related-stories" v-if="relatedStories.length > 0">
                    <h3>更多精彩故事</h3>
                    <div class="related-grid">
                        <div v-for="(item, index) in relatedStories" :key="index" class="related-item" @click="viewStory(item)">
                            <div class="related-image" :style="{ backgroundImage: 'url(' + item.image + ')' }"></div>
                            <div class="related-info">
                                <h4>{{ item.title }}</h4>
                                <p>— {{ item.author }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <footer-layout></footer-layout>
    </div>
</template>

<script>
import { getStoryDetail, getStoryList, getCommentsByStoryId, createStoryComment, likeStoryComment, deleteStoryComment, API_BASE_URL } from '@/utils/api'
import { formatDate } from '@/utils/dateFormat'

export default {
    name: 'StoriesDetail',
    data() {
        return {
            loading: false,
            commentLoading: false,
            commentForm: {
                name: '',
                content: ''
            },
            comments: [],
            story: {
                id: null,
                title: '',
                author: '',
                date: '',
                image: '',
                fullText: '',
                tags: [],
                animalInfo: null
            },
            relatedStories: [],
            defaultImage: require('@/assets/front/index/wrapper-1.jpg')
        }
    },
    computed: {
        storyImage() {
            if (this.story.image_url) {
                return this.story.image_url.startsWith('http') 
                    ? this.story.image_url 
                    : `${API_BASE_URL.replace('/api', '')}${this.story.image_url}`
            }
            return this.defaultImage
        },
        // 获取当前登录用户信息
        currentUser() {
            return this.$store.getters['user/userInfo']
        },
        // 是否已登录
        isAuthenticated() {
            return this.$store.getters['user/isAuthenticated']
        },
        // 当前用户显示名称
        currentUserDisplayName() {
            if (this.currentUser) {
                return this.currentUser.real_name || this.currentUser.username || '用户'
            }
            return '用户'
        }
    },
    mounted() {
        this.loadStoryDetail()
        this.fillUserNickname()
    },
    watch: {
        '$route.params.id': {
            handler() {
                this.loadStoryDetail()
            }
        },
        // 监听登录状态变化
        isAuthenticated: {
            handler(newVal) {
                if (newVal) {
                    this.fillUserNickname()
                }
            },
            immediate: true
        },
        // 监听用户信息变化
        currentUser: {
            handler() {
                if (this.isAuthenticated) {
                    this.fillUserNickname()
                }
            },
            deep: true
        }
    },
    methods: {
        // 自动填充用户昵称
        fillUserNickname() {
            if (this.isAuthenticated && this.currentUser) {
                // 优先使用 real_name，如果没有则使用 username
                if (this.currentUser.real_name) {
                    this.commentForm.name = this.currentUser.real_name
                } else if (this.currentUser.username) {
                    this.commentForm.name = this.currentUser.username
                }
            }
        },
        // 跳转到登录（触发header的登录对话框）
        goToLogin() {
            // 触发登录对话框
            this.$root.$emit('show-login-dialog')
            // 滚动到顶部，方便用户看到登录对话框
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },
        async loadStoryDetail() {
            const id = this.$route.params.id
            if (!id) {
                this.$message.error('故事ID不存在')
                return
            }
            
            this.loading = true
            try {
                const response = await getStoryDetail(id)
                if (response.data && response.data.code === 200) {
                    const storyData = response.data.data
                    
                    // 处理 tags：后端可能返回数组或字符串
                    let tags = []
                    if (storyData.tags) {
                        if (Array.isArray(storyData.tags)) {
                            tags = storyData.tags
                        } else if (typeof storyData.tags === 'string') {
                            tags = storyData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                        }
                    }
                    
                    this.story = {
                        id: storyData.id,
                        title: storyData.title || '未命名故事',
                        author: storyData.author || '匿名',
                        date: this.formatDate(storyData.publish_date || storyData.create_time),
                        image_url: storyData.image_url,
                        fullText: storyData.content || '',
                        tags: tags,
                        views: storyData.views || 0,
                        likes: storyData.likes || 0,
                        animalInfo: storyData.pet_name ? {
                            name: storyData.pet_name,
                            type: storyData.pet_type,
                            breed: storyData.breed,
                            image: storyData.pet_image
                        } : null
                    }
                    
                    // 加载评论
                    this.loadComments()
                    // 加载相关故事
                    this.loadRelatedStories()
                } else {
                    const errorMsg = response.data?.message || '获取故事详情失败'
                    this.$message.error(errorMsg)
                    // 如果故事不存在，3秒后返回上一页
                    if (response.data?.code === 404) {
                        setTimeout(() => {
                            this.$router.go(-1)
                        }, 3000)
                    }
                }
            } catch (error) {
                console.error('加载故事详情失败:', error)
                const errorMsg = error.response?.data?.message || error.message || '加载故事详情失败，请稍后重试'
                this.$message.error(errorMsg)
            } finally {
                this.loading = false
            }
        },
        async loadComments() {
            const storyId = this.story.id
            if (!storyId) return
            
            this.commentLoading = true
            try {
                const response = await getCommentsByStoryId(storyId)
                if (response.data.code === 200) {
                    this.comments = response.data.data.list.map(comment => ({
                        id: comment.id,
                        name: comment.user_name,
                        content: comment.content,
                        time: new Date(comment.create_time),
                        likes: comment.likes || 0,
                        liked: false
                    }))
                }
            } catch (error) {
                console.error('加载评论失败:', error)
            } finally {
                this.commentLoading = false
            }
        },
        async loadRelatedStories() {
            try {
                const response = await getStoryList({ status: 'published', size: 3 })
                if (response.data.code === 200) {
                    this.relatedStories = response.data.data.list
                        .filter(s => s.id !== this.story.id)
                        .slice(0, 3)
                        .map(s => ({
                            id: s.id,
                            title: s.title,
                            author: s.author,
                            image: s.image_url 
                                ? (s.image_url.startsWith('http') ? s.image_url : `${API_BASE_URL.replace('/api', '')}${s.image_url}`)
                                : this.defaultImage
                        }))
                }
            } catch (error) {
                console.error('加载相关故事失败:', error)
            }
        },
        formatDate(dateStr) {
            return formatDate(dateStr)
        },
        goBack() {
            this.$router.go(-1)
        },
        viewStory(story) {
            this.$router.push(`/stories/detail/${story.id}`)
        },
        handleAdopt() {
            this.$router.push('/adoption/list')
        },
        handleShare() {
            const url = window.location.href
            const text = `我在"动物收养网"发现了一个感人的故事：${this.story.title}`
            if (navigator.share) {
                navigator.share({
                    title: this.story.title,
                    text: text,
                    url: url
                })
            } else {
                // 复制到剪贴板
                const shareText = `${text} ${url}`
                navigator.clipboard.writeText(shareText).then(() => {
                    this.$message.success('链接已复制到剪贴板')
                }).catch(() => {
                    this.$message.info('分享功能：' + text)
                })
            }
        },
        async submitComment() {
            // 检查是否登录
            if (!this.isAuthenticated) {
                this.$message.warning('请先登录后再发表评论')
                this.goToLogin()
                return
            }

            // 确保使用当前登录用户的昵称
            if (this.currentUser) {
                if (this.currentUser.real_name) {
                    this.commentForm.name = this.currentUser.real_name
                } else if (this.currentUser.username) {
                    this.commentForm.name = this.currentUser.username
                }
            }

            if (!this.commentForm.content.trim()) {
                this.$message.warning('请输入评论内容')
                return
            }

            this.commentLoading = true
            try {
                const response = await createStoryComment({
                    story_id: this.story.id,
                    user_name: this.commentForm.name,
                    content: this.commentForm.content
                })
                
                if (response.data && response.data.code === 200) {
                    this.$message.success('评论提交成功')
                    // 清空评论内容，但保持昵称
                    this.commentForm.content = ''
                    // 重新填充昵称，确保使用最新的用户信息
                    this.fillUserNickname()
                    // 重新加载评论
                    this.loadComments()
                } else {
                    this.$message.error(response.data?.message || '评论提交失败')
                }
            } catch (error) {
                console.error('提交评论失败:', error)
                // 使用全局错误处理，如果是未登录错误会自动提示并显示登录对话框
                if (!this.$handleApiError(error)) {
                    // 如果不是未登录错误，显示其他错误信息
                    this.$message.error(error.response?.data?.message || error.data?.message || error.message || '评论提交失败')
                }
            } finally {
                this.commentLoading = false
            }
        },
        formatTime(date) {
            const now = new Date()
            const diff = now - date
            const seconds = Math.floor(diff / 1000)
            const minutes = Math.floor(seconds / 60)
            const hours = Math.floor(minutes / 60)
            const days = Math.floor(hours / 24)

            if (seconds < 60) return '刚刚'
            if (minutes < 60) return `${minutes}分钟前`
            if (hours < 24) return `${hours}小时前`
            if (days < 7) return `${days}天前`
            
            return date.toLocaleDateString()
        },
        async likeComment(index) {
            const comment = this.comments[index]
            try {
                await likeStoryComment(comment.id)
                if (comment.liked) {
                    comment.likes--
                    comment.liked = false
                } else {
                    comment.likes++
                    comment.liked = true
                }
            } catch (error) {
                console.error('点赞失败:', error)
            }
        },
        deleteComment(index) {
            const comment = this.comments[index]
            this.$confirm('确定要删除该评论吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    await deleteStoryComment(comment.id)
                    this.comments.splice(index, 1)
                    this.$message.success('评论已删除')
                } catch (error) {
                    console.error('删除评论失败:', error)
                    this.$message.error('删除评论失败')
                }
            }).catch(() => {
                // 取消删除
            })
        },
    }
}
</script>

<style lang="less" scoped>
.stories-detail-page {
    width: 100%;
    background-color: #fff;
}

// 面包屑导航
.breadcrumb-wrapper {
    background-color: #f8f9ff;
    padding: 20px 0;
    border-bottom: 1px solid #e8e8e8;

    .breadcrumb-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;
        font-size: 0.95rem;
        color: #666;

        a {
            color: #d52b1e;
            text-decoration: none;
            cursor: pointer;

            &:hover {
                text-decoration: underline;
            }
        }

        .separator {
            margin: 0 10px;
        }

        .current {
            font-weight: bold;
            color: #333;
        }
    }
}

// 详情内容
.detail-content-wrapper {
    padding: 60px 0;
    background-color: #fff;

    .detail-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;

        .story-detail {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            margin-bottom: 80px;

            .detail-image-wrapper {
                .detail-image {
                    width: 100%;
                    height: 500px;
                    object-fit: cover;
                    border-radius: 12px;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                }
            }

            .detail-info {
                display: flex;
                flex-direction: column;
                justify-content: center;

                .story-title {
                    font-size: 2.5rem;
                    color: #333;
                    margin-bottom: 20px;
                    font-weight: bold;
                }

                .story-meta {
                    display: flex;
                    gap: 30px;
                    margin-bottom: 30px;
                    font-size: 1rem;
                    color: #666;

                    .author,
                    .date {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                }

                .story-body {
                    margin-bottom: 30px;
                    line-height: 1.8;
                    font-size: 1.05rem;
                    color: #555;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .story-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 30px;
                    align-items: center;

                    .tag-label {
                        font-weight: bold;
                        color: #333;
                    }

                    .tag {
                        display: inline-block;
                        background-color: #f0f0f0;
                        color: #d52b1e;
                        padding: 6px 15px;
                        border-radius: 20px;
                        font-size: 0.9rem;
                        border: 1px solid #d52b1e;
                    }
                }

                .action-buttons {
                    display: flex;
                    gap: 15px;

                    .btn {
                        padding: 12px 30px;
                        border: none;
                        border-radius: 6px;
                        font-size: 1rem;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;

                        &.btn-primary {
                            background-color: #d52b1e;
                            color: white;

                            &:hover {
                                background-color: #b52318;
                                transform: translateY(-2px);
                                box-shadow: 0 4px 12px rgba(213, 43, 30, 0.3);
                            }
                        }

                        &.btn-secondary {
                            background-color: #f0f0f0;
                            color: #333;
                            border: 1px solid #ddd;

                            &:hover {
                                background-color: #e8e8e8;
                                transform: translateY(-2px);
                            }
                        }
                    }
                }
            }
        }

        // 评论区域
        .comments-section {
            margin-top: 80px;
            padding-top: 40px;
            border-top: 2px solid #f0f0f0;

            h3 {
                font-size: 1.8rem;
                color: #333;
                margin-bottom: 30px;
                font-weight: bold;
                position: relative;
                padding-bottom: 15px;

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

            .comment-form {
                background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
                padding: 35px;
                border-radius: 16px;
                margin-bottom: 40px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
                border: 1px solid #e8e8f0;

                h4 {
                    font-size: 1.4rem;
                    color: #1a1a1a;
                    margin-bottom: 25px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    &::before {
                        content: '';
                        width: 4px;
                        height: 24px;
                        background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
                        border-radius: 2px;
                    }
                }

                .login-tip {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 20px;
                    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                    border-radius: 12px;
                    border-left: 4px solid #ffc107;
                    color: #856404;
                    font-size: 1rem;

                    i {
                        font-size: 1.2rem;
                        color: #ff9800;
                    }

                    .login-link {
                        color: #d52b1e;
                        font-weight: 600;
                        padding: 0;
                        margin-left: auto;

                        &:hover {
                            text-decoration: underline;
                        }
                    }
                }

                .user-info-display {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px 20px;
                    background: white;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    border: 1px solid #e8e8f0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

                    .user-avatar {
                        width: 45px;
                        height: 45px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: 700;
                        font-size: 1.1rem;
                        flex-shrink: 0;
                        box-shadow: 0 4px 12px rgba(213, 43, 30, 0.3);
                    }

                    .user-name {
                        font-size: 1.05rem;
                        color: #333;
                        font-weight: 600;
                    }
                }

                /deep/ .el-form {
                    .el-form-item {
                        margin-bottom: 25px;
                    }

                    .el-form-item__label {
                        color: #333;
                        font-weight: 600;
                        font-size: 1rem;
                    }

                    .el-input__inner,
                    .el-textarea__inner {
                        border-color: #e0e0e0;
                        border-radius: 10px;
                        font-size: 1rem;
                        transition: all 0.3s ease;

                        &:focus {
                            border-color: #d52b1e;
                            box-shadow: 0 0 0 3px rgba(213, 43, 30, 0.15);
                        }
                    }
                }

                .submit-btn {
                    background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%) !important;
                    border: none !important;
                    color: white !important;
                    padding: 14px 36px !important;
                    font-size: 1.05rem !important;
                    font-weight: 600 !important;
                    border-radius: 10px !important;
                    box-shadow: 0 4px 15px rgba(213, 43, 30, 0.3) !important;
                    transition: all 0.3s ease !important;

                    i {
                        margin-right: 8px;
                    }

                    &:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(213, 43, 30, 0.4) !important;
                    }

                    &:active {
                        transform: translateY(0);
                    }
                }
            }

            .comments-list {
                h4 {
                    font-size: 1.3rem;
                    color: #1a1a1a;
                    margin-bottom: 25px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    &::before {
                        content: '';
                        width: 4px;
                        height: 20px;
                        background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
                        border-radius: 2px;
                    }
                }

                .comment-item {
                    display: flex;
                    gap: 18px;
                    padding: 25px;
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
                    border: 1px solid #e8e8f0;
                    border-radius: 16px;
                    margin-bottom: 20px;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);

                    &:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
                        border-color: #d52b1e;
                    }

                    .comment-avatar {
                        width: 52px;
                        height: 52px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                        box-shadow: 0 4px 12px rgba(213, 43, 30, 0.25);

                        .avatar-text {
                            color: white;
                            font-weight: 700;
                            font-size: 1.3rem;
                        }
                    }

                    .comment-body {
                        flex: 1;

                        .comment-header {
                            display: flex;
                            gap: 15px;
                            margin-bottom: 12px;
                            align-items: center;
                            flex-wrap: wrap;

                            .comment-name {
                                font-weight: 700;
                                color: #1a1a1a;
                                font-size: 1.05rem;
                            }

                            .comment-time {
                                color: #999;
                                font-size: 0.9rem;
                                padding: 4px 12px;
                                background: #f0f0f0;
                                border-radius: 12px;
                            }
                        }

                        .comment-text {
                            color: #444;
                            line-height: 1.8;
                            margin: 12px 0;
                            font-size: 1rem;
                            white-space: pre-wrap;
                            word-break: break-word;
                            padding: 12px 0;
                        }

                        .comment-actions {
                            display: flex;
                            gap: 25px;
                            margin-top: 12px;
                            padding-top: 12px;
                            border-top: 1px solid #f0f0f0;

                            .action-btn {
                                cursor: pointer;
                                color: #666;
                                font-size: 0.95rem;
                                transition: all 0.3s ease;
                                display: flex;
                                align-items: center;
                                gap: 6px;
                                padding: 6px 12px;
                                border-radius: 8px;

                                &:hover {
                                    color: #d52b1e;
                                    background: rgba(213, 43, 30, 0.08);
                                }

                                i {
                                    transition: all 0.3s ease;
                                    font-size: 1.1rem;

                                    &.liked {
                                        color: #d52b1e;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            .empty-comments {
                text-align: center;
                padding: 40px 20px;
                color: #999;
                background-color: #f8f9ff;
                border-radius: 8px;

                p {
                    font-size: 1rem;
                    margin: 0;
                }
            }
        }

        .related-stories {
            padding-top: 40px;
            border-top: 2px solid #f0f0f0;

            h3 {
                font-size: 1.8rem;
                color: #333;
                margin-bottom: 30px;
                font-weight: bold;
                position: relative;
                padding-bottom: 15px;

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

            .related-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 30px;

                .related-item {
                    cursor: pointer;
                    transition: transform 0.3s ease;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

                    &:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                    }

                    .related-image {
                        width: 100%;
                        height: 200px;
                        background-size: cover;
                        background-position: center;
                    }

                    .related-info {
                        padding: 15px;
                        background-color: white;

                        h4 {
                            font-size: 1.1rem;
                            color: #333;
                            margin-bottom: 8px;
                            font-weight: bold;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }

                        p {
                            font-size: 0.9rem;
                            color: #999;
                        }
                    }
                }
            }
        }
    }
}

// 响应式
@media (max-width: 768px) {
    .detail-content-wrapper .detail-content .story-detail {
        grid-template-columns: 1fr;
        gap: 30px;
    }

    .detail-info {
        .story-title {
            font-size: 1.8rem;
        }

        .action-buttons {
            flex-wrap: wrap;

            .btn {
                flex: 1;
            }
        }
    }

    .related-stories .related-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>

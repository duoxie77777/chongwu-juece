<template>
    <div class="stories-submit-page">
        <header-layout></header-layout>

        <!-- 面包屑导航 -->
        <div class="breadcrumb-wrapper">
            <div class="breadcrumb-container">
                <router-link to="/">首页</router-link>
                <span class="separator">></span>
                <span>领养故事</span>
                <span class="separator">></span>
                <span class="current">分享你的故事</span>
            </div>
        </div>

        <!-- 页面内容 -->
        <section class="submit-wrapper">
            <div class="submit-container">
                <!-- 页面标题 -->
                <div class="page-header">
                    <h1>分享你的领养故事</h1>
                    <p>您的故事将激励更多人加入我们，一起为动物们带来温暖的家。</p>
                </div>

                <!-- 表单 -->
                <div class="form-container">
                    <form @submit.prevent="submitStory">
                        <!-- 基本信息区 -->
                        <div class="form-section">
                            <h3>基本信息</h3>

                            <div class="form-group">
                                <label for="title">故事标题 <span class="required">*</span></label>
                                <input
                                    id="title"
                                    v-model="form.title"
                                    type="text"
                                    placeholder="请输入一个吸引人的标题"
                                    required
                                    maxlength="50"
                                >
                                <span class="char-count">{{ form.title.length }}/50</span>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="name">您的名字 <span class="required">*</span></label>
                                    <input
                                        id="name"
                                        v-model="form.name"
                                        type="text"
                                        placeholder="您希望如何被称呼？"
                                        required
                                        maxlength="20"
                                    >
                                </div>
                                <div class="form-group">
                                    <label for="date">领养日期（可选）</label>
                                    <input
                                        id="date"
                                        v-model="form.date"
                                        type="date"
                                        :max="getTodayDate()"
                                    >
                                    <p class="form-hint" v-if="form.pet_id && selectedPet">已自动关联宠物信息</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="email">联系邮箱 <span class="required">*</span></label>
                                <input
                                    id="email"
                                    v-model="form.email"
                                    type="email"
                                    placeholder="请输入您的邮箱地址"
                                    required
                                >
                            </div>
                        </div>

                        <!-- 动物信息区 -->
                        <div class="form-section">
                            <h3>动物信息</h3>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="animalName">动物名字 <span class="required">*</span></label>
                                    <input
                                        id="animalName"
                                        v-model="form.animalName"
                                        type="text"
                                        placeholder="请输入动物的名字"
                                        required
                                        maxlength="30"
                                    >
                                </div>
                                <div class="form-group">
                                    <label for="animalType">动物类型 <span class="required">*</span></label>
                                    <select v-model="form.animalType" required>
                                        <option value="">-- 请选择 --</option>
                                        <option value="dog">狗狗</option>
                                        <option value="cat">猫咪</option>
                                        <option value="rabbit">兔子</option>
                                        <option value="bird">鸟类</option>
                                        <option value="other">其他</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="animalDesc">动物特征描述</label>
                                <textarea
                                    id="animalDesc"
                                    v-model="form.animalDesc"
                                    placeholder="请描述这只动物的外观特征、性格等"
                                    maxlength="200"
                                    rows="3"
                                ></textarea>
                                <span class="char-count">{{ form.animalDesc.length }}/200</span>
                            </div>
                        </div>

                        <!-- 故事内容区 -->
                        <div class="form-section">
                            <h3>故事内容</h3>

                            <div class="form-group">
                                <label for="summary">故事概述 <span class="required">*</span></label>
                                <textarea
                                    id="summary"
                                    v-model="form.summary"
                                    placeholder="用一句话简述这个故事的核心内容"
                                    required
                                    maxlength="100"
                                    rows="2"
                                ></textarea>
                                <span class="char-count">{{ form.summary.length }}/100</span>
                            </div>

                            <div class="form-group">
                                <label for="story">详细故事 <span class="required">*</span></label>
                                <textarea
                                    id="story"
                                    v-model="form.story"
                                    placeholder="请讲述您与这只动物的故事。包括它之前的经历、你们是如何相识的、相处中发生的趣事等。(最少100字，最多2000字)"
                                    required
                                    minlength="100"
                                    maxlength="2000"
                                    rows="10"
                                ></textarea>
                                <span class="char-count">{{ form.story.length }}/2000</span>
                            </div>
                        </div>

                        <!-- 媒体内容区 -->
                        <div class="form-section">
                            <h3>媒体内容</h3>

                            <div class="form-group">
                                <label for="image">故事封面图片 <span class="required">*</span></label>
                                <div class="image-upload">
                                    <input
                                        ref="imageInput"
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        required
                                        @change="handleImageUpload"
                                        class="image-input"
                                    >
                                    <div class="upload-area" @click="$refs.imageInput.click()">
                                        <div v-if="!form.imagePreview" class="upload-placeholder">
                                            <div class="icon">📷</div>
                                            <p>点击上传或拖拽图片到此处</p>
                                            <span class="hint">支持JPG、PNG格式，大小不超过5MB</span>
                                        </div>
                                        <div v-else class="image-preview">
                                            <img :src="form.imagePreview" :alt="form.title">
                                            <button type="button" class="remove-image" @click.stop="removeImage">×</button>
                                        </div>
                                    </div>
                                    <div v-if="uploading" class="uploading-tip">图片上传中...</div>
                                </div>
                            </div>

                            <div class="form-group" v-if="pets.length > 0">
                                <label for="pet_id">关联宠物（可选）</label>
                                <select id="pet_id" v-model="form.pet_id" @change="handlePetChange">
                                    <option :value="null">-- 不关联宠物 --</option>
                                    <option v-for="pet in pets" :key="pet.id" :value="pet.id">
                                        {{ pet.pet_name }} ({{ getTypeName(pet.pet_type) }})
                                    </option>
                                </select>
                                <p class="form-hint">如果您领养的宠物已在系统中，可以选择关联，系统会自动填充相关信息</p>
                            </div>

                            <div class="form-group">
                                <label for="tags">故事标签（可多选）</label>
                                <div class="tags-input">
                                    <div v-for="tag in availableTags" :key="tag" class="tag-checkbox">
                                        <input
                                            :id="'tag-' + tag"
                                            :value="tag"
                                            type="checkbox"
                                            v-model="form.tags"
                                        >
                                        <label :for="'tag-' + tag">{{ tag }}</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 协议 -->
                        <div class="form-section">
                            <div class="form-group checkbox-group">
                                <input
                                    id="agreement"
                                    v-model="form.agreement"
                                    type="checkbox"
                                    required
                                >
                                <label for="agreement">
                                    我同意将此故事发布在网站上，并允许其他用户查看和分享
                                    <span class="required">*</span>
                                </label>
                            </div>

                            <div class="form-group checkbox-group">
                                <input
                                    id="privacy"
                                    v-model="form.privacy"
                                    type="checkbox"
                                    required
                                >
                                <label for="privacy">
                                    我已阅读并同意
                                    <a href="#" target="_blank">隐私政策</a>
                                    和
                                    <a href="#" target="_blank">用户协议</a>
                                    <span class="required">*</span>
                                </label>
                            </div>
                        </div>

                        <!-- 按钮 -->
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary" :disabled="!isFormValid || submitting">
                                {{ submitting ? '提交中...' : '提交故事' }}
                            </button>
                            <button type="reset" class="btn btn-secondary" @click="resetForm" :disabled="submitting">
                                重置
                            </button>
                            <router-link to="/" class="btn btn-secondary">
                                返回首页
                            </router-link>
                        </div>
                    </form>
                </div>

                <!-- 成功提示 -->
                <div v-if="showSuccess" class="success-message">
                    <div class="success-content">
                        <div class="success-icon">✓</div>
                        <h3>感谢您的分享！</h3>
                        <p>您的故事已成功提交，我们将在审核后尽快发布。</p>
                        <router-link to="/" class="btn btn-primary">返回首页</router-link>
                    </div>
                </div>
            </div>
        </section>

        <footer-layout></footer-layout>
    </div>
</template>

<script>
import { createStory, uploadImage, getCurrentUser, getPetList } from '@/utils/api'

export default {
    name: 'StoriesSubmit',
    data() {
        return {
            submitting: false,
            uploading: false,
            uploadedImageUrl: null,
            userInfo: null,
            pets: [],
            form: {
                title: '',
                name: '',
                date: '',
                email: '',
                animalName: '',
                animalType: '',
                animalDesc: '',
                summary: '',
                story: '',
                imagePreview: null,
                imageFile: null,
                imageUrl: null,
                tags: [],
                pet_id: null,
                agreement: false,
                privacy: false
            },
            availableTags: ['温暖', '勇敢', '治愈', '奇迹', '坚持', '陪伴', '重生'],
            showSuccess: false,
            API_BASE_URL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8889'
        }
    },
    mounted() {
        this.loadUserInfo()
        this.loadPets()
    },
    computed: {
        isFormValid() {
            return (
                this.form.title.trim() &&
                this.form.name.trim() &&
                this.form.email.trim() &&
                this.form.summary.trim() &&
                this.form.story.length >= 100 &&
                this.form.imagePreview &&
                this.form.agreement &&
                this.form.privacy
            )
        },
        selectedPet() {
            if (!this.form.pet_id) return null
            return this.pets.find(p => p.id === this.form.pet_id)
        }
    },
    methods: {
        async loadUserInfo() {
            try {
                const response = await getCurrentUser()
                if (response.data && response.data.code === 200 && response.data.data) {
                    this.userInfo = response.data.data
                    // 自动填充用户信息
                    if (this.userInfo.real_name) {
                        this.form.name = this.userInfo.real_name
                    } else if (this.userInfo.username) {
                        this.form.name = this.userInfo.username
                    }
                    if (this.userInfo.email) {
                        this.form.email = this.userInfo.email
                    }
                }
            } catch (error) {
                console.error('获取用户信息失败:', error)
            }
        },
        async loadPets() {
            try {
                // 加载用户已领养的宠物（状态为adopted）
                const response = await getPetList({ status: 'adopted', page: 1, size: 50 })
                if (response.data && response.data.code === 200 && response.data.data) {
                    this.pets = response.data.data.list || []
                }
            } catch (error) {
                console.error('加载宠物列表失败:', error)
            }
        },
        handlePetChange() {
            if (this.selectedPet) {
                // 自动填充宠物信息
                if (!this.form.animalName) {
                    this.form.animalName = this.selectedPet.pet_name
                }
                if (!this.form.animalType) {
                    this.form.animalType = this.selectedPet.pet_type
                }
                if (!this.form.animalDesc && this.selectedPet.description) {
                    this.form.animalDesc = this.selectedPet.description
                }
                // 如果有领养日期信息，可以自动填充（但adoption_applications表中才有）
            } else {
                // 清空宠物相关信息（保留用户手动输入的内容）
            }
        },
        getTodayDate() {
            const today = new Date()
            const year = today.getFullYear()
            const month = String(today.getMonth() + 1).padStart(2, '0')
            const day = String(today.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        },
        handleImageUpload(event) {
            const file = event.target.files[0]
            if (file) {
                // 检查文件类型
                if (!file.type.startsWith('image/')) {
                    this.$message.error('请上传图片文件')
                    return
                }
                // 检查文件大小
                if (file.size > 5 * 1024 * 1024) {
                    this.$message.error('图片大小不能超过5MB')
                    return
                }

                // 保存文件引用
                this.form.imageFile = file

                // 创建预览
                const reader = new FileReader()
                reader.onload = (e) => {
                    this.form.imagePreview = e.target.result
                }
                reader.readAsDataURL(file)
            }
        },
        removeImage() {
            this.form.imagePreview = null
            this.form.imageFile = null
            this.form.imageUrl = null
            if (this.$refs.imageInput) {
                this.$refs.imageInput.value = ''
            }
        },
        resetForm() {
            this.form = {
                title: '',
                name: this.userInfo ? (this.userInfo.real_name || this.userInfo.username || '') : '',
                date: '',
                email: this.userInfo ? (this.userInfo.email || '') : '',
                animalName: '',
                animalType: '',
                animalDesc: '',
                summary: '',
                story: '',
                imagePreview: null,
                imageFile: null,
                imageUrl: null,
                tags: [],
                pet_id: null,
                agreement: false,
                privacy: false
            }
            this.uploadedImageUrl = null
            this.showSuccess = false
            if (this.$refs.imageInput) {
                this.$refs.imageInput.value = ''
            }
        },
        async submitStory() {
            if (!this.isFormValid) {
                this.$message.warning('请填写所有必填项')
                return
            }

            // 验证故事内容长度
            if (this.form.story.length < 100) {
                this.$message.warning('详细故事内容至少需要100字')
                return
            }

            this.submitting = true

            try {
                // 1. 先上传图片
                let imageUrl = null
                if (this.form.imageFile) {
                    this.uploading = true
                    try {
                        const uploadResponse = await uploadImage(this.form.imageFile)
                        if (uploadResponse.data && uploadResponse.data.code === 200) {
                            imageUrl = uploadResponse.data.data.url
                            // 如果是相对路径，转换为完整URL
                            if (imageUrl && !imageUrl.startsWith('http')) {
                                imageUrl = `${this.API_BASE_URL.replace('/api', '')}${imageUrl}`
                            }
                            this.form.imageUrl = imageUrl
                        } else {
                            throw new Error(uploadResponse.data?.message || '图片上传失败')
                        }
                    } catch (uploadError) {
                        console.error('图片上传失败:', uploadError)
                        this.$message.error(uploadError.data?.message || uploadError.message || '图片上传失败，请重试')
                        return
                    } finally {
                        this.uploading = false
                    }
                } else if (this.form.imageUrl) {
                    imageUrl = this.form.imageUrl
                } else {
                    this.$message.warning('请上传故事封面图片')
                    return
                }

                // 2. 构建故事内容（更简洁的格式）
                let storyContent = this.form.story
                
                // 如果有动物信息，添加到内容开头
                const hasAnimalInfo = this.form.animalName || this.form.animalType || this.form.animalDesc
                if (hasAnimalInfo || this.form.date) {
                    let animalInfo = '\n\n【动物信息】\n'
                    if (this.form.animalName) {
                        animalInfo += `动物名字：${this.form.animalName}\n`
                    }
                    if (this.form.animalType) {
                        animalInfo += `动物类型：${this.getAnimalTypeName(this.form.animalType)}\n`
                    }
                    if (this.form.date) {
                        animalInfo += `领养日期：${this.formatDate(this.form.date)}\n`
                    }
                    if (this.form.animalDesc) {
                        animalInfo += `特征描述：${this.form.animalDesc}\n`
                    }
                    storyContent = animalInfo + '\n【故事内容】\n' + storyContent
                }

                // 如果有故事概述，添加到开头
                if (this.form.summary) {
                    storyContent = `【故事概述】\n${this.form.summary}\n\n` + storyContent
                }

                // 3. 提交故事
                const storyData = {
                    title: this.form.title.trim(),
                    author: this.form.name.trim(),
                    author_contact: this.form.email.trim(),
                    content: storyContent.trim(),
                    image_url: imageUrl,
                    tags: this.form.tags.length > 0 ? this.form.tags.join(',') : null,
                    pet_id: this.form.pet_id || null,
                    status: 'draft' // 提交后需要审核，状态为草稿
                }

                const response = await createStory(storyData)
                
                if (response.data && response.data.code === 200) {
                    this.$message.success('故事提交成功！我们将在审核后尽快发布。')
                    this.showSuccess = true
                    // 3秒后自动跳转
                    setTimeout(() => {
                        this.$router.push('/knowledge/care')
                    }, 3000)
                } else {
                    throw new Error(response.data?.message || '提交失败')
                }
            } catch (error) {
                console.error('提交故事失败:', error)
                this.$message.error(error.data?.message || error.message || '提交失败，请重试')
            } finally {
                this.submitting = false
            }
        },
        getAnimalTypeName(type) {
            const typeMap = {
                'dog': '狗狗',
                'cat': '猫咪',
                'rabbit': '兔子',
                'bird': '鸟类',
                'other': '其他'
            }
            return typeMap[type] || type
        },
        getTypeName(type) {
            const typeMap = {
                'dog': '狗狗',
                'cat': '猫咪',
                'other': '其他'
            }
            return typeMap[type] || type
        },
        formatDate(dateString) {
            if (!dateString) return ''
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return dateString
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}年${month}月${day}日`
        }
    }
}
</script>

<style lang="less" scoped>
.stories-submit-page {
    width: 100%;
    background-color: #f8f9ff;
    min-height: 100vh;
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

// 提交页面
.submit-wrapper {
    padding: 60px 0;

    .submit-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 20px;

        .page-header {
            text-align: center;
            margin-bottom: 50px;

            h1 {
                font-size: 2.5rem;
                color: #333;
                margin-bottom: 15px;
                font-weight: bold;
            }

            p {
                font-size: 1.1rem;
                color: #666;
            }
        }

        .form-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);

            form {
                .form-section {
                    margin-bottom: 40px;

                    &:last-of-type {
                        margin-bottom: 0;
                    }

                    h3 {
                        font-size: 1.3rem;
                        color: #333;
                        margin-bottom: 25px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #f0f0f0;
                        font-weight: bold;
                    }

                    .form-group {
                        margin-bottom: 20px;

                        label {
                            display: block;
                            margin-bottom: 8px;
                            font-size: 0.95rem;
                            font-weight: 600;
                            color: #333;

                            .required {
                                color: #d52b1e;
                            }
                        }

                        input[type='text'],
                        input[type='email'],
                        input[type='date'],
                        select,
                        textarea {
                            width: 100%;
                            padding: 12px;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            font-size: 0.95rem;
                            font-family: inherit;
                            transition: border-color 0.3s ease;

                            &:focus {
                                outline: none;
                                border-color: #d52b1e;
                                box-shadow: 0 0 0 3px rgba(213, 43, 30, 0.1);
                            }
                        }

                        select {
                            cursor: pointer;
                        }

                        textarea {
                            resize: vertical;
                            line-height: 1.5;
                        }

                        .char-count {
                            display: block;
                            margin-top: 5px;
                            font-size: 0.85rem;
                            color: #999;
                        }

                        .form-hint {
                            margin-top: 5px;
                            font-size: 0.85rem;
                            color: #999;
                            font-style: italic;
                        }

                        &.checkbox-group {
                            display: flex;
                            align-items: flex-start;
                            margin-bottom: 15px;

                            input[type='checkbox'] {
                                margin-right: 10px;
                                margin-top: 3px;
                                cursor: pointer;
                                width: 18px;
                                height: 18px;
                            }

                            label {
                                margin: 0;
                                font-weight: normal;
                                color: #666;

                                a {
                                    color: #d52b1e;
                                    text-decoration: none;

                                    &:hover {
                                        text-decoration: underline;
                                    }
                                }
                            }
                        }
                    }

                    .form-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;

                        .form-group {
                            margin-bottom: 0;
                        }
                    }

                    .image-upload {
                        .image-input {
                            display: none;
                        }

                        .upload-area {
                            border: 2px dashed #ddd;
                            border-radius: 8px;
                            padding: 30px;
                            text-align: center;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            min-height: 200px;
                            display: flex;
                            align-items: center;
                            justify-content: center;

                            &:hover {
                                border-color: #d52b1e;
                                background-color: #fafafa;
                            }

                            .upload-placeholder {
                                .icon {
                                    font-size: 2.5rem;
                                    margin-bottom: 10px;
                                }

                                p {
                                    font-size: 1rem;
                                    color: #333;
                                    margin-bottom: 5px;
                                    font-weight: 500;
                                }

                                .hint {
                                    font-size: 0.85rem;
                                    color: #999;
                                }
                            }

                            .image-preview {
                                width: 100%;
                                position: relative;

                                img {
                                    max-width: 100%;
                                    max-height: 300px;
                                    border-radius: 6px;
                                    display: block;
                                }

                                .remove-image {
                                    position: absolute;
                                    top: 10px;
                                    right: 10px;
                                    width: 30px;
                                    height: 30px;
                                    border-radius: 50%;
                                    background-color: rgba(0, 0, 0, 0.6);
                                    color: white;
                                    border: none;
                                    font-size: 20px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    transition: all 0.3s ease;

                                    &:hover {
                                        background-color: rgba(213, 43, 30, 0.8);
                                        transform: scale(1.1);
                                    }
                                }
                            }

                            .uploading-tip {
                                margin-top: 10px;
                                color: #d52b1e;
                                font-size: 0.9rem;
                                text-align: center;
                            }
                        }
                    }

                    .tags-input {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;

                        .tag-checkbox {
                            display: flex;
                            align-items: center;

                            input[type='checkbox'] {
                                margin-right: 8px;
                                cursor: pointer;
                                width: 18px;
                                height: 18px;
                            }

                            label {
                                margin: 0;
                                cursor: pointer;
                                font-weight: normal;
                                color: #666;
                            }
                        }
                    }
                }
            }

            .form-actions {
                display: flex;
                gap: 15px;
                margin-top: 40px;
                padding-top: 30px;
                border-top: 1px solid #f0f0f0;

                .btn {
                    padding: 12px 30px;
                    border: none;
                    border-radius: 6px;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    display: inline-block;
                    text-align: center;

                    &.btn-primary {
                        background-color: #d52b1e;
                        color: white;
                        flex: 1;

                        &:hover:not(:disabled) {
                            background-color: #b52318;
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(213, 43, 30, 0.3);
                        }

                        &:disabled {
                            background-color: #ccc;
                            cursor: not-allowed;
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

        .success-message {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;

            .success-content {
                background: white;
                padding: 50px;
                border-radius: 12px;
                text-align: center;
                max-width: 500px;
                animation: slideUp 0.3s ease;

                .success-icon {
                    font-size: 3rem;
                    color: #d52b1e;
                    margin-bottom: 20px;
                }

                h3 {
                    font-size: 1.5rem;
                    color: #333;
                    margin-bottom: 15px;
                }

                p {
                    font-size: 1rem;
                    color: #666;
                    margin-bottom: 30px;
                }

                .btn {
                    padding: 12px 40px;
                    background-color: #d52b1e;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;

                    &:hover {
                        background-color: #b52318;
                    }
                }
            }
        }
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

// 响应式
@media (max-width: 768px) {
    .page-header {
        h1 {
            font-size: 1.8rem;
        }

        p {
            font-size: 1rem;
        }
    }

    .form-section .form-row {
        grid-template-columns: 1fr;
    }

    .tags-input {
        grid-template-columns: repeat(2, 1fr) !important;
    }

    .form-actions {
        flex-direction: column;

        .btn {
            width: 100%;
        }
    }
}
</style>

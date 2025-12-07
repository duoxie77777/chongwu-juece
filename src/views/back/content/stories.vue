<template>
    <div class="stories-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>📖 领养故事管理</h1>
                <p>管理用户分享的温暖领养故事</p>
            </div>
            <div class="header-actions">
                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">发布故事</el-button>
            </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
            <div class="filter-row">
                <div class="filter-inputs">
                    <div class="input-wrapper">
                        <el-input
                            v-model="searchQuery"
                            placeholder="搜索故事标题或作者..."
                            clearable
                            prefix-icon="el-icon-search"
                            @keyup.enter.native="handleSearch"
                            class="search-input"
                        ></el-input>
                    </div>
                    <div class="input-wrapper">
                        <el-select 
                            v-model="filterStatus" 
                            placeholder="筛选状态" 
                            clearable
                            @change="handleSearch"
                            class="status-select"
                        >
                        <el-option label="全部状态" value="all">
                            <span class="status-option">
                                <span class="status-dot default"></span>全部状态
                            </span>
                        </el-option>
                        <el-option label="待审核" value="draft">
                            <span class="status-option">
                                <span class="status-dot warning"></span>待审核
                            </span>
                        </el-option>
                        <el-option label="已发布" value="published">
                            <span class="status-option">
                                <span class="status-dot success"></span>已发布
                            </span>
                        </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="filter-actions">
                    <el-button type="primary" icon="el-icon-search" @click="handleSearch" class="btn-search">
                        搜索
                    </el-button>
                    <el-button icon="el-icon-refresh-left" @click="handleReset" class="btn-reset">
                        重置
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-row">
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card">
                    <div class="stat-number">{{ stats.total }}</div>
                    <div class="stat-label">总故事</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card success">
                    <div class="stat-number">{{ stats.published }}</div>
                    <div class="stat-label">已发布</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card info">
                    <div class="stat-number">{{ stats.draft }}</div>
                    <div class="stat-label">待审核</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card warning">
                    <div class="stat-number">{{ stats.totalViews }}</div>
                    <div class="stat-label">总浏览</div>
                </div>
            </el-col>
        </el-row>

        <!-- 故事表格 -->
        <div class="table-section">
            <el-table
                :data="stories"
                stripe
                style="width: 100%"
                v-loading="loading"
                :default-sort="{ prop: 'createdAt', order: 'descending' }"
            >
                <el-table-column prop="id" label="ID" width="60"></el-table-column>
                <el-table-column prop="title" label="故事标题" min-width="200">
                    <template slot-scope="scope">
                        <div class="story-title">
                            <img :src="getImageUrl(scope.row.cover)" :alt="scope.row.title" class="cover-thumb" />
                            <div>
                                <p class="title-text">{{ scope.row.title }}</p>
                                <p class="author-text">作者：{{ scope.row.author }}</p>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="审核状态" width="120">
                    <template slot-scope="scope">
                        <el-tag :type="getStatusTagType(scope.row.status)">
                            {{ getStatusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="views" label="浏览次数" width="100" sortable></el-table-column>
                <el-table-column prop="likes" label="点赞数" width="80" sortable></el-table-column>
                <el-table-column prop="comments" label="评论数" width="80" sortable></el-table-column>
                <el-table-column prop="createdAt" label="创建时间" min-width="140" sortable>
                    <template slot-scope="scope">
                        {{ formatDate(scope.row.createdAt) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="500" fixed="right">
                    <template slot-scope="scope">
                        <div class="action-buttons">
                            <el-button
                                size="small"
                                type="primary"
                                plain
                                icon="el-icon-view"
                                @click="handleView(scope.row)"
                            >
                                查看
                            </el-button>
                            <el-button
                                size="small"
                                type="info"
                                plain
                                icon="el-icon-edit"
                                @click="handleEdit(scope.row)"
                            >
                                编辑
                            </el-button>
                            <el-button
                                v-if="scope.row.status === 'draft'"
                                size="small"
                                type="success"
                                plain
                                icon="el-icon-check"
                                @click="handleApprove(scope.row)"
                            >
                                审核通过
                            </el-button>
                            <el-button
                                v-if="scope.row.status === 'draft'"
                                size="small"
                                type="warning"
                                plain
                                icon="el-icon-close"
                                @click="handleReject(scope.row)"
                            >
                                审核拒绝
                            </el-button>
                            <el-button
                                v-if="scope.row.status === 'published'"
                                size="small"
                                type="info"
                                plain
                                icon="el-icon-remove"
                                @click="handleUnpublish(scope.row)"
                            >
                                下架
                            </el-button>
                            <el-button
                                size="small"
                                type="danger"
                                plain
                                icon="el-icon-delete"
                                @click="handleDelete(scope.row)"
                            >
                                删除
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-wrapper">
                <el-pagination
                    :current-page.sync="currentPage"
                    :page-sizes="[10, 20, 50, 100]"
                    :page-size.sync="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                    @size-change="handlePageSizeChange"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>

        <!-- 查看故事对话框 -->
        <el-dialog
            title="故事详情"
            :visible.sync="viewDialogVisible"
            width="800px"
            :close-on-click-modal="false"
        >
            <div v-if="currentStory" class="story-detail">
                <div class="story-header">
                    <img :src="getImageUrl(currentStory.cover)" :alt="currentStory.title" class="story-cover" />
                </div>
                <h2 class="story-title-text">{{ currentStory.title }}</h2>
                <div class="story-meta">
                    <span><strong>作者：</strong>{{ currentStory.author }}</span>
                    <span><strong>创建时间：</strong>{{ formatDate(currentStory.create_time) }}</span>
                    <span><strong>浏览：</strong>{{ currentStory.views || 0 }}</span>
                    <span><strong>点赞：</strong>{{ currentStory.likes || 0 }}</span>
                </div>
                <el-divider></el-divider>
                <div class="story-content">
                    {{ currentStory.content }}
                </div>
                <el-divider></el-divider>
                <div class="story-footer">
                    <span><strong>状态：</strong>
                        <el-tag :type="getStatusTagType(currentStory.status)">
                            {{ getStatusText(currentStory.status) }}
                        </el-tag>
                    </span>
                    <span v-if="currentStory.tags"><strong>标签：</strong>{{ currentStory.tags }}</span>
                </div>
            </div>
        </el-dialog>

        <!-- 编辑故事对话框 -->
        <el-dialog
            :title="isEditing ? '编辑故事' : '发布新故事'"
            :visible.sync="editDialogVisible"
            width="800px"
            :close-on-click-modal="false"
        >
            <el-form ref="editForm" :model="editFormData" :rules="formRules" label-width="100px">
                <el-form-item label="故事标题" prop="title">
                    <el-input v-model="editFormData.title" placeholder="请输入故事标题"></el-input>
                </el-form-item>
                <el-form-item label="作者" prop="author">
                    <el-input v-model="editFormData.author" placeholder="请输入作者名称"></el-input>
                </el-form-item>
                <el-form-item label="联系方式">
                    <el-input v-model="editFormData.author_contact" placeholder="请输入作者联系方式（选填）"></el-input>
                </el-form-item>
                <el-form-item label="封面图片">
                    <div class="image-upload-area">
                        <el-upload
                            class="cover-uploader"
                            action="#"
                            :show-file-list="false"
                            :http-request="handleImageUpload"
                            :before-upload="beforeImageUpload"
                            accept="image/*"
                        >
                            <div v-if="editFormData.image_url" class="cover-preview">
                                <img :src="getImageUrl(editFormData.image_url)" class="cover-image" />
                                <div class="cover-actions">
                                    <i class="el-icon-edit"></i>
                                    <span>更换图片</span>
                                </div>
                            </div>
                            <div v-else class="upload-placeholder" v-loading="uploadLoading">
                                <i class="el-icon-plus"></i>
                                <span>上传封面</span>
                            </div>
                        </el-upload>
                        <el-button 
                            v-if="editFormData.image_url" 
                            type="danger" 
                            size="mini" 
                            @click="handleRemoveImage"
                            style="margin-left: 10px;"
                        >
                            移除图片
                        </el-button>
                    </div>
                </el-form-item>
                <el-form-item label="故事内容" prop="content">
                    <el-input
                        v-model="editFormData.content"
                        type="textarea"
                        :rows="8"
                        placeholder="请输入故事内容"
                        maxlength="5000"
                        show-word-limit
                    ></el-input>
                </el-form-item>
                <el-form-item label="标签">
                    <el-input v-model="editFormData.tags" placeholder="请输入标签，多个用逗号分隔"></el-input>
                </el-form-item>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="故事状态" prop="status">
                            <el-select v-model="editFormData.status" style="width: 100%;">
                                <el-option label="草稿" value="draft"></el-option>
                                <el-option label="已发布" value="published"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="精选推荐">
                            <el-switch 
                                v-model="editFormData.is_featured" 
                                :active-value="1" 
                                :inactive-value="0"
                                active-text="是"
                                inactive-text="否"
                            ></el-switch>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitEdit" :loading="submitLoading">
                    {{ isEditing ? '保存修改' : '创建故事' }}
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { 
    getStoryList, 
    getStoryDetail, 
    createStory, 
    updateStory, 
    deleteStory, 
    publishStory, 
    getStoryStats,
    uploadImage,
    API_BASE_URL
} from '@/utils/api'
import { formatDateTime } from '@/utils/dateFormat'

export default {
    name: 'StoriesManagement',
    data() {
        return {
            searchQuery: '',
            filterStatus: 'all', // 默认显示所有状态
            currentPage: 1,
            pageSize: 10,
            total: 0,
            stories: [],
            loading: false,
            viewDialogVisible: false,
            editDialogVisible: false,
            currentStory: null,
            editFormData: {},
            isEditing: false,
            submitLoading: false,
            uploadLoading: false,
            stats: {
                total: 0,
                published: 0,
                draft: 0,
                totalViews: 0
            },
            formRules: {
                title: [
                    { required: true, message: '请输入故事标题', trigger: 'blur' },
                    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符之间', trigger: 'blur' }
                ],
                author: [
                    { required: true, message: '请输入作者名称', trigger: 'blur' }
                ],
                content: [
                    { required: true, message: '请输入故事内容', trigger: 'blur' },
                    { min: 20, message: '故事内容至少 20 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    computed: {
        // 获取图片完整URL
        getImageUrl() {
            return (url) => {
                if (!url) return 'https://via.placeholder.com/400x300?text=暂无图片'
                if (url.startsWith('http')) return url
                return `${API_BASE_URL.replace('/api', '')}${url}`
            }
        }
    },
    methods: {
        // 搜索
        handleSearch() {
            this.currentPage = 1
            this.loadStories()
        },
        
        // 重置搜索
        handleReset() {
            this.searchQuery = ''
            this.filterStatus = ''
            this.currentPage = 1
            this.loadStories()
        },
        
        // 加载故事列表
        async loadStories() {
            this.loading = true
            try {
                const params = {
                    page: this.currentPage,
                    size: this.pageSize,
                    status: 'all' // 后台管理需要查看所有状态的故事
                }
                
                if (this.searchQuery) {
                    params.keyword = this.searchQuery
                }
                
                // 如果选择了特定状态，覆盖'all'
                if (this.filterStatus) {
                    params.status = this.filterStatus
                }
                
                const res = await getStoryList(params)
                if (res.data && res.data.code === 200) {
                    const data = res.data.data || {}
                    this.stories = (data.list || []).map(item => ({
                        id: item.id,
                        title: item.title,
                        author: item.author,
                        author_contact: item.author_contact,
                        cover: item.image_url,
                        content: item.content,
                        status: item.status === 1 ? 'published' : 'draft', // 转换状态格式
                        views: item.views || 0,
                        likes: item.likes || 0,
                        comments: item.comment_count || 0,
                        tags: item.tags ? (typeof item.tags === 'string' ? item.tags.split(',').map(t => t.trim()) : item.tags) : [],
                        is_featured: item.is_featured === 1,
                        pet_id: item.pet_id,
                        pet_name: item.pet_name,
                        pet_type: item.pet_type,
                        createdAt: item.create_time,
                        publishDate: item.publish_date
                    }))
                    this.total = data.total || 0
                } else {
                    this.$message.error(res.data?.message || '获取故事列表失败')
                    this.stories = []
                    this.total = 0
                }
            } catch (error) {
                console.error('加载故事列表失败:', error)
                this.$message.error(error.data?.message || error.message || '加载故事列表失败')
                this.stories = []
                this.total = 0
            } finally {
                this.loading = false
            }
        },
        
        // 加载统计数据
        async loadStats() {
            try {
                const res = await getStoryStats()
                if (res.data && res.data.code === 200) {
                    this.stats = {
                        total: res.data.data.total || 0,
                        published: res.data.data.published || 0,
                        draft: res.data.data.draft || 0,
                        totalViews: res.data.data.totalViews || 0
                    }
                }
            } catch (error) {
                console.error('加载统计数据失败:', error)
                this.stats = {
                    total: 0,
                    published: 0,
                    draft: 0,
                    totalViews: 0
                }
            }
        },
        
        // 新增故事
        handleAdd() {
            this.isEditing = false
            this.editFormData = {
                title: '',
                author: '',
                author_contact: '',
                content: '',
                image_url: '',
                tags: '',
                status: 'draft',
                is_featured: 0
            }
            this.editDialogVisible = true
        },
        
        // 查看故事详情
        async handleView(row) {
            try {
                const res = await getStoryDetail(row.id)
                if (res.data.code === 200) {
                    const story = res.data.data
                    this.currentStory = {
                        ...story,
                        cover: story.image_url
                    }
                    this.viewDialogVisible = true
                }
            } catch (error) {
                console.error('获取故事详情失败:', error)
                this.$message.error('获取故事详情失败')
            }
        },
        
        // 编辑故事
        handleEdit(row) {
            this.isEditing = true
            this.editFormData = {
                id: row.id,
                title: row.title,
                author: row.author,
                author_contact: row.author_contact || '',
                content: row.content,
                image_url: row.cover || '',
                tags: row.tags || '',
                status: row.status,
                is_featured: row.is_featured || 0
            }
            this.editDialogVisible = true
        },
        
        // 审核通过（发布故事）
        async handleApprove(row) {
            try {
                await this.$confirm('确定审核通过这个故事吗？审核通过后将立即发布。', '审核通过', {
                    confirmButtonText: '确定通过',
                    cancelButtonText: '取消',
                    type: 'success'
                })
                
                const res = await publishStory(row.id)
                if (res.data && res.data.code === 200) {
                    this.$message.success('故事审核通过，已发布')
                    this.loadStories()
                    this.loadStats()
                } else {
                    this.$message.error(res.data?.message || '审核失败')
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('审核失败:', error)
                    this.$message.error(error.data?.message || error.message || '审核失败')
                }
            }
        },
        
        // 审核拒绝
        async handleReject(row) {
            try {
                await this.$prompt('请输入拒绝原因（可选）', '审核拒绝', {
                    confirmButtonText: '确定拒绝',
                    cancelButtonText: '取消',
                    inputType: 'textarea',
                    inputPlaceholder: '请输入拒绝原因...',
                    inputValidator: () => {
                        // 可选，不验证
                        return true
                    }
                }).then(async ({ value: rejectReason }) => {
                    // 将故事状态改为已拒绝（这里我们使用删除或者标记，根据业务需求）
                    // 由于数据库没有rejected状态，我们可以删除或者保持草稿状态
                    // 或者我们可以添加一个备注字段
                    try {
                        // 暂时使用删除，或者可以添加拒绝原因到内容中
                        const res = await deleteStory(row.id)
                        if (res.data && res.data.code === 200) {
                            const message = rejectReason 
                                ? `故事已拒绝并删除。拒绝原因：${rejectReason}` 
                                : '故事已拒绝并删除'
                            this.$message.success(message)
                            this.loadStories()
                            this.loadStats()
                        } else {
                            this.$message.error(res.data?.message || '操作失败')
                        }
                    } catch (error) {
                        console.error('拒绝故事失败:', error)
                        this.$message.error('拒绝故事失败')
                    }
                }).catch(() => {
                    // 用户取消
                })
            } catch (error) {
                // 用户取消
            }
        },
        
        // 下架故事
        async handleUnpublish(row) {
            try {
                await this.$confirm('确定下架这个故事吗？下架后用户将无法查看。', '下架故事', {
                    confirmButtonText: '确定下架',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                
                // 将状态改为草稿（下架）
                const res = await updateStory(row.id, { status: 'draft' })
                if (res.data && res.data.code === 200) {
                    this.$message.success('故事已下架')
                    this.loadStories()
                    this.loadStats()
                } else {
                    this.$message.error(res.data?.message || '下架失败')
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('下架失败:', error)
                    this.$message.error(error.data?.message || error.message || '下架失败')
                }
            }
        },
        
        // 图片上传前校验
        beforeImageUpload(file) {
            const isImage = file.type.startsWith('image/')
            const isLt5M = file.size / 1024 / 1024 < 5
            
            if (!isImage) {
                this.$message.error('只能上传图片文件!')
                return false
            }
            if (!isLt5M) {
                this.$message.error('图片大小不能超过 5MB!')
                return false
            }
            return true
        },
        
        // 自定义图片上传
        async handleImageUpload(options) {
            this.uploadLoading = true
            try {
                const res = await uploadImage(options.file)
                if (res.data.code === 200) {
                    this.editFormData.image_url = res.data.data.url
                    this.$message.success('图片上传成功')
                } else {
                    this.$message.error(res.data.message || '图片上传失败')
                }
            } catch (error) {
                console.error('图片上传失败:', error)
                this.$message.error('图片上传失败')
            } finally {
                this.uploadLoading = false
            }
        },
        
        // 移除图片
        handleRemoveImage() {
            this.editFormData.image_url = ''
        },
        
        // 提交编辑
        async submitEdit() {
            try {
                await this.$refs.editForm.validate()
            } catch {
                return
            }
            
            this.submitLoading = true
            try {
                const data = {
                    title: this.editFormData.title,
                    author: this.editFormData.author,
                    author_contact: this.editFormData.author_contact,
                    content: this.editFormData.content,
                    image_url: this.editFormData.image_url,
                    tags: this.editFormData.tags,
                    status: this.editFormData.status,
                    is_featured: this.editFormData.is_featured
                }
                
                let res
                if (this.isEditing) {
                    res = await updateStory(this.editFormData.id, data)
                } else {
                    res = await createStory(data)
                }
                
                if (res.data.code === 200) {
                    this.$message.success(this.isEditing ? '故事更新成功' : '故事创建成功')
                    this.editDialogVisible = false
                    this.loadStories()
                    this.loadStats()
                } else {
                    this.$message.error(res.data.message || '操作失败')
                }
            } catch (error) {
                console.error('保存故事失败:', error)
                this.$message.error('保存故事失败')
            } finally {
                this.submitLoading = false
            }
        },
        
        // 删除故事
        async handleDelete(row) {
            try {
                await this.$confirm(`确定删除故事 "${row.title}" 吗？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                
                const res = await deleteStory(row.id)
                if (res.data.code === 200) {
                    this.$message.success('故事已删除')
                    this.loadStories()
                    this.loadStats()
                } else {
                    this.$message.error(res.data.message || '删除失败')
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('删除故事失败:', error)
                    this.$message.error('删除故事失败')
                }
            }
        },
        
        // 分页变化
        handlePageChange(page) {
            this.currentPage = page
            this.loadStories()
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },
        
        // 每页数量变化
        handlePageSizeChange(size) {
            this.pageSize = size
            this.currentPage = 1
            this.loadStories()
        },
        
        // 格式化日期
        formatDate(date) {
            return formatDateTime(date, 'datetime')
        },
        // 获取状态文本
        getStatusText(status) {
            const statusMap = {
                'published': '已发布',
                'draft': '待审核'
            }
            return statusMap[status] || '未知'
        },
        // 获取状态标签类型
        getStatusTagType(status) {
            const typeMap = {
                'published': 'success',
                'draft': 'warning'
            }
            return typeMap[status] || 'info'
        }
    },
    mounted() {
        this.loadStories()
        this.loadStats()
    }
}
</script>

<style lang="less" scoped>

.page-header {
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
        h1 {
            font-size: 24px;
            margin: 0 0 8px 0;
            color: #1f2937;
            font-weight: 600;
        }

        p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }
    }

    .header-actions {
        flex-shrink: 0;
    }
}

.filter-section {
    background: white;
    padding: 20px 24px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #eef2f7;

    .filter-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
    }

    .filter-inputs {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        flex-wrap: wrap;
    }

    .input-wrapper {
        flex: 1;
        min-width: 200px;
        max-width: 280px;
    }

    .search-input {
        ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 1px solid #e4e7ed;
            transition: all 0.3s ease;
            height: 40px;
            
            &:hover {
                border-color: #c0c4cc;
            }
            
            &:focus {
                border-color: #409eff;
                box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
            }
        }
    }

    .status-select {
        width: 100%;
        
        ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 1px solid #e4e7ed;
            transition: all 0.3s ease;
            height: 40px;
            
            &:hover {
                border-color: #c0c4cc;
            }
        }
    }

    .status-option {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        
        &.success { background: #67c23a; }
        &.info { background: #409eff; }
        &.warning { background: #e6a23c; }
        &.danger { background: #f56c6c; }
        &.default { background: #909399; }
    }

    .filter-actions {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
    }

    .btn-search {
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.35);
        }
    }

    .btn-reset {
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
        border: 1px solid #dcdfe6;
        color: #606266;
        transition: all 0.3s ease;
        
        &:hover {
            color: #409eff;
            border-color: #c6e2ff;
            background: #ecf5ff;
        }
    }
}

.stats-row {
    margin-bottom: 24px;
}

.stat-card {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    border-left: 4px solid #ff9800;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
    }

    &.success {
        border-left-color: #52c41a;
    }

    &.info {
        border-left-color: #1890ff;
    }

    &.warning {
        border-left-color: #faad14;
    }

    .stat-number {
        font-size: 32px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
    }

    .stat-label {
        font-size: 14px;
        color: #6b7280;
    }
}

.table-section {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.story-title {
    display: flex;
    align-items: center;
    gap: 12px;

    .cover-thumb {
        width: 50px;
        height: 50px;
        border-radius: 4px;
        object-fit: cover;
    }

    div {
        flex: 1;
        min-width: 0;

        .title-text {
            margin: 0;
            font-weight: 600;
            color: #1f2937;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .author-text {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: #6b7280;
        }
    }
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    
    .el-button {
        margin: 0;
        padding: 8px 15px;
        min-width: 70px;
    }
}

.image-upload-area {
    display: flex;
    align-items: flex-start;
}

.cover-uploader {
    .cover-preview {
        position: relative;
        width: 200px;
        height: 150px;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        
        .cover-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .cover-actions {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
            color: #fff;
            
            i {
                font-size: 24px;
                margin-bottom: 8px;
            }
        }
        
        &:hover .cover-actions {
            opacity: 1;
        }
    }
    
    .upload-placeholder {
        width: 200px;
        height: 150px;
        border: 2px dashed #d9d9d9;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        background: #fafafa;
        
        &:hover {
            border-color: #409eff;
            background: #ecf5ff;
        }
        
        i {
            font-size: 32px;
            color: #8c939d;
            margin-bottom: 8px;
        }
        
        span {
            color: #8c939d;
            font-size: 14px;
        }
    }
}

.story-detail {
    .story-header {
        text-align: center;
        margin-bottom: 20px;

        .story-cover {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            max-height: 300px;
        }
    }

    .story-title-text {
        font-size: 24px;
        color: #1f2937;
        margin: 0 0 12px 0;
        text-align: center;
    }

    .story-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        justify-content: center;
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 12px;

        span {
            strong {
                margin-right: 4px;
                color: #1f2937;
            }
        }
    }

    .story-content {
        line-height: 1.8;
        color: #4b5563;
        text-align: justify;
    }

    .story-footer {
        display: flex;
        justify-content: center;
        gap: 20px;
        font-size: 14px;

        strong {
            color: #1f2937;
            margin-right: 8px;
        }
    }
}

@media (max-width: 768px) {
    .stories-page {
        padding: 16px;
    }

    .page-header {
        padding: 16px;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .filter-section,
    .table-section {
        padding: 16px;
    }

    .table-section {
        overflow-x: auto;
    }
}
</style>

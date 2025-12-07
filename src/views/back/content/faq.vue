<template>
    <div class="faq-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>❓ 常见问题管理</h1>
                <p>管理平台的常见问题和答案</p>
            </div>
            <div class="header-actions">
                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加问题</el-button>
            </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
            <div class="filter-row">
                <div class="filter-inputs">
                    <div class="input-wrapper">
                        <el-input
                            v-model="searchForm.keyword"
                            placeholder="搜索问题或答案..."
                            clearable
                            prefix-icon="el-icon-search"
                            @keyup.enter="handleSearch"
                            class="search-input"
                        ></el-input>
                    </div>
                    <div class="input-wrapper">
                        <el-select
                            v-model="searchForm.category"
                            placeholder="选择分类"
                            clearable
                            @change="handleSearch"
                            class="status-select"
                        >
                            <el-option label="全部分类" value=""></el-option>
                            <el-option label="领养流程" value="adoption">
                                <span class="status-option">
                                    <span class="status-dot info"></span>领养流程
                                </span>
                            </el-option>
                            <el-option label="动物护理" value="care">
                                <span class="status-option">
                                    <span class="status-dot success"></span>动物护理
                                </span>
                            </el-option>
                            <el-option label="账户相关" value="account">
                                <span class="status-option">
                                    <span class="status-dot warning"></span>账户相关
                                </span>
                            </el-option>
                            <el-option label="其他" value="other">
                                <span class="status-option">
                                    <span class="status-dot default"></span>其他
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

        <!-- 统计信息 -->
        <div class="stats-summary">
            <div class="stat-item">
                <div class="stat-label">总问题</div>
                <div class="stat-value">{{ stats.total }}</div>
            </div>
            <div class="stat-item success">
                <div class="stat-label">领养流程</div>
                <div class="stat-value">{{ stats.adoption }}</div>
            </div>
            <div class="stat-item info">
                <div class="stat-label">动物护理</div>
                <div class="stat-value">{{ stats.care }}</div>
            </div>
            <div class="stat-item warning">
                <div class="stat-label">账户相关</div>
                <div class="stat-value">{{ stats.account }}</div>
            </div>
        </div>

        <!-- FAQ列表 -->
        <div class="faq-list">
            <div v-for="item in filteredFaqList" :key="item.id" class="faq-item">
                <div class="faq-header">
                    <div class="faq-title">
                        <span class="category-tag" :class="item.category">{{ getCategoryLabel(item.category) }}</span>
                        <h3>{{ item.question }}</h3>
                    </div>
                    <div class="faq-actions">
                        <el-button
                            size="small"
                            type="primary"
                            plain
                            icon="el-icon-edit"
                            @click="handleEdit(item)"
                        >
                            编辑
                        </el-button>
                        <el-button
                            size="small"
                            type="danger"
                            plain
                            icon="el-icon-delete"
                            @click="handleDelete(item)"
                        >
                            删除
                        </el-button>
                    </div>
                </div>
                <div class="faq-body">
                    <p>{{ item.answer }}</p>
                </div>
                <div class="faq-footer">
                    <span class="meta">浏览次数: {{ item.views }}</span>
                    <span class="meta">有用: {{ item.helpful }}</span>
                    <span class="meta">无用: {{ item.unhelpful }}</span>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredFaqList.length === 0" class="empty-state">
                <i class="el-icon-search"></i>
                <p>暂无相关问题，请尝试其他搜索条件</p>
            </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="filteredFaqList.length > 0">
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

        <!-- 添加/编辑FAQ对话框 -->
        <el-dialog
            :title="editFormData.id ? '编辑问题' : '添加新问题'"
            :visible.sync="editDialogVisible"
            width="800px"
            :close-on-click-modal="false"
        >
            <el-form ref="editForm" :model="editFormData" :rules="formRules" label-width="100px">
                <el-form-item label="问题分类" prop="category">
                    <el-select v-model="editFormData.category" placeholder="请选择分类">
                        <el-option label="领养流程" value="adoption"></el-option>
                        <el-option label="动物护理" value="care"></el-option>
                        <el-option label="账户相关" value="account"></el-option>
                        <el-option label="其他" value="other"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="问题内容" prop="question">
                    <el-input
                        v-model="editFormData.question"
                        placeholder="请输入问题内容"
                        maxlength="200"
                        show-word-limit
                    ></el-input>
                </el-form-item>
                <el-form-item label="答案内容" prop="answer">
                    <el-input
                        v-model="editFormData.answer"
                        type="textarea"
                        :rows="6"
                        placeholder="请输入详细答案"
                        maxlength="2000"
                        show-word-limit
                    ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitEdit" :loading="submitLoading">保存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getFaqList, getFaqStats, createFaq, updateFaq, deleteFaq } from '@/utils/api'

export default {
    name: 'FaqManagement',
    data() {
        return {
            searchForm: {
                keyword: '',
                category: ''
            },
            currentPage: 1,
            pageSize: 10,
            total: 0,
            faqList: [],
            loading: false,
            editDialogVisible: false,
            editFormData: {},
            submitLoading: false,
            stats: {
                total: 0,
                adoption: 0,
                care: 0,
                account: 0,
                other: 0
            },
            formRules: {
                category: [
                    { required: true, message: '请选择分类', trigger: 'change' }
                ],
                question: [
                    { required: true, message: '请输入问题内容', trigger: 'blur' },
                    { min: 5, max: 200, message: '问题长度在 5 到 200 个字符之间', trigger: 'blur' }
                ],
                answer: [
                    { required: true, message: '请输入答案内容', trigger: 'blur' },
                    { min: 10, max: 2000, message: '答案长度在 10 到 2000 个字符之间', trigger: 'blur' }
                ]
            }
        }
    },
    computed: {
        filteredFaqList() {
            return this.faqList
        }
    },
    methods: {
        handleSearch() {
            this.currentPage = 1
            this.loadFaqList()
        },
        handleReset() {
            this.searchForm = {
                keyword: '',
                category: ''
            }
            this.currentPage = 1
            this.loadFaqList()
        },
        async loadFaqList() {
            this.loading = true
            try {
                const params = {
                    page: this.currentPage,
                    size: this.pageSize
                }
                if (this.searchForm.keyword) {
                    params.keyword = this.searchForm.keyword
                }
                if (this.searchForm.category) {
                    params.category = this.searchForm.category
                }
                
                const response = await getFaqList(params)
                if (response.data.code === 200) {
                    this.faqList = response.data.data.list
                    this.total = response.data.data.total
                }
            } catch (error) {
                console.error('获取FAQ列表失败:', error)
                this.$message.error('获取FAQ列表失败')
            } finally {
                this.loading = false
            }
        },
        async loadStats() {
            try {
                const response = await getFaqStats()
                if (response.data.code === 200) {
                    this.stats = response.data.data
                }
            } catch (error) {
                console.error('获取FAQ统计失败:', error)
            }
        },
        handleAdd() {
            this.editFormData = {
                id: null,
                category: '',
                question: '',
                answer: '',
                sort_order: 0,
                is_hot: 0
            }
            this.editDialogVisible = true
        },
        handleEdit(row) {
            this.editFormData = Object.assign({}, row)
            this.editDialogVisible = true
        },
        async submitEdit() {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    this.submitLoading = true
                    try {
                        if (this.editFormData.id) {
                            // 更新
                            await updateFaq(this.editFormData.id, {
                                category: this.editFormData.category,
                                question: this.editFormData.question,
                                answer: this.editFormData.answer,
                                sort_order: this.editFormData.sort_order,
                                is_hot: this.editFormData.is_hot
                            })
                            this.$message.success('问题已更新')
                        } else {
                            // 创建
                            await createFaq({
                                category: this.editFormData.category,
                                question: this.editFormData.question,
                                answer: this.editFormData.answer,
                                sort_order: this.editFormData.sort_order || 0,
                                is_hot: this.editFormData.is_hot || 0
                            })
                            this.$message.success('问题已添加')
                        }
                        this.editDialogVisible = false
                        this.loadFaqList()
                        this.loadStats()
                    } catch (error) {
                        console.error('保存FAQ失败:', error)
                        this.$message.error('保存失败')
                    } finally {
                        this.submitLoading = false
                    }
                }
            })
        },
        handleDelete(row) {
            this.$confirm(`确定删除问题"${row.question}"吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    await deleteFaq(row.id)
                    this.$message.success('问题已删除')
                    this.loadFaqList()
                    this.loadStats()
                } catch (error) {
                    console.error('删除FAQ失败:', error)
                    this.$message.error('删除失败')
                }
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },
        handlePageChange(page) {
            this.currentPage = page
            this.loadFaqList()
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },
        handlePageSizeChange(size) {
            this.pageSize = size
            this.currentPage = 1
            this.loadFaqList()
        },
        getCategoryLabel(category) {
            const map = {
                'adoption': '领养流程',
                'care': '动物护理',
                'account': '账户相关',
                'other': '其他'
            }
            return map[category] || category
        }
    },
    mounted() {
        this.loadFaqList()
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
    border: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
        h1 {
            font-size: 26px;
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

.stats-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .stat-item {
        background: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        border: 1px solid #f0f0f0;
        border-left: 4px solid #409eff;
        transition: all 0.3s ease;

        &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }

        &.success {
            border-left-color: #67c23a;
            .stat-value { color: #67c23a; }
        }

        &.info {
            border-left-color: #409eff;
            .stat-value { color: #409eff; }
        }

        &.warning {
            border-left-color: #e6a23c;
            .stat-value { color: #e6a23c; }
        }

        .stat-label {
            font-size: 14px;
            color: #8b92a9;
            margin-bottom: 10px;
            font-weight: 500;
        }

        .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #409eff;
        }
    }
}

.faq-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;
    overflow: hidden;

    .faq-item {
        border-bottom: 1px solid #f0f0f0;
        padding: 24px;
        transition: all 0.3s ease;

        &:hover {
            background: #f9fafb;
        }

        &:last-child {
            border-bottom: none;
        }

        .faq-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;

            .faq-title {
                flex: 1;
                display: flex;
                align-items: flex-start;
                gap: 12px;

                .category-tag {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    flex-shrink: 0;
                    white-space: nowrap;

                    &.adoption {
                        background: #e6f7ff;
                        color: #0050b3;
                    }

                    &.care {
                        background: #f6ffed;
                        color: #274e00;
                    }

                    &.account {
                        background: #fff7e6;
                        color: #ad6800;
                    }

                    &.other {
                        background: #f5f5f5;
                        color: #595959;
                    }
                }

                h3 {
                    margin: 0;
                    font-size: 16px;
                    color: #1f2937;
                    font-weight: 600;
                }
            }

            .faq-actions {
                flex-shrink: 0;
            }
        }

        .faq-body {
            margin-bottom: 16px;

            p {
                margin: 0;
                color: #4b5563;
                line-height: 1.8;
                text-align: justify;
            }
        }

        .faq-footer {
            display: flex;
            gap: 20px;
            font-size: 12px;
            color: #8b92a9;

            .meta {
                display: flex;
                align-items: center;
                gap: 4px;
            }
        }
    }

    .empty-state {
        text-align: center;
        padding: 60px 24px;
        color: #8b92a9;

        i {
            font-size: 48px;
            margin-bottom: 16px;
            display: block;
            opacity: 0.5;
        }

        p {
            margin: 0;
            font-size: 14px;
        }
    }
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding-top: 20px;
    background: white;
    padding: 20px 24px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
    .faq-page {
        padding: 20px;
    }

    .page-header {
        padding: 16px;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .filter-section {
        padding: 16px;

        .filter-row {
            flex-direction: column;
            align-items: stretch;
        }

        .filter-inputs {
            width: 100%;
        }

        .input-wrapper {
            max-width: none;
            width: 100%;
        }

        .filter-actions {
            width: 100%;
            
            .el-button {
                flex: 1;
            }
        }
    }

    .stats-summary {
        grid-template-columns: repeat(2, 1fr);
    }

    .faq-list .faq-item {
        padding: 16px;

        .faq-header {
            flex-direction: column;
            gap: 12px;

            .faq-actions {
                width: 100%;
                display: flex;
                gap: 8px;
            }
        }
    }
}
</style>

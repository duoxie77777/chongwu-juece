<template>
    <div class="comments-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>💬 故事评论管理</h1>
                <p>管理领养故事的用户评论</p>
            </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
            <div class="filter-row">
                <div class="filter-inputs">
                    <div class="input-wrapper">
                        <el-input
                            v-model="searchForm.keyword"
                            placeholder="搜索用户名或评论内容..."
                            clearable
                            prefix-icon="el-icon-search"
                            @keyup.enter="handleSearch"
                            class="search-input"
                        ></el-input>
                    </div>
                    <div class="input-wrapper">
                        <el-select
                            v-model="searchForm.story_id"
                            placeholder="选择故事"
                            clearable
                            filterable
                            @change="handleSearch"
                            class="status-select"
                        >
                            <el-option label="全部故事" value=""></el-option>
                            <el-option
                                v-for="story in storyList"
                                :key="story.id"
                                :label="story.title"
                                :value="story.id"
                            ></el-option>
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
                <div class="stat-label">总评论</div>
                <div class="stat-value">{{ stats.total }}</div>
            </div>
            <div class="stat-item success">
                <div class="stat-label">今日新增</div>
                <div class="stat-value">{{ stats.today }}</div>
            </div>
            <div class="stat-item warning">
                <div class="stat-label">总点赞数</div>
                <div class="stat-value">{{ stats.totalLikes }}</div>
            </div>
        </div>

        <!-- 评论表格 -->
        <div class="table-section">
            <el-table
                :data="commentList"
                style="width: 100%"
                stripe
                v-loading="loading"
            >
                <el-table-column prop="id" label="ID" width="80"></el-table-column>
                
                <el-table-column prop="story_title" label="所属故事" min-width="180">
                    <template slot-scope="scope">
                        <span class="story-title">{{ scope.row.story_title || '未知故事' }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="user_name" label="用户名" width="120">
                    <template slot-scope="scope">
                        <div class="user-info">
                            <i class="el-icon-user"></i>
                            <span>{{ scope.row.user_name }}</span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="content" label="评论内容" min-width="250">
                    <template slot-scope="scope">
                        <el-tooltip :content="scope.row.content" placement="top" :disabled="scope.row.content.length < 50">
                            <span class="comment-content">{{ scope.row.content | truncate(50) }}</span>
                        </el-tooltip>
                    </template>
                </el-table-column>

                <el-table-column prop="likes" label="点赞数" width="100" align="center">
                    <template slot-scope="scope">
                        <span class="likes-count">
                            <i class="el-icon-star-on"></i>
                            {{ scope.row.likes || 0 }}
                        </span>
                    </template>
                </el-table-column>

                <el-table-column prop="create_time" label="评论时间" width="170">
                    <template slot-scope="scope">
                        {{ formatDate(scope.row.create_time) }}
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="200" fixed="right" align="center">
                    <template slot-scope="scope">
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
                            type="danger"
                            plain
                            icon="el-icon-delete"
                            @click="handleDelete(scope.row)"
                        >
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 空状态 -->
            <div v-if="commentList.length === 0 && !loading" class="empty-state">
                <i class="el-icon-chat-line-square"></i>
                <p>暂无评论数据</p>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper" v-if="total > 0">
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

        <!-- 查看评论详情对话框 -->
        <el-dialog
            title="评论详情"
            :visible.sync="viewDialogVisible"
            width="600px"
        >
            <div class="comment-detail" v-if="currentComment">
                <div class="detail-section">
                    <h4>基本信息</h4>
                    <div class="detail-row">
                        <span class="label">评论ID：</span>
                        <span class="value">{{ currentComment.id }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">所属故事：</span>
                        <span class="value">{{ currentComment.story_title || '未知故事' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">用户名：</span>
                        <span class="value">{{ currentComment.user_name }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">点赞数：</span>
                        <span class="value likes">
                            <i class="el-icon-star-on"></i>
                            {{ currentComment.likes || 0 }}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="label">评论时间：</span>
                        <span class="value">{{ formatDate(currentComment.create_time) }}</span>
                    </div>
                </div>
                <div class="detail-section">
                    <h4>评论内容</h4>
                    <div class="comment-text">{{ currentComment.content }}</div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="viewDialogVisible = false">关闭</el-button>
                <el-button type="danger" @click="handleDeleteFromDialog">删除评论</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getStoryCommentList, getStoryCommentStats, deleteStoryComment } from '@/utils/api'
import { formatDateTime } from '@/utils/dateFormat'

export default {
    name: 'StoryComments',
    filters: {
        truncate(value, length) {
            if (!value) return ''
            if (value.length <= length) return value
            return value.substring(0, length) + '...'
        }
    },
    data() {
        return {
            searchForm: {
                keyword: '',
                story_id: ''
            },
            currentPage: 1,
            pageSize: 10,
            total: 0,
            commentList: [],
            storyList: [],
            loading: false,
            viewDialogVisible: false,
            currentComment: null,
            stats: {
                total: 0,
                today: 0,
                totalLikes: 0
            }
        }
    },
    methods: {
        handleSearch() {
            this.currentPage = 1
            this.loadCommentList()
        },
        handleReset() {
            this.searchForm = {
                keyword: '',
                story_id: ''
            }
            this.currentPage = 1
            this.loadCommentList()
        },
        async loadCommentList() {
            this.loading = true
            try {
                const params = {
                    page: this.currentPage,
                    size: this.pageSize
                }
                if (this.searchForm.keyword) {
                    params.keyword = this.searchForm.keyword
                }
                if (this.searchForm.story_id) {
                    params.story_id = this.searchForm.story_id
                }
                
                const response = await getStoryCommentList(params)
                if (response.data.code === 200) {
                    this.commentList = response.data.data.list
                    this.total = response.data.data.total
                }
            } catch (error) {
                console.error('获取评论列表失败:', error)
                this.$message.error('获取评论列表失败')
            } finally {
                this.loading = false
            }
        },
        async loadStats() {
            try {
                const response = await getStoryCommentStats()
                if (response.data.code === 200) {
                    this.stats = response.data.data
                }
            } catch (error) {
                console.error('获取评论统计失败:', error)
            }
        },
        async loadStoryList() {
            try {
                // 从评论列表中提取故事信息
                const response = await getStoryCommentList({ page: 1, size: 1000 })
                if (response.data.code === 200) {
                    const stories = new Map()
                    response.data.data.list.forEach(comment => {
                        if (comment.story_id && comment.story_title) {
                            stories.set(comment.story_id, {
                                id: comment.story_id,
                                title: comment.story_title
                            })
                        }
                    })
                    this.storyList = Array.from(stories.values())
                }
            } catch (error) {
                console.error('获取故事列表失败:', error)
            }
        },
        handleView(row) {
            this.currentComment = row
            this.viewDialogVisible = true
        },
        handleDelete(row) {
            this.$confirm(`确定删除用户"${row.user_name}"的评论吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    await deleteStoryComment(row.id)
                    this.$message.success('评论已删除')
                    this.loadCommentList()
                    this.loadStats()
                } catch (error) {
                    console.error('删除评论失败:', error)
                    this.$message.error('删除失败')
                }
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },
        handleDeleteFromDialog() {
            if (this.currentComment) {
                this.handleDelete(this.currentComment)
                this.viewDialogVisible = false
            }
        },
        handlePageChange(page) {
            this.currentPage = page
            this.loadCommentList()
        },
        handlePageSizeChange(size) {
            this.pageSize = size
            this.currentPage = 1
            this.loadCommentList()
        },
        formatDate(dateStr) {
            return formatDateTime(dateStr, 'datetime')
        }
    },
    mounted() {
        this.loadCommentList()
        this.loadStats()
        this.loadStoryList()
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
        max-width: 300px;
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

.table-section {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;

    .story-title {
        color: #409eff;
        font-weight: 500;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 6px;
        
        i {
            color: #909399;
        }
    }

    .comment-content {
        color: #606266;
        line-height: 1.5;
    }

    .likes-count {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: #e6a23c;
        font-weight: 500;

        i {
            color: #e6a23c;
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
    border-top: 1px solid #f0f0f0;
}

.comment-detail {
    .detail-section {
        margin-bottom: 24px;

        h4 {
            font-size: 16px;
            color: #1f2937;
            font-weight: 600;
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #409eff;
            display: inline-block;
        }

        .detail-row {
            display: flex;
            margin-bottom: 12px;
            line-height: 1.6;

            .label {
                width: 100px;
                color: #8b92a9;
                flex-shrink: 0;
            }

            .value {
                flex: 1;
                color: #1f2937;

                &.likes {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #e6a23c;

                    i {
                        color: #e6a23c;
                    }
                }
            }
        }

        .comment-text {
            background: #f5f7fa;
            padding: 16px;
            border-radius: 8px;
            border-left: 3px solid #409eff;
            color: #606266;
            line-height: 1.8;
            white-space: pre-wrap;
        }
    }
}

@media (max-width: 768px) {
    .comments-page {
        padding: 20px;
    }

    .page-header {
        padding: 16px;
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
        grid-template-columns: repeat(3, 1fr);
    }

    .table-section {
        padding: 16px;
        overflow-x: auto;
    }
}
</style>

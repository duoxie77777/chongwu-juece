<template>
    <div class="comments-page">
        <!-- 权限遮罩 -->
        <div v-if="!isAdmin" class="permission-overlay">
            <div class="permission-content">
                <i class="el-icon-lock"></i>
                <h2>无权限访问</h2>
                <p>抱歉，只有管理员才能访问商城管理功能</p>
                <el-button type="primary" @click="goBack">返回上一页</el-button>
            </div>
        </div>

        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>💬 故事评论管理</h1>
                <p>管理用户在领养故事下的评论</p>
            </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="6">
                    <el-input v-model="searchQuery" placeholder="搜索用户名或内容" clearable
                        prefix-icon="el-icon-search"></el-input>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <el-select v-model="filterStatus" placeholder="筛选状态" clearable>
                        <el-option label="全部" value=""></el-option>
                        <el-option label="待审核" value="pending"></el-option>
                        <el-option label="已发布" value="published"></el-option>
                        <el-option label="已隐藏" value="hidden"></el-option>
                    </el-select>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                </el-col>
            </el-row>
        </div>

        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-row">
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card">
                    <div class="stat-number">{{ stats.total }}</div>
                    <div class="stat-label">总评论</div>
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
                    <div class="stat-number">{{ stats.pending }}</div>
                    <div class="stat-label">待审核</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card warning">
                    <div class="stat-number">{{ stats.hidden }}</div>
                    <div class="stat-label">已隐藏</div>
                </div>
            </el-col>
        </el-row>

        <!-- 评论表格 -->
        <div class="table-section">
            <el-table :data="filteredComments" stripe style="width: 100%"
                :default-sort="{ prop: 'id', order: 'descending' }">
                <el-table-column prop="id" label="ID" width="60"></el-table-column>
                <el-table-column prop="name" label="用户" width="100"></el-table-column>
                <el-table-column prop="storyTitle" label="所属故事" width="200" show-overflow-tooltip></el-table-column>
                <el-table-column prop="content" label="评论内容" min-width="250" show-overflow-tooltip></el-table-column>
                <el-table-column prop="likes" label="点赞数" width="80" align="center"></el-table-column>
                <el-table-column prop="date" label="发表时间" width="160"></el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="getStatusType(scope.row.status)">
                            {{ getStatusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="280" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="primary" size="small" @click="handleView(scope.row)">查看</el-button>
                        <el-button v-if="scope.row.status === 'pending'" type="success" size="small"
                            @click="handleApprove(scope.row)">通过</el-button>
                        <el-button type="warning" size="small" @click="handleHide(scope.row)">{{ scope.row.status ===
                            'hidden' ? '显示' : '隐藏' }}</el-button>
                        <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 评论详情对话框 -->
        <el-dialog title="评论详情" :visible.sync="detailVisible" width="600px">
            <div v-if="selectedComment" class="comment-detail">
                <div class="detail-item">
                    <span class="label">用户名：</span>
                    <span>{{ selectedComment.name }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">所属故事：</span>
                    <span>{{ selectedComment.storyTitle }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">发表时间：</span>
                    <span>{{ selectedComment.date }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">评论内容：</span>
                </div>
                <div class="content-box">
                    {{ selectedComment.content }}
                </div>
                <div class="detail-item">
                    <span class="label">点赞数：</span>
                    <span>{{ selectedComment.likes }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">状态：</span>
                    <el-tag :type="getStatusType(selectedComment.status)">
                        {{ getStatusText(selectedComment.status) }}
                    </el-tag>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'MallComments',
    data() {
        return {
            searchQuery: '',
            filterStatus: '',
            detailVisible: false,
            selectedComment: null,
            comments: [
                {
                    id: 1,
                    name: '小红',
                    storyTitle: '小黑的新生活',
                    content: '非常感人的故事，希望更多的流浪动物能有美好的结局。',
                    likes: 24,
                    date: '2024-01-15 10:30',
                    status: 'published'
                },
                {
                    id: 2,
                    name: '大明',
                    storyTitle: '小黑的新生活',
                    content: '我也很想领养一只狗狗，看到这个故事更坚定了我的想法。',
                    likes: 18,
                    date: '2024-01-15 11:45',
                    status: 'published'
                },
                {
                    id: 3,
                    name: '小刚',
                    storyTitle: '淘气包花花',
                    content: '好可爱的猫咪啊！',
                    likes: 12,
                    date: '2024-01-16 09:20',
                    status: 'pending'
                },
                {
                    id: 4,
                    name: '李丽',
                    storyTitle: '安静的小白',
                    content: '这个评论包含不当内容',
                    likes: 2,
                    date: '2024-01-16 14:50',
                    status: 'hidden'
                }
            ]
        }
    },
    computed: {
        isAdmin() {
            const userStr = localStorage.getItem('user')
            if (!userStr) return false
            try {
                const user = JSON.parse(userStr)
                return user.role === 'admin'
            } catch (e) {
                return false
            }
        },
        stats() {
            return {
                total: this.comments.length,
                published: this.comments.filter(c => c.status === 'published').length,
                pending: this.comments.filter(c => c.status === 'pending').length,
                hidden: this.comments.filter(c => c.status === 'hidden').length
            }
        },
        filteredComments() {
            return this.comments.filter(c => {
                const matchSearch = !this.searchQuery ||
                    c.name.includes(this.searchQuery) ||
                    c.content.includes(this.searchQuery);
                const matchStatus = !this.filterStatus || c.status === this.filterStatus;
                return matchSearch && matchStatus;
            });
        }
    },
    methods: {
        goBack() {
            this.$router.go(-1)
        },
        handleSearch() {
            this.$message.success('搜索成功');
        },
        handleView(row) {
            this.selectedComment = row;
            this.detailVisible = true;
        },
        handleApprove(row) {
            this.$confirm('确定要通过这条评论吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            }).then(() => {
                row.status = 'published';
                this.$message.success('已发布');
            }).catch(() => { });
        },
        handleHide(row) {
            const isHiding = row.status !== 'hidden';
            this.$confirm(`确定要${isHiding ? '隐藏' : '显示'}这条评论吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            }).then(() => {
                row.status = isHiding ? 'hidden' : 'published';
                this.$message.success(isHiding ? '已隐藏' : '已显示');
            }).catch(() => { });
        },
        handleDelete(row) {
            this.$confirm('确定要删除这条评论吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const index = this.comments.findIndex(c => c.id === row.id);
                if (index !== -1) {
                    this.comments.splice(index, 1);
                }
                this.$message.success('删除成功');
            }).catch(() => { });
        },
        getStatusType(status) {
            const typeMap = {
                pending: 'info',
                published: 'success',
                hidden: 'warning'
            };
            return typeMap[status] || 'info';
        },
        getStatusText(status) {
            const textMap = {
                pending: '待审核',
                published: '已发布',
                hidden: '已隐藏'
            };
            return textMap[status] || '未知';
        }
    }
}
</script>

<style scoped lang="less">
.permission-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;

    .permission-content {
        background: white;
        padding: 60px 80px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

        i {
            font-size: 80px;
            color: #f56c6c;
            margin-bottom: 20px;
        }

        h2 {
            font-size: 28px;
            color: #333;
            margin: 0 0 15px 0;
        }

        p {
            font-size: 16px;
            color: #666;
            margin: 0 0 30px 0;
        }
    }
}

.comments-page {
    padding: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .header-title h1 {
        margin: 0;
        font-size: 24px;
        color: #333;
    }

    .header-title p {
        margin: 5px 0 0 0;
        color: #999;
        font-size: 14px;
    }
}

.filter-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-row {
    margin-bottom: 20px;

    .stat-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
        border-left: 4px solid #d52b1e;

        &.success {
            border-left-color: #67c23a;
        }

        &.info {
            border-left-color: #409eff;
        }

        &.warning {
            border-left-color: #e6a23c;
        }

        .stat-number {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }

        .stat-label {
            font-size: 14px;
            color: #999;
        }
    }
}

.table-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-detail {
    .detail-item {
        margin-bottom: 15px;
        line-height: 1.8;

        .label {
            font-weight: bold;
            min-width: 80px;
            display: inline-block;
            color: #666;
        }
    }

    .content-box {
        background: #f5f7fa;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 15px;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-word;
    }
}
</style>

<template>
    <div class="users-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>👥 用户管理</h1>
                <p>管理平台中的所有用户信息</p>
            </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
            <div class="filter-row">
                <div class="filter-inputs">
                    <div class="input-wrapper">
                        <el-input
                            v-model="searchForm.keyword"
                            placeholder="搜索用户名或邮箱..."
                            clearable
                            prefix-icon="el-icon-search"
                            @keyup.enter="handleSearch"
                            class="search-input"
                        ></el-input>
                    </div>
                    <div class="input-wrapper">
                        <el-select
                            v-model="searchForm.status"
                            placeholder="选择状态"
                            clearable
                            @change="handleSearch"
                            class="status-select"
                        >
                            <el-option label="全部状态" value=""></el-option>
                            <el-option label="活跃" value="active">
                                <span class="status-option">
                                    <span class="status-dot success"></span>活跃
                                </span>
                            </el-option>
                            <el-option label="禁用" value="disabled">
                                <span class="status-option">
                                    <span class="status-dot danger"></span>禁用
                                </span>
                            </el-option>
                        </el-select>
                    </div>
                    <div class="input-wrapper">
                        <el-select
                            v-model="searchForm.role"
                            placeholder="选择角色"
                            clearable
                            @change="handleSearch"
                            class="status-select"
                        >
                            <el-option label="全部角色" value=""></el-option>
                            <el-option label="普通用户" value="user">
                                <span class="status-option">
                                    <span class="status-dot info"></span>普通用户
                                </span>
                            </el-option>
                            <el-option label="领养人" value="adopter">
                                <span class="status-option">
                                    <span class="status-dot success"></span>领养人
                                </span>
                            </el-option>
                            <el-option label="志愿者" value="volunteer">
                                <span class="status-option">
                                    <span class="status-dot warning"></span>志愿者
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
                <div class="stat-label">总数</div>
                <div class="stat-value">{{ statistics.total }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">活跃用户</div>
                <div class="stat-value" style="color: #67c23a;">{{ statistics.active }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">禁用用户</div>
                <div class="stat-value" style="color: #f56c6c;">{{ statistics.disabled }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">志愿者</div>
                <div class="stat-value" style="color: #e6a23c;">{{ statistics.volunteer }}</div>
            </div>
        </div>

        <!-- 用户表格 -->
        <div class="table-section">
            <el-table
                :data="filteredUsers"
                stripe
                style="width: 100%"
                :default-sort="{ prop: 'createdAt', order: 'descending' }"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="50"></el-table-column>
                <el-table-column prop="id" label="用户ID" width="80"></el-table-column>
                <el-table-column prop="username" label="用户名" min-width="120">
                    <template slot-scope="scope">
                        <div class="user-info">
                            <img :src="scope.row.avatar" :alt="scope.row.username" class="avatar" />
                            <span>{{ scope.row.username }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="email" label="邮箱" min-width="160"></el-table-column>
                <el-table-column prop="phone" label="手机" min-width="120"></el-table-column>
                <el-table-column prop="role" label="角色" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="getRoleType(scope.row.role)">
                            {{ getRoleLabel(scope.row.role) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                            {{ scope.row.status === 'active' ? '活跃' : '禁用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="adoptionCount" label="领养数" width="80" sortable></el-table-column>
                <el-table-column prop="createdAt" label="注册时间" min-width="160" sortable>
                    <template slot-scope="scope">
                        {{ formatDate(scope.row.createdAt) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="240" fixed="right">
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
                            v-if="isAdmin"
                            size="small"
                            type="info"
                            plain
                            icon="el-icon-edit"
                            @click="handleEdit(scope.row)"
                        >
                            编辑
                        </el-button>
                        <el-button
                            v-if="isAdmin"
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

        <!-- 用户详情对话框 -->
        <el-dialog
            title="用户详情"
            :visible.sync="viewDialogVisible"
            width="600px"
            :close-on-click-modal="false"
        >
            <div v-if="currentUser" class="user-detail">
                <el-row :gutter="20">
                    <el-col :span="24">
                        <div class="user-avatar-section">
                            <img :src="currentUser.avatar" :alt="currentUser.username" />
                        </div>
                    </el-col>
                </el-row>
                <el-divider></el-divider>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <p><strong>用户名：</strong> {{ currentUser.username }}</p>
                    </el-col>
                    <el-col :span="12">
                        <p><strong>邮箱：</strong> {{ currentUser.email }}</p>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <p><strong>手机：</strong> {{ currentUser.phone }}</p>
                    </el-col>
                    <el-col :span="12">
                        <p><strong>地址：</strong> {{ currentUser.address }}</p>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <p><strong>角色：</strong> {{ getRoleLabel(currentUser.role) }}</p>
                    </el-col>
                    <el-col :span="12">
                        <p><strong>状态：</strong> {{ currentUser.status === 'active' ? '活跃' : '禁用' }}</p>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <p><strong>领养数：</strong> {{ currentUser.adoptionCount }}</p>
                    </el-col>
                    <el-col :span="12">
                        <p><strong>注册时间：</strong> {{ formatDate(currentUser.createdAt) }}</p>
                    </el-col>
                </el-row>
                <el-divider></el-divider>
                <el-row :gutter="20">
                    <el-col :span="24">
                        <p><strong>个人简介：</strong></p>
                        <p class="bio-text">{{ currentUser.bio || '暂无简介' }}</p>
                    </el-col>
                </el-row>
            </div>
        </el-dialog>

        <!-- 编辑用户对话框 -->
        <el-dialog
            title="编辑用户"
            :visible.sync="editDialogVisible"
            width="600px"
            :close-on-click-modal="false"
        >
            <el-form ref="editForm" :model="editFormData" :rules="formRules" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editFormData.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editFormData.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="phone">
                    <el-input v-model="editFormData.phone"></el-input>
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input v-model="editFormData.address"></el-input>
                </el-form-item>
                <el-form-item label="角色" prop="role" v-if="isAdmin">
                    <el-select v-model="editFormData.role">
                        <el-option label="普通用户" value="user"></el-option>
                        <el-option label="领养人" value="adopter"></el-option>
                        <el-option label="志愿者" value="volunteer"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status" v-if="isAdmin">
                    <el-select v-model="editFormData.status">
                        <el-option label="活跃" value="active"></el-option>
                        <el-option label="禁用" value="disabled"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="个人简介" prop="bio">
                    <el-input
                        v-model="editFormData.bio"
                        type="textarea"
                        :rows="3"
                        maxlength="500"
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
import { formatDateTime } from '@/utils/dateFormat'

export default {
    name: 'UsersList',
    data() {
        return {
            searchForm: {
                keyword: '',
                status: '',
                role: ''
            },
            currentPage: 1,
            pageSize: 10,
            total: 0,
            users: [],
            selectedUsers: [],
            viewDialogVisible: false,
            editDialogVisible: false,
            currentUser: null,
            editFormData: {},
            submitLoading: false,
            statistics: {
                total: 0,
                active: 0,
                disabled: 0,
                volunteer: 0
            },
            formRules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
                ],
                phone: [
                    { required: true, message: '请输入手机号', trigger: 'blur' }
                ]
            }
        }
    },
    computed: {
        filteredUsers() {
            return this.users.slice(
                (this.currentPage - 1) * this.pageSize,
                this.currentPage * this.pageSize
            )
        },
        isAdmin() {
            // 检查当前登录用户是否是管理员
            const userStr = localStorage.getItem('user')
            if (!userStr) return false
            try {
                const user = JSON.parse(userStr)
                return user.role === 'admin'
            } catch (e) {
                return false
            }
        }
    },
    methods: {
        handleSearch() {
            this.currentPage = 1
            this.loadUsers()
        },
        handleReset() {
            this.searchForm = {
                keyword: '',
                status: '',
                role: ''
            }
            this.currentPage = 1
            this.loadUsers()
        },
        calculateStatistics() {
            this.statistics.total = this.users.length
            this.statistics.active = this.users.filter(item => item.status === 'active').length
            this.statistics.disabled = this.users.filter(item => item.status === 'disabled').length
            this.statistics.volunteer = this.users.filter(item => item.role === 'volunteer').length
        },
        loadUsers() {
            // 模拟获取用户列表
            let mockUsers = [
                {
                    id: 1,
                    username: '张三',
                    email: 'zhangsan@example.com',
                    phone: '13800138000',
                    address: '北京市朝阳区',
                    avatar: 'https://via.placeholder.com/40?text=ZS',
                    role: 'adopter',
                    status: 'active',
                    adoptionCount: 2,
                    createdAt: '2024-01-15',
                    bio: '爱动物的热心市民'
                },
                {
                    id: 2,
                    username: '李四',
                    email: 'lisi@example.com',
                    phone: '13800138001',
                    address: '上海市浦东新区',
                    avatar: 'https://via.placeholder.com/40?text=LS',
                    role: 'volunteer',
                    status: 'active',
                    adoptionCount: 0,
                    createdAt: '2024-01-10',
                    bio: '志愿者，热心帮助失业动物'
                },
                {
                    id: 3,
                    username: '王五',
                    email: 'wangwu@example.com',
                    phone: '13800138002',
                    address: '广州市天河区',
                    avatar: 'https://via.placeholder.com/40?text=WW',
                    role: 'user',
                    status: 'active',
                    adoptionCount: 1,
                    createdAt: '2024-01-05',
                    bio: '普通用户'
                },
                {
                    id: 4,
                    username: '赵六',
                    email: 'zhaoliu@example.com',
                    phone: '13800138003',
                    address: '深圳市南山区',
                    avatar: 'https://via.placeholder.com/40?text=ZL',
                    role: 'adopter',
                    status: 'disabled',
                    adoptionCount: 3,
                    createdAt: '2023-12-25',
                    bio: '已禁用账户'
                },
                {
                    id: 5,
                    username: '孙七',
                    email: 'sunqi@example.com',
                    phone: '13800138004',
                    address: '杭州市西湖区',
                    avatar: 'https://via.placeholder.com/40?text=SQ',
                    role: 'volunteer',
                    status: 'active',
                    adoptionCount: 0,
                    createdAt: '2023-12-20',
                    bio: '资深志愿者，经验丰富'
                }
            ]

            // 根据搜索条件过滤
            if (this.searchForm.keyword) {
                const keyword = this.searchForm.keyword.toLowerCase()
                mockUsers = mockUsers.filter(user => 
                    user.username.toLowerCase().includes(keyword) || 
                    user.email.toLowerCase().includes(keyword)
                )
            }
            if (this.searchForm.status) {
                mockUsers = mockUsers.filter(user => user.status === this.searchForm.status)
            }
            if (this.searchForm.role) {
                mockUsers = mockUsers.filter(user => user.role === this.searchForm.role)
            }

            this.users = mockUsers
            this.total = mockUsers.length
            this.calculateStatistics()
        },
        handleSelectionChange(selection) {
            this.selectedUsers = selection
        },
        handleView(row) {
            this.currentUser = Object.assign({}, row)
            this.viewDialogVisible = true
        },
        handleEdit(row) {
            this.editFormData = Object.assign({}, row)
            this.editDialogVisible = true
        },
        submitEdit() {
            this.$refs.editForm.validate((valid) => {
                if (valid) {
                    this.submitLoading = true
                    setTimeout(() => {
                        this.submitLoading = false
                        this.$message.success('用户信息更新成功')
                        this.editDialogVisible = false
                        this.loadUsers()
                    }, 1000)
                }
            })
        },
        handleDelete(row) {
            this.$confirm(`确定删除用户 ${row.username} 吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$message.success('用户已删除')
                this.loadUsers()
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },
        handlePageChange() {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },
        handlePageSizeChange() {
            this.currentPage = 1
        },
        getRoleLabel(role) {
            const map = {
                'user': '普通用户',
                'adopter': '领养人',
                'volunteer': '志愿者'
            }
            return map[role] || role
        },
        getRoleType(role) {
            const map = {
                'user': 'info',
                'adopter': 'success',
                'volunteer': 'warning'
            }
            return map[role] || 'info'
        },
        formatDate(date) {
            return formatDateTime(date, 'datetime')
        }
    },
    mounted() {
        this.loadUsers()
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
        &.info { background: #909399; }
        &.warning { background: #e6a23c; }
        &.danger { background: #f56c6c; }
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
        transition: all 0.3s ease;

        &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
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
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.user-detail {
    .user-avatar-section {
        text-align: center;
        padding: 20px 0;

        img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #1890ff;
        }
    }

    p {
        margin: 12px 0;
        line-height: 1.6;

        strong {
            color: #1f2937;
            margin-right: 8px;
        }
    }

    .bio-text {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 4px;
        border-left: 3px solid #1890ff;
        color: #666;
    }
}

@media (max-width: 768px) {
    .users-page {
        padding: 20px;
    }

    .page-header,
    .filter-section,
    .table-section {
        padding: 16px;
    }

    .filter-section {
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

    .table-section {
        overflow-x: auto;
    }
}
</style>

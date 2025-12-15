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
                :data="users"
                stripe
                style="width: 100%"
                v-loading="loading"
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
                        <el-tooltip 
                            :content="getEditDisabledReason(scope.row)" 
                            placement="top" 
                            :disabled="canEditUser(scope.row)"
                        >
                            <span>
                                <el-button
                                    size="small"
                                    type="info"
                                    plain
                                    icon="el-icon-edit"
                                    :disabled="!canEditUser(scope.row)"
                                    @click="handleEdit(scope.row)"
                                >
                                    编辑
                                </el-button>
                            </span>
                        </el-tooltip>
                        <el-tooltip 
                            :content="getDeleteDisabledReason(scope.row)" 
                            placement="top" 
                            :disabled="canDeleteUser(scope.row)"
                        >
                            <span>
                                <el-button
                                    size="small"
                                    type="danger"
                                    plain
                                    icon="el-icon-delete"
                                    :disabled="!canDeleteUser(scope.row)"
                                    @click="handleDelete(scope.row)"
                                >
                                    删除
                                </el-button>
                            </span>
                        </el-tooltip>
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
                <el-form-item label="头像">
                    <div class="avatar-upload">
                        <div class="avatar-preview">
                            <img :src="editFormData.avatar || 'https://via.placeholder.com/100'" alt="头像" />
                        </div>
                        <el-upload
                            class="avatar-uploader"
                            action=""
                            :show-file-list="false"
                            :before-upload="beforeAvatarUpload"
                            :http-request="uploadAvatar"
                        >
                            <el-button size="small" type="primary">更换头像</el-button>
                        </el-upload>
                    </div>
                </el-form-item>
                <el-form-item label="修改密码">
                    <el-button type="warning" size="small" @click="showPasswordDialog">重置密码</el-button>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitEdit" :loading="submitLoading">保存</el-button>
            </span>
        </el-dialog>

        <!-- 修改密码对话框 -->
        <el-dialog
            title="重置密码"
            :visible.sync="passwordDialogVisible"
            width="450px"
            :close-on-click-modal="false"
        >
            <el-form ref="passwordForm" :model="passwordFormData" :rules="passwordRules" label-width="100px">
                <el-form-item label="新密码" prop="newPassword">
                    <el-input
                        v-model="passwordFormData.newPassword"
                        type="password"
                        placeholder="请输入新密码"
                        show-password
                    ></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input
                        v-model="passwordFormData.confirmPassword"
                        type="password"
                        placeholder="请再次输入新密码"
                        show-password
                    ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="passwordDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitPassword" :loading="passwordLoading">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { formatDateTime } from '@/utils/dateFormat'
import { getAllUsers, updateUser, deleteUser, adminResetPassword, uploadFile } from '@/utils/api'

const API_BASE_URL = 'http://localhost:8889'

export default {
    name: 'UsersList',
    data() {
        const validateConfirmPassword = (rule, value, callback) => {
            if (value !== this.passwordFormData.newPassword) {
                callback(new Error('两次输入的密码不一致'))
            } else {
                callback()
            }
        }
        return {
            loading: false,
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
            passwordDialogVisible: false,
            currentUser: null,
            editFormData: {},
            passwordFormData: {
                newPassword: '',
                confirmPassword: ''
            },
            submitLoading: false,
            passwordLoading: false,
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
            },
            passwordRules: {
                newPassword: [
                    { required: true, message: '请输入新密码', trigger: 'blur' },
                    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
                ],
                confirmPassword: [
                    { required: true, message: '请确认密码', trigger: 'blur' },
                    { validator: validateConfirmPassword, trigger: 'blur' }
                ]
            }
        }
    },
    computed: {
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
        },
        isVolunteer() {
            // 检查当前登录用户是否是志愿者
            const userStr = localStorage.getItem('user')
            if (!userStr) return false
            try {
                const user = JSON.parse(userStr)
                return user.role === 'volunteer'
            } catch (e) {
                return false
            }
        },
        currentUserRole() {
            const userStr = localStorage.getItem('user')
            if (!userStr) return ''
            try {
                const user = JSON.parse(userStr)
                return user.role || ''
            } catch (e) {
                return ''
            }
        }
    },
    methods: {
        // 检查是否可以编辑用户
        canEditUser(row) {
            // admin可以编辑所有用户
            if (this.isAdmin) return true
            // 志愿者不能编辑admin用户
            if (this.isVolunteer && row.role === 'admin') return false
            // 志愿者不能编辑其他志愿者
            if (this.isVolunteer && row.role === 'volunteer') return false
            // 其他情况允许编辑
            return true
        },
        // 检查是否可以删除用户
        canDeleteUser(row) {
            // admin可以删除所有用户
            if (this.isAdmin) return true
            // 志愿者不能删除admin用户
            if (this.isVolunteer && row.role === 'admin') return false
            // 志愿者不能删除其他志愿者
            if (this.isVolunteer && row.role === 'volunteer') return false
            // 其他情况允许删除
            return true
        },
        // 获取编辑禁用原因
        getEditDisabledReason(row) {
            if (this.isVolunteer && row.role === 'admin') {
                return '志愿者无权编辑管理员信息'
            }
            if (this.isVolunteer && row.role === 'volunteer') {
                return '志愿者无权编辑其他志愿者信息'
            }
            return ''
        },
        // 获取删除禁用原因
        getDeleteDisabledReason(row) {
            if (this.isVolunteer && row.role === 'admin') {
                return '志愿者无权删除管理员'
            }
            if (this.isVolunteer && row.role === 'volunteer') {
                return '志愿者无权删除其他志愿者'
            }
            return ''
        },
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
        calculateStatistics(users) {
            this.statistics.total = this.total
            this.statistics.active = users.filter(item => item.status === 'active' || item.status === 1).length
            this.statistics.disabled = users.filter(item => item.status === 'disabled' || item.status === 0).length
            this.statistics.volunteer = users.filter(item => item.role === 'volunteer').length
        },
        async loadUsers() {
            this.loading = true
            try {
                const params = {
                    page: this.currentPage,
                    size: this.pageSize
                }
                
                if (this.searchForm.keyword) {
                    params.keyword = this.searchForm.keyword
                }
                if (this.searchForm.status) {
                    // 后端使用 0/1 表示状态
                    params.status = this.searchForm.status === 'active' ? 1 : 0
                }
                if (this.searchForm.role) {
                    params.role = this.searchForm.role
                }
                
                const res = await getAllUsers(params)
                if (res.data.code === 200) {
                    // 处理数据格式
                    this.users = res.data.data.map(user => ({
                        ...user,
                        username: user.real_name || user.username,
                        avatar: user.avatar || `https://via.placeholder.com/40?text=${(user.real_name || user.username || 'U').charAt(0)}`,
                        status: user.status === 1 ? 'active' : 'disabled',
                        createdAt: user.create_time,
                        adoptionCount: user.adoption_count || 0,
                        bio: user.bio || ''
                    }))
                    this.total = res.data.pagination?.total || this.users.length
                    this.calculateStatistics(this.users)
                }
            } catch (error) {
                console.error('加载用户列表失败:', error)
                this.$message.error('加载用户列表失败')
            } finally {
                this.loading = false
            }
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
        async submitEdit() {
            try {
                await this.$refs.editForm.validate()
            } catch {
                return
            }
            
            this.submitLoading = true
            try {
                const updateData = {
                    email: this.editFormData.email,
                    phone: this.editFormData.phone,
                    address: this.editFormData.address,
                    bio: this.editFormData.bio,
                    avatar: this.editFormData.avatar
                }
                
                // 只有管理员可以修改角色和状态
                if (this.isAdmin) {
                    updateData.role = this.editFormData.role
                    updateData.status = this.editFormData.status === 'active' ? 1 : 0
                }
                
                const res = await updateUser(this.editFormData.id, updateData)
                if (res.data.code === 200) {
                    this.$message.success('用户信息更新成功')
                    this.editDialogVisible = false
                    this.loadUsers()
                } else {
                    this.$message.error(res.data.message || '更新失败')
                }
            } catch (error) {
                console.error('更新用户失败:', error)
                this.$message.error(error.response?.data?.message || '更新用户失败')
            } finally {
                this.submitLoading = false
            }
        },
        async handleDelete(row) {
            try {
                await this.$confirm(`确定删除用户 ${row.username} 吗？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                
                const res = await deleteUser(row.id)
                if (res.data.code === 200) {
                    this.$message.success('用户已删除')
                    this.loadUsers()
                } else {
                    this.$message.error(res.data.message || '删除失败')
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('删除用户失败:', error)
                    this.$message.error(error.response?.data?.message || '删除用户失败')
                }
            }
        },
        handlePageChange() {
            this.loadUsers()
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },
        handlePageSizeChange() {
            this.currentPage = 1
            this.loadUsers()
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
        },
        // 显示密码修改对话框
        showPasswordDialog() {
            this.passwordFormData = {
                newPassword: '',
                confirmPassword: ''
            }
            this.passwordDialogVisible = true
        },
        // 提交密码修改
        async submitPassword() {
            try {
                await this.$refs.passwordForm.validate()
            } catch {
                return
            }
            
            this.passwordLoading = true
            try {
                const res = await adminResetPassword(this.editFormData.id, {
                    newPassword: this.passwordFormData.newPassword
                })
                if (res.data.code === 200) {
                    this.$message.success('密码重置成功')
                    this.passwordDialogVisible = false
                } else {
                    this.$message.error(res.data.message || '密码重置失败')
                }
            } catch (error) {
                console.error('密码重置失败:', error)
                this.$message.error(error.response?.data?.message || '密码重置失败')
            } finally {
                this.passwordLoading = false
            }
        },
        // 头像上传前验证
        beforeAvatarUpload(file) {
            const isImage = file.type.startsWith('image/')
            const isLt2M = file.size / 1024 / 1024 < 2

            if (!isImage) {
                this.$message.error('只能上传图片文件!')
                return false
            }
            if (!isLt2M) {
                this.$message.error('图片大小不能超过 2MB!')
                return false
            }
            return true
        },
        // 上传头像
        async uploadAvatar(options) {
            try {
                const res = await uploadFile(options.file)
                if (res.data.code === 200) {
                    // 获取返回的图片URL
                    let avatarUrl = res.data.data.url
                    // 如果是相对路径，添加完整URL
                    if (avatarUrl && !avatarUrl.startsWith('http')) {
                        avatarUrl = `${API_BASE_URL}${avatarUrl}`
                    }
                    this.editFormData.avatar = avatarUrl
                    this.$message.success('头像上传成功')
                } else {
                    this.$message.error(res.data.message || '头像上传失败')
                }
            } catch (error) {
                console.error('头像上传失败:', error)
                this.$message.error('头像上传失败')
            }
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

.avatar-upload {
    display: flex;
    align-items: center;
    gap: 16px;

    .avatar-preview {
        img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #e4e7ed;
        }
    }

    .avatar-uploader {
        display: inline-block;
    }
}
</style>

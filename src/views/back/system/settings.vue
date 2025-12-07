<template>
    <div class="settings-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>账号设置</h1>
                <p>管理您的账号信息和安全设置</p>
            </div>
        </div>

        <div class="settings-content">
            <el-row :gutter="24">
                <!-- 左侧菜单 -->
                <el-col :xs="24" :sm="6" :md="5">
                    <div class="settings-menu">
                        <div 
                            v-for="item in menuItems" 
                            :key="item.key"
                            :class="['menu-item', { active: activeMenu === item.key }]"
                            @click="activeMenu = item.key"
                        >
                            <i :class="item.icon"></i>
                            <span>{{ item.label }}</span>
                        </div>
                    </div>
                </el-col>

                <!-- 右侧内容 -->
                <el-col :xs="24" :sm="18" :md="19">
                    <div class="settings-panel">
                        <!-- 基本信息 -->
                        <div v-show="activeMenu === 'profile'" class="panel-content">
                            <h3 class="panel-title">基本信息</h3>
                            <el-form ref="profileForm" :model="profileForm" :rules="profileRules" label-width="100px">
                                <el-form-item label="头像">
                                    <div class="avatar-upload">
                                        <el-upload
                                            class="avatar-uploader"
                                            action="#"
                                            :show-file-list="false"
                                            :http-request="handleAvatarUpload"
                                            :before-upload="beforeAvatarUpload"
                                        >
                                            <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar">
                                            <div v-else class="avatar-placeholder">
                                                <i class="el-icon-user"></i>
                                            </div>
                                            <div class="avatar-hover">
                                                <i class="el-icon-camera"></i>
                                                <span>更换头像</span>
                                            </div>
                                        </el-upload>
                                    </div>
                                </el-form-item>
                                <el-form-item label="用户名" prop="username">
                                    <el-input v-model="profileForm.username" disabled placeholder="用户名不可修改"></el-input>
                                </el-form-item>
                                <el-form-item label="真实姓名" prop="realName">
                                    <el-input v-model="profileForm.realName" placeholder="请输入真实姓名"></el-input>
                                </el-form-item>
                                <el-form-item label="邮箱" prop="email">
                                    <el-input v-model="profileForm.email" placeholder="请输入邮箱"></el-input>
                                </el-form-item>
                                <el-form-item label="手机号" prop="phone">
                                    <el-input v-model="profileForm.phone" placeholder="请输入手机号"></el-input>
                                </el-form-item>
                                <el-form-item label="性别">
                                    <el-radio-group v-model="profileForm.gender">
                                        <el-radio label="male">男</el-radio>
                                        <el-radio label="female">女</el-radio>
                                    </el-radio-group>
                                </el-form-item>
                                <el-form-item label="地址">
                                    <el-input v-model="profileForm.address" placeholder="请输入地址"></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="saveProfile" :loading="profileLoading">保存修改</el-button>
                                </el-form-item>
                            </el-form>
                        </div>

                        <!-- 修改密码 -->
                        <div v-show="activeMenu === 'password'" class="panel-content">
                            <h3 class="panel-title">修改密码</h3>
                            <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" label-width="100px" style="max-width: 500px;">
                                <el-form-item label="当前密码" prop="oldPassword">
                                    <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" show-password></el-input>
                                </el-form-item>
                                <el-form-item label="新密码" prop="newPassword">
                                    <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password></el-input>
                                </el-form-item>
                                <el-form-item label="确认密码" prop="confirmPassword">
                                    <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="changePassword" :loading="passwordLoading">修改密码</el-button>
                                </el-form-item>
                            </el-form>
                            <div class="password-tips">
                                <h4>密码要求：</h4>
                                <ul>
                                    <li>密码长度至少6位</li>
                                    <li>建议包含字母和数字</li>
                                    <li>避免使用简单密码如123456</li>
                                </ul>
                            </div>
                        </div>

                        <!-- 安全设置 -->
                        <div v-show="activeMenu === 'security'" class="panel-content">
                            <h3 class="panel-title">安全设置</h3>
                            <div class="security-list">
                                <div class="security-item">
                                    <div class="security-info">
                                        <div class="security-title">登录密码</div>
                                        <div class="security-desc">定期更换密码可以保护账号安全</div>
                                    </div>
                                    <div class="security-action">
                                        <el-button type="text" @click="activeMenu = 'password'">修改</el-button>
                                    </div>
                                </div>
                                <div class="security-item">
                                    <div class="security-info">
                                        <div class="security-title">绑定邮箱</div>
                                        <div class="security-desc">{{ profileForm.email || '未绑定' }}</div>
                                    </div>
                                    <div class="security-action">
                                        <el-tag v-if="profileForm.email" type="success" size="small">已绑定</el-tag>
                                        <el-tag v-else type="info" size="small">未绑定</el-tag>
                                    </div>
                                </div>
                                <div class="security-item">
                                    <div class="security-info">
                                        <div class="security-title">绑定手机</div>
                                        <div class="security-desc">{{ profileForm.phone || '未绑定' }}</div>
                                    </div>
                                    <div class="security-action">
                                        <el-tag v-if="profileForm.phone" type="success" size="small">已绑定</el-tag>
                                        <el-tag v-else type="info" size="small">未绑定</el-tag>
                                    </div>
                                </div>
                                <div class="security-item">
                                    <div class="security-info">
                                        <div class="security-title">账号角色</div>
                                        <div class="security-desc">{{ getRoleLabel(profileForm.role) }}</div>
                                    </div>
                                    <div class="security-action">
                                        <el-tag :type="getRoleType(profileForm.role)" size="small">{{ getRoleLabel(profileForm.role) }}</el-tag>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import { updateUserProfile, changePassword, uploadImage, API_BASE_URL } from '@/utils/api'

export default {
    name: 'AccountSettings',
    data() {
        const validateConfirmPassword = (rule, value, callback) => {
            if (value !== this.passwordForm.newPassword) {
                callback(new Error('两次输入的密码不一致'))
            } else {
                callback()
            }
        }
        return {
            activeMenu: 'profile',
            menuItems: [
                { key: 'profile', label: '基本信息', icon: 'el-icon-user' },
                { key: 'password', label: '修改密码', icon: 'el-icon-lock' },
                { key: 'security', label: '安全设置', icon: 'el-icon-key' }
            ],
            profileForm: {
                username: '',
                realName: '',
                email: '',
                phone: '',
                gender: 'male',
                address: '',
                avatar: '',
                role: 'admin'
            },
            profileRules: {
                realName: [
                    { max: 50, message: '姓名长度不能超过50个字符', trigger: 'blur' }
                ],
                email: [
                    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
                ],
                phone: [
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
                ]
            },
            passwordForm: {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            passwordRules: {
                oldPassword: [
                    { required: true, message: '请输入当前密码', trigger: 'blur' }
                ],
                newPassword: [
                    { required: true, message: '请输入新密码', trigger: 'blur' },
                    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
                ],
                confirmPassword: [
                    { required: true, message: '请再次输入新密码', trigger: 'blur' },
                    { validator: validateConfirmPassword, trigger: 'blur' }
                ]
            },
            profileLoading: false,
            passwordLoading: false
        }
    },
    methods: {
        loadUserInfo() {
            const username = localStorage.getItem('username') || 'admin'
            this.profileForm.username = username
            this.profileForm.realName = '系统管理员'
            this.profileForm.email = 'admin@example.com'
            this.profileForm.phone = '13800138000'
            this.profileForm.role = 'admin'
        },
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
        async handleAvatarUpload(options) {
            try {
                const res = await uploadImage(options.file)
                if (res.data.code === 200) {
                    const url = res.data.data.url
                    this.profileForm.avatar = url.startsWith('http') ? url : `${API_BASE_URL.replace('/api', '')}${url}`
                    this.$message.success('头像上传成功')
                } else {
                    this.$message.error(res.data.message || '头像上传失败')
                }
            } catch (error) {
                console.error('头像上传失败:', error)
                this.$message.error('头像上传失败')
            }
        },
        async saveProfile() {
            try {
                await this.$refs.profileForm.validate()
            } catch {
                return
            }

            this.profileLoading = true
            try {
                const data = {
                    realName: this.profileForm.realName,
                    email: this.profileForm.email,
                    phone: this.profileForm.phone,
                    gender: this.profileForm.gender,
                    address: this.profileForm.address,
                    avatar: this.profileForm.avatar
                }
                const res = await updateUserProfile(data)
                if (res.data.code === 200) {
                    this.$message.success('保存成功')
                } else {
                    this.$message.error(res.data.message || '保存失败')
                }
            } catch (error) {
                console.error('保存失败:', error)
                this.$message.error('保存失败')
            } finally {
                this.profileLoading = false
            }
        },
        async changePassword() {
            try {
                await this.$refs.passwordForm.validate()
            } catch {
                return
            }

            this.passwordLoading = true
            try {
                const data = {
                    oldPassword: this.passwordForm.oldPassword,
                    newPassword: this.passwordForm.newPassword
                }
                const res = await changePassword(data)
                if (res.data.code === 200) {
                    this.$message.success('密码修改成功，请重新登录')
                    this.$refs.passwordForm.resetFields()
                    setTimeout(() => {
                        localStorage.removeItem('username')
                        this.$router.push('/back/login')
                    }, 1500)
                } else {
                    this.$message.error(res.data.message || '密码修改失败')
                }
            } catch (error) {
                console.error('密码修改失败:', error)
                this.$message.error('密码修改失败')
            } finally {
                this.passwordLoading = false
            }
        },
        getRoleLabel(role) {
            const map = {
                admin: '管理员',
                volunteer: '志愿者',
                user: '普通用户'
            }
            return map[role] || role
        },
        getRoleType(role) {
            const map = {
                admin: 'danger',
                volunteer: 'warning',
                user: 'info'
            }
            return map[role] || 'info'
        }
    },
    mounted() {
        this.loadUserInfo()
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
}

.settings-content {
    .settings-menu {
        background: white;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

        .menu-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            color: #4b5563;
            font-size: 14px;

            i {
                font-size: 18px;
            }

            &:hover {
                background: #f3f4f6;
                color: #1f2937;
            }

            &.active {
                background: #ecf5ff;
                color: #409eff;
                font-weight: 500;
            }
        }
    }

    .settings-panel {
        background: white;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        min-height: 500px;

        .panel-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 24px 0;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
        }
    }
}

.avatar-upload {
    .avatar-uploader {
        position: relative;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        overflow: hidden;
        cursor: pointer;
        border: 2px dashed #d9d9d9;
        transition: border-color 0.3s;

        &:hover {
            border-color: #409eff;

            .avatar-hover {
                opacity: 1;
            }
        }

        .avatar {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .avatar-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f7fa;

            i {
                font-size: 36px;
                color: #c0c4cc;
            }
        }

        .avatar-hover {
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
            color: white;

            i {
                font-size: 24px;
                margin-bottom: 4px;
            }

            span {
                font-size: 12px;
            }
        }
    }
}

.password-tips {
    margin-top: 30px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 6px;

    h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #606266;
    }

    ul {
        margin: 0;
        padding-left: 20px;

        li {
            font-size: 13px;
            color: #909399;
            line-height: 1.8;
        }
    }
}

.security-list {
    .security-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
            border-bottom: none;
        }

        .security-info {
            .security-title {
                font-size: 15px;
                font-weight: 500;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .security-desc {
                font-size: 13px;
                color: #6b7280;
            }
        }
    }
}

@media (max-width: 768px) {
    .settings-page {
        padding: 16px;
    }

    .settings-menu {
        margin-bottom: 16px;

        .menu-item {
            padding: 12px;
        }
    }

    .settings-panel {
        padding: 16px;
    }
}
</style>

<template>
    <div class="top-header">
        <div class="header-left">
            <div class="breadcrumb">
                <el-breadcrumb separator-class="el-icon-arrow-right">
                    <el-breadcrumb-item :to="{ path: '/back/dashboard' }">首页</el-breadcrumb-item>
                    <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
                </el-breadcrumb>
            </div>
        </div>

        <div class="header-right">
            <!-- 用户菜单 -->
            <el-dropdown class="user-menu" @command="handleUserCommand" trigger="click">
                <div class="user-info">
                    <img :src="userAvatar" :alt="userName" class="user-avatar">
                    <span class="user-name">{{ userName }}</span>
                    <i class="el-icon-arrow-down"></i>
                </div>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="settings">
                        <i class="el-icon-setting"></i>
                        <span>账号设置</span>
                    </el-dropdown-item>
                    <el-dropdown-divider></el-dropdown-divider>
                    <el-dropdown-item command="logout">
                        <i class="el-icon-switch-button"></i>
                        <span>退出登录</span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TopHeader',
    data() {
        return {
            defaultAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iI2U4ZThlOCIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMTgiIHI9IjgiIGZpbGw9IiNjY2MiLz48cGF0aCBkPSJNOCA0MmMwLTguODM3IDcuMTYzLTE2IDE2LTE2czE2IDcuMTYzIDE2IDE2IiBmaWxsPSIjY2NjIi8+PC9zdmc+'
        }
    },
    computed: {
        // 从localStorage获取用户信息
        userInfo() {
            const userStr = localStorage.getItem('user')
            if (userStr) {
                try {
                    return JSON.parse(userStr)
                } catch (e) {
                    return null
                }
            }
            return null
        },
        userName() {
            return this.userInfo?.username || this.userInfo?.real_name || 'Admin'
        },
        userAvatar() {
            const avatar = this.userInfo?.avatar
            if (avatar && avatar.trim() !== '') {
                return avatar
            }
            return this.defaultAvatar
        },
        currentPageTitle() {
            const routeMeta = {
                '/back/dashboard': '仪表板',
                '/back/animals/list': '动物列表',
                '/back/animals/add': '发布新动物',
                '/back/users/list': '用户列表',
                '/back/users/applications': '领养申请',
                '/back/settings': '账号设置'
            }
            return routeMeta[this.$route.path] || '页面'
        }
    },
    methods: {
        handleUserCommand(command) {
            switch (command) {
                case 'settings':
                    this.$router.push('/back/settings')
                    break
                case 'logout':
                    this.$confirm('确定要退出登录吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        // 清除所有登录相关数据
                        localStorage.removeItem('token')
                        localStorage.removeItem('user')
                        localStorage.removeItem('username')
                        // 调用 store 的 logout 方法清除状态
                        if (this.$store && this.$store.dispatch) {
                            this.$store.dispatch('user/logout')
                        }
                        this.$message.success('已退出登录')
                        // 跳转到指定地址
                        window.location.href = 'http://localhost:8080/'
                    }).catch(() => {})
                    break
            }
        }
    }
}
</script>

<style lang="less" scoped>
.top-header {
    height: 70px;
    background: white;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.header-left {
    flex: 1;

    .breadcrumb {
        ::v-deep .el-breadcrumb__item {
            color: #666;
            font-size: 14px;

            a {
                color: #333;
                text-decoration: none;
                transition: color 0.3s ease;

                &:hover {
                    color: #666;
                }
            }
        }

        ::v-deep .el-breadcrumb__separator {
            color: #ccc;
        }
    }
}

.header-right {
    display: flex;
    align-items: center;
    gap: 25px;
}

.user-menu {
    .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 4px;
        transition: all 0.3s ease;

        &:hover {
            background: #f5f5f5;
        }

        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: block;
        }

        .user-name {
            font-size: 14px;
            color: #333;
            font-weight: 500;
        }

        i {
            font-size: 12px;
            color: #999;
        }
    }

    ::v-deep .el-dropdown-menu {
        .el-dropdown-item {
            display: flex;
            align-items: center;
            gap: 8px;

            i {
                font-size: 14px;
                color: #999;
            }

            span {
                font-size: 14px;
            }

            &:hover {
                i {
                    color: #333;
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .top-header {
        padding: 0 15px;
        gap: 15px;
    }

    .user-name {
        display: none;
    }
}
</style>

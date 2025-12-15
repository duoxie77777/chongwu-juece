<template>
    <div class="sidebar-menu">
        <!-- Logo区域 -->
        <div class="logo-section">
            <h2>动物收养平台</h2>
        </div>

        <!-- 菜单列表 -->
        <el-menu :default-active="activeMenu" :default-openeds="defaultOpeneds" class="menu-container"
            :collapse="isCollapse" :collapse-transition="false" @select="handleMenuSelect" @open="handleMenuOpen"
            @close="handleMenuClose">
            <!-- 数据总览(首页) -->
            <el-menu-item index="/back/statistics/overview">
                <i class="el-icon-s-home"></i>
                <span slot="title">数据总览</span>
            </el-menu-item>

            <!-- 动物管理 -->
            <el-submenu index="animals-sub">
                <template slot="title">
                    <i class="el-icon-menu"></i>
                    <span>动物管理</span>
                </template>
                <el-menu-item index="/back/animals/list">
                    <i class="el-icon-document-copy"></i>
                    <span>动物列表</span>
                </el-menu-item>
                <el-menu-item index="/back/animals/add">
                    <i class="el-icon-circle-plus"></i>
                    <span>发布新动物</span>
                </el-menu-item>
                <el-menu-item index="/back/animals/categories">
                    <i class="el-icon-collection-tag"></i>
                    <span>分类管理</span>
                </el-menu-item>
            </el-submenu>

            <!-- 用户管理 -->
            <el-submenu index="users-sub">
                <template slot="title">
                    <i class="el-icon-user"></i>
                    <span>用户管理</span>
                </template>
                <el-menu-item index="/back/users/list">
                    <i class="el-icon-document-copy"></i>
                    <span>用户列表</span>
                </el-menu-item>
                <el-menu-item index="/back/users/applications">
                    <i class="el-icon-s-order"></i>
                    <span>领养申请</span>
                </el-menu-item>
                <el-menu-item v-if="isAdmin" index="/back/users/volunteers">
                    <i class="el-icon-s-custom"></i>
                    <span>志愿者</span>
                </el-menu-item>
                <el-menu-item v-if="isAdmin" index="/back/users/volunteer-applications">
                    <i class="el-icon-s-check"></i>
                    <span>志愿者申请</span>
                </el-menu-item>
            </el-submenu>

            <!-- 内容管理 -->
            <el-submenu index="content-sub">
                <template slot="title">
                    <i class="el-icon-document"></i>
                    <span>内容管理</span>
                </template>
                <el-menu-item index="/back/content/stories">
                    <i class="el-icon-reading"></i>
                    <span>领养故事</span>
                </el-menu-item>

                <el-menu-item index="/back/content/faq">
                    <i class="el-icon-question"></i>
                    <span>常见问题</span>
                </el-menu-item>
                <el-menu-item index="/back/content/comments">
                    <i class="el-icon-chat-line-square"></i>
                    <span>故事评论</span>
                </el-menu-item>
            </el-submenu>

            <!-- 商城管理 -->
            <el-submenu index="mall-sub">
                <template slot="title">
                    <i class="el-icon-shopping-cart-2"></i>
                    <span>商城管理</span>
                </template>
                <el-menu-item index="/back/mall/categories">
                    <i class="el-icon-collection-tag"></i>
                    <span>商品分类</span>
                </el-menu-item>
                <el-menu-item index="/back/mall/products">
                    <i class="el-icon-goods"></i>
                    <span>商品管理</span>
                </el-menu-item>
                <el-menu-item index="/back/mall/orders">
                    <i class="el-icon-s-order"></i>
                    <span>订单管理</span>
                </el-menu-item>
            </el-submenu>

            <!-- 数据统计 -->
            <el-submenu index="statistics-sub">
                <template slot="title">
                    <i class="el-icon-data-analysis"></i>
                    <span>数据统计</span>
                </template>
                <el-menu-item index="/back/statistics/reports">
                    <i class="el-icon-document-copy"></i>
                    <span>生成报告</span>
                </el-menu-item>
            </el-submenu>
        </el-menu>

        <!-- 折叠按钮 -->
        <!-- <div class="collapse-btn" @click="toggleCollapse">
            <i :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
        </div> -->
    </div>
</template>

<script>
export default {
    name: 'SidebarMenu',
    data() {
        return {
            isCollapse: false,
            activeMenu: '/back/statistics/overview',
            defaultOpeneds: []
        }
    },
    computed: {
        // 获取当前用户角色
        currentUserRole() {
            const userInfo = localStorage.getItem('adminInfo')
            if (userInfo) {
                try {
                    const user = JSON.parse(userInfo)
                    return user.role || 'user'
                } catch (e) {
                    return 'user'
                }
            }
            return 'user'
        },
        // 是否是管理员
        isAdmin() {
            return this.currentUserRole === 'admin'
        }
    },
    watch: {
        $route(to) {
            this.activeMenu = to.path
            // 只更新 defaultOpeneds 如果需要展开/关闭菜单
            this.updateDefaultOpenedsIfNeeded(to.path)
        }
    },
    methods: {
        handleMenuSelect(index) {
            // 只有当 index 是有效的路由路径时才跳转
            if (index.startsWith('/')) {
                this.$router.push(index).catch(err => {
                    // 忽略重复导航错误
                    if (err.name !== 'NavigationDuplicated') {
                        console.error(err)
                    }
                })
            }
        },
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        },
        handleMenuOpen(index) {
            // 记录打开的菜单
            if (!this.defaultOpeneds.includes(index)) {
                this.defaultOpeneds.push(index)
            }
        },
        handleMenuClose(index) {
            // 记录关闭的菜单
            const idx = this.defaultOpeneds.indexOf(index)
            if (idx > -1) {
                this.defaultOpeneds.splice(idx, 1)
            }
        },
        getMenuForPath(path) {
            // 根据路由路径返回应该打开的菜单
            if (path.startsWith('/back/animals')) {
                return 'animals-sub'
            } else if (path.startsWith('/back/users')) {
                return 'users-sub'
            } else if (path.startsWith('/back/content')) {
                return 'content-sub'
            } else if (path.startsWith('/back/mall')) {
                return 'mall-sub'
            } else if (path.startsWith('/back/statistics/reports')) {
                return 'statistics-sub'
            }
            return null
        },
        updateDefaultOpenedsIfNeeded(path) {
            // 只在必要时更新 defaultOpeneds，避免不必要的菜单闪烁
            const targetMenu = this.getMenuForPath(path)
            if (targetMenu) {
                if (!this.defaultOpeneds.includes(targetMenu)) {
                    this.defaultOpeneds = [targetMenu]
                }
            } else if (this.defaultOpeneds.length > 0) {
                this.defaultOpeneds = []
            }
        },
        updateDefaultOpeneds(path) {
            // 保留此方法用于 mounted，保持向后兼容
            const targetMenu = this.getMenuForPath(path)
            if (targetMenu) {
                this.defaultOpeneds = [targetMenu]
            } else {
                this.defaultOpeneds = []
            }
        }
    },
    mounted() {
        this.activeMenu = this.$route.path
        this.updateDefaultOpeneds(this.$route.path)
    }
}
</script>

<style lang="less" scoped>
.sidebar-menu {
    width: 250px;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e8e8e8;
    position: relative;
    transition: width 0.3s ease;

    &.collapsed {
        width: 64px;
    }
}

.logo-section {
    padding: 0px 20px;
    height: 70px;
    text-align: center;
    border-bottom: 1px solid #e8e8e8;
    color: #333;
    cursor: pointer;
    transition: all 0.3s ease;
    align-items: center;
    display: flex;
    justify-content: center;
    &:hover {
        background: #f0f0f0;
    }

    .logo {
        font-size: 46px;
        margin-bottom: 10px;
    }

    h2 {
        font-size: 26px;
        margin: 0;
        font-weight: 600;
        color: #333;
    }
}

.menu-container {
    flex: 1;
    background: transparent;
    border: none;
    overflow-y: auto;
    padding: 20px 0;

    ::v-deep .el-menu {
        background: transparent;
        border: none;
    }

    ::v-deep .el-menu-item,
    ::v-deep .el-submenu__title {
        background: transparent !important;
        color: #666;
        border: none;
        height: 50px;
        line-height: 50px;
        transition: all 0.3s ease;
        font-size: 14px;

        i {
            margin-right: 10px;
            font-size: 16px;
        }

        &:hover {
            background: #eeeeee !important;
            color: #333;
        }
    }

    ::v-deep .el-menu-item.is-active {
        background: #e8e8e8 !important;
        color: #333;
        border-left: 3px solid #333;
        padding-left: 17px;
    }

    ::v-deep .el-submenu__title.is-active {
        background: #eeeeee !important;
        color: #333;
    }

    ::v-deep .el-submenu__title::before {
        display: none;
    }

    ::v-deep .el-menu--collapse .el-submenu__title {
        text-align: center;
    }

    ::v-deep .popper-border-arrow {
        display: none;
    }

    ::v-deep .el-menu--inline {
        background: #f0f0f0;
        border: none;

        .el-menu-item {
            padding-left: 50px;

            &.is-active {
                background: #dcdcdc !important;
                color: #333;
                border-left: 3px solid #333;
                padding-left: 47px;
            }
        }
    }
}

.collapse-btn {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    background: #e8e8e8;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 18px;
    border: 1px solid #d8d8d8;

    &:hover {
        background: #d8d8d8;
        color: #333;
    }

    i {
        line-height: 1;
    }
}

.sidebar-menu::-webkit-scrollbar {
    width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
    background: #f8f9fa;
}

.sidebar-menu::-webkit-scrollbar-thumb {
    background: #d0d0d0;
    border-radius: 3px;

    &:hover {
        background: #b0b0b0;
    }
}

@media (max-width: 768px) {
    .sidebar-menu {
        width: 200px;

        .logo-section {
            padding: 20px 15px;

            h2 {
                font-size: 14px;
            }

            .logo {
                font-size: 28px;
                margin-bottom: 8px;
            }
        }
    }
}
</style>

<template>
    <div class="header-container">
        <!-- Logo 区域 -->
        <div class="logo-section">
            <img src="@/assets/logo.png" alt="动物收养中心" class="logo-img" />
            <span class="logo-text">流浪动物收养中心</span>
        </div>

        <!-- 导航菜单 -->
        <el-menu :default-active="activeIndex" class="nav-menu" mode="horizontal" @select="handleSelect"
            background-color="#ffffff" text-color="#333333" active-text-color="#D52B1E" :router="true">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/adoption/list">待收养动物</el-menu-item>
            <el-submenu index="services">
                <template slot="title">服务指南</template>
                <el-menu-item index="/knowledge/care">领养故事</el-menu-item>
                <el-menu-item index="/help/faq">常见问题</el-menu-item>
            </el-submenu>
            <el-submenu index="volunteer">
                <template slot="title">志愿者</template>
                <el-menu-item index="/volunteer/volunteer">志愿者介绍</el-menu-item>
                <el-menu-item index="/volunteer/apply">申请成为志愿者</el-menu-item>
            </el-submenu>
            <el-menu-item index="/donate">捐赠</el-menu-item>
            <el-menu-item index="/mall/shop">商城</el-menu-item>
            <el-menu-item index="/about/about">关于我们</el-menu-item>
            <el-menu-item index="/help/contact">联系我们</el-menu-item>
        </el-menu>

        <!-- 用户操作区域 -->
        <div>
            <div class="user-actions" v-if="!isAuthenticated">
                <el-button class="volunteer-btn" size="small" @click="goToVolunteer">志愿者入口</el-button>
                <el-button class="login-btn" size="small" @click="showLoginDialog">登录</el-button>
                <el-button class="register-btn" size="small" @click="goToRegister">注册</el-button>
            </div>

            <!-- 已登录用户区域 -->
            <div class="user-actions" v-else>
                <el-badge class="cart-badge">
                    <el-button class="cart-btn" size="small" icon="el-icon-shopping-cart-1"
                        @click="goToCart">购物车</el-button>
                </el-badge>
                <el-dropdown class="user-dropdown" @command="handleUserCommand">
                    <span class="user-info">
                        <el-avatar size="small" class="user-avatar">
                            {{ userName.charAt(0).toUpperCase() }}
                        </el-avatar>
                        <span class="user-name">{{ userName }}</span>
                        <i class="el-icon-arrow-down"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                        <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                        <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>

        <!-- 登录Dialog -->
        <el-dialog :append-to-body="true" class="login-dialog-wrapper" :visible.sync="loginDialogVisible" width="460px"
            :close-on-click-modal="false" :show-close="true" @close="resetLoginForm">
            <div class="login-dialog-content">
                <!-- 对话框头部 -->
                <div class="dialog-header">
                    <h2 class="dialog-title">用户登录</h2>
                    <p class="dialog-subtitle">欢迎回到流浪动物收养中心</p>
                </div>

                <!-- 表单 -->
                <el-form ref="loginForm" :model="loginForm" @keyup.enter.native="handleLogin">
                    <el-form-item class="form-item-custom">
                        <el-input v-model="loginForm.username" placeholder="邮箱/用户名" prefix-icon="el-icon-user">
                        </el-input>
                    </el-form-item>
                    <el-form-item class="form-item-custom">
                        <el-input v-model="loginForm.password" type="password" placeholder="密码"
                            prefix-icon="el-icon-lock">
                        </el-input>
                    </el-form-item>
                    <el-form-item class="form-item-check">
                        <div class="check-wrapper">
                            <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
                            <!-- <span class="forgot-password" @click="goToForgotPassword">忘记密码？</span> -->
                        </div>
                    </el-form-item>
                </el-form>

                <!-- 登录按钮 -->
                <el-button class="login-button" @click="handleLogin" :loading="loginLoading" type="primary">
                    登 录
                </el-button>

                <!-- 注册链接 -->
                <div class="register-link">
                    <span>还没有账号？</span>
                    <span class="register-text" @click="showRegisterDialog">立即注册</span>
                </div>
            </div>
        </el-dialog>

        <!-- 注册Dialog -->
        <el-dialog :append-to-body="true" class="login-dialog-wrapper" :visible.sync="registerDialogVisible"
            width="460px" :close-on-click-modal="false" :show-close="true" @close="resetRegisterForm">
            <div class="login-dialog-content">
                <!-- 对话框头部 -->
                <div class="dialog-header">
                    <h2 class="dialog-title">创建账号</h2>
                    <p class="dialog-subtitle">加入我们的流浪动物收养中心</p>
                </div>

                <!-- 表单 -->
                <el-form ref="registerForm" :model="registerForm" @keyup.enter.native="handleRegister">
                    <el-form-item class="form-item-custom">
                        <el-input v-model="registerForm.username" placeholder="用户名" prefix-icon="el-icon-user">
                        </el-input>
                    </el-form-item>
                    <el-form-item class="form-item-custom">
                        <el-input v-model="registerForm.email" placeholder="邮箱" prefix-icon="el-icon-message">
                        </el-input>
                    </el-form-item>
                    <el-form-item class="form-item-custom">
                        <el-input v-model="registerForm.password" type="password" placeholder="密码"
                            prefix-icon="el-icon-lock">
                        </el-input>
                    </el-form-item>
                    <el-form-item class="form-item-custom">
                        <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码"
                            prefix-icon="el-icon-lock">
                        </el-input>
                    </el-form-item>
                    <el-form-item class="form-item-check">
                        <div class="check-wrapper">
                            <el-checkbox v-model="registerForm.agreeTerms">我同意用户协议</el-checkbox>
                        </div>
                    </el-form-item>
                </el-form>

                <!-- 注册按钮 -->
                <el-button class="login-button" @click="handleRegister" :loading="registerLoading" type="primary">
                    注 册
                </el-button>

                <!-- 登录链接 -->
                <div class="register-link">
                    <span>已有账号？</span>
                    <span class="register-text" @click="switchToLogin">立即登录</span>
                </div>
            </div>
        </el-dialog>

        <!-- 忘记密码Dialog -->
        <el-dialog :append-to-body="true" class="login-dialog-wrapper" :visible.sync="forgetPasswordDialogVisible"
            width="460px" :close-on-click-modal="false" :show-close="true" @close="resetForgetPasswordForm">
            <div class="login-dialog-content">
                <!-- 对话框头部 -->
                <div class="dialog-header">
                    <h2 class="dialog-title">重置密码</h2>
                    <p class="dialog-subtitle">请输入您的邮箱地址以重置密码</p>
                </div>

                <!-- 表单 -->
                <el-form ref="forgetPasswordForm" :model="forgetPasswordForm"
                    @keyup.enter.native="handleForgetPassword">
                    <el-form-item class="form-item-custom">
                        <el-input v-model="forgetPasswordForm.email" placeholder="请输入注册邮箱"
                            prefix-icon="el-icon-message">
                        </el-input>
                    </el-form-item>
                    <el-form-item v-if="forgetPasswordForm.step === 2" class="form-item-custom">
                        <el-input v-model="forgetPasswordForm.verifyCode" placeholder="请输入验证码"
                            prefix-icon="el-icon-document">
                        </el-input>
                    </el-form-item>
                    <el-form-item v-if="forgetPasswordForm.step === 2" class="form-item-custom">
                        <el-input v-model="forgetPasswordForm.newPassword" type="password" placeholder="新密码"
                            prefix-icon="el-icon-lock">
                        </el-input>
                    </el-form-item>
                    <el-form-item v-if="forgetPasswordForm.step === 2" class="form-item-custom">
                        <el-input v-model="forgetPasswordForm.confirmNewPassword" type="password" placeholder="确认新密码"
                            prefix-icon="el-icon-lock">
                        </el-input>
                    </el-form-item>
                </el-form>

                <!-- 按钮 -->
                <el-button class="login-button" @click="handleForgetPassword" :loading="forgetPasswordLoading"
                    type="primary">
                    {{ forgetPasswordForm.step === 1 ? '获取验证码' : '重置密码' }}
                </el-button>

                <!-- 返回登录链接 -->
                <div class="register-link">
                    <span class="register-text" @click="switchToLoginFromForget">返回登录</span>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { login, register, sendVerificationCode, resetPassword } from '@/utils/api'

export default {
    name: "frontHeader",
    data() {
        return {
            activeIndex: '/',
            cartCount: 0,
            loginDialogVisible: false,
            loginLoading: false,
            loginForm: {
                username: '',
                password: '',
                rememberMe: false
            },
            registerDialogVisible: false,
            registerLoading: false,
            registerForm: {
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                agreeTerms: false
            },
            forgetPasswordDialogVisible: false,
            forgetPasswordLoading: false,
            forgetPasswordForm: {
                email: '',
                verifyCode: '',
                newPassword: '',
                confirmNewPassword: '',
                step: 1
            }
        }
    },
    computed: {
        isAuthenticated() {
            return this.$store.state.user.isAuthenticated;
        },
        userName() {
            return this.$store.getters['user/userName'];
        }
    },
    mounted() {
        this.updateActiveIndex();
        this.updateCartCount();
        // 监听购物车变化
        window.addEventListener('storage', this.updateCartCount);
        // 监听显示登录对话框事件
        this.$root.$on('show-login-dialog', this.showLoginDialog);
    },
    watch: {
        // 监听路由变化，自动更新激活的菜单项
        '$route'() {
            this.updateActiveIndex();
        }
    },
    beforeDestroy() {
        window.removeEventListener('storage', this.updateCartCount);
        // 移除事件监听
        this.$root.$off('show-login-dialog', this.showLoginDialog);
    },
    methods: {
        // 根据当前路由更新激活的菜单项
        updateActiveIndex() {
            const path = this.$route.path;
            
            // 直接匹配的路由
            if (path === '/' || 
                path === '/adoption/list' || 
                path === '/donate' || 
                path === '/mall/shop' || 
                path === '/about/about' || 
                path === '/help/contact') {
                this.activeIndex = path;
                return;
            }
            
            // 子菜单项的路由
            if (path.startsWith('/knowledge/care') || 
                path.startsWith('/help/faq')) {
                this.activeIndex = 'services';
                return;
            }
            
            if (path.startsWith('/volunteer/volunteer') || 
                path.startsWith('/volunteer/apply')) {
                this.activeIndex = 'volunteer';
                return;
            }
            
            // 其他路由，尝试匹配父路径
            if (path.startsWith('/adoption/')) {
                this.activeIndex = '/adoption/list';
            } else if (path.startsWith('/knowledge/')) {
                this.activeIndex = 'services';
            } else if (path.startsWith('/help/')) {
                if (path === '/help/contact') {
                    this.activeIndex = '/help/contact';
                } else {
                    this.activeIndex = 'services';
                }
            } else if (path.startsWith('/volunteer/')) {
                this.activeIndex = 'volunteer';
            } else if (path.startsWith('/mall/')) {
                this.activeIndex = '/mall/shop';
            } else {
                // 默认激活首页
                this.activeIndex = '/';
            }
        },
        updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('petShopCart')) || [];
            this.cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        },
        handleSelect(key) {
            this.activeIndex = key;
            console.log('选中的菜单项:', key);
        },
        showLoginDialog() {
            this.loginDialogVisible = true;
        },
        async handleLogin() {
            if (!this.loginForm.username || !this.loginForm.password) {
                this.$message.error('请输入用户名和密码');
                return;
            }

            this.loginLoading = true;
            try {
                const response = await login({
                    username: this.loginForm.username,
                    password: this.loginForm.password
                });

                // 存储 token
                if (response.data.data && response.data.data.token) {
                    localStorage.setItem('token', response.data.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.data.user));

                    this.$store.dispatch('user/setToken', response.data.data.token);
                    this.$store.dispatch('user/setUserInfo', response.data.data.user);
                    this.$store.dispatch('user/setAuthenticated', true);
                }

                this.$message.success('登录成功');
                this.loginDialogVisible = false;
                this.resetLoginForm();

                // 刷新页面或导航到首页
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } catch (error) {
                this.$message.error(error.data?.message || error.message || '登录失败');
            } finally {
                this.loginLoading = false;
            }
        },
        resetLoginForm() {
            this.loginForm = {
                username: '',
                password: '',
                rememberMe: false
            };
            if (this.$refs.loginForm) {
                this.$refs.loginForm.clearValidate();
            }
        },
        goToForgotPassword() {
            this.loginDialogVisible = false;
            this.forgetPasswordDialogVisible = true;
        },
        showRegisterDialog() {
            this.loginDialogVisible = false;
            this.registerDialogVisible = true;
        },
        handleRegister() {
            if (!this.registerForm.username || !this.registerForm.email || !this.registerForm.password || !this.registerForm.confirmPassword) {
                this.$message.error('请填写所有必填项');
                return;
            }

            if (this.registerForm.password !== this.registerForm.confirmPassword) {
                this.$message.error('两次输入的密码不一致');
                return;
            }

            if (!this.registerForm.agreeTerms) {
                this.$message.error('请同意用户协议');
                return;
            }

            this.registerLoading = true;

            register({
                username: this.registerForm.username,
                email: this.registerForm.email,
                password: this.registerForm.password,
                confirmPassword: this.registerForm.confirmPassword
            }).then(() => {
                this.$message.success('注册成功，请登录');
                this.registerDialogVisible = false;
                this.resetRegisterForm();
                this.switchToLogin();
            }).catch(error => {
                this.$message.error(error.data?.message || error.message || '注册失败');
            }).finally(() => {
                this.registerLoading = false;
            });
        },
        resetRegisterForm() {
            this.registerForm = {
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                agreeTerms: false
            };
            if (this.$refs.registerForm) {
                this.$refs.registerForm.clearValidate();
            }
        },
        switchToLogin() {
            this.registerDialogVisible = false;
            this.loginDialogVisible = true;
        },
        goToRegister() {
            this.showRegisterDialog();
        },
        handleForgetPassword() {
            if (this.forgetPasswordForm.step === 1) {
                // 第一步：验证邮箱并获取验证码
                if (!this.forgetPasswordForm.email) {
                    this.$message.error('请输入邮箱地址');
                    return;
                }

                this.forgetPasswordLoading = true;

                sendVerificationCode({
                    email: this.forgetPasswordForm.email
                }).then(() => {
                    this.$message.success('验证码已发送到您的邮箱');
                    this.forgetPasswordForm.step = 2;
                }).catch(error => {
                    this.$message.error(error.data?.message || error.message || '发送验证码失败');
                }).finally(() => {
                    this.forgetPasswordLoading = false;
                });
            } else {
                // 第二步：重置密码
                if (!this.forgetPasswordForm.verifyCode || !this.forgetPasswordForm.newPassword || !this.forgetPasswordForm.confirmNewPassword) {
                    this.$message.error('请填写所有必填项');
                    return;
                }

                if (this.forgetPasswordForm.newPassword !== this.forgetPasswordForm.confirmNewPassword) {
                    this.$message.error('两次输入的密码不一致');
                    return;
                }

                this.forgetPasswordLoading = true;

                resetPassword({
                    email: this.forgetPasswordForm.email,
                    code: this.forgetPasswordForm.verifyCode,
                    newPassword: this.forgetPasswordForm.newPassword
                }).then(() => {
                    this.$message.success('密码重置成功，请登录');
                    this.forgetPasswordDialogVisible = false;
                    this.resetForgetPasswordForm();
                    this.loginDialogVisible = true;
                }).catch(error => {
                    this.$message.error(error.data?.message || error.message || '重置密码失败');
                }).finally(() => {
                    this.forgetPasswordLoading = false;
                });
            }
        },
        resetForgetPasswordForm() {
            this.forgetPasswordForm = {
                email: '',
                verifyCode: '',
                newPassword: '',
                confirmNewPassword: '',
                step: 1
            };
            if (this.$refs.forgetPasswordForm) {
                this.$refs.forgetPasswordForm.clearValidate();
            }
        },
        switchToLoginFromForget() {
            this.forgetPasswordDialogVisible = false;
            this.resetForgetPasswordForm();
            this.loginDialogVisible = true;
        },
        goToVolunteer() {
            // 检查当前是否已经在志愿者页面，避免重复导航
            if (this.$route.path !== '/volunteer/volunteer') {
                this.$router.push('/volunteer/volunteer');
            }
        },
        goToCart() {
            // 检查当前是否已经在购物车页面，避免重复导航
            if (this.$route.path !== '/mall/cart') {
                this.$router.push('/mall/cart');
            }
        },
        handleUserCommand(command) {
            switch (command) {
                case 'profile':
                    // 检查当前是否已经在个人中心页面，避免重复导航
                    if (this.$route.path !== '/user/profile') {
                        this.$router.push('/user/profile');
                    }
                    break;
                case 'orders':
                    // 检查当前是否已经在订单页面，避免重复导航
                    if (this.$route.path !== '/user/orders') {
                        this.$router.push('/user/orders');
                    }
                    break;
                case 'volunteer':
                    // 检查当前是否已经在志愿者中心页面，避免重复导航
                    if (this.$route.path !== '/volunteer/center') {
                        this.$router.push('/volunteer/center');
                    }
                    break;
                case 'logout':
                    this.handleLogout();
                    break;
            }
        },
        handleLogout() {
            this.$store.dispatch('user/logout');
            this.$message.success('已退出登录');
            // 刷新页面
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }
}
</script>

<style scoped lang="less">
.header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 60px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
    border-bottom: 1px solid #e6e6e6;
    position: sticky;
    top: 0;
    z-index: 999;

    .logo-section {
        display: flex;
        align-items: center;

        .logo-img {
            height: 40px;
            margin-right: 10px;
        }

        .logo-text {
            font-size: 20px;
            font-weight: bold;
            color: #D52B1E;
        }
    }

    .nav-menu {
        flex: 1;
        margin: 0 20px;
        border-bottom: none;

        /deep/ .el-menu-item,
        /deep/ .el-submenu .el-submenu__title {
            height: 60px;
            line-height: 60px;
            font-weight: 500;

            &:hover {
                background-color: rgba(213, 43, 30, 0.04) !important;
            }
        }

        /deep/ .el-menu-item.is-active {
            border-bottom: 3px solid #D52B1E;
            font-weight: bold;
            color: #D52B1E !important;
        }
    }

    .user-actions {
        display: flex;
        gap: 10px;
        align-items: center;

        .cart-badge {
            /deep/ .el-badge__content {
                background-color: #D52B1E;
                border-radius: 50%;
                padding: 0 4px;
                font-size: 11px;
            }
        }

        .cart-btn {
            color: #D52B1E;
            border-color: #D52B1E;
            background: transparent;
            transition: all 0.3s ease;

            &:hover {
                background-color: rgba(213, 43, 30, 0.1);
                border-color: #D52B1E;
                color: #D52B1E;
            }
        }

        .volunteer-btn {
            color: #D52B1E;
            border-color: #D52B1E;
            background: transparent;
            transition: all 0.3s ease;

            &:hover {
                background-color: rgba(213, 43, 30, 0.1);
                border-color: #D52B1E;
                color: #D52B1E;
            }
        }

        .login-btn {
            background-color: #D52B1E;
            border-color: #D52B1E;
            color: white;
            transition: all 0.3s ease;

            &:hover {
                background-color: #c21d0f;
                border-color: #c21d0f;
                box-shadow: 0 2px 8px rgba(213, 43, 30, 0.3);
            }
        }

        .register-btn {
            background-color: transparent;
            border-color: #909399;
            color: #909399;
            transition: all 0.3s ease;

            &:hover {
                background-color: #f5f7fa;
                border-color: #606266;
                color: #606266;
            }
        }

        /* 已登录用户样式 */
        .user-dropdown {
            cursor: pointer;
            margin-left: 15px;

            .user-info {
                display: flex;
                align-items: center;
                padding: 5px 10px;
                border-radius: 20px;
                transition: all 0.3s ease;

                &:hover {
                    background-color: rgba(213, 43, 30, 0.1);
                }

                .user-avatar {
                    margin-right: 8px;
                    background-color: #D52B1E;
                    color: white;
                    font-weight: bold;
                }

                .user-name {
                    font-size: 14px;
                    color: #333;
                    margin-right: 5px;
                    max-width: 120px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .el-icon-arrow-down {
                    color: #666;
                    font-size: 12px;
                }
            }
        }
    }
}

.forgot-password {
    color: #D52B1E;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        text-decoration: underline;
    }
}

.dialog-footer {
    text-align: right;
}

/* 登录Dialog美化样式 */
.login-dialog-wrapper {

    /deep/ .el-dialog {
        border-radius: 12px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
        overflow: hidden;
    }

    /deep/ .el-dialog__header {
        border-bottom: none;
        padding: 0;
        background: linear-gradient(135deg, #D52B1E 0%, #e85541 100%);
    }

    /deep/ .el-dialog__close {
        top: 15px;
        right: 15px;
        font-size: 24px;
    }

    /deep/ .el-dialog__body {
        padding: 40px;
        background-color: #ffffff;
    }
}

.login-dialog-content {
    width: 100%;

    .dialog-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;

        .dialog-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            padding-top: 20px;
        }

        .dialog-subtitle {
            font-size: 13px;
            margin: 8px 0 0 0;
            padding-bottom: 20px;
        }
    }

    .form-item-custom {
        margin-bottom: 20px;

        /deep/ .el-input__prefix {
            color: #D52B1E;
        }

        /deep/ .el-input {
            .el-input__inner {
                border: 1px solid #e6e6e6;
                border-radius: 6px;
                padding-left: 35px;
                height: 44px;
                font-size: 14px;
                transition: all 0.3s ease;

                &:focus,
                &:hover {
                    border-color: #D52B1E;
                    box-shadow: 0 0 0 2px rgba(213, 43, 30, 0.1);
                }
            }
        }
    }

    .form-item-check {
        margin-bottom: 25px;

        .check-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: center;

            /deep/ .el-checkbox__inner {
                border-color: #D52B1E;
                background-color: white;

                &:hover {
                    border-color: #D52B1E;
                }
            }

            /deep/ .el-checkbox__input.is-checked .el-checkbox__inner {
                background-color: #D52B1E;
                border-color: #D52B1E;
            }

            .forgot-password {
                color: #D52B1E;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.3s ease;

                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }

    .login-button {
        width: 100%;
        height: 44px;
        border: none;
        border-radius: 6px;
        background: linear-gradient(135deg, #D52B1E 0%, #e85541 100%);
        color: white;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        letter-spacing: 2px;

        &:hover:not(:disabled) {
            box-shadow: 0 8px 20px rgba(213, 43, 30, 0.3);
            transform: translateY(-2px);
        }

        &:active:not(:disabled) {
            transform: translateY(0);
        }

        /deep/ .el-button__text {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .register-link {
        text-align: center;
        margin-top: 20px;
        font-size: 13px;
        color: #666;

        .register-text {
            color: #D52B1E;
            cursor: pointer;
            font-weight: bold;
            margin-left: 5px;
            transition: all 0.3s ease;

            &:hover {
                text-decoration: underline;
                color: #c21d0f;
            }
        }
    }
}
</style>
<template>
    <div class="login-page">
        <div class="login-box">
            <div class="login-form-container">
                <h2 class="login-title">后台登录</h2>
                
                <el-form
                    ref="loginFormRef"
                    :model="form"
                    :rules="rules"
                    @submit.native.prevent
                >
                    <!-- 用户名 -->
                    <el-form-item prop="username">
                        <el-input
                            v-model="form.username"
                            placeholder="用户名"
                            prefix-icon="el-icon-user"
                            @keyup.enter="handleLogin"
                        />
                    </el-form-item>

                    <!-- 密码 -->
                    <el-form-item prop="password">
                        <el-input
                            v-model="form.password"
                            type="password"
                            placeholder="密码"
                            prefix-icon="el-icon-lock"
                            show-password
                            @keyup.enter="handleLogin"
                        />
                    </el-form-item>

                    <!-- 记住我 -->
                    <div class="form-options">
                        <el-checkbox v-model="form.rememberMe">记住我</el-checkbox>
                    </div>

                    <!-- 登录按钮 -->
                    <el-button
                        type="primary"
                        class="login-btn"
                        @click="handleLogin"
                        :loading="isLoading"
                        block
                    >
                        登 录
                    </el-button>
                </el-form>

                <!-- 提示信息 -->
                <div class="login-tips">
                    <p>测试账号：admin</p>
                    <p>测试密码：123456</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { login } from '@/utils/api'

export default {
    name: 'LoginPage',
    data() {
        const validateUsername = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入用户名'));
            } else {
                callback();
            }
        };

        const validatePassword = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入密码'));
            } else if (value.length < 6) {
                callback(new Error('密码至少6个字符'));
            } else {
                callback();
            }
        };

        return {
            form: {
                username: '',
                password: '',
                rememberMe: false
            },
            isLoading: false,
            rules: {
                username: [
                    { validator: validateUsername, trigger: 'blur' }
                ],
                password: [
                    { validator: validatePassword, trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        async handleLogin() {
            this.$refs.loginFormRef.validate(async (valid) => {
                if (!valid) {
                    return;
                }

                this.isLoading = true;

                try {
                    const response = await login({
                        username: this.form.username,
                        password: this.form.password
                    });

                    if (response.data && response.data.code === 200) {
                        const { token, user } = response.data.data;

                        // 检查用户角色，只有 admin 和 volunteer 可以登录后台
                        if (user.role !== 'admin' && user.role !== 'volunteer') {
                            this.$message.error('您没有权限访问后台系统');
                            this.form.password = '';
                            this.isLoading = false;
                            return;
                        }

                        // 保存 token 和用户信息
                        localStorage.setItem('token', token);
                        localStorage.setItem('user', JSON.stringify(user));

                        // 保存到 Vuex store
                        if (this.$store && this.$store.dispatch) {
                            this.$store.dispatch('user/setUser', user);
                            this.$store.dispatch('user/setToken', token);
                        }

                        // 保存登录信息
                        if (this.form.rememberMe) {
                            localStorage.setItem('username', this.form.username);
                        } else {
                            localStorage.removeItem('username');
                        }

                        this.$message.success('登录成功，正在跳转...');

                        // 跳转到后台首页
                        setTimeout(() => {
                            this.$router.push('/back/statistics/overview');
                        }, 500);
                    } else {
                        this.$message.error(response.data?.message || '登录失败');
                        this.form.password = '';
                    }
                } catch (error) {
                    console.error('登录失败:', error);
                    this.$message.error(error.data?.message || error.message || '登录失败，请重试');
                    this.form.password = '';
                } finally {
                    this.isLoading = false;
                }
            });
        }
    },
    mounted() {
        // 检查是否已登录
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                // 检查用户角色
                if (user.role === 'admin' || user.role === 'volunteer') {
                    // 已登录且角色正确，直接跳转
                    this.$router.push('/back/statistics/overview');
                    return;
                }
            } catch (e) {
                console.error('解析用户信息失败:', e);
            }
        }

        // 检查是否有保存的用户名
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            this.form.username = savedUsername;
            this.form.rememberMe = true;
        }
    }
}
</script>

<style lang="less" scoped>
.login-page {
    width: 100%;
    height: 100vh;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-box {
    width: 100%;
    max-width: 400px;
    padding: 0 20px;
}

.login-form-container {
    background: white;
    padding: 40px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .login-title {
        text-align: center;
        font-size: 24px;
        margin-bottom: 30px;
        color: #333;
        font-weight: bold;
    }

    ::v-deep .el-form-item {
        margin-bottom: 22px;
    }

    .form-options {
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .login-btn {
        width: 100%;
        height: 40px;
        font-size: 16px;
        margin-top: 10px;
    }

    .login-tips {
        margin-top: 20px;
        padding: 15px;
        background: #fafafa;
        border-radius: 4px;
        border: 1px solid #f0f0f0;
        text-align: center;

        p {
            font-size: 12px;
            color: #999;
            margin: 5px 0;
        }
    }
}
</style>


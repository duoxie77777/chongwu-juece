<template>
    <footer class="footer-container">
        <div class="footer-content">
            <!-- 公司信息 -->
            <div class="footer-section">
                <div class="section-title">
                    <img src="@/assets/logo.png" alt="动物收养中心" class="footer-logo" />
                    <span>流浪动物收养中心</span>
                </div>
                <p class="section-description">
                    致力于救助流浪动物，为它们提供安全的避难所，帮助它们找到温暖的家。
                </p>
                <div class="social-links">
                    <a href="#" class="social-icon" title="微信">
                        <i class="el-icon-document-copy"></i>
                    </a>
                    <a href="#" class="social-icon" title="微博">
                        <i class="el-icon-share"></i>
                    </a>
                    <a href="#" class="social-icon" title="抖音">
                        <i class="el-icon-video-play"></i>
                    </a>
                    <a href="#" class="social-icon" title="邮件">
                        <i class="el-icon-message"></i>
                    </a>
                </div>
            </div>

            <!-- 快速导航 -->
            <div class="footer-section">
                <h4 class="section-title">快速导航</h4>
                <ul class="link-list">
                    <li><router-link to="/">首页</router-link></li>
                    <li><router-link to="/adoption/list">待收养动物</router-link></li>
                    <li><router-link to="/knowledge/care">领养故事</router-link></li>
                </ul>
            </div>

            <!-- 服务指南 -->
            <div class="footer-section">
                <h4 class="section-title">服务指南</h4>
                <ul class="link-list">
                    <li><router-link to="/volunteer/apply">志愿者申请</router-link></li>
                    <li><router-link to="/donate">捐赠支持</router-link></li>
                    <li><router-link to="/help/faq">常见问题</router-link></li>
                    <li><router-link to="/help/contact">联系我们</router-link></li>
                </ul>
            </div>

            <!-- 联系方式 -->
            <div class="footer-section">
                <h4 class="section-title">联系方式</h4>
                <div class="contact-info">
                    <p>
                        <i class="el-icon-location"></i>
                        <span>地址：XX市XX区XX街道XX号</span>
                    </p>
                    <p>
                        <i class="el-icon-phone"></i>
                        <span>电话：400-XXX-XXXX</span>
                    </p>
                    <p>
                        <i class="el-icon-message"></i>
                        <span>邮箱：info@animalrescue.com</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- 底部版权 -->
        <div class="footer-bottom">
            <p>&copy; 2025 流浪动物收养中心. 保留所有权利。</p>
            <div class="footer-links">
                <a href="#" @click.prevent>隐私政策</a>
                <span class="separator">|</span>
                <a href="#" @click.prevent>服务条款</a>
                <span class="separator">|</span>
                <a href="#" @click.prevent>免责声明</a>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    name: "frontFooter",
    data() {
        return {}
    },
    methods: {}
}
</script>

<style scoped lang="less">
.footer-container {
    background-color: #2c2c2c;
    color: #ffffff;
    margin-top: 60px;

    .footer-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 50px 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 40px;

        .footer-section {
            .section-title {
                display: flex;
                align-items: center;
                font-size: 1.1rem;
                font-weight: bold;
                margin-bottom: 20px;
                color: #D52B1E;

                .footer-logo {
                    height: 30px;
                    margin-right: 10px;
                }
            }

            h4 {
                font-size: 1.1rem;
                font-weight: bold;
                margin-bottom: 20px;
                color: #D52B1E;
            }

            .section-description {
                font-size: 0.95rem;
                line-height: 1.6;
                color: #cccccc;
                margin-bottom: 20px;
            }

            .social-links {
                display: flex;
                gap: 15px;

                .social-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background-color: rgba(213, 43, 30, 0.1);
                    border-radius: 50%;
                    color: #D52B1E;
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                    text-decoration: none;

                    &:hover {
                        background-color: #D52B1E;
                        color: #ffffff;
                        transform: translateY(-3px);
                    }
                }
            }

            .link-list {
                list-style: none;
                padding: 0;
                margin: 0;

                li {
                    margin-bottom: 12px;

                    a {
                        color: #cccccc;
                        text-decoration: none;
                        font-size: 0.95rem;
                        transition: all 0.3s ease;

                        &:hover {
                            color: #D52B1E;
                            padding-left: 5px;
                        }
                    }
                }
            }

            .contact-info {
                p {
                    display: flex;
                    align-items: center;
                    margin-bottom: 12px;
                    font-size: 0.95rem;
                    color: #cccccc;
                    line-height: 1.6;

                    i {
                        margin-right: 10px;
                        color: #D52B1E;
                        font-size: 1rem;
                    }

                    span {
                        flex: 1;
                    }
                }
            }
        }
    }

    .footer-bottom {
        border-top: 1px solid #444444;
        padding: 20px;
        text-align: center;
        background-color: #1f1f1f;

        p {
            margin: 0 0 10px 0;
            font-size: 0.9rem;
            color: #999999;
        }

        .footer-links {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;

            a {
                color: #999999;
                text-decoration: none;
                transition: color 0.3s ease;

                &:hover {
                    color: #D52B1E;
                }
            }

            .separator {
                color: #666666;
            }
        }
    }
}
</style>

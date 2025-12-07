<template>
    <div class="volunteer-page">
        <header-layout></header-layout>

        <!-- 页面头部 -->
        <section class="page-header">
            <div class="header-content">
                <h1>加入我们</h1>
                <p>成为一名志愿者，为动物们的生命改变做出贡献</p>
            </div>
        </section>

        <!-- 志愿者简介 -->
        <section class="intro-section">
            <div class="intro-container">
                <div class="intro-content">
                    <h2>为什么成为志愿者</h2>
                    <p>我们的志愿者来自各行各业，他们用爱心和行动改变了无数动物的命运。无论您有多少时间，无论您的技能是什么，都有适合您的志愿服务方式。</p>
                    <ul class="benefits-list">
                        <li>💝 帮助需要帮助的动物获得新生</li>
                        <li>🤝 成为充满爱心的社区的一部分</li>
                        <li>🎯 获得宝贵的工作和生活经验</li>
                        <li>❤️ 感受帮助他人的深层满足感</li>
                    </ul>
                </div>
                <div class="intro-image">
                    <div class="image-placeholder"></div>
                </div>
            </div>
        </section>

        <!-- 志愿者角色 -->
        <section class="roles-section">
            <div class="roles-container">
                <h2>志愿者角色</h2>
                <div class="roles-grid">
                    <div class="role-card">
                        <div class="role-icon">🏥</div>
                        <h3>医疗志愿者</h3>
                        <p>协助兽医进行动物的医疗检查、护理和康复工作</p>
                        <div class="role-info">
                            <span class="time-requirement">每周 4-8 小时</span>
                        </div>
                    </div>
                    <div class="role-card">
                        <div class="role-icon">🏠</div>
                        <h3>家访员</h3>
                        <p>进行领养前的家访评估，确保动物找到最合适的家</p>
                        <div class="role-info">
                            <span class="time-requirement">灵活安排</span>
                        </div>
                    </div>
                    <div class="role-card">
                        <div class="role-icon">🧹</div>
                        <h3>护理志愿者</h3>
                        <p>照顾动物的日常饮食、卫生和环境保洁工作</p>
                        <div class="role-info">
                            <span class="time-requirement">每周 8-16 小时</span>
                        </div>
                    </div>
                    <div class="role-card">
                        <div class="role-icon">📱</div>
                        <h3>社交媒体志愿者</h3>
                        <p>帮助宣传待领养动物，管理社交媒体内容</p>
                        <div class="role-info">
                            <span class="time-requirement">每周 4-6 小时</span>
                        </div>
                    </div>
                    <div class="role-card">
                        <div class="role-icon">📝</div>
                        <h3>文案志愿者</h3>
                        <p>为动物编写档案、故事和宣传文案</p>
                        <div class="role-info">
                            <span class="time-requirement">每周 3-5 小时</span>
                        </div>
                    </div>
                    <div class="role-card">
                        <div class="role-icon">🎓</div>
                        <h3>教育志愿者</h3>
                        <p>进行动物保护和宠物养护知识的宣传教育</p>
                        <div class="role-info">
                            <span class="time-requirement">每周 2-4 小时</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 志愿者要求 -->
        <section class="requirements-section">
            <div class="requirements-container">
                <h2>志愿者要求</h2>
                <div class="requirements-grid">
                    <div class="requirement-item">
                        <div class="req-number">01</div>
                        <h3>年满18岁</h3>
                        <p>您必须至少年满18岁才能成为我们的志愿者</p>
                    </div>
                    <div class="requirement-item">
                        <div class="req-number">02</div>
                        <h3>爱心和耐心</h3>
                        <p>对动物有真诚的爱心，能够耐心对待每一只动物</p>
                    </div>
                    <div class="requirement-item">
                        <div class="req-number">03</div>
                        <h3>可靠性</h3>
                        <p>承诺定期参加志愿活动，准时守约</p>
                    </div>
                    <div class="requirement-item">
                        <div class="req-number">04</div>
                        <h3>健康状况</h3>
                        <p>身体健康，适合从事所选择的志愿工作</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 志愿者福利 -->
        <section class="benefits-section">
            <div class="benefits-container">
                <h2>志愿者福利</h2>
                <div class="benefits-cards">
                    <div class="benefit-card">
                        <div class="benefit-icon">🎖️</div>
                        <h3>志愿者证书</h3>
                        <p>完成志愿服务后获得正式证书</p>
                    </div>
                    <div class="benefit-card">
                        <div class="benefit-icon">🎁</div>
                        <h3>志愿者礼物</h3>
                        <p>定期为志愿者提供纪念品和感谢礼物</p>
                    </div>
                    <div class="benefit-card">
                        <div class="benefit-icon">👥</div>
                        <h3>社区归属感</h3>
                        <p>加入充满爱心的志愿者社区</p>
                    </div>
                    <div class="benefit-card">
                        <div class="benefit-icon">📚</div>
                        <h3>培训支持</h3>
                        <p>获得专业的培训和知识指导</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 常见问题 -->
        <section class="faq-section">
            <div class="faq-container">
                <h2>常见问题</h2>
                <div class="faq-list">
                    <div v-for="(faq, index) in faqItems" :key="index" class="faq-item">
                        <div class="faq-question" @click="faq.open = !faq.open">
                            <span class="faq-icon">{{ faq.open ? '−' : '+' }}</span>
                            <span class="faq-title">{{ faq.question }}</span>
                        </div>
                        <div v-if="faq.open" class="faq-answer">{{ faq.answer }}</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 行动号召 -->
        <section class="cta-section">
            <div class="cta-container">
                <h2>准备好了吗？</h2>
                <p>立即加入我们的志愿者团队，开始您的志愿者之旅</p>
                <button class="cta-btn" @click="goToApply">成为志愿者</button>
            </div>
        </section>

        <footer-layout></footer-layout>
    </div>
</template>

<script>
export default {
    name: "volunteerPage",
    methods: {
        goToApply() {
            this.$router.push('/volunteer/apply')
        }
    },
    data() {
        return {
            faqItems: [
                { 
                    question: "我没有任何相关经验，能成为志愿者吗？", 
                    answer: "当然可以！我们欢迎所有热爱动物的人。我们会提供完整的培训和指导，无论您的经验水平如何。", 
                    open: false 
                },
                { 
                    question: "我只能在周末服务，可以吗？", 
                    answer: "完全没问题！我们有很多角色可以灵活安排，特别是周末的工作。请告诉我们您的可用时间。", 
                    open: false 
                },
                { 
                    question: "志愿者需要承诺多长时间？", 
                    answer: "根据不同的角色，通常每周需要2-16小时。您可以根据自己的时间安排选择合适的角色。", 
                    open: false 
                },
                { 
                    question: "如果我对某些动物过敏怎么办？", 
                    answer: "我们会根据您的过敏情况安排合适的志愿者工作。可能会分配您从事不直接接触动物的工作。", 
                    open: false 
                },
                { 
                    question: "需要交注册费用吗？", 
                    answer: "完全免费！志愿者服务不需要支付任何费用，这是纯粹的爱心奉献。", 
                    open: false 
                }
            ]
        }
    }
}
</script>

<style lang="less" scoped>
.volunteer-page {
    width: 100%;
}

/* 页面头部 */
.page-header {
    background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
    color: white;
    padding: 80px 20px;
    text-align: center;

    .header-content {
        max-width: 1000px;
        margin: 0 auto;

        h1 {
            font-size: 3rem;
            margin: 0 0 20px 0;
            font-weight: bold;
        }

        p {
            font-size: 1.3rem;
            margin: 0;
            opacity: 0.95;
        }
    }
}

/* 志愿者简介 */
.intro-section {
    padding: 80px 20px;
    background: #fff;

    .intro-container {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 60px;
        align-items: center;

        .intro-content {
            h2 {
                font-size: 2.2rem;
                color: #333;
                margin-bottom: 25px;
                font-weight: bold;
            }

            p {
                font-size: 1.05rem;
                color: #666;
                line-height: 1.8;
                margin-bottom: 30px;
            }

            .benefits-list {
                list-style: none;
                padding: 0;
                margin: 0;

                li {
                    font-size: 1.05rem;
                    color: #666;
                    line-height: 2;
                    margin-bottom: 12px;
                }
            }
        }

        .intro-image {
            .image-placeholder {
                width: 100%;
                height: 400px;
                border-radius: 12px;
                background: linear-gradient(135deg, #f0f5ff 0%, #e8f0ff 100%);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
            }
        }
    }
}

/* 志愿者角色 */
.roles-section {
    padding: 80px 20px;
    background: #f8f9ff;

    .roles-container {
        max-width: 1200px;
        margin: 0 auto;

        h2 {
            font-size: 2.2rem;
            color: #333;
            text-align: center;
            margin-bottom: 60px;
            font-weight: bold;
            position: relative;
            display: inline-block;
            width: 100%;
            padding-bottom: 20px;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 4px;
                background: linear-gradient(90deg, #d52b1e 0%, #e85541 100%);
                border-radius: 2px;
            }
        }

        .roles-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;

            .role-card {
                background: white;
                padding: 35px 25px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                text-align: center;

                &:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
                }

                .role-icon {
                    font-size: 2.8rem;
                    margin-bottom: 15px;
                }

                h3 {
                    font-size: 1.2rem;
                    color: #333;
                    margin-bottom: 12px;
                    font-weight: bold;
                }

                p {
                    font-size: 0.95rem;
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }

                .role-info {
                    .time-requirement {
                        display: inline-block;
                        padding: 8px 15px;
                        background: #f0f5ff;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        color: #d52b1e;
                        font-weight: 500;
                    }
                }
            }
        }
    }
}

/* 志愿者要求 */
.requirements-section {
    padding: 80px 20px;
    background: #fff;

    .requirements-container {
        max-width: 1200px;
        margin: 0 auto;

        h2 {
            font-size: 2.2rem;
            color: #333;
            text-align: center;
            margin-bottom: 60px;
            font-weight: bold;
            position: relative;
            display: inline-block;
            width: 100%;
            padding-bottom: 20px;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 4px;
                background: linear-gradient(90deg, #d52b1e 0%, #e85541 100%);
                border-radius: 2px;
            }
        }

        .requirements-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;

            .requirement-item {
                display: flex;
                gap: 25px;

                .req-number {
                    font-size: 2.5rem;
                    font-weight: bold;
                    color: #d52b1e;
                    min-width: 70px;
                }

                div {
                    flex: 1;

                    h3 {
                        font-size: 1.2rem;
                        color: #333;
                        margin-bottom: 10px;
                        font-weight: bold;
                    }

                    p {
                        font-size: 0.95rem;
                        color: #666;
                        line-height: 1.6;
                        margin: 0;
                    }
                }
            }
        }
    }
}

/* 志愿者福利 */
.benefits-section {
    padding: 80px 20px;
    background: #f8f9ff;

    .benefits-container {
        max-width: 1200px;
        margin: 0 auto;

        h2 {
            font-size: 2.2rem;
            color: #333;
            text-align: center;
            margin-bottom: 60px;
            font-weight: bold;
            position: relative;
            display: inline-block;
            width: 100%;
            padding-bottom: 20px;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 4px;
                background: linear-gradient(90deg, #d52b1e 0%, #e85541 100%);
                border-radius: 2px;
            }
        }

        .benefits-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 25px;

            .benefit-card {
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                text-align: center;

                .benefit-icon {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                }

                h3 {
                    font-size: 1.1rem;
                    color: #333;
                    margin-bottom: 10px;
                    font-weight: bold;
                }

                p {
                    font-size: 0.9rem;
                    color: #666;
                    line-height: 1.5;
                    margin: 0;
                }
            }
        }
    }
}

/* FAQ 部分 */
.faq-section {
    padding: 80px 20px;
    background: #fff;

    .faq-container {
        max-width: 900px;
        margin: 0 auto;

        h2 {
            font-size: 2.2rem;
            color: #333;
            text-align: center;
            margin-bottom: 60px;
            font-weight: bold;
            position: relative;
            display: inline-block;
            width: 100%;
            padding-bottom: 20px;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 4px;
                background: linear-gradient(90deg, #d52b1e 0%, #e85541 100%);
                border-radius: 2px;
            }
        }

        .faq-list {
            .faq-item {
                background: white;
                margin-bottom: 15px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

                .faq-question {
                    padding: 22px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    background-color: #f8f9ff;
                    transition: background-color 0.3s ease;

                    &:hover {
                        background-color: #f0f5ff;
                    }

                    .faq-icon {
                        font-size: 1.5rem;
                        color: #d52b1e;
                        margin-right: 15px;
                        min-width: 30px;
                    }

                    .faq-title {
                        font-size: 1rem;
                        color: #333;
                        font-weight: bold;
                    }
                }

                .faq-answer {
                    padding: 22px;
                    background-color: white;
                    border-top: 1px solid #eee;
                    font-size: 0.95rem;
                    color: #666;
                    line-height: 1.6;
                }
            }
        }
    }
}

/* CTA 部分 */
.cta-section {
    padding: 80px 20px;
    background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
    color: white;
    text-align: center;

    .cta-container {
        max-width: 800px;
        margin: 0 auto;

        h2 {
            font-size: 2.2rem;
            margin-bottom: 15px;
            font-weight: bold;
        }

        p {
            font-size: 1.1rem;
            margin-bottom: 40px;
            opacity: 0.95;
        }

        .cta-btn {
            padding: 18px 50px;
            font-size: 1.05rem;
            font-weight: bold;
            background: white;
            color: #d52b1e;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            }
        }
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .page-header .header-content h1 {
        font-size: 2rem;
    }

    .intro-section .intro-container {
        grid-template-columns: 1fr;
        gap: 40px;
    }

    .roles-section .roles-container .roles-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }

    .requirements-section .requirements-container .requirements-grid {
        grid-template-columns: 1fr;
    }

    .benefits-section .benefits-container .benefits-cards {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .page-header {
        padding: 50px 20px;

        .header-content {
            h1 {
                font-size: 1.6rem;
            }

            p {
                font-size: 1rem;
            }
        }
    }

    .roles-section .roles-container .roles-grid {
        grid-template-columns: 1fr;
    }

    .benefits-section .benefits-container .benefits-cards {
        grid-template-columns: 1fr;
    }

    .intro-section .intro-content h2,
    .roles-section .roles-container h2,
    .requirements-section .requirements-container h2,
    .benefits-section .benefits-container h2,
    .faq-section .faq-container h2,
    .cta-section .cta-container h2 {
        font-size: 1.5rem;
    }
}
</style>

<template>
    <div class="about-page">
        <header-layout></header-layout>

        <!-- 页面头部 -->
        <section class="page-header">
            <div class="header-content">
                <h1>关于我们</h1>
                <p>致力于给每一只流浪动物一个温暖的家</p>
            </div>
        </section>

        <!-- 组织简介 -->
        <section class="intro-section">
            <div class="intro-container">
                <!-- <div class="intro-image">
                    <div class="image-placeholder"></div>
                </div> -->
                <div class="intro-content">
                    <h2>我们是谁</h2>
                    <p>动物收养中心是一个致力于救助、保护和重新安置流浪动物的非营利组织。我们相信每一只小动物都值得被温柔对待，都应该拥有一个充满爱的家。</p>
                    <p>自成立以来，我们已经成功救助了数百只动物，为它们找到了温暖的新家。我们的团队由热爱动物的志愿者和专业工作者组成，每天都在为改善这些生命的未来而努力。</p>
                </div>
            </div>
        </section>

        <!-- 组织使命 -->
        <section class="mission-section">
            <div class="mission-container">
                <h2>我们的使命</h2>
                <div class="mission-grid">
                    <div class="mission-card">
                        <div class="mission-icon">🐾</div>
                        <h3>救助与保护</h3>
                        <p>救助流浪动物，提供医疗护理和安全避难所</p>
                    </div>
                    <div class="mission-card">
                        <div class="mission-icon">❤️</div>
                        <h3>重新安置</h3>
                        <p>将动物安置到最合适的家庭，建立幸福关系</p>
                    </div>
                    <div class="mission-card">
                        <div class="mission-icon">📚</div>
                        <h3>教育倡导</h3>
                        <p>提高公众对动物福利的认识和关注</p>
                    </div>
                    <div class="mission-card">
                        <div class="mission-icon">🤝</div>
                        <h3>社区参与</h3>
                        <p>邀请志愿者和社区共同为动物福利做贡献</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 成就统计 -->
        <section class="stats-section">
            <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-number">1,200+</div>
                    <div class="stat-label">救助动物</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">950+</div>
                    <div class="stat-label">成功领养</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">150+</div>
                    <div class="stat-label">活跃志愿者</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">45+</div>
                    <div class="stat-label">合作伙伴</div>
                </div>
            </div>
        </section>

        <!-- 核心价值观 -->
        <section class="values-section">
            <div class="values-container">
                <h2>核心价值观</h2>
                <div class="values-grid">
                    <div class="value-item">
                        <div class="value-title">同情心</div>
                        <div class="value-desc">以同情和尊重对待每一只动物</div>
                    </div>
                    <div class="value-item">
                        <div class="value-title">透明度</div>
                        <div class="value-desc">公开透明地开展工作，接受监督</div>
                    </div>
                    <div class="value-item">
                        <div class="value-title">专业性</div>
                        <div class="value-desc">提供高质量的医疗和照顾服务</div>
                    </div>
                    <div class="value-item">
                        <div class="value-title">包容性</div>
                        <div class="value-desc">欢迎所有背景的人加入我们</div>
                    </div>
                    <div class="value-item">
                        <div class="value-title">可持续性</div>
                        <div class="value-desc">长期承诺改善动物福利</div>
                    </div>
                    <div class="value-item">
                        <div class="value-title">创新</div>
                        <div class="value-desc">不断寻求更好的工作方法</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 行动号召 -->
        <section class="cta-section">
            <div class="cta-container">
                <h2>加入我们</h2>
                <p>每一份帮助，无论大小，都能改变一只动物的生命</p>
                <div class="cta-buttons">
                    <button class="btn btn-primary" @click="goToAdoption">领养一只</button>
                    <button class="btn btn-secondary" @click="goToVolunteer">成为志愿者</button>
                    <button class="btn btn-secondary" @click="goToDonate">提供捐赠</button>
                </div>
            </div>
        </section>

        <footer-layout></footer-layout>
    </div>
</template>

<script>
export default {
    name: "aboutPage",
    methods: {
        goToAdoption() {
            this.$router.push('/adoption/list')
        },
        goToVolunteer() {
            this.$router.push('/volunteer/apply')
        },
        goToDonate() {
            this.$router.push('/donate')
        }
    }
}
</script>

<style lang="less" scoped>
.about-page {
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

/* 组织简介 */
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

        .intro-image {
            .image-placeholder {
                width: 100%;
                height: 400px;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
            }
        }

        .intro-content {
            h2 {
                font-size: 2.2rem;
                color: #333;
                margin-bottom: 30px;
                font-weight: bold;
            }

            p {
                font-size: 1.05rem;
                color: #666;
                line-height: 1.8;
                margin-bottom: 20px;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }
}

/* 使命部分 */
.mission-section {
    padding: 80px 20px;
    background: #f8f9ff;

    .mission-container {
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

        .mission-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;

            .mission-card {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                transition: transform 0.3s ease, box-shadow 0.3s ease;

                &:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
                }

                .mission-icon {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                }

                h3 {
                    font-size: 1.3rem;
                    color: #333;
                    margin-bottom: 12px;
                    font-weight: bold;
                }

                p {
                    font-size: 1rem;
                    color: #666;
                    line-height: 1.6;
                    margin: 0;
                }
            }
        }
    }
}

/* 成就统计 */
.stats-section {
    padding: 80px 20px;
    background: #fff;

    .stats-container {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 40px;

        .stat-card {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, #f8f9ff 0%, #f0f5ff 100%);
            border-radius: 12px;
            border: 1px solid #eef2ff;

            .stat-number {
                font-size: 2.5rem;
                font-weight: bold;
                color: #d52b1e;
                margin-bottom: 10px;
            }

            .stat-label {
                font-size: 1.1rem;
                color: #666;
                font-weight: 500;
            }
        }
    }
}

/* 核心价值观 */
.values-section {
    padding: 80px 20px;
    background: #f8f9ff;

    .values-container {
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

        .values-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;

            .value-item {
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                text-align: center;
                border-left: 4px solid #d52b1e;

                .value-title {
                    font-size: 1.2rem;
                    color: #333;
                    margin-bottom: 12px;
                    font-weight: bold;
                }

                .value-desc {
                    font-size: 0.95rem;
                    color: #666;
                    line-height: 1.6;
                }
            }
        }
    }
}

/* 行动号召 */
.cta-section {
    padding: 80px 20px;
    background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
    color: white;
    text-align: center;

    .cta-container {
        max-width: 1000px;
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

        .cta-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;

            .btn {
                padding: 15px 40px;
                font-size: 1rem;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;

                &.btn-primary {
                    background: white;
                    color: #d52b1e;

                    &:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                    }
                }

                &.btn-secondary {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 2px solid white;

                    &:hover {
                        background: rgba(255, 255, 255, 0.3);
                        transform: translateY(-3px);
                    }
                }
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

    .mission-section .mission-container .mission-grid {
        grid-template-columns: 1fr;
    }

    .stats-section .stats-container {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }

    .values-section .values-container .values-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }

    .cta-section .cta-container .cta-buttons {
        flex-direction: column;

        .btn {
            width: 100%;
        }
    }
}

@media (max-width: 480px) {
    .page-header {
        padding: 50px 20px;
    }

    .page-header .header-content {
        h1 {
            font-size: 1.6rem;
        }

        p {
            font-size: 1rem;
        }
    }

    .stats-section .stats-container {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;

        .stat-card {
            padding: 20px 10px;

            .stat-number {
                font-size: 2rem;
            }

            .stat-label {
                font-size: 0.9rem;
            }
        }
    }

    .values-section .values-container .values-grid {
        grid-template-columns: 1fr;
    }

    .intro-section .intro-content h2,
    .mission-section .mission-container h2,
    .values-section .values-container h2,
    .cta-section .cta-container h2 {
        font-size: 1.5rem;
    }
}
</style>

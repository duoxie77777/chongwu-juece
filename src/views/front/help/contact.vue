<template>
    <div class="contact-page">
        <header-layout></header-layout>

        <!-- 页面头部 -->
        <section class="page-header">
            <div class="header-content">
                <h1>联系我们</h1>
                <p>我们随时准备为您服务</p>
            </div>
        </section>

        <!-- 主要内容 -->
        <section class="main-content">
            <div class="content-wrapper">
                <!-- 左侧：联系方式 -->
                <div class="left-section">
                    <h2>快速联系</h2>
                    
                    <div class="contact-item">
                        <div class="icon-circle">📞</div>
                        <div class="item-content">
                            <h3>电话</h3>
                            <p>400-XXX-XXXX</p>
                            <span class="time">工作日 9:00-18:00</span>
                        </div>
                    </div>

                    <div class="contact-item">
                        <div class="icon-circle">✉️</div>
                        <div class="item-content">
                            <h3>邮件</h3>
                            <p>info@adoption.org</p>
                            <span class="time">24小时内回复</span>
                        </div>
                    </div>
                </div>

                <!-- 右侧：表单 -->
                <div class="right-section">
                    <h2>发送消息</h2>
                    
                    <form @submit.prevent="submitForm" class="contact-form">
                        <input 
                            type="text" 
                            v-model="form.name" 
                            placeholder="姓名"
                            required
                        />
                        <input 
                            type="tel" 
                            v-model="form.phone" 
                            placeholder="电话"
                            required
                        />
                        <input 
                            type="email" 
                            v-model="form.email" 
                            placeholder="邮箱"
                            required
                        />
                        <select v-model="form.subject" required>
                            <option value="">选择咨询类型</option>
                            <option value="adoption">领养咨询</option>
                            <option value="volunteer">志愿者申请</option>
                            <option value="donate">捐赠相关</option>
                            <option value="feedback">建议反馈</option>
                            <option value="other">其他问题</option>
                        </select>
                        <textarea 
                            v-model="form.message" 
                            placeholder="请详细描述您的问题或需求"
                            rows="4"
                            required
                        ></textarea>
                        <button type="submit" class="submit-btn">发送消息</button>
                    </form>
                </div>
            </div>
        </section>

        <footer-layout></footer-layout>
    </div>
</template>

<script>
export default {
    name: 'contactPage',
    data() {
        return {
            form: {
                name: '',
                phone: '',
                email: '',
                subject: '',
                message: ''
            }
        }
    },
    methods: {
        submitForm() {
            if (!this.form.name || !this.form.phone || !this.form.email || !this.form.subject || !this.form.message) {
                alert('请填写所有必填项');
                return;
            }
            console.log('表单数据:', this.form);
            alert('感谢您的消息，我们会尽快与您联系！');
            this.resetForm();
        },
        resetForm() {
            this.form = {
                name: '',
                phone: '',
                email: '',
                subject: '',
                message: ''
            };
        }
    }
}
</script>

<style lang="less" scoped>
.contact-page {
    width: 100%;
}

/* 页面头部 */
.page-header {
    background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
    color: white;
    padding: 100px 20px;
    text-align: center;
    margin-top: 60px;

    .header-content {
        max-width: 1200px;
        margin: 0 auto;

        h1 {
            font-size: 3.8rem;
            font-weight: 700;
            margin-bottom: 15px;
            letter-spacing: -1px;
        }

        p {
            font-size: 1.15rem;
            opacity: 0.9;
            font-weight: 300;
        }
    }
}

/* 主要内容 */
.main-content {
    padding: 100px 20px;
    background: white;

    .content-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 80px;
        align-items: start;
    }
}

/* 左侧联系方式 */
.left-section {
    h2 {
        font-size: 2rem;
        color: #333;
        margin-bottom: 50px;
        font-weight: 700;
    }

    .contact-item {
        display: flex;
        gap: 25px;
        margin-bottom: 50px;
        padding-bottom: 50px;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .icon-circle {
            font-size: 2.5rem;
            min-width: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(213, 43, 30, 0.1) 0%, rgba(232, 85, 65, 0.1) 100%);
            border-radius: 12px;
            width: 60px;
            height: 60px;
        }

        .item-content {
            flex: 1;

            h3 {
                font-size: 1.2rem;
                color: #333;
                margin-bottom: 8px;
                font-weight: 600;
            }

            p {
                font-size: 1.05rem;
                color: #d52b1e;
                font-weight: 600;
                margin-bottom: 6px;
            }

            .time {
                display: block;
                font-size: 0.9rem;
                color: #999;
            }
        }
    }
}

/* 右侧表单 */
.right-section {
    h2 {
        font-size: 2rem;
        color: #333;
        margin-bottom: 35px;
        font-weight: 700;
    }

    .contact-form {
        display: flex;
        flex-direction: column;
        gap: 18px;

        input,
        select,
        textarea {
            padding: 14px 18px;
            border: 2px solid #f0f0f0;
            border-radius: 8px;
            font-size: 0.95rem;
            color: #333;
            transition: all 0.3s ease;
            font-family: inherit;
            background: #fafafa;

            &::placeholder {
                color: #bbb;
            }

            &:focus {
                outline: none;
                border-color: #d52b1e;
                background: white;
                box-shadow: 0 0 0 3px rgba(213, 43, 30, 0.1);
            }
        }

        textarea {
            resize: vertical;
            min-height: 110px;
        }

        .submit-btn {
            padding: 14px 30px;
            background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 8px;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(213, 43, 30, 0.25);
            }

            &:active {
                transform: translateY(0);
            }
        }
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .page-header .header-content h1 {
        font-size: 2.8rem;
    }

    .main-content .content-wrapper {
        grid-template-columns: 1fr;
        gap: 50px;
    }

    .left-section h2,
    .right-section h2 {
        font-size: 1.6rem;
    }
}

@media (max-width: 480px) {
    .page-header {
        padding: 60px 20px;
    }

    .page-header .header-content h1 {
        font-size: 2.2rem;
    }

    .main-content {
        padding: 60px 20px;
    }

    .left-section,
    .right-section {
        h2 {
            font-size: 1.4rem;
        }
    }
}
</style>

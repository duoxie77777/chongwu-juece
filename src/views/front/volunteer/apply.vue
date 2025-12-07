<template>
    <div class="apply-volunteer-page">
        <header-layout></header-layout>

        <!-- 页面头部 -->
        <section class="page-header">
            <div class="header-content">
                <h1>加入我们的志愿者团队</h1>
                <p>填写下方表格，开启您的志愿者之旅</p>
            </div>
        </section>

        <!-- 申请表格 -->
        <section class="apply-form-section">
            <div class="form-container">
                <div class="form-wrapper">
                    <el-form 
                        ref="applyForm" 
                        :model="applyForm" 
                        :rules="rules"
                        label-width="120px"
                        class="apply-form">

                        <!-- 基本信息 -->
                        <div class="form-section">
                            <h3>基本信息</h3>
                            <el-form-item label="姓名" prop="name">
                                <el-input 
                                    v-model="applyForm.name" 
                                    placeholder="请输入您的真实姓名"
                                    prefix-icon="el-icon-user">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="年龄" prop="age">
                                <el-input-number 
                                    v-model="applyForm.age" 
                                    :min="18"
                                    :max="120"
                                    style="width: 100%;">
                                </el-input-number>
                            </el-form-item>

                            <el-form-item label="性别" prop="gender">
                                <el-radio-group v-model="applyForm.gender">
                                    <el-radio label="男">男</el-radio>
                                    <el-radio label="女">女</el-radio>
                                    <el-radio label="其他">其他</el-radio>
                                </el-radio-group>
                            </el-form-item>

                            <el-form-item label="手机号码" prop="phone">
                                <el-input 
                                    v-model="applyForm.phone" 
                                    placeholder="请输入您的手机号码"
                                    prefix-icon="el-icon-phone">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="邮箱" prop="email">
                                <el-input 
                                    v-model="applyForm.email" 
                                    placeholder="请输入您的邮箱地址"
                                    prefix-icon="el-icon-message">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="现住地址" prop="address">
                                <el-input 
                                    v-model="applyForm.address" 
                                    placeholder="请输入您的现住地址"
                                    prefix-icon="el-icon-location">
                                </el-input>
                            </el-form-item>
                        </div>

                        <!-- 志愿者角色选择 -->
                        <div class="form-section">
                            <h3>选择志愿者角色</h3>
                            <el-form-item label="角色选择" prop="roles">
                                <el-checkbox-group v-model="applyForm.roles">
                                    <el-checkbox label="医疗志愿者">医疗志愿者</el-checkbox>
                                    <el-checkbox label="护理志愿者">护理志愿者</el-checkbox>
                                    <el-checkbox label="家访员">家访员</el-checkbox>
                                    <el-checkbox label="社交媒体志愿者">社交媒体志愿者</el-checkbox>
                                    <el-checkbox label="文案志愿者">文案志愿者</el-checkbox>
                                    <el-checkbox label="教育志愿者">教育志愿者</el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>

                            <el-form-item label="可用时间" prop="availableTime">
                                <el-select 
                                    v-model="applyForm.availableTime" 
                                    placeholder="请选择您的可用时间">
                                    <el-option label="每周 2-4 小时" value="weekly-2-4"></el-option>
                                    <el-option label="每周 4-8 小时" value="weekly-4-8"></el-option>
                                    <el-option label="每周 8-16 小时" value="weekly-8-16"></el-option>
                                    <el-option label="灵活安排" value="flexible"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="工作日期偏好" prop="workDays">
                                <el-checkbox-group v-model="applyForm.workDays">
                                    <el-checkbox label="周一">周一</el-checkbox>
                                    <el-checkbox label="周二">周二</el-checkbox>
                                    <el-checkbox label="周三">周三</el-checkbox>
                                    <el-checkbox label="周四">周四</el-checkbox>
                                    <el-checkbox label="周五">周五</el-checkbox>
                                    <el-checkbox label="周六">周六</el-checkbox>
                                    <el-checkbox label="周日">周日</el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>
                        </div>

                        <!-- 个人背景 -->
                        <div class="form-section">
                            <h3>个人背景</h3>
                            <el-form-item label="工作/学历" prop="background">
                                <el-input 
                                    v-model="applyForm.background" 
                                    placeholder="请简述您的工作或学历背景"
                                    type="textarea"
                                    :rows="3">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="相关经验" prop="experience">
                                <el-input 
                                    v-model="applyForm.experience" 
                                    placeholder="请描述您与动物相关的经验（如无可以填写无）"
                                    type="textarea"
                                    :rows="3">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="技能特长" prop="skills">
                                <el-input 
                                    v-model="applyForm.skills" 
                                    placeholder="请描述您具有的特殊技能（如摄影、写作等）"
                                    type="textarea"
                                    :rows="3">
                                </el-input>
                            </el-form-item>
                        </div>

                        <!-- 健康信息 -->
                        <div class="form-section">
                            <h3>健康信息</h3>
                            <el-form-item label="过敏情况" prop="allergies">
                                <el-input 
                                    v-model="applyForm.allergies" 
                                    placeholder="请描述您可能的过敏情况（如无请填写无）"
                                    type="textarea"
                                    :rows="2">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="健康状况" prop="health">
                                <el-select 
                                    v-model="applyForm.health" 
                                    placeholder="请选择您的健康状况">
                                    <el-option label="健康，能适应所有工作" value="excellent"></el-option>
                                    <el-option label="良好，有些工作有限制" value="good"></el-option>
                                    <el-option label="一般，需要轻度工作" value="fair"></el-option>
                                </el-select>
                            </el-form-item>
                        </div>

                        <!-- 为什么想成为志愿者 -->
                        <div class="form-section">
                            <h3>动机与目标</h3>
                            <el-form-item label="申请理由" prop="motivation">
                                <el-input 
                                    v-model="applyForm.motivation" 
                                    placeholder="请简述您为什么想成为志愿者"
                                    type="textarea"
                                    :rows="4">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="目标与期望" prop="expectation">
                                <el-input 
                                    v-model="applyForm.expectation" 
                                    placeholder="请分享您在志愿服务中的期望"
                                    type="textarea"
                                    :rows="3">
                                </el-input>
                            </el-form-item>
                        </div>

                        <!-- 同意声明 -->
                        <div class="form-section">
                            <h3>同意条款</h3>
                            <el-form-item class="agreement-item" prop="agreement">
                                <el-checkbox v-model="applyForm.agreement">
                                    <span>
                                        我确认所有信息真实有效，并同意
                                        <span class="agreement-link" @click="showAgreement">志愿者协议</span>
                                        和隐私政策
                                    </span>
                                </el-checkbox>
                            </el-form-item>

                            <el-form-item class="agreement-item" prop="contactAgreement">
                                <el-checkbox v-model="applyForm.contactAgreement">
                                    我同意接收关于志愿者活动的信息和通知
                                </el-checkbox>
                            </el-form-item>
                        </div>

                        <!-- 提交按钮 -->
                        <div class="form-actions">
                            <el-button class="reset-btn" @click="resetForm">重置</el-button>
                            <el-button 
                                class="submit-btn" 
                                type="primary" 
                                @click="submitForm"
                                :loading="submitLoading">
                                提交申请
                            </el-button>
                        </div>
                    </el-form>
                </div>
            </div>
        </section>

        <!-- 协议模态框 -->
        <el-dialog
            title="志愿者协议"
            :visible.sync="agreementDialogVisible"
            width="80%"
            class="agreement-dialog">
            <div class="agreement-content">
                <h3>志愿者服务协议</h3>
                <p>
                    欢迎您成为流浪动物收养中心的志愿者。本协议规定了志愿者的权利和义务。
                </p>
                <h4>一、志愿者权利</h4>
                <ul>
                    <li>获得专业的培训和指导</li>
                    <li>获得志愿者证书和礼物</li>
                    <li>参与中心的各项活动</li>
                    <li>提出建议和参与决策</li>
                </ul>
                <h4>二、志愿者义务</h4>
                <ul>
                    <li>准时参加志愿活动</li>
                    <li>遵守中心的规章制度</li>
                    <li>爱护动物，确保其安全</li>
                    <li>保护个人隐私和中心机密</li>
                </ul>
                <h4>三、责任与保险</h4>
                <p>
                    志愿者在参加活动期间，中心将为其提供基本保险保障。志愿者应当谨慎行动，
                    避免人身伤害和财产损失。
                </p>
                <h4>四、终止条款</h4>
                <p>
                    如志愿者违反协议或无法继续服务，双方可以终止合作关系。
                </p>
            </div>
        </el-dialog>

        <footer-layout></footer-layout>
    </div>
</template>

<script>
import { applyVolunteer } from '@/utils/api'

export default {
    name: "applyVolunteer",
    data() {
        const validatePhone = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入手机号码'));
            } else if (!/^1[3-9]\d{9}$/.test(value)) {
                callback(new Error('请输入正确的手机号码'));
            } else {
                callback();
            }
        };

        const validateEmail = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入邮箱地址'));
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                callback(new Error('请输入正确的邮箱地址'));
            } else {
                callback();
            }
        };

        return {
            applyForm: {
                name: '',
                age: null,
                gender: '',
                phone: '',
                email: '',
                address: '',
                roles: [],
                availableTime: '',
                workDays: [],
                background: '',
                experience: '',
                skills: '',
                allergies: '',
                health: '',
                motivation: '',
                expectation: '',
                agreement: false,
                contactAgreement: false
            },
            rules: {
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' },
                    { min: 2, max: 50, message: '姓名长度在2-50个字符', trigger: 'blur' }
                ],
                age: [
                    { required: true, message: '请选择年龄', trigger: 'change' },
                    { type: 'number', min: 18, message: '年龄必须年满18岁', trigger: 'change' }
                ],
                gender: [
                    { required: true, message: '请选择性别', trigger: 'change' }
                ],
                phone: [
                    { validator: validatePhone, trigger: 'blur' }
                ],
                email: [
                    { validator: validateEmail, trigger: 'blur' }
                ],
                address: [
                    { required: true, message: '请输入现住地址', trigger: 'blur' }
                ],
                roles: [
                    { type: 'array', required: true, message: '请选择至少一个志愿者角色', trigger: 'change' }
                ],
                availableTime: [
                    { required: true, message: '请选择可用时间', trigger: 'change' }
                ],
                workDays: [
                    { type: 'array', required: true, message: '请选择至少一个工作日', trigger: 'change' }
                ],
                background: [
                    { required: true, message: '请填写工作或学历背景', trigger: 'blur' }
                ],
                experience: [
                    { required: true, message: '请填写相关经验', trigger: 'blur' }
                ],
                skills: [
                    { required: true, message: '请描述您的技能特长', trigger: 'blur' }
                ],
                allergies: [
                    { required: true, message: '请描述过敏情况', trigger: 'blur' }
                ],
                health: [
                    { required: true, message: '请选择健康状况', trigger: 'change' }
                ],
                motivation: [
                    { required: true, message: '请阐述申请理由', trigger: 'blur' },
                    { min: 20, message: '申请理由至少20个字符', trigger: 'blur' }
                ],
                expectation: [
                    { required: true, message: '请分享您的期望', trigger: 'blur' }
                ],
                agreement: [
                    { required: true, message: '请阅读并同意志愿者协议', trigger: 'change' }
                ]
            },
            agreementDialogVisible: false,
            submitLoading: false
        }
    },
    methods: {
        showAgreement() {
            this.agreementDialogVisible = true;
        },
        async submitForm() {
            this.$refs.applyForm.validate(async (valid) => {
                if (!valid) {
                    this.$message.error('请正确填写所有必填项');
                    return false;
                }

                // 检查是否已登录
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.warning('请先登录后再提交申请');
                    // 触发登录对话框
                    this.$root.$emit('show-login-dialog');
                    return;
                }

                this.submitLoading = true;
                try {
                    // 构建提交数据，只包含后端需要的字段
                    const submitData = {
                        name: this.applyForm.name,
                        age: this.applyForm.age,
                        gender: this.applyForm.gender,
                        phone: this.applyForm.phone,
                        email: this.applyForm.email,
                        address: this.applyForm.address,
                        roles: this.applyForm.roles,
                        availableTime: this.applyForm.availableTime,
                        workDays: this.applyForm.workDays,
                        background: this.applyForm.background,
                        experience: this.applyForm.experience,
                        skills: this.applyForm.skills,
                        allergies: this.applyForm.allergies,
                        health: this.applyForm.health,
                        motivation: this.applyForm.motivation,
                        expectation: this.applyForm.expectation
                    };
                    
                    console.log('提交的志愿者申请数据:', submitData);
                    
                    const response = await applyVolunteer(submitData);
                    if (response.data && response.data.code === 201) {
                        this.$message.success('申请已成功提交！我们会尽快与您联系');
                        this.resetForm();
                    } else {
                        this.$message.error(response.data?.message || '提交失败，请重试');
                    }
                } catch (error) {
                    console.error('提交志愿者申请失败:', error);
                    if (error.code === 'UNAUTHORIZED' || error.status === 401) {
                        this.$message.warning('请先登录后再提交申请');
                        this.$root.$emit('show-login-dialog');
                    } else {
                        this.$message.error(error.data?.message || error.message || '提交失败，请重试');
                    }
                } finally {
                    this.submitLoading = false;
                }
            });
        },
        resetForm() {
            this.$refs.applyForm.resetFields();
        }
    }
}
</script>

<style lang="less" scoped>
.apply-volunteer-page {
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

/* 申请表格部分 */
.apply-form-section {
    padding: 80px 20px;
    background: #fff;

    .form-container {
        max-width: 900px;
        margin: 0 auto;

        .form-wrapper {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

            .apply-form {
                .form-section {
                    margin-bottom: 40px;
                    padding-bottom: 30px;
                    border-bottom: 1px solid #f0f0f0;

                    h3 {
                        font-size: 1.3rem;
                        color: #d52b1e;
                        margin-bottom: 25px;
                        font-weight: bold;
                        display: flex;
                        align-items: center;

                        &::before {
                            content: '';
                            display: inline-block;
                            width: 4px;
                            height: 20px;
                            background: linear-gradient(90deg, #d52b1e 0%, #e85541 100%);
                            border-radius: 2px;
                            margin-right: 12px;
                        }
                    }

                    &:last-child {
                        border-bottom: none;
                    }

                    /deep/ .el-form-item {
                        margin-bottom: 20px;
                    }

                    /deep/ .el-checkbox-group {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 20px;
                    }
                }

                .agreement-item {
                    /deep/ .el-form-item__content {
                        line-height: 1.8;
                    }

                    .agreement-link {
                        color: #d52b1e;
                        cursor: pointer;
                        text-decoration: underline;

                        &:hover {
                            color: #c21d0f;
                        }
                    }
                }

                .form-actions {
                    margin-top: 40px;
                    display: flex;
                    justify-content: center;
                    gap: 15px;

                    .reset-btn {
                        padding: 12px 40px;
                        font-size: 1rem;
                        border: 1px solid #ddd;
                        background: white;
                        color: #666;

                        &:hover {
                            border-color: #999;
                            color: #333;
                        }
                    }

                    .submit-btn {
                        padding: 12px 50px;
                        font-size: 1rem;
                        background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
                        color: white;
                        border: none;

                        &:hover {
                            box-shadow: 0 8px 20px rgba(213, 43, 30, 0.3);
                            transform: translateY(-2px);
                        }
                    }
                }
            }
        }
    }
}

/* 协议对话框 */
.agreement-dialog {
    /deep/ .el-dialog {
        border-radius: 12px;
    }

    .agreement-content {
        max-height: 500px;
        overflow-y: auto;
        padding-right: 10px;

        h3 {
            color: #d52b1e;
            font-size: 1.3rem;
            margin-bottom: 15px;
            font-weight: bold;
        }

        h4 {
            color: #333;
            font-size: 1.05rem;
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: bold;
        }

        p {
            color: #666;
            line-height: 1.8;
            margin-bottom: 15px;
            font-size: 0.95rem;
        }

        ul {
            margin-left: 20px;
            margin-bottom: 15px;

            li {
                color: #666;
                line-height: 1.8;
                margin-bottom: 8px;
                font-size: 0.95rem;
            }
        }
    }
}

/* 输入框和选择框美化 */
/deep/ .el-input__inner,
/deep/ .el-textarea__inner,
/deep/ .el-select .el-input__inner,
/deep/ .el-input-number__inner {
    border: 1px solid #e6e6e6;
    border-radius: 6px;
    transition: all 0.3s ease;

    &:focus,
    &:hover {
        border-color: #d52b1e;
        box-shadow: 0 0 0 2px rgba(213, 43, 30, 0.1);
    }
}

/deep/ .el-checkbox__inner {
    border-color: #d52b1e;

    &:hover {
        border-color: #d52b1e;
    }
}

/deep/ .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #d52b1e;
    border-color: #d52b1e;
}

/deep/ .el-radio__inner {
    border-color: #d52b1e;

    &:hover {
        border-color: #d52b1e;
    }
}

/deep/ .el-radio__input.is-checked .el-radio__inner {
    background-color: #d52b1e;
    border-color: #d52b1e;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .page-header {
        padding: 50px 20px;

        .header-content {
            h1 {
                font-size: 2rem;
            }

            p {
                font-size: 1rem;
            }
        }
    }

    .apply-form-section .form-container .form-wrapper {
        padding: 20px;

        .apply-form .form-section {
            /deep/ .el-form-item__label {
                width: 100% !important;
                text-align: left;
                margin-bottom: 8px;
            }

            /deep/ .el-form-item__content {
                margin-left: 0 !important;
            }
        }
    }

    .form-actions {
        flex-direction: column;

        .reset-btn,
        .submit-btn {
            width: 100%;
        }
    }
}

@media (max-width: 480px) {
    .page-header .header-content h1 {
        font-size: 1.5rem;
    }

    .apply-form-section .form-container .form-wrapper {
        padding: 15px;
    }
}
</style>

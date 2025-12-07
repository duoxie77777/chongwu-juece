<template>
    <div class="donate-container">
        <header-layout></header-layout>
        
        <div class="donate-content">
            <!-- 页面标题 -->
            <div class="page-header">
                <h1>参与捐赠</h1>
                <p>您的支持将帮助更多流浪动物重新开始新的生活</p>
            </div>

            <!-- 捐赠方式卡片 -->
            <div class="donation-methods">
                <div class="section-title">
                    <h2>选择捐赠方式</h2>
                </div>
                
                <div class="methods-grid">
                    <!-- 金钱捐赠 -->
                    <div class="method-card monetary" :class="{ active: activeTab === 'monetary' }" @click="activeTab = 'monetary'">
                        <div class="method-icon">💰</div>
                        <h3>金钱捐赠</h3>
                        <p>直接捐款支持救助、治疗、饲养</p>
                    </div>

                    <!-- 物资捐赠 -->
                    <div class="method-card goods" :class="{ active: activeTab === 'goods' }" @click="activeTab = 'goods'">
                        <div class="method-icon">📦</div>
                        <h3>物资捐赠</h3>
                        <p>捐赠食物、用品、医疗物资</p>
                    </div>
                </div>
            </div>

            <!-- 捐赠表单区域 -->
            <div class="donation-form-section">
                <!-- 金钱捐赠表单 -->
                <div v-if="activeTab === 'monetary'" class="form-wrapper">
                    <div class="form-container">
                        <h3>金钱捐赠</h3>
                        <el-form ref="monetaryForm" :model="monetaryForm" label-width="100px">
                            <el-form-item label="捐赠金额">
                                <div class="amount-selector">
                                    <el-button 
                                        v-for="amount in [50, 100, 500, 1000, 5000]" 
                                        :key="amount"
                                        :type="monetaryForm.amount === amount ? 'primary' : 'default'"
                                        @click="monetaryForm.amount = amount">
                                        ¥{{amount}}
                                    </el-button>
                                    <el-input 
                                        v-model.number="monetaryForm.customAmount" 
                                        placeholder="自定义金额"
                                        @input="monetaryForm.amount = monetaryForm.customAmount">
                                        <template slot="prepend">¥</template>
                                    </el-input>
                                </div>
                            </el-form-item>

                            <el-form-item label="支付方式">
                                <el-radio v-model="monetaryForm.paymentMethod" label="wechat">微信支付</el-radio>
                                <el-radio v-model="monetaryForm.paymentMethod" label="alipay">支付宝</el-radio>
                                <el-radio v-model="monetaryForm.paymentMethod" label="card">银行卡</el-radio>
                            </el-form-item>

                            <el-form-item label="捐赠名义">
                                <el-input v-model="monetaryForm.donorName" placeholder="请输入您的名字或昵称"></el-input>
                            </el-form-item>

                            <el-form-item label="联系方式">
                                <el-input v-model="monetaryForm.phone" placeholder="请输入联系电话（可选）"></el-input>
                            </el-form-item>

                            <el-form-item label="邮箱">
                                <el-input v-model="monetaryForm.email" type="email" placeholder="请输入邮箱（可选）"></el-input>
                            </el-form-item>

                            <el-form-item label="匿名捐赠">
                                <el-checkbox v-model="monetaryForm.isAnonymous">匿名捐赠</el-checkbox>
                            </el-form-item>

                            <el-form-item label="留言">
                                <el-input 
                                    v-model="monetaryForm.message" 
                                    type="textarea" 
                                    placeholder="您的祝福和寄语（可选）"
                                    rows="3">
                                </el-input>
                            </el-form-item>

                            <el-form-item>
                                <el-checkbox v-model="monetaryForm.agreeTerms">
                                    我同意捐赠协议和隐私政策
                                </el-checkbox>
                            </el-form-item>

                            <el-form-item>
                                <el-button 
                                    type="primary" 
                                    @click="submitMonetaryDonation"
                                    :disabled="!monetaryForm.agreeTerms">
                                    立即捐赠 ¥{{monetaryForm.amount || 0}}
                                </el-button>
                                <el-button @click="resetMonetaryForm">重置</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>

                <!-- 物资捐赠表单 -->
                <div v-if="activeTab === 'goods'" class="form-wrapper">
                    <div class="form-container">
                        <h3>物资捐赠</h3>
                        <el-form ref="goodsForm" :model="goodsForm" label-width="100px">
                            <el-form-item label="物资类型">
                                <el-select v-model="goodsForm.goodsType" placeholder="请选择物资类型">
                                    <el-option label="食物" value="food"></el-option>
                                    <el-option label="日用品" value="supplies"></el-option>
                                    <el-option label="医疗用品" value="medical"></el-option>
                                    <el-option label="玩具" value="toys"></el-option>
                                    <el-option label="其他" value="other"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="物资描述">
                                <el-input 
                                    v-model="goodsForm.description" 
                                    type="textarea" 
                                    placeholder="请详细描述物资内容、新旧情况等"
                                    rows="4">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="物资数量">
                                <el-input v-model.number="goodsForm.quantity" placeholder="请输入数量（可选）"></el-input>
                            </el-form-item>

                            <el-form-item label="捐赠人姓名">
                                <el-input v-model="goodsForm.donorName" placeholder="请输入您的名字"></el-input>
                            </el-form-item>

                            <el-form-item label="联系电话">
                                <el-input v-model="goodsForm.phone" placeholder="请输入联系电话"></el-input>
                            </el-form-item>

                            <el-form-item label="邮箱">
                                <el-input v-model="goodsForm.email" type="email" placeholder="请输入邮箱（可选）"></el-input>
                            </el-form-item>

                            <el-form-item label="物资地点">
                                <el-input v-model="goodsForm.location" placeholder="物资所在地点"></el-input>
                            </el-form-item>

                            <el-form-item label="送达方式">
                                <el-radio v-model="goodsForm.deliveryMethod" label="self">自己送达</el-radio>
                                <el-radio v-model="goodsForm.deliveryMethod" label="pickup">上门取货</el-radio>
                            </el-form-item>

                            <el-form-item>
                                <el-checkbox v-model="goodsForm.agreeTerms">
                                    我同意物资捐赠协议
                                </el-checkbox>
                            </el-form-item>

                            <el-form-item>
                                <el-button 
                                    type="primary" 
                                    @click="submitGoodsDonation"
                                    :disabled="!goodsForm.agreeTerms">
                                    提交物资信息
                                </el-button>
                                <el-button @click="resetGoodsForm">重置</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>

            </div>

            <!-- 捐赠信息展示 -->
            <div class="donation-stats">
                <div class="section-title">
                    <h2>捐赠统计</h2>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">¥ {{formatAmount(donationStats.totalAmount)}}</div>
                        <div class="stat-label">累计捐赠金额</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{{formatNumber(donationStats.totalDonations)}}</div>
                        <div class="stat-label">捐赠人次</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{{formatNumber(donationStats.monetaryCount)}}</div>
                        <div class="stat-label">金钱捐赠</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{{formatNumber(donationStats.goodsCount)}}</div>
                        <div class="stat-label">物资捐赠</div>
                    </div>
                </div>
            </div>

            <!-- 捐赠排行 -->
            <div class="donation-ranking">
                <div class="section-title">
                    <h2>捐赠排行榜</h2>
                </div>

                <div class="ranking-container">
                    <div class="ranking-table">
                        <div class="ranking-header">
                            <div class="rank-col">排名</div>
                            <div class="donor-col">捐赠人</div>
                            <div class="amount-col">捐赠金额</div>
                            <div class="date-col">最近捐赠</div>
                        </div>
                        <div v-for="(item, index) in donationRanking" :key="index" class="ranking-item">
                            <div class="rank-col">
                                <span :class="['rank-badge', `rank-${index + 1}`]">{{index + 1}}</span>
                            </div>
                            <div class="donor-col">
                                <span :class="{'anonymous': item.anonymous}">{{item.donorName}}</span>
                            </div>
                            <div class="amount-col">¥ {{formatAmount(item.totalAmount)}}</div>
                            <div class="date-col">{{formatDateTime(item.lastDonationDate)}}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 常见问题 -->
            <div class="faq-section">
                <div class="section-title">
                    <h2>常见问题</h2>
                </div>

                <el-collapse>
                    <el-collapse-item title="捐赠的资金如何使用?" name="1">
                        <div class="faq-content">
                            所有捐赠资金用于：
                            <ul>
                                <li>流浪动物的救助和治疗费用</li>
                                <li>动物的日常饲养和护理</li>
                                <li>兽医诊疗和疫苗接种</li>
                                <li>运营和设备维护</li>
                            </ul>
                            我们每月公开财务报告，确保资金透明使用。
                        </div>
                    </el-collapse-item>

                    <el-collapse-item title="如何获得捐赠发票?" name="2">
                        <div class="faq-content">
                            在金钱捐赠表单中勾选"需要发票"，填写相关信息后，我们将在捐赠后7个工作日内邮寄正式发票。
                        </div>
                    </el-collapse-item>

                    <el-collapse-item title="可以匿名捐赠吗?" name="3">
                        <div class="faq-content">
                            可以。在填写捐赠信息时，您可以使用化名或"爱心人士"等匿名名义进行捐赠。我们尊重每位捐赠者的隐私。
                        </div>
                    </el-collapse-item>

                    <el-collapse-item title="物资捐赠有什么要求?" name="4">
                        <div class="faq-content">
                            物资应符合以下条件：
                            <ul>
                                <li>物资应清洁、卫生、未过期</li>
                                <li>包装完整，无明显破损</li>
                                <li>特殊物品需提供合格证或说明</li>
                                <li>医疗用品需提供有效期证明</li>
                            </ul>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </div>
        </div>

        <!-- 捐赠成功对话框 -->
        <el-dialog
            :visible.sync="donationSuccessVisible"
            width="400px"
            :close-on-click-modal="false"
            @close="handleDialogClose">
            <div class="success-dialog">
                <div class="success-icon">✓</div>
                <h3>{{successMessage}}</h3>
                <p>感谢您的支持！我们会将您的爱心转化为行动，帮助更多的流浪动物。</p>
                <el-button type="primary" @click="handleDialogClose" class="full-width">
                    关闭
                </el-button>
            </div>
        </el-dialog>

        <footer-layout></footer-layout>
    </div>
</template>

<script>
import { createDonation, getDonationStats, getDonationRanking } from '@/utils/api'

export default {
    name: 'donatePage',
    data() {
        return {
            activeTab: 'monetary',
            donationSuccessVisible: false,
            successMessage: '',
            
            // 金钱捐赠表单
            monetaryForm: {
                amount: 100,
                customAmount: '',
                paymentMethod: 'wechat',
                donorName: '',
                phone: '',
                email: '',
                isAnonymous: false,
                message: '',
                agreeTerms: false
            },

            // 物资捐赠表单
            goodsForm: {
                goodsType: '',
                description: '',
                quantity: '',
                donorName: '',
                phone: '',
                email: '',
                location: '',
                deliveryMethod: 'self',
                agreeTerms: false
            },


            // 捐赠统计数据
            donationStats: {
                totalDonations: 0,
                totalAmount: 0,
                monetaryCount: 0,
                goodsCount: 0
            },
            // 捐赠排行数据
            donationRanking: []
        }
    },
    mounted() {
        this.loadDonationStats()
        this.loadDonationRanking()
    },
    methods: {
        async submitMonetaryDonation() {
            if (!this.monetaryForm.donorName) {
                this.$message.error('请输入捐赠名义');
                return;
            }
            if (!this.monetaryForm.amount || this.monetaryForm.amount <= 0) {
                this.$message.error('请输入有效的捐赠金额');
                return;
            }
            if (!this.monetaryForm.agreeTerms) {
                this.$message.error('请同意捐赠协议');
                return;
            }

            try {
                const donationData = {
                    donation_type: 'monetary',
                    amount: parseFloat(this.monetaryForm.amount),
                    donor_name: this.monetaryForm.donorName,
                    donor_phone: this.monetaryForm.phone || null,
                    donor_email: this.monetaryForm.email || null,
                    payment_method: this.monetaryForm.paymentMethod,
                    is_anonymous: this.monetaryForm.isAnonymous ? 1 : 0,
                    message: this.monetaryForm.message || null
                };

                const response = await createDonation(donationData);
                
                if (response.data && response.data.code === 201) {
                    this.successMessage = `捐赠¥${this.monetaryForm.amount}成功！感谢您的支持！`;
                    this.donationSuccessVisible = true;
                    this.resetMonetaryForm();
                    // 刷新统计数据
                    this.loadDonationStats();
                    this.loadDonationRanking();
                } else {
                    this.$message.error(response.data?.message || '捐赠失败');
                }
            } catch (error) {
                console.error('捐赠失败:', error);
                this.$message.error(error.data?.message || '捐赠失败，请重试');
            }
        },

        async submitGoodsDonation() {
            if (!this.goodsForm.goodsType || !this.goodsForm.description) {
                this.$message.error('请填写物资信息');
                return;
            }
            if (!this.goodsForm.donorName || !this.goodsForm.phone) {
                this.$message.error('请填写您的联系信息');
                return;
            }
            if (!this.goodsForm.agreeTerms) {
                this.$message.error('请同意物资捐赠协议');
                return;
            }

            try {
                // 将物资类型转换为中文名称
                const goodsTypeMap = {
                    'food': '食物',
                    'supplies': '日用品',
                    'medical': '医疗用品',
                    'toys': '玩具',
                    'other': '其他'
                };
                
                const donationData = {
                    donation_type: 'goods',
                    goods_name: goodsTypeMap[this.goodsForm.goodsType] || this.goodsForm.goodsType || '其他',
                    goods_description: this.goodsForm.description,
                    goods_quantity: this.goodsForm.quantity ? parseInt(this.goodsForm.quantity) : null,
                    donor_name: this.goodsForm.donorName,
                    donor_phone: this.goodsForm.phone,
                    donor_email: this.goodsForm.email || null,
                    message: `物资地点：${this.goodsForm.location || '未填写'}，送达方式：${this.goodsForm.deliveryMethod === 'self' ? '自己送达' : '上门取货'}`
                };

                const response = await createDonation(donationData);
                
                if (response.data && response.data.code === 201) {
                    this.successMessage = '物资捐赠信息已提交，我们将与您联系安排取货或接收。';
                    this.donationSuccessVisible = true;
                    this.resetGoodsForm();
                } else {
                    this.$message.error(response.data?.message || '提交失败');
                }
            } catch (error) {
                console.error('提交失败:', error);
                this.$message.error(error.data?.message || '提交失败，请重试');
            }
        },

        resetMonetaryForm() {
            this.monetaryForm = {
                amount: 100,
                customAmount: '',
                paymentMethod: 'wechat',
                donorName: '',
                phone: '',
                email: '',
                isAnonymous: false,
                message: '',
                agreeTerms: false
            };
        },

        resetGoodsForm() {
            this.goodsForm = {
                goodsType: '',
                description: '',
                quantity: '',
                donorName: '',
                phone: '',
                email: '',
                location: '',
                deliveryMethod: 'self',
                agreeTerms: false
            };
        },


        handleDialogClose() {
            this.donationSuccessVisible = false;
        },

        async loadDonationStats() {
            try {
                const response = await getDonationStats();
                if (response.data && response.data.code === 200) {
                    this.donationStats = {
                        totalDonations: response.data.data.totalDonations || 0,
                        totalAmount: parseFloat(response.data.data.totalAmount || 0),
                        monetaryCount: response.data.data.monetaryCount || 0,
                        goodsCount: response.data.data.goodsCount || 0
                    };
                }
            } catch (error) {
                console.error('加载统计数据失败:', error);
            }
        },

        async loadDonationRanking() {
            try {
                const response = await getDonationRanking({ limit: 10 });
                if (response.data && response.data.code === 200) {
                    this.donationRanking = response.data.data || [];
                }
            } catch (error) {
                console.error('加载排行榜失败:', error);
            }
        },

        // 格式化金额
        formatAmount(amount) {
            if (!amount) return '0';
            return parseFloat(amount).toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },

        // 格式化数字
        formatNumber(num) {
            if (!num) return '0';
            return parseInt(num).toLocaleString('zh-CN');
        },

        // 格式化时间戳
        formatDateTime(timestamp) {
            if (!timestamp) return '-';
            const date = new Date(timestamp);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        }
    }
}
</script>

<style scoped lang="less">
.donate-container {
    min-height: 100vh;
    background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
}

.donate-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
}

.page-header {
    text-align: center;
    margin-bottom: 60px;
    padding: 30px 0;

    h1 {
        font-size: 42px;
        color: #333;
        margin: 0 0 15px 0;
        font-weight: 700;
        letter-spacing: 1px;
    }

    p {
        font-size: 18px;
        color: #666;
        margin: 0;
        line-height: 1.6;
    }
}

.section-title {
    margin-bottom: 30px;
    text-align: center;

    h2 {
        font-size: 28px;
        color: #333;
        margin: 0;
        font-weight: bold;
        position: relative;
        display: inline-block;

        &::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #D52B1E, #e85541);
            border-radius: 2px;
        }
    }
}

/* 捐赠方式卡片 */
.donation-methods {
    background: white;
    padding: 30px 40px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    margin-bottom: 40px;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
    }

    .methods-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-top: 25px;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
    }

    .method-card {
        padding: 25px 20px;
        border-radius: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 2px solid #e8e8e8;
        background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #D52B1E, #e85541);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .method-icon {
            font-size: 36px;
            margin-bottom: 12px;
            transition: transform 0.3s ease;
        }

        h3 {
            font-size: 16px;
            margin: 10px 0 8px 0;
            color: #333;
            font-weight: 600;
        }

        p {
            font-size: 12px;
            color: #666;
            margin: 0;
            line-height: 1.4;
        }

        &:hover {
            border-color: #D52B1E;
            background: linear-gradient(135deg, rgba(213, 43, 30, 0.03) 0%, rgba(232, 85, 65, 0.03) 100%);
            transform: translateY(-4px);
            box-shadow: 0 6px 20px rgba(213, 43, 30, 0.15);

            &::before {
                transform: scaleX(1);
            }

            .method-icon {
                transform: scale(1.05);
            }
        }

        &.active {
            border-color: #D52B1E;
            background: linear-gradient(135deg, rgba(213, 43, 30, 0.05) 0%, rgba(232, 85, 65, 0.05) 100%);
            box-shadow: 0 4px 16px rgba(213, 43, 30, 0.2);

            &::before {
                transform: scaleX(1);
            }
        }
    }
}

/* 表单区域 */
.donation-form-section {
    background: white;
    padding: 50px 40px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    margin-bottom: 40px;
    animation: fadeIn 0.3s ease;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
    }

    .form-wrapper {
        animation: slideUp 0.3s ease;
    }

    .form-container {
        max-width: 650px;
        margin: 0 auto;

        h3 {
            font-size: 26px;
            color: #333;
            margin: 0 0 35px 0;
            text-align: center;
            font-weight: 700;
            position: relative;
            padding-bottom: 15px;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 3px;
                background: linear-gradient(90deg, #D52B1E, #e85541);
                border-radius: 2px;
            }
        }

        .amount-selector {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            align-items: center;

            .el-button {
                flex: 0 0 auto;
                min-width: 80px;
                height: 40px;
                padding: 0 20px;
                border-radius: 8px;
                font-weight: 500;
                transition: all 0.3s ease;
                border: 2px solid #e0e0e0;

                &:hover:not(.is-primary) {
                    border-color: #D52B1E;
                    color: #D52B1E;
                    background: rgba(213, 43, 30, 0.05);
                }

                &.is-primary {
                    background: linear-gradient(135deg, #D52B1E, #e85541);
                    border-color: #D52B1E;
                    box-shadow: 0 2px 8px rgba(213, 43, 30, 0.3);
                }
            }

            .el-input {
                flex: 1;
                min-width: 150px;

                /deep/ .el-input__inner {
                    height: 40px;
                    border-radius: 8px;
                    border: 2px solid #e0e0e0;
                    transition: all 0.3s ease;

                    &:focus {
                        border-color: #D52B1E;
                        box-shadow: 0 0 0 3px rgba(213, 43, 30, 0.1);
                    }
                }
            }
        }

        /deep/ .el-form-item {
            margin-bottom: 22px;
        }

        /deep/ .el-form-item__label {
            color: #333;
            font-weight: 500;
            font-size: 14px;
        }

        /deep/ .el-input__inner,
        /deep/ .el-select .el-input__inner,
        /deep/ .el-textarea__inner {
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            transition: all 0.3s ease;
            height: 40px;
            font-size: 14px;

            &:hover {
                border-color: #c0c0c0;
            }

            &:focus {
                border-color: #D52B1E;
                box-shadow: 0 0 0 3px rgba(213, 43, 30, 0.1);
            }
        }

        /deep/ .el-textarea__inner {
            height: auto;
            min-height: 80px;
            padding: 10px 15px;
            line-height: 1.6;
        }

        /deep/ .el-radio {
            margin-right: 25px;
            font-size: 14px;

            .el-radio__label {
                color: #333;
                font-weight: 500;
            }

            .el-radio__input.is-checked .el-radio__inner {
                background-color: #D52B1E;
                border-color: #D52B1E;
            }

            .el-radio__input.is-checked + .el-radio__label {
                color: #D52B1E;
            }
        }

        /deep/ .el-checkbox {
            font-size: 14px;

            .el-checkbox__label {
                color: #666;
            }

            .el-checkbox__input.is-checked .el-checkbox__inner {
                background-color: #D52B1E;
                border-color: #D52B1E;
            }
        }

        .el-button {
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;

            &[type="primary"] {
                background: linear-gradient(135deg, #D52B1E, #e85541);
                border: none;
                width: 100%;
                height: 48px;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(213, 43, 30, 0.25);

                &:hover:not(:disabled) {
                    box-shadow: 0 6px 20px rgba(213, 43, 30, 0.35);
                    transform: translateY(-2px);
                }

                &:active:not(:disabled) {
                    transform: translateY(0);
                }
            }

            &:not([type="primary"]) {
                border: 2px solid #e0e0e0;
                color: #666;
                background: white;

                &:hover {
                    border-color: #D52B1E;
                    color: #D52B1E;
                    background: rgba(213, 43, 30, 0.05);
                }
            }
        }

        .volunteer-container {
            text-align: center;
            padding: 40px;

            .intro-text {
                font-size: 16px;
                color: #666;
                margin: 20px 0;
            }

            .el-button {
                width: 200px;
                height: 50px;
                font-size: 16px;
            }
        }
    }
}

/* 捐赠统计 */
.donation-stats {
    background: white;
    padding: 50px 40px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    margin-bottom: 40px;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 25px;
        margin-top: 35px;

        .stat-card {
            padding: 35px 25px;
            background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
            border-radius: 12px;
            text-align: center;
            border: 1px solid #e8e8e8;
            border-top: 4px solid #D52B1E;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(213, 43, 30, 0.02) 0%, rgba(232, 85, 65, 0.02) 100%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .stat-number {
                font-size: 36px;
                font-weight: 700;
                color: #D52B1E;
                margin-bottom: 12px;
                position: relative;
                z-index: 1;
                letter-spacing: 0.5px;
            }

            .stat-label {
                font-size: 15px;
                color: #666;
                position: relative;
                z-index: 1;
                font-weight: 500;
            }

            &:hover {
                transform: translateY(-8px);
                box-shadow: 0 8px 24px rgba(213, 43, 30, 0.15);
                border-color: #D52B1E;

                &::before {
                    opacity: 1;
                }
            }
        }
    }
}

/* 捐赠排行 */
.donation-ranking {
    background: white;
    padding: 50px 40px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    margin-bottom: 40px;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
    }

    .ranking-container {
        margin-top: 35px;
    }

    .ranking-table {
        border: 1px solid #e8e8e8;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

        .ranking-header {
            display: grid;
            grid-template-columns: 80px 1fr 150px 150px;
            background: linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%);
            padding: 18px 25px;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #e0e0e0;
            font-size: 15px;
        }

        .ranking-item {
            display: grid;
            grid-template-columns: 80px 1fr 150px 150px;
            padding: 22px 25px;
            border-bottom: 1px solid #f0f0f0;
            align-items: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: white;

            &:last-child {
                border-bottom: none;
            }

            &:hover {
                background: linear-gradient(135deg, rgba(213, 43, 30, 0.03) 0%, rgba(232, 85, 65, 0.03) 100%);
                transform: translateX(4px);
                box-shadow: -4px 0 0 0 #D52B1E;
            }

            .rank-col {
                display: flex;
                align-items: center;
                justify-content: center;

                .rank-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    color: white;
                    font-weight: bold;
                    font-size: 16px;

                    &.rank-1 {
                        background: linear-gradient(135deg, #FFD700, #FFC700);
                        color: #333;
                    }

                    &.rank-2 {
                        background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
                    }

                    &.rank-3 {
                        background: linear-gradient(135deg, #CD7F32, #B87333);
                    }

                    &.rank-1,
                    &.rank-2,
                    &.rank-3 {
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                    }

                    &:not(.rank-1):not(.rank-2):not(.rank-3) {
                        background: #D52B1E;
                    }
                }
            }

            .donor-col {
                span {
                    color: #333;
                    font-weight: 500;

                    &.anonymous {
                        color: #999;
                        font-style: italic;
                    }
                }
            }

            .amount-col {
                color: #D52B1E;
                font-weight: bold;
                text-align: right;
            }

            .date-col {
                color: #666;
                text-align: right;
                font-size: 13px;
            }
        }
    }
}

/* FAQ 区域 */
.faq-section {
    background: white;
    padding: 50px 40px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    margin-bottom: 40px;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
    }

    /deep/ .el-collapse-item__header {
        padding-left: 20px;
        font-weight: 500;
        color: #333;

        &:hover {
            color: #D52B1E;
        }
    }

    /deep/ .el-collapse-item__content {
        padding: 20px;
    }

    .faq-content {
        color: #666;
        line-height: 1.8;

        ul {
            margin: 10px 0;
            padding-left: 20px;

            li {
                margin: 5px 0;
            }
        }
    }
}

/* 成功对话框 */
.success-dialog {
    text-align: center;
    padding: 20px;

    .success-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #D52B1E, #e85541);
        color: white;
        font-size: 48px;
        font-weight: bold;
        margin-bottom: 20px;
    }

    h3 {
        font-size: 20px;
        color: #333;
        margin: 0 0 10px 0;
    }

    p {
        font-size: 14px;
        color: #666;
        margin: 10px 0;
        line-height: 1.6;
    }

    .full-width {
        width: 100%;
        margin-top: 20px;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(10px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* 响应式 */
@media (max-width: 768px) {
    .page-header h1 {
        font-size: 24px;
    }

    .section-title h2 {
        font-size: 20px;
    }

    .donation-methods {
        padding: 20px;

        .methods-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    .donation-form-section {
        padding: 20px;
    }

    .ranking-table {
        .ranking-header,
        .ranking-item {
            grid-template-columns: 60px 1fr 100px;

            .date-col {
                display: none;
            }
        }
    }
}
</style>

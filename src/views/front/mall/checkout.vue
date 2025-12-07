<template>
  <div class="checkout-container">
    <header-layout></header-layout>

    <!-- 导航面包屑 -->
    <div class="breadcrumb-section">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/mall/shop' }">商城</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/mall/cart' }">购物车</el-breadcrumb-item>
        <el-breadcrumb-item>订单结算</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="checkout-content">
      <h1>订单结算</h1>

      <!-- 步骤条 -->
      <el-steps :active="activeStep" align-center style="margin-bottom: 30px;">
        <el-step title="填写收货地址"></el-step>
        <el-step title="确认订单信息"></el-step>
        <el-step title="支付" icon="el-icon-success"></el-step>
      </el-steps>

      <div class="checkout-main">
        <!-- 步骤1：收货地址 -->
        <el-card v-if="activeStep === 0" class="step-card">
          <span slot="header" class="clearfix">
            <span class="card-title"><i class="el-icon-location"></i> 收货地址</span>
          </span>

          <!-- 显示当前地址 -->
          <div v-if="userAddress && (userAddress.address || userAddress.province || userAddress.city || userAddress.district)" class="address-display">
            <div class="address-item-display">
              <div class="address-content">
                <div class="address-name">
                  <span class="name">{{ userInfo.real_name || userInfo.username }}</span>
                  <span class="phone">{{ userInfo.phone || '未设置' }}</span>
                </div>
                <div class="address-detail">
                  {{ formatAddressDisplay(userAddress) }}
                </div>
              </div>
              <div class="address-actions">
                <el-button type="text" size="small" @click="editAddress">编辑地址</el-button>
              </div>
            </div>
          </div>

          <!-- 无地址时显示添加按钮 -->
          <div v-else class="add-address-section">
            <div class="no-address-tip">
              <i class="el-icon-warning-outline"></i>
              <p>您还没有设置收货地址，请先添加地址</p>
            </div>
            <el-button 
              type="primary" 
              icon="el-icon-plus"
              @click="showAddressForm = true">
              添加收货地址
            </el-button>
          </div>

          <!-- 地址表单 Dialog -->
          <el-dialog 
            :title="userAddress && (userAddress.address || userAddress.province || userAddress.city || userAddress.district) ? '编辑地址' : '添加地址'"
            :visible.sync="showAddressForm"
            width="600px"
            @close="resetAddressForm">
            <el-form ref="addressForm" :model="addressFormData" :rules="addressRules" label-width="100px">
              <el-form-item label="省份" prop="province">
                <el-input v-model="addressFormData.province" placeholder="请输入省份"></el-input>
              </el-form-item>
              <el-form-item label="城市" prop="city">
                <el-input v-model="addressFormData.city" placeholder="请输入城市"></el-input>
              </el-form-item>
              <el-form-item label="区县" prop="district">
                <el-input v-model="addressFormData.district" placeholder="请输入区县"></el-input>
              </el-form-item>
              <el-form-item label="详细地址" prop="address">
                <el-input v-model="addressFormData.address" placeholder="请输入详细地址" type="textarea" rows="3"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="showAddressForm = false">取 消</el-button>
              <el-button type="primary" @click="saveAddress" :loading="savingAddress">确 定</el-button>
            </span>
          </el-dialog>

          <!-- 步骤按钮 -->
          <div class="step-buttons">
            <el-button @click="$router.push('/mall/cart')">返回购物车</el-button>
            <el-button 
              type="primary" 
              @click="nextStep"
              :disabled="!userAddress || !userAddress.address">
              下一步
            </el-button>
          </div>
        </el-card>

        <!-- 步骤2：确认订单 -->
        <el-card v-if="activeStep === 1" class="step-card">
          <span slot="header" class="clearfix">
            <span class="card-title"><i class="el-icon-goods"></i> 订单确认</span>
          </span>

          <!-- 收货地址信息 -->
          <div class="section">
            <h3>收货地址</h3>
            <div class="address-info" v-if="userAddress && userAddress.address">
              <p><strong>{{ userInfo.real_name || userInfo.username }}</strong> {{ userInfo.phone || '未设置' }}</p>
              <p>{{ formatAddressDisplay(userAddress) }}</p>
            </div>
          </div>

          <!-- 订单商品 -->
          <div class="section">
            <h3>订单商品</h3>
            <el-table :data="checkoutItems" style="width: 100%">
              <el-table-column label="商品" width="300">
                <template slot-scope="{ row }">
                  <div style="display: flex; align-items: center;">
                    <img 
                      :src="getProductImage(row)" 
                      :alt="row.name"
                      style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 10px;"
                      v-if="row.image || row.image_url">
                    <span>{{ row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="price" label="单价" align="center" width="120">
                <template slot-scope="{ row }">¥{{ parseFloat(row.price).toFixed(2) }}</template>
              </el-table-column>
              <el-table-column prop="quantity" label="数量" align="center" width="100"></el-table-column>
              <el-table-column label="小计" align="center" width="120">
                <template slot-scope="{ row }">¥{{ (parseFloat(row.price) * parseInt(row.quantity)).toFixed(2) }}</template>
              </el-table-column>
            </el-table>
          </div>



          <!-- 订单备注 -->
          <div class="section">
            <h3>订单备注</h3>
            <el-input 
              v-model="orderForm.remark" 
              type="textarea" 
              placeholder="请输入订单备注（可选）"
              rows="3">
            </el-input>
          </div>

          <!-- 订单统计 -->
          <div class="order-summary">
            <div class="summary-row total">
              <span>应付总额:</span>
              <span>¥{{ productTotal.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 步骤按钮 -->
          <div class="step-buttons">
            <el-button @click="prevStep">上一步</el-button>
            <el-button type="primary" @click="nextStep">确认订单</el-button>
          </div>
        </el-card>

        <!-- 步骤3：支付成功 -->
        <el-card v-if="activeStep === 2" class="step-card">
          <div class="payment-success">
            <div class="success-icon">
              <i class="el-icon-circle-check"></i>
            </div>
            <h2>订单提交成功！</h2>
            <p class="order-number">订单号: {{ orderNumber }}</p>
            
            <div class="success-info">
              <div class="info-item">
                <span class="label">收货地址:</span>
                <span class="value" v-if="userAddress && (userAddress.address || userAddress.province || userAddress.city || userAddress.district)">
                  {{ userInfo.real_name || userInfo.username }} {{ userInfo.phone || '未设置' }} {{ formatAddressDisplay(userAddress) }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">订单金额:</span>
                <span class="value price">¥{{ productTotal.toFixed(2) }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <el-button @click="$router.push('/user/orders')">查看订单</el-button>
              <el-button type="primary" @click="$router.push('/mall/shop')">继续购物</el-button>
            </div>

            <div class="tips">
              <p>感谢您的购买！我们会尽快为您发货。</p>
              <p>您可以在"我的订单"中查看订单状态。</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <footer-layout></footer-layout>
  </div>
</template>

<script>
import { getCurrentUser, updateUserProfile, createOrder, API_BASE_URL } from '@/utils/api'

export default {
  name: 'OrderCheckout',
  data() {
    return {
      activeStep: 0,
      showAddressForm: false,
      savingAddress: false,
      userInfo: {},
      userAddress: null, // 用户地址对象
      addressFormData: {
        province: '',
        city: '',
        district: '',
        address: ''
      },
      addressRules: {
        province: [
          { required: true, message: '请输入省份', trigger: 'blur' }
        ],
        city: [
          { required: true, message: '请输入城市', trigger: 'blur' }
        ],
        district: [
          { required: true, message: '请输入区县', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      checkoutItems: [],
      orderForm: {
        remark: ''
      },
      orderNumber: '',
      estimatedDelivery: ''
    }
  },
  computed: {
    productTotal() {
      return this.checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  },
  mounted() {
    this.loadCheckoutData();
    this.loadUserInfo();
  },
  methods: {
    // 加载用户信息
    async loadUserInfo() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.$message.warning('请先登录');
        this.$router.push('/');
        return;
      }

      try {
        const res = await getCurrentUser();
        if (res.data && res.data.code === 200 && res.data.data) {
          this.userInfo = res.data.data;
          // 解析地址
          this.parseUserAddress(res.data.data.address);
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
        this.$message.error('加载用户信息失败');
      }
    },
    
    // 解析用户地址（从字符串或对象）
    parseUserAddress(address) {
      if (!address) {
        this.userAddress = null;
        return;
      }

      // 如果address是对象（之前保存的结构化地址）
      if (typeof address === 'object') {
        this.userAddress = {
          province: address.province || '',
          city: address.city || '',
          district: address.district || '',
          address: address.address || ''
        };
      } else if (typeof address === 'string') {
        // 如果是字符串，尝试解析JSON
        try {
          const parsed = JSON.parse(address);
          if (typeof parsed === 'object') {
            this.userAddress = {
              province: parsed.province || '',
              city: parsed.city || '',
              district: parsed.district || '',
              address: parsed.address || ''
            };
          } else {
            // 纯字符串，作为详细地址
            this.userAddress = {
              province: '',
              city: '',
              district: '',
              address: address
            };
          }
        } catch (e) {
          // 不是JSON，作为详细地址
          this.userAddress = {
            province: '',
            city: '',
            district: '',
            address: address
          };
        }
      }
    },
    
    // 格式化地址显示
    formatAddressDisplay(addressObj) {
      if (!addressObj) return '';
      const parts = [
        addressObj.province,
        addressObj.city,
        addressObj.district,
        addressObj.address
      ].filter(part => part && part.trim());
      return parts.join(' ');
    },
    
    loadCheckoutData() {
      const checkoutData = JSON.parse(localStorage.getItem('petShopCheckout')) || [];
      this.checkoutItems = checkoutData;
      
      if (this.checkoutItems.length === 0) {
        this.$message.warning('购物车为空，请添加商品');
        this.$router.push('/mall/shop');
      }
    },
    
    editAddress() {
      // 如果已有地址，填充表单；否则清空
      if (this.userAddress) {
        this.addressFormData = {
          province: this.userAddress.province || '',
          city: this.userAddress.city || '',
          district: this.userAddress.district || '',
          address: this.userAddress.address || ''
        };
      } else {
        this.addressFormData = {
          province: '',
          city: '',
          district: '',
          address: ''
        };
      }
      this.showAddressForm = true;
    },
    
    resetAddressForm() {
      // 如果已有地址，填充表单；否则清空
      if (this.userAddress) {
        this.addressFormData = {
          province: this.userAddress.province || '',
          city: this.userAddress.city || '',
          district: this.userAddress.district || '',
          address: this.userAddress.address || ''
        };
      } else {
        this.addressFormData = {
          province: '',
          city: '',
          district: '',
          address: ''
        };
      }
    },
    
    // 保存地址
    async saveAddress() {
      this.$refs.addressForm.validate(async (valid) => {
        if (!valid) {
          return false;
        }

        this.savingAddress = true;
        try {
          // 将地址保存为JSON格式，方便后续解析
          const addressObj = {
            province: this.addressFormData.province || '',
            city: this.addressFormData.city || '',
            district: this.addressFormData.district || '',
            address: this.addressFormData.address || ''
          };
          
          // 同时保存JSON格式和拼接字符串（兼容性）
          const addressString = JSON.stringify(addressObj);

          // 更新用户地址
          const res = await updateUserProfile({
            address: addressString
          });

          if (res.data && res.data.code === 200) {
            // 更新本地用户信息
            this.userInfo.address = addressString;
            this.parseUserAddress(addressString);
            this.showAddressForm = false;
            this.$message.success('地址保存成功');
            // 重新加载用户信息以获取最新数据
            await this.loadUserInfo();
          }
        } catch (error) {
          console.error('保存地址失败:', error);
          this.$message.error(error.response?.data?.message || error.data?.message || '保存地址失败');
        } finally {
          this.savingAddress = false;
        }
      });
    },
    nextStep() {
      if (this.activeStep === 0) {
        if (!this.userAddress || (!this.userAddress.address && !this.userAddress.province && !this.userAddress.city && !this.userAddress.district)) {
          this.$message.error('请先设置收货地址');
          return;
        }
      } else if (this.activeStep === 1) {
        // 提交订单
        this.submitOrder();
        return;
      }
      this.activeStep++;
    },
    prevStep() {
      if (this.activeStep > 0) {
        this.activeStep--;
      }
    },
    async submitOrder() {
      try {
        // 准备订单数据
        const orderItems = this.checkoutItems.map(item => ({
          product_id: item.product_id || item.id,
          product_name: item.name,
          product_image: item.image || item.image_url,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity)
        }));

        const addressString = this.formatAddressDisplay(this.userAddress);

        const orderData = {
          user_id: this.userInfo.id || null,
          user_name: this.userInfo.real_name || this.userInfo.username,
          user_phone: this.userInfo.phone,
          user_address: addressString,
          items: orderItems,
          shipping_fee: 0,
          payment_method: 'online',
          remark: this.orderForm.remark || ''
        };

        // 调用后端API创建订单
        const response = await createOrder(orderData);
        
        if (response.data && response.data.code === 201) {
          this.orderNumber = response.data.data.order_no;
          
          // 清空购物车和结算数据
          localStorage.removeItem('petShopCheckout');
          localStorage.removeItem('petShopCart');
          
          // 如果用户已登录，清空后端购物车（后端已处理）
          
          this.activeStep = 2;
          this.$message.success('订单创建成功');
        } else {
          this.$message.error(response.data?.message || '订单创建失败');
        }
      } catch (error) {
        console.error('创建订单失败:', error);
        const errorMessage = error.data?.message || error.message || '订单创建失败，请重试';
        this.$message.error(errorMessage);
      }
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    getProductImage(row) {
      const image = row.image || row.image_url;
      if (!image) return '';
      if (image.startsWith('http')) return image;
      return API_BASE_URL + image;
    }

  }
}
</script>

<style scoped lang="less">
.checkout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.breadcrumb-section {
  padding: 15px 20px;
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
}

.checkout-content {
  flex: 1;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 20px;

  h1 {
    font-size: 24px;
    margin: 0 0 20px 0;
    color: #333;
    font-weight: bold;
  }
}

.checkout-main {
  /deep/ .step-card {
    border-radius: 8px;
    border: 1px solid #e6e6e6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .el-card__header {
      border-bottom: 1px solid #e6e6e6;
      padding: 15px 20px;

      .card-title {
        font-size: 16px;
        font-weight: bold;
        color: #333;

        i {
          margin-right: 8px;
          color: #D52B1E;
        }
      }
    }

    .el-card__body {
      padding: 20px;
    }
  }
}

// 地址显示部分
.address-display {
  margin-bottom: 20px;

  .address-item-display {
    display: flex;
    gap: 15px;
    padding: 15px;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    background-color: #fafafa;
    transition: all 0.3s ease;

    &:hover {
      border-color: #D52B1E;
      background-color: #ffe6e3;
    }

    .address-content {
      flex: 1;

      .address-name {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 5px;

        .name {
          font-weight: bold;
          color: #333;
        }

        .phone {
          color: #666;
          font-size: 13px;
        }
      }

      .address-detail {
        font-size: 13px;
        color: #999;
        line-height: 1.6;
      }
    }

    .address-actions {
      flex-shrink: 0;
      display: flex;
      gap: 10px;
    }
  }
}

.no-address-tip {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
  color: #999;
  
  i {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 10px;
  }
  
  p {
    margin: 10px 0;
    font-size: 14px;
  }
}

.add-address-section {
  text-align: center;
  padding: 20px;

  /deep/ .el-button {
    width: 100%;
    background-color: #D52B1E !important;
    border-color: #D52B1E !important;
    color: white !important;

    &:hover {
      background-color: #c21d0f !important;
      border-color: #c21d0f !important;
    }
  }
}

// 订单确认部分
.section {
  margin-bottom: 25px;

  h3 {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin: 0 0 15px 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #e6e6e6;
  }

  .address-info {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;

    p {
      margin: 5px 0;
      color: #666;
      font-size: 13px;

      strong {
        color: #333;
      }
    }
  }

  /deep/ .el-table {
    margin-bottom: 10px;
  }

      /deep/ .el-radio-group {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .el-radio {
          display: flex;
          align-items: center;
          padding: 10px;
          border: 1px solid #e6e6e6;
          border-radius: 4px;
          background-color: #fafafa;
          transition: all 0.3s ease;

          &:hover {
            border-color: #D52B1E;
            background-color: #ffe6e3;
          }

          &.is-checked {
            border-color: #D52B1E;
            background-color: #ffe6e3;
          }

      .price {
        color: #ff6b6b;
        font-weight: bold;
      }
    }
  }

  /deep/ .el-textarea {
    .el-textarea__inner {
      border-radius: 4px;
    }
  }
}

.order-summary {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;

  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
    color: #666;

    &.total {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      border-top: 1px solid #e6e6e6;
      padding-top: 10px;
      margin-top: 10px;

      span:last-child {
        color: #ff6b6b;
      }
    }
  }
}

// 支付成功部分
.payment-success {
  text-align: center;
  padding: 40px 20px;

  .success-icon {
    width: 80px;
    height: 80px;
    background-color: #ffe6e3;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;

    i {
      font-size: 48px;
      color: #D52B1E;
    }
  }

  h2 {
    font-size: 24px;
    color: #333;
    margin: 0 0 10px 0;
  }

  .order-number {
    font-size: 14px;
    color: #666;
    margin: 0 0 30px 0;
    font-weight: bold;
  }

  .success-info {
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 30px;
    text-align: left;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px 0;
      border-bottom: 1px solid #e6e6e6;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: bold;
        color: #666;
        min-width: 80px;
      }

      .value {
        color: #333;
        flex: 1;
        text-align: right;

        &.price {
          color: #ff6b6b;
          font-weight: bold;
          font-size: 16px;
        }
      }
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 30px;

    /deep/ .el-button {
      width: 150px;
      height: 40px;
    }
  }

  .tips {
    background-color: #f0f9ff;
    border-left: 4px solid #667eea;
    padding: 15px;
    border-radius: 4px;

    p {
      margin: 5px 0;
      color: #667eea;
      font-size: 13px;

      &:first-child {
        margin-top: 0;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 步骤按钮
.step-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e6e6e6;

  /deep/ .el-button {
    width: 120px;
    height: 40px;
    background-color: #D52B1E !important;
    border-color: #D52B1E !important;
    color: white !important;

    &:hover {
      background-color: #c21d0f !important;
      border-color: #c21d0f !important;
    }

    &.is-plain {
      background-color: white !important;
      border-color: #D52B1E !important;
      color: #D52B1E !important;

      &:hover {
        background-color: #ffe6e3 !important;
        border-color: #D52B1E !important;
        color: #D52B1E !important;
      }
    }
  }
}

@media (max-width: 768px) {
  .checkout-content {
    padding: 15px 10px;

    h1 {
      font-size: 20px;
    }
  }

  .address-list .address-item {
    flex-direction: column;

    .address-actions {
      justify-content: flex-start;
    }
  }

  .step-buttons {
    flex-direction: column-reverse;

    /deep/ .el-button {
      width: 100%;
    }
  }
}
</style>

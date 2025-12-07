<template>
  <div class="cart-container">
    <header-layout></header-layout>

    <!-- 导航面包屑 -->
    <div class="breadcrumb-section">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/mall/shop' }">商城</el-breadcrumb-item>
        <el-breadcrumb-item>购物车</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="cart-content">
      <h1>购物车</h1>

      <div v-if="cartItems.length > 0" class="cart-wrapper">
        <div class="cart-main">
          <!-- 购物车头部 -->
          <div class="cart-header">
            <el-checkbox v-model="selectAll" @change="toggleSelectAll">全选</el-checkbox>
            <span class="column-name">商品</span>
            <span class="column-unit-price">单价</span>
            <span class="column-quantity">数量</span>
            <span class="column-total-price">小计</span>
            <span class="column-action">操作</span>
          </div>

          <!-- 购物车商品列表 -->
          <div class="cart-items">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <el-checkbox v-model="item.checked" @change="updateTotal"></el-checkbox>
              <div class="item-product">
                <img :src="item.image" :alt="item.name" class="item-image">
                <div class="item-details">
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.description }}</p>
                </div>
              </div>
              <span class="item-unit-price">¥{{ item.price }}</span>
              <div class="item-quantity">
                <el-input-number 
                  v-model="item.quantity" 
                  :min="1" 
                  :max="item.stock || 999"
                  size="small"
                  @change="handleQuantityChange(item)">
                </el-input-number>
              </div>
              <span class="item-total-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              <span class="item-action">
                <el-button type="text" size="small" @click="removeItem(item)">删除</el-button>
              </span>
            </div>
          </div>

          <!-- 批量删除 -->
          <div class="batch-action">
            <el-button 
              v-if="selectedCount > 0" 
              type="danger" 
              size="small"
              @click="batchDelete">
              删除选中 ({{ selectedCount }})
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="continueShopping">
              继续购物
            </el-button>
          </div>
        </div>

        <!-- 购物车右侧统计 -->
        <div class="cart-summary">
          <div class="summary-card">
            <h3>订单汇总</h3>
            <div class="summary-row">
              <span class="summary-label">商品件数:</span>
              <span class="summary-value">{{ totalItems }} 件</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">已选商品:</span>
              <span class="summary-value">{{ selectedCount }} 件</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">商品总额:</span>
              <span class="summary-value">¥{{ totalAmount.toFixed(2) }}</span>
            </div>
            <div class="divider"></div>
            <div class="summary-row total">
              <span class="summary-label">应付金额:</span>
              <span class="summary-value total-price">¥{{ selectedTotal.toFixed(2) }}</span>
            </div>
            <el-button 
              class="checkout-btn" 
              type="primary" 
              size="large"
              :disabled="selectedCount === 0"
              @click="goToCheckout">
              去结算 ({{ selectedCount }})
            </el-button>
            <div class="tips">
              <p><i class="el-icon-info"></i> 选中商品后可进行结算</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-cart">
        <i class="el-icon-loading"></i>
        <p>加载中...</p>
      </div>

      <!-- 购物车空状态 -->
      <div v-else class="empty-cart">
        <i class="el-icon-shopping-cart-1"></i>
        <h2>购物车为空</h2>
        <p>还没有添加任何商品，赶快去添加吧！</p>
        <el-button type="primary" @click="continueShopping">继续购物</el-button>
      </div>
    </div>

    <footer-layout></footer-layout>
  </div>
</template>

<script>
import { getCartItems, updateCartItem, removeCartItem, batchRemoveCartItems } from '@/utils/api'
import { API_BASE_URL } from '@/utils/api'

export default {
  name: 'ShoppingCart',
  data() {
    return {
      cartItems: [],
      selectAll: false,
      loading: false
    }
  },
  computed: {
    selectedCount() {
      return this.cartItems.filter(item => item.checked).length;
    },
    totalItems() {
      return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    },
    totalAmount() {
      return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    selectedTotal() {
      return this.cartItems
        .filter(item => item.checked)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  },
  mounted() {
    this.loadCart();
  },
  methods: {
    // 加载购物车数据
    async loadCart() {
      // 检查是否登录
      const token = localStorage.getItem('token');
      if (!token) {
        // 未登录，使用localStorage
        this.loadCartFromLocalStorage();
        return;
      }

      this.loading = true;
      try {
        const res = await getCartItems();
        if (res.data && res.data.code === 200) {
          // 处理商品数据，转换为前端需要的格式
          this.cartItems = (res.data.data || []).map(item => ({
            id: item.product_id, // 使用product_id作为key，兼容前端
            cart_id: item.cart_id,
            product_id: item.product_id,
            name: item.name,
            price: parseFloat(item.price) || 0,
            originalPrice: item.original_price || null,
            image: this.getImageUrl(item.image),
            description: item.description || '',
            quantity: parseInt(item.quantity) || 1,
            stock: parseInt(item.stock) || 0,
            checked: item.checked !== undefined ? item.checked : true
          }));
          this.updateSelectAllStatus();
        }
      } catch (error) {
        console.error('加载购物车失败:', error);
        // 如果API失败，尝试从localStorage加载
        this.loadCartFromLocalStorage();
      } finally {
        this.loading = false;
      }
    },
    
    // 从localStorage加载购物车（兼容未登录用户）
    loadCartFromLocalStorage() {
      const cart = JSON.parse(localStorage.getItem('petShopCart')) || [];
      this.cartItems = cart.map(item => ({
        ...item,
        checked: true
      }));
      this.updateSelectAllStatus();
    },
    
    // 获取图片完整URL
    getImageUrl(url) {
      if (!url) return 'https://via.placeholder.com/60x60?text=暂无图片';
      if (url.startsWith('http')) return url;
      return `${API_BASE_URL.replace('/api', '')}${url}`;
    },
    
    // 更新购物车商品数量
    async updateCartQuantity(item) {
      const token = localStorage.getItem('token');
      if (!token) {
        // 未登录，更新localStorage
        this.saveCartToLocalStorage();
        return;
      }

      try {
        await updateCartItem(item.cart_id, { quantity: item.quantity });
        this.$message.success('更新成功');
      } catch (error) {
        console.error('更新购物车失败:', error);
        this.$message.error(error.data?.message || '更新失败');
        // 重新加载购物车
        this.loadCart();
      }
    },
    
    // 删除购物车商品
    async removeItem(item) {
      this.$confirm('是否删除此商品？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const token = localStorage.getItem('token');
        if (token && item.cart_id) {
          // 已登录，调用API删除
          try {
            await removeCartItem(item.cart_id);
            this.cartItems = this.cartItems.filter(cartItem => cartItem.cart_id !== item.cart_id);
            this.$message.success('已删除');
            this.updateSelectAllStatus();
          } catch (error) {
            console.error('删除失败:', error);
            this.$message.error(error.data?.message || '删除失败');
          }
        } else {
          // 未登录，从localStorage删除
          this.cartItems = this.cartItems.filter(cartItem => cartItem.id !== item.id);
          this.saveCartToLocalStorage();
          this.$message.success('已删除');
        }
      }).catch(() => {});
    },
    
    // 批量删除
    async batchDelete() {
      if (this.selectedCount === 0) {
        this.$message.warning('请选择要删除的商品');
        return;
      }

      this.$confirm('确定要删除选中的商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const token = localStorage.getItem('token');
        const selectedItems = this.cartItems.filter(item => item.checked);
        
        if (token) {
          // 已登录，调用API批量删除
          try {
            const ids = selectedItems.map(item => item.cart_id).filter(id => id);
            if (ids.length > 0) {
              await batchRemoveCartItems(ids);
            }
            this.cartItems = this.cartItems.filter(item => !item.checked);
            this.$message.success('已删除选中商品');
            this.updateSelectAllStatus();
          } catch (error) {
            console.error('批量删除失败:', error);
            this.$message.error(error.data?.message || '删除失败');
          }
        } else {
          // 未登录，从localStorage删除
          this.cartItems = this.cartItems.filter(item => !item.checked);
          this.saveCartToLocalStorage();
          this.updateSelectAllStatus();
          this.$message.success('已删除选中商品');
        }
      }).catch(() => {});
    },
    
    // 保存到localStorage（兼容未登录用户）
    saveCartToLocalStorage() {
      const cartData = this.cartItems.map(item => ({
        id: item.product_id || item.id,
        product_id: item.product_id || item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        description: item.description,
        quantity: item.quantity
      }));
      localStorage.setItem('petShopCart', JSON.stringify(cartData));
    },
    toggleSelectAll(value) {
      this.cartItems.forEach(item => {
        item.checked = value;
      });
      this.updateTotal();
    },
    updateSelectAllStatus() {
      this.selectAll = this.cartItems.length > 0 && this.cartItems.every(item => item.checked);
    },
    // 处理数量变化
    handleQuantityChange(item) {
      // 检查库存
      if (item.quantity > item.stock) {
        this.$message.warning(`库存不足，当前库存：${item.stock}`);
        item.quantity = item.stock || 1;
        return;
      }
      
      // 更新购物车
      this.updateCartQuantity(item);
      this.updateSelectAllStatus();
    },
    
    updateTotal() {
      // 更新总价（不需要保存，因为数量变化时已经保存了）
      this.updateSelectAllStatus();
    },
    continueShopping() {
      this.$router.push('/mall/shop');
    },
    goToCheckout() {
      if (this.selectedCount === 0) {
        this.$message.warning('请选择商品后再结算');
        return;
      }
      const selectedItems = this.cartItems.filter(item => item.checked);
      localStorage.setItem('petShopCheckout', JSON.stringify(selectedItems));
      this.$router.push('/mall/checkout');
    }
  }
}
</script>

<style scoped lang="less">
.cart-container {
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

.cart-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 20px;

  h1 {
    font-size: 24px;
    margin: 0 0 30px 0;
    color: #333;
    font-weight: bold;
  }
}

.cart-wrapper {
  display: flex;
  gap: 20px;
}

.cart-main {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  .cart-header {
    display: grid;
    grid-template-columns: 40px 1fr 80px 120px 100px 80px;
    gap: 15px;
    align-items: center;
    padding: 15px 20px;
    background-color: #f9f9f9;
    border-bottom: 1px solid #e6e6e6;
    font-weight: bold;
    font-size: 13px;
    color: #666;

    /deep/ .el-checkbox__input {
      height: 14px;
      width: 14px;
    }

    .column-name,
    .column-unit-price,
    .column-quantity,
    .column-total-price,
    .column-action {
      text-align: center;
    }
  }

  .cart-items {
    .cart-item {
      display: grid;
      grid-template-columns: 40px 1fr 80px 120px 100px 80px;
      gap: 15px;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #fafafa;
      }

      /deep/ .el-checkbox__input {
        height: 14px;
        width: 14px;
      }

      .item-product {
        display: flex;
        gap: 12px;
        align-items: center;

        .item-image {
          width: 60px;
          height: 60px;
          border-radius: 4px;
          object-fit: cover;
          background-color: #f5f7fa;
        }

        .item-details {
          flex: 1;

          h4 {
            font-size: 13px;
            margin: 0 0 4px 0;
            color: #333;
            font-weight: bold;
          }

          p {
            font-size: 12px;
            color: #999;
            margin: 0;
          }
        }
      }

      .item-unit-price {
        text-align: center;
        color: #ff6b6b;
        font-weight: bold;
      }

      .item-quantity {
        text-align: center;

        /deep/ .el-input-number {
          width: 100%;
        }
      }

      .item-total-price {
        text-align: center;
        color: #ff6b6b;
        font-weight: bold;
        font-size: 14px;
      }

      .item-action {
        text-align: center;

        /deep/ .el-button {
          color: #ff6b6b;

          &:hover {
            color: #ff5252;
          }
        }
      }
    }
  }

  .batch-action {
    padding: 15px 20px;
    border-top: 1px solid #e6e6e6;
    background-color: #fafafa;
    display: flex;
    gap: 10px;
  }
}

.cart-summary {
  width: 320px;
  flex-shrink: 0;

  .summary-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    position: sticky;
    top: 80px;

    h3 {
      font-size: 16px;
      margin: 0 0 20px 0;
      color: #333;
      font-weight: bold;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      font-size: 13px;

      .summary-label {
        color: #666;
      }

      .summary-value {
        color: #333;
        font-weight: bold;
      }

      &.total {
        font-size: 16px;
        padding: 15px 0;

        .total-price {
          color: #ff6b6b;
          font-size: 18px;
        }
      }
    }

    .divider {
      height: 1px;
      background-color: #e6e6e6;
      margin: 15px 0;
    }

    .checkout-btn {
      width: 100%;
      margin-top: 20px;
      height: 44px;
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 2px;
      background-color: #D52B1E !important;
      border-color: #D52B1E !important;

      &:disabled {
        background-color: #e6e6e6 !important;
        border-color: #e6e6e6 !important;
        color: #999 !important;
        cursor: not-allowed;
      }
    }

    .tips {
      margin-top: 15px;
      padding: 10px;
      background-color: #ffe6e3;
      border-radius: 4px;
      font-size: 12px;
      color: #D52B1E;

      p {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }
  }
}

.empty-cart {
  background: white;
  border-radius: 8px;
  padding: 80px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  i {
    font-size: 64px;
    color: #e6e6e6;
    display: block;
    margin-bottom: 20px;
  }

  h2 {
    font-size: 24px;
    color: #333;
    margin: 0 0 10px 0;
  }

  p {
    color: #999;
    margin: 0 0 30px 0;
    font-size: 14px;
  }

  /deep/ .el-button {
    height: 44px;
    padding: 0 40px;
  }
}

.loading-cart {
  background: white;
  border-radius: 8px;
  padding: 80px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  i {
    font-size: 48px;
    color: #999;
    display: block;
    margin-bottom: 20px;
    animation: rotating 2s linear infinite;
  }

  p {
    color: #999;
    font-size: 14px;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .cart-wrapper {
    flex-direction: column;
  }

  .cart-summary {
    width: 100%;

    .summary-card {
      position: static;
    }
  }

  .cart-main {
    .cart-header,
    .cart-item {
      grid-template-columns: auto 1fr auto !important;
      gap: 10px !important;

      .column-name,
      .item-product {
        grid-column: 2;
      }

      .column-unit-price,
      .item-unit-price,
      .column-quantity,
      .item-quantity,
      .column-total-price,
      .item-total-price,
      .column-action,
      .item-action {
        grid-column: 3;
      }
    }
  }
}
</style>

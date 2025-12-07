<template>
  <div class="product-detail-container">
    <header-layout></header-layout>

    <!-- 面包屑导航 -->
    <div class="breadcrumb-section">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/mall/shop' }">宠物用品</el-breadcrumb-item>
        <el-breadcrumb-item>商品详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-wrapper">
      <div class="loading-content">
        <i class="el-icon-loading"></i>
        <p>加载中...</p>
      </div>
    </div>

    <!-- 商品详情 -->
    <div class="detail-wrapper" v-else-if="product">
      <div class="detail-container">
        <!-- 图片区域 -->
        <div class="image-section">
          <div class="main-image">
            <img :src="product.image" :alt="product.name" @error="handleImageError">
          </div>
          <!-- 图片列表（如果有多张图片） -->
          <div v-if="product.images && product.images.length > 1" class="image-thumbs">
            <div v-for="(img, index) in product.images" :key="index" class="thumb-item"
              :class="{ active: currentImageIndex === index }" @click="switchImage(index)">
              <img :src="getImageUrl(img)" :alt="product.name">
            </div>
          </div>
        </div>

        <!-- 信息区域 -->
        <div class="info-section">
          <h1 class="product-title">{{ product.name }}</h1>

          <!-- 评分和销量 -->
          <div class="rating-section">
            <span class="rating">
              <i class="el-icon-star-on"></i>
              {{ product.rating }} ({{ product.sales }}人购买)
            </span>
          </div>

          <!-- 价格 -->
          <div class="price-section">
            <span class="current-price">¥{{ product.price }}</span>
            <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
            <span v-if="product.discount" class="discount">{{ product.discount }}折</span>
          </div>

          <!-- 商品描述 -->
          <div class="description">
            <h3>商品描述</h3>
            <p>{{ product.description }}</p>
          </div>

          <!-- 商品信息 -->
          <div class="category-info">
            <div class="info-item">
              <span class="label">分类：</span>
              <span class="value">{{ product.category || product.category_name }}</span>
            </div>
            <div class="info-item" v-if="product.stock !== undefined">
              <span class="label">库存：</span>
              <span class="value" :class="{ 'stock-low': product.stock < 10 }">
                {{ product.stock > 0 ? `${product.stock} 件` : '缺货' }}
              </span>
            </div>
            <div class="info-item" v-if="product.specifications">
              <span class="label">规格：</span>
              <span class="value">{{ product.specifications }}</span>
            </div>
          </div>

          <!-- 购买按钮 -->
          <div class="action-buttons">
            <el-button type="primary" size="large" class="add-cart-btn" @click="addToCart">
              <i class="el-icon-shopping-cart-1"></i> 加入购物车
            </el-button>
            <el-button size="large" @click="goToShop">
              继续购物
            </el-button>
            <el-button size="large" @click="goBack">
              返回
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <footer-layout></footer-layout>
  </div>
</template>

<script>
import { getProductDetail, addToCartAPI } from '@/utils/api'
import { API_BASE_URL } from '@/utils/api'

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      loading: false,
      currentImageIndex: 0
    }
  },
  mounted() {
    this.loadProduct();
  },
  methods: {
    async loadProduct() {
      // 从路由参数获取商品ID
      const productId = this.$route.query.id;

      if (!productId) {
        // 如果没有ID，尝试从localStorage获取（兼容旧方式）
        const currentProduct = localStorage.getItem('currentProduct');
        if (currentProduct) {
          try {
            this.product = JSON.parse(currentProduct);
            return;
          } catch (e) {
            console.error('解析商品信息失败:', e);
          }
        }
        this.$message.warning('未找到商品信息');
        this.$router.push('/mall/shop');
        return;
      }

      this.loading = true;
      try {
        const res = await getProductDetail(productId);
        if (res.data && res.data.code === 200 && res.data.data) {
          const item = res.data.data;

          // 处理商品数据
          this.product = {
            id: item.id,
            name: item.name,
            category: item.category_name || '',
            category_name: item.category_name || '',
            category_id: item.category_id,
            price: parseFloat(item.price) || 0,
            originalPrice: item.original_price ? parseFloat(item.original_price) : null,
            discount: item.original_price && item.price
              ? Math.round((1 - parseFloat(item.price) / parseFloat(item.original_price)) * 10) / 10
              : null,
            image: this.getImageUrl(item.image_url || item.images),
            images: this.parseImages(item.images || item.image_url),
            description: item.description || '',
            rating: parseFloat(item.rating) || 5.0,
            sales: parseInt(item.sales_count) || 0,
            sales_count: parseInt(item.sales_count) || 0,
            stock: parseInt(item.stock) || 0,
            specifications: item.specifications || '',
            is_hot: item.is_hot || 0,
            is_new: item.is_new || 0
          };

          // 设置默认显示第一张图片
          if (this.product.images && this.product.images.length > 0) {
            this.currentImageIndex = 0;
            this.product.image = this.getImageUrl(this.product.images[0]);
          }
        } else {
          this.$message.error('商品不存在');
          this.$router.push('/mall/shop');
        }
      } catch (error) {
        console.error('加载商品详情失败:', error);
        this.$message.error('加载商品详情失败');
        this.$router.push('/mall/shop');
      } finally {
        this.loading = false;
      }
    },

    // 解析图片（可能是JSON字符串或单个URL）
    parseImages(images) {
      if (!images) return [];
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [images];
      } catch (e) {
        return typeof images === 'string' ? [images] : [];
      }
    },

    // 获取图片完整URL
    getImageUrl(url) {
      if (!url) return 'https://via.placeholder.com/500x500?text=暂无图片';
      if (url.startsWith('http')) return url;
      return `${API_BASE_URL.replace('/api', '')}${url}`;
    },
    async addToCart() {
      if (!this.product) return;

      // 检查库存
      if (this.product.stock <= 0) {
        this.$message.warning('商品已缺货');
        return;
      }

      const token = localStorage.getItem('token');
      
      if (token) {
        // 已登录，调用API添加到购物车
        try {
          await addToCartAPI({
            product_id: this.product.id,
            quantity: 1
          });
          this.$message.success(`${this.product.name} 已添加到购物车`);
          // 触发购物车更新事件
          this.$bus && this.$bus.$emit('cart-updated');
        } catch (error) {
          console.error('添加到购物车失败:', error);
          this.$message.error(error.data?.message || '添加到购物车失败');
        }
      } else {
        // 未登录，使用localStorage
        const cart = JSON.parse(localStorage.getItem('petShopCart')) || [];
        const existingItem = cart.find(item => item.id === this.product.id);

        if (existingItem) {
          // 检查库存是否足够
          if (existingItem.quantity >= this.product.stock) {
            this.$message.warning('库存不足');
            return;
          }
          existingItem.quantity += 1;
        } else {
          cart.push({
            ...this.product,
            quantity: 1
          });
        }

        localStorage.setItem('petShopCart', JSON.stringify(cart));
        this.$message.success(`${this.product.name} 已添加到购物车`);
        // 触发购物车更新事件
        this.$bus && this.$bus.$emit('cart-updated');
      }
    },

    // 切换图片
    switchImage(index) {
      this.currentImageIndex = index;
      if (this.product.images && this.product.images[index]) {
        this.product.image = this.getImageUrl(this.product.images[index]);
      }
    },

    // 图片加载错误处理
    handleImageError(e) {
      e.target.src = 'https://via.placeholder.com/500x500?text=图片加载失败';
    },

    goToShop() {
      this.$router.push('/mall/shop');
    },
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped lang="less">
.product-detail-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.breadcrumb-section {
  padding: 15px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.detail-wrapper {
  flex: 1;
  padding: 30px 20px;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.image-section {
  .main-image {
    width: 100%;
    height: 500px;
    background-color: #f5f7fa;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .image-thumbs {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .thumb-item {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s;

      &.active {
        border-color: #d52b1e;
      }

      &:hover {
        border-color: #d52b1e;
        opacity: 0.8;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .product-title {
    font-size: 28px;
    color: #333;
    margin: 0;
    font-weight: bold;
  }

  .rating-section {
    .rating {
      font-size: 14px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 5px;

      i {
        color: #ffc107;
      }
    }
  }

  .price-section {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background-color: #ffe6e3;
    border-radius: 8px;

    .current-price {
      font-size: 32px;
      color: #d52b1e;
      font-weight: bold;
    }

    .original-price {
      font-size: 16px;
      color: #999;
      text-decoration: line-through;
    }

    .discount {
      background-color: #d52b1e;
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
  }

  .description {
    h3 {
      font-size: 16px;
      color: #333;
      margin: 0 0 10px 0;
      font-weight: bold;
    }

    p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }
  }

  .category-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 8px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 10px;

      .label {
        font-weight: bold;
        color: #333;
      }

      .value {
        color: #666;

        &.stock-low {
          color: #ff6b6b;
          font-weight: bold;
        }
      }
    }
  }

  .loading-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;

    .loading-content {
      text-align: center;
      color: #999;

      i {
        font-size: 48px;
        display: block;
        margin-bottom: 20px;
        animation: rotating 2s linear infinite;
      }

      p {
        font-size: 14px;
      }
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

  .action-buttons {
    display: flex;
    gap: 15px;
    margin-top: 10px;

    /deep/ .el-button {
      flex: 1;
      font-size: 14px;
      font-weight: bold;
    }

    /deep/ .add-cart-btn {
      background-color: #d52b1e !important;
      border-color: #d52b1e !important;
      color: white !important;

      &:hover {
        background-color: #c21d0f !important;
        border-color: #c21d0f !important;
      }
    }
  }
}

@media (max-width: 768px) {
  .detail-container {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }

  .image-section .main-image {
    height: 300px;
  }

  .info-section {
    .product-title {
      font-size: 20px;
    }

    .price-section {
      .current-price {
        font-size: 24px;
      }
    }

    .action-buttons {
      flex-direction: column;
    }
  }
}
</style>

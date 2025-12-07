<template>
  <div class="shop-container">
    <header-layout></header-layout>
    
    <!-- 导航面包屑 -->
    <div class="breadcrumb-section">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>宠物用品商城</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 商城顶部横幅 -->
    <div class="shop-banner">
      <h1>宠物用品商城</h1>
      <p>为您的爱宠提供优质的用品和服务</p>
    </div>

    <div class="shop-content">
      <!-- 左侧分类筛选 -->
      <div class="shop-sidebar">
        <div class="filter-section">
          <h3>商品分类</h3>
          <ul class="category-list">
            <li :class="{ active: activeCategory === 'all' }" @click="activeCategory = 'all'">
              <span>全部商品</span>
              <span class="count">({{ total }})</span>
            </li>
            <li v-for="cat in categoryList" :key="cat.id" 
                :class="{ active: activeCategory === cat.name }" 
                @click="activeCategory = cat.name">
              <span>{{ cat.name }}</span>
            </li>
          </ul>
        </div>

        <div class="filter-section">
          <h3>价格范围</h3>
          <el-slider 
            v-model="priceRange" 
            range 
            :min="0" 
            :max="500" 
            :step="10"
            @change="handlePriceChange">
          </el-slider>
          <div class="price-display">¥{{ priceRange[0] }} - ¥{{ priceRange[1] }}</div>
        </div>

        <div class="filter-section">
          <h3>排序</h3>
          <el-select v-model="sortBy" @change="handleSortChange" placeholder="请选择排序方式">
            <el-option label="默认排序" value="default"></el-option>
            <el-option label="价格从低到高" value="price_asc"></el-option>
            <el-option label="价格从高到低" value="price_desc"></el-option>
            <el-option label="销量最多" value="sales"></el-option>
            <el-option label="最新发布" value="newest"></el-option>
          </el-select>
        </div>
      </div>

      <!-- 右侧商品列表 -->
      <div class="shop-main">
        <!-- 顶部工具栏 -->
        <div class="toolbar">
          <div class="left">
            <span class="result-count">共找到 <strong>{{ filteredProducts.length }}</strong> 件商品</span>
          </div>
          <div class="right">
            <el-button 
              :type="viewType === 'grid' ? 'primary' : 'default'" 
              icon="el-icon-grid" 
              size="small"
              @click="viewType = 'grid'">
              网格视图
            </el-button>
            <el-button 
              :type="viewType === 'list' ? 'primary' : 'default'" 
              icon="el-icon-menu" 
              size="small"
              @click="viewType = 'list'">
              列表视图
            </el-button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <i class="el-icon-loading"></i>
          <p>加载中...</p>
        </div>
        
        <!-- 商品展示区 -->
        <div v-else-if="filteredProducts.length > 0" :class="['products-area', viewType]">
          <!-- 网格视图 -->
          <div v-if="viewType === 'grid'" class="products-grid">
            <div v-for="product in paginatedProducts" :key="product.id" class="product-card" @click="viewProduct(product)">
              <div class="product-image">
                <img :src="product.image" :alt="product.name">
                <div v-if="product.discount" class="discount-badge">
                  <span>{{ (product.discount * 10).toFixed(1) }}折</span>
                </div>
                <div v-if="product.is_hot" class="hot-badge">热销</div>
                <div v-if="product.is_new" class="new-badge">新品</div>
              </div>
              <div class="product-info">
                <h4 class="product-name">{{ product.name }}</h4>
                <p class="product-desc">{{ product.description }}</p>
                <div class="product-meta">
                  <span class="rating">
                    <i class="el-icon-star-on"></i>
                    {{ product.rating }}
                  </span>
                  <span class="sales">销量: {{ product.sales }}</span>
                </div>
                <div class="product-footer">
                  <div class="price-section">
                    <span class="price">¥{{ product.price }}</span>
                    <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
                  </div>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="addToCart(product)">
                    加入购物车
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else class="products-list">
            <div v-for="product in paginatedProducts" :key="product.id" class="product-item">
              <div class="item-image">
                <img :src="product.image" :alt="product.name">
              </div>
              <div class="item-content">
                <h4 class="item-name">{{ product.name }}</h4>
                <p class="item-desc">{{ product.description }}</p>
                <div class="item-meta">
                  <span class="rating"><i class="el-icon-star-on"></i> {{ product.rating }}</span>
                  <span class="sales">销量: {{ product.sales }}</span>
                  <span class="category">分类: {{ product.category }}</span>
                </div>
              </div>
              <div class="item-action">
                <div class="item-price">
                  <span class="price">¥{{ product.price }}</span>
                  <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
                </div>
                <el-button type="primary" @click="addToCart(product)">加入购物车</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <i class="el-icon-picture"></i>
          <p>没有找到符合条件的商品</p>
        </div>

        <!-- 分页 -->
        <div v-if="!loading && total > pageSize" class="pagination">
          <el-pagination
            :current-page.sync="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next, jumper"
            @current-change="handlePageChange">
          </el-pagination>
        </div>
      </div>
    </div>

    <footer-layout></footer-layout>
  </div>
</template>

<script>
import { getProductList, getProductCategories, addToCartAPI } from '@/utils/api'
import { API_BASE_URL } from '@/utils/api'

export default {
  name: 'MallShop',
  data() {
    return {
      activeCategory: 'all',
      categories: [],
      categoryList: [], // 商品分类列表
      priceRange: [0, 500],
      sortBy: 'default',
      viewType: 'grid',
      currentPage: 1,
      pageSize: 12,
      total: 0,
      loading: false,
      products: []
    }
  },
  mounted() {
    this.loadCategories()
    this.loadProducts()
  },
  computed: {
    filteredProducts() {
      let filtered = [...this.products];

      // 按价格筛选（前端筛选）
      filtered = filtered.filter(p => {
        const price = parseFloat(p.price) || 0;
        return price >= this.priceRange[0] && price <= this.priceRange[1];
      });

      // 排序
      switch (this.sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
          break;
        case 'price_desc':
          filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
          break;
        case 'sales':
          filtered.sort((a, b) => (parseInt(b.sales_count) || 0) - (parseInt(a.sales_count) || 0));
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.create_time) - new Date(a.create_time));
          break;
        default:
          break;
      }

      return filtered;
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredProducts.slice(start, end);
    }
  },
  methods: {
    // 加载商品分类
    async loadCategories() {
      try {
        const res = await getProductCategories()
        if (res.data && res.data.code === 200) {
          this.categoryList = res.data.data || []
          this.categories = this.categoryList.map(cat => cat.name)
        }
      } catch (error) {
        console.error('加载商品分类失败:', error)
      }
    },
    
    // 加载商品列表
    async loadProducts() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          status: 1 // 只获取上架的商品
        }
        
        // 如果选择了分类，添加分类过滤
        if (this.activeCategory !== 'all') {
          const selectedCategory = this.categoryList.find(cat => cat.name === this.activeCategory)
          if (selectedCategory) {
            params.category_id = selectedCategory.id
          }
        }
        
        // 排序处理
        if (this.sortBy === 'price_asc') {
          params.sort = 'price_asc'
        } else if (this.sortBy === 'price_desc') {
          params.sort = 'price_desc'
        } else if (this.sortBy === 'sales') {
          params.sort = 'sales_desc'
        }
        
        const res = await getProductList(params)
        if (res.data && res.data.code === 200) {
          // 处理商品数据，转换为前端需要的格式
          this.products = (res.data.data || []).map(item => ({
            id: item.id,
            name: item.name,
            category: item.category_name || '',
            category_id: item.category_id,
            price: parseFloat(item.price) || 0,
            originalPrice: item.original_price ? parseFloat(item.original_price) : null,
            discount: item.original_price && item.price 
              ? Math.round((1 - parseFloat(item.price) / parseFloat(item.original_price)) * 10) / 10
              : null,
            image: this.getImageUrl(item.image_url || item.images),
            description: item.description || '',
            rating: parseFloat(item.rating) || 5.0,
            sales: parseInt(item.sales_count) || 0,
            sales_count: parseInt(item.sales_count) || 0,
            stock: parseInt(item.stock) || 0,
            is_hot: item.is_hot || 0,
            is_new: item.is_new || 0,
            create_time: item.create_time
          }))
          this.total = res.data.pagination?.total || 0
        }
      } catch (error) {
        console.error('加载商品列表失败:', error)
        this.$message.error('加载商品列表失败')
      } finally {
        this.loading = false
      }
    },
    
    // 获取图片完整URL
    getImageUrl(url) {
      if (!url) return 'https://via.placeholder.com/300x300?text=暂无图片'
      if (url.startsWith('http')) return url
      // 处理多图片情况（JSON字符串）
      try {
        const images = JSON.parse(url)
        if (Array.isArray(images) && images.length > 0) {
          url = images[0]
        }
      } catch (e) {
        // 不是JSON，直接使用
      }
      return `${API_BASE_URL.replace('/api', '')}${url}`
    },
    
    getProductsByCategory(category) {
      return this.products.filter(p => p.category === category);
    },
    
    handlePriceChange() {
      this.currentPage = 1;
    },
    
    handleSortChange() {
      this.currentPage = 1;
      this.loadProducts() // 重新加载商品
    },
    
    handlePageChange() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.loadProducts() // 重新加载商品
    },
    
    // 分类切换
    handleCategoryChange(category) {
      this.activeCategory = category
      this.currentPage = 1
      this.loadProducts()
    },
    
    async addToCart(product) {
      const token = localStorage.getItem('token');
      
      if (token) {
        // 已登录，调用API添加到购物车
        try {
          await addToCartAPI({
            product_id: product.id,
            quantity: 1
          });
          this.$message.success(`${product.name} 已添加到购物车`);
          // 触发购物车更新事件
          this.$bus && this.$bus.$emit('cart-updated');
        } catch (error) {
          console.error('添加到购物车失败:', error);
          this.$message.error(error.data?.message || '添加到购物车失败');
        }
      } else {
        // 未登录，使用localStorage
        const cart = JSON.parse(localStorage.getItem('petShopCart')) || [];
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            ...product,
            quantity: 1
          });
        }
        
        localStorage.setItem('petShopCart', JSON.stringify(cart));
        this.$message.success(`${product.name} 已添加到购物车`);
        // 触发购物车更新事件
        this.$bus && this.$bus.$emit('cart-updated');
      }
    },
    
    viewProduct(product) {
      // 跳转到商品详情页，传递商品ID
      this.$router.push({
        path: '/mall/product-detail',
        query: { id: product.id }
      });
    }
  },
  
  watch: {
    activeCategory(newVal) {
      if (newVal !== 'all') {
        this.handleCategoryChange(newVal)
      } else {
        this.currentPage = 1
        this.loadProducts()
      }
    }
  }
}
</script>

<style scoped lang="less">
.shop-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.breadcrumb-section {
  padding: 15px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e6e6e6;
}

.shop-banner {
  background: linear-gradient(135deg, #D52B1E 0%, #e85541 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;

  h1 {
    font-size: 36px;
    margin: 0 0 10px 0;
    font-weight: bold;
  }

  p {
    font-size: 16px;
    margin: 0;
    opacity: 0.9;
  }
}

.shop-content {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
  gap: 20px;
}

.shop-sidebar {
  width: 220px;
  flex-shrink: 0;

  .filter-section {
    background: #ffffff;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    h3 {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #333;
    }

    .category-list {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: #666;

        &:hover {
          background-color: #f5f7fa;
          color: #D52B1E;
        }

        &.active {
          background-color: #ffe6e3;
          color: #D52B1E;
          font-weight: bold;
        }

        .count {
          font-size: 12px;
          color: #999;
        }
      }
    }

    /deep/ .el-slider {
      margin-bottom: 15px;
    }

    .price-display {
      font-size: 13px;
      color: #666;
      text-align: center;
      margin-top: 10px;
    }

    /deep/ .el-select {
      width: 100%;
    }
  }
}

.shop-main {
  flex: 1;

  .toolbar {
    background: white;
    padding: 15px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .left {
      .result-count {
        font-size: 13px;
        color: #666;

        strong {
          color: #D52B1E;
          font-weight: bold;
        }
      }
    }

    .right {
      display: flex;
      gap: 10px;
    }
  }

  .products-area {
    &.grid {
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
      }
    }

    &.list {
      .products-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
    }
  }

  .product-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-4px);
    }

    .product-image {
      position: relative;
      padding-top: 100%;
      overflow: hidden;
      background-color: #f5f7fa;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .discount-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: #ff6b6b;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        z-index: 2;
      }
      
      .hot-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: #ff9800;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        z-index: 2;
      }
      
      .new-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: #4caf50;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        z-index: 2;
      }
    }

    .product-info {
      padding: 15px;

      .product-name {
        font-size: 14px;
        margin: 0 0 8px 0;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: bold;
      }

      .product-desc {
        font-size: 12px;
        color: #999;
        margin: 0 0 10px 0;
        height: 24px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .product-meta {
        display: flex;
        gap: 15px;
        font-size: 12px;
        color: #999;
        margin-bottom: 10px;

        .rating {
          display: flex;
          align-items: center;
          gap: 3px;

          i {
            color: #ffc107;
          }
        }
      }

      .product-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;

        .price-section {
          display: flex;
          flex-direction: column;
          gap: 3px;

          .price {
            font-size: 16px;
            color: #ff6b6b;
            font-weight: bold;
          }

          .original-price {
            font-size: 12px;
            color: #999;
            text-decoration: line-through;
          }
        }

        /deep/ .el-button {
          flex: 1;
          background-color: #D52B1E !important;
          border-color: #D52B1E !important;
          color: white !important;

          &:hover {
            background-color: #c21d0f !important;
            border-color: #c21d0f !important;
          }
        }
      }
    }
  }

  .product-item {
    background: white;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    gap: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .item-image {
      width: 120px;
      height: 120px;
      flex-shrink: 0;
      border-radius: 8px;
      overflow: hidden;
      background-color: #f5f7fa;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .item-content {
      flex: 1;

      .item-name {
        font-size: 16px;
        margin: 0 0 8px 0;
        color: #333;
        font-weight: bold;
      }

      .item-desc {
        font-size: 13px;
        color: #666;
        margin: 0 0 10px 0;
      }

      .item-meta {
        display: flex;
        gap: 20px;
        font-size: 12px;
        color: #999;

        .rating {
          display: flex;
          align-items: center;
          gap: 3px;

          i {
            color: #ffc107;
          }
        }
      }
    }

    .item-action {
      width: 150px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
      gap: 10px;

      .item-price {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 3px;

        .price {
          font-size: 18px;
          color: #ff6b6b;
          font-weight: bold;
        }

        .original-price {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
        }
      }

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
  }

  .loading-state {
    background: white;
    border-radius: 8px;
    padding: 60px 20px;
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

  .empty-state {
    background: white;
    border-radius: 8px;
    padding: 60px 20px;
    text-align: center;
    color: #999;

    i {
      font-size: 48px;
      display: block;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    p {
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

  .pagination {
    margin-top: 30px;
    text-align: center;

    /deep/ .el-pagination {
      justify-content: center;
    }
  }
}

@media (max-width: 768px) {
  .shop-content {
    flex-direction: column;
  }

  .shop-sidebar {
    width: 100%;
  }

  .shop-main .products-area.grid .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
}
</style>

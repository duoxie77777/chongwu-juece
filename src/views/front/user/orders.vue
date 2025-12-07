<template>
  <div class="user-orders">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">我的订单</h1>
      <p class="page-subtitle">查看和管理您的所有订单</p>
    </div>

    <!-- 订单筛选和搜索 -->
    <div class="orders-filter">
      <div class="filter-left">
        <el-radio-group v-model="filterStatus" @change="handleFilterChange">
          <el-radio-button label="all">全部订单</el-radio-button>
          <el-radio-button label="pending">待付款</el-radio-button>
          <el-radio-button label="paid">待发货</el-radio-button>
          <el-radio-button label="shipped">待收货</el-radio-button>
          <el-radio-button label="completed">已完成</el-radio-button>
          <el-radio-button label="cancelled">已取消</el-radio-button>
        </el-radio-group>
      </div>
      <div class="filter-right">
        <el-input v-model="searchKeyword" placeholder="搜索订单号或商品名称" prefix-icon="el-icon-search" style="width: 250px;"
          @input="handleSearch">
        </el-input>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list">
      <div v-if="filteredOrders.length === 0" class="empty-state">
        <i class="el-icon-shopping-bag-1 empty-icon"></i>
        <p>{{ searchKeyword ? '未找到相关订单' : '暂无订单' }}</p>
        <el-button type="primary" @click="goToShop" v-if="!searchKeyword">去商城逛逛</el-button>
      </div>

      <div v-else>
        <div v-for="order in filteredOrders" :key="order.id" class="order-item">
          <el-card shadow="hover" class="order-card">
            <!-- 订单头部 -->
            <div class="order-header">
              <div class="order-info">
                <span class="order-number">订单号：{{ order.orderNumber }}</span>
                <span class="order-date">{{ formatDateTime(order.createTime) }}</span>
              </div>
              <div class="order-status">
                <el-tag :type="getStatusType(order.status)" size="medium">
                  {{ getStatusText(order.status) }}
                </el-tag>
              </div>
            </div>

            <!-- 订单商品 -->
            <div class="order-products">
              <div v-for="product in order.products" :key="product.id" class="product-item">
                <img :src="product.image" :alt="product.name" class="product-image">
                <div class="product-info">
                  <h4 class="product-name">{{ product.name }}</h4>
                  <p class="product-spec">{{ product.spec }}</p>
                  <p class="product-price">￥{{ product.price }}</p>
                </div>
                <div class="product-quantity">
                  <span class="quantity-label">数量：</span>
                  <span class="quantity-value">{{ product.quantity }}</span>
                </div>
                <div class="product-total">
                  <span class="total-label">小计：</span>
                  <span class="total-value">￥{{ (product.price * product.quantity).toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- 订单统计 -->
            <div class="order-summary">
              <div class="summary-info">
                <span class="total-count">共 {{ order.totalQuantity }} 件商品</span>
                <span class="total-amount">
                  合计：<span class="amount-value">￥{{ order.totalAmount }}</span>
                </span>
              </div>
            </div>

            <!-- 订单操作 -->
            <div class="order-actions">
              <div class="action-buttons">
                <el-button v-if="order.status === 'pending'" type="primary" size="small" @click="handlePay(order)">
                  立即支付
                </el-button>

                <el-button v-if="order.status === 'paid'" type="text" size="small" @click="handleRemind(order)">
                  提醒发货
                </el-button>

                <el-button v-if="order.status === 'shipped'" type="success" size="small" @click="handleConfirm(order)">
                  确认收货
                </el-button>

                <el-button v-if="order.status === 'pending' || order.status === 'paid'" type="text" size="small"
                  @click="handleCancel(order)">
                  取消订单
                </el-button>

                <el-button type="text" size="small" @click="handleViewDetail(order)">
                  查看详情
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination :current-page="currentPage" :page-size="pageSize" :total="totalOrders"
            layout="total, prev, pager, next, jumper" @current-change="handlePageChange">
          </el-pagination>
        </div>
      </div>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog title="订单详情" :visible.sync="detailDialogVisible" width="800px" :close-on-click-modal="false">
      <div v-if="currentOrder" class="order-detail">
        <!-- 基本信息 -->
        <el-descriptions title="订单信息" :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNumber }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDateTime(currentOrder.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ currentOrder.paymentMethod || '在线支付' }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ currentOrder.shippingAddress?.receiver || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.shippingAddress?.phone || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ currentOrder.shippingAddress?.fullAddress || '未设置收货地址' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 商品详情 -->
        <div class="detail-products">
          <h3>商品信息</h3>
          <el-table :data="currentOrder.products" style="width: 100%">
            <el-table-column label="商品" width="300">
              <template slot-scope="scope">
                <div class="product-cell">
                  <img :src="scope.row.image" :alt="scope.row.name" class="product-thumb" v-if="scope.row.image">
                  <span class="product-name">{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="spec" label="规格" width="120"></el-table-column>
            <el-table-column prop="price" label="单价" width="100">
              <template slot-scope="scope">￥{{ parseFloat(scope.row.price).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
            <el-table-column label="小计" width="100">
              <template slot-scope="scope">
                ￥{{ (parseFloat(scope.row.price) * parseInt(scope.row.quantity)).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 费用明细 -->
        <div class="detail-summary">
          <div class="summary-row">
            <span>商品总价：</span>
            <span>￥{{ currentOrder.totalAmount }}</span>
          </div>
          <div class="summary-row">
            <span>运费：</span>
            <span>￥{{ currentOrder.shippingFee || '0.00' }}</span>
          </div>
          <div class="summary-row total-row">
            <span>实付金额：</span>
            <span class="total-amount">￥{{ currentOrder.finalAmount || currentOrder.totalAmount }}</span>
          </div>
        </div>
      </div>

      <div slot="footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button v-if="currentOrder && currentOrder.status === 'pending'" type="primary"
          @click="handlePay(currentOrder)">
          立即支付
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserOrders, updateOrderStatus, getOrderDetail, API_BASE_URL } from '@/utils/api'
import { formatDateTime } from '@/utils/dateFormat'

export default {
  name: 'UserOrders',
  data() {
    return {
      filterStatus: 'all',
      searchKeyword: '',
      currentPage: 1,
      pageSize: 10,
      totalOrders: 0,
      orders: [],
      detailDialogVisible: false,
      currentOrder: null
    }
  },
  computed: {
    filteredOrders() {
      let filtered = this.orders

      // 关键词搜索（前端搜索，因为后端已经做了状态过滤）
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(order =>
          order.orderNumber.toLowerCase().includes(keyword) ||
          (order.products && order.products.some(product =>
            product.name.toLowerCase().includes(keyword)
          ))
        )
      }

      return filtered
    }
  },
  mounted() {
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize
        }

        // 如果选择了状态过滤，添加状态参数
        if (this.filterStatus !== 'all') {
          params.status = this.filterStatus
        }

        const response = await getUserOrders(params)

        if (response.data && response.data.code === 200) {
          const ordersData = response.data.data || []
          const pagination = response.data.pagination || {}

          this.orders = ordersData.map(order => {
            // 转换数据格式，确保与前端模板兼容
            return {
              id: order.id,
              orderNumber: order.order_no,
              createTime: order.create_time,
              paymentTime: order.payment_time,
              status: order.status,
              totalAmount: parseFloat(order.total_amount || 0).toFixed(2),
              shippingFee: parseFloat(order.shipping_fee || 0).toFixed(2),
              paymentMethod: order.payment_method,
              remark: order.remark,
              shippingAddress: {
                receiver: order.user_name,
                phone: order.user_phone,
                fullAddress: order.user_address
              },
              products: (order.items || []).map(item => ({
                id: item.id,
                name: item.product_name,
                image: item.product_image ? (item.product_image.startsWith('http') ? item.product_image : API_BASE_URL + item.product_image) : '',
                spec: item.spec || '标准规格',
                price: parseFloat(item.price || 0),
                quantity: parseInt(item.quantity || 0)
              })),
              totalQuantity: (order.items || []).reduce((sum, item) => sum + parseInt(item.quantity || 0), 0)
            }
          })
          this.totalOrders = pagination.total || ordersData.length
        } else {
          this.orders = []
          this.totalOrders = 0
        }
      } catch (error) {
        console.error('加载订单列表失败：', error)
        this.$message.error('加载订单列表失败')
        this.orders = []
        this.totalOrders = 0
      }
    },

    handleFilterChange() {
      this.currentPage = 1
      this.loadOrders()
    },

    handleSearch() {
      this.currentPage = 1
      this.loadOrders()
    },

    handlePageChange(page) {
      this.currentPage = page
      this.loadOrders()
    },

    getStatusType(status) {
      const typeMap = {
        'pending': 'danger',
        'paid': 'warning',
        'shipped': 'primary',
        'completed': 'success',
        'cancelled': 'info'
      }
      return typeMap[status] || 'info'
    },

    getStatusText(status) {
      const textMap = {
        'pending': '待付款',
        'paid': '待发货',
        'shipped': '待收货',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return textMap[status] || '未知状态'
    },

    async handlePay(order) {
      if (!order) {
        this.$message.error('订单信息不存在')
        return
      }

      // 检查订单状态
      if (order.status !== 'pending') {
        this.$message.warning('该订单不能支付')
        return
      }

      // 确认支付
      this.$confirm(`确认支付订单 ${order.orderNumber}，金额：¥${order.totalAmount}？`, '确认支付', {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // 调用支付接口（后端会自动设置支付时间）
          const response = await updateOrderStatus(order.id, {
            status: 'paid'
          })

          if (response.data && response.data.code === 200) {
            this.$message.success('支付成功')
            // 刷新订单列表
            await this.loadOrders()
            // 如果详情对话框打开，关闭它
            if (this.detailDialogVisible && this.currentOrder && this.currentOrder.id === order.id) {
              this.detailDialogVisible = false
            }
          } else {
            this.$message.error(response.data?.message || '支付失败')
          }
        } catch (error) {
          console.error('支付失败:', error)
          this.$message.error(error.data?.message || '支付失败，请重试')
        }
      }).catch(() => {
        // 用户取消支付
      })
    },

    /* eslint-disable no-unused-vars */
    handleRemind(order) {
      this.$message.success('已提醒商家尽快发货')
    },
    /* eslint-enable no-unused-vars */

    async handleConfirm(order) {
      try {
        const response = await updateOrderStatus(order.id, { status: 'completed' })
        if (response.data && response.data.code === 200) {
          this.$message.success('确认收货成功')
          this.loadOrders()
        } else {
          this.$message.error(response.data?.message || '确认收货失败')
        }
      } catch (error) {
        console.error('确认收货失败:', error)
        this.$message.error(error.data?.message || '确认收货失败')
      }
    },

    async handleCancel(order) {
      this.$confirm('确定要取消这个订单吗？取消后库存将恢复。', '取消订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await updateOrderStatus(order.id, { status: 'cancelled' })
          if (response.data && response.data.code === 200) {
            this.$message.success('订单取消成功')
            this.loadOrders()
          } else {
            this.$message.error(response.data?.message || '取消失败')
          }
        } catch (error) {
          console.error('取消订单失败:', error)
          this.$message.error(error.data?.message || '取消失败')
        }
      }).catch(() => {
        // 用户取消操作
      })
    },


    async handleViewDetail(order) {
      try {
        // 如果订单信息不完整，从服务器获取详情
        if (!order.products || order.products.length === 0) {
          const response = await getOrderDetail(order.id)
          if (response.data && response.data.code === 200) {
            const orderData = response.data.data
            this.currentOrder = {
              id: orderData.id,
              orderNumber: orderData.order_no,
              createTime: orderData.create_time,
              status: orderData.status,
              totalAmount: parseFloat(orderData.total_amount || 0).toFixed(2),
              shippingFee: parseFloat(orderData.shipping_fee || 0).toFixed(2),
              paymentMethod: orderData.payment_method,
              remark: orderData.remark,
              shippingAddress: {
                receiver: orderData.user_name,
                phone: orderData.user_phone,
                fullAddress: orderData.user_address
              },
              products: (orderData.items || []).map(item => ({
                id: item.id,
                name: item.product_name,
                image: item.product_image ? (item.product_image.startsWith('http') ? item.product_image : API_BASE_URL + item.product_image) : '',
                spec: item.spec || '标准规格',
                price: parseFloat(item.price || 0),
                quantity: parseInt(item.quantity || 0)
              })),
              finalAmount: (parseFloat(orderData.total_amount || 0) + parseFloat(orderData.shipping_fee || 0)).toFixed(2)
            }
          }
        } else {
          this.currentOrder = {
            ...order,
            finalAmount: (parseFloat(order.totalAmount) + parseFloat(order.shippingFee)).toFixed(2)
          }
        }
        this.detailDialogVisible = true
      } catch (error) {
        console.error('获取订单详情失败:', error)
        this.$message.error('获取订单详情失败')
      }
    },

    goToShop() {
      this.$router.push('/mall/shop')
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      return formatDateTime(dateTime, 'datetime')
    }
  }
}
</script>

<style scoped lang="less">
.user-orders {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  min-height: calc(100vh - 120px);
  background: #f5f7fa;

  .page-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 30px 0;

    .page-title {
      font-size: 32px;
      font-weight: 600;
      background: linear-gradient(135deg, #D52B1E 0%, #ff6b6b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
      letter-spacing: 1px;
    }

    .page-subtitle {
      color: #666;
      font-size: 16px;
      opacity: 0.8;
    }
  }

  .orders-filter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    .filter-left {
      /deep/ .el-radio-button {
        .el-radio-button__inner {
          border: 1px solid #e4e7ed;
          border-radius: 20px;
          margin-right: 8px;
          padding: 10px 20px;
          transition: all 0.3s ease;
          font-weight: 500;

          &:hover {
            color: #D52B1E;
            border-color: #D52B1E;
            background: #ffe6e3;
          }
        }

        &.is-active .el-radio-button__inner {
          background: linear-gradient(135deg, #D52B1E 0%, #ff6b6b 100%);
          border-color: #D52B1E;
          color: white;
          box-shadow: 0 2px 8px rgba(213, 43, 30, 0.3);
        }
      }
    }

    .filter-right {
      /deep/ .el-input__inner {
        border-radius: 20px;
        border: 1px solid #e4e7ed;
        transition: all 0.3s ease;

        &:focus {
          border-color: #D52B1E;
          box-shadow: 0 0 0 2px rgba(213, 43, 30, 0.1);
        }
      }
    }
  }

  .orders-list {
    .empty-state {
      text-align: center;
      padding: 100px 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;

      .empty-icon {
        font-size: 100px;
        background: linear-gradient(135deg, #D52B1E 0%, #ff6b6b 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 24px;
        opacity: 0.6;
      }

      p {
        color: #666;
        margin-bottom: 24px;
        font-size: 18px;
        font-weight: 500;
      }

      /deep/ .el-button {
        padding: 12px 32px;
        font-size: 16px;
        border-radius: 24px;
        background: linear-gradient(135deg, #D52B1E 0%, #ff6b6b 100%);
        border: none;
        transition: box-shadow 0.2s ease;

        &:hover {
          box-shadow: 0 5px 16px rgba(213, 43, 30, 0.35);
        }
      }
    }

    .order-item {
      margin-bottom: 24px;
      border: 1px solid #d8d8d886;
      border-radius: 5px;

      .order-card {
        border-radius: 16px;
        border: none;
        overflow: hidden;
        transition: box-shadow 0.2s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

        &:hover {
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border-bottom: 2px solid #f0f0f0;
          margin-bottom: 0;

          .order-info {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .order-number {
              font-weight: 600;
              color: #333;
              font-size: 16px;
              letter-spacing: 0.5px;
            }

            .order-date {
              color: #999;
              font-size: 13px;
              display: flex;
              align-items: center;

              &::before {
                content: '📅';
                margin-right: 6px;
              }
            }
          }
        }

        .order-products {
          padding: 20px 24px;
          background: #fafbfc;

          .product-item {
            display: flex;
            align-items: center;
            padding: 20px;
            background: white;
            border-radius: 12px;
            margin-bottom: 12px;
            transition: all 0.3s ease;
            border: 1px solid #f0f0f0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

            &:last-child {
              margin-bottom: 0;
            }

            &:hover {
              border-color: #ffe6e3;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .product-image {
              width: 100px;
              height: 100px;
              object-fit: cover;
              border-radius: 12px;
              margin-right: 20px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .product-info {
              flex: 1;

              .product-name {
                margin: 0 0 10px 0;
                color: #333;
                font-size: 17px;
                font-weight: 600;
                line-height: 1.4;
              }

              .product-spec {
                margin: 0 0 8px 0;
                color: #999;
                font-size: 13px;
              }

              .product-price {
                margin: 0;
                color: #D52B1E;
                font-weight: 700;
                font-size: 18px;
              }
            }

            .product-quantity,
            .product-total {
              text-align: center;
              margin: 0 24px;
              padding: 12px 16px;
              background: #f8f9fa;
              border-radius: 8px;
              min-width: 80px;

              .quantity-label,
              .total-label {
                display: block;
                color: #999;
                font-size: 12px;
                margin-bottom: 6px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }

              .quantity-value,
              .total-value {
                display: block;
                color: #333;
                font-weight: 700;
                font-size: 16px;
              }

              .total-value {
                color: #D52B1E;
                font-size: 18px;
              }
            }
          }
        }

        .order-summary {
          text-align: right;
          padding: 20px 24px;
          background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
          border-top: 2px solid #ffe6e3;

          .summary-info {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 20px;

            .total-count {
              color: #666;
              font-size: 14px;
            }

            .total-amount {
              color: #333;
              font-size: 16px;
              display: flex;
              align-items: baseline;
              gap: 8px;

              .amount-value {
                color: #D52B1E;
                font-weight: 700;
                font-size: 24px;
                letter-spacing: 0.5px;
              }
            }
          }
        }

        .order-actions {
          text-align: right;
          padding: 20px 24px;
          background: #fafbfc;
          border-top: 1px solid #f0f0f0;

          .action-buttons {
            /deep/ .el-button {
              margin-left: 12px;
              border-radius: 20px;
              padding: 10px 20px;
              transition: all 0.2s ease;

              &.el-button--primary {
                background: linear-gradient(135deg, #D52B1E 0%, #ff6b6b 100%);
                border: none;
                box-shadow: 0 4px 12px rgba(213, 43, 30, 0.3);

                &:hover {
                  box-shadow: 0 5px 16px rgba(213, 43, 30, 0.35);
                }
              }

              &.el-button--success {
                border-radius: 20px;
              }

              &.el-button--text {
                color: #666;
                padding: 8px 16px;

                &:hover {
                  color: #D52B1E;
                  background: #ffe6e3;
                }
              }
            }
          }
        }
      }
    }

    .pagination-wrapper {
      text-align: center;
      margin-top: 40px;
      padding: 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

      /deep/ .el-pagination {
        .el-pager li {
          border-radius: 8px;
          margin: 0 4px;

          &.active {
            background: linear-gradient(135deg, #D52B1E 0%, #ff6b6b 100%);
            color: white;
          }
        }

        .btn-prev,
        .btn-next {
          border-radius: 8px;
        }
      }
    }
  }

  .order-detail {
    .detail-products {
      margin: 24px 0;
      padding: 20px;
      background: #fafbfc;
      border-radius: 12px;

      h3 {
        margin-bottom: 20px;
        color: #333;
        font-size: 18px;
        font-weight: 600;
        padding-bottom: 12px;
        border-bottom: 2px solid #ffe6e3;
      }

      /deep/ .el-table {
        border-radius: 8px;
        overflow: hidden;

        .el-table__header {
          background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
        }
      }

      .product-cell {
        display: flex;
        align-items: center;

        .product-thumb {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          margin-right: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .product-name {
          flex: 1;
          font-weight: 500;
        }
      }
    }

    .detail-summary {
      text-align: right;
      margin-top: 24px;
      padding: 20px 24px;
      background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
      border-radius: 12px;
      border: 2px solid #ffe6e3;

      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        color: #666;
        font-size: 15px;
        padding: 8px 0;

        &.total-row {
          border-top: 2px solid #ffe6e3;
          padding-top: 16px;
          margin-top: 12px;
          font-size: 18px;
          font-weight: 600;

          .total-amount {
            color: #D52B1E;
            font-weight: 700;
            font-size: 24px;
            letter-spacing: 0.5px;
          }
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  /deep/ .el-dialog {
    border-radius: 16px;
    overflow: hidden;

    .el-dialog__header {
      background: linear-gradient(135deg, #D52B1E 0%, #ff6b6b 100%);
      padding: 20px 24px;

      .el-dialog__title {
        color: white;
        font-weight: 600;
        font-size: 18px;
      }

      .el-dialog__close {
        color: white;
        font-size: 20px;

        &:hover {
          color: #ffe6e3;
        }
      }
    }

    .el-dialog__body {
      padding: 24px;
    }

    .el-descriptions {
      .el-descriptions__header {
        margin-bottom: 20px;

        .el-descriptions__title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .user-orders {
    padding: 10px;

    .orders-filter {
      flex-direction: column;
      gap: 15px;

      .filter-left {
        width: 100%;
        overflow-x: auto;
      }

      .filter-right {
        width: 100%;

        .el-input {
          width: 100%;
        }
      }
    }

    .order-item .order-card .order-products .product-item {
      flex-wrap: wrap;

      .product-info {
        min-width: 200px;
      }

      .product-quantity,
      .product-total {
        margin: 10px 0;
      }
    }
  }
}
</style>
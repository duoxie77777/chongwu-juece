<template>
  <div class="orders-container">
    <header-layout></header-layout>

    <!-- 导航面包屑 -->
    <div class="breadcrumb-section">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/mall/shop' }">商城</el-breadcrumb-item>
        <el-breadcrumb-item>我的订单</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="orders-content">
      <h1>我的订单</h1>

      <!-- 筛选标签 -->
      <div class="filter-tabs">
        <span 
          v-for="status in statuses" 
          :key="status.value"
          :class="['tab-item', { active: activeStatus === status.value }]"
          @click="activeStatus = status.value">
          {{ status.label }}
          <span v-if="getCountByStatus(status.value) > 0" class="count">{{ getCountByStatus(status.value) }}</span>
        </span>
      </div>

      <!-- 订单列表 -->
      <div v-if="filteredOrders.length > 0" class="orders-list">
        <div v-for="order in filteredOrders" :key="order.orderNumber" class="order-card">
          <!-- 订单头部 -->
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">订单号: {{ order.orderNumber }}</span>
              <span class="order-time">下单时间: {{ order.createTime }}</span>
            </div>
            <span :class="['order-status', order.status]">
              {{ getStatusText(order.status) }}
            </span>
          </div>

          <!-- 订单详情 -->
          <div class="order-body">
            <!-- 收货地址 -->
            <div class="address-section">
              <i class="el-icon-location"></i>
              <div>
                <p class="address-title">{{ order.address.name }} {{ order.address.phone }}</p>
                <p class="address-detail">{{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.address }}</p>
              </div>
            </div>

            <!-- 订单商品 -->
            <div class="items-section">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <img :src="item.image" :alt="item.name" class="item-image">
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.description }}</p>
                </div>
                <div class="item-details">
                  <span class="price">¥{{ item.price }}</span>
                  <span class="quantity">x{{ item.quantity }}</span>
                  <span class="subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>
            </div>



            <!-- 订单金额 -->
            <div class="amount-section">
              <span class="label">订单金额:</span>
              <span class="value price">¥{{ order.totalAmount.toFixed(2) }}</span>
            </div>

            <!-- 订单备注 -->
            <div v-if="order.remark" class="remark-section">
              <span class="label">订单备注:</span>
              <span class="value">{{ order.remark }}</span>
            </div>
          </div>

          <!-- 订单底部操作 -->
          <div class="order-footer">
            <el-button type="text" size="small" @click="viewOrderDetail(order)">查看详情</el-button>
            <el-button v-if="order.status === 'pending'" type="text" size="small" @click="trackOrder(order)">追踪物流</el-button>
            <el-button v-if="order.status === 'pending'" type="text" size="small" @click="cancelOrder(order)">取消订单</el-button>
            <el-button v-if="order.status === 'delivered'" type="text" size="small" @click="returnOrder(order)">申请退货</el-button>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="filteredOrders.length > pageSize" class="pagination">
          <el-pagination
            :current-page.sync="currentPage"
            :page-size="pageSize"
            :total="filteredOrders.length"
            layout="total, prev, pager, next, jumper"
            @current-change="handlePageChange">
          </el-pagination>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <i class="el-icon-tickets"></i>
        <p>{{ activeStatus === 'all' ? '您还没有订单' : '没有符合条件的订单' }}</p>
        <el-button type="primary" @click="goToShop">去购物</el-button>
      </div>
    </div>

    <!-- 订单详情 Dialog -->
    <el-dialog 
      title="订单详情" 
      :visible.sync="detailDialogVisible"
      width="700px"
      center>
      <div v-if="selectedOrder" class="order-detail">
        <div class="detail-section">
          <h4>订单信息</h4>
          <div class="detail-row">
            <span class="label">订单号:</span>
            <span class="value">{{ selectedOrder.orderNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="label">订单状态:</span>
            <span :class="['value', selectedOrder.status]">{{ getStatusText(selectedOrder.status) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">下单时间:</span>
            <span class="value">{{ selectedOrder.createTime }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>收货地址</h4>
          <div class="detail-row">
            <span class="label">收货人:</span>
            <span class="value">{{ selectedOrder.address.name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">联系电话:</span>
            <span class="value">{{ selectedOrder.address.phone }}</span>
          </div>
          <div class="detail-row">
            <span class="label">收货地址:</span>
            <span class="value">{{ selectedOrder.address.province }}{{ selectedOrder.address.city }}{{ selectedOrder.address.district }}{{ selectedOrder.address.address }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>订单商品</h4>
          <el-table :data="selectedOrder.items" style="width: 100%" :show-header="false">
            <el-table-column width="80">
              <template slot-scope="{ row }">
                <img :src="row.image" :alt="row.name" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
              </template>
            </el-table-column>
            <el-table-column>
              <template slot-scope="{ row }">
                <div>
                  <p style="margin: 0; font-weight: bold;">{{ row.name }}</p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">¥{{ row.price }} x{{ row.quantity }}</p>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="right" width="100">
              <template slot-scope="{ row }">
                <span style="color: #ff6b6b; font-weight: bold;">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="detail-section">
          <h4>金额详情</h4>
          <div class="detail-row">
            <span class="label">商品总额:</span>
            <span class="value">¥{{ getProductTotal(selectedOrder).toFixed(2) }}</span>
          </div>
          <div class="detail-row total">
            <span class="label">应付金额:</span>
            <span class="value price">¥{{ selectedOrder.totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div v-if="selectedOrder.remark" class="detail-section">
          <h4>订单备注</h4>
          <p style="margin: 0; color: #666;">{{ selectedOrder.remark }}</p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 物流追踪 Dialog -->
    <el-dialog 
      title="物流追踪" 
      :visible.sync="trackingDialogVisible"
      width="500px"
      center>
      <div v-if="trackingInfo" class="tracking-info">
        <div class="tracking-header">
          <span class="tracking-number">物流单号: {{ trackingInfo.trackingNumber }}</span>
          <span class="logistics-company">物流公司: {{ trackingInfo.company }}</span>
        </div>
        
        <div class="tracking-timeline">
          <div v-for="(record, index) in trackingInfo.records" :key="index" class="timeline-item">
            <div class="timeline-dot" :class="{ active: index === 0 }"></div>
            <div class="timeline-content">
              <p class="status-text">{{ record.status }}</p>
              <p class="time-text">{{ record.time }}</p>
              <p v-if="record.location" class="location-text">{{ record.location }}</p>
            </div>
          </div>
        </div>

        <div class="tracking-tips">
          <p><i class="el-icon-info"></i> 更新时间: {{ trackingInfo.updateTime }}</p>
          <p><i class="el-icon-info"></i> 预计送达: 2天内</p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="trackingDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <footer-layout></footer-layout>
  </div>
</template>

<script>
export default {
  name: 'OrderList',
  data() {
    return {
      activeStatus: 'all',
      currentPage: 1,
      pageSize: 10,
      orders: [],
      statuses: [
        { label: '全部订单', value: 'all' },
        { label: '待付款', value: 'pending' },
        { label: '已发货', value: 'shipped' },
        { label: '已收货', value: 'delivered' },
        { label: '已取消', value: 'cancelled' }
      ],
      detailDialogVisible: false,
      selectedOrder: null,
      trackingDialogVisible: false,
      trackingInfo: null
    }
  },
  computed: {
    filteredOrders() {
      let filtered = this.orders;
      
      if (this.activeStatus !== 'all') {
        filtered = filtered.filter(order => order.status === this.activeStatus);
      }
      
      // 按时间倒序
      filtered.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      
      return filtered;
    },
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredOrders.slice(start, end);
    }
  },
  mounted() {
    this.loadOrders();
  },
  methods: {
    loadOrders() {
      const orders = JSON.parse(localStorage.getItem('petShopOrders')) || [];
      this.orders = orders.map(order => {
        // 模拟订单状态变化
        const random = Math.random();
        if (random < 0.3) {
          return { ...order, status: 'pending' };
        } else if (random < 0.6) {
          return { ...order, status: 'shipped' };
        } else if (random < 0.9) {
          return { ...order, status: 'delivered' };
        }
        return order;
      });
    },
    getCountByStatus(status) {
      if (status === 'all') {
        return this.orders.length;
      }
      return this.orders.filter(order => order.status === status).length;
    },
    getStatusText(status) {
      const statusMap = {
        'pending': '待发货',
        'shipped': '已发货',
        'delivered': '已收货',
        'cancelled': '已取消'
      };
      return statusMap[status] || '未知';
    },

    getProductTotal(order) {
      return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    viewOrderDetail(order) {
      this.selectedOrder = { ...order };
      this.detailDialogVisible = true;
    },
    trackOrder() {
      // 模拟物流信息
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const dayAfter = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
      
      this.trackingInfo = {
        trackingNumber: 'SF' + Math.random().toString().substring(2, 15),
        company: '顺丰速运',
        updateTime: new Date().toLocaleString(),
        records: [
          {
            status: '已送达',
            time: dayAfter.toLocaleString(),
            location: '收货人已签收'
          },
          {
            status: '派送中',
            time: tomorrow.toLocaleString(),
            location: '快件派送员已出发，即将送达'
          },
          {
            status: '已收货',
            time: today.toLocaleString(),
            location: '快件已到达达成都分拨中心'
          },
          {
            status: '已发货',
            time: new Date(today.getTime() - 24 * 60 * 60 * 1000).toLocaleString(),
            location: '发货点已发出，即将收货'
          }
        ]
      };
      this.trackingDialogVisible = true;
    },
    cancelOrder(order) {
      this.$confirm('确定要取消该订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.orders.findIndex(o => o.orderNumber === order.orderNumber);
        if (index !== -1) {
          this.orders[index].status = 'cancelled';
          localStorage.setItem('petShopOrders', JSON.stringify(this.orders));
          this.$message.success('订单已取消');
        }
      }).catch(() => {});
    },
    returnOrder() {
      this.$message.info('申请退货已提交，请等待卖家审核');
    },
    goToShop() {
      this.$router.push('/mall/shop');
    },
    handlePageChange() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
</script>

<style scoped lang="less">
.orders-container {
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

.orders-content {
  flex: 1;
  max-width: 1200px;
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

.filter-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e6e6e6;

    .tab-item {
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s ease;
      font-size: 13px;
      color: #666;
      position: relative;

      &:hover {
        color: #D52B1E;
      }

      &.active {
        background-color: #ffe6e3;
        color: #D52B1E;
        font-weight: bold;
      }

      .count {
        margin-left: 5px;
        background-color: #D52B1E;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        font-weight: bold;
      }
    }
}

.orders-list {
  .order-card {
    background: white;
    border-radius: 8px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background-color: #fafafa;
      border-bottom: 1px solid #e6e6e6;

      .order-info {
        display: flex;
        gap: 30px;
        flex: 1;

        span {
          font-size: 13px;
          color: #666;
        }

        .order-number {
          color: #333;
          font-weight: bold;
        }
      }

      .order-status {
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;

        &.pending {
          background-color: #fff7e6;
          color: #D52B1E;
        }

        &.shipped {
          background-color: #ffe6e3;
          color: #D52B1E;
        }

        &.delivered {
          background-color: #e6f7f0;
          color: #13c2c2;
        }

        &.cancelled {
          background-color: #f5f5f5;
          color: #999;
        }
      }
    }

    .order-body {
      padding: 20px;

      .address-section {
        display: flex;
        gap: 12px;
        padding: 15px;
        background-color: #f5f7fa;
        border-radius: 4px;
        margin-bottom: 15px;

        i {
          color: #D52B1E;
          font-size: 18px;
          flex-shrink: 0;
        }

        .address-title {
          margin: 0 0 5px 0;
          color: #333;
          font-weight: bold;
          font-size: 13px;
        }

        .address-detail {
          margin: 0;
          color: #999;
          font-size: 12px;
          line-height: 1.6;
        }
      }

      .items-section {
        margin-bottom: 15px;

        .order-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .item-image {
            width: 60px;
            height: 60px;
            border-radius: 4px;
            object-fit: cover;
            background-color: #f5f7fa;
            flex-shrink: 0;
          }

          .item-info {
            flex: 1;

            h4 {
              margin: 0 0 4px 0;
              font-size: 13px;
              color: #333;
              font-weight: bold;
            }

            p {
              margin: 0;
              font-size: 12px;
              color: #999;
            }
          }

          .item-details {
            display: flex;
            gap: 15px;
            align-items: center;
            font-size: 12px;
            color: #666;
            flex-shrink: 0;

            .price {
              color: #ff6b6b;
              font-weight: bold;
            }

            .subtotal {
              color: #ff6b6b;
              font-weight: bold;
            }
          }
        }
      }

      .shipping-section,
      .amount-section,
      .remark-section {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 13px;
        border-bottom: 1px solid #f0f0f0;

        .label {
          color: #666;
          font-weight: bold;
        }

        .value {
          color: #333;

          &.price {
            color: #ff6b6b;
            font-weight: bold;
            font-size: 16px;
          }
        }
      }

      .remark-section {
        border-bottom: none;
      }
    }

    .order-footer {
      padding: 12px 20px;
      background-color: #fafafa;
      border-top: 1px solid #e6e6e6;
      display: flex;
      justify-content: flex-end;
      gap: 15px;

      /deep/ .el-button {
        color: #D52B1E;

        &:hover {
          color: #c21d0f;
        }
      }
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

.empty-state {
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

  p {
    color: #999;
    margin: 0 0 30px 0;
    font-size: 14px;
  }

  /deep/ .el-button {
    height: 40px;
    padding: 0 30px;
  }
}

// Dialog 样式
.order-detail {
  .detail-section {
    margin-bottom: 20px;

    h4 {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      margin: 0 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #e6e6e6;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 13px;

      .label {
        color: #666;
        font-weight: bold;
      }

      .value {
        color: #333;

        &.pending {
          color: #ff9900;
        }

        &.shipped {
          color: #667eea;
        }

        &.delivered {
          color: #13c2c2;
        }

        &.cancelled {
          color: #999;
        }

        &.price {
          color: #ff6b6b;
          font-weight: bold;
          font-size: 16px;
        }
      }

      &.total {
        border-top: 1px solid #e6e6e6;
        padding-top: 10px;
        margin-top: 10px;
        font-size: 15px;
        font-weight: bold;
      }
    }
  }

  /deep/ .el-table {
    margin-top: 10px;
  }
}

.tracking-info {
  .tracking-header {
    display: flex;
    justify-content: space-between;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 20px;
    font-size: 13px;

    .tracking-number {
      font-weight: bold;
      color: #333;
    }

    .logistics-company {
      color: #666;
    }
  }

  .tracking-timeline {
    position: relative;
    padding-left: 30px;

    .timeline-item {
      position: relative;
      padding-bottom: 20px;

      &:last-child {
        padding-bottom: 0;
      }

      .timeline-dot {
        position: absolute;
        left: -28px;
        top: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #e6e6e6;
        border: 2px solid white;
        transition: all 0.3s ease;

        &.active {
          background-color: #D52B1E;
          width: 16px;
          height: 16px;
          left: -30px;
          top: 0;
        }
      }

      .timeline-content {
        .status-text {
          margin: 0 0 4px 0;
          color: #333;
          font-weight: bold;
          font-size: 13px;
        }

        .time-text {
          margin: 0 0 4px 0;
          color: #999;
          font-size: 12px;
        }

        .location-text {
          margin: 0;
          color: #666;
          font-size: 12px;
        }
      }
    }
  }

  .tracking-tips {
    margin-top: 20px;
    padding: 12px;
    background-color: #ffe6e3;
    border-radius: 4px;

    p {
      margin: 5px 0;
      color: #D52B1E;
      font-size: 12px;

      i {
        margin-right: 5px;
      }
    }
  }
}

@media (max-width: 768px) {
  .orders-content {
    padding: 15px 10px;

    h1 {
      font-size: 20px;
    }
  }

  .filter-tabs {
    flex-wrap: wrap;
  }

  .order-card {
    .order-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;

      .order-info {
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
    }

    .order-body {
      .items-section .order-item {
        flex-wrap: wrap;

        .item-details {
          width: 100%;
          flex-wrap: wrap;
        }
      }
    }
  }
}

/deep/ .dialog-footer {
  .el-button {
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

/deep/ .el-pagination .btn-prev,
/deep/ .el-pagination .btn-next,
/deep/ .el-pagination .el-pager li.active {
  background-color: #D52B1E !important;
  color: white !important;
}

/deep/ .el-pagination .el-pager li:hover {
  color: #D52B1E !important;
}
</style>

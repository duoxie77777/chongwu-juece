<template>
    <div class="orders-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>📦 订单管理</h1>
                <p>管理用户的商城订单</p>
            </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
            <div class="filter-row">
                <div class="filter-inputs">
                    <div class="input-wrapper">
                        <el-input v-model="searchQuery" placeholder="搜索订单号或用户..." clearable prefix-icon="el-icon-search"
                            @keyup.enter.native="handleSearch" class="search-input"></el-input>
                    </div>
                    <div class="input-wrapper">
                        <el-select v-model="filterStatus" placeholder="筛选状态" clearable @change="handleSearch"
                            class="status-select">
                            <el-option label="全部状态" value="">
                                <span class="status-option">
                                    <span class="status-dot default"></span>全部状态
                                </span>
                            </el-option>
                            <el-option label="待支付" value="pending">
                                <span class="status-option">
                                    <span class="status-dot info"></span>待支付
                                </span>
                            </el-option>
                            <el-option label="已支付" value="paid">
                                <span class="status-option">
                                    <span class="status-dot primary"></span>已支付
                                </span>
                            </el-option>
                            <el-option label="已发货" value="shipped">
                                <span class="status-option">
                                    <span class="status-dot warning"></span>已发货
                                </span>
                            </el-option>
                            <el-option label="已完成" value="completed">
                                <span class="status-option">
                                    <span class="status-dot success"></span>已完成
                                </span>
                            </el-option>
                            <el-option label="已取消" value="cancelled">
                                <span class="status-option">
                                    <span class="status-dot danger"></span>已取消
                                </span>
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="filter-actions">
                    <el-button type="primary" icon="el-icon-search" @click="handleSearch" class="btn-search">
                        搜索
                    </el-button>
                    <el-button icon="el-icon-refresh-left" @click="handleReset" class="btn-reset">
                        重置
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-row">
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card">
                    <div class="stat-number">{{ stats.total }}</div>
                    <div class="stat-label">总订单</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card success">
                    <div class="stat-number">¥{{ stats.totalAmount }}</div>
                    <div class="stat-label">总金额</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card info">
                    <div class="stat-number">{{ stats.completedCount }}</div>
                    <div class="stat-label">已完成</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card warning">
                    <div class="stat-number">{{ stats.pendingCount }}</div>
                    <div class="stat-label">待处理</div>
                </div>
            </el-col>
        </el-row>

        <!-- 订单表格 -->
        <div class="table-section">
            <el-table :data="orders" stripe style="width: 100%" v-loading="loading"
                :default-sort="{ prop: 'id', order: 'descending' }">
                <el-table-column prop="order_no" label="订单号" width="180"></el-table-column>
                <el-table-column prop="user_name" label="用户" width="100"></el-table-column>
                <el-table-column prop="items" label="商品" min-width="200">
                    <template slot-scope="scope">
                        <div v-if="scope.row.items && scope.row.items.length">
                            <div v-for="item in scope.row.items" :key="item.id" class="item-cell">
                                {{ item.product_name }} × {{ item.quantity }}
                            </div>
                        </div>
                        <span v-else class="no-items">暂无商品</span>
                    </template>
                </el-table-column>
                <el-table-column prop="total_amount" label="金额" width="100">
                    <template slot-scope="scope">
                        <span class="price">¥{{ scope.row.total_amount }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="getStatusType(scope.row.status)">
                            {{ getStatusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="create_time" label="下单时间" width="160">
                    <template slot-scope="scope">
                        {{ formatDate(scope.row.create_time) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="280" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="primary" size="small" @click="handleView(scope.row)">查看</el-button>
                        <el-button v-if="scope.row.status === 'paid'" type="success" size="small"
                            @click="handleShip(scope.row)">发货</el-button>
                        <el-button v-if="scope.row.status === 'shipped'" type="warning" size="small"
                            @click="handleComplete(scope.row)">完成</el-button>
                        <el-button v-if="scope.row.status === 'pending'" type="danger" size="small"
                            @click="handleCancel(scope.row)">取消</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-wrapper">
                <el-pagination :current-page.sync="currentPage" :page-sizes="[10, 20, 50, 100]"
                    :page-size.sync="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"
                    @size-change="handlePageSizeChange" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 订单详情对话框 -->
        <el-dialog title="订单详情" :visible.sync="detailVisible" width="700px" :close-on-click-modal="false">
            <div v-if="selectedOrder" class="order-detail">
                <div class="detail-section">
                    <h3>订单信息</h3>
                    <div class="detail-row">
                        <span class="label">订单号：</span>
                        <span>{{ selectedOrder.order_no }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">用户：</span>
                        <span>{{ selectedOrder.user_name }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">联系电话：</span>
                        <span>{{ selectedOrder.user_phone }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">状态：</span>
                        <el-tag :type="getStatusType(selectedOrder.status)">
                            {{ getStatusText(selectedOrder.status) }}
                        </el-tag>
                    </div>
                    <div class="detail-row">
                        <span class="label">下单时间：</span>
                        <span>{{ formatDate(selectedOrder.create_time) }}</span>
                    </div>
                    <div class="detail-row" v-if="selectedOrder.payment_time">
                        <span class="label">支付时间：</span>
                        <span>{{ formatDate(selectedOrder.payment_time) }}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>商品列表</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>商品名</th>
                                <th>单价</th>
                                <th>数量</th>
                                <th>小计</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in selectedOrder.items" :key="item.id">
                                <td>{{ item.product_name }}</td>
                                <td>¥{{ item.price }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>¥{{ item.subtotal }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="detail-section">
                    <h3>收货地址</h3>
                    <div class="address-box">
                        {{ selectedOrder.user_address }}
                    </div>
                </div>

                <div class="detail-section" v-if="selectedOrder.remark">
                    <h3>订单备注</h3>
                    <div class="address-box">
                        {{ selectedOrder.remark }}
                    </div>
                </div>

                <div class="detail-section">
                    <div class="total-row">
                        <span>运费：</span>
                        <span>¥{{ selectedOrder.shipping_fee || 0 }}</span>
                    </div>
                    <div class="total-row">
                        <span>总金额：</span>
                        <span class="total-price">¥{{ selectedOrder.total_amount }}</span>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { formatDateTime } from '@/utils/dateFormat'
import {
    getOrderList,
    getOrderDetail,
    updateOrderStatus,
    getOrderStats
} from '@/utils/api'

export default {
    name: 'MallOrders',
    data() {
        return {
            searchQuery: '',
            filterStatus: '',
            currentPage: 1,
            pageSize: 10,
            total: 0,
            loading: false,
            detailVisible: false,
            selectedOrder: null,
            orders: [],
            stats: {
                total: 0,
                totalAmount: 0,
                completedCount: 0,
                pendingCount: 0
            }
        }
    },
    methods: {
        // 加载订单列表
        async loadOrders() {
            this.loading = true
            try {
                const params = {
                    page: this.currentPage,
                    size: this.pageSize
                }

                if (this.searchQuery) {
                    params.keyword = this.searchQuery
                }

                if (this.filterStatus) {
                    params.status = this.filterStatus
                }

                const res = await getOrderList(params)
                if (res.data.code === 200) {
                    this.orders = res.data.data
                    this.total = res.data.pagination.total
                }
            } catch (error) {
                console.error('加载订单列表失败:', error)
                this.$message.error('加载订单列表失败')
            } finally {
                this.loading = false
            }
        },

        // 加载统计数据
        async loadStats() {
            try {
                const res = await getOrderStats()
                if (res.data.code === 200) {
                    this.stats = {
                        total: res.data.data.total || 0,
                        totalAmount: parseFloat(res.data.data.totalAmount || 0).toFixed(2),
                        completedCount: res.data.data.completedCount || 0,
                        pendingCount: res.data.data.pendingCount || 0
                    }
                }
            } catch (error) {
                console.error('加载统计数据失败:', error)
            }
        },

        // 搜索
        handleSearch() {
            this.currentPage = 1
            this.loadOrders()
        },

        // 重置搜索
        handleReset() {
            this.searchQuery = ''
            this.filterStatus = ''
            this.currentPage = 1
            this.loadOrders()
        },

        // 查看订单详情
        async handleView(row) {
            try {
                const res = await getOrderDetail(row.id)
                if (res.data.code === 200) {
                    this.selectedOrder = res.data.data
                    this.detailVisible = true
                }
            } catch (error) {
                console.error('获取订单详情失败:', error)
                this.$message.error('获取订单详情失败')
            }
        },

        // 发货
        async handleShip(row) {
            try {
                await this.$confirm('确定要发货吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'info'
                })

                const res = await updateOrderStatus(row.id, { status: 'shipped' })
                if (res.data.code === 200) {
                    this.$message.success('发货成功')
                    this.loadOrders()
                    this.loadStats()
                } else {
                    this.$message.error(res.data.message || '发货失败')
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('发货失败:', error)
                    this.$message.error('发货失败')
                }
            }
        },

        // 完成订单
        async handleComplete(row) {
            try {
                await this.$confirm('确定订单已完成吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'info'
                })

                const res = await updateOrderStatus(row.id, { status: 'completed' })
                if (res.data.code === 200) {
                    this.$message.success('订单已完成')
                    this.loadOrders()
                    this.loadStats()
                } else {
                    this.$message.error(res.data.message || '操作失败')
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('操作失败:', error)
                    this.$message.error('操作失败')
                }
            }
        },

        // 取消订单
        async handleCancel(row) {
            try {
                await this.$confirm('确定要取消该订单吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })

                const res = await updateOrderStatus(row.id, { status: 'cancelled' })
                if (res.data.code === 200) {
                    this.$message.success('订单已取消')
                    this.loadOrders()
                    this.loadStats()
                } else {
                    this.$message.error(res.data.message || '取消失败')
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('取消订单失败:', error)
                    this.$message.error('取消订单失败')
                }
            }
        },

        // 分页变化
        handlePageChange(page) {
            this.currentPage = page
            this.loadOrders()
        },

        // 每页数量变化
        handlePageSizeChange(size) {
            this.pageSize = size
            this.currentPage = 1
            this.loadOrders()
        },

        // 获取状态类型
        getStatusType(status) {
            const typeMap = {
                pending: 'info',
                paid: 'primary',
                shipped: 'warning',
                completed: 'success',
                cancelled: 'danger'
            };
            return typeMap[status] || 'info';
        },

        // 获取状态文本
        getStatusText(status) {
            const textMap = {
                pending: '待支付',
                paid: '已支付',
                shipped: '已发货',
                completed: '已完成',
                cancelled: '已取消'
            };
            return textMap[status] || '未知';
        },

        // 格式化日期
        formatDate(date) {
            return formatDateTime(date, 'datetime')
        }
    },
    mounted() {
        this.loadOrders()
        this.loadStats()
    }
}
</script>

<style scoped lang="less">

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .header-title h1 {
        margin: 0;
        font-size: 24px;
        color: #333;
    }

    .header-title p {
        margin: 5px 0 0 0;
        color: #999;
        font-size: 14px;
    }
}

.filter-section {
    background: white;
    padding: 20px 24px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #eef2f7;

    .filter-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
    }

    .filter-inputs {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        flex-wrap: wrap;
    }

    .input-wrapper {
        flex: 1;
        min-width: 200px;
        max-width: 280px;
    }

    .search-input {
        ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 1px solid #e4e7ed;
            transition: all 0.3s ease;
            height: 40px;

            &:hover {
                border-color: #c0c4cc;
            }

            &:focus {
                border-color: #409eff;
                box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
            }
        }
    }

    .status-select {
        width: 100%;

        ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 1px solid #e4e7ed;
            transition: all 0.3s ease;
            height: 40px;

            &:hover {
                border-color: #c0c4cc;
            }
        }
    }

    .status-option {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.success {
            background: #67c23a;
        }

        &.info {
            background: #909399;
        }

        &.warning {
            background: #e6a23c;
        }

        &.danger {
            background: #f56c6c;
        }

        &.default {
            background: #909399;
        }

        &.primary {
            background: #409eff;
        }
    }

    .filter-actions {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
    }

    .btn-search {
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.35);
        }
    }

    .btn-reset {
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
        border: 1px solid #dcdfe6;
        color: #606266;
        transition: all 0.3s ease;

        &:hover {
            color: #409eff;
            border-color: #c6e2ff;
            background: #ecf5ff;
        }
    }
}

.stats-row {
    margin-bottom: 20px;

    .stat-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
        border-left: 4px solid #d52b1e;

        &.success {
            border-left-color: #67c23a;
        }

        &.info {
            border-left-color: #409eff;
        }

        &.warning {
            border-left-color: #e6a23c;
        }

        .stat-number {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }

        .stat-label {
            font-size: 14px;
            color: #999;
        }
    }
}

.table-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .item-cell {
        padding: 3px 0;
        font-size: 13px;
    }

    .no-items {
        color: #999;
        font-size: 13px;
    }

    .price {
        color: #d52b1e;
        font-weight: bold;
    }
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.order-detail {
    .detail-section {
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;

        h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 16px;
        }

        .detail-row {
            display: flex;
            margin-bottom: 10px;
            line-height: 1.8;

            .label {
                font-weight: bold;
                min-width: 100px;
                color: #666;
            }
        }

        .address-box {
            background: #f5f7fa;
            padding: 10px;
            border-radius: 4px;
            line-height: 1.6;
        }

        .total-row {
            display: flex;
            justify-content: flex-end;
            font-size: 16px;
            gap: 20px;
            margin-bottom: 10px;

            .total-price {
                color: #d52b1e;
                font-weight: bold;
                font-size: 20px;
            }
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;

            thead {
                background: #f5f7fa;
            }

            th,
            td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #e0e0e0;
            }

            th {
                font-weight: bold;
                color: #333;
            }
        }
    }
}
</style>

<template>
    <div class="statistics-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>📊 数据总览</h1>
                <p>平台运营数据统计和分析</p>
            </div>
            <div class="header-actions">
                <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :picker-options="pickerOptions"
                    @change="handleDateChange"
                ></el-date-picker>
                <el-button icon="el-icon-document" @click="showReportDialog">生成报告</el-button>
                <el-button type="primary" icon="el-icon-refresh" @click="refreshData" :loading="loading">刷新</el-button>
            </div>
        </div>

        <!-- 核心指标卡片 -->
        <el-row :gutter="20" class="stats-row">
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card users">
                    <div class="stat-header">
                        <span class="stat-title">总用户数</span>
                        <div class="stat-icon-wrapper">
                            <i class="el-icon-user"></i>
                        </div>
                    </div>
                    <div class="stat-number">{{ stats.users.total }}</div>
                    <div class="stat-footer">
                        <span class="stat-detail">今日新增 {{ stats.users.today }}</span>
                        <span :class="['stat-trend', stats.users.growth >= 0 ? 'up' : 'down']">
                            <i :class="stats.users.growth >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                            {{ Math.abs(stats.users.growth) }}%
                        </span>
                    </div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card pets">
                    <div class="stat-header">
                        <span class="stat-title">待领养动物</span>
                        <div class="stat-icon-wrapper">
                            <i class="el-icon-s-promotion"></i>
                        </div>
                    </div>
                    <div class="stat-number">{{ stats.pets.available }}</div>
                    <div class="stat-footer">
                        <span class="stat-detail">已领养 {{ stats.pets.adopted }}</span>
                        <span :class="['stat-trend', stats.pets.growth >= 0 ? 'up' : 'down']">
                            <i :class="stats.pets.growth >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                            {{ Math.abs(stats.pets.growth) }}%
                        </span>
                    </div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card adoptions">
                    <div class="stat-header">
                        <span class="stat-title">领养申请</span>
                        <div class="stat-icon-wrapper">
                            <i class="el-icon-document-checked"></i>
                        </div>
                    </div>
                    <div class="stat-number">{{ stats.adoptions.total }}</div>
                    <div class="stat-footer">
                        <span class="stat-detail">待审核 {{ stats.adoptions.pending }}</span>
                        <span :class="['stat-trend', stats.adoptions.growth >= 0 ? 'up' : 'down']">
                            <i :class="stats.adoptions.growth >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                            {{ Math.abs(stats.adoptions.growth) }}%
                        </span>
                    </div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card orders">
                    <div class="stat-header">
                        <span class="stat-title">订单总额</span>
                        <div class="stat-icon-wrapper">
                            <i class="el-icon-shopping-cart-full"></i>
                        </div>
                    </div>
                    <div class="stat-number">¥{{ formatMoney(stats.orders.totalAmount) }}</div>
                    <div class="stat-footer">
                        <span class="stat-detail">本月订单 {{ stats.orders.thisMonth }}</span>
                        <span class="stat-trend up">
                            <i class="el-icon-top"></i>
                            12%
                        </span>
                    </div>
                </div>
            </el-col>
        </el-row>

        <!-- 第二行指标卡片 -->
        <el-row :gutter="20" class="stats-row">
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card-mini">
                    <div class="mini-icon stories"><i class="el-icon-reading"></i></div>
                    <div class="mini-info">
                        <div class="mini-number">{{ stats.stories.total }}</div>
                        <div class="mini-title">领养故事</div>
                    </div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card-mini">
                    <div class="mini-icon comments"><i class="el-icon-chat-line-square"></i></div>
                    <div class="mini-info">
                        <div class="mini-number">{{ stats.comments.total }}</div>
                        <div class="mini-title">故事评论</div>
                    </div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card-mini">
                    <div class="mini-icon volunteers"><i class="el-icon-s-custom"></i></div>
                    <div class="mini-info">
                        <div class="mini-number">{{ stats.volunteers.active }}</div>
                        <div class="mini-title">活跃志愿者</div>
                    </div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card-mini">
                    <div class="mini-icon donations"><i class="el-icon-present"></i></div>
                    <div class="mini-info">
                        <div class="mini-number">¥{{ formatMoney(stats.donations.totalAmount) }}</div>
                        <div class="mini-title">捐赠总额</div>
                    </div>
                </div>
            </el-col>
        </el-row>

        <!-- 图表区域 -->
        <el-row :gutter="20" class="charts-row">
            <el-col :xs="24" :md="12">
                <div class="chart-card">
                    <h3>用户注册趋势</h3>
                    <div ref="userTrendChart" style="height: 300px;"></div>
                </div>
            </el-col>
            <el-col :xs="24" :md="12">
                <div class="chart-card">
                    <h3>领养申请趋势</h3>
                    <div ref="adoptionTrendChart" style="height: 300px;"></div>
                </div>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="charts-row">
            <el-col :xs="24" :md="12">
                <div class="chart-card">
                    <h3>宠物分类占比</h3>
                    <div ref="petCategoryChart" style="height: 300px;"></div>
                </div>
            </el-col>
            <el-col :xs="24" :md="12">
                <div class="chart-card">
                    <h3>领养申请状态分布</h3>
                    <div ref="adoptionStatusChart" style="height: 300px;"></div>
                </div>
            </el-col>
        </el-row>

        <!-- 详细数据表格 -->
        <el-row :gutter="20" class="table-row">
            <el-col :span="24">
                <div class="table-section">
                    <div class="table-header">
                        <h3>每日统计数据</h3>
                        <el-button size="small" icon="el-icon-download" @click="exportData" :loading="exportLoading">导出数据</el-button>
                    </div>
                    <el-table
                        :data="paginatedDailyStats"
                        stripe
                        style="width: 100%"
                        :default-sort="{ prop: 'date', order: 'descending' }"
                        v-loading="tableLoading"
                    >
                        <el-table-column prop="date" label="日期" min-width="120" sortable>
                            <template slot-scope="scope">
                                {{ formatDate(scope.row.date) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="newUsers" label="新增用户" min-width="100" align="center"></el-table-column>
                        <el-table-column prop="newPets" label="新增宠物" min-width="100" align="center"></el-table-column>
                        <el-table-column prop="adoptionApplications" label="领养申请" min-width="100" align="center"></el-table-column>
                        <el-table-column prop="approvedAdoptions" label="通过申请" min-width="100" align="center"></el-table-column>
                        <el-table-column prop="orders" label="订单数" min-width="100" align="center"></el-table-column>
                        <el-table-column prop="orderAmount" label="订单金额" min-width="120" align="center">
                            <template slot-scope="scope">
                                ¥{{ formatMoney(scope.row.orderAmount) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="comments" label="评论数" min-width="100" align="center"></el-table-column>
                    </el-table>
                    
                    <!-- 分页 -->
                    <div class="pagination-wrapper">
                        <el-pagination
                            :current-page.sync="currentPage"
                            :page-sizes="[10, 20, 50]"
                            :page-size.sync="pageSize"
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="dailyStats.length"
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                        ></el-pagination>
                    </div>
                </div>
            </el-col>
        </el-row>

        <!-- 热门数据 -->
        <el-row :gutter="20" class="hot-section">
            <el-col :xs="24" :md="8">
                <div class="hot-card">
                    <h3><i class="el-icon-star-on"></i> 热门宠物</h3>
                    <div class="hot-list">
                        <div class="hot-item" v-for="(pet, index) in hotData.hotPets" :key="pet.id">
                            <span class="hot-rank" :class="{ top3: index < 3 }">{{ index + 1 }}</span>
                            <span class="hot-name">{{ pet.pet_name }}</span>
                            <span class="hot-value">{{ pet.views }} 浏览</span>
                        </div>
                        <div v-if="hotData.hotPets.length === 0" class="no-data">暂无数据</div>
                    </div>
                </div>
            </el-col>
            <el-col :xs="24" :md="8">
                <div class="hot-card">
                    <h3><i class="el-icon-reading"></i> 热门故事</h3>
                    <div class="hot-list">
                        <div class="hot-item" v-for="(story, index) in hotData.hotStories" :key="story.id">
                            <span class="hot-rank" :class="{ top3: index < 3 }">{{ index + 1 }}</span>
                            <span class="hot-name">{{ story.title }}</span>
                            <span class="hot-value">{{ story.views }} 浏览</span>
                        </div>
                        <div v-if="hotData.hotStories.length === 0" class="no-data">暂无数据</div>
                    </div>
                </div>
            </el-col>
            <el-col :xs="24" :md="8">
                <div class="hot-card">
                    <h3><i class="el-icon-goods"></i> 热销商品</h3>
                    <div class="hot-list">
                        <div class="hot-item" v-for="(product, index) in hotData.hotProducts" :key="product.id">
                            <span class="hot-rank" :class="{ top3: index < 3 }">{{ index + 1 }}</span>
                            <span class="hot-name">{{ product.name }}</span>
                            <span class="hot-value">{{ product.sales_count }} 销量</span>
                        </div>
                        <div v-if="hotData.hotProducts.length === 0" class="no-data">暂无数据</div>
                    </div>
                </div>
            </el-col>
        </el-row>

        <!-- 生成报告对话框 -->
        <el-dialog title="生成统计报告" :visible.sync="reportDialogVisible" width="700px" top="5vh">
            <el-form :model="reportForm" label-width="100px">
                <el-form-item label="报告类型">
                    <el-radio-group v-model="reportForm.type" @change="handleReportTypeChange">
                        <el-radio label="daily">日报</el-radio>
                        <el-radio label="weekly">周报</el-radio>
                        <el-radio label="monthly">月报</el-radio>
                        <el-radio label="custom">自定义</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="日期范围" v-if="reportForm.type === 'custom'">
                    <el-date-picker
                        v-model="reportForm.dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                    ></el-date-picker>
                </el-form-item>
            </el-form>
            
            <!-- 报告预览 -->
            <div v-if="reportData" class="report-preview">
                <div class="report-header">
                    <h3>📊 {{ reportTypeText }}统计报告</h3>
                    <p>{{ reportData.dateRange.start }} 至 {{ reportData.dateRange.end }}</p>
                </div>
                
                <el-row :gutter="16" class="report-summary">
                    <el-col :span="6">
                        <div class="summary-item">
                            <div class="summary-value">{{ reportData.summary.users.new }}</div>
                            <div class="summary-label">新增用户</div>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="summary-item">
                            <div class="summary-value">{{ reportData.summary.pets.new }}</div>
                            <div class="summary-label">新增宠物</div>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="summary-item">
                            <div class="summary-value">{{ reportData.summary.adoptions.total }}</div>
                            <div class="summary-label">领养申请</div>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="summary-item">
                            <div class="summary-value">{{ reportData.summary.adoptions.successRate }}%</div>
                            <div class="summary-label">领养成功率</div>
                        </div>
                    </el-col>
                </el-row>
                
                <el-row :gutter="16" class="report-summary">
                    <el-col :span="6">
                        <div class="summary-item">
                            <div class="summary-value">{{ reportData.summary.orders.total }}</div>
                            <div class="summary-label">订单数</div>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="summary-item">
                            <div class="summary-value">¥{{ formatMoney(reportData.summary.orders.revenue) }}</div>
                            <div class="summary-label">订单收入</div>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="summary-item">
                            <div class="summary-value">{{ reportData.summary.content.newStories }}</div>
                            <div class="summary-label">新增故事</div>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="summary-item">
                            <div class="summary-value">{{ reportData.summary.content.newComments }}</div>
                            <div class="summary-label">新增评论</div>
                        </div>
                    </el-col>
                </el-row>
                
                <div class="report-details">
                    <h4>详细数据</h4>
                    <el-table :data="reportData.dailyTrend" size="small" max-height="200">
                        <el-table-column prop="date" label="日期" width="100">
                            <template slot-scope="scope">{{ formatDate(scope.row.date) }}</template>
                        </el-table-column>
                        <el-table-column prop="newUsers" label="新增用户" width="90"></el-table-column>
                        <el-table-column prop="newPets" label="新增宠物" width="90"></el-table-column>
                        <el-table-column prop="adoptionApplications" label="领养申请" width="90"></el-table-column>
                        <el-table-column prop="orders" label="订单数" width="80"></el-table-column>
                        <el-table-column prop="orderAmount" label="订单金额">
                            <template slot-scope="scope">¥{{ formatMoney(scope.row.orderAmount) }}</template>
                        </el-table-column>
                    </el-table>
                </div>
                
                <div class="report-footer">
                    <span>生成时间: {{ reportData.generatedAt }}</span>
                </div>
            </div>
            
            <div slot="footer">
                <el-button @click="reportDialogVisible = false">关闭</el-button>
                <el-button type="primary" @click="handleGenerateReport" :loading="reportLoading">
                    {{ reportData ? '重新生成' : '生成报告' }}
                </el-button>
                <el-button v-if="reportData" type="success" @click="downloadReport">
                    <i class="el-icon-download"></i> 导出报告
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import * as echarts from 'echarts'
import { getOverviewStats, getTrendData, getCategoryStats, getDailyStats, getHotData, generateReport, API_BASE_URL } from '@/utils/api'
import { formatDateTime, formatDateForAPI as formatDateForAPIUtil } from '@/utils/dateFormat'

export default {
    name: 'StatisticsOverview',
    data() {
        return {
            dateRange: [],
            loading: false,
            tableLoading: false,
            currentPage: 1,
            pageSize: 10,
            exportLoading: false,
            reportDialogVisible: false,
            reportLoading: false,
            reportData: null,
            reportForm: {
                type: 'weekly',
                dateRange: []
            },
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                            picker.$emit('pick', [start, end])
                        }
                    }
                ]
            },
            stats: {
                users: { total: 0, today: 0, thisMonth: 0, growth: 0 },
                pets: { total: 0, available: 0, adopted: 0, reserved: 0, growth: 0 },
                adoptions: { total: 0, pending: 0, approved: 0, rejected: 0, growth: 0 },
                stories: { total: 0, published: 0, totalViews: 0, totalLikes: 0 },
                comments: { total: 0, today: 0, totalLikes: 0 },
                orders: { total: 0, pending: 0, completed: 0, totalAmount: 0, thisMonth: 0 },
                donations: { total: 0, totalAmount: 0, today: 0 },
                volunteers: { total: 0, active: 0, totalServiceHours: 0 }
            },
            trendData: {
                userTrend: [],
                adoptionTrend: []
            },
            categoryStats: {
                petCategoryStats: [],
                adoptionStatusStats: []
            },
            dailyStats: [],
            hotData: {
                hotPets: [],
                hotStories: [],
                hotProducts: []
            },
            charts: {}
        }
    },
    computed: {
        reportTypeText() {
            const typeMap = {
                daily: '日',
                weekly: '周',
                monthly: '月',
                custom: '自定义'
            }
            return typeMap[this.reportForm.type] || ''
        },
        paginatedDailyStats() {
            const start = (this.currentPage - 1) * this.pageSize
            const end = start + this.pageSize
            return this.dailyStats.slice(start, end)
        }
    },
    methods: {
        handleDateChange() {
            this.loadDailyStats()
        },
        async refreshData() {
            this.loading = true
            try {
                await Promise.all([
                    this.loadOverviewStats(),
                    this.loadTrendData(),
                    this.loadCategoryStats(),
                    this.loadDailyStats(),
                    this.loadHotData()
                ])
            } catch (error) {
                console.error('刷新数据失败:', error)
                this.$message.error('刷新数据失败')
            } finally {
                this.loading = false
            }
        },
        async loadOverviewStats() {
            try {
                const response = await getOverviewStats()
                if (response.data.code === 200) {
                    this.stats = response.data.data
                }
            } catch (error) {
                console.error('加载总览统计失败:', error)
            }
        },
        async loadTrendData() {
            try {
                const response = await getTrendData({ days: 30 })
                if (response.data.code === 200) {
                    this.trendData = response.data.data
                    this.$nextTick(() => {
                        this.initUserTrendChart()
                        this.initAdoptionTrendChart()
                    })
                }
            } catch (error) {
                console.error('加载趋势数据失败:', error)
            }
        },
        async loadCategoryStats() {
            try {
                const response = await getCategoryStats()
                if (response.data.code === 200) {
                    this.categoryStats = response.data.data
                    this.$nextTick(() => {
                        this.initPetCategoryChart()
                        this.initAdoptionStatusChart()
                    })
                }
            } catch (error) {
                console.error('加载分类统计失败:', error)
            }
        },
        async loadDailyStats() {
            this.tableLoading = true
            try {
                const days = this.dateRange.length === 2 
                    ? Math.ceil((this.dateRange[1] - this.dateRange[0]) / (1000 * 60 * 60 * 24)) + 1
                    : 30
                const response = await getDailyStats({ days })
                if (response.data.code === 200) {
                    this.dailyStats = response.data.data
                }
            } catch (error) {
                console.error('加载每日统计失败:', error)
            } finally {
                this.tableLoading = false
            }
        },
        async loadHotData() {
            try {
                const response = await getHotData()
                if (response.data.code === 200) {
                    this.hotData = response.data.data
                }
            } catch (error) {
                console.error('加载热门数据失败:', error)
            }
        },
        initUserTrendChart() {
            const chartDom = this.$refs.userTrendChart
            if (!chartDom) return
            
            // 先销毁已存在的实例
            let existingChart = echarts.getInstanceByDom(chartDom)
            if (existingChart) {
                existingChart.dispose()
            }
            
            this.charts.userTrend = echarts.init(chartDom)
            const dates = this.trendData.userTrend.map(item => this.formatDate(item.date))
            const counts = this.trendData.userTrend.map(item => item.count)
            
            const option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: dates,
                    axisLabel: {
                        rotate: 45,
                        fontSize: 10
                    }
                },
                yAxis: {
                    type: 'value',
                    minInterval: 1
                },
                series: [{
                    name: '新增用户',
                    type: 'bar',
                    data: counts,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#d52b1e' },
                            { offset: 1, color: '#ff6b5b' }
                        ])
                    }
                }]
            }
            this.charts.userTrend.setOption(option)
        },
        initAdoptionTrendChart() {
            const chartDom = this.$refs.adoptionTrendChart
            if (!chartDom) return
            
            // 先销毁已存在的实例
            let existingChart = echarts.getInstanceByDom(chartDom)
            if (existingChart) {
                existingChart.dispose()
            }
            
            this.charts.adoptionTrend = echarts.init(chartDom)
            const dates = this.trendData.adoptionTrend.map(item => this.formatDate(item.date))
            const counts = this.trendData.adoptionTrend.map(item => item.count)
            const approved = this.trendData.adoptionTrend.map(item => item.approved)
            
            const option = {
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['申请数', '通过数']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: dates,
                    axisLabel: {
                        rotate: 45,
                        fontSize: 10
                    }
                },
                yAxis: {
                    type: 'value',
                    minInterval: 1
                },
                series: [
                    {
                        name: '申请数',
                        type: 'line',
                        data: counts,
                        smooth: true,
                        itemStyle: { color: '#d52b1e' }
                    },
                    {
                        name: '通过数',
                        type: 'line',
                        data: approved,
                        smooth: true,
                        itemStyle: { color: '#ff6b5b' }
                    }
                ]
            }
            this.charts.adoptionTrend.setOption(option)
        },
        initPetCategoryChart() {
            const chartDom = this.$refs.petCategoryChart
            if (!chartDom) return
            
            // 先销毁已存在的实例
            let existingChart = echarts.getInstanceByDom(chartDom)
            if (existingChart) {
                existingChart.dispose()
            }
            
            this.charts.petCategory = echarts.init(chartDom)
            const data = this.categoryStats.petCategoryStats.map(item => ({
                name: item.name,
                value: item.count
            }))
            
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left'
                },
                series: [{
                    name: '宠物分类',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 20,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: data
                }]
            }
            this.charts.petCategory.setOption(option)
        },
        initAdoptionStatusChart() {
            const chartDom = this.$refs.adoptionStatusChart
            if (!chartDom) return
            
            // 先销毁已存在的实例
            let existingChart = echarts.getInstanceByDom(chartDom)
            if (existingChart) {
                existingChart.dispose()
            }
            
            this.charts.adoptionStatus = echarts.init(chartDom)
            const statusMap = {
                'pending': '待审核',
                'approved': '已通过',
                'rejected': '已拒绝',
                'cancelled': '已取消'
            }
            const colorMap = {
                'pending': '#E6A23C',
                'approved': '#67C23A',
                'rejected': '#F56C6C',
                'cancelled': '#909399'
            }
            const data = this.categoryStats.adoptionStatusStats.map(item => ({
                name: statusMap[item.status] || item.status,
                value: item.count,
                itemStyle: { color: colorMap[item.status] }
            }))
            
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left'
                },
                series: [{
                    name: '申请状态',
                    type: 'pie',
                    radius: '70%',
                    data: data,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            }
            this.charts.adoptionStatus.setOption(option)
        },
        formatDate(dateStr) {
            const formatted = formatDateTime(dateStr, 'date')
            if (formatted === '-') return ''
            const parts = formatted.split('-')
            return `${parts[1]}/${parts[2]}`
        },
        formatMoney(amount) {
            if (!amount) return '0.00'
            return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        },
        exportData() {
            this.exportLoading = true
            const params = {}
            
            if (this.dateRange && this.dateRange.length === 2) {
                params.startDate = this.formatDateForApi(this.dateRange[0])
                params.endDate = this.formatDateForApi(this.dateRange[1])
            } else {
                params.days = 30
            }
            params.format = 'csv'
            
            // 使用window.open下载CSV文件
            const queryString = new URLSearchParams(params).toString()
            const token = localStorage.getItem('token')
            const url = `${API_BASE_URL}/report/export?${queryString}`
            
            // 创建隐藏的a标签进行下载
            fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.blob())
            .then(blob => {
                const downloadUrl = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = downloadUrl
                const startDate = params.startDate || this.formatDateForApi(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                const endDate = params.endDate || this.formatDateForApi(new Date())
                a.download = `统计报告_${startDate}_${endDate}.csv`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                window.URL.revokeObjectURL(downloadUrl)
                this.$message.success('导出成功')
            })
            .catch(error => {
                console.error('导出失败:', error)
                this.$message.error('导出失败')
            })
            .finally(() => {
                this.exportLoading = false
            })
        },
        formatDateForApi(date) {
            return formatDateForAPIUtil(date)
        },
        handleResize() {
            Object.values(this.charts).forEach(chart => {
                if (chart) chart.resize()
            })
        },
        handleSizeChange(val) {
            this.pageSize = val
            this.currentPage = 1
        },
        handleCurrentChange(val) {
            this.currentPage = val
        },
        showReportDialog() {
            this.reportDialogVisible = true
            this.reportData = null
        },
        handleReportTypeChange() {
            this.reportData = null
        },
        async handleGenerateReport() {
            this.reportLoading = true
            try {
                const params = { type: this.reportForm.type }
                if (this.reportForm.type === 'custom' && this.reportForm.dateRange && this.reportForm.dateRange.length === 2) {
                    params.startDate = this.formatDateForApi(this.reportForm.dateRange[0])
                    params.endDate = this.formatDateForApi(this.reportForm.dateRange[1])
                }
                const response = await generateReport(params)
                if (response.data.code === 200) {
                    this.reportData = response.data.data
                    this.$message.success('报告生成成功')
                }
            } catch (error) {
                console.error('生成报告失败:', error)
                this.$message.error('生成报告失败')
            } finally {
                this.reportLoading = false
            }
        },
        downloadReport() {
            if (!this.reportData) return
            
            // 生成报告内容
            const report = this.reportData
            let content = `${this.reportTypeText}统计报告\n`
            content += `=====================================\n`
            content += `报告周期: ${report.dateRange.start} 至 ${report.dateRange.end}\n`
            content += `生成时间: ${report.generatedAt}\n\n`
            
            content += `【数据摘要】\n`
            content += `新增用户: ${report.summary.users.new}\n`
            content += `总用户数: ${report.summary.users.total}\n`
            content += `新增宠物: ${report.summary.pets.new}\n`
            content += `待领养宠物: ${report.summary.pets.available}\n`
            content += `已领养宠物: ${report.summary.pets.adopted}\n`
            content += `领养申请数: ${report.summary.adoptions.total}\n`
            content += `领养成功率: ${report.summary.adoptions.successRate}%\n`
            content += `订单数: ${report.summary.orders.total}\n`
            content += `订单收入: ¥${this.formatMoney(report.summary.orders.revenue)}\n`
            content += `新增故事: ${report.summary.content.newStories}\n`
            content += `新增评论: ${report.summary.content.newComments}\n\n`
            
            content += `【每日明细】\n`
            content += `日期,新增用户,新增宠物,领养申请,订单数,订单金额\n`
            report.dailyTrend.forEach(item => {
                content += `${item.date},${item.newUsers},${item.newPets},${item.adoptionApplications},${item.orders},${item.orderAmount}\n`
            })
            
            // 下载文件
            const blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${this.reportTypeText}统计报告_${report.dateRange.start}_${report.dateRange.end}.txt`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
            this.$message.success('报告导出成功')
        }
    },
    mounted() {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        this.dateRange = [start, end]
        
        this.refreshData()
        
        window.addEventListener('resize', this.handleResize)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize)
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.dispose()
        })
    }
}
</script>

<style lang="less" scoped>

.page-header {
    background: white;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;

    .header-title {
        h1 {
            font-size: 24px;
            margin: 0 0 8px 0;
            color: #1f2937;
            font-weight: 600;
        }

        p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }
    }

    .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
    }
}

.stats-row {
    margin-bottom: 20px;
}

.stat-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
    }

    &.users .stat-icon-wrapper { background: linear-gradient(135deg, #d52b1e 0%, #ff6b5b 100%); }
    &.pets .stat-icon-wrapper { background: linear-gradient(135deg, #e85a4f 0%, #d52b1e 100%); }
    &.adoptions .stat-icon-wrapper { background: linear-gradient(135deg, #d52b1e 0%, #c41e12 100%); }
    &.orders .stat-icon-wrapper { background: linear-gradient(135deg, #ff6b5b 0%, #d52b1e 100%); }

    .stat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .stat-title {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }

        .stat-icon-wrapper {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;

            i {
                font-size: 24px;
                color: white;
            }
        }
    }

    .stat-number {
        font-size: 32px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 12px;
    }

    .stat-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .stat-detail {
            font-size: 12px;
            color: #9ca3af;
        }

        .stat-trend {
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 2px;
            padding: 2px 8px;
            border-radius: 12px;

            &.up {
                color: #10b981;
                background: rgba(16, 185, 129, 0.1);
            }

            &.down {
                color: #ef4444;
                background: rgba(239, 68, 68, 0.1);
            }
        }
    }
}

.stat-card-mini {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .mini-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
            font-size: 24px;
            color: white;
        }

        &.stories { background: linear-gradient(135deg, #ffe5e3 0%, #ffccc9 100%); i { color: #d52b1e; } }
        &.comments { background: linear-gradient(135deg, #ffd6d4 0%, #ffe8e6 100%); i { color: #d52b1e; } }
        &.volunteers { background: linear-gradient(135deg, #d52b1e 0%, #e85a4f 100%); i { color: #fff; } }
        &.donations { background: linear-gradient(135deg, #ff6b5b 0%, #d52b1e 100%); i { color: #fff; } }
    }

    .mini-info {
        .mini-number {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
        }

        .mini-title {
            font-size: 12px;
            color: #9ca3af;
        }
    }
}

.charts-row {
    margin-bottom: 20px;
}

.table-row {
    margin-bottom: 20px;
}

.chart-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    h3 {
        margin: 0 0 20px 0;
        color: #1f2937;
        font-size: 16px;
        font-weight: 600;
    }
}

.table-section {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;

    .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
            margin: 0;
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
        }
    }

    .pagination-wrapper {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
    }
}

.hot-section {
    margin-bottom: 20px;
}

.hot-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    h3 {
        margin: 0 0 20px 0;
        color: #1f2937;
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;

        i {
            color: #d52b1e;
        }
    }

    .hot-list {
        .hot-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;

            &:last-child {
                border-bottom: none;
            }

            .hot-rank {
                width: 24px;
                height: 24px;
                border-radius: 6px;
                background: #f3f4f6;
                color: #6b7280;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;

                &.top3 {
                    background: linear-gradient(135deg, #d52b1e 0%, #ff6b5b 100%);
                    color: white;
                }
            }

            .hot-name {
                flex: 1;
                font-size: 14px;
                color: #374151;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .hot-value {
                font-size: 12px;
                color: #9ca3af;
            }
        }

        .no-data {
            text-align: center;
            padding: 40px 0;
            color: #9ca3af;
            font-size: 14px;
        }
    }
}

@media (max-width: 768px) {
    .statistics-page {
        padding: 16px;
    }

    .page-header {
        padding: 16px;
        flex-direction: column;
        align-items: flex-start;

        .header-actions {
            width: 100%;
            flex-direction: column;

            .el-button {
                width: 100%;
            }
        }
    }

    .stat-card {
        margin-bottom: 12px;
    }

    .chart-card,
    .table-section,
    .hot-card {
        padding: 16px;
    }
}

// 报告对话框样式
.report-preview {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    margin-top: 16px;
    
    .report-header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e5e7eb;
        
        h3 {
            margin: 0 0 8px 0;
            color: #1f2937;
            font-size: 18px;
        }
        
        p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }
    }
    
    .report-summary {
        margin-bottom: 16px;
        
        .summary-item {
            background: white;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            
            .summary-value {
                font-size: 24px;
                font-weight: 700;
                color: #d52b1e;
                margin-bottom: 4px;
            }
            
            .summary-label {
                font-size: 12px;
                color: #6b7280;
            }
        }
    }
    
    .report-details {
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-top: 16px;
        
        h4 {
            margin: 0 0 12px 0;
            color: #1f2937;
            font-size: 14px;
        }
    }
    
    .report-footer {
        margin-top: 16px;
        text-align: right;
        font-size: 12px;
        color: #9ca3af;
    }
}
</style>

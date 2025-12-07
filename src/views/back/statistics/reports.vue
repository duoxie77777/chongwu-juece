<template>
    <div class="reports-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>📈 生成报告</h1>
                <p>创建和管理运营报告</p>
            </div>
            <div class="header-actions">
                <el-button type="primary" icon="el-icon-plus" @click="handleCreateReport">创建新报告</el-button>
            </div>
        </div>

        <!-- 报告类型选择 -->
        <div class="filter-section">
            <div class="filter-row">
                <div class="filter-inputs">
                    <div class="input-wrapper">
                        <el-input
                            v-model="searchQuery"
                            placeholder="搜索报告标题..."
                            clearable
                            prefix-icon="el-icon-search"
                            @keyup.enter.native="handleFilter"
                            class="search-input"
                        ></el-input>
                    </div>
                    <div class="input-wrapper select-wrapper">
                        <el-select 
                            v-model="filterType" 
                            placeholder="报告类型" 
                            clearable 
                            @change="handleFilter"
                            class="type-select"
                        >
                            <el-option label="全部类型" value="">
                                <span class="status-option">
                                    <span class="status-dot default"></span>全部类型
                                </span>
                            </el-option>
                            <el-option label="月度报告" value="monthly">
                                <span class="status-option">
                                    <span class="status-dot info"></span>月度报告
                                </span>
                            </el-option>
                            <el-option label="季度报告" value="quarterly">
                                <span class="status-option">
                                    <span class="status-dot warning"></span>季度报告
                                </span>
                            </el-option>
                            <el-option label="年度报告" value="annual">
                                <span class="status-option">
                                    <span class="status-dot success"></span>年度报告
                                </span>
                            </el-option>
                            <el-option label="自定义" value="custom">
                                <span class="status-option">
                                    <span class="status-dot danger"></span>自定义
                                </span>
                            </el-option>
                        </el-select>
                    </div>
                    <div class="input-wrapper select-wrapper">
                        <el-select 
                            v-model="filterStatus" 
                            placeholder="报告状态" 
                            clearable 
                            @change="handleFilter"
                            class="status-select"
                        >
                            <el-option label="全部状态" value="">
                                <span class="status-option">
                                    <span class="status-dot default"></span>全部状态
                                </span>
                            </el-option>
                            <el-option label="草稿" value="draft">
                                <span class="status-option">
                                    <span class="status-dot info"></span>草稿
                                </span>
                            </el-option>
                            <el-option label="已发布" value="published">
                                <span class="status-option">
                                    <span class="status-dot success"></span>已发布
                                </span>
                            </el-option>
                            <el-option label="已归档" value="archived">
                                <span class="status-option">
                                    <span class="status-dot danger"></span>已归档
                                </span>
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="filter-actions">
                    <el-button type="primary" icon="el-icon-search" @click="handleFilter" class="btn-search">
                        搜索
                    </el-button>
                    <el-button icon="el-icon-refresh-left" @click="handleReset" class="btn-reset">
                        重置
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 报告列表 -->
        <div class="reports-list" v-loading="loading">
            <el-table
                :data="filteredReports"
                stripe
                style="width: 100%"
                :default-sort="{ prop: 'createdAt', order: 'descending' }"
            >
                <el-table-column prop="id" label="ID" width="60"></el-table-column>
                <el-table-column prop="title" label="报告标题" min-width="200"></el-table-column>
                <el-table-column prop="type" label="类型" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="getTypeColor(scope.row.type)">
                            {{ getTypeLabel(scope.row.type) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="getStatusColor(scope.row.status)">
                            {{ getStatusLabel(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createdBy" label="创建人" width="100"></el-table-column>
                <el-table-column prop="createdAt" label="创建时间" min-width="140" sortable>
                    <template slot-scope="scope">
                        {{ formatDate(scope.row.createdAt) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="240" fixed="right">
                    <template slot-scope="scope">
                        <el-button
                            size="small"
                            type="primary"
                            plain
                            icon="el-icon-view"
                            @click="handleView(scope.row)"
                        >
                            查看
                        </el-button>
                        <el-button
                            size="small"
                            type="info"
                            plain
                            icon="el-icon-edit"
                            @click="handleEdit(scope.row)"
                            v-if="scope.row.status === 'draft'"
                        >
                            编辑
                        </el-button>
                        <el-button
                            size="small"
                            type="success"
                            plain
                            icon="el-icon-check"
                            @click="handlePublish(scope.row)"
                            v-if="scope.row.status === 'draft'"
                        >
                            发布
                        </el-button>
                        <el-button
                            size="small"
                            type="danger"
                            plain
                            icon="el-icon-delete"
                            @click="handleDelete(scope.row)"
                        >
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-wrapper">
                <el-pagination
                    :current-page.sync="currentPage"
                    :page-sizes="[10, 20, 50, 100]"
                    :page-size.sync="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                    @size-change="handlePageSizeChange"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>

        <!-- 创建报告对话框 -->
        <el-dialog
            :title="editFormData.id ? '编辑报告' : '创建新报告'"
            :visible.sync="editDialogVisible"
            width="700px"
            :close-on-click-modal="false"
        >
            <el-form ref="editForm" :model="editFormData" :rules="formRules" label-width="100px">
                <el-form-item label="报告标题" prop="title">
                    <el-input
                        v-model="editFormData.title"
                        placeholder="请输入报告标题"
                        maxlength="100"
                        show-word-limit
                    ></el-input>
                </el-form-item>
                <el-form-item label="报告类型" prop="type">
                    <el-select v-model="editFormData.type" placeholder="请选择报告类型">
                        <el-option label="月度报告" value="monthly"></el-option>
                        <el-option label="季度报告" value="quarterly"></el-option>
                        <el-option label="年度报告" value="annual"></el-option>
                        <el-option label="自定义" value="custom"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="报告周期" prop="period">
                    <el-date-picker
                        v-model="editFormData.period"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                    ></el-date-picker>
                </el-form-item>
                <el-form-item label="报告描述" prop="description">
                    <el-input
                        v-model="editFormData.description"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入报告描述"
                        maxlength="500"
                        show-word-limit
                    ></el-input>
                </el-form-item>
                <el-form-item label="包含内容">
                    <el-checkbox-group v-model="editFormData.sections">
                        <el-checkbox label="用户数据">用户数据</el-checkbox>
                        <el-checkbox label="领养数据">领养数据</el-checkbox>
                        <el-checkbox label="反馈数据">反馈数据</el-checkbox>
                        <el-checkbox label="财务数据">财务数据</el-checkbox>
                        <el-checkbox label="志愿者数据">志愿者数据</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitEdit" :loading="submitLoading">{{ editFormData.id ? '更新' : '创建' }}</el-button>
            </span>
        </el-dialog>

        <!-- 报告预览对话框 -->
        <el-dialog
            title="报告预览"
            :visible.sync="viewDialogVisible"
            width="900px"
            :close-on-click-modal="false"
        >
            <div v-if="currentReport" class="report-preview">
                <div class="report-header">
                    <h2>{{ currentReport.title }}</h2>
                    <div class="report-meta">
                        <span><strong>类型：</strong>{{ getTypeLabel(currentReport.type) }}</span>
                        <span><strong>创建人：</strong>{{ currentReport.createdBy }}</span>
                        <span><strong>创建时间：</strong>{{ formatDate(currentReport.createdAt) }}</span>
                    </div>
                </div>

                <el-divider></el-divider>

                <div class="report-content">
                    <h3>报告概述</h3>
                    <p>{{ currentReport.description }}</p>

                    <h3 style="margin-top: 20px;">包含内容</h3>
                    <div class="content-list">
                        <div v-for="section in currentReport.sections" :key="section" class="content-item">
                            <i class="el-icon-check"></i>
                            {{ section }}
                        </div>
                    </div>

                    <h3 style="margin-top: 20px;">关键指标</h3>
                    <el-row :gutter="20" v-if="currentReport.reportData && currentReport.reportData.summary">
                        <el-col :xs="24" :sm="12">
                            <div class="metric-box">
                                <div class="metric-label">总用户数</div>
                                <div class="metric-value">{{ currentReport.reportData.summary.users?.total || 0 }}</div>
                            </div>
                        </el-col>
                        <el-col :xs="24" :sm="12">
                            <div class="metric-box">
                                <div class="metric-label">新增用户</div>
                                <div class="metric-value">{{ currentReport.reportData.summary.users?.new || 0 }}</div>
                            </div>
                        </el-col>
                        <el-col :xs="24" :sm="12">
                            <div class="metric-box">
                                <div class="metric-label">待领养动物</div>
                                <div class="metric-value">{{ currentReport.reportData.summary.pets?.available || 0 }}</div>
                            </div>
                        </el-col>
                        <el-col :xs="24" :sm="12">
                            <div class="metric-box">
                                <div class="metric-label">领养申请</div>
                                <div class="metric-value">{{ currentReport.reportData.summary.adoptions?.total || 0 }}</div>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20" v-else>
                        <el-col :xs="24" :sm="12">
                            <div class="metric-box">
                                <div class="metric-label">总用户数</div>
                                <div class="metric-value">--</div>
                            </div>
                        </el-col>
                        <el-col :xs="24" :sm="12">
                            <div class="metric-box">
                                <div class="metric-label">成功领养</div>
                                <div class="metric-value">--</div>
                            </div>
                        </el-col>
                        <el-col :xs="24" :sm="12">
                            <div class="metric-box">
                                <div class="metric-label">待领养动物</div>
                                <div class="metric-value">--</div>
                            </div>
                        </el-col>
                        <el-col :xs="24" :sm="12">
                            <div class="metric-box">
                                <div class="metric-label">用户反馈</div>
                                <div class="metric-value">--</div>
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <el-button type="primary" icon="el-icon-download" @click="downloadReport">下载报告</el-button>
                    <el-button icon="el-icon-printer" @click="printReport">打印</el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { getReportList, getReportDetail, createReportRecord, updateReportRecord, deleteReportRecord, publishReportRecord } from '@/utils/api'
import { formatDateTime, formatDateForAPI as formatDateForAPIUtil } from '@/utils/dateFormat'

export default {
    name: 'ReportsManagement',
    data() {
        return {
            searchQuery: '',
            filterType: '',
            filterStatus: '',
            currentPage: 1,
            pageSize: 10,
            total: 0,
            reports: [],
            loading: false,
            editDialogVisible: false,
            viewDialogVisible: false,
            editFormData: {},
            currentReport: null,
            submitLoading: false,
            formRules: {
                title: [
                    { required: true, message: '请输入报告标题', trigger: 'blur' },
                    { min: 3, max: 100, message: '标题长度在 3 到 100 个字符之间', trigger: 'blur' }
                ],
                type: [
                    { required: true, message: '请选择报告类型', trigger: 'change' }
                ],
                period: [
                    { required: true, message: '请选择报告周期', trigger: 'change' }
                ]
            }
        }
    },
    watch: {
        filterType() {
            this.currentPage = 1
            this.loadReports()
        },
        filterStatus() {
            this.currentPage = 1
            this.loadReports()
        }
    },
    computed: {
        filteredReports() {
            return this.reports
        }
    },
    methods: {
        handleFilter() {
            this.currentPage = 1
            this.loadReports()
        },
        handleReset() {
            this.searchQuery = ''
            this.filterType = ''
            this.filterStatus = ''
            this.currentPage = 1
            this.loadReports()
        },
        async loadReports() {
            this.loading = true
            try {
                const params = {
                    page: this.currentPage,
                    size: this.pageSize
                }
                if (this.filterType) params.type = this.filterType
                if (this.filterStatus) params.status = this.filterStatus
                if (this.searchQuery) params.keyword = this.searchQuery
                
                const response = await getReportList(params)
                if (response.data.code === 200) {
                    this.reports = response.data.data.list.map(r => ({
                        id: r.id,
                        title: r.title,
                        type: r.type,
                        status: r.status,
                        createdBy: r.createdBy,
                        createdAt: r.createdAt,
                        description: r.description,
                        sections: r.sections || [],
                        startDate: r.startDate,
                        endDate: r.endDate
                    }))
                    this.total = response.data.data.total
                }
            } catch (error) {
                console.error('加载报告列表失败:', error)
                this.$message.error('加载报告列表失败')
            } finally {
                this.loading = false
            }
        },
        handleCreateReport() {
            this.editFormData = {
                id: null,
                title: '',
                type: 'monthly',
                period: [],
                description: '',
                sections: []
            }
            this.editDialogVisible = true
        },
        handleEdit(row) {
            this.editFormData = {
                id: row.id,
                title: row.title,
                type: row.type,
                period: row.startDate && row.endDate ? [new Date(row.startDate), new Date(row.endDate)] : [],
                description: row.description,
                sections: row.sections || []
            }
            this.editDialogVisible = true
        },
        async handleView(row) {
            try {
                const response = await getReportDetail(row.id)
                if (response.data.code === 200) {
                    this.currentReport = {
                        ...response.data.data,
                        reportData: response.data.data.reportData
                    }
                    this.viewDialogVisible = true
                }
            } catch (error) {
                console.error('获取报告详情失败:', error)
                this.$message.error('获取报告详情失败')
            }
        },
        handlePublish(row) {
            this.$confirm('确定发布这个报告吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    const response = await publishReportRecord(row.id)
                    if (response.data.code === 200) {
                        this.$message.success('报告已发布')
                        this.loadReports()
                    }
                } catch (error) {
                    console.error('发布报告失败:', error)
                    this.$message.error('发布报告失败')
                }
            }).catch(() => {
                this.$message.info('已取消发布')
            })
        },
        handleDelete(row) {
            this.$confirm('确定删除这个报告吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    const response = await deleteReportRecord(row.id)
                    if (response.data.code === 200) {
                        this.$message.success('报告已删除')
                        this.loadReports()
                    }
                } catch (error) {
                    console.error('删除报告失败:', error)
                    this.$message.error('删除报告失败')
                }
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },
        submitEdit() {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    this.submitLoading = true
                    try {
                        const data = {
                            title: this.editFormData.title,
                            type: this.editFormData.type,
                            description: this.editFormData.description,
                            startDate: this.editFormData.period[0] ? this.formatDateForApi(this.editFormData.period[0]) : null,
                            endDate: this.editFormData.period[1] ? this.formatDateForApi(this.editFormData.period[1]) : null,
                            sections: this.editFormData.sections
                        }
                        
                        let response
                        if (this.editFormData.id) {
                            response = await updateReportRecord(this.editFormData.id, data)
                        } else {
                            response = await createReportRecord(data)
                        }
                        
                        if (response.data.code === 200) {
                            const message = this.editFormData.id ? '报告已更新' : '报告已创建'
                            this.$message.success(message)
                            this.editDialogVisible = false
                            this.loadReports()
                        }
                    } catch (error) {
                        console.error('保存报告失败:', error)
                        this.$message.error('保存报告失败')
                    } finally {
                        this.submitLoading = false
                    }
                }
            })
        },
        handlePageChange(page) {
            this.currentPage = page
            this.loadReports()
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },
        handlePageSizeChange(size) {
            this.pageSize = size
            this.currentPage = 1
            this.loadReports()
        },
        formatDateForApi(date) {
            return formatDateForAPIUtil(date)
        },
        downloadReport() {
            if (!this.currentReport) return
            
            const report = this.currentReport
            let content = `${this.getTypeLabel(report.type)}\\n`
            content += `=====================================\\n`
            content += `报告标题: ${report.title}\\n`
            content += `报告周期: ${report.startDate} 至 ${report.endDate}\\n`
            content += `创建人: ${report.createdBy}\\n`
            content += `创建时间: ${this.formatDate(report.createdAt)}\\n\\n`
            
            if (report.description) {
                content += `【报告描述】\\n${report.description}\\n\\n`
            }
            
            if (report.reportData && report.reportData.summary) {
                const summary = report.reportData.summary
                content += `【数据摘要】\\n`
                if (summary.users) {
                    content += `新增用户: ${summary.users.new}\\n`
                    content += `总用户数: ${summary.users.total}\\n`
                }
                if (summary.pets) {
                    content += `新增宠物: ${summary.pets.new}\\n`
                    content += `待领养宠物: ${summary.pets.available}\\n`
                    content += `已领养宠物: ${summary.pets.adopted}\\n`
                }
                if (summary.adoptions) {
                    content += `领养申请数: ${summary.adoptions.total}\\n`
                    content += `领养通过数: ${summary.adoptions.approved}\\n`
                }
                if (summary.orders) {
                    content += `订单数: ${summary.orders.total}\\n`
                    content += `订单收入: ¥${summary.orders.revenue || 0}\\n`
                }
            }
            
            const blob = new Blob(['\\uFEFF' + content], { type: 'text/plain;charset=utf-8' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${report.title}.txt`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
            this.$message.success('报告导出成功')
        },
        printReport() {
            window.print()
        },
        getTypeLabel(type) {
            const map = {
                'monthly': '月度报告',
                'quarterly': '季度报告',
                'annual': '年度报告',
                'custom': '自定义'
            }
            return map[type] || type
        },
        getTypeColor(type) {
            const map = {
                'monthly': 'info',
                'quarterly': 'warning',
                'annual': 'success',
                'custom': 'danger'
            }
            return map[type] || 'info'
        },
        getStatusLabel(status) {
            const map = {
                'draft': '草稿',
                'published': '已发布',
                'archived': '已归档'
            }
            return map[status] || status
        },
        getStatusColor(status) {
            const map = {
                'draft': 'info',
                'published': 'success',
                'archived': 'danger'
            }
            return map[status] || 'info'
        },
        formatDate(date) {
            return formatDateTime(date, 'datetime')
        }
    },
    mounted() {
        this.loadReports()
    }
}
</script>

<style lang="less" scoped>

.page-header {
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;

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
        flex-shrink: 0;
    }
}

.filter-section {
    background: white;
    padding: 20px 24px;
    border-radius: 12px;
    margin-bottom: 24px;
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
        min-width: 180px;
        max-width: 240px;
    }

    .select-wrapper {
        min-width: 150px;
        max-width: 180px;
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

    .type-select,
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
        
        &.success { background: #67c23a; }
        &.info { background: #409eff; }
        &.warning { background: #e6a23c; }
        &.danger { background: #f56c6c; }
        &.default { background: #909399; }
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

.reports-list {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.report-preview {
    .report-header {
        h2 {
            margin: 0 0 16px 0;
            color: #1f2937;
            font-size: 20px;
        }

        .report-meta {
            display: flex;
            gap: 24px;
            font-size: 14px;
            color: #6b7280;

            span {
                strong {
                    color: #1f2937;
                    margin-right: 4px;
                }
            }
        }
    }

    .report-content {
        h3 {
            margin: 20px 0 12px 0;
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
        }

        p {
            color: #4b5563;
            line-height: 1.6;
            margin: 0;
        }

        .content-list {
            .content-item {
                padding: 8px 0;
                color: #4b5563;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;

                i {
                    color: #10b981;
                }
            }
        }

        .metric-box {
            background: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            border-left: 3px solid #1890ff;

            .metric-label {
                font-size: 12px;
                color: #6b7280;
                margin-bottom: 8px;
            }

            .metric-value {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
            }
        }
    }
}

@media (max-width: 768px) {
    .reports-page {
        padding: 16px;
    }

    .page-header,
    .filter-section,
    .reports-list {
        padding: 16px;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>

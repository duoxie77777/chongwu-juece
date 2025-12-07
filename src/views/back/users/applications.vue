<template>
    <div class="applications-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>📋 领养申请管理</h1>
                <p>审核和管理用户的动物领养申请</p>
            </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
            <div class="filter-row">
                <div class="filter-inputs">
                    <div class="input-wrapper">
                        <el-input
                            v-model="searchForm.keyword"
                            placeholder="搜索申请者或动物名称..."
                            clearable
                            prefix-icon="el-icon-search"
                            @keyup.enter="handleSearch"
                            class="search-input"
                        ></el-input>
                    </div>
                    <div class="input-wrapper">
                        <el-select
                            v-model="searchForm.status"
                            placeholder="选择审批状态"
                            clearable
                            @change="handleSearch"
                            class="status-select"
                        >
                            <el-option label="全部状态" value=""></el-option>
                            <el-option label="待审核" value="pending">
                                <span class="status-option">
                                    <span class="status-dot warning"></span>待审核
                                </span>
                            </el-option>
                            <el-option label="已通过" value="approved">
                                <span class="status-option">
                                    <span class="status-dot success"></span>已通过
                                </span>
                            </el-option>
                            <el-option label="已拒绝" value="rejected">
                                <span class="status-option">
                                    <span class="status-dot danger"></span>已拒绝
                                </span>
                            </el-option>
                        </el-select>
                    </div>
                    <div class="input-wrapper date-wrapper">
                        <el-date-picker
                            v-model="searchForm.dateRange"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            class="date-picker"
                        ></el-date-picker>
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

        <!-- 统计信息 -->
        <div class="stats-summary">
            <div class="stat-item warning">
                <div class="stat-label">待审核</div>
                <div class="stat-value">{{ stats.pending }}</div>
            </div>
            <div class="stat-item success">
                <div class="stat-label">已通过</div>
                <div class="stat-value">{{ stats.approved }}</div>
            </div>
            <div class="stat-item danger">
                <div class="stat-label">已拒绝</div>
                <div class="stat-value">{{ stats.rejected }}</div>
            </div>
            <div class="stat-item info">
                <div class="stat-label">总申请</div>
                <div class="stat-value">{{ stats.total }}</div>
            </div>
        </div>

        <!-- 申请表格 -->
        <div class="table-section">
            <el-table
                v-loading="loading"
                :data="applications"
                stripe
                style="width: 100%"
                :default-sort="{ prop: 'createdAt', order: 'descending' }"
            >
                <el-table-column prop="id" label="申请ID" width="80"></el-table-column>
                <el-table-column prop="applicantName" label="申请者" min-width="120">
                    <template slot-scope="scope">
                        <div class="applicant-info">
                            <span class="name">{{ scope.row.applicantName }}</span>
                            <span v-if="scope.row.occupation && scope.row.occupation !== '-'" class="occupation">{{ scope.row.occupation }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="animalName" label="申请动物" min-width="140">
                    <template slot-scope="scope">
                        <div class="animal-info">
                            <img :src="scope.row.animalImage" :alt="scope.row.animalName" class="animal-thumb" />
                            <div class="animal-details">
                                <span class="animal-name">{{ scope.row.animalName }}</span>
                                <span class="animal-type">{{ scope.row.animalType }}</span>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="applicantPhone" label="联系电话" min-width="120"></el-table-column>
                <el-table-column prop="applicantEmail" label="邮箱" min-width="140"></el-table-column>
                <el-table-column prop="status" label="审批状态" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="getStatusType(scope.row.status)">
                            {{ getStatusLabel(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="申请时间" min-width="180" sortable>
                    <template slot-scope="scope">
                        {{ formatDate(scope.row.createdAt) }}
                    </template>
                </el-table-column>
                <el-table-column prop="reviewTime" label="审核时间" min-width="180" v-if="false">
                    <template slot-scope="scope">
                        {{ scope.row.reviewTime ? formatDate(scope.row.reviewTime) : '-' }}
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
                            详情
                        </el-button>
                        <el-button
                            v-if="scope.row.status === 'pending'"
                            size="small"
                            type="success"
                            plain
                            icon="el-icon-check"
                            @click="handleApprove(scope.row)"
                        >
                            通过
                        </el-button>
                        <el-button
                            v-if="scope.row.status === 'pending'"
                            size="small"
                            type="danger"
                            plain
                            icon="el-icon-close"
                            @click="handleReject(scope.row)"
                        >
                            拒绝
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

        <!-- 申请详情对话框 -->
        <el-dialog
            title="申请详情"
            :visible.sync="viewDialogVisible"
            width="700px"
            :close-on-click-modal="false"
        >
            <div v-if="currentApplication" class="application-detail">
                <!-- 基本信息 -->
                <div class="section">
                    <h3>申请者信息</h3>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <p><strong>姓名：</strong> {{ currentApplication.applicantName }}</p>
                        </el-col>
                        <el-col :span="12">
                            <p><strong>职业：</strong> {{ currentApplication.occupation }}</p>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <p><strong>电话：</strong> {{ currentApplication.applicantPhone }}</p>
                        </el-col>
                        <el-col :span="12">
                            <p><strong>邮箱：</strong> {{ currentApplication.applicantEmail }}</p>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="24">
                            <p><strong>住址：</strong> {{ currentApplication.applicantAddress }}</p>
                        </el-col>
                    </el-row>
                </div>

                <el-divider></el-divider>

                <!-- 住房信息 -->
                <div class="section">
                    <h3>住房信息</h3>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <p><strong>住房类型：</strong> {{ currentApplication.housingType }}</p>
                        </el-col>
                        <el-col :span="12">
                            <p><strong>住房性质：</strong> {{ currentApplication.homeOwnership }}</p>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <p><strong>养宠经验：</strong> {{ currentApplication.hasExperience }}</p>
                        </el-col>
                        <el-col :span="12">
                            <p><strong>现有宠物：</strong> {{ currentApplication.hasOtherPets }}</p>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <p><strong>家庭成员同意：</strong> {{ currentApplication.familyAgree }}</p>
                        </el-col>
                    </el-row>
                </div>

                <el-divider></el-divider>

                <!-- 动物信息 -->
                <div class="section">
                    <h3>申请动物信息</h3>
                    <div class="animal-info-detail">
                        <img :src="currentApplication.animalImage" :alt="currentApplication.animalName" class="animal-image-detail" />
                        <div>
                            <p><strong>动物名称：</strong> {{ currentApplication.animalName }}</p>
                            <p><strong>动物类型：</strong> {{ currentApplication.animalCategory }}</p>
                        </div>
                    </div>
                </div>

                <el-divider></el-divider>

                <!-- 领养原因 -->
                <div class="section">
                    <h3>领养原因</h3>
                    <p class="reason-text">{{ currentApplication.reason }}</p>
                </div>

                <el-divider></el-divider>

                <!-- 领养承诺 -->
                <div class="section">
                    <h3>领养承诺</h3>
                    <p class="commitment-text">{{ currentApplication.commitment }}</p>
                </div>

                <el-divider></el-divider>

                <!-- 备注 -->
                <div class="section" v-if="currentApplication.status !== 'pending'">
                    <h3>处理备注</h3>
                    <p class="remark-text">{{ currentApplication.remark || '暂无备注' }}</p>
                    <p v-if="currentApplication.reviewTime" class="review-time">
                        <strong>审核时间：</strong>{{ formatDate(currentApplication.reviewTime) }}
                    </p>
                </div>
            </div>
        </el-dialog>

        <!-- 审批对话框 -->
        <el-dialog
            :title="approvalDialogType === 'approve' ? '通过申请' : '拒绝申请'"
            :visible.sync="approvalDialogVisible"
            width="500px"
            :close-on-click-modal="false"
        >
            <el-form ref="approvalForm" label-width="80px">
                <el-form-item label="处理意见">
                    <el-input
                        v-model="approvalRemark"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入处理意见（可选）"
                        maxlength="500"
                        show-word-limit
                    ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="approvalDialogVisible = false">取消</el-button>
                <el-button
                    :type="approvalDialogType === 'approve' ? 'success' : 'danger'"
                    @click="submitApproval"
                    :loading="submitLoading"
                >
                    {{ approvalDialogType === 'approve' ? '通过' : '拒绝' }}
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getAllAdoptionApplications, getAdoptionApplicationDetail, updateAdoptionApplicationStatus, getAdoptionApplicationStats } from '@/utils/api'
import { formatDateTime, formatDateForAPI as formatDateForAPIUtil } from '@/utils/dateFormat'

const API_BASE_URL = 'http://localhost:8889'

export default {
    name: 'ApplicationsList',
    data() {
        return {
            loading: false,
            searchForm: {
                keyword: '',
                status: '',
                dateRange: []
            },
            currentPage: 1,
            pageSize: 10,
            total: 0,
            applications: [],
            viewDialogVisible: false,
            approvalDialogVisible: false,
            currentApplication: null,
            approvalDialogType: 'approve',
            approvalRemark: '',
            submitLoading: false,
            stats: {
                pending: 0,
                approved: 0,
                rejected: 0,
                total: 0
            }
        }
    },
    methods: {
        handleSearch() {
            this.currentPage = 1
            this.loadApplications()
        },
        handleReset() {
            this.searchForm = {
                keyword: '',
                status: '',
                dateRange: []
            }
            this.currentPage = 1
            this.loadApplications()
        },
        async loadApplications() {
            this.loading = true
            try {
                const params = {
                    page: this.currentPage,
                    size: this.pageSize
                }

                if (this.searchForm.keyword) {
                    params.keyword = this.searchForm.keyword
                }

                if (this.searchForm.status) {
                    params.status = this.searchForm.status
                }

                if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
                    params.startDate = this.formatDateForAPI(this.searchForm.dateRange[0])
                    params.endDate = this.formatDateForAPI(this.searchForm.dateRange[1])
                }

                const response = await getAllAdoptionApplications(params)
                
                if (response.data && response.data.code === 200) {
                    this.applications = response.data.data.map(item => ({
                        id: item.id,
                        applicantName: item.applicant_name,
                        applicantPhone: item.applicant_phone,
                        applicantEmail: item.applicant_email || '-',
                        applicantAddress: item.applicant_address || '-',
                        occupation: item.occupation || '-',
                        housingType: item.housing_type || '-',
                        hasExperience: item.has_experience === 1,
                        hasOtherPets: item.has_other_pets === 1,
                        familyAgree: item.family_agree === 1,
                        reason: item.reason || '-',
                        commitment: item.commitment || '-',
                        animalName: item.pet_name || '未知',
                        animalType: this.getTypeName(item.pet_type),
                        animalImage: this.getPetImage(item.image_url),
                        status: item.status,
                        createdAt: item.create_time,
                        reviewTime: item.review_time,
                        reviewComment: item.review_comment || ''
                    }))

                    if (response.data.pagination) {
                        this.total = response.data.pagination.total
                    }
                }
            } catch (error) {
                console.error('加载申请列表失败:', error)
                this.$message.error('加载申请列表失败，请稍后重试')
            } finally {
                this.loading = false
            }
        },

        async loadStats() {
            try {
                const response = await getAdoptionApplicationStats()
                if (response.data && response.data.code === 200) {
                    this.stats = {
                        pending: response.data.data.pending || 0,
                        approved: response.data.data.approved || 0,
                        rejected: response.data.data.rejected || 0,
                        total: response.data.data.total || 0
                    }
                }
            } catch (error) {
                console.error('加载统计数据失败:', error)
            }
        },

        getTypeName(petType) {
            const typeMap = {
                'dog': '狗狗',
                'cat': '猫咪',
                'other': '其他'
            }
            return typeMap[petType] || '其他'
        },

        getPetImage(imageUrl) {
            if (!imageUrl) {
                return require('@/assets/front/index/wrapper-1.jpg')
            }
            if (imageUrl.startsWith('http')) {
                return imageUrl
            }
            return `${API_BASE_URL}${imageUrl}`
        },

        formatDateForAPI(date) {
            return formatDateForAPIUtil(date)
        },
        async handleView(row) {
            try {
                const response = await getAdoptionApplicationDetail(row.id)
                if (response.data && response.data.code === 200) {
                    const item = response.data.data
                    this.currentApplication = {
                        id: item.id,
                        applicantName: item.applicant_name,
                        applicantPhone: item.applicant_phone,
                        applicantEmail: item.applicant_email || '-',
                        applicantAddress: item.applicant_address || '-',
                        occupation: item.occupation || '-',
                        housingType: item.housing_type || '-',
                        homeOwnership: item.housing_type ? (item.housing_type.includes('租') ? '租赁' : '自有') : '-',
                        hasGarden: '-',
                        hasExperience: item.has_experience === 1 ? '有' : '无',
                        hasOtherPets: item.has_other_pets === 1 ? '有' : '无',
                        familyAgree: item.family_agree === 1 ? '是' : '否',
                        reason: item.reason || '-',
                        commitment: item.commitment || '-',
                        animalName: item.pet_name || '未知',
                        animalCategory: this.getTypeName(item.pet_type),
                        animalImage: this.getPetImage(item.image_url),
                        status: item.status,
                        createdAt: item.create_time,
                        reviewTime: item.review_time,
                        remark: item.review_comment || '暂无备注'
                    }
                    this.viewDialogVisible = true
                }
            } catch (error) {
                console.error('加载申请详情失败:', error)
                this.$message.error('加载申请详情失败')
            }
        },
        handleApprove(row) {
            this.currentApplication = row
            this.approvalDialogType = 'approve'
            this.approvalRemark = ''
            this.approvalDialogVisible = true
        },
        handleReject(row) {
            this.currentApplication = row
            this.approvalDialogType = 'reject'
            this.approvalRemark = ''
            this.approvalDialogVisible = true
        },
        async submitApproval() {
            if (!this.currentApplication) return

            this.submitLoading = true
            try {
                const status = this.approvalDialogType === 'approve' ? 'approved' : 'rejected'
                const response = await updateAdoptionApplicationStatus(this.currentApplication.id, {
                    status: status,
                    review_comment: this.approvalRemark || null
                })

                if (response.data && response.data.code === 200) {
                    this.$message.success(response.data.message || '操作成功')
                    this.approvalDialogVisible = false
                    this.approvalRemark = ''
                    // 重新加载列表和统计
                    await this.loadApplications()
                    await this.loadStats()
                } else {
                    this.$message.error(response.data?.message || '操作失败')
                }
            } catch (error) {
                console.error('更新申请状态失败:', error)
                this.$message.error(error.data?.message || '操作失败，请稍后重试')
            } finally {
                this.submitLoading = false
            }
        },
        handlePageChange() {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },
        handlePageSizeChange() {
            this.currentPage = 1
        },
        getStatusLabel(status) {
            const map = {
                'pending': '待审核',
                'approved': '已通过',
                'rejected': '已拒绝'
            }
            return map[status] || status
        },
        getStatusType(status) {
            const map = {
                'pending': 'warning',
                'approved': 'success',
                'rejected': 'danger'
            }
            return map[status] || 'info'
        },
        formatDate(date) {
            return formatDateTime(date, 'datetime')
        }
    },
    mounted() {
        this.loadApplications()
        this.loadStats()
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
    border: 1px solid #f0f0f0;

    h1 {
        font-size: 26px;
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

    .date-wrapper {
        min-width: 280px;
        max-width: 360px;
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

    .date-picker {
        width: 100%;
        
        ::v-deep .el-range-input {
            font-size: 13px;
        }
        
        ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 1px solid #e4e7ed;
            height: 40px;
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
        &.info { background: #909399; }
        &.warning { background: #e6a23c; }
        &.danger { background: #f56c6c; }
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

.stats-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .stat-item {
        background: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        border: 1px solid #f0f0f0;
        transition: all 0.3s ease;
        border-left: 4px solid #409eff;

        &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }

        &.warning {
            border-left-color: #e6a23c;
            background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
            .stat-value { color: #e6a23c; }
        }

        &.success {
            border-left-color: #67c23a;
            background: linear-gradient(135deg, #f0f9ff 0%, #f6ffed 100%);
            .stat-value { color: #67c23a; }
        }

        &.danger {
            border-left-color: #f56c6c;
            background: linear-gradient(135deg, #fff1f0 0%, #fff5f5 100%);
            .stat-value { color: #f56c6c; }
        }

        &.info {
            border-left-color: #409eff;
            background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
            .stat-value { color: #409eff; }
        }

        .stat-label {
            font-size: 14px;
            color: #8b92a9;
            margin-bottom: 10px;
            font-weight: 500;
        }

        .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #409eff;
        }
    }
}

.table-section {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #f0f0f0;

    /deep/ .el-table {
        .el-table__header {
            th {
                background-color: #fafafa;
                color: #333;
                font-weight: 600;
            }
        }

        .el-table__row {
            &:hover {
                background-color: #f5f7fa;
            }
        }
    }
}

.applicant-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .name {
        font-weight: 500;
        color: #333;
    }

    .occupation {
        font-size: 12px;
        color: #999;
    }
}

.animal-info {
    display: flex;
    align-items: center;
    gap: 10px;

    .animal-thumb {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        object-fit: cover;
        border: 1px solid #e0e0e0;
    }

    .animal-details {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .animal-name {
            font-weight: 500;
            color: #333;
        }

        .animal-type {
            font-size: 12px;
            color: #999;
        }
    }
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.application-detail {
    .section {
        margin-bottom: 20px;

        h3 {
            font-size: 16px;
            color: #1f2937;
            font-weight: 600;
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #1890ff;
            display: inline-block;
        }

        p {
            margin: 12px 0;
            line-height: 1.6;

            strong {
                color: #1f2937;
                margin-right: 8px;
            }
        }
    }

    .animal-info-detail {
        display: flex;
        gap: 15px;
        align-items: flex-start;

        .animal-image-detail {
            width: 120px;
            height: 120px;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid #e0e0e0;
        }
    }

    .reason-text,
    .commitment-text,
    .remark-text {
        background: #f5f7fa;
        padding: 15px;
        border-radius: 6px;
        border-left: 4px solid #d52b1e;
        color: #666;
        line-height: 1.8;
        white-space: pre-wrap;
        word-break: break-word;
    }

    .review-time {
        margin-top: 10px;
        font-size: 13px;
        color: #999;

        strong {
            color: #666;
        }
    }
}

@media (max-width: 768px) {
    .applications-page {
        padding: 20px;
    }

    .page-header,
    .filter-section,
    .table-section {
        padding: 16px;
    }

    .filter-section {
        .filter-row {
            flex-direction: column;
            align-items: stretch;
        }

        .filter-inputs {
            width: 100%;
        }

        .input-wrapper {
            max-width: none;
            width: 100%;
        }

        .date-wrapper {
            max-width: none;
        }

        .filter-actions {
            width: 100%;
            
            .el-button {
                flex: 1;
            }
        }
    }

    .stats-summary {
        grid-template-columns: repeat(2, 1fr);
    }

    .table-section {
        overflow-x: auto;
    }
}
</style>

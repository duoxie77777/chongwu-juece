<template>
    <div class="volunteers-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>🤝 志愿者管理</h1>
                <p>管理平台中的志愿者信息和活动</p>
            </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="6">
                    <el-input
                        v-model="searchQuery"
                        placeholder="搜索志愿者名称"
                        clearable
                        prefix-icon="el-icon-search"
                    ></el-input>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <el-select v-model="filterLevel" placeholder="筛选等级" clearable>
                        <el-option label="全部" value=""></el-option>
                        <el-option label="初级" value="junior"></el-option>
                        <el-option label="中级" value="middle"></el-option>
                        <el-option label="高级" value="senior"></el-option>
                    </el-select>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <el-select v-model="filterStatus" placeholder="筛选状态" clearable>
                        <el-option label="全部" value=""></el-option>
                        <el-option label="活跃" value="active"></el-option>
                        <el-option label="休息中" value="inactive"></el-option>
                    </el-select>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                </el-col>
            </el-row>
        </div>

        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-row">
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card">
                    <div class="stat-number">{{ stats.total }}</div>
                    <div class="stat-label">总志愿者</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card success">
                    <div class="stat-number">{{ stats.active }}</div>
                    <div class="stat-label">活跃</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card info">
                    <div class="stat-number">{{ stats.totalHours }}</div>
                    <div class="stat-label">总服务时数</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card warning">
                    <div class="stat-number">{{ stats.totalActivities }}</div>
                    <div class="stat-label">总活动</div>
                </div>
            </el-col>
        </el-row>

        <!-- 志愿者表格 -->
        <div class="table-section">
            <el-table
                :data="filteredVolunteers"
                stripe
                style="width: 100%"
                :default-sort="{ prop: 'serviceHours', order: 'descending' }"
            >
                <el-table-column prop="id" label="ID" width="60"></el-table-column>
                <el-table-column prop="name" label="志愿者名称" min-width="120">
                    <template slot-scope="scope">
                        <div class="volunteer-info">
                            <img :src="scope.row.avatar" :alt="scope.row.name" class="avatar" />
                            <span>{{ scope.row.name }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="email" label="邮箱" min-width="140"></el-table-column>
                <el-table-column prop="phone" label="手机" min-width="120"></el-table-column>
                <el-table-column prop="level" label="等级" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="getLevelType(scope.row.level)">
                            {{ getLevelLabel(scope.row.level) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                            {{ scope.row.status === 'active' ? '活跃' : '休息中' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="serviceHours" label="服务时数" width="90" sortable></el-table-column>
                <el-table-column prop="activityCount" label="参与活动" width="90" sortable></el-table-column>
                <el-table-column prop="joinDate" label="加入日期" min-width="120">
                    <template slot-scope="scope">
                        {{ formatDate(scope.row.joinDate) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
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
                            size="small"
                            type="info"
                            plain
                            icon="el-icon-edit"
                            @click="handleEdit(scope.row)"
                        >
                            编辑
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

        <!-- 志愿者详情对话框 -->
        <el-dialog
            title="志愿者详情"
            :visible.sync="viewDialogVisible"
            width="700px"
            :close-on-click-modal="false"
        >
            <div v-if="currentVolunteer" class="volunteer-detail">
                <!-- 基本信息 -->
                <div class="section">
                    <div class="detail-avatar">
                        <img :src="currentVolunteer.avatar" :alt="currentVolunteer.name" />
                    </div>
                    <h2 class="volunteer-name">{{ currentVolunteer.name }}</h2>
                    <p class="volunteer-level">
                        <el-tag :type="getLevelType(currentVolunteer.level)">
                            {{ getLevelLabel(currentVolunteer.level) }}
                        </el-tag>
                    </p>
                </div>

                <el-divider></el-divider>

                <!-- 联系信息 -->
                <div class="section">
                    <h3>联系信息</h3>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <p><strong>邮箱：</strong> {{ currentVolunteer.email }}</p>
                        </el-col>
                        <el-col :span="12">
                            <p><strong>手机：</strong> {{ currentVolunteer.phone }}</p>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="24">
                            <p><strong>地址：</strong> {{ currentVolunteer.address }}</p>
                        </el-col>
                    </el-row>
                </div>

                <el-divider></el-divider>

                <!-- 服务统计 -->
                <div class="section">
                    <h3>服务统计</h3>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <div class="mini-stat">
                                <div class="stat-value">{{ currentVolunteer.serviceHours }}</div>
                                <div class="stat-name">服务时数</div>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="mini-stat">
                                <div class="stat-value">{{ currentVolunteer.activityCount }}</div>
                                <div class="stat-name">参与活动</div>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="mini-stat">
                                <div class="stat-value">{{ currentVolunteer.animalsCared }}</div>
                                <div class="stat-name">照顾动物</div>
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <el-divider></el-divider>

                <!-- 兴趣和特长 -->
                <div class="section">
                    <h3>兴趣和特长</h3>
                    <div class="tags-wrapper">
                        <el-tag
                            v-for="skill in currentVolunteer.skills"
                            :key="skill"
                            class="skill-tag"
                        >
                            {{ skill }}
                        </el-tag>
                    </div>
                </div>

                <el-divider></el-divider>

                <!-- 个人描述 -->
                <div class="section">
                    <h3>个人描述</h3>
                    <p class="bio-text">{{ currentVolunteer.bio }}</p>
                </div>

                <!-- 加入信息 -->
                <div class="section">
                    <h3>加入信息</h3>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <p><strong>加入日期：</strong> {{ formatDate(currentVolunteer.joinDate) }}</p>
                        </el-col>
                        <el-col :span="12">
                            <p><strong>状态：</strong> {{ currentVolunteer.status === 'active' ? '活跃' : '休息中' }}</p>
                        </el-col>
                    </el-row>
                </div>
            </div>
        </el-dialog>

        <!-- 编辑志愿者对话框 -->
        <el-dialog
            title="编辑志愿者"
            :visible.sync="editDialogVisible"
            width="600px"
            :close-on-click-modal="false"
        >
            <el-form ref="editForm" :model="editFormData" :rules="formRules" label-width="100px">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="editFormData.name"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editFormData.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="phone">
                    <el-input v-model="editFormData.phone"></el-input>
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input v-model="editFormData.address"></el-input>
                </el-form-item>
                <el-form-item label="等级" prop="level">
                    <el-select v-model="editFormData.level">
                        <el-option label="初级" value="junior"></el-option>
                        <el-option label="中级" value="middle"></el-option>
                        <el-option label="高级" value="senior"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="editFormData.status">
                        <el-option label="活跃" value="active"></el-option>
                        <el-option label="休息中" value="inactive"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="个人描述" prop="bio">
                    <el-input
                        v-model="editFormData.bio"
                        type="textarea"
                        :rows="3"
                        maxlength="500"
                        show-word-limit
                    ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitEdit" :loading="submitLoading">保存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'VolunteersList',
    data() {
        return {
            searchQuery: '',
            filterLevel: '',
            filterStatus: '',
            currentPage: 1,
            pageSize: 10,
            total: 0,
            volunteers: [],
            viewDialogVisible: false,
            editDialogVisible: false,
            currentVolunteer: null,
            editFormData: {},
            submitLoading: false,
            stats: {
                total: 0,
                active: 0,
                totalHours: 0,
                totalActivities: 0
            },
            formRules: {
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
                ],
                phone: [
                    { required: true, message: '请输入手机号', trigger: 'blur' }
                ]
            }
        }
    },
    computed: {
        filteredVolunteers() {
            return this.volunteers.slice(
                (this.currentPage - 1) * this.pageSize,
                this.currentPage * this.pageSize
            )
        }
    },
    methods: {
        handleSearch() {
            this.currentPage = 1
            this.loadVolunteers()
        },
        loadVolunteers() {
            const mockVolunteers = [
                {
                    id: 1,
                    name: '张三',
                    email: 'zhangsan@example.com',
                    phone: '13800138000',
                    address: '北京市朝阳区',
                    avatar: 'https://via.placeholder.com/80?text=张三',
                    level: 'senior',
                    status: 'active',
                    serviceHours: 120,
                    activityCount: 25,
                    animalsCared: 15,
                    joinDate: '2023-01-15',
                    skills: ['动物照护', '卫生清洁', '喂食护理', '志愿宣传'],
                    bio: '资深志愿者，有多年的动物护理经验，对各种动物都很有爱心。'
                },
                {
                    id: 2,
                    name: '李四',
                    email: 'lisi@example.com',
                    phone: '13800138001',
                    address: '上海市浦东新区',
                    avatar: 'https://via.placeholder.com/80?text=李四',
                    level: 'middle',
                    status: 'active',
                    serviceHours: 85,
                    activityCount: 18,
                    animalsCared: 10,
                    joinDate: '2023-06-20',
                    skills: ['喂食护理', '卫生清洁', '与动物互动'],
                    bio: '中级志愿者，热心参与各种动物保护活动。'
                },
                {
                    id: 3,
                    name: '王五',
                    email: 'wangwu@example.com',
                    phone: '13800138002',
                    address: '广州市天河区',
                    avatar: 'https://via.placeholder.com/80?text=王五',
                    level: 'junior',
                    status: 'active',
                    serviceHours: 32,
                    activityCount: 8,
                    animalsCared: 5,
                    joinDate: '2024-01-10',
                    skills: ['卫生清洁', '简单喂食'],
                    bio: '初级志愿者，新加入团队，正在学习。'
                },
                {
                    id: 4,
                    name: '赵六',
                    email: 'zhaoliu@example.com',
                    phone: '13800138003',
                    address: '深圳市南山区',
                    avatar: 'https://via.placeholder.com/80?text=赵六',
                    level: 'senior',
                    status: 'inactive',
                    serviceHours: 95,
                    activityCount: 20,
                    animalsCared: 12,
                    joinDate: '2023-03-15',
                    skills: ['动物照护', '医疗协助', '志愿宣传'],
                    bio: '专业志愿者，具有兽医背景，当前休息中。'
                },
                {
                    id: 5,
                    name: '孙七',
                    email: 'sunqi@example.com',
                    phone: '13800138004',
                    address: '杭州市西湖区',
                    avatar: 'https://via.placeholder.com/80?text=孙七',
                    level: 'middle',
                    status: 'active',
                    serviceHours: 76,
                    activityCount: 16,
                    animalsCared: 9,
                    joinDate: '2023-08-05',
                    skills: ['动物互动', '教育宣传', '社交媒体'],
                    bio: '中级志愿者，擅长社交媒体宣传和教育。'
                }
            ]

            this.volunteers = mockVolunteers
            this.total = mockVolunteers.length

            // 计算统计数据
            this.stats.total = mockVolunteers.length
            this.stats.active = mockVolunteers.filter(v => v.status === 'active').length
            this.stats.totalHours = mockVolunteers.reduce((sum, v) => sum + v.serviceHours, 0)
            this.stats.totalActivities = mockVolunteers.reduce((sum, v) => sum + v.activityCount, 0)
        },
        handleView(row) {
            this.currentVolunteer = Object.assign({}, row)
            this.viewDialogVisible = true
        },
        handleEdit(row) {
            this.editFormData = Object.assign({}, row)
            this.editDialogVisible = true
        },
        submitEdit() {
            this.$refs.editForm.validate((valid) => {
                if (valid) {
                    this.submitLoading = true
                    setTimeout(() => {
                        this.submitLoading = false
                        this.$message.success('志愿者信息更新成功')
                        this.editDialogVisible = false
                        this.loadVolunteers()
                    }, 1000)
                }
            })
        },
        handleDelete(row) {
            this.$confirm(`确定删除志愿者 ${row.name} 吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$message.success('志愿者已删除')
                this.loadVolunteers()
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },
        handlePageChange() {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },
        handlePageSizeChange() {
            this.currentPage = 1
        },
        getLevelLabel(level) {
            const map = {
                'junior': '初级',
                'middle': '中级',
                'senior': '高级'
            }
            return map[level] || level
        },
        getLevelType(level) {
            const map = {
                'junior': 'info',
                'middle': 'warning',
                'senior': 'success'
            }
            return map[level] || 'info'
        },
        formatDate(date) {
            const { formatDateTime } = require('@/utils/dateFormat')
            return formatDateTime(date, 'date')
        }
    },
    mounted() {
        this.loadVolunteers()
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

.filter-section {
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    ::v-deep .el-input,
    ::v-deep .el-select {
        width: 100%;
    }
}

.stats-row {
    margin-bottom: 24px;
}

.stat-card {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    border-left: 4px solid #1890ff;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
    }

    &.success {
        border-left-color: #52c41a;
    }

    &.info {
        border-left-color: #1890ff;
    }

    &.warning {
        border-left-color: #faad14;
    }

    .stat-number {
        font-size: 32px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
    }

    .stat-label {
        font-size: 14px;
        color: #6b7280;
    }
}

.table-section {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.volunteer-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.volunteer-detail {
    .detail-avatar {
        text-align: center;
        margin-bottom: 20px;

        img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #1890ff;
        }
    }

    .volunteer-name {
        text-align: center;
        font-size: 20px;
        color: #1f2937;
        margin: 12px 0 8px 0;
    }

    .volunteer-level {
        text-align: center;
        margin: 0 0 20px 0;
    }

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

    .mini-stat {
        text-align: center;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 4px;

        .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #1890ff;
            margin-bottom: 8px;
        }

        .stat-name {
            font-size: 12px;
            color: #6b7280;
        }
    }

    .tags-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .skill-tag {
            margin-bottom: 8px;
        }
    }

    .bio-text {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 4px;
        border-left: 3px solid #1890ff;
        color: #666;
        line-height: 1.6;
    }
}

@media (max-width: 768px) {
    .volunteers-page {
        padding: 16px;
    }

    .page-header,
    .filter-section,
    .table-section {
        padding: 16px;
    }

    .table-section {
        overflow-x: auto;
    }

    .stats-row {
        margin-bottom: 16px;
    }
}
</style>

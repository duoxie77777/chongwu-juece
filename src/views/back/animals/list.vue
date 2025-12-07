<template>
    <div class="animals-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>🐾 动物管理</h1>
                <p>管理平台中的所有动物信息</p>
            </div>
            <div class="header-actions">
                <el-button type="primary" icon="el-icon-plus" @click="toAddAnimal">发布新动物</el-button>
            </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
            <div class="filter-row">
                <div class="filter-inputs">
                    <div class="input-wrapper">
                        <el-input
                            v-model="searchForm.keyword"
                            placeholder="搜索动物名称..."
                            clearable
                            prefix-icon="el-icon-search"
                            @keyup.enter="handleSearch"
                            class="search-input"
                        ></el-input>
                    </div>
                    <div class="input-wrapper">
                        <el-select
                            v-model="searchForm.status"
                            placeholder="选择状态"
                            clearable
                            @change="handleSearch"
                            class="status-select"
                        >
                            <el-option label="全部状态" value=""></el-option>
                            <el-option label="待领养" value="available">
                                <span class="status-option">
                                    <span class="status-dot success"></span>待领养
                                </span>
                            </el-option>
                            <el-option label="已领养" value="adopted">
                                <span class="status-option">
                                    <span class="status-dot info"></span>已领养
                                </span>
                            </el-option>
                            <el-option label="预留" value="reserved">
                                <span class="status-option">
                                    <span class="status-dot warning"></span>预留
                                </span>
                            </el-option>
                            <el-option label="不可领养" value="unavailable">
                                <span class="status-option">
                                    <span class="status-dot danger"></span>不可领养
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

        <!-- 统计信息 -->
        <div class="stats-summary">
            <div class="stat-item">
                <div class="stat-label">总数</div>
                <div class="stat-value">{{ statistics.total }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">待领养</div>
                <div class="stat-value" style="color: #67c23a;">{{ statistics.available }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">已领养</div>
                <div class="stat-value" style="color: #909399;">{{ statistics.adopted }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">其他</div>
                <div class="stat-value" style="color: #f56c6c;">{{ statistics.other }}</div>
            </div>
        </div>

        <!-- 动物表格 -->
        <div class="table-section">
            <el-table
                :data="animalList"
                style="width: 100%"
                stripe
                :loading="loading"
                v-if="animalList.length > 0"
            >
                <!-- 序号 -->
                <el-table-column prop="id" label="ID" width="80"></el-table-column>

                <!-- 图片 -->
                <el-table-column label="图片" width="100">
                    <template slot-scope="scope">
                        <div class="animal-image">
                            <img v-if="scope.row.image_url" :src="scope.row.image_url" :alt="scope.row.pet_name" />
                            <span v-else class="no-image">无图片</span>
                        </div>
                    </template>
                </el-table-column>

                <!-- 名称 -->
                <el-table-column prop="pet_name" label="名称" min-width="120"></el-table-column>

                <!-- 分类 -->
                <el-table-column prop="category_id" label="分类" width="100">
                    <template slot-scope="scope">
                        <span>{{ getCategoryLabel(scope.row.category_id) }}</span>
                    </template>
                </el-table-column>

                <!-- 性别 -->
                <el-table-column prop="gender" label="性别" width="80">
                    <template slot-scope="scope">
                        <span>{{ getGenderLabel(scope.row.gender) }}</span>
                    </template>
                </el-table-column>

                <!-- 年龄 -->
                <el-table-column prop="age" label="年龄" width="80">
                    <template slot-scope="scope">
                        <span>{{ scope.row.age ? scope.row.age + '个月' : '-' }}</span>
                    </template>
                </el-table-column>

                <!-- 状态 -->
                <el-table-column prop="status" label="状态" width="120">
                    <template slot-scope="scope">
                        <el-tag :type="getStatusTagType(scope.row.status)">
                            {{ getStatusLabel(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>

                <!-- 创建时间 -->
                <el-table-column prop="create_time" label="创建时间" width="160">
                    <template slot-scope="scope">
                        {{ formatDate(scope.row.create_time) }}
                    </template>
                </el-table-column>

                <!-- 操作 -->
                <el-table-column label="操作" width="200" fixed="right" align="center">
                    <template slot-scope="scope">
                        <el-button
                            size="small"
                            type="primary"
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

            <!-- 空状态 -->
            <div v-else class="empty-state">
                <i class="el-icon-document-copy"></i>
                <p>暂无动物数据</p>
            </div>

            <!-- 分页 -->
            <div class="pagination" v-if="animalList.length > 0">
                <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="pagination.page"
                    :page-sizes="[10, 20, 50, 100]"
                    :page-size="pagination.limit"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="pagination.total"
                ></el-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import { getPetList, deletePet, getPetCategories } from '@/utils/api'
import { formatDateTime } from '@/utils/dateFormat'

export default {
    name: 'AnimalsList',
    data() {
        return {
            loading: false,
            searchForm: {
                keyword: '',
                status: ''
            },
            pagination: {
                page: 1,
                limit: 10,
                total: 0
            },
            statistics: {
                total: 0,
                available: 0,
                adopted: 0,
                other: 0
            },
            animalList: [],
            categories: []
        }
    },
    methods: {
        async loadAnimalList() {
            this.loading = true
            try {
                const params = {
                    keyword: this.searchForm.keyword || '',
                    status: this.searchForm.status || '',
                    page: this.pagination.page,
                    size: this.pagination.limit
                }
                const response = await getPetList(params)
                this.animalList = response.data.data || []
                this.pagination.total = response.data.pagination?.total || 0
                this.calculateStatistics()
            } catch (error) {
                console.error('加载动物列表失败:', error)
                this.$message.error('加载动物列表失败')
            } finally {
                this.loading = false
            }
        },

        calculateStatistics() {
            this.statistics.total = this.pagination.total
            this.statistics.available = this.animalList.filter(item => item.status === 'available').length
            this.statistics.adopted = this.animalList.filter(item => item.status === 'adopted').length
            this.statistics.other = this.animalList.filter(item => ['reserved', 'unavailable'].includes(item.status)).length
        },

        handleSearch() {
            this.pagination.page = 1
            this.loadAnimalList()
        },

        handleReset() {
            this.searchForm = {
                keyword: '',
                status: ''
            }
            this.pagination.page = 1
            this.loadAnimalList()
        },

        handleSizeChange(size) {
            this.pagination.limit = size
            this.pagination.page = 1
            this.loadAnimalList()
        },

        handleCurrentChange(page) {
            this.pagination.page = page
            this.loadAnimalList()
        },

        handleEdit(row) {
            this.$router.push({
                name: 'animalsEdit',
                params: { id: row.id }
            })
        },

        handleDelete(row) {
            this.$confirm(
                `确定删除动物 "${row.pet_name}" 吗？此操作不可撤销。`,
                '删除确认',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            )
                .then(async () => {
                    try {
                        await deletePet(row.id)
                        this.$message.success('删除成功')
                        await this.loadAnimalList()
                    } catch (error) {
                        console.error('删除动物失败:', error)
                        this.$message.error(error?.data?.message || '删除失败')
                    }
                })
                .catch(() => {
                    this.$message.info('已取消删除')
                })
        },

        toAddAnimal() {
            this.$router.push({ name: 'animalsAdd' })
        },

        getCategoryLabel(categoryId) {
            const category = this.categories.find(c => c.id === categoryId)
            return category ? category.name : '未分类'
        },

        getGenderLabel(gender) {
            const genderMap = {
                male: '♂ 公',
                female: '♀ 母',
                unknown: '未知'
            }
            return genderMap[gender] || gender
        },

        getStatusLabel(status) {
            const statusMap = {
                available: '待领养',
                adopted: '已领养',
                reserved: '预留',
                unavailable: '不可领养'
            }
            return statusMap[status] || status
        },

        getStatusTagType(status) {
            const typeMap = {
                available: 'success',
                adopted: 'info',
                reserved: 'warning',
                unavailable: 'danger'
            }
            return typeMap[status] || 'info'
        },

        async loadCategories() {
            try {
                const response = await getPetCategories()
                this.categories = response.data.data || []
            } catch (error) {
                console.error('加载分类失败:', error)
            }
        },
        formatDate(date) {
            return formatDateTime(date, 'datetime')
        }
    },

    mounted() {
        this.loadCategories()
        this.loadAnimalList()
    }
}
</script>

<style lang="less" scoped>

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;

    .header-title {
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

    .header-actions {
        display: flex;
        gap: 12px;
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

        &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
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
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;

    ::v-deep .el-table {
        .animal-image {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 80px;

            img {
                width: 70px;
                height: 70px;
                border-radius: 4px;
                object-fit: cover;
            }

            .no-image {
                color: #bbb;
                font-size: 12px;
            }
        }

        td {
            padding: 16px 0;
        }

        .el-button {
            margin: 0 4px;
        }
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #909399;
        text-align: center;

        i {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }

        p {
            margin: 0;
            font-size: 14px;
        }
    }

    .pagination {
        display: flex;
        justify-content: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;
    }
}

@media (max-width: 768px) {
    .animals-page {
        padding: 20px;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        .header-actions {
            width: 100%;

            .el-button {
                width: 100%;
            }
        }
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
        padding: 16px;

        ::v-deep .el-table {
            font-size: 12px;
        }
    }
}
</style>

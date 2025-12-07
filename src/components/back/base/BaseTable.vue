<template>
    <div class="base-table-wrapper">
        <!-- 搜索和筛选栏 -->
        <div class="toolbar">
            <div class="toolbar-left">
                <!-- 搜索框 -->
                <el-input
                    v-model="searchQuery"
                    placeholder="输入关键字搜索"
                    prefix-icon="el-icon-search"
                    clearable
                    class="search-input"
                    @input="handleSearch"
                />
                
                <!-- 高级筛选 -->
                <el-dropdown 
                    v-if="hasFilter" 
                    trigger="click"
                    @command="applyFilter"
                    class="filter-dropdown"
                >
                    <el-button type="default" icon="el-icon-s-unfold">
                        筛选<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item
                            v-for="(filter, index) in filters"
                            :key="index"
                            :command="filter.value"
                        >
                            {{ filter.label }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>

            <div class="toolbar-right">
                <!-- 刷新按钮 -->
                <el-button 
                    type="text" 
                    icon="el-icon-refresh"
                    @click="refresh"
                    :loading="loading"
                >
                    刷新
                </el-button>

                <!-- 自定义列 -->
                <el-popover
                    placement="bottom"
                    width="200"
                    trigger="click"
                    v-if="allowColumnCustomize"
                >
                    <div class="column-selector">
                        <el-checkbox
                            v-for="col in columns"
                            :key="col.prop"
                            v-model="visibleColumns"
                            :label="col.prop"
                            :disabled="col.required"
                        >
                            {{ col.label }}
                        </el-checkbox>
                    </div>
                    <el-button 
                        slot="reference"
                        type="text"
                        icon="el-icon-s-unfold"
                    >
                        列设置
                    </el-button>
                </el-popover>

                <!-- 导出按钮 -->
                <el-button 
                    v-if="allowExport"
                    type="text"
                    icon="el-icon-download"
                    @click="handleExport"
                >
                    导出
                </el-button>
            </div>
        </div>

        <!-- 批量操作栏 -->
        <div v-if="selectedRows.length > 0" class="batch-actions">
            <span>已选择 <strong>{{ selectedRows.length }}</strong> 项</span>
            <el-button-group>
                <el-button 
                    type="danger" 
                    size="small"
                    @click="handleBatchDelete"
                    v-if="allowBatchDelete"
                >
                    批量删除
                </el-button>
                <slot name="batch-actions" :selectedRows="selectedRows"></slot>
            </el-button-group>
            <el-button 
                type="text" 
                @click="clearSelection"
            >
                清空选择
            </el-button>
        </div>

        <!-- 表格 -->
        <el-table
            ref="table"
            :data="tableData"
            :loading="loading"
            :stripe="true"
            :border="true"
            :highlight-current-row="true"
            :default-sort="defaultSort"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
            class="base-table"
            style="width: 100%"
        >
            <!-- 多选列 -->
            <el-table-column
                v-if="allowSelection"
                type="selection"
                width="50"
                align="center"
            />

            <!-- 序号列 -->
            <el-table-column
                v-if="showIndex"
                type="index"
                label="序号"
                width="60"
                align="center"
            />

            <!-- 数据列 -->
            <el-table-column
                v-for="col in displayColumns"
                :key="col.prop"
                :prop="col.prop"
                :label="col.label"
                :width="col.width"
                :min-width="col.minWidth || 150"
                :align="col.align || 'left'"
                :sortable="col.sortable ? 'custom' : false"
                show-overflow-tooltip
            >
                <template slot-scope="scope">
                    <!-- 自定义单元格渲染 -->
                    <slot 
                        :name="`column-${col.prop}`"
                        :row="scope.row"
                        :index="scope.$index"
                    >
                        {{ formatCellValue(scope.row[col.prop], col.type) }}
                    </slot>
                </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column
                v-if="operations.length > 0"
                label="操作"
                width="200"
                align="center"
                fixed="right"
            >
                <template slot-scope="scope">
                    <el-button-group>
                        <el-button
                            v-for="op in operations"
                            :key="op.key"
                            :type="op.type || 'text'"
                            :size="op.size || 'small'"
                            :icon="op.icon"
                            @click="handleOperation(op.key, scope.row)"
                            :loading="operationLoading === op.key"
                        >
                            {{ op.label }}
                        </el-button>
                    </el-button-group>
                    <slot 
                        name="row-operations"
                        :row="scope.row"
                        :index="scope.$index"
                    ></slot>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
            v-if="total > 0"
            :current-page.sync="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size.sync="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="pagination"
        />
    </div>
</template>

<script>
export default {
    name: 'BaseTable',
    props: {
        // 表格数据
        data: {
            type: Array,
            default: () => []
        },
        // 列配置
        columns: {
            type: Array,
            required: true
            // [{ prop: 'id', label: '编号', width: 80, type: 'text' }, ...]
        },
        // 总条数
        total: {
            type: Number,
            default: 0
        },
        // 加载状态
        loading: {
            type: Boolean,
            default: false
        },
        // 操作按钮配置
        operations: {
            type: Array,
            default: () => []
            // [{ key: 'edit', label: '编辑', type: 'primary', icon: 'el-icon-edit' }, ...]
        },
        // 默认排序
        defaultSort: {
            type: Object,
            default: () => ({ prop: 'id', order: 'descending' })
        },
        // 筛选选项
        filters: {
            type: Array,
            default: () => []
        },
        // 允许多选
        allowSelection: {
            type: Boolean,
            default: true
        },
        // 显示序号
        showIndex: {
            type: Boolean,
            default: true
        },
        // 允许导出
        allowExport: {
            type: Boolean,
            default: true
        },
        // 允许批量删除
        allowBatchDelete: {
            type: Boolean,
            default: true
        },
        // 允许自定义列
        allowColumnCustomize: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            searchQuery: '',
            currentPage: 1,
            pageSize: 20,
            selectedRows: [],
            visibleColumns: [],
            operationLoading: null,
            hasFilter: false,
            tableData: []
        }
    },
    computed: {
        displayColumns() {
            return this.columns.filter(col => 
                col.required || this.visibleColumns.includes(col.prop)
            );
        }
    },
    watch: {
        data: {
            handler(newVal) {
                this.tableData = newVal;
            },
            deep: true
        },
        columns: {
            handler() {
                this.initVisibleColumns();
            },
            immediate: true
        }
    },
    methods: {
        // 初始化可见列
        initVisibleColumns() {
            this.visibleColumns = this.columns
                .filter(col => col.visible !== false && !col.hidden)
                .map(col => col.prop);
        },

        // 搜索
        handleSearch() {
            this.$emit('search', this.searchQuery);
        },

        // 应用筛选
        applyFilter(filterValue) {
            this.$emit('filter', filterValue);
        },

        // 刷新
        refresh() {
            this.$emit('refresh');
        },

        // 导出
        handleExport() {
            this.$emit('export', this.tableData);
        },

        // 行操作
        handleOperation(operationKey, row) {
            this.$emit(`operation-${operationKey}`, row);
        },

        // 批量删除
        handleBatchDelete() {
            this.$confirm('确定要删除选中项吗？', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$emit('batch-delete', this.selectedRows);
            }).catch(() => {});
        },

        // 多选变化
        handleSelectionChange(val) {
            this.selectedRows = val;
        },

        // 排序变化
        handleSortChange({ prop, order }) {
            this.$emit('sort-change', { prop, order });
        },

        // 清空选择
        clearSelection() {
            this.$refs.table.clearSelection();
        },

        // 格式化单元格值
        formatCellValue(value, type) {
            if (!value) return '-';
            
            switch (type) {
                case 'date':
                    return new Date(value).toLocaleDateString('zh-CN');
                case 'datetime':
                    return new Date(value).toLocaleString('zh-CN');
                case 'boolean':
                    return value ? '是' : '否';
                case 'currency':
                    return `¥${value}`;
                case 'percent':
                    return `${value}%`;
                default:
                    return value;
            }
        },

        // 获取选中行数据
        getSelection() {
            return this.selectedRows;
        },

        // 清空表格
        clear() {
            this.tableData = [];
            this.selectedRows = [];
        }
    },
    mounted() {
        this.initVisibleColumns();
        this.hasFilter = this.filters.length > 0;
    }
}
</script>

<style lang="less" scoped>
.base-table-wrapper {
    .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        gap: 15px;

        .toolbar-left {
            display: flex;
            gap: 10px;
            flex: 1;

            .search-input {
                width: 250px;
            }

            .filter-dropdown {
                margin-left: 10px;
            }
        }

        .toolbar-right {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
    }

    .batch-actions {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px 15px;
        background: #f5f7fa;
        border-radius: 4px;
        margin-bottom: 15px;
        font-size: 14px;
        color: #333;

        strong {
            color: #d52b1e;
            font-size: 16px;
        }
    }

    .base-table {
        margin-bottom: 15px;
    }

    .pagination {
        text-align: right;
        padding: 15px 0;
    }

    .column-selector {
        .el-checkbox {
            display: block;
            margin-bottom: 10px;

            &:last-child {
                margin-bottom: 0;
            }
        }
    }
}

@media (max-width: 768px) {
    .base-table-wrapper {
        .toolbar {
            flex-direction: column;

            .toolbar-left,
            .toolbar-right {
                width: 100%;
            }

            .search-input {
                width: 100% !important;
            }
        }
    }
}
</style>

<template>
    <div class="products-page">
        <!-- 权限遮罩 -->
        <div v-if="!isAdmin" class="permission-overlay">
            <div class="permission-content">
                <i class="el-icon-lock"></i>
                <h2>无权限访问</h2>
                <p>抱歉，只有管理员才能访问商城管理功能</p>
                <el-button type="primary" @click="goBack">返回上一页</el-button>
            </div>
        </div>

        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-title">
                <h1>🛍️ 商品管理</h1>
                <p>管理宠物用品商城中的商品</p>
            </div>
            <div class="header-actions">
                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加商品</el-button>
            </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
            <div class="filter-row">
                <div class="filter-inputs">
                    <div class="input-wrapper">
                        <el-input
                            v-model="searchQuery"
                            placeholder="搜索商品名称..."
                            clearable
                            prefix-icon="el-icon-search"
                            @keyup.enter.native="handleSearch"
                            class="search-input"
                        ></el-input>
                    </div>
                    <div class="input-wrapper">
                        <el-select 
                            v-model="filterCategory" 
                            placeholder="筛选分类" 
                            clearable
                            @change="handleSearch"
                            class="status-select"
                        >
                            <el-option label="全部分类" value=""></el-option>
                            <el-option 
                                v-for="cat in categories" 
                                :key="cat.id" 
                                :label="cat.name" 
                                :value="cat.id"
                            ></el-option>
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
                    <div class="stat-label">总商品</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card success">
                    <div class="stat-number">¥{{ stats.totalSales }}</div>
                    <div class="stat-label">总销售额</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card info">
                    <div class="stat-number">{{ stats.totalSalesCount }}</div>
                    <div class="stat-label">总销售量</div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
                <div class="stat-card warning">
                    <div class="stat-number">{{ stats.avgRating }}</div>
                    <div class="stat-label">平均评分</div>
                </div>
            </el-col>
        </el-row>

        <!-- 商品表格 -->
        <div class="table-section">
            <el-table
                :data="products"
                stripe
                style="width: 100%"
                v-loading="loading"
                :default-sort="{ prop: 'id', order: 'descending' }"
            >
                <el-table-column prop="id" label="ID" width="60"></el-table-column>
                <el-table-column prop="name" label="商品名称" min-width="200">
                    <template slot-scope="scope">
                        <div class="product-info">
                            <img :src="getImageUrl(scope.row.image_url)" :alt="scope.row.name" class="product-thumb" />
                            <div>
                                <p class="product-name">{{ scope.row.name }}</p>
                                <p class="product-category">{{ scope.row.category_name || '未分类' }}</p>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="价格" width="120">
                    <template slot-scope="scope">
                        <span class="price">¥{{ scope.row.price }}</span>
                        <span v-if="scope.row.original_price" class="original-price">¥{{ scope.row.original_price }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="stock" label="库存" width="80"></el-table-column>
                <el-table-column prop="sales_count" label="销量" width="80"></el-table-column>
                <el-table-column prop="rating" label="评分" width="100">
                    <template slot-scope="scope">
                        <el-rate v-model="scope.row.rating" disabled show-score text-color="#ff9900" score-template="{value}"></el-rate>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                            {{ scope.row.status === 1 ? '上架' : '下架' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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

        <!-- 编辑对话框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false">
            <el-form :model="form" :rules="rules" ref="form" label-width="100px">
                <el-form-item label="商品名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入商品名称"></el-input>
                </el-form-item>
                <el-form-item label="分类" prop="category_id">
                    <el-select v-model="form.category_id" placeholder="请选择分类" style="width: 100%;">
                        <el-option 
                            v-for="cat in categories" 
                            :key="cat.id" 
                            :label="cat.name" 
                            :value="cat.id"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="价格" prop="price">
                            <el-input-number v-model="form.price" :precision="2" :min="0" :step="0.01" style="width: 100%;"></el-input-number>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="原价">
                            <el-input-number v-model="form.original_price" :precision="2" :min="0" :step="0.01" style="width: 100%;"></el-input-number>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="库存" prop="stock">
                            <el-input-number v-model="form.stock" :min="0" style="width: 100%;"></el-input-number>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="状态">
                            <el-select v-model="form.status" style="width: 100%;">
                                <el-option label="上架" :value="1"></el-option>
                                <el-option label="下架" :value="0"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="商品图片">
                    <div class="image-upload-area">
                        <el-upload
                            class="cover-uploader"
                            action="#"
                            :show-file-list="false"
                            :http-request="handleImageUpload"
                            :before-upload="beforeImageUpload"
                            accept="image/*"
                        >
                            <div v-if="form.image_url" class="cover-preview">
                                <img :src="getImageUrl(form.image_url)" class="cover-image" />
                                <div class="cover-actions">
                                    <i class="el-icon-edit"></i>
                                    <span>更换图片</span>
                                </div>
                            </div>
                            <div v-else class="upload-placeholder" v-loading="uploadLoading">
                                <i class="el-icon-plus"></i>
                                <span>上传图片</span>
                            </div>
                        </el-upload>
                        <el-button 
                            v-if="form.image_url" 
                            type="danger" 
                            size="mini" 
                            @click="handleRemoveImage"
                            style="margin-left: 10px;"
                        >
                            移除图片
                        </el-button>
                    </div>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入商品描述"></el-input>
                </el-form-item>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="热门商品">
                            <el-switch v-model="form.is_hot" :active-value="1" :inactive-value="0"></el-switch>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="新品">
                            <el-switch v-model="form.is_new" :active-value="1" :inactive-value="0"></el-switch>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSave" :loading="submitLoading">保存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { 
    getProductList, 
    getProductDetail, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getProductStats,
    getProductCategories,
    uploadImage,
    API_BASE_URL
} from '@/utils/api'

export default {
    name: 'MallProducts',
    data() {
        return {
            searchQuery: '',
            filterCategory: '',
            currentPage: 1,
            pageSize: 10,
            total: 0,
            loading: false,
            dialogVisible: false,
            editingId: null,
            submitLoading: false,
            uploadLoading: false,
            categories: [],
            products: [],
            stats: {
                total: 0,
                totalSales: 0,
                totalSalesCount: 0,
                avgRating: '5.0'
            },
            form: {
                name: '',
                category_id: '',
                price: 0,
                original_price: 0,
                stock: 0,
                image_url: '',
                description: '',
                status: 1,
                is_hot: 0,
                is_new: 0
            },
            rules: {
                name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
                category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
                price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
                stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
                description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
            }
        }
    },
    computed: {
        dialogTitle() {
            return this.editingId ? '编辑商品' : '添加商品';
        },
        // 获取图片完整URL
        getImageUrl() {
            return (url) => {
                if (!url) return 'https://via.placeholder.com/300x300?text=暂无图片'
                if (url.startsWith('http')) return url
                return `${API_BASE_URL.replace('/api', '')}${url}`
            }
        },
        // 检查是否是管理员
        isAdmin() {
            const userStr = localStorage.getItem('user')
            if (!userStr) return false
            try {
                const user = JSON.parse(userStr)
                return user.role === 'admin'
            } catch (e) {
                return false
            }
        }
    },
    methods: {
        // 返回上一页
        goBack() {
            this.$router.go(-1)
        },
        // 加载商品列表
        async loadProducts() {
            this.loading = true
            try {
                const params = {
                    page: this.currentPage,
                    size: this.pageSize
                }
                
                if (this.searchQuery) {
                    params.keyword = this.searchQuery
                }
                
                if (this.filterCategory) {
                    params.category_id = this.filterCategory
                }
                
                const res = await getProductList(params)
                if (res.data.code === 200) {
                    this.products = res.data.data.map(item => ({
                        ...item,
                        rating: parseFloat(item.rating) || 5
                    }))
                    this.total = res.data.pagination.total
                }
            } catch (error) {
                console.error('加载商品列表失败:', error)
                this.$message.error('加载商品列表失败')
            } finally {
                this.loading = false
            }
        },
        
        // 加载统计数据
        async loadStats() {
            try {
                const res = await getProductStats()
                if (res.data.code === 200) {
                    this.stats = {
                        total: res.data.data.total || 0,
                        totalSales: parseFloat(res.data.data.totalSales || 0).toFixed(2),
                        totalSalesCount: res.data.data.totalSalesCount || 0,
                        avgRating: res.data.data.avgRating || '5.0'
                    }
                }
            } catch (error) {
                console.error('加载统计数据失败:', error)
            }
        },
        
        // 加载分类列表
        async loadCategories() {
            try {
                const res = await getProductCategories()
                if (res.data.code === 200) {
                    this.categories = res.data.data
                }
            } catch (error) {
                console.error('加载分类列表失败:', error)
            }
        },
        
        // 搜索
        handleSearch() {
            this.currentPage = 1
            this.loadProducts()
        },
        
        // 重置搜索
        handleReset() {
            this.searchQuery = ''
            this.filterCategory = ''
            this.currentPage = 1
            this.loadProducts()
        },
        
        // 添加商品
        handleAdd() {
            this.editingId = null;
            this.form = {
                name: '',
                category_id: '',
                price: 0,
                original_price: 0,
                stock: 0,
                image_url: '',
                description: '',
                status: 1,
                is_hot: 0,
                is_new: 0
            };
            this.dialogVisible = true;
        },
        
        // 编辑商品
        async handleEdit(row) {
            try {
                const res = await getProductDetail(row.id)
                if (res.data.code === 200) {
                    const product = res.data.data
                    this.editingId = product.id
                    this.form = {
                        name: product.name,
                        category_id: product.category_id,
                        price: parseFloat(product.price) || 0,
                        original_price: parseFloat(product.original_price) || 0,
                        stock: product.stock || 0,
                        image_url: product.image_url || '',
                        description: product.description || '',
                        status: product.status,
                        is_hot: product.is_hot || 0,
                        is_new: product.is_new || 0
                    }
                    this.dialogVisible = true
                }
            } catch (error) {
                console.error('获取商品详情失败:', error)
                this.$message.error('获取商品详情失败')
            }
        },
        
        // 图片上传前校验
        beforeImageUpload(file) {
            const isImage = file.type.startsWith('image/')
            const isLt5M = file.size / 1024 / 1024 < 5
            
            if (!isImage) {
                this.$message.error('只能上传图片文件!')
                return false
            }
            if (!isLt5M) {
                this.$message.error('图片大小不能超过 5MB!')
                return false
            }
            return true
        },
        
        // 自定义图片上传
        async handleImageUpload(options) {
            this.uploadLoading = true
            try {
                const res = await uploadImage(options.file)
                if (res.data.code === 200) {
                    this.form.image_url = res.data.data.url
                    this.$message.success('图片上传成功')
                } else {
                    this.$message.error(res.data.message || '图片上传失败')
                }
            } catch (error) {
                console.error('图片上传失败:', error)
                this.$message.error('图片上传失败')
            } finally {
                this.uploadLoading = false
            }
        },
        
        // 移除图片
        handleRemoveImage() {
            this.form.image_url = ''
        },
        
        // 保存商品
        async handleSave() {
            try {
                await this.$refs.form.validate()
            } catch {
                return
            }
            
            this.submitLoading = true
            try {
                const data = {
                    name: this.form.name,
                    category_id: this.form.category_id,
                    price: this.form.price,
                    original_price: this.form.original_price,
                    stock: this.form.stock,
                    image_url: this.form.image_url,
                    description: this.form.description,
                    status: this.form.status,
                    is_hot: this.form.is_hot,
                    is_new: this.form.is_new
                }
                
                let res
                if (this.editingId) {
                    res = await updateProduct(this.editingId, data)
                } else {
                    res = await createProduct(data)
                }
                
                if (res.data.code === 200 || res.data.code === 201) {
                    this.$message.success(this.editingId ? '商品更新成功' : '商品添加成功')
                    this.dialogVisible = false
                    this.loadProducts()
                    this.loadStats()
                } else {
                    this.$message.error(res.data.message || '操作失败')
                }
            } catch (error) {
                console.error('保存商品失败:', error)
                this.$message.error('保存商品失败')
            } finally {
                this.submitLoading = false
            }
        },
        
        // 删除商品
        async handleDelete(row) {
            try {
                await this.$confirm(`确定要删除商品 "${row.name}" 吗?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                
                const res = await deleteProduct(row.id)
                if (res.data.code === 200) {
                    this.$message.success('商品已删除')
                    this.loadProducts()
                    this.loadStats()
                } else {
                    this.$message.error(res.data.message || '删除失败')
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('删除商品失败:', error)
                    this.$message.error('删除商品失败')
                }
            }
        },
        
        // 分页变化
        handlePageChange(page) {
            this.currentPage = page
            this.loadProducts()
        },
        
        // 每页数量变化
        handlePageSizeChange(size) {
            this.pageSize = size
            this.currentPage = 1
            this.loadProducts()
        }
    },
    mounted() {
        this.loadProducts()
        this.loadStats()
        this.loadCategories()
    }
}
</script>

<style scoped lang="less">
.permission-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;

    .permission-content {
        background: white;
        padding: 60px 80px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

        i {
            font-size: 80px;
            color: #f56c6c;
            margin-bottom: 20px;
        }

        h2 {
            font-size: 28px;
            color: #333;
            margin: 0 0 15px 0;
        }

        p {
            font-size: 16px;
            color: #666;
            margin: 0 0 30px 0;
        }
    }
}

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

    .product-info {
        display: flex;
        gap: 10px;
        align-items: center;

        .product-thumb {
            width: 50px;
            height: 50px;
            border-radius: 4px;
            object-fit: cover;
        }

        .product-name {
            margin: 0;
            font-weight: bold;
            color: #333;
        }

        .product-category {
            margin: 5px 0 0 0;
            font-size: 12px;
            color: #999;
        }
    }

    .price {
        color: #d52b1e;
        font-weight: bold;
    }
    
    .original-price {
        color: #999;
        text-decoration: line-through;
        font-size: 12px;
        margin-left: 5px;
    }
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.image-upload-area {
    display: flex;
    align-items: flex-start;
}

.cover-uploader {
    .cover-preview {
        position: relative;
        width: 150px;
        height: 150px;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        
        .cover-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .cover-actions {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
            color: #fff;
            
            i {
                font-size: 24px;
                margin-bottom: 8px;
            }
        }
        
        &:hover .cover-actions {
            opacity: 1;
        }
    }
    
    .upload-placeholder {
        width: 150px;
        height: 150px;
        border: 2px dashed #d9d9d9;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        background: #fafafa;
        
        &:hover {
            border-color: #409eff;
            background: #ecf5ff;
        }
        
        i {
            font-size: 32px;
            color: #8c939d;
            margin-bottom: 8px;
        }
        
        span {
            color: #8c939d;
            font-size: 14px;
        }
    }
}

/deep/ .el-dialog {
    .el-form-item {
        margin-bottom: 20px;
    }
}
</style>

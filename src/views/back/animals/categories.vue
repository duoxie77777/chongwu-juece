<template>
  <div class="categories-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-title">
        <h1>🏷️ 宠物分类管理</h1>
        <p>管理平台中的所有宠物分类</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showAddForm = true">新增分类</el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-inputs">
          <div class="input-wrapper">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索分类名称..."
              clearable
              prefix-icon="el-icon-search"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
              class="search-input"
            ></el-input>
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

    <!-- 分类表格 -->
    <div class="table-section">
      <el-table
        :data="filteredCategories"
        style="width: 100%"
        stripe
        :loading="loading"
        v-if="filteredCategories.length > 0"
      >
        <!-- 图标 -->
        <el-table-column label="图标" width="100" align="center">
          <template slot-scope="scope">
            <span class="icon-display">{{ getIcon(scope.row.icon) }}</span>
          </template>
        </el-table-column>

        <!-- 名称 -->
        <el-table-column prop="name" label="分类名称" min-width="150"></el-table-column>

        <!-- 描述 -->
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip></el-table-column>

        <!-- 排序 -->
        <el-table-column prop="sort_order" label="排序" width="100" align="center"></el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '活跃' : '禁用' }}
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
              @click="editCategory(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              plain
              icon="el-icon-delete"
              @click="deleteCategory(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <i class="el-icon-document-copy"></i>
        <p>{{ searchKeyword ? '未找到匹配的分类' : '暂无分类数据' }}</p>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="editingId ? '编辑分类' : '新增分类'"
      :visible.sync="showAddForm"
      width="600px"
      @close="closeForm"
    >
      <el-form
        :model="form"
        :rules="formRules"
        ref="categoryForm"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入分类名称"
            clearable
          ></el-input>
        </el-form-item>

        <el-form-item label="分类描述">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入分类描述"
            rows="3"
            clearable
          ></el-input>
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <div class="icon-selector">
            <div
              v-for="icon in availableIcons"
              :key="icon.id"
              :class="['icon-option', { selected: form.icon === icon.id }]"
              @click="form.icon = icon.id"
            >
              <span class="emoji">{{ icon.icon }}</span>
              <span class="id">ID: {{ icon.id }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="排序" prop="sort_order">
          <el-input-number
            v-model="form.sort_order"
            :min="0"
            :step="1"
          ></el-input-number>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="活跃" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="closeForm">取 消</el-button>
        <el-button type="primary" @click="saveCategory" :loading="isSaving">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { formatDateTime } from '@/utils/dateFormat'
import {
  getPetCategories,
  createPetCategory,
  updatePetCategory,
  deletePetCategory
} from '@/utils/api'
import { getAllIcons, getIconById } from '@/utils/iconMapper'

export default {
  name: 'AnimalCategories',
  data() {
    return {
      categories: [],
      searchKeyword: '',
      showAddForm: false,
      editingId: null,
      loading: false,
      isSaving: false,
      availableIcons: [],
      form: {
        name: '',
        description: '',
        icon: 1,
        sort_order: 0,
        status: 1
      },
      formRules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        icon: [
          { required: true, message: '请选择图标', trigger: 'change' }
        ],
        sort_order: [
          { required: true, message: '请输入排序号', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    filteredCategories() {
      if (!this.searchKeyword.trim()) {
        return this.categories
      }
      const keyword = this.searchKeyword.toLowerCase().trim()
      return this.categories.filter(category => 
        category.name.toLowerCase().includes(keyword)
      )
    }
  },
  methods: {
    formatDate(date) {
      return formatDateTime(date, 'datetime')
    },
    async loadCategories() {
      this.loading = true
      try {
        const response = await getPetCategories()
        this.categories = response.data.data || []
      } catch (error) {
        console.error('加载分类失败:', error)
        this.$message.error('加载分类失败')
      } finally {
        this.loading = false
      }
    },

    getIcon(iconId) {
      return getIconById(iconId, 'pet')
    },

    handleSearch() {
      // 搜索由 computed 属性自动处理
    },

    handleReset() {
      this.searchKeyword = ''
    },

    editCategory(category) {
      this.editingId = category.id
      this.form = {
        name: category.name,
        description: category.description,
        icon: category.icon,
        sort_order: category.sort_order,
        status: category.status
      }
      this.showAddForm = true
    },

    async saveCategory() {
      try {
        await this.$refs.categoryForm.validate()
      } catch (error) {
        return
      }

      if (!this.form.name.trim()) {
        this.$message.error('请输入分类名称')
        return
      }

      this.isSaving = true
      try {
        if (this.editingId) {
          await updatePetCategory(this.editingId, this.form)
          this.$message.success('分类更新成功')
        } else {
          await createPetCategory(this.form)
          this.$message.success('分类创建成功')
        }
        this.closeForm()
        await this.loadCategories()
      } catch (error) {
        console.error('保存分类失败:', error)
        this.$message.error(error?.data?.message || '保存失败')
      } finally {
        this.isSaving = false
      }
    },

    deleteCategory(category) {
      this.$confirm(
        `确定要删除分类 "${category.name}" 吗？此操作不可撤销。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(async () => {
          try {
            await deletePetCategory(category.id)
            this.$message.success('分类已删除')
            await this.loadCategories()
          } catch (error) {
            console.error('删除分类失败:', error)
            const errorMsg = error?.data?.message || error?.message || '删除失败'
            this.$message.error(errorMsg)
          }
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },

    closeForm() {
      this.showAddForm = false
      this.editingId = null
      this.$refs.categoryForm?.clearValidate()
      this.form = {
        name: '',
        description: '',
        icon: 1,
        sort_order: 0,
        status: 1
      }
    }
  },
  async mounted() {
    this.availableIcons = getAllIcons('pet')
    await this.loadCategories()
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
    max-width: 320px;
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

.table-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;

  ::v-deep .el-table {
    .icon-display {
      font-size: 32px;
      display: inline-block;
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
}

// 图标选择器
.icon-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 12px;
}

.icon-option {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    background-color: #f0f9ff;
  }

  &.selected {
    border-color: #409eff;
    background-color: #e6f7ff;
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
  }

  .emoji {
    display: block;
    font-size: 32px;
    margin-bottom: 8px;
  }

  .id {
    display: block;
    font-size: 12px;
    color: #666;
  }
}

// 对话框样式
::v-deep .el-dialog {
  .el-form-item {
    margin-bottom: 24px;
  }

  .el-input,
  .el-select,
  .el-input-number {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .categories-page {
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

  .icon-selector {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  }
}
</style>

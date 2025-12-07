<template>
  <div class="category-demo">
    <h2>分类API测试</h2>
    
    <div class="demo-section">
      <h3>宠物分类</h3>
      
      <div class="button-group">
        <button @click="testGetPetCategories">获取宠物分类</button>
        <button @click="testCreatePetCategory">创建宠物分类</button>
      </div>

      <div class="result">
        <h4>结果:</h4>
        <pre>{{ petCategoriesResult }}</pre>
      </div>
    </div>

    <div class="demo-section">
      <h3>商品分类</h3>
      
      <div class="button-group">
        <button @click="testGetProductCategories">获取商品分类</button>
        <button @click="testCreateProductCategory">创建商品分类</button>
      </div>

      <div class="result">
        <h4>结果:</h4>
        <pre>{{ productCategoriesResult }}</pre>
      </div>
    </div>

    <div class="demo-section">
      <h3>图标映射测试</h3>
      
      <div class="icons-display">
        <div v-for="icon in petIcons" :key="icon.id" class="icon-item">
          <span class="emoji">{{ icon.icon }}</span>
          <span class="label">{{ icon.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getPetCategories,
  getProductCategories,
  createPetCategory,
  createProductCategory
} from '@/utils/api'
import { getAllIcons } from '@/utils/iconMapper'

export default {
  name: 'CategoryDemo',
  data() {
    return {
      petCategoriesResult: '',
      productCategoriesResult: '',
      petIcons: []
    }
  },
  mounted() {
    this.petIcons = getAllIcons('pet')
  },
  methods: {
    async testGetPetCategories() {
      try {
        const response = await getPetCategories()
        this.petCategoriesResult = JSON.stringify(response.data, null, 2)
      } catch (error) {
        this.petCategoriesResult = `错误: ${error.message}`
      }
    },

    async testCreatePetCategory() {
      try {
        const response = await createPetCategory({
          name: '测试分类' + Date.now(),
          description: '这是一个测试分类',
          icon: Math.ceil(Math.random() * 10),
          sort_order: 10
        })
        this.petCategoriesResult = JSON.stringify(response.data, null, 2)
      } catch (error) {
        this.petCategoriesResult = `错误: ${error.message}`
      }
    },

    async testGetProductCategories() {
      try {
        const response = await getProductCategories()
        this.productCategoriesResult = JSON.stringify(response.data, null, 2)
      } catch (error) {
        this.productCategoriesResult = `错误: ${error.message}`
      }
    },

    async testCreateProductCategory() {
      try {
        const response = await createProductCategory({
          name: '测试商品分类' + Date.now(),
          description: '这是一个测试商品分类',
          icon: Math.ceil(Math.random() * 8),
          sort_order: 10
        })
        this.productCategoriesResult = JSON.stringify(response.data, null, 2)
      } catch (error) {
        this.productCategoriesResult = `错误: ${error.message}`
      }
    }
  }
}
</script>

<style scoped>
.category-demo {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

h3 {
  color: #007bff;
  margin-bottom: 15px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.demo-section {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}

.result {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 15px;
}

h4 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

pre {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.icons-display {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  background: white;
  padding: 15px;
  border-radius: 4px;
}

.icon-item {
  text-align: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.emoji {
  display: block;
  font-size: 32px;
  margin-bottom: 10px;
}

.label {
  display: block;
  font-size: 12px;
  color: #666;
}
</style>

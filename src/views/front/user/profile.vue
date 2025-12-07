<template>
  <div class="user-profile">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
      <p class="page-subtitle">管理您的个人信息和账户设置</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="profile-content">
      <div class="profile-sidebar">
        <!-- 用户信息卡片 -->
        <div class="user-card">
          <div class="avatar-section">
            <el-avatar :size="80" :src="userInfo.avatar" class="user-avatar">
              {{ userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U' }}
            </el-avatar>
            <div class="user-basic-info">
              <h3 class="username">{{ userInfo.username || '未设置昵称' }}</h3>
              <p class="user-email">{{ userInfo.email || '未设置邮箱' }}</p>
              <p class="member-level">普通会员</p>
            </div>
          </div>
        </div>

        <!-- 导航菜单 -->
        <div class="profile-nav">
          <el-menu :default-active="activeNav" class="profile-menu" @select="handleNavSelect">
            <el-menu-item index="basic">
              <i class="el-icon-user"></i>
              <span slot="title">基本信息</span>
            </el-menu-item>
            <el-menu-item index="security">
              <i class="el-icon-lock"></i>
              <span slot="title">账户安全</span>
            </el-menu-item>
            <el-menu-item index="adoptions">
              <i class="el-icon-star-on"></i>
              <span slot="title">收养记录</span>
            </el-menu-item>
            <el-menu-item index="orders">
              <i class="el-icon-shopping-bag-1"></i>
              <span slot="title">我的订单</span>
            </el-menu-item>
          </el-menu>
        </div>
      </div>

      <div class="profile-main">
        <!-- 基本信息编辑 -->
        <div v-if="activeNav === 'basic'" class="profile-section">
          <h2 class="section-title">基本信息</h2>
          <el-form ref="basicForm" :model="userInfo" :rules="basicRules" label-width="100px" class="profile-form">
            <el-form-item label="头像" class="avatar-form-item">
              <div class="avatar-upload">
                <el-upload
                  class="avatar-uploader"
                  action="http://localhost:8889/api/upload/single"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload">
                  <img v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar">
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
                <p class="avatar-tip">支持 JPG、PNG 格式，大小不超过 2MB</p>
              </div>
            </el-form-item>
            
            <el-form-item label="用户名">
              <el-input v-model="userInfo.username" placeholder="用户名" disabled></el-input>
              <p class="field-tip">用户名不可修改</p>
            </el-form-item>
            
            <el-form-item label="真实姓名">
              <el-input v-model="userInfo.real_name" placeholder="请输入真实姓名"></el-input>
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userInfo.email" placeholder="请输入邮箱地址"></el-input>
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userInfo.phone" placeholder="请输入手机号码"></el-input>
            </el-form-item>
            
            <el-form-item label="性别">
              <el-radio-group v-model="userInfo.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
                <el-radio label="other">其他</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="省份">
              <el-input v-model="userInfo.addressObj.province" placeholder="请输入省份"></el-input>
            </el-form-item>
            
            <el-form-item label="城市">
              <el-input v-model="userInfo.addressObj.city" placeholder="请输入城市"></el-input>
            </el-form-item>
            
            <el-form-item label="区县">
              <el-input v-model="userInfo.addressObj.district" placeholder="请输入区县"></el-input>
            </el-form-item>
            
            <el-form-item label="详细地址">
              <el-input
                type="textarea"
                :rows="2"
                v-model="userInfo.addressObj.address"
                placeholder="请输入详细地址">
              </el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveBasicInfo" :loading="saving">保存修改</el-button>
              <el-button @click="resetBasicInfo">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 账户安全 -->
        <div v-if="activeNav === 'security'" class="profile-section">
          <h2 class="section-title">账户安全</h2>
          <div class="security-list">
            <div class="security-item">
              <div class="security-info">
                <h4>登录密码</h4>
                <p>定期更改密码可以让账户更安全</p>
              </div>
              <el-button type="text" @click="showChangePasswordDialog">修改</el-button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h4>绑定手机</h4>
                <p>{{ userInfo.phone || '未绑定手机' }}</p>
              </div>
              <el-button type="text" @click="showBindPhoneDialog">
                {{ userInfo.phone ? '修改' : '绑定' }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 收养记录 -->
        <div v-if="activeNav === 'adoptions'" class="profile-section">
          <h2 class="section-title">收养记录</h2>
          <div v-if="adoptions.length === 0" class="empty-state">
            <i class="el-icon-star-on empty-icon"></i>
            <p>暂无收养记录</p>
            <el-button type="primary" @click="goToAdoptionList">去收养动物</el-button>
          </div>
          <div v-else class="adoptions-list">
            <div v-for="adoption in adoptions" :key="adoption.id" class="adoption-item">
              <el-card shadow="hover" class="adoption-card">
                <div class="adoption-content">
                  <div class="pet-image-section">
                    <img :src="getPetImage(adoption.image_url)" :alt="adoption.pet_name" class="animal-image">
                    <el-tag :type="getStatusTagType(adoption.status)" class="status-tag">
                      {{ getStatusText(adoption.status) }}
                    </el-tag>
                  </div>
                  <div class="adoption-info">
                    <div class="info-header">
                      <h4 class="pet-name">{{ adoption.pet_name || '未知' }}</h4>
                      <el-button type="text" size="small" @click="showAdoptionDetail(adoption)" class="detail-btn">
                        查看详情 <i class="el-icon-arrow-right"></i>
                      </el-button>
                    </div>
                    <div class="info-grid">
                      <div class="info-item">
                        <i class="el-icon-star-on"></i>
                        <span class="label">类型：</span>
                        <span class="value">{{ getTypeName(adoption.pet_type) }}</span>
                      </div>
                      <div class="info-item" v-if="adoption.pet_breed">
                        <i class="el-icon-trophy"></i>
                        <span class="label">品种：</span>
                        <span class="value">{{ adoption.pet_breed }}</span>
                      </div>
                      <div class="info-item" v-if="adoption.pet_age">
                        <i class="el-icon-time"></i>
                        <span class="label">年龄：</span>
                        <span class="value">{{ adoption.pet_age }}岁</span>
                      </div>
                      <div class="info-item" v-if="adoption.pet_gender">
                        <i class="el-icon-user"></i>
                        <span class="label">性别：</span>
                        <span class="value">{{ getGenderName(adoption.pet_gender) }}</span>
                      </div>
                      <div class="info-item" v-if="adoption.pet_size">
                        <i class="el-icon-rank"></i>
                        <span class="label">体型：</span>
                        <span class="value">{{ getSizeName(adoption.pet_size) }}</span>
                      </div>
                      <div class="info-item" v-if="adoption.pet_color">
                        <i class="el-icon-view"></i>
                        <span class="label">颜色：</span>
                        <span class="value">{{ adoption.pet_color }}</span>
                      </div>
                    </div>
                    <div class="timeline-info">
                      <div class="timeline-item">
                        <i class="el-icon-calendar"></i>
                        <span>申请时间：{{ formatDateTime(adoption.create_time) }}</span>
                      </div>
                      <div class="timeline-item" v-if="adoption.review_time">
                        <i class="el-icon-check"></i>
                        <span>审核时间：{{ formatDateTime(adoption.review_time) }}</span>
                      </div>
                      <div class="timeline-item" v-if="adoption.reviewer_name">
                        <i class="el-icon-user-solid"></i>
                        <span>审核人：{{ adoption.reviewer_name }}</span>
                      </div>
                    </div>
                    <div class="review-comment" v-if="adoption.review_comment">
                      <i class="el-icon-chat-line-square"></i>
                      <span class="comment-label">审核意见：</span>
                      <span class="comment-text">{{ adoption.review_comment }}</span>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          <!-- 分页 -->
          <div class="pagination-wrapper" v-if="adoptionPagination.total > adoptionPagination.pageSize">
            <el-pagination
              @current-change="handleAdoptionPageChange"
              :current-page="adoptionPagination.currentPage"
              :page-size="adoptionPagination.pageSize"
              :total="adoptionPagination.total"
              layout="prev, pager, next">
            </el-pagination>
          </div>
        </div>

        <!-- 我的订单（直接跳转） -->
        <div v-if="activeNav === 'orders'" class="profile-section">
          <h2 class="section-title">我的订单</h2>
          <div class="redirect-info">
            <i class="el-icon-shopping-bag-1 redirect-icon"></i>
            <p>即将跳转到订单管理页面</p>
            <el-button type="primary" @click="goToOrders">查看我的订单</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog title="修改密码" :visible.sync="changePasswordDialogVisible" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="changePasswordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认修改</el-button>
      </div>
    </el-dialog>

    <!-- 收养记录详情对话框 -->
    <el-dialog title="收养申请详情" :visible.sync="adoptionDetailDialogVisible" width="800px" class="adoption-detail-dialog">
      <div v-if="currentAdoptionDetail" class="detail-content">
        <div class="detail-section">
          <h3 class="detail-section-title">
            <i class="el-icon-star-on"></i> 宠物信息
          </h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">宠物名称：</span>
              <span class="detail-value">{{ currentAdoptionDetail.pet_name || '未知' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">类型：</span>
              <span class="detail-value">{{ getTypeName(currentAdoptionDetail.pet_type) }}</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.pet_breed">
              <span class="detail-label">品种：</span>
              <span class="detail-value">{{ currentAdoptionDetail.pet_breed }}</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.pet_age">
              <span class="detail-label">年龄：</span>
              <span class="detail-value">{{ currentAdoptionDetail.pet_age }}岁</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.pet_gender">
              <span class="detail-label">性别：</span>
              <span class="detail-value">{{ getGenderName(currentAdoptionDetail.pet_gender) }}</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.pet_size">
              <span class="detail-label">体型：</span>
              <span class="detail-value">{{ getSizeName(currentAdoptionDetail.pet_size) }}</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.pet_color">
              <span class="detail-label">颜色：</span>
              <span class="detail-value">{{ currentAdoptionDetail.pet_color }}</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.pet_health_status">
              <span class="detail-label">健康状况：</span>
              <span class="detail-value">{{ currentAdoptionDetail.pet_health_status }}</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.pet_vaccination">
              <span class="detail-label">疫苗接种：</span>
              <span class="detail-value">{{ currentAdoptionDetail.pet_vaccination === 'yes' ? '已接种' : '未接种' }}</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.pet_sterilization">
              <span class="detail-label">绝育状态：</span>
              <span class="detail-value">{{ currentAdoptionDetail.pet_sterilization === 'yes' ? '已绝育' : '未绝育' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="detail-section-title">
            <i class="el-icon-user"></i> 申请人信息
          </h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">姓名：</span>
              <span class="detail-value">{{ currentAdoptionDetail.applicant_name || '未知' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">联系电话：</span>
              <span class="detail-value">{{ currentAdoptionDetail.applicant_phone || '未知' }}</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.applicant_email">
              <span class="detail-label">邮箱：</span>
              <span class="detail-value">{{ currentAdoptionDetail.applicant_email }}</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.applicant_address">
              <span class="detail-label">地址：</span>
              <span class="detail-value">{{ currentAdoptionDetail.applicant_address }}</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.occupation">
              <span class="detail-label">职业：</span>
              <span class="detail-value">{{ currentAdoptionDetail.occupation }}</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.housing_type">
              <span class="detail-label">居住环境：</span>
              <span class="detail-value">{{ currentAdoptionDetail.housing_type }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="detail-section-title">
            <i class="el-icon-document"></i> 申请详情
          </h3>
          <div class="detail-info-list">
            <div class="info-row">
              <span class="info-label">养宠经验：</span>
              <span class="info-value">{{ currentAdoptionDetail.has_experience ? '有经验' : '无经验' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">是否已有其他宠物：</span>
              <span class="info-value">{{ currentAdoptionDetail.has_other_pets ? '是' : '否' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">家人是否同意：</span>
              <span class="info-value">{{ currentAdoptionDetail.family_agree ? '同意' : '不同意' }}</span>
            </div>
            <div class="info-row" v-if="currentAdoptionDetail.reason">
              <span class="info-label">领养原因：</span>
              <span class="info-value">{{ currentAdoptionDetail.reason }}</span>
            </div>
            <div class="info-row" v-if="currentAdoptionDetail.commitment">
              <span class="info-label">承诺：</span>
              <span class="info-value">{{ currentAdoptionDetail.commitment }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="detail-section-title">
            <i class="el-icon-time"></i> 审核信息
          </h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">申请时间：</span>
              <span class="detail-value">{{ formatDateTime(currentAdoptionDetail.create_time) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">申请状态：</span>
              <el-tag :type="getStatusTagType(currentAdoptionDetail.status)">
                {{ getStatusText(currentAdoptionDetail.status) }}
              </el-tag>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.review_time">
              <span class="detail-label">审核时间：</span>
              <span class="detail-value">{{ formatDateTime(currentAdoptionDetail.review_time) }}</span>
            </div>
            <div class="detail-item" v-if="currentAdoptionDetail.reviewer_name">
              <span class="detail-label">审核人：</span>
              <span class="detail-value">{{ currentAdoptionDetail.reviewer_name }}</span>
            </div>
            <div class="detail-item full-width" v-if="currentAdoptionDetail.review_comment">
              <span class="detail-label">审核意见：</span>
              <span class="detail-value">{{ currentAdoptionDetail.review_comment }}</span>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="adoptionDetailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getCurrentUser, updateUserProfile, changePassword, getUserAdoptions } from '@/utils/api'
import { formatDateTime as formatDateTimeUtil } from '@/utils/dateFormat'

export default {
  name: 'UserProfile',
  data() {
    return {
      activeNav: 'basic',
      userInfo: {
        username: '',
        real_name: '',
        email: '',
        phone: '',
        gender: '',
        avatar: '',
        address: '',
        addressObj: {
          province: '',
          city: '',
          district: '',
          address: ''
        }
      },
      originalUserInfo: {}, // 保存原始数据用于重置
      adoptions: [],
      adoptionPagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      adoptionDetailDialogVisible: false,
      currentAdoptionDetail: null,
      API_BASE_URL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8889',
      saving: false,
      changePasswordDialogVisible: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      },
      basicRules: {
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: ['blur', 'change'] }
        ]
      },
    }
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters['user/isAuthenticated']
    },
    vuexUserInfo() {
      return this.$store.getters['user/userInfo']
    },
    uploadHeaders() {
      const token = localStorage.getItem('token')
      return {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    }
  },
  mounted() {
    this.loadUserData()
  },
  methods: {
    async loadUserData() {
      if (!this.isAuthenticated) {
        this.$message.warning('请先登录')
        this.$router.push('/')
        return
      }

      try {
        // 优先从Vuex获取用户信息
        if (this.vuexUserInfo) {
          this.userInfo = { ...this.userInfo, ...this.vuexUserInfo }
          this.originalUserInfo = { ...this.vuexUserInfo }
        }
        
        // 如果Vuex中没有用户信息，则从接口获取
        if (!this.vuexUserInfo) {
          const userResponse = await getCurrentUser()
          if (userResponse.data && userResponse.data.data) {
            this.userInfo = { ...this.userInfo, ...userResponse.data.data }
            this.originalUserInfo = { ...userResponse.data.data }
            // 将用户信息存入Vuex
            this.$store.dispatch('user/setUserInfo', userResponse.data.data)
          }
        }
        
        // 解析地址信息
        this.parseUserAddress(this.userInfo.address)
        
        // 获取用户领养记录
        await this.loadAdoptions()
        // 用户信息加载完成
      } catch (error) {
        this.$message.error('获取用户信息失败')
      }
    },

    handleNavSelect(key) {
      this.activeNav = key
      if (key === 'orders') {
        setTimeout(() => {
          this.goToOrders()
        }, 500)
      }
    },

    // 解析用户地址
    parseUserAddress(address) {
      if (!address) {
        this.userInfo.addressObj = {
          province: '',
          city: '',
          district: '',
          address: ''
        }
        return
      }

      // 如果address是对象（之前保存的结构化地址）
      if (typeof address === 'object') {
        this.userInfo.addressObj = {
          province: address.province || '',
          city: address.city || '',
          district: address.district || '',
          address: address.address || ''
        }
      } else if (typeof address === 'string') {
        // 如果是字符串，尝试解析JSON
        try {
          const parsed = JSON.parse(address)
          if (typeof parsed === 'object') {
            this.userInfo.addressObj = {
              province: parsed.province || '',
              city: parsed.city || '',
              district: parsed.district || '',
              address: parsed.address || ''
            }
          } else {
            // 纯字符串，作为详细地址
            this.userInfo.addressObj = {
              province: '',
              city: '',
              district: '',
              address: address
            }
          }
        } catch (e) {
          // 不是JSON，作为详细地址
          this.userInfo.addressObj = {
            province: '',
            city: '',
            district: '',
            address: address
          }
        }
      }
    },
    
    async saveBasicInfo() {
      // 验证表单
      this.$refs.basicForm.validate(async (valid) => {
        if (!valid) {
          return false
        }
        
        this.saving = true
        try {
          // 将地址对象转换为JSON字符串保存
          const addressObj = {
            province: this.userInfo.addressObj.province || '',
            city: this.userInfo.addressObj.city || '',
            district: this.userInfo.addressObj.district || '',
            address: this.userInfo.addressObj.address || ''
          }
          
          // 保存为JSON字符串
          const addressValue = JSON.stringify(addressObj)
          
          // 只提交后端允许的字段
          const updateData = {
            real_name: this.userInfo.real_name || null,
            email: this.userInfo.email || null,
            phone: this.userInfo.phone || null,
            avatar: this.userInfo.avatar || null,
            gender: this.userInfo.gender || null,
            address: addressValue
          }
          
          const response = await updateUserProfile(updateData)
          if (response.data && (response.data.code === 200 || response.data.data)) {
            this.$message.success(response.data.message || '信息更新成功')
            // 如果返回了更新后的用户数据，直接使用；否则重新获取
            if (response.data.data) {
              this.userInfo = { ...this.userInfo, ...response.data.data }
              this.originalUserInfo = { ...response.data.data }
              // 重新解析地址
              this.parseUserAddress(this.userInfo.address)
              // 更新Vuex中的用户信息
              this.$store.dispatch('user/setUserInfo', response.data.data)
            } else {
              // 重新获取用户信息以获取最新数据
              const userResponse = await getCurrentUser()
              if (userResponse.data && userResponse.data.data) {
                this.userInfo = { ...this.userInfo, ...userResponse.data.data }
                this.originalUserInfo = { ...userResponse.data.data }
                // 重新解析地址
                this.parseUserAddress(this.userInfo.address)
                // 更新Vuex中的用户信息
                this.$store.dispatch('user/setUserInfo', userResponse.data.data)
              }
            }
          }
        } catch (error) {
          console.error('更新失败:', error)
          this.$message.error(error.data?.message || '更新失败，请稍后重试')
        } finally {
          this.saving = false
        }
      })
    },

    resetBasicInfo() {
      // 重置为原始数据
      this.userInfo = { ...this.originalUserInfo }
      // 重新解析地址
      this.parseUserAddress(this.userInfo.address)
      this.$refs.basicForm.clearValidate()
    },

    handleAvatarSuccess(res) {
      // res 是后端返回的响应数据，格式为 { code: 200, message: '...', data: { url: '...' } }
      if (res && res.data && res.data.url) {
        // 使用完整的URL（包含服务器地址）
        const avatarUrl = res.data.url.startsWith('http') 
          ? res.data.url 
          : `http://localhost:8889${res.data.url}`
        this.userInfo.avatar = avatarUrl
        // 头像上传成功后，立即保存到后端
        this.saveAvatar(avatarUrl)
      } else {
        this.$message.error('头像上传失败，请重试')
      }
    },
    
    async saveAvatar(avatarUrl) {
      try {
        // 只更新头像字段
        const updateData = { avatar: avatarUrl }
        const response = await updateUserProfile(updateData)
        if (response.data && response.data.code === 200) {
          this.$message.success('头像更新成功')
          // 更新原始数据
          if (response.data.data) {
            this.originalUserInfo.avatar = response.data.data.avatar
            this.$store.dispatch('user/setUserInfo', response.data.data)
          }
        }
      } catch (error) {
        console.error('保存头像失败:', error)
        this.$message.error('保存头像失败，请重试')
      }
    },

    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },

    showChangePasswordDialog() {
      this.changePasswordDialogVisible = true
      this.$nextTick(() => {
        this.$refs.passwordForm.clearValidate()
      })
    },

    validateConfirmPassword(rule, value, callback) {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    },

    async changePassword() {
      this.$refs.passwordForm.validate(async (valid) => {
        if (valid) {
          try {
            await changePassword({
              oldPassword: this.passwordForm.oldPassword,
              newPassword: this.passwordForm.newPassword
            })
            this.$message.success('密码修改成功')
            this.changePasswordDialogVisible = false
            this.passwordForm = {
              oldPassword: '',
              newPassword: '',
              confirmPassword: ''
            }
          } catch (error) {
            this.$message.error('密码修改失败')
          }
        }
      })
    },

    showBindPhoneDialog() {
      this.$message.info('手机绑定功能开发中')
    },

    async loadAdoptions() {
      try {
        const adoptionResponse = await getUserAdoptions({
          page: this.adoptionPagination.currentPage,
          limit: this.adoptionPagination.pageSize
        })
        if (adoptionResponse.data && adoptionResponse.data.code === 200) {
          this.adoptions = adoptionResponse.data.data || []
          if (adoptionResponse.data.pagination) {
            this.adoptionPagination.total = adoptionResponse.data.pagination.total || 0
            this.adoptionPagination.currentPage = adoptionResponse.data.pagination.page || 1
          }
        }
      } catch (adoptionError) {
        console.error('获取领养记录失败:', adoptionError)
        this.adoptions = []
      }
    },

    handleAdoptionPageChange(page) {
      this.adoptionPagination.currentPage = page
      this.loadAdoptions()
    },

    getStatusText(status) {
      const statusMap = {
        'approved': '已通过',
        'rejected': '已拒绝',
        'pending': '待审核'
      }
      return statusMap[status] || '未知状态'
    },

    getStatusTagType(status) {
      const typeMap = {
        'approved': 'success',
        'rejected': 'danger',
        'pending': 'warning'
      }
      return typeMap[status] || 'info'
    },

    getTypeName(type) {
      const typeMap = {
        'dog': '狗狗',
        'cat': '猫咪',
        'other': '其他'
      }
      return typeMap[type] || type || '未知'
    },

    getGenderName(gender) {
      const genderMap = {
        'male': '公',
        'female': '母',
        'unknown': '未知'
      }
      return genderMap[gender] || gender || '未知'
    },

    getSizeName(size) {
      const sizeMap = {
        'small': '小型',
        'medium': '中型',
        'large': '大型'
      }
      return sizeMap[size] || size || '未知'
    },

    getPetImage(imageUrl) {
      if (!imageUrl) {
        return require('@/assets/front/index/wrapper-1.jpg')
      }
      if (imageUrl.startsWith('http')) {
        return imageUrl
      }
      return `${this.API_BASE_URL}${imageUrl}`
    },

    formatDateTime(dateTime) {
      return formatDateTimeUtil(dateTime, 'datetime')
    },

    showAdoptionDetail(adoption) {
      this.currentAdoptionDetail = adoption
      this.adoptionDetailDialogVisible = true
    },

    goToAdoptionList() {
      this.$router.push('/adoption/list')
    },

    goToOrders() {
      this.$router.push('/user/orders')
    }
  }
}
</script>

<style scoped lang="less">
.user-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 120px);

  .page-header {
    text-align: center;
    margin-bottom: 40px;
    
    .page-title {
      font-size: 28px;
      color: #333;
      margin-bottom: 10px;
    }
    
    .page-subtitle {
      color: #666;
      font-size: 16px;
    }
  }

  .profile-content {
    display: flex;
    gap: 20px;

    .profile-sidebar {
      width: 280px;
      flex-shrink: 0;

      .user-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;

        .avatar-section {
          display: flex;
          align-items: center;
          margin-bottom: 20px;

          .user-avatar {
            margin-right: 15px;
            background-color: #D52B1E;
          }

          .user-basic-info {
            .username {
              margin: 0 0 5px 0;
              font-size: 18px;
              color: #333;
            }

            .user-email {
              margin: 0 0 5px 0;
              color: #666;
              font-size: 14px;
            }

            .member-level {
              margin: 0;
              color: #D52B1E;
              font-size: 12px;
              font-weight: bold;
            }
          }
        }

        .user-stats {
          display: flex;
          justify-content: space-around;
          border-top: 1px solid #f0f0f0;
          padding-top: 15px;

          .stat-item {
            text-align: center;

            .stat-number {
              display: block;
              font-size: 24px;
              font-weight: bold;
              color: #D52B1E;
            }

            .stat-label {
              font-size: 12px;
              color: #666;
            }
          }
        }
      }

      .profile-nav {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        .profile-menu {
          border: none;

          .el-menu-item {
            height: 50px;
            line-height: 50px;
            font-size: 14px;

            i {
              margin-right: 10px;
              color: #D52B1E;
            }

            &.is-active {
              background-color: rgba(213, 43, 30, 0.1);
              color: #D52B1E;
            }
          }
        }
      }
    }

    .profile-main {
      flex: 1;
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

      .section-title {
        font-size: 20px;
        color: #333;
        margin-bottom: 25px;
        padding-bottom: 10px;
        border-bottom: 2px solid #f0f0f0;
      }

      .profile-form {
        max-width: 600px;

        .avatar-form-item {
          .avatar-upload {
            .avatar-uploader {
              /deep/ .el-upload {
                border: 1px dashed #d9d9d9;
                border-radius: 6px;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                
                &:hover {
                  border-color: #D52B1E;
                }
              }
              
              .avatar-uploader-icon {
                font-size: 28px;
                color: #8c939d;
                width: 100px;
                height: 100px;
                line-height: 100px;
                text-align: center;
              }
              
              .avatar {
                width: 100px;
                height: 100px;
                display: block;
              }
            }

            .avatar-tip {
              margin-top: 10px;
              color: #666;
              font-size: 12px;
            }
          }
        }

        .field-tip {
          margin-top: 5px;
          color: #999;
          font-size: 12px;
        }
      }

      .security-list {
        .security-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .security-info {
            h4 {
              margin: 0 0 5px 0;
              color: #333;
            }

            p {
              margin: 0;
              color: #666;
              font-size: 14px;
            }
          }
        }
      }

      .empty-state, .volunteer-not-joined, .redirect-info {
        text-align: center;
        padding: 60px 20px;

        .empty-icon, .redirect-icon {
          font-size: 60px;
          color: #D52B1E;
          margin-bottom: 20px;
        }

        p {
          color: #666;
          margin-bottom: 20px;
          font-size: 16px;
        }
      }

      .adoptions-list {
        .adoption-item {
          margin-bottom: 20px;

          .adoption-card {
            transition: all 0.3s ease;
            border-radius: 12px;
            overflow: hidden;

            &:hover {
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              transform: translateY(-2px);
            }
          }

          .adoption-content {
            display: flex;
            gap: 20px;
            padding: 10px;

            .pet-image-section {
              position: relative;
              flex-shrink: 0;

              .animal-image {
                width: 150px;
                height: 150px;
                object-fit: cover;
                border-radius: 12px;
                border: 2px solid #f0f0f0;
              }

              .status-tag {
                position: absolute;
                top: 10px;
                right: 10px;
                font-weight: bold;
              }
            }

            .adoption-info {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 12px;

              .info-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 12px;
                border-bottom: 1px solid #f0f0f0;

                .pet-name {
                  margin: 0;
                  color: #333;
                  font-size: 20px;
                  font-weight: 600;
                }

                .detail-btn {
                  color: #D52B1E;
                  font-size: 14px;
                  padding: 0;

                  &:hover {
                    color: #b0231a;
                  }
                }
              }

              .info-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;

                .info-item {
                  display: flex;
                  align-items: center;
                  font-size: 14px;
                  color: #666;

                  i {
                    color: #D52B1E;
                    margin-right: 6px;
                    font-size: 16px;
                  }

                  .label {
                    margin-right: 4px;
                  }

                  .value {
                    color: #333;
                    font-weight: 500;
                  }
                }
              }

              .timeline-info {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 8px;

                .timeline-item {
                  display: flex;
                  align-items: center;
                  font-size: 13px;
                  color: #666;

                  i {
                    color: #D52B1E;
                    margin-right: 8px;
                    font-size: 14px;
                  }
                }
              }

              .review-comment {
                display: flex;
                align-items: flex-start;
                padding: 12px;
                background: #fff7e6;
                border-left: 3px solid #fa8c16;
                border-radius: 4px;
                font-size: 13px;

                i {
                  color: #fa8c16;
                  margin-right: 8px;
                  margin-top: 2px;
                  font-size: 16px;
                }

                .comment-label {
                  color: #666;
                  margin-right: 6px;
                  font-weight: 500;
                }

                .comment-text {
                  color: #333;
                  flex: 1;
                }
              }
            }
          }
        }
      }

      .pagination-wrapper {
        margin-top: 30px;
        display: flex;
        justify-content: center;
      }
    }
  }
}

// 收养记录详情对话框样式
/deep/ .adoption-detail-dialog {
  .detail-content {
    .detail-section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .detail-section-title {
        display: flex;
        align-items: center;
        font-size: 18px;
        color: #333;
        margin: 0 0 20px 0;
        font-weight: 600;

        i {
          color: #D52B1E;
          margin-right: 8px;
          font-size: 20px;
        }
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;

        .detail-item {
          display: flex;
          align-items: center;
          font-size: 14px;

          &.full-width {
            grid-column: 1 / -1;
          }

          .detail-label {
            color: #666;
            margin-right: 8px;
            min-width: 100px;
            font-weight: 500;
          }

          .detail-value {
            color: #333;
            flex: 1;
          }
        }
      }

      .detail-info-list {
        .info-row {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          font-size: 14px;

          .info-label {
            color: #666;
            margin-right: 8px;
            min-width: 120px;
            font-weight: 500;
          }

          .info-value {
            color: #333;
            flex: 1;
            line-height: 1.6;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .user-profile {
    padding: 10px;

    .profile-content {
      flex-direction: column;

      .profile-sidebar {
        width: 100%;
      }

      .profile-main {
        .adoptions-list {
          .adoption-item {
            .adoption-content {
              flex-direction: column;

              .pet-image-section {
                width: 100%;
                text-align: center;

                .animal-image {
                  width: 200px;
                  height: 200px;
                  margin: 0 auto;
                }
              }

              .adoption-info {
                .info-grid {
                  grid-template-columns: repeat(2, 1fr);
                }
              }
            }
          }
        }
      }
    }
  }

  /deep/ .adoption-detail-dialog {
    .detail-content {
      .detail-section {
        .detail-grid {
          grid-template-columns: 1fr;

          .detail-item.full-width {
            grid-column: 1;
          }
        }
      }
    }
  }
}
</style>
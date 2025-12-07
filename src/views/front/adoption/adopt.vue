<template>
    <div class="adopt-page">
        <header-layout></header-layout>

        <!-- 页面头部 -->
        <section class="page-header">
            <div class="header-content">
                <h1>领养申请表</h1>
                <p>请认真填写以下信息，帮助我们确保每只动物找到最合适的家庭</p>
            </div>
        </section>

        <!-- 领养申请表 -->
        <section class="adopt-form-section">
            <div class="form-container">
                <div class="form-wrapper">
                    <el-steps :active="activeStep" align-center process-slot-scope>
                        <el-step title="选择动物"></el-step>
                        <el-step title="申请人信息"></el-step>
                        <el-step title="家庭情况"></el-step>
                        <el-step title="承诺与同意"></el-step>
                    </el-steps>

                    <!-- 第一步：选择动物 -->
                    <div v-if="activeStep === 0" class="step-content">
                        <h3>选择要领养的动物</h3>
                        <div v-if="availableAnimals.length > 0" class="animal-selection">
                            <div v-for="animal in availableAnimals" :key="animal.id" class="animal-option">
                                <div class="animal-image">
                                    <img :src="animal.image" :alt="animal.name">
                                </div>
                                <div class="animal-info">
                                    <h4>{{ animal.name }}</h4>
                                    <p>{{ animal.type }} | {{ animal.age }} | {{ animal.gender }}</p>
                                    <p class="description">{{ animal.description }}</p>
                                </div>
                                <div class="select-action">
                                    <el-radio 
                                        v-model="adoptForm.selectedAnimal" 
                                        :label="animal.id">
                                    </el-radio>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-animals">
                            <p>暂无可选动物，请从列表页选择</p>
                            <el-button type="primary" @click="$router.push('/adoption/list')">去选择动物</el-button>
                        </div>
                        <div class="step-actions">
                            <el-button @click="activeStep = 0" disabled>上一步</el-button>
                            <el-button 
                                type="primary" 
                                @click="nextStep(0)"
                                :disabled="!adoptForm.selectedAnimal">
                                下一步
                            </el-button>
                        </div>
                    </div>

                    <!-- 第二步：申请人信息 -->
                    <div v-if="activeStep === 1" class="step-content">
                        <h3>申请人基本信息</h3>
                        <el-form 
                            ref="applicantForm" 
                            :model="adoptForm" 
                            :rules="applicantRules"
                            label-width="120px"
                            class="apply-form">

                            <el-form-item label="姓名" prop="applicantName">
                                <el-input 
                                    v-model="adoptForm.applicantName" 
                                    placeholder="请输入真实姓名"
                                    prefix-icon="el-icon-user">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="年龄" prop="applicantAge">
                                <el-input-number 
                                    v-model="adoptForm.applicantAge" 
                                    :min="18"
                                    :max="120"
                                    style="width: 100%;">
                                </el-input-number>
                            </el-form-item>

                            <el-form-item label="性别" prop="applicantGender">
                                <el-radio-group v-model="adoptForm.applicantGender">
                                    <el-radio label="男">男</el-radio>
                                    <el-radio label="女">女</el-radio>
                                </el-radio-group>
                            </el-form-item>

                            <el-form-item label="职业" prop="occupation">
                                <el-input 
                                    v-model="adoptForm.occupation" 
                                    placeholder="请输入您的职业">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="手机号码" prop="phone">
                                <el-input 
                                    v-model="adoptForm.phone" 
                                    placeholder="请输入手机号码"
                                    prefix-icon="el-icon-phone">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="邮箱" prop="email">
                                <el-input 
                                    v-model="adoptForm.email" 
                                    placeholder="请输入邮箱地址"
                                    prefix-icon="el-icon-message">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="住址" prop="address">
                                <el-input 
                                    v-model="adoptForm.address" 
                                    placeholder="请输入详细住址"
                                    type="textarea"
                                    :rows="3">
                                </el-input>
                            </el-form-item>
                        </el-form>

                        <div class="step-actions">
                            <el-button @click="activeStep = 0">上一步</el-button>
                            <el-button 
                                type="primary" 
                                @click="nextStep(1)">
                                下一步
                            </el-button>
                        </div>
                    </div>

                    <!-- 第三步：家庭情况 -->
                    <div v-if="activeStep === 2" class="step-content">
                        <h3>家庭情况</h3>
                        <el-form 
                            ref="homeForm" 
                            :model="adoptForm" 
                            :rules="homeRules"
                            label-width="140px"
                            class="apply-form">

                            <el-form-item label="住房类型" prop="housingType">
                                <el-select 
                                    v-model="adoptForm.housingType" 
                                    placeholder="请选择住房类型">
                                    <el-option label="独立房屋" value="house"></el-option>
                                    <el-option label="公寓" value="apartment"></el-option>
                                    <el-option label="别墅" value="villa"></el-option>
                                    <el-option label="其他" value="other"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="是否拥有住房" prop="homeOwnership">
                                <el-radio-group v-model="adoptForm.homeOwnership">
                                    <el-radio label="自有">自有</el-radio>
                                    <el-radio label="租赁">租赁</el-radio>
                                </el-radio-group>
                            </el-form-item>

                            <el-form-item label="花园/院子" prop="hasGarden">
                                <el-radio-group v-model="adoptForm.hasGarden">
                                    <el-radio label="有">有</el-radio>
                                    <el-radio label="没有">没有</el-radio>
                                </el-radio-group>
                            </el-form-item>

                            <el-form-item label="家庭成员" prop="familyMembers">
                                <el-input-number 
                                    v-model="adoptForm.familyMembers" 
                                    :min="1"
                                    :max="20"
                                    style="width: 100%;">
                                </el-input-number>
                            </el-form-item>

                            <el-form-item label="家中是否有儿童" prop="hasChildren">
                                <el-radio-group v-model="adoptForm.hasChildren">
                                    <el-radio label="有">有</el-radio>
                                    <el-radio label="没有">没有</el-radio>
                                </el-radio-group>
                            </el-form-item>

                            <el-form-item label="儿童年龄" prop="childrenAge" v-if="adoptForm.hasChildren === '有'">
                                <el-input 
                                    v-model="adoptForm.childrenAge" 
                                    placeholder="请输入儿童年龄">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="现有宠物" prop="existingPets">
                                <el-select 
                                    v-model="adoptForm.existingPets" 
                                    placeholder="请选择">
                                    <el-option label="没有宠物" value="none"></el-option>
                                    <el-option label="有狗" value="dog"></el-option>
                                    <el-option label="有猫" value="cat"></el-option>
                                    <el-option label="有其他宠物" value="other"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="宠物详情" prop="petsDetail" v-if="adoptForm.existingPets !== 'none'">
                                <el-input 
                                    v-model="adoptForm.petsDetail" 
                                    placeholder="请描述现有宠物的信息（品种、年龄、性格等）"
                                    type="textarea"
                                    :rows="3">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="白天是否有人在家" prop="dayPresence">
                                <el-radio-group v-model="adoptForm.dayPresence">
                                    <el-radio label="大部分时间在">大部分时间在</el-radio>
                                    <el-radio label="经常出门">经常出门</el-radio>
                                    <el-radio label="大部分时间出门">大部分时间出门</el-radio>
                                </el-radio-group>
                            </el-form-item>

                            <el-form-item label="养宠物经验" prop="petExperience">
                                <el-select 
                                    v-model="adoptForm.petExperience" 
                                    placeholder="请选择">
                                    <el-option label="第一次养宠物" value="first"></el-option>
                                    <el-option label="有一定经验" value="some"></el-option>
                                    <el-option label="经验丰富" value="rich"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>

                        <div class="step-actions">
                            <el-button @click="activeStep = 1">上一步</el-button>
                            <el-button 
                                type="primary" 
                                @click="nextStep(2)">
                                下一步
                            </el-button>
                        </div>
                    </div>

                    <!-- 第四步：承诺与同意 -->
                    <div v-if="activeStep === 3" class="step-content">
                        <h3>承诺与同意</h3>
                        <el-form 
                            ref="agreementForm" 
                            :model="adoptForm" 
                            :rules="agreementRules"
                            class="apply-form">

                            <el-form-item label="领养理由" prop="adoptionReason">
                                <el-input 
                                    v-model="adoptForm.adoptionReason" 
                                    placeholder="请说明为什么想要领养这只动物"
                                    type="textarea"
                                    :rows="3">
                                </el-input>
                            </el-form-item>

                            <el-form-item label="领养承诺" prop="commitment">
                                <div class="commitment-list">
                                    <el-checkbox v-model="adoptForm.commitment" true-label="true">
                                        我承诺将这只动物视为家庭成员，给予它足够的爱与关怀
                                    </el-checkbox>
                                    <el-checkbox v-model="adoptForm.commitment2" true-label="true">
                                        我承诺定期带动物进行健康检查和接种疫苗
                                    </el-checkbox>
                                    <el-checkbox v-model="adoptForm.commitment3" true-label="true">
                                        我承诺提供充足的食物、水和适当的生活环境
                                    </el-checkbox>
                                    <el-checkbox v-model="adoptForm.commitment4" true-label="true">
                                        我承诺如果无法继续养护，会通知中心寻求帮助
                                    </el-checkbox>
                                </div>
                            </el-form-item>

                            <el-form-item label="首次接触" prop="firstContact">
                                <el-input 
                                    v-model="adoptForm.firstContact" 
                                    placeholder="请描述您第一次接触这只动物的经历和感受"
                                    type="textarea"
                                    :rows="3">
                                </el-input>
                            </el-form-item>

                            <el-form-item class="agreement-item" prop="agreeTerms">
                                <el-checkbox v-model="adoptForm.agreeTerms">
                                    我已阅读并同意 
                                    <span class="agreement-link" @click="showTerms">领养协议</span>
                                    和隐私政策
                                </el-checkbox>
                            </el-form-item>

                            <el-form-item class="agreement-item" prop="agreeFollowUp">
                                <el-checkbox v-model="adoptForm.agreeFollowUp">
                                    我同意接收来自中心的跟进信息和动物近况更新
                                </el-checkbox>
                            </el-form-item>

                            <el-form-item class="agreement-item" prop="agreeVisit">
                                <el-checkbox v-model="adoptForm.agreeVisit">
                                    我同意中心在必要时进行家访以确保动物的安全与福利
                                </el-checkbox>
                            </el-form-item>
                        </el-form>

                        <div class="step-actions">
                            <el-button @click="activeStep = 2">上一步</el-button>
                            <el-button 
                                type="primary" 
                                @click="submitApplication"
                                :loading="submitLoading">
                                提交申请
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 领养协议模态框 -->
        <el-dialog
            title="领养协议"
            :visible.sync="termsDialogVisible"
            width="80%"
            class="terms-dialog">
            <div class="terms-content">
                <h3>动物领养协议</h3>
                <p>
                    本协议是申请人与流浪动物收养中心之间的协议，旨在确保被领养动物得到妥善照顾和保护。
                </p>
                <h4>一、申请人责任</h4>
                <ul>
                    <li>确保动物得到足够的食物、水和温暖的生活环境</li>
                    <li>定期带动物进行兽医检查和必要的医疗保健</li>
                    <li>提供适当的运动和精神刺激</li>
                    <li>确保动物的安全，防止走失或伤害</li>
                    <li>遵守当地关于宠物饲养的法律法规</li>
                </ul>
                <h4>二、中心权利</h4>
                <ul>
                    <li>如果发现动物被虐待，中心有权收回该动物</li>
                    <li>中心可在必要时进行家访</li>
                    <li>中心可要求申请人提供动物的健康报告</li>
                </ul>
                <h4>三、协议终止</h4>
                <p>
                    如申请人无法继续照顾动物，应立即联系中心。申请人不得将动物转送给他人，否则将违反本协议。
                </p>
                <h4>四、医疗保障</h4>
                <p>
                    申请人应自行承担动物的医疗费用。中心建议与当地兽医诊所建立长期关系。
                </p>
            </div>
        </el-dialog>

        <!-- 成功提示 -->
        <el-dialog
            title="申请提交成功"
            :visible.sync="successDialogVisible"
            width="500px"
            :close-on-click-modal="false"
            :show-close="false">
            <div class="success-content">
                <div class="success-icon">✓</div>
                <h3>感谢您的申请！</h3>
                <p>我们已收到您的领养申请。我们的工作人员会在 24-48 小时内与您联系，讨论下一步的步骤。</p>
                <p>期间请保持手机畅通，以便我们与您联系。</p>
                <el-button type="primary" @click="goHome" style="width: 100%;">返回首页</el-button>
            </div>
        </el-dialog>

        <footer-layout></footer-layout>
    </div>
</template>

<script>
import { getPetDetail, createAdoptionApplication, recordApplyBehavior } from '@/utils/api'
import { getCurrentUser } from '@/utils/api'

const API_BASE_URL = 'http://localhost:8889'

export default {
    name: "adoptPage",
    data() {
        const validatePhone = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入手机号码'));
            } else if (!/^1[3-9]\d{9}$/.test(value)) {
                callback(new Error('请输入正确的手机号码'));
            } else {
                callback();
            }
        };

        const validateEmail = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入邮箱地址'));
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                callback(new Error('请输入正确的邮箱地址'));
            } else {
                callback();
            }
        };

        return {
            activeStep: 0,
            adoptForm: {
                selectedAnimal: '',
                applicantName: '',
                applicantAge: null,
                applicantGender: '',
                occupation: '',
                phone: '',
                email: '',
                address: '',
                housingType: '',
                homeOwnership: '',
                hasGarden: '',
                familyMembers: 1,
                hasChildren: '',
                childrenAge: '',
                existingPets: '',
                petsDetail: '',
                dayPresence: '',
                petExperience: '',
                adoptionReason: '',
                commitment: false,
                commitment2: false,
                commitment3: false,
                commitment4: false,
                firstContact: '',
                agreeTerms: false,
                agreeFollowUp: false,
                agreeVisit: false
            },
            applicantRules: {
                applicantName: [
                    { required: true, message: '请输入姓名', trigger: 'blur' },
                    { min: 2, max: 50, message: '姓名长度在2-50个字符', trigger: 'blur' }
                ],
                applicantAge: [
                    { required: true, message: '请选择年龄', trigger: 'change' },
                    { type: 'number', min: 18, message: '年龄必须年满18岁', trigger: 'change' }
                ],
                applicantGender: [
                    { required: true, message: '请选择性别', trigger: 'change' }
                ],
                occupation: [
                    { required: true, message: '请输入职业', trigger: 'blur' }
                ],
                phone: [
                    { validator: validatePhone, trigger: 'blur' }
                ],
                email: [
                    { validator: validateEmail, trigger: 'blur' }
                ],
                address: [
                    { required: true, message: '请输入详细住址', trigger: 'blur' }
                ]
            },
            homeRules: {
                housingType: [
                    { required: true, message: '请选择住房类型', trigger: 'change' }
                ],
                homeOwnership: [
                    { required: true, message: '请选择是否拥有住房', trigger: 'change' }
                ],
                hasGarden: [
                    { required: true, message: '请选择是否有花园', trigger: 'change' }
                ],
                familyMembers: [
                    { required: true, message: '请输入家庭成员数', trigger: 'blur' }
                ],
                hasChildren: [
                    { required: true, message: '请选择是否有儿童', trigger: 'change' }
                ],
                existingPets: [
                    { required: true, message: '请选择现有宠物情况', trigger: 'change' }
                ],
                dayPresence: [
                    { required: true, message: '请选择白天是否在家', trigger: 'change' }
                ],
                petExperience: [
                    { required: true, message: '请选择养宠物经验', trigger: 'change' }
                ]
            },
            agreementRules: {
                adoptionReason: [
                    { required: true, message: '请说明领养理由', trigger: 'blur' },
                    { min: 20, message: '理由至少20个字符', trigger: 'blur' }
                ],
                firstContact: [
                    { required: true, message: '请描述首次接触的感受', trigger: 'blur' }
                ],
                agreeTerms: [
                    { required: true, message: '请同意领养协议', trigger: 'change' }
                ],
                agreeFollowUp: [
                    { required: true, message: '请同意接收跟进信息', trigger: 'change' }
                ],
                agreeVisit: [
                    { required: true, message: '请同意中心家访权利', trigger: 'change' }
                ]
            },
            selectedPetId: null,
            selectedPetInfo: null,
            availableAnimals: [],
            loading: false,
            termsDialogVisible: false,
            successDialogVisible: false,
            submitLoading: false
        }
    },
    mounted() {
        // 从URL参数获取宠物ID
        this.selectedPetId = this.$route.query.id
        if (this.selectedPetId) {
            this.loadPetInfo()
            this.adoptForm.selectedAnimal = parseInt(this.selectedPetId)
            // 如果已选择宠物，直接跳到第二步
            this.activeStep = 1
        } else {
            this.loadAvailablePets()
        }
        
        // 尝试加载用户信息，自动填充表单
        this.loadUserInfo()
    },
    methods: {
        async loadPetInfo() {
            if (!this.selectedPetId) return
            
            this.loading = true
            try {
                const response = await getPetDetail(this.selectedPetId)
                if (response.data && response.data.code === 200) {
                    const pet = response.data.data
                    this.selectedPetInfo = {
                        id: pet.id,
                        name: pet.pet_name,
                        type: this.getTypeName(pet.pet_type),
                        age: pet.age ? `${pet.age}岁` : '未知',
                        gender: this.getGenderName(pet.gender),
                        description: pet.description || '暂无描述',
                        image: this.getPetImage(pet.image_url)
                    }
                    this.availableAnimals = [this.selectedPetInfo]
                }
            } catch (error) {
                console.error('加载宠物信息失败:', error)
                this.$message.error('加载宠物信息失败')
            } finally {
                this.loading = false
            }
        },

        async loadAvailablePets() {
            // 如果没有指定宠物ID，可以加载可领养的宠物列表
            // 这里暂时留空，因为第一步是选择动物
        },

        async loadUserInfo() {
            try {
                const response = await getCurrentUser()
                if (response.data && response.data.data) {
                    const user = response.data.data
                    // 自动填充用户信息
                    this.adoptForm.applicantName = user.real_name || ''
                    this.adoptForm.phone = user.phone || ''
                    this.adoptForm.email = user.email || ''
                    if (user.address) {
                        try {
                            const addr = typeof user.address === 'string' ? JSON.parse(user.address) : user.address
                            if (typeof addr === 'object') {
                                this.adoptForm.address = `${addr.province || ''}${addr.city || ''}${addr.district || ''}${addr.address || ''}`
                            } else {
                                this.adoptForm.address = user.address
                            }
                        } catch (e) {
                            this.adoptForm.address = user.address || ''
                        }
                    }
                }
            } catch (error) {
                // 用户未登录或获取失败，忽略
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

        getGenderName(gender) {
            const genderMap = {
                'male': '公',
                'female': '母',
                'unknown': '未知'
            }
            return genderMap[gender] || '未知'
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

        nextStep(currentStep) {
            if (currentStep === 1) {
                this.$refs.applicantForm.validate((valid) => {
                    if (valid) {
                        this.activeStep = 2;
                    }
                });
            } else if (currentStep === 2) {
                this.$refs.homeForm.validate((valid) => {
                    if (valid) {
                        this.activeStep = 3;
                    }
                });
            } else {
                this.activeStep = currentStep + 1;
            }
        },
        async submitApplication() {
            this.$refs.agreementForm.validate(async (valid) => {
                if (!valid) {
                    return false
                }

                if (!this.adoptForm.commitment || !this.adoptForm.commitment2 || !this.adoptForm.commitment3 || !this.adoptForm.commitment4) {
                    this.$message.error('请同意所有承诺');
                    return false
                }

                // 确定宠物ID
                const petId = this.selectedPetId || this.adoptForm.selectedAnimal
                if (!petId) {
                    this.$message.error('请选择要领养的宠物');
                    return false
                }

                // 构建承诺文本
                const commitments = []
                if (this.adoptForm.commitment) commitments.push('我承诺将这只动物视为家庭成员，给予它足够的爱与关怀')
                if (this.adoptForm.commitment2) commitments.push('我承诺定期带动物进行健康检查和接种疫苗')
                if (this.adoptForm.commitment3) commitments.push('我承诺提供充足的食物、水和适当的生活环境')
                if (this.adoptForm.commitment4) commitments.push('我承诺如果无法继续养护，会通知中心寻求帮助')
                const commitmentText = commitments.join('。') + '。'

                // 构建申请数据
                const applicationData = {
                    pet_id: petId,
                    applicant_name: this.adoptForm.applicantName,
                    applicant_phone: this.adoptForm.phone,
                    applicant_email: this.adoptForm.email || null,
                    applicant_address: this.adoptForm.address || null,
                    occupation: this.adoptForm.occupation || null,
                    housing_type: this.adoptForm.housingType || null,
                    has_experience: this.adoptForm.petExperience === 'some' || this.adoptForm.petExperience === 'rich',
                    has_other_pets: this.adoptForm.existingPets !== 'none',
                    family_agree: this.adoptForm.hasChildren === '有' ? true : false,
                    reason: this.adoptForm.adoptionReason || null,
                    commitment: commitmentText
                }

                this.submitLoading = true
                try {
                    const response = await createAdoptionApplication(applicationData)
                    if (response.data && (response.data.code === 201 || response.data.code === 200)) {
                        // 记录申请行为（用于推荐系统）
                        try {
                            await recordApplyBehavior(petId)
                            console.log('[推荐系统] 已记录申请领养行为')
                        } catch (err) {
                            // 记录行为失败不影响申请提交，只记录错误日志
                            console.error('[推荐系统] 记录申请行为失败:', err)
                        }
                        this.successDialogVisible = true
                    } else {
                        this.$message.error(response.data?.message || '提交失败，请重试')
                    }
                } catch (error) {
                    console.error('提交申请失败:', error)
                    this.$message.error(error.data?.message || '提交失败，请稍后重试')
                } finally {
                    this.submitLoading = false
                }
            });
        },
        showTerms() {
            this.termsDialogVisible = true;
        },
        goHome() {
            this.$router.push('/');
        }
    }
}
</script>

<style lang="less" scoped>
.adopt-page {
    width: 100%;
}

/* 页面头部 */
.page-header {
    background: linear-gradient(135deg, #d52b1e 0%, #e85541 100%);
    color: white;
    padding: 80px 20px;
    text-align: center;

    .header-content {
        max-width: 1000px;
        margin: 0 auto;

        h1 {
            font-size: 3rem;
            margin: 0 0 20px 0;
            font-weight: bold;
        }

        p {
            font-size: 1.3rem;
            margin: 0;
            opacity: 0.95;
        }
    }
}

/* 申请表单部分 */
.adopt-form-section {
    padding: 80px 20px;
    background: #fff;

    .form-container {
        max-width: 1000px;
        margin: 0 auto;

        .form-wrapper {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

            /deep/ .el-steps {
                margin-bottom: 40px;
            }

            .step-content {
                min-height: 400px;
                margin-bottom: 30px;

                h3 {
                    font-size: 1.5rem;
                    color: #d52b1e;
                    margin-bottom: 25px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;

                    &::before {
                        content: '';
                        display: inline-block;
                        width: 4px;
                        height: 24px;
                        background: linear-gradient(90deg, #d52b1e 0%, #e85541 100%);
                        border-radius: 2px;
                        margin-right: 12px;
                    }
                }

                .animal-selection {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 15px;
                    margin-bottom: 30px;

                    .animal-option {
                        display: flex;
                        gap: 20px;
                        padding: 15px;
                        border: 2px solid #f0f0f0;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s ease;

                        &:hover {
                            border-color: #d52b1e;
                            background-color: #fff5f2;
                        }

                        .animal-image {
                            width: 120px;
                            height: 120px;
                            flex-shrink: 0;

                            img {
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                                border-radius: 8px;
                            }
                        }

                        .animal-info {
                            flex: 1;

                            h4 {
                                margin: 0 0 8px 0;
                                font-size: 1.1rem;
                                color: #333;
                            }

                            p {
                                margin: 8px 0;
                                font-size: 0.9rem;
                                color: #666;

                                &.description {
                                    line-height: 1.5;
                                }
                            }
                        }

                        .select-action {
                            display: flex;
                            align-items: center;
                            margin-left: auto;
                        }
                    }
                }

                .apply-form {
                    /deep/ .el-form-item {
                        margin-bottom: 20px;
                    }

                    .commitment-list {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;

                        /deep/ .el-checkbox {
                            margin-bottom: 0;
                            line-height: 1.6;
                        }
                    }

                    .agreement-item {
                        /deep/ .el-form-item__content {
                            line-height: 1.8;
                        }

                        .agreement-link {
                            color: #d52b1e;
                            cursor: pointer;
                            text-decoration: underline;

                            &:hover {
                                color: #c21d0f;
                            }
                        }
                    }
                }
            }

            .step-actions {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-top: 30px;

                /deep/ .el-button {
                    padding: 12px 40px;
                    font-size: 1rem;
                }
            }
        }
    }
}

/* 协议对话框 */
.terms-dialog {
    /deep/ .el-dialog {
        border-radius: 12px;
    }

    .terms-content {
        max-height: 500px;
        overflow-y: auto;
        padding-right: 10px;

        h3 {
            color: #d52b1e;
            font-size: 1.3rem;
            margin-bottom: 15px;
            font-weight: bold;
        }

        h4 {
            color: #333;
            font-size: 1.05rem;
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: bold;
        }

        p {
            color: #666;
            line-height: 1.8;
            margin-bottom: 15px;
            font-size: 0.95rem;
        }

        ul {
            margin-left: 20px;
            margin-bottom: 15px;

            li {
                color: #666;
                line-height: 1.8;
                margin-bottom: 8px;
                font-size: 0.95rem;
            }
        }
    }
}

/* 成功提示 */
.success-content {
    text-align: center;
    padding: 20px;

    .success-icon {
        font-size: 4rem;
        color: #52c41a;
        margin-bottom: 20px;
    }

    h3 {
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 15px;
    }

    p {
        color: #666;
        line-height: 1.8;
        margin-bottom: 15px;
        font-size: 0.95rem;
    }
}

/* 输入框美化 */
/deep/ .el-input__inner,
/deep/ .el-textarea__inner,
/deep/ .el-select .el-input__inner,
/deep/ .el-input-number__inner {
    border: 1px solid #e6e6e6;
    border-radius: 6px;
    transition: all 0.3s ease;

    &:focus,
    &:hover {
        border-color: #d52b1e;
        box-shadow: 0 0 0 2px rgba(213, 43, 30, 0.1);
    }
}

/deep/ .el-checkbox__inner,
/deep/ .el-radio__inner {
    border-color: #d52b1e;

    &:hover {
        border-color: #d52b1e;
    }
}

/deep/ .el-checkbox__input.is-checked .el-checkbox__inner,
/deep/ .el-radio__input.is-checked .el-radio__inner {
    background-color: #d52b1e;
    border-color: #d52b1e;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .page-header {
        padding: 50px 20px;

        .header-content {
            h1 {
                font-size: 2rem;
            }

            p {
                font-size: 1rem;
            }
        }
    }

    .adopt-form-section .form-container .form-wrapper {
        padding: 20px;

        .step-content {
            /deep/ .el-form-item__label {
                width: 100% !important;
                text-align: left;
                margin-bottom: 8px;
            }

            /deep/ .el-form-item__content {
                margin-left: 0 !important;
            }

            .animal-selection .animal-option {
                flex-direction: column;

                .select-action {
                    margin-left: 0;
                    margin-top: 10px;
                }
            }
        }

        .step-actions {
            flex-direction: column;

            /deep/ .el-button {
                width: 100%;
            }
        }
    }
}

@media (max-width: 480px) {
    .page-header .header-content h1 {
        font-size: 1.5rem;
    }

    .adopt-form-section .form-container .form-wrapper {
        padding: 15px;
    }
}
</style>

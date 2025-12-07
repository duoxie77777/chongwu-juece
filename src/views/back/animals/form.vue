<template>
    <div class="animals-form-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <h1>{{ isEdit ? '编辑动物信息' : '发布新动物' }}</h1>
            <p>{{ isEdit ? '修改已有动物的基本信息' : '填写动物的基本信息，为其找到温暖的家' }}</p>
        </div>

        <!-- 表单内容 -->
        <el-form
            ref="animalForm"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            class="form-section"
        >
            <!-- 基本信息 -->
            <div class="form-group">
                <h2 class="group-title">基本信息</h2>

                <el-form-item label="动物名称" prop="pet_name">
                    <el-input
                        v-model="formData.pet_name"
                        placeholder="请输入动物名称"
                        clearable
                        maxlength="50"
                    ></el-input>
                </el-form-item>

                <el-form-item label="分类" prop="category_id">
                    <el-select v-model="formData.category_id" placeholder="请选择动物分类" clearable>
                        <el-option
                            v-for="cat in categories"
                            :key="cat.id"
                            :label="cat.name"
                            :value="cat.id"
                        ></el-option>
                    </el-select>
                </el-form-item>

                <el-row :gutter="20">
                    <el-col :xs="24" :sm="12">
                        <el-form-item label="性别" prop="gender">
                            <el-select v-model="formData.gender" placeholder="请选择性别" clearable>
                                <el-option label="♂ 公" value="male"></el-option>
                                <el-option label="♀ 母" value="female"></el-option>
                                <el-option label="未知" value="unknown"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12">
                        <el-form-item label="年龄（月）" prop="age">
                            <el-input-number
                                v-model="formData.age"
                                :min="0"
                                placeholder="请输入年龄"
                            ></el-input-number>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="品种" prop="breed">
                    <el-input
                        v-model="formData.breed"
                        placeholder="如：萨摩耶、橘猫"
                        clearable
                        maxlength="50"
                    ></el-input>
                </el-form-item>

                <el-form-item label="毛色" prop="color">
                    <el-input
                        v-model="formData.color"
                        placeholder="如：黑色、花纹色"
                        clearable
                        maxlength="50"
                    ></el-input>
                </el-form-item>

                <el-form-item label="体型" prop="size">
                    <el-select v-model="formData.size" placeholder="请选择体型" clearable>
                        <el-option label="小型" value="small"></el-option>
                        <el-option label="中型" value="medium"></el-option>
                        <el-option label="大型" value="large"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="体重(kg)" prop="weight">
                    <el-input-number
                        v-model="formData.weight"
                        :min="0"
                        :step="0.1"
                        placeholder="请输入体重"
                    ></el-input-number>
                </el-form-item>
            </div>

            <!-- 详细描述 -->
            <div class="form-group">
                <h2 class="group-title">详细信息</h2>

                <el-form-item label="描述" prop="description">
                    <el-input
                        v-model="formData.description"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入动物的详细描述"
                        maxlength="500"
                        show-word-limit
                    ></el-input>
                </el-form-item>

                <el-form-item label="性格特征" prop="character">
                    <el-input
                        v-model="formData.character"
                        type="textarea"
                        :rows="3"
                        placeholder="如：活泼好动、温顺乖巧等"
                        maxlength="300"
                        show-word-limit
                    ></el-input>
                </el-form-item>

                <el-form-item label="健康状况" prop="health_status">
                    <el-input
                        v-model="formData.health_status"
                        placeholder="如：已接种疫苗、已绝育等"
                        clearable
                        maxlength="100"
                    ></el-input>
                </el-form-item>

                <el-form-item label="已接种疫苗">
                    <el-switch
                        v-model="formData.vaccination"
                        :active-value="1"
                        :inactive-value="0"
                        active-text="是"
                        inactive-text="否"
                    ></el-switch>
                </el-form-item>

                <el-form-item label="已进行绝育">
                    <el-switch
                        v-model="formData.sterilization"
                        :active-value="1"
                        :inactive-value="0"
                        active-text="是"
                        inactive-text="否"
                    ></el-switch>
                </el-form-item>
            </div>

            <!-- 救助信息 -->
            <div class="form-group">
                <h2 class="group-title">救助信息</h2>

                <el-form-item label="救助时间">
                    <el-date-picker
                        v-model="formData.rescue_date"
                        type="date"
                        placeholder="选择日期"
                    ></el-date-picker>
                </el-form-item>

                <el-form-item label="救助地点">
                    <el-input
                        v-model="formData.rescue_location"
                        placeholder="救助地点"
                        clearable
                        maxlength="200"
                    ></el-input>
                </el-form-item>

                <el-form-item label="救助故事">
                    <el-input
                        v-model="formData.rescue_story"
                        type="textarea"
                        :rows="3"
                        placeholder="描述这只动物的救助过程"
                        maxlength="500"
                        show-word-limit
                    ></el-input>
                </el-form-item>
            </div>

            <!-- 图片上传 -->
            <div class="form-group">
                <h2 class="group-title">图片上传</h2>

                <el-form-item label="主图片">
                    <div class="image-upload-wrapper">
                        <div v-if="formData.image_url" class="image-preview">
                            <img :src="formData.image_url" alt="主图片" />
                            <el-button
                                type="danger"
                                size="small"
                                icon="el-icon-delete"
                                @click="formData.image_url = ''"
                            >
                                删除
                            </el-button>
                        </div>
                        <el-upload
                            v-else
                            action="http://localhost:8889/api/upload"
                            :auto-upload="true"
                            :on-success="handleImageUpload"
                            :on-error="handleImageError"
                            :file-list="imageFileList"
                            list-type="picture-card"
                            :limit="1"
                        >
                            <i class="el-icon-plus"></i>
                        </el-upload>
                    </div>
                    <p class="upload-tip">建议尺寸：800x600px，支持 JPG、PNG 格式</p>
                </el-form-item>
            </div>

            <!-- 状态设置 -->
            <div class="form-group">
                <h2 class="group-title">状态设置</h2>

                <el-form-item label="状态" prop="status">
                    <el-select v-model="formData.status" placeholder="请选择状态">
                        <el-option label="待领养" value="available"></el-option>
                        <el-option label="已领养" value="adopted"></el-option>
                        <el-option label="预留" value="reserved"></el-option>
                        <el-option label="不可领养" value="unavailable"></el-option>
                    </el-select>
                </el-form-item>
            </div>

            <!-- 表单操作按钮 -->
            <div class="form-actions">
                <el-button type="primary" icon="el-icon-check" @click="submitForm" :loading="submitLoading">
                    {{ isEdit ? '更新' : '发布' }}
                </el-button>
                <el-button @click="resetForm" icon="el-icon-refresh">重置</el-button>
                <el-button @click="$router.back()" icon="el-icon-arrow-left">返回</el-button>
            </div>
        </el-form>
    </div>
</template>

<script>
import { createPet, updatePet, getPetDetail, getPetCategories } from '@/utils/api'

export default {
    name: 'AnimalsForm',
    data() {
        return {
            isEdit: false,
            submitLoading: false,
            imageFileList: [],
            categories: [],
            formData: {
                pet_name: '',
                category_id: null,
                pet_type: 'dog',
                breed: '',
                gender: 'unknown',
                age: null,
                color: '',
                size: null,
                weight: null,
                health_status: '',
                vaccination: 0,
                sterilization: 0,
                description: '',
                character: '',
                image_url: '',
                images: null,
                status: 'available',
                rescue_date: null,
                rescue_location: '',
                rescue_story: ''
            },
            formRules: {
                pet_name: [
                    { required: true, message: '请输入动物名称', trigger: 'blur' },
                    { min: 2, max: 50, message: '长度在 2 到 50 个字符之间', trigger: 'blur' }
                ],
                category_id: [
                    { required: true, message: '请选择动物分类', trigger: 'change' }
                ],
                gender: [
                    { required: true, message: '请选择性别', trigger: 'change' }
                ],
                age: [
                    { required: true, message: '请输入年龄', trigger: 'blur' }
                ],
                description: [
                    { required: true, message: '请输入描述', trigger: 'blur' },
                    { min: 10, message: '描述至少需要 10 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        handleImageUpload(response) {
            // 兼容两种返回格式：url 或 file_url
            const imageUrl = response.data?.url || response.data?.file_url
            if (imageUrl) {
                // 添加服务器前缀
                const baseUrl = 'http://localhost:8889'
                this.formData.image_url = imageUrl.startsWith('http') ? imageUrl : baseUrl + imageUrl
                this.$message.success('图片上传成功')
            } else {
                console.error('上传响应中未找到图片URL:', response)
                this.$message.error('上传成功但未获取到图片地址')
            }
        },

        handleImageError(error) {
            console.error('图片上传失败:', error)
            this.$message.error('图片上传失败')
        },

        async submitForm() {
            try {
                await this.$refs.animalForm.validate()
            } catch (error) {
                return
            }

            if (!this.formData.pet_name.trim()) {
                this.$message.error('请输入动物名称')
                return
            }

            this.submitLoading = true
            try {
                const submitData = { ...this.formData }
                if (this.isEdit && this.$route.params.id) {
                    await updatePet(this.$route.params.id, submitData)
                    this.$message.success('动物信息更新成功')
                } else {
                    await createPet(submitData)
                    this.$message.success('动物发布成功')
                }
                this.$router.push({ name: 'animalsList' })
            } catch (error) {
                console.error('提交失败:', error)
                this.$message.error(error?.data?.message || '提交失败')
            } finally {
                this.submitLoading = false
            }
        },

        resetForm() {
            this.$refs.animalForm.resetFields()
            this.imageFileList = []
        },

        async loadCategories() {
            try {
                const response = await getPetCategories()
                this.categories = response.data.data || []
            } catch (error) {
                console.error('加载分类失败:', error)
            }
        },

        async loadAnimalData(id) {
            try {
                const response = await getPetDetail(id)
                if (response.data.data) {
                    this.formData = response.data.data
                }
            } catch (error) {
                console.error('加载动物信息失败:', error)
                this.$message.error('加载动物信息失败')
            }
        }
    },

    async mounted() {
        await this.loadCategories()
        if (this.$route.params.id) {
            this.isEdit = true
            await this.loadAnimalData(this.$route.params.id)
        }
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

.form-section {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    .form-group {
        margin-bottom: 40px;
        padding-bottom: 40px;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }

        .group-title {
            font-size: 16px;
            color: #1f2937;
            font-weight: 600;
            margin: 0 0 24px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid #409eff;
            display: inline-block;
        }
    }

    ::v-deep .el-form-item {
        margin-bottom: 24px;
    }

    ::v-deep .el-input,
    ::v-deep .el-select,
    ::v-deep .el-textarea,
    ::v-deep .el-input-number,
    ::v-deep .el-date-picker {
        width: 100%;
    }

    .upload-tip {
        color: #8b92a9;
        font-size: 12px;
        margin-top: 8px;
        margin-bottom: 0;
    }

    .image-upload-wrapper {
        .image-preview {
            display: inline-block;
            position: relative;
            width: 100px;
            height: 100px;
            border-radius: 4px;
            overflow: hidden;
            background: #f5f7fa;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .el-button {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                top: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            &:hover .el-button {
                opacity: 1;
            }
        }
    }
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;

    .el-button {
        min-width: 120px;
    }
}

@media (max-width: 768px) {
    .animals-form-page {
        padding: 20px;
    }

    .form-section {
        padding: 20px;

        ::v-deep .el-form {
            label-width: 100px;
        }
    }

    .form-actions {
        flex-wrap: wrap;

        .el-button {
            width: 100%;
        }
    }
}
</style>

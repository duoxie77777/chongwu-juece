<template>
    <div class="image-upload-field">
        <div class="upload-area" @click="selectFile" v-if="uploadedImages.length < maxFiles">
            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                multiple
                style="display: none"
                @change="handleFileSelect"
            />
            <div class="upload-placeholder">
                <i class="el-icon-picture"></i>
                <p>点击上传或拖拽图片到此处</p>
                <span class="hint">支持 JPG、PNG 格式，单个文件最大 {{ maxSize }}MB</span>
            </div>
        </div>

        <!-- 已上传图片列表 -->
        <div class="uploaded-images">
            <div 
                v-for="(image, index) in uploadedImages"
                :key="index"
                class="image-item"
            >
                <img :src="image.preview || image.url" :alt="`img-${index}`" />
                <div class="image-actions">
                    <el-button 
                        type="text" 
                        icon="el-icon-delete"
                        @click="removeImage(index)"
                    />
                </div>
                <div v-if="image.uploading" class="upload-progress">
                    <el-progress :percentage="image.progress" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ImageUploadField',
    props: {
        // 最多允许上传多少张
        maxFiles: {
            type: Number,
            default: 5
        },
        // 单个文件最大 MB
        maxSize: {
            type: Number,
            default: 5
        },
        // 初始图片列表
        images: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            uploadedImages: [],
            uploading: false
        }
    },
    watch: {
        images: {
            handler(newVal) {
                this.uploadedImages = newVal.map(img => ({
                    url: img,
                    uploading: false,
                    progress: 0
                }));
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        selectFile() {
            this.$refs.fileInput.click();
        },
        handleFileSelect(event) {
            const files = Array.from(event.target.files);
            
            for (const file of files) {
                // 检查文件大小
                if (file.size > this.maxSize * 1024 * 1024) {
                    this.$message.error(`文件 ${file.name} 超过 ${this.maxSize}MB 限制`);
                    continue;
                }

                // 检查文件类型
                if (!file.type.startsWith('image/')) {
                    this.$message.error(`${file.name} 不是图片文件`);
                    continue;
                }

                // 检查数量限制
                if (this.uploadedImages.length >= this.maxFiles) {
                    this.$message.error(`最多只能上传 ${this.maxFiles} 张图片`);
                    break;
                }

                // 创建预览
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.uploadedImages.push({
                        file: file,
                        preview: e.target.result,
                        uploading: false,
                        progress: 0
                    });
                    this.emitChange();
                };
                reader.readAsDataURL(file);
            }

            // 重置输入框
            event.target.value = '';
        },
        removeImage(index) {
            this.uploadedImages.splice(index, 1);
            this.emitChange();
        },
        emitChange() {
            const images = this.uploadedImages.map(img => ({
                file: img.file,
                preview: img.preview,
                url: img.url
            }));
            this.$emit('change', images);
        },
        // 获取待上传的文件
        getFiles() {
            return this.uploadedImages
                .filter(img => img.file)
                .map(img => img.file);
        },
        // 清空
        clear() {
            this.uploadedImages = [];
            this.$refs.fileInput.value = '';
        }
    }
}
</script>

<style lang="less" scoped>
.image-upload-field {
    .upload-area {
        border: 2px dashed #d8d8d8;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 20px;

        &:hover {
            border-color: #d52b1e;
            background-color: #fafafa;
        }

        .upload-placeholder {
            .el-icon-picture {
                font-size: 48px;
                color: #d52b1e;
                display: block;
                margin-bottom: 15px;
            }

            p {
                font-size: 16px;
                color: #333;
                margin-bottom: 8px;
                font-weight: 500;
            }

            .hint {
                font-size: 12px;
                color: #999;
            }
        }
    }

    .uploaded-images {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 15px;

        .image-item {
            position: relative;
            width: 100%;
            aspect-ratio: 1;
            border-radius: 8px;
            overflow: hidden;
            background: #f0f0f0;
            border: 1px solid #d8d8d8;
            transition: all 0.3s ease;

            &:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

                .image-actions {
                    opacity: 1;
                }
            }

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .image-actions {
                position: absolute;
                top: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.7);
                padding: 8px;
                opacity: 0;
                transition: opacity 0.3s ease;

                .el-button {
                    color: white;
                    font-size: 16px;

                    &:hover {
                        background-color: rgba(255, 0, 0, 0.2);
                    }
                }
            }

            .upload-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 8px;
                background: rgba(0, 0, 0, 0.5);
            }
        }
    }
}
</style>

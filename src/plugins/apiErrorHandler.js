/**
 * API 错误处理插件
 * 统一处理 API 请求错误，特别是未登录错误
 */

export default {
    install(Vue) {
        // 在 Vue 原型上添加错误处理方法
        Vue.prototype.$handleApiError = function(error) {
            // 检查是否为未授权错误
            if (error.code === 'UNAUTHORIZED' || error.status === 401) {
                this.$message.warning(error.message || '请先登录后再进行操作')
                
                // 如果是未登录，可以触发登录对话框
                // 这里可以通过事件总线通知 header 组件显示登录对话框
                this.$root.$emit('show-login-dialog')
                
                // 或者跳转到登录页（如果不需要对话框）
                // this.$router.push('/back/login')
                
                return true // 表示已处理
            }
            
            // 其他错误可以在这里统一处理
            return false // 表示未处理，由调用方自行处理
        }
    }
}



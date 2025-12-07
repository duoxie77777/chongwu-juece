<template>
    <div class="back-layout">
        <!-- 侧边栏 -->
        <sidebar-menu></sidebar-menu>

        <!-- 主内容区 -->
        <div class="main-content">
            <!-- 顶部导航栏 -->
            <top-header></top-header>

            <!-- 页面内容 -->
            <div class="content-wrapper">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
import SidebarMenu from './SidebarMenu.vue'
import TopHeader from './TopHeader.vue'

export default {
    name: 'BackLayout',
    components: {
        SidebarMenu,
        TopHeader
    }
}
</script>

<style lang="less" scoped>
.back-layout {
    display: flex;
    height: 100vh;
    background: #f5f7fa;
    overflow: hidden;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .content-wrapper {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        background: #f5f7fa;
        padding: 20px;

        /* 自定义滚动条 */
        &::-webkit-scrollbar {
            width: 8px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: #d0d0d0;
            border-radius: 4px;

            &:hover {
                background: #b0b0b0;
            }
        }
    }
}

@media (max-width: 768px) {
    .back-layout {
        flex-direction: column;
        height: auto;
    }

    .main-content {
        .content-wrapper {
            padding: 15px;
        }
    }
}
</style>

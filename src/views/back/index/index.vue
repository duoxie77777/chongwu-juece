<template>
    <back-layout>
        <router-view></router-view>
    </back-layout>
</template>

<script>
import BackLayout from '@/components/back/BackLayout.vue'

export default {
    name: 'BackIndex',
    components: {
        BackLayout
    }
}
</script>

<style lang="less" scoped>
</style>

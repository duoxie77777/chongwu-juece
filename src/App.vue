<template>
  <div id="app">
    <!-- 只在非后台页面显示头部和底部 -->
    <header-layout v-if="!$route.path.startsWith('/back')" />
    <router-view></router-view>
    <footer-layout v-if="!$route.path.startsWith('/back')" />
  </div>
</template>

<script>
import headerLayout from '@/components/front/layouts/header.vue'
import footerLayout from '@/components/front/layouts/footer.vue'

export default {
  name: 'App',
  components: {
    headerLayout,
    footerLayout
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
</style>

import Vue from 'vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue'
import Vuex from 'vuex'
import user from './store/user'
import apiErrorHandler from './plugins/apiErrorHandler'

Vue.use(ElementUI)
Vue.use(Vuex)
Vue.use(apiErrorHandler)

const store = new Vuex.Store({
  modules: {
    user
  }
})

new Vue({
  router,
  store,
  el: '#app',
  render: h => h(App)
});

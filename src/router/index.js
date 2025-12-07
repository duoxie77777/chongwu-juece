import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/front/index/index.vue')
    },
    {
        path: '/adoption/list',
        name: 'adoptionList',
        component: () => import('@/views/front/adoption/list.vue')
    },
    {
        path: '/adoption/detail',
        name: 'petDetail',
        component: () => import('@/views/front/adoption/detail.vue')
    },
    {
        path: '/adoption/adopt',
        name: 'adoptPage',
        component: () => import('@/views/front/adoption/adopt.vue')
    },
    {
        path: '/knowledge/care',
        name: 'careKnowledge',
        component: () => import('@/views/front/knowledge/care.vue')
    },
    {
        path: '/help/faq',
        name: 'faqPage',
        component: () => import('@/views/front/help/faq.vue')
    },
    {
        path: '/about/about',
        name: 'aboutPage',
        component: () => import('@/views/front/about/about.vue')
    },
    {
        path: '/help/contact',
        name: 'contactPage',
        component: () => import('@/views/front/help/contact.vue')
    },
    {
        path: '/volunteer/volunteer',
        name: 'volunteerPage',
        component: () => import('@/views/front/volunteer/volunteer.vue')
    },
    {
        path: '/volunteer/apply',
        name: 'applyVolunteer',
        component: () => import('@/views/front/volunteer/apply.vue')
    },
    {
        path: '/donate',
        name: 'donatePage',
        component: () => import('@/views/front/donate/donate.vue')
    },
    {
        path: '/stories/detail/:id',
        name: 'storiesDetail',
        component: () => import('@/views/front/stories/detail.vue')
    },
    {
        path: '/stories/submit',
        name: 'storiesSubmit',
        component: () => import('@/views/front/stories/submit.vue')
    },
    // 商城相关路由
    {
        path: '/mall/shop',
        name: 'shop',
        component: () => import('@/views/front/mall/shop.vue')
    },
    {
        path: '/mall/product-detail',
        name: 'productDetail',
        component: () => import('@/views/front/mall/product-detail.vue')
    },
    {
        path: '/mall/cart',
        name: 'cart',
        component: () => import('@/views/front/mall/cart.vue')
    },
    {
        path: '/mall/checkout',
        name: 'checkout',
        component: () => import('@/views/front/mall/checkout.vue')
    },
    {
        path: '/mall/orders',
        name: 'orders',
        component: () => import('@/views/front/mall/orders.vue')
    },
    // 用户相关路由
    {
        path: '/user/profile',
        name: 'userProfile',
        component: () => import('@/views/front/user/profile.vue')
    },
    {
        path: '/user/orders',
        name: 'userOrders',
        component: () => import('@/views/front/user/orders.vue')
    },

    // back
    {
        path: '/back/login',
        name: 'backLogin',
        component: () => import('@/views/back/login/index.vue')
    },
    {
        path: '/back',
        component: () => import('@/views/back/index/index.vue'),
        children: [
            {
                path: '',
                redirect: 'statistics/overview'
            },
            // 动物管理
            {
                path: 'animals/list',
                name: 'animalsList',
                component: () => import('@/views/back/animals/list.vue')
            },
            {
                path: 'animals/add',
                name: 'animalsAdd',
                component: () => import('@/views/back/animals/form.vue')
            },
            {
                path: 'animals/edit/:id',
                name: 'animalsEdit',
                component: () => import('@/views/back/animals/form.vue')
            },
            {
                path: 'animals/categories',
                name: 'animalsCategories',
                component: () => import('@/views/back/animals/categories.vue')
            },
            // 用户管理
            {
                path: 'users/list',
                name: 'usersList',
                component: () => import('@/views/back/users/list.vue')
            },
            {
                path: 'users/applications',
                name: 'usersApplications',
                component: () => import('@/views/back/users/applications.vue')
            },
            {
                path: 'users/volunteers',
                name: 'usersVolunteers',
                component: () => import('@/views/back/users/volunteers.vue')
            },
            // 内容管理
            {
                path: 'content/stories',
                name: 'contentStories',
                component: () => import('@/views/back/content/stories.vue')
            },

            {
                path: 'content/faq',
                name: 'contentFaq',
                component: () => import('@/views/back/content/faq.vue')
            },
            {
                path: 'content/comments',
                name: 'contentComments',
                component: () => import('@/views/back/content/comments.vue')
            },
            // 商城管理
            {
                path: 'mall/categories',
                name: 'mallCategories',
                component: () => import('@/views/back/mall/categories.vue')
            },
            {
                path: 'mall/products',
                name: 'mallProducts',
                component: () => import('@/views/back/mall/products.vue')
            },
            {
                path: 'mall/orders',
                name: 'mallOrders',
                component: () => import('@/views/back/mall/orders.vue')
            },
            {
                path: 'mall/comments',
                name: 'mallComments',
                component: () => import('@/views/back/mall/comments.vue')
            },
            // 数据统计
            {
                path: 'statistics/overview',
                name: 'statisticsOverview',
                component: () => import('@/views/back/statistics/overview.vue')
            },
            {
                path: 'statistics/reports',
                name: 'statisticsReports',
                component: () => import('@/views/back/statistics/reports.vue')
            },
            // 账号设置
            {
                path: 'settings',
                name: 'accountSettings',
                component: () => import('@/views/back/system/settings.vue')
            }
        ]
    }
]

const router = new VueRouter({
    mode: 'history',
    routes,
    // 页面切换时自动滚动到顶部
    scrollBehavior(to, from, savedPosition) {
        // 如果有保存的位置（比如浏览器前进后退），则使用保存的位置
        if (savedPosition) {
            return savedPosition;
        }
        // 否则滚动到顶部
        return { x: 0, y: 0 };
    }
})

// 路由守卫：检查后台系统访问权限
router.beforeEach((to, from, next) => {
    // 检查是否是后台路由
    if (to.path.startsWith('/back')) {
        // 排除登录页面
        if (to.path === '/back/login') {
            next()
            return
        }

        // 检查是否已登录
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        if (!token || !userStr) {
            // 未登录，跳转到后台登录页
            next({
                path: '/back/login',
                replace: true
            })
            return
        }

        try {
            const user = JSON.parse(userStr)
            // 检查用户角色，只有 admin 和 volunteer 可以访问后台
            if (user.role !== 'admin' && user.role !== 'volunteer') {
                // 角色不正确，如果是从前台页面访问，跳转到首页；否则跳转到登录页
                if (from.path && !from.path.startsWith('/back')) {
                    // 从前台页面访问，跳转到首页
                    next({
                        path: '/',
                        replace: true
                    })
                } else {
                    // 从后台页面访问，跳转到登录页
                    next({
                        path: '/back/login',
                        replace: true
                    })
                }
                return
            }
        } catch (e) {
            console.error('解析用户信息失败:', e)
            // 解析失败，跳转到登录页
            next({
                path: '/back/login',
                replace: true
            })
            return
        }
    }

    next()
})

export default router
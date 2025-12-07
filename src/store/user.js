// src/store/modules/user.js
const state = {
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('token')
}

const mutations = {
    SET_TOKEN(state, token) {
        state.token = token
        localStorage.setItem('token', token)
    },

    SET_USER_INFO(state, userInfo) {
        state.userInfo = userInfo
        localStorage.setItem('user', JSON.stringify(userInfo))
    },

    SET_AUTHENTICATED(state, status) {
        state.isAuthenticated = status
    },

    LOGOUT(state) {
        state.token = ''
        state.userInfo = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }
}

const actions = {
    setToken({ commit }, token) {
        commit('SET_TOKEN', token)
    },

    setUserInfo({ commit }, userInfo) {
        commit('SET_USER_INFO', userInfo)
    },

    setAuthenticated({ commit }, status) {
        commit('SET_AUTHENTICATED', status)
    },

    logout({ commit }) {
        commit('LOGOUT')
    }
}

const getters = {
    token: state => state.token,
    userInfo: state => state.userInfo,
    isAuthenticated: state => state.isAuthenticated,
    userName: state => state.userInfo ? state.userInfo.username : ''
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
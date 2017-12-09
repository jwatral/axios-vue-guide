import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios-auth'
import globalAxios from 'axios'
import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        idToken: null,
        userId: null,
        user: null
    },
    mutations: {
        authUser(state, userData) {
            state.idToken = userData.idToken;
            state.userId = userData.userId;
        },
        storeUser(state, user) {
            state.user = user
        },
        clearUserData(state) {
            state.idToken = null;
            state.userId = null;
        }
    },
    actions: {
        setLogoutTimer({commit, dispatch}, expirationTime) {
            setTimeout(() => {
                dispatch('logout');
            }, expirationTime * 1000)
        },
        signup({commit, dispatch}, authData) {
            axios.post('/signupNewUser?key=AIzaSyCrrQEF7LGxmjTJwbEcgKO28xn56R5H1ec', {
                email: authData.email,
                password: authData.password,
                returnSecureToken: true
            })
                .then(res => {
                    console.log(res);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000);
                    localStorage.setItem('token', res.data.idToken);
                    localStorage.setItem('userId', res.data.localId);
                    localStorage.setItem('expirationDate', expirationDate);
                    commit('authUser', {
                        idToken: res.data.idToken,
                        userId: res.data.localId
                    });
                    dispatch('storeUser', authData);
                    dispatch('setLogoutTimer', res.data.expiresIn)
                })
                .catch(error => console.log(error))
        },
        login({commit, dispatch}, authData) {
            axios.post('/verifyPassword?key=AIzaSyCrrQEF7LGxmjTJwbEcgKO28xn56R5H1ec', {
                email: authData.email,
                password: authData.password,
                returnSecureToken: true
            })
                .then(res => {
                    console.log(res);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000);
                    localStorage.setItem('token', res.data.idToken);
                    localStorage.setItem('userId', res.data.localId);
                    localStorage.setItem('expirationDate', expirationDate);
                    commit('authUser', {
                        idToken: res.data.idToken,
                        userId: res.data.localId
                    })
                    dispatch('setLogoutTimer', res.data.expiresIn)
                })
                .catch(error => console.log(error))
        },
        tryAutologin({commit}) {
            const token = localStorage.getItem('token');
            if(!token) {
                return
            }
            const expirationDate = localStorage.getItem('expirationDate');
            if(new Date() >= expirationDate) {
                return
            }
            const userId = localStorage.getItem('userId');
            commit('authUser', {
                token: token,
                userId: userId
            })
        },
        logout({commit}) {
            commit('clearUserData');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('expirationDate');
            router.replace('/signin');
        },
        storeUser({commit, state}, userData) {
            if (!state.idToken) {
                return
            }
            globalAxios.post('/users.json?auth=' + state.idToken, userData)
                .then(res => console.log(res))
                .catch(err => console.log(err))
        },
        fetchUser({commit, state}) {
            if (!state.idToken) {
                return
            }
            globalAxios.get('/users.json?auth=' + state.idToken)
                .then(res => {
                    console.log(res);
                    const data = res.data;
                    const users = [];
                    for (let key in data) {
                        const user = data[key];
                        user.id = key;
                        users.push(user)
                    }
                    console.log(users)
                    commit('storeUser', users[0])
                })
                .catch(error => console.log(error))
        }
    },
    getters: {
        user(state) {
            return state.user;
        },
        isAuthenticated(state) {
            return state.idToken !== null;
        }
    }
});
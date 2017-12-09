import Vue from 'vue'
import App from './App.vue'
import Vuelidate from 'vuelidate'

import router from './router'
import store from './store'
import axios from 'axios'

Vue.use(Vuelidate);

axios.defaults.baseURL = 'https://vuejs-http-c40e2.firebaseio.com';
// axios.defaults.headers.common['Authorization'] = 'fsafsafdsfsa';
axios.defaults.headers.get['Accepts'] = 'application/json';

const reqInterceptor = axios.interceptors.request.use(config => {
    console.log('Request interceptor', config);
    return config;
});

const resInterceptor = axios.interceptors.response.use(res => {
    console.log('Response interceptor', res);
    return res;
});

axios.interceptors.request.eject(reqInterceptor);
axios.interceptors.response.eject(resInterceptor);

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});

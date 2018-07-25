import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import Vuetify from 'vuetify'


if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.use(Vuetify)
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

// index.js or main.js
import 'vuetify/dist/vuetify.min.css' 

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

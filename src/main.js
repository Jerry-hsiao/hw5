import Vue from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import VueAxios from 'vue-axios';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import jQuery from 'jquery';
import VeeValidate from 'vee-validate';
import zhTW from 'vee-validate/dist/locale/zh_TW';
import VueI18n from 'vue-i18n';

window.$ = window.jQuery = jQuery;

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(VueI18n);
const i18n = new VueI18n({
  locale: 'zhTW',
});

Vue.use(VeeValidate, {
  events: 'input|blur',
  i18n,
  dictionary: {
    zhTW,
  },
});

new Vue({
  i18n,
  router,
  render: h => h(App)
}).$mount('#app');

/* eslint-disable */
import Vue from 'vue';
import App from './App.vue';
import router from './router';
require('@/plugins/element-ui');
require('@/plugins/clipboard');
require('@/plugins/base64');
require('@/plugins/particles');
require('@/plugins/axios');
require('@/plugins/device');
import '@/icons';
import './registerServiceWorker';

Vue.config.productionTip = false;

// === 加载配置文件 ===
window.configUrl = `${window.location.origin}/config/config.json`;

fetch(window.configUrl)
  .then(res => res.json())
  .then(conf => {
    console.log("✅ Loaded config:", conf);
    window.appConfig = conf;

    // 等配置加载完成后再启动 Vue
    new Vue({
      router,
      render: h => h(App)
    }).$mount('#app');
  })
  .catch(err => {
    console.error("❌ Failed to load config:", err);

    // 即使加载失败也启动 Vue（但会使用默认空配置）
    window.appConfig = {};
    new Vue({
      router,
      render: h => h(App)
    }).$mount('#app');
  });

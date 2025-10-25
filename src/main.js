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
    console.log('✅ Loaded config:', conf);
    window.appConfig = conf;

    // 若存在 defaultBackend，则写入 localStorage（供前端界面使用）
    if (conf.defaultBackend) {
      localStorage.setItem('backend', conf.defaultBackend);
      console.log('💾 Default backend set to:', conf.defaultBackend);
    }

    // 启动 Vue
    new Vue({
      router,
      render: h => h(App)
    }).$mount('#app');
  })
  .catch(err => {
    console.error('❌ Failed to load config:', err);

    // fallback：默认使用本地存储或空配置启动
    window.appConfig = {};
    new Vue({
      router,
      render: h => h(App)
    }).$mount('#app');
  });

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

// === 动态加载 config.json ===
async function loadConfig() {
  try {
    const configUrl = `${window.location.origin}/config/config.json`;
    const res = await fetch(configUrl);
    const conf = await res.json();

    console.log('✅ Loaded config:', conf);
    window.appConfig = conf;

    // 将 defaultBackend 写入 localStorage
    if (conf.defaultBackend) {
      localStorage.setItem('backend', conf.defaultBackend);
      console.log('💾 defaultBackend set to:', conf.defaultBackend);
    }

    // 同步其他字段（如果存在）
    if (conf.defaultTarget) localStorage.setItem('target', conf.defaultTarget);
    if (conf.lang) localStorage.setItem('lang', conf.lang);

    // 启动 Vue 实例
    new Vue({
      router,
      render: h => h(App),
    }).$mount('#app');
  } catch (err) {
    console.error('❌ Failed to load config:', err);
    // fallback 启动
    window.appConfig = {};
    new Vue({
      router,
      render: h => h(App),
    }).$mount('#app');
  }
}

loadConfig();

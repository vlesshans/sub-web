// --- 读取配置文件 ---
window.configUrl = `${window.location.origin}/config/config.json`;

async function initApp() {
  try {
    const res = await fetch(window.configUrl);
    const conf = await res.json();
    console.log("✅ Loaded config:", conf);
    window.appConfig = conf;
  } catch (err) {
    console.error("❌ Failed to load config:", err);
    window.appConfig = {}; // 保底，避免未定义
  }

  // --- 加载 Vue ---
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

  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app');
}

initApp();

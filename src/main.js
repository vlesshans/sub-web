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

async function initApp() {
  const configUrl = `${window.location.origin}/config/config.json`;

  try {
    const res = await fetch(configUrl);
    const conf = await res.json();

    console.log('✅ Loaded config:', conf);
    window.appConfig = conf;

    // --- 强制注入 defaultBackend 到全局变量 ---
    if (conf.defaultBackend) {
      localStorage.setItem('backend', conf.defaultBackend);
      console.log('💾 defaultBackend set to:', conf.defaultBackend);

      // 模拟用户输入效果，确保表单可见
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="后端服务地址"]');
        if (input) {
          input.value = conf.defaultBackend;
          input.dispatchEvent(new Event('input'));
          console.log('🎯 Injected backend into input:', conf.defaultBackend);
        }
      }, 1000);
    }

    // 启动 Vue
    new Vue({
      router,
      render: h => h(App),
    }).$mount('#app');
  } catch (err) {
    console.error('❌ Failed to load config:', err);
    window.appConfig = {};
    new Vue({
      router,
      render: h => h(App),
    }).$mount('#app');
  }
}

initApp();

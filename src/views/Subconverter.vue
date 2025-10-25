/* eslint-disable */
<template>
  <div class="container">
    <div class="header">
      <h1>Subscription Converter</h1>
      <span class="version">v0.9.0</span>
    </div>

    <div v-if="!configLoaded" class="loading">正在加载配置文件...</div>

    <div v-else class="content">
      <!-- 模式切换 -->
      <div class="form-group">
        <label>模式设置：</label>
        <label><input type="radio" v-model="advancedMode" :value="false" /> 基础模式</label>
        <label><input type="radio" v-model="advancedMode" :value="true" /> 进阶模式</label>
      </div>

      <!-- 订阅链接 -->
      <div class="form-group">
        <label>订阅链接：</label>
        <textarea
          v-model="form.sourceSubUrl"
          placeholder="支持单个或多个订阅链接，多个请用 | 分隔"
          rows="3"
          class="input-box"
        ></textarea>
      </div>

      <!-- 客户端 -->
      <div class="form-group">
        <label>生成类型：</label>
        <select v-model="form.target" class="input-box">
          <option value="clash">Clash</option>
          <option value="singbox">Sing-box</option>
          <option value="v2ray">V2Ray</option>
          <option value="surfboard">Surfboard</option>
          <option value="loon">Loon</option>
          <option value="stash">Stash</option>
        </select>
      </div>

      <!-- 后端地址 -->
      <div class="form-group">
        <label>后端地址：</label>
        <input
          v-model="form.backend"
          placeholder="例如：https://subconv.889909.xyz/sub?"
          class="input-box"
        />
      </div>

      <!-- 远程配置 -->
      <div v-if="advancedMode && config.remoteConfig" class="form-group">
        <label>远程配置：</label>
        <select v-model="form.remoteConfig" class="input-box">
          <option value="">请选择</option>
          <optgroup
            v-for="group in config.remoteConfig"
            :label="group.label"
            :key="group.label"
          >
            <option
              v-for="item in group.options"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </optgroup>
        </select>
      </div>

      <!-- Include / Exclude -->
      <div v-if="advancedMode" class="form-group">
        <label>Include：</label>
        <input
          v-model="form.include"
          placeholder="节点包含关键字 (支持正则)"
          class="input-box"
        />
      </div>
      <div v-if="advancedMode" class="form-group">
        <label>Exclude：</label>
        <input
          v-model="form.exclude"
          placeholder="节点排除关键字 (支持正则)"
          class="input-box"
        />
      </div>

      <!-- FileName -->
      <div v-if="advancedMode" class="form-group">
        <label>FileName：</label>
        <input
          v-model="form.fileName"
          placeholder="返回的订阅文件名"
          class="input-box"
        />
      </div>

      <!-- Node List -->
      <div v-if="advancedMode" class="form-group checkbox-group">
        <label>
          <input type="checkbox" v-model="form.nodeList" />
          输出为 Node List
        </label>
      </div>

      <!-- 操作按钮 -->
      <div class="buttons">
        <button @click="generateSubLink" class="btn main">生成订阅链接</button>
        <button @click="generateShortLink" class="btn secondary">生成短链</button>
      </div>

      <!-- 输出 -->
      <div v-if="generatedUrl" class="result">
        <label>生成结果：</label>
        <textarea readonly v-model="generatedUrl" class="output-box"></textarea>
        <button @click="copyText(generatedUrl)" class="btn copy">复制</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Subconverter",
  data() {
    return {
      config: {},
      configLoaded: false,
      advancedMode: true,
      form: {
        sourceSubUrl: "",
        backend: "",
        target: "clash",
        remoteConfig: "",
        include: "",
        exclude: "",
        fileName: "",
        nodeList: false
      },
      generatedUrl: ""
    };
  },
  mounted() {
    this.loadConfig();
  },
  methods: {
    async loadConfig() {
      try {
        const res = await fetch("/config/config.json?t=" + Date.now());
        const json = await res.json();
        this.config = json;
        this.form.backend = json.defaultBackend || "";
        this.configLoaded = true;
      } catch {
        this.configLoaded = true;
      }
    },
    generateSubLink() {
      if (!this.form.sourceSubUrl.trim()) {
        alert("请输入订阅链接！");
        return;
      }

      let url = this.form.backend || this.config.defaultBackend;
      if (!url.endsWith("/sub?")) url += "/sub?";

      const params = new URLSearchParams();
      params.set("target", this.form.target);
      params.set("url", this.form.sourceSubUrl.trim());
      if (this.form.remoteConfig) params.set("config", this.form.remoteConfig);
      if (this.form.include) params.set("include", this.form.include);
      if (this.form.exclude) params.set("exclude", this.form.exclude);
      if (this.form.fileName) params.set("filename", this.form.fileName);
      if (this.form.nodeList) params.set("list", "true");

      this.generatedUrl = url + params.toString();
    },
    generateShortLink() {
      if (!this.generatedUrl) return alert("请先生成订阅链接！");
      alert("短链功能未配置，请在 config.json 中设置 shortUrlBackend。");
    },
    copyText(text) {
      navigator.clipboard.writeText(text);
      alert("复制成功！");
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 50px auto;
  padding: 40px 50px;
  background: #f9fafc;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 1px solid #eaecef;
}

h1 {
  color: #4b9eea;
  font-weight: 700;
  text-align: left;
  margin-bottom: 30px;
}

.version {
  float: right;
  color: #999;
  font-size: 14px;
  margin-top: -36px;
}

.form-group {
  margin-bottom: 18px;
}

label {
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 6px;
}

textarea,
select,
input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 12px;
  outline: none;
  font-size: 14px;
  background: #fff;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

textarea:focus,
input:focus,
select:focus {
  border-color: #4b9eea;
  box-shadow: 0 0 0 2px rgba(75,158,234,0.2);
}

.checkbox-group {
  margin-top: 10px;
}

.buttons {
  display: flex;
  gap: 16px;
  margin-top: 25px;
}

.btn {
  flex: 1;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: 0.2s;
}

.btn.main {
  background: #4b9eea;
  color: #fff;
}

.btn.main:hover {
  background: #3181d4;
}

.btn.secondary {
  background: #ffca28;
  color: #333;
}

.btn.secondary:hover {
  background: #f5b400;
}

.btn.copy {
  background: #2ecc71;
  color: #fff;
  margin-top: 10px;
}

.output-box {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  border: 1px solid #ddd;
  padding: 10px;
  font-size: 14px;
  resize: none;
  background: #fff;
}

.loading {
  text-align: center;
  color: #888;
}
</style>

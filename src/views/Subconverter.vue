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
      <div v-if="advancedMode" class="form-group">
        <label>远程配置：</label>
        <select v-model="form.remoteConfig" class="input-box">
          <option value="">请选择</option>
          <option
            v-for="group in config.remoteConfig"
            v-for="item in group.options"
            :key="item.value"
            :value="item.value"
          >
            {{ group.label }} - {{ item.label }}
          </option>
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
      alert("短链功能未配置，请先在 config.json 中设置 shortUrlBackend。");
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
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 0 15px #0001;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.version {
  color: #999;
  font-size: 14px;
}
h1 {
  color: #4b9eea;
  font-weight: 700;
}
.form-group {
  margin-bottom: 16px;
}
label {
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 6px;
}
.input-box,
textarea,
select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
}
.input-box:focus {
  border-color: #4b9eea;
}
.checkbox-group {
  margin-top: 10px;
}
.buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.btn.main {
  background: #4b9eea;
  color: #fff;
}
.btn.secondary {
  background: #f6b93b;
  color: #fff;
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
}
.loading {
  text-align: center;
  color: #999;
}
</style>

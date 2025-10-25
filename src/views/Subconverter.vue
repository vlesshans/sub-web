/* eslint-disable */
<template>
  <div id="app" class="main">
    <div class="container">
      <h1 class="title">Subscription Converter <span class="version">v0.9.0</span></h1>

      <div class="form">
        <div class="form-item">
          <label>模式设置：</label>
          <input type="radio" v-model="advancedMode" :value="false" /> 基础模式
          <input type="radio" v-model="advancedMode" :value="true" /> 进阶模式
        </div>

        <div class="form-item">
          <label>订阅链接：</label>
          <textarea
            v-model="form.sourceSubUrl"
            placeholder="支持单个或多个订阅链接，多个请用 | 分隔"
            rows="3"
          ></textarea>
        </div>

        <div class="form-item">
          <label>客户端：</label>
          <select v-model="form.target">
            <option value="clash">Clash</option>
            <option value="singbox">Sing-box</option>
            <option value="v2ray">V2Ray</option>
            <option value="surfboard">Surfboard</option>
            <option value="stash">Stash</option>
          </select>
        </div>

        <div class="form-item">
          <label>后端地址：</label>
          <input v-model="form.backend" placeholder="例如：https://subconv.889909.xyz/sub?" />
        </div>

        <div v-if="advancedMode" class="form-item">
          <label>远程配置：</label>
          <select v-model="form.remoteConfig">
            <option value="">请选择</option>
            <optgroup v-for="group in config.remoteConfig" :label="group.label" :key="group.label">
              <option v-for="item in group.options" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </optgroup>
          </select>
        </div>

        <div v-if="advancedMode" class="form-item">
          <label>Include：</label>
          <input v-model="form.include" placeholder="节点包含关键字 (支持正则)" />
        </div>

        <div v-if="advancedMode" class="form-item">
          <label>Exclude：</label>
          <input v-model="form.exclude" placeholder="节点排除关键字 (支持正则)" />
        </div>

        <div v-if="advancedMode" class="form-item">
          <label>FileName：</label>
          <input v-model="form.fileName" placeholder="返回的订阅文件名" />
        </div>

        <div v-if="advancedMode" class="form-item checkbox">
          <label><input type="checkbox" v-model="form.nodeList" /> 输出为 Node List</label>
        </div>

        <div class="buttons">
          <button class="btn btn-generate" @click="generateSubLink">生成订阅链接</button>
          <button class="btn btn-short" @click="generateShortLink">生成短链</button>
        </div>

        <div v-if="generatedUrl" class="output">
          <label>生成结果：</label>
          <textarea readonly v-model="generatedUrl"></textarea>
          <button class="btn btn-copy" @click="copyText(generatedUrl)">复制</button>
        </div>
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
      advancedMode: true,
      form: {
        sourceSubUrl: "",
        backend: "",
        target: "clash",
        remoteConfig: "",
        include: "",
        exclude: "",
        fileName: "",
        nodeList: false,
      },
      generatedUrl: "",
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
      } catch (e) {
        console.warn("加载配置失败：", e);
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
    },
  },
};
</script>

<style scoped>
.main {
  background: #f5f6fa;
  min-height: 100vh;
  padding: 40px 0;
}

.container {
  background: #fff;
  max-width: 900px;
  margin: auto;
  padding: 30px 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.title {
  color: #4b9eea;
  font-weight: 700;
  margin-bottom: 25px;
}

.version {
  float: right;
  color: #999;
  font-size: 14px;
}

.form-item {
  margin-bottom: 15px;
}

.form-item label {
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 6px;
}

textarea,
select,
input {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  background: #fff;
}

textarea:focus,
input:focus,
select:focus {
  border-color: #4b9eea;
  outline: none;
}

.checkbox {
  margin-top: 8px;
}

.buttons {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-generate {
  background: #ff7675;
  color: #fff;
}

.btn-short {
  background: #f6b93b;
  color: #fff;
}

.btn-copy {
  background: #2ecc71;
  color: #fff;
  margin-top: 10px;
}

.btn:hover {
  opacity: 0.85;
}

.output textarea {
  width: 100%;
  height: 80px;
  margin-top: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  resize: none;
}
</style>

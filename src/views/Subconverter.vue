<template>
  <div id="app" class="container">
    <h1>Subscription Converter</h1>

    <div v-if="!configLoaded" class="loading">正在加载配置文件...</div>

    <div v-else>
      <!-- 源订阅地址 -->
      <div class="form-group">
        <label>订阅链接：</label>
        <input
          v-model="form.sourceSubUrl"
          placeholder="输入订阅地址或粘贴订阅内容"
          class="input-box"
        />
      </div>

      <!-- 后端地址 -->
      <div class="form-group">
        <label>转换后端：</label>
        <input
          v-model="form.backend"
          placeholder="默认后端"
          class="input-box"
        />
      </div>

      <!-- 转换目标 -->
      <div class="form-group">
        <label>目标类型：</label>
        <select v-model="form.target">
          <option value="clash">Clash</option>
          <option value="singbox">Sing-box</option>
          <option value="v2ray">V2Ray</option>
          <option value="surfboard">Surfboard</option>
        </select>
      </div>

      <!-- 高级设置 -->
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="form.advanced" />
          显示高级选项
        </label>
      </div>

      <div v-if="form.advanced" class="advanced-section">
        <div class="form-group">
          <label>Include：</label>
          <input v-model="form.include" placeholder="节点过滤 Include" class="input-box" />
        </div>
        <div class="form-group">
          <label>Exclude：</label>
          <input v-model="form.exclude" placeholder="节点过滤 Exclude" class="input-box" />
        </div>
      </div>

      <!-- 转换按钮 -->
      <div class="form-group">
        <button @click="generateLink" class="btn">生成链接</button>
      </div>

      <!-- 输出 -->
      <div v-if="generatedUrl" class="result">
        <label>生成的订阅链接：</label>
        <textarea readonly class="output-box">{{ generatedUrl }}</textarea>
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
      form: {
        sourceSubUrl: "",
        backend: "",
        target: "",
        include: "",
        exclude: "",
        advanced: false
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
        const response = await fetch("/config/config.json?t=" + Date.now());
        const json = await response.json();
        this.config = json;

        // 容错设置：防止缺字段时报错
        this.form.backend = json.defaultBackend || "";
        this.form.target = json.defaultTarget || "clash";
        this.form.include = json.defaultInclude || "";
        this.form.exclude = json.defaultExclude || "";
        this.form.sourceSubUrl = "";

        this.configLoaded = true;
        console.log("✅ Loaded config:", json);
      } catch (err) {
        console.error("❌ 加载配置文件失败：", err);
        this.configLoaded = true;
      }
    },

    generateLink() {
      if (!this.form.sourceSubUrl.trim()) {
        alert("请先输入订阅链接！");
        return;
      }

      let backend = this.form.backend || this.config.defaultBackend;
      if (!backend) {
        alert("后端地址未配置！");
        return;
      }

      let url = backend;
      if (!url.endsWith("/sub?")) url += "/sub?";

      const params = new URLSearchParams();
      params.set("target", this.form.target || "clash");
      params.set("url", this.form.sourceSubUrl.trim());

      if (this.form.include) params.set("include", this.form.include);
      if (this.form.exclude) params.set("exclude", this.form.exclude);

      this.generatedUrl = url + params.toString();
      console.log("✅ Generated:", this.generatedUrl);
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 680px;
  margin: 50px auto;
  padding: 20px;
  text-align: left;
  background: #ffffff10;
  border-radius: 16px;
  box-shadow: 0 0 10px #0002;
}
h1 {
  text-align: center;
  color: #4b9eea;
  margin-bottom: 30px;
}
.form-group {
  margin-bottom: 16px;
}
label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}
.input-box,
textarea,
select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
}
.input-box:focus {
  border-color: #4b9eea;
}
.btn {
  background: #4b9eea;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}
.btn:hover {
  background: #1d73d6;
}
.result {
  margin-top: 20px;
}
.output-box {
  width: 100%;
  height: 80px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #ddd;
  padding: 10px;
}
.loading {
  text-align: center;
  color: #888;
  font-size: 14px;
}
.advanced-section {
  border-top: 1px solid #ccc;
  padding-top: 10px;
}
</style>

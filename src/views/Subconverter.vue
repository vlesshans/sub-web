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
        <el-radio-group v-model="advancedMode">
          <el-radio :label="false">基础模式</el-radio>
          <el-radio :label="true">进阶模式</el-radio>
        </el-radio-group>
      </div>

      <!-- 订阅链接 -->
      <div class="form-group">
        <label>订阅链接：</label>
        <el-input
          type="textarea"
          v-model="form.sourceSubUrl"
          :rows="3"
          placeholder="支持单个或多个订阅链接，多个用 | 分隔"
          @input="detectBase64"
        ></el-input>
      </div>

      <!-- 客户端 -->
      <div class="form-group">
        <label>客户端：</label>
        <el-select v-model="form.target" placeholder="请选择客户端">
          <el-option label="Clash" value="clash"></el-option>
          <el-option label="Sing-box" value="singbox"></el-option>
          <el-option label="V2Ray" value="v2ray"></el-option>
          <el-option label="Surfboard" value="surfboard"></el-option>
          <el-option label="Loon" value="loon"></el-option>
          <el-option label="Stash" value="stash"></el-option>
        </el-select>
      </div>

      <!-- 后端地址 -->
      <div class="form-group">
        <label>后端地址：</label>
        <el-input v-model="form.backend" placeholder="例如：https://subconv.889909.xyz/sub?"></el-input>
      </div>

      <!-- 远程配置 -->
      <div v-if="advancedMode && config.remoteConfig" class="form-group">
        <label>远程配置：</label>
        <el-select v-model="form.remoteConfig" placeholder="请选择">
          <el-option
            v-for="item in config.remoteConfig"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>

      <!-- Include / Exclude -->
      <div v-if="advancedMode" class="form-group">
        <label>Include：</label>
        <el-input
          v-model="form.include"
          placeholder="节点包含关键字 (支持正则)"
        ></el-input>
      </div>
      <div v-if="advancedMode" class="form-group">
        <label>Exclude：</label>
        <el-input
          v-model="form.exclude"
          placeholder="节点排除关键字 (支持正则)"
        ></el-input>
      </div>

      <!-- FileName -->
      <div v-if="advancedMode" class="form-group">
        <label>FileName：</label>
        <el-input v-model="form.fileName" placeholder="返回的订阅文件名"></el-input>
      </div>

      <!-- Node List -->
      <div v-if="advancedMode" class="form-group checkbox-group">
        <el-checkbox v-model="form.nodeList">输出为 Node List</el-checkbox>
      </div>

      <!-- 操作按钮 -->
      <div class="buttons">
        <el-button type="primary" @click="generateSubLink">生成订阅链接</el-button>
        <el-button type="warning" @click="generateShortLink">生成短链</el-button>
        <el-button type="info" @click="resetForm">清空</el-button>
      </div>

      <!-- 输出 -->
      <div v-if="generatedUrl" class="result">
        <label>生成结果：</label>
        <el-input type="textarea" v-model="generatedUrl" readonly></el-input>
        <div class="copy-buttons">
          <el-button type="success" @click="copyText(generatedUrl)">复制链接</el-button>
          <el-button type="danger" @click="downloadConfig('clash')">下载 Clash 配置</el-button>
          <el-button type="danger" @click="downloadConfig('singbox')">下载 Sing-box 配置</el-button>
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
        this.form.backend =
          localStorage.getItem("backend") || json.defaultBackend || "";
        this.form.remoteConfig =
          localStorage.getItem("remoteConfig") ||
          (json.remoteConfig?.[0]?.value || "");
        this.configLoaded = true;
      } catch (e) {
        console.error("❌ 配置加载失败:", e);
        this.configLoaded = true;
      }
    },

    detectBase64() {
      const text = this.form.sourceSubUrl.trim();
      const base64Pattern = /^[A-Za-z0-9+/=]+$/;
      if (text && base64Pattern.test(text) && text.length > 50) {
        try {
          const decoded = atob(text);
          if (decoded.includes("://")) {
            this.form.sourceSubUrl = decoded;
            this.$message.success("检测到 Base64，已自动解码");
          }
        } catch {
          // ignore
        }
      }
    },

    resetForm() {
      this.form = {
        sourceSubUrl: "",
        backend: this.config.defaultBackend || "",
        target: "clash",
        remoteConfig:
          this.config.remoteConfig?.[0]?.value || "",
        include: "",
        exclude: "",
        fileName: "",
        nodeList: false
      };
      this.generatedUrl = "";
      this.$message.info("已重置表单");
    },

    generateSubLink() {
      if (!this.form.sourceSubUrl.trim()) {
        return this.$message.error("请输入订阅链接！");
      }
      let url = this.form.backend || this.config.defaultBackend;
      if (!url.endsWith("/sub?")) url += "/sub?";

      const params = new URLSearchParams();
      params.set("target", this.form.target);
      params.set("url", this.form.sourceSubUrl.trim());
      if (this.form.remoteConfig)
        params.set("config", this.form.remoteConfig);
      if (this.form.include)
        params.set("include", this.form.include);
      if (this.form.exclude)
        params.set("exclude", this.form.exclude);
      if (this.form.fileName)
        params.set("filename", this.form.fileName);
      if (this.form.nodeList) params.set("list", "true");

      this.generatedUrl = url + params.toString();

      // 保存状态
      localStorage.setItem("backend", this.form.backend);
      localStorage.setItem("remoteConfig", this.form.remoteConfig);

      this.$message.success("订阅链接生成成功！");
    },

    async generateShortLink() {
      if (!this.generatedUrl)
        return this.$message.warning("请先生成订阅链接！");
      const backend = this.config.shortUrlBackend;
      if (!backend) {
        return this.$message.warning(
          "未配置 shortUrlBackend，请在 config.json 设置"
        );
      }
      try {
        const res = await fetch(
          `${backend}?url=${encodeURIComponent(this.generatedUrl)}`
        );
        const data = await res.text();
        this.generatedUrl = data;
        this.$message.success("短链生成成功！");
      } catch {
        this.$message.error("短链生成失败！");
      }
    },

    copyText(text) {
      navigator.clipboard.writeText(text);
      this.$message.success("复制成功！");
    },

    downloadConfig(type) {
      if (!this.form.sourceSubUrl.trim()) {
        return this.$message.warning("请先填写订阅链接！");
      }
      let url = this.form.backend || this.config.defaultBackend;
      if (!url.endsWith("/sub?")) url += "/sub?";
      const params = new URLSearchParams();
      params.set("target", type);
      params.set("url", this.form.sourceSubUrl.trim());
      window.open(url + params.toString(), "_blank");
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
.copy-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.loading {
  text-align: center;
  color: #999;
}
</style>

/* eslint-disable */
<template>
  <div class="app-container">
    <div class="converter-box">
      <h2 class="title">Subscription Converter <small>v0.9.0</small></h2>

      <!-- 模式切换 -->
      <el-form label-width="100px" size="medium">
        <el-form-item label="模式设置：">
          <el-radio-group v-model="mode">
            <el-radio :label="false">基础模式</el-radio>
            <el-radio :label="true">进阶模式</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 订阅链接 -->
        <el-form-item label="订阅链接：">
          <el-input
            type="textarea"
            :rows="3"
            v-model="form.sourceSubUrl"
            placeholder="支持单个或多个订阅链接，多个用 | 分隔"
          />
        </el-form-item>

        <!-- 客户端 -->
        <el-form-item label="客户端：">
          <el-select v-model="form.target" placeholder="请选择">
            <el-option label="Clash" value="clash" />
            <el-option label="Sing-box" value="singbox" />
            <el-option label="V2Ray" value="v2ray" />
            <el-option label="Surfboard" value="surfboard" />
            <el-option label="Loon" value="loon" />
            <el-option label="Stash" value="stash" />
          </el-select>
        </el-form-item>

        <!-- 后端地址 -->
        <el-form-item label="后端地址：">
          <el-input v-model="form.backend" placeholder="自动填充，或手动输入后端服务地址" />
        </el-form-item>

        <!-- 远程配置 -->
        <el-form-item v-if="mode" label="远程配置：">
          <el-select v-model="form.remoteConfig" placeholder="请选择">
            <el-option value="" label="默认配置" />
            <el-option
              v-for="group in config.remoteConfig"
              :key="group.label"
              :label="group.label"
              :value="group.value"
            />
          </el-select>
        </el-form-item>

        <!-- Include / Exclude -->
        <el-form-item v-if="mode" label="Include：">
          <el-input v-model="form.include" placeholder="节点包含关键字 (支持正则)" />
        </el-form-item>

        <el-form-item v-if="mode" label="Exclude：">
          <el-input v-model="form.exclude" placeholder="节点排除关键字 (支持正则)" />
        </el-form-item>

        <!-- FileName -->
        <el-form-item v-if="mode" label="FileName：">
          <el-input v-model="form.fileName" placeholder="返回的订阅文件名" />
        </el-form-item>

        <!-- Node List -->
        <el-form-item v-if="mode" label="">
          <el-checkbox v-model="form.nodeList">输出为 Node List</el-checkbox>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="danger" @click="generateSubLink">生成订阅链接</el-button>
          <el-button type="warning" @click="generateShortLink">生成短链</el-button>
        </el-form-item>

        <!-- 输出结果 -->
        <el-form-item v-if="generatedUrl" label="生成结果：">
          <el-input type="textarea" :rows="2" readonly v-model="generatedUrl" />
          <el-button type="primary" size="mini" style="margin-top:10px" @click="copyText(generatedUrl)">复制</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Subconverter",
  data() {
    return {
      config: {},
      mode: true,
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
      } catch (err) {
        console.error("配置加载失败：", err);
      }
    },
    generateSubLink() {
      if (!this.form.sourceSubUrl.trim()) {
        this.$message.error("请输入订阅链接！");
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
      this.$message.info("短链功能未启用，请在 config.json 中设置 shortUrlBackend。");
    },
    copyText(text) {
      navigator.clipboard.writeText(text);
      this.$message.success("复制成功！");
    },
  },
};
</script>

<style scoped>
.app-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background: #f8f9fb;
  padding: 40px;
}
.converter-box {
  background: #fff;
  border-radius: 12px;
  padding: 30px 40px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  width: 850px;
}
.title {
  color: #409eff;
  margin-bottom: 25px;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
small {
  color: #999;
  font-size: 14px;
}
</style>

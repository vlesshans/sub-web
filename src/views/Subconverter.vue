<template>
  <div>
    <el-row style="margin-top: 10px">
      <el-col>
        <el-card>
          <div slot="header">
            Subscription Converter
            <svg-icon icon-class="github" style="margin-left: 20px" @click="goToProject" />
            <div style="display: inline-block; position:absolute; right: 20px">{{ backendVersion }}</div>
          </div>

          <el-container>
            <el-form :model="form" label-width="140px" label-position="left" style="width: 100%">
              <el-form-item label="模式设置:">
                <el-radio v-model="advanced" label="1">基础模式</el-radio>
                <el-radio v-model="advanced" label="2">进阶模式</el-radio>
              </el-form-item>

              <el-form-item label="订阅链接:">
                <el-input
                  v-model="form.sourceSubUrl"
                  type="textarea"
                  rows="3"
                  placeholder="支持订阅或ss/ssr/vmess链接，多个链接每行一个或用 | 分隔"
                  @blur="saveSubUrl"
                />
              </el-form-item>

              <el-form-item label="客户端:">
                <el-select v-model="form.clientType" style="width: 100%">
                  <el-option v-for="(v, k) in options.clientTypes" :key="k" :label="k" :value="v" />
                </el-select>
              </el-form-item>

              <div v-if="advanced === '2'">
                <el-form-item label="后端地址:">
                  <el-autocomplete
                    style="width: 100%"
                    v-model="form.customBackend"
                    :fetch-suggestions="backendSearch"
                    placeholder="动动小手，（建议）自行搭建后端服务。例：http://127.0.0.1:25500/sub?"
                  >
                    <el-button slot="append" @click="gotoGayhub" icon="el-icon-link">前往项目仓库</el-button>
                  </el-autocomplete>
                </el-form-item>

                <el-form-item label="远程配置:">
                  <el-select
                    v-model="form.remoteConfig"
                    allow-create
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option-group v-for="group in options.remoteConfig" :key="group.label" :label="group.label">
                      <el-option
                        v-for="item in group.options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-option-group>
                    <el-button slot="append" @click="gotoRemoteConfig" icon="el-icon-link">配置示例</el-button>
                  </el-select>
                </el-form-item>

                <el-form-item label="Include:">
                  <el-input v-model="form.includeRemarks" placeholder="节点名包含的关键字，支持正则" />
                </el-form-item>

                <el-form-item label="Exclude:">
                  <el-input v-model="form.excludeRemarks" placeholder="节点名不包含的关键字，支持正则" />
                </el-form-item>

                <el-form-item label="FileName:">
                  <el-input v-model="form.filename" placeholder="返回的订阅文件名" />
                </el-form-item>
              </div>

              <el-divider content-position="center">
                <i class="el-icon-magic-stick"></i>
              </el-divider>

              <el-form-item label="定制订阅:">
                <el-input class="copy-content" disabled v-model="customSubUrl">
                  <el-button
                    slot="append"
                    v-clipboard:copy="customSubUrl"
                    v-clipboard:success="onCopy"
                    icon="el-icon-document-copy"
                  >复制</el-button>
                </el-input>
              </el-form-item>

              <el-form-item label="订阅短链:">
                <el-input class="copy-content" disabled v-model="curtomShortSubUrl">
                  <el-button
                    slot="append"
                    v-clipboard:copy="curtomShortSubUrl"
                    v-clipboard:success="onCopy"
                    icon="el-icon-document-copy"
                  >复制</el-button>
                </el-input>
              </el-form-item>

              <el-form-item label-width="0px" style="margin-top: 40px; text-align: center">
                <el-button
                  style="width: 140px"
                  type="danger"
                  @click="makeUrl"
                  :disabled="form.sourceSubUrl.length === 0"
                >生成订阅链接</el-button>

                <el-button
                  style="width: 140px"
                  type="danger"
                  @click="makeShortUrl"
                  :loading="loading"
                  :disabled="customSubUrl.length === 0"
                >生成短链接</el-button>
              </el-form-item>
            </el-form>
          </el-container>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      backendVersion: "",
      advanced: "2",
      options: {
        clientTypes: {
          Clash: "clash",
          Surge: "surge&ver=4",
          QuantumultX: "quanx",
          V2Ray: "v2ray",
          Trojan: "trojan",
          singbox: "singbox"
        },
        remoteConfig: []
      },
      form: {
        sourceSubUrl: "",
        clientType: "clash",
        customBackend: "",
        remoteConfig: ""
      },
      customSubUrl: "",
      curtomShortSubUrl: "",
      loading: false
    };
  },
  async mounted() {
    try {
      const res = await fetch("https://subweb.889909.xyz/config/config.json", {
        headers: { "Cache-Control": "no-cache" }
      });
      if (res.ok) {
        const config = await res.json();
        if (config.defaultBackend) this.form.customBackend = config.defaultBackend;
        if (config.remoteConfig) this.options.remoteConfig = config.remoteConfig;
        console.log("✅ Loaded config:", config);
      } else {
        console.warn("⚠️ config.json not found, using fallback.");
        this.form.customBackend = "http://127.0.0.1:25500/sub?";
      }
    } catch (err) {
      console.error("❌ Error loading config.json:", err);
      this.form.customBackend = "http://127.0.0.1:25500/sub?";
    }
  },
  methods: {
    onCopy() {
      this.$message.success("已复制到剪贴板！");
    },
    makeUrl() {
      if (!this.form.sourceSubUrl) {
        this.$message.error("请填写订阅链接");
        return;
      }
      const backend = this.form.customBackend || "https://subconv.889909.xyz/sub?";
      const url = this.form.sourceSubUrl.replace(/\n/g, "|");
      this.customSubUrl = `${backend}target=${this.form.clientType}&url=${encodeURIComponent(url)}`;
      this.$copyText(this.customSubUrl);
      this.$message.success("订阅链接已复制！");
    }
  }
};
</script>

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/sub")) return context.next();

  const subUrl = url.searchParams.get("url");
  if (!subUrl) return new Response("❌ Missing 'url' parameter.", { status: 400 });

  try {
    const res = await fetch(subUrl);
    if (!res.ok) return new Response(`❌ Fetch failed: ${res.status}`, { status: res.status });
    const text = await res.text();

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#"));
    if (lines.length === 0) return new Response("❌ No nodes found.", { status: 400 });

    // --- 节点解析 ---
    const parseNode = line => {
      try {
        if (line.startsWith("vmess://")) {
          const json = JSON.parse(atob(line.slice(8)));
          return {
            name: json.ps || "vmess",
            type: "vmess",
            server: json.add,
            port: Number(json.port),
            uuid: json.id,
            cipher: json.scy || "auto",
            tls: json.tls === "tls",
            sni: json.sni || "",
          };
        }
        const u = new URL(line);
        const [user, host] = [u.username, u.hostname];
        if (line.startsWith("vless://")) {
          return {
            name: u.hash.slice(1) || "vless",
            type: "vless",
            server: host,
            port: Number(u.port) || 443,
            uuid: user,
            flow: u.searchParams.get("flow") || "",
            sni: u.searchParams.get("sni") || "",
          };
        }
        if (line.startsWith("trojan://")) {
          return {
            name: u.hash.slice(1) || "trojan",
            type: "trojan",
            server: host,
            port: Number(u.port) || 443,
            password: user,
            sni: u.searchParams.get("sni") || "",
          };
        }
        if (line.startsWith("hysteria2://")) {
          return {
            name: u.hash.slice(1) || "hysteria2",
            type: "hysteria2",
            server: host,
            port: Number(u.port) || 443,
            auth_str: user,
            sni: u.searchParams.get("sni") || "",
            alpn: u.searchParams.get("alpn") || "",
          };
        }
      } catch {
        return null;
      }
    };

    const proxies = lines.map(parseNode).filter(Boolean);

    // --- Clash 配置模板 ---
    const proxyNames = proxies.map(p => `"${p.name}"`).join(", ");
    const yamlParts = [];

    yamlParts.push("mixed-port: 7890");
    yamlParts.push("allow-lan: true");
    yamlParts.push("mode: rule");
    yamlParts.push("log-level: info");
    yamlParts.push("external-controller: 127.0.0.1:9090");
    yamlParts.push("");
    yamlParts.push("dns:");
    yamlParts.push("  enable: true");
    yamlParts.push("  listen: 0.0.0.0:1053");
    yamlParts.push("  nameserver:");
    yamlParts.push("    - https://1.1.1.1/dns-query");
    yamlParts.push("    - https://8.8.8.8/dns-query");
    yamlParts.push("");
    yamlParts.push("proxies:");

    for (const p of proxies) {
      yamlParts.push(`  - name: "${p.name}"`);
      yamlParts.push(`    type: ${p.type}`);
      yamlParts.push(`    server: ${p.server}`);
      yamlParts.push(`    port: ${p.port}`);
      if (p.uuid) yamlParts.push(`    uuid: ${p.uuid}`);
      if (p.password) yamlParts.push(`    password: ${p.password}`);
      if (p.cipher) yamlParts.push(`    cipher: ${p.cipher}`);
      if (p.flow) yamlParts.push(`    flow: ${p.flow}`);
      if (p.sni) yamlParts.push(`    sni: ${p.sni}`);
      if (p.alpn) yamlParts.push(`    alpn: ${p.alpn}`);
      yamlParts.push("");
    }

    yamlParts.push("proxy-groups:");
    yamlParts.push("  - name: 🚀 节点选择");
    yamlParts.push("    type: select");
    yamlParts.push(`    proxies: [${proxyNames}]`);
    yamlParts.push("");
    yamlParts.push("  - name: 🌏 自动选择");
    yamlParts.push("    type: url-test");
    yamlParts.push("    url: http://www.gstatic.com/generate_204");
    yamlParts.push(`    proxies: [${proxyNames}]`);
    yamlParts.push("    interval: 600");
    yamlParts.push("");
    yamlParts.push("rules:");
    yamlParts.push("  - GEOIP,CN,DIRECT");
    yamlParts.push("  - MATCH,🚀 节点选择");
    yamlParts.push("");
    yamlParts.push(`# Parsed ${proxies.length} nodes from ${subUrl}`);

    const yaml = yamlParts.join("\n");
    return new Response(yaml, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(`❌ Worker error: ${err.message}`, { status: 500 });
  }
}

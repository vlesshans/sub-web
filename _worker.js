export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const backend = "https://eqdleygjvfkk.us-west-1.clawcloudrun.com";

    if (url.pathname.startsWith("/sub")) {
      const targetUrl = backend + url.pathname + url.search;

      // 打印日志方便 Cloudflare Debug 查看
      console.log("🔁 Forwarding to backend:", targetUrl);

      try {
        const response = await fetch(targetUrl, {
          method: request.method,
          headers: request.headers,
        });

        const bodyText = await response.text(); // 主动读 body
        console.log("✅ Response from backend:", response.status, bodyText.slice(0, 100));

        const headers = new Headers(response.headers);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "*");
        headers.set("Content-Type", "text/plain; charset=utf-8");

        return new Response(
          `✅ Worker → Backend OK
URL: ${targetUrl}
Status: ${response.status}
Response Preview:
${bodyText.slice(0, 300)}
`,
          { status: response.status, headers }
        );
      } catch (err) {
        console.error("❌ Worker fetch error:", err);
        return new Response(`❌ Worker fetch failed: ${err.message}`, {
          status: 502,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};

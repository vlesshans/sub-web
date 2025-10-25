export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const backend = "https://eqdleygjvfkk.us-west-1.clawcloudrun.com";

  // 仅反代 /sub 路径
  if (url.pathname.startsWith("/sub")) {
    const target = backend + url.pathname + url.search;

    try {
      const res = await fetch(target, {
        method: request.method,
        headers: request.headers,
      });

      const text = await res.text();
      const headers = new Headers(res.headers);
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "*");

      return new Response(text, {
        status: res.status,
        headers,
      });
    } catch (err) {
      return new Response(
        `❌ Worker Error: ${err.message}\nURL: ${backend}`,
        { status: 502 }
      );
    }
  }

  // 非 /sub 路径继续访问静态页面
  return context.next();
}

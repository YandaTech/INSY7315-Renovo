const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

const { createApp } = require("../src/app");

// Security finding F14: the voice host must not announce Express.
test("responses carry no X-Powered-By header", async () => {
  const server = http.createServer(createApp());
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    for (const path of ["/", "/no-such-page"]) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      await res.text();
      assert.strictEqual(res.headers.get("x-powered-by"), null, path);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

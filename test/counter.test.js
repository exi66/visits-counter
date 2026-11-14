process.env.DB_PATH = ":memory:";
process.env.ALLOWED_HOSTS = "example.com";

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const app = require("../app");
const knex = require("../db");

let server;
let base;

before(async () => {
  await knex.migrate.latest();
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await knex.destroy();
});

const hit = (key, { referer = "https://example.com/page", query = "" } = {}) =>
  fetch(`${base}/counter/${key}${query}`, {
    headers: referer ? { Referer: referer } : {},
  });

test("increments the counter and returns an uncacheable SVG", async () => {
  const first = await hit("basic");
  assert.equal(first.status, 200);
  assert.match(first.headers.get("content-type"), /image\/svg\+xml/);
  assert.match(first.headers.get("cache-control"), /no-store/);
  assert.match(await first.text(), />1<\/text>/);

  const second = await hit("basic");
  assert.match(await second.text(), />2<\/text>/);
});

test("concurrent hits are all counted and stored in one row", async () => {
  await Promise.all(Array.from({ length: 25 }, () => hit("concurrent")));
  const rows = await knex("counters").where({ url: "concurrent" });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].visits, 25);
});

test("referrer check", async (t) => {
  const cases = [
    ["https://example.com/", 200],
    ["https://blog.example.com/post", 200],
    [null, 403],
    ["not a url", 403],
    ["https://evil.com/?example.com", 403],
    ["https://example.com.evil.com/", 403],
    ["https://notexample.com/", 403],
  ];
  for (const [referer, status] of cases) {
    await t.test(String(referer), async () => {
      const res = await hit("referrer", { referer });
      assert.equal(res.status, status);
    });
  }
});

test("rejects too long keys", async () => {
  const res = await hit("a".repeat(256));
  assert.equal(res.status, 400);
});

test("sanitizes color and clamps size", async () => {
  const bad = await hit("params", {
    query: '?color="><script>&width=99999&height=-5',
  });
  const svg = await bad.text();
  assert.match(svg, /stroke="black"/);
  assert.match(svg, /width="1000"/);
  assert.match(svg, /height="1"/);

  const good = await hit("params", { query: "?color=%23ff0000" });
  assert.match(await good.text(), /stroke="#ff0000"/);
});

test("unknown routes return 404", async () => {
  const res = await fetch(`${base}/nope`);
  assert.equal(res.status, 404);
});

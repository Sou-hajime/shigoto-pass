import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const publicRoot = new URL("../public/", import.meta.url);

test("企業向けの入口を施設検索ではなく仕事相談にする", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("index.html", publicRoot), "utf8"),
    readFile(new URL("app.js", publicRoot), "utf8"),
  ]);

  assert.match(html, /仕事の相談から納品までを一本化/);
  assert.match(app, /人手が足りない仕事/);
  assert.match(app, /相談内容を整理する/);
  assert.match(app, /案件仕様・たたき台/);
  assert.doesNotMatch(html, /対応できる就労支援施設を探/);
  assert.doesNotMatch(app, /条件に合う順|施設を比較する/);
});

test("運営介在型BPOと実行ネットワークの説明を含む", async () => {
  const app = await readFile(new URL("app.js", publicRoot), "utf8");

  assert.match(app, /実行体制編成/);
  assert.match(app, /進行管理/);
  assert.match(app, /検品・納品/);
  assert.match(app, /一括納品/);
  assert.match(app, /就労継続支援A型・B型事業所を中心/);
  assert.match(app, /現在は構想・実証準備段階です/);
});

test("旧版と混在しないよう公開アセット名を世代分けする", async () => {
  const html = await readFile(new URL("index.html", publicRoot), "utf8");

  assert.match(html, /href="bpo-v3\.css"/);
  assert.match(html, /src="data-v3\.js"/);
  assert.match(html, /src="app-v3\.js"/);
});

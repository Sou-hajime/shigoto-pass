import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const publicRoot = new URL("../public/", import.meta.url);

test("企業向けの入口を施設検索ではなく仕事相談にする", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("index.html", publicRoot), "utf8"),
    readFile(new URL("app.js", publicRoot), "utf8"),
  ]);

  assert.match(html, /手が回らない仕事を、相談から納品まで/);
  assert.match(app, /手が回らない仕事を/);
  assert.match(app, /どんな仕事を依頼したいですか/);
  assert.match(app, /現在確認できていること/);
  assert.match(html, /brand-icon-v1\.png/);
  assert.match(app, /hero-shigotopass-role-v1\.png/);
  assert.doesNotMatch(html, /対応できる就労支援施設を探/);
  assert.doesNotMatch(app, /条件に合う順|施設を比較する/);
  assert.doesNotMatch(app, /人手が足りない仕事|曖昧な相談から作業を整理|施設を紹介して終わり|作業名より/);
});

test("相談から納品までを利用者に分かる言葉で説明する", async () => {
  const app = await readFile(new URL("app.js", publicRoot), "utf8");

  assert.match(app, /仕事内容を確認/);
  assert.match(app, /作業先を手配/);
  assert.match(app, /進み具合を確認/);
  assert.match(app, /検品して納品/);
  assert.match(app, /連絡窓口を一本化/);
  assert.match(app, /現在はサービス準備中です/);
  assert.doesNotMatch(app, /実行体制編成|複数拠点へ分配|一括納品/);
});

test("利用場面から使い方とメリットを具体的に説明する", async () => {
  const app = await readFile(new URL("app.js", publicRoot), "utf8");

  assert.match(app, /入力作業がたまり、本来の仕事に手が回らない/);
  assert.match(app, /キャンペーン前だけ、大量の作業が発生する/);
  assert.match(app, /ECサイトの更新が後回しになっている/);
  assert.match(app, /シゴトパスの使い方/);
  assert.match(app, /相談先を一本化/);
  assert.match(app, /必要なときだけ依頼/);
  assert.match(app, /納品まで任せられる/);
});

test("旧版と混在しないよう公開アセット名を世代分けする", async () => {
  const html = await readFile(new URL("index.html", publicRoot), "utf8");

  assert.match(html, /href="bpo-v4\.css"/);
  assert.match(html, /src="data-v4\.js"/);
  assert.match(html, /src="app-v4\.js"/);
});

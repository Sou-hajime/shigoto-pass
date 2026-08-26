import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

async function loadParseRequest() {
  const source = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  const start = source.indexOf("function parseRequest");
  const end = source.indexOf("const categoryName", start);
  assert.ok(start >= 0 && end > start, "parseRequest implementation was not found");

  const context = { CATEGORIES: [] };
  vm.createContext(context);
  vm.runInContext(`${source.slice(start, end)}; this.parseRequest = parseRequest;`, context);
  return context.parseRequest;
}

test("自然文の月内・月末表現を希望納期として認識する", async () => {
  const parseRequest = await loadParseRequest();
  const now = new Date(2026, 7, 20);

  assert.equal(parseRequest("商品500個を8月中に納品したい", now).deadline, "2026-08-31");
  assert.equal(parseRequest("9月末までにラベル貼り", now).deadline, "2026-09-30");
  assert.equal(parseRequest("来月中に発送したい", now).deadline, "2026-09-30");
});

test("日付を明記した従来の入力も認識し続ける", async () => {
  const parseRequest = await loadParseRequest();
  const now = new Date(2026, 7, 20);

  assert.equal(parseRequest("9月15日までに納品", now).deadline, "2026-09-15");
  assert.equal(parseRequest("2027年1月10日まで", now).deadline, "2027-01-10");
});

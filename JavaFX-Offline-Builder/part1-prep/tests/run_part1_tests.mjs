// Run from JavaFX-Offline-Builder/part1-prep/: node tests/run_part1_tests.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { buildHtml, distFile } from "../build.mjs";

const html = buildHtml();
let failed = 0;
const test = (name, fn) => {
  try { fn(); console.log("ok   " + name); } catch (e) { failed++; console.log("FAIL " + name + "\n     " + e.message); }
};

test("question bank covers every category", () => {
  const source = html.slice(html.indexOf("<script>") + 8, html.indexOf(";(function ()"));
  const context = vm.createContext({});
  vm.runInContext(source + "\n;globalThis.T = Theory;", context);
  const T = context.T;
  assert.ok(T.list.length >= 110, "bank has " + T.list.length);
  for (const [cat] of T.categories) assert.ok(T.list.some(q => q.cat === cat), "no questions in " + cat);
  assert.equal(T.cheatSheet.length, 10);
  assert.ok(T.search("consume").length >= 1);
});

test("page script parses and the page is self-contained", () => {
  const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
  new vm.Script(script);
  assert.doesNotMatch(html, /<script\s+src|<link\s|https?:\/\//i);
  assert.doesNotMatch(script, /\binnerHTML\b|\beval\(|new Function\(/);
});

test("dist is up to date", () => {
  assert.ok(fs.existsSync(distFile), "run node build.mjs");
  assert.equal(fs.readFileSync(distFile, "utf8").replace(/\r\n/g, "\n"), html, "run node build.mjs");
});

console.log(failed ? failed + " failure(s)" : "all passed");
process.exit(failed ? 1 : 0);

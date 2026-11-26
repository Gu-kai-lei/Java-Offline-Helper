// Replay a mock practical by operating the real Builder page.
// Run from JavaFX-Offline-Builder/:
//   node tests/exam-variants/round3/run_round3.mjs                     drive the page, save answers, write LOG.md
//   ... --jdk --fx <javafx lib>                                                 also compile every answer
//   ... --jdk --run --fx <javafx lib>                                           also launch the answers with FxSmoke (needs a display)
//   ... --only Q1,Q7                                                            limit to some questions
//   ... --check                                                                 fail if the saved answers differ from what the page produces
//   ... --suite round4 --output-dir <dir>                                        run the fourth paper and write its artifacts to <dir>
//   ... --chromium <path>                                                       use an installed Chromium instead of Playwright's download
// Needs Node 18+ and Playwright with Chromium (require('playwright')). The page is JavaFX-Offline-Builder/dist/JavaFX-Offline-Builder.html.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const runnerDir = path.dirname(fileURLToPath(import.meta.url));
const builder = path.resolve(runnerDir, "../../..");
const dist = path.join(builder, "dist", "JavaFX-Offline-Builder.html");
const args = process.argv.slice(2);
const flag = name => args.includes(name);
const option = name => (args.indexOf(name) >= 0 ? args[args.indexOf(name) + 1] : undefined);
const suite = option("--suite") ?? "round3";
if (!["round3", "round4"].includes(suite)) throw new Error("Unknown practical suite: " + suite);
const here = path.resolve(runnerDir, "..", suite);
const { questions, profile } = await import(pathToFileURL(path.join(here, "questions.mjs")).href);
const reportDir = path.resolve(option("--output-dir") ?? (suite === "round3" ? here : fs.mkdtempSync(path.join(os.tmpdir(), "builder-round4-"))));
const answersDir = path.join(reportDir, "answers");
const only = option("--only")?.split(",");
const fxDir = option("--fx") || process.env.JAVAFX_LIB;
const jdkBin = option("--jdk-bin");

// ---------- page operations ----------
// Every operation is one action a student does on the page. text() is the line written to the log.
const quote = s => "「" + s + "」";
const ops = {
  nav: { text: v => "左侧导航点 " + quote(v) },
  preset: { text: v => quote("载入范例…") + " 选 " + quote(v) + "，确认替换" },
  example: { text: v => "搜索并打开讲义例程 " + quote(v) },
  "example.name": { text: v => "例程类名填 " + quote(v) },
  "example.param": { text: ([label, value]) => quote(label) + " 填 " + quote(value) },
  reset: { text: () => "点 " + quote("恢复默认") + "，确认" },
  set: { text: ([label, value, o = {}]) => (o.after ? quote(o.after) + " 下方的 " : "") + quote(label) + (o.nth > 1 ? "（第 " + o.nth + " 个）" : "") + " 设为 " + quote(value) },
  add: { text: v => quote(v) + " 列表点 " + quote("＋ 添加") },
  row: { text: ([list, i, label, value]) => quote(list) + " 第 " + i + " 行：" + quote(label) + " 设为 " + quote(value) },
  del: { text: ([list, i]) => quote(list) + " 第 " + i + " 行点 × 删除" },
  practice: { text: v => "练习下拉框选 " + quote(v) },
  "comp.add": { text: v => "控件区下拉框选 " + quote(v) + "，点 " + quote("添加控件") },
  "comp.new": { text: ([type, name, text]) => "控件区：类型选 " + quote(type) + "，变量名填 " + quote(name) +
    (text !== undefined ? "，文字填 " + quote(text) : "") + "，点 " + quote("添加控件") },
  "var.new": { text: ([type, name, value]) => "变量区：类型选 " + quote(type) + "，变量名填 " + quote(name) + "，初始值填 " + quote(value) + "，点 " + quote("添加变量") },
  "ev.new": { text: ([type, target]) => "事件区：选 " + quote(type) + "，注册到 " + quote(target) + "，点 " + quote("添加事件") },
  "ev.click": { text: v => "当前事件点 " + quote(v) },
  "blk.copy": { text: (where, d) => "积木 " + (d || where) + " 点 ⧉ 复制" },
  "comp.set": { text: ([card, label, value]) => "控件 " + quote(card) + "：" + quote(label) + " 设为 " + quote(value) },
  "comp.del": { text: v => "控件 " + quote(v) + " 点 " + quote("移除此控件") },
  config: { text: ([label, value]) => quote("类名、标题、窗口大小") + "：" + quote(label) + " 设为 " + quote(value) },
  "ev.add": { text: v => "事件区下拉框选 " + quote(v) + "，点 " + quote("添加事件") },
  "ev.pick": { text: v => "点事件列表第 " + v + " 个事件" },
  "ev.set": { text: ([label, value]) => "当前事件：" + quote(label) + " 设为 " + quote(value) },
  "ev.del": { text: () => "当前事件点 " + quote("删除事件") },
  "blk.add": { text: ([where, type], d) => (d || "根层") + "：下拉框选 " + quote(type) + "，点 " + quote("＋ 积木") },
  "blk.set": { text: ([where, label, value], d) => "积木 " + (d || where) + "：" + quote(label) + " 设为 " + quote(value) },
  "blk.del": { text: (where, d) => "积木 " + (d || where) + " 点 × 删除" }
};

// Finds one element in the page and marks it with data-pw="t". Runs inside the browser.
function mark({ kind, a }) {
  const own = el => el.querySelector(":scope > span")?.textContent.trim();
  const tag = el => { document.querySelectorAll("[data-pw]").forEach(e => e.removeAttribute("data-pw")); if (el) el.setAttribute("data-pw", "t"); return el; };
  const main = document.querySelector("#main");
  const fieldIn = (scope, label, o = {}) => {
    const all = [...scope.querySelectorAll("label.field")].filter(l => o.rows || !l.closest(".list-row"));
    let start = 0;
    if (o.after) { start = all.findIndex(l => own(l) === o.after) + 1; if (!start) return null; }
    let n = 0;
    for (let i = start; i < all.length; i++) if (own(all[i]) === label && ++n === (o.nth || 1)) return all[i];
    return null;
  };
  const listField = label => [...main.querySelectorAll(".list-field")].find(l => (l.querySelector(".list-head > span")?.textContent || "").startsWith(label + "（"));
  const blockList = parts => {
    let list = main.querySelector(".block-editor > .block-list"), desc = [];
    for (let i = 0; i < parts.length; i += 2) {
      const card = [...list.children].filter(c => c.classList.contains("block"))[Number(parts[i]) - 1];
      if (!card) return [null];
      desc.push("第 " + parts[i] + " 块「" + card.querySelector(".block-caption strong").textContent + "」");
      if (parts[i + 1] === undefined) return [card, desc];
      const branch = [...card.children].filter(c => c.classList.contains("branch"))[parts[i + 1] === "yes" ? 0 : 1];
      desc.push("「" + branch.querySelector(".branch-title").textContent + "」分支");
      list = branch.querySelector(":scope > .block-list");
    }
    return [list, desc];
  };
  let el = null, desc = "";
  switch (kind) {
    case "field": el = fieldIn(main.querySelector(".form-box"), a[0], a[1]); break;
    case "list": el = listField(a); break;
    case "row": { const l = listField(a[0]); const r = l && [...l.querySelectorAll(":scope > .list-row")][a[1] - 1]; el = r && (a[2] ? fieldIn(r, a[2], { rows: true }) : r); break; }
    case "preset": el = main.querySelector(".panel-head select"); break;
    case "practice": el = main.querySelector(".form-panel > select"); break;
    case "card": el = [...main.querySelectorAll("details.component-card")].find(d => d.querySelector("summary")?.textContent === a[0]);
      if (el && a[1]) el = fieldIn(el, a[1]); break;
    case "compAdd": el = [...main.querySelectorAll(".add-row")].find(r => r.querySelector("option[value=Pane]")); break;
    case "varAdd": el = main.querySelector(".variables-card .add-row"); break;
    case "evButton": el = [...main.querySelectorAll(".editor-head button")].find(b => b.textContent === a); break;
    case "evAdd": el = main.querySelector(".event-list .add-row"); break;
    case "evCard": el = main.querySelectorAll(".event-list .event-card")[a - 1]; break;
    case "evField": el = fieldIn(main.querySelector(".editor-head"), a); break;
    case "evDel": el = [...main.querySelectorAll(".editor-head button")].find(b => b.textContent === "删除事件"); break;
    case "blkList": { const [list, d] = blockList(a ? String(a).split(".") : []); el = list && [...list.children].find(c => c.classList.contains("add-row")); desc = d?.join(" › "); break; }
    case "blkCard": { const [card, d] = blockList(String(a[0]).split(".")); desc = d?.join(" › ");
      el = card && (a[1] ? fieldIn(card.querySelector(":scope > .form-grid"), a[1], a[2]) : card); break; }
  }
  if (!el) return { ok: false };
  tag(el);
  return { ok: true, desc: desc || "" };
}

async function find(page, kind, a) {
  const r = await page.evaluate(mark, { kind, a });
  if (!r.ok) throw new Error("页面上找不到 " + kind + " " + JSON.stringify(a));
  return { loc: page.locator('[data-pw="t"]'), desc: r.desc };
}

async function fill(control, value) {
  const tagName = await control.evaluate(e => e.tagName);
  if (tagName === "SELECT") {
    const options = await control.evaluate(e => [...e.options].map(o => [o.value, o.textContent]));
    const hit = options.find(([, text]) => text === value) || options.find(([v]) => v === value);
    if (!hit) throw new Error("下拉框没有选项 " + JSON.stringify(value) + "；可选：" + options.map(o => o[1]).join(" / "));
    await control.selectOption(hit[0]);
  } else {
    await control.fill(String(value));
    await control.dispatchEvent("change");
  }
}

async function perform(page, step) {
  const [name, value] = Object.entries(step)[0];
  let desc = "";
  switch (name) {
    case "nav": await page.locator("#nav button", { hasText: value }).first().click(); break;
    case "preset": await fill((await find(page, "preset")).loc, value); break;
    case "example":
      await page.locator(".form-panel input[type=search]").fill(value);
      await page.locator(".example-item").filter({ has: page.getByText(value, { exact: true }) }).click();
      break;
    case "example.name": await page.getByPlaceholder("类名（留空 = 原名）").fill(value); break;
    case "example.param": await page.locator("label.field").filter({ has: page.getByText(value[0], { exact: true }) }).locator("input").fill(String(value[1])); break;
    case "reset": await page.locator("#main button", { hasText: "恢复默认" }).click(); break;
    case "set": await fill((await find(page, "field", [value[0], value[2] || {}])).loc.locator("input, select, textarea").first(), value[1]); break;
    case "add": await (await find(page, "list", value)).loc.locator(".list-head button").click(); break;
    case "row": await fill((await find(page, "row", value)).loc.locator("input, select, textarea").first(), value[3]); break;
    case "del": await (await find(page, "row", value)).loc.locator(".row-title button[title=删除]").click(); break;
    case "practice": await fill((await find(page, "practice")).loc, value); break;
    case "comp.add": { const row = (await find(page, "compAdd")).loc; await fill(row.locator("select"), value); await row.locator("button").click(); break; }
    case "comp.set": await fill((await find(page, "card", value.slice(0, 2))).loc.locator("input, select, textarea").first(), value[2]); break;
    case "comp.del": await (await find(page, "card", [value])).loc.locator("button", { hasText: "移除此控件" }).click(); break;
    case "config": await fill((await find(page, "card", ["类名、标题、窗口大小", value[0]])).loc.locator("input").first(), value[1]); break;
    case "ev.add": { const row = (await find(page, "evAdd")).loc; await fill(row.locator("select").first(), value); await row.locator("button").click(); break; }
    case "ev.pick": await (await find(page, "evCard", value)).loc.click(); break;
    case "ev.set": await fill((await find(page, "evField", value[0])).loc.locator("input, select").first(), value[1]); break;
    case "ev.click": await (await find(page, "evButton", value)).loc.click(); break;
    case "comp.new": {
      const row = (await find(page, "compAdd")).loc;
      await fill(row.locator("select"), value[0]);
      await row.locator('input[aria-label="新控件变量名"]').fill(value[1]);
      await row.locator('input[aria-label="新控件文字"]').fill(value[2] ?? "");
      await row.locator("button").click();
      break;
    }
    case "var.new": {
      const row = (await find(page, "varAdd")).loc;
      await fill(row.locator("select"), value[0]);
      await row.locator('input[aria-label="新变量名"]').fill(value[1]);
      await row.locator('input[aria-label="新变量初始值"]').fill(value[2] ?? "");
      await row.locator("button").click();
      break;
    }
    case "ev.new": {
      const row = (await find(page, "evAdd")).loc;
      await fill(row.locator("select").first(), value[0]);
      await fill(row.locator("select").nth(1), value[1]);
      await row.locator("button").click();
      break;
    }
    case "blk.copy": { const f = await find(page, "blkCard", [value]); desc = f.desc; await f.loc.locator(':scope > .row-title button[title="复制（放在下面）"]').click(); break; }
    case "ev.del": await (await find(page, "evDel")).loc.click(); break;
    case "blk.add": { const f = await find(page, "blkList", value[0]); desc = f.desc; await fill(f.loc.locator("select"), value[1]); await f.loc.locator("button").click(); break; }
    case "blk.set": { const f = await find(page, "blkCard", [value[0], value[1], value[3]]); desc = f.desc; await fill(f.loc.locator("input, select, textarea").first(), value[2]); break; }
    case "blk.del": { const f = await find(page, "blkCard", [value]); desc = f.desc; await f.loc.locator(":scope > .row-title button[title=删除]").click(); break; }
    default: throw new Error("未知操作 " + name);
  }
  await page.waitForTimeout(40);
  // Closed groups and cards hide their fields; a student would expand them, so keep every one open.
  await page.evaluate(() => document.querySelectorAll("#main details:not([open])").forEach(d => { d.open = true; }));
  return ops[name].text(value, desc);
}

async function readOutput(page) {
  await page.waitForTimeout(400);
  const panel = page.locator("#main .output-panel").first();
  const status = (await panel.locator(".status").innerText()).trim();
  const names = await panel.locator(".file-tabs button").allTextContents();
  const files = [];
  if (names.length < 2) {
    const code = await panel.locator("textarea.code").inputValue();
    const name = names[0] || (/([A-Za-z_]\w*\.java)/.exec(status) || [])[1];
    if (code) files.push({ filename: name, code });
  } else {
    for (const name of names) {
      await panel.locator(".file-tabs button", { hasText: name }).first().click();
      files.push({ filename: name, code: await panel.locator("textarea.code").inputValue() });
    }
  }
  const snippet = await page.locator("#main textarea.small-code").count() ? await page.locator("#main textarea.small-code").inputValue() : "";
  return { status, files, snippet };
}

async function answer(browser, q) {
  const context = await browser.newContext({ offline: true });
  const localPage = "http://127.0.0.1:8765/";
  // Fulfill the only navigation from disk so managed browsers with file:// blocked can run the same page offline.
  await context.route("**/*", route => route.request().url() === localPage
    ? route.fulfill({ path: dist, contentType: "text/html; charset=utf-8" })
    : route.abort());
  const page = await context.newPage();
  page.on("dialog", d => d.accept());
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(localPage);
  await page.fill("#profile-name", profile.name);
  await page.fill("#profile-id", profile.id);
  await page.fill("#profile-tools", profile.tools);
  await page.click("#profile-form button[type=submit]");
  const log = [];
  for (const step of q.ops) {
    try { log.push({ text: await perform(page, step), ok: true }); }
    catch (e) { log.push({ text: Object.keys(step)[0] + " " + JSON.stringify(Object.values(step)[0]), ok: false, error: e.message.split("\n")[0] }); break; }
  }
  const output = q.ops.length ? await readOutput(page) : { status: "", files: [], snippet: "" };
  await context.close();
  return { log, output, errors };
}

// ---------- javac and FxSmoke ----------
function run(cmd, argv, opts = {}) {
  return new Promise(resolve => {
    const exe = jdkBin && ["java", "javac"].includes(cmd) ? path.join(jdkBin, cmd) : cmd;
    const child = spawn(exe, argv, { ...opts, windowsHide: true });
    let out = "";
    child.stdout.on("data", d => { out += d; });
    child.stderr.on("data", d => { out += d; });
    const timer = opts.timeout ? setTimeout(() => child.kill(), opts.timeout) : null;
    child.on("close", code => { if (timer) clearTimeout(timer); resolve({ code, out }); });
    child.on("error", e => resolve({ code: -1, out: String(e) }));
  });
}
function fxJars(dir) {
  if (!dir || !fs.existsSync(dir)) return null;
  const jars = ["base", "graphics", "controls"].map(m => fs.readdirSync(dir).find(f => f === "javafx." + m + ".jar" ||
    (f.startsWith("javafx-" + m + "-") && f.endsWith(".jar") && !f.includes("sources"))));
  return jars.every(Boolean) ? jars.map(j => path.join(dir, j)).join(path.delimiter) : null;
}
const clean = out => out.split("\n").filter(l => !/^Picked up /.test(l)).join("\n").trim();

// ---------- main ----------
const selected = questions.filter(q => !only || only.includes(q.id));
if (!selected.length) throw new Error("No practical questions selected");
const { chromium } = require("playwright");
const browser = await chromium.launch({ executablePath: option("--chromium") });
const results = [];
for (const q of selected) {
  const r = await answer(browser, q);
  results.push({ q, ...r });
  console.log(q.id + ": " + (q.ops.length ? r.log.filter(l => l.ok).length + "/" + q.ops.length + " operations, " + r.output.files.length + " file(s)" : "no builder page fits"));
}
await browser.close();

let failed = 0;
for (const r of results) {
  const dir = path.join(answersDir, r.q.id);
  const expected = r.output.files.map(f => f.filename).sort();
  if (flag("--check")) {
    const saved = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(".java")).sort() : [];
    const same = JSON.stringify(saved) === JSON.stringify(expected) &&
      r.output.files.every(f => fs.readFileSync(path.join(dir, f.filename), "utf8") === f.code);
    if (!same) { failed++; console.log("FAIL " + r.q.id + ": saved answers differ from what the page produces"); }
  } else {
    fs.rmSync(dir, { recursive: true, force: true });
    if (r.output.files.length) {
      fs.mkdirSync(dir, { recursive: true });
      for (const f of r.output.files) fs.writeFileSync(path.join(dir, f.filename), f.code);
      if (r.q.snippet && r.output.snippet) fs.writeFileSync(path.join(dir, "event-handlers.txt"), r.output.snippet + "\n");
    }
  }
  if (r.log.some(l => !l.ok) || r.errors.length || (r.q.ops.length && !r.output.files.length)) {
    failed++;
    console.log("FAIL " + r.q.id + ": " + (r.log.find(l => !l.ok)?.error || r.errors[0] || r.output.status || "no generated source"));
  }
}

const fxPath = fxJars(fxDir);
if (flag("--jdk")) {
  if (!fxPath) { console.log("FAIL: JavaFX jars not found; pass --fx <javafx lib folder>"); process.exit(1); }
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "round3-"));
  let runner = null;
  if (flag("--run")) {
    runner = path.join(work, "runner");
    const c = await run("javac", ["-encoding", "UTF-8", "-nowarn", "--module-path", fxPath, "--add-modules", "javafx.controls", "-d", runner,
      path.join(builder, "tests", "FxSmoke.java")], { cwd: work });
    if (c.code !== 0) { console.log("FAIL compile FxSmoke.java\n" + clean(c.out)); process.exit(1); }
  }
  for (const r of results) {
    if (!r.output.files.length) continue;
    const src = path.join(work, r.q.id), out = path.join(src, "out");
    fs.mkdirSync(out, { recursive: true });
    for (const f of r.output.files) fs.writeFileSync(path.join(src, f.filename), f.code);
    const c = await run("javac", ["-encoding", "UTF-8", "--module-path", fxPath, "--add-modules", "javafx.controls", "-d", out,
      ...r.output.files.map(f => path.join(src, f.filename))], { cwd: src });
    r.javac = { ok: c.code === 0, out: clean(c.out) };
    if (!r.javac.ok) { failed++; console.log("FAIL javac " + r.q.id + "\n" + r.javac.out); continue; }
    if (!runner || !r.q.accept) continue;
    // Each run is one launch of the program; "fresh" runs start in a new, empty working folder.
    const runs = [], consoles = [], runDirs = [];
    let cwd = null, crashed = false, crashOut = "";
    for (const [i, launch] of r.q.accept.runs.entries()) {
      if (!cwd || launch.fresh) { cwd = path.join(src, "run" + i); fs.mkdirSync(cwd); }
      runDirs.push(cwd);
      for (const [target, from] of Object.entries(launch.files || {})) {
        fs.mkdirSync(path.dirname(path.join(cwd, target)), { recursive: true });
        fs.copyFileSync(path.join(here, from), path.join(cwd, target));
      }
      const x = await run("java", ["-Dprism.order=sw", "-Djavafx.cachedir=" + path.join(work, "native"), "--module-path", fxPath, "--add-modules", "javafx.controls",
        "-cp", [runner, out].join(path.delimiter), "FxSmoke", r.q.accept.main, ...launch.steps], { cwd, timeout: 90000 });
      const snaps = [], lines = [];
      for (const line of clean(x.out).split("\n")) {
        const m = /^STEP (\d+) (\{.*\})$/.exec(line);
        if (m) snaps[Number(m[1])] = JSON.parse(m[2]);
        else if (line.trim()) lines.push(line);
      }
      if (x.code !== 0 || snaps.filter(Boolean).length !== launch.steps.length + 1 || /Exception in|\tat /.test(x.out)) { crashed = true; crashOut = clean(x.out).slice(0, 1500); break; }
      runs.push(snaps); consoles.push(lines.join("\n"));
      if (i === 0) r.firstDir = cwd;
    }
    let checks = [];
    if (!crashed) {
      try { checks = r.q.accept.checks({ s: runs[0], runs, out: consoles.join("\n"), dir: r.firstDir, runDirs, code: r.output.files.map(f => f.code).join("\n") }); }
      catch (e) { checks = [["检查脚本出错：" + e.message, false, "", true]]; }
    }
    r.run = { crashed, checks, out: crashOut };
    console.log(r.q.id + ": " + (crashed ? "JavaFX launch failed" : checks.filter(c => c[1]).length + "/" + checks.length + " acceptance checks"));
  }
}

// ---------- LOG.md ----------
const verdictText = { full: "✅ 只用 builder 完成全部要求", partial: "🟡 只用 builder 完成一部分", none: "❌ builder 没有可用的页面" };
function verdict(r) {
  if (suite === "round3") return verdictText[r.q.verdict];
  if (!r.output.files.length || r.log.some(step => !step.ok) || r.errors.length || r.javac?.ok === false || r.run?.crashed) return "❌ 生成、编译或运行失败";
  if (!r.run?.checks.length) return "待运行验收";
  const passed = r.run.checks.filter(check => check[1]).length;
  if (passed === r.run.checks.length) return verdictText.full;
  return passed ? verdictText.partial : "❌ 验收未通过";
}
const md = ["# 第 " + (suite === "round4" ? "4" : "3") + " 轮模拟卷：Builder 操作日志", "",
  "由 `run_round3.mjs` 驱动真实页面 `JavaFX-Offline-Builder/dist/JavaFX-Offline-Builder.html` 生成。每一步都是页面上的一次点击或输入，没有手写 Java，也没有打开「显示进阶 Java 积木」。",
  "考生信息：姓名 `" + profile.name + "`，学号 `" + profile.id + "`，工具 `" + profile.tools + "`。生成的代码在 [answers/](answers/)。", "",
  "| 题号 | 用的页面 | 结果 | 验收 |", "| --- | --- | --- | --- |"];
for (const r of results) {
  const checks = r.run?.checks || [];
  const acceptance = !r.output.files.length ? "—" : r.run ? (r.run.crashed ? "运行出错" : checks.filter(c => c[1]).length + "/" + checks.length + " 项通过")
    : r.javac ? (r.javac.ok ? "编译通过" + (r.q.accept ? "（未运行）" : "") : "编译失败") : "未编译";
  md.push("| [" + r.q.id + "](#" + r.q.id.toLowerCase() + ") " + r.q.title + " | " + (r.q.tool || "—") + " | " + verdict(r) + " | " + acceptance + " |");
}
for (const r of results) {
  md.push("", "## " + r.q.id, "", "**" + r.q.title + "** · " + verdict(r) + (r.q.tool ? " · 页面：" + r.q.tool : ""), "");
  if (r.q.brief) md.push(r.q.brief, "");
  if (r.q.note) md.push(r.q.note, "");
  if (r.q.ops.length) {
    md.push("### 操作顺序", "");
    r.log.forEach((l, i) => md.push((i + 1) + ". " + l.text + (l.ok ? "" : " ⚠ 失败：" + l.error)));
    md.push("", "页面输出：" + r.output.status.replace(/\n+/g, " "), "");
    if (r.output.files.length) md.push("生成文件：" + r.output.files.map(f => "[" + f.filename + "](answers/" + r.q.id + "/" + f.filename + ")").join("、") +
      (r.q.snippet && r.output.snippet ? "；只含事件代码的片段：[event-handlers.txt](answers/" + r.q.id + "/event-handlers.txt)" : ""), "");
  }
  if (r.q.unmet?.length) { md.push("### builder 做不到的要求", ""); r.q.unmet.forEach(u => md.push("- " + u)); md.push(""); }
  if (r.javac && !r.javac.ok) md.push("### 编译失败", "", "```text", r.javac.out.slice(0, 2000), "```", "");
  if (r.run) {
    md.push("### 运行验收（FxSmoke）", "");
    r.q.accept.runs.forEach((launch, i) => md.push((r.q.accept.runs.length > 1 ? "第 " + (i + 1) + " 次启动" + (launch.fresh ? "（新的空文件夹）" : i ? "（同一文件夹，相当于重新运行程序）" : "") +
      (launch.files ? "（文件夹里放了 " + Object.keys(launch.files).join("、") + "）" : "") + "：" : "步骤：") +
      "`" + launch.steps.join("` → `") + "`"));
    md.push("");
    if (r.run.crashed) md.push("程序运行出错：", "", "```text", r.run.out, "```", "");
    else r.run.checks.forEach(([text, ok, detail, expected]) => md.push("- " + (ok ? "✅ " : "❌ ") + text +
      (!ok && detail !== undefined && detail !== "" ? "（实际：" + String(detail).replace(/\n/g, " ⏎ ") + "）" : "") +
      (ok !== expected ? (expected ? " ⚠ 预期通过" : " ⚠ 本以为 builder 做不到，实际通过") : "")));
    md.push("");
  }
}
if (!flag("--check")) {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, "LOG.md"), md.join("\n").replace(/\n{3,}/g, "\n\n") + "\n");
  console.log("Operation log: " + path.join(reportDir, "LOG.md"));
}
// A run is a mismatch when it crashed or a check came out differently from what the question records.
const runFailures = results.filter(r => r.run && (r.run.crashed || r.run.checks.some(([, ok, , expected]) => ok !== expected))).length;
console.log(results.length + " question(s); " + (failed ? failed + " failure(s)" : "no driver or compile failures") +
  (results.some(r => r.run) ? "; acceptance mismatches: " + runFailures : ""));
process.exit(failed || runFailures ? 1 : 0);

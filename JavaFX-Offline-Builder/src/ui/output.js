/* Output panel: file tabs, read-only code, copy / download / BlueJ ZIP, errors and warnings. */
"use strict";

function OutputPanel(options = {}) {
  let result = null, selected = "";
  const tabs = h("div", { class: "file-tabs", role: "tablist" });
  const code = h("textarea", { class: "code", readonly: true, wrap: "off", spellcheck: "false", "aria-label": "生成的 Java 代码" });
  const status = h("div", { class: "status", role: "status", "aria-live": "polite" });
  const note = h("p", { class: "action-note" });
  const current = () => result?.files.find(f => f.filename === selected) || result?.files[0];
  const prepare = () => { options.beforeExport?.(); return current(); };
  const copyBtn = h("button", { type: "button", class: "primary", onclick: () => { const f = prepare(); if (f) copyText(f.code, note); } }, "复制本文件");
  const fileBtn = h("button", { type: "button", onclick: () => { const f = prepare(); if (!f) return; downloadBlob(f.code, f.filename); note.textContent = "已下载 " + f.filename + "（在浏览器的下载文件夹）。"; } }, "下载本文件");
  const zipBtn = h("button", { type: "button", onclick: () => {
    if (!prepare()) return;
    const project = result.project || result.main;
    const files = BlueJ.projectFiles(result.files, project, Profile.value, result.main);
    downloadBlob(new Blob([BlueJ.zip(files, project)], { type: "application/zip" }), project + ".zip");
    note.textContent = "已下载 " + project + ".zip：解压后在 BlueJ 用 Project > Open Project 打开 " + project + " 文件夹。";
  } }, "下载 BlueJ 项目 ZIP");
  const helpBtn = h("button", { type: "button", onclick: () => $("bluej-dialog").showModal() }, "BlueJ 怎么用？");
  // Same setting as in the profile dialog; changing it regenerates the code of the current page.
  const importSelect = selectEl([["precise", "import：精确"], ["universal", "import：通用块"]], Profile.value.imports,
    { "aria-label": "import 写法", title: "通用块 = 每个文件开头同一段 import xxx.*;，考场不用查包名" });
  importSelect.addEventListener("change", () => Profile.save({ ...Profile.value, imports: importSelect.value }));
  // No profile listener here: panels are rebuilt on every page change and would pile up listeners.
  const element = h("section", { class: "panel output-panel" },
    h("div", { class: "panel-head" }, h("h2", null, options.title || "Java 代码"),
      h("div", { class: "actions" }, copyBtn, fileBtn, zipBtn, helpBtn, importSelect)),
    tabs, code, status, note);

  function renderTabs() {
    setChildren(tabs, ...(result?.files || []).map(f => h("button", {
      type: "button", role: "tab", class: "tab" + (f === current() ? " active" : ""), "aria-selected": String(f === current()),
      onclick: () => { selected = f.filename; renderTabs(); code.value = f.code; code.scrollTop = 0; }
    }, f.filename)));
    tabs.hidden = !result || result.files.length < 2;
  }

  function show(next, error) {
    setChildren(status);
    note.textContent = "";
    if (error) {
      result = null;
      code.value = "";
      status.append(h("p", { class: "error" }, "⚠ " + error));
    } else {
      result = next;
      if (!result.files.some(f => f.filename === selected)) selected = result.files[0].filename;
      code.value = current().code;
      const count = result.files.length;
      const app = result.files.find(f => f.filename === result.main + ".java" && /extends\s+Application\b/.test(f.code));
      status.append(h("p", { class: "ok" }, "✓ 已生成 " + count + " 个源文件：" + result.files.map(f => f.filename).join("、") + "。尚未编译。" +
        (app ? "主类 " + result.main + "（在 BlueJ 中右键它 → Run JavaFX Application）。" : "这些文件里没有 JavaFX 主类（extends Application）。")));
      for (const w of result.warnings || []) status.append(h("p", { class: "warn" }, "• " + w));
    }
    for (const b of [copyBtn, fileBtn, zipBtn]) b.disabled = !result;
    renderTabs();
  }

  function highlight(address) {
    const range = result?.blockRanges?.[address];
    if (!range || range[0] === range[1]) return false;
    code.focus();
    code.setSelectionRange(...range);
    const before = code.value.slice(0, range[0]).split("\n").length - 1;
    code.scrollTop = Math.max(0, (before - 2) * (parseFloat(getComputedStyle(code).lineHeight) || 20));
    return true;
  }

  return { element, show, highlight, get result() { return result; } };
}

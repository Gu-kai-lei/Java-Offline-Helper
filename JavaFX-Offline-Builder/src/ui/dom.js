/* Small DOM helpers. Text is always inserted as text nodes, never parsed as HTML. */
"use strict";

const $ = id => document.getElementById(id);

// h("div", {class: "x", onclick: fn}, "text", childNode, [more children])
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === null || value === false) continue;
      if (key === "class") el.className = value;
      else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value);
      else if (key === "value") el.value = value;
      else if (key === "checked" || key === "disabled" || key === "hidden" || key === "open" || key === "selected") el[key] = Boolean(value);
      else if (key === "dataset") Object.assign(el.dataset, value);
      else el.setAttribute(key, value === true ? "" : String(value));
    }
  }
  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

// Replaces all children. Unlike the native el.replaceChildren(), a null / false / undefined child is
// skipped instead of being shown as the text "null".
function setChildren(el, ...children) {
  el.replaceChildren();
  appendChildren(el, children);
}

const svgNs = "http://www.w3.org/2000/svg";
function svg(tag, attrs = {}, ...children) {
  const el = document.createElementNS(svgNs, tag);
  for (const [key, value] of Object.entries(attrs)) if (value !== undefined && value !== null) el.setAttribute(key, String(value));
  appendChildren(el, children);
  return el;
}

function selectEl(options, value, attrs = {}) {
  const el = h("select", attrs);
  for (const [v, label] of options) el.append(h("option", { value: v }, label));
  if (value !== undefined) el.value = value;
  return el;
}

async function copyText(text, statusEl) {
  try {
    await navigator.clipboard.writeText(text);
    if (statusEl) statusEl.textContent = "已复制到剪贴板。";
  } catch {
    const area = h("textarea", { style: "position:fixed;left:-9999px" });
    area.value = text;
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    if (statusEl) statusEl.textContent = ok ? "已复制到剪贴板。" : "复制失败，请在代码框中按 Ctrl+A、Ctrl+C。";
  }
}

function downloadBlob(content, filename, mime = "text/plain;charset=utf-8") {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = h("a", { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function debounce(fn, ms = 150) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

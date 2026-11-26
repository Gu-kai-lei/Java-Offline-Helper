/*
 * Schema-driven forms used by every generator.
 *   field: { key, label, type: text|number|textarea|select|yesno|color|list, options, when, help, wide }
 *   group: { type: "group", title, open, fields }
 *   list:  { key, type: "list", label, row: [fields], newRow(model), itemLabel(row, i) }
 * Text input updates the model and calls onInput (no re-render, so focus stays). Selects and
 * list edits call onChange and re-render, because they can show or hide other fields.
 */
"use strict";

const Form = {
  openGroups: new Map(),

  get(obj, path) { return String(path).split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj); },

  set(obj, path, value) {
    const keys = String(path).split(".");
    let o = obj;
    for (const k of keys.slice(0, -1)) { if (o[k] == null || typeof o[k] !== "object") o[k] = {}; o = o[k]; }
    o[keys[keys.length - 1]] = value;
  },

  render(container, schema, model, handlers) {
    const scroll = container.scrollTop;
    const ctx = { ...handlers, rerender: () => Form.render(container, schema, model, handlers), model };
    setChildren(container, ...Form.list(schema, model, model, ctx));
    container.scrollTop = scroll;
  },

  list(fields, model, target, ctx) {
    const out = [];
    for (const f of fields) {
      if (f.when && !f.when(model, target)) continue;
      out.push(f.type === "group" ? Form.group(f, model, target, ctx) : Form.field(f, model, target, ctx));
    }
    return out;
  },

  group(g, model, target, ctx) {
    const key = g.id || g.title;
    const open = Form.openGroups.has(key) ? Form.openGroups.get(key) : g.open !== false;
    const el = h("details", { class: "form-group", open });
    el.addEventListener("toggle", () => Form.openGroups.set(key, el.open));
    el.append(h("summary", null, g.title), h("div", { class: "form-grid" }, Form.list(g.fields, model, target, ctx)));
    return el;
  },

  options(f, model, target) {
    const raw = typeof f.options === "function" ? f.options(model, target) : f.options;
    if (f.type === "yesno") return [["yes", "是"], ["no", "否"]];
    if (f.type === "color") return Java.COLORS.map(c => [c, c]);
    return raw || [];
  },

  field(f, model, target, ctx) {
    const label = typeof f.label === "function" ? f.label(model, target) : f.label;
    const value = Form.get(target, f.key);
    if (f.type === "list") return Form.listField(f, model, target, ctx, label);
    let control;
    const changed = v => { Form.set(target, f.key, v); ctx.onChange?.(); ctx.rerender(); };
    if (f.type === "select" || f.type === "yesno" || f.type === "color") {
      const opts = Form.options(f, model, target);
      let current = value ?? "";
      let has = opts.some(([v]) => v === current);
      // Empty values, and stale references such as a renamed class (autoFix), take the first option.
      if (!has && (current === "" || f.autoFix) && opts.length) {
        current = opts[0][0];
        Form.set(target, f.key, current);
        has = true;
      }
      control = selectEl(has ? opts : [...opts, [current, current + "（当前值无效）"]], current);
      control.addEventListener("change", () => changed(control.value));
    } else if (f.type === "textarea") {
      control = h("textarea", { rows: f.rows || 4, spellcheck: "false" });
      control.value = value ?? "";
      control.addEventListener("input", () => { Form.set(target, f.key, control.value); ctx.onInput?.(); });
    } else {
      control = h("input", { type: "text", spellcheck: "false", inputmode: f.type === "number" ? "decimal" : undefined });
      control.value = value ?? "";
      control.addEventListener("input", () => { Form.set(target, f.key, control.value); ctx.onInput?.(); });
    }
    if (f.placeholder) control.placeholder = f.placeholder;
    const help = typeof f.help === "function" ? f.help(model, target) : f.help;
    return h("label", { class: "field" + (f.wide || f.type === "textarea" ? " wide" : "") }, h("span", null, label), control,
      help ? h("small", null, help) : null);
  },

  listField(f, model, target, ctx, label) {
    // Drafts saved before a list option existed have no array yet: create it so that rows added now are kept.
    let rows = Form.get(target, f.key);
    if (!Array.isArray(rows)) { rows = []; Form.set(target, f.key, rows); }
    const changed = () => { ctx.onChange?.(); ctx.rerender(); };
    const wrap = h("div", { class: "list-field wide" }, h("div", { class: "list-head" }, h("span", null, label + "（" + rows.length + "）"),
      h("button", { type: "button", class: "small primary", onclick: () => { rows.push(f.newRow(model, rows)); changed(); } }, "＋ 添加")));
    rows.forEach((row, i) => {
      const titleText = () => f.itemLabel ? f.itemLabel(row, i) : "#" + (i + 1);
      const title = h("strong", null, titleText());
      // Typing in a row updates its title straight away (no full re-render, so focus stays).
      const rowCtx = { ...ctx, onInput: () => { title.textContent = titleText(); ctx.onInput?.(); } };
      const tools = h("span", { class: "row-tools" },
        h("button", { type: "button", class: "icon", title: "上移", disabled: i === 0, onclick: () => { rows.splice(i - 1, 0, rows.splice(i, 1)[0]); changed(); } }, "↑"),
        h("button", { type: "button", class: "icon", title: "下移", disabled: i === rows.length - 1, onclick: () => { rows.splice(i + 1, 0, rows.splice(i, 1)[0]); changed(); } }, "↓"),
        h("button", { type: "button", class: "icon danger", title: "删除", disabled: rows.length <= (f.min ?? 0), onclick: () => { rows.splice(i, 1); changed(); } }, "×"));
      wrap.append(h("div", { class: "list-row" }, h("div", { class: "row-title" }, title, tools),
        h("div", { class: "row-grid" }, Form.list(f.row, model, row, rowCtx))));
    });
    return wrap;
  }
};

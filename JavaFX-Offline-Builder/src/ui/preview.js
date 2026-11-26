/*
 * Browser previews of the generated windows. They approximate JavaFX layout so the student can
 * compare with the figures in the exam paper before compiling. The Shape preview is interactive.
 */
"use strict";

const Preview = {
  frame(title, ...body) {
    return h("div", { class: "fx-window" },
      h("div", { class: "fx-titlebar" }, h("span", null, title || "(no title)"), h("span", { class: "fx-dots" }, "—  ☐  ✕")),
      h("div", { class: "fx-body" }, body));
  },

  button(text, onclick, width) {
    return h("button", { type: "button", class: "fx-button", style: width ? "min-width:" + width + "px" : undefined, onclick }, text);
  },

  // ---------- Shape program (interactive) ----------
  oop(model, holder) {
    let m;
    try { m = OopGen.normalize(model); } catch (e) { return h("p", { class: "error" }, "预览不可用：" + e.message); }
    if (!holder.state) holder.state = OopGen.initialState(model);
    // The preview timer stands in for the Timeline; one timer per preview.
    if (Preview.timer) { clearInterval(Preview.timer); Preview.timer = null; }
    const wrap = h("div", { class: "preview-body" });
    const render = () => {
      const s = holder.state;
      const canvas = svg("svg", { width: m.canvasW, height: m.canvasH, viewBox: "0 0 " + m.canvasW + " " + m.canvasH, class: "fx-canvas",
        style: "background:" + Java.cssColor(m.canvasColor) });
      s.shapes.forEach((shape, i) => {
        const el = ShapeKinds[shape.kind].svg(shape.v, shape.x, shape.y, m.anchor);
        const turn = i === s.active && s.angle ? { style: "transform-box:fill-box;transform-origin:center;transform:rotate(" + s.angle + "deg)" } : {};
        canvas.append(svg(el.tag, { ...el.attrs, ...turn, fill: Java.cssColor(shape.color), stroke: i === s.active && s.shapes.length > 1 ? "#222" : "none", "stroke-dasharray": "4 3" }));
      });
      if (m.mouseControl !== "no") {
        canvas.style.cursor = "crosshair";
        canvas.addEventListener("click", e => {
          const box = canvas.getBoundingClientRect();
          holder.state = OopGen.event(model, holder.state, { type: "mouse", onShape: e.target !== canvas,
            x: Math.round((e.clientX - box.left) * m.canvasW / box.width), y: Math.round((e.clientY - box.top) * m.canvasH / box.height) });
          render();
        });
      }
      const items = { top: [], bottom: [], left: [], right: [] };
      if (m.sizeInput) {
        m.inputs.forEach((input, i) => {
          const field = h("input", { type: "text", class: "fx-input", value: s.inputs[i] ?? input.def });
          field.addEventListener("input", () => { holder.state.inputs[i] = field.value; });
          items[m.inputRegion].push(h("span", { class: "fx-label" }, input.label), field);
        });
      }
      m.buttons.forEach((b, i) => items[b.region].push(
        Preview.button(b.text, () => { holder.state = OopGen.apply(model, holder.state, i); render(); }, m.buttonWidth || undefined)));
      if (m.sizeInput && !m.infoLabel) items[m.inputRegion].push(h("span", { class: "fx-label fx-message" }, s.message));
      if (m.statusLabel) items[m.statusRegion].push(h("span", { class: "fx-label fx-message" }, s.status));
      const infoNode = m.infoLabel ? h("span", { class: "fx-label", style: "padding:8px" }, s.label) : null;
      if (infoNode && items[m.infoRegion].length) items[m.infoRegion].push(infoNode);
      const center = h("div", { class: "fx-center" }, canvas);
      const regions = { top: null, bottom: null, left: null, right: null };
      for (const region of Object.keys(items)) {
        if (!items[region].length) continue;
        const vertical = region === "left" || region === "right";
        regions[region] = h("div", { class: "fx-box " + (vertical ? "fx-vbox" : "fx-hbox"), style: "gap:" + m.spacing + "px;padding:" + m.padding + "px" }, items[region]);
      }
      if (infoNode && !regions[m.infoRegion]) regions[m.infoRegion] = infoNode;
      const body = h("div", { class: "fx-border" },
        regions.top ? h("div", { class: "fx-top" }, regions.top) : null,
        h("div", { class: "fx-middle" }, regions.left, center, regions.right),
        regions.bottom ? h("div", { class: "fx-bottom" }, regions.bottom) : null);
      const consoleLines = s.console.slice(-10);
      const frame = Preview.frame(Java.fillProfile(m.title, Profile.value), body);
      if (m.keyControl) {
        frame.tabIndex = 0;
        frame.addEventListener("keydown", e => {
          if (!e.code.startsWith("Arrow")) return;
          e.preventDefault();
          holder.state = OopGen.event(model, holder.state, { type: "key", code: e.code });
          render();
          wrap.querySelector(".fx-window")?.focus();
        });
      }
      if (s.anim && !Preview.timer) {
        Preview.timer = setInterval(() => {
          if (!wrap.isConnected) { clearInterval(Preview.timer); Preview.timer = null; return; }
          holder.state = OopGen.event(model, holder.state, { type: "tick" });
          render();
        }, Math.max(30, m.animInterval));
      } else if (!s.anim && Preview.timer) { clearInterval(Preview.timer); Preview.timer = null; }
      const hints = [m.keyControl ? "先点一下预览窗口，再按方向键" : "", m.mouseControl === "toggle" ? "点击图形切换颜色" : m.mouseControl !== "no" ? "点击画布移动图形" : ""].filter(Boolean);
      setChildren(wrap, 
        frame, ...(hints.length ? [h("p", { class: "hint" }, "预览里也能试：" + hints.join("；") + "。")] : []),
        h("div", { class: "console" }, h("div", { class: "console-head" }, h("span", null, "BlueJ Terminal（模拟控制台输出）"),
          h("button", { type: "button", class: "small", onclick: () => { holder.state = OopGen.initialState(model); render(); } }, "重新开始")),
          h("pre", null, consoleLines.length ? consoleLines.join("\n") : "（点上面窗口里的按钮试运行）")),
        h("details", { class: "checklist" }, h("summary", null, "BlueJ 运行后逐项核对"), h("ol", null, OopGen.checklist(model).map(t => h("li", null, t)))));
    };
    render();
    return wrap;
  },

  // ---------- Drawing ----------
  draw(model) {
    let data;
    try { data = DrawGen.svg(model); } catch (e) { return h("p", { class: "error" }, "预览不可用：" + e.message); }
    const canvas = svg("svg", { width: data.width, height: data.height, viewBox: "0 0 " + data.width + " " + data.height, class: "fx-canvas",
      style: "background:" + data.background });
    for (const el of data.elements) {
      if (el.tag === "text") {
        const lines = el.text.split("\n");
        const t = svg("text", el.attrs);
        lines.forEach((line, i) => t.append(svg("tspan", { x: el.attrs.x, dy: i === 0 ? 0 : "1.2em" }, line)));
        canvas.append(t);
      } else canvas.append(svg(el.tag, el.attrs));
    }
    let title = model.title;
    return h("div", { class: "preview-body" }, Preview.frame(Java.fillProfile(title, Profile.value), canvas),
      h("p", { class: "hint" }, "坐标原点在左上角，y 向下增大。预览按 JavaFX 坐标绘制，字体粗细可能与真实窗口略有差别。"));
  },

  // ---------- Calculator ----------
  calc(model, holder) {
    let m;
    try { m = CalcGen.normalize(model); } catch (e) { return h("p", { class: "error" }, "预览不可用：" + e.message); }
    holder.texts = holder.texts || {};
    const results = h("div");
    const message = h("div", { class: "fx-label fx-message" });
    const run = () => {
      const r = CalcGen.preview(model, holder.texts);
      setChildren(results, ...[...m.outputs.filter(o => o.show), ...m.texts].map(o => {
        const found = r.results?.find(x => x.label === o.label);
        return h("div", { class: "fx-row" }, h("span", { class: "fx-label", style: "width:" + (m.labelWidth || 120) + "px" }, o.label),
          h("span", { class: "fx-label strong" }, r.error ? (m.errorMode === "label" ? "Invalid input" : "-") : found ? found.text : "-"));
      }));
      message.textContent = r.error ? (m.errorMode === "alert" ? "[Alert] " : "") + r.error : "";
    };
    const inputs = m.inputs.map(x => {
      const input = h("input", { type: "text", class: "fx-input", value: holder.texts[x.name] ?? x.def });
      input.addEventListener("input", () => { holder.texts[x.name] = input.value; });
      return h("div", { class: "fx-row" }, h("span", { class: "fx-label", style: "width:" + (m.labelWidth || 120) + "px" }, x.label), input);
    });
    const body = h("div", { class: "fx-vbox", style: "gap:10px;padding:15px" }, inputs,
      h("div", { class: "fx-hbox", style: "gap:10px" }, Preview.button(m.buttonText, run),
        m.clearButton ? Preview.button("Clear", () => { holder.texts = Object.fromEntries(m.inputs.map(x => [x.name, ""])); holder.rerender(); }) : null),
      results, message);
    run();
    return h("div", { class: "preview-body" }, Preview.frame(Java.fillProfile(m.title, Profile.value), body),
      h("p", { class: "hint" }, "可以在预览里改输入再点按钮，结果按 Java 的 int / double 规则计算，用来核对公式。"),
      Preview.checklist(() => CalcGen.checklist(model)));
  },

  // ---------- Record manager (static layout) ----------
  record(model) {
    let m;
    try { m = RecordGen.normalize(model); } catch (e) { return h("p", { class: "error" }, "预览不可用：" + e.message); }
    const rows = m.sampleRows;
    const show = row => m.displayFormat
      ? m.displayFormat.replace(/\{(\w+)(?::([^}]*))?\}/g, (all, name, fmt) => {
        const i = m.fields.findIndex(f => f.name === name);
        if (i < 0) return all;
        const d = /^\.(\d+)f$/.exec(fmt || "");
        return d ? Number(row[i]).toFixed(Number(d[1])) : row[i];
      })
      : m.fields.map((f, i) => f.type === "boolean" ? (/^true$/i.test(row[i]) ? f.label : "Not " + f.label.toLowerCase()) : row[i]).join("  |  ");
    const header = m.header ? h("div", { class: "fx-vbox", style: "padding:10px;gap:4px" },
      m.headerLines.map(l => h("div", { class: "fx-label" }, Java.fillProfile(l, Profile.value))),
      m.showStart ? h("div", { class: "fx-label" }, "Program Started: 2026-11-26 08:30:00") : null) : null;
    const list = m.display === "textarea"
      ? h("pre", { class: "fx-list fx-textarea" }, rows.map(show).join("\n"))
      : h("div", { class: "fx-list" }, rows.length ? rows.map(r => h("div", null, show(r))) : h("div", { class: "muted" }, "No " + m.noun + " records"));
    const formItems = m.formFields.flatMap(f => f.type === "boolean" ? [h("label", { class: "fx-label" }, "☐ " + f.label)]
      : [h("span", { class: "fx-label" }, f.label + ":"), h("span", { class: "fx-input" })]);
    if (m.f.clear) formItems.push(Preview.button("Clear"));
    const b = names => names.filter(Boolean).map(n => Preview.button(n));
    const T = m.texts;
    const row1 = b([m.f.add && T.add, m.f.edit && T.edit, m.f.edit && T.save, m.f.del && T.del, m.f.search && T.search]);
    const row2 = b([m.f.display && T.display, m.f.loadTest && T.loadTest, ...m.filters.map(x => x.text), ...m.toggles.map(t => t.text),
      ...m.adjusts.map(a => a.text), m.f.stats && m.statsText, m.manual && T.saveFile, m.manual && T.loadFile, m.f.exit && T.exit]);
    const row3 = b(m.f.sort ? m.fields.filter(f => f.sort).map(f => "Sort by " + f.label) : []);
    const bottom = h("div", { class: "fx-vbox", style: "padding:10px;gap:8px" }, h("div", { class: "fx-hbox", style: "gap:8px" }, formItems),
      [row1, row2, row3].filter(r => r.length).map(r => h("div", { class: "fx-hbox", style: "gap:8px" }, r)), h("div", { class: "fx-label" }, "Ready"));
    return h("div", { class: "preview-body" }, Preview.frame(Java.fillProfile(m.title, Profile.value), h("div", { class: "fx-border" }, header, list, bottom)),
      h("p", { class: "hint" }, "列表里显示的是「Load Test Data」之后的样子；程序刚启动且没有 " + m.file + " 时列表为空。"),
      Preview.checklist(() => RecordGen.checklist(model)));
  },

  checklist(make) {
    let steps;
    try { steps = make(); } catch (e) { return null; }
    return h("details", { class: "checklist" }, h("summary", null, "BlueJ 运行后逐项核对"), h("ol", null, steps.map(t => h("li", null, t))));
  },

  // JavaFX CSS from the style block -> browser CSS for the preview (only the common properties).
  fxStyle(css) {
    const map = { "-fx-text-fill": "color", "-fx-font-size": "font-size", "-fx-background-color": "background", "-fx-border-color": "border-color",
      "-fx-font-weight": "font-weight", "-fx-padding": "padding", "-fx-font-style": "font-style" };
    return String(css || "").split(";").map(rule => rule.split(":")).filter(p => p.length === 2 && map[p[0].trim()])
      .map(([key, value]) => map[key.trim()] + ":" + value.trim() + (key.trim() === "-fx-border-color" ? ";border-style:solid" : "")).join(";");
  },

  // CSS for one BorderPane region container: HBox / VBox / FlowPane (wraps) / StackPane (children on top of each other).
  layoutClass(L) {
    return { HBox: "fx-hbox", VBox: "fx-vbox", FlowPane: "fx-hbox fx-flow", StackPane: "fx-stack" }[L.box] || "fx-hbox";
  },
  layoutStyle(L) {
    const gap = Number(L.spacing) || 0, pad = Number(L.padding) || 0;
    const [v = "", hz = ""] = String(L.align || "").split("_");
    const main = { LEFT: "flex-start", CENTER: "center", RIGHT: "flex-end" }, cross = { TOP: "flex-start", CENTER: "center", BOTTOM: "flex-end" };
    const vertical = L.box === "VBox";
    const parts = ["gap:" + gap + "px", "padding:" + pad + "px"];
    if (L.align) {
      const horizontal = hz ? main[hz] : main.CENTER, verticalPos = cross[v] || "center";
      if (L.box === "StackPane") parts.push("place-items:" + ({ "flex-start": "start", "flex-end": "end", center: "center" }[verticalPos]) + " " + ({ "flex-start": "start", "flex-end": "end", center: "center" }[horizontal]));
      else parts.push("justify-content:" + (vertical ? verticalPos : horizontal), "align-items:" + (vertical ? horizontal : verticalPos));
    }
    const css = Preview.fxStyle(String(L.style || ""));
    return parts.join(";") + (css ? ";" + css : "");
  },

  // ---------- Block workbench: run supported visual blocks against a preview state ----------
  blocks(project) {
    const comps = project.components;
    const runtime = BlockPreview.create(project);
    const state = runtime.state, syncers = [];
    const status = h("p", { class: "preview-status", role: "status" }, "就绪。键盘题请先点预览区。");
    const mount = h("div", { class: "workbench-preview", tabindex: "0", "aria-label": "可操作的积木预览" });
    const timers = new Map();
    const syncTimers = () => {
      for (const c of comps.filter(n => n.type === "Timeline")) {
        const running = state[c.id].running && mount.isConnected;
        if (running && !timers.has(c.id)) {
          timers.set(c.id, setInterval(() => {
            if (!mount.isConnected) { clearInterval(timers.get(c.id)); timers.delete(c.id); return; }
            dispatch("tick", [c.id]);
          }, Math.max(50, Number(c.interval) || 1000)));
        } else if (!running && timers.has(c.id)) { clearInterval(timers.get(c.id)); timers.delete(c.id); }
      }
    };
    const sync = () => { syncers.forEach(fn => fn()); syncTimers(); };
    const dispatch = (type, targets, detail) => {
      const r = runtime.send(type, targets, detail);
      sync();
      if (r.notes.length || r.ran || r.unsupportedEvent) {
        status.textContent = [...r.notes, r.unsupportedEvent ? "此事件含进阶 Java，需在 BlueJ 运行。" : "",
          !r.notes.length && r.ran ? "已执行：" + Blocks.eventTypes[type].label : ""].filter(Boolean).join("  ");
      }
      return r;
    };
    const regions = { top: [], bottom: [], left: [], right: [], center: [] };
    for (const c of comps) {
      if (Blocks.controls.includes(c.type)) {
        const data = { "data-preview-id": c.id, "aria-label": c.name };
        const el = c.type === "TextField" ? h("input", { ...data, type: "text", class: "fx-input", value: c.text })
          : c.type === "Label" ? h("span", { ...data, class: "fx-label" }, c.text)
          : h("button", { ...data, type: "button", class: "fx-button" }, c.text);
        const node = state[c.id];
        syncers.push(() => {
          el.hidden = !node.visible;
          el.setAttribute("style", Preview.fxStyle(node.style));
          if (el.tagName !== "SPAN") el.disabled = node.disabled;
          if (c.type === "TextField") { if (el.value !== node.text) el.value = node.text; }
          else {
            const mark = c.type === "CheckBox" ? (node.selected ? "☑ " : "☐ ") : c.type === "RadioButton" ? (node.selected ? "◉ " : "○ ") : "";
            el.textContent = mark + node.text;
          }
        });
        if (c.type === "TextField") {
          el.addEventListener("input", () => { node.text = el.value; });
          el.addEventListener("keydown", e => {
            if (e.key === "Enter") { node.text = el.value; dispatch("action", [c.id]); }
          });
        } else if (Blocks.isAction(c)) {
          el.addEventListener("click", () => {
            if (c.type === "CheckBox") node.selected = !node.selected;
            if (c.type === "RadioButton") {
              for (const other of comps) if (other.type === "RadioButton") state[other.id].selected = other.id === c.id;
            }
            dispatch("action", [c.id]);
          });
        }
        (regions[c.region] || regions.bottom).push(el);
      } else if (c.type === "ImageView") {
        // The preview cannot read the image file; a frame stands in for it and turns with setRotate.
        const node = state[c.id];
        const el = h("div", { "data-preview-id": c.id, class: "fx-image" }, "🖼 " + c.file);
        syncers.push(() => { el.hidden = !node.visible; el.style.transform = "rotate(" + node.rotate + "deg)"; el.style.width = (node.fitWidth || 120) + "px"; });
        (regions[c.region] || regions.left).push(el);
      }
    }
    const listenPointer = (el, id, canvas) => {
      const types = { click: "clicked", mousedown: "pressed", mouseup: "released", mouseenter: "entered", mouseleave: "exited" };
      const eventData = e => {
        const r = canvas.getBoundingClientRect();
        const view = canvas.getAttribute("viewBox").split(" ").map(Number);
        return { x: (e.clientX - r.left) * view[2] / (r.width || view[2]),
          y: (e.clientY - r.top) * view[3] / (r.height || view[3]), button: ["PRIMARY", "MIDDLE", "SECONDARY"][e.button],
          shiftKey: e.shiftKey, controlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey };
      };
      for (const [type, method] of Object.entries(types)) el.addEventListener(type, e => dispatch(method, [id], eventData(e)));
      el.addEventListener("mousemove", e => dispatch(e.buttons ? "dragged" : "moved", [id], eventData(e)));
    };
    const drawings = comps.filter(c => ["Circle", "Rectangle", "Ellipse", "Text"].includes(c.type));
    const paneModel = comps.filter(c => c.type === "Pane");
    const rootType = Blocks.rootTypeOf(project);
    const winW = Number(project.config.width) || 400, winH = Number(project.config.height) || 300;
    // Shapes outside every Pane: a Pane root draws them on the whole window, other roots in a Group-like canvas.
    if (drawings.some(c => !paneModel.some(p => p.id === c.pane))) paneModel.push({ id: "", width: rootType === "Pane" ? winW : 400, height: rootType === "Pane" ? winH : 260 });
    const panes = paneModel.map(p => {
      const w = Number(p.width) || 300, hgt = Number(p.height) || 200;
      const canvas = svg("svg", { width: w, height: hgt, viewBox: "0 0 " + w + " " + hgt, class: "fx-canvas",
        style: "background:white", "data-preview-id": p.id });
      for (const c of drawings.filter(n => p.id ? n.pane === p.id : !paneModel.some(pane => pane.id && pane.id === n.pane))) {
        const node = state[c.id];
        const shape = svg({ Circle: "circle", Rectangle: "rect", Ellipse: "ellipse", Text: "text" }[c.type], { "data-preview-id": c.id });
        syncers.push(() => {
          const attrs = { fill: Java.cssColor(node.color), visibility: node.visible ? "visible" : "hidden",
            transform: "rotate(" + node.rotate + " " + node.x + " " + node.y + ")" };
          if (c.type === "Circle") Object.assign(attrs, { cx: node.x, cy: node.y, r: node.radius });
          if (c.type === "Ellipse") Object.assign(attrs, { cx: node.x, cy: node.y, rx: node.radiusX, ry: node.radiusY });
          if (c.type === "Rectangle") Object.assign(attrs, { x: node.x, y: node.y, width: node.width, height: node.height, rx: (Number(node.arc) || 0) / 2 });
          if (c.type === "Text") { Object.assign(attrs, { x: node.x, y: node.y, "font-size": 13 }); shape.textContent = node.text; }
          for (const [key, value] of Object.entries(attrs)) shape.setAttribute(key, String(value));
        });
        listenPointer(shape, c.id, canvas);
        canvas.append(shape);
      }
      if (p.id) listenPointer(canvas, p.id, canvas);
      return canvas;
    });
    const key = (type, e) => {
      const id = e.target.closest?.("[data-preview-id]")?.getAttribute("data-preview-id");
      const r = dispatch(type, id ? [id, "root", "scene"] : ["root", "scene"], { code: BlockPreview.keyCode(e), text: e.key.length === 1 ? e.key : "",
        shiftKey: e.shiftKey, controlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey });
      if ((r.ran || r.consumed) && e.target.tagName !== "INPUT") e.preventDefault();
    };
    mount.addEventListener("keydown", e => key("key", e));
    mount.addEventListener("keyup", e => key("keyReleased", e));
    for (const canvas of panes) canvas.addEventListener("click", () => mount.focus());
    // Each BorderPane region is drawn with the container chosen in the layout settings (HBox, VBox, FlowPane, StackPane).
    const dynamic = Blocks.dynamicRegions(project);
    const box = (region, items) => {
      if (!items.length && !dynamic.has(region)) return null;
      const el = h("div", { class: "fx-box " + Preview.layoutClass(Blocks.layoutOf(project, region)), style: Preview.layoutStyle(Blocks.layoutOf(project, region)) }, items);
      const extra = [];
      syncers.push(() => {
        extra.forEach(node => node.remove());
        extra.length = 0;
        for (const item of runtime.added[region]) {
          const node = item.type === "Button" ? h("button", { type: "button", class: "fx-button" }, item.text) : h("span", { class: "fx-label" }, item.text);
          extra.push(node); el.append(node);
        }
      });
      return el;
    };
    let rootEl;
    if (rootType === "BorderPane") {
      const centerBox = regions.center.length || dynamic.has("center") || project.config?.layout?.center
        ? box("center", [...panes, ...regions.center])
        // Several Panes / a Group in the centre: the code puts them in an HBox, side by side
        : h("div", { class: "fx-center", style: panes.length > 1 ? "flex-wrap:nowrap;align-items:flex-start;overflow-x:auto" : "" }, panes);
      rootEl = h("div", { class: "fx-border" }, box("top", regions.top), h("div", { class: "fx-middle" }, box("left", regions.left),
        h("div", { class: "fx-center" }, centerBox), box("right", regions.right)), box("bottom", regions.bottom));
    } else {
      // No regions: every Pane, control and image goes straight into the root, in the order they were added.
      const byId = new Map([...Object.values(regions).flat(), ...panes].map(el => [el.getAttribute("data-preview-id"), el]));
      const items = [];
      let shapesShown = false;
      for (const c of comps) {
        if (byId.has(c.id)) items.push([c.id, byId.get(c.id)]);
        else if (drawings.includes(c) && byId.has("") && !shapesShown) { shapesShown = true; items.push(["", byId.get("")]); }
      }
      const added = h("div", { class: "fx-added" });
      syncers.push(() => {
        const all = Object.values(runtime.added).flat();
        setChildren(added, ...all.map(item => item.type === "Button" ? h("button", { type: "button", class: "fx-button" }, item.text) : h("span", { class: "fx-label" }, item.text)));
      });
      if (rootType === "Pane") {
        // Free coordinates: relocate(x, y) for controls and Panes; shapes keep their own coordinates.
        const places = Blocks.placements(project);
        // Each node sits in its own positioned wrapper: the syncers rewrite the node's style attribute.
        // The canvas of loose shapes stays underneath, so it never covers a button.
        for (const item of items) {
          const [id, el] = item;
          const [x, y] = id ? places.get(id) || [0, 0] : [0, 0];
          if (!id) el.style.background = "transparent";
          item[1] = h("div", { style: "position:absolute;left:" + x + "px;top:" + y + "px;z-index:" + (id ? 1 : 0) }, el);
        }
        added.style.cssText = "position:absolute;left:0;top:0;display:flex;gap:4px";
        rootEl = h("div", { class: "fx-border fx-free", style: "position:relative;width:" + winW + "px;height:" + winH + "px;" + Preview.fxStyle(Blocks.layoutOf(project, "root").style) },
          items.map(([, el]) => el), added);
      } else {
        const L = { ...Blocks.layoutOf(project, "root"), box: rootType };
        rootEl = h("div", { class: "fx-border fx-box " + Preview.layoutClass(L), style: Preview.layoutStyle(L) }, items.map(([, el]) => el), added);
        added.style.display = "contents";
      }
    }
    if (project.events.some(e => Blocks.targetsOf(e).includes("root"))) {
      // Handlers registered on the BorderPane root: e.getX()/getY() are relative to the window content.
      const rootData = e => {
        const r = rootEl.getBoundingClientRect();
        return { x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top), button: ["PRIMARY", "MIDDLE", "SECONDARY"][e.button],
          shiftKey: e.shiftKey, controlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey };
      };
      const types = { click: "clicked", mousedown: "pressed", mouseup: "released", mouseenter: "entered", mouseleave: "exited" };
      for (const [type, method] of Object.entries(types)) rootEl.addEventListener(type, e => dispatch(method, ["root"], rootData(e)));
      rootEl.addEventListener("mousemove", e => dispatch(e.buttons ? "dragged" : "moved", ["root"], rootData(e)));
      rootEl.addEventListener("contextmenu", e => e.preventDefault());
    }
    mount.append(Preview.frame(Java.fillProfile(project.config.title || project.config.className, Profile.value), rootEl));
    sync();
    return h("div", { class: "preview-body" }, mount, status,
      h("button", { type: "button", class: "small", onclick: () => {
        runtime.reset(); for (const id of [...timers.keys()]) { clearInterval(timers.get(id)); timers.delete(id); } sync(); status.textContent = "已重置预览。";
      } }, "重置预览"),
      h("p", { class: "hint" }, "这里试积木逻辑；窗口事件、进阶 Java 和最终效果请在 BlueJ 运行验证。"));
  }
};

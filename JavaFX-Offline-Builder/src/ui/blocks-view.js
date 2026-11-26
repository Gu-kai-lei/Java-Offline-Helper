/* Block workbench view (ported from builder v1): components, events and nested action blocks. */
"use strict";

const BlocksView = {
  id: "blocks", title: "积木工作台",
  render(main) {
    let project = Store.get("draft.blocks", null) || Blocks.preset("mouse");
    let active = 0;
    const expanded = new Set();
    let dragged = null, showAdvanced = false;
    let checkpoint = JSON.stringify(project);
    const undoStack = [], redoStack = [];
    const settings = h("div");
    const eventList = h("div", { class: "event-list" });
    const toolbox = h("div", { class: "block-toolbox" });
    const workspaceNote = h("p", { class: "action-note", role: "status" });
    const editorHead = h("div", { class: "editor-head" });
    const editor = h("div", { class: "block-editor" });
    const previewBox = h("div", { class: "preview-box" });
    const output = OutputPanel({ title: "完整 Java 程序", beforeExport: () => refresh(false) });
    const snippet = h("textarea", { class: "code small-code", readonly: true, wrap: "off", spellcheck: "false" });
    const snippetStatus = h("p", { class: "action-note" });

    const save = () => {
      const next = JSON.stringify(project);
      if (next !== checkpoint) {
        undoStack.push(checkpoint);
        if (undoStack.length > 60) undoStack.shift();
        redoStack.length = 0;
        checkpoint = next;
      }
      undoBtn.disabled = !undoStack.length;
      redoBtn.disabled = !redoStack.length;
      Store.set("draft.blocks", project);
    };
    const restore = (from, to) => {
      save();
      if (!from.length) return;
      to.push(checkpoint);
      checkpoint = from.pop();
      project = JSON.parse(checkpoint);
      active = Math.max(0, Math.min(active, project.events.length - 1));
      renderAll();
    };
    const undoBtn = h("button", { type: "button", class: "small", onclick: () => restore(undoStack, redoStack) }, "撤销");
    const redoBtn = h("button", { type: "button", class: "small", onclick: () => restore(redoStack, undoStack) }, "重做");
    const refresh = (rebuildPreview = true) => {
      save();
      try { output.show(Blocks.generate(project, true, Profile.value)); } catch (e) { output.show(null, e.message); }
      try { snippet.value = Blocks.generate(project, false, Profile.value); } catch (e) { snippet.value = "// " + e.message; }
      if (rebuildPreview) setChildren(previewBox, Preview.blocks(project));
    };
    const lazy = debounce(refresh, 250);
    const changed = (structure = true) => { workspaceNote.textContent = ""; if (structure) renderAll(); else lazy(); };

    const input = (label, value, onInput, onChange) => {
      const el = h("input", { type: "text", value, spellcheck: "false" });
      el.addEventListener("input", () => onInput(el.value));
      if (onChange) el.addEventListener("change", onChange);
      return h("label", { class: "field" }, h("span", null, label), el);
    };
    const refSelect = (options, selected, placeholder = "选择") => {
      const entries = [["", placeholder], ...options];
      if (selected && !options.some(([id]) => id === selected)) entries.push([selected, "（已删除或不适用）"]);
      return selectEl(entries, selected || "");
    };

    // Position fields: the BorderPane region, or x / y for relocate() when the root is a Pane.
    const placeFields = (node, fields, defaultRegion) => {
      const rootType = Blocks.rootTypeOf(project);
      if (rootType === "BorderPane") {
        if (node.type === "Pane") return;                    // Panes go to the centre
        const region = selectEl(Blocks.regions, node.region || defaultRegion);
        region.addEventListener("change", () => { node.region = region.value; changed(); });
        fields.push(h("label", { class: "field" }, h("span", null, "位置（BorderPane 区域）"), region));
      } else if (rootType === "Pane") {
        const [x, y] = Blocks.placements(project).get(node.id) || [0, 0];
        const xy = (key, label, auto) => {
          const el = h("input", { type: "text", value: node[key] ?? "", placeholder: "自动：" + auto, spellcheck: "false" });
          el.addEventListener("input", () => { node[key] = el.value; changed(false); });
          return h("label", { class: "field" }, h("span", null, label), el);
        };
        fields.push(xy("lx", "X（relocate，留空 = 自动）", x), xy("ly", "Y（relocate）", y));
      } else {
        fields.push(h("p", { class: "hint wide" }, "根节点是 " + rootType + "：按添加顺序放进 root。"));
      }
    };

    function renderSettings() {
      const typeSelect = selectEl(Blocks.types.map(t => [t, t]), "Button", { "aria-label": "新控件类型" });
      // Name and text can be typed before adding, so one click creates a ready control.
      const nameInput = h("input", { type: "text", spellcheck: "false", placeholder: "变量名（可空）", "aria-label": "新控件变量名", class: "short" });
      const textInput = h("input", { type: "text", spellcheck: "false", placeholder: "文字（可空）", "aria-label": "新控件文字", class: "short" });
      const addBtn = h("button", { type: "button", class: "primary small", onclick: () => {
        const overrides = {};
        if (nameInput.value.trim()) overrides.name = nameInput.value.trim();
        if (textInput.value !== "") overrides.text = textInput.value;
        const node = Blocks.addComponent(project, typeSelect.value, overrides);
        expanded.add(node.id);
        changed();
      } }, "添加控件");
      const cards = project.components.map(node => {
        const card = h("details", { class: "component-card", open: expanded.has(node.id) });
        card.addEventListener("toggle", () => card.open ? expanded.add(node.id) : expanded.delete(node.id));
        const field = (key, label) => input(label, node[key], v => { node[key] = v; changed(false); }, key === "name" ? () => changed() : undefined);
        const fields = [field("name", "变量名")];
        if (node.type === "Pane") { fields.push(field("width", "宽"), field("height", "高")); placeFields(node, fields, "center"); }
        if (node.type === "Timeline") fields.push(field("interval", "间隔（毫秒）"));
        if (node.type === "ImageView") {
          fields.push(field("file", "图片文件（项目文件夹里的路径）"), field("fitWidth", "显示宽度（留空 = 原尺寸，保持比例）"));
          placeFields(node, fields, "left");
        }
        if (["Circle", "Rectangle", "Ellipse", "Text"].includes(node.type)) {
          const centred = node.type === "Circle" || node.type === "Ellipse";
          fields.push(field("x", centred ? "圆心 X" : "X"), field("y", centred ? "圆心 Y" : "Y"));
          if (node.type === "Circle") fields.push(field("radius", "半径"));
          if (node.type === "Ellipse") fields.push(field("radiusX", "横半径"), field("radiusY", "纵半径"));
          if (node.type === "Circle" || node.type === "Ellipse") {
            const bind = selectEl([["no", "否：用上面的圆心坐标"], ["yes", "是：圆心永远在所在 Pane 的中心（窗口变大也居中）"]], node.bind === "yes" ? "yes" : "no");
            bind.addEventListener("change", () => { node.bind = bind.value; changed(false); });
            fields.push(h("label", { class: "field wide" }, h("span", null, "圆心属性绑定（bind）"), bind));
          }
          if (node.type === "Rectangle") fields.push(field("width", "宽"), field("height", "高"), field("arc", "圆角（0 = 直角）"));
          if (node.type === "Text") fields.push(field("text", "文字"));
          const color = selectEl(Blocks.colors.map(c => [c, c]), node.color);
          color.addEventListener("change", () => { node.color = color.value; changed(false); });
          const pane = refSelect(Blocks.options(project, "Pane").map(p => [p.id, Blocks.caption(p)]), node.pane,
            Blocks.rootTypeOf(project) === "Pane" ? "不放进 Pane（直接放在 root）" : "不放进 Pane（用 Group）");
          pane.addEventListener("change", () => { node.pane = pane.value; changed(false); });
          fields.push(h("label", { class: "field" }, h("span", null, "颜色"), color), h("label", { class: "field" }, h("span", null, "放在"), pane));
        }
        if (Blocks.controls.includes(node.type)) {
          fields.push(field("text", node.type === "Label" || node.type === "TextField" ? "初始文字" : "显示的文字"));
          if (node.type === "CheckBox" || node.type === "RadioButton") {
            const selected = selectEl([["no", "否"], ["yes", "是"]], node.selected || "no");
            selected.addEventListener("change", () => { node.selected = selected.value; changed(false); });
            fields.push(h("label", { class: "field" }, h("span", null, "一开始就选中"), selected));
          }
          placeFields(node, fields, "bottom");
        }
        card.append(h("summary", null, Blocks.caption(node)), h("div", { class: "form-grid" }, fields),
          h("button", { type: "button", class: "small danger", onclick: () => {
            project.components = project.components.filter(n => n.id !== node.id);
            for (const n of project.components) if (n.pane === node.id) n.pane = "";
            changed();
          } }, "移除此控件"));
        return card;
      });
      const config = project.config;
      const shell = h("details", { class: "component-card" }, h("summary", null, "类名、标题、窗口大小"),
        h("div", { class: "form-grid" },
          input("类名", config.className, v => { config.className = v; changed(false); }),
          input("窗口标题（{name} = 姓名）", config.title ?? "", v => { config.title = v; changed(false); }),
          input("Stage 变量名", config.stage, v => { config.stage = v; changed(false); }),
          input("Scene 变量名", config.scene, v => { config.scene = v; changed(false); }),
          input("窗口宽（留空 = 自动）", config.width ?? "", v => { config.width = v; changed(false); }),
          input("窗口高（留空 = 自动）", config.height ?? "", v => { config.height = v; changed(false); })));
      // Variables become fields of the class: every event can read and change them (count, locked, saved name ...).
      project.variables = project.variables || [];
      const varType = selectEl(Blocks.varTypes.map(t => [t, t]), "int", { "aria-label": "新变量类型" });
      const varName = h("input", { type: "text", spellcheck: "false", placeholder: "变量名", "aria-label": "新变量名", class: "short" });
      const varValue = h("input", { type: "text", spellcheck: "false", placeholder: "初始值", "aria-label": "新变量初始值", class: "short" });
      const varRows = project.variables.map(variable => {
        const value = variable.type === "boolean" ? selectEl([["false", "false"], ["true", "true"]], variable.value === "true" ? "true" : "false") : h("input", { type: "text", spellcheck: "false" });
        if (value.tagName === "INPUT") value.value = variable.value ?? "";
        value.addEventListener(value.tagName === "SELECT" ? "change" : "input", () => { variable.value = value.value; changed(false); });
        return h("div", { class: "form-grid" },
          input("变量名（" + variable.type + "）", variable.name, v => { variable.name = v; changed(false); }, () => changed()),
          h("label", { class: "field" }, h("span", null, "初始值"), value),
          h("button", { type: "button", class: "small danger", onclick: () => {
            project.variables = project.variables.filter(v => v.id !== variable.id); changed();
          } }, "删除变量 " + variable.name));
      });
      const variables = h("details", { class: "component-card variables-card", open: true }, h("summary", null, "变量（类的字段，所有事件共用）"),
        ...varRows, h("div", { class: "add-row" }, varType, varName, varValue, h("button", { type: "button", class: "small", onclick: () => {
          const overrides = {};
          if (varName.value.trim()) overrides.name = varName.value.trim();
          if (varValue.value.trim() !== "") overrides.value = varValue.value.trim();
          Blocks.addVariable(project, varType.value, overrides);
          changed();
        } }, "添加变量")));
      // BorderPane layout: container type, spacing, padding, alignment and CSS of each region.
      const order = ["top", "left", "center", "right", "bottom"];
      const layoutRows = [...Blocks.regions].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0])).map(([region, label]) => {
        const L = Blocks.layoutOf(project, region);
        const set = (key, value) => {
          config.layout = config.layout || {};
          config.layout[region] = { ...Blocks.layoutOf(project, region), [key]: value };
          changed(false);
        };
        const boxSel = selectEl(Blocks.layoutBoxes.map(b => [b, b]), L.box, { "aria-label": label + " 容器" });
        boxSel.addEventListener("change", () => { set("box", boxSel.value); changed(); });
        const alignSel = selectEl(Blocks.layoutAlign.map(a => [a, a || "默认"]), L.align, { "aria-label": label + " 对齐" });
        alignSel.addEventListener("change", () => set("align", alignSel.value));
        const used = project.components.filter(c => (c.region || (c.type === "ImageView" ? "left" : "bottom")) === region &&
          (Blocks.controls.includes(c.type) || c.type === "ImageView")).map(c => c.name);
        if (region === "center") used.unshift(...project.components.filter(c => c.type === "Pane").map(c => c.name));
        const style = input("样式 setStyle（可空）", L.style, v => set("style", v));
        style.classList.add("wide");
        return h("details", { class: "layout-row", open: used.length > 0 },
          h("summary", { class: "layout-region" }, label, " · ", L.box, h("small", null, used.length ? "：" + used.join("、") : "：（空）")),
          h("div", { class: "layout-grid" },
            h("label", { class: "field" }, h("span", null, "容器"), boxSel),
            h("label", { class: "field" }, h("span", null, "对齐"), alignSel),
            input("间距", L.spacing, v => set("spacing", v)),
            input("内边距", L.padding, v => set("padding", v)),
            style));
      });
      const rootType = Blocks.rootTypeOf(project);
      const rootSelect = selectEl(Blocks.rootTypes, rootType, { "aria-label": "根节点类型" });
      rootSelect.addEventListener("change", () => { config.rootType = rootSelect.value; changed(); });
      let rootRows = [];
      if (rootType !== "BorderPane") {
        const L = Blocks.layoutOf(project, "root");
        const set = (key, value) => { config.layout = config.layout || {}; config.layout.root = { ...Blocks.layoutOf(project, "root"), [key]: value }; changed(false); };
        const alignSel = selectEl(Blocks.layoutAlign.map(a => [a, a || "默认"]), L.align, { "aria-label": "root 对齐" });
        alignSel.addEventListener("change", () => set("align", alignSel.value));
        const style = input("root 样式 setStyle（可空）", L.style, v => set("style", v));
        style.classList.add("wide");
        rootRows = [h("div", { class: "layout-grid" }, ...(rootType === "Pane" ? [] : [
          input("间距", L.spacing, v => set("spacing", v)), input("内边距", L.padding, v => set("padding", v)),
          h("label", { class: "field" }, h("span", null, "对齐"), alignSel)]), style)];
      }
      const layout = h("details", { class: "component-card layout-card", open: rootType !== "BorderPane" },
        h("summary", null, "布局 · 根节点 " + rootType),
        h("label", { class: "field" }, h("span", null, "根节点（root）类型"), rootSelect),
        h("p", { class: "hint" }, rootType === "BorderPane"
          ? "控件卡片里选「位置」决定放进哪个区域；下面决定每个区域用什么容器。FlowPane 放不下会换行，StackPane 把控件叠在中间。"
          : rootType === "Pane"
            ? "Pane 根节点：不再多套一层，图形直接放进 root；控件和 Pane 用 relocate(x, y) 摆放（控件卡片里填 X / Y）。事件可注册到 root。"
            : "所有控件、Pane 和图片按添加顺序放进 root；事件可注册到 root。"),
        ...(rootType === "BorderPane" ? layoutRows : rootRows),
        h("button", { type: "button", class: "small", onclick: () => { delete config.layout; delete config.rootType; changed(); } }, "恢复默认布局（BorderPane）"));
      setChildren(settings, h("div", { class: "add-row" }, typeSelect, nameInput, textInput, addBtn), ...cards, variables, layout, shell);
    }

    function renderEvents() {
      setChildren(eventList, ...project.events.map((event, index) => {
        const target = Blocks.eventTargets(project, event.type).find(([id]) => id === event.target);
        return h("button", { type: "button", class: "event-card" + (index === active ? " active" : ""), onclick: () => { active = index; renderAll(); } },
          h("strong", null, Blocks.eventTypes[event.type].label), h("code", null, target ? target[1] : "未选择注册对象"));
      }));
      // Pick the event and the object it is registered on in one go.
      const typeSelect = selectEl(Object.entries(Blocks.eventTypes).map(([k, s]) => [k, s.label]), "action", { "aria-label": "新事件类型" });
      const targetSelect = h("select", { "aria-label": "新事件注册到" });
      const fillTargets = () => {
        const options = Blocks.eventTargets(project, typeSelect.value);
        const preferred = Blocks.defaultTarget(project, typeSelect.value);
        setChildren(targetSelect, ...options.map(([id, label]) => h("option", { value: id }, label)));
        targetSelect.value = preferred;
      };
      typeSelect.addEventListener("change", fillTargets);
      fillTargets();
      eventList.append(h("div", { class: "add-row" }, typeSelect, targetSelect, h("button", { type: "button", class: "primary small", onclick: () => {
        project.events.push(Blocks.event(typeSelect.value, targetSelect.value || Blocks.defaultTarget(project, typeSelect.value), []));
        active = project.events.length - 1;
        changed();
      } }, "添加事件")));
    }

    function renderEditor() {
      const event = project.events[active];
      if (!event) {
        setChildren(editorHead, h("h3", null, "积木"));
        setChildren(editor, h("p", { class: "muted" }, "先添加控件和事件，再在这里拼动作积木。"));
        return;
      }
      const type = selectEl(Object.entries(Blocks.eventTypes).map(([k, s]) => [k, s.label]), event.type);
      type.addEventListener("change", () => {
        const kind = Blocks.eventTypes[type.value].kind;
        const fits = items => items.every(item => (!Blocks.specs[item.type].event || Blocks.specs[item.type].event === kind) && fits(item.yes) && fits(item.no));
        if (!fits(event.actions)) { type.value = event.type; alert("先删除不适用于新事件的积木，再切换事件类型。"); return; }
        event.type = type.value;
        if (!Blocks.eventTargets(project, event.type).some(([id]) => id === event.target)) event.target = Blocks.defaultTarget(project, event.type);
        if (kind !== "action" && event.style === "shared") event.style = "lambda";
        changed();
      });
      const target = refSelect(Blocks.eventTargets(project, event.type), event.target, "选择注册对象");
      target.addEventListener("change", () => { event.target = target.value; changed(); });
      const styles = [["lambda", "Lambda"], ["anonymous", "匿名内部类"], ["named", "命名内部类"]];
      if (Blocks.eventTypes[event.type].kind === "action") styles.push(["shared", "多个控件共用 Handler（getSource 区分）"]);
      const style = selectEl(styles, event.style);
      style.addEventListener("change", () => {
        event.style = style.value;
        if (event.style === "shared" && (!event.partner || event.partner === event.target)) event.partner = Blocks.defaultTarget(project, event.type, [event.target]);
        changed();
      });
      const parts = [h("label", { class: "field" }, h("span", null, "事件"), type), h("label", { class: "field" }, h("span", null, "注册到"), target),
        h("label", { class: "field" }, h("span", null, "写法"), style)];
      if (event.style === "shared") {
        const others = Blocks.eventTargets(project, event.type).filter(([id]) => id !== event.target);
        const partner = refSelect(others, event.partner);
        partner.addEventListener("change", () => { event.partner = partner.value; changed(); });
        parts.push(h("label", { class: "field" }, h("span", null, "第二个控件"), partner));
        event.more = event.more || [];
        event.more.forEach((id, i) => {
          const more = refSelect(others, id);
          more.addEventListener("change", () => { event.more[i] = more.value; changed(); });
          parts.push(h("label", { class: "field" }, h("span", null, "第 " + (i + 3) + " 个控件"), more),
            h("button", { type: "button", class: "small", onclick: () => { event.more.splice(i, 1); changed(); } }, "不共用第 " + (i + 3) + " 个"));
        });
        parts.push(h("button", { type: "button", class: "small", onclick: () => {
          const taken = Blocks.targetsOf(event);
          const next = Blocks.eventTargets(project, event.type).map(([id]) => id).find(id => !taken.includes(id));
          if (!next) { workspaceNote.textContent = "没有其他可共用的控件了。"; return; }
          event.more.push(next); changed();
        } }, "＋ 再共用一个控件"));
      }
      if (event.style === "named") {
        parts.push(input("Handler 类名（留空 = 自动编号）", event.className ?? "", v => { event.className = v; changed(false); }));
        const inject = selectEl([["no", "否：写在 start() 里的局部类"], ["yes", "是：独立的内部类，构造器传入用到的对象"]], event.inject === "yes" ? "yes" : "no");
        inject.addEventListener("change", () => { event.inject = inject.value; changed(); });
        parts.push(h("label", { class: "field" }, h("span", null, "用构造器传入对象"), inject));
      }
      setChildren(editorHead, h("div", { class: "row-title" }, h("h3", null, "事件 " + (active + 1)),
        h("span", { class: "row-tools" },
          h("button", { type: "button", class: "small", onclick: () => {
            // Same blocks, registered on the next control that has no handler of this type yet.
            const clone = Blocks.copy(event);
            clone.target = Blocks.defaultTarget(project, event.type, Blocks.targetsOf(event)) || event.target;
            if (clone.style === "shared") { clone.style = "lambda"; clone.partner = ""; clone.more = []; }
            if (clone.className) clone.className = "";
            project.events.splice(active + 1, 0, clone);
            active++;
            changed();
          } }, "复制事件"),
          h("button", { type: "button", class: "small danger", onclick: () => {
            project.events.splice(active, 1);
            active = Math.max(0, Math.min(active, project.events.length - 1));
            changed();
          } }, "删除事件"))), h("div", { class: "form-grid" }, parts));
      setChildren(editor, renderActions(event.actions, event, [], [active]));
    }

    const readsNumber = type => ["parse", "parsePair", "keyDigit"].includes(type);
    const containsList = (item, list) => [item.yes, item.no].some(b => b === list || b.some(n => containsList(n, list)));
    // A number read inside another read is allowed (for example R, G and B), as long as the names differ.
    const allowed = (type, kind) => {
      const spec = Blocks.specs[type];
      return !spec.event || spec.event === kind;
    };
    const available = kind => Object.entries(Blocks.specs).filter(([type, spec]) =>
      (showAdvanced || !spec.advanced) && allowed(type, kind));

    function addAction(actions, index, type, locals) {
      const spec = Blocks.specs[type];
      const values = {};
      if (locals.length) for (const [key, f] of Object.entries(spec.fields || {})) {
        if (f.expr === "number") values[key] = VisualExpr.make("number", "local", locals);
      }
      // New blocks first offer the objects this event already uses, so fewer fields need changing.
      const event = project.events[active];
      const prefer = event ? [...Blocks.usedIds(event.actions), event.target] : [];
      actions.splice(index, 0, Blocks.createBlock(project, type, values, [], [], prefer));
      changed();
    }
    function dragStart(e, data) {
      dragged = data;
      if (e.dataTransfer) {
        e.dataTransfer.setData("text/plain", Blocks.specs[data.type].label);
        e.dataTransfer.effectAllowed = data.item ? "move" : "copy";
      }
      editor.classList.add("is-dragging");
    }
    function dragEnd() {
      dragged = null;
      editor.classList.remove("is-dragging");
    }
    function dropZone(actions, index, event, scope) {
      const zone = h("div", { class: "block-drop", "aria-hidden": "true" }, "放在这里");
      const canDrop = () => dragged && allowed(dragged.type, Blocks.eventTypes[event.type].kind) &&
        (!dragged.item || !containsList(dragged.item, actions));
      zone.addEventListener("dragover", e => {
        if (!canDrop()) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = dragged.item ? "move" : "copy";
        zone.classList.add("over");
      });
      zone.addEventListener("dragleave", () => zone.classList.remove("over"));
      zone.addEventListener("drop", e => {
        e.preventDefault();
        if (!canDrop()) return;
        const source = dragged;
        dragEnd();
        if (source.item) {
          const origin = source.actions.indexOf(source.item);
          if (origin < 0) return;
          source.actions.splice(origin, 1);
          actions.splice(index - Number(source.actions === actions && origin < index), 0, source.item);
          changed();
        } else addAction(actions, index, source.type, scope.locals);
      });
      return zone;
    }

    function renderToolbox() {
      const event = project.events[active];
      if (!event) { setChildren(toolbox, h("p", { class: "hint" }, "先添加或选择一个事件。")); return; }
      const kind = Blocks.eventTypes[event.type].kind;
      const groups = [["判断与读取", "flow"], ["控件与图形", "action"], ["进阶 Java", "advanced"]];
      const choices = available(kind, false);
      setChildren(toolbox, ...groups.flatMap(([name, group]) => {
        const items = choices.filter(([, spec]) => (spec.advanced ? "advanced" : spec.branches ? "flow" : "action") === group);
        if (!items.length) return [];
        return [h("details", { class: "palette-group", open: group === "flow" },
          h("summary", null, name), h("div", { class: "palette-list" }, items.map(([type, spec]) => {
            const chip = h("button", { type: "button", class: "palette-chip " + group, draggable: "true",
              title: "拖入任一插入位置；点击则加到当前事件末尾",
              onclick: () => addAction(event.actions, event.actions.length, type, []) }, spec.label);
            chip.addEventListener("dragstart", e => dragStart(e, { type }));
            chip.addEventListener("dragend", dragEnd);
            return chip;
          })))];
      }));
    }

    function exprSlot(label, raw, type, scope, assign) {
      let tree = raw || VisualExpr.make(type);
      const choices = VisualExpr.form[type].filter(([id]) =>
        (id !== "modifier" || ["key", "mouse"].includes(scope.kind)) && (id !== "local" || scope.locals.length || tree.kind === "local"));
      const picker = selectEl(choices, tree.kind, { "aria-label": label + "类型" });
      picker.addEventListener("change", () => { assign(VisualExpr.make(type, picker.value, scope.locals)); changed(); });
      const namedSelect = (caption, list, key) => {
        const menu = selectEl(list, tree[key] || "");
        menu.addEventListener("change", () => { tree[key] = menu.value; changed(tree.kind === "prop" && key === "node"); });
        return h("label", { class: "field" }, h("span", null, caption), menu);
      };
      const text = (caption, key) => input(caption, tree[key] ?? "", v => { tree[key] = v; changed(false); });
      const child = (caption, key, type) => exprSlot(caption, tree[key], type, scope, v => { tree[key] = v; });
      const children = [];
      switch (tree.kind) {
        case "number": children.push(text("数字", "value")); break;
        case "local": {
          const menu = scope.locals.map(v => [v, v]);
          if (!scope.locals.includes(tree.name)) menu.unshift([tree.name || "", "请选择读取结果"]);
          children.push(namedSelect("读取结果", menu, "name")); break;
        }
        case "modifier": children.push(namedSelect("修饰键", VisualExpr.modifiers, "key")); break;
        case "compare": case "math":
          children.push(namedSelect(tree.kind === "compare" ? "比较" : "运算", tree.kind === "compare" ? VisualExpr.comparisons : VisualExpr.operators, "op"),
            child("左侧数字", "left", "number"), child("右侧数字", "right", "number")); break;
        case "range":
          children.push(child("要检查的数字", "value", "number"), h("div", { class: "form-grid" }, text("下限（可空）", "min"), text("上限（可空）", "max"),
            namedSelect("下限端点", [["no", "包含"], ["yes", "不包含"]], "minOpen"), namedSelect("上限端点", [["no", "包含"], ["yes", "不包含"]], "maxOpen"))); break;
        case "and": case "or":
          children.push(child("第一个条件", "left", "boolean"), child("第二个条件", "right", "boolean")); break;
        case "not": children.push(child("要取反的条件", "value", "boolean")); break;
        case "prop": {
          const nodes = Blocks.options(project, "Prop");
          const node = nodes.find(n => n.id === tree.node);
          children.push(namedSelect("对象", [["", "请选择"], ...nodes.map(n => [n.id, Blocks.caption(n)])], "node"));
          if (node) children.push(namedSelect("属性", [["", "请选择"], ...Blocks.props[node.type].map(([getter, caption]) => [getter, caption])], "prop"));
          break;
        }
        case "var": case "flag": {
          const vars = Blocks.options(project, tree.kind === "var" ? "numVar" : "boolVar");
          children.push(namedSelect("变量", [["", vars.length ? "请选择" : "先在左侧「变量」里添加"], ...vars.map(v => [v.id, Blocks.caption(v)])], "variable"));
          break;
        }
        case "blank": case "textEq": {
          const inputs = Blocks.options(project, "TextField");
          children.push(namedSelect("输入框", [["", "请选择"], ...inputs.map(n => [n.id, Blocks.caption(n)])], "input"));
          if (tree.kind === "textEq") {
            const vars = Blocks.options(project, "textVar");
            children.push(namedSelect("文字变量", [["", vars.length ? "请选择" : "先在左侧「变量」里添加 String"], ...vars.map(v => [v.id, Blocks.caption(v)])], "variable"));
          }
          break;
        }
      }
      return h("div", { class: "expr-slot " + type }, h("label", { class: "field" }, h("span", null, label), picker), children);
    }

    function renderActions(actions, event, locals, path, inParse = false) {
      const kind = Blocks.eventTypes[event.type].kind;
      const scope = { kind, locals, inParse };
      const list = h("div", { class: "block-list" });
      actions.forEach((item, index) => {
        const spec = Blocks.specs[item.type];
        const address = [...path, index];
        const grabber = h("span", { class: "block-handle", draggable: "true", title: "拖动积木；也可使用上移和下移按钮" }, "⠿");
        grabber.addEventListener("dragstart", e => dragStart(e, { type: item.type, item, actions }));
        grabber.addEventListener("dragend", dragEnd);
        list.append(dropZone(actions, index, event, scope));
        const tools = h("span", { class: "row-tools" }, [["↑", -1], ["↓", 1], ["×", 0]].map(([caption, offset]) =>
          h("button", { type: "button", class: "icon" + (offset ? "" : " danger"), title: offset ? (offset < 0 ? "上移" : "下移") : "删除",
            disabled: offset !== 0 && (index + offset < 0 || index + offset >= actions.length),
            onclick: () => { actions.splice(index, 1); if (offset) actions.splice(index + offset, 0, item); changed(); } }, caption)),
          h("button", { type: "button", class: "icon", title: "复制（放在下面）", onclick: () => { actions.splice(index + 1, 0, Blocks.copy(item)); changed(); } }, "⧉"));
        const codeLink = h("button", { type: "button", class: "small inspect-block", onclick: () => {
          refresh(false);
          if (!output.highlight(address.join("/"))) workspaceNote.textContent = "这个积木还没有可定位的源码。请先检查输出里的提示。";
        } }, "看 Java");
        const card = h("div", { class: "block" + (spec.branches ? " flow" : "") + (spec.advanced ? " advanced" : "") },
          h("div", { class: "row-title" }, h("span", { class: "block-caption" }, grabber, h("strong", null, spec.label)), h("span", { class: "row-tools" }, codeLink, tools)));
        if (spec.fields) {
          const fields = Object.entries(spec.fields).map(([key, field]) => {
            if (field.expr) return exprSlot(field.label, item.values[key], field.expr, scope, v => { item.values[key] = v; });
            let control;
            if (field.kind) control = refSelect(Blocks.options(project, field.kind).map(n => [n.id, Blocks.caption(n)]), item.values[key]);
            else if (field.values) control = selectEl(field.values.map((v, i) => [v, field.labels?.[i] ?? v]), item.values[key] ?? field.values[0]);
            else { control = h(field.multiline ? "textarea" : "input", { spellcheck: "false" }); control.value = item.values[key] ?? ""; }
            control.addEventListener(control.tagName === "SELECT" ? "change" : "input", () => { item.values[key] = control.value; changed(false); });
            if (readsNumber(item.type) && ["name", "x", "y"].includes(key)) control.addEventListener("change", () => renderEditor());
            return h("label", { class: "field" + (field.help ? " wide" : "") }, h("span", null, field.label), control, field.help ? h("small", null, field.help) : null);
          });
          card.append(h("div", { class: "form-grid" }, fields));
        }
        if (spec.branches) {
          const nested = inParse || readsNumber(item.type);
          const parsed = item.type === "parsePair" ? [item.values.x, item.values.y] : readsNumber(item.type) ? [item.values.name] : [];
          [item.yes, item.no].forEach((branch, i) => card.append(h("div", { class: "branch" }, h("p", { class: "branch-title" }, spec.branches[i]),
            renderActions(branch, event, i === 0 ? [...locals, ...parsed.filter(Boolean)] : locals, [...address, i === 0 ? "yes" : "no"], nested))));
        }
        list.append(card);
      });
      list.append(dropZone(actions, actions.length, event, scope));
      const picker = selectEl(available(kind).map(([key, spec]) => [key, spec.label]), undefined, { "aria-label": "选择要插入的积木" });
      list.append(h("div", { class: "add-row" }, picker, h("button", { type: "button", class: "small", onclick: () => {
        addAction(actions, actions.length, picker.value, locals);
      } }, "＋ 积木")));
      return list;
    }

    function renderAll() {
      renderSettings(); renderEvents(); renderToolbox(); renderEditor(); refresh();
    }

    const presetSelect = selectEl([["", "载入范例…"], ...Blocks.presets], "");
    presetSelect.addEventListener("change", () => {
      const id = presetSelect.value;
      presetSelect.value = "";
      if (!id || !confirm("用范例替换当前积木和控件？")) return;
      project = Blocks.preset(id); active = 0; expanded.clear(); renderAll();
    });
    const advanced = h("input", { type: "checkbox" });
    advanced.addEventListener("change", () => { showAdvanced = advanced.checked; renderToolbox(); renderEditor(); });
    setChildren(main, h("div", { class: "blocks-layout" },
      h("section", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", null, "控件与事件"), presetSelect),
        h("h3", { class: "sub-title" }, "事件"), eventList, h("h3", { class: "sub-title" }, "积木工具箱"), toolbox,
        h("label", { class: "inline" }, advanced, "显示进阶 Java 积木"), h("h3", { class: "sub-title" }, "控件"), settings),
      h("section", { class: "panel" },
        h("div", { class: "panel-head" }, h("h2", null, "拼积木"), h("div", { class: "actions" }, undoBtn, redoBtn)),
        h("p", { class: "hint" }, "从左侧拖到插入位置，或在每个分支用「＋ 积木」添加。条件和数字可在彩色插槽里继续嵌套。"),
        workspaceNote, editorHead, editor),
      h("div", { class: "right-col" },
        h("section", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", null, "布局预览")), previewBox),
        output.element,
        h("section", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", null, "只要事件代码（粘贴进已有程序；有分段注释时按注释放）"),
          h("button", { type: "button", class: "small", onclick: () => copyText(snippet.value, snippetStatus) }, "复制")), snippet, snippetStatus))));
    renderAll();
    Views.refresh = refresh;
  }
};

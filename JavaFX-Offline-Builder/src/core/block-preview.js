/* Lightweight preview of structured workbench blocks. Never evaluates Java strings. */
"use strict";

const BlockPreview = {
  keyCode({ key, code, location }) {
    const mainDigit = /^Digit([0-9])$/.exec(code);
    if (mainDigit) return "DIGIT" + mainDigit[1];
    if (/^[0-9]$/.test(key)) return (location === 3 || /^Numpad[0-9]$/.test(code) ? "NUMPAD" : "DIGIT") + key;
    return { ArrowLeft: "LEFT", ArrowRight: "RIGHT", ArrowUp: "UP", ArrowDown: "DOWN", " ": "SPACE",
      Escape: "ESCAPE", Enter: "ENTER" }[key] || key.toUpperCase();
  },

  create(project) {
    const state = Object.create(null), initial = Object.create(null), vars = Object.create(null);
    const varValue = v => v.type === "boolean" ? v.value === "true" : v.type === "String" ? String(v.value ?? "")
      : (v.type === "int" ? Math.trunc : Number)(Number(v.value) || 0);
    const restore = () => {
      for (const node of project.components) {
        const fields = { ...node, rotate: 0, disabled: false, visible: true, selected: node.selected === "yes", style: "", running: false };
        for (const key of ["x", "y", "width", "height", "radius", "radiusX", "radiusY", "fitWidth", "interval"]) fields[key] = Number(fields[key]);
        if (Blocks.isBound(project, node)) {
          const pane = project.components.find(p => p.id === node.pane);
          fields.x = (Number(pane.width) || 300) / 2; fields.y = (Number(pane.height) || 200) / 2;
        }
        initial[node.id] = fields;
        if (state[node.id]) Object.assign(state[node.id], fields);
        else state[node.id] = { ...fields };
      }
      for (const v of project.variables || []) vars[v.id] = varValue(v);
      // Controls added at run time by "往区域里添加控件": region -> [{ type, text }]
      for (const region of ["top", "bottom", "left", "right", "center"]) added[region] = [];
    };
    const added = Object.create(null);
    restore();
    const names = new Map([["stage", project.config.stage], ["scene", project.config.scene], ["root", "root"],
      ...project.components.map(n => [n.id, n.name]), ...(project.variables || []).map(v => [v.id, v.name])]);
    const unsupported = items => items.find(item => Blocks.specs[item.type]?.advanced || unsupported(item.yes) || unsupported(item.no));
    const format = value => {
      if (typeof value !== "number") return String(value);
      if (!Number.isFinite(value)) return String(value);
      // JavaFX code concatenates a double; mirror the common decimal form.
      const out = String(value);
      return Number.isInteger(value) && !out.includes("e") ? out + ".0" : out;
    };
    const read = (id, prop) => state[id][prop];
    // Same rules as Blocks.templateExpr: {input} {label} {variable} {local} {shape.prop}, optional :.2f / :d.
    const template = (text, locals, scope) => String(text ?? "").replace(/\{([A-Za-z_]\w*)(?:\.([A-Za-z]\w*))?(?::(\.\d+f|d))?\}/g, (all, name, prop, fmt) => {
      let value;
      const node = project.components.find(n => n.name === name);
      const variable = (project.variables || []).find(v => v.name === name);
      if (prop) {
        const entry = node && (Blocks.props[node.type] || []).find(p => p[2] === prop);
        if (!entry) throw new Error("组合文字里的 {" + name + "." + prop + "} 不能用。");
        value = state[node.id][prop];
      } else if (scope.locals.has(name)) value = locals[name];
      else if (variable) value = vars[variable.id];
      else if (node && ["TextField", "Label", "Text"].includes(node.type)) value = node.type === "TextField" ? String(state[node.id].text).trim() : state[node.id].text;
      else throw new Error("组合文字里的 {" + name + "} 不能用。");
      if (fmt && typeof value !== "number") throw new Error("组合文字里的 {" + name + ":" + fmt + "} 不能用：格式只适用于数字。");
      if (fmt === "d") return String(Math.trunc(value));
      if (fmt) return Number(value).toFixed(Number(fmt.slice(1, -1)));
      return scope.intLocals?.has(name) || variable?.type === "int" ? String(value) : format(value);
    });
    const send = (type, targets, data = {}) => {
      const event = { ...data, target: targets[0] };
      let ran = 0, unsupportedEvent = false;
      const notes = [];
      for (const target of targets) for (const handler of project.events) {
        if (handler.type !== type || !Blocks.targetsOf(handler).includes(target)) continue;
        if (unsupported(handler.actions)) { unsupportedEvent = true; continue; }
        const ctx = { kind: Blocks.eventTypes[type].kind, locals: new Set(), intLocals: new Set(), project, names, read,
          readVar: id => vars[id], readText: id => state[id].text };
        const run = (items, values, scope) => {
          for (const a of items) {
            const v = a.values, node = state[v.node];
            const axis = String(v.axis || "X").toLowerCase(), step = () => node[axis] + Number(v.delta);
            const expr = (key, kind) => VisualExpr.compile(v[key], kind, scope).evaluate(values, event);
            const branch = (flag, inner = values, innerScope = scope) => run(flag ? a.yes : a.no, inner, innerScope);
            switch (a.type) {
              case "key": branch(event.code === v.code); break;
              case "keyDigit": {
                const digit = Blocks.readKeyDigit(event.code);
                const { min, max } = Blocks.keyDigitRange(v);
                if (digit >= min && digit <= max) {
                  branch(true, { ...values, [v.name]: digit }, { ...scope,
                    locals: new Set([...scope.locals, v.name]), intLocals: new Set([...scope.intLocals, v.name]) });
                } else branch(false);
                break;
              }
              case "bounds": branch(event.x >= Number(v.minX) && event.x <= Number(v.maxX) && event.y >= Number(v.minY) && event.y <= Number(v.maxY)); break;
              case "mouseButton": branch(event.button === v.button); break;
              case "source": branch(event.target === v.target); break;
              case "selected": branch(state[v.target].selected); break;
              case "logic": branch(expr("test", "boolean")); break;
              case "moveBounds": case "moveLimited": {
                const dest = step(), ok = dest >= Number(v.min) && dest <= Number(v.max);
                if (ok && a.type === "moveLimited") node[axis] = dest;
                branch(ok); break;
              }
              case "radiusLimited": {
                const next = v.op === "mul" ? node.radius * Number(v.amount) : node.radius + Number(v.amount);
                const ok = next >= Number(v.min) && next <= Number(v.max);
                if (ok) node.radius = next;
                branch(ok); break;
              }
              case "confirm": branch(typeof globalThis.confirm === "function" ? globalThis.confirm(v.text) : true); break;
              case "imageError": notes.push("预览不读取图片文件，按“加载成功”处理。"); branch(false); break;
              case "parse": case "parsePair": {
                const pair = a.type === "parsePair", integer = !pair && v.numType === "int";
                const entries = pair ? [[v.x, v.xInput], [v.y, v.yInput]] : [[v.name, v.input]];
                const range = NumericRules.range(pair ? {} : v, "输入数字", integer);
                const read = Object.fromEntries(entries.map(([name, id]) => [name, NumericRules.parse(state[id].text, integer)]));
                if (entries.every(([name]) => NumericRules.accepts(read[name], range, integer))) {
                  const names = entries.map(([name]) => name);
                  branch(true, { ...values, ...read }, { ...scope, locals: new Set([...scope.locals, ...names]),
                    intLocals: new Set([...(scope.intLocals || []), ...(integer ? names : [])]) });
                } else branch(false);
                break;
              }
              case "follow": node.x = event.x; node.y = event.y; break;
              case "place": node.x = Number(v.x); node.y = Number(v.y); break;
              case "positionValue": node.x = expr("x", "number"); node.y = expr("y", "number"); break;
              case "step": node[axis] = step(); break;
              case "radiusValue": node.radius = expr("value", "number"); break;
              case "grow": if (node.radius + Number(v.delta) >= Number(v.min)) node.radius += Number(v.delta); break;
              case "color": node.color = v.color; break;
              case "rgb": {
                const rgb = ["r", "g", "b"].map(k => Math.trunc(expr(k, "number")));
                // Like Color.rgb: a value outside 0-255 is an IllegalArgumentException in the real program.
                if (rgb.some(x => !(x >= 0 && x <= 255))) throw new Error("Color.rgb 收到 " + rgb.join(", ") + "，每个值必须在 0–255 之间（真实程序会抛出 IllegalArgumentException）。");
                node.color = "rgb(" + rgb.join(",") + ")"; break;
              }
              case "style": node.style = String(v.css ?? ""); break;
              case "visible": node.visible = v.visible === "true"; break;
              case "rotate": node.rotate += Number(v.delta); break;
              case "text": state[v.label].text = v.text; break;
              case "textNode": node.text = v.text; break;
              case "template": state[v.label].text = template(v.text, values, scope); break;
              case "valueText": state[v.label].text = v.text + format(expr("value", "number")); break;
              case "positionText": state[v.label].text = v.text + format(node[axis]); break;
              case "mouseText": state[v.label].text = v.text + "(" + format(event.x) + ", " + format(event.y) + ")"; break;
              case "keyText": state[v.label].text = v.text + (event.text || ""); break;
              case "inputText": state[v.input].text = v.text; break;
              case "clear": state[v.input].text = ""; break;
              case "counter": {
                const current = state[v.label].text.slice(String(v.prefix).length);
                const n = NumericRules.parse(current, true);
                if (!Number.isFinite(n)) throw new Error("预览：计数标签的初始文字不是整数。");
                state[v.label].text = v.prefix + ((n + Number(v.amount)) | 0); break;
              }
              case "setNumber": {
                const variable = project.variables.find(x => x.id === v.variable), value = expr("value", "number");
                vars[v.variable] = variable.type === "int" ? Math.trunc(value) : value; break;
              }
              case "changeNumber": vars[v.variable] += Number(v.amount); break;
              case "setFlag": vars[v.variable] = v.value === "true"; break;
              case "setTextVar": vars[v.variable] = String(state[v.input].text).trim(); break;
              case "setTextLiteral": vars[v.variable] = String(v.text ?? ""); break;
              case "resetVar": vars[v.variable] = varValue(project.variables.find(x => x.id === v.variable)); break;
              case "resetNode":
                // Same as Blocks.resetLines: shapes keep their rotation, an ImageView only gets its rotation back.
                for (const p of node.type === "ImageView" ? ["rotate"] : ["x", "y", "radius", "width", "height", "radiusX", "radiusY", "text", "color"]) node[p] = initial[v.node][p];
                break;
              case "resetText": state[v.target].text = initial[v.target].text; break;
              case "disable": state[v.target].disabled = v.disabled === "true"; break;
              case "alert": notes.push("提示框（" + v.kind + "）：" + v.text); break;
              case "timeline": state[v.timeline].running = v.action === "play"; break;
              case "closeWindow": notes.push("真实程序在这里关闭窗口。"); break;
              case "addNode": added[v.region].push({ type: v.nodeType === "Button" ? "Button" : "Label", text: template(v.text, values, scope) }); break;
              case "clearRegion": {
                const keep = Math.max(0, Math.trunc(Number(v.keep) || 0));
                const fixed = project.components.filter(c => (c.region || (c.type === "ImageView" ? "left" : "bottom")) === v.region &&
                  (Blocks.controls.includes(c.type) || c.type === "ImageView")).length;
                added[v.region].splice(Math.max(0, keep - fixed));
                if (keep < fixed) notes.push("预览只移除运行时添加的控件；真实程序会从第 " + (keep + 1) + " 个开始全部移除。");
                break;
              }
              case "openWindow": notes.push("真实程序在这里打开新窗口「" + v.title + "」：" + template(v.text, values, scope)); break;
              case "println": notes.push(v.text); break;
              // Like Java: e.consume() marks the event, and the statements after it still run.
              case "consume": event.consumed = true; break;
            }
          }
        };
        try { run(handler.actions, {}, ctx); ran++; }
        catch (e) { notes.push("无法预览此事件：" + e.message); }
        if (event.consumed) return { ran, unsupportedEvent, notes, consumed: true };
      }
      return { ran, unsupportedEvent, notes, consumed: false };
    };
    return { state, vars, added, send, reset: restore };
  }
};

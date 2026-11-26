/*
 * Skeleton completion: parse the Java files given in an exam paper, find the methods whose bodies
 * are empty, and propose a body for each from its name, signature and the class fields
 * (constructors, getters/setters, area/perimeter formulas, draw on a Pane, moves, display...).
 * The rest of the source is kept exactly as given, so class and method signatures never change.
 */
"use strict";

const NUMERIC_TYPES = new Set(["int", "long", "float", "double", "short", "byte"]);

const Skeleton = {
  // Same length as src; comments and the contents of string/char literals become spaces.
  mask(src) {
    const out = src.split("");
    let i = 0;
    const blank = (from, to) => { for (let k = from; k < to; k++) if (out[k] !== "\n" && out[k] !== "\r") out[k] = " "; };
    while (i < src.length) {
      const c = src[i], d = src[i + 1];
      if (c === "/" && d === "/") {
        const end = src.indexOf("\n", i);
        const stop = end < 0 ? src.length : end;
        blank(i, stop); i = stop;
      } else if (c === "/" && d === "*") {
        const end = src.indexOf("*/", i + 2);
        const stop = end < 0 ? src.length : end + 2;
        blank(i, stop); i = stop;
      } else if (c === '"' && src.startsWith('"""', i)) {
        const end = src.indexOf('"""', i + 3);
        const stop = end < 0 ? src.length : end + 3;
        blank(i + 3, Math.max(i + 3, stop - 3)); i = stop;
      } else if (c === '"' || c === "'") {
        let k = i + 1;
        while (k < src.length && src[k] !== c && src[k] !== "\n") k += src[k] === "\\" ? 2 : 1;
        blank(i + 1, Math.min(k, src.length)); i = k + 1;
      } else i++;
    }
    return out.join("");
  },

  matchBrace(masked, open) {
    let depth = 0;
    for (let k = open; k < masked.length; k++) {
      if (masked[k] === "{") depth++;
      else if (masked[k] === "}") { depth--; if (depth === 0) return k; }
    }
    return -1;
  },

  parse(src, fileName = "") {
    const text = String(src).replace(/\r\n/g, "\n");
    const masked = Skeleton.mask(text);
    const types = [];
    let depth = 0, segStart = 0;
    for (let k = 0; k < masked.length; k++) {
      const ch = masked[k];
      if (ch === ";" && depth === 0) segStart = k + 1;
      if (ch === "{") {
        if (depth === 0) {
          const header = masked.slice(segStart, k);
          const m = /\b(class|interface|enum|record)\s+([A-Za-z_]\w*)/.exec(header);
          const close = Skeleton.matchBrace(masked, k);
          if (close < 0) throw new Error((fileName || "代码") + "：大括号不配对，请检查是否完整粘贴。");
          if (m) types.push(Skeleton.parseType(text, masked, header, segStart, k, close, m[1], m[2]));
          k = close;
          segStart = close + 1;
          continue;
        }
        depth++;
      } else if (ch === "}") depth--;
    }
    const imports = [...text.matchAll(/^\s*import\s+([\w.*]+)\s*;/gm)].map(m => m[1]);
    return { text, masked, types, imports, fileName };
  },

  parseType(text, masked, header, headerStart, open, close, kind, name) {
    const flat = header.replace(/\s+/g, " ");
    const ext = /\bextends\s+([\w.]+)/.exec(flat);
    const impl = /\bimplements\s+([\w.,\s]+)/.exec(flat);
    const type = {
      name, kind: kind === "class" && /\babstract\b/.test(flat) ? "abstract" : kind,
      isPublic: /\bpublic\b/.test(flat), extends: ext ? ext[1] : "",
      implements: impl ? impl[1].split(",").map(s => s.trim()).filter(Boolean) : [],
      open, close, fields: [], methods: []
    };
    let k = open + 1, seg = k, depth = 0;
    while (k < close) {
      const ch = masked[k];
      if (ch === "(" ) depth++;
      else if (ch === ")") depth--;
      else if (ch === ";" && depth === 0) {
        Skeleton.member(type, text, masked, seg, k, null);
        seg = k + 1;
      } else if (ch === "{" && depth === 0) {
        const end = Skeleton.matchBrace(masked, k);
        const head = masked.slice(seg, k);
        if (/=\s*$/.test(head) || /->\s*$/.test(head) || /\bnew\s+[\w.<>]+\s*\([^)]*\)\s*$/.test(head)) {
          // Array initialiser or anonymous class inside a field initialiser: keep scanning to the ';'
          k = end + 1;
          continue;
        }
        Skeleton.member(type, text, masked, seg, k, end);
        k = end + 1;
        seg = k;
        continue;
      }
      k++;
    }
    return type;
  },

  member(type, text, masked, start, stop, bodyClose) {
    let head = masked.slice(start, stop);
    const lead = head.length - head.trimStart().length;
    const declStart = start + lead;
    const annotations = [...head.matchAll(/@(\w+)/g)].map(m => m[1]);
    head = head.replace(/@\w+(\s*\([^)]*\))?/g, " ").replace(/\s+/g, " ").trim();
    if (!head) return;
    if (/\b(class|interface|enum|record)\b/.test(head) && bodyClose !== null) return;
    if (/^(static\s*)?$/.test(head)) return;
    const paren = head.indexOf("(");
    const eq = head.indexOf("=");
    if (paren >= 0 && (eq < 0 || paren < eq)) {
      const m = /^((?:(?:public|protected|private|static|final|abstract|synchronized|native|default|strictfp)\s+)*)(?:<[^>]*>\s+)?(?:([\w.]+(?:<[^()]*>)?(?:\[\])*)\s+)?([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:throws\s+[\w.,\s]+)?$/.exec(head);
      if (!m) return;
      const mods = m[1].trim().split(/\s+/).filter(Boolean);
      const params = m[4].trim() ? Skeleton.splitTop(m[4]).map(p => {
        const parts = p.replace(/\bfinal\s+/g, "").trim().split(/\s+/);
        return { name: parts.pop(), type: parts.join(" ") };
      }) : [];
      const isCtor = !m[2] && m[3] === type.name;
      if (!m[2] && !isCtor) return;
      const method = { name: m[3], returnType: m[2] || "", params, mods, isCtor, annotations,
        abstract: bodyClose === null, declStart };
      if (bodyClose !== null) {
        method.bodyOpen = stop;
        method.bodyClose = bodyClose;
        method.empty = masked.slice(stop + 1, bodyClose).trim() === "";
        method.bodyText = text.slice(stop + 1, bodyClose);
      }
      type.methods.push(method);
      return;
    }
    // Field declaration(s)
    const m = /^((?:(?:public|protected|private|static|final|transient|volatile)\s+)*)([\w.]+(?:<.*?>)?(?:\[\])*)\s+(.+)$/.exec(head);
    if (!m) return;
    const mods = m[1].trim().split(/\s+/).filter(Boolean);
    const original = text.slice(start, stop).replace(/\s+/g, " ").trim().replace(/^(@\w+\s*)+/, "");
    const declarators = Skeleton.splitTop(m[3]);
    for (const d of declarators) {
      const dm = /^([A-Za-z_]\w*)\s*(?:\[\])*\s*(?:=\s*(.*))?$/.exec(d.trim());
      if (!dm) continue;
      let init = "";
      if (dm[2] !== undefined) {
        const found = new RegExp("\\b" + dm[1] + "\\s*=\\s*([^,;]+)").exec(original);
        init = found ? found[1].trim() : dm[2].trim();
      }
      type.fields.push({ name: dm[1], type: m[2], mods, init, isStatic: mods.includes("static"), isPrivate: mods.includes("private") });
    }
  },

  splitTop(text) {
    const parts = [];
    let depth = 0, cur = "";
    for (const ch of text) {
      if ("<([{".includes(ch)) depth++;
      if (">)]}".includes(ch)) depth--;
      if (ch === "," && depth === 0) { parts.push(cur); cur = ""; } else cur += ch;
    }
    if (cur.trim()) parts.push(cur);
    return parts.map(p => p.trim()).filter(Boolean);
  },

  // ---------- suggestions ----------
  context(files) {
    const types = new Map();
    for (const f of files) for (const t of f.types) types.set(t.name, t);
    return types;
  },

  allFields(type, types) {
    const result = [...type.fields.filter(f => !f.isStatic)];
    let parent = types.get(type.extends), guard = 0;
    while (parent && guard++ < 10) {
      result.push(...parent.fields.filter(f => !f.isStatic && !f.isPrivate).map(f => ({ ...f, inherited: true })));
      parent = types.get(parent.extends);
    }
    return result;
  },

  // The super(...) call a constructor needs, or null if none is needed.
  // Returns { line, used: child parameter names passed on, fields: parent fields they set } or { error }.
  superCall(type, method, types) {
    const parent = types.get(type.extends);
    if (!parent) return null;
    const ctors = parent.methods.filter(m => m.isCtor);
    if (!ctors.length) return null;                       // implicit default constructor
    const hasNoArg = ctors.some(c => !c.params.length);
    const match = ctor => {
      const used = new Set(), args = [];
      for (const q of ctor.params) {
        const byName = method.params.find(p => !used.has(p.name) && p.name === q.name && p.type === q.type);
        const byType = method.params.find(p => !used.has(p.name) && p.type === q.type);
        const pick = byName || (hasNoArg ? null : byType);
        if (!pick) return null;
        used.add(pick.name); args.push(pick.name);
      }
      return { used, args };
    };
    const candidates = ctors.filter(c => c.params.length).map(c => ({ c, m: match(c) })).filter(x => x.m)
      .sort((a, b) => b.c.params.length - a.c.params.length);
    if (!candidates.length) {
      return hasNoArg ? null : { error: "父类 " + parent.name + " 只有带参数的构造器，请手写 super(...) 作为第一行" };
    }
    const { c, m } = candidates[0];
    // Parent fields that the parent constructor sets (same names as its parameters).
    const fields = c.params.map(q => q.name).filter(n => parent.fields.some(f => f.name === n));
    return { line: "super(" + m.args.join(", ") + ");", used: m.used, fields };
  },

  findField(fields, wanted) {
    const lower = wanted.toLowerCase();
    return fields.find(f => f.name === wanted) || fields.find(f => f.name.toLowerCase() === lower);
  },

  positionField(fields, axis) {
    const names = axis === "x" ? ["x", "xpos", "xposition", "posx", "positionx", "centerx", "left"]
      : ["y", "ypos", "yposition", "posy", "positiony", "centery", "top"];
    return fields.find(f => NUMERIC_TYPES.has(f.type) && names.includes(f.name.toLowerCase()));
  },

  shapeInfo(type, types, options) {
    const kind = ShapeLib.kindFromName(type.name) || (types.get(type.extends) ? null : null);
    if (!kind) return null;
    const own = type.fields.filter(f => !f.isStatic && NUMERIC_TYPES.has(f.type)).map(f => f.name);
    const dims = ShapeLib.matchDims(kind, own);
    if (!dims) return null;
    const dimType = type.fields.find(f => f.name === Object.values(dims)[0]).type;
    const sizes = options.sizes || {};
    const defaults = Object.fromEntries(ShapeKinds[kind].dims.map(d => [d.name, sizes[d.name] ?? d.def]));
    return { kind, dims, dimType, defaults };
  },

  defaultReturn(type) {
    if (NUMERIC_TYPES.has(type)) return "return 0;";
    if (type === "boolean") return "return false;";
    if (type === "char") return "return ' ';";
    if (type === "String") return 'return "";';
    return "return null;";
  },

  cast(expr, targetType) {
    if ((targetType === "float" || targetType === "int" || targetType === "long") && /Math\.|\d\.\d|0\.5/.test(expr)) {
      return "(" + targetType + ") (" + expr + ")";
    }
    return expr;
  },

  suggest(files, options = {}) {
    const types = Skeleton.context(files);
    const step = options.step ?? 15, resize = options.resize ?? 10, anchor = options.anchor || "topLeft";
    const list = [];
    files.forEach((file, fi) => {
      for (const type of file.types) {
        for (const method of type.methods) {
          if (method.abstract || !method.empty) continue;
          const result = Skeleton.fill(type, method, types, { step, resize, anchor, sizes: options.sizes, file });
          list.push({ id: fi + ":" + type.name + "." + method.name + ":" + method.bodyOpen, file: fi, type: type.name,
            signature: Skeleton.signature(method), returnType: method.returnType,
            fields: Skeleton.allFields(type, types).map(f => f.name),
            fieldTypes: Object.fromEntries(Skeleton.allFields(type, types).map(f => [f.name, f.type])), ...result, use: true });
        }
      }
    });
    return list;
  },

  signature(method) {
    return (method.returnType ? method.returnType + " " : "") + method.name + "(" + method.params.map(p => p.type + " " + p.name).join(", ") + ")";
  },

  fill(type, method, types, opt) {
    const fields = Skeleton.allFields(type, types);
    const own = type.fields.filter(f => !f.isStatic);
    const name = method.name, lower = name.toLowerCase(), ret = method.returnType;
    const shape = Skeleton.shapeInfo(type, types, opt);
    const imports = [];
    const auto = (lines, note) => ({ body: lines.join("\n"), status: "auto", note, imports });
    const todo = (note, lines = []) => ({
      body: [...lines, "// TODO: " + note, ...(ret && ret !== "void" ? [Skeleton.defaultReturn(ret)] : [])].join("\n"),
      status: "todo", note, imports
    });
    const areaField = fields.find(f => NUMERIC_TYPES.has(f.type) && /area/i.test(f.name));
    const perimField = fields.find(f => NUMERIC_TYPES.has(f.type) && /perimeter|circumference/i.test(f.name));
    const colorField = fields.find(f => f.type === "Color" || f.type === "javafx.scene.paint.Color");
    const xField = Skeleton.positionField(fields, "x"), yField = Skeleton.positionField(fields, "y");
    const lit = (value, t) => NUMERIC_TYPES.has(t) ? Java.lit(value, t === "float" ? "double" : t) : String(value);

    // Constructors
    if (method.isCtor) {
      // A parent constructor that takes these parameters must be called first with super(...).
      const parentCall = Skeleton.superCall(type, method, types);
      if (parentCall && parentCall.error) return todo(parentCall.error, ["// super(...);   // Java requires this as the first statement"]);
      if (method.params.length) {
        const lines = parentCall ? [parentCall.line] : [], assigned = new Set(parentCall ? parentCall.fields : []);
        for (const p of method.params) {
          if (parentCall && parentCall.used.has(p.name)) continue;
          const same = Skeleton.findField(fields, p.name);
          if (same) { lines.push("this." + same.name + " = " + p.name + ";"); assigned.add(same.name); continue; }
          const dim = shape && ShapeKinds[shape.kind].dims.find(d => d.aliases.includes(p.name.toLowerCase()) && !assigned.has(shape.dims[d.name]));
          if (dim) { lines.push(shape.dims[dim.name] + " = " + p.name + ";"); assigned.add(shape.dims[dim.name]); continue; }
          const sameType = own.filter(f => f.type === p.type && !assigned.has(f.name) && !method.params.some(q => q.name === f.name));
          if (sameType.length === 1) { lines.push(sameType[0].name + " = " + p.name + ";"); assigned.add(sameType[0].name); continue; }
          lines.push("// TODO: store parameter " + p.name);
        }
        for (const f of own.filter(f => !assigned.has(f.name) && !f.init && f.type === "boolean")) {
          if (/^(is)?(available|active|enabled|visible|open|valid)$/i.test(f.name)) lines.push(f.name + " = true;   // a new object starts as " + f.name);
        }
        return lines.some(l => l.startsWith("// TODO")) ? { ...todo("部分参数没有对应的字段"), body: lines.join("\n") }
          : auto(lines, parentCall ? "先用 super(...) 调用父类构造器，其余参数存入字段" : "参数存入同名或同类型字段");
      }
      if (parentCall) return auto([parentCall.line], "无参构造器：调用父类构造器");
      if (shape) {
        return auto(ShapeKinds[shape.kind].dims.map(d => shape.dims[d.name] + " = " + lit(shape.defaults[d.name], shape.dimType) + ";"),
          "无参构造器：图形尺寸设为默认值（可在下方修改默认尺寸）");
      }
      const unset = own.filter(f => !f.init && !f.mods.includes("final"));
      if (!unset.length) return auto(["// All fields already have their initial values."], "字段已有初始值");
      return todo("无参构造器：请决定字段默认值", unset.map(f => "// " + f.name + " = ...;"));
    }

    // Area / perimeter
    const isArea = /area/.test(lower) && !/set/.test(lower.slice(0, 3));
    const isPerim = /perimeter|circumference/.test(lower) && !lower.startsWith("set");
    if ((isArea || isPerim) && !method.params.length) {
      if (!shape) return todo("无法从类名判断图形种类，请手写" + (isArea ? "面积" : "周长") + "公式");
      const target = isArea ? areaField : perimField;
      if (ret === "void") {
        if (!target) return todo("没有找到存放结果的字段");
        return auto([target.name + " = " + Skeleton.cast(ShapeKinds[shape.kind][isArea ? "area" : "perimeter"](shape.dims), target.type) + ";"],
          ShapeKinds[shape.kind].label + " 的" + (isArea ? "面积" : "周长") + "公式");
      }
      return auto(["return " + Skeleton.cast(ShapeKinds[shape.kind][isArea ? "area" : "perimeter"](shape.dims), ret) + ";"],
        ShapeKinds[shape.kind].label + " 的" + (isArea ? "面积" : "周长") + "公式");
    }

    // Getter / setter
    const getter = /^(get|is)([A-Z_]\w*)$/.exec(name);
    if (getter && !method.params.length && ret && ret !== "void") {
      const field = Skeleton.findField(fields, getter[2]) || Skeleton.findField(fields, Java.lowerFirst(getter[2]));
      if (field) return auto(["return " + field.name + ";"], "getter");
      // getName() / getType() of a shape class without such a field: the shape's name
      if (shape && ret === "String" && /^(name|type|kind)$/i.test(getter[2])) {
        const word = ShapeKinds[shape.kind].word;
        return { ...auto(["return " + Java.str(word.charAt(0).toUpperCase() + word.slice(1)) + ";"], "返回图形名称（按题目要求核对拼写和大小写）"), status: "check" };
      }
      return todo("没有找到名为 " + getter[2] + " 的字段");
    }
    const setter = /^set([A-Z_]\w*)$/.exec(name);
    if (setter && method.params.length === 1) {
      const p = method.params[0];
      const field = Skeleton.findField(fields, setter[1]) || (p.type === "Color" ? colorField : null) ||
        own.filter(f => f.type === p.type).length === 1 && own.find(f => f.type === p.type);
      if (field) return auto([(field.name === p.name ? "this." : "") + field.name + " = " + p.name + ";"], "setter");
      return todo("没有找到要设置的字段");
    }

    // Display / print
    if (/^(display|print|show|describe)/.test(lower) && ret === "void" && !method.params.length) {
      const word = shape ? ShapeKinds[shape.kind].word : Java.lowerFirst(type.name);
      const lines = [];
      if (areaField) lines.push('System.out.println("Area of ' + word + ' = " + ' + areaField.name + ");");
      if (perimField) lines.push('System.out.println("Perimeter of ' + word + ' = " + ' + perimField.name + ");");
      if (!lines.length) lines.push("System.out.println(" + (own.length ? own.map(f => Java.str(f.name + ": ") + " + " + f.name).join(' + ", " + ') : Java.str(type.name)) + ");");
      return auto(lines, "在控制台输出");
    }
    if (name === "toString" && ret === "String" && !method.params.length) {
      const shown = fields;
      return auto(["return " + (shown.length ? Java.str(type.name + "[") + " + " + shown.map(f => Java.str(f.name + "=") + " + " + f.name).join(' + ", " + ') + ' + "]"' : Java.str(type.name)) + ";"], "toString");
    }

    // read*: GUI programs have no console input
    if (/^(read|input)/.test(lower) && ret === "void" && !method.params.length) {
      if (!shape) return todo("没有识别出要读取的字段");
      const checks = ShapeKinds[shape.kind].dims.map(d => shape.dims[d.name]);
      return auto([
        "// A GUI has no console input, so keep the size from the constructor.",
        "if (" + checks.map(f => f + " <= 0").join(" || ") + ") {",
        ...ShapeKinds[shape.kind].dims.map(d => "    " + shape.dims[d.name] + " = " + lit(shape.defaults[d.name], shape.dimType) + ";"), "}"
      ], "GUI 中不读控制台，只保证尺寸有效");
    }

    // Moves
    const move = /^move(up|down|left|right)$/.exec(lower) || /^(up|down|left|right)$/.exec(lower);
    if (move && (ret === "void")) {
      const dir = move[1];
      const field = dir === "up" || dir === "down" ? yField : xField;
      if (!field) return todo("没有找到 " + (dir === "up" || dir === "down" ? "y" : "x") + " 坐标字段");
      const amount = method.params.length === 1 && NUMERIC_TYPES.has(method.params[0].type) ? method.params[0].name : lit(opt.step, field.type);
      const op = dir === "up" || dir === "left" ? " -= " : " += ";
      return auto(["this." + field.name + op + amount + ";"], "移动 " + amount + " 像素（向上 y 减小）");
    }

    // Resize
    const grow = /^(enlarge|grow|increase|zoomin|bigger|expand)/.test(lower), shrinkIt = /^(shrink|decrease|zoomout|smaller|reduce)/.test(lower);
    if ((grow || shrinkIt) && ret === "void") {
      if (!shape) return todo("没有识别出图形尺寸字段");
      const amount = method.params.length === 1 && NUMERIC_TYPES.has(method.params[0].type) ? method.params[0].name : lit(opt.resize, shape.dimType);
      return auto(ShapeLib.growLines(shape.kind, shape.dims, amount, grow), grow ? "每个尺寸增加" : "每个尺寸减小（不小于步长）");
    }

    // draw(Pane)
    const paneParam = method.params.find(p => /(^|\.)Pane$|Pane$/.test(p.type));
    if (paneParam && ret === "void") {
      if (!shape) return todo("无法判断要画的 JavaFX 图形");
      if (!xField || !yField) return todo("没有找到 x / y 坐标字段");
      const kind = ShapeKinds[shape.kind];
      const conflict = types.has(kind.fx);
      const fx = conflict ? "javafx.scene.shape." + kind.fx : kind.fx;
      if (!conflict) imports.push("javafx.scene.shape." + kind.fx);
      const varName = kind.fx === "Polygon" ? "triangle" : kind.word === "square" ? "square" : kind.word;
      const where = "(" + xField.name + ", " + yField.name + ")";
      const lines = [
        opt.anchor === "center" ? "// " + where + " is the centre of the shape." : "// " + where + " is the top-left corner of the bounding box.",
        fx + " " + varName + " = new " + fx + "(" + kind.node(shape.dims, xField.name, yField.name, opt.anchor) + ");"
      ];
      if (colorField) lines.push(varName + ".setFill(" + colorField.name + ");");
      lines.push(paneParam.name + ".getChildren().add(" + varName + ");");
      return auto(lines, "画 " + kind.label + (colorField ? "，填充颜色字段 " + colorField.name : ""));
    }

    // A method that returns a JavaFX node for the shape, e.g. Shape toNode() / Node createNode()
    const nodeTypes = /^(javafx\.scene\.)?(shape\.)?(Shape|Node|Circle|Rectangle|Ellipse|Polygon|Line|Arc)$/;
    if (!method.params.length && nodeTypes.test(ret) && !types.has(ret)) {
      if (!shape) return todo("无法判断要返回的 JavaFX 图形");
      if (!xField || !yField) return todo("没有找到 x / y 坐标字段");
      const kind = ShapeKinds[shape.kind];
      const conflict = types.has(kind.fx);
      const fx = conflict ? "javafx.scene.shape." + kind.fx : kind.fx;
      if (!conflict) imports.push("javafx.scene.shape." + kind.fx);
      const varName = kind.fx === "Polygon" ? "triangle" : kind.word === "square" ? "square" : kind.word;
      const where = "(" + xField.name + ", " + yField.name + ")";
      const lines = [
        opt.anchor === "center" ? "// " + where + " is the centre of the shape." : "// " + where + " is the top-left corner of the bounding box.",
        fx + " " + varName + " = new " + fx + "(" + kind.node(shape.dims, xField.name, yField.name, opt.anchor) + ");"
      ];
      if (colorField) lines.push(varName + ".setFill(" + colorField.name + ");");
      lines.push(varName + ".setStroke(javafx.scene.paint.Color.BLACK);".replace("javafx.scene.paint.", types.has("Color") ? "javafx.scene.paint." : ""));
      if (!types.has("Color")) imports.push("javafx.scene.paint.Color");
      lines.push("return " + varName + ";");
      return { ...auto(lines, "返回 " + kind.label + " 节点（请按题目核对 (x, y) 是左上角还是圆心）"), status: "check" };
    }
    if (name === "main" || name === "start") return todo("入口方法请用「Shape 程序」生成器的「只输出主程序」生成");
    return todo("未识别的方法，请手写");
  },

  // ---------- applying the chosen bodies ----------
  apply(file, fileIndex, suggestions, profile, { header = true } = {}) {
    let text = file.text;
    const chosen = suggestions.filter(s => s.use && s.file === fileIndex).map(s => {
      const method = file.types.flatMap(t => t.methods).find(mm => s.id.endsWith(":" + mm.bodyOpen) && s.id.includes("." + mm.name + ":"));
      return method ? { method, body: s.body, imports: s.imports || [] } : null;
    }).filter(Boolean).sort((a, b) => b.method.bodyOpen - a.method.bodyOpen);
    const needed = new Set();
    for (const { method, body, imports } of chosen) {
      const lineStart = text.lastIndexOf("\n", method.declStart) + 1;
      const indent = /^[ \t]*/.exec(text.slice(lineStart))[0].replace(/\t/g, "    ");
      const inner = Java.indent(body.replace(/\s+$/, ""), indent.length + 4);
      text = text.slice(0, method.bodyOpen + 1) + "\n" + inner + "\n" + indent + text.slice(method.bodyClose);
      imports.forEach(i => needed.add(i));
    }
    const present = new Set([...text.matchAll(/^\s*import\s+([\w.*]+)\s*;/gm)].map(m => m[1]));
    const missing = [...needed].filter(i => !present.has(i) && !present.has(i.replace(/\.\w+$/, ".*")));
    if (missing.length) {
      const importLines = [...text.matchAll(/^\s*import\s+[\w.*]+\s*;[^\n]*$/gm)];
      const block = missing.map(i => "import " + i + ";").join("\n");
      if (importLines.length) {
        const last = importLines[importLines.length - 1];
        const at = last.index + last[0].length;
        text = text.slice(0, at) + "\n" + block + text.slice(at);
      } else {
        text = block + "\n\n" + text.replace(/^\s+/, "");
      }
    }
    if (header) {
      // Replace a placeholder line such as "//Student Name & ID: xxxxxx"; keep a header the student already wrote.
      const lines = text.split("\n");
      const placeholder = lines.slice(0, 4).findIndex(l => /^\s*\/\/.*(student|name|姓名|学号).*(x{3,}|\.\.\.|<)/i.test(l));
      const written = lines.slice(0, 6).some(l => /^\s*\/\/.*(?:Student ID|学号)[:：]\s*\w{4,}/i.test(l) && !/x{3,}/i.test(l));
      if (placeholder >= 0) lines.splice(placeholder, 1);
      if (placeholder >= 0 || !written) text = Java.header(profile) + "\n" + lines.join("\n").replace(/^\n+/, "");
    }
    return text.replace(/\s*$/, "\n");
  },

  // Body for a String method from a template such as "{isbn} | {title} | {available}".
  templateBody(template, fields, types = {}) {
    return "return " + Java.template(template, name => fields.includes(name) ? name : null, "格式模板", name => types[name] === "String") + ";";
  },

  // ---------- link to the record (Lab 3) generator ----------
  toRecordModel(files) {
    const all = [...Skeleton.context(files).values()];
    const supported = new Set(["String", "int", "double", "boolean"]);
    const type = all.find(t => t.kind === "class" && t.extends !== "Application" && t.fields.filter(f => !f.isStatic && supported.has(f.type)).length >= 2);
    if (!type) return null;
    const fields = type.fields.filter(f => !f.isStatic && supported.has(f.type));
    const ctors = type.methods.filter(mm => mm.isCtor && mm.params.length);
    const byParams = c => c.params.map(p => fields.find(f => f.name.toLowerCase() === p.name.toLowerCase()) || fields.find(f => f.type === p.type));
    const full = ctors.find(c => c.params.length === fields.length);
    const partial = ctors.filter(c => c.params.length < fields.length).sort((a, b) => b.params.length - a.params.length)[0];
    const formCtor = partial || full;
    if (!formCtor) return null;
    const formFields = new Set(byParams(formCtor).filter(Boolean).map(f => f.name));
    const getterOf = f => type.methods.find(mm => !mm.isCtor && !mm.params.length && mm.name.toLowerCase() === ((f.type === "boolean" ? "is" : "get") + f.name).toLowerCase())?.name ||
      type.methods.find(mm => !mm.isCtor && !mm.params.length && mm.name.toLowerCase() === ("get" + f.name).toLowerCase())?.name ||
      (f.type === "boolean" ? "is" : "get") + Java.upperFirst(f.name);
    const keyField = fields.find(f => formFields.has(f.name) && f.type === "String") || fields.find(f => formFields.has(f.name) && f.type === "int");
    if (!keyField) return null;
    const model = RecordGen.defaults();
    const label = name => /^(id|isbn|no|url)$/i.test(name) ? name.toUpperCase() : Java.upperFirst(name);
    Object.assign(model, {
      appClass: type.name + "App", recordClass: type.name, title: type.name + " Records", file: type.name.toLowerCase() + "s.txt",
      output: "main", ctorUse: partial ? "form" : "all", fLoadTest: "no", testData: "", fEdit: "no",
      fields: fields.map(f => ({ name: f.name, type: f.type, label: label(f.name), getter: getterOf(f), inForm: formFields.has(f.name) ? "yes" : "no",
        key: f === keyField ? "yes" : "no", search: formFields.has(f.name) && f.type === "String" ? "yes" : "no", sort: "no",
        initial: f.type === "boolean" ? (/^(is)?(available|active|enabled|valid|open)$/i.test(f.name) ? "true" : "false") : f.type === "String" ? "" : "0" }))
    });
    const flag = fields.find(f => f.type === "boolean" && !formFields.has(f.name));
    model.toggles = flag && /available/i.test(flag.name) ? RecordGen.defaults().toggles.map(t => ({ ...t, field: flag.name })) : [];
    return model;
  },

  // ---------- link to the Shape generator ----------
  toOopModel(files) {
    const types = Skeleton.context(files);
    const all = [...types.values()];
    const iface = all.find(t => t.kind === "interface" && t.methods.some(m => m.params.some(p => /Pane$/.test(p.type))));
    const base = all.find(t => t.kind === "abstract") || all.find(t => all.some(o => o.extends === t.name));
    if (!base) return null;
    const subs = all.filter(t => t.extends === base.name && t.kind === "class");
    if (!subs.length) return null;
    const drawMethod = iface ? iface.methods.find(m => m.params.some(p => /Pane$/.test(p.type)))
      : base.methods.find(m => m.params.some(p => /Pane$/.test(p.type)));
    const methods = [...base.methods];
    const find = re => methods.find(m => re.test(m.name.toLowerCase()) && !m.isCtor)?.name || "";
    const fields = base.fields;
    const fieldName = re => fields.find(f => re.test(f.name.toLowerCase()))?.name || "";
    const areaField = fields.find(f => NUMERIC_TYPES.has(f.type) && /area/i.test(f.name));
    const xF = Skeleton.positionField(fields, "x"), yF = Skeleton.positionField(fields, "y");
    const colorF = fields.find(f => /Color$/.test(f.type));
    const model = OopGen.defaults();
    const stepMatch = base.methods.map(m => /-=\s*(\d+(?:\.\d+)?)/.exec(m.bodyText || "")).find(Boolean);
    Object.assign(model, {
      output: "main", useInterface: iface ? "yes" : "no",
      numType: areaField?.type === "double" ? "double" : "float",
      startX: /^\d+(\.\d+)?$/.test(xF?.init || "") ? xF.init : model.startX,
      startY: /^\d+(\.\d+)?$/.test(yF?.init || "") ? yF.init : model.startY,
      baseColor: /Color\.(\w+)/.exec(colorF?.init || "")?.[1] || model.baseColor,
      step: stepMatch ? stepMatch[1] : model.step,
      newStyle: subs.every(s => s.methods.some(m => m.isCtor && !m.params.length) || !s.methods.some(m => m.isCtor)) ? "noarg" : "args"
    });
    model.names = {
      iface: iface?.name || "", draw: drawMethod?.name || "draw",
      paneParam: drawMethod?.params.find(p => /Pane$/.test(p.type))?.name || "canvasPane",
      base: base.name, area: areaField?.name || "", perimeter: fields.find(f => NUMERIC_TYPES.has(f.type) && /perimeter|circumference/i.test(f.name))?.name || "",
      x: xF?.name || "x", y: yF?.name || "y", color: colorF?.name || "shapeColor",
      readShape: find(/^read/), computeArea: find(/area/), computePerimeter: find(/perimeter|circumference/),
      displayShape: find(/^(display|print|show)/), setColor: methods.find(m => m.params.some(p => /Color$/.test(p.type)))?.name || "",
      moveUp: find(/up$/), moveDown: find(/down$/), moveLeft: find(/left$/), moveRight: find(/right$/),
      enlarge: find(/^(enlarge|grow|increase|bigger|expand)/), shrink: find(/^(shrink|decrease|smaller|reduce)/),
      setPosition: methods.find(mm => !mm.isCtor && mm.params.length === 2 && mm.params.every(p => NUMERIC_TYPES.has(p.type)) &&
        /position|location|moveto|setxy|place/i.test(mm.name))?.name || ""
    };
    for (const key of ["computeArea", "computePerimeter"]) {
      if (model.names[key] && /^get/.test(model.names[key])) model.names[key] = "";
    }
    model.shapes = subs.map(s => {
      const info = Skeleton.shapeInfo(s, types, {}) ;
      const kind = info?.kind || "circle";
      const k = ShapeKinds[kind];
      return { kind, className: s.name, size1: String(k.dims[0].def), size2: k.dims[1] ? String(k.dims[1].def) : "" };
    });
    const colors = ["RED", "BLUE"];
    model.buttons = [
      ...model.shapes.map(s => ({ text: "Add " + Java.upperFirst(ShapeKinds[s.kind].word), action: "add", arg: s.className })),
      { text: "Clear Screen", action: "clear", arg: "" },
      ...(model.names.setColor ? colors.map(c => ({ text: "Color: " + c.charAt(0) + c.slice(1).toLowerCase(), action: "color", arg: c })) : []),
      ...["Up", "Down", "Left", "Right"].filter(d => model.names["move" + d]).map(d => ({ text: "Move " + d, action: d.toLowerCase(), arg: "" })),
      ...(model.names.enlarge ? [{ text: "Enlarge", action: "enlarge", arg: "" }] : []),
      ...(model.names.shrink ? [{ text: "Shrink", action: "shrink", arg: "" }] : [])
    ];
    if (subs.length > 1) model.storage = "list";
    return model;
  }
};

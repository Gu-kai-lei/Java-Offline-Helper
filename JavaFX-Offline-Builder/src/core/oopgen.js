/*
 * Assignment 2 style generator: interface + abstract Shape + concrete shapes + JavaFX main app
 * with button panels. The model also drives a browser simulation so the window can be tried
 * before compiling.
 */
"use strict";

const OOP_ACTIONS = {
  add: "添加图形 Add", clear: "清空画布 Clear", color: "改颜色 Color", up: "上移 Up", down: "下移 Down",
  left: "左移 Left", right: "右移 Right", enlarge: "放大 Enlarge", shrink: "缩小 Shrink",
  info: "控制台打印面积周长 Info", removeLast: "删除最后一个 Remove last", next: "选择下一个 Next",
  save: "保存到文件 Save", load: "从文件读取 Load",
  animStart: "开始动画 Start（Timeline）", animStop: "暂停动画 Stop", animReset: "停止动画并重新添加图形 Reset",
  rotate: "旋转 Rotate（每次加「每次旋转」的角度）"
};

const OOP_REGIONS = [["left", "左侧（竖排）"], ["right", "右侧（竖排）"], ["top", "顶部（横排）"], ["bottom", "底部（横排）"]];

const OOP_NAME_FIELDS = [
  ["iface", "接口名"], ["draw", "绘制方法"], ["paneParam", "draw 参数名"], ["base", "抽象父类名"],
  ["area", "面积字段"], ["perimeter", "周长字段"], ["x", "X 字段"], ["y", "Y 字段"], ["color", "颜色字段"],
  ["readShape", "readShape 方法"], ["computeArea", "computeArea 方法"], ["computePerimeter", "computePerimeter 方法"],
  ["displayShape", "displayShape 方法"], ["setColor", "改色方法"], ["moveUp", "上移方法"], ["moveDown", "下移方法"],
  ["moveLeft", "左移方法"], ["moveRight", "右移方法"], ["enlarge", "放大方法"], ["shrink", "缩小方法"],
  ["setPosition", "定位方法 setPosition(x, y)（题目没有就留空）"]
];

const OopGen = {
  actions: OOP_ACTIONS,
  regions: OOP_REGIONS,
  nameFields: OOP_NAME_FIELDS,

  defaults() {
    return {
      appClass: "JavaFXMainApp",
      title: "EIE3320 - JavaFX Homework by {name}",
      output: "split",
      useInterface: "yes",
      numType: "float",
      startX: "50", startY: "50", anchor: "topLeft",
      baseColor: "GREEN", step: "15", resizeStep: "10", shrinkMin: "",
      storage: "single", colorForNext: "no", newStyle: "noarg",
      panel: "left", spacing: "10", padding: "15", buttonWidth: "120",
      canvasW: "450", canvasH: "300", canvasColor: "WHITE", clip: "yes",
      sceneW: "600", sceneH: "300",
      infoLabel: "no", infoRegion: "", infoFormat: "Area: {area}   Perimeter: {perimeter}", infoEmpty: "No shape",
      sizeInput: "no", inputRegion: "top", inputLabels: "", inputDefaults: "", invalidMessage: "Invalid size",
      dataFile: "shapes.txt",
      keyControl: "no", mouseControl: "no", animMove: "right", animInterval: "50", replacements: [],
      printConsole: "yes", handlerStyle: "lambda",
      boundMinX: "", boundMaxX: "", boundMinY: "", boundMaxY: "", boundMessage: "Boundary reached",
      statusLabel: "no", statusRegion: "", statusInitial: "Ready", noShapeMessage: "No shape yet. Click an Add button first.",
      rotateStep: "45", keyStep: "", moveDone: "", startShape: "", toggleColor: "RED",
      names: {
        iface: "Drawable", draw: "draw", paneParam: "canvasPane", base: "Shape",
        area: "area", perimeter: "perimeter", x: "x", y: "y", color: "shapeColor",
        readShape: "readShape", computeArea: "computeArea", computePerimeter: "computePerimeter",
        displayShape: "displayShape", setColor: "setColor", moveUp: "moveUp", moveDown: "moveDown",
        moveLeft: "moveLeft", moveRight: "moveRight", enlarge: "enlarge", shrink: "shrink", setPosition: ""
      },
      shapes: [{ kind: "circle", className: "JavaFXCircle", size1: "50", size2: "" }],
      buttons: [
        { text: "Add Circle", action: "add", arg: "JavaFXCircle", region: "" },
        { text: "Clear Screen", action: "clear", arg: "", region: "" },
        { text: "Color: Red", action: "color", arg: "RED", region: "" },
        { text: "Color: Blue", action: "color", arg: "BLUE", region: "" },
        { text: "Move Up", action: "up", arg: "", region: "" },
        { text: "Move Down", action: "down", arg: "", region: "" }
      ]
    };
  },

  presets() {
    const a2 = OopGen.defaults();
    const multi = OopGen.defaults();
    Object.assign(multi, { appClass: "ShapeDrawer", title: "Shape Drawer - {name}", storage: "list", anchor: "center",
      startX: "200", startY: "150", infoLabel: "yes", numType: "double", canvasW: "450", canvasH: "320", sceneH: "360" });
    multi.shapes = [
      { kind: "circle", className: "MyCircle", size1: "40", size2: "" },
      { kind: "rectangle", className: "MyRectangle", size1: "120", size2: "70" },
      { kind: "square", className: "MySquare", size1: "80", size2: "" }
    ];
    const b = (text, action, arg = "", region = "") => ({ text, action, arg, region });
    multi.buttons = [b("Add Circle", "add", "MyCircle"), b("Add Rectangle", "add", "MyRectangle"), b("Add Square", "add", "MySquare"),
      b("Red", "color", "RED"), b("Yellow", "color", "YELLOW"), b("Left", "left"), b("Right", "right"), b("Up", "up"), b("Down", "down"),
      b("Enlarge", "enlarge"), b("Shrink", "shrink"), b("Remove Last", "removeLast"), b("Clear", "clear")];
    const rect = OopGen.defaults();
    Object.assign(rect, { appClass: "RectangleApp", title: "Rectangle Mover - {name}", panel: "bottom", step: "20",
      baseColor: "ORANGE", canvasW: "500", canvasH: "300", sceneW: "500", sceneH: "360", useInterface: "yes" });
    rect.shapes = [{ kind: "rectangle", className: "JavaFXRectangle", size1: "100", size2: "60" }];
    rect.buttons = [b("Add Rectangle", "add", "JavaFXRectangle"), b("Left", "left"), b("Right", "right"), b("Up", "up"), b("Down", "down"),
      b("Green", "color", "GREEN"), b("Clear", "clear")];
    const input = OopGen.defaults();
    Object.assign(input, { appClass: "CircleStudio", title: "Circle Studio - {name}", numType: "double", anchor: "center",
      startX: "150", startY: "120", baseColor: "BLUE", resizeStep: "5", shrinkMin: "5", sizeInput: "yes", inputRegion: "top",
      inputLabels: "Radius:", inputDefaults: "40", invalidMessage: "Invalid radius", infoLabel: "yes", infoEmpty: "No circle",
      canvasW: "400", canvasH: "300", sceneW: "0", sceneH: "0", printConsole: "no" });
    input.shapes = [{ kind: "circle", className: "MyCircle", size1: "40", size2: "" }];
    input.buttons = [b("Add Circle", "add", "MyCircle", "top"), b("Enlarge", "enlarge"), b("Shrink", "shrink"), b("Red", "color", "RED"), b("Clear", "clear")];
    const files = OopGen.defaults();
    Object.assign(files, { appClass: "ShapeCollection", title: "Shape Collection - {name}", numType: "double", anchor: "center",
      startX: "100", startY: "100", storage: "list", panel: "right", step: "30", canvasW: "450", canvasH: "320", sceneW: "0", sceneH: "0" });
    files.shapes = [{ kind: "circle", className: "CircleShape", size1: "30", size2: "" }, { kind: "square", className: "SquareShape", size1: "60", size2: "" }];
    files.buttons = [b("Add Circle", "add", "CircleShape"), b("Add Square", "add", "SquareShape"), b("Move Right", "right"),
      b("Blue", "color", "BLUE"), b("Save", "save"), b("Load", "load"), b("Clear", "clear")];
    const keys = OopGen.defaults();
    Object.assign(keys, { appClass: "PainterApp", title: "Square Painter - {name}", numType: "double", startX: "100", startY: "100",
      baseColor: "RED", step: "25", panel: "top", buttonWidth: "0", canvasW: "500", canvasH: "300", sceneW: "0", sceneH: "0",
      keyControl: "arrows", mouseControl: "click", infoLabel: "yes", infoRegion: "bottom", infoFormat: "Area: {area}", infoEmpty: "No square" });
    keys.names = { ...keys.names, setPosition: "setPosition" };
    keys.shapes = [{ kind: "square", className: "JavaFXSquare", size1: "80", size2: "" }];
    keys.buttons = [b("New Square", "add", "JavaFXSquare"), b("Blue", "color", "BLUE"), b("Green", "color", "GREEN"),
      b("Left", "left"), b("Right", "right"), b("Clear", "clear")];
    const anim = OopGen.defaults();
    Object.assign(anim, { appClass: "BallApp", title: "Moving Ball - {name}", numType: "double", anchor: "center", startX: "40", startY: "100",
      baseColor: "ORANGE", step: "5", panel: "bottom", buttonWidth: "0", sceneW: "0", sceneH: "0", animMove: "right", animInterval: "50" });
    anim.shapes = [{ kind: "circle", className: "Ball", size1: "20", size2: "" }];
    anim.buttons = [b("Add Ball", "add", "Ball"), b("Start", "animStart"), b("Stop", "animStop"), b("Reset", "animReset", "Ball")];
    const sized = OopGen.defaults();
    Object.assign(sized, { appClass: "RectangleWorkshop", title: "Rectangle Workshop - {name}", numType: "double", anchor: "center",
      startX: "150", startY: "120", baseColor: "BLUE", resizeStep: "5", sizeInput: "yes", inputRegion: "top",
      inputLabels: "Width:,Height:", inputDefaults: "40,25", inputMins: "10", inputMaxs: "120,90", invalidMessage: "Invalid size",
      infoLabel: "yes", infoFormat: "Area: {area}", infoEmpty: "No rectangle", canvasW: "400", canvasH: "300", sceneW: "0", sceneH: "0", printConsole: "no" });
    sized.shapes = [{ kind: "rectangle", className: "MeasuredRectangle", size1: "40", size2: "25" }];
    sized.buttons = [b("Add Rectangle", "add", "MeasuredRectangle", "top"), b("Enlarge", "enlarge"), b("Shrink", "shrink"), b("Clear", "clear")];
    return [
      { id: "a2", title: "A2 原题：圆 + 6 个按钮（左侧面板）", model: a2 },
      { id: "rect", title: "变体：矩形 + 上下左右移动（底部面板）", model: rect },
      { id: "multi", title: "变体：三种图形 + ArrayList + 放大缩小 + 面积显示", model: multi },
      { id: "input", title: "变体：输入框填半径 + 顶部/左侧两组按钮 + 面积 Label", model: input },
      { id: "files", title: "变体：ArrayList + 保存到 txt / 从 txt 读回", model: files },
      { id: "keys", title: "变体：方块 + 方向键移动 + 点击画布定位 + 面积 Label", model: keys },
      { id: "anim", title: "变体：Timeline 动画小球（Start / Stop / Reset）", model: anim },
      { id: "sized", title: "变体：输入宽高 + 尺寸范围（新增和缩放都检查）", model: sized }
    ];
  },

  // Validated, typed copy of the model. Throws Error with a Chinese message on bad input.
  normalize(model) {
    const m = { ...OopGen.defaults(), ...JSON.parse(JSON.stringify(model)) };
    const num = (key, label, opts) => Java.number(m[key], label, opts);
    const n = {};
    for (const [key, label] of OOP_NAME_FIELDS) {
      const raw = String(m.names?.[key] ?? "").trim();
      const optional = ["readShape", "computeArea", "computePerimeter", "displayShape", "moveLeft", "moveRight",
        "enlarge", "shrink", "area", "perimeter", "setColor", "moveUp", "moveDown", "iface", "setPosition"].includes(key);
      n[key] = raw === "" && optional ? "" : Java.ident(raw, label);
    }
    if (m.useInterface !== "yes") n.iface = "";
    if (m.useInterface === "yes" && !n.iface) throw new Error("使用接口时需要填写接口名。");
    const shapes = m.shapes.map((s, i) => {
      const kind = ShapeKinds[s.kind];
      if (!kind) throw new Error("第 " + (i + 1) + " 个图形类型无效。");
      const sizes = [s.size1, s.size2];
      const dims = {};
      kind.dims.forEach((dim, j) => {
        dims[dim.name] = Java.number(sizes[j] === "" || sizes[j] === undefined ? dim.def : sizes[j],
          s.className + " 的 " + dim.label, { min: 0.01, max: 5000 });
      });
      const color = String(s.color ?? "").trim().toUpperCase();
      if (color && !Java.COLORS.includes(color)) throw new Error("第 " + (i + 1) + " 个图形的颜色无效。");
      return { kind: s.kind, className: Java.ident(s.className, "第 " + (i + 1) + " 个图形类名"), dims, color };
    });
    if (!shapes.length) throw new Error("至少需要一个图形类。");
    const classNames = [m.appClass, n.base, n.iface, ...shapes.map(s => s.className)].filter(Boolean);
    const dup = classNames.find((c, i) => classNames.indexOf(c) !== i);
    if (dup) throw new Error("类名重复：" + dup);
    const panel = OOP_REGIONS.some(([r]) => r === m.panel) ? m.panel : "left";
    const region = r => OOP_REGIONS.some(([x]) => x === r) ? r : panel;
    const buttons = m.buttons.map((b, i) => {
      if (!OOP_ACTIONS[b.action]) throw new Error("第 " + (i + 1) + " 个按钮动作无效。");
      const text = String(b.text ?? "").trim();
      if (!text) throw new Error("第 " + (i + 1) + " 个按钮需要文字。");
      let arg = b.arg;
      if (b.action === "add" || b.action === "animReset") {
        arg = shapes.find(s => s.className === b.arg)?.className || shapes[0].className;
      } else if (b.action === "color") {
        arg = String(b.arg || "RED").toUpperCase();
        if (!Java.COLORS.includes(arg)) throw new Error("按钮「" + text + "」的颜色无效。");
      }
      if (["removeLast", "next"].includes(b.action) && m.storage !== "list") {
        throw new Error("按钮「" + text + "」需要把存储方式改为 ArrayList。");
      }
      if (b.action === "rotate" && m.storage === "list") throw new Error("按钮「" + text + "」的旋转只支持「只保留当前一个」。");
      return { text, action: b.action, arg, region: region(b.region), done: String(b.done ?? "") };
    });
    const used = new Set(buttons.map(b => b.action));
    const need = (action, key) => {
      if (used.has(action) && !n[key]) throw new Error("按钮用到了「" + OOP_ACTIONS[action] + "」，请在高级设置中填写对应的方法名。");
    };
    need("up", "moveUp"); need("down", "moveDown"); need("left", "moveLeft"); need("right", "moveRight");
    need("enlarge", "enlarge"); need("shrink", "shrink"); need("color", "setColor");
    // Keyboard, mouse and animation
    const keyControl = m.keyControl === "arrows";
    const mouseControl = ["click", "drag", "toggle"].includes(m.mouseControl) ? m.mouseControl : "no";
    const anim = used.has("animStart") || used.has("animStop") || used.has("animReset");
    const animMove = ["up", "down", "left", "right"].includes(m.animMove) ? m.animMove : "right";
    const moveName = { up: n.moveUp, down: n.moveDown, left: n.moveLeft, right: n.moveRight };
    if (anim && !moveName[animMove]) throw new Error("动画每一步要调用移动方法，请在高级设置里填写对应方向的方法名。");
    if (keyControl && !Object.values(moveName).some(Boolean)) throw new Error("方向键控制需要至少一个移动方法名。");
    const moves = { left: used.has("left") || (keyControl && Boolean(n.moveLeft)) || (anim && animMove === "left"),
      right: used.has("right") || (keyControl && Boolean(n.moveRight)) || (anim && animMove === "right") };
    const infoLabel = m.infoLabel === "yes";
    if ((infoLabel || used.has("info")) && (!n.area || !n.perimeter) && /\{(area|perimeter)\}/.test(m.infoFormat + (used.has("info") ? "{area}" : ""))) {
      throw new Error("显示面积周长需要面积和周长字段名。");
    }
    if ((used.has("save") || used.has("load")) && m.output === "main") {
      throw new Error("保存/读取按钮需要生成全部类（每个图形类要有 toFileLine 方法），不能选「只输出主程序」。");
    }
    const sizeInput = m.sizeInput === "yes";
    const maxDims = Math.max(...shapes.map(s => ShapeKinds[s.kind].dims.length));
    const firstKind = ShapeKinds[shapes[0].kind];
    const labels = String(m.inputLabels ?? "").split(",").map(s => s.trim());
    const defaults = String(m.inputDefaults ?? "").split(",").map(s => s.trim());
    const minValues = String(m.inputMins ?? "").split(",").map(s => s.trim());
    const maxValues = String(m.inputMaxs ?? "").split(",").map(s => s.trim());
    const at = (list, i) => (list.length === 1 ? list[0] : list[i]) || "";
    const inputs = sizeInput ? Array.from({ length: maxDims }, (_, i) => {
      const dim = firstKind.dims[i] || firstKind.dims[0];
      const def = defaults[i] !== undefined && defaults[i] !== "" ? defaults[i] : String(shapes[0].dims[dim.name]);
      const label = labels[i] || Java.upperFirst(dim.name) + ":";
      const range = NumericRules.range({ min: at(minValues, i), max: at(maxValues, i),
        minOpen: m.inputMinOpen, maxOpen: m.inputMaxOpen }, label);
      if (range.max !== null && range.max <= 0) throw new Error(label + "的尺寸必须有正数可用。");
      return { label, def, range };
    }) : [];
    const fileName = String(m.dataFile ?? "").trim();
    if ((used.has("save") || used.has("load")) && !/^[A-Za-z0-9_.-]{1,60}$/.test(fileName)) throw new Error("数据文件名只能含英文字母、数字、点、下划线和连字符。");
    const infoRegionRaw = OOP_REGIONS.some(([r]) => r === m.infoRegion) ? m.infoRegion : (panel === "bottom" ? "top" : "bottom");
    // Position limits for (x, y), checked before every move (buttons, keys, Timeline, mouse).
    const bound = (key, label) => String(m[key] ?? "").trim() === "" ? null : num(key, label, { min: -10000, max: 10000 });
    const bounds = { minX: bound("boundMinX", "X 下限"), maxX: bound("boundMaxX", "X 上限"), minY: bound("boundMinY", "Y 下限"), maxY: bound("boundMaxY", "Y 上限") };
    if (bounds.minX !== null && bounds.maxX !== null && bounds.minX > bounds.maxX) throw new Error("X 下限不能大于上限。");
    if (bounds.minY !== null && bounds.maxY !== null && bounds.minY > bounds.maxY) throw new Error("Y 下限不能大于上限。");
    const hasBounds = Object.values(bounds).some(v => v !== null);
    const keyStep = String(m.keyStep ?? "").trim() === "" ? null : num("keyStep", "方向键每次移动", { min: 0.01, max: 2000 });
    const startShape = String(m.startShape ?? "").trim() ? shapes.find(s => s.className === m.startShape) : null;
    if (String(m.startShape ?? "").trim() && !startShape) throw new Error("启动时添加的图形类「" + m.startShape + "」不存在。");
    const toggleColor = String(m.toggleColor || "RED").toUpperCase();
    if (!Java.COLORS.includes(toggleColor)) throw new Error("点击切换的颜色无效。");
    if (mouseControl === "toggle" && (!n.setColor || !n.color)) throw new Error("点击换色需要改色方法和颜色字段名（高级设置）。");
    if ((hasBounds || keyStep !== null) && (!n.x || !n.y)) throw new Error("位置边界需要 X / Y 字段名（高级设置）。");
    if (shapes.some(s => s.color) && !n.setColor) throw new Error("给图形单独设颜色需要改色方法名（高级设置）。");
    const statusRegion = OOP_REGIONS.some(([r]) => r === m.statusRegion) ? m.statusRegion : infoRegionRaw;
    // {x} {y} {area} {perimeter} need their field names; {angle} is 0.0 when there is no Rotate button.
    const texts = [[m.infoFormat, "Label 格式"], [m.moveDone, "移动后的提示"], ...(m.buttons || []).map((b, i) => [b.done, "第 " + (i + 1) + " 个按钮的成功提示"])];
    for (const [text, label] of texts) {
      for (const [, key] of String(text ?? "").matchAll(/\{(x|y|area|perimeter)\}/g)) {
        if (!n[key]) throw new Error(label + "里的 {" + key + "} 需要在高级设置里填写对应的字段名。");
      }
    }
    return {
      appClass: Java.ident(m.appClass, "主类名"), title: String(m.title ?? ""), output: m.output,
      useInterface: m.useInterface === "yes", numType: m.numType === "double" ? "double" : "float",
      startX: num("startX", "初始 X"), startY: num("startY", "初始 Y"), anchor: m.anchor === "center" ? "center" : "topLeft",
      baseColor: String(m.baseColor).toUpperCase(), step: num("step", "移动步长", { min: 0.01, max: 2000 }),
      resizeStep: num("resizeStep", "缩放步长", { min: 0.01, max: 2000 }),
      shrinkMin: String(m.shrinkMin ?? "").trim() === "" ? null : num("shrinkMin", "缩小下限", { min: 0, max: 2000 }),
      storage: m.storage === "list" ? "list" : "single", colorForNext: m.colorForNext === "yes",
      newStyle: sizeInput || m.newStyle === "args" ? "args" : "noarg",
      panel, spacing: num("spacing", "按钮间距", { min: 0, max: 200 }), padding: num("padding", "面板内边距", { min: 0, max: 200 }),
      buttonWidth: num("buttonWidth", "按钮宽度（0 = 自动）", { min: 0, max: 600 }),
      canvasW: num("canvasW", "画布宽", { min: 50, max: 3000 }), canvasH: num("canvasH", "画布高", { min: 50, max: 3000 }),
      canvasColor: String(m.canvasColor).toUpperCase(), clip: m.clip === "yes",
      sceneW: num("sceneW", "窗口宽（0 = 自动）", { min: 0, max: 4000 }), sceneH: num("sceneH", "窗口高（0 = 自动）", { min: 0, max: 4000 }),
      infoLabel, infoRegion: infoRegionRaw, infoFormat: String(m.infoFormat ?? ""), infoEmpty: String(m.infoEmpty ?? ""),
      sizeInput, inputRegion: region(m.inputRegion || "top"), inputs, invalidMessage: String(m.invalidMessage ?? "Invalid size"),
      dataFile: fileName, printConsole: m.printConsole === "yes",
      keyControl, mouseControl, anim, animMove, moveName, moves,
      animInterval: Java.number(m.animInterval ?? "50", "动画间隔（毫秒）", { min: 1, max: 600000 }),
      replacements: (m.replacements || []).filter(x => String(x.from ?? "") !== ""),
      handlerStyle: m.handlerStyle === "anonymous" ? "anonymous" : "lambda",
      bounds, hasBounds, boundMessage: String(m.boundMessage ?? "Boundary reached"),
      statusLabel: m.statusLabel === "yes", statusRegion, statusInitial: String(m.statusInitial ?? ""),
      noShapeMessage: String(m.noShapeMessage ?? "No shape yet. Click an Add button first."),
      rotateStep: num("rotateStep", "每次旋转角度", { min: -360, max: 360 }), keyStep, moveDone: String(m.moveDone ?? ""),
      startShape, toggleColor,
      names: n, shapes, buttons, used
    };
  },

  generate(model, profile = {}) {
    const m = OopGen.normalize(model);
    const units = [];
    if (m.output !== "main") {
      if (m.useInterface) units.push(OopGen.interfaceUnit(m));
      units.push(OopGen.baseUnit(m));
      for (const shape of m.shapes) units.push(OopGen.shapeUnit(m, shape));
    }
    units.push(OopGen.appUnit(m, profile));
    const files = JavaFiles.assemble(units, m.appClass, m.output === "main" ? "main" : m.output, profile)
      .map(f => ({ ...f, code: Java.replaceTexts(f.code, m.replacements) }));
    const warnings = [];
    if (!profile.name || !profile.id) warnings.push("还没有填写考生信息，文件头注释和标题会显示占位文字。");
    if (m.output === "main") warnings.push("只输出主程序：把它放进已经有 " + [m.names.iface, m.names.base, ...m.shapes.map(s => s.className)].filter(Boolean).join("、") + " 的 BlueJ 项目里。");
    if (m.output === "main" && m.sizeInput) warnings.push("尺寸来自输入框时，题目给的图形类必须有带尺寸参数的构造器，例如 new " + m.shapes[0].className + "(40)。");
    if (m.used.has("save") || m.used.has("load")) warnings.push("数据文件 " + m.dataFile + " 在 BlueJ 项目文件夹里；保存和读取的结果打印在 Terminal。");
    return { files, main: m.appClass, units, warnings, normalized: m };
  },

  interfaceUnit(m) {
    const n = m.names;
    return javaUnit(n.iface, "interface", ["javafx.scene.layout.Pane"],
      "/** A shape that can draw itself on a JavaFX Pane. */\npublic interface " + n.iface + " {\n" +
      "    void " + n.draw + "(Pane " + n.paneParam + ");\n}\n");
  },

  baseUnit(m) {
    const n = m.names, t = m.numType;
    const lines = [];
    if (n.area) lines.push("protected " + t + " " + n.area + ";");
    if (n.perimeter) lines.push("protected " + t + " " + n.perimeter + ";");
    lines.push("protected double " + n.x + " = " + Java.lit(m.startX) + ";");
    lines.push("protected double " + n.y + " = " + Java.lit(m.startY) + ";");
    lines.push("protected Color " + n.color + " = Color." + m.baseColor + ";", "");
    for (const key of ["readShape", "computeArea", "computePerimeter", "displayShape"]) {
      if (n[key]) lines.push("public abstract void " + n[key] + "();");
    }
    if (m.used.has("enlarge")) lines.push("public abstract void " + n.enlarge + "();");
    if (m.used.has("shrink")) lines.push("public abstract void " + n.shrink + "();");
    if (m.used.has("save") || m.used.has("load")) lines.push("public abstract String toFileLine();");
    if (!m.useInterface) lines.push("public abstract void " + n.draw + "(Pane " + n.paneParam + ");");
    const method = (name, body) => lines.push("", "public void " + name + "() {", "    " + body, "}");
    if (n.setColor) lines.push("", "public void " + n.setColor + "(Color color) {", "    this." + n.color + " = color;", "}");
    const step = Java.lit(m.step);
    if (n.moveUp) method(n.moveUp, "this." + n.y + " -= " + step + ";");
    if (n.moveDown) method(n.moveDown, "this." + n.y + " += " + step + ";");
    if (m.moves.left) method(n.moveLeft, "this." + n.x + " -= " + step + ";");
    if (m.moves.right) method(n.moveRight, "this." + n.x + " += " + step + ";");
    if (m.mouseControl !== "no" && n.setPosition) {
      lines.push("", "public void " + n.setPosition + "(double x, double y) {", "    this." + n.x + " = x;", "    this." + n.y + " = y;", "}");
    }
    const imports = ["javafx.scene.paint.Color"];
    if (!m.useInterface) imports.push("javafx.scene.layout.Pane");
    const header = "/** Parent of all shapes: area, perimeter, position and colour. */\npublic abstract class " + n.base +
      (m.useInterface ? " implements " + n.iface : "") + " {\n";
    return javaUnit(n.base, "abstract", imports, header + Java.indent(lines.join("\n"), 4) + "\n}\n");
  },

  shapeUnit(m, shape) {
    const n = m.names, t = m.numType, kind = ShapeKinds[shape.kind];
    const dimNames = Object.fromEntries(kind.dims.map(d => [d.name, d.name]));
    const lit = v => Java.lit(v, t);
    const userClasses = new Set([n.base, n.iface, m.appClass, ...m.shapes.map(s => s.className)]);
    const fxName = userClasses.has(kind.fx) ? "javafx.scene.shape." + kind.fx : kind.fx;
    const imports = ["javafx.scene.layout.Pane"];
    if (fxName === kind.fx) imports.push("javafx.scene.shape." + kind.fx);
    const params = kind.dims.map(d => t + " " + d.name).join(", ");
    const defaults = kind.dims.map(d => lit(shape.dims[d.name])).join(", ");
    const lines = kind.dims.map(d => "private " + t + " " + d.name + ";");
    lines.push("", "public " + shape.className + "() {", "    this(" + defaults + ");", "}");
    lines.push("", "public " + shape.className + "(" + params + ") {",
      ...kind.dims.map(d => "    this." + d.name + " = " + d.name + ";"), "}");
    const override = (name, body, type = "void") => lines.push("", "@Override", "public " + type + " " + name + "() {", Java.indent(body, 4), "}");
    if (n.readShape) {
      override(n.readShape, "// A GUI has no console input, so keep the size from the constructor.\nif (" +
        kind.dims.map(d => d.name + " <= 0").join(" || ") + ") {\n" +
        kind.dims.map(d => "    " + d.name + " = " + lit(shape.dims[d.name]) + ";").join("\n") + "\n}");
    }
    if (n.computeArea && n.area) override(n.computeArea, n.area + " = " + ShapeLib.formula(shape.kind, "area", dimNames, t) + ";");
    if (n.computePerimeter && n.perimeter) override(n.computePerimeter, n.perimeter + " = " + ShapeLib.formula(shape.kind, "perimeter", dimNames, t) + ";");
    if (n.displayShape) {
      const out = [];
      if (n.area) out.push('System.out.println("Area of ' + kind.word + ' = " + ' + n.area + ");");
      if (n.perimeter) out.push('System.out.println("Perimeter of ' + kind.word + ' = " + ' + n.perimeter + ");");
      if (!out.length) out.push('System.out.println("' + shape.className + ' at (" + ' + n.x + ' + ", " + ' + n.y + ' + ")");');
      override(n.displayShape, out.join("\n"));
    }
    const resize = lit(m.resizeStep);
    const scale = grow => {
      if (!m.inputs.some(f => f.range.min !== null || f.range.max !== null)) {
        return ShapeLib.growLines(shape.kind, dimNames, resize, grow, m.shrinkMin === null ? null : lit(m.shrinkMin)).join("\n");
      }
      const op = grow ? "+" : "-";
      const candidates = kind.dims.map((d, i) => {
        const next = "(" + d.name + " " + op + " " + resize + ")";
        const invalid = NumericRules.invalid(next, m.inputs[i].range);
        return next + " <= 0 || " + invalid + (!grow && m.shrinkMin !== null ? " || " + next + " < " + lit(m.shrinkMin) : "");
      });
      return "if (" + candidates.join(" || ") + ") {\n    return;\n}\n" +
        kind.dims.map(d => d.name + " " + op + "= " + resize + ";").join("\n");
    };
    if (m.used.has("enlarge")) override(n.enlarge, scale(true));
    if (m.used.has("shrink")) override(n.shrink, scale(false));
    if (m.used.has("save") || m.used.has("load")) {
      lines.push("", "/** One line of the data file: class name, x, y, colour, size. */", "@Override", "public String toFileLine() {",
        "    return " + Java.str(shape.className + ",") + " + " + n.x + ' + "," + ' + n.y + ' + "," + ' + n.color +
        kind.dims.map(d => ' + "," + ' + d.name).join("") + ";", "}");
    }
    const varName = kind.word === "square" || kind.word === "rectangle" ? "rect" : kind.word === "triangle" ? "triangle" : kind.word;
    const anchorNote = m.anchor === "center" ? "// (" + n.x + ", " + n.y + ") is the centre of the shape." : "// (" + n.x + ", " + n.y + ") is the top-left corner of the bounding box.";
    lines.push("", "@Override", "public void " + n.draw + "(Pane " + n.paneParam + ") {",
      "    " + anchorNote,
      "    " + fxName + " " + varName + " = new " + fxName + "(" + kind.node(dimNames, n.x, n.y, m.anchor) + ");",
      "    " + varName + ".setFill(" + n.color + ");",
      "    " + n.paneParam + ".getChildren().add(" + varName + ");", "}");
    const doc = "/** " + Java.upperFirst(kind.word) + " that computes its area and perimeter and draws itself. */\n";
    return javaUnit(shape.className, "class", imports,
      doc + "public class " + shape.className + " extends " + n.base + " {\n" + Java.indent(lines.join("\n"), 4) + "\n}\n");
  },

  newExpression(m, shape, sizeVars) {
    const kind = ShapeKinds[shape.kind];
    if (sizeVars) return "new " + shape.className + "(" + kind.dims.map((d, i) => sizeVars[Math.min(i, sizeVars.length - 1)]).join(", ") + ")";
    if (m.newStyle === "noarg") return "new " + shape.className + "()";
    return "new " + shape.className + "(" + kind.dims.map(d => Java.lit(shape.dims[d.name], m.numType)).join(", ") + ")";
  },

  // "Area: {area}" -> "Area: " + String.format("%.2f", activeShape.area)
  infoExpression(m, format) {
    const parts = [];
    const re = /\{(area|perimeter|class|x|y|angle)\}/g;
    let last = 0, match;
    const text = format ?? m.infoFormat ?? "";
    while ((match = re.exec(text))) {
      if (match.index > last) parts.push(Java.str(text.slice(last, match.index)));
      const key = match[1];
      parts.push(key === "class" ? "activeShape.getClass().getSimpleName()" : key === "angle" ? (m.used.has("rotate") ? "angle" : "0.0")
        : key === "x" || key === "y" ? "activeShape." + m.names[key]
        : 'String.format("%.2f", activeShape.' + m.names[key] + ")");
      last = re.lastIndex;
    }
    if (last < text.length) parts.push(Java.str(text.slice(last)));
    // A number in front ({x}, {angle}) would make the + an addition, so start with an empty string.
    if (/^\{(x|y|angle)\}/.test(text)) parts.unshift('""');
    return parts.length ? parts.join(" + ") : '""';
  },

  appUnit(m, profile) {
    const n = m.names;
    const imports = ["javafx.application.Application", "javafx.geometry.Insets", "javafx.scene.Scene",
      "javafx.scene.control.Button", "javafx.scene.layout.BorderPane", "javafx.scene.layout.Pane", "javafx.stage.Stage"];
    const userClasses = new Set([n.base, n.iface, ...m.shapes.map(s => s.className)]);
    const files = m.used.has("save") || m.used.has("load");
    if (m.used.has("color") || m.colorForNext || m.used.has("load")) imports.push("javafx.scene.paint.Color");
    if (m.storage === "list" || m.used.has("load")) imports.push("java.util.ArrayList");
    const messageLabel = m.sizeInput && !m.infoLabel;
    if (m.infoLabel || m.sizeInput || m.statusLabel) imports.push("javafx.scene.control.Label");
    if (m.shapes.some(s => s.color) || m.mouseControl === "toggle") imports.push("javafx.scene.paint.Color");
    if (m.sizeInput) imports.push("javafx.scene.control.TextField");
    if (m.used.has("save")) imports.push("java.io.PrintWriter", "java.io.FileNotFoundException");
    if (m.used.has("load")) imports.push("java.io.File", "java.io.FileNotFoundException", "java.util.Scanner");
    if (m.keyControl) imports.push("javafx.scene.input.KeyCode");
    if (m.anim) imports.push("javafx.animation.KeyFrame", "javafx.animation.Timeline", "javafx.util.Duration");
    const clipName = userClasses.has("Rectangle") ? "javafx.scene.shape.Rectangle" : "Rectangle";
    if (m.clip && clipName === "Rectangle") imports.push("javafx.scene.shape.Rectangle");

    const fields = [];
    if (files) fields.push("private static final String DATA_FILE = " + Java.str(m.dataFile) + ";", "");
    fields.push("private Pane canvasPane = new Pane();");
    if (m.storage === "list") fields.push("private ArrayList<" + n.base + "> shapes = new ArrayList<>();");
    fields.push("private " + n.base + " activeShape;   // the shape the buttons act on; null when none");
    if (m.colorForNext) fields.push("private Color nextColor = Color." + m.baseColor + ";   // colour for shapes added later");
    if (m.infoLabel) fields.push("private Label infoLabel = new Label(" + Java.str(m.infoEmpty) + ");");
    if (messageLabel) fields.push('private Label messageLabel = new Label("");');
    if (m.statusLabel) fields.push("private Label statusLabel = new Label(" + Java.str(m.statusInitial) + ");   // messages: no shape, boundary, last action");
    const rotating = m.used.has("rotate");
    if (rotating) fields.push("private double angle = 0;   // rotation of the active shape in degrees");
    m.inputs.forEach((input, i) => fields.push("private TextField sizeField" + (i + 1) + " = new TextField(" + Java.str(input.def) + ");"));
    if (m.anim) fields.push("private Timeline timeline;   // moves the active shape again and again");

    const ids = Java.names(["canvasPane", "shapes", "activeShape", "nextColor", "infoLabel", "messageLabel", "statusLabel", "angle", "stage", "root", "scene", "timeline",
      "controlPanel", "topBox", "bottomBox", "leftBox", "rightBox", "clip", "e", "size1", "size2", "DATA_FILE",
      ...m.inputs.map((_, i) => "sizeField" + (i + 1))]);
    const start = [];
    const buttonNames = m.buttons.map(b => ids.take(Java.camel(b.text, "Button", "action")));
    m.buttons.forEach((b, i) => start.push("Button " + buttonNames[i] + " = new Button(" + Java.str(b.text) + ");"));
    if (m.buttonWidth > 0) {
      start.push("", "// Same width for every button");
      buttonNames.forEach(name => start.push(name + ".setPrefWidth(" + Java.lit(m.buttonWidth) + ");"));
    }
    start.push("", "// Register one event handler for each button");
    const guard = body => "if (hasActiveShape()) {\n" + Java.indent(body, 4) + "\n}";
    // A message goes to the status Label when there is one, otherwise to the BlueJ terminal.
    const say = expr => (m.statusLabel ? "statusLabel.setText(" : "System.out.println(") + expr + ");";
    const done = (b, plain) => b.done ? "\n" + say(plain ? Java.str(b.done) : OopGen.infoExpression(m, b.done)) : "";
    const delta = { up: [0, -m.step], down: [0, m.step], left: [-m.step, 0], right: [m.step, 0] };
    const checked = (dir, body) => m.hasBounds ? "if (canMove(" + delta[dir].map(v => Java.lit(v)).join(", ") + ")) {\n" + Java.indent(body, 4) + "\n}" : body;
    const create = (shape, sizeVars) => shape.color ? "paint(" + OopGen.newExpression(m, shape, sizeVars) + ", Color." + shape.color + ")" : OopGen.newExpression(m, shape, sizeVars);
    const recompute = [n.computeArea, n.computePerimeter, m.printConsole ? n.displayShape : ""]
      .filter(Boolean).map(name => "activeShape." + name + "();");
    m.buttons.forEach((b, i) => {
      let body;
      switch (b.action) {
        case "add": {
          const shape = m.shapes.find(s => s.className === b.arg);
          if (m.sizeInput) {
            const dims = ShapeKinds[shape.kind].dims;
            const vars = dims.map(d => d.name);
            const reads = vars.map((v, j) => m.numType + " " + v + " = readSize(sizeField" + (Math.min(j, m.inputs.length - 1) + 1) + ");");
            const valid = vars.map((v, i) => v + " > 0" +
              (m.inputs[i].range.min !== null || m.inputs[i].range.max !== null ? " && !(" + NumericRules.invalid(v, m.inputs[i].range) + ")" : ""));
            body = reads.join("\n") + "\nif (" + valid.join(" && ") + ") {\n    addShape(" + create(shape, vars) + ");" + Java.indent(done(b), 4) + "\n}" +
              (m.inputs.some(f => f.range.min !== null || f.range.max !== null) ? " else {\n    " + (m.infoLabel ? "infoLabel" : "messageLabel") +
                ".setText(" + Java.str(m.invalidMessage) + ");\n}" : "");
          } else body = "addShape(" + create(shape) + ");" + done(b);
          break;
        }
        case "clear": body = "clearScreen();" + done(b, true); break;
        case "color": body = "changeColor(Color." + b.arg + ");" + (b.done ? "\nif (activeShape != null) {" + Java.indent(done(b), 4) + "\n}" : ""); break;
        case "up": body = guard(checked("up", "activeShape." + n.moveUp + "();\nredraw();" + done(b))); break;
        case "down": body = guard(checked("down", "activeShape." + n.moveDown + "();\nredraw();" + done(b))); break;
        case "left": body = guard(checked("left", "activeShape." + n.moveLeft + "();\nredraw();" + done(b))); break;
        case "right": body = guard(checked("right", "activeShape." + n.moveRight + "();\nredraw();" + done(b))); break;
        case "rotate": body = guard("angle = (angle + " + Java.lit(m.rotateStep) + ") % 360;\nredraw();" + done(b)); break;
        case "enlarge": body = guard(["activeShape." + n.enlarge + "();", ...recompute, "redraw();"].join("\n") + done(b)); break;
        case "shrink": body = guard(["activeShape." + n.shrink + "();", ...recompute, "redraw();"].join("\n") + done(b)); break;
        case "info": body = guard([n.computeArea ? "activeShape." + n.computeArea + "();" : "", n.computePerimeter ? "activeShape." + n.computePerimeter + "();" : "",
          n.displayShape ? "activeShape." + n.displayShape + "();" : "",
          'System.out.println("Area = " + activeShape.' + n.area + ' + ", Perimeter = " + activeShape.' + n.perimeter + ");",
          "redraw();"].filter(Boolean).join("\n")); break;
        case "removeLast": body = "if (!shapes.isEmpty()) {\n    shapes.remove(shapes.size() - 1);\n    activeShape = shapes.isEmpty() ? null : shapes.get(shapes.size() - 1);\n    redraw();" + Java.indent(done(b, true), 4) + "\n}"; break;
        case "next": body = "if (!shapes.isEmpty()) {\n    int index = (shapes.indexOf(activeShape) + 1) % shapes.size();\n    activeShape = shapes.get(index);\n    redraw();" + Java.indent(done(b, true), 4) + "\n}"; break;
        case "save": body = "saveShapes();" + done(b, true); break;
        case "load": body = "loadShapes();" + done(b, true); break;
        case "animStart": body = "timeline.play();" + done(b, true); break;
        case "animStop": body = "timeline.pause();" + done(b, true); break;
        case "animReset": body = "timeline.stop();\naddShape(" + create(m.shapes.find(s => s.className === b.arg)) + ");" + done(b); break;
      }
      const handler = Java.handler(buttonNames[i], "setOnAction", body, { style: m.handlerStyle });
      imports.push(...handler.imports);
      start.push(handler.code);
    });

    if (m.anim) {
      start.push("", "// Animation: every " + Java.lit(m.animInterval) + " ms move the active shape and draw it again",
        "timeline = new Timeline(new KeyFrame(Duration.millis(" + Java.lit(m.animInterval) + "), e -> {",
        "    if (activeShape != null) {",
        ...(m.hasBounds
          ? ["        if (canMove(" + delta[m.animMove].map(v => Java.lit(v)).join(", ") + ")) {", "            activeShape." + m.moveName[m.animMove] + "();", "            redraw();",
            ...(m.moveDone ? ["            " + say(OopGen.infoExpression(m, m.moveDone))] : []), "        } else {", "            timeline.stop();   // stop at the boundary", "        }"]
          : ["        activeShape." + m.moveName[m.animMove] + "();", "        redraw();", ...(m.moveDone ? ["        " + say(OopGen.infoExpression(m, m.moveDone))] : [])]),
        "    }", "}));",
        "timeline.setCycleCount(Timeline.INDEFINITE);");
    }
    if (m.mouseControl === "toggle") {
      // getTarget() is the node that was clicked: only a click on the drawn shape itself changes the colour.
      const toggle = Java.handler("canvasPane", "setOnMouseClicked",
        "if (activeShape != null && e.getTarget() instanceof javafx.scene.shape.Shape) {\n    activeShape." + n.setColor + "(activeShape." + n.color +
        ".equals(Color." + m.toggleColor + ") ? Color." + m.baseColor + " : Color." + m.toggleColor + ");\n    redraw();\n}",
        { style: m.handlerStyle, eventClass: "MouseEvent" });
      imports.push(...toggle.imports);
      start.push("", "// Mouse: clicking the shape switches it between " + m.baseColor + " and " + m.toggleColor, toggle.code);
    } else if (m.mouseControl !== "no") {
      const place = n.setPosition ? "activeShape." + n.setPosition + "(e.getX(), e.getY());"
        : "activeShape." + n.x + " = e.getX();\n    activeShape." + n.y + " = e.getY();";
      const moveTo = place + "\nredraw();";
      const mouse = Java.handler("canvasPane", m.mouseControl === "drag" ? "setOnMouseDragged" : "setOnMouseClicked",
        "if (activeShape != null) {\n" + Java.indent(m.hasBounds
          ? "if (canMove(e.getX() - activeShape." + n.x + ", e.getY() - activeShape." + n.y + ")) {\n" + Java.indent(moveTo, 4) + "\n}"
          : moveTo, 4) + "\n}", { style: m.handlerStyle, eventClass: "MouseEvent" });
      imports.push(...mouse.imports);
      start.push("", "// Mouse: " + (m.mouseControl === "drag" ? "dragging" : "clicking") + " on the canvas moves the active shape there", mouse.code);
    }
    if (m.keyControl) {
      start.push("", "// Buttons must not keep the keyboard focus, otherwise the arrow keys would move between buttons");
      buttonNames.forEach(name => start.push(name + ".setFocusTraversable(false);"));
    }

    // Layout: one box per BorderPane region that has something in it.
    const regionItems = { left: [], right: [], top: [], bottom: [] };
    if (m.sizeInput) {
      m.inputs.forEach((input, i) => regionItems[m.inputRegion].push("new Label(" + Java.str(input.label) + ")", "sizeField" + (i + 1)));
    }
    m.buttons.forEach((b, i) => regionItems[b.region].push(buttonNames[i]));
    if (messageLabel) regionItems[m.inputRegion].push("messageLabel");
    if (m.statusLabel) regionItems[m.statusRegion].push("statusLabel");
    if (m.infoLabel && regionItems[m.infoRegion].length) regionItems[m.infoRegion].push("infoLabel");
    const boxName = region => region === m.panel ? "controlPanel" : region + "Box";
    start.push("");
    for (const [region] of OOP_REGIONS) {
      const items = regionItems[region];
      if (!items.length) continue;
      const vertical = region === "left" || region === "right";
      const box = vertical ? "VBox" : "HBox";
      imports.push("javafx.scene.layout." + box);
      start.push("// " + Java.upperFirst(region) + " " + box,
        box + " " + boxName(region) + " = new " + box + "(" + Java.lit(m.spacing) + ", " + items.join(", ") + ");",
        boxName(region) + ".setPadding(new Insets(" + Java.lit(m.padding) + "));");
      if (!vertical) { imports.push("javafx.geometry.Pos"); start.push(boxName(region) + ".setAlignment(Pos.CENTER_LEFT);"); }
    }
    start.push("", "// Drawing canvas");
    start.push("canvasPane.setPrefSize(" + Java.lit(m.canvasW) + ", " + Java.lit(m.canvasH) + ");");
    start.push('canvasPane.setStyle("-fx-background-color: ' + m.canvasColor.toLowerCase() + ';");');
    if (m.clip) {
      start.push("// Keep moved shapes inside the canvas area",
        clipName + " clip = new " + clipName + "();",
        "clip.widthProperty().bind(canvasPane.widthProperty());",
        "clip.heightProperty().bind(canvasPane.heightProperty());",
        "canvasPane.setClip(clip);");
    }
    start.push("", "BorderPane root = new BorderPane();", "root.setCenter(canvasPane);");
    for (const [region] of OOP_REGIONS) if (regionItems[region].length) start.push("root.set" + Java.upperFirst(region) + "(" + boxName(region) + ");");
    if (m.infoLabel && !regionItems[m.infoRegion].length) {
      start.push("infoLabel.setPadding(new Insets(8));", "root.set" + Java.upperFirst(m.infoRegion) + "(infoLabel);");
    }
    const title = Java.fillProfile(m.title, profile);
    start.push("", "stage.setTitle(" + Java.str(title) + ");");
    const sceneExpr = m.sceneW > 0 && m.sceneH > 0 ? "new Scene(root, " + Java.lit(m.sceneW) + ", " + Java.lit(m.sceneH) + ")" : "new Scene(root)";
    if (m.keyControl) {
      const keyDir = { LEFT: "left", RIGHT: "right", UP: "up", DOWN: "down" };
      const keyMove = (code, name) => {
        const dir = keyDir[code];
        // With its own key step the key changes x / y directly; otherwise it calls the same move method as the button.
        const own = m.keyStep !== null;
        const d = own ? { up: [0, -m.keyStep], down: [0, m.keyStep], left: [-m.keyStep, 0], right: [m.keyStep, 0] }[dir] : delta[dir];
        const move = own ? "activeShape." + (d[0] ? n.x + (d[0] < 0 ? " -= " : " += ") + Java.lit(Math.abs(d[0])) : n.y + (d[1] < 0 ? " -= " : " += ") + Java.lit(Math.abs(d[1]))) + ";"
          : "activeShape." + name + "();";
        const body = move + (m.moveDone ? "\n" + say(OopGen.infoExpression(m, m.moveDone)) : "");
        return m.hasBounds ? "if (canMove(" + d.map(v => Java.lit(v)).join(", ") + ")) {\n" + Java.indent(body, 4) + "\n}" : body;
      };
      const branches = [["LEFT", n.moveLeft], ["RIGHT", n.moveRight], ["UP", n.moveUp], ["DOWN", n.moveDown]].filter(([, name]) => name)
        .map(([code, name], i) => (i === 0 ? "if" : "} else if") + " (e.getCode() == KeyCode." + code + ") {\n" + Java.indent(keyMove(code, name), 4)).join("\n") + "\n}";
      const keys = Java.handler("scene", "setOnKeyPressed", "if (activeShape == null) {\n    return;\n}\n" + branches + "\nredraw();",
        { style: m.handlerStyle, eventClass: "KeyEvent" });
      imports.push(...keys.imports);
      start.push("Scene scene = " + sceneExpr + ";", "// Keyboard: the arrow keys move the active shape", keys.code, "stage.setScene(scene);");
    } else {
      start.push("stage.setScene(" + sceneExpr + ");");
    }
    if (m.startShape) start.push("addShape(" + create(m.startShape) + ");   // the window starts with one shape");
    start.push("stage.show();");
    if (m.keyControl) start.push("canvasPane.requestFocus();");
    if (m.anim) {
      const stop = Java.handler("stage", "setOnCloseRequest", "timeline.stop();", { style: m.handlerStyle, eventClass: "WindowEvent" });
      imports.push(...stop.imports);
      start.push(stop.code);
    }

    const methods = [];
    const addBody = [];
    if (m.colorForNext && n.setColor) addBody.push("shape." + n.setColor + "(nextColor);");
    for (const key of ["readShape", "computeArea", "computePerimeter"]) if (n[key]) addBody.push("shape." + n[key] + "();");
    if (m.printConsole && n.displayShape) addBody.push("shape." + n.displayShape + "();");
    if (m.storage === "list") addBody.push("shapes.add(shape);");
    if (rotating) addBody.push("angle = 0;");
    addBody.push("activeShape = shape;", "redraw();");
    methods.push("/** Add button: " + (m.storage === "list" ? "keeps the earlier shapes and makes the new one active." : "replaces the previous shape with a new one.") + " */",
      "private void addShape(" + n.base + " shape) {", Java.indent(addBody.join("\n"), 4), "}");
    methods.push("", "/** Clear button: removes every drawn shape. */", "private void clearScreen() {",
      ...(m.storage === "list" ? ["    shapes.clear();"] : []), ...(rotating ? ["    angle = 0;"] : []), "    activeShape = null;", "    redraw();", "}");
    if (m.shapes.some(s => s.color)) {
      methods.push("", "/** Gives a new shape its own colour before it is added. */", "private " + n.base + " paint(" + n.base + " shape, Color color) {",
        "    shape." + n.setColor + "(color);", "    return shape;", "}");
    }
    if (m.hasBounds) {
      const b = m.bounds, tests = [];
      if (b.minX !== null) tests.push("nextX < " + Java.lit(b.minX));
      if (b.maxX !== null) tests.push("nextX > " + Java.lit(b.maxX));
      if (b.minY !== null) tests.push("nextY < " + Java.lit(b.minY));
      if (b.maxY !== null) tests.push("nextY > " + Java.lit(b.maxY));
      methods.push("", "/** True when the active shape may move by (dx, dy): its new (x, y) stays inside the allowed area. */",
        "private boolean canMove(double dx, double dy) {", "    double nextX = activeShape." + n.x + " + dx;", "    double nextY = activeShape." + n.y + " + dy;",
        "    if (" + tests.join(" || ") + ") {", "        " + say(Java.str(m.boundMessage)), "        return false;", "    }", "    return true;", "}");
    }
    if (m.used.has("color")) {
      methods.push("", "/** Colour buttons: recolour the active shape" + (m.colorForNext ? " and the shapes added later" : "") + ". */",
        "private void changeColor(Color color) {");
      if (m.colorForNext) methods.push("    nextColor = color;");
      methods.push("    if (hasActiveShape()) {", "        activeShape." + n.setColor + "(color);", "        redraw();", "    }", "}");
    }
    methods.push("", "private boolean hasActiveShape() {", "    if (activeShape == null) {",
      "        " + say(Java.str(m.noShapeMessage)), "        return false;", "    }", "    return true;", "}");
    if (m.sizeInput) {
      const t = m.numType, parse = t === "float" ? "Float.parseFloat" : "Double.parseDouble";
      methods.push("", "/** Reads a positive number from a text field; shows a message and returns -1 when it is not valid. */",
        "private " + t + " readSize(TextField field) {", "    try {", "        " + t + " value = " + parse + "(field.getText().trim());",
        "        if (value > 0 && " + (t === "float" ? "Float" : "Double") + ".isFinite(value)) {", "            return value;", "        }", "    } catch (NumberFormatException ex) {",
        "        // not a number: fall through to the message below", "    }",
        "    " + (m.infoLabel ? "infoLabel" : "messageLabel") + ".setText(" + Java.str(m.invalidMessage) + ");", "    return -1;", "}");
    }
    if (m.used.has("save")) {
      const all = m.storage === "list";
      methods.push("", "/** Save button: one line per shape (class name, x, y, colour, size). */", "private void saveShapes() {",
        "    try (PrintWriter output = new PrintWriter(DATA_FILE)) {",
        ...(all ? ["        for (" + n.base + " shape : shapes) {", "            output.println(shape.toFileLine());", "        }",
          '        System.out.println(shapes.size() + " shape(s) saved to " + DATA_FILE + ".");']
          : ["        if (activeShape != null) {", "            output.println(activeShape.toFileLine());", "        }",
            '        System.out.println("Shape saved to " + DATA_FILE + ".");']),
        "    } catch (FileNotFoundException ex) {", '        System.out.println("Unable to save " + DATA_FILE + ".");', "    }", "}");
    }
    if (m.used.has("load")) {
      const maxDims = Math.max(...m.shapes.map(s => ShapeKinds[s.kind].dims.length));
      const parse = m.numType === "float" ? "Float.parseFloat" : "Double.parseDouble";
      const branches = m.shapes.map((s, i) => (i === 0 ? "if" : "} else if") + " (parts[0].equals(" + Java.str(s.className) + ")) {\n    shape = new " + s.className + "(" +
        ShapeKinds[s.kind].dims.map((d, j) => parse + "(parts[" + (4 + j) + "])").join(", ") + ");").join("\n") + "\n}";
      const after = [n.computeArea ? "shape." + n.computeArea + "();" : "", n.computePerimeter ? "shape." + n.computePerimeter + "();" : ""].filter(Boolean);
      methods.push("", "/** Load button: replaces the shapes with the ones stored in the data file. */", "private void loadShapes() {",
        "    ArrayList<" + n.base + "> loaded = new ArrayList<>();",
        "    try (Scanner input = new Scanner(new File(DATA_FILE))) {", "        while (input.hasNextLine()) {",
        '            String[] parts = input.nextLine().split(",");', "            if (parts.length < " + (4 + Math.min(...m.shapes.map(s => ShapeKinds[s.kind].dims.length))) + ") {",
        "                continue;   // skip an empty or damaged line", "            }", "            try {",
        "                " + n.base + " shape = null;", Java.indent(branches, 16),
        "                if (shape != null) {", "                    shape." + n.x + " = Double.parseDouble(parts[1]);",
        "                    shape." + n.y + " = Double.parseDouble(parts[2]);", "                    shape." + n.color + " = Color.web(parts[3]);",
        ...after.map(l => "                    " + l), "                    loaded.add(shape);", "                }",
        "            } catch (IllegalArgumentException | ArrayIndexOutOfBoundsException ex) {", "                // skip a line with a bad number or colour", "            }",
        "        }", "    } catch (FileNotFoundException ex) {", '        System.out.println("Unable to load " + DATA_FILE + ".");', "        return;", "    }",
        ...(m.storage === "list" ? ["    shapes.clear();", "    shapes.addAll(loaded);"] : []),
        "    activeShape = loaded.isEmpty() ? null : loaded.get(loaded.size() - 1);",
        '    System.out.println(loaded.size() + " shape(s) loaded from " + DATA_FILE + ".");', "    redraw();", "}");
      if (maxDims < 1) throw new Error("no dimensions");
    }
    const redraw = ["canvasPane.getChildren().clear();"];
    if (m.storage === "list") redraw.push("for (" + n.base + " shape : shapes) {", "    shape." + n.draw + "(canvasPane);", "}");
    else redraw.push("if (activeShape != null) {", "    activeShape." + n.draw + "(canvasPane);",
      ...(rotating ? ["    // The Shape class has no angle, so the drawn node is turned here.", "    for (javafx.scene.Node node : canvasPane.getChildren()) {", "        node.setRotate(angle);", "    }"] : []), "}");
    if (m.infoLabel) {
      redraw.push("if (activeShape == null) {", "    infoLabel.setText(" + Java.str(m.infoEmpty) + ");", "} else {",
        "    infoLabel.setText(" + OopGen.infoExpression(m) + ");", "}");
    }
    if (messageLabel) redraw.push('messageLabel.setText("");');
    methods.push("", "/** Draw the canvas again after every change. */", "private void redraw() {", Java.indent(redraw.join("\n"), 4), "}");

    const code = "/** Main window: " + m.buttons.length + " buttons and a drawing canvas. */\npublic class " + m.appClass + " extends Application {\n" +
      Java.indent(fields.join("\n"), 4) + "\n\n    @Override\n    public void start(Stage stage) {\n" +
      Java.indent(start.join("\n"), 8) + "\n    }\n\n" + Java.indent(methods.join("\n"), 4) +
      "\n\n    public static void main(String[] args) {\n        launch(args);\n    }\n}\n";
    return javaUnit(m.appClass, "class", imports, code, { main: true });
  },

  // ---------- Browser simulation of the generated program ----------
  initialState(model) {
    const m = OopGen.normalize(model);
    const state = { shapes: [], active: -1, nextColor: m.baseColor, console: [], label: m.infoEmpty, message: "", saved: null, anim: false,
      inputs: m.inputs.map(i => i.def), status: m.statusInitial, angle: 0 };
    if (m.startShape) {
      state.shapes = [OopGen.simShape(m, m.startShape, m.baseColor)];
      if (m.colorForNext) state.shapes[0].color = m.baseColor;   // addShape() uses nextColor, which starts as the base colour
      state.active = 0;
      state.label = OopGen.infoText(m, state.shapes[0], state);
    }
    return state;
  },

  simShape(m, def, color) {
    return { kind: def.kind, className: def.className, x: m.startX, y: m.startY, v: { ...def.dims }, color: def.color || color };
  },

  // Same checks as canMove() in the generated program.
  simCanMove(m, shape, dx, dy) {
    const b = m.bounds, x = shape.x + dx, y = shape.y + dy;
    return !((b.minX !== null && x < b.minX) || (b.maxX !== null && x > b.maxX) || (b.minY !== null && y < b.minY) || (b.maxY !== null && y > b.maxY));
  },

  simSay(m, s, text) {
    if (m.statusLabel) s.status = text; else s.console.push(text);
  },

  infoText(m, shape, state, format) {
    if (!shape) return m.infoEmpty;
    const kind = ShapeKinds[shape.kind];
    const java = v => ShapeLib.javaNumber(v, "double");
    return (format ?? m.infoFormat ?? "").replace(/\{area\}/g, kind.areaValue(shape.v).toFixed(2))
      .replace(/\{perimeter\}/g, kind.perimeterValue(shape.v).toFixed(2)).replace(/\{class\}/g, shape.className)
      .replace(/\{x\}/g, java(shape.x)).replace(/\{y\}/g, java(shape.y)).replace(/\{angle\}/g, java(state?.angle ?? 0));
  },

  apply(model, state, buttonIndex) {
    const m = OopGen.normalize(model);
    const s = JSON.parse(JSON.stringify(state));
    const b = m.buttons[buttonIndex];
    const log = text => s.console.push(text);
    const active = () => s.shapes[s.active];
    const fmt = v => ShapeLib.javaNumber(v, m.numType);
    const display = shape => {
      const kind = ShapeKinds[shape.kind];
      if (!m.printConsole || !m.names.displayShape) return;
      if (m.names.area) log("Area of " + kind.word + " = " + fmt(kind.areaValue(shape.v)));
      if (m.names.perimeter) log("Perimeter of " + kind.word + " = " + fmt(kind.perimeterValue(shape.v)));
    };
    const requireActive = () => {
      if (!active()) { OopGen.simSay(m, s, m.noShapeMessage); return false; }
      return true;
    };
    let ok = true;
    const moveBy = (dx, dy) => {
      if (!requireActive()) { ok = false; return; }
      if (m.hasBounds && !OopGen.simCanMove(m, active(), dx, dy)) { OopGen.simSay(m, s, m.boundMessage); ok = false; return; }
      active().x += dx; active().y += dy;
    };
    s.message = "";
    let skipLabel = false;
    switch (b.action) {
      case "add": {
        const def = m.shapes.find(x => x.className === b.arg);
        const v = { ...def.dims };
        if (m.sizeInput) {
          const dims = ShapeKinds[def.kind].dims;
          const values = dims.map((d, j) => NumericRules.parse(s.inputs[j])).map(x => m.numType === "float" ? Math.fround(x) : x);
          if (values.some((x, j) => !(x > 0) || !NumericRules.accepts(x, m.inputs[j].range))) { s.message = m.invalidMessage; skipLabel = true; break; }
          dims.forEach((d, j) => { v[d.name] = values[j]; });
        }
        const shape = { kind: def.kind, className: def.className, x: m.startX, y: m.startY, v,
          color: m.colorForNext ? s.nextColor : def.color || m.baseColor };
        display(shape);
        if (m.storage === "list") s.shapes.push(shape); else s.shapes = [shape];
        s.active = s.shapes.length - 1;
        s.angle = 0;
        break;
      }
      case "clear": s.shapes = []; s.active = -1; s.angle = 0; break;
      case "color":
        if (m.colorForNext) s.nextColor = b.arg;
        if (requireActive()) active().color = b.arg; else ok = false;
        break;
      case "up": moveBy(0, -m.step); break;
      case "down": moveBy(0, m.step); break;
      case "left": moveBy(-m.step, 0); break;
      case "right": moveBy(m.step, 0); break;
      case "rotate": if (requireActive()) s.angle = (s.angle + m.rotateStep) % 360; else ok = false; break;
      case "enlarge": case "shrink":
        if (requireActive()) {
          const shape = active();
          if (m.inputs.some(f => f.range.min !== null || f.range.max !== null)) {
            const entries = ShapeKinds[shape.kind].dims.map((d, i) => {
              const next = shape.v[d.name] + (b.action === "enlarge" ? m.resizeStep : -m.resizeStep);
              return [d.name, m.numType === "float" ? Math.fround(next) : next, m.inputs[i].range];
            });
            if (entries.every(([, v, range]) => v > 0 && NumericRules.accepts(v, range) &&
              (b.action !== "shrink" || m.shrinkMin === null || v >= m.shrinkMin))) {
              entries.forEach(([key, value]) => { shape.v[key] = value; });
            }
            display(shape);
            break;
          }
          for (const key of Object.keys(shape.v)) {
            if (b.action === "enlarge") shape.v[key] += m.resizeStep;
            else if (m.shrinkMin === null ? shape.v[key] > m.resizeStep : shape.v[key] - m.resizeStep >= m.shrinkMin) shape.v[key] -= m.resizeStep;
          }
          display(shape);
        }
        break;
      case "info":
        if (requireActive()) {
          const shape = active(), kind = ShapeKinds[shape.kind];
          display(shape);
          log("Area = " + fmt(kind.areaValue(shape.v)) + ", Perimeter = " + fmt(kind.perimeterValue(shape.v)));
        }
        break;
      case "removeLast":
        if (s.shapes.length) { s.shapes.pop(); s.active = s.shapes.length - 1; } else ok = false;
        break;
      case "next":
        if (s.shapes.length) s.active = (s.active + 1) % s.shapes.length; else ok = false;
        break;
      case "save": {
        const saved = m.storage === "list" ? s.shapes : s.shapes.slice(s.active, s.active + 1);
        s.saved = JSON.parse(JSON.stringify(saved));
        log(m.storage === "list" ? saved.length + " shape(s) saved to " + m.dataFile + "." : "Shape saved to " + m.dataFile + ".");
        break;
      }
      case "animStart": s.anim = true; break;
      case "animStop": s.anim = false; break;
      case "animReset": {
        const def = m.shapes.find(x => x.className === b.arg);
        const shape = OopGen.simShape(m, def, m.baseColor);
        if (m.colorForNext) shape.color = s.nextColor;   // addShape() gives every new shape nextColor
        display(shape);
        if (m.storage === "list") s.shapes.push(shape); else s.shapes = [shape];
        s.active = s.shapes.length - 1;
        s.angle = 0;
        s.anim = false;
        break;
      }
      case "load":
        if (!s.saved) { log("Unable to load " + m.dataFile + "."); break; }
        s.shapes = m.storage === "list" ? JSON.parse(JSON.stringify(s.saved)) : JSON.parse(JSON.stringify(s.saved.slice(-1)));
        s.active = s.shapes.length - 1;
        log(s.saved.length + " shape(s) loaded from " + m.dataFile + ".");
        break;
    }
    if (!skipLabel) s.label = OopGen.infoText(m, active(), s);
    else s.label = m.infoLabel ? m.invalidMessage : s.label;
    if (ok && b.done && !skipLabel) {
      const plain = ["clear", "save", "load", "animStart", "animStop", "removeLast", "next"].includes(b.action);
      if (plain || active()) OopGen.simSay(m, s, plain ? b.done : OopGen.infoText(m, active(), s, b.done));
    }
    if (s.console.length > 200) s.console = s.console.slice(-200);
    return s;
  },

  // Keyboard, mouse and timer events of the simulation: {type: "key", code} | {type: "mouse", x, y} | {type: "tick"}.
  event(model, state, ev) {
    const m = OopGen.normalize(model);
    const s = JSON.parse(JSON.stringify(state));
    const shape = s.shapes[s.active];
    if (!shape) return s;
    const move = (dir, step = m.step) => {
      const d = { up: [0, -step], down: [0, step], left: [-step, 0], right: [step, 0] }[dir];
      if (m.hasBounds && !OopGen.simCanMove(m, shape, d[0], d[1])) { OopGen.simSay(m, s, m.boundMessage); return false; }
      shape.x += d[0]; shape.y += d[1];
      if (m.moveDone) OopGen.simSay(m, s, OopGen.infoText(m, shape, s, m.moveDone));
      return true;
    };
    if (ev.type === "key" && m.keyControl) {
      const dir = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" }[ev.code];
      if (dir && m.moveName[dir]) move(dir, m.keyStep ?? m.step);
    } else if (ev.type === "mouse" && m.mouseControl === "toggle") {
      if (ev.onShape) shape.color = shape.color === m.toggleColor ? m.baseColor : m.toggleColor;
    } else if (ev.type === "mouse" && m.mouseControl !== "no") {
      if (m.hasBounds && !OopGen.simCanMove(m, shape, ev.x - shape.x, ev.y - shape.y)) OopGen.simSay(m, s, m.boundMessage);
      else { shape.x = ev.x; shape.y = ev.y; }
    } else if (ev.type === "tick" && s.anim) {
      if (!move(m.animMove)) s.anim = false;
    }
    s.label = OopGen.infoText(m, shape, s);
    return s;
  },

  // Plain-language checklist of what the finished program should do, for self-testing in BlueJ.
  checklist(model) {
    const m = OopGen.normalize(model);
    const where = { left: "左侧", right: "右侧", top: "顶部", bottom: "底部" };
    const steps = ["运行后：窗口标题含姓名；画布为空" + (m.infoLabel ? "，标签显示「" + m.infoEmpty + "」" : "") + "。"];
    for (const [region] of OOP_REGIONS) {
      const names = m.buttons.filter(b => b.region === region).map(b => b.text);
      if (names.length) steps.push(where[region] + "按钮（按顺序）：" + names.join("、") + "。");
    }
    if (m.sizeInput) steps.push(where[m.inputRegion] + "有输入框（" + m.inputs.map(i => i.label + " " + i.def).join("，") + "）；输入非正数或字母后点 Add 显示「" + m.invalidMessage + "」。");
    for (const b of m.buttons) {
      const at = "点「" + b.text + "」：";
      switch (b.action) {
        case "add": steps.push(at + "出现 " + b.arg + "（" + m.baseColor + "）" + (m.printConsole ? "，Terminal 打印面积和周长" : "") + "。"); break;
        case "clear": steps.push(at + "画布清空；之后点移动或换色不报错。"); break;
        case "color": steps.push(at + "当前图形变成 " + b.arg + "，位置不变。"); break;
        case "up": case "down": case "left": case "right": steps.push(at + "当前图形移动 " + m.step + " 像素。"); break;
        case "enlarge": case "shrink": steps.push(at + "每个尺寸变化 " + m.resizeStep + (m.shrinkMin !== null && b.action === "shrink" ? "，不小于 " + m.shrinkMin : "") + "。"); break;
        case "save": steps.push(at + "项目文件夹里的 " + m.dataFile + " 每个图形一行。"); break;
        case "load": steps.push(at + "画布恢复成文件里的图形（位置和颜色不变）。"); break;
        case "animStart": steps.push(at + "当前图形每 " + m.animInterval + " 毫秒移动一次。"); break;
        case "animStop": steps.push(at + "图形停住；再点开始会继续。"); break;
        case "animReset": steps.push(at + "动画停止，图形回到初始位置。"); break;
        default: steps.push(at + OOP_ACTIONS[b.action] + "。");
      }
    }
    if (m.keyControl) steps.push("按方向键：图形和对应按钮一样移动（先点一下画布让窗口获得键盘焦点）。");
    if (m.mouseControl !== "no") steps.push((m.mouseControl === "drag" ? "在画布上拖动" : "点击画布") + "：图形移到鼠标位置。");
    steps.push("没有图形时点其他按钮：程序不崩溃，Terminal 提示先添加图形。");
    return steps;
  }
};

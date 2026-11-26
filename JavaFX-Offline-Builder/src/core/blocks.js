/*
 * Block workbench engine (ported from builder v1 and extended): components, events and nested
 * action blocks that compile to the start() method of a JavaFX Application.
 */
"use strict";

const BLOCK_EVENT_TYPES = {
  action: { label: "按钮点击 / 输入框回车 Action", method: "setOnAction", kind: "action", eventClass: "ActionEvent" },
  clicked: { label: "鼠标点击 MouseClicked", method: "setOnMouseClicked", kind: "mouse", eventClass: "MouseEvent" },
  moved: { label: "鼠标移动 MouseMoved", method: "setOnMouseMoved", kind: "mouse", eventClass: "MouseEvent" },
  dragged: { label: "按住拖动 MouseDragged", method: "setOnMouseDragged", kind: "mouse", eventClass: "MouseEvent" },
  pressed: { label: "鼠标按下 MousePressed", method: "setOnMousePressed", kind: "mouse", eventClass: "MouseEvent" },
  released: { label: "鼠标松开 MouseReleased", method: "setOnMouseReleased", kind: "mouse", eventClass: "MouseEvent" },
  entered: { label: "鼠标进入 MouseEntered", method: "setOnMouseEntered", kind: "mouse", eventClass: "MouseEvent" },
  exited: { label: "鼠标离开 MouseExited", method: "setOnMouseExited", kind: "mouse", eventClass: "MouseEvent" },
  key: { label: "键盘按下 KeyPressed", method: "setOnKeyPressed", kind: "key", eventClass: "KeyEvent" },
  keyReleased: { label: "键盘松开 KeyReleased", method: "setOnKeyReleased", kind: "key", eventClass: "KeyEvent" },
  close: { label: "点关闭按钮 CloseRequest", method: "setOnCloseRequest", kind: "window", eventClass: "WindowEvent" },
  showing: { label: "窗口即将显示 Showing", method: "setOnShowing", kind: "window", eventClass: "WindowEvent" },
  shown: { label: "窗口已显示 Shown", method: "setOnShown", kind: "window", eventClass: "WindowEvent" },
  hiding: { label: "窗口即将隐藏 Hiding", method: "setOnHiding", kind: "window", eventClass: "WindowEvent" },
  hidden: { label: "窗口已隐藏 Hidden", method: "setOnHidden", kind: "window", eventClass: "WindowEvent" },
  tick: { label: "Timeline 每次触发 KeyFrame", method: "keyFrame", kind: "timer", eventClass: "ActionEvent" }
};

const BLOCK_TYPES = ["Button", "Label", "TextField", "CheckBox", "RadioButton", "Circle", "Rectangle", "Ellipse", "Text", "Pane", "ImageView", "Timeline"];
const BLOCK_CONTROLS = ["Button", "Label", "TextField", "CheckBox", "RadioButton"];
const BLOCK_SHAPES = ["Circle", "Rectangle", "Ellipse", "Text"];
const MOVABLE = { Circle: { x: "CenterX", y: "CenterY" }, Rectangle: { x: "X", y: "Y" }, Ellipse: { x: "CenterX", y: "CenterY" }, Text: { x: "X", y: "Y" } };
// Properties a number block can read: [getter suffix, caption, template name].
const BLOCK_PROPS = {
  Circle: [["CenterX", "圆心 X", "x"], ["CenterY", "圆心 Y", "y"], ["Radius", "半径", "radius"], ["Rotate", "旋转角度", "rotate"]],
  Rectangle: [["X", "X", "x"], ["Y", "Y", "y"], ["Width", "宽", "width"], ["Height", "高", "height"], ["Rotate", "旋转角度", "rotate"]],
  Ellipse: [["CenterX", "圆心 X", "x"], ["CenterY", "圆心 Y", "y"], ["RadiusX", "横半径", "radiusX"], ["RadiusY", "纵半径", "radiusY"], ["Rotate", "旋转角度", "rotate"]],
  Text: [["X", "X", "x"], ["Y", "Y", "y"], ["Rotate", "旋转角度", "rotate"]],
  ImageView: [["Rotate", "旋转角度", "rotate"], ["FitWidth", "显示宽度", "fitWidth"]]
};
const BLOCK_VAR_TYPES = ["int", "double", "boolean", "String"];
const DIGIT_KEY_CODES = Array.from({ length: 10 }, (_, digit) => ["DIGIT" + digit, "NUMPAD" + digit]);
const KEY_CODES = ["LEFT", "RIGHT", "UP", "DOWN", "SPACE", "ENTER", "ESCAPE", "A", "D", "W", "S", "R",
  ...DIGIT_KEY_CODES.map(([main]) => main), ...DIGIT_KEY_CODES.map(([, numpad]) => numpad)];
const BLOCK_COLORS = ["BLUE", "GREEN", "RED", "ORANGE", "PURPLE", "BLACK", "WHITE", "YELLOW", "GRAY", "PINK", "LIGHTGRAY", "DARKGRAY", "BROWN", "CYAN"];

const tf = (label, value, help) => ({ label, value, help });
const ref = (label, kind) => ({ label, kind });
const pick = (label, values, labels) => ({ label, values, labels });
const socket = (label, expr) => ({ label, expr });

const BLOCK_SPECS = {
  bounds: { label: "如果 · 鼠标坐标在范围内", event: "mouse", branches: ["在范围内", "超出范围"],
    fields: { minX: tf("最小 X", "50"), maxX: tf("最大 X", "250"), minY: tf("最小 Y", "50"), maxY: tf("最大 Y", "150") } },
  mouseButton: { label: "如果 · 按的是指定鼠标键", event: "mouse", branches: ["是这个键", "其他键"],
    fields: { button: pick("鼠标键", ["PRIMARY", "SECONDARY", "MIDDLE"]) } },
  key: { label: "如果 · 按下指定键", event: "key", branches: ["按下此键", "其他键"], fields: { code: pick("KeyCode", KEY_CODES) } },
  keyDigit: { label: "读取数字键（0–9）", event: "key", branches: ["读到范围内的数字", "其他键或超出范围"],
    fields: { name: tf("结果名称", "digit", "成功分支内可在「读到的数字」中使用它。"),
      min: tf("最小数字", "0"), max: tf("最大数字", "9") } },
  moveBounds: { label: "如果 · 移动后的位置在范围内", branches: ["可以移动", "会越界"],
    fields: { node: ref("对象", "Movable"), axis: pick("轴", ["X", "Y"]), delta: tf("位移", "10"), min: tf("下限", "20"), max: tf("上限", "280") } },
  moveLimited: { label: "在边界内移动", branches: ["已移动", "会越界"],
    fields: { node: ref("对象", "Movable"), axis: pick("轴", ["X", "Y"]), delta: tf("位移", "10"), min: tf("下限", "20"), max: tf("上限", "350") } },
  logic: { label: "如果 · 条件积木", branches: ["条件成立", "否则"], fields: { test: socket("判断条件", "boolean") } },
  condition: { label: "如果 · Java 条件", advanced: true, branches: ["条件成立", "否则"], fields: { expression: tf("boolean 表达式", "true") } },
  parse: { label: "读取输入框里的有限数字", branches: ["读取成功", "数字无效或超出范围"],
    fields: { input: ref("读取", "TextField"), name: tf("结果名称", "value"),
      min: tf("下限（可空）", ""), max: tf("上限（可空）", ""),
      minOpen: pick("下限端点", ["no", "yes"], ["包含", "不包含"]), maxOpen: pick("上限端点", ["no", "yes"], ["包含", "不包含"]),
      numType: pick("数字类型", ["double", "int"], ["小数 double（Double.parseDouble）", "整数 int（Integer.parseInt）"]) } },
  parsePair: { label: "尝试读取两个 TextField 的坐标", branches: ["两个都有效", "读取失败"],
    fields: { xInput: ref("X 输入框", "TextField"), yInput: ref("Y 输入框", "TextField"), x: tf("X 变量名", "newX"), y: tf("Y 变量名", "newY") } },
  source: { label: "如果 · 事件来自指定控件", event: "action", branches: ["来自此控件", "其他事件源"], fields: { target: ref("事件源", "action") } },
  selected: { label: "如果 · CheckBox / RadioButton 被选中", branches: ["已选中", "未选中"], fields: { target: ref("控件", "Toggle") } },
  follow: { label: "移到鼠标位置", event: "mouse", fields: { node: ref("对象", "Movable") } },
  place: { label: "设置位置（数字）", fields: { node: ref("对象", "Movable"), x: tf("X", "100"), y: tf("Y", "100") } },
  positionExpression: { label: "设置位置（Java 表达式）", advanced: true, fields: { node: ref("对象", "Movable"), x: tf("X 表达式", "newX"), y: tf("Y 表达式", "newY") } },
  positionValue: { label: "用数字积木设置位置", fields: { node: ref("对象", "Movable"), x: socket("X", "number"), y: socket("Y", "number") } },
  step: { label: "相对移动", fields: { node: ref("对象", "Movable"), axis: pick("轴", ["X", "Y"]), delta: tf("位移（负数向左/上）", "10") } },
  radius: { label: "设置圆的半径（Java 表达式）", advanced: true, fields: { node: ref("圆形", "Circle"), value: tf("数字或 Java 表达式", "15") } },
  radiusValue: { label: "用数字积木设置半径", fields: { node: ref("圆形", "Circle"), value: socket("半径", "number") } },
  grow: { label: "圆的半径加减", fields: { node: ref("圆形", "Circle"), delta: tf("变化量（负数缩小）", "2"), min: tf("最小半径", "2") } },
  color: { label: "设置填充颜色", fields: { node: ref("图形/文字", "Shape"), color: pick("Color", BLOCK_COLORS) } },
  visible: { label: "显示或隐藏", fields: { node: ref("对象", "Node"), visible: pick("显示", ["true", "false"]) } },
  rotate: { label: "旋转（累加角度）", fields: { node: ref("对象", "Node"), delta: tf("角度（正数顺时针）", "15") } },
  text: { label: "Label 显示文字", fields: { label: ref("更新", "Label"), text: tf("文字", "Ready") } },
  textNode: { label: "Text 显示文字", fields: { node: ref("Text", "Text"), text: tf("文字", "Hello") } },
  counter: { label: "Label 整数计数加减", fields: { label: ref("更新", "Label"), prefix: tf("前缀（Label 文字中数字前的部分）", ""), amount: tf("变化量", "1") } },
  inputText: { label: "设置 TextField 文字", fields: { input: ref("更新", "TextField"), text: tf("新文字", "30") } },
  clear: { label: "清空 TextField", fields: { input: ref("清空", "TextField") } },
  mouseText: { label: "Label 显示鼠标坐标", event: "mouse", fields: { label: ref("更新", "Label"), text: tf("前缀", "Mouse: ") } },
  keyText: { label: "Label 显示按下的键", event: "key", fields: { label: ref("更新", "Label"), text: tf("前缀", "Key: ") } },
  positionText: { label: "Label 显示对象位置", fields: { label: ref("更新", "Label"), node: ref("读取", "Movable"), text: tf("前缀", "X: "), axis: pick("轴", ["X", "Y"]) } },
  expressionText: { label: "Label 显示文字 + Java 表达式", advanced: true, fields: { label: ref("更新", "Label"), text: tf("前缀", "Value: "), value: tf("Java 表达式", "1 + 1") } },
  valueText: { label: "Label 显示文字 + 数字积木", fields: { label: ref("更新", "Label"), text: tf("前缀", "Value: "), value: socket("数字", "number") } },
  resetNode: { label: "恢复对象初始状态", fields: { node: ref("对象", "Resettable") } },
  resetText: { label: "恢复控件初始文字", fields: { target: ref("恢复", "text") } },
  disable: { label: "启用或停用控件", fields: { target: ref("设置", "action"), disabled: pick("停用", ["true", "false"]) } },
  println: { label: "控制台输出 System.out.println", fields: { text: tf("文字", "Button clicked") } },
  consume: { label: "消耗事件 e.consume()（关窗时阻止关闭）" },
  // ----- v2.2: numbers that are read back, variables, alerts, Timeline, images -----
  radiusLimited: { label: "如果 · 半径改变后仍在范围内（加减或乘）", branches: ["已改变", "会超出范围（不改变）"],
    fields: { node: ref("圆形", "Circle"), op: pick("运算", ["add", "mul"], ["加减", "乘以"]), amount: tf("数值（加减时负数 = 缩小）", "5"),
      min: tf("最小半径", "5"), max: tf("最大半径", "100") } },
  template: { label: "显示组合文字（{名字} 换成内容）", fields: { label: ref("更新", "text"),
    text: tf("文字", "Radius: {c.radius}", "花括号里可写：输入框或 Label 的变量名（取它的文字）、变量名、读到的数字，或 图形名.x / .y / .radius / .width / .height / .rotate") } },
  setNumber: { label: "设置数字变量", fields: { variable: ref("变量", "numVar"), value: socket("值", "number") } },
  changeNumber: { label: "数字变量加减", fields: { variable: ref("变量", "numVar"), amount: tf("变化量（负数 = 减少）", "1") } },
  setFlag: { label: "设置布尔变量", fields: { variable: ref("变量", "boolVar"), value: pick("值", ["true", "false"]) } },
  setTextVar: { label: "文字变量 = 输入框内容", fields: { variable: ref("变量", "textVar"), input: ref("读取", "TextField") } },
  setTextLiteral: { label: "文字变量 = 固定文字", fields: { variable: ref("变量", "textVar"), text: tf("文字", "") } },
  resetVar: { label: "恢复变量初始值", fields: { variable: ref("变量", "var") } },
  rgb: { label: "用数字设置颜色 Color.rgb(r, g, b)", fields: { node: ref("图形/文字", "Shape"), r: socket("红 R（0–255）", "number"),
    g: socket("绿 G（0–255）", "number"), b: socket("蓝 B（0–255）", "number") } },
  style: { label: "设置样式 setStyle（JavaFX CSS）", fields: { node: ref("对象", "Node"), css: tf("CSS", "-fx-text-fill: red; -fx-font-size: 20px;") } },
  alert: { label: "弹出提示框 Alert", fields: { kind: pick("类型", ["INFORMATION", "WARNING", "ERROR"]), text: tf("内容", "Done") } },
  confirm: { label: "如果 · 确认框点了 OK（CONFIRMATION）", branches: ["点了 OK", "点了取消或关掉"], fields: { text: tf("确认框内容", "Are you sure?") } },
  timeline: { label: "控制 Timeline", fields: { timeline: ref("Timeline", "Timeline"), action: pick("动作", ["play", "pause", "stop"], ["play 开始 / 继续", "pause 暂停", "stop 停止"]) } },
  imageError: { label: "如果 · 图片加载失败", branches: ["加载失败", "加载成功"], fields: { image: ref("图片", "ImageView") } },
  closeWindow: { label: "关闭窗口 stage.close()" },
  // ----- layout at run time and a second window -----
  addNode: { label: "往区域里添加控件（运行时）", fields: { region: pick("区域", ["center", "top", "bottom", "left", "right"],
      ["中间 center", "顶部 top", "底部 bottom", "左侧 left", "右侧 right"]), nodeType: pick("控件", ["Label", "Button"]),
    text: tf("文字", "{input}", "可用 {名字} 插入输入框文字、变量或数字，同「显示组合文字」。") } },
  clearRegion: { label: "清空区域里的控件（保留前 N 个）", fields: { region: pick("区域", ["center", "top", "bottom", "left", "right"],
      ["中间 center", "顶部 top", "底部 bottom", "左侧 left", "右侧 right"]), keep: tf("保留前几个（0 = 全部清空）", "0") } },
  openWindow: { label: "打开新窗口（第二个 Stage）", fields: { title: tf("窗口标题", "Second Window"), text: tf("显示的文字", "Hello"),
    width: tf("宽", "250"), height: tf("高", "120") } },
  java: { label: "插入自定义 Java 语句", advanced: true, fields: { code: { label: "Java 语句", value: "", multiline: true } } }
};
const FLOW_BLOCKS = ["bounds", "mouseButton", "key", "moveBounds", "moveLimited", "logic", "condition", "source", "selected", "radiusLimited", "confirm", "imageError"];

const Blocks = {
  eventTypes: BLOCK_EVENT_TYPES,
  specs: BLOCK_SPECS,
  types: BLOCK_TYPES,
  colors: BLOCK_COLORS,
  regions: [["bottom", "底部 bottom"], ["top", "顶部 top"], ["left", "左侧 left"], ["right", "右侧 right"], ["center", "中间 center"]],
  // Root of the window. BorderPane (default) has five regions; the others hold every node directly.
  rootTypes: [["BorderPane", "BorderPane（五个区域，默认）"], ["Pane", "Pane（自由坐标：图形、控件直接放进 root）"],
    ["StackPane", "StackPane（全部居中叠放）"], ["VBox", "VBox（从上到下一列）"], ["HBox", "HBox（从左到右一行）"], ["FlowPane", "FlowPane（自动换行）"]],
  rootTypeOf(project) {
    const type = project.config?.rootType;
    return Blocks.rootTypes.some(([t]) => t === type) ? type : "BorderPane";
  },
  // Pane root: where each control, Pane and ImageView is placed with relocate(x, y). Empty fields are filled in
  // automatically: controls in a row along the top, Panes below them.
  placements(project) {
    const out = new Map();
    const placed = project.components.filter(c => Blocks.controls.includes(c.type) || c.type === "ImageView" || c.type === "Pane");
    const hasControls = placed.some(c => c.type !== "Pane");
    let k = 0;
    for (const c of placed) {
      const auto = c.type === "Pane" ? [0, hasControls ? 50 : 0] : [10 + 110 * k++, 10];
      const x = String(c.lx ?? "").trim(), y = String(c.ly ?? "").trim();
      out.set(c.id, [x === "" ? auto[0] : Number(x), y === "" ? auto[1] : Number(y)]);
    }
    return out;
  },
  // BorderPane layout: each region holds one container with the controls placed there.
  layoutBoxes: ["HBox", "VBox", "FlowPane", "StackPane"],
  layoutAlign: ["", "TOP_LEFT", "TOP_CENTER", "TOP_RIGHT", "CENTER_LEFT", "CENTER", "CENTER_RIGHT", "BOTTOM_LEFT", "BOTTOM_CENTER", "BOTTOM_RIGHT"],
  layoutOf(project, region) {
    const base = { box: region === "left" || region === "right" || region === "center" ? "VBox" : "HBox", spacing: "8", padding: "10", align: "", style: "" };
    return { ...base, ...(project.config?.layout?.[region] || {}) };
  },
  // Regions that blocks change at run time (add / clear controls): they always get a container variable.
  dynamicRegions(project) {
    const found = new Set();
    const walk = items => (items || []).forEach(item => {
      if ((item.type === "addNode" || item.type === "clearRegion") && item.values?.region) found.add(item.values.region);
      walk(item.yes); walk(item.no);
    });
    for (const event of project.events || []) walk(event.actions);
    return found;
  },

  controls: BLOCK_CONTROLS,

  readKeyDigit(code) {
    return DIGIT_KEY_CODES.findIndex(keys => keys.includes(code));
  },

  keyDigitRange(values) {
    const limits = { min: 0, max: 9, integer: true };
    const min = Java.number(values.min, "最小数字", limits), max = Java.number(values.max, "最大数字", limits);
    if (min > max) throw new Error("最小数字不能大于最大数字。");
    return { min, max };
  },

  // Controls that fire an ActionEvent (Lecture 8 table): Button, TextField (Enter), CheckBox, RadioButton.
  isAction(node) { return ["Button", "TextField", "CheckBox", "RadioButton"].includes(node.type); },

  options(project, kind) {
    const vars = project.variables || [];
    switch (kind) {
      case "var": return vars;
      case "numVar": return vars.filter(v => v.type === "int" || v.type === "double");
      case "boolVar": return vars.filter(v => v.type === "boolean");
      case "textVar": return vars.filter(v => v.type === "String");
    }
    return project.components.filter(node => {
      switch (kind) {
        case "action": return Blocks.isAction(node);
        case "text": return ["TextField", "Label", "Text"].includes(node.type);
        case "Movable": return Boolean(MOVABLE[node.type]);
        case "Shape": return BLOCK_SHAPES.includes(node.type);
        case "Resettable": return BLOCK_SHAPES.includes(node.type) || node.type === "ImageView";
        case "Prop": return Boolean(BLOCK_PROPS[node.type]);
        case "Node": return node.type !== "Timeline";
        case "Toggle": return node.type === "CheckBox" || node.type === "RadioButton";
        default: return node.type === kind;
      }
    });
  },

  caption(node) { return node.type + " · " + (String(node.name).trim() || "未命名"); },
  props: BLOCK_PROPS,
  varTypes: BLOCK_VAR_TYPES,

  eventTargets(project, type) {
    const kind = BLOCK_EVENT_TYPES[type].kind;
    const list = nodes => nodes.map(node => [node.id, Blocks.caption(node)]);
    if (kind === "window") return [["stage", "Stage · " + project.config.stage]];
    // The generated window always has "BorderPane root"; mouse and key events can be registered on it too.
    const root = ["root", Blocks.rootTypeOf(project) + " · root（整个窗口内容）"];
    if (kind === "key") return [["scene", "Scene · " + project.config.scene], ...list(Blocks.options(project, "Node")), root];
    if (kind === "action") return list(Blocks.options(project, "action"));
    if (kind === "timer") return list(Blocks.options(project, "Timeline"));
    return [...list(Blocks.options(project, "Node")), root];
  },

  // Every control that an event is registered on (a shared handler is registered on several).
  targetsOf(event) {
    return event.style === "shared" ? [event.target, event.partner, ...(event.more || [])] : [event.target];
  },

  defaultTarget(project, type, excluded = []) {
    const candidates = Blocks.eventTargets(project, type).map(([id]) => id).filter(id => !excluded.includes(id));
    return candidates.find(id => !project.events.some(e => e.type === type && Blocks.targetsOf(e).includes(id))) || candidates[0] || "";
  },

  addComponent(project, type, overrides = {}) {
    const id = "node" + project.nextId++;
    const prefix = { TextField: "input", Rectangle: "rect", Text: "text", ImageView: "imageView" }[type] || type.toLowerCase();
    let n = 1;
    while (project.components.some(node => node.name === prefix + n)) n++;
    const node = { id, type, name: prefix + n, selected: "no", arc: "0",
      text: type === "Button" ? "Button " + n : type === "Text" ? "Hello" : type === "CheckBox" || type === "RadioButton" ? "Option " + n : "",
      x: "100", y: "100", radius: "20", width: type === "Pane" ? "400" : "80", height: type === "Pane" ? "260" : "50",
      radiusX: "60", radiusY: "30", file: "images/logo.png", fitWidth: "200", interval: "1000",
      color: "BLUE", pane: "", region: type === "ImageView" ? "left" : "bottom", ...overrides };
    if (!node.pane && BLOCK_SHAPES.includes(type)) node.pane = Blocks.options(project, "Pane")[0]?.id || "";
    // The first Pane takes the shapes that were added before it and are not in any Pane yet,
    // so they are drawn on it instead of in a separate Group beside it.
    if (type === "Pane" && !Blocks.options(project, "Pane").length) {
      for (const other of project.components) if (BLOCK_SHAPES.includes(other.type) && !other.pane) other.pane = id;
    }
    project.components.push(node);
    return node;
  },

  addVariable(project, type, overrides = {}) {
    project.variables = project.variables || [];
    const prefix = { int: "count", double: "amount", boolean: "flag", String: "text" }[type] || "value";
    let n = 1;
    while (project.variables.some(v => v.name === prefix + n) || project.components.some(c => c.name === prefix + n)) n++;
    const variable = { id: "var" + project.nextId++, type, name: prefix + n, value: type === "boolean" ? "false" : type === "String" ? "" : "0",
      ...Object.fromEntries(Object.entries(overrides).filter(([, v]) => v !== undefined)) };
    project.variables.push(variable);
    return variable;
  },

  // prefer: ids to use first for object fields (for example the objects the current event already uses).
  createBlock(project, type, values = {}, yes = [], no = [], prefer = []) {
    const fields = BLOCK_SPECS[type].fields || {};
    const defaults = Object.fromEntries(Object.entries(fields).map(([key, field]) => {
      const all = field.kind ? Blocks.options(project, field.kind) : [];
      // A block that shows text should land on a Label or Text first, not on the input box the event just read.
      const choices = field.kind === "text" && all.some(c => c.type !== "TextField") ? all.filter(c => c.type !== "TextField") : all;
      const preferred = prefer.map(id => choices.find(c => c.id === id)).find(Boolean);
      const choice = type === "parsePair" && key === "yInput" ? choices[1] : preferred || choices[0];
      return [key, field.expr ? VisualExpr.make(field.expr) : field.kind ? choice?.id || "" : field.values?.[0] ?? field.value ?? ""];
    }));
    return { type, values: { ...defaults, ...values }, yes, no };
  },

  // Ids of the objects that the blocks of an event refer to, most recent first.
  usedIds(actions) {
    const out = [];
    const walk = items => {
      for (const item of items) {
        for (const value of Object.values(item.values || {})) if (typeof value === "string" && /^(node|var)\d+$/.test(value)) out.push(value);
        walk(item.yes || []); walk(item.no || []);
      }
    };
    walk(actions);
    return [...new Set(out.reverse())];
  },

  // Deep copy of a block or an event, used by the duplicate buttons.
  copy(value) { return JSON.parse(JSON.stringify(value)); },

  event(type, target, actions) { return { type, target, actions, style: "lambda", partner: "" }; },

  presets: [["mouse", "鼠标跟随 + 区域变色 + Reset"], ["keys", "方向键左右移动 + 边界"], ["shift", "方向键：Shift 加速 + 边界"],
    ["keyPractice", "KeyPractice：方向键、R 复位、数字键改半径"],
    ["input", "TextField 输入半径 + 验证"], ["safeInput", "有限半径：Apply 与回车共用处理器"],
    ["text", "四个按钮移动 Text（课件 AnonymousHandlerDemo）"], ["traffic", "交通灯：RadioButton 选颜色 + CheckBox 显示外框"],
    ["counter", "计数器：+1 / -1 / Reset 改 Label 数字"], ["clickColor", "鼠标点击放圆：左键红色、右键蓝色"],
    ["closeGuard", "关窗确认：没勾选 CheckBox 就阻止关闭"],
    ["radiusLimit", "半径上下限：Grow / Shrink / Reset + Label 显示半径"], ["stopwatch", "Timeline 计时器：Start / Pause / Reset"],
    ["lockClose", "关窗锁定：布尔变量 + Unlock 按钮"],
    ["borderLayout", "BorderPane 五个区域：顶部标题、左侧按钮、中间画布、右侧信息、底部状态"],
    ["flowTags", "FlowPane 运行时添加标签 + Clear + 第二个窗口"],
    ["rootEvents", "事件注册到 BorderPane root：窗口任意处点击 + 方向键"],
    ["paneRoot", "Pane 根节点（不用 BorderPane）：自由坐标的圆、按钮和标签"], ["blank", "新建空白"]],

  preset(which) {
    const project = { config: { className: "JavaFXPractice", stage: "stage", scene: "scene", title: "JavaFX Practice - {name}", width: "", height: "" },
      components: [], events: [], variables: [], nextId: 1 };
    if (which === "blank") return project;
    const b = (type, values, yes, no) => Blocks.createBlock(project, type, values, yes, no);
    if (which === "borderLayout") {
      // Lecture 7 ShowBorderPane / ShowHBoxVBox: one container per region, chosen in the layout settings.
      Object.assign(project.config, { className: "BorderLayoutApp", title: "BorderPane Demo - {name}", width: "560", height: "360",
        layout: { top: { box: "HBox", spacing: "8", padding: "10", align: "CENTER", style: "-fx-background-color: gold;" },
          left: { box: "VBox", spacing: "10", padding: "10", align: "", style: "" },
          right: { box: "VBox", spacing: "6", padding: "10", align: "TOP_LEFT", style: "-fx-border-color: lightgray;" },
          bottom: { box: "HBox", spacing: "8", padding: "5", align: "CENTER_LEFT", style: "" } } });
      Blocks.addComponent(project, "Label", { name: "titleLabel", text: "Shape Board", region: "top" });
      const pane = Blocks.addComponent(project, "Pane", { name: "canvas", width: "300", height: "220" });
      const circle = Blocks.addComponent(project, "Circle", { name: "circle", x: "150", y: "110", radius: "40", color: "GREEN", pane: pane.id });
      const buttons = [["redBtn", "Red", "RED"], ["blueBtn", "Blue", "BLUE"], ["greenBtn", "Green", "GREEN"]]
        .map(([name, text, color]) => [Blocks.addComponent(project, "Button", { name, text, region: "left" }), color]);
      const info = Blocks.addComponent(project, "Label", { name: "infoLabel", text: "Radius: 40", region: "right" });
      const status = Blocks.addComponent(project, "Label", { name: "statusLabel", text: "Ready", region: "bottom" });
      for (const [button, color] of buttons) {
        project.events.push(Blocks.event("action", button.id, [b("color", { node: circle.id, color }),
          b("text", { label: status.id, text: "Color: " + color })]));
      }
      project.events.push(Blocks.event("clicked", pane.id, [b("follow", { node: circle.id }),
        b("template", { label: info.id, text: "Centre: ({circle.x}, {circle.y})" })]));
      return project;
    }
    if (which === "paneRoot") {
      // The window's root is a plain Pane: shapes go straight into it, controls are placed with relocate(x, y).
      Object.assign(project.config, { className: "PaneRootApp", title: "Pane Root - {name}", width: "400", height: "300", rootType: "Pane" });
      const circle = Blocks.addComponent(project, "Circle", { name: "circle", x: "200", y: "150", radius: "30", color: "GREEN" });
      const red = Blocks.addComponent(project, "Button", { name: "redBtn", text: "Red", lx: "10", ly: "10" });
      const grow = Blocks.addComponent(project, "Button", { name: "growBtn", text: "Bigger", lx: "70", ly: "10" });
      const label = Blocks.addComponent(project, "Label", { name: "statusLabel", text: "Click anywhere to move the circle", lx: "10", ly: "270" });
      project.events.push(Blocks.event("action", red.id, [b("color", { node: circle.id, color: "RED" })]));
      project.events.push(Blocks.event("action", grow.id, [b("grow", { node: circle.id, delta: "5", min: "2" })]));
      project.events.push(Blocks.event("clicked", "root", [b("follow", { node: circle.id }),
        b("template", { label: label.id, text: "Circle at ({circle.x}, {circle.y}), radius {circle.radius}" })]));
      return project;
    }
    if (which === "rootEvents") {
      // Handlers on the BorderPane root itself: a click anywhere in the window and the arrow keys.
      Object.assign(project.config, { className: "RootEventsApp", title: "Root Events - {name}", width: "400", height: "300" });
      const pane = Blocks.addComponent(project, "Pane", { name: "canvas", width: "400", height: "250" });
      const circle = Blocks.addComponent(project, "Circle", { name: "circle", x: "200", y: "125", radius: "20", color: "BLUE", pane: pane.id });
      const label = Blocks.addComponent(project, "Label", { name: "statusLabel", text: "Click anywhere or use the arrow keys", region: "bottom" });
      project.events.push(Blocks.event("clicked", "root", [
        b("mouseButton", { button: "SECONDARY" }, [b("color", { node: circle.id, color: "RED" })], [b("follow", { node: circle.id })]),
        b("template", { label: label.id, text: "Root clicked at ({circle.x}, {circle.y})" })]));
      const move = (code, axis, delta) => b("key", { code }, [b("step", { node: circle.id, axis, delta }),
        b("template", { label: label.id, text: "Key " + code + ": ({circle.x}, {circle.y})" })]);
      project.events.push(Blocks.event("key", "root", [move("LEFT", "X", "-10"), move("RIGHT", "X", "10"), move("UP", "Y", "-10"), move("DOWN", "Y", "10")]));
      return project;
    }
    if (which === "flowTags") {
      // Round 3 Q19 / Q20: controls added to a FlowPane at run time, and a second Stage.
      Object.assign(project.config, { className: "FlowTagsApp", title: "Tags - {name}", width: "460", height: "260",
        layout: { center: { box: "FlowPane", spacing: "6", padding: "10", align: "", style: "" } } });
      const input = Blocks.addComponent(project, "TextField", { name: "tagInput", text: "", region: "top" });
      const add = Blocks.addComponent(project, "Button", { name: "addBtn", text: "Add Tag", region: "top" });
      const clear = Blocks.addComponent(project, "Button", { name: "clearBtn", text: "Clear", region: "top" });
      const about = Blocks.addComponent(project, "Button", { name: "aboutBtn", text: "About", region: "top" });
      for (const text of ["Java", "JavaFX", "OOP"]) Blocks.addComponent(project, "Label", { name: text.toLowerCase() + "Tag", text, region: "center" });
      const status = Blocks.addComponent(project, "Label", { name: "statusLabel", text: "3 fixed tags", region: "bottom" });
      const addEvent = Blocks.event("action", add.id, [b("logic", { test: { kind: "blank", input: input.id } },
        [b("text", { label: status.id, text: "Type a tag first" })],
        [b("addNode", { region: "center", nodeType: "Label", text: "{tagInput}" }), b("template", { label: status.id, text: "Added: {tagInput}" }),
          b("clear", { input: input.id })])]);
      addEvent.style = "shared"; addEvent.partner = input.id;
      project.events.push(addEvent);
      project.events.push(Blocks.event("action", clear.id, [b("clearRegion", { region: "center", keep: "3" }),
        b("text", { label: status.id, text: "Back to the 3 fixed tags" })]));
      project.events.push(Blocks.event("action", about.id, [b("openWindow", { title: "About", text: "Type a tag and press Enter or Add Tag", width: "300", height: "100" })]));
      return project;
    }
    if (which === "stopwatch") {
      Object.assign(project.config, { className: "StopwatchApp", title: "Stopwatch - {name}" });
      const label = Blocks.addComponent(project, "Label", { name: "timeLabel", text: "Time: 0", region: "top" });
      const timer = Blocks.addComponent(project, "Timeline", { name: "timeline", interval: "1000" });
      const seconds = Blocks.addVariable(project, "int", { name: "seconds", value: "0" });
      const buttons = ["Start", "Pause", "Reset"].map(text => Blocks.addComponent(project, "Button", { name: text.toLowerCase() + "Btn", text }));
      project.events.push(Blocks.event("tick", timer.id, [b("changeNumber", { variable: seconds.id, amount: "1" }),
        b("template", { label: label.id, text: "Time: {seconds}" })]));
      project.events.push(Blocks.event("action", buttons[0].id, [b("timeline", { timeline: timer.id, action: "play" })]));
      project.events.push(Blocks.event("action", buttons[1].id, [b("timeline", { timeline: timer.id, action: "pause" })]));
      project.events.push(Blocks.event("action", buttons[2].id, [b("timeline", { timeline: timer.id, action: "stop" }),
        b("resetVar", { variable: seconds.id }), b("resetText", { target: label.id })]));
      return project;
    }
    if (which === "lockClose") {
      Object.assign(project.config, { className: "WindowLockApp", title: "Window Lock - {name}" });
      const label = Blocks.addComponent(project, "Label", { name: "statusLabel", text: "Window locked", region: "top" });
      const unlock = Blocks.addComponent(project, "Button", { name: "unlockBtn", text: "Unlock" });
      const locked = Blocks.addVariable(project, "boolean", { name: "locked", value: "true" });
      project.events.push(Blocks.event("close", "stage", [b("logic", { test: { kind: "flag", variable: locked.id } },
        [b("consume"), b("text", { label: label.id, text: "Closing is not allowed" })])]));
      project.events.push(Blocks.event("action", unlock.id, [b("setFlag", { variable: locked.id, value: "false" }),
        b("text", { label: label.id, text: "Window unlocked" })]));
      return project;
    }
    const pane = Blocks.addComponent(project, "Pane", { name: "pane", region: "center" });
    if (which === "keyPractice") {
      Object.assign(project.config, { className: "KeyPractice", title: "Key Practice" });
      const c = Blocks.addComponent(project, "Circle", { name: "c", pane: pane.id, x: "200", y: "150", radius: "30" });
      const coordinates = Blocks.addComponent(project, "Text", { name: "coordinates", pane: pane.id, x: "12", y: "20",
        text: "x = 200, y = 150, r = 30", color: "BLACK" });
      const reset = Blocks.addComponent(project, "Button", { name: "resetBtn", text: "Reset" });
      const display = () => b("template", { label: coordinates.id, text: "x = {c.x:d}, y = {c.y:d}, r = {c.radius:d}" });
      const directions = [["LEFT", "X", "-10"], ["RIGHT", "X", "10"], ["UP", "Y", "-10"], ["DOWN", "Y", "10"]];
      project.events.push(Blocks.event("key", "scene", [
        ...directions.map(([code, axis, delta]) => b("key", { code }, [b("step", { node: c.id, axis, delta })])),
        b("key", { code: "R" }, [b("place", { node: c.id, x: c.x, y: c.y })]),
        b("keyDigit", { min: "1" }, [b("radiusValue", { node: c.id, value: { kind: "math", op: "mul",
          left: { kind: "local", name: "digit" }, right: { kind: "number", value: "10" } } })]),
        display()
      ]), Blocks.event("action", reset.id, [b("resetNode", { node: c.id }), display()]));
      return project;
    }
    if (which === "text") {
      const text = Blocks.addComponent(project, "Text", { name: "text", x: "40", y: "40", text: "Programming is fun", color: "BLACK", pane: pane.id });
      const dirs = [["Up", "Y", "-5", "10", "250"], ["Down", "Y", "5", "10", "250"], ["Left", "X", "-5", "0", "280"], ["Right", "X", "5", "0", "280"]];
      for (const [label, axis, delta, min, max] of dirs) {
        const btn = Blocks.addComponent(project, "Button", { name: "bt" + label, text: label });
        project.events.push(Blocks.event("action", btn.id, [
          b("moveBounds", { node: text.id, axis, delta, min, max }, [b("step", { node: text.id, axis, delta })])
        ]));
      }
      project.events[0].style = "anonymous";
      return project;
    }
    if (which === "traffic") {
      Object.assign(project.config, { className: "TrafficLight", title: "Traffic Light - {name}" });
      Object.assign(pane, { name: "board", width: "200", height: "340" });
      const frame = Blocks.addComponent(project, "Rectangle", { name: "frame", x: "50", y: "20", width: "100", height: "300", arc: "20", color: "DARKGRAY", pane: pane.id });
      const lights = [["red", "80", "RED"], ["yellow", "170", "YELLOW"], ["green", "260", "GREEN"]].map(([name, y, color]) =>
        ({ color, node: Blocks.addComponent(project, "Circle", { name: name + "Light", x: "100", y, radius: "30", color: "LIGHTGRAY", pane: pane.id }) }));
      for (const light of lights) {
        const radio = Blocks.addComponent(project, "RadioButton", { name: "rb" + light.color[0] + light.color.slice(1).toLowerCase(),
          text: light.color[0] + light.color.slice(1).toLowerCase() });
        project.events.push(Blocks.event("action", radio.id,
          lights.map(other => b("color", { node: other.node.id, color: other === light ? light.color : "LIGHTGRAY" }))));
      }
      const check = Blocks.addComponent(project, "CheckBox", { name: "chkFrame", text: "Show frame", selected: "yes" });
      project.events.push(Blocks.event("action", check.id, [b("selected", { target: check.id },
        [b("visible", { node: frame.id, visible: "true" })], [b("visible", { node: frame.id, visible: "false" })])]));
      return project;
    }
    if (which === "counter") {
      Object.assign(project.config, { className: "ClickCounter", title: "Click Counter - {name}" });
      project.components.splice(project.components.indexOf(pane), 1);
      const label = Blocks.addComponent(project, "Label", { name: "countLabel", text: "Count: 0", region: "top" });
      for (const [name, text, amount] of [["plusBtn", "+1", "1"], ["minusBtn", "-1", "-1"]]) {
        const btn = Blocks.addComponent(project, "Button", { name, text });
        project.events.push(Blocks.event("action", btn.id, [b("counter", { label: label.id, prefix: "Count: ", amount })]));
      }
      const reset = Blocks.addComponent(project, "Button", { name: "resetBtn", text: "Reset" });
      project.events.push(Blocks.event("action", reset.id, [b("resetText", { target: label.id })]));
      return project;
    }
    if (which === "clickColor") {
      Object.assign(project.config, { className: "ClickCircle", title: "Click Circle - {name}" });
      const circle = Blocks.addComponent(project, "Circle", { name: "c", pane: pane.id, radius: "20", color: "GRAY" });
      const label = Blocks.addComponent(project, "Label", { name: "statusLabel", text: "Click on the pane", region: "bottom" });
      project.events.push(Blocks.event("clicked", pane.id, [
        b("follow", { node: circle.id }),
        b("mouseButton", { button: "PRIMARY" }, [b("color", { node: circle.id, color: "RED" })], [b("color", { node: circle.id, color: "BLUE" })]),
        b("mouseText", { label: label.id, text: "Clicked at " })
      ]));
      const reset = Blocks.addComponent(project, "Button", { name: "resetBtn", text: "Reset" });
      project.events.push(Blocks.event("action", reset.id, [b("resetNode", { node: circle.id }), b("resetText", { target: label.id })]));
      return project;
    }
    if (which === "closeGuard") {
      Object.assign(project.config, { className: "CloseGuard", title: "Close Guard - {name}" });
      project.components.splice(project.components.indexOf(pane), 1);
      const check = Blocks.addComponent(project, "CheckBox", { name: "chkSaved", text: "I have saved my work", region: "top" });
      const label = Blocks.addComponent(project, "Label", { name: "statusLabel", text: "Tick the box before closing", region: "bottom" });
      project.events.push(Blocks.event("close", "stage", [b("selected", { target: check.id },
        [b("println", { text: "Window closed" })],
        [b("consume"), b("text", { label: label.id, text: "Please tick the box first" })])]));
      return project;
    }
    if (which === "radiusLimit") {
      Object.assign(project.config, { className: "RadiusLimitApp", title: "Radius Limit - {name}" });
      const circle = Blocks.addComponent(project, "Circle", { name: "c", pane: pane.id, x: "150", y: "120", radius: "30" });
      const label = Blocks.addComponent(project, "Label", { name: "radiusLabel", text: "Radius: 30", region: "top" });
      const change = (text, amount) => {
        const btn = Blocks.addComponent(project, "Button", { name: text.toLowerCase() + "Btn", text });
        project.events.push(Blocks.event("action", btn.id, [b("radiusLimited", { node: circle.id, op: "add", amount, min: "10", max: "100" },
          [b("template", { label: label.id, text: "Radius: {c.radius}" })], [b("text", { label: label.id, text: "Radius must stay between 10 and 100" })])]));
      };
      change("Grow", "10"); change("Shrink", "-10");
      const reset = Blocks.addComponent(project, "Button", { name: "resetBtn", text: "Reset" });
      project.events.push(Blocks.event("action", reset.id, [b("resetNode", { node: circle.id }), b("resetText", { target: label.id })]));
      return project;
    }
    const radiusDefault = which === "safeInput" ? "25" : which === "input" ? "30" : "";
    const initial = ["keys", "shift"].includes(which) ? "X: 100" : radiusDefault ? "Radius: " + radiusDefault : "Ready";
    const circle = Blocks.addComponent(project, "Circle", { name: "c", pane: pane.id, radius: radiusDefault || "15" });
    const label = Blocks.addComponent(project, "Label", { name: "statusLabel", text: initial });
    const reset = Blocks.addComponent(project, "Button", { name: "resetBtn", text: "Reset" });
    const resetEvent = Blocks.event("action", reset.id, [b("resetNode", { node: circle.id }), b("resetText", { target: label.id })]);
    if (which === "shift") {
      const move = delta => b("moveLimited", { delta, node: circle.id },
        [b("positionText", { node: circle.id, label: label.id })], [b("text", { text: "Boundary reached", label: label.id })]);
      project.events.push(Blocks.event("key", "scene", [b("key", { code: "LEFT" }, [move("-5")]),
        b("key", { code: "RIGHT" }, [b("logic", { test: { kind: "modifier", key: "shift" } }, [move("20")], [move("5")])])]), resetEvent);
    } else if (which === "keys") {
      const step = (code, delta) => b("key", { code }, [
        b("moveBounds", { delta, node: circle.id }, [b("step", { delta, node: circle.id }), b("positionText", { node: circle.id, label: label.id })],
          [b("text", { text: "Boundary reached", label: label.id })])
      ]);
      project.events.push(Blocks.event("key", "scene", [step("LEFT", "-10"), step("RIGHT", "10")]), resetEvent);
    } else if (radiusDefault) {
      const input = Blocks.addComponent(project, "TextField", { name: "inputField", text: radiusDefault });
      const apply = Blocks.addComponent(project, "Button", { name: "applyBtn", text: "Apply" });
      const invalid = () => b("text", { text: "Invalid radius", label: label.id });
      const body = () => b("parse", { input: input.id, min: "0", minOpen: "yes" }, [
        b("radiusValue", { value: {kind: "local", name: "value"}, node: circle.id }),
        b("valueText", { text: "Radius: ", value: {kind: "local", name: "value"}, label: label.id })
      ], [invalid()]);
      resetEvent.actions.push(b("resetText", { target: input.id }));
      const applyEvent = Blocks.event("action", apply.id, [body()]);
      if (which === "safeInput") {
        applyEvent.style = "shared"; applyEvent.partner = input.id;
        project.events.push(applyEvent, resetEvent);
      } else project.events.push(applyEvent, Blocks.event("action", input.id, [body()]), resetEvent);
    } else {
      project.events.push(Blocks.event("moved", pane.id, [
        b("bounds", {}, [b("follow", { node: circle.id }), b("color", { color: "GREEN", node: circle.id }), b("mouseText", { label: label.id, text: "Inside: " })],
          [b("color", { color: "RED", node: circle.id }), b("text", { text: "Outside range", label: label.id })])
      ]), resetEvent);
    }
    return project;
  },

  names(project, full) {
    const config = project.config;
    const names = new Map([
      ["stage", Java.ident(config.stage, "Stage 变量名")], ["scene", Java.ident(config.scene, "Scene 变量名")], ["root", "root"],
      ...project.components.map(node => [node.id, Java.ident(node.name, node.type + " 变量名")]),
      ...(project.variables || []).map(v => [v.id, Java.ident(v.name, "变量名")])
    ]);
    const className = full ? Java.ident(config.className, "类名") : "";
    const reserved = new Set(["root", "drawings", "topBox", "bottomBox", "leftBox", "rightBox", "centerBox", "window", "mouseX", "mouseY", "e", "args", "toggleGroup", "ToggleGroup",
      ...BLOCK_TYPES, "Application", "Scene", "Stage", "Color", "Insets", "BorderPane", "HBox", "VBox", "Group", "KeyCode",
      "MouseButton", "EventHandler", "ActionEvent", "MouseEvent", "KeyEvent", "WindowEvent", "String", "Double", "Integer", "System", "Math",
      "Image", "KeyFrame", "Duration", "Alert", "ButtonType", "Boolean"]);
    const used = new Set(full ? [className] : []);
    if (full && reserved.has(className)) throw new Error("类名 " + className + " 和 JavaFX 类型重名。");
    for (const [id, name] of names) {
      if (id === "root") { used.add(name); continue; }      // the program's own BorderPane
      if (reserved.has(name)) throw new Error("名称 " + name + " 已被生成的程序使用，请换一个。");
      if (used.has(name)) throw new Error("变量名或类名重复：" + name);
      used.add(name);
    }
    return { className, names, used };
  },

  regionVar(region, project) {
    if (!["top", "bottom", "left", "right", "center"].includes(region)) throw new Error("未知的 BorderPane 区域：" + region);
    if (project && Blocks.rootTypeOf(project) !== "BorderPane") return "root";   // no regions: the root itself
    return region + "Box";
  },

  num(raw, label) {
    const value = Java.number(raw, label);
    return Java.lit(value);
  },

  emit(actions, ctx, depth = 0, path = []) {
    const { project, names, kind } = ctx;
    const out = [];
    const pad = "    ".repeat(depth);
    const line = text => out.push(pad + text);
    for (const [index, item] of actions.entries()) {
      const address = [...path, index];
      const branch = (items, side, indent = 1) => out.push(...Blocks.emit(items, ctx, depth + indent, [...address, side]));
      const branchWithNumbers = (variables, type, indent) => {
        ctx.localTypes ||= new Map();
        for (const name of variables) { ctx.used.add(name); ctx.locals.add(name); ctx.localTypes.set(name, type); }
        branch(item.yes, "yes", indent);
        for (const name of variables) { ctx.used.delete(name); ctx.locals.delete(name); ctx.localTypes.delete(name); }
      };
      const trace = ctx.trace ? address.join("/") : null;
      const spec = BLOCK_SPECS[item.type], v = item.values;
      if (!spec) throw new Error("未知积木：" + item.type);
      if (spec.event && kind !== spec.event) throw new Error("「" + spec.label + "」不适用于当前事件。");
      const linked = {};
      for (const [key, field] of Object.entries(spec.fields || {})) {
        if (!field.kind) continue;
        const node = Blocks.options(project, field.kind).find(n => n.id === v[key]);
        if (!node) throw new Error("请给「" + spec.label + "」选择" + field.label + "。");
        linked[key] = node;
      }
      const n = key => names.get(linked[key].id);
      if (["follow", "place", "positionExpression", "positionValue", "step", "moveLimited"].includes(item.type) && linked.node && Blocks.isBound(project, linked.node)) {
        throw new Error(names.get(linked.node.id) + " 的圆心已绑定到 Pane 中心，不能再用「" + spec.label + "」移动它。");
      }
      const pos = (key, axis) => MOVABLE[linked[key].type][axis.toLowerCase()];
      const local = raw => {
        const name = Java.ident(raw, "数字变量名");
        if (ctx.used.has(name)) throw new Error("数字变量名重复：" + name);
        return name;
      };
      const projected = (key, axis, raw) => {
        const delta = Java.number(raw, "位移");
        return n(key) + ".get" + pos(key, axis) + "()" + (delta < 0 ? " - " : " + ") + Java.lit(Math.abs(delta));
      };
      const expr = (key, type) => VisualExpr.compile(v[key], type, ctx).java;
      if (trace !== null) line("// @fxb:begin:" + trace);
      if (FLOW_BLOCKS.includes(item.type)) {
        let test, applied = null;
        switch (item.type) {
          case "radiusLimited": {
            const min = Blocks.num(v.min, "最小半径"), max = Blocks.num(v.max, "最大半径");
            if (Number(min) > Number(max)) throw new Error("最小半径不能大于最大半径。");
            const amount = Java.number(v.amount, "数值");
            const next = n("node") + ".getRadius()" + (v.op === "mul" ? " * " + Java.lit(amount) : (amount < 0 ? " - " : " + ") + Java.lit(Math.abs(amount)));
            test = next + " >= " + min + " && " + next + " <= " + max;
            applied = n("node") + ".setRadius(" + next + ");";
            break;
          }
          case "confirm": {
            ctx.imports.add("javafx.scene.control.Alert"); ctx.imports.add("javafx.scene.control.ButtonType");
            let name = "confirm", k = 1;
            while (ctx.used.has(name)) name = "confirm" + ++k;
            ctx.used.add(name);
            line("Alert " + name + " = new Alert(Alert.AlertType.CONFIRMATION, " + Java.str(v.text) + ");");
            test = name + ".showAndWait().orElse(ButtonType.CANCEL) == ButtonType.OK";
            break;
          }
          case "imageError": test = n("image") + ".getImage().isError()"; break;
          case "bounds": {
            const [minX, maxX, minY, maxY] = ["minX", "maxX", "minY", "maxY"].map(k => Blocks.num(v[k], k));
            if (Number(minX) > Number(maxX) || Number(minY) > Number(maxY)) throw new Error("坐标下限不能高于上限。");
            test = "mouseX >= " + minX + " && mouseX <= " + maxX + " && mouseY >= " + minY + " && mouseY <= " + maxY;
            break;
          }
          case "mouseButton": ctx.imports.add("javafx.scene.input.MouseButton"); test = "e.getButton() == MouseButton." + v.button; break;
          case "key": ctx.imports.add("javafx.scene.input.KeyCode"); test = "e.getCode() == KeyCode." + v.code; break;
          case "logic": test = expr("test", "boolean"); break;
          case "condition":
            if (!String(v.expression).trim() || /[\r\n]/.test(v.expression)) throw new Error("条件需要一行 Java 表达式。");
            test = String(v.expression).trim(); break;
          case "source": test = "e.getSource() == " + n("target"); break;
          case "selected": test = n("target") + ".isSelected()"; break;
          case "moveBounds": case "moveLimited": {
            const min = Blocks.num(v.min, "下限"), max = Blocks.num(v.max, "上限");
            if (Number(min) > Number(max)) throw new Error("下限不能高于上限。");
            const next = projected("node", v.axis, v.delta);
            test = next + " >= " + min + " && " + next + " <= " + max;
            break;
          }
        }
        line("if (" + test + ") {");
        if (item.type === "moveLimited") line("    " + n("node") + ".set" + pos("node", v.axis) + "(" + projected("node", v.axis, v.delta) + ");");
        if (applied) line("    " + applied);
        branch(item.yes, "yes");
        if (item.no.length) { line("} else {"); branch(item.no, "no"); }
        line("}");
      } else if (item.type === "keyDigit") {
        const name = local(v.name);
        const { min, max } = Blocks.keyDigitRange(v);
        let keyValue = "pressedDigit";
        while (ctx.used.has(keyValue) || keyValue === name) keyValue += "_";
        ctx.used.add(keyValue);
        line("{");
        line("    int " + keyValue + " = switch (e.getCode()) {");
        DIGIT_KEY_CODES.forEach((codes, digit) => line("        case " + codes.join(", ") + " -> " + digit + ";"));
        line("        default -> -1;");
        line("    };");
        line("    if (" + keyValue + " >= " + min + " && " + keyValue + " <= " + max + ") {");
        line("        int " + name + " = " + keyValue + ";");
        branchWithNumbers([name], "int", 2);
        if (item.no.length) {
          line("    } else {");
          branch(item.no, "no", 2);
        }
        line("    }");
        line("}");
        ctx.used.delete(keyValue);
      } else if (item.type === "parse" || item.type === "parsePair") {
        const pair = item.type === "parsePair";
        const entries = pair ? [[local(v.x), n("xInput")], [local(v.y), n("yInput")]] : [[local(v.name), n("input")]];
        if (pair && (entries[0][0] === entries[1][0] || entries[0][1] === entries[1][1])) throw new Error("X、Y 需要两个不同的输入框和变量名。");
        line("try {");
        const integer = !pair && v.numType === "int";
        const range = NumericRules.range(pair ? {} : v, "输入数字", integer);
        for (const [name, source] of entries) {
          line("    " + (integer ? "int " : "double ") + name + " = " + (integer ? "Integer.parseInt(" : "Double.parseDouble(") + source + ".getText().trim());");
          const invalid = NumericRules.invalid(name, range, integer);
          if (invalid) line("    if (" + invalid + ") throw new NumberFormatException();");
        }
        branchWithNumbers(entries.map(([name]) => name), integer ? "int" : "double");
        line("} catch (NumberFormatException ex) {");
        branch(item.no, "no");
        line("}");
      } else {
        const setText = (key, expr) => line(n(key) + ".setText(" + expr + ");");
        switch (item.type) {
          case "follow": line(n("node") + ".set" + pos("node", "x") + "(mouseX);"); line(n("node") + ".set" + pos("node", "y") + "(mouseY);"); break;
          case "place":
            line(n("node") + ".set" + pos("node", "x") + "(" + Blocks.num(v.x, "X") + ");");
            line(n("node") + ".set" + pos("node", "y") + "(" + Blocks.num(v.y, "Y") + ");"); break;
          case "positionExpression":
            for (const axis of ["x", "y"]) {
              if (!String(v[axis]).trim()) throw new Error("位置表达式不能为空。");
              line(n("node") + ".set" + pos("node", axis) + "(" + String(v[axis]).trim() + ");");
            }
            break;
          case "positionValue":
            for (const axis of ["x", "y"]) line(n("node") + ".set" + pos("node", axis) + "(" + expr(axis, "number") + ");");
            break;
          case "step": line(n("node") + ".set" + pos("node", v.axis) + "(" + projected("node", v.axis, v.delta) + ");"); break;
          case "radius":
            if (!String(v.value).trim()) throw new Error("半径不能为空。");
            line(n("node") + ".setRadius(" + String(v.value).trim() + ");"); break;
          case "radiusValue": line(n("node") + ".setRadius(" + expr("value", "number") + ");"); break;
          case "grow": {
            const delta = Java.number(v.delta, "变化量"), min = Blocks.num(v.min, "最小半径");
            const next = n("node") + ".getRadius()" + (delta < 0 ? " - " : " + ") + Java.lit(Math.abs(delta));
            line("if (" + next + " >= " + min + ") {"); line("    " + n("node") + ".setRadius(" + next + ");"); line("}"); break;
          }
          case "color": ctx.imports.add("javafx.scene.paint.Color"); line(n("node") + ".setFill(Color." + v.color + ");"); break;
          case "visible": line(n("node") + ".setVisible(" + v.visible + ");"); break;
          case "rotate": line(n("node") + ".setRotate(" + n("node") + ".getRotate() + " + Blocks.num(v.delta, "角度") + ");"); break;
          case "text": setText("label", Java.str(v.text)); break;
          case "textNode": setText("node", Java.str(v.text)); break;
          case "inputText": setText("input", Java.str(v.text)); break;
          case "clear": line(n("input") + ".clear();"); break;
          case "expressionText":
            if (!String(v.value).trim()) throw new Error("显示表达式不能为空。");
            setText("label", Java.str(v.text) + " + (" + String(v.value).trim() + ")"); break;
          case "valueText": setText("label", Java.str(v.text) + " + (" + expr("value", "number") + ")"); break;
          case "positionText": setText("label", Java.str(v.text) + " + " + n("node") + ".get" + pos("node", v.axis) + "()"); break;
          case "mouseText": setText("label", Java.str(v.text + "(") + ' + mouseX + ", " + mouseY + ")"'); break;
          case "keyText": setText("label", Java.str(v.text) + " + e.getText()"); break;
          case "counter": {
            if (!/^-?\d{1,9}$/.test(String(v.amount).trim())) throw new Error("计数变化量需为整数。");
            const amount = Number(v.amount);
            const raw = n("label") + ".getText()" + (v.prefix ? ".substring(" + Java.str(v.prefix) + ".length())" : "");
            setText("label", Java.str(v.prefix) + " + (Integer.parseInt(" + raw + ")" + (amount < 0 ? " - " : " + ") + Math.abs(amount) + ")");
            break;
          }
          case "resetNode": Blocks.resetLines(linked.node, n("node"), ctx).forEach(line); break;
          case "resetText": setText("target", Java.str(linked.target.text)); break;
          case "disable": line(n("target") + ".setDisable(" + v.disabled + ");"); break;
          case "println": line("System.out.println(" + Java.str(v.text) + ");"); break;
          case "consume": line("e.consume();"); break;
          case "template": setText("label", Blocks.templateExpr(v.text, ctx)); break;
          case "setNumber": {
            const target = linked.variable;
            const value = expr("value", "number");
            line(n("variable") + " = " + (target.type === "int" ? "(int) (" + value + ")" : value) + ";");
            break;
          }
          case "changeNumber": {
            const amount = Java.number(v.amount, "变化量", { integer: linked.variable.type === "int" });
            line(n("variable") + (amount < 0 ? " -= " : " += ") + Java.lit(Math.abs(amount)) + ";");
            break;
          }
          case "setFlag": line(n("variable") + " = " + (v.value === "true" ? "true" : "false") + ";"); break;
          case "setTextVar": line(n("variable") + " = " + n("input") + ".getText().trim();"); break;
          case "setTextLiteral": line(n("variable") + " = " + Java.str(v.text) + ";"); break;
          case "resetVar": line(n("variable") + " = " + Blocks.varInitial(linked.variable) + ";"); break;
          case "rgb": {
            ctx.imports.add("javafx.scene.paint.Color");
            // Whole numbers and int values need no cast; anything else is a double and is cast to int.
            const channel = k => {
              const tree = v[k], java = expr(k, "number");
              if (tree?.kind === "number") {
                const value = Number(tree.value);
                if (!(value >= 0 && value <= 255)) throw new Error("Color.rgb 的每个值必须在 0–255 之间。");
                if (Number.isInteger(value)) return String(value);
              }
              if (tree?.kind === "local" && ctx.localTypes?.get(tree.name) === "int") return java;
              return "(int) (" + java + ")";
            };
            line(n("node") + ".setFill(Color.rgb(" + ["r", "g", "b"].map(channel).join(", ") + "));");
            break;
          }
          case "style": line(n("node") + ".setStyle(" + Java.str(v.css) + ");"); break;
          case "alert": ctx.imports.add("javafx.scene.control.Alert");
            line("new Alert(Alert.AlertType." + (["INFORMATION", "WARNING", "ERROR"].includes(v.kind) ? v.kind : "INFORMATION") + ", " + Java.str(v.text) + ").showAndWait();"); break;
          case "timeline": line(n("timeline") + "." + (["play", "pause", "stop"].includes(v.action) ? v.action : "play") + "();"); break;
          case "closeWindow": line(names.get("stage") + ".close();"); break;
          case "addNode": {
            const type = v.nodeType === "Button" ? "Button" : "Label";
            ctx.imports.add("javafx.scene.control." + type);
            line(Blocks.regionVar(v.region, ctx.project) + ".getChildren().add(new " + type + "(" + Blocks.templateExpr(v.text, ctx) + "));");
            break;
          }
          case "clearRegion": {
            const box = Blocks.regionVar(v.region, ctx.project);
            const keep = Java.lit(Java.number(v.keep, "保留个数", { min: 0, max: 1000, integer: true }), "int");
            if (keep === "0") line(box + ".getChildren().clear();");
            else line("if (" + box + ".getChildren().size() > " + keep + ") " + box + ".getChildren().remove(" + keep + ", " + box + ".getChildren().size());");
            break;
          }
          case "openWindow": {
            ["javafx.scene.control.Label", "javafx.scene.layout.StackPane"].forEach(i => ctx.imports.add(i));
            let w = "window", k = 2;
            while (ctx.used.has(w)) w = "window" + k++;
            ctx.used.add(w);
            line("Stage " + w + " = new Stage();   // a second window");
            line(w + ".setTitle(" + Java.str(v.title) + ");");
            line(w + ".setScene(new Scene(new StackPane(new Label(" + Blocks.templateExpr(v.text, ctx) + ")), " +
              Blocks.num(v.width, "新窗口宽") + ", " + Blocks.num(v.height, "新窗口高") + "));");
            line(w + ".show();");
            break;
          }
          case "java": if (String(v.code).trim()) String(v.code).trimEnd().split(/\r?\n/).forEach(line); break;
        }
      }
      if (trace !== null) line("// @fxb:end:" + trace);
    }
    return out;
  },

  // "Position: ({c.x}, {c.y})" -> Java string expression. {name} = a TextField / Label text, a variable or a number that was read;
  // {name.prop} = a property of a shape; {...:.2f} formats a number.
  templateExpr(text, ctx) {
    const src = String(text ?? "");
    const byName = new Map(ctx.project.components.map(node => [ctx.names.get(node.id), node]));
    const vars = new Map((ctx.project.variables || []).map(v => [ctx.names.get(v.id), v]));
    const parts = [];
    const re = /\{([A-Za-z_]\w*)(?:\.([A-Za-z]\w*))?(?::(\.\d+f|d))?\}/g;
    let last = 0, match;
    while ((match = re.exec(src))) {
      const [, name, prop, fmt] = match;
      let expr = null, type = "String";
      if (prop) {
        const node = byName.get(name);
        const entry = node && (BLOCK_PROPS[node.type] || []).find(p => p[2] === prop);
        if (!entry) throw new Error("组合文字里的 {" + name + "." + prop + "} 不能用：" + (node ? node.type + " 没有 ." + prop + "，可用 " +
          (BLOCK_PROPS[node.type] || []).map(p => "." + p[2]).join(" ") : "没有叫 " + name + " 的图形") + "。");
        expr = name + ".get" + entry[0] + "()"; type = "double";
      } else if (ctx.locals.has(name)) { expr = name; type = ctx.localTypes?.get(name) || "double"; }
      else if (vars.has(name)) { expr = name; type = vars.get(name).type; }
      else if (byName.has(name) && ["TextField", "Label", "Text"].includes(byName.get(name).type)) {
        expr = name + ".getText()" + (byName.get(name).type === "TextField" ? ".trim()" : "");
      }
      if (!expr) throw new Error("组合文字里的 {" + name + "} 不能用：不是输入框 / Label / Text、变量或读到的数字的名字（区分大小写）。");
      if (fmt && type !== "int" && type !== "double") {
        throw new Error("组合文字里的 {" + name + ":" + fmt + "} 不能用：格式只适用于数字（" + name + " 是 " + type + "）。");
      }
      if (match.index > last) parts.push(Java.str(src.slice(last, match.index)));
      // %d needs an int and %.2f a double, otherwise String.format throws at run time.
      const arg = !fmt ? expr : fmt === "d" ? (type === "int" ? expr : "(int) (" + expr + ")") : (type === "int" ? "(double) " + expr : expr);
      parts.push(fmt ? "String.format(" + Java.str("%" + fmt) + ", " + arg + ")" : expr);
      last = re.lastIndex;
    }
    if (last < src.length) parts.push(Java.str(src.slice(last)));
    if (!parts.length) return '""';
    if (!parts[0].startsWith('"') && !parts[0].startsWith("String.format")) parts.unshift('""');
    return parts.join(" + ");
  },

  // A circle or ellipse whose centre is bound to the centre of its Pane.
  isBound(project, node) {
    return (node.type === "Circle" || node.type === "Ellipse") && node.bind === "yes" &&
      project.components.some(p => p.id === node.pane && p.type === "Pane");
  },

  varInitial(variable) {
    switch (variable.type) {
      case "int": return Java.lit(Java.number(variable.value || "0", "变量 " + variable.name + " 的初始值", { integer: true, min: -2147483648, max: 2147483647 }), "int");
      case "double": return Java.dbl(Java.number(variable.value || "0", "变量 " + variable.name + " 的初始值"));
      case "boolean": return variable.value === "true" ? "true" : "false";
      default: return Java.str(variable.value ?? "");
    }
  },

  resetLines(node, name, ctx) {
    const lines = [];
    if (node.type === "ImageView") return [name + ".setRotate(0);"];
    const p = MOVABLE[node.type];
    // A bound centre cannot be set; it already follows the Pane.
    if (!Blocks.isBound(ctx.project, node)) lines.push(name + ".set" + p.x + "(" + Blocks.num(node.x, "初始 X") + ");", name + ".set" + p.y + "(" + Blocks.num(node.y, "初始 Y") + ");");
    if (node.type === "Circle") lines.push(name + ".setRadius(" + Blocks.num(node.radius, "初始半径") + ");");
    if (node.type === "Rectangle") lines.push(name + ".setWidth(" + Blocks.num(node.width, "宽") + ");", name + ".setHeight(" + Blocks.num(node.height, "高") + ");");
    if (node.type === "Ellipse") lines.push(name + ".setRadiusX(" + Blocks.num(node.radiusX, "横半径") + ");", name + ".setRadiusY(" + Blocks.num(node.radiusY, "纵半径") + ");");
    if (node.type === "Text") lines.push(name + ".setText(" + Java.str(node.text) + ");");
    ctx.imports.add("javafx.scene.paint.Color");
    lines.push(name + ".setFill(Color." + node.color + ");");
    lines.push(name + ".setRotate(0);");
    return lines;
  },

  // full = true: complete program files; false: handler code to paste into start().
  generate(project, full, profile = {}) {
    const { className, names, used } = Blocks.names(project, full);
    const imports = new Set(["javafx.application.Application", "javafx.scene.Scene", "javafx.stage.Stage"]);
    const registrations = new Set(), focus = new Set(), handlers = [], members = [];
    const reservedTypes = new Set([...BLOCK_TYPES, "Application", "Scene", "Stage", "Color", "EventHandler", "ActionEvent", "MouseEvent", "KeyEvent",
      "WindowEvent", "String", "Math", "System", "Image", "KeyFrame", "Duration", "Alert", "ButtonType", "Insets", "BorderPane", "HBox", "VBox", "Group",
      "Integer", "Double", "Boolean", "KeyCode", "MouseButton", "ToggleGroup", "NumberFormatException", "Override", "Object"]);
    project.events.forEach((event, index) => {
      const spec = BLOCK_EVENT_TYPES[event.type];
      if (!spec) throw new Error("未知事件类型。");
      const allowed = new Map(Blocks.eventTargets(project, event.type));
      const style = event.style || "lambda";
      const targets = Blocks.targetsOf({ ...event, style });
      if (new Set(targets).size !== targets.length) throw new Error("共用 Handler 的控件不能重复。");
      for (const id of targets) {
        if (!allowed.has(id)) throw new Error("请选择「" + spec.label + "」的注册对象。");
        const key = id + "." + spec.method;
        if (registrations.has(key)) throw new Error(names.get(id) + "." + spec.method + "() 已注册过。同一对象同一事件只能注册一次，请把动作放进同一个事件。");
        registrations.add(key);
        if (spec.kind === "key" && id !== "scene") focus.add(id);
      }
      const ctx = { project, names, kind: spec.kind, used: new Set(used), locals: new Set(), imports, trace: full };
      const body = Blocks.emit(event.actions, ctx, 0, [index]);
      if (spec.kind === "mouse" && /\bmouse[XY]\b/.test(body.join("\n"))) body.unshift("double mouseX = e.getX();", "double mouseY = e.getY();");
      if (!body.length) body.push("// TODO: add blocks to this event");
      const pkg = { ActionEvent: "javafx.event.ActionEvent", MouseEvent: "javafx.scene.input.MouseEvent", KeyEvent: "javafx.scene.input.KeyEvent", WindowEvent: "javafx.stage.WindowEvent" };
      // A Timeline event is a KeyFrame handler: timeline.getKeyFrames().add(new KeyFrame(Duration.millis(ms), handler)).
      const timer = spec.kind === "timer";
      const register = (target, handler) => {
        if (!timer) return target + "." + spec.method + "(" + handler + ");";
        imports.add("javafx.animation.KeyFrame"); imports.add("javafx.util.Duration");
        const node = project.components.find(n => n.id === event.target);
        const ms = Java.lit(Java.number(node.interval, "Timeline 间隔（毫秒）", { min: 1, max: 3600000 }));
        return target + ".getKeyFrames().add(new KeyFrame(Duration.millis(" + ms + "), " + handler + "));";
      };
      if (style === "shared") {
        if (spec.kind !== "action") throw new Error("共用 Handler 只适用于按钮和输入框的 Action 事件。");
        imports.add("javafx.event.EventHandler"); imports.add("javafx.event.ActionEvent");
        let variable = "sharedHandler" + (index + 1);
        while (used.has(variable)) variable += "_";
        used.add(variable);
        handlers.push("EventHandler<ActionEvent> " + variable + " = e -> {", ...body.map(l => "    " + l), "};");
        for (const id of targets) handlers.push(names.get(id) + ".setOnAction(" + variable + ");");
      } else if (style === "named") {
        imports.add("javafx.event.EventHandler");
        imports.add(pkg[spec.eventClass]);
        const wanted = String(event.className ?? "").trim();
        let local = wanted ? Java.ident(wanted, "Handler 类名") : "Handler" + (index + 1);
        if (wanted && (local === className || used.has(local) || reservedTypes.has(local))) throw new Error("Handler 类名 " + local + " 已被使用，请换一个。");
        while (local === className || used.has(local)) local += "_";
        used.add(local);
        const handle = ["@Override", "public void handle(" + spec.eventClass + " e) {", ...body.map(l => "    " + l), "}"];
        if (event.inject === "yes") {
          // A class of its own that gets the objects it uses through its constructor (Lecture 8: handler classes).
          const text = body.join("\n");
          const captured = [["stage", "Stage"], ["scene", "Scene"], ["root", Blocks.rootTypeOf(project)], ...project.components.map(node => [node.id, node.type])]
            .map(([id, type]) => [names.get(id), type])
            .concat(Blocks.rootTypeOf(project) === "BorderPane" ? [...Blocks.dynamicRegions(project)].map(r => [Blocks.regionVar(r), Blocks.layoutOf(project, r).box]) : [])
            .filter(([name]) => new RegExp("\\b" + name + "\\b").test(text));
          const fieldsOf = captured.map(([name, type]) => "private " + type + " " + name + ";");
          const params = captured.map(([name, type]) => type + " " + name).join(", ");
          members.push("/** Event handler class: gets the objects it changes through the constructor. */",
            "private class " + local + " implements EventHandler<" + spec.eventClass + "> {",
            ...fieldsOf.map(l => "    " + l), ...(fieldsOf.length ? [""] : []),
            "    public " + local + "(" + params + ") {", ...captured.map(([name]) => "        this." + name + " = " + name + ";"), "    }", "",
            ...handle.map(l => "    " + l), "}", "");
          handlers.push(register(names.get(event.target), "new " + local + "(" + captured.map(([name]) => name).join(", ") + ")"));
        } else {
          handlers.push("class " + local + " implements EventHandler<" + spec.eventClass + "> {", ...handle.map(l => "    " + l), "}",
            register(names.get(event.target), "new " + local + "()"));
        }
      } else if (timer) {
        const handler = style === "anonymous"
          ? ["new EventHandler<ActionEvent>() {", "    @Override", "    public void handle(ActionEvent e) {", ...body.map(l => "        " + l), "    }", "}"]
          : ["e -> {", ...body.map(l => "    " + l), "}"];
        if (style === "anonymous") { imports.add("javafx.event.EventHandler"); imports.add("javafx.event.ActionEvent"); }
        const code = register(names.get(event.target), "@@HANDLER@@").split("@@HANDLER@@");
        handlers.push(code[0] + handler[0], ...handler.slice(1, -1), handler.at(-1) + code[1]);
      } else {
        const h = Java.handler(names.get(event.target), spec.method, body.join("\n"), { style, eventClass: spec.eventClass });
        h.imports.forEach(i => imports.add(i));
        handlers.push(h.code);
      }
      handlers.push("");
    });
    // Variables are fields, so every handler (lambda, inner class) can read and change them between events.
    const fields = (project.variables || []).map(v => "private " + v.type + " " + names.get(v.id) + " = " + Blocks.varInitial(v) + ";");
    if (!full) {
      const head = [...fields, ...(fields.length && members.length ? [""] : []), ...members];
      return (head.length ? ["// ---- Class body: put these lines inside the class, outside start() ----", ...head,
        "// ---- start(): put these lines inside start(), after the controls are created ----"] : []).concat(handlers).join("\n").trimEnd();
    }

    const main = [];
    const regions = { top: [], bottom: [], left: [], right: [], center: [] };
    const panes = [], loose = [];
    for (const node of project.components) {
      const name = names.get(node.id);
      switch (node.type) {
        case "Pane":
          imports.add("javafx.scene.layout.Pane");
          main.push("Pane " + name + " = new Pane();", name + ".setPrefSize(" + Blocks.num(node.width, "Pane 宽") + ", " + Blocks.num(node.height, "Pane 高") + ");",
            name + '.setStyle("-fx-background-color: white; -fx-border-color: lightgray;");');
          panes.push(name);
          break;
        case "Circle":
          imports.add("javafx.scene.shape.Circle"); imports.add("javafx.scene.paint.Color");
          main.push("Circle " + name + " = new Circle(" + Blocks.num(node.x, "X") + ", " + Blocks.num(node.y, "Y") + ", " + Blocks.num(node.radius, "半径") + ", Color." + node.color + ");");
          break;
        case "Rectangle":
          imports.add("javafx.scene.shape.Rectangle"); imports.add("javafx.scene.paint.Color");
          main.push("Rectangle " + name + " = new Rectangle(" + ["x", "y", "width", "height"].map(k => Blocks.num(node[k], k)).join(", ") + ");",
            name + ".setFill(Color." + node.color + ");");
          if (Number(node.arc) > 0) main.push(name + ".setArcWidth(" + Blocks.num(node.arc, "圆角") + ");", name + ".setArcHeight(" + Blocks.num(node.arc, "圆角") + ");");
          break;
        case "Text":
          imports.add("javafx.scene.text.Text"); imports.add("javafx.scene.paint.Color");
          main.push("Text " + name + " = new Text(" + Blocks.num(node.x, "X") + ", " + Blocks.num(node.y, "Y") + ", " + Java.str(node.text) + ");",
            name + ".setFill(Color." + node.color + ");");
          break;
        case "Ellipse":
          imports.add("javafx.scene.shape.Ellipse"); imports.add("javafx.scene.paint.Color");
          main.push("Ellipse " + name + " = new Ellipse(" + [["x", "圆心 X"], ["y", "圆心 Y"], ["radiusX", "横半径"], ["radiusY", "纵半径"]]
            .map(([k, label]) => Blocks.num(node[k], label)).join(", ") + ");", name + ".setFill(Color." + node.color + ");");
          break;
        case "ImageView": {
          imports.add("javafx.scene.image.Image"); imports.add("javafx.scene.image.ImageView");
          const file = String(node.file ?? "").trim();
          if (!file) throw new Error("图片 " + name + " 需要文件路径，例如 images/logo.png。");
          // A plain path is read from the program's working folder (the BlueJ project folder).
          const url = /^[a-z]+:/i.test(file) ? file : "file:" + file;
          main.push("// " + Java.comment(file) + " in the project folder; if it cannot be read, getImage().isError() is true",
            "ImageView " + name + " = new ImageView(new Image(" + Java.str(url) + "));");
          if (String(node.fitWidth ?? "").trim()) main.push(name + ".setFitWidth(" + Blocks.num(node.fitWidth, "显示宽度") + ");", name + ".setPreserveRatio(true);");
          (regions[node.region] || regions.bottom).push(name);
          break;
        }
        case "Timeline":
          imports.add("javafx.animation.Timeline");
          main.push("Timeline " + name + " = new Timeline();   // its KeyFrame is added with the event handlers below",
            name + ".setCycleCount(Timeline.INDEFINITE);");
          break;
        default:
          imports.add("javafx.scene.control." + node.type);
          main.push(node.type + " " + name + " = new " + node.type + "(" + Java.str(node.text) + ");");
          if ((node.type === "CheckBox" || node.type === "RadioButton") && node.selected === "yes") main.push(name + ".setSelected(true);");
          (regions[node.region] || regions.bottom).push(name);
      }
    }
    const radios = project.components.filter(n => n.type === "RadioButton");
    if (radios.length) {
      imports.add("javafx.scene.control.ToggleGroup");
      main.push("// Radio buttons in one group: only one can be selected at a time", "ToggleGroup toggleGroup = new ToggleGroup();",
        ...radios.map(n => names.get(n.id) + ".setToggleGroup(toggleGroup);"));
    }
    for (const node of project.components.filter(n => MOVABLE[n.type])) {
      const pane = project.components.find(p => p.id === node.pane && p.type === "Pane");
      if (pane) main.push(names.get(pane.id) + ".getChildren().add(" + names.get(node.id) + ");");
      else loose.push(names.get(node.id));
      if (Blocks.isBound(project, node)) {
        // Property binding (Lecture 7): the centre follows the Pane when the window is resized.
        main.push(names.get(node.id) + ".centerXProperty().bind(" + names.get(pane.id) + ".widthProperty().divide(2));",
          names.get(node.id) + ".centerYProperty().bind(" + names.get(pane.id) + ".heightProperty().divide(2));");
      }
    }
    const rootType = Blocks.rootTypeOf(project);
    if (rootType !== "BorderPane") {
      // Every Pane, control and ImageView goes straight into the root, in the order they were added.
      // Shapes that are not in a Pane: directly into a Pane root, otherwise kept together in a Group.
      imports.add("javafx.scene.layout." + rootType);
      const L = Blocks.layoutOf(project, "root");
      const items = [];
      let shapesPlaced = false;
      for (const node of project.components) {
        if (node.type === "Pane" || Blocks.controls.includes(node.type) || node.type === "ImageView") items.push(names.get(node.id));
        else if (MOVABLE[node.type] && loose.includes(names.get(node.id)) && !shapesPlaced) {
          shapesPlaced = true;
          if (rootType === "Pane") items.push(...loose);
          else { imports.add("javafx.scene.Group"); items.push("new Group(" + loose.join(", ") + ")"); }
        }
      }
      const gap = Blocks.num(String(L.spacing).trim() === "" ? "0" : L.spacing, "root 间距");
      const args = rootType === "VBox" || rootType === "HBox" ? [gap, ...items] : rootType === "FlowPane" ? [gap, gap, ...items] : items;
      main.push("", "// Layout: everything goes straight into the " + rootType + " root", rootType + " root = new " + rootType + "(" + args.join(", ") + ");");
      if (rootType === "Pane") {
        const places = Blocks.placements(project);
        for (const node of project.components) {
          if (!places.has(node.id)) continue;
          const [x, y] = places.get(node.id);
          main.push(names.get(node.id) + ".relocate(" + Blocks.num(x, Blocks.caption(node) + " X") + ", " + Blocks.num(y, Blocks.caption(node) + " Y") + ");   // x, y in the root");
        }
      }
      if (rootType !== "Pane" && String(L.padding).trim() !== "" && Number(L.padding) !== 0) {
        imports.add("javafx.geometry.Insets");
        main.push("root.setPadding(new Insets(" + Blocks.num(L.padding, "root 内边距") + "));");
      }
      if (rootType !== "Pane" && L.align) {
        if (!Blocks.layoutAlign.includes(L.align)) throw new Error("未知的对齐方式：" + L.align);
        imports.add("javafx.geometry.Pos");
        main.push("root.setAlignment(Pos." + L.align + ");");
      }
      if (String(L.style || "").trim()) main.push("root.setStyle(" + Java.str(String(L.style).trim()) + ");");
    } else {
    imports.add("javafx.scene.layout.BorderPane");
    main.push("", "// Layout: BorderPane with top / left / center / right / bottom", "BorderPane root = new BorderPane();");
    const dynamic = Blocks.dynamicRegions(project);
    const center = [...panes];
    if (loose.length) { imports.add("javafx.scene.Group"); center.push("new Group(" + loose.join(", ") + ")"); }
    // One container per region. Its type, spacing, padding, alignment and style come from config.layout.
    const container = (region, items) => {
      const L = Blocks.layoutOf(project, region), v = Blocks.regionVar(region);
      const box = Blocks.layoutBoxes.includes(L.box) ? L.box : "HBox";
      imports.add("javafx.scene.layout." + box);
      const gap = Blocks.num(L.spacing === "" ? "0" : L.spacing, Java.upperFirst(region) + " 间距");
      const args = box === "StackPane" ? items : box === "FlowPane" ? [gap, gap, ...items] : [gap, ...items];
      const lines = [box + " " + v + " = new " + box + "(" + args.join(", ") + ");"];
      if (String(L.padding).trim() !== "" && Number(L.padding) !== 0) {
        imports.add("javafx.geometry.Insets");
        lines.push(v + ".setPadding(new Insets(" + Blocks.num(L.padding, Java.upperFirst(region) + " 内边距") + "));");
      }
      if (L.align) {
        if (!Blocks.layoutAlign.includes(L.align)) throw new Error("未知的对齐方式：" + L.align);
        imports.add("javafx.geometry.Pos");
        lines.push(v + ".setAlignment(Pos." + L.align + ");");
      }
      if (String(L.style || "").trim()) lines.push(v + ".setStyle(" + Java.str(String(L.style).trim()) + ");");
      lines.push("root.set" + Java.upperFirst(region) + "(" + v + ");");
      return lines;
    };
    const centerItems = [...center, ...regions.center];
    if (regions.center.length || dynamic.has("center") || project.config?.layout?.center) {
      if (centerItems.length || dynamic.has("center")) main.push(...container("center", centerItems));
    } else if (center.length === 1) main.push("root.setCenter(" + center[0] + ");");
    else if (center.length > 1) { imports.add("javafx.scene.layout.HBox"); main.push("root.setCenter(new HBox(8, " + center.join(", ") + "));"); }
    for (const region of ["top", "bottom", "left", "right"]) {
      if (regions[region].length || dynamic.has(region)) main.push(...container(region, regions[region]));
    }
    }
    const scene = names.get("scene"), stage = names.get("stage");
    const w = String(project.config.width ?? "").trim(), h = String(project.config.height ?? "").trim();
    main.push("Scene " + scene + " = " + (w && h ? "new Scene(root, " + Blocks.num(w, "窗口宽") + ", " + Blocks.num(h, "窗口高") + ")" : "new Scene(root)") + ";");
    const hasKey = project.events.some(e => BLOCK_EVENT_TYPES[e.type].kind === "key");
    if (hasKey) {
      for (const id of focus) main.push(names.get(id) + ".setFocusTraversable(true);");
      for (const node of project.components.filter(n => n.type === "Button")) main.push(names.get(node.id) + ".setFocusTraversable(false);   // keep arrow keys for the key handler");
    }
    main.push("", "// Event handlers", ...handlers);
    main.push(stage + ".setTitle(" + Java.str(Java.fillProfile(project.config.title || className, profile)) + ");",
      stage + ".setScene(" + scene + ");", stage + ".show();");
    if (hasKey) main.push(focus.size ? names.get([...focus][0]) + ".requestFocus();" : "root.requestFocus();");
    const head = [...fields, ...(fields.length ? [""] : []), ...members];
    const code = "public class " + className + " extends Application {\n" + (head.length ? Java.indent(head.join("\n").trimEnd(), 4) + "\n\n" : "") +
      "    @Override\n    public void start(Stage " + stage + ") {\n" +
      Java.indent(main.join("\n").replace(/\n{3,}/g, "\n\n"), 8) + "\n    }\n\n    public static void main(String[] args) {\n        launch(args);\n    }\n}\n";
    const unit = javaUnit(className, "class", [...imports], code, { main: true });
    const files = JavaFiles.assemble([unit], className, "single", profile);
    const blockRanges = {}, kept = [];
    let offset = 0;
    for (const line of files[0].code.split("\n")) {
      const marker = /^\s*\/\/ @fxb:(begin|end):([\d/yesno]+)$/.exec(line);
      if (!marker) { kept.push(line); offset += line.length + 1; continue; }
      const key = marker[2];
      if (marker[1] === "begin") blockRanges[key] = [offset, offset];
      else if (blockRanges[key]) blockRanges[key][1] = Math.max(blockRanges[key][0], offset - 1);
    }
    files[0].code = kept.join("\n");
    const warnings = [];
    if (Blocks.rootTypeOf(project) === "BorderPane" && panes.length && loose.length) {
      warnings.push("图形 " + loose.join("、") + " 不在任何 Pane 里，会放进一个 Group 排在 Pane 旁边（HBox）。" +
        "要画在 Pane 上，请在图形卡片的「放在」里选择 " + panes.join(" / ") + "。");
    }
    return { files, main: className, warnings, blockRanges };
  }
};

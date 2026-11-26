// Round 3: 30 mock questions answered only through the builder page (builder v2.2).
// ops: the page operations in order (see run_round3.mjs). accept: FxSmoke runs and checks.
// A check is [text, passed, actual, expected = true]; expected = false marks a requirement the builder cannot meet.
// v21: [result, number of page operations] of the same question with builder v2.1, for the comparison in README.md.
import fs from "node:fs";
import path from "node:path";

export const profile = { name: "Test Student", id: "DEMO-ID", tools: "BlueJ + JavaFX Offline Builder" };

const GREEN = "0x008000ff", BLUE = "0x0000ffff", RED = "0xff0000ff", YELLOW = "0xffff00ff";
const times = (n, step) => Array(n).fill(step);
const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;
const labels = s => s.labels.join(" | ");
const has = (s, text) => s.labels.some(l => l === text);
const circle = s => s.shapes.find(x => x.type === "Circle");
const c = (text, passed, actual, expected = true) => [text, Boolean(passed), actual, expected];
const read = (dir, file) => { try { return fs.readFileSync(path.join(dir, file), "utf8"); } catch { return null; } };
// Record lines look like "001  |  Java Basics  |  Available" or "... |  Not available".
const lent = (text, isbn) => new RegExp("^" + isbn + "\\b.*\\|\\s*(false|Not available)\\s*$", "m").test(text);
const free = (text, isbn) => new RegExp("^" + isbn + "\\b.*\\|\\s*(true|Available)\\s*$", "m").test(text);
const timeOf = s => Number((/Time: (\d+)/.exec(labels(s)) || [])[1]);

// ---------- operation groups ----------
const ACTION = "按钮点击 / 输入框回车 Action";
const blocks = (preset = "新建空白") => [{ nav: "积木工作台" }, { preset }];
const config = (className, title) => [{ config: ["类名", className] }, { config: ["窗口标题（{name} = 姓名）", title] }];
// One add-row step: type + variable name (+ text); then any other field of the new control.
const cnew = (type, name, text, sets = []) => [{ "comp.new": text === undefined ? [type, name] : [type, name, text] },
  ...sets.map(([label, value]) => ({ "comp.set": [type + " · " + name, label, value] }))];
const ev = (type, target, sets = []) => [{ "ev.new": [type, target] }, ...sets.map(([label, value]) => ({ "ev.set": [label, value] }))];
const add = (where, type, sets = []) => [{ "blk.add": [where, type] },
  ...sets.map(([p, label, value, nth]) => ({ "blk.set": [p, label, value, nth ? { nth } : undefined] }))];
const RL = "如果 · 半径改变后仍在范围内（加减或乘）", TPL = "显示组合文字（{名字} 换成内容）", TXT = "Label 显示文字";

export const questions = [
  // ---------------------------------------------------------------------------------------- Q1
  { id: "Q1", title: "Interactive Circle Application（60）", verdict: "full", tool: "Shape 程序（A2 型）", v21: ["partial", 23],
    note: "用 A2 范例改坐标、半径和按钮文字；新的「状态 Label 与位置边界」分组提供状态 Label、No circle available 和 Y 的范围 [30,270]。程序是 Drawable / Shape / JavaFXCircle 加主类，合并成一个 CircleApp.java。",
    ops: [{ nav: "Shape 程序（A2 型）" }, { preset: "A2 原题：圆 + 6 个按钮（左侧面板）" },
      { set: ["主类名（= 文件名）", "CircleApp"] }, { set: ["窗口标题（{name} 会换成你的姓名）", "Circle Controller"] },
      { set: ["输出方式", "全部合并成一个文件"] }, { set: ["面积、周长和尺寸的类型", "double"] }, { set: ["(x, y) 表示", "图形中心"] },
      { set: ["初始 x", "200"] }, { set: ["初始 y", "150"] }, { row: ["图形子类", 1, "半径 radius 默认值", "30"] },
      { row: ["按钮", 2, "按钮文字（照题目写）", "Clear"] }, { row: ["按钮", 3, "按钮文字（照题目写）", "Red"] }, { row: ["按钮", 4, "按钮文字（照题目写）", "Blue"] },
      { set: ["窗口里显示状态 Label", "是"] }, { set: ["没有图形时点按钮的提示", "No circle available"] },
      { set: ["Y 下限（留空 = 不限）", "30"] }, { set: ["Y 上限（留空 = 不限）", "270"] },
      { set: ["默认按钮面板位置", "底部（横排）"] }, { set: ["按钮宽度（0 = 自动）", "0"] },
      { set: ["画布宽", "500"] }, { set: ["画布高", "300"] }, { set: ["窗口宽（0 = 自动）", "500"] }, { set: ["窗口高（0 = 自动）", "400"] },
      { set: ["添加时在控制台打印面积周长", "否"] }],
    accept: { main: "CircleApp", runs: [{ steps: ["click:Add Circle", "click:Red", "click:Move Up", "click:Clear", "click:Move Down",
      "click:Add Circle", ...times(8, "click:Move Up"), "click:Move Up", "click:Clear", "click:Red", "click:Clear"] }],
    checks: ({ s }) => [
      c("标题 Circle Controller，窗口 500 × 400", s[0].title === "Circle Controller" && s[0].sceneWidth === 500 && s[0].sceneHeight === 400, s[0].title + " " + s[0].sceneWidth + "×" + s[0].sceneHeight),
      c("开始时没有圆", s[0].shapes.length === 0, s[0].shapes.length),
      c("Add：绿色圆，圆心 (200,150)，半径 30", circle(s[1]) && circle(s[1]).cx === 200 && circle(s[1]).cy === 150 && circle(s[1]).r === 30 && circle(s[1]).fill === GREEN, JSON.stringify(s[1].shapes)),
      c("Red：变红", circle(s[2])?.fill === RED, circle(s[2])?.fill),
      c("Move Up：centerY 150 → 135", circle(s[3])?.cy === 135, circle(s[3])?.cy),
      c("Clear：圆被移除", s[4].shapes.length === 0, s[4].shapes.length),
      c("（测试最后一步）没有圆时 Move Down 显示 No circle available、不出错", s[5].shapes.length === 0 && has(s[5], "No circle available"), labels(s[5])),
      c("重复 Add 只保留一个圆", s[6].shapes.length === 1, s[6].shapes.length),
      c("Move Up 到 centerY = 30 仍可移动", circle(s[14])?.cy === 30, circle(s[14])?.cy),
      c("再按 Move Up：保持 30 并显示 Boundary reached", circle(s[15])?.cy === 30 && has(s[15], "Boundary reached"), circle(s[15])?.cy + " / " + labels(s[15])),
      c("没有圆时 Red 显示 No circle available；Clear 可重复点", has(s[17], "No circle available") && s[18].shapes.length === 0, labels(s[17]))] } },

  // ---------------------------------------------------------------------------------------- Q2
  { id: "Q2", title: "Safe Radius Controller（40）", verdict: "full", tool: "积木工作台", snippet: true, v21: ["full", 11],
    note: "用积木范例「TextField 输入半径 + 验证」：改输入框变量名、范围 [5,80]，删掉输入框回车事件。题目只要求事件处理部分，可复制 event-handlers.txt；完整程序用于运行验收。",
    ops: [...blocks("TextField 输入半径 + 验证"), ...config("SafeRadiusApp", "Safe Radius Controller"),
      { "comp.set": ["TextField · inputField", "变量名", "radiusInput"] }, { "ev.pick": 2 }, { "ev.del": true }, { "ev.pick": 1 },
      { "blk.set": ["1", "下限（可空）", "5"] }, { "blk.set": ["1", "下限端点", "包含"] }, { "blk.set": ["1", "上限（可空）", "80"] }],
    accept: { main: "SafeRadiusApp", runs: [{ steps: ["type:0:50", "click:Apply", "type:0:-5", "click:Apply", "type:0:abc", "click:Apply",
      "type:0:80", "click:Apply", "type:0:81", "click:Apply", "type:0:5", "click:Apply", "click:Reset"] }],
    checks: ({ s }) => [
      c("初始：半径 30，输入框 30，Label Radius: 30", circle(s[0]).r === 30 && s[0].fields[0] === "30" && has(s[0], "Radius: 30"), labels(s[0])),
      c("50：半径 50，Label 更新", circle(s[2]).r === 50 && has(s[2], "Radius: 50.0"), circle(s[2]).r + " / " + labels(s[2])),
      c("-5：Invalid radius，半径不变", circle(s[4]).r === 50 && has(s[4], "Invalid radius"), circle(s[4]).r + " / " + labels(s[4])),
      c("abc：Invalid radius，半径不变", circle(s[6]).r === 50 && has(s[6], "Invalid radius"), circle(s[6]).r + " / " + labels(s[6])),
      c("边界 80 可以，81 不可以，5 可以", circle(s[8]).r === 80 && circle(s[10]).r === 80 && has(s[10], "Invalid radius") && circle(s[12]).r === 5, [circle(s[8]).r, circle(s[10]).r, circle(s[12]).r].join(",")),
      c("Reset：半径 30、输入框 30、Label Radius: 30", circle(s[13]).r === 30 && s[13].fields[0] === "30" && has(s[13], "Radius: 30"), circle(s[13]).r + " / " + s[13].fields[0] + " / " + labels(s[13]))] } },

  // ---------------------------------------------------------------------------------------- Q3
  { id: "Q3", title: "Responsive Circle Window（60）", verdict: "full", tool: "积木工作台", v21: ["partial", 36],
    note: "积木生成 BorderPane 根容器、中央 Pane canvas 和底部 HBox。圆的「圆心属性绑定」选「是」，生成 centerXProperty().bind(canvas.widthProperty().divide(2))；Grow / Shrink 用「如果 · 半径改变后仍在范围内」。",
    ops: [...blocks(), ...config("ResponsiveCircleApp", "Responsive Circle"),
      ...cnew("Pane", "canvas", undefined, [["宽", "400"], ["高", "300"]]),
      ...cnew("Circle", "c", undefined, [["半径", "30"], ["圆心属性绑定（bind）", "是：圆心永远在所在 Pane 的中心（窗口变大也居中）"]]),
      ...cnew("Button", "growBtn", "Grow"), ...cnew("Button", "shrinkBtn", "Shrink"), ...cnew("Button", "resetBtn", "Reset"),
      ...ev(ACTION, "Button · growBtn"), ...add("", RL, [["1", "数值（加减时负数 = 缩小）", "10"], ["1", "最小半径", "10"], ["1", "最大半径", "1000"]]),
      ...ev(ACTION, "Button · shrinkBtn"), ...add("", RL, [["1", "数值（加减时负数 = 缩小）", "-10"], ["1", "最小半径", "10"], ["1", "最大半径", "1000"]]),
      ...ev(ACTION, "Button · resetBtn"), ...add("", "恢复对象初始状态")],
    accept: { main: "ResponsiveCircleApp", runs: [{ steps: ["resize:700:520", "click:Grow", "click:Grow", "click:Shrink", "click:Shrink", "click:Shrink", "click:Shrink", "click:Reset"] }],
    checks: ({ s, code }) => [
      c("根容器 BorderPane，初始圆心在画布中心，半径 30，蓝色", s[0].root === "BorderPane" && near(circle(s[0]).cx, s[0].canvas[0] / 2) && near(circle(s[0]).cy, s[0].canvas[1] / 2) && circle(s[0]).r === 30 && circle(s[0]).fill === BLUE, JSON.stringify([circle(s[0]), s[0].canvas])),
      c("使用 Property Binding", /c\.centerXProperty\(\)\.bind\(canvas\.widthProperty\(\)\.divide\(2\)\)/.test(code) && /c\.centerYProperty\(\)\.bind\(canvas\.heightProperty\(\)\.divide\(2\)\)/.test(code), ""),
      c("放大窗口后圆仍在 Canvas 中心", near(circle(s[1]).cx, s[1].canvas[0] / 2, 1) && near(circle(s[1]).cy, s[1].canvas[1] / 2, 1), "圆心 (" + circle(s[1]).cx + ", " + circle(s[1]).cy + ")，画布 " + s[1].canvas.join("×")),
      c("Grow 两次：半径 50", circle(s[3]).r === 50, circle(s[3]).r),
      c("Shrink 三次：半径 20；第四次到 10（最低 10）", circle(s[6]).r === 20 && circle(s[7]).r === 10, circle(s[6]).r + " / " + circle(s[7]).r),
      c("Reset：半径 30，仍居中", circle(s[8]).r === 30 && near(circle(s[8]).cx, s[8].canvas[0] / 2, 1), circle(s[8]).r)] } },

  // ---------------------------------------------------------------------------------------- Q4
  { id: "Q4", title: "Image and Style Viewer（40）", verdict: "full", tool: "积木工作台", v21: ["none", 0],
    note: "新的 ImageView 控件（images/logo.png，显示宽度 200，保持比例）、「旋转（累加角度）」「设置样式 setStyle」和「如果 · 图片加载失败」。图片、Label 和两个按钮都放在左侧 VBox。",
    ops: [...blocks(), ...config("ImageViewerApp", "Image Viewer"),
      ...cnew("ImageView", "logo"), ...cnew("Label", "caption", "Logo", [["位置（BorderPane 区域）", "左侧 VBox"]]),
      ...cnew("Button", "rotateBtn", "Rotate", [["位置（BorderPane 区域）", "左侧 VBox"]]), ...cnew("Button", "styleBtn", "Style", [["位置（BorderPane 区域）", "左侧 VBox"]]),
      ...ev(ACTION, "Button · rotateBtn"), ...add("", "旋转（累加角度）", [["1", "对象", "ImageView · logo"], ["1", "角度（正数顺时针）", "90"]]),
      ...ev(ACTION, "Button · styleBtn"), ...add("", "设置样式 setStyle（JavaFX CSS）", [["1", "对象", "Label · caption"]]),
      ...ev("窗口已显示 Shown", "Stage · stage"), ...add("", "如果 · 图片加载失败"), ...add("1.yes", TXT, [["1.yes.1", "更新", "Label · caption"], ["1.yes.1", "文字", "Image unavailable"]])],
    accept: { main: "ImageViewerApp", runs: [
      { files: { "images/logo.png": "fixtures/logo.png" }, steps: ["wait:200", ...times(4, "click:Rotate"), "click:Style"] },
      { fresh: true, steps: ["wait:200"] }],
    checks: ({ s, runs, code }) => {
      const img = i => (s[i].images || [])[0] || {};
      return [
        c("Image + ImageView 读取本地 images/logo.png，宽 200 保持比例", /new ImageView\(new Image\("file:images\/logo\.png"\)\)/.test(code) && img(0).fitWidth === 200 && img(0).ratio === true && img(0).error === false, JSON.stringify(img(0))),
        c("图片、Label 和两个按钮放在 VBox", /VBox leftBox = new VBox\(8, logo, caption, rotateBtn, styleBtn\);/.test(code), ""),
        c("Rotate 一次 90°；四次回到原方向（360°）", img(2).rot === 90 && img(5).rot % 360 === 0, img(2).rot + " / " + img(5).rot),
        c("Style：Label 红色、20px", (s[6].styled || []).some(x => /-fx-text-fill: red/.test(x.style) && /-fx-font-size: 20px/.test(x.style)), JSON.stringify(s[6].styled)),
        c("图片存在时不显示 Image unavailable", !has(s[1], "Image unavailable"), labels(s[1])),
        c("图片加载失败：显示 Image unavailable，程序照常启动", has(runs[1][1], "Image unavailable"), labels(runs[1][1]))];
    } } },

  // ---------------------------------------------------------------------------------------- Q5
  { id: "Q5", title: "Shape Selection Application（60）", verdict: "full", tool: "Shape 程序（A2 型）", v21: ["partial", 34],
    note: "三种图形子类直接命名为 Circle / Rectangle / Ellipse（生成器自动用 javafx.scene.shape 的完整类名避开冲突），每个图形有自己的颜色；新的按钮动作「旋转 Rotate」，Label 格式里的 {angle} 显示角度。",
    ops: [{ nav: "Shape 程序（A2 型）" }, { preset: "变体：三种图形 + ArrayList + 放大缩小 + 面积显示" },
      { set: ["主类名（= 文件名）", "ShapeViewerApp"] }, { set: ["窗口标题（{name} 会换成你的姓名）", "Shape Viewer"] }, { set: ["输出方式", "全部合并成一个文件"] },
      { set: ["保存图形", "只保留当前一个（Add 替换旧图形）"] },
      { row: ["图形子类", 1, "类名", "Circle"] }, { row: ["图形子类", 1, "半径 radius 默认值", "35"] }, { row: ["图形子类", 1, "这个图形的颜色（留空 = 新图形颜色）", "BLUE"] },
      { row: ["图形子类", 2, "类名", "Rectangle"] }, { row: ["图形子类", 2, "宽 width 默认值", "100"] }, { row: ["图形子类", 2, "高 height 默认值", "60"] },
      { row: ["图形子类", 2, "这个图形的颜色（留空 = 新图形颜色）", "RED"] },
      { row: ["图形子类", 3, "图形", "Ellipse 椭圆"] }, { row: ["图形子类", 3, "类名", "Ellipse"] },
      { row: ["图形子类", 3, "横半径 radiusX 默认值", "60"] }, { row: ["图形子类", 3, "纵半径 radiusY 默认值", "30"] },
      { row: ["图形子类", 3, "这个图形的颜色（留空 = 新图形颜色）", "GREEN"] },
      ...times(9, { del: ["按钮", 4] }),
      { row: ["按钮", 1, "按钮文字（照题目写）", "Circle"] }, { row: ["按钮", 1, "添加哪个类", "Circle"] },
      { row: ["按钮", 2, "按钮文字（照题目写）", "Rectangle"] }, { row: ["按钮", 2, "添加哪个类", "Rectangle"] },
      { row: ["按钮", 3, "按钮文字（照题目写）", "Ellipse"] }, { row: ["按钮", 3, "添加哪个类", "Ellipse"] },
      { add: "按钮" }, { row: ["按钮", 5, "按钮文字（照题目写）", "Rotate"] }, { row: ["按钮", 5, "点击后", "旋转 Rotate（每次加「每次旋转」的角度）"] },
      { set: ["Label 格式（{area} {perimeter} {class} 会被替换，保留 2 位小数）", "{class}, angle: {angle}"] }, { set: ["没有图形时显示", "No shape selected"] },
      { set: ["没有图形时点按钮的提示", "No shape selected"] }, { set: ["添加时在控制台打印面积周长", "否"] }],
    accept: { main: "ShapeViewerApp", runs: [{ steps: ["click:Rectangle", "click:Rotate", "click:Rotate", "click:Circle", "click:Rotate", "click:Clear", "click:Ellipse", "click:Clear", "click:Rotate"] }],
    checks: ({ s }) => {
      const shape = i => s[i].shapes[0] || {};
      return [
        c("Rectangle：中央 100 × 60 红色矩形", s[1].shapes.length === 1 && shape(1).type === "Rectangle" && shape(1).w === 100 && shape(1).h === 60 && shape(1).fill === RED, JSON.stringify(s[1].shapes)),
        c("Rotate 两次：90°，Label 显示名称和角度", shape(3).rot === 90 && has(s[3], "Rectangle, angle: 90.0"), (shape(3).rot || 0) + "° / " + labels(s[3])),
        c("Circle 替换矩形：一个半径 35 的蓝色圆，角度归零", s[4].shapes.length === 1 && shape(4).type === "Circle" && shape(4).r === 35 && shape(4).fill === BLUE && !shape(4).rot, JSON.stringify(s[4].shapes)),
        c("Rotate：Circle, angle: 45.0", has(s[5], "Circle, angle: 45.0"), labels(s[5])),
        c("Clear 删除图形，Label 显示 No shape selected", s[6].shapes.length === 0 && has(s[6], "No shape selected"), labels(s[6])),
        c("Ellipse：半径 60 × 30 的绿色椭圆", shape(7).type === "Ellipse" && shape(7).rx === 60 && shape(7).ry === 30 && shape(7).fill === GREEN, JSON.stringify(s[7].shapes)),
        c("没有图形时 Rotate 显示 No shape selected、不出错", has(s[9], "No shape selected") && s[9].shapes.length === 0, labels(s[9]))];
    } } },

  // ---------------------------------------------------------------------------------------- Q6
  { id: "Q6", title: "Named EventHandler Class（40）", verdict: "full", tool: "积木工作台", v21: ["partial", 26],
    note: "事件「写法」选「命名内部类」，类名填 GrowHandler，「用构造器传入对象」选「是」：生成 private class GrowHandler，构造器接收它用到的 Circle 和 Label。上限用「如果 · 半径改变后仍在范围内」。",
    ops: [...blocks(), ...config("GrowApp", "Grow Handler"),
      ...cnew("Pane", "pane"), ...cnew("Circle", "c", undefined, [["半径", "30"]]),
      ...cnew("Label", "label", "Radius: 30", [["位置（BorderPane 区域）", "顶部 HBox"]]), ...cnew("Button", "growBtn", "Grow"),
      ...ev(ACTION, "Button · growBtn", [["写法", "命名内部类"], ["Handler 类名（留空 = 自动编号）", "GrowHandler"], ["用构造器传入对象", "是：独立的内部类，构造器传入用到的对象"]]),
      ...add("", RL, [["1", "数值（加减时负数 = 缩小）", "5"], ["1", "最小半径", "5"], ["1", "最大半径", "60"]]),
      ...add("1.yes", TPL, [["1.yes.1", "文字", "Radius: {c.radius}"]]), ...add("1.no", TXT, [["1.no.1", "文字", "Maximum radius reached"]])],
    accept: { main: "GrowApp", runs: [{ steps: times(8, "click:Grow") }],
    checks: ({ s, code }) => [
      c("GrowHandler 实现 EventHandler<ActionEvent> 并重写 handle(ActionEvent e)", /private class GrowHandler implements EventHandler<ActionEvent>/.test(code) && /@Override\s+public void handle\(ActionEvent e\)/.test(code), ""),
      c("构造器取得 Circle 和 Label，保存为字段", /public GrowHandler\(Circle c, Label label\)/.test(code) && /this\.c = c;/.test(code) && /private Circle c;/.test(code), ""),
      c("主程序创建 Handler 对象并注册", /growBtn\.setOnAction\(new GrowHandler\(c, label\)\);/.test(code), ""),
      c("第一次 Grow：半径 35，Label 显示半径", circle(s[1]).r === 35 && has(s[1], "Radius: 35.0"), circle(s[1]).r + " / " + labels(s[1])),
      c("连续 8 次 Grow：半径保持 60，显示 Maximum radius reached", circle(s[8]).r === 60 && has(s[8], "Maximum radius reached"), circle(s[8]).r + " / " + labels(s[8]))] } },

  // ---------------------------------------------------------------------------------------- Q7
  { id: "Q7", title: "Keyboard-Controlled Player（60）", verdict: "full", tool: "积木工作台", v21: ["partial", 42],
    note: "用积木范例「方向键左右移动 + 边界」：把显示单个坐标的积木换成组合文字 Position: ({c.x}, {c.y})，再用 ⧉ 复制 LEFT 的整块判断，改成 UP / DOWN。",
    ops: [...blocks("方向键左右移动 + 边界"), ...config("KeyboardGame", "Keyboard Game"),
      { "comp.set": ["Pane · pane", "宽", "300"] }, { "comp.set": ["Pane · pane", "高", "200"] },
      { "comp.set": ["Circle · c", "圆心 X", "150"] }, { "comp.set": ["Circle · c", "圆心 Y", "120"] },
      { "comp.set": ["Label · statusLabel", "初始文字", "Position: (150, 120)"] },
      { "ev.pick": 1 },
      { "blk.del": "1.yes.1.yes.2" }, ...add("1.yes.1.yes", TPL, [["1.yes.1.yes.2", "文字", "Position: ({c.x}, {c.y})"]]),
      { "blk.del": "2.yes.1.yes.2" }, ...add("2.yes.1.yes", TPL, [["2.yes.1.yes.2", "文字", "Position: ({c.x}, {c.y})"]]),
      { "blk.copy": "1" }, { "blk.set": ["2", "KeyCode", "UP"] },
      { "blk.set": ["2.yes.1", "轴", "Y"] }, { "blk.set": ["2.yes.1", "位移", "-10"] }, { "blk.set": ["2.yes.1", "下限", "20"] }, { "blk.set": ["2.yes.1", "上限", "180"] },
      { "blk.set": ["2.yes.1.yes.1", "轴", "Y"] }, { "blk.set": ["2.yes.1.yes.1", "位移（负数向左/上）", "-10"] },
      { "blk.copy": "2" }, { "blk.set": ["3", "KeyCode", "DOWN"] }, { "blk.set": ["3.yes.1", "位移", "10"] }, { "blk.set": ["3.yes.1.yes.1", "位移（负数向左/上）", "10"] }],
    accept: { main: "KeyboardGame", runs: [{ steps: [...times(3, "key:RIGHT"), ...times(2, "key:UP"), "key:LEFT", "click:Reset", "key:A", ...times(10, "key:UP"), "key:UP", ...times(13, "key:RIGHT"), "key:RIGHT", ...times(7, "key:DOWN")] }],
    checks: ({ s, code }) => [
      c("使用 scene.setOnKeyPressed()", /scene\.setOnKeyPressed\(/.test(code), ""),
      c("RIGHT ×3：X 150 → 180", circle(s[3]).cx === 180, circle(s[3]).cx),
      c("UP ×2：Y 120 → 100", circle(s[5]).cy === 100, circle(s[5]).cy),
      c("LEFT：X 170，Label 显示 Position: (170.0, 100.0)", circle(s[6]).cx === 170 && has(s[6], "Position: (170.0, 100.0)"), labels(s[6])),
      c("Reset：圆心 (150,120)，Label 恢复", circle(s[7]).cx === 150 && circle(s[7]).cy === 120 && has(s[7], "Position: (150, 120)"), labels(s[7])),
      c("其他按键（A）不改变状态", circle(s[8]).cx === 150 && circle(s[8]).cy === 120 && has(s[8], "Position: (150, 120)"), labels(s[8])),
      c("UP 到 Y = 20 后再按：保持 20，显示 Boundary reached", circle(s[18]).cy === 20 && circle(s[19]).cy === 20 && has(s[19], "Boundary reached"), circle(s[19]).cy + " / " + labels(s[19])),
      c("RIGHT 到 X = 280 后再按：保持 280，显示 Boundary reached", circle(s[32]).cx === 280 && circle(s[33]).cx === 280 && has(s[33], "Boundary reached"), circle(s[33]).cx + " / " + labels(s[33])),
      c("DOWN：Y + 10", circle(s[34]).cy === 30 && circle(s[40]).cy === 90, circle(s[34]).cy + " / " + circle(s[40]).cy)] } },

  // ---------------------------------------------------------------------------------------- Q8
  { id: "Q8", title: "Anonymous Inner Class（40）", verdict: "full", tool: "积木工作台", v21: ["partial", 34],
    note: "两个事件的「写法」都选「匿名内部类」；上限 80 用「如果 · 半径改变后仍在范围内」，Label 用组合文字 Radius: {c.radius}。",
    ops: [...blocks(), ...config("IncreaseApp", "Increase Radius"),
      ...cnew("Pane", "pane"), ...cnew("Circle", "c", undefined, [["半径", "30"]]),
      ...cnew("Button", "increaseBtn", "Increase"), ...cnew("Button", "resetBtn", "Reset"), ...cnew("Label", "radiusLabel", "Radius: 30"),
      ...ev(ACTION, "Button · increaseBtn", [["写法", "匿名内部类"]]),
      ...add("", RL, [["1", "数值（加减时负数 = 缩小）", "10"], ["1", "最小半径", "10"], ["1", "最大半径", "80"]]),
      ...add("1.yes", TPL, [["1.yes.1", "文字", "Radius: {c.radius}"]]), ...add("1.no", TXT, [["1.no.1", "文字", "Maximum radius reached"]]),
      ...ev(ACTION, "Button · resetBtn", [["写法", "匿名内部类"]]), ...add("", "恢复对象初始状态"), ...add("", "恢复控件初始文字")],
    accept: { main: "IncreaseApp", runs: [{ steps: [...times(6, "click:Increase"), "click:Reset"] }],
    checks: ({ s, code }) => [
      c("两个按钮都用 new EventHandler<ActionEvent>() { @Override public void handle(ActionEvent e) }", (code.match(/new EventHandler<ActionEvent>\(\)/g) || []).length === 2 && /@Override\s+public void handle\(ActionEvent e\)/.test(code), ""),
      c("Increase ×5：半径 80，Label 显示半径", circle(s[5]).r === 80 && has(s[5], "Radius: 80.0"), circle(s[5]).r + " / " + labels(s[5])),
      c("第 6 次：半径保持 80，显示 Maximum radius reached", circle(s[6]).r === 80 && has(s[6], "Maximum radius reached"), circle(s[6]).r + " / " + labels(s[6])),
      c("Reset：半径 30，Label Radius: 30", circle(s[7]).r === 30 && has(s[7], "Radius: 30"), circle(s[7]).r + " / " + labels(s[7]))] } },

  // ---------------------------------------------------------------------------------------- Q9
  { id: "Q9", title: "Interactive Mouse Drawing（60）", verdict: "full", tool: "积木工作台", v21: ["partial", 48],
    note: "Canvas 上注册 MousePressed、MouseDragged、MouseReleased；释放时用组合文字显示圆心 ({c.x}, {c.y})，越界拖动后显示的也是圆心而不是鼠标位置。",
    ops: [...blocks(), ...config("MouseDrawingApp", "Mouse Drawing"),
      ...cnew("Pane", "canvas", undefined, [["宽", "320"], ["高", "220"]]), ...cnew("Circle", "c", undefined, [["半径", "15"]]),
      ...cnew("Label", "statusLabel", "Ready", [["位置（BorderPane 区域）", "顶部 HBox"]]), ...cnew("Button", "resetBtn", "Reset"),
      ...ev("鼠标按下 MousePressed", "Pane · canvas"), ...add("", "设置填充颜色", [["1", "Color", "YELLOW"]]), ...add("", TXT, [["2", "文字", "Dragging"]]),
      ...ev("按住拖动 MouseDragged", "Pane · canvas"),
      ...add("", "如果 · 鼠标坐标在范围内", [["1", "最小 X", "15"], ["1", "最大 X", "305"], ["1", "最小 Y", "15"], ["1", "最大 Y", "205"]]),
      ...add("1.yes", "移到鼠标位置"), ...add("1.no", TXT, [["1.no.1", "文字", "Outside canvas"]]),
      ...ev("鼠标松开 MouseReleased", "Pane · canvas"), ...add("", "设置填充颜色", [["1", "Color", "GREEN"]]),
      ...add("", TPL, [["2", "文字", "Position: ({c.x}, {c.y})"]]),
      ...ev(ACTION, "Button · resetBtn"), ...add("", "恢复对象初始状态"), ...add("", "恢复控件初始文字")],
    accept: { main: "MouseDrawingApp", runs: [{ steps: ["hit:PRESSED:100:100", "hit:DRAGGED:200:100", "hit:DRAGGED:320:200", "hit:RELEASED:320:200", "click:Reset"] }],
    checks: ({ s, code }) => [
      c("使用 setOnMousePressed / setOnMouseDragged / setOnMouseReleased", ["setOnMousePressed", "setOnMouseDragged", "setOnMouseReleased"].every(m => code.includes(m)), ""),
      c("Canvas 320 × 220，初始蓝色圆 (100,100) 半径 15", s[0].canvas[0] === 320 && s[0].canvas[1] === 220 && circle(s[0]).cx === 100 && circle(s[0]).r === 15 && circle(s[0]).fill === BLUE, JSON.stringify([s[0].canvas, circle(s[0])])),
      c("Press：变黄，Label Dragging", circle(s[1]).fill === YELLOW && has(s[1], "Dragging"), circle(s[1]).fill + " / " + labels(s[1])),
      c("Drag(200,100)：圆跟随", circle(s[2]).cx === 200 && circle(s[2]).cy === 100, circle(s[2]).cx + "," + circle(s[2]).cy),
      c("Drag(320,200) 越界：不移动，Label Outside canvas", circle(s[3]).cx === 200 && has(s[3], "Outside canvas"), circle(s[3]).cx + " / " + labels(s[3])),
      c("Release：变绿，Label 显示圆心 (200, 100)", circle(s[4]).fill === GREEN && has(s[4], "Position: (200.0, 100.0)"), circle(s[4]).fill + " / " + labels(s[4])),
      c("Reset：圆心 (100,100)、蓝色、Label Ready", circle(s[5]).cx === 100 && circle(s[5]).cy === 100 && circle(s[5]).fill === BLUE && has(s[5], "Ready"), labels(s[5]))] } },

  // ---------------------------------------------------------------------------------------- Q10
  { id: "Q10", title: "Mouse Entered, Exited and Click Counter（40）", verdict: "full", tool: "积木工作台", v21: ["full", 47],
    note: "在 Circle 上注册 MouseEntered、MouseExited、MouseClicked；计数用 int 变量 clicks（类的字段，跨事件保留），Label 用组合文字 Clicks: {clicks}。",
    ops: [...blocks(), ...config("MouseCounterApp", "Mouse Counter"),
      ...cnew("Pane", "pane"), ...cnew("Circle", "c", undefined, [["圆心 X", "150"], ["半径", "40"]]),
      ...cnew("Label", "statusLabel", "Ready", [["位置（BorderPane 区域）", "顶部 HBox"]]), ...cnew("Label", "countLabel", "Clicks: 0", [["位置（BorderPane 区域）", "顶部 HBox"]]),
      ...cnew("Button", "resetBtn", "Reset"), { "var.new": ["int", "clicks", "0"] },
      ...ev("鼠标进入 MouseEntered", "Circle · c"), ...add("", "设置填充颜色", [["1", "Color", "GREEN"]]), ...add("", TXT, [["2", "文字", "Mouse inside"]]),
      ...ev("鼠标离开 MouseExited", "Circle · c"), ...add("", "设置填充颜色", [["1", "Color", "BLUE"]]), ...add("", TXT, [["2", "文字", "Mouse outside"]]),
      ...ev("鼠标点击 MouseClicked", "Circle · c"), ...add("", "数字变量加减"), ...add("", TPL, [["2", "更新", "Label · countLabel"], ["2", "文字", "Clicks: {clicks}"]]),
      ...ev(ACTION, "Button · resetBtn"), ...add("", "恢复变量初始值"), ...add("", "恢复对象初始状态", [["2", "对象", "Circle · c"]]),
      ...add("", "恢复控件初始文字", [["3", "恢复", "Label · statusLabel"]]), ...add("", "恢复控件初始文字", [["4", "恢复", "Label · countLabel"]])],
    accept: { main: "MouseCounterApp", runs: [{ steps: ["hit:ENTERED:150:100", ...times(3, "hit:CLICKED:150:100"), "hit:EXITED:150:100", "click:Reset", "hit:CLICKED:150:100"] }],
    checks: ({ s, code }) => [
      c("计数保存在字段 private int clicks", /private int clicks = 0;/.test(code), ""),
      c("Enter：变绿，Mouse inside", circle(s[1]).fill === GREEN && has(s[1], "Mouse inside"), labels(s[1])),
      c("点击三次：Clicks: 3", has(s[4], "Clicks: 3"), labels(s[4])),
      c("Exit：变蓝，Mouse outside", circle(s[5]).fill === BLUE && has(s[5], "Mouse outside"), labels(s[5])),
      c("Reset：计数归零、蓝色、Ready 与 Clicks: 0", circle(s[6]).fill === BLUE && has(s[6], "Ready") && has(s[6], "Clicks: 0"), labels(s[6])),
      c("Reset 后再点击从 1 开始", has(s[7], "Clicks: 1"), labels(s[7]))] } },

  // ---------------------------------------------------------------------------------------- Q11
  { id: "Q11", title: "Shared EventHandler Calculator（60）", verdict: "full", tool: "积木工作台", v21: ["partial", 67],
    note: "「多个控件共用 Handler」注册给 +5、-5、Double 三个按钮，用「如果 · 事件来自指定控件」判断；三种运算都用「如果 · 半径改变后仍在范围内」（Double 选「乘以」2），超出 [5,100] 时显示 Invalid radius。",
    ops: [...blocks(), ...config("CircleCalculatorApp", "Circle Calculator"),
      ...cnew("Pane", "pane"), ...cnew("Circle", "c", undefined, [["圆心 X", "150"], ["圆心 Y", "120"], ["半径", "30"]]),
      ...cnew("Label", "radiusLabel", "Radius: 30", [["位置（BorderPane 区域）", "顶部 HBox"]]), ...cnew("Label", "opLabel", "Last operation: none", [["位置（BorderPane 区域）", "顶部 HBox"]]),
      ...cnew("Button", "plusBtn", "+5"), ...cnew("Button", "minusBtn", "-5"), ...cnew("Button", "doubleBtn", "Double"), ...cnew("Button", "resetBtn", "Reset"),
      ...ev(ACTION, "Button · plusBtn", [["写法", "多个控件共用 Handler（getSource 区分）"], ["第二个控件", "Button · minusBtn"]]),
      { "ev.click": "＋ 再共用一个控件" }, { "ev.set": ["第 3 个控件", "Button · doubleBtn"] },
      ...[["1", "Button · plusBtn", "5", "+5"], ["1.no.1", "Button · minusBtn", "-5", "-5"]].flatMap(([p, source, amount, name]) => [
        ...add(p === "1" ? "" : "1.no", "如果 · 事件来自指定控件", [[p, "事件源", source]]),
        ...add(p + ".yes", RL, [[p + ".yes.1", "数值（加减时负数 = 缩小）", amount], [p + ".yes.1", "最小半径", "5"], [p + ".yes.1", "最大半径", "100"]]),
        ...add(p + ".yes.1.yes", TPL, [[p + ".yes.1.yes.1", "更新", "Label · radiusLabel"], [p + ".yes.1.yes.1", "文字", "Radius: {c.radius}"]]),
        ...add(p + ".yes.1.yes", TXT, [[p + ".yes.1.yes.2", "更新", "Label · opLabel"], [p + ".yes.1.yes.2", "文字", "Last operation: " + name]]),
        ...add(p + ".yes.1.no", TXT, [[p + ".yes.1.no.1", "更新", "Label · opLabel"], [p + ".yes.1.no.1", "文字", "Invalid radius"]])]),
      ...add("1.no.1.no", RL, [["1.no.1.no.1", "运算", "乘以"], ["1.no.1.no.1", "数值（加减时负数 = 缩小）", "2"], ["1.no.1.no.1", "最小半径", "5"], ["1.no.1.no.1", "最大半径", "100"]]),
      ...add("1.no.1.no.1.yes", TPL, [["1.no.1.no.1.yes.1", "更新", "Label · radiusLabel"], ["1.no.1.no.1.yes.1", "文字", "Radius: {c.radius}"]]),
      ...add("1.no.1.no.1.yes", TXT, [["1.no.1.no.1.yes.2", "更新", "Label · opLabel"], ["1.no.1.no.1.yes.2", "文字", "Last operation: Double"]]),
      ...add("1.no.1.no.1.no", TXT, [["1.no.1.no.1.no.1", "更新", "Label · opLabel"], ["1.no.1.no.1.no.1", "文字", "Invalid radius"]]),
      ...ev(ACTION, "Button · resetBtn"), ...add("", "恢复对象初始状态", [["1", "对象", "Circle · c"]]),
      ...add("", "恢复控件初始文字", [["2", "恢复", "Label · radiusLabel"]]), ...add("", "恢复控件初始文字", [["3", "恢复", "Label · opLabel"]])],
    accept: { main: "CircleCalculatorApp", runs: [{ steps: ["click:+5", "click:Double", "click:-5", "click:Reset", ...times(5, "click:-5"), "click:-5", "click:Reset", "click:Double", "click:Double"] }],
    checks: ({ s, code }) => [
      c("一个共享 EventHandler<ActionEvent>，用 e.getSource() 判断", /EventHandler<ActionEvent> sharedHandler1/.test(code) && /e\.getSource\(\) == plusBtn/.test(code) && /e\.getSource\(\) == minusBtn/.test(code), ""),
      c("共享 Handler 注册给 +5、-5、Double 三个按钮", ["plusBtn", "minusBtn", "doubleBtn"].every(b => code.includes(b + ".setOnAction(sharedHandler1)")), ""),
      c("+5：半径 35，显示半径与最后操作", circle(s[1]).r === 35 && has(s[1], "Radius: 35.0") && has(s[1], "Last operation: +5"), circle(s[1]).r + " / " + labels(s[1])),
      c("Double：半径 70", circle(s[2]).r === 70 && has(s[2], "Last operation: Double"), circle(s[2]).r + " / " + labels(s[2])),
      c("-5：半径 65", circle(s[3]).r === 65, circle(s[3]).r),
      c("Reset：半径 30，两个 Label 恢复", circle(s[4]).r === 30 && has(s[4], "Radius: 30") && has(s[4], "Last operation: none"), circle(s[4]).r + " / " + labels(s[4])),
      c("低于 5：不修改（停在 5），显示 Invalid radius", circle(s[9]).r === 5 && circle(s[10]).r === 5 && has(s[10], "Invalid radius"), circle(s[10]).r + " / " + labels(s[10])),
      c("超过 100（60 × 2）：不修改，显示 Invalid radius", circle(s[12]).r === 60 && circle(s[13]).r === 60 && has(s[13], "Invalid radius"), circle(s[13]).r + " / " + labels(s[13]))] } },

  // ---------------------------------------------------------------------------------------- Q12
  { id: "Q12", title: "Window Close Request（40）", verdict: "full", tool: "积木工作台", v21: ["partial", 20],
    note: "新的积木范例「关窗锁定：布尔变量 + Unlock 按钮」就是这道题：boolean 变量 locked，CloseRequest 里锁定时 e.consume()，Unlock 把 locked 设为 false。",
    ops: [...blocks("关窗锁定：布尔变量 + Unlock 按钮"), ...config("WindowLockApp", "Window Lock")],
    accept: { main: "WindowLockApp", runs: [{ steps: ["closecheck", "click:Unlock", "closecheck"] }],
    checks: ({ s, code }) => [
      c("使用 stage.setOnCloseRequest()，状态保存在 boolean 字段", code.includes("stage.setOnCloseRequest(") && /private boolean locked = true;/.test(code), ""),
      c("锁定时关闭：调用 e.consume()，显示 Closing is not allowed", s[1].close === "consumed" && has(s[1], "Closing is not allowed"), s[1].close + " / " + labels(s[1])),
      c("Unlock：Window unlocked", has(s[2], "Window unlocked"), labels(s[2])),
      c("解锁后再关闭：允许关闭", s[3].close === "allowed", s[3].close)] } },

  // ---------------------------------------------------------------------------------------- Q13
  { id: "Q13", title: "JavaFX Stopwatch（60）", verdict: "full", tool: "积木工作台", v21: ["none", 0],
    note: "新的积木范例「Timeline 计时器：Start / Pause / Reset」：Timeline 控件每 1000 ms 触发 KeyFrame，int 变量 seconds 加 1，Label 显示 Time: {seconds}。play() 对已在运行的 Timeline 不会再启动一次，所以重复点 Start 不会加速。",
    ops: [...blocks("Timeline 计时器：Start / Pause / Reset"), ...config("StopwatchApp", "Stopwatch")],
    accept: { main: "StopwatchApp", runs: [{ steps: ["click:Start", "wait:3250", "click:Pause", "wait:1200", "click:Start", "click:Start", "wait:2100", "click:Reset", "wait:1200"] }],
    checks: ({ s, code }) => [
      c("使用 Timeline 和 KeyFrame，持续运行", /new KeyFrame\(Duration\.millis\(1000\)/.test(code) && /setCycleCount\(Timeline\.INDEFINITE\)/.test(code), ""),
      c("初始 Time: 0", has(s[0], "Time: 0"), labels(s[0])),
      c("Start 约 3 秒：Time: 3", timeOf(s[2]) === 3, labels(s[2])),
      c("Pause 后数值不变", timeOf(s[4]) === timeOf(s[3]), timeOf(s[3]) + " → " + timeOf(s[4])),
      c("再 Start（连点两次）约 2 秒：只加 2，不加速", timeOf(s[7]) === timeOf(s[4]) + 2, timeOf(s[4]) + " → " + timeOf(s[7])),
      c("Reset：停止并恢复 Time: 0", has(s[8], "Time: 0") && has(s[9], "Time: 0"), labels(s[8]) + " / " + labels(s[9]))] } },

  // ---------------------------------------------------------------------------------------- Q14
  { id: "Q14", title: "Automatic Circle Movement（40）", verdict: "full", tool: "积木工作台", v21: ["partial", 11],
    note: "Timeline 控件（200 ms）的 KeyFrame 事件里用「在边界内移动」：X + 5，上限 280；到边界时走「会越界」分支，「控制 Timeline」stop。Stop 按钮 pause，Reset 按钮 stop 后恢复圆的初始位置。",
    ops: [...blocks(), ...config("CircleMoverApp", "Circle Mover"),
      ...cnew("Pane", "pane"), ...cnew("Circle", "c", undefined, [["圆心 X", "50"]]), ...cnew("Timeline", "timeline", undefined, [["间隔（毫秒）", "200"]]),
      ...cnew("Button", "startBtn", "Start"), ...cnew("Button", "stopBtn", "Stop"), ...cnew("Button", "resetBtn", "Reset"),
      ...ev("Timeline 每次触发 KeyFrame", "Timeline · timeline"),
      ...add("", "在边界内移动", [["1", "位移", "5"], ["1", "下限", "0"], ["1", "上限", "280"]]), ...add("1.no", "控制 Timeline", [["1.no.1", "动作", "stop 停止"]]),
      ...ev(ACTION, "Button · startBtn"), ...add("", "控制 Timeline"),
      ...ev(ACTION, "Button · stopBtn"), ...add("", "控制 Timeline", [["1", "动作", "pause 暂停"]]),
      ...ev(ACTION, "Button · resetBtn"), ...add("", "控制 Timeline", [["1", "动作", "stop 停止"]]), ...add("", "恢复对象初始状态", [["2", "对象", "Circle · c"]])],
    accept: { main: "CircleMoverApp", runs: [{ steps: ["click:Start", "wait:2100", "click:Stop", "wait:600", "click:Start", "wait:9500", "click:Start", "wait:1200", "click:Reset", "wait:600"] }],
    checks: ({ s }) => [
      c("初始 centerX = 50", circle(s[0]).cx === 50, circle(s[0]).cx),
      c("Start 约 2 秒：每 200 ms + 5（约 100）", circle(s[2]).cx >= 85 && circle(s[2]).cx <= 115, circle(s[2]).cx),
      c("Stop 暂停，位置不变", circle(s[3]).cx === circle(s[4]).cx, circle(s[3]).cx + " → " + circle(s[4]).cx),
      c("继续后到达 280 自动停止", circle(s[6]).cx === 280, circle(s[6]).cx),
      c("到 280 后再按 Start：X 不超过 280", circle(s[8]).cx === 280, circle(s[8]).cx),
      c("Reset：停止并恢复 X = 50", circle(s[9]).cx === 50 && circle(s[10]).cx === 50, circle(s[9]).cx + " / " + circle(s[10]).cx)] } },

  // ---------------------------------------------------------------------------------------- Q15
  { id: "Q15", title: "Student Registration Form（60）", verdict: "full", tool: "积木工作台", v21: ["partial", 44],
    note: "Register 和 Age 输入框共用一个 Handler（Enter 也能注册）。「如果 · 条件积木」选「输入框是空的」判断 Name；「读取输入框里的有限数字」选「整数 int」（Integer.parseInt + try-catch）检查 [10,100]；成功时组合文字 Registered: {nameInput}, Age: {age}。",
    ops: [...blocks(), ...config("RegistrationApp", "Student Registration"),
      ...cnew("TextField", "nameInput", "", [["位置（BorderPane 区域）", "顶部 HBox"]]), ...cnew("TextField", "ageInput", "", [["位置（BorderPane 区域）", "顶部 HBox"]]),
      ...cnew("Button", "registerBtn", "Register"), ...cnew("Button", "clearBtn", "Clear"), ...cnew("Label", "statusLabel", "Ready"),
      ...ev(ACTION, "Button · registerBtn", [["写法", "多个控件共用 Handler（getSource 区分）"], ["第二个控件", "TextField · ageInput"]]),
      ...add("", "如果 · 条件积木", [["1", "判断条件", "输入框是空的（只有空格也算）"], ["1", "输入框", "TextField · nameInput"]]),
      ...add("1.yes", TXT, [["1.yes.1", "文字", "Invalid name"]]),
      ...add("1.no", "读取输入框里的有限数字", [["1.no.1", "读取", "TextField · ageInput"], ["1.no.1", "结果名称", "age"], ["1.no.1", "下限（可空）", "10"],
        ["1.no.1", "上限（可空）", "100"], ["1.no.1", "数字类型", "整数 int（Integer.parseInt）"]]),
      ...add("1.no.1.yes", TPL, [["1.no.1.yes.1", "文字", "Registered: {nameInput}, Age: {age}"]]), ...add("1.no.1.no", TXT, [["1.no.1.no.1", "文字", "Invalid age"]]),
      ...ev(ACTION, "Button · clearBtn"), ...add("", "清空 TextField", [["1", "清空", "TextField · nameInput"]]),
      ...add("", "清空 TextField", [["2", "清空", "TextField · ageInput"]]), ...add("", "恢复控件初始文字", [["3", "恢复", "Label · statusLabel"]])],
    accept: { main: "RegistrationApp", runs: [{ steps: ["type:0:John", "type:1:20", "click:Register", "type:0: ", "type:1:20", "click:Register",
      "type:0:John", "type:1:abc", "click:Register", "type:1:-5", "click:Register", "type:1:20.5", "click:Register", "type:1:25", "enter:1", "click:Clear"] }],
    checks: ({ s, code }) => [
      c("使用 Integer.parseInt() 和 try-catch", /Integer\.parseInt\(ageInput\.getText\(\)\.trim\(\)\)/.test(code) && /catch \(NumberFormatException ex\)/.test(code), ""),
      c("John / 20：Registered: John, Age: 20", has(s[3], "Registered: John, Age: 20"), labels(s[3])),
      c("空白 / 20：Invalid name", has(s[6], "Invalid name"), labels(s[6])),
      c("John / abc：Invalid age", has(s[9], "Invalid age"), labels(s[9])),
      c("John / -5：Invalid age", has(s[11], "Invalid age"), labels(s[11])),
      c("Age 20.5 不是整数：Invalid age", has(s[13], "Invalid age"), labels(s[13])),
      c("Age 输入框按 Enter 执行注册", has(s[15], "Registered: John, Age: 25"), labels(s[15])),
      c("Clear：两个输入框清空，Label Ready", s[16].fields[0] === "" && s[16].fields[1] === "" && has(s[16], "Ready"), JSON.stringify(s[16].fields) + " / " + labels(s[16]))] } },

  // ---------------------------------------------------------------------------------------- Q16
  { id: "Q16", title: "JavaFX Alert and Confirmation（40）", verdict: "full", tool: "积木工作台", v21: ["none", 0],
    note: "boolean 变量 deleted；Delete 先看 deleted，已删除时「弹出提示框 Alert」（INFORMATION），否则「如果 · 确认框点了 OK」（CONFIRMATION + showAndWait）。",
    ops: [...blocks(), ...config("DeleteConfirmApp", "Delete Confirm"),
      ...cnew("Label", "itemLabel", "Item available", [["位置（BorderPane 区域）", "顶部 HBox"]]), ...cnew("Button", "deleteBtn", "Delete"), ...cnew("Button", "resetBtn", "Reset"),
      { "var.new": ["boolean", "deleted", "false"] },
      ...ev(ACTION, "Button · deleteBtn"),
      ...add("", "如果 · 条件积木", [["1", "判断条件", "布尔变量为 true"], ["1", "变量", "boolean · deleted"]]),
      ...add("1.yes", "弹出提示框 Alert", [["1.yes.1", "内容", "No item to delete"]]),
      ...add("1.no", "如果 · 确认框点了 OK（CONFIRMATION）", [["1.no.1", "确认框内容", "Are you sure you want to delete?"]]),
      ...add("1.no.1.yes", TXT, [["1.no.1.yes.1", "文字", "Item deleted"]]), ...add("1.no.1.yes", "设置布尔变量", [["1.no.1.yes.2", "值", "true"]]),
      ...ev(ACTION, "Button · resetBtn"), ...add("", "恢复变量初始值"), ...add("", "恢复控件初始文字")],
    accept: { main: "DeleteConfirmApp", runs: [{ steps: ["answer:CANCEL", "click:Delete", "answer:OK", "click:Delete", "click:Delete", "click:Reset", "click:Delete"] }],
    checks: ({ s, code }) => [
      c("Alert.AlertType.CONFIRMATION，内容 Are you sure you want to delete?", /new Alert\(Alert\.AlertType\.CONFIRMATION, "Are you sure you want to delete\?"\)/.test(code) && s[2].alerts.includes("Are you sure you want to delete?"), s[2].alerts.join(" | ")),
      c("取消：Label 保持 Item available", has(s[2], "Item available"), labels(s[2])),
      c("确认：Label 改为 Item deleted", has(s[4], "Item deleted"), labels(s[4])),
      c("已删除再 Delete：INFORMATION Alert No item to delete", s[5].alerts.includes("No item to delete") && /new Alert\(Alert\.AlertType\.INFORMATION, "No item to delete"\)/.test(code), s[5].alerts.join(" | ")),
      c("Reset 恢复初始状态，可以再次删除", has(s[6], "Item available") && has(s[7], "Item deleted"), labels(s[6]) + " / " + labels(s[7]))] } },

  // ---------------------------------------------------------------------------------------- Q17
  { id: "Q17", title: "RGB Colour Controller（60）", verdict: "full", tool: "积木工作台", v21: ["none", 0],
    note: "三个「读取输入框里的有限数字」嵌套（整数 int，范围 [0,255]），最里层「用数字设置颜色 Color.rgb(r, g, b)」和组合文字 RGB: ({r}, {g}, {b})；任一层失败显示 Invalid RGB values。",
    ops: [...blocks(), ...config("RgbApp", "RGB Colour Controller"),
      ...cnew("Pane", "pane"), ...cnew("Circle", "c", undefined, [["半径", "40"]]),
      ...cnew("TextField", "redInput", "0", [["位置（BorderPane 区域）", "顶部 HBox"]]), ...cnew("TextField", "greenInput", "0", [["位置（BorderPane 区域）", "顶部 HBox"]]),
      ...cnew("TextField", "blueInput", "255", [["位置（BorderPane 区域）", "顶部 HBox"]]),
      ...cnew("Button", "applyBtn", "Apply"), ...cnew("Button", "resetBtn", "Reset"), ...cnew("Label", "statusLabel", "Ready"),
      ...ev(ACTION, "Button · applyBtn"),
      ...[["", "1", "redInput", "r"], ["1.yes", "1.yes.1", "greenInput", "g"], ["1.yes.1.yes", "1.yes.1.yes.1", "blueInput", "b"]].flatMap(([list, p, input, name]) => [
        ...add(list, "读取输入框里的有限数字", [[p, "读取", "TextField · " + input], [p, "结果名称", name], [p, "下限（可空）", "0"], [p, "上限（可空）", "255"],
          [p, "数字类型", "整数 int（Integer.parseInt）"]]),
        ...add(p + ".no", TXT, [[p + ".no.1", "文字", "Invalid RGB values"]])]),
      ...add("1.yes.1.yes.1.yes", "用数字设置颜色 Color.rgb(r, g, b)", [["1.yes.1.yes.1.yes.1", "读取结果", "g", 2], ["1.yes.1.yes.1.yes.1", "读取结果", "b", 3]]),
      ...add("1.yes.1.yes.1.yes", TPL, [["1.yes.1.yes.1.yes.2", "文字", "RGB: ({r}, {g}, {b})"]]),
      ...ev(ACTION, "Button · resetBtn"), ...add("", "恢复对象初始状态", [["1", "对象", "Circle · c"]]),
      ...["redInput", "greenInput", "blueInput", "statusLabel"].flatMap((name, i) => add("", "恢复控件初始文字", [[String(i + 2), "恢复", (name === "statusLabel" ? "Label · " : "TextField · ") + name]]))],
    accept: { main: "RgbApp", runs: [{ steps: ["type:0:255", "type:1:0", "type:2:0", "click:Apply", "type:0:256", "click:Apply", "type:0:abc", "click:Apply", "click:Reset"] }],
    checks: ({ s, code }) => [
      c("使用 Color.rgb(r, g, b) 并处理 NumberFormatException", /c\.setFill\(Color\.rgb\(r, g, b\)\);/.test(code) && /catch \(NumberFormatException ex\)/.test(code), ""),
      c("(255,0,0)：变红，显示 RGB: (255, 0, 0)", circle(s[4]).fill === RED && has(s[4], "RGB: (255, 0, 0)"), circle(s[4]).fill + " / " + labels(s[4])),
      c("(256,0,0)：Invalid RGB values，颜色不变", circle(s[6]).fill === RED && has(s[6], "Invalid RGB values"), circle(s[6]).fill + " / " + labels(s[6])),
      c("(abc,0,0)：Invalid RGB values，颜色不变", circle(s[8]).fill === RED && has(s[8], "Invalid RGB values"), circle(s[8]).fill + " / " + labels(s[8])),
      c("Reset：蓝色，输入框 0、0、255，Label Ready", circle(s[9]).fill === BLUE && JSON.stringify(s[9].fields) === JSON.stringify(["0", "0", "255"]) && has(s[9], "Ready"), JSON.stringify(s[9].fields) + " / " + labels(s[9]))] } },

  // ---------------------------------------------------------------------------------------- Q18-Q20
  { id: "Q18", title: "Interface, Inheritance and Polymorphism（40）", verdict: "none", ops: [], v21: ["none", 0],
    note: "所有生成器都输出 JavaFX 程序。「Shape 程序」的接口和父类是 draw(Pane) 结构，不能改成 String describe()、private name 和 ShapeTest 控制台程序；「骨架补全」要先有题目给的 .java。",
    unmet: ["Drawable.describe()、BaseShape(name)、CircleShape / RectangleShape", "ShapeTest 用 ArrayList<Drawable> 循环调用"] },
  { id: "Q19", title: "Multiple Window Application（60）", verdict: "none", ops: [], v21: ["none", 0],
    note: "只有讲义例程「两个窗口：再建一个 Stage」，它是固定程序；积木工作台只生成一个窗口。",
    unmet: ["第二个 Stage 与 TextField / Save", "跨窗口更新主窗口 Label", "最多一个设置窗口", "Reset"] },
  { id: "Q20", title: "FlowPane and Dynamic Controls（40）", verdict: "none", ops: [], v21: ["none", 0],
    note: "只有讲义例程「FlowPane：自动换行排列」，是固定的标签和输入框；积木的控件只能放在 BorderPane 的四个区域，不能运行时新增 Label。",
    unmet: ["运行时新建 Label 加进 FlowPane", "Clear 只删用户添加的 Label", "Label 的内边距与背景色"] },

  // ---------------------------------------------------------------------------------------- Q21
  { id: "Q21", title: "Simple Library GUI（60）", verdict: "full", tool: "记录 + 文件（Lab 3 型）", v21: ["partial", 12],
    note: "Lab 3 范例：只留 Add、Borrow / Return 和 Clear；新的「操作哪条记录」选「选中的行；没选中时按输入框里的主键查找」，ListView 下也能按输入的 ISBN 借还；「提示文字」分组改重复和找不到的提示；空输入提示用文字替换。",
    ops: [{ nav: "记录 + 文件（Lab 3 型）" }, { preset: "Lab 3 原题：Book + 借还 + books.txt" },
      { set: ["主类名", "LibraryApp"] }, { set: ["窗口标题 / Alert 标题", "Library"] },
      { set: ["Delete / 状态 / 数值按钮操作哪条记录", "选中的行；没选中时按输入框里的主键查找"] },
      { set: ["Edit + Save（编辑模式）", "否"] }, { set: ["Delete", "否"] }, { set: ["Search（部分匹配）", "否"] }, { set: ["Display All", "否"] },
      { set: ["Load Test Data", "否"] }, { set: ["Exit", "否"] }, { set: ["排序按钮", "否"] },
      { set: ["主键重复时（{key} = 输入的主键）", "Duplicate ISBN"] }, { set: ["找不到记录时（{key} = 输入的主键）", "Book not found"] },
      { add: "替换" }, { row: ["替换", 1, "原文（从右侧代码里复制引号内的文字）", "Please enter both ISBN and Title."] }, { row: ["替换", 1, "换成", "Missing information"] }],
    accept: { main: "LibraryApp", runs: [{ steps: ["click:Add", "type:0:001", "type:1:Java Basics", "click:Add", "type:0:001", "type:1:Again", "click:Add",
      "type:0:001", "click:Borrow", "click:Borrow", "click:Return", "click:Return", "type:0:999", "click:Borrow", "type:0:001", "type:1:x", "click:Clear"] }],
    checks: ({ s, code }) => {
      const items = i => s[i].items.join("\n");
      const alert = i => s[i].alerts.join(" | ");
      return [
        c("ArrayList<Book> + ListView<String>，没有 TableView", /ArrayList<Book>/.test(code) && /ListView<String>/.test(code) && !/TableView/.test(code), ""),
        c("空输入 Add：Missing information", /Missing information/.test(alert(1)), alert(1)),
        c("Add：001 Java Basics 默认 available", free(items(4), "001") && /Java Basics/.test(items(4)), items(4)),
        c("重复 ISBN：显示 Duplicate ISBN", alert(7) === "Duplicate ISBN", alert(7)),
        c("Borrow（按输入的 ISBN，未选中行）：available 改为 false 并刷新", lent(items(9), "001"), items(9)),
        c("已借出再 Borrow：拒绝", alert(10).length > 0 && lent(items(10), "001"), alert(10)),
        c("Return：改回 true；再 Return：拒绝", free(items(11), "001") && alert(12).length > 0, items(11) + " / " + alert(12)),
        c("找不到书：显示 Book not found", alert(14) === "Book not found", alert(14)),
        c("Clear 只清空输入框，不删除 Book", s[17].fields.every(f => f === "") && /001/.test(items(17)), JSON.stringify(s[17].fields) + " / " + items(17))];
    } } },

  // ---------------------------------------------------------------------------------------- Q22
  { id: "Q22", title: "Book and Library Classes（40）", verdict: "partial", tool: "记录 + 文件（Lab 3 型）", v21: ["partial", 4],
    note: "「记录 + 文件」生成 Book.java：private 字段、构造器、getter / setter；显示格式写成 {isbn} - {title} [{available|Available|Borrowed}]，toString() 得到 001 - Java Basics [Available]。Library.java 仍没有页面能生成（同一页面生成的主程序留在 answers 里供参考）。",
    unmet: ["Library.java 的 addBook / findBook / borrowBook / returnBook（返回 true / false、找不到返回 null）"],
    ops: [{ nav: "记录 + 文件（Lab 3 型）" }, { preset: "Lab 3 原题：Book + 借还 + books.txt" }, { set: ["输出方式", "每个类一个文件"] },
      { set: ["每条记录的显示格式（留空 = toString；例 {code} | Qty: {quantity} | ${price:.2f}；题目给的类还可以写 {getGrade()}）", "{isbn} - {title} [{available|Available|Borrowed}]"] }] },

  // ---------------------------------------------------------------------------------------- Q23
  { id: "Q23", title: "Persistent Notes Application（60）", verdict: "partial", tool: "记录 + 文件（Lab 3 型）", v21: ["partial", 29],
    note: "用「手动 Save/Load」范例改成只有一个字段 text 的 Note 记录，TextArea 显示，文件 notes.txt；新的「Clear 同时清空内存里的全部记录」让 Clear 清空列表而不写文件。",
    unmet: ["ArrayList<String>：记录生成器总是 ArrayList<记录类>（这里是 ArrayList<Note>）", "相同内容的笔记不能重复添加（text 是主键）",
      "文件不存在时的提示：用文字替换只能改出 File not found. Line 1: notes.txt（后半句是固定拼接的）"],
    ops: [{ nav: "记录 + 文件（Lab 3 型）" }, { preset: "变体：Contact + 自定义按钮文字 + 手动 Save/Load + 总数 Label" },
      { set: ["主类名", "NotesApp"] }, { set: ["记录类名（如 Book）", "Note"] }, { set: ["窗口标题 / Alert 标题", "Notes Manager"] }, { set: ["数据文件名", "notes.txt"] },
      { set: ["输出方式", "合并成一个文件"] }, { set: ["记录显示在", "TextArea（按输入的主键操作）"] },
      { del: ["字段", 3] }, { del: ["字段", 2] },
      { row: ["字段", 1, "字段名", "text"] }, { row: ["字段", 1, "显示名（界面/提示用）", "Note"] }, { row: ["字段", 1, "getter 名（setter 自动对应）", "getText"] },
      { row: ["字段", 1, "可搜索", "否"] },
      { set: ["↳ 按钮文字", "Add", { after: "Add" }] }, { set: ["Delete", "否"] }, { set: ["Search（部分匹配）", "否"] }, { set: ["Display All", "否"] },
      { set: ["Clear", "是"] }, { set: ["↳ Clear 同时清空内存里的全部记录（不写文件）", "是"] }, { set: ["Exit", "否"] },
      { set: ["↳ 保存按钮文字", "Save"] }, { set: ["↳ 读取按钮文字", "Load"] }, { set: ["总数 Label（留空 = 没有；例 Total contacts: {count}）", ""] },
      { add: "替换" }, { row: ["替换", 1, "原文（从右侧代码里复制引号内的文字）", "Please enter Note."] }, { row: ["替换", 1, "换成", "Empty note"] },
      { add: "替换" }, { row: ["替换", 2, "原文（从右侧代码里复制引号内的文字）", "Unable to load note records from notes.txt. Line "] }, { row: ["替换", 2, "换成", "File not found. Line "] }],
    accept: { main: "NotesApp", runs: [
      { steps: ["click:Add", "type:0:Buy milk", "click:Add", "type:0:Call Tom", "click:Add", "click:Save", "click:Clear", "click:Load"] },
      { fresh: true, steps: ["click:Load", "type:0:After missing file", "click:Add"] }],
    checks: ({ s, runs, code, dir }) => {
      const area = i => s[i].areas.join("\n");
      const t = runs[1];
      return [
        c("使用 ArrayList<String> 保存笔记", /ArrayList<String> notes/.test(code), (/ArrayList<(\w+)>/.exec(code) || [])[0], false),
        c("空输入 Add：Empty note", s[1].alerts.some(a => /Empty note/.test(a)), s[1].alerts.join(" | ")),
        c("Add 两条后 TextArea 显示两条", /Buy milk/.test(area(5)) && /Call Tom/.test(area(5)), area(5)),
        c("Save：notes.txt 每条一行", (read(dir, "notes.txt") || "").trim().split(/\r?\n/).length === 2, read(dir, "notes.txt")),
        c("Clear：清空内存列表和 TextArea，文件不变", area(7).trim() === "" && (read(dir, "notes.txt") || "").trim().split(/\r?\n/).length === 2, area(7)),
        c("Load：恢复两条笔记", /Buy milk/.test(area(8)) && /Call Tom/.test(area(8)), area(8)),
        c("文件不存在时 Load：显示 File not found，不崩溃", t[1].alerts.some(a => /File not found/.test(a)), t[1].alerts.join(" | ")),
        c("文件不存在后仍能 Add", /After missing file/.test(t[3].areas.join("\n")), t[3].alerts.join(" | "))];
    } } },

  // ---------------------------------------------------------------------------------------- Q24
  { id: "Q24", title: "Load and Save Book Records（40）", verdict: "none", ops: [], v21: ["none", 0],
    note: "把题目给的两个方法签名粘进「骨架补全」，两个方法都显示「未识别的方法，请手写」。「记录 + 文件」的读写写在主程序里，不能生成独立的 LibraryFileManager。",
    unmet: ["static save(ArrayList<Book>, String) throws IOException", "static load(String) throws IOException，文件不存在返回空列表"] },

  // ---------------------------------------------------------------------------------------- Q25
  { id: "Q25", title: "Library Borrowing and Returning GUI（60）", verdict: "full", tool: "记录 + 文件（Lab 3 型）", v21: ["partial", 20],
    note: "Lab 3 范例改成：ListView 显示、按输入的 ISBN 借还、只留 ISBN 输入框和 Borrow / Return / Save；「启动时没有记录就放入测试数据」放入三条初始记录；手动保存且不要读取按钮。",
    ops: [{ nav: "记录 + 文件（Lab 3 型）" }, { preset: "Lab 3 原题：Book + 借还 + books.txt" },
      { set: ["主类名", "LibraryBorrowApp"] }, { set: ["窗口标题 / Alert 标题", "Library Borrowing"] }, { set: ["输出方式", "合并成一个文件"] },
      { set: ["Delete / 状态 / 数值按钮操作哪条记录", "选中的行；没选中时按输入框里的主键查找"] },
      { row: ["字段", 2, "可搜索", "否"] }, { row: ["字段", 2, "表单里有输入框", "否"] },
      { set: ["Add", "否"] }, { set: ["Edit + Save（编辑模式）", "否"] }, { set: ["Delete", "否"] }, { set: ["Search（部分匹配）", "否"] },
      { set: ["Display All", "否"] }, { set: ["Load Test Data", "否"] }, { set: ["Clear", "否"] }, { set: ["Exit", "否"] }, { set: ["排序按钮", "否"] },
      { set: ["什么时候读写文件", "手动：只有点 Save / Load 按钮才读写"] }, { set: ["↳ 保存按钮文字", "Save"] }, { set: ["↳ 要读取按钮", "否"] },
      { set: ["测试数据（每行一条，使用①所选分隔符）", "001,Java Basics,true\n002,Python Intro,false\n003,Web Systems,true"] },
      { set: ["启动时没有记录就放入上面的测试数据（题目给的初始记录）", "是"] }],
    accept: { main: "LibraryBorrowApp", runs: [{ steps: ["type:0:001", "click:Borrow", "click:Borrow", "type:0:002", "click:Return", "click:Return",
      "type:0:999", "click:Borrow", "click:Save"] }],
    checks: ({ s, dir, code }) => {
      const items = i => s[i].items.join("\n");
      const file = (read(dir, "books.txt") || "").trim();
      return [
        c("ListView<String> 显示，按钮只有 Borrow / Return / Save", /ListView<String>/.test(code) && !/new Button\("(Add|Delete|Load from File|Load)"\)/.test(code), ""),
        c("启动时显示三条初始记录", s[0].items.length === 3 && free(items(0), "001") && lent(items(0), "002"), items(0)),
        c("Borrow 001：变为借出", lent(items(2), "001"), items(2)),
        c("重复借出：拒绝且不修改", s[3].alerts.length > 0 && items(3) === items(2), s[3].alerts.join(" | ")),
        c("Return 002：变为可借", free(items(5), "002"), items(5)),
        c("重复归还：拒绝", s[6].alerts.length > 0, s[6].alerts.join(" | ")),
        c("找不到 ISBN：提示且不修改", s[8].alerts.length > 0 && items(8) === items(6), s[8].alerts.join(" | ")),
        c("Save：books.txt 三行，001 false、002 true", file.split(/\r?\n/).length === 3 && /001,Java Basics,false/.test(file) && /002,Python Intro,true/.test(file), file)];
    } } },

  { id: "Q26", title: "Search and Delete with ArrayList（40）", verdict: "none", ops: [], v21: ["none", 0],
    note: "把题目给的字段和三个方法签名粘进「骨架补全」，三个方法都显示「未识别的方法，请手写」。",
    unmet: ["findByIsbn 精确匹配", "searchByTitle 不区分大小写的部分匹配、空关键词返回空列表", "deleteBook 返回 true / false"] },

  // ---------------------------------------------------------------------------------------- Q27
  { id: "Q27", title: "Automatic Moving Player（60）", verdict: "full", tool: "Shape 程序（A2 型）", v21: ["partial", 13],
    note: "Timeline 小球范例改成：启动时就有圆、X 范围 [20,280]（动画到边界自动停止）、方向键每次 10（只留左右方向的方法名）、点击圆在蓝 / 红之间切换，状态 Label 显示 Started / Paused / X: … / Boundary reached。",
    ops: [{ nav: "Shape 程序（A2 型）" }, { preset: "变体：Timeline 动画小球（Start / Stop / Reset）" },
      { set: ["主类名（= 文件名）", "PlayerApp"] }, { set: ["窗口标题（{name} 会换成你的姓名）", "Player Controller"] }, { set: ["输出方式", "全部合并成一个文件"] },
      { set: ["初始 x", "50"] }, { set: ["初始 y", "100"] }, { set: ["新图形颜色", "BLUE"] }, { row: ["图形子类", 1, "半径 radius 默认值", "15"] },
      { set: ["启动时先放一个图形", "Ball"] }, { del: ["按钮", 1] },
      { row: ["按钮", 1, "成功后状态 Label 显示（可空；可用 {x} {y} {angle} {area} {class}）", "Started"] },
      { row: ["按钮", 2, "按钮文字（照题目写）", "Pause"] }, { row: ["按钮", 2, "成功后状态 Label 显示（可空；可用 {x} {y} {angle} {area} {class}）", "Paused"] },
      { row: ["按钮", 3, "成功后状态 Label 显示（可空；可用 {x} {y} {angle} {area} {class}）", "Reset"] },
      { set: ["窗口里显示状态 Label", "是"] }, { set: ["X 下限（留空 = 不限）", "20"] }, { set: ["X 上限（留空 = 不限）", "280"] },
      { set: ["方向键 / 动画每次移动后的提示（可空，例 X: {x}）", "X: {x}"] },
      { set: ["方向键移动当前图形", "方向键调用对应的移动方法"] }, { set: ["方向键每次移动（留空 = 与按钮相同）", "10"] },
      { set: ["鼠标操作当前图形", "点击图形：在新图形颜色和下面的颜色之间切换"] }, { set: ["点击切换到的颜色", "RED"] },
      { set: ["动画间隔（毫秒）", "300"] }, { set: ["上移方法", ""] }, { set: ["下移方法", ""] }, { set: ["添加时在控制台打印面积周长", "否"] }],
    accept: { main: "PlayerApp", runs: [{ steps: ["click:Start", "wait:1550", "click:Pause", "key:RIGHT", "key:LEFT", "hit:CLICKED:75:100", "hit:CLICKED:75:100", "key:UP",
      "click:Reset", ...times(22, "key:RIGHT"), "key:RIGHT", "click:Start", "wait:1500", "key:LEFT"] }],
    checks: ({ s }) => {
      const xLabel = i => new RegExp("^X: " + circle(s[i]).cx + "(\\.0)?$").test(s[i].labels.find(l => l.startsWith("X: ")) || "");
      return [
        c("启动时就有圆心 (50,100)、半径 15 的蓝色圆", s[0].shapes.length === 1 && circle(s[0]).cx === 50 && circle(s[0]).cy === 100 && circle(s[0]).r === 15 && circle(s[0]).fill === BLUE, JSON.stringify(s[0].shapes)),
        c("Start：每 300 ms X + 5（1.5 秒约 75），Label 反映位置", circle(s[2]).cx >= 65 && circle(s[2]).cx <= 85 && xLabel(2), circle(s[2]).cx + " / " + labels(s[2])),
        c("Pause：位置不变，Label Paused", circle(s[3]).cx - circle(s[2]).cx <= 5 && has(s[3], "Paused"), circle(s[3]).cx + " / " + labels(s[3])),
        c("RIGHT 键：X + 10，Label X: …", circle(s[4]).cx - circle(s[3]).cx === 10 && xLabel(4), circle(s[4]).cx + " / " + labels(s[4])),
        c("LEFT 键：X - 10", circle(s[4]).cx - circle(s[5]).cx === 10, circle(s[5]).cx),
        c("点击圆：蓝 → 红 → 蓝", circle(s[6]).fill === RED && circle(s[7]).fill === BLUE, circle(s[6]).fill + " / " + circle(s[7]).fill),
        c("UP 键不移动（只支持 LEFT / RIGHT）", circle(s[8]).cy === 100, circle(s[8]).cy),
        c("Reset：回到 (50,100)，蓝色", circle(s[9]).cx === 50 && circle(s[9]).cy === 100 && circle(s[9]).fill === BLUE, JSON.stringify(s[9].shapes)),
        c("RIGHT 到 270 后再按：停在 280", circle(s[31]).cx === 270 && circle(s[32]).cx === 280, circle(s[31]).cx + " / " + circle(s[32]).cx),
        c("Timeline 到 280 自动停止，Label Boundary reached", circle(s[34]).cx === 280 && has(s[34], "Boundary reached"), circle(s[34]).cx + " / " + labels(s[34])),
        c("自动停止后 LEFT 仍可移动：270", circle(s[35]).cx === 270, circle(s[35]).cx)];
    } } },

  { id: "Q28", title: "Window Closing and Validation（40）", verdict: "full", tool: "积木工作台", v21: ["none", 0],
    note: "String 变量 savedName（初始为空）。Save：输入框为空 → Invalid name，否则 savedName = 输入框内容。CloseRequest：「输入框文字等于文字变量」取反（内容不同）时 CONFIRMATION Unsaved changes. Exit?，取消时 e.consume()。",
    ops: [...blocks(), ...config("SaveNameApp", "Save Name"),
      ...cnew("TextField", "studentName", "", [["位置（BorderPane 区域）", "顶部 HBox"]]), ...cnew("Label", "statusLabel", "Ready", [["位置（BorderPane 区域）", "顶部 HBox"]]),
      ...cnew("Button", "saveBtn", "Save"), ...cnew("Button", "resetBtn", "Reset"), { "var.new": ["String", "savedName", ""] },
      ...ev(ACTION, "Button · saveBtn"),
      ...add("", "如果 · 条件积木", [["1", "判断条件", "输入框是空的（只有空格也算）"], ["1", "输入框", "TextField · studentName"]]),
      ...add("1.yes", TXT, [["1.yes.1", "文字", "Invalid name"]]),
      ...add("1.no", "文字变量 = 输入框内容"), ...add("1.no", TXT, [["1.no.2", "文字", "Saved"]]),
      ...ev(ACTION, "Button · resetBtn"), ...add("", "恢复变量初始值"), ...add("", "清空 TextField"), ...add("", "恢复控件初始文字", [["3", "恢复", "Label · statusLabel"]]),
      ...ev("点关闭按钮 CloseRequest", "Stage · stage"),
      ...add("", "如果 · 条件积木", [["1", "判断条件", "取反"]]), { "blk.set": ["1", "要取反的条件", "输入框文字等于文字变量"] },
      { "blk.set": ["1", "输入框", "TextField · studentName"] }, { "blk.set": ["1", "文字变量", "String · savedName"] },
      ...add("1.yes", "如果 · 确认框点了 OK（CONFIRMATION）", [["1.yes.1", "确认框内容", "Unsaved changes. Exit?"]]),
      ...add("1.yes.1.no", "消耗事件 e.consume()（关窗时阻止关闭）")],
    accept: { main: "SaveNameApp", runs: [{ steps: ["closecheck", "click:Save", "type:0:Amy", "click:Save", "closecheck", "type:0:Bob", "answer:CANCEL", "closecheck",
      "answer:OK", "closecheck", "click:Reset", "closecheck"] }],
    checks: ({ s, code }) => [
      c("首次启动：空输入与空名称相同，直接允许关闭", s[1].close === "allowed" && !s[1].alerts.length, s[1].close),
      c("空白 Save：Invalid name", has(s[2], "Invalid name"), labels(s[2])),
      c("Save：保存名称并显示 Saved", has(s[4], "Saved") && /savedName = studentName\.getText\(\)\.trim\(\);/.test(code), labels(s[4])),
      c("内容相同：直接关闭", s[5].close === "allowed" && !s[5].alerts.length, s[5].close),
      c("内容不同：弹出 Unsaved changes. Exit?，取消则 consume()", s[8].alerts.includes("Unsaved changes. Exit?") && s[8].close === "consumed", s[8].alerts.join(" | ") + " / " + s[8].close),
      c("确认则允许关闭", s[10].close === "allowed", s[10].close),
      c("Reset：清空名称与输入框，显示 Ready，可以直接关闭", has(s[11], "Ready") && s[11].fields[0] === "" && s[12].close === "allowed", labels(s[11]) + " / " + s[12].close)] } },

  // ---------------------------------------------------------------------------------------- Q29
  { id: "Q29", title: "Mini Library Administration System（60）", verdict: "partial", tool: "记录 + 文件（Lab 3 型）", v21: ["partial", 15],
    note: "Lab 3 范例改成 Book.java + MiniLibraryApp.java、TextArea 按输入的 ISBN 操作、手动 Load / Save，并勾选「启动时也读一次文件」。",
    unmet: ["Library.java（ArrayList<Book> 与 Add / Delete / Borrow / Return 方法）：记录生成器把列表和操作都写在主程序里"],
    ops: [{ nav: "记录 + 文件（Lab 3 型）" }, { preset: "Lab 3 原题：Book + 借还 + books.txt" },
      { set: ["主类名", "MiniLibraryApp"] }, { set: ["窗口标题 / Alert 标题", "Mini Library"] }, { set: ["输出方式", "每个类一个文件"] },
      { set: ["记录显示在", "TextArea（按输入的主键操作）"] },
      { set: ["Edit + Save（编辑模式）", "否"] }, { set: ["Search（部分匹配）", "否"] }, { set: ["Display All", "否"] }, { set: ["Load Test Data", "否"] },
      { set: ["Exit", "否"] }, { set: ["排序按钮", "否"] },
      { set: ["什么时候读写文件", "手动：只有点 Save / Load 按钮才读写"] }, { set: ["↳ 保存按钮文字", "Save"] }, { set: ["↳ 读取按钮文字", "Load"] },
      { set: ["↳ 启动时也读一次文件（文件不存在就从空列表开始）", "是"] }],
    accept: { main: "MiniLibraryApp", runs: [
      { steps: ["type:0:001", "type:1:Java Basics", "click:Add", "type:0:002", "type:1:Python Intro", "click:Add", "click:Add", "type:0:001", "click:Borrow",
        "type:0:002", "click:Delete", "click:Save"] },
      { steps: ["click:Load"] }],
    checks: ({ s, runs, code }) => {
      const area = snap => snap.areas.join("\n");
      const r2 = runs[1];
      return [
        c("有 Library 类", /class Library\b/.test(code), "没有 Library.java", false),
        c("首次启动（没有 books.txt）：空列表，不出错", area(s[0]).trim() === "", area(s[0])),
        c("Add 两本书", /001/.test(area(s[6])) && /002/.test(area(s[6])), area(s[6])),
        c("重复 ISBN 被拒绝", s[7].alerts.length > 0, s[7].alerts.join(" | ")),
        c("Borrow 001：available 改为 false", lent(area(s[9]), "001"), area(s[9])),
        c("Delete 002", !/002/.test(area(s[11])), area(s[11])),
        c("重新运行后启动时自动显示记录，借阅状态保持", lent(area(r2[0]), "001"), area(r2[0]) || "（空）"),
        c("重新运行 → Load：借阅状态保持", lent(area(r2[1]), "001"), area(r2[1]))];
    } } },

  // ---------------------------------------------------------------------------------------- Q30
  { id: "Q30", title: "JavaFX Debugging and Code Completion（40）", verdict: "full", tool: "积木工作台", v21: ["partial", 36],
    note: "builder 不能读入有错的代码再修改；这里用积木重新生成一份满足全部行为要求的 DebugApp.java（BorderPane 布局，控件不重叠）。阅卷如果要求在原代码上逐处修改，这份答案的结构和原代码不同。",
    ops: [...blocks(), ...config("DebugApp", "Debug App"),
      ...cnew("Pane", "pane", undefined, [["宽", "300"], ["高", "200"]]), ...cnew("Circle", "c", undefined, [["半径", "30"]]),
      ...cnew("Label", "label", "Radius: 30", [["位置（BorderPane 区域）", "顶部 HBox"]]), ...cnew("Button", "growBtn", "Grow"), ...cnew("Button", "resetBtn", "Reset"),
      ...ev(ACTION, "Button · growBtn"), ...add("", RL, [["1", "数值（加减时负数 = 缩小）", "5"], ["1", "最小半径", "5"], ["1", "最大半径", "60"]]),
      ...add("1.yes", TPL, [["1.yes.1", "文字", "Radius: {c.radius}"]]), ...add("1.no", TXT, [["1.no.1", "文字", "Maximum radius reached"]]),
      ...ev(ACTION, "Button · resetBtn"), ...add("", "恢复对象初始状态"), ...add("", "恢复控件初始文字")],
    accept: { main: "DebugApp", runs: [{ steps: [...times(7, "click:Grow"), "click:Reset"] }],
    checks: ({ s }) => [
      c("编译并启动；蓝色圆半径 30，Label Radius: 30", circle(s[0]).r === 30 && circle(s[0]).fill === BLUE && has(s[0], "Radius: 30"), labels(s[0])),
      c("Grow 六次：半径 60，Label Radius: 60.0", circle(s[6]).r === 60 && has(s[6], "Radius: 60.0"), circle(s[6]).r + " / " + labels(s[6])),
      c("第七次：保持 60，显示 Maximum radius reached", circle(s[7]).r === 60 && has(s[7], "Maximum radius reached"), circle(s[7]).r + " / " + labels(s[7])),
      c("Reset：半径 30、蓝色、Label 恢复", circle(s[8]).r === 30 && circle(s[8]).fill === BLUE && has(s[8], "Radius: 30"), labels(s[8]))] } }
];

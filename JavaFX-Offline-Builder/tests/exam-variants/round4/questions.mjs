import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const profile = { name: "Mock Candidate", id: "00000000", tools: "JavaFX Offline Builder" };

const set = (label, value) => ({ set: [label, value] });
const row = (list, index, label, value) => ({ row: [list, index, label, value] });
const config = (label, value) => ({ config: [label, value] });
const preset = (view, value) => [{ nav: view }, { preset: value }];
const example = (name, main, ...params) => [
  { nav: "讲义例程库" }, { example: name }, { "example.name": main },
  ...params.map(parameter => ({ "example.param": parameter }))
];
const blocks = (value, main, title) => [
  ...preset("积木工作台", value), config("类名", main), config("窗口标题（{name} = 姓名）", title)
];
const shape = (value, main) => [...preset("Shape 程序（A2 型）", value), set("主类名（= 文件名）", main)];
const record = (value, main, file) => [...preset("记录 + 文件（Lab 3 型）", value), set("主类名", main), set("数据文件名", file)];
const calc = (value, main, button) => [...preset("表单计算器", value), set("主类名", main), set("计算按钮文字", button)];
const draw = (value, main) => [...preset("绘图（Lecture 7）", value), set("主类名", main)];
const component = (card, label, value) => ({ "comp.set": [card, label, value] });
const block = (where, label) => ({ "blk.add": [where, label] });
const blockValue = (where, label, value) => ({ "blk.set": [where, label, value] });
const action = name => ({ "ev.new": ["按钮点击 / 输入框回车 Action", "Button · " + name] });
const type = (i, value) => "type:" + i + ":" + value;
const enterRecord = (button, ...values) => [...values.map((value, i) => type(i, value)), "click:" + button];
const read = (dir, file) => fs.readFileSync(path.join(dir, file), "utf8").replace(/\r\n/g, "\n");
const label = (snap, value) => snap.labels.includes(value);
const contains = (snap, value) => snap.items.some(item => item.includes(value));
const drawNode = (snap, type) => snap.shapes.find(shape => shape.type === type);
const circle = snap => drawNode(snap, "Circle");
const rect = snap => drawNode(snap, "Rectangle");
const color = (snap, fill) => snap.shapes.some(node => node.fill === fill);
const near = (actual, expected) => Math.abs(actual - expected) < 0.6;
const RED = "0xff0000ff", BLUE = "0x0000ffff", GREEN = "0x008000ff", YELLOW = "0xffff00ff";
const check = (message, value, detail = "", expected = true) => [message, Boolean(value), detail, expected];
const coords = snap => JSON.stringify(snap.shapes);
const fields = snap => JSON.stringify(snap.fields);
const items = snap => snap.items.join(" / ");
const labels = snap => snap.labels.join(" / ");
const alerts = snap => snap.alerts.join(" / ");
const unsupported = (message, value, detail) => check(message, value, detail, false);

function task(number, main, title, brief, ops, steps, checks, options = {}) {
  return {
    id: "Q" + String(number).padStart(2, "0"),
    title, brief, ops, tool: ops[0].nav,
    unmet: options.unmet,
    accept: { main, runs: [{ steps, files: options.files }, ...(options.moreRuns ?? [])], checks }
  };
}

export const questions = [
  // Lecture 7: stage/scene, layout, binding, shapes and local content.
  task(1, "WelcomeDesk", "Welcome Desk",
    'Create a Stage titled "Workshop Desk", with a 360 × 180 Scene and a StackPane holding one centred button labeled "Check In".',
    example("ButtonInPane", "WelcomeDesk", ["窗口标题", "Workshop Desk"], ["按钮文字", "Check In"], ["场景宽", "360"], ["场景高", "180"]),
    ["resize:440:240"], ({ s }) => [
      check("窗口标题、初始场景尺寸和 StackPane", s[0].title === "Workshop Desk" && near(s[0].sceneWidth, 360) && near(s[0].sceneHeight, 180) && s[0].root === "StackPane"),
      check("按钮文字正确，并且调整大小后依然居中", s.every(n => n.button === "Check In" &&
        Math.abs(n.buttonX - n.sceneWidth / 2) <= 1 && Math.abs(n.buttonY - n.sceneHeight / 2) <= 1),
      s.map(n => [n.buttonX, n.buttonY, n.sceneWidth, n.sceneHeight].join(", ")).join(" → "))
    ]),
  task(2, "CentredTarget", "A Centred Target",
    "Draw a white circle of radius 50 with a black outline. Use property bindings to keep it centred when the window is resized.",
    example("ShowCircleCentered", "CentredTarget"), ["resize:420:260", "resize:240:380"], ({ s, code }) => [
      check("半径 50、白色填充、黑色描边", s.every(n => circle(n)?.r === 50 && circle(n)?.fill === "0xffffffff") && /setStroke\(Color.BLACK\)/.test(code), coords(s[0])),
      check("两个坐标属性绑定且每次改变窗口尺寸后居中", /centerXProperty\(\)\.bind/.test(code) && /centerYProperty\(\)\.bind/.test(code) &&
        s.every(n => near(circle(n)?.cx, n.canvas[0] / 2) && near(circle(n)?.cy, n.canvas[1] / 2)), coords(s[2]))
    ]),
  task(3, "CornerGuides", "Resizable Corner Guides",
    "Draw two green diagonal guides in a custom Pane. Their points must keep a 10 px inset as the window changes size.",
    example("ShowLine", "CornerGuides"), ["resize:380:280", "resize:270:420"], ({ s, code }) => [
      check("使用 Pane 子类，绘制两条绿色直线", /class LinePane extends Pane/.test(code) &&
        s.every(n => n.shapes.filter(x => x.type === "Line" && x.stroke === GREEN).length === 2)),
      check("两次改变大小后四个角仍距边缘 10 px", s.every(n => {
        const [w, h] = n.canvas;
        const [a, b] = n.shapes.filter(x => x.type === "Line");
        return a && b && near(a.x1, 10) && near(a.y1, 10) && near(a.x2, w - 10) && near(a.y2, h - 10) &&
          near(b.x1, w - 10) && near(b.y1, 10) && near(b.x2, 10) && near(b.y2, h - 10);
      }), coords(s[2]))
    ]),
  task(4, "TrailMarker", "Five-Point Trail Marker",
    "Draw a blue polygon in a Pane using the five vertices (40,120), (100,30), (160,120), (140,170), (60,170). Use a white background.",
    [...draw("hexagon", "TrailMarker"), row("图形", 1, "点（x,y 成对，空格分隔）", "40,120 100,30 160,120 140,170 60,170"),
      row("图形", 1, "填充 setFill", "BLUE")], ["pixel:10:10"], ({ s, code }) => [
      check("Pane 中生成蓝色五边形，背景采样为白色", s[0].root === "Pane" && drawNode(s[0], "Polygon")?.points === 10 &&
        color(s[0], BLUE) && s[1].pixel === "0xffffffff", coords(s[0]) + " / " + s[1].pixel),
      check("坐标按题目顺序生成", /40(?:\.0)?, 120(?:\.0)?, 100(?:\.0)?, 30(?:\.0)?, 160(?:\.0)?, 120(?:\.0)?, 140(?:\.0)?, 170(?:\.0)?, 60(?:\.0)?, 170(?:\.0)?/.test(code))
    ]),
  task(5, "StudioSign", "Workshop Studio Sign",
    'Draw a house sign with a triangular roof, beige wall and door. Put the bold text "FX Studio" below the door at y=305. Use a 400 × 320 scene.',
    [...draw("house", "StudioSign"), row("图形", 4, "文字（\\n 换行）", "FX Studio")], [], ({ s, code }) => [
      check("400 × 320，三角屋顶、米色墙和门", near(s[0].sceneWidth, 400) && near(s[0].sceneHeight, 320) && drawNode(s[0], "Polygon")?.points === 6 &&
        s[0].shapes.filter(n => n.type === "Rectangle").length === 2 && color(s[0], "0xf5f5dcff"), coords(s[0])),
      check("底部粗体文字 FX Studio", drawNode(s[0], "Text")?.text === "FX Studio" && drawNode(s[0], "Text")?.y === 305 && /FontWeight.BOLD/.test(code), coords(s[0]))
    ]),
  task(6, "DualDesk", "Two Windows at Startup",
    'Show two distinct Stage instances at launch, each with its own Scene. Title the first "MyJavaFX" with an "OK" button, and the second "Second Stage" with a "New Stage" button.',
    example("MultipleStageDemo", "DualDesk"), [], ({ s, code }) => [
      check("两个 Stage 同时显示，各有场景和一个按钮", s[0].title === "MyJavaFX" && s[0].button === "OK" && s[0].windows?.length === 1 &&
        s[0].windows.some(w => w.title === "Second Stage" && w.button === "New Stage") && (code.match(/new Scene\(/g) || []).length === 2,
      JSON.stringify(s[0].windows))
    ]),
  task(7, "TagBoard", "Runtime Tag Board",
    "Use FlowPane for a tag board. Start with at least one label and a text field. Add must append a fresh Label with the entered text, including when a previous label has the same text.",
    example("ShowFlowPane", "TagBoard"), [type(0, "Revision"), "try-click:Add", "try-click:Add"], ({ s }) => [
      check("FlowPane 中有初始标签和输入框", s[0].root === "FlowPane" && s[0].labels.length > 0 && s[0].fields.length > 0, labels(s[0])),
      unsupported("两次 Add 创建两个同名标签", s[3].labels.filter(l => l === "Revision").length === 2, s[3].missing?.join(" / "))
    ], { unmet: ["FlowPane 讲义例程能导出静态布局，但 Builder 没有向 FlowPane 动态追加 Label 的控件或积木。"] }),

  // Lecture 8: event inputs, handler styles, validation and calculations.
  task(8, "SignalPanel", "Radio-Button Signal Panel",
    "Build a three-light signal panel. Radio buttons select one lit colour at a time. A checkbox hides the frame independently of the lights.",
    blocks("traffic", "SignalPanel", "Signal Panel"),
    ["click:Yellow", "click:Green", "click:Show frame", "click:Red", "click:Show frame"], ({ s, code }) => [
      check("RadioButton 在一个 ToggleGroup；切换时仅目标灯亮", /new ToggleGroup\(/.test(code) &&
        color(s[1], YELLOW) && color(s[2], GREEN) && !color(s[2], YELLOW) && color(s[4], RED) && !color(s[4], GREEN), coords(s[4])),
      check("隐藏、恢复边框不会改变选中的灯", rect(s[3])?.visible === false && color(s[3], GREEN) && rect(s[5])?.visible === true && color(s[5], RED))
    ]),
  task(9, "RoutePointer", "Two-Button Route Pointer",
    "Move a radius-20 marker to the clicked coordinates. Primary click paints red, secondary click paints blue. Reset restores the initial grey marker and prompt.",
    blocks("clickColor", "RoutePointer", "Route Pointer"),
    ["mouse:CLICKED:160:80:PRIMARY", "mouse:CLICKED:210:140:SECONDARY", "click:Reset"], ({ s }) => [
      check("左右键分别移动至点击位置并改变颜色", circle(s[1])?.cx === 160 && circle(s[1])?.cy === 80 && color(s[1], RED) &&
        circle(s[2])?.cx === 210 && circle(s[2])?.cy === 140 && color(s[2], BLUE), coords(s[2])),
      check("Reset 恢复坐标、灰色和提示", coords(s[3]) === coords(s[0]) && label(s[3], "Click on the pane"), coords(s[3]))
    ]),
  task(10, "SeatCounter", "Seat Adjustment Counter",
    "Start from Count: 0. Provide +2, -1 and Reset buttons, permit negative totals, and keep the correct count across separate clicks.",
    [...blocks("counter", "SeatCounter", "Seat Adjustment"), component("Button · plusBtn", "显示的文字", "+2"),
      blockValue("1", "变化量", "2")], ["click:-1", "click:+2", "click:+2", "click:Reset", "click:-1"], ({ s }) => [
      check("连续点击的读数依次为 -1、1、3", ["Count: -1", "Count: 1", "Count: 3"].every((t, i) => label(s[i + 1], t)), s.map(labels).join(" → ")),
      check("Reset 后从 0 重新计数", label(s[4], "Count: 0") && label(s[5], "Count: -1"))
    ]),
  task(11, "DraftGate", "Draft Close Gate",
    "Use a checkbox to allow closing only after the draft is marked saved. Closing while unchecked must be consumed. Unchecking again must re-enable the guard.",
    blocks("closeGuard", "DraftGate", "Draft Gate"),
    ["closecheck", "click:I have saved my work", "closecheck", "click:I have saved my work", "closecheck"], ({ s, code }) => [
      check("CloseRequest 已注册，未勾选时消费事件且显示提示", /setOnCloseRequest/.test(code) && s[1].close === "consumed" && label(s[1], "Please tick the box first")),
      check("勾选后允许关闭，取消勾选后再次拦截", s[3].close === "allowed" && s[5].close === "consumed", s[3].close + " / " + s[5].close)
    ]),
  task(12, "LaneKeys", "Shift-Accelerated Lane",
    "Set up a horizontal marker. Right moves 5 px, Shift+Right moves 20 px, Left moves back 5 px. An unrelated key does nothing. Reject moves beyond the configured boundary and support Reset.",
    blocks("shift", "LaneKeys", "Lane Keys"),
    ["key:RIGHT", "key:RIGHT:SHIFT", "key:LEFT", "key:A", ...Array(12).fill("key:RIGHT:SHIFT"), "click:Reset"], ({ s }) => {
      const x = i => circle(s[i])?.cx;
      return [
        check("普通右键、加速右键和左键分别改变 5、20、−5 px", x(1) - x(0) === 5 && x(2) - x(1) === 20 && x(3) - x(2) === -5),
        check("无关按键和越界不移动；Reset 恢复原坐标", x(4) === x(3) && x(16) === x(15) && label(s[16], "Boundary reached") && x(17) === x(0), labels(s[16]))
      ];
    }),
  task(13, "WorkshopTimer", "Workshop Timer",
    "Use a one-second Timeline. Start begins counting, Pause freezes the display, and Reset stops and returns it to zero even after Start is pressed twice.",
    blocks("stopwatch", "WorkshopTimer", "Workshop Timer"),
    ["click:Start", "wait:1320", "click:Pause", "wait:1200", "click:Start", "click:Start", "wait:1300", "click:Reset", "wait:1200"], ({ s, code }) => {
      const t = n => Number((/Time: (\d+)/.exec(labels(n)) || [])[1]);
      return [
        check("使用 1 秒 KeyFrame；启动能计时，暂停不计时", /KeyFrame/.test(code) && t(s[2]) >= 1 && t(s[3]) === t(s[4]), s.map(labels).join(" → ")),
        check("重复启动不加速，重置后维持为 0", t(s[7]) - t(s[4]) === 1 && t(s[8]) === 0 && t(s[9]) === 0)
      ];
    }),
  task(14, "ResetScore", "Confirm a Score Reset",
    'Show "Score: 7". Reset must ask "Reset score?". Cancel keeps 7 and OK sets the label to "Score: 0".',
    [...blocks("blank", "ResetScore", "Confirm Reset"), { "comp.new": ["Label", "scoreLabel", "Score: 7"] }, { "comp.new": ["Button", "resetBtn", "Reset"] },
      action("resetBtn"), block("", "如果 · 确认框点了 OK（CONFIRMATION）"), blockValue("1", "确认框内容", "Reset score?"),
      block("1.yes", "Label 显示文字"), blockValue("1.yes.1", "文字", "Score: 0")],
    ["answer:CANCEL", "click:Reset", "answer:OK", "click:Reset"], ({ s, code }) => [
      check("CONFIRMATION 提示正确，取消时不改分数", /AlertType.CONFIRMATION/.test(code) && s[2].alerts.includes("Reset score?") && label(s[2], "Score: 7"), alerts(s[2])),
      check("确认后分数归零", label(s[4], "Score: 0"), labels(s[4]))
    ]),
  task(15, "LabThermometer", "Laboratory Thermometer",
    "Convert Celsius to Fahrenheit and display one decimal place. Validate non-numeric input using an Alert. Clear empties the field and resets the output.",
    calc("temp", "LabThermometer", "Read Temperature"),
    [type(0, "-40"), "click:Read Temperature", type(0, "37"), "click:Read Temperature", type(0, "bad"), "click:Read Temperature", "click:Clear"], ({ s }) => [
      check("−40 °C → −40.0 °F；37 °C → 98.6 °F", label(s[2], "-40.0") && label(s[4], "98.6"), labels(s[2]) + " / " + labels(s[4])),
      check("非数字提示，Clear 清空输入并重置输出", s[6].alerts.length > 0 && fields(s[7]) === '[""]' && label(s[7], "-"), alerts(s[6]))
    ]),
  task(16, "PaceDesk", "Average Speed Desk",
    "Compute km/h from kilometres and minutes. Accept zero distance, reject zero time and reject negative distance. Show one decimal place.",
    calc("speed", "PaceDesk", "Measure"),
    [...enterRecord("Measure", "7.5", "15"), ...enterRecord("Measure", "0", "15"), ...enterRecord("Measure", "3", "0"), ...enterRecord("Measure", "-1", "15")], ({ s }) => [
      check("7.5 km / 15 min = 30.0；零距离为 0.0", label(s[3], "30.0") && label(s[6], "0.0"), labels(s[3]) + " / " + labels(s[6])),
      check("零时间和负距离都拒绝并提示", s[9].alerts.length > 0 && s[12].alerts.length > 0, alerts(s[9]) + " / " + alerts(s[12]))
    ]),
  task(17, "NoFeeLoan", "Zero-Rate Loan",
    "Calculate monthly payment and total payment to two decimals. At 0% interest the monthly payment is principal divided by months. Reject negative rates and invalid years.",
    calc("loan", "NoFeeLoan", "Quote"),
    [...enterRecord("Quote", "0", "2", "4800"), ...enterRecord("Quote", "-1", "2", "4800"), ...enterRecord("Quote", "3", "0", "4800")], ({ s }) => [
      check("0% 两年 4800 → 月供 200.00 和总额 4800.00", label(s[4], "200.00") && label(s[4], "4800.00"), labels(s[4])),
      check("负利率和零年均有 Alert", s[8].alerts.length > 0 && s[12].alerts.length > 0, alerts(s[8]) + " / " + alerts(s[12]))
    ]),
  task(18, "DualAction", "Two Actions, One Handler",
    'On a single Submit click, change the status to "Accepted" and print "Accepted by handler". Register only one action handler on Submit.',
    [...blocks("blank", "DualAction", "Dual Action"), { "comp.new": ["Label", "statusLabel", "Ready"] }, { "comp.new": ["Button", "submitBtn", "Submit"] },
      action("submitBtn"), block("", "Label 显示文字"), blockValue("1", "文字", "Accepted"),
      block("", "控制台输出 System.out.println"), blockValue("2", "文字", "Accepted by handler")],
    ["click:Submit"], ({ s, code, out }) => [
      check("仅注册一次 Submit 的 ActionHandler", (code.match(/submitBtn\.setOnAction\(/g) || []).length === 1),
      check("一次点击同时改 Label 和输出到控制台", label(s[1], "Accepted") && out.split("\n").filter(l => l === "Accepted by handler").length === 1, out)
    ]),

  // Assignment 2: polymorphic shape classes, controls and persistence.
  task(19, "GaugeMover", "Bounded Circle Gauge",
    "Use Drawable, an abstract Shape and JavaFXCircle. Add keeps exactly one green circle of radius 35 centred at (100,90). Move Up moves it 12 px and refuses any y less than 66. Red recolours it and Clear Screen removes it.",
    [...shape("a2", "GaugeMover"), set("(x, y) 表示", "图形中心"), set("初始 x", "100"), set("初始 y", "90"),
      set("每次移动（像素）", "12"), set("Y 下限（留空 = 不限）", "66"), set("窗口里显示状态 Label", "是"),
      row("图形子类", 1, "半径 radius 默认值", "35"), row("按钮", 3, "按钮文字（照题目写）", "Red")],
    ["click:Add Circle", "click:Move Up", "click:Move Up", "click:Move Up", "click:Red", "click:Add Circle", "click:Clear Screen"], ({ s, code }) => [
      check("Drawable / Shape / JavaFXCircle 保持独立结构，新增位置、半径与颜色正确",
        /interface Drawable/.test(code) && /abstract class Shape/.test(code) && /class JavaFXCircle extends Shape/.test(code) &&
        circle(s[1])?.cx === 100 && circle(s[1])?.cy === 90 && circle(s[1])?.r === 35 && color(s[1], GREEN), coords(s[1])),
      check("90→78→66，继续上移被拦截", circle(s[2])?.cy === 78 && circle(s[3])?.cy === 66 && circle(s[4])?.cy === 66 && label(s[4], "Boundary reached")),
      check("改红、重新 Add 换为一个绿圆、Clear 清空", color(s[5], RED) && s[6].shapes.length === 1 && color(s[6], GREEN) && !s[7].shapes.length)
    ]),
  task(20, "ParcelMover", "Parcel Rectangle Mover",
    "Add an orange 100 × 60 rectangle. Left/Right and Up/Down move it 13 px along the matching axis. Green recolours it; repeated Clear leaves the drawing empty.",
    [...shape("rect", "ParcelMover"), set("每次移动（像素）", "13")],
    ["click:Add Rectangle", "click:Right", "click:Down", "click:Left", "click:Up", "click:Green", "click:Clear", "click:Clear"], ({ s }) => {
      const initial = rect(s[1]);
      return [
        check("橙色 100 × 60 矩形", initial?.w === 100 && initial?.h === 60 && initial?.fill === "0xffa500ff", coords(s[1])),
        check("四个方向分别在对应轴改变 13 px", rect(s[2])?.x === initial?.x + 13 && rect(s[3])?.y === initial?.y + 13 &&
          rect(s[4])?.x === initial?.x && rect(s[5])?.y === initial?.y, coords(s[5])),
        check("切换成绿色；重复 Clear 安全", color(s[6], GREEN) && !s[7].shapes.length && !s[8].shapes.length)
      ];
    }),
  task(21, "PanelSizer", "Dimension-Limited Panel",
    "Read width and height from text fields. Permit width 10–60 and height 10–40 inclusive. Enlarge or shrink both by 5 within the same limits. Display area to two decimals.",
    [...shape("sized", "PanelSizer"), set("尺寸上限（新增和缩放；一个值或逗号分隔）", "60,40")],
    [...enterRecord("Add Rectangle", "55", "35"), "click:Enlarge", "click:Enlarge", "click:Shrink", ...enterRecord("Add Rectangle", "55", "41")], ({ s }) => [
      check("55×35 的面积为 1925.00；Enlarge 到 60×40 为 2400.00", rect(s[3])?.w === 55 && rect(s[3])?.h === 35 && label(s[3], "Area: 1925.00") &&
        rect(s[4])?.w === 60 && rect(s[4])?.h === 40 && label(s[4], "Area: 2400.00"), labels(s[4])),
      check("继续放大与无效新增都拒绝，缩小仍有效", coords(s[5]) === coords(s[4]) && rect(s[6])?.w === 55 &&
        coords(s[9]) === coords(s[6]) && label(s[9], "Invalid size"), labels(s[9]))
    ]),
  task(22, "TileStore", "Restartable Tile Collection",
    "Keep a circle and a square in an ArrayList. Move the last shape 30 px right and paint only that shape blue. Save to tiles.txt, then restore positions and colours on reopening via Load.",
    [...shape("files", "TileStore"), set("保存/读取用的数据文件名", "tiles.txt")],
    ["click:Add Circle", "click:Add Square", "click:Move Right", "click:Blue", "click:Save"], ({ s, runs, dir, code }) => [
      check("ArrayList 同时保留未改色的圆和蓝色方块", /ArrayList<Shape>/.test(code) && s[4].shapes.length === 2 && circle(s[4])?.fill === GREEN && rect(s[4])?.fill === BLUE, coords(s[4])),
      check("两行文件包含图形类别和新位置；重开再 Load 恢复画布", /^CircleShape,100\.0,100\.0,0x008000ff,30\.0\nSquareShape,130\.0,100\.0,0x0000ffff,60\.0\n?$/.test(read(dir, "tiles.txt")) &&
        !runs[1][0].shapes.length && coords(runs[1][1]) === coords(s[4]), read(dir, "tiles.txt"))
    ], { moreRuns: [{ steps: ["click:Load"] }] }),
  task(23, "SquareNavigator", "Square Navigation with Two Step Sizes",
    "Use buttons for 25 px steps and arrow keys for 12 px steps. A canvas click repositions the active square. Show its area and preserve area when it moves.",
    [...shape("keys", "SquareNavigator"), set("方向键每次移动（留空 = 与按钮相同）", "12")],
    ["click:New Square", "click:Right", "key:LEFT", "mouse:CLICKED:150:160"], ({ s }) => [
      check("按钮与键盘步长分别为 25 和 12 px", rect(s[2])?.x - rect(s[1])?.x === 25 && rect(s[3])?.x - rect(s[2])?.x === -12, coords(s[3])),
      check("点击 (150,160) 定位；保持 80×80、面积 6400.00", rect(s[4])?.x === 150 && rect(s[4])?.y === 160 && rect(s[4])?.w === 80 && label(s[4], "Area: 6400.00"), coords(s[4]) + " " + labels(s[4]))
    ]),
  task(24, "GeometryTray", "Polymorphic Geometry Tray",
    "Keep MyCircle, MyRectangle and MySquare subclasses in an ArrayList<Shape>. Add all three to one canvas, recolour only the last to yellow, remove it without changing the earlier shapes, and provide Clear.",
    [...shape("multi", "GeometryTray"), set("添加时在控制台打印面积周长", "否")],
    ["click:Add Circle", "click:Add Rectangle", "click:Add Square", "click:Yellow", "click:Remove Last", "click:Clear"], ({ s, code }) => [
      check("三种子类 extends Shape，并以 ArrayList<Shape> 存放", ["MyCircle", "MyRectangle", "MySquare"].every(n => code.includes("class " + n + " extends Shape")) &&
        /ArrayList<Shape>/.test(code) && s[3].shapes.length === 3, coords(s[3])),
      check("只给最后一个染黄，Remove Last 保留前两个，Clear 清空", s[4].shapes.filter(n => n.fill === YELLOW).length === 1 && s[4].shapes.at(-1).fill === YELLOW &&
        coords(s[5]) === coords(s[2]) && !s[6].shapes.length, coords(s[4]))
    ]),

  // Lab 3: typed records, searches and safe local-file round trips without a table grid.
  task(25, "WorkshopContacts", "Explicit Contact Save",
    "Manage name, phone and email records in a ListView with unique names and a contact count. Add two, explicitly save to workshop-contacts.txt, then add a third without saving. A new launch starts empty until Load, which restores only the saved two.",
    record("contacts", "WorkshopContacts", "workshop-contacts.txt"),
    [...enterRecord("Add Contact", "Dora", "2718", "dora@example.test"), ...enterRecord("Add Contact", "Eli", "3141", "eli@example.test"),
      ...enterRecord("Add Contact", "Dora", "0000", "dupe@example.test"), "click:Save to File",
      ...enterRecord("Add Contact", "Fran", "1618", "fran@example.test")], ({ s, runs, dir }) => [
      check("两条有效记录、重复被拒，第三条仅在内存中", s[8].items.length === 2 && s[12].alerts.length > 0 &&
        contains(s[17], "Fran") && label(s[17], "Total contacts: 3"), items(s[17])),
      check("显式保存的两条记录可在新进程恢复", read(dir, "workshop-contacts.txt").trim() === "Dora,2718,dora@example.test\nEli,3141,eli@example.test" &&
        !runs[1][0].items.length && runs[1][1].items.length === 2 && contains(runs[1][1], "Dora") && !contains(runs[1][1], "Fran"), items(runs[1][1]))
    ], { moreRuns: [{ steps: ["click:Load from File"] }] }),
  task(26, "PartsStock", "Capped Parts Inventory",
    "A Part has code, name, integer quantity and price. Set an inclusive cap of 12 units. Sell subtracts one, Restock adds ten, and operations exceeding either limit leave the quantity unchanged. Save successful changes.",
    [...record("products", "PartsStock", "parts.txt"), set("记录类名（如 Book）", "Part"),
      row("字段", 3, "字段上限（新增／修改／读档／按钮）", "12"), row("数值按钮", 2, "上限（可空）", "12")],
    [...enterRecord("Add", "R7", "Relay", "0", "2.75"), "select:0", "click:Sell", "click:Restock", "click:Restock", "click:Sell"], ({ s, dir, code }) => [
      check("零库存 Sell 失败；第一次 Restock 到 10，第二次超过 12 被拒", s[7].alerts.length > 0 && contains(s[7], "Qty: 0") &&
        contains(s[8], "Qty: 10") && s[9].alerts.length > 0 && contains(s[9], "Qty: 10"), alerts(s[7]) + " / " + alerts(s[9])),
      check("最后扣减至 9；价格两位小数，Part 类型与磁盘记录正确", /class Part\b/.test(code) && contains(s[10], "Qty: 9 | $2.75") &&
        read(dir, "parts.txt").trim() === "R7,Relay,9,2.75", items(s[10]))
    ]),
  task(27, "ShelfFilter", "Two-Criterion Shelf Search",
    "Seed AA1 Networks Primer, AA2 Graphics Primer, BB1 Networks Advanced and BB2 Java Essentials. Use a ListView and case-insensitive partial search by ISBN and title. Require both nonblank criteria, ignore blank criteria, and show an error if both are blank. Display All restores the four books.",
    [...record("andSearch", "ShelfFilter", "shelf.txt"), set("测试数据（每行一条，使用①所选分隔符）",
      "AA1,Networks Primer,true\nAA2,Graphics Primer,true\nBB1,Networks Advanced,true\nBB2,Java Essentials,false")],
    ["click:Load Test Data", type(1, "NeTwOrKs"), "click:Search", type(0, "AA"), "click:Search", "click:Display All", "click:Clear", "click:Search"], ({ s }) => [
      check("单条件忽略大小写匹配 AA1 与 BB1；AND 只剩 AA1", s[3].items.length === 2 && contains(s[3], "AA1") && contains(s[3], "BB1") &&
        s[5].items.length === 1 && contains(s[5], "AA1"), items(s[3]) + " → " + items(s[5])),
      check("Display All 恢复四条，空条件提示，不改记录集合", s[6].items.length === 4 && s[8].items.length === 4 && s[8].alerts.length > 0, alerts(s[8]))
    ]),
  task(28, "MeritRoster", "Merit List and Class Summary",
    "Allow integer marks from 0 to 100. Show a Merit List for marks at least 70. Summary shows count, total and average of all stored records.",
    [...record("grades", "MeritRoster", "merit.txt"), row("筛选按钮", 1, "按钮文字", "Merit List"), row("筛选按钮", 1, "比较值", "70")],
    [...enterRecord("Add", "M1", "Jo", "70"), ...enterRecord("Add", "M2", "Kai", "69"), ...enterRecord("Add", "M3", "Lee", "101"), "click:Merit List", "click:Summary", "click:Display All"], ({ s }) => [
      check("70 入榜、69 不入榜、101 拒绝", s[12].alerts.length > 0 && s[13].items.length === 1 && contains(s[13], "M1") && !contains(s[13], "M2"), items(s[13])),
      check("筛选后统计仍对全部两人：总分 139、平均 69.50", label(s[14], "Count: 2   Total: 139   Average: 69.50") &&
        s[15].items.length === 2, labels(s[14]))
    ]),
  task(29, "ShelfImport", "Quoted Titles and Rejected Imports",
    "Load a semicolon-separated shelf file with a header and quoted titles. Keep semicolons and quotes inside titles after writing and restarting. If a row is malformed, report its line number and keep the original file unchanged.",
    record("delimited", "ShelfImport", "shelf-import.txt"),
    [...enterRecord("Add", "K2", 'Java; "FX"', "4")], ({ s, runs, dir, runDirs }) => [
      check("读入含引号的现有记录，新增后写入正确转义", contains(s[0], 'Intro; "GUI"') && contains(s[4], 'Java; "FX"') &&
        read(dir, "shelf-import.txt").trim() === 'isbn;title;available;copies\nK1;"Intro; ""GUI""";true;2\nK2;"Java; ""FX""";true;4',
      read(dir, "shelf-import.txt")),
      check("重开后两条记录与原引号恢复", runs[1][0].items.length === 2 && contains(runs[1][0], 'Java; "FX"'), items(runs[1][0])),
      check("坏文件第 3 行被报告，后续 Add 不覆盖原文件", /Line 3/.test(alerts(runs[2][0])) && runs[2][4].alerts.length > 0 &&
        read(runDirs[2], "shelf-import.txt") === read(fixtures, "invalid-shelf.txt"), alerts(runs[2][0]) + " / " + alerts(runs[2][4]))
    ], { files: { "shelf-import.txt": "fixtures/valid-shelf.txt" }, moreRuns: [{ steps: [] }, {
      fresh: true, files: { "shelf-import.txt": "fixtures/invalid-shelf.txt" }, steps: enterRecord("Add", "K3", "New", "1")
    }] }),
  task(30, "EditDesk", "Book Editing with Dedicated Cancel",
    "Build a Book editing UI using a ListView. Select an existing row to fill the fields. Edit and Save must update the file. Also provide a separate Cancel button that discards pending input and restores the saved row without writing it.",
    record("lab3", "EditDesk", "edit-books.txt"),
    [...enterRecord("Add", "E1", "Original"), "select:0", "click:Edit", type(1, "Saved Title"), "click:Save",
      "select:0", "click:Edit", type(1, "Discard Me"), "try-click:Cancel"], ({ s, dir }) => [
      check("选中行填入资料，Edit/Save 把新标题持久化", fields(s[4]) === '["E1","Original"]' && contains(s[8], "Saved Title") &&
        read(dir, "edit-books.txt").trim() === "E1,Saved Title,true", items(s[8])),
      unsupported("独立 Cancel 恢复已保存标题并退出编辑模式", !s[11].missing?.length && s[11].fields[1] === "Saved Title" &&
        !s[11].disabled.includes("Add"), s[11].missing?.join(" / ") || fields(s[11]))
    ], { unmet: ["记录生成器可进入编辑模式并保存，但没有独立 Cancel 控件来丢弃表单编辑。"] })
];

const fixtures = fileURLToPath(new URL("./fixtures/", import.meta.url));

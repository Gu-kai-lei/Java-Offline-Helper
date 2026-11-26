// Builds src/core/variants.js: the practice catalogue shown on the "变体题练习" page.
// Question texts live here; builder settings and given files are copied from tests/exam-variants,
// so the page always loads the settings that the regression tests compile and run.
// Run from JavaFX-Offline-Builder/: node tools/make-variants.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const variantsDir = path.join(root, "tests", "exam-variants");
const round1 = JSON.parse(fs.readFileSync(path.join(variantsDir, "solutions.json"), "utf8"));
const round2 = JSON.parse(fs.readFileSync(path.join(variantsDir, "round2", "solutions.json"), "utf8"));

const givenFiles = dir => fs.readdirSync(path.join(variantsDir, dir)).filter(f => f.endsWith(".java")).sort()
  .map(name => ({ name, code: fs.readFileSync(path.join(variantsDir, dir, name), "utf8").replace(/\r\n/g, "\n") }));

// Round 1 settings are complete models; drop the page checksums the tests keep beside them.
const fromRound1 = (id, view) => {
  const { files, given, ...rest } = round1[id];
  const load = { view, settings: rest[view === "oop" ? "oop" : "record"] };
  if (rest.skeleton) load.skeleton = rest.skeleton;
  return { load, given: given ? givenFiles(given) : undefined };
};
const fromRound2 = (id, view) => {
  const { given, ...rest } = round2[id];
  const key = { oop: "oop", record: "record", calc: "calc", blocks: "blocks" }[view];
  const load = { view, settings: rest[key] };
  if (rest.skeleton) load.skeleton = rest.skeleton;
  if (rest.oopFromSkeleton || rest.recordFromSkeleton) load.fromSkeleton = true;
  return { load, given: given ? givenFiles(path.join("round2", given)) : undefined };
};
const preset = (view, id, settings) => ({ load: { view, preset: id, ...(settings ? { settings } : {}) } });
// Questions the builder cannot fully answer: hand-written references tested by run_builder_tests.mjs.
// manual/<Q>/*.java is the answer (shown with the student's header), manual/<Q>/given/*.java what the paper gives.
const javaIn = dir => fs.readdirSync(dir).filter(f => f.endsWith(".java")).sort()
  .map(name => ({ name, code: fs.readFileSync(path.join(dir, name), "utf8").replace(/\r\n/g, "\n") }));
const manual = (round, q) => {
  const dir = path.join(variantsDir, round, "manual", q), givenDir = path.join(dir, "given");
  return { solution: javaIn(dir), ...(fs.existsSync(givenDir) ? { given: javaIn(givenDir) } : {}) };
};
const MANUAL = "第三轮：builder 做不到、要手写的题";
const ROUND4_MANUAL = "第四轮：builder 做不全的题";

const items = [
  // ---------- round 1 ----------
  { id: "A2-1", group: "第一轮：A2 / Lab 3 变体", title: "A2-1 Rectangle Mover（题目给代码）", ...fromRound1("A2-1", "oop"),
    question: [
      "使用题给的 Drawable.java、Shape.java 和未完成的 JavaFXRectangle.java。只补全 JavaFXRectangle，不得改动 Drawable 和 Shape。",
      "补全 JavaFXRectangle 的所有方法。无参构造器创建 120 × 60 的矩形。draw() 用 fillColor 填充矩形，左上角为 (x, y)。displayShape() 在控制台输出面积和周长。",
      "编写 RectangleApp，窗口标题为「Rectangle Mover - <你的全名>」。BorderPane 中间放 500 × 300 的白色画布，底部 HBox 的间距和内边距均为 10。",
      "底部按顺序放置 Add Rectangle、Yellow、Green、Left、Right、Up、Down、Clear。Add Rectangle 用新的默认矩形替换旧矩形并打印面积和周长。颜色按钮改变填充色，方向按钮调用 Shape 的对应方法，Clear 移除矩形。画布上没有矩形时，操作也不得使程序异常退出。"
    ],
    hints: ["题目给了 .java → 「骨架补全」：三个文件各贴一个框，宽 120、高 60。", "补完点「用这些类生成主程序」，在「Shape 程序」里改按钮（底部）、颜色和画布大小，输出方式选「只输出主程序」。"],
    checks: ["Add → 橙色矩形在 (80, 60)，120 × 60，控制台打印 Area of rectangle = 7200.0", "Right ×2 → x = 120；Up → y = 40", "Yellow → 变黄；Clear → 清空", "没有矩形时点 Left 不报错"] },
  { id: "A2-2", group: "第一轮：A2 / Lab 3 变体", title: "A2-2 Circle Studio（只有 UML，输入半径）", ...fromRound1("A2-2", "oop"),
    question: [
      "自行编写所有类。Drawable 接口声明 void draw(Pane pane)。抽象类 Shape 实现 Drawable，包含 protected double area、perimeter、x = 150、y = 120（圆心坐标）及 protected Color color = Color.BLUE，并提供抽象方法 computeArea()、computePerimeter()、enlarge()、shrink()，以及 setColor(Color c)。",
      "MyCircle 继承 Shape，包含 private double radius 和构造器 MyCircle(double radius)。enlarge() 把半径加 5，shrink() 把半径减 5，最小半径为 5。",
      "编写 CircleStudio，窗口标题为「Circle Studio - <你的全名>」。顶部 HBox 包含 Radius: 标签、初始值为 40 的输入框和 Add Circle。左侧 VBox 的间距和内边距均为 10，放置 Enlarge、Shrink、Red、Clear。",
      "中央使用 400 × 300 的白色画布。底部标签显示当前圆的面积和周长，保留两位小数，例如「Area: 5026.55   Perimeter: 251.33」。没有圆时显示「No circle」。",
      "Add Circle 读取输入的半径。输入不是正数时，底部标签显示「Invalid radius」，不添加圆。"
    ],
    hints: ["「Shape 程序」：「Add 时从输入框读尺寸」和「面积/周长 Label」都选是，最小尺寸填 5。", "Add Circle 的区域选顶部，其余按钮放左侧。"],
    checks: ["Add (40) → 蓝色圆心 (150, 120)，标签 Area: 5026.55   Perimeter: 251.33", "Enlarge → r = 45；Shrink ×9 → r = 5，不再变小", "半径填 abc → Invalid radius；Clear → No circle"] },
  { id: "A2-3", group: "第一轮：A2 / Lab 3 变体", title: "A2-3 Shape Collection（ArrayList + 文本文件）", ...fromRound1("A2-3", "oop"),
    question: [
      "编写 Drawable、抽象类 Shape、CircleShape(double radius) 和 SquareShape(double side)。默认中心为 (100, 100)，颜色为绿色，默认半径为 30，默认边长为 60。用 ArrayList<Shape> 保存所有图形。",
      "编写 ShapeCollection，窗口标题为「Shape Collection - <你的全名>」。右侧 VBox 放置 Add Circle、Add Square、Move Right、Blue、Save、Load、Clear。Move Right 让最后添加的图形向右移动 30 像素。",
      "Save 写入 shapes.txt。每个图形占一行，依次记录类名、x、y、颜色和尺寸，用逗号分隔。Load 用从文件读取的图形替换当前图形。"
    ],
    hints: ["「Shape 程序」：图形保存方式选 ArrayList，按钮加 Save / Load。"],
    checks: ["Add Circle、Add Square、Move Right、Blue、Save → shapes.txt 两行", "Clear → 清空；Load → 两个图形回到原位置和颜色"] },
  { id: "L3-1", group: "第一轮：A2 / Lab 3 变体", title: "L3-1 Student Records（统计）", ...fromRound1("L3-1", "record"),
    question: [
      "编写 Student 和 StudentApp。Student 包含私有字段 id、name 和 double score，以及 getter 和 setter。主窗口标题为「Student Records」，数据文件为 students.txt。",
      "顶部显示「Name: <姓名>        Student ID: <学号>」和「Program Started: yyyy-MM-dd HH:mm:ss」，中间显示学生列表，下方提供 ID、Name、Score 输入框及 Clear。还需提供 Add、Delete、Search、Display All、Sort by Score、Statistics、Exit。",
      "出错时同时用 Alert 和消息标签显示对应文字：「Please enter ID, Name and Score.」「Duplicate ID: <id> already exists.」「Please enter a valid number for Score.」。",
      "Statistics 在消息标签显示人数、平均分、最高分和最低分，例如「Count: 3   Average: 71.50   Highest: 91.00   Lowest: 45.00」。启动时读取文件，每次成功修改后保存。"
    ],
    hints: ["「记录 + 文件」：字段 id / name / score（double），打开统计按钮并选 score。"],
    checks: ["加 S001 Amy 78.5、S002 Ben 91、S003 Chris 45 → Statistics 显示 Count: 3   Average: 71.50   Highest: 91.00   Lowest: 45.00",
      "Sort by Score → Chris、Amy、Ben", "Score 填 x → 数字错误；重复 S001 → Duplicate 错误", "重开程序 → 3 条记录读回"] },
  { id: "L3-2", group: "第一轮：A2 / Lab 3 变体", title: "L3-2 Inventory（数量按钮）", ...fromRound1("L3-2", "record"),
    question: [
      "编写 Product 和 InventoryApp。Product 的私有字段包括 code、name、int quantity 和 double price。窗口标题为「Inventory」，数据文件为 inventory.txt。列表格式示例为「P100 | Pen | Qty: 120 | $5.50」。",
      "提供 Add、Edit、Save、Delete、Search、Display All、Sell、Restock、Exit 按钮。Sell 把选中商品的库存减 1，库存为 0 时显示「Out of stock.」。",
      "Restock 把库存加 10，超过 999 时拒绝调整并显示「Stock limit reached.」。需要选中商品的操作在未选中时显示「Please select a product first.」。"
    ],
    hints: ["「记录 + 文件」→ 范例「Product + Sell/Restock」，再核对显示格式和提示文字。"],
    checks: ["加 P100 Pen 2 5.5 → 选中 → Sell ×2 → Qty: 0", "再 Sell → Out of stock.；Restock → Qty: 10", "文件里这一行是 P100,Pen,10,5.5"] },
  { id: "L3-3", group: "第一轮：A2 / Lab 3 变体", title: "L3-3 Library in a TextArea（题目给 Book.java）", ...fromRound1("L3-3", "record"),
    question: [
      "补全题给的 Book.java，不改动方法签名。toString() 的返回格式示例为「0131450913 | HTML How to Program | true」。",
      "编写 LibraryApp，标题为「Library」，数据文件为 books.txt。用不可编辑的 TextArea 显示所有书籍，每行显示一本书的 toString() 结果。",
      "提供 ISBN、Title 输入框和 Add、Delete、Search、Display All、Borrow、Return、Clear、Exit 按钮。Borrow、Return、Delete 根据输入框里的 ISBN 操作。",
      "出错时显示对应文字：「Please enter both ISBN and Title.」「Duplicate ISBN: <isbn> already exists.」「Book with ISBN <isbn> cannot be found.」「The selected book is not available.」「The selected book is already available.」。"
    ],
    hints: ["先在「骨架补全」补 Book.java（toString 用格式模板），再点「用这个记录类生成管理程序」。", "显示方式选 TextArea，输出方式「只输出主程序」。"],
    checks: ["加两本书 → TextArea 两行 toString 格式", "输入第一本 ISBN → Borrow → 行尾变 false；再 Borrow → not available 错误", "Return → true；未知 ISBN + Delete → cannot be found 错误"] },

  // ---------- round 2 ----------
  { id: "R2-Q1", group: "第二轮：键盘、鼠标、动画、控件", title: "Q1 Square Painter（给代码 + 方向键 + 鼠标）", ...fromRound2("Q1", "oop"),
    question: [
      "使用题给的 Drawable.java、Shape.java 和未完成的 JavaFXSquare.java。只补全 JavaFXSquare，不得改动 Drawable 和 Shape。displayInfo() 打印面积和周长。",
      "编写 PainterApp，标题为「Square Painter - <你的全名>」。顶部 HBox 放置 New Square、Blue、Green、Left、Right、Clear，中间放 500 × 300 的白色画布。",
      "New Square 在 (100, 100) 显示边长为 80 的红色正方形。LEFT、RIGHT 方向键与 Left、Right 按钮执行相同操作。",
      "点击画布时调用 setPosition，把正方形左上角移至鼠标位置。底部显示当前面积，例如「Area: 6400.00」，没有正方形时显示「No square」。"
    ],
    hints: ["「骨架补全」三个文件 → 生成主程序。", "「Shape 程序」→「键盘、鼠标、动画」：方向键选「调用对应的移动方法」，鼠标选「点击画布」；打开面积 Label。"],
    checks: ["New Square → 红色方块 (100, 100)，标签 Area: 6400.00", "→ 键 x = 125；← ← x = 75", "点画布 (200, 150) → 方块左上角移到那里", "Clear 后按 ← 不报错"] },
  { id: "R2-Q2", group: "第二轮：键盘、鼠标、动画、控件", title: "Q2 Moving Ball（Timeline）", ...fromRound2("Q2", "oop"),
    question: [
      "编写 Drawable、抽象类 Shape 和 Ball(double radius)。球的初始圆心为 (40, 100)，颜色为橙色，半径为 20。",
      "编写 BallApp，标题为「Moving Ball - <你的全名>」。底部放置 Add Ball、Start、Stop、Reset。",
      "Start 每隔 50 毫秒调用 moveRight() 并重绘，让球向右移动 5 像素。Stop 暂停。Reset 停止动画并在初始位置放置新球。"
    ],
    hints: ["「Shape 程序」按钮动作选「开始动画 / 暂停动画 / 停止并重新添加」，动画方向右、间隔 50。"],
    checks: ["Add Ball → 橙色球心 (40, 100)，半径 20", "Start 后球向右移动；Stop 后停住", "Reset → 回到 x = 40 且不再移动"] },
  { id: "R2-Q3", group: "第二轮：键盘、鼠标、动画、控件", title: "Q3 Contact Book（自定义按钮 + 手动保存）", ...fromRound2("Q3", "record"),
    question: [
      "编写 Contact 和 ContactApp。Contact 包含私有字段 name、phone、email 及 getter 和 setter。窗口标题为「Contact Book」，数据文件为 contacts.txt，以姓名为主键。",
      "提供 Name、Phone、Email 输入框及居中的联系人列表。按钮文字须为 Add Contact、Remove、Find、Show All、Save to File、Load from File、Quit。",
      "只有点击 Save to File 才写文件，只有点击 Load from File 才读文件。加载后在消息标签显示读入条数，例如「3 contact(s) loaded.」。另一个标签始终显示「Total contacts: N」。"
    ],
    hints: ["「记录 + 文件」：按钮文字逐个改；「什么时候读写文件」选「手动」；填「总数 Label」。"],
    checks: ["启动时 Total contacts: 0，不自动读文件", "加两条 → Save to File → 文件 2 行；再加一条不会写入文件", "重开 → Load from File → 2 contact(s) loaded.、Total contacts: 2"] },
  { id: "R2-Q4", group: "第二轮：键盘、鼠标、动画、控件", title: "Q4 Grade Book（给完整类 + 筛选 + 合计）", ...fromRound2("Q4", "record"),
    question: [
      "题给的 Student.java 已完整实现，包含构造器 Student(String id, String name, int mark) 和 getGrade()，不得修改。",
      "编写 GradeApp，标题为「Grade Book」，数据文件为 grades.txt。列表依次显示学号、姓名、分数、等级，例如「S001 Amy 78 B」。",
      "提供 Add、Delete、Display All、Pass List、Summary、Exit。Pass List 只显示分数至少为 50 的学生。Summary 在消息标签中显示人数、总分及平均分，例如「Count: 3   Total: 214   Average: 71.33」。"
    ],
    hints: ["「骨架补全」贴 Student.java → 「用这个记录类生成管理程序」。", "显示格式写 {id} {name} {mark} {getGrade()}；加筛选按钮 mark >= 50；统计格式加 {total}。"],
    checks: ["加 S001 Amy 78、S002 Ben 91、S003 Chris 45 → 列表 S001 Amy 78 B …", "Summary → Count: 3   Total: 214   Average: 71.33", "Pass List → 只剩 Amy、Ben；Display All → 3 条"] },
  { id: "R2-Q5", group: "第二轮：键盘、鼠标、动画、控件", title: "Q5 Traffic Light（RadioButton + CheckBox）", ...fromRound2("Q5", "blocks"),
    question: [
      "绘制一个深灰色圆角矩形和三个半径为 30 的圆，三个圆初始均为浅灰色。窗口标题为「Traffic Light - <你的全名>」。",
      "底部放置同一组单选按钮 Red、Yellow、Green。选中某个颜色时，对应圆点亮为该颜色，另外两个恢复浅灰色。",
      "提供复选框 Show frame，用于隐藏或显示圆角矩形。"
    ],
    hints: ["「积木工作台」：加 Pane、圆角 Rectangle、三个 Circle、三个 RadioButton、一个 CheckBox。", "每个 RadioButton 的点击事件里放三个「设置填充颜色」；CheckBox 用「如果 · 被选中」+「显示或隐藏」。"],
    checks: ["点 Red → 红灯亮，其余浅灰", "点 Green → 只有绿灯亮", "取消 Show frame → 外框消失；再勾选 → 出现"] },
  { id: "R2-Q6", group: "第二轮：键盘、鼠标、动画、控件", title: "Q6 BMI Calculator（按范围显示文字）", ...fromRound2("Q6", "calc"),
    question: [
      "提供 Weight (kg)、Height (m) 输入框和 Compute BMI 按钮。显示 BMI 数值及类别，例如「BMI: 22.86」。",
      "类别规则为小于 18.5 显示 Underweight，18.5 至小于 25 显示 Normal，25 至小于 30 显示 Overweight，30 及以上显示 Obese。输入无效时弹出错误 Alert。"
    ],
    hints: ["「表单计算器」→「④ 文字结果」：按 bmi 判断，范围写 18.5:Underweight, 25:Normal, 30:Overweight, Obese。"],
    checks: ["60 kg、1.70 m → BMI 20.76，Normal", "95 kg → 32.87，Obese", "体重填 abc → 错误 Alert"] },

  // ---------- extensions ----------
  { id: "X-shift", group: "拓展：条件、边界、文件格式", title: "Shift Mover（Shift + 方向键）", ...preset("blocks", "shift"),
    question: [
      "在 Pane 上放置一个蓝色圆，半径为 15，初始圆心为 (100, 100)。LEFT 向左移动 5 像素，RIGHT 向右移动 5 像素，SHIFT + RIGHT 向右移动 20 像素。",
      "圆心的 x 必须在 20 至 350 之间。越界时不移动并显示「Boundary reached」，移动成功则显示「X: <x>」。Reset 恢复圆和标签的初始状态。"
    ],
    hints: ["「积木工作台」→「如果 · 条件积木」的条件选「按住修饰键」→ Shift，两个分支各放一个「在边界内移动」。"],
    checks: ["→ 键 x 100 → 105；Shift + → 105 → 125", "一直按 → 到 350 停住并显示 Boundary reached", "Reset → 回到 100"] },
  { id: "X-radius", group: "拓展：条件、边界、文件格式", title: "Radius Field（Apply 与回车共用）", ...preset("blocks", "safeInput"),
    question: [
      "圆的初始半径为 25，输入框初始显示 25。输入框按 Enter 和点击 Apply 必须共用同一个事件处理器。",
      "输入是大于 0 的有限数字时更新半径，标签显示「Radius: <value>」。否则显示「Invalid radius」，圆保持原样。",
      "Reset 恢复圆、输入框和标签的初始状态。"
    ],
    hints: ["「积木工作台」：Apply 的点击事件选「两个控件共用 Handler」，搭档选输入框。", "「读取输入框里的有限数字」下限 0、不包含端点。"],
    checks: ["填 42 → Apply 或回车 → 半径 42", "abc、0、Infinity → Invalid radius，半径不变", "Reset → 25"] },
  { id: "X-wk8", group: "拓展：条件、边界、文件格式", title: "WK8 Practice（StackPane 居中按钮）",
    load: { view: "examples", example: "ButtonInPane", className: "Lesson01StackPane",
      parameters: { title: "EIE3320 - WK8 Practice 01", button: "EIE3320", width: "500", height: "300" } },
    question: [
      "编写 Lesson01StackPane。场景大小为 500 × 300，窗口标题为「EIE3320 - WK8 Practice 01」。",
      "使用 StackPane，在场景中央放置一个文字为 EIE3320 的按钮。"
    ],
    hints: ["「讲义例程库」搜 StackPane 或 ButtonInPane，在「无需改代码的参数」里填标题、按钮文字、宽高，类名改成 Lesson01StackPane。"],
    checks: ["窗口 500 × 300，按钮在正中", "把窗口拉大，按钮仍然居中"] },
  { id: "X-sized", group: "拓展：条件、边界、文件格式", title: "Rectangle Workshop（尺寸范围）", ...preset("oop", "sized"),
    question: [
      "提供 Width 和 Height 输入框，默认值分别为 40 和 25，并提供 Add Rectangle 按钮。",
      "宽度须在 10 至 120 之间，高度须在 10 至 90 之间。新增时输入越界，标签显示「Invalid size」，不添加矩形。",
      "Enlarge 和 Shrink 每次把宽高同时增减 5，调整后须仍在各自的范围内。标签显示「Area: <area>」，没有矩形时显示「No rectangle」。"
    ],
    hints: ["「Shape 程序」→「Add 时从输入框读尺寸」选是：「尺寸下限」填 10，「尺寸上限」填 120,90（宽、高不同就用逗号分开）。"],
    checks: ["40 × 25 → Area: 1000.00", "9 × 20 或 121 × 20 → Invalid size，不新增", "10 × 10 → 可以新增，Shrink 不再变小"] },
  { id: "X-and", group: "拓展：条件、边界、文件格式", title: "Book Search（AND 搜索）", ...preset("record", "andSearch"),
    question: [
      "实现 Lab 3 图书管理程序。Search 必须同时满足所有非空的搜索条件，匹配不区分大小写。",
      "两个框都有内容时，只显示 ISBN 包含 ISBN 搜索词且书名包含 Title 搜索词的图书。有一栏为空时忽略该栏，两栏都为空时提示错误。"
    ],
    hints: ["「记录 + 文件」→「填了多个搜索框时」选「所有条件成立（AND）」。"],
    checks: ["载入测试数据后只填 Title = jAvA → 两本", "ISBN = 00 且 Title = jAvA → 只有一本", "两栏都空 → 错误提示"] },
  { id: "X-stock", group: "拓展：条件、边界、文件格式", title: "Capped Stock（字段范围 0–5）",
    load: { view: "record", preset: "products", settings: {
      appClass: "CappedStock", file: "stock.txt", fLoadTest: "yes", testData: "P1,Pen,2,1.50",
      fieldPatch: { quantity: { min: "0", max: "5" } },
      adjusts: [
        { text: "Sell 2", field: "quantity", delta: "-2", min: "0", max: "", error: "Out of stock.", done: "Items sold." },
        { text: "Restock 3", field: "quantity", delta: "3", min: "", max: "5", error: "Stock limit reached.", done: "Items added." }] } },
    question: [
      "库存程序中的每项库存数量必须始终在 0 至 5 之间。",
      "Add、Edit、Sell 2、Restock 3 和数据文件中的数量都要按此限制校验。无效数量必须提示错误并拒绝保存。"
    ],
    hints: ["「记录 + 文件」→ 范例「Product + Sell/Restock」，在字段 Quantity 上填下限 0、上限 5，数量按钮改成 -2 / +3。"],
    checks: ["Sell 2：2 → 0；再 Sell → 错误", "Restock 3：0 → 3；再 Restock → 错误（会超过 5）", "Add 或 Edit 填 6 或 -1 → 错误，文件不变"] },
  { id: "X-semicolon", group: "拓展：条件、边界、文件格式", title: "Library File Format（分号 + 表头）", ...preset("record", "delimited"),
    question: [
      "在 Lab 3 图书程序中加入 int 字段 Copies，范围为 0 至 99。",
      "inventory.txt 用 UTF-8 编码，首行为「isbn;title;available;copies」，各列用分号分隔。标题可含逗号、分号或引号。含这些字符的字段用双引号包住，字段内部的每个双引号写成两个。",
      "某一行无法读取时报告该行行号，并保留原文件。"
    ],
    hints: ["「记录 + 文件」：「数据文件分隔符」选分号，「文件首行写字段名」选是，加字段 copies（int，0–99）。"],
    checks: ["保存后第一行是 isbn;title;available;copies", "标题带分号或引号 → 重开后原样读回", "把文件某行改坏 → 提示行号，原文件不被覆盖"] },
  { id: "X-grade", group: "拓展：条件、边界、文件格式", title: "Grade Calculator（分数转等级）", ...preset("calc", "grade"),
    question: [
      "提供 Mark 输入框和 Get Grade 按钮。只接受 0 至 100 的整数，其他输入弹出错误 Alert。",
      "显示等级。小于 50 为 F，50 至 64 为 C，65 至 79 为 B，80 及以上为 A。"
    ],
    hints: ["「表单计算器」：输入 mark 类型 int、范围 0–100；不要数字结果，只加一个文字结果。"],
    checks: ["49 → F；50 → C；79 → B；80 → A", "101、-1、abc → 错误 Alert"] },
  { id: "X-counter", group: "拓展：条件、边界、文件格式", title: "Click Counter（Label 计数）", ...preset("blocks", "counter"),
    question: [
      "窗口标题为「Click Counter - <你的全名>」。顶部标签初始显示「Count: 0」，底部放置 +1、-1、Reset。",
      "+1 和 -1 分别把标签中的计数加 1 和减 1。Reset 恢复为「Count: 0」。"
    ],
    hints: ["「积木工作台」→「Label 整数计数加减」，前缀填 Count: 。"],
    checks: ["+1 ×3 → Count: 3；-1 → Count: 2", "Reset → Count: 0"] },
  { id: "X-click", group: "拓展：条件、边界、文件格式", title: "Click Circle（左键 / 右键）", ...preset("blocks", "clickColor"),
    question: [
      "画布上有一个半径为 20 的圆。点击画布时把圆移到鼠标位置，左键将它变为红色，右键将它变为蓝色。",
      "底部标签显示点击位置。Reset 把圆移回初始位置。"
    ],
    hints: ["「积木工作台」：鼠标点击事件 →「移到鼠标位置」+「如果 · 按的是指定鼠标键」。"],
    checks: ["左键点 (120, 80) → 红色圆到那里", "右键点 → 蓝色", "Reset → 回原位"] },
  { id: "X-close", group: "拓展：条件、边界、文件格式", title: "Close Guard（阻止关窗）", ...preset("blocks", "closeGuard"),
    question: [
      "提供文字为「I have saved my work」的复选框。",
      "点击窗口关闭按钮时，已勾选才允许关闭。未勾选时保持窗口打开，标签显示「Please tick the box first」。"
    ],
    hints: ["「积木工作台」：事件选「点关闭按钮 CloseRequest」，未选中分支放「消耗事件 e.consume()」。"],
    checks: ["没勾选时点 × → 窗口不关，标签提示", "勾选后点 × → 窗口关闭，Terminal 打印 Window closed"] },
  // ---------- round 3: hand-written answers ----------
  { id: "R3-Q18", group: MANUAL, title: "Q18 Shape Interfaces（纯 Java OOP）", ...manual("round3", "Q18"),
    question: [
      "编写 Drawable.java、BaseShape.java、CircleShape.java、RectangleShape.java 和 ShapeTest.java 五个文件。这是纯 Java 题，无需图形界面。",
      "Drawable 接口声明 String describe()。BaseShape 保存私有字段 String name，并提供构造器和 getter。",
      "CircleShape（半径）和 RectangleShape（宽、高）均继承 BaseShape 并实现 Drawable。describe() 返回图形名称和保留两位小数的面积，例如「Circle: area = 12.57」。",
      "ShapeTest 在 ArrayList<Drawable> 中至少放入一个 CircleShape 和一个 RectangleShape，再循环调用每个对象的 describe()。"
    ],
    hints: ["builder 的生成器都输出 JavaFX 程序，这题要手写。「Shape 程序」生成的 Drawable / Shape 可以参考结构，但方法不同。",
      "子类构造器第一行 super(\"Circle\") 把名字交给父类；name 是 private，子类用 getName() 读。",
      "describe() 前加 @Override；面积用 String.format(\"%.2f\", area) 保留两位。",
      "ArrayList<Drawable> 里放子类对象，用 for-each 调用 describe()：同一句代码运行哪个类的方法由对象决定，这就是多态。"],
    checks: ["BlueJ 里右键 ShapeTest → void main(String[] args)：Terminal 输出 Circle: area = 12.57 和 Rectangle: area = 12.00",
      "BaseShape 的 name 是 private，子类里没有直接写 name",
      "CircleShape 和 RectangleShape 都是 extends BaseShape implements Drawable",
      "列表类型是 ArrayList<Drawable>，不是某个子类"] },
  { id: "R3-Q19", group: MANUAL, title: "Q19 Two Windows（第二个 Stage）", ...manual("round3", "Q19"),
    question: [
      "编写 TwoWindowApp。主窗口显示「Welcome」以及 Open Settings、Reset 按钮。",
      "Open Settings 打开第二个 Stage，标题为「Settings」，包含昵称输入框和 Save。昵称有效时，Save 将主窗口标签改为「Welcome, <nickname>」并关闭设置窗口。昵称为空时在设置窗口显示「Invalid name」，并保持该窗口打开。",
      "同时最多打开一个设置窗口。设置窗口打开时再次点击 Open Settings 不得新开窗口。Reset 把主窗口标签恢复为「Welcome」。"
    ],
    hints: ["「讲义例程库」的「两个窗口：再建一个 Stage」可以作起点，其余手写。",
      "把设置窗口存进字段 private Stage settingsStage；打开前判断 settingsStage != null && settingsStage.isShowing()，已经打开就 toFront() 然后 return。",
      "主窗口的 Label 也要是字段，第二个窗口的 Save 才能改它。",
      "Save 成功后调用 close() 关闭设置窗口；名字为空时只改设置窗口里的错误 Label。"],
    checks: ["点 Open Settings → 出现 Settings 窗口；再点一次 → 仍然只有一个",
      "不填直接 Save → 设置窗口显示 Invalid name，没有关闭",
      "填 Amy → Save → 设置窗口关闭，主窗口显示 Welcome, Amy",
      "Reset → Welcome；关掉设置窗口后还能再打开"] },
  { id: "R3-Q20", group: MANUAL, title: "Q20 FlowPane Tags（运行时新建 Label）", ...manual("round3", "Q20"),
    question: [
      "编写 FlowTagsApp。FlowPane 初始显示 Java、Python、C++ 三个标签，下方放置一个输入框和 Add、Clear 按钮。",
      "Add 用输入的文字新建 Label 并加入 FlowPane。输入为空时，状态标签显示「Invalid input」。Clear 只移除用户添加的标签，保留最初三个。",
      "每个标签都须有内边距和背景色。不要手动设置坐标，由 FlowPane 自动换行。"
    ],
    hints: ["「讲义例程库」的「FlowPane：自动换行排列」可以作起点；运行时新建控件这部分 builder 不能生成。",
      "用 ArrayList<Label> 记住用户添加的 Label；Clear 时 getChildren().removeAll(这个列表)，再把列表清空。",
      "写一个 makeTag(String) 方法统一设置 setPadding(new Insets(...)) 和 setStyle(\"-fx-background-color: ...\")。",
      "new FlowPane(8, 8) 设置间距，setPrefWrapLength(...) 决定大约多宽换行。"],
    checks: ["启动 → Java、Python、C++ 三个标签，带背景色",
      "输入 Go → Add → 多一个 Go 标签；多加几个会自动换行",
      "空输入 Add → Invalid input",
      "Clear → 只剩最初三个标签"] },
  { id: "R3-Q22", group: MANUAL, title: "Q22 Book + Library 类（Library 手写）", ...manual("round3", "Q22"),
    ...preset("record", "lab3", { output: "split", displayFormat: "{isbn} - {title} [{available|Available|Borrowed}]" }),
    question: [
      "编写 Book.java。包含私有字段 String isbn、String title 和 boolean available，提供构造器、getter 和所需的 setter。toString() 返回类似「001 - Java Basics [Available]」或「001 - Java Basics [Borrowed]」的文字。",
      "编写 Library.java，用 ArrayList<Book> 保存书籍。addBook() 拒绝重复 ISBN，findBook() 在找不到 ISBN 时返回 null。borrowBook() 和 returnBook() 成功返回 true，失败返回 false。"
    ],
    hints: ["Book.java 可以用「记录 + 文件」生成：载入参考设置后看 Book.java（显示格式 {isbn} - {title} [{available|Available|Borrowed}]）。",
      "Library.java 要手写：builder 把列表和操作都写在主程序里。",
      "findBook 用 for-each 比较 getIsbn().equals(isbn)，找不到 return null；其余方法都先调用 findBook。",
      "borrowBook：找不到或已借出 → return false；否则 setAvailable(false) 再 return true。returnBook 反过来。"],
    checks: ["new Book(\"001\", \"Java Basics\") 的 toString() → 001 - Java Basics [Available]",
      "同一个 ISBN 加两次 → 第二次 addBook 返回 false",
      "borrowBook(\"001\") 两次 → true、false；returnBook 两次 → true、false",
      "findBook(\"999\") → null；不存在的 ISBN 借、还都返回 false"] },
  { id: "R3-Q23", group: MANUAL, title: "Q23 Notes（ArrayList<String> + notes.txt）", ...manual("round3", "Q23"),
    question: [
      "编写 NotesApp，窗口标题为「Notes Manager」。须有一个笔记输入框、显示全部笔记的 TextArea 和 Add、Save、Load、Clear 按钮，用 ArrayList<String> 保存笔记。",
      "Add 追加非空笔记并刷新 TextArea，输入为空则显示「Empty note」。Save 覆盖写入 notes.txt，每条笔记一行。Load 用文件里的笔记替换当前列表。",
      "Clear 清空列表及 TextArea，保留磁盘文件。文件不存在时点击 Load 显示「File not found」，程序继续运行。用 try-catch 处理文件异常。"
    ],
    hints: ["「记录 + 文件」能生成相似的程序，但数据总是 ArrayList<记录类>（这里会是 ArrayList<Note>），题目要 ArrayList<String>，照参考答案手写更直接。",
      "Save：用 Files.newBufferedWriter(...) 逐条写入，每条用 newLine() 换行，捕获 IOException。",
      "Load：先 new File(\"notes.txt\").exists()；用 Scanner 逐行读进一个新列表，读完再替换 notes。",
      "TextArea：setEditable(false)，显示用 String.join(\"\\n\", notes)。"],
    checks: ["Add 两条 → Save → notes.txt 两行",
      "Clear → TextArea 清空，notes.txt 不变",
      "Load → 两条笔记回来",
      "删掉 notes.txt 再 Load → File not found，程序不崩溃；空输入 Add → Empty note"] },
  { id: "R3-Q24", group: MANUAL, title: "Q24 LibraryFileManager（静态 save / load）", ...manual("round3", "Q24"),
    question: [
      "题给 Book.java，包含 isbn、title、available 及 getter 和 setter。编写 LibraryFileManager.java，并提供以下两个静态方法。",
      "public static void save(ArrayList<Book> books, String filename) throws IOException：覆盖写入文件，每本书一行，格式为「001,Java Basics,true」。",
      "public static ArrayList<Book> load(String filename) throws IOException：逐行读取，用 split(\",\") 和 Boolean.parseBoolean() 解析，并用构造器创建 Book。文件不存在时返回空列表。打开的文件均须关闭。"
    ],
    hints: ["「骨架补全」认不出这两个方法，要手写。",
      "用 try-with-resources 和 Files.newBufferedWriter(Path.of(filename))，结束时自动关闭文件，写入失败会抛出 IOException。",
      "load 先 new File(filename).exists()，不存在就 return new ArrayList<>()；Scanner 逐行 nextLine().trim()，空行跳过。",
      "一行不是 3 列时 throw new IOException(...)，比悄悄跳过更容易发现坏数据。"],
    checks: ["save 两本书 → 文件两行：001,Java Basics,true 和 002,Python Intro,false",
      "load 同一个文件 → 两本书，借阅状态一致",
      "只 save 一本 → 文件只剩一行（覆盖旧内容）",
      "load 一个不存在的文件 → 空列表，不抛异常"] },
  { id: "R3-Q26", group: MANUAL, title: "Q26 Library 查找 / 搜索 / 删除", ...manual("round3", "Q26"),
    question: [
      "题给的 Library.java 含有 private ArrayList<Book> books。补全三个方法。",
      "public Book findByIsbn(String isbn)：精确匹配 ISBN，找不到返回 null。",
      "public ArrayList<Book> searchByTitle(String keyword)：返回书名包含关键词的书籍，不区分大小写。关键词为空时返回空列表，搜索不改变 books。",
      "public boolean deleteBook(String isbn)：删除指定 ISBN 的书，找不到时返回 false。",
      "验收示例：搜索「java」找到「Java Basics」和「Advanced Java」。对同一个存在的 ISBN 连续删除两次，依次返回 true、false。"
    ],
    hints: ["「骨架补全」不认识这三个方法（显示「未识别的方法，请手写」），按参考答案补。",
      "不分大小写的部分匹配：book.getTitle().toLowerCase().contains(keyword.toLowerCase())。",
      "searchByTitle 返回一个新的 ArrayList，只往新列表里 add，不改 books。",
      "deleteBook 先调用 findByIsbn：找不到 return false；找到就 books.remove(book) 再 return true。"],
    checks: ["searchByTitle(\"java\") → Java Basics、Advanced Java",
      "searchByTitle(\"\") 或只有空格 → 空列表；搜索后 books 数量不变",
      "findByIsbn(\"02\") → null（必须完全相同）",
      "deleteBook 同一个 ISBN 两次 → true、false"] },
  { id: "R3-Q29", group: MANUAL, title: "Q29 Mini Library（Book + Library + GUI）", ...manual("round3", "Q29"),
    ...preset("record", "lab3", { appClass: "MiniLibraryApp", title: "Mini Library", output: "split", display: "textarea", fEdit: "no", fSearch: "no",
      fDisplay: "no", fLoadTest: "no", fExit: "no", fSort: "no", fClear: "no", saveMode: "manual", loadOnStart: "yes", tSaveFile: "Save", tLoadFile: "Load" }),
    question: [
      "编写 Book.java、Library.java 和 MiniLibraryApp.java。Book 私有保存 ISBN、书名和可借状态。Library 用 ArrayList<Book> 保存书籍，并提供新增、删除、借出、归还操作。",
      "界面须有 ISBN、Title 输入框和 Add、Delete、Borrow、Return、Load、Save 按钮。用列表或文本区域显示所有图书，不使用 TableView。",
      "Add 拒绝空值及重复 ISBN。Delete、Borrow、Return 按输入的 ISBN 操作，操作无效时须拒绝。修改成功后刷新显示，操作失败时保留已有数据。",
      "启动时读取 books.txt，文件不存在时从空列表开始。Save 写入格式为「001,Java Basics,true」的记录。新增、借出、保存并重启后再 Load，图书仍须保持借出状态。"
    ],
    hints: ["「记录 + 文件」能生成 Book.java 和带这些按钮的主程序（载入参考设置看），但列表和操作都写在主程序里，没有 Library.java。",
      "按参考答案把 ArrayList<Book>、增删借还和读写文件搬进 Library；主程序只读输入框、调用 Library、显示结果。",
      "Library 的方法返回 boolean，主程序据此显示成功或失败的提示，只在成功时刷新列表。",
      "start() 最后调用一次 loadBooks()；loadFromFile 先把文件读进新列表，读完再替换，坏文件不会破坏现有数据。"],
    checks: ["第一次运行（没有 books.txt）→ 空列表，不报错",
      "Add 001 Java Basics、002 Python Intro；再 Add 001 → Duplicate ISBN",
      "Borrow 001 → 列表显示 [Borrowed]；Delete 002 → 消失；Save → books.txt 一行 001,Java Basics,false",
      "关闭再运行 → 启动时就显示 001 [Borrowed]；Load 结果相同"] },
  { id: "R4-Q07", group: ROUND4_MANUAL, title: "Q07 Runtime Tag Board（动态 FlowPane）", ...manual("round4", "Q07"),
    load: { view: "examples", example: "ShowFlowPane", className: "TagBoard" },
    question: [
      "编写 TagBoard.java。用 FlowPane 显示标签，启动时须有至少一个标签和一个输入框。",
      "提供 Add 按钮。每次点击都用输入的文字新建并追加一个 Label。即使已有同名标签，也须再追加一个。"
    ],
    hints: ["「讲义例程库」的 FlowPane 例程可参考静态布局。", "手写 Add 的事件处理，每次执行时新建 Label，再调用 tags.getChildren().add(...)。"],
    checks: ["启动后看得到初始标签、输入框和 Add。", "输入 Revision 并连续点两次 Add，FlowPane 中会出现两个 Revision 标签。"] },
  { id: "R4-Q30", group: ROUND4_MANUAL, title: "Q30 Book Editing with Cancel（取消编辑）", ...manual("round4", "Q30"),
    ...preset("record", "lab3", { appClass: "EditDesk", file: "edit-books.txt" }),
    question: [
      "编写 EditDesk.java。图书编辑界面须使用 ListView。选中已有记录时，把记录内容填入表单；通过 Edit 和 Save 修改记录并写入文件。",
      "须有独立的 Cancel 按钮。点击它须丢弃尚未保存的表单修改、恢复该行已保存的内容，并且不写入文件。"
    ],
    hints: ["「记录 + 文件」可生成选择、编辑和保存流程。", "手写独立 Cancel，仅恢复表单及按钮状态。Edit 期间让输入留在表单，Save 成功后再更新记录。"],
    checks: ["选中 E1 Original，Edit 后修改标题并 Save，重新启动仍显示已保存的标题。", "再 Edit 并修改标题，然后 Cancel，原行与表单恢复已保存的标题，数据文件不变。"] }
];

const header = `/*
 * Practice catalogue for the "变体题练习" page. GENERATED by tools/make-variants.mjs from
 * tests/exam-variants (settings and given files) - edit that script, not this file.
 */
"use strict";

const Variants = `;
const text = header + "{\n  items: [\n" + items.map(item => "    " + JSON.stringify(item)).join(",\n") + "\n  ]\n};\n";
const target = path.join(root, "src", "core", "variants.js");
if (process.argv.includes("--check")) {
  // Used by the tests: fail when the catalogue no longer matches tests/exam-variants or this script.
  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8").replace(/\r\n/g, "\n") : "";
  if (current !== text) { console.log("variants.js is out of date"); process.exit(1); }
  console.log("variants.js is up to date");
} else {
  fs.writeFileSync(target, text);
  console.log("wrote src/core/variants.js with " + items.length + " questions");
}

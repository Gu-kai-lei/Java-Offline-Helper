# Mock practical paper, round 3（30 题，只用 builder 作答）

第三轮 30 道实操模拟题，覆盖 Lecture 7–8、Assignment 2 和 Lab 3：布局与绑定、Image、Shape、命名 / 匿名 / 共享 Handler、键盘、鼠标、窗口事件、Timeline、表单验证、Alert、多窗口、FlowPane、OOP、ArrayList 和文本文件。

作答规则：只操作 builder 页面（[`dist/JavaFX-Offline-Builder.html`](../../../dist/JavaFX-Offline-Builder.html)），不手写 Java，也不打开「显示进阶 Java 积木」。`run_round3.mjs` 用 Playwright 按 [questions.mjs](questions.mjs) 里的步骤真实点击页面，把页面生成的代码存进 [answers/](answers/)，再用 javac 和 FxSmoke 运行每道题的测试步骤。逐题的操作顺序和验收结果在 **[LOG.md](LOG.md)**。

## 结果（builder v2.2）

| 结果 | 题号 |
| --- | --- |
| ✅ 全部要求都满足（22 题） | Q1–Q17、Q21、Q25、Q27、Q28、Q30 |
| 🟡 部分满足（3 题） | Q22、Q23、Q29 |
| ❌ 没有可用的页面（5 题） | Q18、Q19、Q20、Q24、Q26 |

25 份答案全部编译通过；有运行验收的 24 题，每个检查项的结果都和 `questions.mjs` 里标注的一致（Q23、Q29 各有一项标为“builder 做不到”，运行结果也确实不通过）。

### 和 v2.1 比较

同一份题目，v2.1 是 2 题全部满足、18 题部分满足、10 题没有可用的页面。下表是页面操作步数（`questions.mjs` 的 `v21` 字段记录 v2.1 的结果和步数）：

| 题号 | v2.1 | v2.2 | 说明 |
| --- | --- | --- | --- |
| Q3 | 🟡 36 步 | ✅ 25 步 | 圆心属性绑定（bind）；「半径改变后仍在范围内」 |
| Q6 | 🟡 26 步 | ✅ 22 步 | 自定义 Handler 类名、构造器传入对象 |
| Q7 | 🟡 42 步 | ✅ 28 步 | 组合文字 Position: ({c.x}, {c.y})；⧉ 复制整块判断 |
| Q8 | 🟡 34 步 | ✅ 24 步 | 半径上限积木 |
| Q9 | 🟡 48 步 | ✅ 34 步 | 释放时显示圆心 |
| Q10 | ✅ 47 步 | ✅ 37 步 | int 变量计数；添加控件时直接填变量名和文字 |
| Q12 | 🟡 20 步 | ✅ 4 步 | 范例「关窗锁定：布尔变量 + Unlock 按钮」 |
| Q15 | 🟡 44 步 | ✅ 36 步 | 「输入框是空的」条件、整数 int 读取 |
| Q30 | 🟡 36 步 | ✅ 25 步 | 半径上限积木 |
| Q1、Q5、Q11、Q14、Q21、Q25、Q27 | 🟡 | ✅ | 步数相近或更多，因为多做了原来做不到的要求（坐标边界、旋转、三个按钮共用 Handler、Timeline 自动停止、按输入的 ISBN 借还、初始记录） |
| Q4、Q13、Q16、Q17、Q28 | ❌ | ✅ | 新功能：ImageView、Timeline 控件、Alert / CONFIRMATION、Color.rgb、String 变量 |

减少步数的改动：添加控件时一次填好类型、变量名和文字；添加事件时同时选注册对象；新积木先选当前事件已经用到的对象（显示文字的积木优先选 Label）；积木和事件都能复制；新增三个积木范例（半径上下限、Timeline 计时器、关窗锁定）。

### 还做不到的要求

这些题已经放进 builder 的「变体题练习」，组名「第三轮：builder 做不到、要手写的题」（Q18、Q19、Q20、Q22、Q23、Q24、Q26、Q29）。每题有中文题目、提示、核对清单和手写参考答案；参考答案在 [manual/](manual/)，由 `run_builder_tests.mjs --jdk --run` 编译并运行验收（Q22、Q24、Q26 用 [manual-checks/](manual-checks/) 里不给考生看的检查程序）。

- **纯 Java OOP**（Q18）：所有生成器都输出 JavaFX 程序，「Shape 程序」的接口和父类是 draw(Pane) 结构。
- **第二个 Stage**（Q19）和**运行时往 FlowPane 加节点**（Q20）：v2.2 的积木只生成一个窗口，控件只能放在 BorderPane 的四个区域。v2.3 新增「打开新窗口」「往区域里添加控件」「清空区域」积木，以及每个区域可选 FlowPane 等容器（范例「FlowPane 运行时添加标签 + 第二个窗口」），可以做出这两题的主要部分；这一轮的逐题评分尚未用 `run_round3.mjs` 按新功能重新记录。
- **单独的 Library / FileManager 类**（Q22、Q24、Q26、Q29）：「记录 + 文件」把列表和操作写在主程序里；「骨架补全」不认识这几个方法。
- **`ArrayList<String>`**（Q23）：记录生成器总是 `ArrayList<记录类>`。
- Q30 是重新生成一份满足全部行为要求的 DebugApp.java，不是在给出的错误代码上逐处修改。
- TableView（Lab 3 题单）和 GridPane（Lecture 7 讲义）课程里都出现过，builder 不生成这两种。

## 运行

需要 Node 18+、Playwright（`require("playwright")` 能找到 Chromium）；编译和运行还需要 JDK 17+ 和 OpenJFX jar（与 `run_builder_tests.mjs` 相同）。

在 `JavaFX-Offline-Builder/` 目录中运行。

```bash
node tests/exam-variants/round3/run_round3.mjs                                # 操作页面，保存 answers/ 和 LOG.md
node tests/exam-variants/round3/run_round3.mjs --jdk --fx <javafx-lib>        # 另外编译每份答案
node tests/exam-variants/round3/run_round3.mjs --jdk --run --fx <javafx-lib>  # 另外用 FxSmoke 运行验收（需要桌面或 xvfb-run）
node tests/exam-variants/round3/run_round3.mjs --check                        # 页面输出与 answers/ 不一致时失败
```

退出码：页面操作失败、编译失败，或者任一验收项的结果与 `questions.mjs` 里标注的不同（包括“本以为做不到却通过了”），都返回 1。补上 builder 功能后，把对应检查项的 `expected` 改为 `true`，再重新生成 answers/ 和 LOG.md。

运行验收用到 [`tests/FxSmoke.java`](../../FxSmoke.java) 新增的步骤：`hit:`（对画布上某点最上层的图形发送鼠标按下 / 松开 / 拖动 / 点击 / 进入 / 离开）、`resize:`、`closecheck`（直接调用关窗处理器，记录是否 consume）、`try-click:`（按钮不存在时记录下来，不中断）、`answer:OK|CANCEL`（之后弹出的对话框点哪个按钮）、`window:标题`（切换测试窗口，`window:main` 回到主窗口）。快照另外记录旋转角度、椭圆半径、画布尺寸、ImageView（角度、显示宽度、是否加载失败）和设置了 setStyle 的 Label。`questions.mjs` 里一次启动可以带 `files`（例如 Q4 先把 `fixtures/logo.png` 放进 `images/`），`fresh: true` 表示换一个空文件夹启动。

---

## 题目

### Mock Examination 01

**Q1. Interactive Circle Application — 60 marks**
编写完整的 CircleApp.java，继承 JavaFX Application，创建一个 500 × 400 的 GUI，窗口标题为 Circle Controller。GUI 必须有一个 Pane、一个状态 Label 和六个按钮：Add Circle、Clear、Red、Blue、Move Up、Move Down。
1. Add Circle：创建绿色圆，圆心 (200,150)，半径 30。重复添加时替换旧圆。
2. Clear：移除当前圆，允许重复点击。
3. Red / Blue：改变当前圆的颜色。
4. Move Up / Down：每次使 centerY 减少或增加 15。
5. 圆心 Y 必须在 [30,270] 内；超出时显示 Boundary reached，不移动。
6. 如果没有圆，颜色及移动按钮显示 No circle available，不发生异常。

评分：Application 10、布局 10、Add/Clear 15、颜色 10、移动与边界 10、错误处理 5。测试：Add → Red → Up → Clear → Down，最后一步必须显示 No circle available。

**Q2. Safe Radius Controller — 40 marks**
已给出：

```java
Circle c = new Circle(100, 100, 30);
TextField radiusInput = new TextField("30");
Label statusLabel = new Label("Radius: 30");
Button applyBtn = new Button("Apply");
Button resetBtn = new Button("Reset");
```

编写完整的事件处理部分。Apply 将 TextField 转换为 double；只允许 [5,80]；成功后修改半径并更新 Label；范围错误或非数字显示 Invalid radius，不修改半径；Reset 恢复圆半径 30、输入框 "30" 和 Label "Radius: 30"。
评分：事件注册 8、转换 8、边界判断 10、异常处理 8、Reset 6。测试：50、-5、abc、Reset。

### Mock Examination 02 — Layout and Binding

**Q3. Responsive Circle Window — 60 marks**
编写 ResponsiveCircleApp.java，创建可调整大小的 JavaFX 窗口。
1. 使用 BorderPane 作为根容器，中央放置 Pane canvas。
2. 底部使用 HBox 放置 Grow、Shrink、Reset 按钮。
3. 使用 Property Binding，让 Circle 的 centerX、centerY 始终跟随 Canvas 的中心。
4. 圆初始半径 30，颜色为蓝色。
5. Grow 每次半径 +10；Shrink 每次 -10，最低半径为 10；Reset 恢复半径 30。
6. 窗口改变尺寸后，Circle 必须仍然位于 Canvas 中心，不可以靠手动重算。

评分：Application/布局 15、Property Binding 20、按钮功能 15、边界与 Reset 10。测试：放大窗口 → Circle 仍居中 → Grow 两次 → Shrink 三次 → Reset。

**Q4. Image and Style Viewer — 40 marks**
已提供本地文件 images/logo.png，编写一个 JavaFX 图片展示界面，不使用任何网络图片：使用 Image 和 ImageView 显示图片；显示宽度 200，保持原始宽高比例；使用 VBox 放置图片、Label 和两个按钮；Rotate 每次让图片旋转 90°；Style 将 Label 改为红色、20px 字体；图片加载失败时 GUI 显示 Image unavailable，程序仍可启动。
评分：Image/ImageView 12、布局 8、旋转 8、CSS/Font 7、错误处理 5。测试：Rotate 四次后图片角度应回到原始方向。

### Mock Examination 03 — Shapes and EventHandler

**Q5. Shape Selection Application — 60 marks**
GUI 包含 Circle、Rectangle、Ellipse、Clear、Rotate 五个按钮以及一个用于绘图的 Pane。
1. 点击 Circle，在中央显示蓝色圆。 2. 点击 Rectangle，显示红色矩形。 3. 点击 Ellipse，显示绿色椭圆。
4. 每次只允许画布上存在一个图形，新图形替换旧图形。 5. Rotate 每次将当前图形旋转 45°。
6. Clear 删除图形；没有图形时点击 Rotate 显示 No shape selected。 7. Label 显示当前图形名称和旋转角度。

尺寸：Circle 半径 35；Rectangle 宽 100、高 60；Ellipse 半径 X=60、Y=30。评分：GUI 10、三种 Shape 20、替换及 Clear 10、旋转 10、错误处理与 Label 10。测试：Rectangle → Rotate 两次 → Circle → Rotate → Clear。

**Q6. Named EventHandler Class — 40 marks**
禁止使用 Lambda，必须通过一个命名 Handler 类完成按钮事件。已给：`Circle c = new Circle(100, 100, 30);`、`Label label = new Label("Radius: 30");`、`Button growBtn = new Button("Grow");`。
创建 GrowHandler 类，实现 `EventHandler<ActionEvent>`；正确重写 `handle(ActionEvent e)`；通过构造器取得需要操作的 Circle 和 Label；点击 Grow 时半径增加 5；最大半径为 60，到达上限显示 Maximum radius reached；在主程序中创建 Handler 对象并注册给按钮。
评分：接口实现 10、构造器与字段 10、handle 逻辑 12、事件注册 8。测试：连续点击 Grow 八次，半径最终应保持 60。

### Mock Examination 04 — Keyboard and Inner Class

**Q7. Keyboard-Controlled Player — 60 marks**
编写完整 JavaFX 程序 KeyboardGame.java。初始 Circle 中心 (150,120)，半径 15。LEFT：X −10；RIGHT：X +10；UP：Y −10；DOWN：Y +10。圆心 X 只能处于 [20,280]，Y 只能处于 [20,180]；越界时保持坐标并显示 Boundary reached；Label 在成功移动后显示 Position: (X, Y)；Reset 恢复初始圆心及 Label；其他按键不改变状态。必须使用 `scene.setOnKeyPressed()`。
评分：GUI 10、KeyEvent 10、四方向操作 20、边界判断 15、Reset 5。测试：RIGHT ×3 → UP ×2 → LEFT → Reset。

**Q8. Anonymous Inner Class — 40 marks**
使用匿名内部类，而不是 Lambda，注册按钮事件。已给：`Circle c = new Circle(100, 100, 30);`、`Button increaseBtn = new Button("Increase");`、`Button resetBtn = new Button("Reset");`、`Label radiusLabel = new Label("Radius: 30");`。
1. 使用 `new EventHandler<ActionEvent>() { ... }` 为两个按钮分别注册 Handler。 2. 必须有 @Override 和 `handle(ActionEvent e)`。 3. Increase 每次半径 +10，最大半径 80。 4. 超过上限时显示 Maximum radius reached。 5. Reset 恢复半径 30 和初始 Label。
评分：匿名类语法 15、Increase 10、边界 8、Reset 7。测试：Increase 连续六次 → Reset。

### Mock Examination 05 — Mouse Events

**Q9. Interactive Mouse Drawing — 60 marks**
Canvas 320 × 220，初始圆心 (100,100)，半径 15，蓝色。
1. 鼠标在 Canvas 上按下时，圆变黄色，Label 显示 Dragging。 2. 按住鼠标并拖动时，圆跟随鼠标。 3. 只有 X 在 [15,305]、Y 在 [15,205] 时才允许更新圆心。 4. 鼠标释放时，圆变绿色，Label 显示当前圆心坐标。 5. 越界拖动时 Circle 不移动，Label 显示 Outside canvas。 6. Reset 恢复圆心、蓝色和初始 Label Ready。
要求使用 MousePressed、MouseDragged、MouseReleased 三种事件。评分：GUI 10、三种事件 15、拖动坐标 15、边界 10、颜色/Label/Reset 10。测试：Press → Drag(200,100) → Drag(320,200) → Release → Reset。

**Q10. Mouse Entered, Exited and Click Counter — 40 marks**
已给 Circle c、Label statusLabel、Label countLabel 和 Reset 按钮。鼠标进入 Circle：变绿色，显示 Mouse inside；离开：变蓝色，显示 Mouse outside；点击 Circle：计数 +1，countLabel 显示 Clicks: N；Reset：计数归零，圆恢复蓝色，两个 Label 恢复 Ready 与 Clicks: 0；计数必须在不同的事件调用之间保留。
评分：Entered/Exited 12、MouseClicked 8、计数状态管理 10、Reset 10。测试：Enter → Click 三次 → Exit → Reset。

### Mock Examination 06 — Shared Handler and Window Events

**Q11. Shared EventHandler Calculator — 60 marks**
创建 CircleCalculatorApp.java：一个 Circle（初始半径 30）、两个 Label，以及 +5、-5、Double、Reset 四个按钮。
1. 必须创建一个共享的 `EventHandler<ActionEvent>`，负责处理前三个按钮。 2. 使用 `e.getSource()` 判断哪个按钮触发事件。 3. +5 使半径增加 5，-5 使半径减少 5，Double 使半径乘以 2。 4. 半径必须保持在 [5,100]；超出时不修改半径，显示 Invalid radius。 5. 显示当前半径和最后一次执行的操作。 6. Reset 恢复半径 30，两个 Label 恢复初始状态。
评分：GUI 10、Shared Handler 注册 15、getSource() 10、计算 10、边界 10、Reset 5。测试：+5 → Double → -5 → Reset。

**Q12. Window Close Request — 40 marks**
已创建：`Stage stage;`、`Label statusLabel = new Label("Window locked");`、`Button unlockBtn = new Button("Unlock");`。初始禁止关闭窗口；点击右上角关闭按钮时，如果仍处于锁定状态，必须调用 `e.consume()`，显示 Closing is not allowed；点击 Unlock 后状态改为 Window unlocked；再次关闭时允许正常关闭。必须使用 `stage.setOnCloseRequest()`。
评分：CloseRequest 注册 10、consume() 10、状态变量 10、解锁与关闭逻辑 10。

### Mock Examination 07 — Timeline and Animation

**Q13. JavaFX Stopwatch — 60 marks**
初始界面：Label Time: 0；Start、Pause、Reset 三个按钮。1. 使用 Timeline 和 KeyFrame。 2. 每隔一秒计数增加 1。 3. Start 开始或恢复计时。 4. Pause 暂停，保持当前数值。 5. Reset 停止计时并恢复 Time: 0。 6. Timeline 必须支持持续运行。 7. 重复点击 Start 不能使计时速度加倍。
评分：GUI 10、Timeline/KeyFrame 20、Start 10、Pause 8、Reset 7、重复启动处理 5。测试：Start → 约 3 秒 → Pause → Start → Reset。

**Q14. Automatic Circle Movement — 40 marks**
已提供 Circle、Start、Stop、Reset 按钮。初始 centerX = 50；Start 后用 Timeline 每隔 200 ms 将 X 增加 5；X 到达 280 时自动停止；Stop 暂停移动；Reset 停止 Timeline 并将 X 恢复为 50；禁止出现 X 大于 280 的情况。
评分：Timeline 创建 12、移动计算 8、自动停止 10、Stop/Reset 10。

### Mock Examination 08 — Form Validation

**Q15. Student Registration Form — 60 marks**
两个 TextField（nameInput、ageInput），Register、Clear 两个按钮和一个 statusLabel。
1. Name 不能为空或只有空格。 2. Age 必须为整数。 3. Age 范围 [10,100]。 4. 使用 `Integer.parseInt()` 和 try-catch。 5. 有效时 Label 显示 Registered: <name>, Age: <age>。 6. Name 无效显示 Invalid name。 7. Age 非整数或超出范围显示 Invalid age。 8. Clear 清空两个输入框，Label 恢复 Ready。 9. 在 Age 输入框按 Enter 时，执行与 Register 相同的注册逻辑。
评分：GUI 10、Name 判断 10、Age 转换与判断 15、异常处理 10、两个事件入口 10、Clear 5。测试：John/20 → Registered；空白/20 → Invalid name；John/abc → Invalid age；John/-5 → Invalid age。

**Q16. JavaFX Alert and Confirmation — 40 marks**
Label Item available，Delete、Reset 两个按钮。1. Delete 弹出 `Alert.AlertType.CONFIRMATION`。 2. 内容为 Are you sure you want to delete?。 3. 用户确认时 Label 改为 Item deleted。 4. 取消或关闭对话框时 Label 不变。 5. 已删除后再 Delete，弹出 INFORMATION Alert：No item to delete。 6. Reset 恢复初始状态。
评分：Alert 创建 10、处理确认结果 15、重复删除 10、Reset 5。

### Mock Examination 09 — JavaFX Properties and OOP

**Q17. RGB Colour Controller — 60 marks**
Pane 中显示初始蓝色 Circle；三个 TextField（Red、Green、Blue）及 Apply、Reset 按钮。三个值必须是 0–255 的整数；用 `Color.rgb(r, g, b)` 修改填充颜色；无效时 Label 显示 Invalid RGB values，颜色不变；有效时显示 RGB: (r, g, b)；Reset 恢复蓝色、输入框 0、0、255，Label 恢复 Ready；必须处理 NumberFormatException。
评分：GUI 10、颜色输入与转换 15、范围判断 10、颜色修改 10、异常处理 10、Reset 5。测试：(255,0,0)、(256,0,0)、(abc,0,0)、Reset。

**Q18. Interface, Inheritance and Polymorphism — 40 marks**
文件：Drawable.java、BaseShape.java、CircleShape.java、RectangleShape.java、ShapeTest.java。Drawable 是接口，声明 `String describe()`；BaseShape 保存 private String name，提供构造器和 Getter；CircleShape / RectangleShape 继承 BaseShape 并实现 Drawable，分别保存 radius 与 width、height，重写 describe() 返回名称及面积；ShapeTest 用 `ArrayList<Drawable>` 保存至少一个 CircleShape 和一个 RectangleShape，循环调用 describe()。
评分：Interface 8、构造器与继承 12、Override 10、ArrayList 多态调用 10。

### Mock Examination 10 — Stages, Scene and Layout

**Q19. Multiple Window Application — 60 marks**
TwoWindowApp.java：主窗口 Label Welcome、Button Open Settings、Button Reset。Open Settings 弹出第二个 Stage：TextField 输入昵称；Save 把主窗口 Label 改为 Welcome, <nickname>；昵称为空时显示 Invalid name、不关闭；Save 成功后关闭设置窗口；最多存在一个设置窗口；主窗口 Reset 恢复 Welcome。
评分：Primary Stage 10、Secondary Stage 15、界面与控件 10、跨窗口更新 15、异常状态和 Reset 10。

**Q20. FlowPane and Dynamic Controls — 40 marks**
FlowPane 初始显示 Java、Python、C++ 三个 Label；TextField 输入新标签；Add 创建新 Label 加到 FlowPane；空输入显示 Invalid input；Clear 移除用户添加的标签，保留最初三个；靠 FlowPane 自动换行，不手动指定坐标；每个 Label 设置内边距和背景颜色。
评分：FlowPane 10、动态创建节点 12、输入验证 8、Clear 5、样式与布局 5。

### Mock Examination 11 — Library Management Fundamentals

**Q21. Simple Library GUI — 60 marks**
JavaFX LibraryApp，用 `ArrayList<Book>` 保存书籍。GUI：ISBN、Title 两个 TextField，`ListView<String>` 显示记录，Add、Borrow、Return、Clear 四个按钮，状态 Label；不允许 TableView。
1. Add 添加默认 available 的 Book。 2. 空输入显示 Missing information。 3. ISBN 重复显示 Duplicate ISBN。 4. Borrow 根据输入的 ISBN 借书，available 改为 false。 5. Return 改为 true。 6. 找不到书显示 Book not found。 7. 已借出的不能再 Borrow，未借出的不能 Return。 8. 每次成功修改后刷新 ListView。 9. Clear 只清空输入框。
评分：GUI 10、ArrayList 10、Add 15、Borrow/Return 15、状态与列表刷新 10。

**Q22. Book and Library Classes — 40 marks**
Book.java 包含 private String isbn、String title、boolean available；构造器、Getter、必要的 Setter；toString() 例如 `001 - Java Basics [Available]`。Library.java 内部用 `ArrayList<Book>`，实现 addBook()（防止重复 ISBN）、findBook()（不存在返回 null）、borrowBook()、returnBook()（成功 true，否则 false）。
评分：Book 封装与构造器 10、toString 5、ArrayList 5、查找与去重 10、Borrow/Return 10。

### Mock Examination 12 — Text File Input and Output

**Q23. Persistent Notes Application — 60 marks**
Notes Manager：TextField 输入笔记，TextArea 显示所有笔记，Add、Save、Load、Clear 四个按钮。1. 用 `ArrayList<String>` 保存。 2. Add 加入非空文本并刷新。 3. Save 写入 notes.txt，每条一行，覆盖原文件。 4. Load 重新读取并替换当前列表。 5. Clear 清空内存列表和 TextArea，不修改磁盘文件。 6. 文件不存在时 Load 显示 File not found，程序不崩溃。 7. 空输入 Add 显示 Empty note。 8. try-catch 处理读写异常。
评分：GUI 10、ArrayList 10、Add/Clear 10、Save 15、Load 15。测试：Add 两条 → Save → Clear → Load，必须恢复两条笔记。

**Q24. Load and Save Book Records — 40 marks**
给定 Book 类（ISBN、Title、Available 与 Getter/Setter）。编写 LibraryFileManager.java：

```java
public static void save(ArrayList<Book> books, String filename) throws IOException
public static ArrayList<Book> load(String filename) throws IOException
```

格式 `001,Java Basics,true`；Save 覆盖旧文件；Load 逐行 `split(",")`、`Boolean.parseBoolean()`、用构造器恢复 Book；文件不存在返回空列表；正确关闭文件资源。
评分：Save 15、Load 15、数据转换 5、文件资源及不存在处理 5。

### Mock Examination 13 — Library Operations

**Q25. Library Borrowing and Returning GUI — 60 marks**
初始记录 001 Java Basics true、002 Python Intro false、003 Web Systems true；`ArrayList<Book>` 保存，`ListView<String>` 显示；ISBN 输入框及 Borrow、Return、Save 按钮。Borrow / Return 按 ISBN 查找并修改；不允许重复借出或重复归还；每次操作更新 ListView 和状态 Label；Save 保存到 books.txt；失败时不修改记录；未点 Save 的修改不要求自动保存。
评分：GUI 10、查找 10、Borrow/Return 20、界面刷新 10、文件保存 10。

**Q26. Search and Delete with ArrayList — 40 marks**
给定 Library 类中的 `private ArrayList<Book> books;`，实现 `public Book findByIsbn(String isbn)`、`public ArrayList<Book> searchByTitle(String keyword)`、`public boolean deleteBook(String isbn)`。ISBN 精确匹配；Title 不区分大小写、部分匹配；删除不存在返回 false；搜索不修改原列表；空关键词返回空列表。
评分：精确查找 10、部分匹配 15、删除 10、边界处理 5。测试：搜索 "java" 匹配 "Java Basics" 和 "Advanced Java"；删除已存在 ISBN 两次，先 true 后 false。

### Mock Examination 14 — Integrated Event Programming

**Q27. Automatic Moving Player — 60 marks**
初始 Circle 圆心 (50,100)，半径 15；Start、Pause、Reset 三个按钮及状态 Label。1. Timeline 每 300 ms 将 X 增加 5。 2. X 达到 280 后自动停止。 3. Pause 暂停。 4. Reset 恢复 (50,100)、蓝色。 5. 支持 LEFT、RIGHT 键，每次移动 10。 6. 手动移动和 Timeline 都遵守 X 范围 [20,280]。 7. 鼠标点击 Circle 时切换蓝色与红色。 8. Label 反映最后一次操作，例如 Paused、X: 120.0、Boundary reached。
评分：GUI 10、Timeline 15、Start/Pause/Reset 10、KeyEvent 10、MouseEvent 5、边界及状态 10。

**Q28. Window Closing and Validation — 40 marks**
TextField studentName、Label statusLabel、Button Save、Button Reset。Name 非空时 Save 保存名称并显示 Saved；空白显示 Invalid name；Reset 清空已保存的名称和输入框并显示 Ready；关闭窗口时，如果输入框内容与已保存名称不同，弹出 CONFIRMATION Alert：Unsaved changes. Exit?；取消则 consume() 阻止关闭；相同则直接关闭；首次启动时空输入与初始空名称视为相同。
评分：GUI 5、Save/Reset 10、状态比较 10、Alert 10、consume() 5。

### Mock Examination 15 — Final Comprehensive Mock

**Q29. Mini Library Administration System — 60 marks**
不使用 TableView，必须有 Book.java、Library.java、MiniLibraryApp.java。Book 保存 private ISBN、Title、Available；Library 用 `ArrayList<Book>` 提供 Add、Delete、Borrow、Return；GUI 有 ISBN、Title 输入框和 Add、Delete、Borrow、Return、Load、Save 六个按钮；Add 不允许空值及重复 ISBN；Delete 按 ISBN 删除；Borrow / Return 拒绝不合理操作；用列表或文本区域显示全部书籍；启动时从 books.txt 加载，不存在则为空；Save 写回文本文件；成功操作立即刷新，失败不破坏数据。格式 `001,Java Basics,true`。
评分：OOP 15、GUI 10、Add/Delete 10、Borrow/Return 10、文件读写 10、错误处理与刷新 5。测试：Add → Borrow → Save → 关闭程序 → 重新运行 → Load，借阅状态必须保持。

**Q30. JavaFX Debugging and Code Completion — 40 marks**
修复下面含编译错误和逻辑错误的 DebugApp，提交完整、可运行的源文件（原题开头的 8 行 import 这里省略）：

```java
public class DebugApp extends Application {
    @Override
    public void start(Stage stage) {
        Pane pane = new Pane():
        Circle c = new Circle(100, 100, 30);
        c.setFill(Color.Blue);
        Label label = new Label("Radius: 30");
        Button growBtn = new Button("Grow");
        Button resetBtn = new Button("Reset");
        growBtn.setOnAction(e -> {
            c.setRadius(c.getRadius + 5);
            label.setText(c.getRadius());
        });
        resetBtn(e -> {
            c.setRadius(30);
            label.setText("Radius: 30");
        });
        pane.getChildren().addAll(c, label, growBtn, resetBtn);
        Scene scene = new Scene(pane, 300, 250);
        stage.setScene(scene);
        stage.show();
    }
    public static void main(String[] args) { launch(args); }
}
```

修复后：编译并启动；Circle 初始蓝色、半径 30；Grow 每次 +5，最大 60；到达最大时 Label 显示 Maximum radius reached，正常时显示 Radius: <value>；Reset 恢复半径 30、蓝色和 Label；Circle、Label、两个 Button 清晰可见、不互相遮挡。
评分：修复编译错误 15、Grow 功能 8、边界处理 7、Reset 5、GUI 布局 5。

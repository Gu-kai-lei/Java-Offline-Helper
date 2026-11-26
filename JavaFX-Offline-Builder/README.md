# JavaFX Offline Builder v2.3 / JavaFX 离线积木

在浏览器里用表单或积木生成 JavaFX 代码。页面是一个独立的离线 HTML，可在配有 JavaFX 的 BlueJ 中运行生成的程序。练习围绕 EIE3320 Test 2 实操内容设计，笔试复习页和 A4 速查纸见 [Part 1](part1-prep/README.md)。

## 使用

1. 把 [`dist/JavaFX-Offline-Builder.html`](dist/JavaFX-Offline-Builder.html) 复制到本机硬盘，用 Chrome 或 Edge 打开。
2. 首次打开时，在「考生信息」中填写要写入 Java 注释的姓名、学号和工具。普通练习可使用示例信息。窗口标题里的 `{name}` 会替换为填写的姓名，也可在这里选择 import 写法。
   任何页面按 <kbd>Ctrl</kbd>+<kbd>K</kbd> 或 <kbd>/</kbd> 打开顶部的**快速查找**：一次搜索页面、知识点、讲义例程和变体题，回车直接打开。
3. 先看题目给了什么，再选择工具（「实操必看提醒」页有完整对照表）：

| 题目 | 工具 |
| --- | --- |
| 给了 `.java` 骨架（类和空方法） | **骨架补全**：粘贴后自动填写空方法，原有签名不变；返回 String 的方法可以用格式模板生成。补完可以一键生成配套主程序：图形题转到 Shape 程序，记录题转到记录 + 文件，都选「只输出主程序」 |
| 画图形，用按钮换色、移动、缩放（Assignment 2 类型） | **Shape 程序**：接口 + 抽象父类 + 图形子类 + 按钮。每个按钮可以放在不同区域；支持输入框读尺寸、面积 Label、最小尺寸、ArrayList、保存/读取 txt。预览中可以点按钮试运行 |
| 记录的增删改查、搜索、排序、读写 txt（Lab 3 类型） | **记录 + 文件**：记录类（getter/setter）、ArrayList、ListView 或 TextArea、Alert、Scanner/PrintWriter；支持 AND／OR 搜索、字段范围、CSV／分号／Tab、有无表头、数值和状态按钮 |
| 输入数字后按按钮算结果 | **表单计算器** |
| 按坐标画一幅图 | **绘图** |
| 想查 API 或找一个短例子 | **知识点速查**：用中文或 API 名称检索，按分类筛选并复制 Java 片段 |
| 和讲义例子相似，或想找一个完整程序对照 | **讲义例程库**：32 个 Lecture 7–8 课件程序 + 8 个精简综合例题（四种 Handler 写法、鼠标与键盘事件、Color + 绑定、输入验证 + Alert、A2 结构、Lab 3 结构、第二个窗口 + 动态 FlowPane、纯 Java OOP + 文本文件读写），可按 L7 / L8 / A2 / Lab 3 / OOP 筛选、搜索、改类名 |
| 鼠标、键盘、按钮、窗口事件的组合 | **积木工作台**：拖拽或点选积木，拼条件和动作，试运行后导出 |
| 指定 BorderPane 布局、运行时往面板加控件、第二个窗口 | **积木工作台**：控件放进 BorderPane 五个区域之一，「布局」卡片给每个区域选 HBox / VBox / FlowPane / StackPane、间距、内边距、对齐和样式；积木「往区域里添加控件」「清空区域」「打开新窗口」 |
| 手写程序、不记得 import | **知识点速查 → 模板与 import**：通用 import 块（JavaFX / 普通 Java）、JavaFX 程序模板（BorderPane 五区）、Java 控制台模板 |
| 想先练手 | **变体题练习**：33 道中文模拟题，可展开提示、载入参考设置或查看手写参考答案，附 BlueJ 核对清单 |

4. 输出面板可以复制代码、下载单个 `.java`，或者「下载 BlueJ 项目 ZIP」（内含 `package.bluej`，解压后用 BlueJ 的 Open Project 打开）。

草稿、骨架补全里的手动修改和考生信息保存在当前浏览器的本地存储中。导出的 Java 文件包含已填写的考生信息。

## 通用 import 块

考场上最费时间的是查「这个类在哪个包」。v2.3 提供一段固定的通配符 import，任何 JavaFX 程序都能直接放在文件最上面：

```java
// JavaFX Application & Window
import javafx.application.Application;
import javafx.stage.*;
// Scene Graph & Layout
import javafx.scene.*;
import javafx.scene.layout.*;
import javafx.geometry.*;
// …… UI Controls / Shapes & Colors / Text & Font / Image / Events / Properties & Binding /
// Observable Collections / Animation & Timeline / java.util / java.io / java.nio.file / java.time
```

- 完整内容在「知识点速查 → 模板与 import」，「实操必看提醒」顶部有一键复制按钮。没有界面的类（Book、Student、Library）用只含 Java 部分的「普通 Java」版本。
- 生成器也能输出这一段：在「考生信息」或任一代码面板上方把 import 写法改成「通用块」。每个生成的文件（包括讲义例程）都会改用这段 import。
- 用 JDK 17 和 JavaFX 17 逐个检查过这些包里的全部公开类，唯一重名的是 `Path`（`java.nio.file.Path` 和 `javafx.scene.shape.Path`）。用到它时生成器会再加一行精确 import。自己的类和 JavaFX 类同名时（例如自己写的 `Shape`）也会保留精确 import。
- 测试会把**每一个**生成的程序再改成通用 import 编译一遍（`--jdk` 下的 `[universal imports]` 用例）。

## 知识点速查

从首页或左侧「参考与练习」打开「知识点速查」。可搜索「接口」「数字键盘转化为数字」「getCode()」或「TextField parseInt」，再按键盘与输入、事件与交互、类与接口等分类筛选。每条列出用途、示例所需的上下文和相关知识点，可直接复制 Java 片段。

速查也收录了适合手写的常见片段，包括第二个窗口只打开一次、运行时往 FlowPane 加控件、Library 类、`ArrayList<String>` + TextArea、文件不存在时返回空列表，以及编辑后取消。可搜「第二个窗口」「Library」「文件不存在」或「取消编辑」。`run_builder_tests.mjs --jdk` 会在对应的上下文中编译示例。

## 变体题练习怎么用

1. 打开「变体题练习」，左边按组列出题目：第一轮 A2 / Lab 3 变体、第二轮键盘鼠标动画控件、拓展题（条件、边界、文件格式、计数、关窗等）。
   第三轮组收录 8 道需要手写的题，第四轮组收录动态 FlowPane（Q07）和独立 Cancel 编辑操作（Q30）。每题均附可下载的手写参考答案。第三轮 Q22、Q29 和第四轮两题还可载入 Builder 能生成的部分。
2. 右侧以「必须实现」分条列出中文题目要求。题给 `.java` 可展开查看，题给源码及手写参考答案使用中文注释。先自己判断用哪个工具，做完再展开「提示」核对。
3. 「载入参考设置并打开」会把这道题的答案设置写进对应页面（题目给了代码时同时填好「骨架补全」），会先确认是否替换当前草稿。
4. 在 BlueJ 运行后，按页面下方的清单逐项核对。「Shape 程序」「记录 + 文件」「表单计算器」的预览下方也有按当前设置生成的核对清单。

各生成器的「载入范例」也加了常见变体：方向键 + 鼠标定位、Timeline 动画、尺寸范围；手动 Save/Load、筛选 + 合计、AND 搜索、分号文件；分数转等级、矩形、平均速度；交通灯、计数器、左右键点击、关窗确认。「实操必看提醒」新增了手改代码时常见的编译错误和「常用改法速查」。

## Scratch 式工作台怎么用

需要练习键盘控制时，载入「KeyPractice：方向键、R 复位、数字键改半径」。它用同一个键盘按下事件处理四个方向键、R 和数字 1–9，更新整数坐标和半径。点击 Reset 后仍可按方向键。

「读取数字键（0–9）」支持主键区和小键盘。可以设定包含两端的数字范围，在成功分支用「读到的数字」做四则运算。「如果 · 按下指定键」也可单独选择 DIGIT0–DIGIT9 或 NUMPAD0–NUMPAD9。

1. 打开「积木工作台」，在「载入范例」先试 **方向键：Shift 加速 + 边界** 或 **有限半径：Apply 与回车共用处理器**。
2. 左边选事件或添加控件。把积木拖到中间的「放在这里」；也可以点工具箱里的积木，或用任一分支的「＋ 积木」添加。新增、删除和排序可以撤销、重做。
   「布局」卡片可选择根节点。默认的 BorderPane 有五个区域，Pane 使用自由坐标，也可选择 StackPane、VBox、HBox 或 FlowPane。鼠标和键盘事件可以注册到根节点。
3. 「如果 · 条件积木」只接受条件：比较、范围、且／或、取反或修饰键。「用数字积木设置半径」可以选一个数字、读取成功分支里的结果或四则运算。常用组合不需要输入 Java 表达式。已有的自定义 Java 草稿仍可打开；新增这类积木要先打开「显示进阶 Java 积木」。
4. 右边的工作台预览可点按钮、输入并回车。键盘题请先点图形预览区；「重置预览」只重置试运行状态。积木旁的「看 Java」会定位生成代码，不会把定位标记写进导出文件。
5. 下载 BlueJ ZIP，解压后再在 BlueJ 编译、运行。网页预览用于检查常用结构化积木逻辑；窗口事件、进阶 Java 和平台特定的布局，以真实 JavaFX 为准。
6. 需要跨事件保存的状态（点击次数、锁定、已保存的名字）放进左侧「变量」：int / double / boolean / String，生成为类的字段。「显示组合文字」用 `{名字}` 拼出 Label 文字，例如 `Position: ({c.x}, {c.y})`、`Clicks: {clicks}`、`{price:.2f}`。
7. 只交事件代码时，右侧「只要事件代码」会用注释分成两段：第一段（变量、Handler 类）放在类里、start() 外面，第二段放进 start()。

## 边界与文件

- 贷款范例允许 0%：月供为本金除以总月数；负利率、无效输入和非有限结果会提示错误。之前保留的草稿可重新载入新版贷款范例。
- Shape 程序在「尺寸输入框」中可填范围。只填一个值会应用于所有尺寸；宽、高不同则填逗号列表，新增和缩放都检查。
- 「记录 + 文件」在字段本身设置范围，作用于新增、修改、读档和数字按钮。数字按钮单独设置的上下限可以更严格。多栏查询保留原题 OR 默认，可切换成 AND；两者都忽略空白栏。
- 数据文件使用 UTF-8。选择分隔符和是否带表头，表头采用②中的字段名和顺序。有分隔符或双引号的列用双引号包住，内部的双引号写成两个。每条记录占一行。读档失败会指出行号，保留当前记录和原文件；修正后成功重读，或重新打开自动读档的程序再继续。

## 生成代码的约定

- 生成器新增的 Java 代码使用 ASCII（字符串中的非 ASCII 字符写成 `\uXXXX`）。题给源码、手写参考答案，以及保留中文原注释的骨架补全结果使用 UTF-8。
- 生成器会添加考生信息注释。变体题的手写答案使用 `姓名`、`学号`、`工具` 作为注释标签。
- 写法贴近课件：Lambda 或匿名内部类 Handler、`for` 循环，文件读写用 `File` + `Scanner`/`PrintWriter`，错误用 `Alert`；不使用 GridPane 或 TableView（不在 Test 2 范围内）。
- import 有两种写法：精确 import（默认，只导入用到的类），或通用 import 块（见上文）。
- 题目已经给了某些类时，选择「只输出主程序」，可以避免 `duplicate class` 错误。

## 模拟题与验收

- [第一轮](tests/exam-variants/README.md)和[第二轮](tests/exam-variants/round2/README.md)包含图形、记录、事件与控件的变体题。回归测试会重放保存的设置，并检查运行时的控件、提示和文件。
- [第三轮](tests/exam-variants/round3/README.md)和[第四轮](tests/exam-variants/round4/README.md)各有 30 道模拟实操题，包含逐题结果与 Playwright 复跑命令。

## 开发

源码在 `src/`：`core/` 是纯逻辑代码，不访问 DOM，可以在 Node 中测试；`ui/` 是界面代码。文件顺序见 `src/manifest.json`。在 `JavaFX-Offline-Builder/` 目录中运行以下命令。

```bash
node build.mjs                                                   # 生成 dist/JavaFX-Offline-Builder.html
node tests/run_builder_tests.mjs                                 # 生成器逻辑、ASCII/头注释、变体题重放、dist 是否最新
node tests/run_builder_tests.mjs --jdk --fx <javafx-lib>         # 另外用 javac 编译每个生成的程序
node tests/run_builder_tests.mjs --jdk --run --fx <javafx-lib>   # 另外启动 JavaFX 程序并逐步点击验证（需要桌面环境；Linux 可用 xvfb-run -a 前缀）
```

`--run` 使用 `tests/FxSmoke.java` 启动生成的程序：按脚本点击按钮、输入文字、选择列表、发送鼠标和键盘事件，自动关闭 Alert 并记录提示内容，每一步都检查窗口状态。如果 JavaFX 随 BlueJ 安装，可用 `--jdk-bin "<BlueJ>/jdk/bin" --fx "<BlueJ>/lib"` 指定配套版本。

修改 `src/` 后要重新运行 `build.mjs`，否则测试会提示 dist 已过期。练习页的题目在 `tools/make-variants.mjs` 里，设置和题目给的文件取自 `tests/exam-variants`；改完运行 `node tools/make-variants.mjs` 生成 `src/core/variants.js`，测试会检查它是否最新，并检查前两轮的题目载入后与回归测试的答案逐字一致。

版本变化见[更新日志](../CHANGELOG.md)。

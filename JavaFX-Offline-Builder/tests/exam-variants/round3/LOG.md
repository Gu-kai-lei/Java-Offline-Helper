# 第 3 轮模拟卷：builder 操作日志

由 `run_round3.mjs` 驱动真实页面 `JavaFX-Offline-Builder/dist/JavaFX-Offline-Builder.html` 生成。每一步都是页面上的一次点击或输入，没有手写 Java，也没有打开「显示进阶 Java 积木」。
考生信息：姓名 `Test Student`，学号 `DEMO-ID`，工具 `BlueJ + JavaFX Offline Builder`。生成的代码在 [answers/](answers/)。

| 题号 | 用的页面 | 结果 | 验收 |
| --- | --- | --- | --- |
| [Q1](#q1) Interactive Circle Application（60） | Shape 程序（A2 型） | ✅ 只用 builder 完成全部要求 | 11/11 项通过 |
| [Q2](#q2) Safe Radius Controller（40） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 6/6 项通过 |
| [Q3](#q3) Responsive Circle Window（60） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 6/6 项通过 |
| [Q4](#q4) Image and Style Viewer（40） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 6/6 项通过 |
| [Q5](#q5) Shape Selection Application（60） | Shape 程序（A2 型） | ✅ 只用 builder 完成全部要求 | 7/7 项通过 |
| [Q6](#q6) Named EventHandler Class（40） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 5/5 项通过 |
| [Q7](#q7) Keyboard-Controlled Player（60） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 9/9 项通过 |
| [Q8](#q8) Anonymous Inner Class（40） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 4/4 项通过 |
| [Q9](#q9) Interactive Mouse Drawing（60） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 7/7 项通过 |
| [Q10](#q10) Mouse Entered, Exited and Click Counter（40） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 6/6 项通过 |
| [Q11](#q11) Shared EventHandler Calculator（60） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 8/8 项通过 |
| [Q12](#q12) Window Close Request（40） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 4/4 项通过 |
| [Q13](#q13) JavaFX Stopwatch（60） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 6/6 项通过 |
| [Q14](#q14) Automatic Circle Movement（40） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 6/6 项通过 |
| [Q15](#q15) Student Registration Form（60） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 8/8 项通过 |
| [Q16](#q16) JavaFX Alert and Confirmation（40） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 5/5 项通过 |
| [Q17](#q17) RGB Colour Controller（60） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 5/5 项通过 |
| [Q18](#q18) Interface, Inheritance and Polymorphism（40） | — | ❌ builder 没有可用的页面 | — |
| [Q19](#q19) Multiple Window Application（60） | — | ❌ builder 没有可用的页面 | — |
| [Q20](#q20) FlowPane and Dynamic Controls（40） | — | ❌ builder 没有可用的页面 | — |
| [Q21](#q21) Simple Library GUI（60） | 记录 + 文件（Lab 3 型） | ✅ 只用 builder 完成全部要求 | 9/9 项通过 |
| [Q22](#q22) Book and Library Classes（40） | 记录 + 文件（Lab 3 型） | 🟡 只用 builder 完成一部分 | 编译通过 |
| [Q23](#q23) Persistent Notes Application（60） | 记录 + 文件（Lab 3 型） | 🟡 只用 builder 完成一部分 | 7/8 项通过 |
| [Q24](#q24) Load and Save Book Records（40） | — | ❌ builder 没有可用的页面 | — |
| [Q25](#q25) Library Borrowing and Returning GUI（60） | 记录 + 文件（Lab 3 型） | ✅ 只用 builder 完成全部要求 | 8/8 项通过 |
| [Q26](#q26) Search and Delete with ArrayList（40） | — | ❌ builder 没有可用的页面 | — |
| [Q27](#q27) Automatic Moving Player（60） | Shape 程序（A2 型） | ✅ 只用 builder 完成全部要求 | 11/11 项通过 |
| [Q28](#q28) Window Closing and Validation（40） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 7/7 项通过 |
| [Q29](#q29) Mini Library Administration System（60） | 记录 + 文件（Lab 3 型） | 🟡 只用 builder 完成一部分 | 7/8 项通过 |
| [Q30](#q30) JavaFX Debugging and Code Completion（40） | 积木工作台 | ✅ 只用 builder 完成全部要求 | 4/4 项通过 |

## Q1

**Interactive Circle Application（60）** · ✅ 只用 builder 完成全部要求 · 页面：Shape 程序（A2 型）

用 A2 范例改坐标、半径和按钮文字；新的「状态 Label 与位置边界」分组提供状态 Label、No circle available 和 Y 的范围 [30,270]。程序是 Drawable / Shape / JavaFXCircle 加主类，合并成一个 CircleApp.java。

### 操作顺序

1. 左侧导航点 「Shape 程序（A2 型）」
2. 「载入范例…」 选 「A2 原题：圆 + 6 个按钮（左侧面板）」，确认替换
3. 「主类名（= 文件名）」 设为 「CircleApp」
4. 「窗口标题（{name} 会换成你的姓名）」 设为 「Circle Controller」
5. 「输出方式」 设为 「全部合并成一个文件」
6. 「面积、周长和尺寸的类型」 设为 「double」
7. 「(x, y) 表示」 设为 「图形中心」
8. 「初始 x」 设为 「200」
9. 「初始 y」 设为 「150」
10. 「图形子类」 第 1 行：「半径 radius 默认值」 设为 「30」
11. 「按钮」 第 2 行：「按钮文字（照题目写）」 设为 「Clear」
12. 「按钮」 第 3 行：「按钮文字（照题目写）」 设为 「Red」
13. 「按钮」 第 4 行：「按钮文字（照题目写）」 设为 「Blue」
14. 「窗口里显示状态 Label」 设为 「是」
15. 「没有图形时点按钮的提示」 设为 「No circle available」
16. 「Y 下限（留空 = 不限）」 设为 「30」
17. 「Y 上限（留空 = 不限）」 设为 「270」
18. 「默认按钮面板位置」 设为 「底部（横排）」
19. 「按钮宽度（0 = 自动）」 设为 「0」
20. 「画布宽」 设为 「500」
21. 「画布高」 设为 「300」
22. 「窗口宽（0 = 自动）」 设为 「500」
23. 「窗口高（0 = 自动）」 设为 「400」
24. 「添加时在控制台打印面积周长」 设为 「否」

页面输出：✓ 已生成 1 个源文件：CircleApp.java。尚未编译。主类 CircleApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[CircleApp.java](answers/Q1/CircleApp.java)

### 运行验收（FxSmoke）

步骤：`click:Add Circle` → `click:Red` → `click:Move Up` → `click:Clear` → `click:Move Down` → `click:Add Circle` → `click:Move Up` → `click:Move Up` → `click:Move Up` → `click:Move Up` → `click:Move Up` → `click:Move Up` → `click:Move Up` → `click:Move Up` → `click:Move Up` → `click:Clear` → `click:Red` → `click:Clear`

- ✅ 标题 Circle Controller，窗口 500 × 400
- ✅ 开始时没有圆
- ✅ Add：绿色圆，圆心 (200,150)，半径 30
- ✅ Red：变红
- ✅ Move Up：centerY 150 → 135
- ✅ Clear：圆被移除
- ✅ （测试最后一步）没有圆时 Move Down 显示 No circle available、不出错
- ✅ 重复 Add 只保留一个圆
- ✅ Move Up 到 centerY = 30 仍可移动
- ✅ 再按 Move Up：保持 30 并显示 Boundary reached
- ✅ 没有圆时 Red 显示 No circle available；Clear 可重复点

## Q2

**Safe Radius Controller（40）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

用积木范例「TextField 输入半径 + 验证」：改输入框变量名、范围 [5,80]，删掉输入框回车事件。题目只要求事件处理部分，可复制 event-handlers.txt；完整程序用于运行验收。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「TextField 输入半径 + 验证」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「SafeRadiusApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Safe Radius Controller」
5. 控件 「TextField · inputField」：「变量名」 设为 「radiusInput」
6. 点事件列表第 2 个事件
7. 当前事件点 「删除事件」
8. 点事件列表第 1 个事件
9. 积木 第 1 块「读取输入框里的有限数字」：「下限（可空）」 设为 「5」
10. 积木 第 1 块「读取输入框里的有限数字」：「下限端点」 设为 「包含」
11. 积木 第 1 块「读取输入框里的有限数字」：「上限（可空）」 设为 「80」

页面输出：✓ 已生成 1 个源文件：SafeRadiusApp.java。尚未编译。主类 SafeRadiusApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[SafeRadiusApp.java](answers/Q2/SafeRadiusApp.java)；只含事件代码的片段：[event-handlers.txt](answers/Q2/event-handlers.txt)

### 运行验收（FxSmoke）

步骤：`type:0:50` → `click:Apply` → `type:0:-5` → `click:Apply` → `type:0:abc` → `click:Apply` → `type:0:80` → `click:Apply` → `type:0:81` → `click:Apply` → `type:0:5` → `click:Apply` → `click:Reset`

- ✅ 初始：半径 30，输入框 30，Label Radius: 30
- ✅ 50：半径 50，Label 更新
- ✅ -5：Invalid radius，半径不变
- ✅ abc：Invalid radius，半径不变
- ✅ 边界 80 可以，81 不可以，5 可以
- ✅ Reset：半径 30、输入框 30、Label Radius: 30

## Q3

**Responsive Circle Window（60）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

积木生成 BorderPane 根容器、中央 Pane canvas 和底部 HBox。圆的「圆心属性绑定」选「是」，生成 centerXProperty().bind(canvas.widthProperty().divide(2))；Grow / Shrink 用「如果 · 半径改变后仍在范围内」。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「ResponsiveCircleApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Responsive Circle」
5. 控件区：类型选 「Pane」，变量名填 「canvas」，点 「添加控件」
6. 控件 「Pane · canvas」：「宽」 设为 「400」
7. 控件 「Pane · canvas」：「高」 设为 「300」
8. 控件区：类型选 「Circle」，变量名填 「c」，点 「添加控件」
9. 控件 「Circle · c」：「半径」 设为 「30」
10. 控件 「Circle · c」：「圆心属性绑定（bind）」 设为 「是：圆心永远在所在 Pane 的中心（窗口变大也居中）」
11. 控件区：类型选 「Button」，变量名填 「growBtn」，文字填 「Grow」，点 「添加控件」
12. 控件区：类型选 「Button」，变量名填 「shrinkBtn」，文字填 「Shrink」，点 「添加控件」
13. 控件区：类型选 「Button」，变量名填 「resetBtn」，文字填 「Reset」，点 「添加控件」
14. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · growBtn」，点 「添加事件」
15. 根层：下拉框选 「如果 · 半径改变后仍在范围内（加减或乘）」，点 「＋ 积木」
16. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「数值（加减时负数 = 缩小）」 设为 「10」
17. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最小半径」 设为 「10」
18. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最大半径」 设为 「1000」
19. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · shrinkBtn」，点 「添加事件」
20. 根层：下拉框选 「如果 · 半径改变后仍在范围内（加减或乘）」，点 「＋ 积木」
21. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「数值（加减时负数 = 缩小）」 设为 「-10」
22. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最小半径」 设为 「10」
23. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最大半径」 设为 「1000」
24. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · resetBtn」，点 「添加事件」
25. 根层：下拉框选 「恢复对象初始状态」，点 「＋ 积木」

页面输出：✓ 已生成 1 个源文件：ResponsiveCircleApp.java。尚未编译。主类 ResponsiveCircleApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[ResponsiveCircleApp.java](answers/Q3/ResponsiveCircleApp.java)

### 运行验收（FxSmoke）

步骤：`resize:700:520` → `click:Grow` → `click:Grow` → `click:Shrink` → `click:Shrink` → `click:Shrink` → `click:Shrink` → `click:Reset`

- ✅ 根容器 BorderPane，初始圆心在画布中心，半径 30，蓝色
- ✅ 使用 Property Binding
- ✅ 放大窗口后圆仍在 Canvas 中心
- ✅ Grow 两次：半径 50
- ✅ Shrink 三次：半径 20；第四次到 10（最低 10）
- ✅ Reset：半径 30，仍居中

## Q4

**Image and Style Viewer（40）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

新的 ImageView 控件（images/logo.png，显示宽度 200，保持比例）、「旋转（累加角度）」「设置样式 setStyle」和「如果 · 图片加载失败」。图片、Label 和两个按钮都放在左侧 VBox。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「ImageViewerApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Image Viewer」
5. 控件区：类型选 「ImageView」，变量名填 「logo」，点 「添加控件」
6. 控件区：类型选 「Label」，变量名填 「caption」，文字填 「Logo」，点 「添加控件」
7. 控件 「Label · caption」：「位置（BorderPane 区域）」 设为 「左侧 VBox」
8. 控件区：类型选 「Button」，变量名填 「rotateBtn」，文字填 「Rotate」，点 「添加控件」
9. 控件 「Button · rotateBtn」：「位置（BorderPane 区域）」 设为 「左侧 VBox」
10. 控件区：类型选 「Button」，变量名填 「styleBtn」，文字填 「Style」，点 「添加控件」
11. 控件 「Button · styleBtn」：「位置（BorderPane 区域）」 设为 「左侧 VBox」
12. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · rotateBtn」，点 「添加事件」
13. 根层：下拉框选 「旋转（累加角度）」，点 「＋ 积木」
14. 积木 第 1 块「旋转（累加角度）」：「对象」 设为 「ImageView · logo」
15. 积木 第 1 块「旋转（累加角度）」：「角度（正数顺时针）」 设为 「90」
16. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · styleBtn」，点 「添加事件」
17. 根层：下拉框选 「设置样式 setStyle（JavaFX CSS）」，点 「＋ 积木」
18. 积木 第 1 块「设置样式 setStyle（JavaFX CSS）」：「对象」 设为 「Label · caption」
19. 事件区：选 「窗口已显示 Shown」，注册到 「Stage · stage」，点 「添加事件」
20. 根层：下拉框选 「如果 · 图片加载失败」，点 「＋ 积木」
21. 第 1 块「如果 · 图片加载失败」 › 「加载失败」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
22. 积木 第 1 块「如果 · 图片加载失败」 › 「加载失败」分支 › 第 1 块「Label 显示文字」：「更新」 设为 「Label · caption」
23. 积木 第 1 块「如果 · 图片加载失败」 › 「加载失败」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Image unavailable」

页面输出：✓ 已生成 1 个源文件：ImageViewerApp.java。尚未编译。主类 ImageViewerApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[ImageViewerApp.java](answers/Q4/ImageViewerApp.java)

### 运行验收（FxSmoke）

第 1 次启动（文件夹里放了 images/logo.png）：`wait:200` → `click:Rotate` → `click:Rotate` → `click:Rotate` → `click:Rotate` → `click:Style`
第 2 次启动（新的空文件夹）：`wait:200`

- ✅ Image + ImageView 读取本地 images/logo.png，宽 200 保持比例
- ✅ 图片、Label 和两个按钮放在 VBox
- ✅ Rotate 一次 90°；四次回到原方向（360°）
- ✅ Style：Label 红色、20px
- ✅ 图片存在时不显示 Image unavailable
- ✅ 图片加载失败：显示 Image unavailable，程序照常启动

## Q5

**Shape Selection Application（60）** · ✅ 只用 builder 完成全部要求 · 页面：Shape 程序（A2 型）

三种图形子类直接命名为 Circle / Rectangle / Ellipse（生成器自动用 javafx.scene.shape 的完整类名避开冲突），每个图形有自己的颜色；新的按钮动作「旋转 Rotate」，Label 格式里的 {angle} 显示角度。

### 操作顺序

1. 左侧导航点 「Shape 程序（A2 型）」
2. 「载入范例…」 选 「变体：三种图形 + ArrayList + 放大缩小 + 面积显示」，确认替换
3. 「主类名（= 文件名）」 设为 「ShapeViewerApp」
4. 「窗口标题（{name} 会换成你的姓名）」 设为 「Shape Viewer」
5. 「输出方式」 设为 「全部合并成一个文件」
6. 「保存图形」 设为 「只保留当前一个（Add 替换旧图形）」
7. 「图形子类」 第 1 行：「类名」 设为 「Circle」
8. 「图形子类」 第 1 行：「半径 radius 默认值」 设为 「35」
9. 「图形子类」 第 1 行：「这个图形的颜色（留空 = 新图形颜色）」 设为 「BLUE」
10. 「图形子类」 第 2 行：「类名」 设为 「Rectangle」
11. 「图形子类」 第 2 行：「宽 width 默认值」 设为 「100」
12. 「图形子类」 第 2 行：「高 height 默认值」 设为 「60」
13. 「图形子类」 第 2 行：「这个图形的颜色（留空 = 新图形颜色）」 设为 「RED」
14. 「图形子类」 第 3 行：「图形」 设为 「Ellipse 椭圆」
15. 「图形子类」 第 3 行：「类名」 设为 「Ellipse」
16. 「图形子类」 第 3 行：「横半径 radiusX 默认值」 设为 「60」
17. 「图形子类」 第 3 行：「纵半径 radiusY 默认值」 设为 「30」
18. 「图形子类」 第 3 行：「这个图形的颜色（留空 = 新图形颜色）」 设为 「GREEN」
19. 「按钮」 第 4 行点 × 删除
20. 「按钮」 第 4 行点 × 删除
21. 「按钮」 第 4 行点 × 删除
22. 「按钮」 第 4 行点 × 删除
23. 「按钮」 第 4 行点 × 删除
24. 「按钮」 第 4 行点 × 删除
25. 「按钮」 第 4 行点 × 删除
26. 「按钮」 第 4 行点 × 删除
27. 「按钮」 第 4 行点 × 删除
28. 「按钮」 第 1 行：「按钮文字（照题目写）」 设为 「Circle」
29. 「按钮」 第 1 行：「添加哪个类」 设为 「Circle」
30. 「按钮」 第 2 行：「按钮文字（照题目写）」 设为 「Rectangle」
31. 「按钮」 第 2 行：「添加哪个类」 设为 「Rectangle」
32. 「按钮」 第 3 行：「按钮文字（照题目写）」 设为 「Ellipse」
33. 「按钮」 第 3 行：「添加哪个类」 设为 「Ellipse」
34. 「按钮」 列表点 「＋ 添加」
35. 「按钮」 第 5 行：「按钮文字（照题目写）」 设为 「Rotate」
36. 「按钮」 第 5 行：「点击后」 设为 「旋转 Rotate（每次加「每次旋转」的角度）」
37. 「Label 格式（{area} {perimeter} {class} 会被替换，保留 2 位小数）」 设为 「{class}, angle: {angle}」
38. 「没有图形时显示」 设为 「No shape selected」
39. 「没有图形时点按钮的提示」 设为 「No shape selected」
40. 「添加时在控制台打印面积周长」 设为 「否」

页面输出：✓ 已生成 1 个源文件：ShapeViewerApp.java。尚未编译。主类 ShapeViewerApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[ShapeViewerApp.java](answers/Q5/ShapeViewerApp.java)

### 运行验收（FxSmoke）

步骤：`click:Rectangle` → `click:Rotate` → `click:Rotate` → `click:Circle` → `click:Rotate` → `click:Clear` → `click:Ellipse` → `click:Clear` → `click:Rotate`

- ✅ Rectangle：中央 100 × 60 红色矩形
- ✅ Rotate 两次：90°，Label 显示名称和角度
- ✅ Circle 替换矩形：一个半径 35 的蓝色圆，角度归零
- ✅ Rotate：Circle, angle: 45.0
- ✅ Clear 删除图形，Label 显示 No shape selected
- ✅ Ellipse：半径 60 × 30 的绿色椭圆
- ✅ 没有图形时 Rotate 显示 No shape selected、不出错

## Q6

**Named EventHandler Class（40）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

事件「写法」选「命名内部类」，类名填 GrowHandler，「用构造器传入对象」选「是」：生成 private class GrowHandler，构造器接收它用到的 Circle 和 Label。上限用「如果 · 半径改变后仍在范围内」。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「GrowApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Grow Handler」
5. 控件区：类型选 「Pane」，变量名填 「pane」，点 「添加控件」
6. 控件区：类型选 「Circle」，变量名填 「c」，点 「添加控件」
7. 控件 「Circle · c」：「半径」 设为 「30」
8. 控件区：类型选 「Label」，变量名填 「label」，文字填 「Radius: 30」，点 「添加控件」
9. 控件 「Label · label」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
10. 控件区：类型选 「Button」，变量名填 「growBtn」，文字填 「Grow」，点 「添加控件」
11. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · growBtn」，点 「添加事件」
12. 当前事件：「写法」 设为 「命名内部类」
13. 当前事件：「Handler 类名（留空 = 自动编号）」 设为 「GrowHandler」
14. 当前事件：「用构造器传入对象」 设为 「是：独立的内部类，构造器传入用到的对象」
15. 根层：下拉框选 「如果 · 半径改变后仍在范围内（加减或乘）」，点 「＋ 积木」
16. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「数值（加减时负数 = 缩小）」 设为 「5」
17. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最小半径」 设为 「5」
18. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最大半径」 设为 「60」
19. 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支：下拉框选 「显示组合文字（{名字} 换成内容）」，点 「＋ 积木」
20. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 1 块「显示组合文字（{名字} 换成内容）」：「文字」 设为 「Radius: {c.radius}」
21. 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
22. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Maximum radius reached」

页面输出：✓ 已生成 1 个源文件：GrowApp.java。尚未编译。主类 GrowApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[GrowApp.java](answers/Q6/GrowApp.java)

### 运行验收（FxSmoke）

步骤：`click:Grow` → `click:Grow` → `click:Grow` → `click:Grow` → `click:Grow` → `click:Grow` → `click:Grow` → `click:Grow`

- ✅ GrowHandler 实现 EventHandler<ActionEvent> 并重写 handle(ActionEvent e)
- ✅ 构造器取得 Circle 和 Label，保存为字段
- ✅ 主程序创建 Handler 对象并注册
- ✅ 第一次 Grow：半径 35，Label 显示半径
- ✅ 连续 8 次 Grow：半径保持 60，显示 Maximum radius reached

## Q7

**Keyboard-Controlled Player（60）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

用积木范例「方向键左右移动 + 边界」：把显示单个坐标的积木换成组合文字 Position: ({c.x}, {c.y})，再用 ⧉ 复制 LEFT 的整块判断，改成 UP / DOWN。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「方向键左右移动 + 边界」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「KeyboardGame」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Keyboard Game」
5. 控件 「Pane · pane」：「宽」 设为 「300」
6. 控件 「Pane · pane」：「高」 设为 「200」
7. 控件 「Circle · c」：「圆心 X」 设为 「150」
8. 控件 「Circle · c」：「圆心 Y」 设为 「120」
9. 控件 「Label · statusLabel」：「初始文字」 设为 「Position: (150, 120)」
10. 点事件列表第 1 个事件
11. 积木 第 1 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」 › 「可以移动」分支 › 第 2 块「Label 显示对象位置」 点 × 删除
12. 第 1 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」 › 「可以移动」分支：下拉框选 「显示组合文字（{名字} 换成内容）」，点 「＋ 积木」
13. 积木 第 1 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」 › 「可以移动」分支 › 第 2 块「显示组合文字（{名字} 换成内容）」：「文字」 设为 「Position: ({c.x}, {c.y})」
14. 积木 第 2 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」 › 「可以移动」分支 › 第 2 块「Label 显示对象位置」 点 × 删除
15. 第 2 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」 › 「可以移动」分支：下拉框选 「显示组合文字（{名字} 换成内容）」，点 「＋ 积木」
16. 积木 第 2 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」 › 「可以移动」分支 › 第 2 块「显示组合文字（{名字} 换成内容）」：「文字」 设为 「Position: ({c.x}, {c.y})」
17. 积木 第 1 块「如果 · 按下指定键」 点 ⧉ 复制
18. 积木 第 2 块「如果 · 按下指定键」：「KeyCode」 设为 「UP」
19. 积木 第 2 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」：「轴」 设为 「Y」
20. 积木 第 2 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」：「位移」 设为 「-10」
21. 积木 第 2 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」：「下限」 设为 「20」
22. 积木 第 2 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」：「上限」 设为 「180」
23. 积木 第 2 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」 › 「可以移动」分支 › 第 1 块「相对移动」：「轴」 设为 「Y」
24. 积木 第 2 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」 › 「可以移动」分支 › 第 1 块「相对移动」：「位移（负数向左/上）」 设为 「-10」
25. 积木 第 2 块「如果 · 按下指定键」 点 ⧉ 复制
26. 积木 第 3 块「如果 · 按下指定键」：「KeyCode」 设为 「DOWN」
27. 积木 第 3 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」：「位移」 设为 「10」
28. 积木 第 3 块「如果 · 按下指定键」 › 「按下此键」分支 › 第 1 块「如果 · 移动后的位置在范围内」 › 「可以移动」分支 › 第 1 块「相对移动」：「位移（负数向左/上）」 设为 「10」

页面输出：✓ 已生成 1 个源文件：KeyboardGame.java。尚未编译。主类 KeyboardGame（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[KeyboardGame.java](answers/Q7/KeyboardGame.java)

### 运行验收（FxSmoke）

步骤：`key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:UP` → `key:UP` → `key:LEFT` → `click:Reset` → `key:A` → `key:UP` → `key:UP` → `key:UP` → `key:UP` → `key:UP` → `key:UP` → `key:UP` → `key:UP` → `key:UP` → `key:UP` → `key:UP` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:DOWN` → `key:DOWN` → `key:DOWN` → `key:DOWN` → `key:DOWN` → `key:DOWN` → `key:DOWN`

- ✅ 使用 scene.setOnKeyPressed()
- ✅ RIGHT ×3：X 150 → 180
- ✅ UP ×2：Y 120 → 100
- ✅ LEFT：X 170，Label 显示 Position: (170.0, 100.0)
- ✅ Reset：圆心 (150,120)，Label 恢复
- ✅ 其他按键（A）不改变状态
- ✅ UP 到 Y = 20 后再按：保持 20，显示 Boundary reached
- ✅ RIGHT 到 X = 280 后再按：保持 280，显示 Boundary reached
- ✅ DOWN：Y + 10

## Q8

**Anonymous Inner Class（40）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

两个事件的「写法」都选「匿名内部类」；上限 80 用「如果 · 半径改变后仍在范围内」，Label 用组合文字 Radius: {c.radius}。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「IncreaseApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Increase Radius」
5. 控件区：类型选 「Pane」，变量名填 「pane」，点 「添加控件」
6. 控件区：类型选 「Circle」，变量名填 「c」，点 「添加控件」
7. 控件 「Circle · c」：「半径」 设为 「30」
8. 控件区：类型选 「Button」，变量名填 「increaseBtn」，文字填 「Increase」，点 「添加控件」
9. 控件区：类型选 「Button」，变量名填 「resetBtn」，文字填 「Reset」，点 「添加控件」
10. 控件区：类型选 「Label」，变量名填 「radiusLabel」，文字填 「Radius: 30」，点 「添加控件」
11. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · increaseBtn」，点 「添加事件」
12. 当前事件：「写法」 设为 「匿名内部类」
13. 根层：下拉框选 「如果 · 半径改变后仍在范围内（加减或乘）」，点 「＋ 积木」
14. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「数值（加减时负数 = 缩小）」 设为 「10」
15. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最小半径」 设为 「10」
16. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最大半径」 设为 「80」
17. 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支：下拉框选 「显示组合文字（{名字} 换成内容）」，点 「＋ 积木」
18. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 1 块「显示组合文字（{名字} 换成内容）」：「文字」 设为 「Radius: {c.radius}」
19. 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
20. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Maximum radius reached」
21. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · resetBtn」，点 「添加事件」
22. 当前事件：「写法」 设为 「匿名内部类」
23. 根层：下拉框选 「恢复对象初始状态」，点 「＋ 积木」
24. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」

页面输出：✓ 已生成 1 个源文件：IncreaseApp.java。尚未编译。主类 IncreaseApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[IncreaseApp.java](answers/Q8/IncreaseApp.java)

### 运行验收（FxSmoke）

步骤：`click:Increase` → `click:Increase` → `click:Increase` → `click:Increase` → `click:Increase` → `click:Increase` → `click:Reset`

- ✅ 两个按钮都用 new EventHandler<ActionEvent>() { @Override public void handle(ActionEvent e) }
- ✅ Increase ×5：半径 80，Label 显示半径
- ✅ 第 6 次：半径保持 80，显示 Maximum radius reached
- ✅ Reset：半径 30，Label Radius: 30

## Q9

**Interactive Mouse Drawing（60）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

Canvas 上注册 MousePressed、MouseDragged、MouseReleased；释放时用组合文字显示圆心 ({c.x}, {c.y})，越界拖动后显示的也是圆心而不是鼠标位置。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「MouseDrawingApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Mouse Drawing」
5. 控件区：类型选 「Pane」，变量名填 「canvas」，点 「添加控件」
6. 控件 「Pane · canvas」：「宽」 设为 「320」
7. 控件 「Pane · canvas」：「高」 设为 「220」
8. 控件区：类型选 「Circle」，变量名填 「c」，点 「添加控件」
9. 控件 「Circle · c」：「半径」 设为 「15」
10. 控件区：类型选 「Label」，变量名填 「statusLabel」，文字填 「Ready」，点 「添加控件」
11. 控件 「Label · statusLabel」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
12. 控件区：类型选 「Button」，变量名填 「resetBtn」，文字填 「Reset」，点 「添加控件」
13. 事件区：选 「鼠标按下 MousePressed」，注册到 「Pane · canvas」，点 「添加事件」
14. 根层：下拉框选 「设置填充颜色」，点 「＋ 积木」
15. 积木 第 1 块「设置填充颜色」：「Color」 设为 「YELLOW」
16. 根层：下拉框选 「Label 显示文字」，点 「＋ 积木」
17. 积木 第 2 块「Label 显示文字」：「文字」 设为 「Dragging」
18. 事件区：选 「按住拖动 MouseDragged」，注册到 「Pane · canvas」，点 「添加事件」
19. 根层：下拉框选 「如果 · 鼠标坐标在范围内」，点 「＋ 积木」
20. 积木 第 1 块「如果 · 鼠标坐标在范围内」：「最小 X」 设为 「15」
21. 积木 第 1 块「如果 · 鼠标坐标在范围内」：「最大 X」 设为 「305」
22. 积木 第 1 块「如果 · 鼠标坐标在范围内」：「最小 Y」 设为 「15」
23. 积木 第 1 块「如果 · 鼠标坐标在范围内」：「最大 Y」 设为 「205」
24. 第 1 块「如果 · 鼠标坐标在范围内」 › 「在范围内」分支：下拉框选 「移到鼠标位置」，点 「＋ 积木」
25. 第 1 块「如果 · 鼠标坐标在范围内」 › 「超出范围」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
26. 积木 第 1 块「如果 · 鼠标坐标在范围内」 › 「超出范围」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Outside canvas」
27. 事件区：选 「鼠标松开 MouseReleased」，注册到 「Pane · canvas」，点 「添加事件」
28. 根层：下拉框选 「设置填充颜色」，点 「＋ 积木」
29. 积木 第 1 块「设置填充颜色」：「Color」 设为 「GREEN」
30. 根层：下拉框选 「显示组合文字（{名字} 换成内容）」，点 「＋ 积木」
31. 积木 第 2 块「显示组合文字（{名字} 换成内容）」：「文字」 设为 「Position: ({c.x}, {c.y})」
32. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · resetBtn」，点 「添加事件」
33. 根层：下拉框选 「恢复对象初始状态」，点 「＋ 积木」
34. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」

页面输出：✓ 已生成 1 个源文件：MouseDrawingApp.java。尚未编译。主类 MouseDrawingApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[MouseDrawingApp.java](answers/Q9/MouseDrawingApp.java)

### 运行验收（FxSmoke）

步骤：`hit:PRESSED:100:100` → `hit:DRAGGED:200:100` → `hit:DRAGGED:320:200` → `hit:RELEASED:320:200` → `click:Reset`

- ✅ 使用 setOnMousePressed / setOnMouseDragged / setOnMouseReleased
- ✅ Canvas 320 × 220，初始蓝色圆 (100,100) 半径 15
- ✅ Press：变黄，Label Dragging
- ✅ Drag(200,100)：圆跟随
- ✅ Drag(320,200) 越界：不移动，Label Outside canvas
- ✅ Release：变绿，Label 显示圆心 (200, 100)
- ✅ Reset：圆心 (100,100)、蓝色、Label Ready

## Q10

**Mouse Entered, Exited and Click Counter（40）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

在 Circle 上注册 MouseEntered、MouseExited、MouseClicked；计数用 int 变量 clicks（类的字段，跨事件保留），Label 用组合文字 Clicks: {clicks}。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「MouseCounterApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Mouse Counter」
5. 控件区：类型选 「Pane」，变量名填 「pane」，点 「添加控件」
6. 控件区：类型选 「Circle」，变量名填 「c」，点 「添加控件」
7. 控件 「Circle · c」：「圆心 X」 设为 「150」
8. 控件 「Circle · c」：「半径」 设为 「40」
9. 控件区：类型选 「Label」，变量名填 「statusLabel」，文字填 「Ready」，点 「添加控件」
10. 控件 「Label · statusLabel」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
11. 控件区：类型选 「Label」，变量名填 「countLabel」，文字填 「Clicks: 0」，点 「添加控件」
12. 控件 「Label · countLabel」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
13. 控件区：类型选 「Button」，变量名填 「resetBtn」，文字填 「Reset」，点 「添加控件」
14. 变量区：类型选 「int」，变量名填 「clicks」，初始值填 「0」，点 「添加变量」
15. 事件区：选 「鼠标进入 MouseEntered」，注册到 「Circle · c」，点 「添加事件」
16. 根层：下拉框选 「设置填充颜色」，点 「＋ 积木」
17. 积木 第 1 块「设置填充颜色」：「Color」 设为 「GREEN」
18. 根层：下拉框选 「Label 显示文字」，点 「＋ 积木」
19. 积木 第 2 块「Label 显示文字」：「文字」 设为 「Mouse inside」
20. 事件区：选 「鼠标离开 MouseExited」，注册到 「Circle · c」，点 「添加事件」
21. 根层：下拉框选 「设置填充颜色」，点 「＋ 积木」
22. 积木 第 1 块「设置填充颜色」：「Color」 设为 「BLUE」
23. 根层：下拉框选 「Label 显示文字」，点 「＋ 积木」
24. 积木 第 2 块「Label 显示文字」：「文字」 设为 「Mouse outside」
25. 事件区：选 「鼠标点击 MouseClicked」，注册到 「Circle · c」，点 「添加事件」
26. 根层：下拉框选 「数字变量加减」，点 「＋ 积木」
27. 根层：下拉框选 「显示组合文字（{名字} 换成内容）」，点 「＋ 积木」
28. 积木 第 2 块「显示组合文字（{名字} 换成内容）」：「更新」 设为 「Label · countLabel」
29. 积木 第 2 块「显示组合文字（{名字} 换成内容）」：「文字」 设为 「Clicks: {clicks}」
30. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · resetBtn」，点 「添加事件」
31. 根层：下拉框选 「恢复变量初始值」，点 「＋ 积木」
32. 根层：下拉框选 「恢复对象初始状态」，点 「＋ 积木」
33. 积木 第 2 块「恢复对象初始状态」：「对象」 设为 「Circle · c」
34. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」
35. 积木 第 3 块「恢复控件初始文字」：「恢复」 设为 「Label · statusLabel」
36. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」
37. 积木 第 4 块「恢复控件初始文字」：「恢复」 设为 「Label · countLabel」

页面输出：✓ 已生成 1 个源文件：MouseCounterApp.java。尚未编译。主类 MouseCounterApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[MouseCounterApp.java](answers/Q10/MouseCounterApp.java)

### 运行验收（FxSmoke）

步骤：`hit:ENTERED:150:100` → `hit:CLICKED:150:100` → `hit:CLICKED:150:100` → `hit:CLICKED:150:100` → `hit:EXITED:150:100` → `click:Reset` → `hit:CLICKED:150:100`

- ✅ 计数保存在字段 private int clicks
- ✅ Enter：变绿，Mouse inside
- ✅ 点击三次：Clicks: 3
- ✅ Exit：变蓝，Mouse outside
- ✅ Reset：计数归零、蓝色、Ready 与 Clicks: 0
- ✅ Reset 后再点击从 1 开始

## Q11

**Shared EventHandler Calculator（60）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

「多个控件共用 Handler」注册给 +5、-5、Double 三个按钮，用「如果 · 事件来自指定控件」判断；三种运算都用「如果 · 半径改变后仍在范围内」（Double 选「乘以」2），超出 [5,100] 时显示 Invalid radius。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「CircleCalculatorApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Circle Calculator」
5. 控件区：类型选 「Pane」，变量名填 「pane」，点 「添加控件」
6. 控件区：类型选 「Circle」，变量名填 「c」，点 「添加控件」
7. 控件 「Circle · c」：「圆心 X」 设为 「150」
8. 控件 「Circle · c」：「圆心 Y」 设为 「120」
9. 控件 「Circle · c」：「半径」 设为 「30」
10. 控件区：类型选 「Label」，变量名填 「radiusLabel」，文字填 「Radius: 30」，点 「添加控件」
11. 控件 「Label · radiusLabel」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
12. 控件区：类型选 「Label」，变量名填 「opLabel」，文字填 「Last operation: none」，点 「添加控件」
13. 控件 「Label · opLabel」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
14. 控件区：类型选 「Button」，变量名填 「plusBtn」，文字填 「+5」，点 「添加控件」
15. 控件区：类型选 「Button」，变量名填 「minusBtn」，文字填 「-5」，点 「添加控件」
16. 控件区：类型选 「Button」，变量名填 「doubleBtn」，文字填 「Double」，点 「添加控件」
17. 控件区：类型选 「Button」，变量名填 「resetBtn」，文字填 「Reset」，点 「添加控件」
18. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · plusBtn」，点 「添加事件」
19. 当前事件：「写法」 设为 「多个控件共用 Handler（getSource 区分）」
20. 当前事件：「第二个控件」 设为 「Button · minusBtn」
21. 当前事件点 「＋ 再共用一个控件」
22. 当前事件：「第 3 个控件」 设为 「Button · doubleBtn」
23. 根层：下拉框选 「如果 · 事件来自指定控件」，点 「＋ 积木」
24. 积木 第 1 块「如果 · 事件来自指定控件」：「事件源」 设为 「Button · plusBtn」
25. 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支：下拉框选 「如果 · 半径改变后仍在范围内（加减或乘）」，点 「＋ 积木」
26. 积木 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「数值（加减时负数 = 缩小）」 设为 「5」
27. 积木 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最小半径」 设为 「5」
28. 积木 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最大半径」 设为 「100」
29. 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支：下拉框选 「显示组合文字（{名字} 换成内容）」，点 「＋ 积木」
30. 积木 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 1 块「显示组合文字（{名字} 换成内容）」：「更新」 设为 「Label · radiusLabel」
31. 积木 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 1 块「显示组合文字（{名字} 换成内容）」：「文字」 设为 「Radius: {c.radius}」
32. 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
33. 积木 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 2 块「Label 显示文字」：「更新」 设为 「Label · opLabel」
34. 积木 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 2 块「Label 显示文字」：「文字」 设为 「Last operation: +5」
35. 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
36. 积木 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支 › 第 1 块「Label 显示文字」：「更新」 设为 「Label · opLabel」
37. 积木 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Invalid radius」
38. 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支：下拉框选 「如果 · 事件来自指定控件」，点 「＋ 积木」
39. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」：「事件源」 设为 「Button · minusBtn」
40. 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支：下拉框选 「如果 · 半径改变后仍在范围内（加减或乘）」，点 「＋ 积木」
41. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「数值（加减时负数 = 缩小）」 设为 「-5」
42. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最小半径」 设为 「5」
43. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最大半径」 设为 「100」
44. 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支：下拉框选 「显示组合文字（{名字} 换成内容）」，点 「＋ 积木」
45. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 1 块「显示组合文字（{名字} 换成内容）」：「更新」 设为 「Label · radiusLabel」
46. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 1 块「显示组合文字（{名字} 换成内容）」：「文字」 设为 「Radius: {c.radius}」
47. 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
48. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 2 块「Label 显示文字」：「更新」 设为 「Label · opLabel」
49. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 2 块「Label 显示文字」：「文字」 设为 「Last operation: -5」
50. 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
51. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支 › 第 1 块「Label 显示文字」：「更新」 设为 「Label · opLabel」
52. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「来自此控件」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Invalid radius」
53. 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支：下拉框选 「如果 · 半径改变后仍在范围内（加减或乘）」，点 「＋ 积木」
54. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「运算」 设为 「乘以」
55. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「数值（加减时负数 = 缩小）」 设为 「2」
56. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最小半径」 设为 「5」
57. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最大半径」 设为 「100」
58. 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支：下拉框选 「显示组合文字（{名字} 换成内容）」，点 「＋ 积木」
59. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 1 块「显示组合文字（{名字} 换成内容）」：「更新」 设为 「Label · radiusLabel」
60. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 1 块「显示组合文字（{名字} 换成内容）」：「文字」 设为 「Radius: {c.radius}」
61. 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
62. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 2 块「Label 显示文字」：「更新」 设为 「Label · opLabel」
63. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 2 块「Label 显示文字」：「文字」 设为 「Last operation: Double」
64. 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
65. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支 › 第 1 块「Label 显示文字」：「更新」 设为 「Label · opLabel」
66. 积木 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 事件来自指定控件」 › 「其他事件源」分支 › 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Invalid radius」
67. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · resetBtn」，点 「添加事件」
68. 根层：下拉框选 「恢复对象初始状态」，点 「＋ 积木」
69. 积木 第 1 块「恢复对象初始状态」：「对象」 设为 「Circle · c」
70. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」
71. 积木 第 2 块「恢复控件初始文字」：「恢复」 设为 「Label · radiusLabel」
72. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」
73. 积木 第 3 块「恢复控件初始文字」：「恢复」 设为 「Label · opLabel」

页面输出：✓ 已生成 1 个源文件：CircleCalculatorApp.java。尚未编译。主类 CircleCalculatorApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[CircleCalculatorApp.java](answers/Q11/CircleCalculatorApp.java)

### 运行验收（FxSmoke）

步骤：`click:+5` → `click:Double` → `click:-5` → `click:Reset` → `click:-5` → `click:-5` → `click:-5` → `click:-5` → `click:-5` → `click:-5` → `click:Reset` → `click:Double` → `click:Double`

- ✅ 一个共享 EventHandler<ActionEvent>，用 e.getSource() 判断
- ✅ 共享 Handler 注册给 +5、-5、Double 三个按钮
- ✅ +5：半径 35，显示半径与最后操作
- ✅ Double：半径 70
- ✅ -5：半径 65
- ✅ Reset：半径 30，两个 Label 恢复
- ✅ 低于 5：不修改（停在 5），显示 Invalid radius
- ✅ 超过 100（60 × 2）：不修改，显示 Invalid radius

## Q12

**Window Close Request（40）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

新的积木范例「关窗锁定：布尔变量 + Unlock 按钮」就是这道题：boolean 变量 locked，CloseRequest 里锁定时 e.consume()，Unlock 把 locked 设为 false。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「关窗锁定：布尔变量 + Unlock 按钮」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「WindowLockApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Window Lock」

页面输出：✓ 已生成 1 个源文件：WindowLockApp.java。尚未编译。主类 WindowLockApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[WindowLockApp.java](answers/Q12/WindowLockApp.java)

### 运行验收（FxSmoke）

步骤：`closecheck` → `click:Unlock` → `closecheck`

- ✅ 使用 stage.setOnCloseRequest()，状态保存在 boolean 字段
- ✅ 锁定时关闭：调用 e.consume()，显示 Closing is not allowed
- ✅ Unlock：Window unlocked
- ✅ 解锁后再关闭：允许关闭

## Q13

**JavaFX Stopwatch（60）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

新的积木范例「Timeline 计时器：Start / Pause / Reset」：Timeline 控件每 1000 ms 触发 KeyFrame，int 变量 seconds 加 1，Label 显示 Time: {seconds}。play() 对已在运行的 Timeline 不会再启动一次，所以重复点 Start 不会加速。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「Timeline 计时器：Start / Pause / Reset」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「StopwatchApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Stopwatch」

页面输出：✓ 已生成 1 个源文件：StopwatchApp.java。尚未编译。主类 StopwatchApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[StopwatchApp.java](answers/Q13/StopwatchApp.java)

### 运行验收（FxSmoke）

步骤：`click:Start` → `wait:3250` → `click:Pause` → `wait:1200` → `click:Start` → `click:Start` → `wait:2100` → `click:Reset` → `wait:1200`

- ✅ 使用 Timeline 和 KeyFrame，持续运行
- ✅ 初始 Time: 0
- ✅ Start 约 3 秒：Time: 3
- ✅ Pause 后数值不变
- ✅ 再 Start（连点两次）约 2 秒：只加 2，不加速
- ✅ Reset：停止并恢复 Time: 0

## Q14

**Automatic Circle Movement（40）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

Timeline 控件（200 ms）的 KeyFrame 事件里用「在边界内移动」：X + 5，上限 280；到边界时走「会越界」分支，「控制 Timeline」stop。Stop 按钮 pause，Reset 按钮 stop 后恢复圆的初始位置。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「CircleMoverApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Circle Mover」
5. 控件区：类型选 「Pane」，变量名填 「pane」，点 「添加控件」
6. 控件区：类型选 「Circle」，变量名填 「c」，点 「添加控件」
7. 控件 「Circle · c」：「圆心 X」 设为 「50」
8. 控件区：类型选 「Timeline」，变量名填 「timeline」，点 「添加控件」
9. 控件 「Timeline · timeline」：「间隔（毫秒）」 设为 「200」
10. 控件区：类型选 「Button」，变量名填 「startBtn」，文字填 「Start」，点 「添加控件」
11. 控件区：类型选 「Button」，变量名填 「stopBtn」，文字填 「Stop」，点 「添加控件」
12. 控件区：类型选 「Button」，变量名填 「resetBtn」，文字填 「Reset」，点 「添加控件」
13. 事件区：选 「Timeline 每次触发 KeyFrame」，注册到 「Timeline · timeline」，点 「添加事件」
14. 根层：下拉框选 「在边界内移动」，点 「＋ 积木」
15. 积木 第 1 块「在边界内移动」：「位移」 设为 「5」
16. 积木 第 1 块「在边界内移动」：「下限」 设为 「0」
17. 积木 第 1 块「在边界内移动」：「上限」 设为 「280」
18. 第 1 块「在边界内移动」 › 「会越界」分支：下拉框选 「控制 Timeline」，点 「＋ 积木」
19. 积木 第 1 块「在边界内移动」 › 「会越界」分支 › 第 1 块「控制 Timeline」：「动作」 设为 「stop 停止」
20. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · startBtn」，点 「添加事件」
21. 根层：下拉框选 「控制 Timeline」，点 「＋ 积木」
22. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · stopBtn」，点 「添加事件」
23. 根层：下拉框选 「控制 Timeline」，点 「＋ 积木」
24. 积木 第 1 块「控制 Timeline」：「动作」 设为 「pause 暂停」
25. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · resetBtn」，点 「添加事件」
26. 根层：下拉框选 「控制 Timeline」，点 「＋ 积木」
27. 积木 第 1 块「控制 Timeline」：「动作」 设为 「stop 停止」
28. 根层：下拉框选 「恢复对象初始状态」，点 「＋ 积木」
29. 积木 第 2 块「恢复对象初始状态」：「对象」 设为 「Circle · c」

页面输出：✓ 已生成 1 个源文件：CircleMoverApp.java。尚未编译。主类 CircleMoverApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[CircleMoverApp.java](answers/Q14/CircleMoverApp.java)

### 运行验收（FxSmoke）

步骤：`click:Start` → `wait:2100` → `click:Stop` → `wait:600` → `click:Start` → `wait:9500` → `click:Start` → `wait:1200` → `click:Reset` → `wait:600`

- ✅ 初始 centerX = 50
- ✅ Start 约 2 秒：每 200 ms + 5（约 100）
- ✅ Stop 暂停，位置不变
- ✅ 继续后到达 280 自动停止
- ✅ 到 280 后再按 Start：X 不超过 280
- ✅ Reset：停止并恢复 X = 50

## Q15

**Student Registration Form（60）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

Register 和 Age 输入框共用一个 Handler（Enter 也能注册）。「如果 · 条件积木」选「输入框是空的」判断 Name；「读取输入框里的有限数字」选「整数 int」（Integer.parseInt + try-catch）检查 [10,100]；成功时组合文字 Registered: {nameInput}, Age: {age}。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「RegistrationApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Student Registration」
5. 控件区：类型选 「TextField」，变量名填 「nameInput」，文字填 「」，点 「添加控件」
6. 控件 「TextField · nameInput」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
7. 控件区：类型选 「TextField」，变量名填 「ageInput」，文字填 「」，点 「添加控件」
8. 控件 「TextField · ageInput」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
9. 控件区：类型选 「Button」，变量名填 「registerBtn」，文字填 「Register」，点 「添加控件」
10. 控件区：类型选 「Button」，变量名填 「clearBtn」，文字填 「Clear」，点 「添加控件」
11. 控件区：类型选 「Label」，变量名填 「statusLabel」，文字填 「Ready」，点 「添加控件」
12. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · registerBtn」，点 「添加事件」
13. 当前事件：「写法」 设为 「多个控件共用 Handler（getSource 区分）」
14. 当前事件：「第二个控件」 设为 「TextField · ageInput」
15. 根层：下拉框选 「如果 · 条件积木」，点 「＋ 积木」
16. 积木 第 1 块「如果 · 条件积木」：「判断条件」 设为 「输入框是空的（只有空格也算）」
17. 积木 第 1 块「如果 · 条件积木」：「输入框」 设为 「TextField · nameInput」
18. 第 1 块「如果 · 条件积木」 › 「条件成立」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
19. 积木 第 1 块「如果 · 条件积木」 › 「条件成立」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Invalid name」
20. 第 1 块「如果 · 条件积木」 › 「否则」分支：下拉框选 「读取输入框里的有限数字」，点 「＋ 积木」
21. 积木 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「读取输入框里的有限数字」：「读取」 设为 「TextField · ageInput」
22. 积木 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「读取输入框里的有限数字」：「结果名称」 设为 「age」
23. 积木 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「读取输入框里的有限数字」：「下限（可空）」 设为 「10」
24. 积木 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「读取输入框里的有限数字」：「上限（可空）」 设为 「100」
25. 积木 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「读取输入框里的有限数字」：「数字类型」 设为 「整数 int（Integer.parseInt）」
26. 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支：下拉框选 「显示组合文字（{名字} 换成内容）」，点 「＋ 积木」
27. 积木 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「显示组合文字（{名字} 换成内容）」：「文字」 设为 「Registered: {nameInput}, Age: {age}」
28. 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「读取输入框里的有限数字」 › 「数字无效或超出范围」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
29. 积木 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「读取输入框里的有限数字」 › 「数字无效或超出范围」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Invalid age」
30. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · clearBtn」，点 「添加事件」
31. 根层：下拉框选 「清空 TextField」，点 「＋ 积木」
32. 积木 第 1 块「清空 TextField」：「清空」 设为 「TextField · nameInput」
33. 根层：下拉框选 「清空 TextField」，点 「＋ 积木」
34. 积木 第 2 块「清空 TextField」：「清空」 设为 「TextField · ageInput」
35. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」
36. 积木 第 3 块「恢复控件初始文字」：「恢复」 设为 「Label · statusLabel」

页面输出：✓ 已生成 1 个源文件：RegistrationApp.java。尚未编译。主类 RegistrationApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[RegistrationApp.java](answers/Q15/RegistrationApp.java)

### 运行验收（FxSmoke）

步骤：`type:0:John` → `type:1:20` → `click:Register` → `type:0: ` → `type:1:20` → `click:Register` → `type:0:John` → `type:1:abc` → `click:Register` → `type:1:-5` → `click:Register` → `type:1:20.5` → `click:Register` → `type:1:25` → `enter:1` → `click:Clear`

- ✅ 使用 Integer.parseInt() 和 try-catch
- ✅ John / 20：Registered: John, Age: 20
- ✅ 空白 / 20：Invalid name
- ✅ John / abc：Invalid age
- ✅ John / -5：Invalid age
- ✅ Age 20.5 不是整数：Invalid age
- ✅ Age 输入框按 Enter 执行注册
- ✅ Clear：两个输入框清空，Label Ready

## Q16

**JavaFX Alert and Confirmation（40）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

boolean 变量 deleted；Delete 先看 deleted，已删除时「弹出提示框 Alert」（INFORMATION），否则「如果 · 确认框点了 OK」（CONFIRMATION + showAndWait）。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「DeleteConfirmApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Delete Confirm」
5. 控件区：类型选 「Label」，变量名填 「itemLabel」，文字填 「Item available」，点 「添加控件」
6. 控件 「Label · itemLabel」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
7. 控件区：类型选 「Button」，变量名填 「deleteBtn」，文字填 「Delete」，点 「添加控件」
8. 控件区：类型选 「Button」，变量名填 「resetBtn」，文字填 「Reset」，点 「添加控件」
9. 变量区：类型选 「boolean」，变量名填 「deleted」，初始值填 「false」，点 「添加变量」
10. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · deleteBtn」，点 「添加事件」
11. 根层：下拉框选 「如果 · 条件积木」，点 「＋ 积木」
12. 积木 第 1 块「如果 · 条件积木」：「判断条件」 设为 「布尔变量为 true」
13. 积木 第 1 块「如果 · 条件积木」：「变量」 设为 「boolean · deleted」
14. 第 1 块「如果 · 条件积木」 › 「条件成立」分支：下拉框选 「弹出提示框 Alert」，点 「＋ 积木」
15. 积木 第 1 块「如果 · 条件积木」 › 「条件成立」分支 › 第 1 块「弹出提示框 Alert」：「内容」 设为 「No item to delete」
16. 第 1 块「如果 · 条件积木」 › 「否则」分支：下拉框选 「如果 · 确认框点了 OK（CONFIRMATION）」，点 「＋ 积木」
17. 积木 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「如果 · 确认框点了 OK（CONFIRMATION）」：「确认框内容」 设为 「Are you sure you want to delete?」
18. 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「如果 · 确认框点了 OK（CONFIRMATION）」 › 「点了 OK」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
19. 积木 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「如果 · 确认框点了 OK（CONFIRMATION）」 › 「点了 OK」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Item deleted」
20. 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「如果 · 确认框点了 OK（CONFIRMATION）」 › 「点了 OK」分支：下拉框选 「设置布尔变量」，点 「＋ 积木」
21. 积木 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 1 块「如果 · 确认框点了 OK（CONFIRMATION）」 › 「点了 OK」分支 › 第 2 块「设置布尔变量」：「值」 设为 「true」
22. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · resetBtn」，点 「添加事件」
23. 根层：下拉框选 「恢复变量初始值」，点 「＋ 积木」
24. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」

页面输出：✓ 已生成 1 个源文件：DeleteConfirmApp.java。尚未编译。主类 DeleteConfirmApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[DeleteConfirmApp.java](answers/Q16/DeleteConfirmApp.java)

### 运行验收（FxSmoke）

步骤：`answer:CANCEL` → `click:Delete` → `answer:OK` → `click:Delete` → `click:Delete` → `click:Reset` → `click:Delete`

- ✅ Alert.AlertType.CONFIRMATION，内容 Are you sure you want to delete?
- ✅ 取消：Label 保持 Item available
- ✅ 确认：Label 改为 Item deleted
- ✅ 已删除再 Delete：INFORMATION Alert No item to delete
- ✅ Reset 恢复初始状态，可以再次删除

## Q17

**RGB Colour Controller（60）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

三个「读取输入框里的有限数字」嵌套（整数 int，范围 [0,255]），最里层「用数字设置颜色 Color.rgb(r, g, b)」和组合文字 RGB: ({r}, {g}, {b})；任一层失败显示 Invalid RGB values。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「RgbApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「RGB Colour Controller」
5. 控件区：类型选 「Pane」，变量名填 「pane」，点 「添加控件」
6. 控件区：类型选 「Circle」，变量名填 「c」，点 「添加控件」
7. 控件 「Circle · c」：「半径」 设为 「40」
8. 控件区：类型选 「TextField」，变量名填 「redInput」，文字填 「0」，点 「添加控件」
9. 控件 「TextField · redInput」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
10. 控件区：类型选 「TextField」，变量名填 「greenInput」，文字填 「0」，点 「添加控件」
11. 控件 「TextField · greenInput」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
12. 控件区：类型选 「TextField」，变量名填 「blueInput」，文字填 「255」，点 「添加控件」
13. 控件 「TextField · blueInput」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
14. 控件区：类型选 「Button」，变量名填 「applyBtn」，文字填 「Apply」，点 「添加控件」
15. 控件区：类型选 「Button」，变量名填 「resetBtn」，文字填 「Reset」，点 「添加控件」
16. 控件区：类型选 「Label」，变量名填 「statusLabel」，文字填 「Ready」，点 「添加控件」
17. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · applyBtn」，点 「添加事件」
18. 根层：下拉框选 「读取输入框里的有限数字」，点 「＋ 积木」
19. 积木 第 1 块「读取输入框里的有限数字」：「读取」 设为 「TextField · redInput」
20. 积木 第 1 块「读取输入框里的有限数字」：「结果名称」 设为 「r」
21. 积木 第 1 块「读取输入框里的有限数字」：「下限（可空）」 设为 「0」
22. 积木 第 1 块「读取输入框里的有限数字」：「上限（可空）」 设为 「255」
23. 积木 第 1 块「读取输入框里的有限数字」：「数字类型」 设为 「整数 int（Integer.parseInt）」
24. 第 1 块「读取输入框里的有限数字」 › 「数字无效或超出范围」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
25. 积木 第 1 块「读取输入框里的有限数字」 › 「数字无效或超出范围」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Invalid RGB values」
26. 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支：下拉框选 「读取输入框里的有限数字」，点 「＋ 积木」
27. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」：「读取」 设为 「TextField · greenInput」
28. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」：「结果名称」 设为 「g」
29. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」：「下限（可空）」 设为 「0」
30. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」：「上限（可空）」 设为 「255」
31. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」：「数字类型」 设为 「整数 int（Integer.parseInt）」
32. 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「数字无效或超出范围」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
33. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「数字无效或超出范围」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Invalid RGB values」
34. 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支：下拉框选 「读取输入框里的有限数字」，点 「＋ 积木」
35. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」：「读取」 设为 「TextField · blueInput」
36. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」：「结果名称」 设为 「b」
37. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」：「下限（可空）」 设为 「0」
38. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」：「上限（可空）」 设为 「255」
39. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」：「数字类型」 设为 「整数 int（Integer.parseInt）」
40. 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「数字无效或超出范围」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
41. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「数字无效或超出范围」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Invalid RGB values」
42. 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支：下拉框选 「用数字设置颜色 Color.rgb(r, g, b)」，点 「＋ 积木」
43. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「用数字设置颜色 Color.rgb(r, g, b)」：「读取结果」 设为 「g」
44. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「用数字设置颜色 Color.rgb(r, g, b)」：「读取结果」 设为 「b」
45. 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支：下拉框选 「显示组合文字（{名字} 换成内容）」，点 「＋ 积木」
46. 积木 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 1 块「读取输入框里的有限数字」 › 「读取成功」分支 › 第 2 块「显示组合文字（{名字} 换成内容）」：「文字」 设为 「RGB: ({r}, {g}, {b})」
47. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · resetBtn」，点 「添加事件」
48. 根层：下拉框选 「恢复对象初始状态」，点 「＋ 积木」
49. 积木 第 1 块「恢复对象初始状态」：「对象」 设为 「Circle · c」
50. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」
51. 积木 第 2 块「恢复控件初始文字」：「恢复」 设为 「TextField · redInput」
52. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」
53. 积木 第 3 块「恢复控件初始文字」：「恢复」 设为 「TextField · greenInput」
54. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」
55. 积木 第 4 块「恢复控件初始文字」：「恢复」 设为 「TextField · blueInput」
56. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」
57. 积木 第 5 块「恢复控件初始文字」：「恢复」 设为 「Label · statusLabel」

页面输出：✓ 已生成 1 个源文件：RgbApp.java。尚未编译。主类 RgbApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[RgbApp.java](answers/Q17/RgbApp.java)

### 运行验收（FxSmoke）

步骤：`type:0:255` → `type:1:0` → `type:2:0` → `click:Apply` → `type:0:256` → `click:Apply` → `type:0:abc` → `click:Apply` → `click:Reset`

- ✅ 使用 Color.rgb(r, g, b) 并处理 NumberFormatException
- ✅ (255,0,0)：变红，显示 RGB: (255, 0, 0)
- ✅ (256,0,0)：Invalid RGB values，颜色不变
- ✅ (abc,0,0)：Invalid RGB values，颜色不变
- ✅ Reset：蓝色，输入框 0、0、255，Label Ready

## Q18

**Interface, Inheritance and Polymorphism（40）** · ❌ builder 没有可用的页面

所有生成器都输出 JavaFX 程序。「Shape 程序」的接口和父类是 draw(Pane) 结构，不能改成 String describe()、private name 和 ShapeTest 控制台程序；「骨架补全」要先有题目给的 .java。

### builder 做不到的要求

- Drawable.describe()、BaseShape(name)、CircleShape / RectangleShape
- ShapeTest 用 ArrayList<Drawable> 循环调用

## Q19

**Multiple Window Application（60）** · ❌ builder 没有可用的页面

只有讲义例程「两个窗口：再建一个 Stage」，它是固定程序；积木工作台只生成一个窗口。

### builder 做不到的要求

- 第二个 Stage 与 TextField / Save
- 跨窗口更新主窗口 Label
- 最多一个设置窗口
- Reset

## Q20

**FlowPane and Dynamic Controls（40）** · ❌ builder 没有可用的页面

只有讲义例程「FlowPane：自动换行排列」，是固定的标签和输入框；积木的控件只能放在 BorderPane 的四个区域，不能运行时新增 Label。

### builder 做不到的要求

- 运行时新建 Label 加进 FlowPane
- Clear 只删用户添加的 Label
- Label 的内边距与背景色

## Q21

**Simple Library GUI（60）** · ✅ 只用 builder 完成全部要求 · 页面：记录 + 文件（Lab 3 型）

Lab 3 范例：只留 Add、Borrow / Return 和 Clear；新的「操作哪条记录」选「选中的行；没选中时按输入框里的主键查找」，ListView 下也能按输入的 ISBN 借还；「提示文字」分组改重复和找不到的提示；空输入提示用文字替换。

### 操作顺序

1. 左侧导航点 「记录 + 文件（Lab 3 型）」
2. 「载入范例…」 选 「Lab 3 原题：Book + 借还 + books.txt」，确认替换
3. 「主类名」 设为 「LibraryApp」
4. 「窗口标题 / Alert 标题」 设为 「Library」
5. 「Delete / 状态 / 数值按钮操作哪条记录」 设为 「选中的行；没选中时按输入框里的主键查找」
6. 「Edit + Save（编辑模式）」 设为 「否」
7. 「Delete」 设为 「否」
8. 「Search（部分匹配）」 设为 「否」
9. 「Display All」 设为 「否」
10. 「Load Test Data」 设为 「否」
11. 「Exit」 设为 「否」
12. 「排序按钮」 设为 「否」
13. 「主键重复时（{key} = 输入的主键）」 设为 「Duplicate ISBN」
14. 「找不到记录时（{key} = 输入的主键）」 设为 「Book not found」
15. 「替换」 列表点 「＋ 添加」
16. 「替换」 第 1 行：「原文（从右侧代码里复制引号内的文字）」 设为 「Please enter both ISBN and Title.」
17. 「替换」 第 1 行：「换成」 设为 「Missing information」

页面输出：✓ 已生成 2 个源文件：Book.java、LibraryApp.java。尚未编译。主类 LibraryApp（在 BlueJ 中右键它 → Run JavaFX Application）。 • 数据文件 books.txt 在 BlueJ 项目文件夹里读写；第一次保存时自动创建。

生成文件：[Book.java](answers/Q21/Book.java)、[LibraryApp.java](answers/Q21/LibraryApp.java)

### 运行验收（FxSmoke）

步骤：`click:Add` → `type:0:001` → `type:1:Java Basics` → `click:Add` → `type:0:001` → `type:1:Again` → `click:Add` → `type:0:001` → `click:Borrow` → `click:Borrow` → `click:Return` → `click:Return` → `type:0:999` → `click:Borrow` → `type:0:001` → `type:1:x` → `click:Clear`

- ✅ ArrayList<Book> + ListView<String>，没有 TableView
- ✅ 空输入 Add：Missing information
- ✅ Add：001 Java Basics 默认 available
- ✅ 重复 ISBN：显示 Duplicate ISBN
- ✅ Borrow（按输入的 ISBN，未选中行）：available 改为 false 并刷新
- ✅ 已借出再 Borrow：拒绝
- ✅ Return：改回 true；再 Return：拒绝
- ✅ 找不到书：显示 Book not found
- ✅ Clear 只清空输入框，不删除 Book

## Q22

**Book and Library Classes（40）** · 🟡 只用 builder 完成一部分 · 页面：记录 + 文件（Lab 3 型）

「记录 + 文件」生成 Book.java：private 字段、构造器、getter / setter；显示格式写成 {isbn} - {title} [{available|Available|Borrowed}]，toString() 得到 001 - Java Basics [Available]。Library.java 仍没有页面能生成（同一页面生成的主程序留在 answers 里供参考）。

### 操作顺序

1. 左侧导航点 「记录 + 文件（Lab 3 型）」
2. 「载入范例…」 选 「Lab 3 原题：Book + 借还 + books.txt」，确认替换
3. 「输出方式」 设为 「每个类一个文件」
4. 「每条记录的显示格式（留空 = toString；例 {code} | Qty: {quantity} | ${price:.2f}；题目给的类还可以写 {getGrade()}）」 设为 「{isbn} - {title} [{available|Available|Borrowed}]」

页面输出：✓ 已生成 2 个源文件：Book.java、LibraryAdminApp.java。尚未编译。主类 LibraryAdminApp（在 BlueJ 中右键它 → Run JavaFX Application）。 • 数据文件 books.txt 在 BlueJ 项目文件夹里读写；第一次保存时自动创建。

生成文件：[Book.java](answers/Q22/Book.java)、[LibraryAdminApp.java](answers/Q22/LibraryAdminApp.java)

### builder 做不到的要求

- Library.java 的 addBook / findBook / borrowBook / returnBook（返回 true / false、找不到返回 null）

## Q23

**Persistent Notes Application（60）** · 🟡 只用 builder 完成一部分 · 页面：记录 + 文件（Lab 3 型）

用「手动 Save/Load」范例改成只有一个字段 text 的 Note 记录，TextArea 显示，文件 notes.txt；新的「Clear 同时清空内存里的全部记录」让 Clear 清空列表而不写文件。

### 操作顺序

1. 左侧导航点 「记录 + 文件（Lab 3 型）」
2. 「载入范例…」 选 「变体：Contact + 自定义按钮文字 + 手动 Save/Load + 总数 Label」，确认替换
3. 「主类名」 设为 「NotesApp」
4. 「记录类名（如 Book）」 设为 「Note」
5. 「窗口标题 / Alert 标题」 设为 「Notes Manager」
6. 「数据文件名」 设为 「notes.txt」
7. 「输出方式」 设为 「合并成一个文件」
8. 「记录显示在」 设为 「TextArea（按输入的主键操作）」
9. 「字段」 第 3 行点 × 删除
10. 「字段」 第 2 行点 × 删除
11. 「字段」 第 1 行：「字段名」 设为 「text」
12. 「字段」 第 1 行：「显示名（界面/提示用）」 设为 「Note」
13. 「字段」 第 1 行：「getter 名（setter 自动对应）」 设为 「getText」
14. 「字段」 第 1 行：「可搜索」 设为 「否」
15. 「Add」 下方的 「↳ 按钮文字」 设为 「Add」
16. 「Delete」 设为 「否」
17. 「Search（部分匹配）」 设为 「否」
18. 「Display All」 设为 「否」
19. 「Clear」 设为 「是」
20. 「↳ Clear 同时清空内存里的全部记录（不写文件）」 设为 「是」
21. 「Exit」 设为 「否」
22. 「↳ 保存按钮文字」 设为 「Save」
23. 「↳ 读取按钮文字」 设为 「Load」
24. 「总数 Label（留空 = 没有；例 Total contacts: {count}）」 设为 「」
25. 「替换」 列表点 「＋ 添加」
26. 「替换」 第 1 行：「原文（从右侧代码里复制引号内的文字）」 设为 「Please enter Note.」
27. 「替换」 第 1 行：「换成」 设为 「Empty note」
28. 「替换」 列表点 「＋ 添加」
29. 「替换」 第 2 行：「原文（从右侧代码里复制引号内的文字）」 设为 「Unable to load note records from notes.txt. Line 」
30. 「替换」 第 2 行：「换成」 设为 「File not found. Line 」

页面输出：✓ 已生成 1 个源文件：NotesApp.java。尚未编译。主类 NotesApp（在 BlueJ 中右键它 → Run JavaFX Application）。 • 数据文件 notes.txt 在 BlueJ 项目文件夹里；只有点「Save」才写入，点「Load」才读取。

生成文件：[NotesApp.java](answers/Q23/NotesApp.java)

### builder 做不到的要求

- ArrayList<String>：记录生成器总是 ArrayList<记录类>（这里是 ArrayList<Note>）
- 相同内容的笔记不能重复添加（text 是主键）
- 文件不存在时的提示：用文字替换只能改出 File not found. Line 1: notes.txt（后半句是固定拼接的）

### 运行验收（FxSmoke）

第 1 次启动：`click:Add` → `type:0:Buy milk` → `click:Add` → `type:0:Call Tom` → `click:Add` → `click:Save` → `click:Clear` → `click:Load`
第 2 次启动（新的空文件夹）：`click:Load` → `type:0:After missing file` → `click:Add`

- ❌ 使用 ArrayList<String> 保存笔记（实际：ArrayList<Note>）
- ✅ 空输入 Add：Empty note
- ✅ Add 两条后 TextArea 显示两条
- ✅ Save：notes.txt 每条一行
- ✅ Clear：清空内存列表和 TextArea，文件不变
- ✅ Load：恢复两条笔记
- ✅ 文件不存在时 Load：显示 File not found，不崩溃
- ✅ 文件不存在后仍能 Add

## Q24

**Load and Save Book Records（40）** · ❌ builder 没有可用的页面

把题目给的两个方法签名粘进「骨架补全」，两个方法都显示「未识别的方法，请手写」。「记录 + 文件」的读写写在主程序里，不能生成独立的 LibraryFileManager。

### builder 做不到的要求

- static save(ArrayList<Book>, String) throws IOException
- static load(String) throws IOException，文件不存在返回空列表

## Q25

**Library Borrowing and Returning GUI（60）** · ✅ 只用 builder 完成全部要求 · 页面：记录 + 文件（Lab 3 型）

Lab 3 范例改成：ListView 显示、按输入的 ISBN 借还、只留 ISBN 输入框和 Borrow / Return / Save；「启动时没有记录就放入测试数据」放入三条初始记录；手动保存且不要读取按钮。

### 操作顺序

1. 左侧导航点 「记录 + 文件（Lab 3 型）」
2. 「载入范例…」 选 「Lab 3 原题：Book + 借还 + books.txt」，确认替换
3. 「主类名」 设为 「LibraryBorrowApp」
4. 「窗口标题 / Alert 标题」 设为 「Library Borrowing」
5. 「输出方式」 设为 「合并成一个文件」
6. 「Delete / 状态 / 数值按钮操作哪条记录」 设为 「选中的行；没选中时按输入框里的主键查找」
7. 「字段」 第 2 行：「可搜索」 设为 「否」
8. 「字段」 第 2 行：「表单里有输入框」 设为 「否」
9. 「Add」 设为 「否」
10. 「Edit + Save（编辑模式）」 设为 「否」
11. 「Delete」 设为 「否」
12. 「Search（部分匹配）」 设为 「否」
13. 「Display All」 设为 「否」
14. 「Load Test Data」 设为 「否」
15. 「Clear」 设为 「否」
16. 「Exit」 设为 「否」
17. 「排序按钮」 设为 「否」
18. 「什么时候读写文件」 设为 「手动：只有点 Save / Load 按钮才读写」
19. 「↳ 保存按钮文字」 设为 「Save」
20. 「↳ 要读取按钮」 设为 「否」
21. 「测试数据（每行一条，使用①所选分隔符）」 设为 「001,Java Basics,true
002,Python Intro,false
003,Web Systems,true」
22. 「启动时没有记录就放入上面的测试数据（题目给的初始记录）」 设为 「是」

页面输出：✓ 已生成 1 个源文件：LibraryBorrowApp.java。尚未编译。主类 LibraryBorrowApp（在 BlueJ 中右键它 → Run JavaFX Application）。 • 数据文件 books.txt 在 BlueJ 项目文件夹里；只有点「Save」才写入，点「Load from File」才读取。

生成文件：[LibraryBorrowApp.java](answers/Q25/LibraryBorrowApp.java)

### 运行验收（FxSmoke）

步骤：`type:0:001` → `click:Borrow` → `click:Borrow` → `type:0:002` → `click:Return` → `click:Return` → `type:0:999` → `click:Borrow` → `click:Save`

- ✅ ListView<String> 显示，按钮只有 Borrow / Return / Save
- ✅ 启动时显示三条初始记录
- ✅ Borrow 001：变为借出
- ✅ 重复借出：拒绝且不修改
- ✅ Return 002：变为可借
- ✅ 重复归还：拒绝
- ✅ 找不到 ISBN：提示且不修改
- ✅ Save：books.txt 三行，001 false、002 true

## Q26

**Search and Delete with ArrayList（40）** · ❌ builder 没有可用的页面

把题目给的字段和三个方法签名粘进「骨架补全」，三个方法都显示「未识别的方法，请手写」。

### builder 做不到的要求

- findByIsbn 精确匹配
- searchByTitle 不区分大小写的部分匹配、空关键词返回空列表
- deleteBook 返回 true / false

## Q27

**Automatic Moving Player（60）** · ✅ 只用 builder 完成全部要求 · 页面：Shape 程序（A2 型）

Timeline 小球范例改成：启动时就有圆、X 范围 [20,280]（动画到边界自动停止）、方向键每次 10（只留左右方向的方法名）、点击圆在蓝 / 红之间切换，状态 Label 显示 Started / Paused / X: … / Boundary reached。

### 操作顺序

1. 左侧导航点 「Shape 程序（A2 型）」
2. 「载入范例…」 选 「变体：Timeline 动画小球（Start / Stop / Reset）」，确认替换
3. 「主类名（= 文件名）」 设为 「PlayerApp」
4. 「窗口标题（{name} 会换成你的姓名）」 设为 「Player Controller」
5. 「输出方式」 设为 「全部合并成一个文件」
6. 「初始 x」 设为 「50」
7. 「初始 y」 设为 「100」
8. 「新图形颜色」 设为 「BLUE」
9. 「图形子类」 第 1 行：「半径 radius 默认值」 设为 「15」
10. 「启动时先放一个图形」 设为 「Ball」
11. 「按钮」 第 1 行点 × 删除
12. 「按钮」 第 1 行：「成功后状态 Label 显示（可空；可用 {x} {y} {angle} {area} {class}）」 设为 「Started」
13. 「按钮」 第 2 行：「按钮文字（照题目写）」 设为 「Pause」
14. 「按钮」 第 2 行：「成功后状态 Label 显示（可空；可用 {x} {y} {angle} {area} {class}）」 设为 「Paused」
15. 「按钮」 第 3 行：「成功后状态 Label 显示（可空；可用 {x} {y} {angle} {area} {class}）」 设为 「Reset」
16. 「窗口里显示状态 Label」 设为 「是」
17. 「X 下限（留空 = 不限）」 设为 「20」
18. 「X 上限（留空 = 不限）」 设为 「280」
19. 「方向键 / 动画每次移动后的提示（可空，例 X: {x}）」 设为 「X: {x}」
20. 「方向键移动当前图形」 设为 「方向键调用对应的移动方法」
21. 「方向键每次移动（留空 = 与按钮相同）」 设为 「10」
22. 「鼠标操作当前图形」 设为 「点击图形：在新图形颜色和下面的颜色之间切换」
23. 「点击切换到的颜色」 设为 「RED」
24. 「动画间隔（毫秒）」 设为 「300」
25. 「上移方法」 设为 「」
26. 「下移方法」 设为 「」
27. 「添加时在控制台打印面积周长」 设为 「否」

页面输出：✓ 已生成 1 个源文件：PlayerApp.java。尚未编译。主类 PlayerApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[PlayerApp.java](answers/Q27/PlayerApp.java)

### 运行验收（FxSmoke）

步骤：`click:Start` → `wait:1550` → `click:Pause` → `key:RIGHT` → `key:LEFT` → `hit:CLICKED:75:100` → `hit:CLICKED:75:100` → `key:UP` → `click:Reset` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `key:RIGHT` → `click:Start` → `wait:1500` → `key:LEFT`

- ✅ 启动时就有圆心 (50,100)、半径 15 的蓝色圆
- ✅ Start：每 300 ms X + 5（1.5 秒约 75），Label 反映位置
- ✅ Pause：位置不变，Label Paused
- ✅ RIGHT 键：X + 10，Label X: …
- ✅ LEFT 键：X - 10
- ✅ 点击圆：蓝 → 红 → 蓝
- ✅ UP 键不移动（只支持 LEFT / RIGHT）
- ✅ Reset：回到 (50,100)，蓝色
- ✅ RIGHT 到 270 后再按：停在 280
- ✅ Timeline 到 280 自动停止，Label Boundary reached
- ✅ 自动停止后 LEFT 仍可移动：270

## Q28

**Window Closing and Validation（40）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

String 变量 savedName（初始为空）。Save：输入框为空 → Invalid name，否则 savedName = 输入框内容。CloseRequest：「输入框文字等于文字变量」取反（内容不同）时 CONFIRMATION Unsaved changes. Exit?，取消时 e.consume()。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「SaveNameApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Save Name」
5. 控件区：类型选 「TextField」，变量名填 「studentName」，文字填 「」，点 「添加控件」
6. 控件 「TextField · studentName」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
7. 控件区：类型选 「Label」，变量名填 「statusLabel」，文字填 「Ready」，点 「添加控件」
8. 控件 「Label · statusLabel」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
9. 控件区：类型选 「Button」，变量名填 「saveBtn」，文字填 「Save」，点 「添加控件」
10. 控件区：类型选 「Button」，变量名填 「resetBtn」，文字填 「Reset」，点 「添加控件」
11. 变量区：类型选 「String」，变量名填 「savedName」，初始值填 「」，点 「添加变量」
12. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · saveBtn」，点 「添加事件」
13. 根层：下拉框选 「如果 · 条件积木」，点 「＋ 积木」
14. 积木 第 1 块「如果 · 条件积木」：「判断条件」 设为 「输入框是空的（只有空格也算）」
15. 积木 第 1 块「如果 · 条件积木」：「输入框」 设为 「TextField · studentName」
16. 第 1 块「如果 · 条件积木」 › 「条件成立」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
17. 积木 第 1 块「如果 · 条件积木」 › 「条件成立」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Invalid name」
18. 第 1 块「如果 · 条件积木」 › 「否则」分支：下拉框选 「文字变量 = 输入框内容」，点 「＋ 积木」
19. 第 1 块「如果 · 条件积木」 › 「否则」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
20. 积木 第 1 块「如果 · 条件积木」 › 「否则」分支 › 第 2 块「Label 显示文字」：「文字」 设为 「Saved」
21. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · resetBtn」，点 「添加事件」
22. 根层：下拉框选 「恢复变量初始值」，点 「＋ 积木」
23. 根层：下拉框选 「清空 TextField」，点 「＋ 积木」
24. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」
25. 积木 第 3 块「恢复控件初始文字」：「恢复」 设为 「Label · statusLabel」
26. 事件区：选 「点关闭按钮 CloseRequest」，注册到 「Stage · stage」，点 「添加事件」
27. 根层：下拉框选 「如果 · 条件积木」，点 「＋ 积木」
28. 积木 第 1 块「如果 · 条件积木」：「判断条件」 设为 「取反」
29. 积木 第 1 块「如果 · 条件积木」：「要取反的条件」 设为 「输入框文字等于文字变量」
30. 积木 第 1 块「如果 · 条件积木」：「输入框」 设为 「TextField · studentName」
31. 积木 第 1 块「如果 · 条件积木」：「文字变量」 设为 「String · savedName」
32. 第 1 块「如果 · 条件积木」 › 「条件成立」分支：下拉框选 「如果 · 确认框点了 OK（CONFIRMATION）」，点 「＋ 积木」
33. 积木 第 1 块「如果 · 条件积木」 › 「条件成立」分支 › 第 1 块「如果 · 确认框点了 OK（CONFIRMATION）」：「确认框内容」 设为 「Unsaved changes. Exit?」
34. 第 1 块「如果 · 条件积木」 › 「条件成立」分支 › 第 1 块「如果 · 确认框点了 OK（CONFIRMATION）」 › 「点了取消或关掉」分支：下拉框选 「消耗事件 e.consume()（关窗时阻止关闭）」，点 「＋ 积木」

页面输出：✓ 已生成 1 个源文件：SaveNameApp.java。尚未编译。主类 SaveNameApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[SaveNameApp.java](answers/Q28/SaveNameApp.java)

### 运行验收（FxSmoke）

步骤：`closecheck` → `click:Save` → `type:0:Amy` → `click:Save` → `closecheck` → `type:0:Bob` → `answer:CANCEL` → `closecheck` → `answer:OK` → `closecheck` → `click:Reset` → `closecheck`

- ✅ 首次启动：空输入与空名称相同，直接允许关闭
- ✅ 空白 Save：Invalid name
- ✅ Save：保存名称并显示 Saved
- ✅ 内容相同：直接关闭
- ✅ 内容不同：弹出 Unsaved changes. Exit?，取消则 consume()
- ✅ 确认则允许关闭
- ✅ Reset：清空名称与输入框，显示 Ready，可以直接关闭

## Q29

**Mini Library Administration System（60）** · 🟡 只用 builder 完成一部分 · 页面：记录 + 文件（Lab 3 型）

Lab 3 范例改成 Book.java + MiniLibraryApp.java、TextArea 按输入的 ISBN 操作、手动 Load / Save，并勾选「启动时也读一次文件」。

### 操作顺序

1. 左侧导航点 「记录 + 文件（Lab 3 型）」
2. 「载入范例…」 选 「Lab 3 原题：Book + 借还 + books.txt」，确认替换
3. 「主类名」 设为 「MiniLibraryApp」
4. 「窗口标题 / Alert 标题」 设为 「Mini Library」
5. 「输出方式」 设为 「每个类一个文件」
6. 「记录显示在」 设为 「TextArea（按输入的主键操作）」
7. 「Edit + Save（编辑模式）」 设为 「否」
8. 「Search（部分匹配）」 设为 「否」
9. 「Display All」 设为 「否」
10. 「Load Test Data」 设为 「否」
11. 「Exit」 设为 「否」
12. 「排序按钮」 设为 「否」
13. 「什么时候读写文件」 设为 「手动：只有点 Save / Load 按钮才读写」
14. 「↳ 保存按钮文字」 设为 「Save」
15. 「↳ 读取按钮文字」 设为 「Load」
16. 「↳ 启动时也读一次文件（文件不存在就从空列表开始）」 设为 「是」

页面输出：✓ 已生成 2 个源文件：Book.java、MiniLibraryApp.java。尚未编译。主类 MiniLibraryApp（在 BlueJ 中右键它 → Run JavaFX Application）。 • 数据文件 books.txt 在 BlueJ 项目文件夹里；只有点「Save」才写入，点「Load」才读取。

生成文件：[Book.java](answers/Q29/Book.java)、[MiniLibraryApp.java](answers/Q29/MiniLibraryApp.java)

### builder 做不到的要求

- Library.java（ArrayList<Book> 与 Add / Delete / Borrow / Return 方法）：记录生成器把列表和操作都写在主程序里

### 运行验收（FxSmoke）

第 1 次启动：`type:0:001` → `type:1:Java Basics` → `click:Add` → `type:0:002` → `type:1:Python Intro` → `click:Add` → `click:Add` → `type:0:001` → `click:Borrow` → `type:0:002` → `click:Delete` → `click:Save`
第 2 次启动（同一文件夹，相当于重新运行程序）：`click:Load`

- ❌ 有 Library 类（实际：没有 Library.java）
- ✅ 首次启动（没有 books.txt）：空列表，不出错
- ✅ Add 两本书
- ✅ 重复 ISBN 被拒绝
- ✅ Borrow 001：available 改为 false
- ✅ Delete 002
- ✅ 重新运行后启动时自动显示记录，借阅状态保持
- ✅ 重新运行 → Load：借阅状态保持

## Q30

**JavaFX Debugging and Code Completion（40）** · ✅ 只用 builder 完成全部要求 · 页面：积木工作台

builder 不能读入有错的代码再修改；这里用积木重新生成一份满足全部行为要求的 DebugApp.java（BorderPane 布局，控件不重叠）。阅卷如果要求在原代码上逐处修改，这份答案的结构和原代码不同。

### 操作顺序

1. 左侧导航点 「积木工作台」
2. 「载入范例…」 选 「新建空白」，确认替换
3. 「类名、标题、窗口大小」：「类名」 设为 「DebugApp」
4. 「类名、标题、窗口大小」：「窗口标题（{name} = 姓名）」 设为 「Debug App」
5. 控件区：类型选 「Pane」，变量名填 「pane」，点 「添加控件」
6. 控件 「Pane · pane」：「宽」 设为 「300」
7. 控件 「Pane · pane」：「高」 设为 「200」
8. 控件区：类型选 「Circle」，变量名填 「c」，点 「添加控件」
9. 控件 「Circle · c」：「半径」 设为 「30」
10. 控件区：类型选 「Label」，变量名填 「label」，文字填 「Radius: 30」，点 「添加控件」
11. 控件 「Label · label」：「位置（BorderPane 区域）」 设为 「顶部 HBox」
12. 控件区：类型选 「Button」，变量名填 「growBtn」，文字填 「Grow」，点 「添加控件」
13. 控件区：类型选 「Button」，变量名填 「resetBtn」，文字填 「Reset」，点 「添加控件」
14. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · growBtn」，点 「添加事件」
15. 根层：下拉框选 「如果 · 半径改变后仍在范围内（加减或乘）」，点 「＋ 积木」
16. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「数值（加减时负数 = 缩小）」 设为 「5」
17. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最小半径」 设为 「5」
18. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」：「最大半径」 设为 「60」
19. 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支：下拉框选 「显示组合文字（{名字} 换成内容）」，点 「＋ 积木」
20. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「已改变」分支 › 第 1 块「显示组合文字（{名字} 换成内容）」：「文字」 设为 「Radius: {c.radius}」
21. 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支：下拉框选 「Label 显示文字」，点 「＋ 积木」
22. 积木 第 1 块「如果 · 半径改变后仍在范围内（加减或乘）」 › 「会超出范围（不改变）」分支 › 第 1 块「Label 显示文字」：「文字」 设为 「Maximum radius reached」
23. 事件区：选 「按钮点击 / 输入框回车 Action」，注册到 「Button · resetBtn」，点 「添加事件」
24. 根层：下拉框选 「恢复对象初始状态」，点 「＋ 积木」
25. 根层：下拉框选 「恢复控件初始文字」，点 「＋ 积木」

页面输出：✓ 已生成 1 个源文件：DebugApp.java。尚未编译。主类 DebugApp（在 BlueJ 中右键它 → Run JavaFX Application）。

生成文件：[DebugApp.java](answers/Q30/DebugApp.java)

### 运行验收（FxSmoke）

步骤：`click:Grow` → `click:Grow` → `click:Grow` → `click:Grow` → `click:Grow` → `click:Grow` → `click:Grow` → `click:Reset`

- ✅ 编译并启动；蓝色圆半径 30，Label Radius: 30
- ✅ Grow 六次：半径 60，Label Radius: 60.0
- ✅ 第七次：保持 60，显示 Maximum radius reached
- ✅ Reset：半径 30、蓝色、Label 恢复


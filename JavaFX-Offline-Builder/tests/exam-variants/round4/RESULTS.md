# 第四轮验收结果

Builder v2.2 通过离线界面完成 **28 / 30 题**。30 题均生成了源码，共 57 个 Java 文件，按题全部编译通过。真实 JavaFX 验收通过 **60 / 62 项**，两项未达标分别对应 Q07 和 Q30。

| 范围 | 全部满足 | 部分满足 |
| --- | ---: | ---: |
| Lecture 7–8 | 17 / 18 | 1 |
| Assignment 2 | 6 / 6 | 0 |
| Lab 3 | 5 / 6 | 1 |

## 两项缺口

- **Q07 · 动态 FlowPane 标签板**。讲义例程可生成静态 FlowPane 和输入框。运行时触发 Add 的检查发现没有这个按钮，也没有生成两条同名标签。
- **Q30 · 独立 Cancel 编辑操作**。选择、编辑、保存和写入文本文件均通过。运行时缺少独立 Cancel，无法丢弃未保存的题设输入并恢复原行。

测试用 Chromium 离线页面、Temurin 17.0.21.1 和 OpenJFX 17.0.2。本结果对应[这套英文题面](PAPER.md)，复跑可获得逐步操作和生成文件。[复跑说明](README.md)

## 逐题结果

| 题号 | 题目 | Builder 页面 | 验收通过 | 结论 |
| --- | --- | --- | ---: | --- |
| Q01 | Welcome Desk | 讲义例程库 | 2/2 | 全部满足 |
| Q02 | A Centred Target | 讲义例程库 | 2/2 | 全部满足 |
| Q03 | Resizable Corner Guides | 讲义例程库 | 2/2 | 全部满足 |
| Q04 | Five-Point Trail Marker | 绘图（Lecture 7） | 2/2 | 全部满足 |
| Q05 | Workshop Studio Sign | 绘图（Lecture 7） | 2/2 | 全部满足 |
| Q06 | Two Windows at Startup | 讲义例程库 | 1/1 | 全部满足 |
| Q07 | Runtime Tag Board | 讲义例程库 | 1/2 | 部分满足 |
| Q08 | Radio-Button Signal Panel | 积木工作台 | 2/2 | 全部满足 |
| Q09 | Two-Button Route Pointer | 积木工作台 | 2/2 | 全部满足 |
| Q10 | Seat Adjustment Counter | 积木工作台 | 2/2 | 全部满足 |
| Q11 | Draft Close Gate | 积木工作台 | 2/2 | 全部满足 |
| Q12 | Shift-Accelerated Lane | 积木工作台 | 2/2 | 全部满足 |
| Q13 | Workshop Timer | 积木工作台 | 2/2 | 全部满足 |
| Q14 | Confirm a Score Reset | 积木工作台 | 2/2 | 全部满足 |
| Q15 | Laboratory Thermometer | 表单计算器 | 2/2 | 全部满足 |
| Q16 | Average Speed Desk | 表单计算器 | 2/2 | 全部满足 |
| Q17 | Zero-Rate Loan | 表单计算器 | 2/2 | 全部满足 |
| Q18 | Two Actions, One Handler | 积木工作台 | 2/2 | 全部满足 |
| Q19 | Bounded Circle Gauge | Shape 程序（A2 型） | 3/3 | 全部满足 |
| Q20 | Parcel Rectangle Mover | Shape 程序（A2 型） | 3/3 | 全部满足 |
| Q21 | Dimension-Limited Panel | Shape 程序（A2 型） | 2/2 | 全部满足 |
| Q22 | Restartable Tile Collection | Shape 程序（A2 型） | 2/2 | 全部满足 |
| Q23 | Square Navigation with Two Step Sizes | Shape 程序（A2 型） | 2/2 | 全部满足 |
| Q24 | Polymorphic Geometry Tray | Shape 程序（A2 型） | 2/2 | 全部满足 |
| Q25 | Explicit Contact Save | 记录 + 文件（Lab 3 型） | 2/2 | 全部满足 |
| Q26 | Capped Parts Inventory | 记录 + 文件（Lab 3 型） | 2/2 | 全部满足 |
| Q27 | Two-Criterion Shelf Search | 记录 + 文件（Lab 3 型） | 2/2 | 全部满足 |
| Q28 | Merit List and Class Summary | 记录 + 文件（Lab 3 型） | 2/2 | 全部满足 |
| Q29 | Quoted Titles and Rejected Imports | 记录 + 文件（Lab 3 型） | 3/3 | 全部满足 |
| Q30 | Book Editing with Dedicated Cancel | 记录 + 文件（Lab 3 型） | 1/2 | 部分满足 |

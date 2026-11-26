# EIE3320 Test 2 · Part 1 笔试复习

用于备考 EIE3320 Test 2 笔试的离线复习页，随 [JavaFX Offline Builder](../README.md) 提供。

打开 [`dist/EIE3320-Test2-Part1-Prep.html`](dist/EIE3320-Test2-Part1-Prep.html)，功能如下：

- **题库**：118 道英文题，覆盖 Lecture 7 JavaFX 基础、Lecture 8 事件驱动、OOP（Assignment 2）、Lab 3 的文件与列表、Java 基础。可以按类别筛选、搜索，开自测模式收起答案，随机抽 10 题，标记「已掌握」后只看未掌握的题。
- **A4 速查纸**：10 个板块排在一页 A4 上，可以填姓名和学号，然后打印或另存为 PDF。

## 构建与测试

在 `JavaFX-Offline-Builder/part1-prep/` 目录中运行。

```bash
node build.mjs                    # 修改 src/ 后重新生成 dist
node tests/run_part1_tests.mjs    # 检查题库、页面脚本和 dist 是否最新
```

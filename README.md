# Java Offline Helper

两款离线 Java 学习工具，用于检查 Java 代码和练习 JavaFX 编程。下载仓库后，直接用浏览器打开所需的 HTML 文件。

| 工具 | 用途 | 离线入口 |
| --- | --- | --- |
| [Java Offline Checker](Java-Offline-Checker/README.md) | 检查常见语法错误、预览修正草稿，或连接本机 JDK 查看编译诊断。 | [index.html](Java-Offline-Checker/index.html) |
| [JavaFX Offline Builder](JavaFX-Offline-Builder/README.md) | 用表单或积木生成 JavaFX 代码，预览交互，导出 `.java` 或 BlueJ 项目。提供 API 速查、例程和模拟题。 | [JavaFX-Offline-Builder.html](JavaFX-Offline-Builder/dist/JavaFX-Offline-Builder.html) |
| [Part 1 笔试复习](JavaFX-Offline-Builder/part1-prep/README.md) | Builder 随附的 EIE3320 英文练习题和可打印的 A4 速查纸。 | [EIE3320-Test2-Part1-Prep.html](JavaFX-Offline-Builder/part1-prep/dist/EIE3320-Test2-Part1-Prep.html) |

## 下载和使用

1. 在 GitHub 仓库首页选择 **Code → Download ZIP**，完整解压到本机，或用 Git 克隆仓库。
2. 用 Chrome 或 Edge 打开表格里的本地 HTML 文件。规则检查、代码生成和复习页面都可离线运行。
3. Checker 的真实编译需要完整的 JDK 17 或更新版本。Windows 可双击 `Java-Offline-Checker/CHECK_WITH_JDK.cmd`，其他系统见 Checker 的启动说明。Builder 生成的程序可在配有 JavaFX 的 BlueJ 中编译运行。[Checker 启动说明](Java-Offline-Checker/README.md#下载与启动--download-and-run) · [Builder 使用说明](JavaFX-Offline-Builder/README.md#使用)

## 仓库结构

```text
Java-Offline-Checker/      检查页面、本机编译启动器、示例和测试
JavaFX-Offline-Builder/    生成器源码、离线 HTML、练习和测试
  src/                     生成逻辑和界面
  dist/                    可直接打开的离线 Builder
  part1-prep/               笔试复习页源码和离线 HTML
  tests/exam-variants/      实操模拟题、参考设置和验收记录
.github/workflows/         自动回归检查
```

浏览器里的草稿和个人信息由各页面保存在本地。Builder 会将填写的姓名、学号等信息写入生成文件的注释。分享 Java 文件、BlueJ ZIP 或打印版速查纸前，可以先检查其中填写的内容。

## 学习材料与维护

Builder 的课程例程改编自 EIE3320 的 JavaFX 基础与事件驱动讲义，实操模拟题参考 Assignment 2 和 Lab 3 的知识范围。通用 JavaFX API 可查 OpenJFX 文档。[模拟题及课程依据](JavaFX-Offline-Builder/tests/exam-variants/round4/README.md#课程依据) · [OpenJFX 17 API](https://openjfx.io/javadoc/17/)

各工具的 README 列出了构建和测试命令。版本变化集中记录在更新日志中。[更新日志](CHANGELOG.md)

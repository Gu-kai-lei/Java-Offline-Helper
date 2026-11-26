# Java Offline Checker 2.1 / 离线 Java 语法检查器

用于 Java 17 初学者的离线检查工具。支持多文件导入、常见错误提示、修正草稿、修改前后预览、应用与撤销、轻量补全，以及本机 JDK 的真实编译诊断。网页所需的 CSS 和 JavaScript 全部内嵌，无需联网或安装第三方依赖。

本工具是 [Java-Offline-Helper](../README.md) 的一部分。配套的 [JavaFX 离线积木](../JavaFX-Offline-Builder/README.md) 位于同级目录。

## 下载与启动 / Download and run

1. `git clone` 本仓库，或在仓库首页选择 **Code → Download ZIP**，把整个 ZIP **全部解压**到本机硬盘，然后进入 `Java-Offline-Checker/`。
2. **只查常见错误**：双击 `index.html`。此模式不需要 Java。
3. **真实编译**需要完整 **JDK 17+**。
   - Windows 双击 `CHECK_WITH_JDK.cmd`。
   - Linux 或 macOS 在本工具目录运行 `java --add-modules jdk.httpserver OfflineJavaChecker.java`。
   - 保持终端窗口打开。如果浏览器没有自动打开，请使用终端显示的本机地址。端口从 8765 至 8775 自动选择。
4. 独立程序选“编译当前文件”；依赖多个类的题目，导入全部源文件后选“编译全部”。修改后下载 `.java`，再回到 IDE 运行并核对输出。

请从本地打开文件，GitHub 的源码预览页不运行此网页。`file://` 模式仅运行规则检查，真实编译需使用启动器提供的本机 HTTP 地址。

## 检查与修正 / Check and review

- 识别 `printIn`、`nuul`、缺少分号或 `if` 括号、数组与集合长度、类名与文件名等限定模式。
- 连接 JDK 后先编译原代码；若原代码通过，保留原代码。
- “生成语法草稿”显示修改前后的代码；不确定或可能改变输出的建议默认不勾选，需逐项核对。
- 缺少 `return` 等问题给出原因，不自动猜返回值；已有方法头、类名和考试模板要求须自行遵守。
- `sout`、`psvm` 可用于轻量模板补全；支持草稿恢复和清除，请及时下载源文件。
- **编译通过不代表逻辑、边界条件或输出正确**。规则检查会漏报或误报，也不会生成任意算法。

## 2.1 更新 / What's new

- **修复会改坏正确代码的自动修正**：文本块 `"""` 开头行、以 `-` 开头的跨行表达式不再被自动补分号。
- **缺分号识别更全**：字段、`this.x = y`、泛型声明、任意方法调用、赋值/复合赋值、`break`/`continue`、`do-while`、`import`；数组初始化、Allman 大括号、链式调用和三元表达式续行不会误报。
- **`} else if 条件 {` 和 `while 条件 {`** 缺圆括号可自动修正。
- **减少误报**：名为 `in` 的 `Scanner`（`!in.hasNext()`）不再报 `!in`；`List.of`、`Thread.sleep`、增强 for 循环变量、lambda 参数不再被当作拼写错误。
- **补回类外壳时缩进整齐**，CRLF 文件保持 CRLF。
- **本机编译只在内存中进行**：不再创建 `.checker-work` 临时目录或 `.class` 文件，避免 Windows 上文件被占用导致“编译通过却报错”。
- **编辑器**：回车自动缩进；选中多行按 Tab / Shift+Tab 缩进或取消缩进；这些操作可用 Ctrl+Z 撤销。检查一次后，继续编辑会自动重新做规则检查。
- **导入 GBK 编码的 `.java`**（中文 Windows 旧编辑器常见）会自动识别，不再出现乱码；下载时统一保存为 UTF-8。

## 文件 / Files

| 文件 | 用途 |
| --- | --- |
| [`index.html`](index.html) | 完整离线网页，内嵌 CSS/JS |
| [`OfflineJavaChecker.java`](OfflineJavaChecker.java) | JDK 编译服务源码 |
| [`CHECK_WITH_JDK.cmd`](CHECK_WITH_JDK.cmd) | Windows 启动器 |
| [`使用说明.txt`](使用说明.txt) | 详细中文说明、限制和故障排查 |
| [`examples/`](examples/) | 错误示例、语法草稿和修正版本 |
| [`tests/run_tests.mjs`](tests/run_tests.mjs) | 回归测试（维护用，学生使用时不需要） |
| [`.github/workflows/test.yml`](../.github/workflows/test.yml) | 每次推送在 GitHub Actions 上用 JDK 17 跑全部测试 |
| [`verification.json`](verification.json) | 2.1 版验证记录及已知限制，保留 2.0 记录 |
| [`docs/checker-v2-preview.jpg`](docs/checker-v2-preview.jpg) | 2.0 版验证截图 |

示例目录中有同名 `Main`，且部分文件故意包含错误。请分别打开；不要将所有示例当成一个项目一起编译。

## 本机编译范围 / Local compilation scope

服务仅绑定 `127.0.0.1`，代码不上传外部服务；只编译，不执行提交的 `main` 或静态初始化代码，关闭注解处理。最多 20 个简单命名的 `.java` 文件，支持标准库和 UTF-8，语言级别固定 Java 17；不支持额外 JAR 或项目目录结构。编译产物只在内存中生成并立即丢弃，不写入任何临时文件；2.0 留下的 `.checker-work` 文件夹可以手动删除。关闭服务请在命令窗口按 Ctrl+C。

浏览器草稿只保存在当前浏览器本地，地址、端口、隐私模式或清理缓存可能影响恢复；应用修改不会自动覆盖硬盘中的原文件。完整验证范围和未验证事项见 `verification.json`。

## 维护与测试 / Tests

修改 `index.html` 或 `OfflineJavaChecker.java` 后，在本文件夹运行（需要 Node 18+；`--jdk` 还需要 JDK 17+）：

```bash
node tests/run_tests.mjs --jdk
```

不带 `--jdk` 只测试规则引擎、示例与页面脚本；带 `--jdk` 会启动本机编译服务，验证真实编译、不执行提交代码、拒绝非法文件名 / token / Origin / Host，以及不写磁盘。每次推送和 PR 都会在 GitHub Actions 上自动运行同一命令。

本工具最初用于 EIE3320 的 Java 练习，现与 JavaFX Offline Builder 一起维护。

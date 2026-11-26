# Test 2 实操覆盖检查 · 第四轮

[英文题面](PAPER.md)包含 30 道模拟实操题。讲义题 18 道，Assignment 2 变体和 Lab 3 变体各 6 道。题目按 Test 2 的范围排除 TableView、GridPane 和 GNN。练习时可在两个小时内选做讲义题与综合题，提前把题面、输入文件和 Builder 放到本机磁盘。

[验收结果](RESULTS.md)记录了 28 道完全通过的题目、两项未达到的要求和逐题检查数。

Q07 和 Q30 已收录在离线页面的「变体题练习」中，分组为「第四轮：builder 做不全的题」。两题可载入部分参考设置，也可展开手写参考答案并导出 BlueJ 项目。手写答案由 Builder 回归测试编译并运行验收。[手写参考源码](manual/)

## 课程依据

- Lecture 7 用 Stage、Scene、容器、属性绑定和图形设计窗口题。
- Lecture 8 用 ActionEvent、键盘、鼠标、窗口事件和控件设计交互题。
- Assignment 2 用 Drawable、抽象 Shape、位置和颜色操作设计变体。
- Lab 3 用记录类、ArrayList、搜索、编辑和本机文本持久化设计变体，显示控件用 ListView。

## 验证与复跑

Playwright 在离线浏览器上下文中加载本地发行版 HTML。浏览器导航由测试直接用磁盘内容响应，其余请求均被拦截。每道题使用独立页面草稿，按 [题目脚本](questions.mjs) 中的顺序选择例程、修改参数或拼积木，再保存页面输出的 Java 源码。整套流程不输入 Java 表达式，不打开进阶 Java 积木，也不编辑生成结果。

`javac` 编译每道题的全部源码。FxSmoke 运行实际 JavaFX 场景、触发事件并检查控件状态、渲染颜色、提示和局部文件。文件题还包含重启读回及损坏文件保护。测试区分全部达到题面要求与只能达到部分要求。对已知缺口，验收仍实际检查目标行为，并把对应的不通过标记为预期结果。

在 `JavaFX-Offline-Builder/` 目录运行。需要 Node 18+、Playwright、Chromium、JDK 17+、OpenJFX 17 和桌面显示。已有 Chromium 时可传入其路径，也可省略 `--chromium` 使用 Playwright 安装的浏览器。Linux 无桌面时可用 Xvfb。

```bash
node tests/exam-variants/round3/run_round3.mjs --suite round4 \
  --chromium /usr/bin/chromium --jdk --run --fx "$JAVAFX_LIB" \
  --output-dir /tmp/builder-round4-results
```

每次运行会生成逐题 UI 操作、验收明细和对应 Java 文件，分别写入指定目录的 `LOG.md` 和 `answers/`。加 `--only Q07,Q30` 可单独复查部分题目。加 `--check` 可在相同输出目录验证生成源码仍逐字相同。

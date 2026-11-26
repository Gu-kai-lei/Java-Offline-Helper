// Regression tests for the JavaFX Offline Builder. Node 18+, no dependencies.
// Run from JavaFX-Offline-Builder/:
//   node tests/run_builder_tests.mjs                 generator logic and source checks only
//   node tests/run_builder_tests.mjs --jdk           also compiles every generated program with javac
//   node tests/run_builder_tests.mjs --jdk --run     also launches JavaFX programs and clicks through them
// JavaFX jars are taken from --fx <dir>, then the JAVAFX_LIB environment variable.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const args = process.argv.slice(2);
const withJdk = args.includes("--jdk");
const withRun = args.includes("--run");
const fxArg = args.indexOf("--fx") >= 0 ? args[args.indexOf("--fx") + 1] : process.env.JAVAFX_LIB;
const jdkBin = args.indexOf("--jdk-bin") >= 0 ? path.resolve(args[args.indexOf("--jdk-bin") + 1]) : null;
const refreshChecksums = args.includes("--refresh-variant-checksums");

// ---------- load the pure generator code exactly as the page does ----------
export function loadCore() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "src", "manifest.json"), "utf8"));
  const missing = manifest.core.filter(f => !fs.existsSync(path.join(root, "src", f)));
  const source = manifest.core.filter(f => !missing.includes(f))
    .map(f => fs.readFileSync(path.join(root, "src", f), "utf8")).join("\n;\n");
  const names = ["Java", "JavaFiles", "ShapeKinds", "ShapeLib", "OopGen", "RecordGen", "CalcGen", "JavaExpr", "DrawGen",
    "Skeleton", "Examples", "Knowledge", "Blocks", "BlockPreview", "VisualExpr", "NumericRules", "RecordFormat", "Practice", "Variants", "VariantLoad", "BlueJ"];
  const exportLine = "\n;globalThis.__core = {" + names.map(n => n + ": typeof " + n + " === 'undefined' ? undefined : " + n).join(", ") + "};";
  const context = vm.createContext({ TextEncoder, console });
  vm.runInContext(source + exportLine, context, { filename: "core.js" });
  return { core: context.__core, missing };
}

const { core, missing } = loadCore();
const { Java, OopGen, RecordGen, CalcGen, DrawGen, Skeleton } = core;
const profile = { name: "Test Student", id: "DEMO-ID", tools: "BlueJ" };

const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const compileCases = [];
const runCases = [];
const plain = value => JSON.parse(JSON.stringify(value));
// Values created inside the vm context belong to another realm; compare plain copies.
const same = (actual, expected, message) => assert.deepEqual(plain(actual), plain(expected), message);

// Generated Java is ASCII. Practice source files can also include UTF-8 comments.
function checkFiles(label, files, { expectHeader = true, chineseComments = false, chineseHeader = false } = {}) {
  assert.ok(files.length > 0, label + ": no files");
  for (const f of files) {
    const code = chineseComments || chineseHeader
      ? f.code.replace(/("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*')|\/\*[\s\S]*?\*\/|\/\/[^\r\n]*/g, "$1")
      : f.code;
    assert.ok(Java.isAscii(code), label + "/" + f.filename + ": non-ASCII character " + JSON.stringify((code.match(/[^\x00-\x7f]/) || [])[0]));
    assert.ok(!f.code.includes("\t"), label + "/" + f.filename + ": tab character");
    if (expectHeader) {
      const head = f.code.split("\n").slice(0, 4).join("\n");
      assert.match(head, chineseHeader ? /\/\/ 姓名：Test Student/ : /\/\/ Name: Test Student/, label + "/" + f.filename + ": missing name header");
      assert.match(head, chineseHeader ? /\/\/ 学号：DEMO-ID/ : /\/\/ Student ID: DEMO-ID/, label + "/" + f.filename + ": missing ID header");
      assert.match(head, chineseHeader ? /\/\/ 工具：/ : /\/\/ Tools: /, label + "/" + f.filename + ": missing tools header");
    }
    const publics = [...f.code.matchAll(/^public\s+(?:abstract\s+|final\s+)*(?:class|interface|enum)\s+(\w+)/gm)].map(m => m[1]);
    same(publics, [f.filename.replace(/\.java$/, "")], label + "/" + f.filename + ": public top-level types " + publics.join(","));
  }
}

// The same files with their imports replaced by the universal block, exactly as JavaFiles.render() writes it.
function universalize(files) {
  const types = [...new Set(files.flatMap(f => [...f.code.matchAll(/\b(?:class|interface|enum|record)\s+([A-Za-z_]\w*)/g)].map(m => m[1])))];
  return files.map(f => {
    const imports = [...f.code.matchAll(/^import\s+([\w.*]+)\s*;[^\n]*\n/gm)].map(m => m[1]).filter(i => !i.startsWith("static "));
    if (/^import\s+static\b/m.test(f.code)) return f;
    const rest = f.code.replace(/^import\s+[\w.*]+\s*;[^\n]*\n/gm, "");
    const head = /^(?:\/\/[^\n]*\n|\s*\n)*/.exec(rest)[0];
    return { ...f, code: head + Java.universalImports(imports, types) + "\n\n" + rest.slice(head.length).replace(/^\s+/, "") };
  });
}

function addCompile(label, files, { fx = true, extra = [] } = {}) {
  compileCases.push({ label, files: [...files.map(f => ({ filename: f.filename, code: f.code })), ...extra], fx });
}

// ---------- generator tests ----------
test("all core modules are present", () => {
  assert.deepEqual(missing, [], "missing core files: " + missing.join(", "));
});

test("knowledge search finds Chinese questions and API names, and filters by category", () => {
  const { Knowledge } = core;
  const entries = new Map(Knowledge.entries.map(item => [item.id, item]));
  assert.equal(entries.size, Knowledge.entries.length);
  for (const item of entries.values()) {
    assert.ok(item.notes.length && item.code.trim());
    assert.ok(item.related.every(id => id !== item.id && entries.has(id)));
  }
  assert.equal(Knowledge.search("ＫｅｙＥｖｅｎｔ．ｇｅｔＣｏｄｅ（）")[0].id, "key-code");
  assert.equal(Knowledge.search("数字键盘转化为数字")[0].id, "key-number");
  assert.equal(Knowledge.search("TextField parseInt", "键盘与输入")[0].id, "parse-int");
  assert.equal(Knowledge.search("接口 怎么用", "类与接口")[0].id, "interface");
  assert.equal(Knowledge.search("通用 import")[0].id, "imports-fx");
  assert.equal(Knowledge.search("万能import")[0].id, "imports-fx");
  assert.equal(Knowledge.search("BorderPane 模板")[0].id, "template-fx");
  // Lecture 7 shapes and the code topics of the cheat sheet
  for (const [query, id] of [["Line", "line"], ["直线", "line"], ["画线", "line"], ["setStrokeWidth", "line"], ["Arc", "arc"], ["扇形", "arc"],
    ["Polygon", "polygon"], ["正弦曲线", "polygon"], ["Ellipse", "circle-ellipse"], ["圆角", "rectangle"], ["Text 基线", "text-node"],
    ["Color.rgb", "color"], ["brighter", "color"], ["FontWeight", "font"], ["粗体", "font"], ["setStyle", "style-rotate"], ["setRotate", "style-rotate"],
    ["setWidth 重画", "resize-redraw"], ["Insets", "insets-margin"], ["setMargin", "insets-margin"], ["removeAll", "children-crud"],
    ["setDisable", "control-methods"], ["日期", "date-time"], ["匿名内部类", "handler-styles"], ["独立类", "handler-class"],
    ["setOnShowing", "window-events"], ["setOnAction 两次", "set-on-action-twice"], ["双击", "mouse-hover"], ["重载", "overload-override"],
    ["this(", "constructor-chain"], ["不能new", "abstract-rules"], ["substring", "string-methods"], ["整数除法", "type-conversion"],
    ["finally", "exceptions"], ["nextInt", "scanner-tokens"], ["FileWriter", "file-course"], ["倒序删除", "loops-arrays"], ["length()", "loops-arrays"]]) {
    assert.equal(Knowledge.search(query)[0]?.id, id, "search " + query + " -> " + Knowledge.search(query).slice(0, 3).map(e => e.id).join(","));
  }
  assert.equal(Knowledge.search("控制台 模板")[0].id, "template-java");
  assert.equal(Knowledge.search("NUMPAD9", "集合与文件").length, 0);
  assert.equal(Knowledge.search("没有结果的查询").length, 0);
  // Questions typed the way a student asks them: no spaces, filler words, everyday words for API topics.
  for (const [query, id] of [["怎么读文件", "read-file"], ["读取文件", "read-file"], ["保存到文件", "write-file"], ["怎么改颜色", "color"],
    ["数字输入", "parse-int"], ["怎么把输入框的字变成数字", "parse-int"], ["怎么让按钮有反应", "action-handler"], ["怎么做动画", "timeline"],
    ["怎么保留两位小数", "number-format"], ["怎么排序", "compare"], ["错误提示", "alert"]]) {
    assert.equal(Knowledge.search(query)[0]?.id, id, "search " + query);
  }
  assert.ok(Knowledge.search("方向键移动").slice(0, 2).some(item => item.id === "key-code"), "search 方向键移动");
  assert.equal(Knowledge.search("怎么读文件", "键盘与输入").length, 0, "the category filter still applies");
  assert.equal(Knowledge.search("").length, entries.size);
  // Patterns of the practical tasks the builder cannot generate (round 3 Q19, Q22-Q26, Q29; round 4 Q07, Q30).
  for (const [query, id] of [["第二个窗口", "second-stage"], ["Library", "library-class"], ["ArrayList<String>", "string-list"],
    ["文件不存在", "missing-file"], ["LibraryFileManager", "static-save"], ["取消编辑", "edit-cancel"], ["FlowPane 运行时", "flow-pane"]]) {
    assert.equal(Knowledge.search(query)[0]?.id, id, "search " + query);
  }
  // Every snippet compiles in the context its notes describe: statements go into a method of an Application
  // that declares the objects the notes name, members into the class body, top-level types before the class.
  const imports = ["javafx.application.Application", "javafx.scene.*", "javafx.scene.control.*", "javafx.scene.layout.*",
    "javafx.scene.shape.Circle", "javafx.scene.shape.Rectangle", "javafx.scene.paint.Color", "javafx.scene.input.*", "javafx.event.*",
    "javafx.animation.*", "javafx.util.Duration", "javafx.geometry.Insets", "javafx.stage.*", "javafx.scene.image.*", "java.util.*",
    "java.nio.file.Files", "java.nio.file.Path", "java.io.*", "javafx.scene.shape.*", "javafx.scene.text.*", "javafx.geometry.*",
    "java.time.*", "java.time.format.*"].map(i => "import " + i + ";").join("\n");
  const helpers = {
    Book: "class Book {\n    String getTitle() { return \"\"; }\n    String getIsbn() { return \"\"; }\n    boolean isAvailable() { return true; }\n" +
      "    void setAvailable(boolean available) { }\n    void setTitle(String title) { }\n}",
    Drawable: "interface Drawable { void draw(Pane pane); }\nclass Dot implements Drawable { public void draw(Pane pane) { } }",
    Tile: "class Tile implements Drawable { public void draw(Pane pane) { } }"
  };
  const context = [
    "Scene scene; Stage stage; Circle circle = new Circle(); Pane canvas = new Pane(); Rectangle frame = new Rectangle();",
    "TextField field = new TextField(), titleField = new TextField(), input = new TextField();",
    "Button apply = new Button(), clear = new Button(), add = new Button(), save = new Button(), cancel = new Button();",
    "Button startButton = new Button(), pauseButton = new Button(), resetButton = new Button(), moveUp = new Button();",
    "Label status = new Label(), count = new Label(); FlowPane tags = new FlowPane(); VBox imageBox = new VBox();",
    "ArrayList<Book> books = new ArrayList<>(); ListView<Book> list = new ListView<>(); ComboBox<String> mode = new ComboBox<>();",
    "RadioButton red = new RadioButton(), green = new RadioButton(); CheckBox showFrame = new CheckBox();",
    "List<String> rows = new ArrayList<>(); String line = \"\", search = \"\", title = \"\", targetIsbn = \"\"; double area;"
  ].map(l => "    " + l).join("\n");
  for (const item of entries.values()) {
    // A whole file (template) compiles on its own; an import block gets an empty class after it.
    if (item.file) { addCompile("knowledge/" + item.id, [{ filename: item.file, code: item.code }]); continue; }
    if (/^(?:\s*(?:\/\/[^\n]*)?\n)*\s*import\s/.test(item.code) && !/\bclass\s/.test(item.code)) {
      addCompile("knowledge/" + item.id, [{ filename: "KnowledgeSnippet.java", code: item.code + "\n\npublic class KnowledgeSnippet { }\n" }]);
      continue;
    }
    const types = /^(?:abstract\s+|final\s+)*(?:class|interface)\s+\w+/m.test(item.code);
    const members = !types && /^(?:@Override|private|protected|public|static)\b/.test(item.code.trimStart());
    const own = name => new RegExp("^(?:abstract\\s+)?(?:class|interface)\\s+" + name + "\\b", "m").test(item.code);
    const support = Object.entries(helpers).filter(([name]) => !(types && own(name))).map(([, code]) => code);
    const body = types ? "" : members ? item.code : "void snippet() throws Exception {\n" + item.code + "\n}";
    const start = /public void start\(Stage/.test(item.code) ? "" : "    @Override\n    public void start(Stage primaryStage) { }\n";
    const code = imports + "\n\n" + (types ? item.code + "\n\n" : "") + support.join("\n") + "\n\npublic class KnowledgeSnippet extends Application {\n" +
      context + "\n" + start + body.split("\n").map(l => "    " + l).join("\n") + "\n}\n";
    addCompile("knowledge/" + item.id, [{ filename: "KnowledgeSnippet.java", code }]);
  }
});

test("Java.str escapes everything outside printable ASCII", () => {
  assert.equal(Java.str('a"b\\c\n'), '"a\\"b\\\\c\\n"');
  assert.equal(Java.str("中文"), '"\\u4E2D\\u6587"');
  assert.equal(Java.str("😀"), '"\\uD83D\\uDE00"');
});

test("OOP generator: presets in split, single and anonymous-handler form", () => {
  for (const preset of OopGen.presets()) {
    for (const output of ["split", "single"]) {
      const model = { ...plain(preset.model), output };
      const result = OopGen.generate(model, profile);
      checkFiles("oop/" + preset.id + "/" + output, result.files);
      addCompile("oop/" + preset.id + "/" + output, result.files);
    }
    const anon = OopGen.generate({ ...plain(preset.model), handlerStyle: "anonymous" }, profile);
    assert.match(anon.files.find(f => f.filename.startsWith(preset.model.appClass)).code, /new EventHandler<ActionEvent>\(\)/);
    addCompile("oop/" + preset.id + "/anonymous", anon.files);
  }
});

test("OOP generator: A2 preset matches the handout structure", () => {
  const result = OopGen.generate(OopGen.defaults(), profile);
  const byName = Object.fromEntries(result.files.map(f => [f.filename, f.code]));
  same(Object.keys(byName).sort(), ["Drawable.java", "JavaFXCircle.java", "JavaFXMainApp.java", "Shape.java"]);
  assert.match(byName["Shape.java"], /protected float area;/);
  assert.match(byName["Shape.java"], /protected Color shapeColor = Color\.GREEN;/);
  assert.match(byName["Shape.java"], /this\.y -= 15;/);
  assert.match(byName["JavaFXMainApp.java"], /shape\.displayShape\(\);/, "A2 requires printing area and perimeter");
  assert.match(byName["JavaFXMainApp.java"], /stage\.setTitle\("EIE3320 - JavaFX Homework by Test Student"\)/);
  assert.doesNotMatch(byName["JavaFXMainApp.java"], /Label/, "A2 layout has no extra label by default");
});

test("OOP generator: simulation follows the handout figures", () => {
  const model = OopGen.defaults();
  let state = OopGen.initialState(model);
  state = OopGen.apply(model, state, 0); // Add Circle
  assert.equal(state.shapes.length, 1);
  assert.equal(state.shapes[0].color, "GREEN");
  for (let i = 0; i < 5; i++) state = OopGen.apply(model, state, 5); // Move Down x5
  state = OopGen.apply(model, state, 3); // Color: Blue
  assert.equal(state.shapes[0].y, 50 + 75);
  assert.equal(state.shapes[0].color, "BLUE");
  assert.ok(state.console.includes("Area of circle = 7853.9814"), state.console.join("|"));
  state = OopGen.apply(model, state, 1); // Clear
  state = OopGen.apply(model, state, 4); // Move Up with no circle
  assert.equal(state.shapes.length, 0);
  assert.match(state.console.at(-1), /No shape yet/);
});

test("OOP generator: rejects invalid input with a readable message", () => {
  const model = OopGen.defaults();
  model.shapes[0].className = "class";
  assert.throws(() => OopGen.generate(model, profile), /合法的 Java 名称/);
  const list = OopGen.defaults();
  list.buttons.push({ text: "Next", action: "next", arg: "" });
  assert.throws(() => OopGen.generate(list, profile), /ArrayList/);
});

test("Record generator: presets compile in split and single form", () => {
  for (const preset of RecordGen.presets()) {
    for (const output of ["split", "single"]) {
      const result = RecordGen.generate({ ...plain(preset.model), output }, profile);
      checkFiles("record/" + preset.id + "/" + output, result.files);
      addCompile("record/" + preset.id + "/" + output, result.files);
    }
  }
  const anon = RecordGen.generate({ ...RecordGen.defaults(), handlerStyle: "anonymous" }, profile);
  addCompile("record/lab3/anonymous", anon.files);
});

test("Record generator: Lab 3 messages and getter names", () => {
  const result = RecordGen.generate(RecordGen.defaults(), profile);
  const app = result.files.find(f => f.filename === "LibraryAdminApp.java").code;
  const book = result.files.find(f => f.filename === "Book.java").code;
  for (const message of ["Please enter both ISBN and Title.", "No book record is available for editing.",
    "Please enter or select an ISBN.", "No book is selected for editing.", "No book record is available for deletion.",
    "Please enter a partial ISBN and/or partial Title for searching.", "Please select a book first.",
    "The selected book is not available.", "The selected book is already available.",
    "Unable to load book records from books.txt.", "Unable to save book records to books.txt."]) {
    assert.ok(app.includes(message), "missing Lab 3 message: " + message);
  }
  assert.ok(app.includes('"Duplicate ISBN: " + book.getISBN() + " already exists."'));
  assert.match(book, /public String getISBN\(\)/);
  assert.match(book, /public void setAvailable\(boolean available\)/);
  assert.match(book, /this\(isbn, title, true\);/);
  // Chapter 9 style file I/O: File + Scanner to read, PrintWriter to write (no java.nio).
  assert.match(app, /new Scanner\(file, "UTF-8"\)/);
  assert.match(app, /new PrintWriter\(new File\(DATA_FILE\), "UTF-8"\)/);
  assert.doesNotMatch(app, /java\.nio|Files\.|Paths\./);
});

test("Calculator generator: presets compile and the preview follows Java arithmetic", () => {
  for (const preset of CalcGen.presets()) {
    const outputs = preset.model.modelClass ? ["single", "split"] : ["single"];
    for (const output of outputs) {
      const result = CalcGen.generate({ ...plain(preset.model), output }, profile);
      checkFiles("calc/" + preset.id + "/" + output, result.files);
      addCompile("calc/" + preset.id + "/" + output, result.files);
    }
  }
  const loan = CalcGen.preview(CalcGen.presets()[0].model);
  same(loan.results.map(r => r.text), ["177.47", "10648.42"]);
  same(CalcGen.preview(CalcGen.presets()[0].model, { annualInterestRate: "0" }).results.map(r => r.text), ["166.67", "10000.00"]);
  assert.match(CalcGen.preview(CalcGen.presets()[0].model, { annualInterestRate: "Infinity" }).error, /finite/);
  const temp = CalcGen.preview(CalcGen.presets().find(p => p.id === "temp").model);
  same(temp.results.map(r => r.text), ["77.0"]);
  const intDiv = core.JavaExpr.evaluate(core.JavaExpr.parse("a / 2", new Set(["a"])), { a: { v: 5, int: true } });
  assert.equal(intDiv.v, 2, "int division must truncate like Java");
  assert.throws(() => core.JavaExpr.parse("a ** 2", new Set(["a"])), /Math\.pow/);
  assert.throws(() => core.JavaExpr.parse("b + 1", new Set(["a"])), /未定义/);
});

test("Drawing generator: presets compile with Pane, Group and custom Pane roots", () => {
  for (const preset of DrawGen.presets()) {
    for (const [rootType, output] of [["pane", "single"], ["group", "single"], ["custom", "split"], ["custom", "single"]]) {
      const result = DrawGen.generate({ ...plain(preset.model), rootType, output }, profile);
      checkFiles("draw/" + preset.id + "/" + rootType + "/" + output, result.files);
      addCompile("draw/" + preset.id + "/" + rootType + "/" + output, result.files);
    }
    const svg = DrawGen.svg(preset.model);
    assert.equal(svg.elements.length, preset.model.nodes.length);
  }
});

function readFixture(dir) {
  const folder = path.join(here, "fixtures", dir);
  return fs.readdirSync(folder).filter(f => f.endsWith(".java")).sort()
    .map(f => ({ filename: f, code: fs.readFileSync(path.join(folder, f), "utf8") }));
}

function completeFixture(dir, options = {}) {
  const given = readFixture(dir);
  const parsed = given.map(f => Skeleton.parse(f.code, f.filename));
  const suggestions = Skeleton.suggest(parsed, options);
  const filled = parsed.map((p, i) => ({ filename: given[i].filename, code: Skeleton.apply(p, i, suggestions, profile) }));
  return { given, parsed, suggestions, filled };
}

test("Skeleton: A2 handout skeleton is completed without TODOs and keeps every signature", () => {
  const { given, parsed, suggestions, filled } = completeFixture("a2");
  same(parsed.flatMap(p => p.types.map(t => t.name)).sort(), ["Drawable", "JavaFXCircle", "Shape"]);
  const todo = suggestions.filter(s => s.status !== "auto");
  same(todo.map(s => s.signature), [], "unfilled: " + todo.map(s => s.signature + " " + s.note).join("; "));
  assert.equal(suggestions.length, 7);
  const circle = filled.find(f => f.filename === "JavaFXCircle.java").code;
  assert.match(circle, /radius = r;/);
  assert.match(circle, /area = \(float\) \(Math\.PI \* radius \* radius\);/);
  assert.match(circle, /Circle circle = new Circle\(x \+ radius, y \+ radius, radius\);/);
  assert.doesNotMatch(circle, /xxxxxx/);
  // Every original declaration line is still present.
  for (const line of given.find(f => f.filename === "JavaFXCircle.java").code.split("\n")) {
    if (/^\s*(public|@Override|import|private)/.test(line)) assert.ok(circle.includes(line.trim()), "changed line: " + line);
  }
  const model = Skeleton.toOopModel(parsed);
  assert.equal(model.output, "main");
  assert.equal(model.names.base, "Shape");
  assert.equal(model.names.iface, "Drawable");
  assert.equal(model.shapes[0].className, "JavaFXCircle");
  const app = OopGen.generate(model, profile);
  assert.equal(app.files.length, 1);
  checkFiles("skeleton/a2/main", app.files);
  const shapeAndDrawable = given.filter(f => f.filename !== "JavaFXCircle.java");
  addCompile("skeleton/a2 + main app", [...filled.filter(f => f.filename === "JavaFXCircle.java"), ...app.files], { extra: shapeAndDrawable });
});

test("Skeleton: a renamed exam variant (Figure/RectangleFigure/SquareFigure) is completed", () => {
  const { parsed, suggestions, filled } = completeFixture("variant");
  const todo = suggestions.filter(s => s.status !== "auto");
  same(todo.map(s => s.type + "." + s.signature), [], todo.map(s => s.note).join("; "));
  const rect = filled.find(f => f.filename === "RectangleFigure.java").code;
  assert.match(rect, /width = w;/);
  assert.match(rect, /height = h;/);
  assert.match(rect, /Rectangle rect|Rectangle rectangle/);
  assert.match(rect, /import javafx\.scene\.shape\.Rectangle;/);
  const model = Skeleton.toOopModel(parsed);
  assert.equal(model.names.setColor, "setFillColor");
  assert.equal(model.names.moveLeft, "moveLeft");
  assert.equal(model.names.computeArea, "calculateArea");
  assert.equal(model.newStyle, "args");
  const app = OopGen.generate(model, profile);
  addCompile("skeleton/variant + main app", [...filled, ...app.files]);
});

test("Skeleton: Book skeleton gets constructor, getters, setters and toString", () => {
  const { suggestions, filled } = completeFixture("book");
  same(suggestions.filter(s => s.status !== "auto").map(s => s.signature), []);
  const book = filled[0].code;
  assert.match(book, /this\.isbn = isbn;/);
  assert.match(book, /available = true;/);
  assert.match(book, /return isbn;/);
  checkFiles("skeleton/book", filled);
  addCompile("skeleton/book", filled, { fx: false });
});

test("Skeleton: subclasses call a parent constructor with super(...) and return a JavaFX node", () => {
  const { suggestions, filled } = completeFixture("superctor", { anchor: "center" });
  const body = sig => suggestions.find(s => s.type + "." + s.signature === sig).body;
  // GameShape has only GameShape(double, double): this.x = x would not compile.
  assert.equal(body("MyCircle.MyCircle(double x, double y, double radius)"), "super(x, y);\nthis.radius = radius;");
  // Student's fields are private, so the subclass must pass them on.
  assert.equal(body("Postgraduate.Postgraduate(String id, String name, double score, String supervisor)"),
    "super(id, name, score);\nthis.supervisor = supervisor;");
  assert.match(body("MyCircle.Shape toNode()"), /Circle circle = new Circle\(x, y, radius\);[\s\S]*return circle;/);
  assert.equal(body("MyCircle.String getName()"), 'return "Circle";');
  same(suggestions.filter(s => s.status === "todo").map(s => s.type + "." + s.signature), []);
  checkFiles("skeleton/superctor", filled);
  addCompile("skeleton/superctor", filled);
});

test("Universal imports: one wildcard block for every file, exact imports only where needed", () => {
  const uni = { ...profile, imports: "universal" };
  const a2 = OopGen.generate(OopGen.presets()[0].model ?? OopGen.defaults(), uni).files;
  for (const f of a2) {
    assert.match(f.code, /\/\/ JavaFX Application & Window\nimport javafx\.application\.Application;\nimport javafx\.stage\.\*;/, f.filename);
    assert.match(f.code, /import javafx\.util\.Duration;\n\n\/\/ Java Collections & Scanner\nimport java\.util\.\*;/, f.filename);
    assert.match(f.code, /^\/\/ Name: Test Student/, f.filename);
  }
  // The project has its own Shape class: javafx.scene.shape.Shape would be hidden, so an exact import stays.
  assert.match(Java.universalImports(["javafx.scene.shape.Shape", "javafx.scene.layout.Pane"], ["Shape", "Circle2"]),
    /\/\/ Exact imports[^\n]*\nimport javafx\.scene\.shape\.Shape;$/);
  // java.nio.file.Path and javafx.scene.shape.Path clash, so Path is always imported exactly.
  assert.match(Java.universalImports(["java.nio.file.Path", "javafx.scene.Scene"]), /import java\.nio\.file\.Path;$/);
  // A plain Java class gets only the Java groups; packages outside the block keep their exact import.
  const plainBlock = Java.universalImports(["java.util.ArrayList", "java.text.DecimalFormat"]);
  assert.doesNotMatch(plainBlock, /javafx/);
  assert.match(plainBlock, /import java\.text\.DecimalFormat;$/);
  same(Java.universalImports(["java.util.Scanner"]), Java.universalBlock("java"));
  const record = RecordGen.generate(RecordGen.defaults(), uni).files;
  for (const f of record) assert.doesNotMatch(f.code, /^import java\.util\.ArrayList;/m, f.filename);
  addCompile("universal/a2", a2);
  addCompile("universal/record", record);
});

test("Block workbench: BorderPane layout settings, controls in the centre, run-time controls and a second Stage", () => {
  const { Blocks, BlockPreview } = core;
  // Default settings still give the code the earlier versions produced.
  const plainProject = Blocks.preset("counter");
  const plainCode = Blocks.generate(plainProject, true, profile).files[0].code;
  assert.match(plainCode, /HBox bottomBox = new HBox\(8, /);
  assert.match(plainCode, /bottomBox\.setPadding\(new Insets\(10\)\);/);
  assert.doesNotMatch(plainCode, /setAlignment|FlowPane|StackPane/);

  const project = Blocks.preset("borderLayout");
  const code = Blocks.generate(project, true, profile).files[0].code;
  assert.match(code, /HBox topBox = new HBox\(8, titleLabel\);\n\s*topBox\.setPadding\(new Insets\(10\)\);\n\s*topBox\.setAlignment\(Pos\.CENTER\);\n\s*topBox\.setStyle\("-fx-background-color: gold;"\);/);
  assert.match(code, /VBox leftBox = new VBox\(10, redBtn, blueBtn, greenBtn\);/);
  assert.match(code, /root\.setRight\(rightBox\);/);
  assert.match(code, /root\.setCenter\(canvas\);/);
  assert.match(code, /import javafx\.geometry\.Pos;/);

  // Controls in the centre with a StackPane; a FlowPane on the left; spacing 0 and no padding.
  const mixed = Blocks.preset("counter");
  mixed.components.forEach(c => { if (c.type === "Label") c.region = "center"; else if (c.type === "Button") c.region = "left"; });
  mixed.config.layout = { center: { box: "StackPane", spacing: "", padding: "0", align: "TOP_RIGHT", style: "" },
    left: { box: "FlowPane", spacing: "4", padding: "", align: "", style: "-fx-border-color: red;" } };
  const mixedCode = Blocks.generate(mixed, true, profile).files[0].code;
  assert.match(mixedCode, /StackPane centerBox = new StackPane\(\w+\);\n\s*centerBox\.setAlignment\(Pos\.TOP_RIGHT\);\n\s*root\.setCenter\(centerBox\);/);
  assert.match(mixedCode, /FlowPane leftBox = new FlowPane\(4, 4, /);
  assert.doesNotMatch(mixedCode, /leftBox\.setPadding/);
  addCompile("blocks/layout/mixed", Blocks.generate(mixed, true, profile).files);

  // Run-time controls and a second window, also from a handler class that gets objects through its constructor.
  const tags = Blocks.preset("flowTags");
  const tagCode = Blocks.generate(tags, true, profile).files[0].code;
  assert.match(tagCode, /FlowPane centerBox = new FlowPane\(6, 6, javaTag, javafxTag, oopTag\);/);
  assert.match(tagCode, /centerBox\.getChildren\(\)\.add\(new Label\(/);
  assert.match(tagCode, /centerBox\.getChildren\(\)\.remove\(3, centerBox\.getChildren\(\)\.size\(\)\);/);
  assert.match(tagCode, /Stage window = new Stage\(\);/);
  const named = plain(tags);
  for (const event of named.events) { event.style = "named"; event.inject = "yes"; event.partner = ""; }
  const namedCode = Blocks.generate(named, true, profile).files[0].code;
  assert.match(namedCode, /private FlowPane centerBox;/);
  addCompile("blocks/layout/named-handlers", Blocks.generate(named, true, profile).files);
  // An empty region that a block fills at run time still gets its container.
  const empty = Blocks.preset("blank");
  const button = Blocks.addComponent(empty, "Button", { name: "addBtn", text: "Add" });
  empty.events.push(Blocks.event("action", button.id, [Blocks.createBlock(empty, "addNode", { region: "right", nodeType: "Button", text: "New" })]));
  const emptyCode = Blocks.generate(empty, true, profile).files[0].code;
  assert.match(emptyCode, /VBox rightBox = new VBox\(8\);/);
  addCompile("blocks/layout/empty-region", Blocks.generate(empty, true, profile).files);

  // The preview runs the same blocks.
  const rt = BlockPreview.create(tags);
  const id = name => tags.components.find(c => c.name === name).id;
  rt.state[id("tagInput")].text = "Swing";
  rt.send("action", [id("addBtn")]);
  same(rt.added.center, [{ type: "Label", text: "Swing" }]);
  rt.send("action", [id("tagInput")]);
  assert.equal(rt.state[id("statusLabel")].text, "Type a tag first");
  rt.send("action", [id("clearBtn")]);
  same(rt.added.center, []);
  assert.match(rt.send("action", [id("aboutBtn")]).notes[0], /About/);
});

test("Block workbench: mouse and key events registered on the BorderPane root", () => {
  const { Blocks, BlockPreview } = core;
  const project = Blocks.preset("rootEvents");
  for (const type of ["clicked", "moved", "dragged", "key", "keyReleased"]) {
    assert.ok(Blocks.eventTargets(project, type).some(([id]) => id === "root"), type + " can be registered on root");
  }
  assert.ok(!Blocks.eventTargets(project, "action").some(([id]) => id === "root"), "no Action event on a BorderPane");
  const code = Blocks.generate(project, true, profile).files[0].code;
  assert.match(code, /BorderPane root = new BorderPane\(\);[\s\S]*root\.setOnMouseClicked\(e -> \{/);
  assert.match(code, /root\.setOnKeyPressed\(e -> \{/);
  assert.match(code, /root\.setFocusTraversable\(true\);[\s\S]*root\.requestFocus\(\);/);
  addCompile("blocks/root/lambda", Blocks.generate(project, true, profile).files);
  for (const [style, inject] of [["anonymous", ""], ["named", ""], ["named", "yes"]]) {
    const copy = plain(project);
    for (const event of copy.events) { event.style = style; event.inject = inject; }
    const out = Blocks.generate(copy, true, profile).files;
    if (inject) assert.match(out[0].code, /root\.setOnMouseClicked\(new Handler1\(circle, statusLabel\)\);/);
    addCompile("blocks/root/" + style + (inject ? "-inject" : ""), out);
  }
  // A control cannot take the name root, which the program uses for the BorderPane.
  const clash = Blocks.preset("blank");
  Blocks.addComponent(clash, "Button", { name: "root", text: "x" });
  assert.throws(() => Blocks.generate(clash, true, profile), /root/);
  // Preview: handlers on root run for clicks anywhere and for keys after the focused node.
  const rt = BlockPreview.create(project);
  const id = name => project.components.find(c => c.name === name).id;
  rt.send("clicked", ["root"], { x: 50, y: 60, button: "PRIMARY" });
  assert.equal(rt.state[id("circle")].x, 50);
  assert.equal(rt.state[id("statusLabel")].text, "Root clicked at (50.0, 60.0)");
  rt.send("key", ["root", "scene"], { code: "RIGHT" });
  assert.equal(rt.state[id("circle")].x, 60);
  rt.send("clicked", ["root"], { x: 10, y: 10, button: "SECONDARY" });
  assert.equal(rt.state[id("circle")].color, "RED");
});

test("Block workbench: root types other than BorderPane (Pane, StackPane, VBox, HBox, FlowPane)", () => {
  const { Blocks, BlockPreview } = core;
  const project = Blocks.preset("paneRoot");
  const code = Blocks.generate(project, true, profile).files[0].code;
  // No BorderPane and no extra Pane: the circle and the controls go straight into the root
  assert.doesNotMatch(code, /BorderPane/);
  assert.match(code, /Pane root = new Pane\(circle, redBtn, growBtn, statusLabel\);/);
  assert.match(code, /redBtn\.relocate\(10, 10\);[\s\S]*statusLabel\.relocate\(10, 270\);/);
  assert.match(code, /root\.setOnMouseClicked\(/);
  assert.ok(Blocks.eventTargets(project, "clicked").some(([id, label]) => id === "root" && /^Pane · root/.test(label)));
  addCompile("blocks/root-type/Pane", Blocks.generate(project, true, profile).files);
  // Automatic places when X / Y are empty: controls in a row, Panes below them
  const auto = Blocks.preset("blank");
  auto.config.rootType = "Pane";
  const a1 = Blocks.addComponent(auto, "Button", { name: "b1", text: "A" }), a2 = Blocks.addComponent(auto, "Label", { name: "l1", text: "B" });
  const pane = Blocks.addComponent(auto, "Pane", { name: "board", width: "200", height: "100" });
  const places = Blocks.placements(auto);
  same([places.get(a1.id), places.get(a2.id), places.get(pane.id)].map(p => [...p]), [[10, 10], [120, 10], [0, 50]]);
  // The other root types, with run-time controls added to the root itself
  for (const type of ["StackPane", "VBox", "HBox", "FlowPane"]) {
    const p = Blocks.preset("flowTags");
    p.config.rootType = type;
    p.config.layout = { root: { spacing: "6", padding: "10", align: type === "StackPane" ? "TOP_LEFT" : "CENTER", style: "-fx-background-color: white;" } };
    const out = Blocks.generate(p, true, profile).files;
    assert.match(out[0].code, new RegExp(type + " root = new " + type + "\\("));
    assert.match(out[0].code, /root\.getChildren\(\)\.add\(new Label\(/);
    assert.match(out[0].code, /root\.setAlignment\(Pos\./);
    assert.doesNotMatch(out[0].code, /centerBox|BorderPane/);
    addCompile("blocks/root-type/" + type, out);
    const named = plain(p);
    for (const event of named.events) { event.style = "named"; event.inject = "yes"; event.partner = ""; }
    const namedOut = Blocks.generate(named, true, profile).files;
    assert.match(namedOut[0].code, new RegExp("private " + type + " root;"));
    addCompile("blocks/root-type/" + type + "/inject", namedOut);
  }
  // Preview runs the root handler
  const rt = BlockPreview.create(project);
  rt.send("clicked", ["root"], { x: 80, y: 90, button: "PRIMARY" });
  assert.equal(rt.state[project.components.find(c => c.name === "statusLabel").id].text, "Circle at (80.0, 90.0), radius 30.0");
});

test("Block workbench: a Pane added after the shapes takes them (no extra Group beside it)", () => {
  const { Blocks } = core;
  const project = Blocks.preset("blank");
  const rect = Blocks.addComponent(project, "Rectangle", { color: "BLUE" });   // no Pane yet
  const pane = Blocks.addComponent(project, "Pane");
  assert.equal(rect.pane, pane.id, "the first Pane takes the shapes added before it");
  const out = Blocks.generate(project, true, profile);
  assert.match(out.files[0].code, /pane1\.getChildren\(\)\.add\(rect1\);/);
  assert.match(out.files[0].code, /root\.setCenter\(pane1\);/);
  assert.doesNotMatch(out.files[0].code, /Group|HBox/);
  same(plain(out.warnings), []);
  addCompile("blocks/pane-after-shape", out.files);
  // A second Pane does not take shapes away from the first one
  const second = Blocks.addComponent(project, "Pane");
  assert.equal(rect.pane, pane.id);
  assert.notEqual(second.id, pane.id);
  // Still a shape outside every Pane: the code keeps the Group and says how to move it
  rect.pane = "";
  const loose = Blocks.generate(project, true, profile);
  assert.match(loose.files[0].code, /new Group\(rect1\)/);
  assert.match(loose.warnings[0], /rect1[\s\S]*pane1/);
});

test("Lecture examples: every program builds, can be renamed and compiles", () => {
  const { Examples } = core;
  assert.ok(Examples.list.length >= 28, "expected the full lecture library");
  // The 32 lecture programs stay; the worked examples add the topics the lectures have no full program for.
  assert.equal(Examples.list.filter(e => e.lecture === "L7" || e.lecture === "L8").length, 32 + 5);
  for (const id of ["HandlerStylesDemo", "InputEventsDemo", "ColorBindingDemo", "InputCheckDemo", "A2ShapeApp",
    "MiniLibraryDemo", "WindowFlowDemo", "OopFileDemo"]) assert.ok(Examples.list.some(e => e.id === id), "worked example " + id);
  for (const [topic, pattern] of [["separate handler class", /class \w+ implements EventHandler/], ["anonymous class", /new EventHandler<ActionEvent>\(\) \{/],
    ["KEY_TYPED", /setOnKeyTyped/], ["double click", /getClickCount\(\)/], ["Color.rgb", /Color\.rgb\(/], ["binding", /\.bind\(/],
    ["NumberFormatException", /NumberFormatException/], ["Alert", /new Alert\(/], ["super(...)", /super\(\w+, \w+\)/], ["abstract class", /abstract class/],
    ["interface", /^interface /m], ["second Stage", /new Stage\(\)/], ["FlowPane remove", /getChildren\(\)\.remove\(/],
    ["PrintWriter", /new PrintWriter\(/], ["append", /new FileWriter\(file, true\)/], ["Scanner(File)", /new Scanner\((file|new File)/],
    ["overloading", /static void greet\(Person p, String/], ["instanceof", /instanceof/], ["ArrayList", /ArrayList</], ["ListView", /ListView</]]) {
    assert.ok(Examples.list.some(e => pattern.test(e.code)), "no example shows " + topic);
  }
  const ids = new Set();
  for (const example of Examples.list) {
    assert.ok(!ids.has(example.id), "duplicate example " + example.id);
    ids.add(example.id);
    const result = Examples.build(example.id, example.id, profile);
    checkFiles("example/" + example.id, result.files);
    addCompile("example/" + example.id, result.files);
  }
  for (const id of ["ControlCircle", "ShowBorderPane", "MultipleStageDemo"]) {
    const universal = Examples.build(id, id, { ...profile, imports: "universal" });
    assert.match(universal.files[0].code, /^\/\/ Name: Test Student[\s\S]*\/\/ JavaFX Application & Window\nimport javafx\.application\.Application;/);
    addCompile("example-universal/" + id, universal.files);
  }
  const renamed = Examples.build("ControlCircle", "MyCircleApp", profile);
  assert.equal(renamed.files[0].filename, "MyCircleApp.java");
  assert.doesNotMatch(renamed.files[0].code, /\bControlCircle\b/);
  assert.throws(() => Examples.build("ControlCircle", "CirclePane", profile), /辅助类/);
  same(Examples.search("getSource").map(e => e.id).includes("DetectSourceDemo"), true);
});

test("Key practice reads top-row and numpad digits in one handler", () => {
  const { Blocks, BlockPreview } = core;
  const project = Blocks.preset("keyPractice");
  const shape = project.components.find(node => node.type === "Circle");
  const text = project.components.find(node => node.type === "Text");
  const preview = BlockPreview.create(project);
  const play = (key, code) => preview.send("key", ["scene"], { code: BlockPreview.keyCode({ key, code }) });
  for (let digit = 1; digit <= 9; digit++) {
    const key = String(digit);
    for (const prefix of ["Digit", "Numpad"]) {
      assert.ok(Blocks.specs.key.fields.code.values.includes(prefix.toUpperCase() + digit));
      play(key, prefix + digit);
      assert.equal(preview.state[shape.id].radius, 10 * digit);
      assert.equal(preview.state[text.id].text, "x = 200, y = 150, r = " + (10 * digit));
    }
  }
  for (const [key, code] of [["0", "Digit0"], ["0", "Numpad0"], ["PageUp", "Numpad9"], ["a", "KeyA"]]) play(key, code);
  assert.equal(preview.state[shape.id].radius, 90);
  play("ArrowUp", "ArrowUp");
  assert.equal(preview.state[shape.id].y, 140);
  play("r", "KeyR");
  assert.equal(preview.state[text.id].text, "x = 200, y = 150, r = 90");
  preview.send("action", [project.events[1].target]);
  play("ArrowRight", "ArrowRight");
  assert.equal(preview.state[text.id].text, "x = 210, y = 150, r = 30");

  const code = Blocks.generate(project, true, profile).files[0].code;
  assert.equal((code.match(/setOnKeyPressed\(/g) || []).length, 1);
  assert.match(code, /case DIGIT0, NUMPAD0 -> 0;/);
  assert.match(code, /case DIGIT9, NUMPAD9 -> 9;/);
  assert.match(code, /int digit = pressedDigit;/);
  const read = project.events[0].actions.find(block => block.type === "keyDigit");
  const mirror = Blocks.copy(read);
  mirror.values.min = "0";
  mirror.values.max = "0";
  read.no.push(mirror);
  project.events[0].actions.push(Blocks.copy(read));
  addCompile("blocks/keyDigit-scope", Blocks.generate(project, true, profile).files);
  read.values.min = "10";
  assert.throws(() => Blocks.generate(project, true, profile), /最小数字需在 0 到 9 之间/);
  read.values.min = "8";
  read.values.max = "3";
  assert.throws(() => Blocks.generate(project, true, profile), /最小数字不能大于最大数字/);
});

test("Block workbench: presets, handler styles and every block type compile", () => {
  const { Blocks } = core;
  for (const [id] of Blocks.presets) {
    const project = Blocks.preset(id);
    const full = Blocks.generate(project, true, profile);
    checkFiles("blocks/" + id, full.files);
    addCompile("blocks/" + id, full.files);
    if (project.events.length) assert.ok(Blocks.generate(project, false, profile).length > 0);
  }
  for (const style of ["anonymous", "named", "shared"]) {
    const project = Blocks.preset("input");
    project.events[0].style = style;
    if (style === "shared") { project.events[0].partner = project.events[1].target; project.events.splice(1, 1); }
    else project.events[1].style = style;
    addCompile("blocks/input/" + style, Blocks.generate(project, true, profile).files);
  }
  // A project that uses every block, every event kind and every component type.
  const p = Blocks.preset("blank");
  const add = (type, o) => Blocks.addComponent(p, type, o);
  const pane = add("Pane", { name: "board" });
  const c = add("Circle", { name: "ball", pane: pane.id });
  const r = add("Rectangle", { name: "box", pane: pane.id, x: "20", y: "20" });
  const t = add("Text", { name: "caption", pane: pane.id, region: "center" });
  add("Circle", { name: "looseCircle", pane: "" });
  const label = add("Label", { name: "status", text: "Count: 0", region: "top" });
  const xIn = add("TextField", { name: "xIn", text: "10", region: "left" });
  const yIn = add("TextField", { name: "yIn", text: "20", region: "left" });
  const b1 = add("Button", { name: "goBtn", text: "Go", region: "right" });
  const b2 = add("Button", { name: "stopBtn", text: "Stop" });
  const blk = (type, values = {}, yes = [], no = []) => Blocks.createBlock(p, type, values, yes, no);
  const common = [
    blk("condition", { expression: "ball.getRadius() < 100" }, [blk("grow", { node: c.id, delta: "5", min: "2" })], [blk("radius", { node: c.id, value: "20" })]),
    blk("moveBounds", { node: r.id, axis: "Y", delta: "-5", min: "0", max: "200" }, [blk("step", { node: r.id, axis: "Y", delta: "-5" })]),
    blk("parse", { input: xIn.id, name: "value" }, [blk("expressionText", { label: label.id, text: "V: ", value: "value * 2" })], [blk("text", { label: label.id, text: "Bad" })]),
    blk("parsePair", { xInput: xIn.id, yInput: yIn.id, x: "nx", y: "ny" }, [blk("positionExpression", { node: t.id, x: "nx", y: "ny" })]),
    blk("place", { node: c.id, x: "50", y: "60" }), blk("color", { node: r.id, color: "RED" }), blk("visible", { node: t.id, visible: "true" }),
    blk("rotate", { node: r.id, delta: "15" }), blk("textNode", { node: t.id, text: "Moved" }), blk("counter", { label: label.id, prefix: "Count: ", amount: "1" }),
    blk("inputText", { input: xIn.id, text: "0" }), blk("clear", { input: yIn.id }), blk("positionText", { label: label.id, node: c.id, text: "X: ", axis: "X" }),
    blk("resetNode", { node: c.id }), blk("resetNode", { node: r.id }), blk("resetNode", { node: t.id }), blk("resetText", { target: label.id }),
    blk("disable", { target: b2.id, disabled: "false" }), blk("println", { text: "done" }), blk("java", { code: "System.out.println(\"custom\");" })
  ];
  p.events.push(Blocks.event("action", b1.id, [blk("source", { target: b1.id }, common)]));
  p.events.push(Blocks.event("clicked", pane.id, [blk("mouseButton", { button: "SECONDARY" }, [blk("follow", { node: c.id })], [blk("mouseText", { label: label.id })]),
    blk("bounds", {}, [blk("follow", { node: t.id })])]));
  p.events.push(Blocks.event("key", "scene", [blk("key", { code: "UP" }, [blk("step", { node: t.id, axis: "Y", delta: "-10" })], [blk("keyText", { label: label.id })])]));
  p.events.push(Blocks.event("close", "stage", [blk("println", { text: "closing" }), blk("consume")]));
  p.events.push(Blocks.event("showing", "stage", [blk("println", { text: "showing" })]));
  p.events.push(Blocks.event("entered", c.id, [blk("color", { node: c.id, color: "GREEN" })]));
  p.events.at(-1).style = "anonymous";
  const out = Blocks.generate(p, true, profile);
  checkFiles("blocks/everything", out.files);
  addCompile("blocks/everything", out.files);
  assert.match(out.files[0].code, /root\.setTop\(topBox\);/);
  assert.match(out.files[0].code, /e\.getButton\(\) == MouseButton\.SECONDARY/);
  p.events.push(Blocks.event("action", b1.id, []));
  assert.throws(() => Blocks.generate(p, true, profile), /已注册过/);
});

test("Block workbench v2.2: variables, read-back numbers, Timeline, alerts, images and handler classes", () => {
  const { Blocks, BlockPreview } = core;
  const p = Blocks.preset("blank");
  const add = (type, o) => Blocks.addComponent(p, type, o);
  const pane = add("Pane", { name: "board" });
  const c = add("Circle", { name: "c", pane: pane.id, radius: "30" });
  const oval = add("Ellipse", { name: "oval", pane: pane.id });
  const img = add("ImageView", { name: "logo" });
  const status = add("Label", { name: "status", text: "Ready", region: "top" });
  const nameIn = add("TextField", { name: "nameIn", text: "", region: "top" });
  const ageIn = add("TextField", { name: "ageIn", text: "", region: "top" });
  const go = add("Button", { name: "goBtn", text: "Go" }), two = add("Button", { name: "twoBtn", text: "Two" }), three = add("Button", { name: "threeBtn", text: "Three" });
  const timer = add("Timeline", { name: "timer", interval: "200" });
  const count = Blocks.addVariable(p, "int", { name: "count" }), total = Blocks.addVariable(p, "double", { name: "total" });
  const locked = Blocks.addVariable(p, "boolean", { name: "locked", value: "true" }), saved = Blocks.addVariable(p, "String", { name: "saved" });
  const blk = (type, values = {}, yes = [], no = []) => Blocks.createBlock(p, type, values, yes, no);
  p.events.push({ ...Blocks.event("action", go.id, [
    blk("source", { target: go.id }, [blk("radiusLimited", { node: c.id, op: "mul", amount: "2", min: "5", max: "100" },
      [blk("template", { label: status.id, text: "Radius: {c.radius} at ({c.x}, {c.y}) {count} {saved} {nameIn}" })], [blk("text", { label: status.id, text: "Invalid radius" })])],
      [blk("logic", { test: { kind: "blank", input: nameIn.id } }, [blk("text", { label: status.id, text: "Invalid name" })],
        [blk("parse", { input: ageIn.id, name: "age", numType: "int", min: "10", max: "100" }, [
          blk("parse", { input: nameIn.id, name: "blue" }, [blk("rgb", { node: oval.id, r: { kind: "local", name: "age" }, g: { kind: "number", value: "0" }, b: { kind: "local", name: "blue" } })]),
          blk("template", { label: status.id, text: "Registered: {nameIn}, Age: {age}" })], [blk("text", { label: status.id, text: "Invalid age" })])])])]),
    style: "shared", partner: two.id, more: [three.id] });
  p.events.push({ ...Blocks.event("action", ageIn.id, [
    blk("setNumber", { variable: count.id, value: { kind: "math", op: "add", left: { kind: "var", variable: count.id }, right: { kind: "prop", node: c.id, prop: "Radius" } } }),
    blk("changeNumber", { variable: total.id, amount: "-2.5" }), blk("setTextVar", { variable: saved.id, input: nameIn.id }), blk("setTextLiteral", { variable: saved.id, text: "x" }),
    blk("resetVar", { variable: locked.id }), blk("style", { node: status.id }), blk("alert", { kind: "WARNING", text: "Careful" }),
    blk("confirm", { text: "Sure?" }, [blk("timeline", { timeline: timer.id, action: "play" })], [blk("timeline", { timeline: timer.id, action: "stop" })]),
    blk("imageError", { image: img.id }, [blk("text", { label: status.id, text: "Image unavailable" })]),
    blk("rotate", { node: img.id, delta: "90" }), blk("resetNode", { node: img.id }), blk("resetNode", { node: oval.id })]), style: "named", className: "AgeHandler", inject: "yes" });
  p.events.push({ ...Blocks.event("tick", timer.id, [blk("changeNumber", { variable: count.id, amount: "1" }),
    blk("logic", { test: { kind: "textEq", input: nameIn.id, variable: saved.id } }, [blk("closeWindow")])]), style: "anonymous" });
  p.events.push(Blocks.event("close", "stage", [blk("logic", { test: { kind: "flag", variable: locked.id } }, [blk("consume")])]));
  p.events.push({ ...Blocks.event("action", nameIn.id, [blk("setFlag", { variable: locked.id, value: "false" })]), style: "named", className: "NameHandler" });
  const out = Blocks.generate(p, true, profile);
  checkFiles("blocks/v2.2", out.files);
  addCompile("blocks/v2.2", out.files);
  const code = out.files[0].code;
  for (const re of [/private int count = 0;/, /private boolean locked = true;/, /private String saved = "";/,
    /private class AgeHandler implements EventHandler<ActionEvent> \{/, /public AgeHandler\(Circle c, Ellipse oval, ImageView logo, Label status, TextField nameIn, Timeline timer\)/,
    /ageIn\.setOnAction\(new AgeHandler\(c, oval, logo, status, nameIn, timer\)\);/, /class NameHandler implements EventHandler<ActionEvent>/,
    /threeBtn\.setOnAction\(sharedHandler1\);/, /int age = Integer\.parseInt\(ageIn\.getText\(\)\.trim\(\)\);/, /Color\.rgb\(age, 0, \(int\) \(blue\)\)/,
    /if \(c\.getRadius\(\) \* 2 >= 5 && c\.getRadius\(\) \* 2 <= 100\) \{\s*c\.setRadius\(c\.getRadius\(\) \* 2\);/,
    /"Radius: " \+ c\.getRadius\(\) \+ " at \(" \+ c\.getCenterX\(\) \+ ", " \+ c\.getCenterY\(\) \+ "\) " \+ count/,
    /timer\.getKeyFrames\(\)\.add\(new KeyFrame\(Duration\.millis\(200\), new EventHandler<ActionEvent>\(\) \{/, /timer\.setCycleCount\(Timeline\.INDEFINITE\);/,
    /Alert confirm = new Alert\(Alert\.AlertType\.CONFIRMATION, "Sure\?"\);/, /if \(logo\.getImage\(\)\.isError\(\)\)/, /new Image\("file:images\/logo\.png"\)/,
    /nameIn\.getText\(\)\.trim\(\)\.isEmpty\(\)/, /nameIn\.getText\(\)\.trim\(\)\.equals\(saved\)/, /count = \(int\) \(\(count \+ c\.getRadius\(\)\)\);/]) {
    assert.match(code, re);
  }
  assert.doesNotMatch(code, /setOnMouseClicked/);
  // The snippet keeps the handler class, so it can be pasted into a given program.
  assert.match(Blocks.generate(p, false, profile), /private class AgeHandler/);
  // Clear error messages instead of broken Java.
  const bad = Blocks.copy(p);
  bad.events[0].actions[0].yes[0].yes[0].values.text = "{nobody}";
  assert.throws(() => Blocks.generate(bad, true, profile), /组合文字里的 \{nobody\}/);
  const clash = Blocks.copy(p);
  clash.events[1].className = "NameHandler";
  assert.throws(() => Blocks.generate(clash, true, profile), /已被使用/);
  // The new presets compile (covered by the preset loop) and behave the same in the preview.
  const run = (id, steps) => {
    const project = Blocks.preset(id), rt = BlockPreview.create(project);
    const idOf = name => ["stage", "scene"].includes(name) ? name : project.components.find(x => x.name === name).id;
    return steps.map(([type, name]) => {
      const r = rt.send(type, [idOf(name)]);
      const circle = project.components.find(x => x.type === "Circle");
      return { label: project.components.filter(x => x.type === "Label").map(x => rt.state[x.id].text).join(" | "), consumed: r.consumed, r: circle && rt.state[circle.id].radius };
    });
  };
  const watch = run("stopwatch", [["action", "startBtn"], ["tick", "timeline"], ["tick", "timeline"], ["action", "pauseBtn"], ["action", "resetBtn"]]);
  same(watch.map(x => x.label), ["Time: 0", "Time: 1", "Time: 2", "Time: 2", "Time: 0"]);
  const lock = run("lockClose", [["close", "stage"], ["action", "unlockBtn"], ["close", "stage"]]);
  same(lock.map(x => [x.label, x.consumed]), [["Closing is not allowed", true], ["Window unlocked", false], ["Window unlocked", false]]);
  const limit = run("radiusLimit", Array(8).fill(["action", "growBtn"]));
  same([limit[0].label, limit[6].r, limit[7].r, limit[7].label], ["Radius: 40.0", 100, 100, "Radius must stay between 10 and 100"]);
  // A bound centre follows the pane; moving a bound circle is refused; Reset leaves the binding alone.
  const centred = Blocks.preset("blank");
  const board = Blocks.addComponent(centred, "Pane", { name: "board", width: "400", height: "300" });
  const dot = Blocks.addComponent(centred, "Circle", { name: "dot", pane: board.id, bind: "yes" });
  const reset = Blocks.addComponent(centred, "Button", { name: "resetBtn", text: "Reset" });
  centred.events.push(Blocks.event("action", reset.id, [Blocks.createBlock(centred, "resetNode", { node: dot.id })]));
  const bound = Blocks.generate(centred, true, profile);
  addCompile("blocks/v2.2/bind", bound.files);
  assert.match(bound.files[0].code, /dot\.centerXProperty\(\)\.bind\(board\.widthProperty\(\)\.divide\(2\)\);/);
  assert.doesNotMatch(bound.files[0].code, /dot\.setCenterX/);
  same([BlockPreview.create(centred).state[dot.id].x, BlockPreview.create(centred).state[dot.id].y], [200, 150]);
  centred.events[0].actions.push(Blocks.createBlock(centred, "step", { node: dot.id, delta: "5" }));
  assert.throws(() => Blocks.generate(centred, true, profile), /绑定/);
  // Format suffixes: %.2f gets a double, %d an int; text cannot be formatted. Color.rgb constants and Timeline intervals are checked.
  const fmt = Blocks.preset("blank");
  const fmtBtn = Blocks.addComponent(fmt, "Button", { name: "go", text: "Go" }), fmtOut = Blocks.addComponent(fmt, "Label", { name: "out", text: "" });
  const fmtIn = Blocks.addComponent(fmt, "TextField", { name: "inp", text: "" });
  const clicks = Blocks.addVariable(fmt, "int", { name: "clicks" }), price = Blocks.addVariable(fmt, "double", { name: "price" });
  fmt.events.push(Blocks.event("action", fmtBtn.id, [Blocks.createBlock(fmt, "changeNumber", { variable: clicks.id }),
    Blocks.createBlock(fmt, "template", { label: fmtOut.id, text: "{clicks:.2f} {price:d} {clicks:d} {price:.1f}" })]));
  const fmtCode = Blocks.generate(fmt, true, profile);
  addCompile("blocks/v2.2/format", fmtCode.files);
  assert.match(fmtCode.files[0].code, /String\.format\("%\.2f", \(double\) clicks\) \+ " " \+ String\.format\("%d", \(int\) \(price\)\) \+ " " \+ String\.format\("%d", clicks\)/);
  const fmtRt = BlockPreview.create(fmt);
  fmtRt.send("action", [fmtBtn.id]);
  assert.equal(fmtRt.state[fmtOut.id].text, "1.00 0 1 0.0");
  fmt.events[0].actions[1].values.text = "{inp:d}";
  assert.throws(() => Blocks.generate(fmt, true, profile), /格式只适用于数字/);
  fmt.events[0].actions[1].values.text = "ok";
  fmt.events[0].actions.push(Blocks.createBlock(fmt, "rgb", { node: "", r: { kind: "number", value: "300" } }));
  const ball = Blocks.addComponent(fmt, "Circle", { name: "ball" });
  fmt.events[0].actions[2].values.node = ball.id;
  assert.throws(() => Blocks.generate(fmt, true, profile), /0–255/);
  fmt.events[0].actions.pop();
  // The snippet keeps the variable fields and says which lines go outside start().
  const fmtSnippet = Blocks.generate(fmt, false, profile);
  assert.match(fmtSnippet, /^\/\/ ---- Class body[^\n]*\nprivate int clicks = 0;\nprivate double price = 0\.0;\n\/\/ ---- start\(\)/);
  const tick = Blocks.preset("stopwatch");
  tick.components.find(x => x.type === "Timeline").interval = "0";
  assert.throws(() => Blocks.generate(tick, true, profile), /Timeline 间隔/);
  // A new text block lands on a Label, not on the input box the event just read.
  const form = Blocks.preset("blank");
  const input = Blocks.addComponent(form, "TextField", { name: "ageIn", text: "" });
  const shown = Blocks.addComponent(form, "Label", { name: "shown", text: "Ready" });
  assert.equal(Blocks.createBlock(form, "template", {}, [], [], [input.id]).values.label, shown.id);
  assert.equal(Blocks.createBlock(form, "resetText", {}, [], [], [input.id]).values.target, shown.id);
});

test("Shape program v2.2: bounds, status label, own colours, rotation, start shape and click toggle", () => {
  const q1 = OopGen.defaults();
  Object.assign(q1, { appClass: "CircleApp", title: "Circle Controller", output: "single", numType: "double", anchor: "center", startX: "200", startY: "150",
    panel: "bottom", buttonWidth: "0", canvasW: "500", canvasH: "300", sceneW: "500", sceneH: "400", printConsole: "no",
    statusLabel: "yes", noShapeMessage: "No circle available", boundMinY: "30", boundMaxY: "270" });
  q1.shapes[0].size1 = "30";
  q1.buttons[0].done = "Circle added"; q1.buttons[4].done = "Y: {y}";
  const a = OopGen.generate(q1, profile);
  checkFiles("oop/v2.2/bounds", a.files);
  addCompile("oop/v2.2/bounds", a.files);
  assert.match(a.files[0].code, /private boolean canMove\(double dx, double dy\)/);
  assert.match(a.files[0].code, /if \(canMove\(0, -15\)\) \{/);
  assert.match(a.files[0].code, /statusLabel\.setText\("No circle available"\);/);
  let st = OopGen.initialState(q1);
  for (const i of [0, 2, 4, 1, 5]) st = OopGen.apply(q1, st, i);
  assert.equal(st.status, "No circle available");
  st = OopGen.apply(q1, OopGen.initialState(q1), 0);
  for (let k = 0; k < 9; k++) st = OopGen.apply(q1, st, 4);
  same([st.shapes[0].y, st.status], [30, "Boundary reached"]);
  const q5 = plain(OopGen.presets().find(p => p.id === "multi").model);
  Object.assign(q5, { appClass: "ShapeViewerApp", output: "single", storage: "single", infoFormat: "{class}, angle {angle}", statusLabel: "yes", noShapeMessage: "No shape selected" });
  q5.shapes = [{ kind: "circle", className: "CircleShape", size1: "35", color: "BLUE" }, { kind: "rectangle", className: "RectangleShape", size1: "100", size2: "60", color: "RED" },
    { kind: "ellipse", className: "EllipseShape", size1: "60", size2: "30", color: "GREEN" }];
  q5.buttons = [{ text: "Circle", action: "add", arg: "CircleShape" }, { text: "Rectangle", action: "add", arg: "RectangleShape" }, { text: "Ellipse", action: "add", arg: "EllipseShape" },
    { text: "Clear", action: "clear" }, { text: "Rotate", action: "rotate", done: "Angle: {angle}" }];
  const b = OopGen.generate(q5, profile);
  checkFiles("oop/v2.2/rotate", b.files);
  addCompile("oop/v2.2/rotate", b.files);
  assert.match(b.files[0].code, /addShape\(paint\(new RectangleShape\(\), Color\.RED\)\)/);
  assert.match(b.files[0].code, /angle = \(angle \+ 45\) % 360;/);
  let s5 = OopGen.apply(q5, OopGen.initialState(q5), 1);
  s5 = OopGen.apply(q5, s5, 4); s5 = OopGen.apply(q5, s5, 4);
  same([s5.shapes[0].color, s5.angle, s5.status], ["RED", 90, "Angle: 90.0"]);
  assert.throws(() => OopGen.generate({ ...plain(q5), storage: "list" }, profile), /旋转只支持/);
  // {angle} without a Rotate button is 0.0, not an undeclared field.
  const noTurn = { ...plain(q1), infoLabel: "yes", infoFormat: "{class} at {angle}" };
  const noTurnCode = OopGen.generate(noTurn, profile);
  addCompile("oop/v2.2/no-rotate-angle", noTurnCode.files);
  assert.match(noTurnCode.files[0].code, /infoLabel\.setText\(activeShape\.getClass\(\)\.getSimpleName\(\) \+ " at " \+ 0\.0\);/);
  // Dragging obeys the same position limits as the buttons.
  const dragged = { ...plain(q1), mouseControl: "drag" };
  const dragCode = OopGen.generate(dragged, profile);
  addCompile("oop/v2.2/drag-bounds", dragCode.files);
  assert.match(dragCode.files[0].code, /if \(canMove\(e\.getX\(\) - activeShape\.x, e\.getY\(\) - activeShape\.y\)\) \{/);
  let sd = OopGen.apply(dragged, OopGen.initialState(dragged), 0);
  sd = OopGen.event(dragged, sd, { type: "mouse", x: 100, y: 290 });
  same([sd.shapes[0].y, sd.status], [150, "Boundary reached"]);
  sd = OopGen.event(dragged, sd, { type: "mouse", x: 100, y: 60 });
  same([sd.shapes[0].x, sd.shapes[0].y], [100, 60]);
  const q27 = plain(OopGen.presets().find(p => p.id === "anim").model);
  Object.assign(q27, { appClass: "PlayerApp", startX: "50", startY: "100", baseColor: "BLUE", animInterval: "300", keyControl: "arrows", keyStep: "10",
    boundMinX: "20", boundMaxX: "280", statusLabel: "yes", moveDone: "X: {x}", startShape: "Ball", mouseControl: "toggle", toggleColor: "RED" });
  q27.buttons = [{ text: "Start", action: "animStart" }, { text: "Pause", action: "animStop", done: "Paused" }, { text: "Reset", action: "animReset", arg: "Ball" }];
  const d = OopGen.generate(q27, profile);
  checkFiles("oop/v2.2/player", d.files);
  addCompile("oop/v2.2/player", d.files);
  const app = d.files.find(f => f.filename === "PlayerApp.java").code;
  assert.match(app, /activeShape\.x -= 10;/);
  assert.match(app, /e\.getTarget\(\) instanceof javafx\.scene\.shape\.Shape/);
  assert.match(app, /timeline\.stop\(\);   \/\/ stop at the boundary/);
  assert.match(app, /addShape\(new Ball\(\)\);   \/\/ the window starts with one shape/);
  let s27 = OopGen.apply(q27, OopGen.initialState(q27), 0);
  for (let k = 0; k < 60; k++) s27 = OopGen.event(q27, s27, { type: "tick" });
  same([s27.shapes[0].x, s27.anim, s27.status], [280, false, "Boundary reached"]);
  s27 = OopGen.event(q27, s27, { type: "mouse", onShape: true });
  assert.equal(s27.shapes[0].color, "RED");
});

test("Record generator v2.2: selection listener, typed key in a list, start-up load, Clear all, messages and boolean words", () => {
  const lab3 = RecordGen.generate(RecordGen.defaults(), profile).files.find(f => f.filename === "LibraryAdminApp.java").code;
  assert.match(lab3, /listView\.getSelectionModel\(\)\.selectedIndexProperty\(\)\.addListener\(\(observable, oldIndex, newIndex\) -> selectFromList\(\)\);/);
  assert.doesNotMatch(lab3, /setOnMouseClicked/);
  const q21 = plain(RecordGen.presets().find(p => p.id === "lab3").model);
  Object.assign(q21, { appClass: "LibraryApp", fEdit: "no", fSearch: "no", fDisplay: "no", fLoadTest: "no", fSort: "no", fExit: "no", pick: "either",
    dupMessage: "Duplicate ISBN", notFoundMessage: "Book not found", displayFormat: "{isbn} - {title} [{available|Available|Borrowed}]" });
  const a = RecordGen.generate(q21, profile);
  checkFiles("record/v2.2/typed", a.files);
  addCompile("record/v2.2/typed", a.files);
  const book = a.files.find(f => f.filename === "Book.java").code, app = a.files.find(f => f.filename === "LibraryApp.java").code;
  assert.match(book, /return isbn \+ " - " \+ title \+ " \[" \+ \(available \? "Available" : "Borrowed"\) \+ "\]";/);
  assert.match(app, /showError\("Book not found"\);/);
  assert.match(app, /showError\("Duplicate ISBN"\);/);
  assert.match(app, /Book book = chooseBook\(\);/);
  assert.doesNotMatch(app, /borrowButton\.setDisable/);
  const q29 = { ...plain(q21), appClass: "MiniLibraryApp", saveMode: "manual", loadOnStart: "yes", clearAll: "yes", dupMessage: "Duplicate ISBN: {key}" };
  const b = RecordGen.generate(q29, profile);
  checkFiles("record/v2.2/manual", b.files);
  addCompile("record/v2.2/manual", b.files);
  const mini = b.files.find(f => f.filename === "MiniLibraryApp.java").code;
  assert.match(mini, /if \(new File\(DATA_FILE\)\.exists\(\)\) \{/);
  assert.match(mini, /books\.clear\(\);   \/\/ memory only/);
  assert.match(mini, /showError\("Duplicate ISBN: " \+ book\.getISBN\(\)\);/);
  assert.throws(() => RecordGen.generate({ ...plain(q21), displayFormat: "{title|a|b}" }, profile), /只能用于 boolean 字段/);
  // In 'either' mode a key typed after selecting a row wins over the old selection.
  assert.match(app, /if \(selectedBook != null && \(isbn\.isEmpty\(\) \|\| selectedBook\.getISBN\(\)\.equals\(isbn\)\)\) \{/);
  // Records given in the question are added at start-up when the list is empty, and the Load button can be left out.
  const q25 = { ...plain(q21), appClass: "LibraryBorrowApp", saveMode: "manual", fLoadFile: "no", seedOnStart: "yes", fAdd: "no", fDelete: "no", fClear: "no" };
  const seeded = RecordGen.generate(q25, profile);
  addCompile("record/v2.2/seeded", seeded.files);
  const seedApp = seeded.files.find(f => f.filename === "LibraryBorrowApp.java").code;
  assert.match(seedApp, /if \(books\.isEmpty\(\)\) \{/);
  assert.doesNotMatch(seedApp, /new Button\("Load/);
  assert.match(seedApp, /new Button\("Save/);
});

test("Practice drills Q7-Q25 compile with default and alternative settings", () => {
  const { Practice } = core;
  assert.equal(Practice.catalog.length, 19);
  for (const item of Practice.catalog) {
    const result = Practice.generate(item.id, Practice.defaults(item.id), profile);
    checkFiles("practice/" + item.id, result.files);
    addCompile("practice/" + item.id, result.files);
  }
  for (const handlerStyle of ["anonymous", "named"]) {
    addCompile("practice/q9/" + handlerStyle, Practice.generate("q9", { ...Practice.defaults("q9"), handlerStyle }, profile).files);
  }
  addCompile("practice/q16/variant", Practice.generate("q16", { ...Practice.defaults("q16"), repeat: "finite", stopMode: "reset", wrap: "yes", axis: "Y" }, profile).files);
});

test("Scratch-style conditions and the preview obey the same inputs and boundaries", () => {
  const { Blocks, BlockPreview, VisualExpr } = core;
  const shift = Blocks.preset("shift");
  const ball = shift.components.find(c => c.type === "Circle").id;
  const sim = BlockPreview.create(shift);
  sim.send("key", ["scene"], { code: "RIGHT" });
  assert.equal(sim.state[ball].x, 105);
  sim.send("key", ["scene"], { code: "RIGHT", shiftKey: true });
  assert.equal(sim.state[ball].x, 125);
  for (let i = 0; i < 12; i++) sim.send("key", ["scene"], { code: "RIGHT", shiftKey: true });
  assert.equal(sim.state[ball].x, 345);
  assert.match(sim.state[shift.components.find(c => c.type === "Label").id].text, /Boundary/);
  const code = Blocks.generate(shift, true, profile);
  const range = code.blockRanges["0/1/yes/0"];
  assert.match(code.files[0].code.slice(...range), /if \(e\.isShiftDown\(\)\)/);
  assert.doesNotMatch(code.files[0].code, /@fxb:/);
  assert.throws(() => VisualExpr.compile({ kind: "number", value: "5" }, "boolean", { kind: "action", locals: new Set() }), /条件/);
  assert.throws(() => VisualExpr.compile({ kind: "modifier", key: "shift" }, "boolean", { kind: "action", locals: new Set() }), /键盘或鼠标/);
  assert.throws(() => VisualExpr.compile({ kind: "local", name: "number" }, "number", { kind: "action", locals: new Set() }), /成功分支/);
  const p = Blocks.preset("safeInput");
  const preview = BlockPreview.create(p);
  const input = p.components.find(c => c.type === "TextField").id, circle = p.components.find(c => c.type === "Circle").id;
  preview.state[input].text = "42";
  preview.send("action", [p.events[0].target]);
  assert.equal(preview.state[circle].radius, 42);
  for (const bad of ["Infinity", "NaN", "0", "abc", "1e500"]) {
    preview.state[input].text = bad;
    preview.send("action", [input]);
    assert.equal(preview.state[circle].radius, 42);
  }
  preview.reset();
  assert.equal(preview.state[circle].radius, 25);
  const nested = Blocks.createBlock(shift, "logic", { test: { kind: "and",
    left: { kind: "modifier", key: "shift" }, right: { kind: "not", value: { kind: "false" } }
  } }, [Blocks.createBlock(shift, "println", { text: "paired condition" })]);
  shift.events[0].actions.push(nested);
  addCompile("upgrade/nested", Blocks.generate(shift, true, profile).files);
});

test("Course variants expose a centered scene, size bounds, AND search and delimited I/O", () => {
  const ex = core.Examples.build("ButtonInPane", "Lesson01StackPane", profile,
    { title: "EIE3320 - WK8 Practice 01", button: "EIE3320", width: "500", height: "300" });
  addCompile("upgrade/wk8", ex.files);
  assert.match(ex.files[0].code, /new Scene\(pane, 500, 300\)/);

  const rect = plain(OopGen.presets().find(p => p.id === "input").model);
  rect.appClass = "RectangleWorkshop";
  Object.assign(rect.shapes[0], { kind: "rectangle", className: "MeasuredRectangle", size1: "40", size2: "25" });
  rect.buttons[0].arg = "MeasuredRectangle"; rect.buttons[0].text = "Add Rectangle";
  Object.assign(rect, { inputLabels: "Width:,Height:", inputDefaults: "40,25", inputMins: "10", inputMaxs: "120,90", invalidMessage: "Invalid size" });
  addCompile("upgrade/rect", OopGen.generate(rect, profile).files);

  const book = { ...RecordGen.defaults(), appClass: "AndBookSearch", searchMode: "all",
    testData: "001,Java Basics,true\n002,Python Basics,true\n101,Advanced Java,true" };
  addCompile("upgrade/search", RecordGen.generate(book, profile).files);
  const stock = plain(RecordGen.presets().find(p => p.id === "products").model);
  stock.appClass = "CappedStock"; stock.file = "stock.txt"; stock.fLoadTest = "yes"; stock.testData = "P1,Pen,2,1.50";
  Object.assign(stock.fields[2], { min: "0", max: "5" });
  Object.assign(stock.adjusts[0], { text: "Sell 2", delta: "-2" });
  Object.assign(stock.adjusts[1], { text: "Restock 3", delta: "3", max: "5" });
  addCompile("upgrade/stock", RecordGen.generate(stock, profile).files);
  assert.throws(() => RecordGen.normalize({ ...stock, testData: "P1,Pen,6,1.50" }), /Quantity/);
  const files = { ...RecordGen.defaults(), appClass: "DelimitedLibrary", file: "inventory.txt", fileDelimiter: "semicolon", fileHeader: "yes",
    testData: 'isbn;title;available;copies\n001;"Intro; ""Quote"", Java";true;3' };
  files.fields.push({ name: "copies", type: "int", label: "Copies", inForm: "yes", min: "0" });
  same(RecordGen.normalize(files).sampleRows[0], ["001", 'Intro; "Quote", Java', "true", "3"]);
  assert.throws(() => RecordGen.normalize({ ...files, testData: '001;"broken;true;3' }), /第 1 行/);
  addCompile("upgrade/files", RecordGen.generate(files, profile).files);
  addCompile("upgrade/filelock", RecordGen.generate({ ...files, appClass: "ManualLibrary", saveMode: "manual" }, profile).files);
  addCompile("upgrade/tab", RecordGen.generate({ ...files, appClass: "TabbedLibrary", fileDelimiter: "tab", testData: "001\tText, with comma\ttrue\t3" }, profile).files);
});

test("BlueJ export: package.bluej lists every class and the ZIP is valid", () => {
  const { BlueJ } = core;
  const result = OopGen.generate(OopGen.defaults(), profile);
  const files = BlueJ.projectFiles(result.files, "A2Project", profile, result.main);
  const pkg = files.find(f => f.filename === "package.bluej").code;
  assert.match(pkg, /package\.numTargets=4/);
  assert.match(pkg, /type=InterfaceTarget/);
  assert.match(pkg, /type=AbstractTarget/);
  const zip = Buffer.from(BlueJ.zip(files, "A2Project"));
  // Minimal ZIP reader: walk the central directory and check every stored entry and CRC.
  const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = zip.readUInt16LE(eocd + 10);
  let at = zip.readUInt32LE(eocd + 16);
  const names = [];
  const crcTable = Array.from({ length: 256 }, (_, n) => { for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
  const crc32 = buf => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  for (let i = 0; i < count; i++) {
    assert.equal(zip.readUInt32LE(at), 0x02014b50);
    const crc = zip.readUInt32LE(at + 16), size = zip.readUInt32LE(at + 20), nameLen = zip.readUInt16LE(at + 28), offset = zip.readUInt32LE(at + 42);
    const name = zip.subarray(at + 46, at + 46 + nameLen).toString("utf8");
    names.push(name);
    const localNameLen = zip.readUInt16LE(offset + 26);
    const data = zip.subarray(offset + 30 + localNameLen, offset + 30 + localNameLen + size);
    assert.equal(crc32(data), crc, "CRC of " + name);
    at += 46 + nameLen;
  }
  same(names.sort(), ["A2Project/", "A2Project/Drawable.java", "A2Project/JavaFXCircle.java", "A2Project/JavaFXMainApp.java",
    "A2Project/README.TXT", "A2Project/Shape.java", "A2Project/package.bluej"]);
});

test("JavaFX runtime filter drops only the known Windows accessibility exception", async () => {
  const { dropAccessibilityNoise: drop } = await import("./smoke.mjs");
  const head = 'Exception in thread "JavaFX Application Thread" ';
  const frames = (...middle) => ["\tat java.base/java.lang.String.checkBoundsBeginEnd(String.java:4606)",
    "\tat java.base/java.lang.String.substring(String.java:2709)", ...middle,
    "\tat javafx.graphics/com.sun.glass.ui.win.WinApplication._runLoop(Native Method)",
    "\tat java.base/java.lang.Thread.run(Thread.java:840)"];
  const getText = "\tat javafx.graphics/com.sun.glass.ui.win.WinTextRangeProvider.GetText(WinTextRangeProvider.java:348)";
  const known = [head + "java.lang.StringIndexOutOfBoundsException: begin 0, end 13, length 0", ...frames(getText)];
  const wrap = block => ["STEP 0 {}", ...block, "STEP 1 {}"].join("\n");

  assert.deepEqual(drop(wrap(known)), { output: "STEP 0 {}\nSTEP 1 {}", dropped: 1 });
  const kept = {
    "another exception type": [head + "java.lang.NullPointerException", ...frames(getText)],
    "another provider method": [known[0], ...frames(getText.replace("GetText", "Move"))],
    "no GetText frame": [known[0], ...frames()],
    "a generated program frame": [known[0], ...frames(getText, "\tat LibraryAdminApp.addBook(LibraryAdminApp.java:120)")],
    "a test driver frame": [known[0], ...frames(getText, "\tat FxSmoke.perform(FxSmoke.java:88)")],
    "another thread": [known[0].replace("JavaFX Application Thread", "main"), ...frames(getText)]
  };
  for (const [why, block] of Object.entries(kept)) {
    assert.deepEqual(drop(wrap(block)), { output: wrap(block), dropped: 0 }, "must keep the exception with " + why);
  }
});

test("Built page: dist matches the sources, is self-contained and its script parses", async () => {
  const { buildHtml, distFile } = await import("../build.mjs");
  assert.ok(fs.existsSync(distFile), "run node build.mjs first");
  const dist = fs.readFileSync(distFile, "utf8").replace(/\r\n/g, "\n");
  const stamp = (/<small>v2(?:\.\d+)? · (\d{4}-\d\d-\d\d)<\/small>/.exec(dist) || [])[1];
  assert.ok(stamp, "build stamp missing");
  assert.equal(dist, buildHtml(stamp), "builder/dist is out of date: run node build.mjs");
  assert.doesNotMatch(dist, /<script\s+src|<link\s|https?:\/\/(?!www\.w3\.org)/i, "page must not load anything from the network");
  assert.match(dist, /connect-src 'none'/);
  const script = dist.slice(dist.indexOf("<script>") + 8, dist.lastIndexOf("</script>"));
  new vm.Script(script, { filename: "page.js" });
  assert.doesNotMatch(script, /\binnerHTML\b|\beval\(|new Function\(/, "no innerHTML, eval or new Function");
});

// The six self-written exam variants were answered in the browser using only the builder UI.
// solutions.json keeps the builder settings and a checksum of every file the page showed.
// Replaying the settings here must give the same files, which are then compiled and run.
export function replayVariant(id, solution) {
  const files = [];
  if (solution.skeleton) {
    const dir = path.join(here, "exam-variants", solution.given);
    const given = fs.readdirSync(dir).filter(f => f.endsWith(".java")).sort().map(f => fs.readFileSync(path.join(dir, f), "utf8"));
    const parsed = given.map((src, i) => Skeleton.parse(src, "file " + (i + 1)));
    const s = solution.skeleton;
    const suggestions = Skeleton.suggest(parsed, { anchor: s.anchor, step: Number(s.step) || 15, resize: Number(s.resize) || 10,
      sizes: Object.fromEntries(Object.entries(s.sizes).map(([k, v]) => [k, Number(v) || undefined])) });
    for (const sug of suggestions) if (s.edits[sug.id]) Object.assign(sug, s.edits[sug.id]);
    parsed.forEach((p, i) => {
      const name = (p.types.find(t => t.isPublic) || p.types[0]).name;
      files.push({ filename: name + ".java", code: Skeleton.apply(p, i, suggestions, profile) });
    });
    if (s.withMain) files.push(...OopGen.generate(solution.oop, profile).files);
  } else if (solution.oop) files.push(...OopGen.generate(solution.oop, profile).files);
  if (solution.record) files.push(...RecordGen.generate(solution.record, profile).files);
  return files;
}
const pageChecksum = text => { let h = 0; for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return text.length + ":" + h; };
const variantFile = path.join(here, "exam-variants", "solutions.json");
const variantSolutions = JSON.parse(fs.readFileSync(variantFile, "utf8"));

test("Exam variants: the saved builder settings reproduce exactly what the page produced", () => {
  for (const [id, solution] of Object.entries(variantSolutions)) {
    const files = replayVariant(id, solution);
    const actual = Object.fromEntries(files.map(f => [f.filename, pageChecksum(f.code)]));
    if (refreshChecksums) solution.files = actual;
    else same(actual, solution.files, id + ": replay differs from the expected output");
    checkFiles("variant/" + id, files);
    addCompile("variant/" + id, files);
  }
});

// Round 2: the examinee check. Settings are replayed on top of what the builder detects or defaults to.
const round2 = JSON.parse(fs.readFileSync(path.join(here, "exam-variants", "round2", "solutions.json"), "utf8"));
export function replayRound2(solution) {
  const files = [];
  let parsed = [];
  if (solution.given) {
    const dir = path.join(here, "exam-variants", "round2", solution.given);
    const given = fs.readdirSync(dir).filter(f => f.endsWith(".java")).sort().map(f => fs.readFileSync(path.join(dir, f), "utf8"));
    parsed = given.map((src, i) => Skeleton.parse(src, "file " + (i + 1)));
    const sk = solution.skeleton;
    const suggestions = Skeleton.suggest(parsed, { anchor: sk.anchor, step: Number(sk.step), resize: Number(sk.resize),
      sizes: Object.fromEntries(Object.entries(sk.sizes).map(([k, v]) => [k, Number(v) || undefined])) });
    assert.equal(plain(suggestions).filter(x => x.status !== "auto").length, 0, "skeleton has methods that were not filled automatically");
    parsed.forEach((p, i) => files.push({ filename: (p.types.find(t => t.isPublic) || p.types[0]).name + ".java", code: Skeleton.apply(p, i, suggestions, profile) }));
  }
  if (solution.oop) files.push(...OopGen.generate({ ...(solution.oopFromSkeleton ? plain(Skeleton.toOopModel(parsed)) : OopGen.defaults()), ...solution.oop }, profile).files);
  if (solution.record) files.push(...RecordGen.generate({ ...(solution.recordFromSkeleton ? plain(Skeleton.toRecordModel(parsed)) : RecordGen.defaults()), ...solution.record }, profile).files);
  if (solution.blocks) files.push(...core.Blocks.generate(solution.blocks, true, profile).files);
  if (solution.calc) files.push(...CalcGen.generate(solution.calc, profile).files);
  return files;
}

test("Exam variants round 2: keyboard, mouse, Timeline, custom buttons, manual save, filters, radio buttons, text results", () => {
  for (const [id, solution] of Object.entries(round2)) {
    const files = replayRound2(solution);
    checkFiles("round2/" + id, files);
    addCompile("round2/" + id, files);
  }
  const app = replayRound2(round2.Q3).find(f => f.filename === "ContactApp.java").code;
  const manualSaveCalls = app.replace("private boolean saveToFile()", "").match(/\bsaveToFile\(\)/g) || [];
  assert.equal(manualSaveCalls.length, 1, "manual mode saves only from the Save button");
  assert.match(app, /if \(saveToFile\(\)\) showMessage/, "failed writes must not show a success message");
  assert.equal(Java.replaceTexts('x("Add", add); y("Add more");', [{ from: "Add", to: "Insert" }]), 'x("Insert", add); y("Insert more");');
});

// What the pages produce from the drafts a practice question loads (skeleton page + the tool page).
function filesFromPlan(plan) {
  const { Blocks, Examples } = core;
  const files = [];
  const sk = plan.drafts["draft.skeleton"];
  if (sk) {
    const parsed = sk.sources.map((src, i) => Skeleton.parse(src, "file " + (i + 1)));
    const suggestions = Skeleton.suggest(parsed, { anchor: sk.anchor, step: Number(sk.step) || 15, resize: Number(sk.resize) || 10,
      sizes: Object.fromEntries(Object.entries(sk.sizes).map(([k, v]) => [k, Number(v) || undefined])) });
    for (const s of suggestions) if (sk.edits[s.id]) Object.assign(s, sk.edits[s.id]);
    parsed.forEach((p, i) => files.push({ filename: (p.types.find(t => t.isPublic) || p.types[0]).name + ".java", code: Skeleton.apply(p, i, suggestions, profile) }));
  }
  const d = plan.drafts;
  if (d["draft.oop"]) files.push(...OopGen.generate(d["draft.oop"], profile).files);
  if (d["draft.record"]) files.push(...RecordGen.generate(d["draft.record"], profile).files);
  if (d["draft.calc"]) files.push(...CalcGen.generate(d["draft.calc"], profile).files);
  if (d["draft.blocks"]) files.push(...Blocks.generate(d["draft.blocks"], true, profile).files);
  if (d["draft.examples"]) {
    const ex = d["draft.examples"];
    files.push(...Examples.build(ex.selected, ex.className || ex.selected, profile, ex.parameters[ex.selected]).files);
  }
  return files;
}

test("Practice page: every question loads, and rounds 1-2 load exactly the tested answers", () => {
  const { BlueJ, Variants, VariantLoad } = core;
  const check = spawnSync(process.execPath, [path.join(root, "tools", "make-variants.mjs"), "--check"], { encoding: "utf8" });
  assert.equal(check.status, 0, "src/core/variants.js is out of date: run node tools/make-variants.mjs\n" + check.stdout + check.stderr);
  const ids = new Set();
  const byName = files => Object.fromEntries(files.map(f => [f.filename, f.code]));
  for (const item of Variants.items) {
    assert.ok(!ids.has(item.id), "duplicate id " + item.id);
    ids.add(item.id);
    assert.ok(item.question.length && item.hints.length && item.checks.length, item.id + " needs a question, hints and checks");
    assert.ok(item.question.every(p => /\p{Script=Han}/u.test(p)), item.id + ": each requirement must include Chinese");
    assert.ok(item.load || item.solution, item.id + " needs reference settings or a hand-written answer");
    // A saved skeleton edit is keyed by the method's position in the given file. Editing the file (even a comment)
    // moves the method; the edit is then silently dropped and the default body is generated instead.
    const edits = Object.keys(item.load?.skeleton?.edits || {});
    if (edits.length) {
      const methods = new Set(item.given.flatMap((g, fi) => Skeleton.parse(g.code, g.name).types
        .flatMap(t => t.methods.map(m => fi + ":" + t.name + "." + m.name + ":" + m.bodyOpen))));
      for (const key of edits) {
        assert.ok(methods.has(key), item.id + ": saved skeleton edit " + key + " no longer matches a method of the given files " +
          "(update the key in tests/exam-variants/solutions.json): " + [...methods].filter(m => m.split(":")[1] === key.split(":")[1]).join(", "));
      }
    }
    if (item.load) {
      const plan = VariantLoad.plan(plain(item));
      assert.equal(plan.open, item.given ? "skeleton" : item.load.view, item.id + " opens the wrong page");
      const files = filesFromPlan(plan);
      if (variantSolutions[item.id]) {
        same(byName(files), byName(replayVariant(item.id, variantSolutions[item.id])), item.id + ": the page loads different settings from the tested answer");
      } else if (/^R2-/.test(item.id)) {
        same(byName(files), byName(replayRound2(round2[item.id.slice(3)])), item.id + ": the page loads different settings from the tested answer");
      } else {
        checkFiles("practice/" + item.id, files);
        addCompile("practice/" + item.id, files);
      }
    }
    if (item.solution) {
      // A hand-written answer: compiled here, and run by smoke.mjs (GUI steps or a hidden console check).
      const answer = VariantLoad.solutionFiles(plain(item), profile);
      checkFiles("manual/" + item.id, answer.files.filter(f => item.solution.some(x => x.name === f.filename)), { chineseComments: true });
      const mainFile = answer.files.find(f => f.filename === answer.main + ".java");
      const readme = BlueJ.projectFiles(answer.files, answer.project, profile, answer.main).find(f => f.filename === "README.TXT").code;
      if (mainFile && /extends\s+Application\b/.test(mainFile.code)) {
        assert.match(readme, /Run JavaFX Application/);
      } else if (mainFile) {
        assert.match(readme, /void main\(String\[\] args\)/);
      } else {
        assert.equal(answer.main, null);
        assert.match(readme, /object bench/);
      }
      const [, round, question] = /^R(\d+)-(Q\d+)$/.exec(item.id);
      const checker = path.join(here, "exam-variants", "round" + round, "manual-checks", question + "Check.java");
      addCompile("manual/" + item.id, answer.files,
        { extra: fs.existsSync(checker) ? [{ filename: path.basename(checker), code: fs.readFileSync(checker, "utf8") }] : [] });
      if (item.given) addCompile("manual/" + item.id + "/given", item.given.map(g => ({ filename: g.name, code: g.code })));
    }
  }
  assert.ok(Variants.items.length >= 20);
});

test("BlueJ checklists: every record and calculator preset gets concrete steps", () => {
  for (const p of RecordGen.presets()) {
    const steps = RecordGen.checklist(p.model);
    assert.ok(steps.length >= 4 && steps.every(s => typeof s === "string" && s.length > 5), "record/" + p.id);
  }
  const grades = RecordGen.checklist(RecordGen.presets().find(p => p.id === "grades").model).join("\n");
  assert.match(grades, /Pass List/);
  assert.match(grades, />= 0 and <= 100/);
  for (const p of CalcGen.presets()) {
    const steps = CalcGen.checklist(p.model);
    assert.ok(steps.length >= 3, "calc/" + p.id);
  }
  assert.match(CalcGen.checklist(CalcGen.presets().find(p => p.id === "grade").model).join("\n"), /50、65、80/);
  assert.match(CalcGen.checklist(CalcGen.presets().find(p => p.id === "bmi").model).join("\n"), /BMI: 20\.76，Category: Normal/);
});

// ---------- javac ----------
function findFxJars(dir) {
  if (!dir || !fs.existsSync(dir)) return null;
  const jars = [];
  for (const m of ["base", "graphics", "controls"]) {
    const name = fs.readdirSync(dir).find(f => f === "javafx." + m + ".jar" || (f.startsWith("javafx-" + m + "-") && f.endsWith(".jar") && !f.includes("sources")));
    if (!name) return null;
    jars.push(path.join(dir, name));
  }
  return jars.join(path.delimiter);
}

function run(cmd, argv, opts = {}) {
  return new Promise(resolve => {
    const executable = jdkBin && ["java", "javac"].includes(cmd) ? path.join(jdkBin, cmd + (process.platform === "win32" ? ".exe" : "")) : cmd;
    const child = spawn(executable, argv, { ...opts, windowsHide: true });
    let out = "";
    child.stdout.on("data", d => { out += d; });
    child.stderr.on("data", d => { out += d; });
    const timer = opts.timeout ? setTimeout(() => child.kill(), opts.timeout) : null;
    child.on("close", code => { if (timer) clearTimeout(timer); resolve({ code, out }); });
    child.on("error", err => resolve({ code: -1, out: String(err) }));
  });
}

async function compileAll(fxPath) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "fxbuilder-"));
  let failures = 0, index = 0;
  const queue = [...compileCases];
  const worker = async () => {
    while (queue.length) {
      const c = queue.shift();
      const dir = path.join(work, String(index++));
      fs.mkdirSync(path.join(dir, "out"), { recursive: true });
      for (const f of c.files) fs.writeFileSync(path.join(dir, f.filename), f.code);
      const argv = ["-encoding", "UTF-8", "-Xlint:unchecked", "-d", path.join(dir, "out")];
      if (c.fx) argv.push("--module-path", fxPath, "--add-modules", "javafx.controls");
      argv.push(...c.files.map(f => path.join(dir, f.filename)));
      const r = await run("javac", argv);
      if (r.code !== 0) {
        failures++;
        console.log("  FAIL javac " + c.label + "\n" + r.out.split("\n").slice(0, 30).map(l => "      " + l).join("\n"));
      }
      c.dir = dir;
    }
  };
  await Promise.all(Array.from({ length: Math.max(2, Math.min(6, os.cpus().length - 1)) }, worker));
  return { failures, work };
}

// ---------- main ----------
let failed = 0;
for (const t of tests) {
  try {
    await t.fn();
    console.log("ok   " + t.name);
  } catch (error) {
    failed++;
    console.log("FAIL " + t.name + "\n     " + String(error.stack || error).split("\n").slice(0, 6).join("\n     "));
  }
}
if (withJdk) {
  const fxPath = findFxJars(fxArg);
  const needsFx = compileCases.some(c => c.fx);
  if (needsFx && !fxPath) {
    console.log("FAIL javac: JavaFX jars not found. Pass --fx <javafx lib folder> or set JAVAFX_LIB.");
    failed++;
  } else {
    // Every program must also compile with the universal import block (profile.imports = "universal").
    for (const c of [...compileCases]) compileCases.push({ label: "[universal imports] " + c.label, fx: c.fx, files: universalize(c.files) });
    const started = Date.now();
    const { failures, work } = await compileAll(fxPath);
    console.log((failures ? "FAIL" : "ok  ") + " javac: " + (compileCases.length - failures) + "/" + compileCases.length +
      " programs compiled (" + ((Date.now() - started) / 1000).toFixed(1) + " s)");
    failed += failures;
    if (withRun && !failures) {
      const { runSmoke } = await import("./smoke.mjs");
      failed += await runSmoke({ core, profile, fxPath, work, compileCases, run, plain });
    }
    if (!failures) fs.rmSync(work, { recursive: true, force: true });
  }
}
console.log(failed ? "\n" + failed + " failure(s)" : "\nall passed");
if (refreshChecksums && !failed) fs.writeFileSync(variantFile, JSON.stringify(variantSolutions, null, 2) + "\n");
process.exit(failed ? 1 : 0);

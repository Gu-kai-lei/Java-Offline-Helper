/*
 * Form calculator generator (HW6 shape calculator, the Loan calculator from the Lecture 8
 * motivation slide, BMI, unit conversions). Inputs are TextFields, outputs are Labels.
 * Includes a small arithmetic evaluator with Java int/double semantics for the live preview;
 * it never uses eval or Function.
 */
"use strict";

const MATH_FUNCTIONS = {
  pow: [2, Math.pow], sqrt: [1, Math.sqrt], cbrt: [1, Math.cbrt], abs: [1, Math.abs], round: [1, null],
  floor: [1, Math.floor], ceil: [1, Math.ceil], max: [2, Math.max], min: [2, Math.min], sin: [1, Math.sin],
  cos: [1, Math.cos], tan: [1, Math.tan], log: [1, Math.log], log10: [1, Math.log10], exp: [1, Math.exp],
  toRadians: [1, d => d * Math.PI / 180], toDegrees: [1, r => r * 180 / Math.PI]
};

const JavaExpr = {
  tokenize(text) {
    const tokens = [];
    const re = /\s*(?:(\d+\.\d*|\.\d+|\d+)([dDfF]?)|([A-Za-z_]\w*)|(\*\*|[-+*/%(),.]))/y;
    let pos = 0;
    const src = String(text);
    while (pos < src.length) {
      if (/^\s*$/.test(src.slice(pos))) break;
      re.lastIndex = pos;
      const m = re.exec(src);
      if (!m) throw new Error("表达式在第 " + (pos + 1) + " 个字符附近无法识别：" + src.slice(pos, pos + 8));
      if (m[4] === "**") throw new Error("Java 没有 ** 运算符，请用 Math.pow(a, b)。");
      if (m[1] !== undefined) tokens.push({ t: "num", v: Number(m[1]), int: !/\./.test(m[1]) && !m[2] });
      else if (m[3] !== undefined) tokens.push({ t: "id", v: m[3] });
      else tokens.push({ t: "op", v: m[4] });
      pos = re.lastIndex;
    }
    return tokens;
  },

  // Parses into a small tree; identifiers are checked against the allowed names.
  parse(text, allowed) {
    const tokens = JavaExpr.tokenize(text);
    if (!tokens.length) throw new Error("表达式为空。");
    let i = 0;
    const peek = () => tokens[i], next = () => tokens[i++];
    const expect = v => {
      const tok = next();
      if (!tok || tok.v !== v) throw new Error("表达式缺少 " + v);
    };
    const primary = () => {
      const tok = next();
      if (!tok) throw new Error("表达式不完整。");
      if (tok.t === "num") return { k: "num", v: tok.v, int: tok.int };
      if (tok.t === "op" && tok.v === "(") {
        // Cast such as (int) or (double)
        if (peek()?.t === "id" && ["int", "double", "long", "float"].includes(peek().v) && tokens[i + 1]?.v === ")") {
          const type = next().v;
          next();
          return { k: "cast", type, e: unary() };
        }
        const e = additive();
        expect(")");
        return e;
      }
      if (tok.t === "id") {
        if (tok.v === "Math") {
          expect(".");
          const name = next();
          if (!name || name.t !== "id") throw new Error("Math. 后面需要方法名。");
          if (name.v === "PI") return { k: "num", v: Math.PI, int: false };
          if (name.v === "E") return { k: "num", v: Math.E, int: false };
          const fn = MATH_FUNCTIONS[name.v];
          if (!fn) throw new Error("不支持 Math." + name.v);
          expect("(");
          const args = [additive()];
          while (peek()?.v === ",") { next(); args.push(additive()); }
          expect(")");
          if (args.length !== fn[0]) throw new Error("Math." + name.v + " 需要 " + fn[0] + " 个参数。");
          return { k: "call", name: name.v, args };
        }
        if (!allowed.has(tok.v)) throw new Error("表达式用到了未定义的名字 " + tok.v + "（区分大小写）。");
        return { k: "var", name: tok.v };
      }
      throw new Error("表达式在 " + tok.v + " 处有误。");
    };
    const unary = () => {
      if (peek()?.v === "-") { next(); return { k: "neg", e: unary() }; }
      if (peek()?.v === "+") { next(); return unary(); }
      return primary();
    };
    const multiplicative = () => {
      let left = unary();
      while (peek() && ["*", "/", "%"].includes(peek().v)) left = { k: "bin", op: next().v, l: left, r: unary() };
      return left;
    };
    const additive = () => {
      let left = multiplicative();
      while (peek() && ["+", "-"].includes(peek().v)) left = { k: "bin", op: next().v, l: left, r: multiplicative() };
      return left;
    };
    const tree = additive();
    if (i < tokens.length) throw new Error("表达式在 " + tokens[i].v + " 处多出内容。");
    return tree;
  },

  // Evaluates with Java semantics: int op int stays int (division truncates).
  evaluate(tree, scope) {
    const ev = n => {
      switch (n.k) {
        case "num": return { v: n.v, int: n.int };
        case "var": return scope[n.name];
        case "neg": { const x = ev(n.e); return { v: -x.v, int: x.int }; }
        case "cast": {
          const x = ev(n.e);
          return n.type === "int" || n.type === "long" ? { v: Math.trunc(x.v), int: true } : { v: x.v, int: false };
        }
        case "call": {
          const args = n.args.map(ev);
          if (n.name === "round") return { v: Math.floor(args[0].v + 0.5), int: true };
          if (["abs", "max", "min"].includes(n.name)) {
            return { v: MATH_FUNCTIONS[n.name][1](...args.map(a => a.v)), int: args.every(a => a.int) };
          }
          return { v: MATH_FUNCTIONS[n.name][1](...args.map(a => a.v)), int: false };
        }
        case "bin": {
          const a = ev(n.l), b = ev(n.r), int = a.int && b.int;
          if (int && (n.op === "/" || n.op === "%") && b.v === 0) throw new Error("整数除以 0（Java 会抛出 ArithmeticException）。");
          switch (n.op) {
            case "+": return { v: a.v + b.v, int };
            case "-": return { v: a.v - b.v, int };
            case "*": return { v: a.v * b.v, int };
            case "/": return { v: int ? Math.trunc(a.v / b.v) : a.v / b.v, int };
            case "%": return { v: a.v % b.v, int };
          }
        }
      }
      throw new Error("无法计算。");
    };
    return ev(tree);
  },

  // Rewrites names of earlier outputs to getter calls (model class mode).
  rename(text, map) {
    return String(text).replace(/(\.\s*)?\b([A-Za-z_]\w*)\b/g, (all, dot, name) => !dot && map[name] ? map[name] : all);
  }
};

const CalcGen = {
  defaults() {
    return CalcGen.presets()[0].model;
  },

  presets() {
    const base = { output: "single", clearButton: "yes", errorMode: "alert", handlerStyle: "lambda", sceneW: "420", sceneH: "300", labelWidth: "170" };
    return [
      { id: "loan", title: "Loan 贷款计算器（课件 Motivation）", model: { ...base,
        appClass: "LoanCalculator", modelClass: "Loan", title: "Loan Calculator - {name}", buttonText: "Compute Payment",
        inputs: [
          { label: "Annual Interest Rate:", name: "annualInterestRate", type: "double", def: "2.5", positive: "no", min: "0" },
          { label: "Number of Years:", name: "numberOfYears", type: "int", def: "5", positive: "yes" },
          { label: "Loan Amount:", name: "loanAmount", type: "double", def: "10000", positive: "yes" }
        ],
        outputs: [
          { label: "Monthly Interest Rate:", name: "monthlyInterestRate", expr: "annualInterestRate / 1200", show: "no", decimals: "6" },
          { label: "Monthly Payment:", name: "monthlyPayment", expr: "loanAmount * monthlyInterestRate / (1 - 1 / Math.pow(1 + monthlyInterestRate, numberOfYears * 12.0))",
            zeroWhen: "monthlyInterestRate", zeroExpr: "loanAmount / (numberOfYears * 12.0)", show: "yes", decimals: "2" },
          { label: "Total Payment:", name: "totalPayment", expr: "monthlyPayment * numberOfYears * 12.0", show: "yes", decimals: "2" }
        ] } },
      { id: "bmi", title: "BMI 计算", model: { ...base,
        appClass: "BMICalculator", modelClass: "", title: "BMI Calculator - {name}", buttonText: "Calculate",
        inputs: [
          { label: "Weight (kg):", name: "weight", type: "double", def: "60", positive: "yes" },
          { label: "Height (m):", name: "height", type: "double", def: "1.70", positive: "yes" }
        ],
        outputs: [{ label: "BMI:", name: "bmi", expr: "weight / (height * height)", show: "yes", decimals: "2" }],
        texts: [{ label: "Category:", name: "category", source: "bmi", ranges: "18.5:Underweight, 25:Normal, 30:Overweight, Obese" }] } },
      { id: "grade", title: "分数转等级（按范围显示文字）", model: { ...base,
        appClass: "GradeCalculator", modelClass: "", title: "Grade Calculator - {name}", buttonText: "Get Grade",
        inputs: [{ label: "Mark (0-100):", name: "mark", type: "int", def: "75", positive: "no", min: "0", max: "100" }],
        outputs: [],
        texts: [{ label: "Grade:", name: "grade", source: "mark", ranges: "50:F, 65:C, 80:B, A" }] } },
      { id: "rectangle", title: "矩形面积与周长（两个输入）", model: { ...base,
        appClass: "RectangleCalculator", modelClass: "Rectangle", title: "Rectangle Calculator - {name}", buttonText: "Calculate",
        inputs: [
          { label: "Width:", name: "width", type: "double", def: "4", positive: "yes" },
          { label: "Height:", name: "height", type: "double", def: "3", positive: "yes" }
        ],
        outputs: [
          { label: "Area:", name: "area", expr: "width * height", show: "yes", decimals: "2" },
          { label: "Perimeter:", name: "perimeter", expr: "2 * (width + height)", show: "yes", decimals: "2" }
        ] } },
      { id: "speed", title: "平均速度（km 与分钟 → km/h）", model: { ...base,
        appClass: "SpeedCalculator", modelClass: "", title: "Speed Calculator - {name}", buttonText: "Compute Speed",
        inputs: [
          { label: "Distance (km):", name: "distance", type: "double", def: "12", positive: "no", min: "0" },
          { label: "Time (minutes):", name: "minutes", type: "double", def: "30", positive: "yes" }
        ],
        outputs: [{ label: "Speed (km/h):", name: "speed", expr: "distance / (minutes / 60)", show: "yes", decimals: "1" }] } },
      { id: "circle", title: "圆的面积与周长（HW6 计算器）", model: { ...base,
        appClass: "CircleCalculator", modelClass: "", title: "Circle Calculator - {name}", buttonText: "Get Result", errorMode: "label",
        inputs: [{ label: "Radius:", name: "radius", type: "double", def: "5", positive: "yes" }],
        outputs: [
          { label: "Area:", name: "area", expr: "Math.PI * radius * radius", show: "yes", decimals: "2" },
          { label: "Perimeter:", name: "perimeter", expr: "2 * Math.PI * radius", show: "yes", decimals: "2" }
        ] } },
      { id: "temp", title: "摄氏度转华氏度", model: { ...base,
        appClass: "TemperatureConverter", modelClass: "", title: "Temperature Converter - {name}", buttonText: "Convert",
        inputs: [{ label: "Celsius:", name: "celsius", type: "double", def: "25", positive: "no" }],
        outputs: [{ label: "Fahrenheit:", name: "fahrenheit", expr: "celsius * 9 / 5 + 32", show: "yes", decimals: "1" }] } }
    ];
  },

  normalize(model) {
    const m = JSON.parse(JSON.stringify(model));
    const app = Java.ident(m.appClass, "主类名");
    const modelClass = String(m.modelClass ?? "").trim() ? Java.ident(m.modelClass, "模型类名") : "";
    if (modelClass === app) throw new Error("模型类名不能和主类名相同。");
    const names = new Set();
    const inputs = m.inputs.map((x, i) => {
      const name = Java.ident(x.name, "第 " + (i + 1) + " 个输入的变量名");
      if (names.has(name)) throw new Error("变量名重复：" + name);
      names.add(name);
      const type = x.type === "int" ? "int" : "double";
      const def = String(x.def ?? "").trim();
      if (def) Java.number(def, String(x.label) + " 的默认值", { integer: type === "int" });
      const label = String(x.label ?? name);
      return { label, name, type, def, positive: x.positive === "yes", range: NumericRules.range(x, label, type === "int") };
    });
    if (!inputs.length) throw new Error("至少需要一个输入。");
    const outputs = m.outputs.map((x, i) => {
      const name = Java.ident(x.name, "第 " + (i + 1) + " 个结果的变量名");
      if (names.has(name)) throw new Error("变量名重复：" + name);
      const tree = JavaExpr.parse(x.expr, names);
      const zeroWhen = String(x.zeroWhen ?? "").trim(), zeroExpr = String(x.zeroExpr ?? "").trim();
      if (zeroWhen && !names.has(zeroWhen)) throw new Error(String(x.label) + "：零值分支请选择已有的输入或上一个结果。");
      if (Boolean(zeroWhen) !== Boolean(zeroExpr)) throw new Error(String(x.label) + "：零值分支需要判断对象及备用算法。");
      const zeroTree = zeroWhen ? JavaExpr.parse(zeroExpr, names) : null;
      names.add(name);
      const decimals = Java.number(x.decimals ?? "2", String(x.label) + " 的小数位数", { integer: true, min: 0, max: 10 });
      return { label: String(x.label ?? name), name, expr: String(x.expr).trim(), tree, zeroWhen, zeroExpr, zeroTree, show: x.show !== "no", decimals };
    });
    // Text results: "18.5:Underweight, 25:Normal, Obese" = below 18.5 -> Underweight, below 25 -> Normal, otherwise Obese.
    const texts = (m.texts || []).map((x, i) => {
      const name = Java.ident(x.name, "第 " + (i + 1) + " 个文字结果的变量名");
      if (names.has(name)) throw new Error("变量名重复：" + name);
      const source = String(x.source ?? "").trim();
      if (!names.has(source)) throw new Error(String(x.label) + "：「按哪个数判断」需要是输入或结果的变量名。");
      const parts = String(x.ranges ?? "").split(",").map(p => p.trim()).filter(Boolean);
      if (parts.length < 2) throw new Error(String(x.label) + "：范围至少写两段，例如 18.5:Underweight, 25:Normal, Obese。");
      const ranges = parts.slice(0, -1).map(p => {
        const at = p.indexOf(":");
        if (at < 0) throw new Error(String(x.label) + "：除最后一段外，每段写成 上限:文字，例如 18.5:Underweight。");
        return { below: Java.number(p.slice(0, at), String(x.label) + " 的上限"), text: p.slice(at + 1).trim() };
      });
      if (parts[parts.length - 1].includes(":")) throw new Error(String(x.label) + "：最后一段只写文字（其他情况）。");
      for (let k = 1; k < ranges.length; k++) if (ranges[k].below <= ranges[k - 1].below) throw new Error(String(x.label) + "：上限要从小到大写。");
      names.add(name);
      return { label: String(x.label ?? name), name, source, ranges, other: parts[parts.length - 1], fromOutput: outputs.some(o => o.name === source) };
    });
    if (!outputs.some(o => o.show) && !texts.length) throw new Error("至少需要显示一个结果（数字结果或文字结果）。");
    const buttonText = String(m.buttonText ?? "").trim() || "Calculate";
    return {
      app, modelClass, title: String(m.title ?? ""), output: m.output === "split" && modelClass ? "split" : "single",
      inputs, outputs, texts, buttonText, clearButton: m.clearButton === "yes", errorMode: m.errorMode === "label" ? "label" : "alert",
      handlerStyle: m.handlerStyle === "anonymous" ? "anonymous" : "lambda",
      sceneW: Java.number(m.sceneW, "窗口宽", { min: 150, max: 3000 }), sceneH: Java.number(m.sceneH, "窗口高", { min: 100, max: 3000 }),
      labelWidth: Java.number(m.labelWidth, "标签宽度", { min: 0, max: 800 })
    };
  },

  // Things to try in BlueJ after compiling, built from the current settings (shown under the preview).
  checklist(model) {
    const m = CalcGen.normalize(model);
    const sample = Object.fromEntries(m.inputs.map(x => [x.name, x.def]));
    const r = CalcGen.preview(model, sample);
    const expected = r.results ? r.results.map(x => x.label + " " + x.text).join("，") : "";
    const steps = ["运行后：标题含姓名；输入框显示默认值（" + m.inputs.map(x => x.label + " " + (x.def || "空")).join("，") + "）。",
      "直接点「" + m.buttonText + "」" + (expected ? "：应显示 " + expected : "") + "。用计算器再算一次核对。"];
    for (const t of m.texts) {
      const edges = t.ranges.map(x => x.below);
      steps.push(t.label + " 的分界点：让 " + t.source + " 恰好等于 " + edges.join("、") + " 各试一次，确认落在题目说的那一档（本工具按「小于上限」分档）。");
    }
    steps.push("任一输入框填 abc 或留空：" + (m.errorMode === "alert" ? "弹出错误 Alert" : "显示 Invalid input") + "，不显示旧结果。");
    for (const x of m.inputs) {
      const hint = NumericRules.hint(x.range);
      if (x.positive || hint) steps.push(x.label + " 填 " + (x.positive ? "0 或负数" : "超出 " + hint + " 的值") + "：同样报错。");
    }
    if (m.clearButton) steps.push("「Clear」：清空输入框和结果。");
    return steps;
  },

  // Runs the formulas on the given input texts like the generated program would.
  preview(model, texts = {}) {
    const m = CalcGen.normalize(model);
    const scope = {};
    for (const x of m.inputs) {
      const v = NumericRules.parse(texts[x.name] ?? x.def, x.type === "int");
      if (!Number.isFinite(v)) return { error: "Please enter valid finite numbers." };
      if (x.positive && v <= 0) return { error: "Please enter positive numbers." };
      if (!NumericRules.accepts(v, x.range, x.type === "int")) return { error: x.label + " must be " + NumericRules.hint(x.range) + "." };
      scope[x.name] = { v, int: x.type === "int" };
    }
    const results = [];
    for (const o of m.outputs) {
      const value = JavaExpr.evaluate(o.zeroTree && scope[o.zeroWhen].v === 0 ? o.zeroTree : o.tree, scope);
      if (!Number.isFinite(value.v)) return { error: o.label + " is not a finite result." };
      scope[o.name] = { v: value.v, int: false };
      if (o.show) results.push({ label: o.label, text: Number.isFinite(value.v) ? value.v.toFixed(o.decimals) : String(value.v) });
    }
    for (const t of m.texts) {
      const v = scope[t.source].v;
      results.push({ label: t.label, text: (t.ranges.find(r => v < r.below) || { text: t.other }).text });
    }
    return { results };
  },

  generate(model, profile = {}) {
    const m = CalcGen.normalize(model);
    const units = [];
    if (m.modelClass) units.push(CalcGen.modelUnit(m));
    units.push(CalcGen.appUnit(m, profile));
    const files = JavaFiles.assemble(units, m.app, m.output, profile);
    const warnings = !profile.name || !profile.id ? ["还没有填写考生信息，文件头注释会显示占位文字。"] : [];
    return { files, main: m.app, units, warnings, normalized: m };
  },

  getter(name) { return "get" + Java.upperFirst(name); },
  outputExpr(o, map = {}) {
    const main = JavaExpr.rename(o.expr, map);
    if (!o.zeroWhen) return main;
    return (map[o.zeroWhen] || o.zeroWhen) + " == 0 ? " + JavaExpr.rename(o.zeroExpr, map) + " : " + main;
  },

  modelUnit(m) {
    const map = Object.fromEntries(m.outputs.map(o => [o.name, CalcGen.getter(o.name) + "()"]));
    const lines = m.inputs.map(x => "private " + x.type + " " + x.name + ";");
    lines.push("", "public " + m.modelClass + "(" + m.inputs.map(x => x.type + " " + x.name).join(", ") + ") {",
      ...m.inputs.map(x => "    this." + x.name + " = " + x.name + ";"), "}");
    for (const x of m.inputs) lines.push("", "public " + x.type + " " + CalcGen.getter(x.name) + "() {", "    return " + x.name + ";", "}");
    for (const o of m.outputs) {
      lines.push("", "public double " + CalcGen.getter(o.name) + "() {", "    return " + CalcGen.outputExpr(o, map) + ";", "}");
    }
    return javaUnit(m.modelClass, "class", [], "/** Stores the inputs and computes the results. */\npublic class " + m.modelClass +
      " {\n" + Java.indent(lines.join("\n"), 4) + "\n}\n");
  },

  appUnit(m, profile) {
    const imports = ["javafx.application.Application", "javafx.geometry.Insets", "javafx.geometry.Pos", "javafx.scene.Node",
      "javafx.scene.Scene", "javafx.scene.control.Button", "javafx.scene.control.Label", "javafx.scene.control.TextField",
      "javafx.scene.layout.HBox", "javafx.scene.layout.VBox", "javafx.stage.Stage"];
    if (m.errorMode === "alert") imports.push("javafx.scene.control.Alert");
    const shown = m.outputs.filter(o => o.show);
    const fields = [
      ...m.inputs.map(x => "private TextField " + x.name + "Field = new TextField(" + Java.str(x.def) + ");"),
      ...shown.map(o => 'private Label ' + o.name + 'Label = new Label("-");'),
      ...m.texts.map(t => 'private Label ' + t.name + 'Label = new Label("-");'),
      'private Label messageLabel = new Label("");'
    ];
    const st = [];
    const reg = (target, body) => {
      const h = Java.handler(target, "setOnAction", body, { style: m.handlerStyle });
      imports.push(...h.imports);
      return h.code;
    };
    st.push("Button calculateButton = new Button(" + Java.str(m.buttonText) + ");");
    if (m.clearButton) st.push('Button clearButton = new Button("Clear");');
    st.push(reg("calculateButton", "calculate();"));
    if (m.clearButton) st.push(reg("clearButton", "clearAll();"));
    st.push("", "HBox buttons = new HBox(10, calculateButton" + (m.clearButton ? ", clearButton" : "") + ");", "");
    const rows = [
      ...m.inputs.map(x => "row(" + Java.str(x.label) + ", " + x.name + "Field)"),
      "buttons",
      ...shown.map(o => "row(" + Java.str(o.label) + ", " + o.name + "Label)"),
      ...m.texts.map(t => "row(" + Java.str(t.label) + ", " + t.name + "Label)"),
      "messageLabel"
    ];
    st.push("VBox root = new VBox(10" + rows.map(r => ",\n        " + r).join("") + ");", "root.setPadding(new Insets(15));", "",
      "stage.setTitle(" + Java.str(Java.fillProfile(m.title, profile)) + ");",
      "stage.setScene(new Scene(root, " + Java.lit(m.sceneW) + ", " + Java.lit(m.sceneH) + "));", "stage.show();");

    const calc = [];
    for (const x of m.inputs) calc.push(x.type + " " + x.name + ";");
    calc.push("try {", ...m.inputs.map(x => "    " + x.name + " = " + (x.type === "int" ? "Integer.parseInt" : "Double.parseDouble") +
      "(" + x.name + "Field.getText().trim());"), "} catch (NumberFormatException ex) {",
      '    showError("Please enter valid numbers.");', "    return;", "}");
    for (const x of m.inputs) {
      const invalid = NumericRules.invalid(x.name, x.range, x.type === "int");
      const bounds = NumericRules.hint(x.range);
      if (invalid) calc.push("if (" + invalid + ") {", "    showError(" + Java.str(bounds ? x.label + " must be " + bounds + "." : "Please enter valid finite numbers.") + ");",
        "    return;", "}");
    }
    const positives = m.inputs.filter(x => x.positive);
    if (positives.length) {
      calc.push("if (" + positives.map(x => x.name + " <= 0").join(" || ") + ") {", '    showError("Please enter positive numbers.");', "    return;", "}");
    }
    calc.push("");
    let modelVar = "model";
    const names = new Set([...m.inputs, ...m.outputs, ...m.texts].map(x => x.name));
    while (names.has(modelVar)) modelVar += "_";
    if (m.modelClass) {
      calc.push(m.modelClass + " " + modelVar + " = new " + m.modelClass + "(" + m.inputs.map(x => x.name).join(", ") + ");");
    }
    for (const o of m.outputs) {
      const rhs = m.modelClass ? modelVar + "." + CalcGen.getter(o.name) + "()" : CalcGen.outputExpr(o);
      calc.push("double " + o.name + " = " + rhs + ";",
        "if (!Double.isFinite(" + o.name + ")) {", "    showError(" + Java.str(o.label + " is not a finite result.") + ");", "    return;", "}");
    }
    for (const o of shown) calc.push(o.name + "Label.setText(String.format(java.util.Locale.ROOT, " + Java.str("%." + o.decimals + "f") + ", " + o.name + "));");
    for (const t of m.texts) {
      const value = t.source;
      calc.push("", "// " + Java.comment(t.label) + " depends on " + t.source, "String " + t.name + ";");
      t.ranges.forEach((r, i) => calc.push((i === 0 ? "if" : "} else if") + " (" + value + " < " + Java.lit(r.below) + ") {", "    " + t.name + " = " + Java.str(r.text) + ";"));
      calc.push("} else {", "    " + t.name + " = " + Java.str(t.other) + ";", "}", t.name + "Label.setText(" + t.name + ");");
    }
    calc.push('messageLabel.setText("");');
    const md = [
      "/** One row: a label with a fixed width, then the input field or result. */",
      "private HBox row(String text, Node node) {", "    Label label = new Label(text);",
      ...(m.labelWidth > 0 ? ["    label.setPrefWidth(" + Java.lit(m.labelWidth) + ");"] : []),
      "    HBox box = new HBox(10, label, node);", "    box.setAlignment(Pos.CENTER_LEFT);", "    return box;", "}", "",
      "/** " + Java.comment(m.buttonText) + " button: read the inputs, check them, then show the results. */",
      "private void calculate() {", Java.indent(calc.join("\n"), 4), "}"
    ];
    if (m.clearButton) {
      md.push("", "/** Clear button: empty the inputs and the results. */", "private void clearAll() {",
        ...m.inputs.map(x => "    " + x.name + "Field.clear();"), ...shown.map(o => '    ' + o.name + 'Label.setText("-");'),
        ...m.texts.map(t => '    ' + t.name + 'Label.setText("-");'),
        '    messageLabel.setText("");', "}");
    }
    md.push("", "private void showError(String message) {");
    if (m.errorMode === "alert") {
      md.push("    Alert alert = new Alert(Alert.AlertType.ERROR);", "    alert.setTitle(\"Input Error\");",
        "    alert.setHeaderText(null);", "    alert.setContentText(message);", "    alert.showAndWait();");
    } else {
      md.push(...shown.map(o => '    ' + o.name + 'Label.setText("Invalid input");'));
    }
    md.push("    messageLabel.setText(message);", "}");
    const code = "/** " + Java.comment(m.buttonText) + " calculator with " + m.inputs.length + " input(s). */\npublic class " + m.app +
      " extends Application {\n" + Java.indent(fields.join("\n"), 4) + "\n\n    @Override\n    public void start(Stage stage) {\n" +
      Java.indent(st.join("\n"), 8) + "\n    }\n\n" + Java.indent(md.join("\n"), 4) +
      "\n\n    public static void main(String[] args) {\n        launch(args);\n    }\n}\n";
    return javaUnit(m.app, "class", imports, code, { main: true });
  }
};

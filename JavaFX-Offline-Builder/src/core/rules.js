/* Shared validation for visual numeric inputs. Blank bounds are open. */
"use strict";

const NumericRules = {
  range(raw = {}, label = "数字", integer = false) {
    const bound = (key, caption) => {
      const value = String(raw[key] ?? "").trim();
      if (!value) return null;
      const n = Java.number(value, label + caption, integer
        ? { min: -2147483648, max: 2147483647, integer: true }
        : { min: -Number.MAX_VALUE, max: Number.MAX_VALUE });
      if (integer && (!Number.isInteger(n) || n < -2147483648 || n > 2147483647)) {
        throw new Error(label + caption + "必须是 int 范围内的整数。");
      }
      return n;
    };
    const min = bound("min", "下限"), max = bound("max", "上限");
    const minOpen = raw.minOpen === "yes", maxOpen = raw.maxOpen === "yes";
    if (min !== null && max !== null && (min > max || (min === max && (minOpen || maxOpen)))) {
      throw new Error(label + "的范围没有可用值；请检查上下限是否包含端点。");
    }
    if (integer && (min ?? -2147483648) + Number(min !== null && minOpen) >
        (max ?? 2147483647) - Number(max !== null && maxOpen)) throw new Error(label + "的范围没有可用整数。");
    return { min, max, minOpen, maxOpen };
  },

  accepts(value, r, integer = false) {
    return Number.isFinite(value) && (!integer || Number.isInteger(value) && value >= -2147483648 && value <= 2147483647)
      && (r.min === null || (r.minOpen ? value > r.min : value >= r.min))
      && (r.max === null || (r.maxOpen ? value < r.max : value <= r.max));
  },

  invalid(expr, r, integer = false) {
    const lit = integer ? Java.lit : Java.dbl;
    return [!integer && "!Double.isFinite(" + expr + ")",
      r.min !== null && expr + (r.minOpen ? " <= " : " < ") + lit(r.min),
      r.max !== null && expr + (r.maxOpen ? " >= " : " > ") + lit(r.max)].filter(Boolean).join(" || ");
  },

  parse(text, integer = false) {
    const raw = String(text ?? "").trim();
    if (integer ? !/^[+-]?\d+$/.test(raw) : !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(raw)) return NaN;
    const value = Number(raw);
    return Number.isFinite(value) && (!integer || value >= -2147483648 && value <= 2147483647) ? value : NaN;
  },

  hint(r) {
    if (r.min === null && r.max === null) return "";
    return (r.min === null ? "" : (r.minOpen ? "> " : ">= ") + r.min)
      + (r.min !== null && r.max !== null ? " and " : "")
      + (r.max === null ? "" : (r.maxOpen ? "< " : "<= ") + r.max);
  }
};

/* The editor, Java generator and preview share the same typed expression tree. */
const VisualExpr = {
  comparisons: [["lt", "<"], ["le", "≤"], ["eq", "="], ["ne", "≠"], ["ge", "≥"], ["gt", ">"]],
  operators: [["add", "+"], ["sub", "−"], ["mul", "×"], ["div", "÷"]],
  modifiers: [["shift", "Shift"], ["control", "Ctrl"], ["alt", "Alt"], ["meta", "Meta"]],
  form: {
    boolean: [["true", "真"], ["false", "假"], ["compare", "比较两个数字"], ["range", "数字在范围内"],
      ["modifier", "按住修饰键"], ["and", "且（两项都成立）"], ["or", "或（任一成立）"], ["not", "取反"],
      ["flag", "布尔变量为 true"], ["blank", "输入框是空的（只有空格也算）"], ["textEq", "输入框文字等于文字变量"]],
    number: [["number", "数字"], ["local", "读到的数字"], ["math", "四则运算"], ["prop", "对象属性（半径、坐标、角度…）"], ["var", "数字变量"]]
  },
  make(type, kind = type === "boolean" ? "true" : "number", locals = []) {
    const n = () => ({ kind: "number", value: "0" });
    const b = () => ({ kind: "true" });
    switch (kind) {
      case "number": return n();
      case "local": return { kind, name: locals[0] ?? "" };
      case "compare": return { kind, op: "ge", left: n(), right: n() };
      case "range": return { kind, value: n(), min: "0", max: "", minOpen: "no", maxOpen: "no" };
      case "math": return { kind, op: "add", left: n(), right: n() };
      case "modifier": return { kind, key: "shift" };
      case "prop": return { kind, node: "", prop: "" };
      case "var": case "flag": return { kind, variable: "" };
      case "blank": return { kind, input: "" };
      case "textEq": return { kind, input: "", variable: "" };
      case "and": case "or": return { kind, left: b(), right: b() };
      case "not": return { kind, value: b() };
      default: return { kind };
    }
  },
  compile(tree, type, scope, depth = 0) {
    if (depth >= 24) throw new Error("条件嵌套太深，请拆成两段。");
    if (!tree || !VisualExpr.form[type].some(([kind]) => kind === tree.kind)) throw new Error("请在积木里选择一个" + (type === "boolean" ? "条件" : "数字") + "。");
    const sub = (key, expected) => VisualExpr.compile(tree[key], expected, scope, depth + 1);
    const binary = (k, op, fn) => {
      const l = sub("left", k), r = sub("right", k);
      return { java: "(" + l.java + " " + op + " " + r.java + ")", evaluate: (vars, event) => fn(() => l.evaluate(vars, event), () => r.evaluate(vars, event)) };
    };
    switch (tree.kind) {
      case "number": {
        const n = Java.number(tree.value, "积木数字");
        const token = Java.lit(n);
        return { java: /^-?\d+$/.test(token) ? token + ".0" : token, evaluate: () => n };
      }
      case "local":
        if (!scope.locals.has(tree.name)) throw new Error("「读到的数字」只能接在读取数字的成功分支里，并且需要选择对应的变量。");
        return { java: tree.name, evaluate: vars => vars[tree.name] };
      case "true": case "false": return { java: tree.kind, evaluate: () => tree.kind === "true" };
      case "modifier": {
        if (!["key", "mouse"].includes(scope.kind)) throw new Error("修饰键积木只可放进键盘或鼠标事件。");
        const getter = { shift: "Shift", control: "Control", alt: "Alt", meta: "Meta" }[tree.key];
        if (!getter) throw new Error("请选择 Shift、Ctrl、Alt 或 Meta。");
        return { java: "e.is" + getter + "Down()", evaluate: (_, event) => Boolean(event[tree.key + "Key"]) };
      }
      case "compare": {
        const ops = {
          lt: ["<", (l,r) => l()<r()], le: ["<=", (l,r) => l()<=r()], eq: ["==", (l,r) => l()===r()],
          ne: ["!=", (l,r) => l()!==r()], ge: [">=", (l,r) => l()>=r()], gt: [">", (l,r) => l()>r()]
        };
        if (!Object.hasOwn(ops, tree.op)) throw new Error("请选择比较方式。");
        return binary("number", ...ops[tree.op]);
      }
      case "range": {
        const range = NumericRules.range(tree, "比较");
        const val = sub("value", "number");
        return { java: "!(" + NumericRules.invalid(val.java, range) + ")", evaluate: (vars, event) => NumericRules.accepts(val.evaluate(vars, event), range) };
      }
      case "math": {
        const ops = { add: ["+", (l,r) => l()+r()], sub: ["-", (l,r) => l()-r()], mul: ["*", (l,r) => l()*r()], div: ["/", (l,r) => l()/r()] };
        if (!Object.hasOwn(ops, tree.op)) throw new Error("请选择运算符。");
        const expr = binary("number", ...ops[tree.op]);
        // Force double arithmetic: Java would otherwise truncate integer-literal division.
        return tree.op === "div" ? { ...expr, java: "((double) " + expr.java.slice(1) } : expr;
      }
      // Objects and variables of the workbench project. scope.project / scope.names come from the generator,
      // scope.read / readVar / readText from the preview.
      case "prop": {
        const node = scope.project?.components.find(c => c.id === tree.node);
        const entry = node && (Blocks.props[node.type] || []).find(p => p[0] === tree.prop);
        if (!entry) throw new Error("请在「对象属性」里选择对象和它的属性。");
        return { java: scope.names.get(node.id) + ".get" + entry[0] + "()", evaluate: () => scope.read(node.id, entry[2]) };
      }
      case "var": case "flag": {
        const variable = (scope.project?.variables || []).find(v => v.id === tree.variable);
        const numeric = variable && (variable.type === "int" || variable.type === "double");
        if (!variable || (tree.kind === "var" ? !numeric : variable.type !== "boolean")) {
          throw new Error("请选择一个" + (tree.kind === "var" ? "数字（int / double）" : "布尔（boolean）") + "变量；变量在「控件」区下方的「变量」里添加。");
        }
        return { java: scope.names.get(variable.id), evaluate: () => scope.readVar(variable.id) };
      }
      case "blank": case "textEq": {
        const input = scope.project?.components.find(c => c.id === tree.input && c.type === "TextField");
        if (!input) throw new Error("请选择要检查的输入框。");
        const field = scope.names.get(input.id) + ".getText().trim()";
        if (tree.kind === "blank") return { java: field + ".isEmpty()", evaluate: () => String(scope.readText(input.id) ?? "").trim() === "" };
        const variable = (scope.project?.variables || []).find(v => v.id === tree.variable && v.type === "String");
        if (!variable) throw new Error("请选择一个文字（String）变量。");
        return { java: field + ".equals(" + scope.names.get(variable.id) + ")",
          evaluate: () => String(scope.readText(input.id) ?? "").trim() === String(scope.readVar(variable.id) ?? "") };
      }
      case "and": return binary("boolean", "&&", (l,r) => l() && r());
      case "or": return binary("boolean", "||", (l,r) => l() || r());
      case "not": {
        const e = sub("value", "boolean");
        return { java: "!(" + e.java + ")", evaluate: (vars,event) => !e.evaluate(vars,event) };
      }
      default: throw new Error("未知表达式积木。");
    }
  }
};

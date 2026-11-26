/*
 * Lab 3 style generator: a record class with private fields, getters and setters, an ArrayList of
 * records, a JavaFX form with a ListView or TextArea, Alert error dialogs, button states and a text
 * file that is read with Scanner and written with PrintWriter (the Chapter 9 style).
 * Output "main" reuses a record class supplied by the exam paper (its getters, setters and toString).
 */
"use strict";

const RecordGen = {
  types: ["String", "int", "double", "boolean"],

  defaults() {
    return {
      appClass: "LibraryAdminApp", recordClass: "Book", noun: "", title: "Library Admin System",
      output: "split", ctorUse: "form", file: "books.txt", fileDelimiter: "comma", fileHeader: "no",
      display: "list", displayFormat: "", searchMode: "any",
      fields: [
        { name: "isbn", type: "String", label: "ISBN", getter: "getISBN", inForm: "yes", key: "yes", search: "yes", sort: "yes", initial: "" },
        { name: "title", type: "String", label: "Title", getter: "getTitle", inForm: "yes", key: "no", search: "yes", sort: "yes", initial: "" },
        { name: "available", type: "boolean", label: "Available", getter: "isAvailable", inForm: "no", key: "no", search: "no", sort: "no", initial: "true" }
      ],
      fAdd: "yes", fEdit: "yes", fDelete: "yes", fSearch: "yes", fDisplay: "yes", fLoadTest: "yes",
      fSort: "yes", fClear: "yes", fExit: "yes", fStats: "no", statsField: "", statsText: "Statistics",
      statsFormat: "Count: {count}   Average: {average}   Highest: {highest}   Lowest: {lowest}",
      tAdd: "Add", tEdit: "Edit", tSave: "Save", tDelete: "Delete", tSearch: "Search", tDisplay: "Display All", tLoadTest: "Load Test Data",
      tClear: "Clear", tExit: "Exit", saveMode: "auto", tSaveFile: "Save to File", tLoadFile: "Load from File",
      loadedMessage: "{count} record(s) loaded from {file}.", savedMessage: "{count} record(s) saved to {file}.", countLabel: "",
      filters: [], replacements: [],
      toggles: [
        { text: "Borrow", field: "available", value: "false", already: "The selected book is not available.", done: "Book borrowed." },
        { text: "Return", field: "available", value: "true", already: "The selected book is already available.", done: "Book returned." }
      ],
      adjusts: [],
      testData: "0131450913,HTML How to Program,true\n0131857576,C++ How to Program,true\n0132222205,Java How to Program,true",
      header: "yes", headerLines: "Name: {name}        Student ID: {id}", showStart: "yes",
      sceneW: "820", sceneH: "560", handlerStyle: "lambda",
      pick: "selected", loadOnStart: "no", clearAll: "no", dupMessage: "", notFoundMessage: "", seedOnStart: "no", fLoadFile: "yes"
    };
  },

  // A display format may show a boolean as words: {available|Available|Not available}.
  // The words are turned into a ternary around the normal placeholder expression.
  formatExpr(format, resolve, isText, fields) {
    const words = new Map();
    const text = String(format ?? "").replace(/\{([A-Za-z_]\w*)\|([^|{}]*)\|([^|{}]*)\}/g, (all, name, yes, no) => {
      const field = fields.find(f => f.name === name);
      if (!field || field.type !== "boolean") throw new Error("显示格式里的 {" + name + "|…|…} 只能用于 boolean 字段。");
      const token = "__w" + words.size;
      words.set(token, { name, yes, no });
      return "{" + token + "}";
    });
    return Java.template(text, name => {
      const w = words.get(name);
      if (!w) return resolve(name);
      const expr = resolve(w.name);
      return expr && "(" + expr + " ? " + Java.str(w.yes) + " : " + Java.str(w.no) + ")";
    }, "显示格式", name => words.has(name) || isText(name));
  },

  presets() {
    const lab3 = RecordGen.defaults();
    const f = (name, type, label, getter, inForm, key, search, sort, initial) => ({ name, type, label, getter, inForm, key, search, sort, initial });
    const students = { ...RecordGen.defaults(), appClass: "StudentApp", recordClass: "Student", title: "Student Records", file: "students.txt",
      fEdit: "no", fLoadTest: "no", fStats: "yes", statsField: "score", toggles: [], testData: "" };
    students.fields = [f("id", "String", "ID", "getId", "yes", "yes", "yes", "no", ""), f("name", "String", "Name", "getName", "yes", "no", "yes", "no", ""),
      f("score", "double", "Score", "getScore", "yes", "no", "no", "yes", "0")];
    const products = { ...RecordGen.defaults(), appClass: "InventoryApp", recordClass: "Product", title: "Inventory", file: "inventory.txt",
      fLoadTest: "no", fSort: "no", fClear: "no", testData: "", displayFormat: "{code} | {name} | Qty: {quantity} | ${price:.2f}" };
    products.fields = [f("code", "String", "Code", "getCode", "yes", "yes", "yes", "no", ""), f("name", "String", "Name", "getName", "yes", "no", "yes", "no", ""),
      f("quantity", "int", "Quantity", "getQuantity", "yes", "no", "no", "no", "0"), f("price", "double", "Price", "getPrice", "yes", "no", "no", "no", "0")];
    Object.assign(products.fields[2], { min: "0", max: "999" });
    products.fields[3].min = "0";
    products.toggles = [];
    products.adjusts = [
      { text: "Sell", field: "quantity", delta: "-1", min: "0", max: "", error: "Out of stock.", done: "One item sold." },
      { text: "Restock", field: "quantity", delta: "10", min: "", max: "999", error: "Stock limit reached.", done: "10 items added." }
    ];
    const textarea = { ...RecordGen.defaults(), appClass: "LibraryApp", title: "Library", output: "main", display: "textarea", fEdit: "no",
      fLoadTest: "no", fSort: "no", testData: "" };
    const contacts = { ...RecordGen.defaults(), appClass: "ContactApp", recordClass: "Contact", title: "Contact Book", file: "contacts.txt",
      fEdit: "no", fLoadTest: "no", fSort: "no", fClear: "no", toggles: [], testData: "",
      tAdd: "Add Contact", tDelete: "Remove", tSearch: "Find", tDisplay: "Show All", tExit: "Quit",
      saveMode: "manual", loadedMessage: "{count} contact(s) loaded.", countLabel: "Total contacts: {count}" };
    contacts.fields = [f("name", "String", "Name", "getName", "yes", "yes", "yes", "no", ""), f("phone", "String", "Phone", "getPhone", "yes", "no", "yes", "no", ""),
      f("email", "String", "Email", "getEmail", "yes", "no", "no", "no", "")];
    const grades = { ...RecordGen.defaults(), appClass: "GradeApp", recordClass: "Student", title: "Grade Book", file: "grades.txt",
      fEdit: "no", fSearch: "no", fLoadTest: "no", fClear: "no", fStats: "yes", statsField: "mark", statsText: "Summary",
      statsFormat: "Count: {count}   Total: {total}   Average: {average}", toggles: [], testData: "",
      displayFormat: "{id} {name} {mark}", filters: [{ text: "Pass List", field: "mark", op: ">=", value: "50" }] };
    grades.fields = [f("id", "String", "ID", "getId", "yes", "yes", "no", "no", ""), f("name", "String", "Name", "getName", "yes", "no", "no", "no", ""),
      f("mark", "int", "Mark", "getMark", "yes", "no", "no", "yes", "0")];
    Object.assign(grades.fields[2], { min: "0", max: "100" });
    const andSearch = { ...RecordGen.defaults(), appClass: "AndBookSearch", searchMode: "all",
      testData: "001,Java Basics,true\n002,Python Basics,true\n101,Advanced Java,true" };
    const delimited = { ...RecordGen.defaults(), appClass: "DelimitedLibrary", file: "inventory.txt", fileDelimiter: "semicolon", fileHeader: "yes",
      testData: 'isbn;title;available;copies\n001;"Intro; ""Quote"", Java";true;3' };
    delimited.fields = [...delimited.fields, { ...f("copies", "int", "Copies", "getCopies", "yes", "no", "no", "no", "0"), min: "0", max: "99" }];
    return [
      { id: "lab3", title: "Lab 3 原题：Book + 借还 + books.txt", model: lab3 },
      { id: "students", title: "变体：Student + Statistics（平均/最高/最低）", model: students },
      { id: "products", title: "变体：Product + Sell/Restock 数量按钮 + 显示格式", model: products },
      { id: "textarea", title: "变体：题目给 Book.java（只输出主程序）+ TextArea 显示", model: textarea },
      { id: "contacts", title: "变体：Contact + 自定义按钮文字 + 手动 Save/Load + 总数 Label", model: contacts },
      { id: "grades", title: "变体：成绩 0–100 + Pass List 筛选 + Summary（含 Total）", model: grades },
      { id: "andSearch", title: "变体：两栏都填时同时匹配（AND 搜索）", model: andSearch },
      { id: "delimited", title: "变体：分号分隔 + 表头 + 新增 int 字段 Copies", model: delimited }
    ];
  },

  normalize(model) {
    const m = { ...RecordGen.defaults(), ...JSON.parse(JSON.stringify(model)) };
    const yes = key => m[key] === "yes";
    const record = Java.ident(m.recordClass, "记录类名");
    const app = Java.ident(m.appClass, "主类名");
    if (record === app) throw new Error("记录类名和主类名不能相同。");
    const file = String(m.file ?? "").trim();
    if (!/^[A-Za-z0-9_.-]{1,60}$/.test(file) || /^\.+$/.test(file)) throw new Error("文件名只能含英文字母、数字、点、下划线和连字符，例如 books.txt。");
    const delimiter = Object.hasOwn(RecordFormat.separator, m.fileDelimiter) ? RecordFormat.separator[m.fileDelimiter] : ",";
    const fields = m.fields.map((f, i) => {
      const label = String(f.label ?? "").trim();
      if (!label || /,/.test(label)) throw new Error("第 " + (i + 1) + " 个字段需要显示名称（不含逗号）。");
      const type = RecordGen.types.includes(f.type) ? f.type : "String";
      const name = Java.ident(f.name, "第 " + (i + 1) + " 个字段名");
      const getter = Java.ident(String(f.getter ?? "").trim() || (type === "boolean" ? "is" : "get") + Java.upperFirst(name), label + " 的 getter 名");
      const setter = "set" + getter.replace(/^(get|is)/, "");
      if (!Java.isIdent(setter) || setter === "set") throw new Error(label + " 的 getter 名需以 get 或 is 开头。");
      const field = { name, type, label, getter, setter, inForm: f.inForm === "yes", key: f.key === "yes",
        search: f.search === "yes", sort: f.sort === "yes", numeric: type === "int" || type === "double" };
      if (field.numeric) field.range = NumericRules.range(f, label, type === "int");
      // The initial value only matters for fields that are not typed in the form.
      const fallback = type === "boolean" ? "false" : type === "String" ? "" : "0";
      field.initial = RecordGen.literal(type, field.inForm || f.initial === "" || f.initial === undefined ? fallback : f.initial,
        label + " 的初始值", field.inForm ? null : field.range);
      if (field.search && (type === "boolean" || !field.inForm)) throw new Error(label + "：只有表单里的文字或数字字段才能用于搜索。");
      return field;
    });
    if (!fields.length) throw new Error("至少需要一个字段。");
    const dup = fields.map(f => f.name).find((n, i, all) => all.indexOf(n) !== i);
    if (dup) throw new Error("字段名重复：" + dup);
    const keys = fields.filter(f => f.key);
    if (keys.length !== 1) throw new Error("需要恰好一个主键字段（用于查重和查找），当前 " + keys.length + " 个。");
    const key = keys[0];
    if (!key.inForm || !["String", "int"].includes(key.type)) throw new Error("主键必须是表单里的 String 或 int 字段。");
    const formFields = fields.filter(f => f.inForm);
    const toggles = (m.toggles || []).map((t, i) => {
      const field = fields.find(f => f.name === t.field);
      if (!field || field.type !== "boolean") throw new Error("第 " + (i + 1) + " 个状态按钮需要选择一个 boolean 字段。");
      const text = String(t.text ?? "").trim();
      if (!text) throw new Error("第 " + (i + 1) + " 个状态按钮需要文字。");
      return { text, field, value: t.value === "true", already: String(t.already ?? ""), done: String(t.done ?? "") };
    });
    const adjusts = (m.adjusts || []).map((a, i) => {
      const field = fields.find(f => f.name === a.field);
      if (!field || !field.numeric) throw new Error("第 " + (i + 1) + " 个数值按钮需要选择一个 int 或 double 字段。");
      const text = String(a.text ?? "").trim();
      if (!text) throw new Error("第 " + (i + 1) + " 个数值按钮需要文字。");
      const integer = field.type === "int";
      const bound = (raw, label) => String(raw ?? "").trim() === "" ? null : Java.number(raw, text + " 的" + label, { integer, min: -1e9, max: 1e9 });
      return { text, field, delta: Java.number(a.delta, text + " 的变化量", { integer, min: -1e9, max: 1e9 }),
        min: bound(a.min, "下限"), max: bound(a.max, "上限"), error: String(a.error ?? ""), done: String(a.done ?? "") };
    });
    const noun = String(m.noun ?? "").trim() || record.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
    const fileHeader = yes("fileHeader"), fileHeaderLine = fields.map(f => f.name).join(delimiter);
    const rows = [], sampleRows = [];
    let firstContent = true;
    for (const [i, raw] of String(m.testData ?? "").replace(/^\uFEFF/, "").split(/\r?\n/).entries()) {
      if (!raw.trim() && !raw.includes(delimiter)) continue;
      const prefix = "测试数据第 " + (i + 1) + " 行";
      let parts;
      try { parts = RecordFormat.split(raw, delimiter); } catch (e) { throw new Error(prefix + "：" + e.message); }
      const headerRow = fileHeader && firstContent && parts.length === fields.length && parts.every((p, j) => p === fields[j].name);
      firstContent = false;
      if (headerRow) continue;
      if (parts.length !== fields.length) throw new Error(prefix + "需要 " + fields.length + " 个字段，请检查「数据文件分隔符」。");
      sampleRows.push(parts);
      rows.push(parts.map((p, j) => {
        const f = fields[j];
        if (f.inForm && f.type === "String" && !p.trim()) throw new Error(prefix + "的 " + f.label + " 不能为空。");
        return RecordGen.literal(f.type, p, prefix + "的 " + f.label, f.range);
      }));
    }
    const keyValues = rows.map(r => r[fields.indexOf(key)]);
    if (new Set(keyValues).size !== keyValues.length) throw new Error("测试数据里有重复的主键。");
    const statsField = yes("fStats") ? fields.find(f => f.name === m.statsField && f.numeric) || fields.find(f => f.numeric) : null;
    if (yes("fStats") && !statsField) throw new Error("统计按钮需要一个 int 或 double 字段。");
    const output = ["single", "main"].includes(m.output) ? m.output : "split";
    const displayFormat = String(m.displayFormat ?? "").trim();
    // {field} always works; {method()} calls a method of a class supplied by the paper.
    const displayName = name => name.endsWith("()") ? (output === "main" ? name : null) : (fields.some(f => f.name === name) ? name : null);
    if (displayFormat) RecordGen.formatExpr(displayFormat, displayName, () => false, fields);
    const filters = (m.filters || []).map((x, i) => {
      const field = fields.find(f => f.name === x.field);
      if (!field || !field.numeric) throw new Error("第 " + (i + 1) + " 个筛选按钮需要选择一个 int 或 double 字段。");
      const text = String(x.text ?? "").trim();
      if (!text) throw new Error("第 " + (i + 1) + " 个筛选按钮需要文字。");
      const op = [">=", ">", "<=", "<", "=="].includes(x.op) ? x.op : ">=";
      return { text, field, op, value: Java.number(x.value, text + " 的比较值", { integer: field.type === "int", min: -1e9, max: 1e9 }) };
    });
    const texts = {};
    for (const [id, key, fallback] of [["add", "tAdd", "Add"], ["edit", "tEdit", "Edit"], ["save", "tSave", "Save"], ["del", "tDelete", "Delete"],
      ["search", "tSearch", "Search"], ["display", "tDisplay", "Display All"], ["loadTest", "tLoadTest", "Load Test Data"], ["clear", "tClear", "Clear"],
      ["exit", "tExit", "Exit"], ["saveFile", "tSaveFile", "Save to File"], ["loadFile", "tLoadFile", "Load from File"]]) {
      texts[id] = String(m[key] ?? "").trim() || fallback;
    }
    return {
      app, record, noun, title: String(m.title ?? ""), output, file, fileHeader, fileHeaderLine, delimiter, ctorUse: m.ctorUse === "all" ? "all" : "form",
      display: m.display === "textarea" ? "textarea" : "list", displayFormat, searchMode: m.searchMode === "all" ? "all" : "any",
      fields, key, formFields, toggles, adjusts, rows, sampleRows, statsField, statsText: String(m.statsText ?? "Statistics").trim() || "Statistics",
      statsFormat: String(m.statsFormat ?? "").trim() || "Count: {count}   Average: {average}   Highest: {highest}   Lowest: {lowest}",
      filters, texts, manual: m.saveMode === "manual", countLabel: String(m.countLabel ?? "").trim(),
      loadedMessage: String(m.loadedMessage ?? ""), savedMessage: String(m.savedMessage ?? ""),
      replacements: (m.replacements || []).filter(x => String(x.from ?? "") !== ""),
      f: { add: yes("fAdd"), edit: yes("fEdit"), del: yes("fDelete"), search: yes("fSearch") && fields.some(x => x.search),
        display: yes("fDisplay"), loadTest: yes("fLoadTest") && rows.length > 0, sort: yes("fSort") && fields.some(x => x.sort),
        clear: yes("fClear"), exit: yes("fExit"), stats: Boolean(statsField) },
      header: yes("header"), headerLines: String(m.headerLines ?? "").split(/\r?\n/).filter(l => l.trim()), showStart: yes("showStart"),
      sceneW: Java.number(m.sceneW, "窗口宽", { min: 200, max: 4000 }), sceneH: Java.number(m.sceneH, "窗口高", { min: 200, max: 4000 }),
      handlerStyle: m.handlerStyle === "anonymous" ? "anonymous" : "lambda",
      pick: m.pick === "either" && m.display !== "textarea" ? "either" : "selected",
      loadOnStart: m.saveMode === "manual" && m.loadOnStart === "yes", clearAll: yes("fClear") && m.clearAll === "yes",
      dupMessage: String(m.dupMessage ?? "").trim(), notFoundMessage: String(m.notFoundMessage ?? "").trim(),
      seedOnStart: m.seedOnStart === "yes" && rows.length > 0, loadButton: m.saveMode !== "manual" || m.fLoadFile !== "no"
    };
  },

  // Things to try in BlueJ after compiling, built from the current settings (shown under the preview).
  checklist(model) {
    const m = RecordGen.normalize(model);
    const T = m.texts, key = m.key.label;
    const typed = m.formFields.filter(f => f.type !== "boolean");
    const sample = typed.map(f => f.label).join("、");
    const steps = ["运行后：标题是「" + Java.fillProfile(m.title, { name: "你的姓名", id: "学号" }) + "」" + (m.header ? "，顶部有姓名学号" + (m.showStart ? "和启动时间" : "") : "") + "。",
      m.manual ? "启动时不读文件；列表为空" + (m.countLabel ? "，总数标签显示 0" : "") + "。"
        : "启动时自动读 " + m.file + "（第一次运行没有这个文件，列表为空，不报错）。"];
    if (m.f.add) {
      steps.push("填 " + sample + " → 「" + T.add + "」：列表多一条" + (m.displayFormat ? "，格式和题目一致" : "") + "。");
      steps.push("留空一个框再点「" + T.add + "」：弹出缺少输入的错误，列表不变。");
      steps.push("再用同一个 " + key + " 点「" + T.add + "」：弹出 Duplicate 错误。");
      for (const f of typed.filter(f => f.numeric)) {
        steps.push(f.label + " 填 abc" + (f.range.min !== null || f.range.max !== null ? "，或超出 " + NumericRules.hint(f.range) : "") + "：弹出错误，不新增。");
      }
    }
    if (m.f.edit) steps.push("选中一条 → 「" + T.edit + "」改内容 → 「" + T.save + "」：列表更新；编辑时其他按钮不能点。");
    if (m.f.del) steps.push("选中一条 → 「" + T.del + "」：删除；没选中时点它弹出提示。");
    if (m.f.search) steps.push("「" + T.search + "」：部分匹配、不分大小写" + (m.searchMode === "all" ? "；填了多个框时要全部满足" : "；填了多个框时满足任一个即可") + "。");
    for (const x of m.filters) steps.push("「" + x.text + "」：只显示 " + x.field.label + " " + x.op + " " + x.value + " 的记录。");
    for (const t of m.toggles) steps.push("「" + t.text + "」：选中记录的 " + t.field.label + " 变成 " + t.value + "；已经是 " + t.value + " 时提示「" + t.already + "」。");
    for (const a of m.adjusts) steps.push("「" + a.text + "」：" + a.field.label + " " + (a.delta >= 0 ? "+" : "") + a.delta + (a.min !== null || a.max !== null ? "，越过 " + [a.min, a.max].filter(v => v !== null).join(" / ") + " 时提示「" + a.error + "」" : "") + "。");
    if (m.f.stats) steps.push("「" + m.statsText + "」：用计算器核对一次总数、平均值" + (/\{(highest|lowest)\}/.test(m.statsFormat) ? "、最高和最低" : "") + "（保留 2 位小数）。");
    if (m.f.sort) steps.push("排序按钮：点一次升序，再点一次反过来。");
    if (m.countLabel) steps.push("每次增删后总数标签跟着变。");
    steps.push(m.manual
      ? "「" + T.saveFile + "」后关掉程序，重新运行 → 「" + T.loadFile + "」：记录原样读回。"
      : "改动几次后关掉程序再运行：记录原样读回；在 BlueJ 项目文件夹里打开 " + m.file + " 看格式" + (m.fileHeader ? "（第一行是字段名）" : "") + "。");
    return steps;
  },

  literal(type, raw, label, range = null) {
    const text = String(raw).trim();
    if (type === "String") {
      if (/[\r\n]/.test(String(raw))) throw new Error(label + "不能跨行。");
      return Java.str(String(raw));
    }
    if (type === "boolean") {
      if (!/^(true|false)$/i.test(text)) throw new Error(label + "需要是 true 或 false。");
      return text.toLowerCase();
    }
    const n = NumericRules.parse(text, type === "int");
    if (!Number.isFinite(n)) throw new Error(label + "需要是有效的" + (type === "int" ? "整数。" : "有限数字。"));
    if (range && !NumericRules.accepts(n, range, type === "int")) throw new Error(label + " 需满足 " + NumericRules.hint(range) + "。");
    return type === "int" ? String(n) : Java.dbl(n);
  },

  generate(model, profile = {}) {
    const m = RecordGen.normalize(model);
    const units = [];
    if (m.output !== "main") units.push(RecordGen.recordUnit(m));
    units.push(RecordGen.appUnit(m, profile));
    const files = JavaFiles.assemble(units, m.app, m.output, profile).map(f => ({ ...f, code: Java.replaceTexts(f.code, m.replacements) }));
    const warnings = [];
    if (!profile.name || !profile.id) warnings.push("还没有填写考生信息，文件头注释和顶部学生信息会显示占位文字。");
    if (m.output === "main") {
      const ctor = m.ctorUse === "form" ? m.formFields : m.fields;
      warnings.push("只输出主程序：项目里要有题目给的 " + m.record + ".java，并且有构造器 " + m.record + "(" + ctor.map(f => f.type + " " + f.name).join(", ") +
        ")、上面填写的 getter/setter 和 toString()。可以先用「骨架补全」补好它。");
    }
    warnings.push(m.manual ? "数据文件 " + m.file + " 在 BlueJ 项目文件夹里；只有点「" + m.texts.saveFile + "」才写入，点「" + m.texts.loadFile + "」才读取。"
      : "数据文件 " + m.file + " 在 BlueJ 项目文件夹里读写；第一次保存时自动创建。");
    return { files, main: m.app, units, warnings, normalized: m };
  },

  recordUnit(m) {
    const all = m.fields, form = m.formFields;
    const lines = all.map(f => "private " + f.type + " " + f.name + ";");
    const needsFull = form.length !== all.length;
    lines.push("");
    if (needsFull) {
      const nonForm = all.filter(f => !f.inForm);
      lines.push("/** New " + m.noun + " from the input form; " + nonForm.map(f => f.name + " starts as " + f.initial).join(", ") + ". */",
        "public " + m.record + "(" + form.map(f => f.type + " " + f.name).join(", ") + ") {",
        "    this(" + all.map(f => f.inForm ? f.name : f.initial).join(", ") + ");", "}", "");
    }
    lines.push("public " + m.record + "(" + all.map(f => f.type + " " + f.name).join(", ") + ") {",
      ...all.map(f => "    this." + f.name + " = " + f.name + ";"), "}");
    for (const f of all) {
      lines.push("", "public " + f.type + " " + f.getter + "() {", "    return " + f.name + ";", "}",
        "", "public void " + f.setter + "(" + f.type + " " + f.name + ") {", "    this." + f.name + " = " + f.name + ";", "}");
    }
    lines.push("", "/** Serializes one record in the selected text file format. */",
      "public String toFileLine() {", "    return " + RecordFormat.encodeValues(all, m.delimiter, f => f.name) + ";", "}");
    if (all.some(f => f.type === "String")) lines.push("", ...RecordFormat.encoder(m.delimiter));
    const shown = m.displayFormat
      ? RecordGen.formatExpr(m.displayFormat, name => all.some(f => f.name === name) ? name : null, name => all.some(f => f.name === name && f.type === "String"), all)
      : all.map(f => f.type === "boolean" ? "(" + f.name + " ? " + Java.str(f.label) + " : " + Java.str("Not " + f.label.toLowerCase()) + ")" : f.name)
        .map((e, i) => i === 0 && all[0].type !== "String" ? '"" + ' + e : e).join(' + "  |  " + ');
    lines.push("", "/** Text shown in the list. */", "@Override", "public String toString() {", "    return " + shown + ";", "}");
    return javaUnit(m.record, "class", [],
      "/** One " + m.noun + " record stored in " + m.file + ". */\npublic class " + m.record + " {\n" + Java.indent(lines.join("\n"), 4) + "\n}\n");
  },

  appUnit(m, profile) {
    const R = m.record, r = Java.lowerFirst(R) === "list" ? "item" : Java.lowerFirst(R);
    const list = /s$/.test(r) ? r + "List" : r + "s";
    const key = m.key, form = m.formFields, textarea = m.display === "textarea", given = m.output === "main";
    const imports = ["java.io.File", "java.io.IOException", "java.io.PrintWriter",
      "java.util.ArrayList", "java.util.HashSet", "java.util.Scanner", "javafx.application.Application", "javafx.geometry.Insets", "javafx.geometry.Pos",
      "javafx.scene.Scene", "javafx.scene.control.Alert", "javafx.scene.control.Button", "javafx.scene.control.Label",
      "javafx.scene.control.TextField", "javafx.scene.layout.BorderPane", "javafx.scene.layout.HBox", "javafx.scene.layout.VBox", "javafx.stage.Stage"];
    imports.push(textarea ? "javafx.scene.control.TextArea" : "javafx.scene.control.ListView");
    if (m.showStart) imports.push("java.time.LocalDateTime", "java.time.format.DateTimeFormatter");
    if (form.some(f => f.type === "boolean")) imports.push("javafx.scene.control.CheckBox");
    const ids = Java.names([list, "listView", "recordArea", "shown", "messageLabel", "selected" + R, "editing" + R, "stage", "root", "header",
      "form", "bottom", "e", "DATA_FILE"]);
    const input = f => f.type === "boolean" ? f.name + "Box" : f.name + "Field";
    for (const f of form) ids.reserve(input(f));
    const sel = "selected" + R, edit = "editing" + R;
    const btn = {};
    const addBtn = (id, text) => { btn[id] = { name: ids.take(Java.camel(text, "Button")), text }; };
    const T = m.texts;
    if (m.f.add) addBtn("add", T.add);
    if (m.f.edit) { addBtn("edit", T.edit); addBtn("save", T.save); }
    if (m.f.del) addBtn("del", T.del);
    if (m.f.search) addBtn("search", T.search);
    if (m.f.display) addBtn("display", T.display);
    if (m.f.loadTest) addBtn("loadTest", T.loadTest);
    m.filters.forEach((x, i) => addBtn("filter" + i, x.text));
    if (m.manual) { addBtn("saveFile", T.saveFile); if (m.loadButton) addBtn("loadFile", T.loadFile); }
    m.toggles.forEach((t, i) => addBtn("toggle" + i, t.text));
    m.adjusts.forEach((a, i) => addBtn("adjust" + i, a.text));
    if (m.f.stats) addBtn("stats", m.statsText);
    const sortFields = m.f.sort ? m.fields.filter(f => f.sort) : [];
    sortFields.forEach(f => addBtn("sort_" + f.name, "Sort by " + f.label));
    if (m.f.clear) addBtn("clear", T.clear);
    if (m.f.exit) addBtn("exit", T.exit);

    const keyLabel = key.label, keyGet = x => x + "." + key.getter + "()";
    const keyText = x => key.type === "String" ? keyGet(x) : "String.valueOf(" + keyGet(x) + ")";
    const nounCap = Java.upperFirst(m.noun);
    // Custom wording for the two key errors: {key} = the key value, {label} = its display name, {noun} = the record noun.
    const keyMessage = (template, keyExpr, fallback) => template
      ? Java.message(template.replace(/\{label\}/g, keyLabel).replace(/\{noun\}/g, m.noun).replace(/\{Noun\}/g, nounCap), { key: keyExpr })
      : fallback;
    const dup = keyExpr => keyMessage(m.dupMessage, keyExpr, Java.str("Duplicate " + keyLabel + ": ") + " + " + keyExpr + " + \" already exists.\"");
    const joinLabels = (labels, last) => labels.length === 1 ? labels[0] : labels.length === 2 && last === "and"
      ? "both " + labels[0] + " and " + labels[1] : labels.slice(0, -1).join(", ") + " " + last + " " + labels[labels.length - 1];
    // How a record is built: the record class's constructors, or (given class) constructor + setters.
    const fullCall = args => given && m.ctorUse === "form" ? "createRecord(" + args.join(", ") + ")" : "new " + R + "(" + args.join(", ") + ")";
    const formCall = args => given && m.ctorUse === "all"
      ? "new " + R + "(" + m.fields.map(f => f.inForm ? args[form.indexOf(f)] : f.initial).join(", ") + ")"
      : "new " + R + "(" + args.join(", ") + ")";
    const lineOf = x => given ? RecordFormat.encodeValues(m.fields, m.delimiter, f => x + "." + f.getter + "()") : x + ".toFileLine()";
    const textOf = x => given && m.displayFormat
      ? RecordGen.formatExpr(m.displayFormat, name => displayExpr(x, name), name => m.fields.some(f => f.name === name && f.type === "String"), m.fields)
      : x + ".toString()";
    const displayExpr = (x, name) => { if (name.endsWith("()")) return x + "." + name; const f = m.fields.find(q => q.name === name); return f ? x + "." + f.getter + "()" : null; };
    const fileValues = { count: list + ".size()", file: "DATA_FILE" };
    const validName = f => "validField" + Java.upperFirst(f.name);
    const numberRule = f => NumericRules.hint(f.range);
    const rangeMessage = f => numberRule(f) ? f.label + " must be " + numberRule(f) + "." : "Please enter a valid number for " + f.label + ".";

    // ---------- fields ----------
    const fl = ["private static final String DATA_FILE = " + Java.str(m.file) + ";",
      "private boolean fileReadFailed;  // Never overwrite a file that could not be read.", "",
      "private ArrayList<" + R + "> " + list + " = new ArrayList<>();"];
    if (textarea) fl.push("private TextArea recordArea = new TextArea();");
    else fl.push("private ListView<String> listView = new ListView<>();", "private ArrayList<" + R + "> shown = new ArrayList<>();   // records now in the list, same order");
    fl.push('private Label messageLabel = new Label("Ready");');
    if (m.countLabel) fl.push("private Label countLabel = new Label(" + Java.str(m.countLabel.replace(/\{count\}/g, "0")) + ");");
    fl.push("", "// Input fields");
    for (const f of form) {
      fl.push(f.type === "boolean"
        ? "private CheckBox " + input(f) + " = new CheckBox(" + Java.str(f.label) + ");"
        : "private TextField " + input(f) + " = new TextField();");
    }
    fl.push("", "// Buttons");
    for (const b of Object.values(btn)) fl.push("private Button " + b.name + " = new Button(" + Java.str(b.text) + ");");
    fl.push("");
    if (!textarea) fl.push("private " + R + " " + sel + ";   // " + m.noun + " chosen in the list, or null");
    if (m.f.edit) fl.push("private " + R + " " + edit + ";    // not null while in edit mode");
    sortFields.forEach(f => fl.push("private boolean " + f.name + "Ascending = true;"));

    // ---------- start() ----------
    const st = [];
    if (m.header) {
      st.push("// Top: student information" + (m.showStart ? " and the time the program started" : ""));
      if (m.showStart) st.push('String started = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));');
      const labels = [...m.headerLines.map(l => "new Label(" + Java.str(Java.fillProfile(l, profile)) + ")"),
        ...(m.showStart ? ['new Label("Program Started: " + started)'] : [])];
      st.push("VBox header = new VBox(4" + labels.map(l => ",\n        " + l).join("") + ");", "header.setPadding(new Insets(10));", "");
    }
    st.push("// Below the list: input fields" + (m.f.clear ? " and the Clear button" : ""));
    const formItems = form.flatMap(f => f.type === "boolean" ? [input(f)] : ["new Label(" + Java.str(f.label + ":") + ")", input(f)]);
    if (m.f.clear) formItems.push(btn.clear.name);
    st.push("HBox form = new HBox(8, " + formItems.join(", ") + ");", "form.setAlignment(Pos.CENTER_LEFT);", "");
    const row1 = ["add", "edit", "save", "del", "search"].filter(k => btn[k]).map(k => btn[k].name);
    const row2 = ["display", "loadTest", ...m.filters.map((_, i) => "filter" + i), ...m.toggles.map((_, i) => "toggle" + i),
      ...m.adjusts.map((_, i) => "adjust" + i), "stats", "saveFile", "loadFile", "exit"]
      .filter(k => btn[k]).map(k => btn[k].name);
    const row3 = sortFields.map(f => btn["sort_" + f.name].name);
    const rows = [row1, row2, row3].filter(rw => rw.length);
    st.push("// Bottom: rows of buttons and the message label");
    rows.forEach((rw, i) => st.push("HBox row" + (i + 1) + " = new HBox(8, " + rw.join(", ") + ");"));
    st.push("VBox bottom = new VBox(8, form, " + rows.map((_, i) => "row" + (i + 1)).join(", ") + (rows.length ? ", " : "") + (m.countLabel ? "countLabel, " : "") + "messageLabel);",
      "bottom.setPadding(new Insets(10));", "");
    if (textarea) st.push("recordArea.setEditable(false);   // display only", "");
    else st.push("listView.setPlaceholder(new Label(" + Java.str("No " + m.noun + " records") + "));", "");
    st.push("BorderPane root = new BorderPane();", ...(m.header ? ["root.setTop(header);"] : []),
      "root.setCenter(" + (textarea ? "recordArea" : "listView") + ");", "root.setBottom(bottom);", "");
    st.push("// Event handlers");
    const reg = (target, setter, body, eventClass = "ActionEvent") => {
      const h = Java.handler(target, setter, body, { style: m.handlerStyle, eventClass });
      imports.push(...h.imports);
      st.push(h.code);
    };
    const mutate = body => m.manual ? body : "if (fileReadFailed) {\n    showError(\"The data file could not be read. Correct it and reopen the program before editing.\");\n    return;\n}\n" + body;
    // A selection listener (as the Lab 3 sheet asks): clicking a row and moving with the arrow keys both select it.
    if (!textarea) st.push("listView.getSelectionModel().selectedIndexProperty().addListener((observable, oldIndex, newIndex) -> selectFromList());");
    if (btn.add) reg(btn.add.name, "setOnAction", mutate("add" + R + "();"));
    if (btn.edit) { reg(btn.edit.name, "setOnAction", mutate("edit" + R + "();")); reg(btn.save.name, "setOnAction", mutate("saveEdit();")); }
    if (btn.del) reg(btn.del.name, "setOnAction", mutate("delete" + R + "();"));
    if (btn.search) reg(btn.search.name, "setOnAction", "search();");
    if (btn.display) reg(btn.display.name, "setOnAction", "displayAll();");
    if (btn.loadTest) reg(btn.loadTest.name, "setOnAction", mutate("loadTestData();"));
    m.toggles.forEach((t, i) => reg(btn["toggle" + i].name, "setOnAction",
      mutate("change" + Java.upperFirst(t.field.name) + "(" + t.value + ", " + Java.str(t.already) + ", " + Java.str(t.done) + ");")));
    m.adjusts.forEach((a, i) => reg(btn["adjust" + i].name, "setOnAction", mutate(btn["adjust" + i].name.replace(/Button$/, "") + "();")));
    if (btn.stats) reg(btn.stats.name, "setOnAction", "showStatistics();");
    const filterMethod = i => "filter" + Java.upperFirst(btn["filter" + i].name.replace(/Button$/, ""));
    m.filters.forEach((x, i) => reg(btn["filter" + i].name, "setOnAction", filterMethod(i) + "();"));
    if (btn.saveFile) {
      reg(btn.saveFile.name, "setOnAction", "if (saveToFile()) showMessage(" + Java.message(m.savedMessage, fileValues) + ");");
      if (btn.loadFile) reg(btn.loadFile.name, "setOnAction", "if (loadFromFile()) {\n    show" + R + "s(" + list + ");\n    clearFields();\n}");
    }
    sortFields.forEach(f => reg(btn["sort_" + f.name].name, "setOnAction", "sortBy" + Java.upperFirst(f.name) + "();"));
    if (btn.clear) reg(btn.clear.name, "setOnAction", m.clearAll
      ? list + ".clear();   // memory only: the data file is not changed\nshow" + R + "s(" + list + ");\nclearFields();\nshowMessage(\"All records cleared.\");"
      : "clearFields();\nshowMessage(\"Fields cleared.\");");
    if (btn.exit) reg(btn.exit.name, "setOnAction", "stage.close();");
    st.push("", "stage.setTitle(" + Java.str(Java.fillProfile(m.title, profile)) + ");",
      "stage.setScene(new Scene(root, " + Java.lit(m.sceneW) + ", " + Java.lit(m.sceneH) + "));", "stage.show();",
      ...(m.manual ? (m.loadOnStart ? ["if (new File(DATA_FILE).exists()) {   // a missing file means an empty list", "    loadFromFile();", "}"] : [])
        : ["loadFromFile();"]),
      ...(m.seedOnStart ? ["if (" + list + ".isEmpty()) {   // no saved records yet: start with the records given in the question",
        ...m.rows.map(row => "    " + list + ".add(" + fullCall(row) + ");"), "}"] : []),
      "show" + R + "s(" + list + ");", "updateButtons();");

    // ---------- methods ----------
    const md = [];
    // With explicit Save/Load buttons nothing is written automatically, so the saveToFile() calls are left out.
    const method = (doc, sig, body) => md.push("", "/** " + doc + " */", sig + " {",
      Java.indent(body.flatMap(line => {
        if (line.trim() !== "saveToFile();") return [line];
        if (m.manual) return [];
        return [line.replace("saveToFile();", "if (!saveToFile()) { show" + R + "s(" + list + "); updateButtons(); return; }")];
      }).join("\n"), 4), "}");
    for (const f of m.fields.filter(f => f.numeric)) {
      const int = f.type === "int";
      const checks = [int ? "value < Integer.MIN_VALUE || value > Integer.MAX_VALUE" : "",
        NumericRules.invalid("value", f.range, int)].filter(Boolean);
      method("Checks the same field rule for Add, Edit, number actions and file import.",
        "private static boolean " + validName(f) + "(" + (int ? "long" : "double") + " value)", ["return !(" + checks.join(" || ") + ");"]);
    }
    const refreshSelected = textarea ? [] : m.pick === "either"
      ? ["if (" + sel + " != null) {", "    listView.getSelectionModel().select(shown.indexOf(" + sel + "));", "}"]
      : ["listView.getSelectionModel().select(shown.indexOf(" + sel + "));"];
    if (!textarea) {
      method("Clicking a row copies its values into the input fields.", "private void selectFromList()", [
        ...(m.f.edit ? ["if (" + edit + " != null) {", "    return;   // the list is locked while editing", "}"] : []),
        "int index = listView.getSelectionModel().getSelectedIndex();",
        "if (index >= 0) {", "    " + sel + " = shown.get(index);", "    fillFields(" + sel + ");", "}", "updateButtons();"]);
    }
    method("Puts the values of a " + m.noun + " into the input fields.", "private void fillFields(" + R + " " + r + ")",
      form.map(f => f.type === "boolean" ? input(f) + ".setSelected(" + r + "." + f.getter + "());"
        : input(f) + ".setText(" + (f.type === "String" ? r + "." + f.getter + "()" : "String.valueOf(" + r + "." + f.getter + "())") + ");"));

    if (m.f.add || m.f.edit) {
      const required = form.filter(f => f.type !== "boolean");
      const body = required.map(f => "String " + f.name + "Text = " + input(f) + ".getText().trim();");
      body.push("if (" + required.map(f => f.name + "Text.isEmpty()").join(" || ") + ") {",
        "    showError(" + Java.str("Please enter " + joinLabels(required.map(f => f.label), "and") + ".") + ");", "    return null;", "}");
      const texts = required.filter(f => f.type === "String");
      if (texts.length) {
        body.push("if (" + texts.map(f => f.name + 'Text.contains("\\n") || ' + f.name + 'Text.contains("\\r")').join(" || ") + ") {",
          '    showError("Text fields must fit on one line.");', "    return null;", "}");
      }
      const numbers = required.filter(f => f.numeric);
      for (const f of numbers) body.push(f.type + " " + f.name + ";");
      for (const f of numbers) {
        body.push("try {", "    " + f.name + " = " + (f.type === "int" ? "Integer.parseInt" : "Double.parseDouble") + "(" + f.name + "Text);",
          "} catch (NumberFormatException ex) {", "    showError(" + Java.str("Please enter a valid number for " + f.label + ".") + ");", "    return null;", "}");
        body.push("if (!" + validName(f) + "(" + f.name + ")) {",
          "    showError(" + Java.str(rangeMessage(f)) + ");", "    return null;", "}");
      }
      body.push("return " + formCall(form.map(f => f.type === "boolean" ? input(f) + ".isSelected()" : f.type === "String" ? f.name + "Text" : f.name)) + ";");
      method("Reads the input fields. Shows an error and returns null if something is missing or invalid.", "private " + R + " readFields()", body);
    }
    if (given && m.ctorUse === "form") {
      const nonForm = m.fields.filter(f => !f.inForm);
      method("Builds a " + m.noun + " with the given class: its constructor, then setters for the other fields.",
        "private " + R + " createRecord(" + m.fields.map(f => f.type + " " + f.name).join(", ") + ")", [
          R + " " + r + " = new " + R + "(" + form.map(f => f.name).join(", ") + ");",
          ...nonForm.map(f => r + "." + f.setter + "(" + f.name + ");"), "return " + r + ";"]);
    }
    method("Returns the " + m.noun + " with this " + keyLabel + ", or null if there is none.",
      "private " + R + " find" + R + "(String " + key.name + ")", [
        "for (" + R + " " + r + " : " + list + ") {", "    if (" + keyText(r) + ".equals(" + key.name + ")) {",
        "        return " + r + ";", "    }", "}", "return null;"]);
    method((textarea ? "The " + m.noun + " whose " + keyLabel + " was typed" : "The selected " + m.noun + ", or the one whose " + keyLabel + " was typed") +
      ". Shows an error and returns null if there is none.", "private " + R + " choose" + R + "()", [
        ...(textarea || m.pick === "either" ? [] : ["if (" + sel + " != null) {", "    return " + sel + ";", "}"]),
        "String " + key.name + " = " + input(key) + ".getText().trim();",
        // A key typed after selecting a row wins: the selected row only counts while the key field still shows its key.
        ...(m.pick === "either" ? ["if (" + sel + " != null && (" + key.name + ".isEmpty() || " + keyText(sel) + ".equals(" + key.name + "))) {",
          "    return " + sel + ";", "}"] : []),
        "if (" + key.name + ".isEmpty()) {", "    showError(" + Java.str("Please enter " + (textarea ? "" : "or select ") + (/^[AEIOU]/i.test(keyLabel) ? "an " : "a ") + keyLabel + ".") + ");", "    return null;", "}",
        R + " " + r + " = find" + R + "(" + key.name + ");",
        "if (" + r + " == null) {", "    showError(" + keyMessage(m.notFoundMessage, key.name, Java.str(nounCap + " with " + keyLabel + " ") + " + " + key.name + " + \" cannot be found.\"") + ");", "}",
        "return " + r + ";"]);
    // Status and number buttons work on the selected record (list) or the typed key (text area).
    const target = (errorIfNone) => textarea || m.pick === "either"
      ? [R + " " + r + " = choose" + R + "();", "if (" + r + " == null) {", "    return;", "}"]
      : [R + " " + r + " = " + sel + ";", "if (" + r + " == null) {", "    showError(" + Java.str(errorIfNone) + ");", "    return;", "}"];
    if (m.f.add) {
      method("Add button: adds a new " + m.noun + " if the " + keyLabel + " is not used yet.", "private void add" + R + "()", [
        R + " " + r + " = readFields();", "if (" + r + " == null) {", "    return;", "}",
        "if (find" + R + "(" + keyText(r) + ") != null) {",
        "    showError(" + dup(keyText(r)) + ");", "    return;", "}",
        list + ".add(" + r + ");", "saveToFile();", "show" + R + "s(" + list + ");", "clearFields();",
        "showMessage(" + Java.str(nounCap + " added: ") + " + " + keyText(r) + ");"]);
    }
    if (m.f.edit) {
      method("Edit button: enters edit mode. Only Save and Exit stay enabled.", "private void edit" + R + "()", [
        "if (" + list + ".isEmpty()) {", "    showError(" + Java.str("No " + m.noun + " record is available for editing.") + ");", "    return;", "}",
        R + " " + r + " = choose" + R + "();", "if (" + r + " == null) {", "    return;", "}",
        edit + " = " + r + ";", "fillFields(" + r + ");", "updateButtons();",
        "showMessage(" + Java.str("Editing " + keyLabel + " ") + " + " + keyText(r) + " + \". Change the fields and click Save.\");"]);
      method("Save button: copies the input fields into the " + m.noun + " being edited.", "private void saveEdit()", [
        "if (" + edit + " == null) {", "    showError(" + Java.str("No " + m.noun + " is selected for editing.") + ");", "    return;", "}",
        R + " changed = readFields();", "if (changed == null) {", "    return;   // stay in edit mode", "}",
        R + " other = find" + R + "(" + keyText("changed") + ");",
        "if (other != null && other != " + edit + ") {",
        "    showError(" + dup(keyText("changed")) + ");", "    return;", "}",
        ...form.map(f => edit + "." + f.setter + "(changed." + f.getter + "());"),
        edit + " = null;", "saveToFile();", "show" + R + "s(" + list + ");", "clearFields();",
        "showMessage(" + Java.str(nounCap + " updated.") + ");"]);
    }
    if (m.f.del) {
      method("Delete button: removes the " + (textarea ? "" : "selected or ") + "typed " + m.noun + ".", "private void delete" + R + "()", [
        "if (" + list + ".isEmpty()) {", "    showError(" + Java.str("No " + m.noun + " record is available for deletion.") + ");", "    return;", "}",
        R + " " + r + " = choose" + R + "();", "if (" + r + " == null) {", "    return;", "}",
        list + ".remove(" + r + ");", "saveToFile();", "show" + R + "s(" + list + ");", "clearFields();",
        "showMessage(" + Java.str(nounCap + " deleted: ") + " + " + keyText(r) + ");"]);
    }
    if (m.f.search) {
      const sf = m.fields.filter(f => f.search);
      const all = m.searchMode === "all";
      const body = sf.map(f => "String " + f.name + "Key = " + input(f) + ".getText().trim().toLowerCase(java.util.Locale.ROOT);");
      body.push("if (" + sf.map(f => f.name + "Key.isEmpty()").join(" && ") + ") {",
        "    showError(" + Java.str("Please enter a " + joinLabels(sf.map(f => "partial " + f.label), "and/or") + " for searching.") + ");", "    return;", "}",
        "ArrayList<" + R + "> matches = new ArrayList<>();",
        "for (" + R + " " + r + " : " + list + ") {",
        "    boolean match = " + sf.map(f => "(" + (all ? "" : "!") + f.name + "Key.isEmpty() " + (all ? "|| " : "&& ") +
          (f.type === "String" ? r + "." + f.getter + "()" : "String.valueOf(" + r + "." + f.getter + "())") +
          ".toLowerCase(java.util.Locale.ROOT).contains(" + f.name + "Key))").join(all ? "\n            && " : "\n            || ") + ";",
        "    if (match) {", "        matches.add(" + r + ");", "    }", "}",
        ...(textarea ? [] : [sel + " = null;"]), "show" + R + "s(matches);", "updateButtons();",
        'showMessage(matches.size() + " matching record(s).' + (m.f.display ? ' Click Display All to see every record.' : '') + '");');
      method("Search button: partial, case-insensitive; " + (all ? "all" : "any") + " filled-in criteria must match.", "private void search()", body);
    }
    if (m.f.display) {
      method("Display All button: shows every " + m.noun + " in the current ArrayList order.", "private void displayAll()", [
        ...(textarea ? [] : [sel + " = null;"]), "show" + R + "s(" + list + ");", "updateButtons();",
        "showMessage(" + list + '.size() + " record(s).");']);
    }
    for (const f of sortFields) {
      const asc = f.name + "Ascending";
      const cmp = (a, b) => f.type === "String" ? a + "." + f.getter + "().compareToIgnoreCase(" + b + "." + f.getter + "())"
        : (f.type === "int" ? "Integer" : f.type === "double" ? "Double" : "Boolean") + ".compare(" + a + "." + f.getter + "(), " + b + "." + f.getter + "())";
      method("Sort button: sorts the ArrayList by " + f.label + "; each click switches between ascending and descending.",
        "private void sortBy" + Java.upperFirst(f.name) + "()", [
          "if (" + asc + ") {", "    " + list + ".sort((a, b) -> " + cmp("a", "b") + ");",
          "} else {", "    " + list + ".sort((a, b) -> " + cmp("b", "a") + ");", "}",
          "showMessage(" + Java.str("Sorted by " + f.label + " (") + " + (" + asc + ' ? "ascending" : "descending") + ").");',
          asc + " = !" + asc + ";", ...(textarea ? [] : [sel + " = null;"]), "show" + R + "s(" + list + ");", "updateButtons();"]);
    }
    if (m.f.loadTest) {
      method("Load Test Data button: adds the sample records whose " + keyLabel + " is not used yet.", "private void loadTestData()", [
        R + "[] samples = {", ...m.rows.map((row, i) => "    " + fullCall(row) + (i < m.rows.length - 1 ? "," : "")), "};",
        "int added = 0;", 'String skipped = "";',
        "for (" + R + " sample : samples) {", "    if (find" + R + "(" + keyText("sample") + ") == null) {",
        "        " + list + ".add(sample);", "        added++;", "    } else {",
        '        skipped = skipped.isEmpty() ? ' + keyText("sample") + ' : skipped + ", " + ' + keyText("sample") + ";", "    }", "}",
        ...(m.manual ? [] : ["if (added > 0) {", "    saveToFile();", "}"]), "show" + R + "s(" + list + ");",
        "if (!skipped.isEmpty()) {", "    showError(" + dup("skipped") + ");",
        "} else {", '    showMessage(added + " test record(s) added.");', "}"]);
    }
    const toggleFields = [...new Set(m.toggles.map(t => t.field))];
    for (const f of toggleFields) {
      method("Status buttons: change " + f.name + " of the " + (textarea ? "typed" : "selected") + " " + m.noun + " and save.",
        "private void change" + Java.upperFirst(f.name) + "(boolean value, String alreadyMessage, String doneMessage)", [
          ...target("Please select a " + m.noun + " first."),
          "if (" + r + "." + f.getter + "() == value) {", "    showError(alreadyMessage);", "    return;", "}",
          r + "." + f.setter + "(value);", "saveToFile();", "show" + R + "s(" + list + ");",
          ...refreshSelected, "updateButtons();", "showMessage(doneMessage);"]);
    }
    m.adjusts.forEach((a, i) => {
      const f = a.field, lit = v => Java.lit(v, f.type === "int" ? "int" : "double");
      const checks = ["!" + validName(f) + "(next)"];
      if (a.min !== null) checks.push("next < " + lit(a.min));
      if (a.max !== null) checks.push("next > " + lit(a.max));
      method(a.text + " button: " + (a.delta < 0 ? "subtracts " + lit(-a.delta) + " from" : "adds " + lit(a.delta) + " to") + " the " + f.label.toLowerCase() +
        " of the " + (textarea ? "typed" : "selected") + " " + m.noun + ".", "private void " + btn["adjust" + i].name.replace(/Button$/, "") + "()", [
          ...target("Please select a " + m.noun + " first."),
          (f.type === "int" ? "long next = (long) " : "double next = ") + r + "." + f.getter + "() " + (a.delta < 0 ? "- " + lit(-a.delta) : "+ " + lit(a.delta)) + ";",
          ...(checks.length ? ["if (" + checks.join(" || ") + ") {", "    showError(" + Java.str(a.error) + ");", "    return;", "}"] : []),
          r + "." + f.setter + "(" + (f.type === "int" ? "(int) " : "") + "next);", "saveToFile();", "show" + R + "s(" + list + ");",
          ...refreshSelected, "updateButtons();", "showMessage(" + Java.str(a.done) + ");"]);
    });
    if (m.f.stats) {
      const f = m.statsField, g = x => x + "." + f.getter + "()";
      method(m.statsText + " button: count, average, highest and lowest " + f.label + ".", "private void showStatistics()", [
        "if (" + list + ".isEmpty()) {", "    showError(" + Java.str("No " + m.noun + " record is available.") + ");", "    return;", "}",
        "double total = 0;", "double highest = " + g(list + ".get(0)") + ";", "double lowest = highest;",
        "for (" + R + " " + r + " : " + list + ") {", "    double value = " + g(r) + ";", "    total += value;",
        "    if (value > highest) {", "        highest = value;", "    }", "    if (value < lowest) {", "        lowest = value;", "    }", "}",
        "double average = total / " + list + ".size();",
        ...(m.statsFormat === "Count: {count}   Average: {average}   Highest: {highest}   Lowest: {lowest}"
          ? ['showMessage("Count: " + ' + list + '.size() + "   Average: " + String.format("%.2f", average)',
            '        + "   Highest: " + String.format("%.2f", highest) + "   Lowest: " + String.format("%.2f", lowest));']
          : ["showMessage(" + Java.message(m.statsFormat, { count: list + ".size()", average: 'String.format("%.2f", average)',
            total: f.type === "int" ? "(int) total" : 'String.format("%.2f", total)',
            highest: f.type === "int" ? "(int) highest" : 'String.format("%.2f", highest)',
            lowest: f.type === "int" ? "(int) lowest" : 'String.format("%.2f", lowest)' }) + ");"])]);
    }
    m.filters.forEach((x, i) => {
      const lit = x.field.type === "int" ? String(x.value) : Java.lit(x.value, "double");
      method(x.text + " button: shows only the " + m.noun + " records whose " + x.field.label.toLowerCase() + " is " + x.op + " " + lit + ".",
        "private void " + filterMethod(i) + "()", [
          "ArrayList<" + R + "> matches = new ArrayList<>();",
          "for (" + R + " " + r + " : " + list + ") {", "    if (" + r + "." + x.field.getter + "() " + x.op + " " + lit + ") {",
          "        matches.add(" + r + ");", "    }", "}",
          ...(textarea ? [] : [sel + " = null;"]), "show" + R + "s(matches);", "updateButtons();",
          'showMessage(matches.size() + " matching record(s).");']);
    });
    method("Shows a list of records" + (textarea ? " in the text area, one per line." : " in the ListView."), "private void show" + R + "s(ArrayList<" + R + "> records)",
      [...(textarea ? ['String text = "";', "for (" + R + " " + r + " : records) {", "    text += " + textOf(r) + ' + "\\n";', "}", "recordArea.setText(text);"]
        : ["shown = new ArrayList<>(records);", "listView.getItems().clear();", "for (" + R + " " + r + " : shown) {",
          "    listView.getItems().add(" + textOf(r) + ");", "}"]),
      ...(m.countLabel ? ["countLabel.setText(" + Java.message(m.countLabel, { count: list + ".size()" }) + ");"] : [])]);
    method("Clears the input fields" + (textarea ? "" : " and the selection") + ", and returns to normal mode.", "private void clearFields()", [
      ...form.map(f => f.type === "boolean" ? input(f) + ".setSelected(false);" : input(f) + ".clear();"),
      ...(textarea ? [] : ["listView.getSelectionModel().clearSelection();", sel + " = null;"]), ...(m.f.edit ? [edit + " = null;"] : []), "updateButtons();"]);
    const ub = [];
    if (m.f.edit) {
      ub.push("boolean editing = " + edit + " != null;");
      for (const [id, b] of Object.entries(btn)) {
        if (id === "save") ub.push(b.name + ".setDisable(!editing);");
        else if (id === "exit" || (id.startsWith("toggle") && !textarea && m.pick !== "either")) continue;
        else ub.push(b.name + ".setDisable(editing);");
      }
      ub.push((textarea ? "recordArea" : "listView") + ".setDisable(editing);");
    }
    if (!textarea && m.pick !== "either") {
      m.toggles.forEach((t, i) => ub.push(btn["toggle" + i].name + ".setDisable(" + (m.f.edit ? "editing || " : "") + sel + " == null || " +
        sel + "." + t.field.getter + "() == " + t.value + ");"));
    }
    if (!ub.length) ub.push("// Every button is always enabled in this version.");
    method((m.f.edit ? "Edit mode: only Save and Exit work. " : "") + (textarea ? "Buttons act on the typed " + keyLabel + "." : "Status buttons need a selected " + m.noun + " in the right state."),
      "private void updateButtons()", ub);
    method("Every error appears in a pop-up Alert and in the message label.", "private void showError(String message)", [
      "Alert alert = new Alert(Alert.AlertType.ERROR);", "alert.setTitle(" + Java.str(Java.fillProfile(m.title, profile)) + ");",
      'alert.setHeaderText("Error");', "alert.setContentText(message);", "alert.showAndWait();", "messageLabel.setText(message);"]);
    method("Success and state messages only go to the message label.", "private void showMessage(String message)", ["messageLabel.setText(message);"]);

    md.push("", ...RecordFormat.decoder(m.delimiter));
    if (given && m.fields.some(f => f.type === "String")) md.push("", ...RecordFormat.encoder(m.delimiter));
    const parseFields = [];
    for (const [i, f] of m.fields.entries()) {
      const str = "parts[" + i + "]", v = "value" + i;
      if (f.type === "String") {
        parseFields.push("String " + v + " = " + str + ";");
        if (f.inForm) parseFields.push("if (" + v + ".isBlank()) throw new IllegalArgumentException(" + Java.str(f.label + " cannot be empty.") + ");");
      } else if (f.type === "boolean") {
        const text = str + ".trim()";
        parseFields.push('if (!"true".equalsIgnoreCase(' + text + ') && !"false".equalsIgnoreCase(' + text + "))",
          "    throw new IllegalArgumentException(" + Java.str(f.label + " must be true or false.") + ");",
          "boolean " + v + " = Boolean.parseBoolean(" + text + ");");
      } else {
        parseFields.push(f.type + " " + v + ";", "try { " + v + " = " + (f.type === "int" ? "Integer.parseInt" : "Double.parseDouble") + "(" + str + ".trim()); }",
          "catch (NumberFormatException ex) { throw new IllegalArgumentException(" + Java.str("Invalid number for " + f.label + ".") + "); }",
          "if (!" + validName(f) + "(" + v + ")) throw new IllegalArgumentException(" + Java.str(rangeMessage(f)) + ");");
      }
    }
    method("Checks one file record without changing the current list.", "private " + R + " parseFileRecord(String[] parts)", [
      "if (parts.length != " + m.fields.length + ") throw new IllegalArgumentException(" + Java.str("Expected " + m.fields.length + " fields.") + ");",
      ...parseFields, "return " + fullCall(m.fields.map((_, i) => "value" + i)) + ";"
    ]);
    method(m.manual ? "Load button: replaces the list with the records stored in " + m.file + "."
      : "Reads " + m.file + " at startup. A missing file means an empty list.", "private boolean loadFromFile()", [
      "File file = new File(DATA_FILE);",
      ...(m.manual ? [] : ["if (!file.exists()) return true;   // no file yet: start with an empty list"]),
      "ArrayList<" + R + "> loaded = new ArrayList<>();",
      "HashSet<String> keys = new HashSet<>();",
      "int lineNumber = 0;",
      ...(m.fileHeader ? ["boolean headerRead = false;"] : []),
      "try (Scanner input = new Scanner(file, \"UTF-8\")) {", "    while (input.hasNextLine()) {",
      "        lineNumber++;", "        String line = input.nextLine();",
      "        if (lineNumber == 1 && !line.isEmpty() && line.charAt(0) == 0xfeff) line = line.substring(1);",
      "        if (line.isBlank() && !line.contains(" + Java.str(m.delimiter) + ")) continue;",
      "        String[] parts = splitFileLine(line);",
      ...(m.fileHeader ? ["        if (!headerRead) {",
        "            if (!String.join(" + Java.str(m.delimiter) + ", parts).equals(" + Java.str(m.fileHeaderLine) + "))",
        "                throw new IllegalArgumentException(" + Java.str("Expected header: " + m.fileHeaderLine) + ");",
        "            headerRead = true;", "            continue;", "        }"] : []),
      "        " + R + " entry = parseFileRecord(parts);",
      "        if (!keys.add(" + keyText("entry") + ")) throw new IllegalArgumentException(" + Java.str("Duplicate " + keyLabel + ": ") + " + " + keyText("entry") + ");",
      "        loaded.add(entry);", "    }",
      "    if (input.ioException() != null) throw input.ioException();",
      ...(m.fileHeader ? ['    if (!headerRead) throw new IllegalArgumentException("Header row is missing.");'] : []),
      "} catch (IOException | IllegalArgumentException ex) {",
      "    fileReadFailed = true;",
      "    showError(" + Java.str("Unable to load " + m.noun + " records from " + m.file + ". Line ") + " + Math.max(1, lineNumber) + \": \" + ex.getMessage());",
      "    return false;", "}",
      list + ".clear();", list + ".addAll(loaded);", "fileReadFailed = false;",
      "showMessage(" + Java.message(m.loadedMessage, fileValues) + ");", "return true;"
    ]);
    method("Writes every record to " + m.file + " (UTF-8), one line each, replacing the old content.", "private boolean saveToFile()", [
      'if (fileReadFailed) { showError("Correct the data file and load it successfully before saving."); return false; }',
      "try (PrintWriter output = new PrintWriter(new File(DATA_FILE), \"UTF-8\")) {",
      ...(m.fileHeader ? ["    output.println(" + Java.str(m.fileHeaderLine) + ");"] : []),
      "    for (" + R + " " + r + " : " + list + ") {", "        output.println(" + lineOf(r) + ");", "    }",
      "    return true;",
      "} catch (IOException ex) {",
      "    showError(" + Java.str("Unable to save " + m.noun + " records to " + m.file + ".") + ");", "    return false;",
      "}"
    ]);

    const code = "/** " + Java.comment(m.title) + ": add, edit, delete, search and save " + m.noun + " records. */\n" +
      "public class " + m.app + " extends Application {\n" + Java.indent(fl.join("\n"), 4) +
      "\n\n    @Override\n    public void start(Stage stage) {\n" + Java.indent(st.join("\n"), 8) + "\n    }\n" +
      Java.indent(md.join("\n"), 4) + "\n\n    public static void main(String[] args) {\n        launch(args);\n    }\n}\n";
    return javaUnit(m.app, "class", imports, code, { main: true });
  }
};

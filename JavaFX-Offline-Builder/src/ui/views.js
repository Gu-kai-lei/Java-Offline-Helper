/* All views except the block workbench. Each view renders into the main area. */
"use strict";

const clone = value => JSON.parse(JSON.stringify(value));
const yesno = [["yes", "是"], ["no", "否"]];
const endpointOptions = [["no", "包含"], ["yes", "不包含"]];
const handlerStyles = [["lambda", "Lambda：e -> ..."], ["anonymous", "匿名内部类 new EventHandler<...>()"]];

// ---------- generic generator view ----------
function generatorView(spec) {
  return {
    id: spec.id, title: spec.title,
    render(main) {
      let model = Store.get("draft." + spec.id, null) || clone(spec.defaults());
      const holder = {};
      const formBox = h("div", { class: "form-box" });
      const previewBox = h("div", { class: "preview-box" });
      const output = OutputPanel({ beforeExport: () => regenerate(false) });
      const presetSelect = selectEl([["", "载入范例…"], ...spec.presets().map(p => [p.id, p.title])], "");
      presetSelect.addEventListener("change", () => {
        const p = spec.presets().find(x => x.id === presetSelect.value);
        presetSelect.value = "";
        if (!p || !confirm("用范例「" + p.title + "」替换当前设置？")) return;
        model = clone(p.model);
        holder.state = undefined; holder.texts = undefined;
        drawForm(); regenerate();
      });
      const resetBtn = h("button", { type: "button", class: "small", onclick: () => {
        if (!confirm("恢复默认设置？当前修改会丢失。")) return;
        model = clone(spec.defaults()); holder.state = undefined; holder.texts = undefined; drawForm(); regenerate();
      } }, "恢复默认");
      const regenerate = (rebuildPreview = true) => {
        Store.set("draft." + spec.id, model);
        try {
          output.show(spec.generate(model, Profile.value));
        } catch (e) {
          output.show(null, e.message);
        }
        if (spec.preview && rebuildPreview) {
          holder.rerender = () => setChildren(previewBox, spec.preview(model, holder));
          holder.state = undefined;
          setChildren(previewBox, spec.preview(model, holder));
        }
      };
      const lazy = debounce(regenerate, 250);
      const drawForm = () => Form.render(formBox, spec.schema, model, { onInput: lazy, onChange: regenerate });
      setChildren(main, h("div", { class: "gen-layout" + (spec.preview ? "" : " no-preview") },
        h("section", { class: "panel form-panel" },
          h("div", { class: "panel-head" }, h("h2", null, spec.title), h("div", { class: "actions" }, presetSelect, resetBtn)),
          spec.intro ? h("p", { class: "intro" }, spec.intro) : null, formBox),
        h("div", { class: "right-col" },
          spec.preview ? h("section", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", null, "窗口预览")), previewBox) : null,
          output.element)));
      drawForm();
      regenerate();
      Views.refresh = regenerate;
    }
  };
}

// ---------- schemas ----------
const OopSchema = [
  { type: "group", title: "① 类名、窗口标题与输出方式", fields: [
    { key: "appClass", label: "主类名（= 文件名）" },
    { key: "title", label: "窗口标题（{name} 会换成你的姓名）", wide: true },
    { key: "output", label: "输出方式", type: "select", wide: true, options: [["split", "每个类一个文件（BlueJ 推荐）"], ["single", "全部合并成一个文件"], ["main", "只输出主程序（题目已给 Shape 等类）"]] },
    { key: "useInterface", label: "使用接口（如 Drawable）", type: "yesno" },
    { key: "handlerStyle", label: "按钮 Handler 写法", type: "select", options: handlerStyles }
  ] },
  { type: "group", title: "② 图形子类与初始状态", fields: [
    { key: "shapes", type: "list", label: "图形子类", min: 1, itemLabel: row => row.className + "（" + (ShapeKinds[row.kind]?.label || "?") + "）",
      newRow: m => ({ kind: "rectangle", className: "MyRectangle" + (m.shapes.length + 1), size1: "120", size2: "70" }),
      row: [
        { key: "kind", label: "图形", type: "select", options: () => ShapeLib.ids.map(id => [id, ShapeKinds[id].label]) },
        { key: "className", label: "类名" },
        { key: "size1", label: (m, row) => (ShapeKinds[row.kind]?.dims[0].label || "尺寸") + " 默认值" },
        { key: "size2", label: (m, row) => (ShapeKinds[row.kind]?.dims[1]?.label || "") + " 默认值", when: (m, row) => (ShapeKinds[row.kind]?.dims.length || 0) > 1 },
        { key: "color", label: "这个图形的颜色（留空 = 新图形颜色）", type: "select", options: () => [["", "（用新图形颜色）"], ...Java.COLORS.map(c => [c, c])] }
      ] },
    { key: "numType", label: "面积、周长和尺寸的类型", type: "select", options: [["float", "float（A2 原题）"], ["double", "double"]] },
    { key: "anchor", label: "(x, y) 表示", type: "select", options: [["topLeft", "外框左上角（A2 原题效果）"], ["center", "图形中心"]] },
    { key: "startX", label: "初始 x" }, { key: "startY", label: "初始 y" },
    { key: "baseColor", label: "新图形颜色", type: "color" },
    { key: "step", label: "每次移动（像素）" }, { key: "resizeStep", label: "每次放大/缩小" },
    { key: "shrinkMin", label: "缩小后最小尺寸（留空 = 只要大于 0）" },
    { key: "rotateStep", label: "每次旋转（度）", when: m => m.buttons.some(b => b.action === "rotate") },
    { key: "startShape", label: "启动时先放一个图形", type: "select", options: m => [["", "否（先点 Add 按钮）"], ...m.shapes.map(x => [x.className, x.className])] }
  ] },
  { type: "group", title: "③ 按钮（顺序 = 界面上的顺序）", fields: [
    { key: "buttons", type: "list", label: "按钮", min: 1, itemLabel: (row, i) => (i + 1) + ". " + row.text,
      newRow: () => ({ text: "Move Left", action: "left", arg: "", region: "" }),
      row: [
        { key: "text", label: "按钮文字（照题目写）" },
        { key: "action", label: "点击后", type: "select", options: () => Object.entries(OopGen.actions) },
        { key: "arg", label: (m, row) => row.action === "color" ? "改成什么颜色" : "添加哪个类", type: "select", autoFix: true,
          when: (m, row) => row.action === "add" || row.action === "color" || row.action === "animReset",
          options: (m, row) => row.action === "color" ? Java.COLORS.map(c => [c, c]) : m.shapes.map(s => [s.className, s.className]) },
        { key: "region", label: "放在", type: "select", options: () => [["", "默认面板（见④）"], ...OopGen.regions] },
        { key: "done", label: "成功后状态 Label 显示（可空；可用 {x} {y} {angle} {area} {class}）", wide: true }
      ] },
    { key: "dataFile", label: "保存/读取用的数据文件名", when: m => m.buttons.some(b => b.action === "save" || b.action === "load") }
  ] },
  { type: "group", title: "④ 尺寸输入框（题目要求用 TextField 输入半径/边长时）", open: false, fields: [
    { key: "sizeInput", label: "Add 时从输入框读尺寸", type: "yesno" },
    { key: "inputRegion", label: "输入框放在", type: "select", options: () => OopGen.regions, when: m => m.sizeInput === "yes" },
    { key: "inputLabels", label: "输入框前的文字（多个用逗号分隔，如 Width:,Height:）", wide: true, when: m => m.sizeInput === "yes" },
    { key: "inputDefaults", label: "输入框初始值（逗号分隔，可空）", when: m => m.sizeInput === "yes" },
    { key: "inputMins", label: "尺寸下限（新增和缩放；一个值或逗号分隔）", when: m => m.sizeInput === "yes" },
    { key: "inputMaxs", label: "尺寸上限（新增和缩放；一个值或逗号分隔）", when: m => m.sizeInput === "yes" },
    { key: "inputMinOpen", label: "下限端点", type: "select", options: endpointOptions, when: m => m.sizeInput === "yes" },
    { key: "inputMaxOpen", label: "上限端点", type: "select", options: endpointOptions, when: m => m.sizeInput === "yes" },
    { key: "invalidMessage", label: "输入不是正数时显示", when: m => m.sizeInput === "yes" }
  ] },
  { type: "group", title: "状态 Label 与位置边界（没有图形、越界、按钮结果的提示）", open: false, fields: [
    { key: "statusLabel", label: "窗口里显示状态 Label", type: "yesno", help: "选「否」时这些提示打印在 BlueJ Terminal。" },
    { key: "statusInitial", label: "状态 Label 初始文字", when: m => m.statusLabel === "yes" },
    { key: "statusRegion", label: "状态 Label 放在", type: "select", options: () => [["", "自动（面板对面）"], ...OopGen.regions], when: m => m.statusLabel === "yes" },
    { key: "noShapeMessage", label: "没有图形时点按钮的提示", wide: true },
    { key: "boundMinX", label: "X 下限（留空 = 不限）" }, { key: "boundMaxX", label: "X 上限（留空 = 不限）" },
    { key: "boundMinY", label: "Y 下限（留空 = 不限）" }, { key: "boundMaxY", label: "Y 上限（留空 = 不限）" },
    { key: "boundMessage", label: "越界时提示（不移动）", wide: true },
    { key: "moveDone", label: "方向键 / 动画每次移动后的提示（可空，例 X: {x}）", wide: true }
  ] },
  { type: "group", title: "⑤ 面积/周长 Label", open: false, fields: [
    { key: "infoLabel", label: "窗口里显示面积/周长 Label", type: "yesno" },
    { key: "infoFormat", label: "Label 格式（{area} {perimeter} {class} 会被替换，保留 2 位小数）", wide: true, when: m => m.infoLabel === "yes" },
    { key: "infoEmpty", label: "没有图形时显示", when: m => m.infoLabel === "yes" },
    { key: "infoRegion", label: "Label 放在", type: "select", options: () => [["", "自动（面板对面）"], ...OopGen.regions], when: m => m.infoLabel === "yes" }
  ] },
  { type: "group", title: "键盘、鼠标、动画（Lecture 8 的事件用在图形上）", open: false, fields: [
    { key: "keyControl", label: "方向键移动当前图形", type: "select", options: [["no", "不需要"], ["arrows", "方向键调用对应的移动方法"]] },
    { key: "keyStep", label: "方向键每次移动（留空 = 与按钮相同）", when: m => m.keyControl === "arrows" },
    { key: "mouseControl", label: "鼠标操作当前图形", type: "select", options: [["no", "不需要"], ["click", "点击画布：图形移到鼠标位置"], ["drag", "在画布上拖动：图形跟着鼠标"],
      ["toggle", "点击图形：在新图形颜色和下面的颜色之间切换"]] },
    { key: "toggleColor", label: "点击切换到的颜色", type: "color", when: m => m.mouseControl === "toggle" },
    { key: "animMove", label: "动画每一步向哪边移动", type: "select", options: [["right", "右"], ["left", "左"], ["down", "下"], ["up", "上"]],
      when: m => m.buttons.some(b => b.action.startsWith("anim")) },
    { key: "animInterval", label: "动画间隔（毫秒）", when: m => m.buttons.some(b => b.action.startsWith("anim")) }
  ] },
  { type: "group", title: "⑥ 布局与行为", fields: [
    { key: "panel", label: "默认按钮面板位置", type: "select", options: () => OopGen.regions },
    { key: "spacing", label: "按钮间距" }, { key: "padding", label: "面板内边距" }, { key: "buttonWidth", label: "按钮宽度（0 = 自动）" },
    { key: "canvasW", label: "画布宽" }, { key: "canvasH", label: "画布高" }, { key: "canvasColor", label: "画布背景色", type: "color" },
    { key: "sceneW", label: "窗口宽（0 = 自动）" }, { key: "sceneH", label: "窗口高（0 = 自动）" },
    { key: "storage", label: "保存图形", type: "select", options: [["single", "只保留当前一个（Add 替换旧图形）"], ["list", "ArrayList 保存全部"]] },
    { key: "colorForNext", label: "换色也影响之后添加的图形", type: "yesno" },
    { key: "printConsole", label: "添加时在控制台打印面积周长", type: "yesno" },
    { key: "clip", label: "图形超出画布时裁掉", type: "yesno" },
    { key: "newStyle", label: "创建图形用", type: "select", options: [["noarg", "无参构造器 new X()"], ["args", "带尺寸的构造器 new X(50f)"]] }
  ] },
  { type: "group", title: "⑦ 高级：照题目改接口/类/方法/字段名（留空 = 题目没有这个方法）", open: false,
    fields: OopGen.nameFields.map(([key, label]) => ({ key: "names." + key, label })) },
  { type: "group", title: "文字替换：把生成程序里的某句英文换成题目要求的文字", open: false, fields: [
    { key: "replacements", type: "list", label: "替换", itemLabel: row => (row.from || "?") + " → " + (row.to || ""),
      newRow: () => ({ from: "", to: "" }),
      row: [{ key: "from", label: "原文（从右侧代码里复制引号内的文字）", wide: true }, { key: "to", label: "换成", wide: true }] }
  ] }
];

const RecordSchema = [
  { type: "group", title: "① 类名、窗口与文件", fields: [
    { key: "appClass", label: "主类名" }, { key: "recordClass", label: "记录类名（如 Book）" },
    { key: "title", label: "窗口标题 / Alert 标题", wide: true }, { key: "file", label: "数据文件名" },
    { key: "fileDelimiter", label: "数据文件分隔符", type: "select", options: RecordFormat.delimiters },
    { key: "fileHeader", label: "文件首行写字段名", type: "select", options: [["no", "否"], ["yes", "是"]],
      help: m => "启用时使用字段名作为表头，顺序与②一致：" + m.fields.map(f => f.name).join(" / ") },
    { key: "output", label: "输出方式", type: "select", wide: true, options: [["split", "每个类一个文件"], ["single", "合并成一个文件"],
      ["main", "只输出主程序（题目已给记录类，如 Book.java）"]] },
    { key: "ctorUse", label: "题目给的类的构造器参数", type: "select", when: m => m.output === "main",
      options: [["form", "只有表单字段（其余字段用 setter）"], ["all", "全部字段"]] },
    { key: "display", label: "记录显示在", type: "select", options: [["list", "ListView（点一行选中）"], ["textarea", "TextArea（按输入的主键操作）"]] },
    { key: "pick", label: "Delete / 状态 / 数值按钮操作哪条记录", type: "select", wide: true, when: m => m.display !== "textarea",
      options: [["selected", "选中的行（Lab 3 原题：没选中时借还按钮停用）"], ["either", "选中的行；没选中时按输入框里的主键查找"]] },
    { key: "displayFormat", label: "每条记录的显示格式（留空 = toString；例 {code} | Qty: {quantity} | ${price:.2f}；题目给的类还可以写 {getGrade()}）", wide: true,
      help: "boolean 字段可以显示成文字：{available|Available|Not available}。" },
    { key: "handlerStyle", label: "Handler 写法", type: "select", options: handlerStyles },
    { key: "noun", label: "提示里的名词（留空 = 类名小写）" }
  ] },
  { type: "group", title: "② 字段（顺序 = 文件中每行的列顺序）", fields: [
    { key: "fields", type: "list", label: "字段", min: 1, itemLabel: row => row.label + "（" + row.type + " " + row.name + "）",
      newRow: () => ({ name: "price", type: "double", label: "Price", getter: "getPrice", inForm: "yes", key: "no", search: "no", sort: "yes", initial: "0" }),
      row: [
        { key: "name", label: "字段名" }, { key: "type", label: "类型", type: "select", options: () => RecordGen.types.map(t => [t, t]) },
        { key: "label", label: "显示名（界面/提示用）" }, { key: "getter", label: "getter 名（setter 自动对应）" },
        { key: "inForm", label: "表单里有输入框", type: "yesno" }, { key: "key", label: "主键（查重/查找）", type: "yesno" },
        { key: "search", label: "可搜索", type: "yesno" }, { key: "sort", label: "有排序按钮", type: "yesno" },
        { key: "initial", label: "新记录初始值（不在表单的字段）", when: (m, row) => row.inForm !== "yes" },
        { key: "min", label: "字段下限（新增／修改／读档／按钮）", when: (m, row) => ["int","double"].includes(row.type) },
        { key: "max", label: "字段上限（新增／修改／读档／按钮）", when: (m, row) => ["int","double"].includes(row.type) },
        { key: "minOpen", label: "下限端点", type: "select", options: endpointOptions, when: (m,row) => ["int","double"].includes(row.type) },
        { key: "maxOpen", label: "上限端点", type: "select", options: endpointOptions, when: (m,row) => ["int","double"].includes(row.type) }
      ] }
  ] },
  { type: "group", title: "③ 功能按钮（先选要不要，再把按钮上的字改成题目的写法）", fields: [
    { key: "fAdd", label: "Add", type: "yesno" }, { key: "tAdd", label: "↳ 按钮文字", when: m => m.fAdd === "yes" },
    { key: "fEdit", label: "Edit + Save（编辑模式）", type: "yesno" },
    { key: "tEdit", label: "↳ Edit 按钮文字", when: m => m.fEdit === "yes" }, { key: "tSave", label: "↳ Save 按钮文字", when: m => m.fEdit === "yes" },
    { key: "fDelete", label: "Delete", type: "yesno" }, { key: "tDelete", label: "↳ 按钮文字", when: m => m.fDelete === "yes" },
    { key: "fSearch", label: "Search（部分匹配）", type: "yesno" }, { key: "tSearch", label: "↳ 按钮文字", when: m => m.fSearch === "yes" },
    { key: "searchMode", label: "填了多个搜索框时", type: "select", when: m => m.fSearch === "yes",
      options: [["any", "任一条件成立（OR）"], ["all", "所有条件成立（AND）"]], help: "空白搜索框不参与匹配。" },
    { key: "fDisplay", label: "Display All", type: "yesno" }, { key: "tDisplay", label: "↳ 按钮文字", when: m => m.fDisplay === "yes" },
    { key: "fLoadTest", label: "Load Test Data", type: "yesno" }, { key: "tLoadTest", label: "↳ 按钮文字", when: m => m.fLoadTest === "yes" },
    { key: "fClear", label: "Clear", type: "yesno" }, { key: "tClear", label: "↳ 按钮文字", when: m => m.fClear === "yes" },
    { key: "clearAll", label: "↳ Clear 同时清空内存里的全部记录（不写文件）", type: "yesno", when: m => m.fClear === "yes" },
    { key: "fExit", label: "Exit", type: "yesno" }, { key: "tExit", label: "↳ 按钮文字", when: m => m.fExit === "yes" },
    { key: "fSort", label: "排序按钮", type: "yesno" },
    { key: "saveMode", label: "什么时候读写文件", type: "select", wide: true,
      options: [["auto", "自动：启动时读，每次改动后写（Lab 3 原题）"], ["manual", "手动：只有点 Save / Load 按钮才读写"]] },
    { key: "tSaveFile", label: "↳ 保存按钮文字", when: m => m.saveMode === "manual" }, { key: "tLoadFile", label: "↳ 读取按钮文字", when: m => m.saveMode === "manual" },
    { key: "loadOnStart", label: "↳ 启动时也读一次文件（文件不存在就从空列表开始）", type: "yesno", when: m => m.saveMode === "manual" },
    { key: "fLoadFile", label: "↳ 要读取按钮", type: "yesno", when: m => m.saveMode === "manual" },
    { key: "savedMessage", label: "↳ 保存后的提示（{count} {file}）", wide: true, when: m => m.saveMode === "manual" },
    { key: "loadedMessage", label: "读取后的提示（{count} = 条数，{file} = 文件名）", wide: true },
    { key: "countLabel", label: "总数 Label（留空 = 没有；例 Total contacts: {count}）", wide: true },
    { key: "fStats", label: "统计按钮（数量/平均/最高/最低）", type: "yesno" },
    { key: "statsField", label: "统计哪个数字字段", type: "select", when: m => m.fStats === "yes",
      options: m => m.fields.filter(f => f.type === "int" || f.type === "double").map(f => [f.name, f.label]) },
    { key: "statsText", label: "统计按钮文字", when: m => m.fStats === "yes" },
    { key: "statsFormat", label: "统计结果格式（可用 {count} {total} {average} {highest} {lowest}）", wide: true, when: m => m.fStats === "yes" }
  ] },
  { type: "group", title: "④' 数值按钮（如 Sell 减 1、Restock 加 10，改 int/double 字段）", open: false, fields: [
    { key: "adjusts", type: "list", label: "数值按钮", itemLabel: row => row.text,
      newRow: m => ({ text: "Add One", field: m.fields.find(f => f.type === "int" || f.type === "double")?.name || "", delta: "1", min: "", max: "", error: "Out of range.", done: "Updated." }),
      row: [
        { key: "text", label: "按钮文字" },
        { key: "field", label: "改哪个数字字段", type: "select", options: m => m.fields.filter(f => f.type === "int" || f.type === "double").map(f => [f.name, f.label]) },
        { key: "delta", label: "变化量（负数 = 减少）" }, { key: "min", label: "下限（可空）" }, { key: "max", label: "上限（可空）" },
        { key: "error", label: "超出范围时的错误提示", wide: true }, { key: "done", label: "成功提示", wide: true }
      ] }
  ] },
  { type: "group", title: "④ 状态按钮（如 Borrow / Return，改 boolean 字段）", fields: [
    { key: "toggles", type: "list", label: "状态按钮", itemLabel: row => row.text,
      newRow: m => ({ text: "Toggle", field: m.fields.find(f => f.type === "boolean")?.name || "", value: "true", already: "Already done.", done: "Done." }),
      row: [
        { key: "text", label: "按钮文字" },
        { key: "field", label: "改哪个 boolean 字段", type: "select", options: m => m.fields.filter(f => f.type === "boolean").map(f => [f.name, f.label]) },
        { key: "value", label: "改成", type: "select", options: [["true", "true"], ["false", "false"]] },
        { key: "already", label: "已经是该状态时的错误提示", wide: true }, { key: "done", label: "成功提示", wide: true }
      ] }
  ] },
  { type: "group", title: "筛选按钮（只显示数字满足条件的记录，如 Pass List：mark >= 50）", open: false, fields: [
    { key: "filters", type: "list", label: "筛选按钮", itemLabel: row => row.text,
      newRow: m => ({ text: "Pass List", field: m.fields.find(f => f.type === "int" || f.type === "double")?.name || "", op: ">=", value: "50" }),
      row: [
        { key: "text", label: "按钮文字" },
        { key: "field", label: "看哪个数字字段", type: "select", autoFix: true, options: m => m.fields.filter(f => f.type === "int" || f.type === "double").map(f => [f.name, f.label]) },
        { key: "op", label: "条件", type: "select", options: [[">=", ">= 至少"], [">", "> 大于"], ["<=", "<= 至多"], ["<", "< 小于"], ["==", "== 等于"]] },
        { key: "value", label: "比较值" }
      ] }
  ] },
  { type: "group", title: "提示文字（主键重复、找不到记录；留空 = Lab 3 原题写法）", open: false, fields: [
    { key: "dupMessage", label: "主键重复时（{key} = 输入的主键）", wide: true, placeholder: "Duplicate ISBN: {key} already exists." },
    { key: "notFoundMessage", label: "找不到记录时（{key} = 输入的主键）", wide: true, placeholder: "Book with ISBN {key} cannot be found." }
  ] },
  { type: "group", title: "文字替换：把生成程序里的某句英文换成题目要求的文字", open: false, fields: [
    { key: "replacements", type: "list", label: "替换", itemLabel: row => (row.from || "?") + " → " + (row.to || ""),
      newRow: () => ({ from: "", to: "" }),
      row: [{ key: "from", label: "原文（从右侧代码里复制引号内的文字）", wide: true }, { key: "to", label: "换成", wide: true }] }
  ] },
  { type: "group", title: "⑤ 测试数据与顶部信息", fields: [
    { key: "testData", label: "测试数据（每行一条，使用①所选分隔符）", type: "textarea", rows: 4,
      help: "列顺序与②一致。字段包含分隔符时用双引号包住，字段里的双引号写成两个。启用表头时可粘贴带表头的数据。" },
    { key: "seedOnStart", label: "启动时没有记录就放入上面的测试数据（题目给的初始记录）", type: "yesno" },
    { key: "header", label: "顶部显示学生信息", type: "yesno" },
    { key: "headerLines", label: "学生信息行（每行一个 Label；{name} {id} 自动替换）", type: "textarea", rows: 2, when: m => m.header === "yes" },
    { key: "showStart", label: "显示程序启动时间", type: "yesno", when: m => m.header === "yes" },
    { key: "sceneW", label: "窗口宽" }, { key: "sceneH", label: "窗口高" }
  ] }
];

const CalcSchema = [
  { type: "group", title: "① 基本", fields: [
    { key: "appClass", label: "主类名" }, { key: "modelClass", label: "模型类名（留空 = 不单独写类）" },
    { key: "title", label: "窗口标题", wide: true }, { key: "buttonText", label: "计算按钮文字" },
    { key: "output", label: "输出方式", type: "select", options: [["single", "一个文件"], ["split", "模型类单独一个文件"]], when: m => String(m.modelClass || "").trim() },
    { key: "clearButton", label: "Clear 按钮", type: "yesno" },
    { key: "errorMode", label: "输入错误时", type: "select", options: [["alert", "弹出 Alert"], ["label", "结果显示 Invalid input"]] },
    { key: "handlerStyle", label: "Handler 写法", type: "select", options: handlerStyles },
    { key: "labelWidth", label: "标签宽度" }, { key: "sceneW", label: "窗口宽" }, { key: "sceneH", label: "窗口高" }
  ] },
  { type: "group", title: "② 输入框", fields: [
    { key: "inputs", type: "list", label: "输入", min: 1, itemLabel: row => row.label,
      newRow: () => ({ label: "Value:", name: "value", type: "double", def: "1", positive: "no" }),
      row: [
        { key: "label", label: "标签文字" }, { key: "name", label: "变量名" },
        { key: "type", label: "类型", type: "select", options: [["double", "double"], ["int", "int"]] },
        { key: "def", label: "默认值（可空）" }, { key: "positive", label: "必须大于 0", type: "yesno" },
        { key: "min", label: "下限（留空不限）" }, { key: "max", label: "上限（留空不限）" },
        { key: "minOpen", label: "下限端点", type: "select", options: endpointOptions },
        { key: "maxOpen", label: "上限端点", type: "select", options: endpointOptions }
      ] }
  ] },
  { type: "group", title: "③ 结果（按顺序计算；表达式可用输入变量、前面的结果和 Math.xxx）", fields: [
    { key: "outputs", type: "list", label: "结果", min: 1, itemLabel: row => row.label,
      newRow: () => ({ label: "Result:", name: "result", expr: "value * 2", show: "yes", decimals: "2" }),
      row: [
        { key: "label", label: "标签文字" }, { key: "name", label: "变量名" },
        { key: "expr", label: "Java 表达式", wide: true }, { key: "show", label: "显示在窗口", type: "yesno" }, { key: "decimals", label: "小数位" },
        { key: "zeroWhen", label: "零值情况：检查哪个变量（可空）" },
        { key: "zeroExpr", label: "该变量为 0 时改用的算式（可空）", wide: true }
      ] }
  ] },
  { type: "group", title: "④ 文字结果（按数值范围显示不同的字，如 BMI 分类、成绩等级）", open: false, fields: [
    { key: "texts", type: "list", label: "文字结果", itemLabel: row => row.label,
      newRow: m => ({ label: "Category:", name: "category", source: m.outputs[m.outputs.length - 1]?.name || "", ranges: "18.5:Underweight, 25:Normal, 30:Overweight, Obese" }),
      row: [
        { key: "label", label: "标签文字" }, { key: "name", label: "变量名" },
        { key: "source", label: "按哪个数判断", type: "select", autoFix: true, options: m => [...m.inputs, ...m.outputs].map(x => [x.name, x.name]) },
        { key: "ranges", label: "范围：小于上限:文字，逗号分隔，最后一段是其他情况", wide: true }
      ] }
  ] }
];

const paintOptions = () => [["DEFAULT", "默认（不设置）"], ["NONE", "无（null）"], ...Java.COLORS.map(c => [c, c])];
const DrawSchema = [
  { type: "group", title: "① 窗口", fields: [
    { key: "appClass", label: "主类名" }, { key: "title", label: "窗口标题", wide: true },
    { key: "width", label: "窗口宽" }, { key: "height", label: "窗口高" }, { key: "background", label: "背景色", type: "color" },
    { key: "rootType", label: "图形放在", type: "select", options: [["pane", "Pane"], ["group", "Group"], ["custom", "自定义类 extends Pane（OOP）"]] },
    { key: "paneClass", label: "自定义 Pane 类名", when: m => m.rootType === "custom" },
    { key: "output", label: "输出方式", type: "select", options: [["single", "一个文件"], ["split", "自定义 Pane 单独一个文件"]], when: m => m.rootType === "custom" }
  ] },
  { type: "group", title: "② 图形（列表后面的画在上层）", fields: [
    { key: "nodes", type: "list", label: "图形", itemLabel: row => row.name + "（" + (DrawGen.types[row.type]?.label || row.type) + "）",
      newRow: m => DrawGen.node("circle", "shape" + (m.nodes.length + 1)),
      row: [
        { key: "type", label: "类型", type: "select", options: () => Object.entries(DrawGen.types).map(([k, t]) => [k, t.label]) },
        { key: "name", label: "变量名" },
        ...["centerX", "centerY", "radius", "x", "y", "width", "height", "arcWidth", "arcHeight", "radiusX", "radiusY", "startX", "startY", "endX", "endY", "startAngle", "length"]
          .map(p => ({ key: p, label: DrawGen.propLabels[p], when: (m, row) => DrawGen.types[row.type]?.props.includes(p) })),
        { key: "arcType", label: "Arc 类型", type: "select", options: [["OPEN", "OPEN"], ["CHORD", "CHORD"], ["ROUND", "ROUND"]], when: (m, row) => row.type === "arc" },
        { key: "points", label: "点（x,y 成对，空格分隔）", wide: true, when: (m, row) => row.type === "polygon" || row.type === "polyline" },
        { key: "text", label: "文字（\\n 换行）", wide: true, when: (m, row) => row.type === "text" },
        { key: "fontFamily", label: "字体", when: (m, row) => row.type === "text" },
        { key: "fontSize", label: "字号", when: (m, row) => row.type === "text" },
        { key: "fontWeight", label: "粗细", type: "select", when: (m, row) => row.type === "text",
          options: ["THIN", "EXTRA_LIGHT", "LIGHT", "NORMAL", "MEDIUM", "SEMI_BOLD", "BOLD", "EXTRA_BOLD", "BLACK"].map(w => [w, w]) },
        { key: "fontPosture", label: "姿态", type: "select", options: [["REGULAR", "REGULAR"], ["ITALIC", "ITALIC"]], when: (m, row) => row.type === "text" },
        { key: "underline", label: "下划线", type: "yesno", when: (m, row) => row.type === "text" },
        { key: "strikethrough", label: "删除线", type: "yesno", when: (m, row) => row.type === "text" },
        { key: "fill", label: "填充 setFill", type: "select", options: paintOptions },
        { key: "stroke", label: "边框 setStroke", type: "select", options: paintOptions },
        { key: "strokeWidth", label: "线宽" }, { key: "rotate", label: "旋转（正 = 顺时针）" }
      ] }
  ] }
];

// ---------- skeleton completion ----------
const A2_SAMPLE = [
  "import javafx.scene.layout.Pane;\n\npublic interface Drawable {\n    // Upgraded to use JavaFX's layout container\n    void draw(Pane canvasPane);\n}\n",
  "import javafx.scene.layout.Pane;\nimport javafx.scene.paint.Color;\n\npublic abstract class Shape implements Drawable {\n    protected float area;\n    protected float perimeter;\n\n    // New fields to support coordinates and dynamic styling\n    protected double x = 50;\n    protected double y = 50;\n    protected Color shapeColor = Color.GREEN;\n\n    public abstract void readShape();\n    public abstract void computeArea();\n    public abstract void computePerimeter();\n    public abstract void displayShape();\n\n    // Setters to allow the UI controls to interact with the object state\n    public void setColor(Color color) {\n        this.shapeColor = color;\n    }\n\n    public void moveUp() {\n        this.y -= 15;\n    }\n\n    public void moveDown() {\n        this.y += 15;\n    }\n}\n",
  "//Student Name & ID: xxxxxx\nimport javafx.scene.layout.Pane;\nimport javafx.scene.shape.Circle;\n\npublic class JavaFXCircle extends Shape {\n    private float radius;\n\n    public JavaFXCircle() {\n        // Initialize default field value\n    }\n    public JavaFXCircle(float r) {\n        // Initialize constructor parameter with parent context metrics\n    }\n\n    @Override\n    public void readShape() {\n        //  Default initialized radius\n    }\n\n    @Override\n    public void computeArea() {\n        // Implement mathematical formula for circle area calculation\n    }\n\n    @Override\n    public void computePerimeter() {\n        // Implement mathematical formula for circle perimeter calculation\n    }\n\n    @Override\n    public void displayShape() {\n        // Print the calculated area and perimeter results to the console window\n    }\n\n    @Override\n    public void draw(Pane canvasPane) {\n        // Render the circle dynamically onto the JavaFX Pane container\n    }\n}\n"
];

const SkeletonView = {
  id: "skeleton", title: "骨架补全（题目给了 .java）",
  render(main) {
    const saved = Store.get("draft.skeleton", null);
    const state = saved || { sources: [""], anchor: "topLeft", step: "15", resize: "10", sizes: { radius: "50", width: "120", height: "70", side: "80", radiusX: "70", radiusY: "40", base: "100" } };
    let suggestions = [], parsed = [];
    state.edits = state.edits || {};   // hand edits and templates, kept in the draft
    const editors = h("div", { class: "src-list" });
    const results = h("div", { class: "suggestions" });
    const output = OutputPanel({ title: "补全后的文件" });
    const summary = h("div", { class: "status" });
    const nextBtn = h("button", { type: "button", class: "primary", onclick: () => {
      const model = Skeleton.toOopModel(parsed);
      if (!model) return;
      Store.set("draft.oop", model);
      App.go("oop");
    } }, "→ 用这些类生成主程序（Shape 程序，只输出主程序）");
    const recordBtn = h("button", { type: "button", class: "primary", onclick: () => {
      const model = Skeleton.toRecordModel(parsed);
      if (!model) return;
      Store.set("draft.record", model);
      App.go("record");
    } }, "→ 用这个记录类生成管理程序（记录 + 文件，只输出主程序）");
    const save = () => Store.set("draft.skeleton", state);

    const analyse = () => {
      save();
      parsed = [];
      const errors = [];
      state.sources.forEach((src, i) => {
        if (!src.trim()) return;
        try { parsed.push(Skeleton.parse(src, "文件 " + (i + 1))); } catch (e) { errors.push(e.message); }
      });
      const options = { anchor: state.anchor, step: Number(state.step) || 15, resize: Number(state.resize) || 10,
        sizes: Object.fromEntries(Object.entries(state.sizes).map(([k, v]) => [k, Number(v) || undefined])) };
      suggestions = parsed.length ? Skeleton.suggest(parsed, options) : [];
      for (const s of suggestions) if (state.edits[s.id]) Object.assign(s, state.edits[s.id]);
      renderSuggestions();
      const types = parsed.flatMap(p => p.types.map(t => t.kind + " " + t.name));
      setChildren(summary, 
        ...errors.map(e => h("p", { class: "error" }, "⚠ " + e)),
        h("p", null, parsed.length ? "识别到：" + (types.join("、") || "没有类") : "先在左边粘贴题目给的 Java 代码（每个文件一个框）。"),
        suggestions.length ? h("p", { class: suggestions.some(s => s.status !== "auto") ? "warn" : "ok" },
          suggestions.length + " 个空方法：" + suggestions.filter(s => s.status === "auto").length + " 个已自动补全，" +
          suggestions.filter(s => s.status !== "auto").length + " 个需要你检查或手写（标黄）。") : null);
      nextBtn.hidden = !Skeleton.toOopModel(parsed);
      recordBtn.hidden = !nextBtn.hidden || !Skeleton.toRecordModel(parsed);
      refreshOutput();
    };
    const refreshOutput = () => {
      if (!parsed.length) { output.show(null, "还没有可补全的代码。"); return; }
      try {
        const files = parsed.map((p, i) => {
          const name = (p.types.find(t => t.isPublic) || p.types[0])?.name || "Unknown" + (i + 1);
          return { filename: name + ".java", code: Skeleton.apply(p, i, suggestions, Profile.value), kind: "class" };
        });
        const warnings = suggestions.filter(s => s.use && s.status !== "auto").map(s => s.type + "." + s.signature + "：" + s.note);
        const oopModel = Skeleton.toOopModel(parsed);
        if (state.withMain && oopModel && !files.some(f => /extends\s+Application\b/.test(f.code))) {
          // Use the Shape page settings when they were made for these classes, otherwise the detected defaults.
          const draft = Store.get("draft.oop", null);
          const model = draft && draft.output === "main" && draft.names?.base === oopModel.names.base ? draft : oopModel;
          const app = OopGen.generate(model, Profile.value);
          files.push(...app.files);
          warnings.push("已附带主程序 " + app.main + ".java（按钮、颜色、布局在「Shape 程序」页修改，那里的设置会自动用到这里）。");
        }
        const main = files.find(f => /extends\s+Application\b/.test(f.code))?.filename.replace(/\.java$/, "") || files[0].filename.replace(/\.java$/, "");
        if (!Profile.complete()) warnings.unshift("还没有填写考生信息，文件头注释会显示占位文字。");
        output.show({ files, main, warnings, project: main === files[0].filename.replace(/\.java$/, "") ? "CompletedProject" : main });
      } catch (e) { output.show(null, e.message); }
    };
    const renderSuggestions = () => {
      setChildren(results, ...suggestions.map(s => {
        const area = h("textarea", { rows: Math.min(10, s.body.split("\n").length + 1), spellcheck: "false" });
        area.value = s.body;
        area.addEventListener("input", () => { s.body = area.value; state.edits[s.id] = { body: s.body, use: s.use }; save(); refreshLazy(); });
        const use = h("input", { type: "checkbox", checked: s.use });
        use.addEventListener("change", () => { s.use = use.checked; state.edits[s.id] = { body: s.body, use: s.use }; save(); refreshOutput(); });
        // A String method (toString, getInfo...) can be written from a template instead of Java.
        let templateRow = null;
        if (s.returnType === "String" && s.fields.length) {
          const templateInput = h("input", { type: "text", spellcheck: "false", value: state.edits[s.id]?.template || "",
            placeholder: s.fields.map(f => "{" + f + "}").join(" | ") });
          const templateNote = h("small");
          templateInput.addEventListener("input", () => {
            if (!templateInput.value.trim()) { templateNote.textContent = ""; return; }
            try {
              s.body = Skeleton.templateBody(templateInput.value, s.fields, s.fieldTypes);
              area.value = s.body;
              s.status = "auto";
              state.edits[s.id] = { body: s.body, use: s.use, template: templateInput.value, status: "auto" };
              save();
              templateNote.textContent = "✓ 已按模板生成";
              refreshLazy();
            } catch (e) { templateNote.textContent = "⚠ " + e.message; }
          });
          templateRow = h("label", { class: "field" }, h("span", null, "按格式模板生成（照题目示例写，字段用 {字段名}，例如 " +
            s.fields.slice(0, 3).map(f => "{" + f + "}").join(" | ") + "）"), templateInput, templateNote);
        }
        return h("div", { class: "suggestion " + (s.status === "auto" ? "auto" : "todo") },
          h("div", { class: "row-title" }, h("strong", null, s.type + "." + s.signature),
            h("label", { class: "inline" }, use, " 填入")),
          h("p", { class: "note" }, (s.status === "auto" ? "✓ " : "✎ ") + s.note), templateRow, area);
      }));
    };
    const refreshLazy = debounce(refreshOutput, 250);
    const analyseLazy = debounce(analyse, 400);
    const drawEditors = () => {
      setChildren(editors, ...state.sources.map((src, i) => {
        const area = h("textarea", { class: "src", rows: 12, spellcheck: "false", wrap: "off", placeholder: "粘贴第 " + (i + 1) + " 个 .java 文件的全部内容" });
        area.value = src;
        area.addEventListener("input", () => { state.sources[i] = area.value; state.edits = {}; analyseLazy(); });
        return h("div", { class: "src-item" }, h("div", { class: "row-title" }, h("strong", null, "文件 " + (i + 1)),
          h("button", { type: "button", class: "icon danger", title: "删除这个文件", disabled: state.sources.length < 2,
            onclick: () => { state.sources.splice(i, 1); state.edits = {}; drawEditors(); analyse(); } }, "×")), area);
      }));
    };
    const option = (key, label, opts) => {
      const control = opts ? selectEl(opts, state[key]) : h("input", { type: "text", value: state[key] });
      control.addEventListener(opts ? "change" : "input", () => { state[key] = control.value; state.edits = {}; analyseLazy(); });
      return h("label", { class: "field" }, h("span", null, label), control);
    };
    const withMain = h("input", { type: "checkbox", checked: Boolean(state.withMain) });
    withMain.addEventListener("change", () => { state.withMain = withMain.checked; save(); refreshOutput(); });
    const sizeFields = Object.keys(state.sizes).map(k => {
      const input = h("input", { type: "text", value: state.sizes[k] });
      input.addEventListener("input", () => { state.sizes[k] = input.value; state.edits = {}; analyseLazy(); });
      return h("label", { class: "field" }, h("span", null, k + " 默认值"), input);
    });
    setChildren(main, h("div", { class: "gen-layout" },
      h("section", { class: "panel form-panel" },
        h("div", { class: "panel-head" }, h("h2", null, "① 粘贴题目给的 Java 文件"), h("div", { class: "actions" },
          h("button", { type: "button", class: "small", onclick: () => { state.sources.push(""); drawEditors(); } }, "＋ 再加一个文件"),
          h("button", { type: "button", class: "small", onclick: () => {
            if (state.sources.some(s => s.trim()) && !confirm("用 A2 原题骨架替换当前内容？")) return;
            state.sources = [...A2_SAMPLE]; state.edits = {}; drawEditors(); analyse();
          } }, "载入 A2 原题骨架练习"))),
        h("p", { class: "intro" }, "考题给的 Drawable / Shape / JavaFXCircle 这类文件，每个文件粘贴到一个框里（也可以全部粘到一个框）。工具只往空方法里填代码，类名、方法头和原有代码一个字不改。"),
        editors,
        h("details", { class: "form-group", open: true }, h("summary", null, "补全选项"),
          h("div", { class: "form-grid" },
            option("anchor", "draw() 里 (x, y) 表示", [["topLeft", "外框左上角（A2 原题效果）"], ["center", "图形中心"]]),
            option("step", "move 方法每次移动"), option("resize", "放大/缩小步长"), ...sizeFields))),
      h("div", { class: "right-col" },
        h("section", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", null, "② 检查每个空方法的补全")), summary,
          h("div", { class: "actions" }, nextBtn, recordBtn, h("label", { class: "inline" }, withMain, " 输出里附带主程序（A2 型题目）")), results),
        output.element)));
    drawEditors();
    analyse();
    Views.refresh = analyse;
  }
};

// ---------- lecture examples ----------
const ExamplesView = {
  id: "examples", title: "讲义例程库",
  render(main) {
    const state = Store.get("draft.examples", { query: "", selected: "ControlCircle", className: "" });
    state.parameters ||= {};
    const list = h("div", { class: "example-list" });
    const detail = h("div", { class: "example-detail" });
    const paramsBox = h("div");
    const output = OutputPanel();
    const search = h("input", { type: "search", placeholder: "搜索：Enlarge、getSource、Arc、Timeline、consume…", value: state.query });
    const nameInput = h("input", { type: "text", placeholder: "类名（留空 = 原名）", value: state.className });
    // Filter by source: lecture programs (L7, L8) or the worked examples (A2, Lab 3, OOP).
    const groups = [...new Set(Examples.list.map(e => e.lecture))];
    const groupSelect = selectEl([["", "全部（" + Examples.list.length + "）"], ...groups.map(g => [g, g + "（" + Examples.list.filter(e => e.lecture === g).length + "）"])],
      state.group || "", { "aria-label": "例程分类" });
    const generate = () => {
      Store.set("draft.examples", state);
      try { output.show(Examples.build(state.selected, state.className.trim() || state.selected, Profile.value, state.parameters[state.selected])); }
      catch (e) { output.show(null, e.message); }
    };
    const renderParameters = (ex) => {
      const defaults = Examples.parameters(ex.id);
      if (!defaults) { setChildren(paramsBox); return; }
      const params = { ...defaults, ...state.parameters[ex.id] };
      state.parameters[ex.id] = params;
      const fields = [["title", "窗口标题"], ["button", "按钮文字"], ["width", "场景宽"], ["height", "场景高"]].map(([key, label]) => {
        const el = h("input", { type: "text", value: params[key] });
        el.addEventListener("input", () => { params[key] = el.value; generate(); });
        return h("label", { class: "field" }, h("span", null, label), el);
      });
      setChildren(paramsBox, h("h3", { class: "sub-title" }, "无需改代码的参数"), h("div", { class: "form-grid" }, fields));
    };
    const refresh = () => {
      Store.set("draft.examples", state);
      const found = Examples.search(state.query).filter(e => !state.group || e.lecture === state.group);
      setChildren(list, ...found.map(e => h("button", { type: "button", class: "example-item" + (e.id === state.selected ? " active" : ""),
        onclick: () => { state.selected = e.id; state.className = ""; nameInput.value = ""; refresh(); } },
        h("strong", null, e.id), h("span", null, e.lecture + " · " + e.title))));
      if (!found.length) list.append(h("p", { class: "muted" }, "没有匹配的例程。"));
      const ex = Examples.list.find(e => e.id === state.selected) || Examples.list[0];
      state.selected = ex.id;
      setChildren(detail, h("h3", null, ex.id + " — " + ex.title), h("p", null, ex.note));
      renderParameters(ex);
      generate();
    };
    search.addEventListener("input", () => { state.query = search.value; refresh(); });
    groupSelect.addEventListener("change", () => { state.group = groupSelect.value; refresh(); });
    nameInput.addEventListener("input", () => { state.className = nameInput.value; generate(); });
    setChildren(main, h("div", { class: "gen-layout" },
      h("section", { class: "panel form-panel" }, h("div", { class: "panel-head" }, h("h2", null, "例程库（" + Examples.list.length + " 个）")),
        h("p", { class: "intro" }, "L7 / L8 是课件程序；A2、Lab 3、OOP 是按 Test 2 知识点补的完整例题，可直接对照。入门窗口例程可以直接填写标题、文字和尺寸。"),
        h("div", { class: "add-row" }, groupSelect, search), list),
      h("div", { class: "right-col" }, h("section", { class: "panel" }, detail,
        h("label", { class: "field" }, h("span", null, "改成题目要求的类名"), nameInput), paramsBox), output.element)));
    refresh();
    Views.refresh = refresh;
  }
};

// ---------- exam-style practice questions ----------
const VariantsView = {
  id: "variants", title: "变体题练习",
  render(main) {
    const state = Store.get("draft.variants", { selected: Variants.items[0].id });
    const list = h("div", { class: "example-list variant-list" });
    const detail = h("section", { class: "panel variant-detail" });
    const note = h("p", { class: "action-note", role: "status", "aria-live": "polite" });
    let refreshAnswer = null;

    const loadAnswer = item => {
      let plan;
      try { plan = VariantLoad.plan(item); } catch (e) { note.textContent = "⚠ " + e.message; return; }
      const pages = Object.keys(plan.drafts).map(key => App.views.get(key.replace("draft.", ""))?.title || key);
      if (!confirm("载入参考设置会替换这些页面的当前草稿：" + pages.join("、") + "。继续？")) return;
      for (const [key, value] of Object.entries(plan.drafts)) Store.set(key, value);
      App.go(plan.open);
    };

    const renderDetail = () => {
      const item = Variants.items.find(x => x.id === state.selected) || Variants.items[0];
      state.selected = item.id;
      Store.set("draft.variants", state);
      const given = item.given ? h("section", { class: "guide-block" }, h("h3", null, "题目给的文件"),
        ...item.given.map(g => h("details", null, h("summary", null, g.name), h("pre", { class: "given-code" }, g.code)))) : null;
      note.textContent = "";
      // Questions the builder cannot answer come with a hand-written answer: hidden until the student opens it.
      let solution = null;
      refreshAnswer = null;
      const answer = VariantLoad.solutionFiles(item, Profile.value);
      if (answer) {
        const panel = OutputPanel({ title: "参考答案（手写）" });
        panel.show(answer);
        refreshAnswer = () => panel.show(VariantLoad.solutionFiles(item, Profile.value));
        const own = item.solution.map(f => f.name), given = answer.files.map(f => f.filename).filter(name => !own.includes(name));
        solution = h("details", { class: "guide-block" }, h("summary", null, "参考答案：" + own.join("、") + "（先自己写，写完再对照）" +
          (given.length ? "；另附题目给的 " + given.join("、") + "，整个项目可以直接编译" : "")),
          h("p", { class: "muted" }, "手写参考答案已通过 JDK 17 编译及对应验收。答案文件的姓名、学号和工具取自「考生信息」。"),
          panel.element);
      }
      // replaceChildren would print a null child as the text "null", so drop the missing given-files block.
      setChildren(detail, ...[
        h("div", { class: "panel-head" }, h("h2", null, item.title)),
        h("div", { class: "variant-paper" },
          h("h3", null, "必须实现"),
          h("ul", null, item.question.map(text => h("li", null, text))),
          h("p", { class: "muted" }, "每个 .java 文件开头须用注释注明姓名、学号和使用的工具（BlueJ）。")),
        given,
        h("details", { class: "guide-block" }, h("summary", null, "提示：用哪个工具、关键设置（先自己试，卡住再看）"),
          h("p", null, "工具：" + (!item.load ? VariantLoad.toolName() + "，参考答案在下面"
            : VariantLoad.toolName(item.load.view) + (item.solution ? "只能完成一部分，其余照参考答案手写" : item.given ? "（先用「骨架补全」）" : ""))),
          h("ul", null, item.hints.map(t => h("li", null, t)))),
        item.load ? h("div", { class: "actions" },
          h("button", { type: "button", class: "primary", onclick: () => loadAnswer(item) }, "载入参考设置并打开" +
            (item.given ? "「骨架补全」" : "「" + VariantLoad.toolName(item.load.view) + "」") + (item.solution ? "（builder 能做的部分）" : ""))) : null,
        note,
        solution,
        h("section", { class: "guide-block" }, h("h3", null, "在 BlueJ 里运行后逐项核对"),
          h("ol", null, item.checks.map(t => h("li", null, t))))
      ].filter(Boolean));
    };

    const renderList = () => {
      const groups = [...new Set(Variants.items.map(x => x.group))];
      setChildren(list, ...groups.flatMap(group => [
        h("h3", { class: "variant-group" }, group),
        ...Variants.items.filter(x => x.group === group).map(x => h("button", {
          type: "button", class: "example-item" + (x.id === state.selected ? " active" : ""),
          onclick: () => { state.selected = x.id; renderList(); renderDetail(); }
        }, h("strong", null, x.title), h("span", null, x.load ? VariantLoad.toolName(x.load.view) + (x.solution ? " + 手写" : "") : VariantLoad.toolName())))
      ]));
    };

    setChildren(main, h("div", { class: "gen-layout" },
      h("section", { class: "panel form-panel" },
        h("div", { class: "panel-head" }, h("h2", null, "变体题练习（" + Variants.items.length + " 题）")),
        h("p", { class: "intro" }, "先按题目要求完成程序，再在 BlueJ 里按清单核对。可展开提示、载入参考设置或查看手写参考答案。"),
        list),
      h("div", { class: "right-col" }, detail)));
    renderList();
    renderDetail();
    Views.refresh = () => refreshAnswer?.();
  }
};

// ---------- practice drills ----------
const PracticeView = {
  id: "practice", title: "我的练习 Q7–Q25",
  render(main) {
    const saved = Store.get("draft.practice", { id: "q25", values: {} });
    const formBox = h("div", { class: "form-box" });
    const output = OutputPanel();
    const picker = selectEl(Practice.catalog.map(c => [c.id, c.title + "（" + c.cn + "）"]), saved.id);
    const desc = h("p", { class: "intro" });
    let model;
    const load = () => {
      model = { ...Practice.defaults(picker.value), ...(saved.id === picker.value ? saved.values : {}) };
      const item = Practice.catalog.find(c => c.id === picker.value);
      desc.textContent = item.description;
      const schema = [{ key: "className", label: "类名" }, ...item.fields.map(f => ({ key: f.key, label: f.label, type: f.type === "select" ? "select" : "text", options: f.options }))];
      Form.render(formBox, schema, model, { onInput: debounce(refresh, 250), onChange: refresh });
      refresh();
    };
    const refresh = () => {
      saved.id = picker.value; saved.values = model;
      Store.set("draft.practice", saved);
      try { output.show(Practice.generate(picker.value, model, Profile.value)); } catch (e) { output.show(null, e.message); }
    };
    picker.addEventListener("change", load);
    setChildren(main, h("div", { class: "gen-layout no-preview" },
      h("section", { class: "panel form-panel" }, h("div", { class: "panel-head" }, h("h2", null, "我的练习")), picker, desc, formBox),
      h("div", { class: "right-col" }, output.element)));
    load();
    Views.refresh = refresh;
  }
};

// ---------- practical-test guide ----------
const GuideView = {
  id: "guide", title: "实操必看提醒",
  render(main) {
    const steps = (title, items) => h("section", { class: "guide-block" }, h("h3", null, title), h("ol", null, items.map(i => h("li", null, i))));
    const bullets = (title, items) => h("section", { class: "guide-block" }, h("h3", null, title), h("ul", null, items.map(i => h("li", null, i))));
    const table = (title, rows) => h("section", { class: "guide-block" }, h("h3", null, title),
      h("table", { class: "guide-table" }, h("tbody", null, rows.map(([a, b]) => h("tr", null, h("th", null, a), h("td", null, b))))));
    setChildren(main, h("section", { class: "panel wide-panel guide" },
      h("div", { class: "panel-head" }, h("h2", null, "Test 2 实操（Part 2）必看提醒"),
        h("button", { type: "button", onclick: () => App.go("knowledge") }, "打开知识点速查")),
      h("p", { class: "intro" }, "Part 2：2 小时，1–2 题，可以看本地资料但不能联网。老师强调的重点是「JavaFX 里用到的 OOP」，多练 Assignment 2；Lab 3 的 ArrayList 和文本文件读写也在范围内。GNN 不考。TableView（Lab 3 题单）和 GridPane（Lecture 7 讲义）课程里都出现过，本工具不生成这两种，题目指定时要自己按讲义写。"),
      h("section", { class: "guide-block guide-quick" }, h("h3", null, "⚡ 最省时间的三件事"),
        h("ol", null,
          h("li", null, "任何页面按 ", h("kbd", null, "Ctrl"), "+", h("kbd", null, "K"), "（或 ", h("kbd", null, "/"), "）打开快速查找：输入 import、BorderPane、getCode、文件、第二个窗口… 回车直接打开对应页面、知识点、讲义例程或变体题。"),
          h("li", null, "不想记包名：把下面的通用 import 块贴到每个手写的 .java 文件最上面；builder 生成的代码在代码面板上方选「import：通用块」即可。"),
          h("li", null, "BorderPane 布局：积木工作台的控件卡片选「位置」（上 / 下 / 左 / 右 / 中），「布局（BorderPane 五个区域）」里给每个区域选 HBox / VBox / FlowPane / StackPane、间距、对齐。范例：「BorderPane 五个区域」「FlowPane 运行时添加标签 + 第二个窗口」。")),
        h("div", { class: "actions" },
          h("button", { type: "button", class: "primary", onclick: e => copyText(Java.universalBlock("fx"), e.target.parentElement.nextElementSibling) }, "复制通用 import 块（JavaFX）"),
          h("button", { type: "button", onclick: e => copyText(Java.universalBlock("java"), e.target.parentElement.nextElementSibling) }, "复制通用 import 块（普通 Java 类）"),
          h("button", { type: "button", onclick: () => { Store.set("draft.knowledge", { query: "", group: "", selected: "template-fx" }); App.go("knowledge"); } }, "JavaFX 程序模板"),
          h("button", { type: "button", onclick: () => { Store.set("draft.knowledge", { query: "", group: "", selected: "template-java" }); App.go("knowledge"); } }, "Java 控制台模板")),
        h("p", { class: "action-note", role: "status" })),
      steps("开考前 10 分钟", [
        "按座位表坐好。把这个 HTML 复制到本机硬盘（例如 D:\Test2），不要放在 P 盘；考试中会断网、断 P 盘。",
        "用 Chrome 或 Edge 打开它，点右上角「考生信息」，填英文姓名、学号和使用的工具（按测验要求如实填写）。",
        "打开 BlueJ，新建一个空项目，确认能编译运行。"
      ]),
      table("① 先看题目给了什么，再选工具", [
        ["给了 .java 骨架（类 + 空方法）", "「骨架补全」：每个文件粘贴进一个框，检查黄色的方法。主程序：图形题点「用这些类生成主程序」，记录题点「用这个记录类生成管理程序」。"],
        ["只给 UML 或文字要求，要自己写所有类", "图形题用「Shape 程序」，记录题用「记录 + 文件」。类名、方法名、字段名在「高级」或字段表里照题目改。"],
        ["给了主程序骨架，里面方法是空的", "用生成器生成同名的完整主程序，逐项核对按钮文字、布局后整份替换；不会写的方法单独拿去「骨架补全」看建议。"],
        ["给了窗口截图", "看按钮在哪个区域（左/右/上/下）、顺序、颜色、标签文字，在生成器里逐项照做，对照右侧预览。"],
        ["和讲义例子很像（Enlarge/Shrink、移动 Text、鼠标、键盘、窗口事件、Timeline、绘图）", "「讲义例程库」搜英文关键词，改类名后复制；或用「积木工作台」「绘图」。"],
        ["输入数字 → 按按钮 → 显示结果", "「表单计算器」：公式写成 Java 表达式，预览里先试算。"]
      ]),
      bullets("② A2 型（OOP + JavaFX）常见考点", [
        "interface（如 Drawable）+ abstract class（如 Shape）+ 子类 extends；子类实现全部抽象方法并写 @Override。",
        "构造器：无参构造器给默认尺寸，带参构造器存参数；super(...) / this(...) 必须是第一行。",
        "protected 字段（x、y、颜色、area）给子类和同一包的主程序用；不要改题目给的类。",
        "主程序用父类引用保存当前图形（Shape activeShape），按钮调用 setColor / moveUp / draw（多态）。",
        "每次改动后先 getChildren().clear() 再 draw()，否则旧图形会留在画布上。",
        "没有图形时点按钮不能崩溃：先判断 activeShape != null。",
        "(x, y) 表示左上角还是中心，看题目图片；A2 原题是 x = 50、半径 50 时圆心在 (100, 100)。",
        "float 字段：area = (float) (Math.PI * r * r)；double 不用强转。",
        "可能的变化：换形状、换按钮和颜色、上下左右移动、放大缩小（有最小尺寸）、ArrayList 保存多个图形、输入框读尺寸、Label 显示面积、保存/读取文本文件。这些都在「Shape 程序」里有选项。",
        "displayShape() 一般要求在控制台打印面积和周长；BlueJ 的输出在 View → Show Terminal。"
      ]),
      bullets("③ Lab 3 型（记录 + ArrayList + 文件）常见考点", [
        "记录类：private 字段 + public getter/setter + 构造器 + toString；getter 名照题目写（如 getISBN）。",
        "启动时读文件（文件不存在就从空列表开始）；每次成功增、删、改、借还后保存；搜索、排序、选择、清空不保存。",
        "错误提示要和题目一字不差（大小写、句号）；题目要求弹窗就用 Alert，同时写到底部的 Label。",
        "主键查重（Duplicate ...）、空输入、数字格式错误（NumberFormatException）都要提示。",
        "搜索：部分匹配、不区分大小写（toLowerCase().contains）。排序：ArrayList.sort，再点一次就反向。",
        "按钮状态：编辑模式只有 Save 和 Exit 能点；借/还按钮按当前记录的状态启用或停用。",
        "可能的变化：换记录类（学生、商品…）、int/double 字段、统计（平均、最高、最低）、数量加减（Sell/Restock）、TextArea 显示、规定显示格式。都在「记录 + 文件」里有选项。",
        "数据文件放在 BlueJ 项目文件夹（程序的运行目录）；交卷前删掉测试时生成的数据文件或确认内容合理。"
      ]),
      bullets("④ Lecture 7–8 小考点（实操里也可能用到）", [
        "布局：BorderPane 五个区、HBox / VBox（间距）、StackPane（居中叠放）、FlowPane（换行）、Pane（手动坐标）；Insets(上, 右, 下, 左)。",
        "坐标原点在左上角，y 向下增大；向上移动 = y 减小。setRotate 正数顺时针；Arc 的角度正数逆时针、0° 指向东。",
        "事件：setOnAction（按钮、TextField 回车、CheckBox…）、setOnMouseClicked / Moved / Dragged、setOnKeyPressed（show() 之后 requestFocus()）、setOnCloseRequest（e.consume() 阻止关闭）。",
        "Handler 三种写法：内部类、匿名内部类、Lambda；题目指定写法就照做（生成器里可以切换）。",
        "Timeline：new Timeline(new KeyFrame(Duration.millis(…), e -> {...}))，setCycleCount(Timeline.INDEFINITE)，play / pause / stop。",
        "绑定：circle.centerXProperty().bind(pane.widthProperty().divide(2))。"
      ]),
      steps("⑤ 放进 BlueJ", [
        "最省事：生成器里点「下载 BlueJ 项目 ZIP」→ 下载文件夹里右键全部解压 → BlueJ：Project → Open Project → Compile → 右键主类 → Run JavaFX Application。",
        "在题目给的项目里补：双击对应的类 → Ctrl+A → 粘贴替换 → Compile。新建类时类名必须和代码里 public class 后面的名字一样。",
        "题目已经给了 Shape.java、Book.java 这类文件时，生成器选「只输出主程序」，不要再生成同名类。"
      ]),
      steps("⑥ 交卷前检查", [
        "每个 .java 文件开头都有姓名、学号和 Tools 一行（本工具按「考生信息」自动加，内容要和实际使用的工具一致）。",
        "窗口标题含完整姓名；按钮文字、顺序、位置、颜色和题目一致。",
        "按题目要求把每个按钮都点一遍，包括空输入、错误输入、没有图形时点按钮、重复主键、文件读回。",
        "生成器右侧「BlueJ 运行后逐项核对」可以当检查清单。",
        "把整个工作文件夹压成 .zip（右键 → 发送到 → 压缩文件夹）上传 Canvas。缺源码不给分。"
      ]),
      table("⑦ BlueJ 常见错误", [
        ["duplicate class: Shape", "同一个类出现在两个文件里。题目已给 Shape.java 时选「只输出主程序」，或删掉自己文件里重复的类。"],
        ["class X is public, should be declared in a file named X.java", "BlueJ 里的类名和代码里 public class 的名字不一致。"],
        ["cannot find symbol", "名字拼错（区分大小写）、少了 import，或方法名和题目给的类不一致：到生成器的「高级」里改成题目的名字。"],
        ["constructor X in class X cannot be applied", "题目给的类没有生成器假设的构造器。Shape 程序里改「创建图形用」；记录程序里改「构造器参数」。"],
        ["incompatible types: possible lossy conversion from double to float", "float 字段赋 double 值要 (float) 强制转换。"],
        ["missing return statement", "有返回值的方法每条路径都要 return。"],
        ["unmappable character for encoding", "源码里有中文。本工具生成的代码全是英文字符；自己手打的中文删掉。"],
        ["NullPointerException（运行时）", "对象还没创建就用了，例如还没 Add 就点 Move。先判断 != null。"],
        ["NumberFormatException（运行时）", "输入框里不是数字。用 try/catch 包住 parseInt / parseDouble。"],
        ["窗口不显示 / 没反应", "BlueJ 里要右键主类选 Run JavaFX Application；键盘事件要先 requestFocus()。"],
        ["';' expected", "上一行末尾少了分号。BlueJ 标红的行有时是下一行，往上看一行。"],
        ["')' expected / reached end of file while parsing", "括号或大括号没配对。用 BlueJ 的 Edit → Auto-layout 后看缩进哪里开始乱。"],
        ["incompatible types: String cannot be converted to int", "输入框的文字要先 Integer.parseInt(...) 或 Double.parseDouble(...)。"],
        ["'else' without 'if'", "if 后面多了分号，或 if 的大括号提前关掉了。"],
        ["variable x might not have been initialized", "变量只在 if 的某个分支里赋值；先给它一个初始值，或者每个分支都赋值。"]
      ]),
      table("⑧ 常用改法速查（只改几行时照抄）", [
        ["比较两个字符串", "a.equals(b)；不分大小写 a.equalsIgnoreCase(b)；部分匹配 a.toLowerCase().contains(b.toLowerCase())。不要用 =="],
        ["读输入框里的数字", "try { int n = Integer.parseInt(field.getText().trim()); ... } catch (NumberFormatException ex) { showError(\"...\"); return; }"],
        ["加一条范围检查", "if (n < 0 || n > 100) { showError(\"Mark must be 0-100.\"); return; }  放在 parse 之后、改数据之前"],
        ["用 getter 判断记录", "if (book.getCopies() > 0) { ... }；boolean 字段的 getter 常叫 isAvailable()"],
        ["遍历 ArrayList", "for (Book b : books) { if (b.getISBN().equals(isbn)) { ... } }"],
        ["保留 2 位小数", "String.format(\"%.2f\", value)；整数用 %d，文字用 %s"],
        ["改 Label 文字", "messageLabel.setText(\"Total: \" + total);"],
        ["按分隔符拆一行", "String[] parts = line.split(\",\");  分号用 \";\"，Tab 用 \"\\t\"；用 parts.length 先检查列数"],
        ["弹出错误框", "Alert alert = new Alert(Alert.AlertType.ERROR); alert.setContentText(\"...\"); alert.showAndWait();"]
      ]),
      bullets("⑨ 生成器做不到时怎么兜底", [
        "生成器没有的功能：先在「讲义例程库」找最像的程序，复制其中那一段；骨架补全的每个方法框都可以直接手改。",
        "积木工作台可直接拼按键、数字比较与分支。只在积木做不到时，再打开「进阶 Java」。",
        "改完一定在 BlueJ 里 Compile 一次；报错先看上面的错误表。",
        "时间分配：先用生成器拿到能运行的完整版本并压缩备份，再细调文字和布局。"
      ])));
    Views.refresh = null;
  }
};

const HomeView = {
  id: "home", title: "首页",
  render(main) {
    const card = (view, title, text) => h("button", { type: "button", class: "home-card", onclick: () => App.go(view) }, h("strong", null, title), h("span", null, text));
    setChildren(main, h("section", { class: "panel wide-panel" },
      h("div", { class: "panel-head" }, h("h2", null, "EIE3320 Test 2 · 先判断题型，再选工具")),
      Profile.complete() ? h("p", { class: "ok" }, "✓ 考生信息：" + Profile.value.name + "（" + Profile.value.id + "），工具：" + Profile.value.tools)
        : h("p", { class: "error" }, "⚠ 还没有填写考生信息。点右上角「考生信息」填写，所有生成的文件都会自动加上头注释。"),
      h("div", { class: "home-grid" },
        card("skeleton", "题目给了 .java 文件", "骨架补全：粘贴后自动填空方法，签名不变"),
        card("oop", "图形 + 按钮（A2 型）", "接口、抽象类、子类、按钮面板、换色移动缩放"),
        card("record", "记录 + 文件（Lab 3 型）", "ArrayList、增删改查、搜索排序、Alert、读写 txt"),
        card("calc", "输入 → 计算 → 显示", "TextField、parse、try/catch、公式"),
        card("draw", "按坐标画图（L7）", "Circle、Rectangle、Arc、Polygon、Text、颜色字体"),
        card("knowledge", "知识点速查", "查接口、getCode()、数字键和输入框解析，复制简短示例"),
        card("examples", "例程库（讲义 + 综合例题）", Examples.list.length + " 个完整程序：L7–L8 课件 + A2 / Lab 3 / OOP 例题，可搜索、改类名"),
        card("blocks", "积木工作台", "拖拽或点选积木，试按键和按钮，然后导出 JavaFX"),
        card("variants", "变体题练习", Variants.items.length + " 道中文模拟题，附必做要求和核对清单"),
        card("guide", "实操必看提醒", "可能的考点、题目给了什么怎么选工具、BlueJ 错误、交卷检查")),
      h("p", { class: "hint" }, "所有功能离线运行。草稿自动保存在本浏览器；换电脑后需要重新填写。")));
    Views.refresh = () => HomeView.render(main);
  }
};

const Views = {
  refresh: null,
  list: [
    HomeView,
    SkeletonView,
    generatorView({ id: "oop", title: "Shape 程序（A2 型）", schema: OopSchema, defaults: OopGen.defaults, presets: OopGen.presets,
      generate: OopGen.generate, preview: Preview.oop,
      intro: "接口 + 抽象父类 + 图形子类 + JavaFX 主程序。按题目改按钮文字、动作、颜色和布局；右侧预览里可以直接点按钮试运行。" }),
    generatorView({ id: "record", title: "记录 + 文件（Lab 3 型）", schema: RecordSchema, defaults: RecordGen.defaults, presets: RecordGen.presets,
      generate: RecordGen.generate, preview: Preview.record,
      intro: "记录类（private 字段 + getter/setter）+ ArrayList + ListView + Alert + 读写文本文件。默认就是 Lab 3 原题的提示文字。" }),
    generatorView({ id: "calc", title: "表单计算器", schema: CalcSchema, defaults: CalcGen.defaults, presets: CalcGen.presets,
      generate: CalcGen.generate, preview: Preview.calc,
      intro: "输入框 → 计算按钮 → 结果。可选单独的模型类（OOP），输入错误时弹 Alert 或显示 Invalid input。" }),
    generatorView({ id: "draw", title: "绘图（Lecture 7）", schema: DrawSchema, defaults: DrawGen.defaults, presets: DrawGen.presets,
      generate: DrawGen.generate, preview: Preview.draw,
      intro: "按坐标放置图形和文字，预览按 JavaFX 坐标绘制。可放在 Pane、Group 或自定义的 Pane 子类里。" }),
    KnowledgeView,
    ExamplesView,
    VariantsView,
    PracticeView,
    GuideView
  ]
};

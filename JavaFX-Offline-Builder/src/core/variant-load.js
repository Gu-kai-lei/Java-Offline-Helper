/*
 * Turns one practice question of Variants.items into the drafts that the tool pages read
 * (the same keys the pages save to), and the page to open. Pure logic: no DOM, no storage.
 */
"use strict";

const VariantLoad = {
  copy(value) { return JSON.parse(JSON.stringify(value)); },

  plan(item) {
    const load = item.load, drafts = {};
    let parsed = [];
    if (item.given) {
      parsed = item.given.map(g => Skeleton.parse(g.code, g.name));
      const sk = load.skeleton || {};
      drafts["draft.skeleton"] = {
        sources: item.given.map(g => g.code), anchor: sk.anchor || "topLeft", step: sk.step || "15", resize: sk.resize || "10",
        sizes: { radius: "50", width: "120", height: "70", side: "80", radiusX: "70", radiusY: "40", base: "100", ...sk.sizes },
        edits: VariantLoad.copy(sk.edits || {}), withMain: Boolean(sk.withMain)
      };
    }
    if (load.view === "examples") {
      drafts["draft.examples"] = { query: "", selected: load.example, className: load.className || "",
        parameters: { [load.example]: { ...load.parameters } } };
      return { drafts, open: "examples" };
    }
    if (load.view === "blocks") {
      drafts["draft.blocks"] = load.preset ? Blocks.preset(load.preset) : VariantLoad.copy(load.settings);
      return { drafts, open: "blocks" };
    }
    const gen = { oop: OopGen, record: RecordGen, calc: CalcGen }[load.view];
    if (!gen) throw new Error("未知的工具：" + load.view);
    let model;
    if (load.preset) {
      const found = gen.presets().find(p => p.id === load.preset);
      if (!found) throw new Error("找不到范例：" + load.preset);
      model = VariantLoad.copy(found.model);
    } else if (load.fromSkeleton) {
      model = load.view === "oop" ? Skeleton.toOopModel(parsed) : Skeleton.toRecordModel(parsed);
      if (!model) throw new Error("题目给的文件里没有识别到可用的类。");
      model = VariantLoad.copy(model);
    } else {
      model = gen.defaults();
    }
    const { fieldPatch, ...settings } = VariantLoad.copy(load.settings || {});
    Object.assign(model, settings);
    if (fieldPatch) for (const field of model.fields) if (fieldPatch[field.name]) Object.assign(field, fieldPatch[field.name]);
    drafts["draft." + load.view] = model;
    return { drafts, open: item.given ? "skeleton" : load.view };
  },

  // Tool names shown next to each question, so the student learns which page fits which paper.
  toolName(view) {
    if (!view) return "手写（builder 不能生成）";
    return { oop: "Shape 程序", record: "记录 + 文件", calc: "表单计算器", blocks: "积木工作台", examples: "讲义例程库" }[view] || view;
  },

  // The hand-written reference answer of a question the builder cannot (fully) answer, with the same English header as every generated file (exam rule),
  // plus the given files the answer does not replace, so that the files compile together as one BlueJ project.
  solutionFiles(item, profile) {
    if (!item.solution) return null;
    const own = item.solution.map(f => ({ filename: f.name, code: Java.withHeader(f.code, profile) }));
    const given = (item.given || []).filter(g => !item.solution.some(f => f.name === g.name)).map(g => ({ filename: g.name, code: g.code }));
    const mainFile = item.solution.find(f => /extends\s+Application\b/.test(f.code)) || item.solution.find(f => /static\s+void\s+main\s*\(/.test(f.code));
    const main = mainFile ? mainFile.name.replace(/\.java$/, "") : null;
    return { files: [...own, ...given], main, project: item.id.replace(/[^A-Za-z0-9]+/g, "") };
  }
};

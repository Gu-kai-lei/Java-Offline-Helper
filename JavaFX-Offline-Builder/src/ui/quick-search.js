/*
 * Quick search in the page header (Ctrl+K or /): one box that finds pages, knowledge entries,
 * lecture examples and practice questions, so nothing has to be looked up through the menus in the exam.
 */
"use strict";

const QuickSearch = {
  // Extra words for each page, so a search by task ("文件"、"BorderPane"、"题目给了代码") finds the right tool.
  keywords: {
    home: "首页 开始 选工具 题型",
    blocks: "积木 事件 鼠标 键盘 方向键 按钮 Label TextField CheckBox RadioButton Timeline 动画 计时 Alert 关窗 BorderPane 布局 区域 HBox VBox FlowPane StackPane 第二个窗口 Stage 运行时添加",
    skeleton: "骨架 补全 题目给了 给了代码 空方法 java 文件 super 构造器 getter setter",
    oop: "A2 Assignment 2 Shape 图形 圆 矩形 正方形 按钮 换色 移动 放大 缩小 接口 抽象类 Drawable 多态",
    record: "Lab 3 记录 Book Student ArrayList 文件 txt 读写 保存 读取 增删改查 搜索 排序 ListView TextArea Alert",
    calc: "计算器 表单 输入 计算 公式 TextField parseInt parseDouble 结果",
    draw: "绘图 坐标 画图 Circle Rectangle Arc Polygon Polyline Text 颜色 字体 Lecture 7",
    knowledge: "知识点 速查 API 用法 import 模板",
    examples: "讲义 例程 课件 Lecture 7 Lecture 8 例子",
    variants: "变体题 练习 模拟题 题目",
    practice: "练习 Q7 Q25",
    guide: "提醒 编译错误 交卷 BlueJ 怎么用 必看 检查"
  },

  words(query) {
    return String(query ?? "").toLowerCase().split(/[\s,，、]+/).filter(Boolean);
  },

  results(query) {
    const words = QuickSearch.words(query);
    if (!words.length) return [];
    const has = text => { const hay = String(text).toLowerCase(); return words.every(w => hay.includes(w)); };
    const out = [];
    for (const view of App.views.values()) {
      if (has(view.title + " " + view.id + " " + (QuickSearch.keywords[view.id] || ""))) {
        out.push({ kind: "页面", title: view.title, open: () => App.go(view.id) });
      }
    }
    for (const item of Knowledge.search(query).slice(0, 6)) {
      out.push({ kind: "知识点", title: item.title, open: () => {
        Store.set("draft.knowledge", { query: "", group: "", selected: item.id });
        App.go("knowledge");
      } });
    }
    for (const example of Examples.search(query).slice(0, 4)) {
      out.push({ kind: "讲义例程", title: example.id + " — " + example.title, open: () => {
        Store.set("draft.examples", { ...Store.get("draft.examples", {}), query: "", selected: example.id });
        App.go("examples");
      } });
    }
    for (const item of Variants.items.filter(v => has(v.id + " " + v.title + " " + (v.question || []).join(" "))).slice(0, 4)) {
      out.push({ kind: "变体题", title: item.title, open: () => {
        Store.set("draft.variants", { ...Store.get("draft.variants", {}), selected: item.id });
        App.go("variants");
      } });
    }
    return out.slice(0, 14);
  },

  init() {
    const input = $("quick-search"), list = $("quick-results");
    let found = [], active = 0;
    const close = () => { list.hidden = true; input.setAttribute("aria-expanded", "false"); };
    const open = index => { const item = found[index]; if (!item) return; close(); input.value = ""; item.open(); };
    const render = () => {
      found = QuickSearch.results(input.value);
      active = Math.min(active, Math.max(0, found.length - 1));
      setChildren(list, ...(found.length ? found.map((item, i) => h("button", {
        type: "button", role: "option", class: "quick-item" + (i === active ? " active" : ""), "aria-selected": String(i === active),
        onmousedown: e => { e.preventDefault(); open(i); }
      }, h("span", { class: "quick-kind" }, item.kind), item.title))
        : [h("p", { class: "quick-empty" }, input.value.trim() ? "没有找到。试试更短的词，如 import、BorderPane、getCode。" : "输入关键词：页面、知识点、讲义例程、变体题")]));
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
    };
    input.addEventListener("input", () => { active = 0; render(); });
    input.addEventListener("focus", render);
    input.addEventListener("blur", () => setTimeout(close, 120));
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (found.length) active = (active + (e.key === "ArrowDown" ? 1 : found.length - 1)) % found.length;
        render();
      } else if (e.key === "Enter") { e.preventDefault(); open(active); }
      else if (e.key === "Escape") { close(); input.blur(); }
    });
    document.addEventListener("keydown", e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "") || document.activeElement?.isContentEditable;
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) { e.preventDefault(); input.focus(); input.select(); }
    });
  }
};

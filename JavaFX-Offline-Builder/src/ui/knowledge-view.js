/* Search and browse the offline Java reference. */
"use strict";

const KnowledgeView = {
  id: "knowledge", title: "知识点速查",
  render(main) {
    const saved = Store.get("draft.knowledge", {});
    let selected = saved.selected;
    const byId = new Map(Knowledge.entries.map(item => [item.id, item]));
    const search = h("input", { type: "search", value: saved.query || "", placeholder: "如 getCode()、小键盘、接口" });
    const category = selectEl([["", "全部分类"], ...Knowledge.groups.map(group => [group, group])], saved.group || "",
      { "aria-labelledby": "knowledge-category-label" });
    const count = h("p", { class: "hint", role: "status" });
    const list = h("div", { class: "example-list knowledge-list", role: "group", "aria-label": "检索结果" });
    const detail = h("section", { class: "panel knowledge-detail", "aria-label": "知识点详情" });

    function show(item) {
      selected = item?.id || "";
      Store.set("draft.knowledge", { query: search.value, group: category.value, selected });
      for (const button of list.children) {
        const active = button.dataset.entry === selected;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      }
      if (!item) {
        setChildren(detail, h("h3", null, "没有找到匹配的知识点"),
          h("p", { class: "intro" }, "可缩短关键词，或切换到全部分类。"),
          h("button", { type: "button", onclick: () => {
            search.value = "";
            category.value = "";
            update();
            search.focus();
          } }, "清除筛选"));
        return;
      }

      const status = h("p", { class: "action-note", role: "status" });
      setChildren(detail, 
        h("p", { class: "hint" }, item.group),
        h("h3", { tabindex: "-1" }, item.title),
        h("ul", { class: "knowledge-notes" }, item.notes.map(note => h("li", null, note))),
        h("div", { class: "panel-head" }, h("h4", null, "示例片段"),
          h("button", { class: "small", type: "button", onclick: () => copyText(item.code, status) }, "复制示例")),
        h("textarea", { class: "code knowledge-code", readonly: true, spellcheck: "false",
          "aria-label": "Java 示例片段", rows: Math.max(3, item.code.split("\n").length), value: item.code }),
        status,
        h("div", { class: "knowledge-related" }, h("h4", null, "相关知识点"),
          h("div", { class: "actions" }, item.related.map(id => {
            const related = byId.get(id);
            return h("button", { type: "button", class: "small", onclick: () => {
              if (![...list.children].some(button => button.dataset.entry === id)) {
                search.value = "";
                category.value = related.group;
                selected = id;
                update();
              } else {
                show(related);
              }
              detail.querySelector("h3").focus();
            } }, related.title);
          })))
      );
    }

    function update() {
      const results = Knowledge.search(search.value, category.value);
      count.textContent = results.length + " 个知识点";
      setChildren(list, ...results.map(item => h("button", { type: "button", class: "example-item",
        dataset: { entry: item.id }, onclick: () => show(item) }, item.title)));
      list.scrollTop = 0;
      show(results.find(item => item.id === selected) || results[0]);
    }

    search.addEventListener("input", () => { selected = ""; update(); });
    category.addEventListener("change", () => { selected = ""; update(); });
    setChildren(main, h("div", { class: "knowledge-layout" },
      h("section", { class: "panel" },
        h("div", { class: "panel-head" }, h("h2", null, "知识点速查")),
        h("div", { class: "knowledge-filters" },
          h("label", { class: "field" }, h("span", null, "关键词或 API 名称"), search),
          h("label", { class: "field" }, h("span", { id: "knowledge-category-label" }, "分类"), category)),
        count, list),
      detail));
    update();
  }
};

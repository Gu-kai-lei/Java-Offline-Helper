/* Navigation, profile dialog and start-up. */
"use strict";

const App = {
  groups: [
    ["开始", ["home"]],
    ["生成程序", ["blocks", "skeleton", "oop", "record", "calc", "draw"]],
    ["参考与练习", ["knowledge", "examples", "variants", "practice"]],
    ["考场", ["guide"]]
  ],
  views: new Map(),
  current: "",

  init() {
    for (const view of [...Views.list, BlocksView]) App.views.set(view.id, view);
    const nav = $("nav");
    setChildren(nav, ...App.groups.map(([title, ids]) => h("div", { class: "nav-group" }, h("p", null, title),
      ids.map(id => h("button", { type: "button", "data-view": id, onclick: () => App.go(id) }, App.views.get(id).title)))));
    $("profile-button").addEventListener("click", App.openProfile);
    QuickSearch.init();
    $("profile-form").addEventListener("submit", event => {
      event.preventDefault();
      Profile.save({ name: $("profile-name").value, id: $("profile-id").value, tools: $("profile-tools").value, imports: $("profile-imports").value });
      $("profile-dialog").close();
    });
    $("profile-cancel").addEventListener("click", () => $("profile-dialog").close());
    $("bluej-close").addEventListener("click", () => $("bluej-dialog").close());
    Profile.listeners.push(() => { App.showProfile(); Views.refresh?.(); });
    App.showProfile();
    const fromHash = location.hash.slice(1);
    const start = App.views.has(fromHash) ? fromHash : Store.get("view", "home");
    App.go(App.views.has(start) ? start : "home");
    if (!Profile.complete() && !fromHash) App.openProfile();
    window.addEventListener("hashchange", () => { const id = location.hash.slice(1); if (App.views.has(id) && id !== App.current) App.go(id); });
  },

  go(id) {
    const view = App.views.get(id);
    App.current = id;
    Store.set("view", id);
    for (const button of document.querySelectorAll("#nav button")) button.setAttribute("aria-current", String(button.dataset.view === id));
    Views.refresh = null;
    const main = $("main");
    try {
      view.render(main);
    } catch (error) {
      // A broken draft must never lock the student out of a view: drop it and start fresh.
      Store.remove("draft." + id);
      setChildren(main, h("section", { class: "panel" }, h("p", { class: "error" }, "这个页面的草稿无法载入，已重置：" + error.message)));
      try { view.render(main); } catch (again) { main.append(h("p", { class: "error" }, again.message)); }
    }
    main.scrollTop = 0;
    window.scrollTo(0, 0);
  },

  showProfile() {
    const p = Profile.value;
    const button = $("profile-button");
    button.textContent = Profile.complete() ? "考生信息：" + p.name + " · " + p.id : "⚠ 填写考生信息";
    button.classList.toggle("warning", !Profile.complete());
  },

  openProfile() {
    $("profile-name").value = Profile.value.name;
    $("profile-id").value = Profile.value.id;
    $("profile-tools").value = Profile.value.tools || "BlueJ, JavaFX Offline Builder";
    $("profile-imports").value = Profile.value.imports;
    $("profile-dialog").showModal();
  }
};

App.init();

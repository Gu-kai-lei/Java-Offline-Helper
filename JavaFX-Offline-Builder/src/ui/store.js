/*
 * Per-browser storage for the profile and drafts. Every access is wrapped in try/catch because
 * storage can be blocked (private window, locked-down lab PC); the page then works without it.
 */
"use strict";

const Store = {
  prefix: "fxbuilder.v2.",
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(Store.prefix + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(Store.prefix + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(Store.prefix + key); } catch { /* storage unavailable */ }
  },
  clearAll() {
    try {
      for (const key of Object.keys(localStorage)) if (key.startsWith(Store.prefix)) localStorage.removeItem(key);
    } catch { /* storage unavailable */ }
  }
};

const Profile = {
  value: (() => {
    // The test asks for the software tools used; code made with this page should name it as well.
    const saved = Store.get("profile", { name: "", id: "", tools: "BlueJ, JavaFX Offline Builder" });
    if (!saved.tools) saved.tools = "BlueJ, JavaFX Offline Builder";   // what the student typed is kept as it is
    // imports: "precise" = only the classes used; "universal" = the same wildcard block in every file.
    if (saved.imports !== "universal") saved.imports = "precise";
    return saved;
  })(),
  save(next) {
    Profile.value = { name: String(next.name ?? "").trim(), id: String(next.id ?? "").trim(), tools: String(next.tools ?? "").trim(),
      imports: (next.imports ?? Profile.value.imports) === "universal" ? "universal" : "precise" };
    Store.set("profile", Profile.value);
    for (const fn of Profile.listeners) fn(Profile.value);
  },
  complete() { return Boolean(Profile.value.name && Profile.value.id); },
  listeners: []
};

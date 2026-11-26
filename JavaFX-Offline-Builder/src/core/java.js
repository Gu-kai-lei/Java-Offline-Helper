/* Shared helpers for emitting Java source. Pure functions only: no DOM access. */
"use strict";

const JAVA_RESERVED = new Set((
  "abstract assert boolean break byte case catch char class const continue default do double else enum " +
  "extends final finally float for goto if implements import instanceof int interface long native new " +
  "package private protected public return short static strictfp super switch synchronized this throw " +
  "throws transient try void volatile while true false null var yield record sealed permits _"
).split(" "));

// JavaFX Color constants offered in pickers. The CSS colour of the same name is used for previews.
const FX_COLORS = [
  "RED", "GREEN", "BLUE", "YELLOW", "ORANGE", "PURPLE", "PINK", "BLACK", "WHITE", "GRAY",
  "LIGHTGRAY", "DARKGRAY", "BROWN", "CYAN", "MAGENTA", "GOLD", "LIGHTBLUE", "LIGHTGREEN",
  "DARKGREEN", "DARKBLUE", "NAVY", "MAROON", "OLIVE", "TEAL", "SILVER", "LIME", "SKYBLUE",
  "VIOLET", "BEIGE", "CORAL", "CRIMSON", "INDIGO", "KHAKI", "SALMON", "TOMATO", "TURQUOISE",
  "WHEAT", "LIGHTYELLOW", "WHITESMOKE", "DODGERBLUE", "FORESTGREEN", "ORANGERED", "HOTPINK",
  "CHOCOLATE", "LAVENDER", "TRANSPARENT"
];

const Java = {
  RESERVED: JAVA_RESERVED,
  COLORS: FX_COLORS,

  isIdent(name) {
    return typeof name === "string" && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) && !JAVA_RESERVED.has(name);
  },

  ident(raw, label) {
    const name = String(raw ?? "").trim();
    if (!Java.isIdent(name)) {
      throw new Error(label + "需要合法的 Java 名称：字母开头，只含字母、数字和 _，且不能是关键字。当前：" + (name || "空"));
    }
    return name;
  },

  // Java string literal that only contains printable ASCII; everything else becomes \uXXXX.
  str(value) {
    let out = '"';
    for (const ch of String(value ?? "")) {
      const code = ch.codePointAt(0);
      if (ch === '"') out += '\\"';
      else if (ch === "\\") out += "\\\\";
      else if (ch === "\n") out += "\\n";
      else if (ch === "\r") out += "\\r";
      else if (ch === "\t") out += "\\t";
      else if (code < 0x20 || code > 0x7e) {
        for (let i = 0; i < ch.length; i++) out += "\\u" + ch.charCodeAt(i).toString(16).toUpperCase().padStart(4, "0");
      } else out += ch;
    }
    return out + '"';
  },

  // Text that is safe inside a // comment: one line, printable ASCII, no unicode escapes.
  comment(value) {
    return String(value ?? "").replace(/[\r\n]+/g, " ").replace(/\\u/gi, "\\ u")
      .replace(/[^\x20-\x7e]/g, "?").trim();
  },

  number(raw, label, { min = -1e9, max = 1e9, integer = false } = {}) {
    const text = String(raw ?? "").trim();
    const value = Number(text);
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) || !Number.isFinite(value)) {
      throw new Error(label + "需要是数字。当前：" + (text || "空"));
    }
    if (integer && !Number.isInteger(value)) throw new Error(label + "需要是整数。");
    if (value < min || value > max) throw new Error(label + "需在 " + min + " 到 " + max + " 之间。");
    return value;
  },

  // Literal for a numeric value in the given Java type.
  lit(value, type = "double") {
    const n = Number(value);
    if (type === "int" || type === "long") return String(Math.trunc(n));
    const text = Number.isInteger(n) ? String(n) : String(n);
    if (type === "float") return text + "f";
    return text;
  },

  // Double literal that always reads as a double (100.0 rather than 100).
  dbl(value) {
    const n = Number(value);
    const text = String(n);
    return /^-?\d+$/.test(text) ? text + ".0" : text;
  },

  indent(text, spaces) {
    const pad = " ".repeat(spaces);
    return String(text).split("\n").map(line => (line.trim() ? pad + line : "")).join("\n");
  },

  // camelCase identifier made from free text, e.g. "Color: Red" + "Button" -> colorRedButton.
  camel(text, suffix = "", fallback = "item") {
    const words = String(text).replace(/[^A-Za-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
    let name = words.map((w, i) => i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1)).join("");
    if (!name || !/^[A-Za-z]/.test(name)) name = fallback + name;
    name += suffix;
    return JAVA_RESERVED.has(name) ? name + "1" : name;
  },

  upperFirst(text) { return text ? text.charAt(0).toUpperCase() + text.slice(1) : text; },
  lowerFirst(text) { return text ? text.charAt(0).toLowerCase() + text.slice(1) : text; },

  // Allocates unique identifiers within one generated scope.
  names(taken = []) {
    const used = new Set(taken);
    return {
      take(name) {
        let candidate = name, n = 2;
        while (used.has(candidate) || JAVA_RESERVED.has(candidate)) candidate = name + n++;
        used.add(candidate);
        return candidate;
      },
      reserve(name) { used.add(name); },
      has(name) { return used.has(name); }
    };
  },

  isAscii(text) { return !/[^\x00-\x7f]/.test(text); },

  // The "universal import" block: one fixed list of wildcard imports that works for every program the
  // builder makes (and for most hand-written Test 2 programs), so nothing has to be looked up in the exam.
  IMPORT_GROUPS: {
    fx: [
      ["JavaFX Application & Window", ["javafx.application.Application", "javafx.stage.*"]],
      ["Scene Graph & Layout", ["javafx.scene.*", "javafx.scene.layout.*", "javafx.geometry.*"]],
      ["UI Controls", ["javafx.scene.control.*"]],
      ["Shapes & Colors", ["javafx.scene.shape.*", "javafx.scene.paint.*"]],
      ["Text & Font", ["javafx.scene.text.*"]],
      ["Image & ImageView", ["javafx.scene.image.*"]],
      ["Events", ["javafx.event.*", "javafx.scene.input.*"]],
      ["Properties & Binding", ["javafx.beans.property.*", "javafx.beans.binding.*", "javafx.beans.value.*"]],
      ["Observable Collections", ["javafx.collections.*"]],
      ["Animation & Timeline", ["javafx.animation.*", "javafx.util.Duration"]]
    ],
    java: [
      ["Java Collections & Scanner", ["java.util.*"]],
      ["File Reading & Writing", ["java.io.*"]],
      ["File Path", ["java.nio.file.*"]],
      ["Date & Time", ["java.time.*", "java.time.format.*"]]
    ]
  },
  // Simple names found in two of the wildcard packages (checked against JDK 17 + JavaFX 17):
  // java.nio.file.Path and javafx.scene.shape.Path. Using one needs its own single-type import.
  IMPORT_AMBIGUOUS: new Set(["Path"]),

  // The whole universal block as text. kind: "fx" = JavaFX + Java groups, "java" = Java groups only.
  universalBlock(kind = "fx") {
    const groups = kind === "fx" ? [...Java.IMPORT_GROUPS.fx, ...Java.IMPORT_GROUPS.java] : Java.IMPORT_GROUPS.java;
    return groups.map(([title, names]) => "// " + title + "\n" + names.map(n => "import " + n + ";").join("\n")).join("\n\n");
  },

  // Universal block for a file whose exact imports are known. An exact import is kept as well when the
  // block does not cover it, when its simple name is ambiguous between two wildcard packages, or when a
  // class of the project has the same simple name (a class of the same package would hide the wildcard).
  universalImports(imports, projectTypes = []) {
    const list = [...new Set(imports)].filter(Boolean);
    // A file without any JavaFX import (Book, Student, an interface) gets only the Java groups.
    const fx = list.some(i => i.startsWith("javafx."));
    const groups = fx ? [...Java.IMPORT_GROUPS.fx, ...Java.IMPORT_GROUPS.java] : Java.IMPORT_GROUPS.java;
    const lines = groups.flatMap(([, names]) => names);
    const covered = name => lines.includes(name) || lines.some(l => l.endsWith(".*") && name.slice(0, name.lastIndexOf(".")) === l.slice(0, -2));
    const own = new Set(projectTypes);
    const simple = name => name.slice(name.lastIndexOf(".") + 1);
    const extra = list.filter(i => !i.endsWith(".*") && (!covered(i) || Java.IMPORT_AMBIGUOUS.has(simple(i)) || own.has(simple(i))));
    return Java.universalBlock(fx ? "fx" : "java") + (extra.length ? "\n\n// Exact imports (not covered above, or a name used twice)\n" +
      Java.importBlock(extra) : "");
  },

  // Sorted import block: java.* first, then javafx.*, then everything else.
  // With style "universal" the fixed wildcard block (Java.IMPORT_GROUPS) is used instead; see universalImports().
  importBlock(imports, style = "precise", projectTypes = []) {
    if (style === "universal") return Java.universalImports(imports, projectTypes);
    const list = [...new Set(imports)].filter(Boolean).sort((a, b) => {
      const rank = s => s.startsWith("java.") ? 0 : s.startsWith("javafx.") ? 1 : 2;
      return rank(a) - rank(b) || (a < b ? -1 : a > b ? 1 : 0);
    });
    return list.map(name => "import " + name + ";").join("\n");
  },

  colorExpr(spec) {
    const value = String(spec ?? "").trim();
    if (!value || value === "none" || value === "null") return "null";
    const rgb = /^rgb:\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/i.exec(value);
    if (rgb) {
      const parts = rgb.slice(1).map(Number);
      if (parts.some(p => p > 255)) throw new Error("RGB 每个分量需在 0 到 255 之间。");
      return "Color.rgb(" + parts.join(", ") + ")";
    }
    if (!FX_COLORS.includes(value.toUpperCase())) throw new Error("未知颜色：" + value);
    return "Color." + value.toUpperCase();
  },

  cssColor(spec) {
    const value = String(spec ?? "").trim();
    if (!value || value === "none" || value === "null") return "none";
    const rgb = /^rgb:\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/i.exec(value);
    if (rgb) return "rgb(" + rgb.slice(1).join(",") + ")";
    return value.toLowerCase();
  },

  // Header comment required at the top of every source file in quizzes and tests.
  header(profile = {}, { chinese = false } = {}) {
    if (chinese) {
      return "// 姓名：" + (Java.comment(profile.name) || "请填写姓名") +
        "\n// 学号：" + (Java.comment(profile.id) || "请填写学号") +
        "\n// 工具：" + (Java.comment(profile.tools) || "BlueJ") + "\n";
    }
    const name = Java.comment(profile.name) || "YOUR NAME";
    const id = Java.comment(profile.id) || "YOUR STUDENT ID";
    const tools = Java.comment(profile.tools) || "BlueJ, JavaFX Offline Builder";
    return "// Name: " + name + "\n// Student ID: " + id + "\n// Tools: " + tools + "\n";
  },

  withHeader(code, profile, options) {
    const body = String(code).replace(/^\s+/, "");
    return Java.header(profile, options) + "\n" + body.replace(/\s*$/, "\n");
  },

  // Replaces {name} and {id} in user-entered titles with the profile values.
  /*
   * Turns a display template such as "{code} | {name} | Qty: {quantity} | ${price:.2f}" into a Java
   * string expression. resolve(name) returns the Java expression for a placeholder or null.
   */
  template(text, resolve, label = "格式模板", isText = () => false) {
    const parts = [];
    const re = /\{([A-Za-z_]\w*(?:\(\))?)(?::([^}]*))?\}/g;
    let last = 0, match;
    const src = String(text ?? "");
    while ((match = re.exec(src))) {
      if (match.index > last) parts.push(Java.str(src.slice(last, match.index)));
      const expr = resolve(match[1]);
      if (!expr) throw new Error(label + "里的 {" + match[1] + "} 不能用：不是字段名（区分大小写）" + (match[1].endsWith("()") ? "；方法只能在使用题目给的类时调用" : "") + "。");
      const fmt = match[2];
      if (fmt !== undefined && !/^(\.\d+f|d|\d+d|,\.\d+f)$/.test(fmt)) throw new Error(label + "里的格式 :" + fmt + " 无效，可用 :.2f 或 :d。");
      parts.push(fmt === undefined ? expr : "String.format(" + Java.str("%" + fmt) + ", " + expr + ")");
      last = re.lastIndex;
    }
    if (last < src.length) parts.push(Java.str(src.slice(last)));
    if (!parts.length) return '""';
    // Keep the expression a String even when it starts with a number or boolean field.
    const first = /^\{([A-Za-z_]\w*)\}/.exec(src);
    if (!parts[0].startsWith('"') && !parts[0].startsWith("String.format") && !(first && isText(first[1]))) parts.unshift('""');
    return parts.join(" + ");
  },

  // Replaces text inside the string literals of generated code (escape hatch for exact wording).
  replaceTexts(code, replacements) {
    const pairs = (replacements || []).map(r => [Java.str(r.from ?? "").slice(1, -1), Java.str(r.to ?? "").slice(1, -1)]).filter(([from]) => from);
    if (!pairs.length) return code;
    return String(code).split("\n").map(line => {
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return line;
      return line.replace(/"(?:[^"\\]|\\.)*"/g, literal => {
        let inner = literal.slice(1, -1);
        for (const [from, to] of pairs) inner = inner.split(from).join(to);
        return '"' + inner + '"';
      });
    }).join("\n");
  },

  // "{count} record(s) loaded from {file}." -> Java string expression; values maps placeholder -> Java expression.
  message(text, values) {
    const parts = [];
    const re = /\{(\w+)\}/g;
    let last = 0, match;
    const src = String(text ?? "");
    while ((match = re.exec(src))) {
      if (!(match[1] in values)) continue;
      if (match.index > last) parts.push(Java.str(src.slice(last, match.index)));
      parts.push(values[match[1]]);
      last = re.lastIndex;
    }
    if (last < src.length) parts.push(Java.str(src.slice(last)));
    if (!parts.length) return '""';
    if (!parts[0].startsWith('"') && !parts[0].startsWith("String.format")) parts.unshift('""');
    return parts.join(" + ");
  },

  fillProfile(text, profile = {}) {
    return String(text ?? "").replace(/\{name\}/g, profile.name || "YOUR NAME").replace(/\{id\}/g, profile.id || "YOUR ID");
  },

  /*
   * Event handler registration in the style taught in Lecture 8.
   * style: "lambda" | "anonymous". eventClass: ActionEvent, MouseEvent, KeyEvent or WindowEvent.
   * Returns { code, imports }.
   */
  handler(target, setter, body, { style = "lambda", eventClass = "ActionEvent", param = "e" } = {}) {
    const lines = String(body).replace(/\s+$/, "");
    const packages = {
      ActionEvent: "javafx.event.ActionEvent", MouseEvent: "javafx.scene.input.MouseEvent",
      KeyEvent: "javafx.scene.input.KeyEvent", WindowEvent: "javafx.stage.WindowEvent"
    };
    if (style === "anonymous") {
      return {
        code: target + "." + setter + "(new EventHandler<" + eventClass + ">() {\n    @Override\n    public void handle(" +
          eventClass + " " + param + ") {\n" + Java.indent(lines, 8) + "\n    }\n});",
        imports: ["javafx.event.EventHandler", packages[eventClass]]
      };
    }
    const single = !lines.includes("\n") && /;$/.test(lines) && !/^(if|for|while|try|switch)\b/.test(lines);
    return {
      code: single
        ? target + "." + setter + "(" + param + " -> " + lines.replace(/;$/, "") + ");"
        : target + "." + setter + "(" + param + " -> {\n" + Java.indent(lines, 4) + "\n});",
      imports: []
    };
  }
};

/*
 * A class or interface to be written either into its own file or into one combined file.
 * code must start with "public ..." for the declaration; combine() drops that modifier for
 * the secondary types of a single-file program.
 */
function javaUnit(name, kind, imports, code, extra = {}) {
  return { name, kind, imports: [...imports], code: code.replace(/\s*$/, "\n"), ...extra };
}

const JavaFiles = {
  // mode: "split" = one file per type, "single" = everything in mainName.java,
  // "main" = only the main class (other types are provided by the exam paper).
  assemble(units, mainName, mode, profile) {
    const main = units.find(u => u.name === mainName);
    if (!main) throw new Error("缺少主类 " + mainName);
    if (mode === "main") {
      return [{ filename: mainName + ".java", code: JavaFiles.render([main], profile, units), kind: main.kind }];
    }
    if (mode === "split") {
      return units.map(u => ({ filename: u.name + ".java", code: JavaFiles.render([u], profile, units), kind: u.kind }));
    }
    const ordered = [main, ...units.filter(u => u !== main)];
    const merged = ordered.map((u, i) => i === 0 ? u.code : u.code.replace(/^public\s+/m, ""));
    return [{ filename: mainName + ".java", code: JavaFiles.render(ordered, profile, units, merged.join("\n")), kind: main.kind }];
  },

  // profile.imports === "universal" puts the fixed wildcard block at the top of every file.
  render(units, profile = {}, project = units, body = units.map(u => u.code).join("\n")) {
    const imports = units.flatMap(u => u.imports);
    const style = profile.imports === "universal" ? "universal" : "precise";
    const block = style === "universal" || imports.length ? Java.importBlock(imports, style, project.map(u => u.name)) + "\n\n" : "";
    return Java.withHeader(block + body, profile);
  }
};

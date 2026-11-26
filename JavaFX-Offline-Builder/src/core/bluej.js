/*
 * BlueJ project export: a ZIP holding one folder with the .java files and a package.bluej file,
 * so that BlueJ can open it directly with Project > Open Project.
 */
"use strict";

const BlueJ = {
  targetType(code) {
    if (/^public\s+interface\s/m.test(code)) return "InterfaceTarget";
    if (/^public\s+abstract\s+class\s/m.test(code)) return "AbstractTarget";
    return "ClassTarget";
  },

  packageFile(files) {
    const javaFiles = files.filter(f => f.filename.endsWith(".java"));
    const lines = ["#BlueJ package file", "editor.fx.0.height=0", "editor.fx.0.width=0", "editor.fx.0.x=0", "editor.fx.0.y=0",
      "objectbench.height=92", "objectbench.width=760", "package.divider.horizontal=0.6", "package.divider.vertical=0.8",
      "package.editor.height=420", "package.editor.width=680", "package.editor.x=60", "package.editor.y=60",
      "package.frame.height=600", "package.frame.width=800", "package.numDependencies=0", "package.numTargets=" + javaFiles.length,
      "package.showExtends=true", "package.showUses=true", "project.charset=UTF-8",
      "readme.height=60", "readme.name=@README", "readme.width=48", "readme.x=10", "readme.y=10"];
    javaFiles.forEach((file, i) => {
      const n = i + 1;
      lines.push("target" + n + ".height=60", "target" + n + ".name=" + file.filename.replace(/\.java$/, ""),
        "target" + n + ".showInterface=false", "target" + n + ".type=" + BlueJ.targetType(file.code),
        "target" + n + ".width=140", "target" + n + ".x=" + (60 + (i % 3) * 180), "target" + n + ".y=" + (40 + Math.floor(i / 3) * 110));
    });
    return lines.join("\n") + "\n";
  },

  readme(projectName, profile, main, mainSource) {
    let start = "Compile the project and use the object bench or call the exercises' methods.";
    if (/extends\s+Application\b/.test(mainSource)) {
      start = 'Compile, then right-click ' + main + ' and choose "Run JavaFX Application".';
    } else if (/static\s+void\s+main\s*\(/.test(mainSource)) {
      start = "Compile, then right-click " + main + " and choose void main(String[] args).";
    }
    return [
      "PROJECT TITLE: " + Java.comment(projectName),
      "AUTHORS: " + (Java.comment(profile.name) || "YOUR NAME") + " (" + (Java.comment(profile.id) || "YOUR ID") + ")",
      "TOOLS: " + (Java.comment(profile.tools) || "BlueJ"),
      "HOW TO START: " + start,
      ""
    ].join("\n");
  },

  // Files of a BlueJ project folder.
  projectFiles(files, projectName, profile, main) {
    const mainSource = files.find(file => file.filename === main + ".java")?.code || "";
    return [...files, { filename: "package.bluej", code: BlueJ.packageFile(files) },
      { filename: "README.TXT", code: BlueJ.readme(projectName, profile, main, mainSource) }];
  },

  zip(files, folder = "") {
    const encoder = new TextEncoder();
    const prefix = folder ? folder.replace(/[\\/]+$/, "") + "/" : "";
    const table = Uint32Array.from({ length: 256 }, (_, value) => {
      let crc = value;
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      return crc >>> 0;
    });
    const checksum = bytes => {
      let crc = 0xffffffff;
      for (const byte of bytes) crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
      return (crc ^ 0xffffffff) >>> 0;
    };
    const entries = [];
    if (prefix) entries.push({ name: encoder.encode(prefix), data: new Uint8Array(0), dir: true });
    for (const f of files) {
      const text = String(f.code).replace(/\r?\n/g, "\r\n");
      entries.push({ name: encoder.encode(prefix + f.filename), data: encoder.encode(text), dir: false });
    }
    const local = [], central = [];
    let offset = 0;
    // DOS date 2026-01-01 00:00 keeps the archive deterministic.
    const dosTime = 0, dosDate = ((2026 - 1980) << 9) | (1 << 5) | 1;
    for (const e of entries) {
      const crc = checksum(e.data);
      const head = new Uint8Array(30), v = new DataView(head.buffer);
      v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, 0, true);
      v.setUint16(10, dosTime, true); v.setUint16(12, dosDate, true); v.setUint32(14, crc, true);
      v.setUint32(18, e.data.length, true); v.setUint32(22, e.data.length, true); v.setUint16(26, e.name.length, true);
      local.push(head, e.name, e.data);
      const c = new Uint8Array(46), w = new DataView(c.buffer);
      w.setUint32(0, 0x02014b50, true); w.setUint16(4, 20, true); w.setUint16(6, 20, true); w.setUint16(8, 0x0800, true);
      w.setUint16(12, dosTime, true); w.setUint16(14, dosDate, true); w.setUint32(16, crc, true);
      w.setUint32(20, e.data.length, true); w.setUint32(24, e.data.length, true); w.setUint16(28, e.name.length, true);
      w.setUint32(38, e.dir ? 0x10 : 0, true); w.setUint32(42, offset, true);
      central.push(c, e.name);
      offset += head.length + e.name.length + e.data.length;
    }
    const centralSize = central.reduce((n, part) => n + part.length, 0);
    const end = new Uint8Array(22), z = new DataView(end.buffer);
    z.setUint32(0, 0x06054b50, true); z.setUint16(8, entries.length, true); z.setUint16(10, entries.length, true);
    z.setUint32(12, centralSize, true); z.setUint32(16, offset, true);
    const out = new Uint8Array(offset + centralSize + end.length);
    let at = 0;
    for (const part of [...local, ...central, end]) { out.set(part, at); at += part.length; }
    return out;
  }
};

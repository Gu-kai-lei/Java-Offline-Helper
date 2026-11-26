// Builds the single-file offline page: node build.mjs from JavaFX-Offline-Builder/
// Output: dist/JavaFX-Offline-Builder.html (all CSS and JS inline, no network access).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
export const distFile = path.join(root, "dist", "JavaFX-Offline-Builder.html");

export function buildHtml(stamp) {
  const src = path.join(root, "src");
  const manifest = JSON.parse(fs.readFileSync(path.join(src, "manifest.json"), "utf8"));
  const read = file => fs.readFileSync(path.join(src, file), "utf8").replace(/\r\n/g, "\n");
  const script = [...manifest.core, ...manifest.ui].map(file => "// ===== " + file + " =====\n" + read(file)).join("\n");
  if (/<\/script/i.test(script)) throw new Error("A source file contains </script>, which would end the inline script early.");
  return read(manifest.html)
    .replace("/*@@STYLE@@*/", () => read(manifest.css))
    .replace("/*@@SCRIPT@@*/", () => script)
    .replace("@@BUILD@@", stamp);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const now = new Date();
  const stamp = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  const html = buildHtml(stamp);
  fs.mkdirSync(path.dirname(distFile), { recursive: true });
  fs.writeFileSync(distFile, html);
  console.log("built " + path.relative(process.cwd(), distFile) + " (" + (html.length / 1024).toFixed(0) + " KB)");
}

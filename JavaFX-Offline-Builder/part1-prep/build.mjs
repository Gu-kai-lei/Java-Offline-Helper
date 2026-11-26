// Builds the Part 1 revision page: node build.mjs from JavaFX-Offline-Builder/part1-prep/
// Output: dist/EIE3320-Test2-Part1-Prep.html (self-contained, offline).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
export const distFile = path.join(root, "dist", "EIE3320-Test2-Part1-Prep.html");

export function buildHtml() {
  const read = file => fs.readFileSync(path.join(root, "src", file), "utf8").replace(/\r\n/g, "\n");
  const theory = read("theory.js");
  if (/<\/script/i.test(theory)) throw new Error("theory.js contains </script>");
  return read("page.html").replace("/*@@THEORY@@*/", () => theory);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  fs.mkdirSync(path.dirname(distFile), { recursive: true });
  const html = buildHtml();
  fs.writeFileSync(distFile, html);
  console.log("built " + path.relative(process.cwd(), distFile) + " (" + (html.length / 1024).toFixed(0) + " KB)");
}

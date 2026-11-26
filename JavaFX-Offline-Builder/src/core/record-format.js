/* Delimited record files: one logical record per line, doubled quotes inside quoted fields. */
"use strict";

const RecordFormat = {
  delimiters: [["comma", "逗号 CSV"], ["semicolon", "分号"], ["tab", "Tab 制表符"]],
  separator: { comma: ",", semicolon: ";", tab: "\t" },
  split(line, separator) {
    const parts = [];
    let value = "", inQuotes = false, afterQuote = false;
    const push = () => { parts.push(afterQuote ? value : value.trim()); value = ""; afterQuote = false; };
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch !== '"') value += ch;
        else if (line[i + 1] === '"') { value += '"'; i++; }
        else { inQuotes = false; afterQuote = true; }
      } else if (ch === separator) push();
      else if (afterQuote) {
        if (!/\s/.test(ch)) throw new Error("引号后应为分隔符或行尾。");
      } else if (ch === '"') {
        if (value.trim()) throw new Error("含引号的字段需要从引号起始。");
        value = ""; inQuotes = true;
      } else value += ch;
    }
    if (inQuotes) throw new Error("字段引号没有闭合。");
    push();
    return parts;
  },
  encoder(separator) {
    const quote = Java.str('"'), doubled = Java.str('""');
    return [
      "private static String escapeFileField(String text) {",
      "    if (text.contains(" + Java.str(separator) + ") || text.contains(" + quote + ") || !text.equals(text.trim())) {",
      "        return " + quote + " + text.replace(" + quote + ", " + doubled + ") + " + quote + ";",
      "    }",
      "    return text;",
      "}"
    ];
  },
  decoder(separator) {
    return [
      "private static String[] splitFileLine(String line) {",
      "    char separator = " + Java.str(separator) + ".charAt(0);",
      "    char quote = " + Java.str('"') + ".charAt(0);",
      "    ArrayList<String> parts = new ArrayList<>();",
      "    StringBuilder value = new StringBuilder();",
      "    boolean inQuotes = false;",
      "    boolean afterQuote = false;",
      "    for (int i = 0; i < line.length(); i++) {",
      "        char ch = line.charAt(i);",
      "        if (inQuotes) {",
      "            if (ch != quote) {",
      "                value.append(ch);",
      "            } else if (i + 1 < line.length() && line.charAt(i + 1) == quote) {",
      "                value.append(ch);",
      "                i++;",
      "            } else {",
      "                inQuotes = false;",
      "                afterQuote = true;",
      "            }",
      "        } else if (ch == separator) {",
      "            parts.add(afterQuote ? value.toString() : value.toString().trim());",
      "            value.setLength(0);",
      "            afterQuote = false;",
      "        } else if (afterQuote) {",
      '            if (!Character.isWhitespace(ch)) throw new IllegalArgumentException("Unexpected text after a closing quote.");',
      "        } else if (ch == quote) {",
      '            if (!value.toString().trim().isEmpty()) throw new IllegalArgumentException("Unexpected quote inside a field.");',
      "            value.setLength(0);",
      "            inQuotes = true;",
      "        } else {",
      "            value.append(ch);",
      "        }",
      "    }",
      '    if (inQuotes) throw new IllegalArgumentException("Unclosed quote.");',
      "    parts.add(afterQuote ? value.toString() : value.toString().trim());",
      "    return parts.toArray(new String[0]);",
      "}"
    ];
  },
  encodeValues(fields, separator, getter) {
    const values = fields.map(f => f.type === "String" ? "escapeFileField(" + getter(f) + ")" : "String.valueOf(" + getter(f) + ")");
    return "String.join(" + Java.str(separator) + ", " + values.join(", ") + ")";
  }
};

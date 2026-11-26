/*
 * Geometry library shared by the Shape (A2-style) generator, the skeleton filler and the previews.
 * Each kind knows its dimensions, area/perimeter formulas, the JavaFX node that draws it,
 * and how to grow or shrink. Java expressions are built from field names so they work with
 * whatever names an exam skeleton uses.
 */
"use strict";

const ShapeKinds = (() => {
  const half = e => e + " / 2";
  const kinds = {
    circle: {
      label: "Circle 圆", word: "circle", fx: "Circle", keywords: ["circle", "round", "ball"],
      dims: [{ name: "radius", label: "半径 radius", def: 50, aliases: ["radius", "r", "rad"] }],
      area: d => "Math.PI * " + d.radius + " * " + d.radius,
      perimeter: d => "2 * Math.PI * " + d.radius,
      node: (d, x, y, anchor) => anchor === "center"
        ? x + ", " + y + ", " + d.radius
        : x + " + " + d.radius + ", " + y + " + " + d.radius + ", " + d.radius,
      areaValue: v => Math.PI * v.radius * v.radius,
      perimeterValue: v => 2 * Math.PI * v.radius,
      box: (v, x, y, anchor) => anchor === "center"
        ? { cx: x, cy: y, w: 2 * v.radius, h: 2 * v.radius }
        : { cx: x + v.radius, cy: y + v.radius, w: 2 * v.radius, h: 2 * v.radius },
      svg: (v, x, y, anchor) => {
        const b = kinds.circle.box(v, x, y, anchor);
        return { tag: "circle", attrs: { cx: b.cx, cy: b.cy, r: v.radius } };
      }
    },
    rectangle: {
      label: "Rectangle 矩形", word: "rectangle", fx: "Rectangle", keywords: ["rectangle", "rect", "box"],
      dims: [
        { name: "width", label: "宽 width", def: 120, aliases: ["width", "w", "length", "len"] },
        { name: "height", label: "高 height", def: 70, aliases: ["height", "h", "breadth"] }
      ],
      area: d => d.width + " * " + d.height,
      perimeter: d => "2 * (" + d.width + " + " + d.height + ")",
      node: (d, x, y, anchor) => anchor === "center"
        ? x + " - " + half(d.width) + ", " + y + " - " + half(d.height) + ", " + d.width + ", " + d.height
        : x + ", " + y + ", " + d.width + ", " + d.height,
      areaValue: v => v.width * v.height,
      perimeterValue: v => 2 * (v.width + v.height),
      box: (v, x, y, anchor) => anchor === "center"
        ? { cx: x, cy: y, w: v.width, h: v.height }
        : { cx: x + v.width / 2, cy: y + v.height / 2, w: v.width, h: v.height },
      svg: (v, x, y, anchor) => {
        const b = kinds.rectangle.box(v, x, y, anchor);
        return { tag: "rect", attrs: { x: b.cx - b.w / 2, y: b.cy - b.h / 2, width: b.w, height: b.h } };
      }
    },
    square: {
      label: "Square 正方形", word: "square", fx: "Rectangle", keywords: ["square"],
      dims: [{ name: "side", label: "边长 side", def: 80, aliases: ["side", "length", "s", "len", "width"] }],
      area: d => d.side + " * " + d.side,
      perimeter: d => "4 * " + d.side,
      node: (d, x, y, anchor) => anchor === "center"
        ? x + " - " + half(d.side) + ", " + y + " - " + half(d.side) + ", " + d.side + ", " + d.side
        : x + ", " + y + ", " + d.side + ", " + d.side,
      areaValue: v => v.side * v.side,
      perimeterValue: v => 4 * v.side,
      box: (v, x, y, anchor) => anchor === "center"
        ? { cx: x, cy: y, w: v.side, h: v.side }
        : { cx: x + v.side / 2, cy: y + v.side / 2, w: v.side, h: v.side },
      svg: (v, x, y, anchor) => {
        const b = kinds.square.box(v, x, y, anchor);
        return { tag: "rect", attrs: { x: b.cx - b.w / 2, y: b.cy - b.h / 2, width: b.w, height: b.h } };
      }
    },
    ellipse: {
      label: "Ellipse 椭圆", word: "ellipse", fx: "Ellipse", keywords: ["ellipse", "oval"],
      dims: [
        { name: "radiusX", label: "横半径 radiusX", def: 70, aliases: ["radiusx", "rx", "a", "semimajor", "majorradius"] },
        { name: "radiusY", label: "纵半径 radiusY", def: 40, aliases: ["radiusy", "ry", "b", "semiminor", "minorradius"] }
      ],
      area: d => "Math.PI * " + d.radiusX + " * " + d.radiusY,
      // Ramanujan's approximation of the ellipse perimeter.
      perimeter: d => "Math.PI * (3 * (" + d.radiusX + " + " + d.radiusY + ") - Math.sqrt((3 * " + d.radiusX +
        " + " + d.radiusY + ") * (" + d.radiusX + " + 3 * " + d.radiusY + ")))",
      node: (d, x, y, anchor) => anchor === "center"
        ? x + ", " + y + ", " + d.radiusX + ", " + d.radiusY
        : x + " + " + d.radiusX + ", " + y + " + " + d.radiusY + ", " + d.radiusX + ", " + d.radiusY,
      areaValue: v => Math.PI * v.radiusX * v.radiusY,
      perimeterValue: v => Math.PI * (3 * (v.radiusX + v.radiusY) - Math.sqrt((3 * v.radiusX + v.radiusY) * (v.radiusX + 3 * v.radiusY))),
      box: (v, x, y, anchor) => anchor === "center"
        ? { cx: x, cy: y, w: 2 * v.radiusX, h: 2 * v.radiusY }
        : { cx: x + v.radiusX, cy: y + v.radiusY, w: 2 * v.radiusX, h: 2 * v.radiusY },
      svg: (v, x, y, anchor) => {
        const b = kinds.ellipse.box(v, x, y, anchor);
        return { tag: "ellipse", attrs: { cx: b.cx, cy: b.cy, rx: v.radiusX, ry: v.radiusY } };
      }
    },
    triangle: {
      label: "Triangle 等腰三角形", word: "triangle", fx: "Polygon", keywords: ["triangle"],
      dims: [
        { name: "base", label: "底边 base", def: 100, aliases: ["base", "b", "width", "side"] },
        { name: "height", label: "高 height", def: 80, aliases: ["height", "h"] }
      ],
      area: d => "0.5 * " + d.base + " * " + d.height,
      perimeter: d => d.base + " + 2 * Math.sqrt((" + d.base + " / 2) * (" + d.base + " / 2) + " + d.height + " * " + d.height + ")",
      // Polygon points: bottom-left, bottom-right, apex.
      node: (d, x, y, anchor) => anchor === "center"
        ? [x + " - " + half(d.base), y + " + " + half(d.height), x + " + " + half(d.base), y + " + " + half(d.height), x, y + " - " + half(d.height)].join(", ")
        : [x, y + " + " + d.height, x + " + " + d.base, y + " + " + d.height, x + " + " + half(d.base), y].join(", "),
      areaValue: v => 0.5 * v.base * v.height,
      perimeterValue: v => v.base + 2 * Math.sqrt((v.base / 2) ** 2 + v.height ** 2),
      box: (v, x, y, anchor) => anchor === "center"
        ? { cx: x, cy: y, w: v.base, h: v.height }
        : { cx: x + v.base / 2, cy: y + v.height / 2, w: v.base, h: v.height },
      svg: (v, x, y, anchor) => {
        const b = kinds.triangle.box(v, x, y, anchor);
        const left = b.cx - b.w / 2, right = b.cx + b.w / 2, top = b.cy - b.h / 2, bottom = b.cy + b.h / 2;
        return { tag: "polygon", attrs: { points: [left, bottom, right, bottom, b.cx, top].join(" ") } };
      }
    }
  };
  for (const [id, kind] of Object.entries(kinds)) kind.id = id;
  return kinds;
})();

const ShapeLib = {
  kinds: ShapeKinds,
  ids: Object.keys(ShapeKinds),

  // Guess the kind from a class name such as JavaFXCircle or MyRectangle.
  kindFromName(name) {
    const lower = String(name).toLowerCase();
    // Square before rectangle so that "SquareShape" is not mistaken.
    for (const id of ["square", "triangle", "ellipse", "rectangle", "circle"]) {
      if (ShapeKinds[id].keywords.some(word => lower.includes(word))) return id;
    }
    return null;
  },

  // Map each dimension of a kind to one of the given numeric field names, or null.
  matchDims(kindId, fieldNames) {
    const kind = ShapeKinds[kindId];
    const free = [...fieldNames];
    const result = {};
    for (const dim of kind.dims) {
      const found = free.find(f => dim.aliases.includes(f.toLowerCase())) ||
        free.find(f => f.toLowerCase().includes(dim.name.toLowerCase()));
      if (!found) return null;
      result[dim.name] = found;
      free.splice(free.indexOf(found), 1);
    }
    return result;
  },

  // Java expression of the area/perimeter, cast for float fields when Math is involved.
  formula(kindId, which, dimNames, numType) {
    const kind = ShapeKinds[kindId];
    const expr = which === "area" ? kind.area(dimNames) : kind.perimeter(dimNames);
    if ((numType === "float" || numType === "int" || numType === "long") && /Math\.|0\.5/.test(expr)) {
      return "(" + numType + ") (" + expr + ")";
    }
    return expr;
  },

  // Grow or shrink every dimension by step. Without min, shrinking keeps the size positive;
  // with min, the size never goes below min.
  growLines(kindId, dimNames, step, grow, min) {
    const kind = ShapeKinds[kindId];
    return kind.dims.map(dim => {
      const f = dimNames[dim.name];
      if (grow) return f + " += " + step + ";";
      const test = min === undefined || min === null || min === "" ? f + " > " + step : f + " - " + step + " >= " + min;
      return "if (" + test + ") {\n    " + f + " -= " + step + ";\n}";
    });
  },

  // Java's Float.toString / Double.toString approximated for console previews.
  javaNumber(value, type) {
    if (!Number.isFinite(value)) return String(value);
    if (type === "float") {
      const f = Math.fround(value);
      for (let p = 1; p <= 9; p++) {
        const text = Number(f.toPrecision(p));
        if (Math.fround(text) === f) return Number.isInteger(text) ? text.toFixed(1) : String(text);
      }
      return String(f);
    }
    return Number.isInteger(value) ? value.toFixed(1) : String(value);
  }
};

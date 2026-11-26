/*
 * Lecture 7 drawing generator: shapes and text with exact coordinates and colours, placed in a
 * Pane, a Group or a custom Pane subclass. Also produces SVG data for the browser preview using
 * the JavaFX coordinate system (origin top-left, y downwards, arc angles counter-clockwise).
 */
"use strict";

const DRAW_TYPES = {
  circle: { fx: "Circle", label: "Circle 圆", props: ["centerX", "centerY", "radius"] },
  rectangle: { fx: "Rectangle", label: "Rectangle 矩形", props: ["x", "y", "width", "height", "arcWidth", "arcHeight"] },
  ellipse: { fx: "Ellipse", label: "Ellipse 椭圆", props: ["centerX", "centerY", "radiusX", "radiusY"] },
  line: { fx: "Line", label: "Line 线段", props: ["startX", "startY", "endX", "endY"] },
  arc: { fx: "Arc", label: "Arc 弧/扇形", props: ["centerX", "centerY", "radiusX", "radiusY", "startAngle", "length"] },
  polygon: { fx: "Polygon", label: "Polygon 多边形（闭合）", props: [] },
  polyline: { fx: "Polyline", label: "Polyline 折线（不闭合）", props: [] },
  text: { fx: "Text", label: "Text 文字", props: ["x", "y"] }
};

const DrawGen = {
  types: DRAW_TYPES,
  propLabels: {
    centerX: "圆心 X", centerY: "圆心 Y", radius: "半径", x: "X", y: "Y", width: "宽", height: "高",
    arcWidth: "圆角宽", arcHeight: "圆角高", radiusX: "横半径", radiusY: "纵半径", startX: "起点 X", startY: "起点 Y",
    endX: "终点 X", endY: "终点 Y", startAngle: "起始角（东=0，逆时针为正）", length: "扫过角度"
  },

  node(type, name, values = {}) {
    return { type, name, centerX: "100", centerY: "100", radius: "40", x: "50", y: "50", width: "100", height: "60",
      arcWidth: "0", arcHeight: "0", radiusX: "60", radiusY: "40", startX: "20", startY: "20", endX: "180", endY: "120",
      startAngle: "0", length: "90", arcType: "ROUND", points: "50,150 100,50 150,150", text: "JavaFX",
      fontFamily: "Arial", fontSize: "20", fontWeight: "NORMAL", fontPosture: "REGULAR", underline: "no", strikethrough: "no",
      fill: "DEFAULT", stroke: "DEFAULT", strokeWidth: "1", rotate: "0", ...values };
  },

  presets() {
    const n = DrawGen.node;
    const hexPoints = [];
    for (let i = 0; i < 6; i++) {
      hexPoints.push(Math.round((200 + 120 * Math.cos(2 * i * Math.PI / 6)) * 10) / 10 + "," +
        Math.round((200 - 120 * Math.sin(2 * i * Math.PI / 6)) * 10) / 10);
    }
    const base = { output: "single", rootType: "pane", paneClass: "DrawingPane", background: "WHITE", width: "400", height: "400" };
    return [
      { id: "smiley", title: "笑脸（HW6 Q2）", model: { ...base, appClass: "SmileyApp", title: "Smiley Face - {name}", background: "LIGHTGRAY", nodes: [
        n("circle", "face", { centerX: "200", centerY: "200", radius: "100", fill: "YELLOW", stroke: "BLACK" }),
        n("circle", "leftEye", { centerX: "165", centerY: "170", radius: "12", fill: "BLACK" }),
        n("circle", "rightEye", { centerX: "235", centerY: "170", radius: "12", fill: "BLACK" }),
        n("arc", "mouth", { centerX: "200", centerY: "215", radiusX: "50", radiusY: "35", startAngle: "180", length: "180", arcType: "OPEN", fill: "NONE", stroke: "BLACK", strokeWidth: "3" })
      ] } },
      { id: "traffic", title: "交通灯", model: { ...base, appClass: "TrafficLight", title: "Traffic Light - {name}", width: "200", height: "360", nodes: [
        n("rectangle", "box", { x: "50", y: "20", width: "100", height: "300", arcWidth: "20", arcHeight: "20", fill: "DARKGRAY", stroke: "BLACK" }),
        n("circle", "redLight", { centerX: "100", centerY: "80", radius: "35", fill: "RED" }),
        n("circle", "yellowLight", { centerX: "100", centerY: "170", radius: "35", fill: "YELLOW" }),
        n("circle", "greenLight", { centerX: "100", centerY: "260", radius: "35", fill: "GREEN" })
      ] } },
      { id: "house", title: "房子（Polygon + Rectangle + Text）", model: { ...base, appClass: "HouseDrawing", title: "House - {name}", width: "400", height: "320", nodes: [
        n("polygon", "roof", { points: "80,140 200,40 320,140", fill: "BROWN", stroke: "BLACK" }),
        n("rectangle", "wall", { x: "100", y: "140", width: "200", height: "140", fill: "BEIGE", stroke: "BLACK" }),
        n("rectangle", "door", { x: "180", y: "200", width: "40", height: "80", fill: "CHOCOLATE" }),
        n("text", "caption", { x: "130", y: "305", text: "My House", fontFamily: "Times New Roman", fontSize: "22", fontWeight: "BOLD" })
      ] } },
      { id: "hexagon", title: "六边形（课件 ShowPolygon）", model: { ...base, appClass: "ShowHexagon", title: "Hexagon - {name}", nodes: [
        n("polygon", "hexagon", { points: hexPoints.join(" "), fill: "WHITE", stroke: "BLACK" })
      ] } },
      { id: "arcs", title: "四种 Arc（课件 ShowArc）", model: { ...base, appClass: "ShowArcs", title: "ShowArc - {name}", width: "300", height: "200", nodes: [
        n("arc", "arc1", { centerX: "150", centerY: "100", radiusX: "80", radiusY: "80", startAngle: "30", length: "35", arcType: "ROUND", fill: "RED" }),
        n("arc", "arc2", { centerX: "150", centerY: "100", radiusX: "80", radiusY: "80", startAngle: "120", length: "35", arcType: "OPEN", fill: "WHITE", stroke: "BLACK" }),
        n("arc", "arc3", { centerX: "150", centerY: "100", radiusX: "80", radiusY: "80", startAngle: "210", length: "35", arcType: "CHORD", fill: "WHITE", stroke: "BLACK" }),
        n("arc", "arc4", { centerX: "150", centerY: "100", radiusX: "80", radiusY: "80", startAngle: "300", length: "35", arcType: "CHORD", fill: "GREEN", stroke: "BLACK" }),
        n("text", "label1", { x: "210", y: "40", text: "arc1: round", fontSize: "12" }),
        n("text", "label2", { x: "20", y: "40", text: "arc2: open", fontSize: "12" }),
        n("text", "label3", { x: "20", y: "170", text: "arc3: chord", fontSize: "12" }),
        n("text", "label4", { x: "210", y: "170", text: "arc4: chord", fontSize: "12" })
      ] } },
      { id: "text", title: "文字样式（课件 ShowText）", model: { ...base, appClass: "ShowText", title: "ShowText - {name}", width: "300", height: "160", nodes: [
        n("text", "text1", { x: "20", y: "20", text: "Programming is fun", fontFamily: "Courier", fontSize: "15", fontWeight: "BOLD", fontPosture: "ITALIC" }),
        n("text", "text2", { x: "60", y: "60", text: "Programming is fun\\nDisplay text", fontSize: "13" }),
        n("text", "text3", { x: "10", y: "100", text: "Programming is fun\\nDisplay text", fontSize: "13", fill: "RED", underline: "yes", strikethrough: "yes" })
      ] } }
    ];
  },

  defaults() { return DrawGen.presets()[0].model; },

  normalize(model) {
    const m = JSON.parse(JSON.stringify(model));
    const app = Java.ident(m.appClass, "主类名");
    const paneClass = m.rootType === "custom" ? Java.ident(m.paneClass, "自定义 Pane 类名") : "";
    if (paneClass && paneClass === app) throw new Error("自定义 Pane 类名不能和主类名相同。");
    if (paneClass && Object.values(DRAW_TYPES).some(t => t.fx === paneClass)) throw new Error("自定义 Pane 类名不能和 JavaFX 图形类同名。");
    const used = new Set(["pane", "root", "scene", "stage", "group"]);
    const nodes = m.nodes.map((raw, i) => {
      const spec = DRAW_TYPES[raw.type];
      if (!spec) throw new Error("第 " + (i + 1) + " 个图形类型无效。");
      const name = Java.ident(raw.name, "第 " + (i + 1) + " 个图形的变量名");
      if (used.has(name)) throw new Error("变量名重复或被占用：" + name);
      used.add(name);
      const node = { type: raw.type, name, fx: spec.fx };
      for (const p of spec.props) node[p] = Java.number(raw[p], name + " 的 " + (DrawGen.propLabels[p] || p), { min: -10000, max: 10000 });
      if (raw.type === "circle" && node.radius <= 0) throw new Error(name + " 的半径需要大于 0。");
      if (raw.type === "polygon" || raw.type === "polyline") {
        const nums = String(raw.points).trim().split(/[\s,]+/).filter(Boolean).map(v => Java.number(v, name + " 的坐标"));
        if (nums.length < 4 || nums.length % 2) throw new Error(name + " 的点需要成对填写，例如 50,150 100,50 150,150。");
        node.points = nums;
      }
      if (raw.type === "arc") node.arcType = ["OPEN", "CHORD", "ROUND"].includes(raw.arcType) ? raw.arcType : "ROUND";
      if (raw.type === "text") {
        node.text = String(raw.text ?? "").replace(/\\n/g, "\n");
        node.fontFamily = String(raw.fontFamily ?? "").trim() || "Arial";
        node.fontSize = Java.number(raw.fontSize, name + " 的字号", { min: 1, max: 300 });
        node.fontWeight = ["THIN", "EXTRA_LIGHT", "LIGHT", "NORMAL", "MEDIUM", "SEMI_BOLD", "BOLD", "EXTRA_BOLD", "BLACK"].includes(raw.fontWeight) ? raw.fontWeight : "NORMAL";
        node.fontPosture = raw.fontPosture === "ITALIC" ? "ITALIC" : "REGULAR";
        node.underline = raw.underline === "yes";
        node.strikethrough = raw.strikethrough === "yes";
      }
      node.fill = DrawGen.paint(raw.fill, name + " 的填充色");
      node.stroke = DrawGen.paint(raw.stroke, name + " 的边框色");
      node.strokeWidth = Java.number(raw.strokeWidth ?? "1", name + " 的线宽", { min: 0, max: 100 });
      node.rotate = Java.number(raw.rotate ?? "0", name + " 的旋转角度", { min: -3600, max: 3600 });
      return node;
    });
    return {
      app, paneClass, rootType: ["pane", "custom", "group"].includes(m.rootType) ? m.rootType : "pane",
      title: String(m.title ?? ""), output: m.output === "split" && paneClass ? "split" : "single",
      width: Java.number(m.width, "窗口宽", { min: 50, max: 4000 }), height: Java.number(m.height, "窗口高", { min: 50, max: 4000 }),
      background: String(m.background || "WHITE").toUpperCase(), nodes
    };
  },

  paint(raw, label) {
    const value = String(raw ?? "DEFAULT").trim().toUpperCase();
    if (value === "DEFAULT" || value === "") return "DEFAULT";
    if (value === "NONE") return "NONE";
    Java.colorExpr(raw);
    return String(raw).trim();
  },

  generate(model, profile = {}) {
    const m = DrawGen.normalize(model);
    const imports = new Set(["javafx.application.Application", "javafx.scene.Scene", "javafx.stage.Stage"]);
    const paneImports = new Set(["javafx.scene.layout.Pane"]);
    const body = [];
    for (const node of m.nodes) {
      paneImports.add(node.type === "text" ? "javafx.scene.text.Text" : "javafx.scene.shape." + node.fx);
      body.push(...DrawGen.nodeLines(node, paneImports), "");
    }
    const names = m.nodes.map(n => n.name);
    const style = m.background === "WHITE" ? "" : 'setStyle("-fx-background-color: ' + m.background.toLowerCase() + ';");';
    const units = [];
    const title = Java.fillProfile(m.title, profile);
    const size = Java.lit(m.width) + ", " + Java.lit(m.height);
    const show = ["stage.setTitle(" + Java.str(title) + ");", "stage.setScene(scene);", "stage.show();"];
    let start;
    if (m.rootType === "custom") {
      const ctor = [...(style ? [style, ""] : []), ...body, "getChildren().addAll(" + names.join(", ") + ");"];
      units.push(javaUnit(m.paneClass, "class", [...paneImports],
        "/** A Pane that draws the whole picture in its constructor. */\npublic class " + m.paneClass + " extends Pane {\n    public " +
        m.paneClass + "() {\n" + Java.indent(ctor.join("\n"), 8) + "\n    }\n}\n"));
      start = ["// The custom pane draws everything; the application only shows it",
        "Scene scene = new Scene(new " + m.paneClass + "(), " + size + ");", ...show];
    } else if (m.rootType === "group") {
      for (const i of paneImports) if (i !== "javafx.scene.layout.Pane") imports.add(i);
      imports.add("javafx.scene.Group");
      if (style) imports.add("javafx.scene.paint.Color");
      start = [...body, "Group group = new Group(" + names.join(", ") + ");",
        "Scene scene = new Scene(group, " + size + (style ? ", Color." + m.background : "") + ");", ...show];
    } else {
      for (const i of paneImports) imports.add(i);
      start = ["Pane pane = new Pane();", ...(style ? ["pane." + style] : []), "", ...body,
        "pane.getChildren().addAll(" + names.join(", ") + ");", "", "Scene scene = new Scene(pane, " + size + ");", ...show];
    }
    const app = "/** Draws a picture with JavaFX shapes. */\npublic class " + m.app + " extends Application {\n    @Override\n    public void start(Stage stage) {\n" +
      Java.indent(start.join("\n").replace(/\n{3,}/g, "\n\n"), 8) + "\n    }\n\n    public static void main(String[] args) {\n        launch(args);\n    }\n}\n";
    units.unshift(javaUnit(m.app, "class", [...imports], app, { main: true }));
    const files = JavaFiles.assemble(units, m.app, m.output, profile);
    return { files, main: m.app, units, warnings: !profile.name ? ["还没有填写考生信息。"] : [], normalized: m };
  },

  nodeLines(node, imports) {
    const v = p => Java.lit(node[p]);
    const lines = [];
    let ctor;
    switch (node.type) {
      case "circle": ctor = [v("centerX"), v("centerY"), v("radius")]; break;
      case "rectangle": ctor = [v("x"), v("y"), v("width"), v("height")]; break;
      case "ellipse": ctor = [v("centerX"), v("centerY"), v("radiusX"), v("radiusY")]; break;
      case "line": ctor = [v("startX"), v("startY"), v("endX"), v("endY")]; break;
      case "arc": ctor = [v("centerX"), v("centerY"), v("radiusX"), v("radiusY"), v("startAngle"), v("length")]; break;
      case "polygon": case "polyline": ctor = node.points.map(p => Java.lit(p)); break;
      case "text": ctor = [v("x"), v("y"), Java.str(node.text)]; break;
    }
    lines.push(node.fx + " " + node.name + " = new " + node.fx + "(" + ctor.join(", ") + ");");
    if (node.type === "rectangle" && (node.arcWidth || node.arcHeight)) {
      lines.push(node.name + ".setArcWidth(" + v("arcWidth") + ");", node.name + ".setArcHeight(" + v("arcHeight") + ");");
    }
    if (node.type === "arc") {
      imports.add("javafx.scene.shape.ArcType");
      lines.push(node.name + ".setType(ArcType." + node.arcType + ");");
    }
    if (node.type === "text") {
      imports.add("javafx.scene.text.Font");
      if (node.fontWeight !== "NORMAL" || node.fontPosture !== "REGULAR") {
        imports.add("javafx.scene.text.FontWeight");
        imports.add("javafx.scene.text.FontPosture");
        lines.push(node.name + ".setFont(Font.font(" + Java.str(node.fontFamily) + ", FontWeight." + node.fontWeight +
          ", FontPosture." + node.fontPosture + ", " + v("fontSize") + "));");
      } else {
        lines.push(node.name + ".setFont(Font.font(" + Java.str(node.fontFamily) + ", " + v("fontSize") + "));");
      }
      if (node.underline) lines.push(node.name + ".setUnderline(true);");
      if (node.strikethrough) lines.push(node.name + ".setStrikethrough(true);");
    }
    const paint = (setter, value) => {
      if (value === "DEFAULT") return;
      if (value === "NONE") { lines.push(node.name + "." + setter + "(null);"); return; }
      imports.add("javafx.scene.paint.Color");
      lines.push(node.name + "." + setter + "(" + Java.colorExpr(value) + ");");
    };
    paint("setFill", node.fill);
    paint("setStroke", node.stroke);
    if (node.strokeWidth !== 1) lines.push(node.name + ".setStrokeWidth(" + v("strokeWidth") + ");");
    if (node.rotate) lines.push(node.name + ".setRotate(" + v("rotate") + ");");
    return lines;
  },

  // SVG elements in JavaFX coordinates for the preview.
  svg(model) {
    const m = DrawGen.normalize(model);
    const color = (value, fallback) => value === "DEFAULT" ? fallback : value === "NONE" ? "none" : Java.cssColor(value);
    const out = [];
    for (const n of m.nodes) {
      const defaultFill = n.type === "line" || n.type === "polyline" ? "none" : "black";
      const defaultStroke = n.type === "line" || n.type === "polyline" ? "black" : "none";
      let el, box;
      switch (n.type) {
        case "circle":
          el = { tag: "circle", attrs: { cx: n.centerX, cy: n.centerY, r: n.radius } };
          box = [n.centerX, n.centerY]; break;
        case "rectangle":
          el = { tag: "rect", attrs: { x: n.x, y: n.y, width: n.width, height: n.height, rx: n.arcWidth / 2, ry: n.arcHeight / 2 } };
          box = [n.x + n.width / 2, n.y + n.height / 2]; break;
        case "ellipse":
          el = { tag: "ellipse", attrs: { cx: n.centerX, cy: n.centerY, rx: n.radiusX, ry: n.radiusY } };
          box = [n.centerX, n.centerY]; break;
        case "line":
          el = { tag: "line", attrs: { x1: n.startX, y1: n.startY, x2: n.endX, y2: n.endY } };
          box = [(n.startX + n.endX) / 2, (n.startY + n.endY) / 2]; break;
        case "arc":
          el = { tag: "path", attrs: { d: DrawGen.arcPath(n) } };
          box = [n.centerX, n.centerY]; break;
        case "polygon": case "polyline": {
          el = { tag: n.type, attrs: { points: n.points.join(" ") } };
          const xs = n.points.filter((_, i) => i % 2 === 0), ys = n.points.filter((_, i) => i % 2 === 1);
          box = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]; break;
        }
        case "text": {
          const weight = { THIN: 100, EXTRA_LIGHT: 200, LIGHT: 300, NORMAL: 400, MEDIUM: 500, SEMI_BOLD: 600, BOLD: 700, EXTRA_BOLD: 800, BLACK: 900 }[n.fontWeight];
          const deco = [n.underline ? "underline" : "", n.strikethrough ? "line-through" : ""].filter(Boolean).join(" ");
          el = { tag: "text", text: n.text, attrs: { x: n.x, y: n.y, "font-family": n.fontFamily, "font-size": n.fontSize,
            "font-weight": weight, "font-style": n.fontPosture === "ITALIC" ? "italic" : "normal", "text-decoration": deco || "none" } };
          box = [n.x + n.text.length * n.fontSize * 0.27, n.y - n.fontSize * 0.35]; break;
        }
      }
      el.attrs.fill = color(n.fill, defaultFill);
      el.attrs.stroke = color(n.stroke, defaultStroke);
      el.attrs["stroke-width"] = n.strokeWidth;
      if (n.rotate) el.attrs.transform = "rotate(" + n.rotate + " " + box[0] + " " + box[1] + ")";
      el.name = n.name;
      out.push(el);
    }
    return { width: m.width, height: m.height, background: Java.cssColor(m.background), elements: out };
  },

  // JavaFX arc: angles in degrees, 0 = east, positive = counter-clockwise on screen.
  arcPath(n) {
    const point = deg => {
      const rad = deg * Math.PI / 180;
      return [n.centerX + n.radiusX * Math.cos(rad), n.centerY - n.radiusY * Math.sin(rad)];
    };
    const len = Math.max(-360, Math.min(360, n.length));
    if (Math.abs(len) >= 360) {
      const [x1, y1] = point(n.startAngle), [x2, y2] = point(n.startAngle + 180);
      return "M" + x1 + " " + y1 + " A" + n.radiusX + " " + n.radiusY + " 0 1 0 " + x2 + " " + y2 +
        " A" + n.radiusX + " " + n.radiusY + " 0 1 0 " + x1 + " " + y1 + " Z";
    }
    const [sx, sy] = point(n.startAngle), [ex, ey] = point(n.startAngle + len);
    const large = Math.abs(len) > 180 ? 1 : 0, sweep = len > 0 ? 0 : 1;
    const arc = "A" + n.radiusX + " " + n.radiusY + " 0 " + large + " " + sweep + " " + ex + " " + ey;
    if (n.arcType === "ROUND") return "M" + n.centerX + " " + n.centerY + " L" + sx + " " + sy + " " + arc + " Z";
    if (n.arcType === "CHORD") return "M" + sx + " " + sy + " " + arc + " Z";
    return "M" + sx + " " + sy + " " + arc;
  }
};

/*
 * The student's own drills Q7-Q25 from builder v1, kept as parameterised complete programs.
 * Titles are English so that the generated window titles stay ASCII.
 */
"use strict";

const Practice = (() => {
  const num = (key, label, value, min = -10000, max = 10000) => ({ key, label, type: "number", value: String(value), min, max });
  const int = (key, label, value, min, max) => ({ key, label, type: "int", value: String(value), min, max });
  const sel = (key, label, value, options) => ({ key, label, type: "select", value, options });
  const msg = (key, label, value) => ({ key, label, type: "text", value });
  const colorSel = (key, label, value) => sel(key, label, value, Java.COLORS.slice(0, 20).map(c => [c, c]));
  const coords = (x = 100, y = 100) => [num("x", "初始圆心 X", x, 0), num("y", "初始圆心 Y", y, 0)];
  const radius = (v = 30) => num("radius", "初始半径", v, 0.01);
  const step = v => num("step", "每次移动 / 增加量", v, 0.01);
  const minMax = (x0, x1, y0, y1) => [num("minX", "X 下限", x0, 0), num("maxX", "X 上限", x1, 0), num("minY", "Y 下限", y0, 0), num("maxY", "Y 上限", y1, 0)];
  const count = int("count", "起始计数", 0, -1000000, 1000000);
  const increment = int("increment", "计数步长", 1, 1, 1000000);
  const styleSel = sel("handlerStyle", "按钮处理器写法", "lambda", [["lambda", "Lambda"], ["anonymous", "匿名内部类"], ["named", "命名内部类"]]);

  const str = Java.str;
  const btn = (name, caption) => "Button " + name + " = new Button(" + str(caption) + ");";
  const labelDecl = (name, value) => "Label " + name + " = new Label(" + str(value) + ");";
  const inputDecl = (name, value) => "TextField " + name + " = new TextField(" + str(value) + ");";
  const labelSet = (target, value) => target + ".setText(" + str(value) + ");";
  const circleSetup = (x, y, r, color = "BLUE") => "Circle c = new Circle(" + x + ", " + y + ", " + r + ", Color." + color + ");";
  const positionSet = (x, y) => "c.setCenterX(" + x + ");\nc.setCenterY(" + y + ");";
  const coordinateText = (x, y) => '"Position: (" + ' + x + ' + ", " + ' + y + ' + ")"';

  function registration(target, setter, code, eventType = "ActionEvent", style = "lambda", name = "ButtonHandler") {
    if (style === "named") {
      return "class " + name + " implements EventHandler<" + eventType + "> {\n    @Override\n    public void handle(" + eventType +
        " e) {\n" + Java.indent(code, 8) + "\n    }\n}\n" + target + "." + setter + "(new " + name + "());";
    }
    if (style === "anonymous") {
      return target + "." + setter + "(new EventHandler<" + eventType + ">() {\n    @Override\n    public void handle(" + eventType +
        " e) {\n" + Java.indent(code, 8) + "\n    }\n});";
    }
    return target + "." + setter + "(e -> {\n" + Java.indent(code, 4) + "\n});";
  }
  const onAction = (target, code, style, name) => registration(target, "setOnAction", code, "ActionEvent", style, name);

  function program(name, title, parts) {
    const imports = new Set(["javafx.application.Application", "javafx.geometry.Insets", "javafx.scene.Scene",
      "javafx.scene.layout.HBox", "javafx.scene.layout.VBox", "javafx.stage.Stage", ...(parts.imports || [])]);
    const canvas = parts.canvas || "pane";
    if (parts.circle) for (const i of ["javafx.scene.layout.Pane", "javafx.scene.layout.BorderPane", "javafx.scene.paint.Color", "javafx.scene.shape.Circle"]) imports.add(i);
    for (const i of parts.nodes || []) imports.add("javafx.scene.control." + i);
    const start = [];
    if (parts.circle) {
      const [w, h] = parts.size || [340, 240];
      start.push("Pane " + canvas + " = new Pane();", canvas + ".setPrefSize(" + w + ", " + h + ");",
        canvas + '.setStyle("-fx-background-color: #eef4f4;");', parts.circle, canvas + ".getChildren().add(c);");
    }
    start.push(...(parts.declarations || []));
    const items = parts.controls || [];
    start.push("HBox controls = new HBox(8" + (items.length ? ", " + items.join(", ") : "") + ");", "controls.setPadding(new Insets(10));");
    if (parts.circle) start.push("BorderPane root = new BorderPane(" + canvas + ");", "root.setBottom(controls);");
    else start.push("VBox root = new VBox(8, controls);");
    start.push("Scene scene = new Scene(root);");
    if (parts.focus) {
      start.push(canvas + ".setFocusTraversable(true);");
      for (const n of parts.focus) start.push(n + ".setFocusTraversable(false);");
    }
    start.push("", ...(parts.handlers || []).flatMap(v => [v, ""]));
    start.push("stage.setTitle(" + str(title) + ");", "stage.setScene(scene);", "stage.show();");
    if (parts.focus) start.push(canvas + ".requestFocus();");
    return Java.importBlock([...imports]) + "\n\npublic class " + name + " extends Application {\n" +
      (parts.members ? Java.indent(parts.members, 4) + "\n\n" : "") + "    @Override\n    public void start(Stage stage) {\n" +
      Java.indent(start.join("\n"), 8) + "\n    }\n\n    public static void main(String[] args) {\n        launch(args);\n    }\n}\n";
  }

  function parts(id, v) {
    const circle = (x = v.x ?? 100, y = v.y ?? 100) => circleSetup(x, y, v.radius ?? 20);
    const reset = code => onAction("resetBtn", code);
    const text = (target, value) => labelSet(target, value);
    const base = (declarations, controls, handlers, extra = {}) => ({ nodes: ["Button", "Label"], declarations, controls, handlers, ...extra });
    switch (id) {
      case "q7": return base([btn("moveBtn", "Move Right"), btn("colorBtn", "Change Color")], ["moveBtn", "colorBtn"], [
        onAction("moveBtn", "c.setCenterX(c.getCenterX() + " + v.step + ");"), onAction("colorBtn", "c.setFill(Color." + v.insideColor + ");")
      ], { circle: circle() });
      case "q8": return base([labelDecl("counter", String(v.count)), btn("increaseBtn", "Increase"), btn("resetBtn", "Reset")],
        ["counter", "increaseBtn", "resetBtn"], [
          onAction("increaseBtn", "int n = Integer.parseInt(counter.getText());\ncounter.setText(String.valueOf(n + " + v.increment + "));"),
          reset(text("counter", String(v.count)))
        ]);
      case "q9": case "q14": {
        const prefix = id === "q14" ? "Radius: " : "";
        const style = id === "q14" ? "anonymous" : v.handlerStyle;
        return base([labelDecl("radiusLabel", prefix + v.radius), btn("increaseBtn", "Increase Radius"), btn("resetBtn", "Reset")],
          ["radiusLabel", "increaseBtn", "resetBtn"], [
            onAction("increaseBtn", "c.setRadius(c.getRadius() + " + v.step + ");\nradiusLabel.setText(" + str(prefix) + " + c.getRadius());", style, "IncreaseRadiusHandler"),
            reset("c.setRadius(" + v.radius + ");\n" + text("radiusLabel", prefix + v.radius))
          ], { circle: circle(), imports: style === "lambda" ? [] : ["javafx.event.ActionEvent", "javafx.event.EventHandler"] });
      }
      case "q10": case "q20": case "q21": {
        const prefix = id === "q10" ? "" : "Radius: ";
        const label = id === "q21" ? "statusLabel" : "radiusLabel";
        const initial = String(v.radius);
        const target = id === "q20" ? "radiusInput" : "applyBtn";
        const shown = id === "q10" ? "radiusInput.getText()" : "newRadius";
        const apply = "double newRadius = Double.parseDouble(radiusInput.getText().trim());\nc.setRadius(newRadius);\n" + label + ".setText(" + str(prefix) + " + " + shown + ");";
        const validated = "try {\n    double newRadius = Double.parseDouble(radiusInput.getText().trim());\n    if (newRadius <= 0) {\n        " +
          text(label, v.invalid ?? "Invalid radius") + "\n        return;\n    }\n    c.setRadius(newRadius);\n    " + label +
          '.setText("Radius: " + newRadius);\n} catch (NumberFormatException ex) {\n    ' + text(label, v.invalid ?? "Invalid radius") + "\n}";
        const decl = [inputDecl("radiusInput", initial), labelDecl(label, prefix + initial), btn("resetBtn", "Reset")];
        if (id !== "q20") decl.push(btn("applyBtn", "Apply"));
        return base(decl, ["radiusInput", ...(id === "q20" ? [] : ["applyBtn"]), "resetBtn", label], [
          onAction(target, id === "q21" ? validated : apply),
          reset("c.setRadius(" + v.radius + ");\nradiusInput.setText(" + str(initial) + ");\n" + text(label, prefix + initial))
        ], { circle: circle(), nodes: ["Button", "Label", "TextField"] });
      }
      case "q11": case "q18": {
        const clicked = id === "q11";
        const holder = clicked ? "canvas" : "pane";
        const initial = clicked ? "X: " + v.x + ", Y: " + v.y : "Position: (" + v.x + ", " + v.y + ")";
        const update = clicked ? '\npositionLabel.setText("X: " + e.getX() + ", Y: " + e.getY());' : "";
        const handlers = [registration(holder, clicked ? "setOnMouseClicked" : "setOnMouseDragged", positionSet("e.getX()", "e.getY()") + update)];
        if (!clicked) handlers.push(registration(holder, "setOnMouseReleased", "positionLabel.setText(" + coordinateText("c.getCenterX()", "c.getCenterY()") + ");"));
        handlers.push(reset(positionSet(v.x, v.y) + "\n" + text("positionLabel", initial)));
        return base([labelDecl("positionLabel", initial), btn("resetBtn", "Reset")], ["resetBtn", "positionLabel"], handlers, { circle: circle(), canvas: holder });
      }
      case "q12": case "q23": {
        const check = id === "q23" ? "\nif (nextX < " + v.minX + " || nextX > " + v.maxX + ") {\n    " + text("statusLabel", v.invalid) + "\n    return;\n}" : "";
        return base([labelDecl("statusLabel", "X: " + v.x), btn("resetBtn", "Reset")], ["resetBtn", "statusLabel"], [
          registration("scene", "setOnKeyPressed", "if (e.getCode() != KeyCode.LEFT && e.getCode() != KeyCode.RIGHT) {\n    return;\n}\n" +
            "double nextX = c.getCenterX() + (e.getCode() == KeyCode.LEFT ? -" + v.step + " : " + v.step + ");" + check +
            '\nc.setCenterX(nextX);\nstatusLabel.setText("X: " + c.getCenterX());'),
          reset("c.setCenterX(" + v.x + ");\n" + labelSet("statusLabel", "X: " + v.x))
        ], { circle: circle(), imports: ["javafx.scene.input.KeyCode"], focus: ["resetBtn"], size: [Math.max(v.maxX ?? 320, v.x) + 35, Math.max(v.y + 35, 240)] });
      }
      case "q13": return base([labelDecl("counter", String(v.count)), btn("increaseBtn", "Increase"), btn("decreaseBtn", "Decrease")],
        ["counter", "increaseBtn", "decreaseBtn"], [
          "EventHandler<ActionEvent> handler = e -> {\n    int next = Integer.parseInt(counter.getText());\n    if (e.getSource() == increaseBtn) {\n        next += " +
          v.increment + ";\n    } else if (e.getSource() == decreaseBtn) {\n        next -= " + v.increment +
          ";\n    }\n    counter.setText(String.valueOf(next));\n};\nincreaseBtn.setOnAction(handler);\ndecreaseBtn.setOnAction(handler);"
        ], { imports: ["javafx.event.ActionEvent", "javafx.event.EventHandler"] });
      case "q15": return base([labelDecl("statusLabel", v.ready), btn("resetBtn", "Reset")], ["resetBtn", "statusLabel"], [
        registration("stage", "setOnCloseRequest", text("statusLabel", v.message) + "\ne.consume();"), reset(text("statusLabel", v.ready))
      ]);
      case "q16": {
        const repeat = v.repeat === "forever" ? "Animation.INDEFINITE" : String(v.cycles);
        const axis = v.axis, next = "c.getCenter" + axis + "() + " + v.step;
        const tick = v.wrap === "yes" ? "double next = " + next + ";\nc.setCenter" + axis + "(next <= " + v.max + " ? next : " + (axis === "X" ? v.x : v.y) + ");"
          : "c.setCenter" + axis + "(" + next + ");";
        const timers = "KeyFrame tick = new KeyFrame(Duration.millis(" + v.interval + "), e -> {\n" + Java.indent(tick, 4) +
          "\n});\nTimeline timeline = new Timeline(tick);\ntimeline.setCycleCount(" + repeat + ");";
        return base([btn("startBtn", "Start"), btn("stopBtn", v.stopMode === "pause" ? "Pause" : "Stop")], ["startBtn", "stopBtn"], [
          timers, onAction("startBtn", "timeline.play();"),
          onAction("stopBtn", v.stopMode === "pause" ? "timeline.pause();" : v.stopMode === "reset" ? "timeline.stop();\n" + positionSet(v.x, v.y) : "timeline.stop();"),
          registration("stage", "setOnCloseRequest", "timeline.stop();")
        ], { circle: circle(), imports: ["javafx.animation.Animation", "javafx.animation.KeyFrame", "javafx.animation.Timeline", "javafx.util.Duration"] });
      }
      case "q17": return base(["counterLabel = new Label(" + str("Count: " + v.count) + ");", btn("clickBtn", "Click"), btn("resetBtn", "Reset")],
        ["clickBtn", "resetBtn", "counterLabel"], [
          "clickBtn.setOnAction(new ClickHandler());", reset("count = " + v.count + ";\n" + text("counterLabel", "Count: " + v.count))
        ], { imports: ["javafx.event.ActionEvent", "javafx.event.EventHandler"], members: "private int count = " + v.count +
          ";\nprivate Label counterLabel;\n\nprivate class ClickHandler implements EventHandler<ActionEvent> {\n    @Override\n    public void handle(ActionEvent e) {\n        count++;\n        counterLabel.setText(\"Count: \" + count);\n    }\n}" });
      case "q19": return base([labelDecl("statusLabel", v.outside), labelDecl("clickLabel", "Clicks: " + v.count)], ["statusLabel", "clickLabel"], [
        registration("c", "setOnMouseEntered", "c.setFill(Color." + v.insideColor + ");\n" + text("statusLabel", v.inside)),
        registration("c", "setOnMouseExited", "c.setFill(Color." + v.outsideColor + ");\n" + text("statusLabel", v.outside)),
        registration("c", "setOnMouseClicked", 'int n = Integer.parseInt(clickLabel.getText().substring("Clicks: ".length()));\nclickLabel.setText("Clicks: " + (n + 1));')
      ], { circle: circleSetup(v.x, v.y, v.radius, v.outsideColor), nodes: ["Label"] });
      case "q22": {
        const init = "Position: (" + v.x + ", " + v.y + ")";
        const fail = text("positionLabel", v.invalid);
        return base([inputDecl("xInput", String(v.x)), inputDecl("yInput", String(v.y)), labelDecl("positionLabel", init), btn("applyBtn", "Apply Position"), btn("resetBtn", "Reset")],
          ["xInput", "yInput", "applyBtn", "resetBtn", "positionLabel"], [
            onAction("applyBtn", "try {\n    double newX = Double.parseDouble(xInput.getText().trim());\n    double newY = Double.parseDouble(yInput.getText().trim());\n    if (newX >= " +
              v.minX + " && newX <= " + v.maxX + " && newY >= " + v.minY + " && newY <= " + v.maxY + ") {\n" + Java.indent(positionSet("newX", "newY"), 8) +
              "\n        positionLabel.setText(" + coordinateText("newX", "newY") + ");\n    } else {\n        " + fail + "\n    }\n} catch (NumberFormatException ex) {\n    " + fail + "\n}"),
            reset(positionSet(v.x, v.y) + "\nxInput.setText(" + str(String(v.x)) + ");\nyInput.setText(" + str(String(v.y)) + ");\n" + text("positionLabel", init))
          ], { circle: circle(), nodes: ["Button", "Label", "TextField"], size: [Math.max(v.x, v.maxX) + 35, Math.max(v.y, v.maxY) + 35] });
      }
      case "q24": case "q25": {
        const follows = id === "q25";
        const holder = follows ? "pane" : "canvas";
        const ready = follows ? v.ready : "Position: (" + v.x + ", " + v.y + ")";
        const inside = follows ? "Inside: " : "Position: ";
        const move = positionSet("x", "y") + "\n" + (follows ? "c.setFill(Color." + v.insideColor + ");\n" : "") +
          "statusLabel.setText(" + str(inside + "(") + ' + x + ", " + y + ")");';
        const outside = (follows ? "c.setFill(Color." + v.outsideColor + ");\n" : "") + text("statusLabel", v.invalid);
        return base([labelDecl("statusLabel", ready), btn("resetBtn", "Reset")], ["resetBtn", "statusLabel"], [
          registration(holder, follows ? "setOnMouseMoved" : "setOnMouseClicked", "double x = e.getX();\ndouble y = e.getY();\nif (x >= " + v.minX +
            " && x <= " + v.maxX + " && y >= " + v.minY + " && y <= " + v.maxY + ") {\n" + Java.indent(move, 4) + "\n} else {\n" + Java.indent(outside, 4) + "\n}"),
          reset(positionSet(v.x, v.y) + "\n" + (follows ? "c.setFill(Color.BLUE);\n" : "") + text("statusLabel", ready))
        ], { circle: circle(), canvas: holder, size: [Math.max(320, v.maxX + 30), Math.max(220, v.maxY + 30)] });
      }
    }
    throw new Error("无法识别题目 " + id);
  }

  const catalog = [
    ["q7", "Q7 · Move Right and Change Color", "圆右移与变色", [...coords(100, 80), radius(20), step(20), colorSel("insideColor", "按钮设置的颜色", "GREEN")], "Move Right 每次右移，Change Color 改填充色。"],
    ["q8", "Q8 · Counter and Reset", "计数器与 Reset", [count, increment], "读取 Label 里的整数加一；Reset 恢复。"],
    ["q9", "Q9 · Increase Radius", "半径增加与 Reset", [radius(), step(10), styleSel], "c.getRadius() 读当前半径；可切换三种 Handler 写法。"],
    ["q10", "Q10 · Apply Radius from TextField", "Apply 读取半径", [radius()], "Double.parseDouble 读输入；题目假设输入合法。"],
    ["q11", "Q11 · Click to Place", "点击画布定位", [...coords(), radius(20)], "圆心移到点击位置，Label 显示坐标。"],
    ["q12", "Q12 · Arrow Keys", "方向键控制", [...coords(), radius(20), step(10)], "Scene 注册 KeyPressed，左右键改变 X。"],
    ["q13", "Q13 · Shared Handler", "两个按钮共用 Handler", [count, increment], "一个 EventHandler<ActionEvent> 注册给两个按钮，用 getSource() 区分。"],
    ["q14", "Q14 · Anonymous Inner Class", "匿名内部类", [radius(), step(5)], "Increase 用匿名 EventHandler，Reset 用 Lambda。"],
    ["q15", "Q15 · CloseRequest and consume", "关闭请求与 consume", [msg("ready", "初始状态", "Window is running"), msg("message", "关窗提示", "Closing is not allowed")], "点关闭触发 WindowEvent；consume() 阻止关闭。"],
    ["q16", "Q16 · Timeline Start and Stop", "Timeline 开始与停止", [...coords(), radius(20), int("interval", "KeyFrame 间隔（ms）", 500, 1, 600000), step(10),
      sel("axis", "运动轴", "X", [["X", "X"], ["Y", "Y"]]), sel("repeat", "播放次数", "forever", [["forever", "无限循环"], ["finite", "固定次数"]]),
      int("cycles", "固定循环次数", 10, 1, 1000000), sel("stopMode", "停止按钮行为", "stop", [["stop", "Stop"], ["pause", "Pause"], ["reset", "Stop 并复位"]]),
      sel("wrap", "越界后回绕", "no", [["no", "关闭"], ["yes", "开启"]]), num("max", "回绕边界", 300, 0)], "每隔一段时间移动；Start 播放，Stop 停止。"],
    ["q17", "Q17 · Named Inner Class", "命名内部类 ClickHandler", [count], "private class ClickHandler implements EventHandler<ActionEvent>。"],
    ["q18", "Q18 · Drag and Release", "拖动与释放", [...coords(100, 90), radius(20)], "拖动更新圆心，释放时显示最终位置。"],
    ["q19", "Q19 · Mouse Enter, Exit and Click", "进入、离开与点击计数", [...coords(), radius(20), count, colorSel("insideColor", "进入颜色", "RED"),
      colorSel("outsideColor", "离开颜色", "BLUE"), msg("inside", "进入文字", "Inside"), msg("outside", "离开文字", "Outside")], "Circle 上注册三种鼠标事件。"],
    ["q20", "Q20 · Enter Key in TextField", "TextField 回车触发", [radius()], "TextField 按 Enter 触发 ActionEvent。"],
    ["q21", "Q21 · Validate Positive Radius", "正数验证与异常处理", [radius(), msg("invalid", "失败提示", "Invalid radius")], "try/catch NumberFormatException；非法输入保持原半径。"],
    ["q22", "Q22 · Two Inputs and Bounds", "双输入坐标与边界", [...coords(), radius(20), ...minMax(0, 300, 0, 300), msg("invalid", "失败提示", "Invalid position")], "两个坐标都合法才移动。"],
    ["q23", "Q23 · Arrow Keys with Bounds", "方向键与边界", [...coords(), radius(20), step(10), num("minX", "X 下限", 20, 0), num("maxX", "X 上限", 280, 0),
      msg("invalid", "失败提示", "Boundary reached")], "越界时保持原位置。"],
    ["q24", "Q24 · Click with Bounds", "点击与边界", [...coords(), radius(15), ...minMax(20, 280, 20, 180), msg("invalid", "失败提示", "Boundary reached")], "区域内点击才移动。"],
    ["q25", "Q25 · Follow Mouse with Colors", "鼠标跟随与颜色", [...coords(), radius(15), ...minMax(50, 250, 50, 150), colorSel("insideColor", "区内颜色", "GREEN"),
      colorSel("outsideColor", "区外颜色", "RED"), msg("invalid", "区外提示", "Outside range"), msg("ready", "初始提示", "Ready")], "区内跟随鼠标，区外变色。"]
  ].map(([id, title, cn, fields, description]) => ({ id, title, cn, fields, description, className: "Practice" + id.toUpperCase() }));

  return {
    catalog,
    defaults(id) {
      const item = catalog.find(c => c.id === id);
      return Object.fromEntries([["className", item.className], ...item.fields.map(f => [f.key, f.value])]);
    },
    generate(id, raw, profile) {
      const item = catalog.find(c => c.id === id);
      if (!item) throw new Error("无法识别题目。");
      const className = Java.ident(raw.className ?? item.className, "类名");
      const v = {};
      for (const f of item.fields) {
        const input = String(raw[f.key] ?? f.value);
        if (f.type === "number" || f.type === "int") v[f.key] = Java.number(input, f.label, { min: f.min, max: f.max, integer: f.type === "int" });
        else if (f.type === "select") {
          if (!f.options.some(([value]) => value === input)) throw new Error(f.label + "：请选择有效选项。");
          v[f.key] = input;
        } else v[f.key] = input;
      }
      for (const axis of ["X", "Y"]) {
        const lo = v["min" + axis], hi = v["max" + axis], at = v[axis.toLowerCase()];
        if (lo !== undefined && hi !== undefined && lo > hi) throw new Error(axis + " 下限不能高于上限。");
        if (lo !== undefined && hi !== undefined && at !== undefined && (at < lo || at > hi)) throw new Error("初始 " + axis + " 应在范围内。");
      }
      const title = item.title.split(" · ")[1] + " - " + (profile.name || "YOUR NAME");
      const code = program(className, title, parts(id, v));
      return { files: [{ filename: className + ".java", code: Java.withHeader(code, profile), kind: "class" }], main: className, warnings: [] };
    }
  };
})();

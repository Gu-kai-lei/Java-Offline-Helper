// Runtime smoke tests: launch compiled programs with FxSmoke.java, click through them and check
// the window after every step. Called by run_builder_tests.mjs --jdk --run (needs a desktop session).
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const GREEN = "0x008000ff", BLUE = "0x0000ffff", RED = "0xff0000ff", ORANGE = "0xffa500ff";
const badInventory = "isbn;title;available;copies\n777;Valid but must not replace old records;true;3\n999;Malformed;perhaps;3\n";

const cases = [
  { label: "oop/a2/split", main: "JavaFXMainApp", name: "A2: add, move down x5, blue, clear, move with no shape",
    steps: ["click:Add Circle", ...Array(5).fill("click:Move Down"), "click:Color: Blue", "click:Color: Red", "click:Clear Screen", "click:Move Up"],
    check(s, out) {
      assert.match(s[0].title, /Test Student/);
      assert.equal(s[0].shapes.length, 0);
      assert.deepEqual([s[1].shapes.length, s[1].shapes[0].cx, s[1].shapes[0].cy, s[1].shapes[0].r, s[1].shapes[0].fill], [1, 100, 100, 50, GREEN]);
      assert.equal(s[6].shapes[0].cy, 175);
      assert.equal(s[7].shapes[0].fill, BLUE);
      assert.equal(s[8].shapes[0].fill, RED);
      assert.equal(s[9].shapes.length, 0);
      assert.equal(s[10].shapes.length, 0);
      assert.match(out, /Area of circle = 7853\.98/);
      assert.match(out, /No shape yet/);
    } },
  { label: "skeleton/a2 + main app", main: "JavaFXMainApp", name: "A2 skeleton completed by the filler + generated main app",
    steps: ["click:Add Circle", ...Array(5).fill("click:Move Down"), "click:Color: Blue"],
    check(s, out) {
      assert.deepEqual([s[1].shapes[0].cx, s[1].shapes[0].cy, s[1].shapes[0].r, s[1].shapes[0].fill], [100, 100, 50, GREEN]);
      assert.equal(s[6].shapes[0].cy, 175);
      assert.equal(s[7].shapes[0].fill, BLUE);
      assert.match(out, /Area of circle = 7853\.98/);
    } },
  { label: "skeleton/variant + main app", main: "JavaFXMainApp", name: "renamed variant: rectangle, move left, red, enlarge",
    steps: ["click:Add Rectangle", "click:Move Left", "click:Color: Red", "click:Enlarge", "click:Add Square"],
    check(s) {
      assert.deepEqual([s[1].shapes[0].type, s[1].shapes[0].x, s[1].shapes[0].y, s[1].shapes[0].w, s[1].shapes[0].fill], ["Rectangle", 100, 80, 120, ORANGE]);
      assert.equal(s[2].shapes[0].x, 80);
      assert.equal(s[3].shapes[0].fill, RED);
      assert.equal(s[4].shapes[0].w, 130);
      assert.equal(s[5].shapes.length, 2, "two subclasses -> ArrayList keeps both");
    } },
  { label: "oop/multi/split", main: "ShapeDrawer", name: "ArrayList of three shape types, enlarge, remove last, clear",
    steps: ["click:Add Circle", "click:Add Rectangle", "click:Add Square", "click:Enlarge", "click:Remove Last", "click:Clear"],
    check(s) {
      assert.equal(s[3].shapes.length, 3);
      assert.equal(s[4].shapes[2].w, 90);
      assert.match(s[4].labels.join("|"), /Area: 8100\.00/);
      assert.equal(s[5].shapes.length, 2);
      assert.equal(s[6].shapes.length, 0);
    } },
  { label: "record/lab3/split", main: "LibraryAdminApp", name: "Lab 3: load, duplicate, borrow/return, add, search, edit, delete, sort, file",
    steps: ["click:Load Test Data", "click:Load Test Data", "select:0", "click:Borrow", "click:Return", "click:Clear",
      "type:0:9999999999", "type:1:New Book", "click:Add", "click:Add", "type:1:html", "click:Search", "click:Display All",
      "select:3", "click:Edit", "type:1:Changed Title", "click:Save", "select:3", "click:Delete", "click:Sort by Title", "click:Delete"],
    check(s, out, dir) {
      const file = () => fs.readFileSync(path.join(dir, "books.txt"), "utf8").trim().split(/\r?\n/);
      assert.equal(s[0].items.length, 0);
      assert.match(s[0].labels.join("|"), /Name: Test Student {8}Student ID: DEMO-ID/);
      assert.match(s[0].labels.join("|"), /Program Started: \d{4}-\d\d-\d\d \d\d:\d\d:\d\d/);
      assert.equal(s[1].items.length, 3);
      assert.deepEqual(s[2].alerts, ["Duplicate ISBN: 0131450913, 0131857576, 0132222205 already exists."]);
      assert.deepEqual(s[3].fields, ["0131450913", "HTML How to Program"]);
      assert.ok(s[3].disabled.includes("Return") && !s[3].disabled.includes("Borrow"), "Return disabled for an available book");
      assert.match(s[4].items[0], /Not available/);
      assert.ok(s[4].disabled.includes("Borrow") && !s[4].disabled.includes("Return"));
      assert.match(s[5].items[0], /\| {2}Available/);
      assert.deepEqual(s[6].fields, ["", ""]);
      assert.equal(s[9].items.length, 4);
      assert.deepEqual(s[10].alerts, ["Please enter both ISBN and Title."]);
      assert.equal(s[12].items.length, 1);
      assert.equal(s[13].items.length, 4);
      assert.ok(s[15].disabled.includes("Add") && !s[15].disabled.includes("Save"), "edit mode: only Save and Exit");
      assert.match(s[17].items[3], /Changed Title/);
      assert.equal(s[19].items.length, 3);
      assert.deepEqual(s[20].items.map(i => i.split("  |  ")[1]), ["C++ How to Program", "HTML How to Program", "Java How to Program"]);
      assert.deepEqual(s[21].alerts, ["Please enter or select an ISBN."]);
      // Sorting changes the ArrayList but must not save (Lab 3 rule), so the file keeps the last saved order.
      assert.deepEqual(file(), ["0131450913,HTML How to Program,true", "0131857576,C++ How to Program,true", "0132222205,Java How to Program,true"]);
    } },
  { label: "record/products/single", main: "InventoryApp", name: "int/double fields: bad number alert, add, display format, file line",
    steps: ["type:0:P900", "type:1:Stapler", "type:2:3", "type:3:abc", "click:Add", "type:3:9.5", "click:Add"],
    check(s, out, dir) {
      assert.deepEqual(s[5].alerts, ["Please enter a valid number for Price."]);
      assert.deepEqual(s[7].items, ["P900 | Stapler | Qty: 3 | $9.50"]);
      assert.equal(fs.readFileSync(path.join(dir, "inventory.txt"), "utf8").trim(), "P900,Stapler,3,9.5");
    } },
  // ----- the six self-written exam variants (answers produced only with the builder UI) -----
  { label: "variant/A2-1", main: "RectangleApp", name: "variant A2-1 Rectangle Mover (given skeleton + main app)",
    steps: ["click:Add Rectangle", "click:Right", "click:Right", "click:Up", "click:Yellow", "click:Clear", "click:Left"],
    check(s, out) {
      assert.match(s[0].title, /^Rectangle Mover - Test Student$/);
      const r = s[1].shapes[0];
      assert.deepEqual([r.type, r.x, r.y, r.w, r.h, r.fill], ["Rectangle", 80, 60, 120, 60, ORANGE]);
      assert.equal(s[3].shapes[0].x, 120);
      assert.equal(s[4].shapes[0].y, 40);
      assert.equal(s[5].shapes[0].fill, "0xffff00ff");
      assert.equal(s[6].shapes.length, 0);
      assert.equal(s[7].shapes.length, 0);
      assert.match(out, /Area of rectangle = 7200\.0/);
      assert.match(out, /No shape yet/);
    } },
  { label: "variant/A2-2", main: "CircleStudio", name: "variant A2-2 Circle Studio (radius TextField, two button panels, info label)",
    steps: ["click:Add Circle", "click:Enlarge", ...Array(9).fill("click:Shrink"), "click:Red", "type:0:abc", "click:Add Circle", "click:Clear"],
    check(s) {
      assert.ok(s[0].labels.includes("No circle") && s[0].labels.includes("Radius:"));
      assert.deepEqual(s[0].fields, ["40"]);
      const c = s[1].shapes[0];
      assert.deepEqual([c.cx, c.cy, c.r, c.fill], [150, 120, 40, BLUE]);
      assert.ok(s[1].labels.includes("Area: 5026.55   Perimeter: 251.33"), s[1].labels.join("|"));
      assert.equal(s[2].shapes[0].r, 45);
      assert.equal(s[11].shapes[0].r, 5);
      assert.equal(s[12].shapes[0].fill, RED);
      assert.ok(s[14].labels.includes("Invalid radius"));
      assert.equal(s[14].shapes[0].r, 5, "invalid radius adds nothing");
      assert.equal(s[15].shapes.length, 0);
      assert.ok(s[15].labels.includes("No circle"));
    } },
  { label: "variant/A2-3", main: "ShapeCollection", name: "variant A2-3 Shape Collection (ArrayList, save to and load from shapes.txt)",
    steps: ["click:Add Circle", "click:Add Square", "click:Move Right", "click:Blue", "click:Save", "click:Clear", "click:Load"],
    check(s, out, dir) {
      assert.equal(s[2].shapes.length, 2);
      assert.deepEqual(fs.readFileSync(path.join(dir, "shapes.txt"), "utf8").trim().split(/\r?\n/),
        ["CircleShape,100.0,100.0,0x008000ff,30.0", "SquareShape,130.0,100.0,0x0000ffff,60.0"]);
      assert.equal(s[6].shapes.length, 0);
      const [circle, square] = s[7].shapes;
      assert.deepEqual([circle.type, circle.cx, circle.fill], ["Circle", 100, GREEN]);
      assert.deepEqual([square.type, square.x, square.w, square.fill], ["Rectangle", 100, 60, BLUE]);
      assert.match(out, /2 shape\(s\) loaded from shapes\.txt/);
    } },
  { label: "variant/L3-1", main: "StudentApp", name: "variant L3-1 Student Records (statistics, sort, errors, reload)",
    steps: ["type:0:S001", "type:1:Amy", "type:2:78.5", "click:Add", "type:0:S002", "type:1:Ben", "type:2:91", "click:Add",
      "type:0:S003", "type:1:Chris", "type:2:45", "click:Add", "click:Statistics", "click:Sort by Score",
      "type:0:S004", "type:1:Dan", "type:2:x", "click:Add", "type:0:S001", "type:1:Amy", "type:2:50", "click:Add"],
    check(s, out, dir) {
      assert.equal(s[12].items.length, 3);
      assert.ok(s[13].labels.includes("Count: 3   Average: 71.50   Highest: 91.00   Lowest: 45.00"), s[13].labels.join("|"));
      assert.deepEqual(s[14].items.map(i => i.split("  |  ")[1]), ["Chris", "Amy", "Ben"]);
      assert.deepEqual(s[18].alerts, ["Please enter a valid number for Score."]);
      assert.deepEqual(s[22].alerts, ["Duplicate ID: S001 already exists."]);
      assert.equal(fs.readFileSync(path.join(dir, "students.txt"), "utf8").trim().split(/\r?\n/).length, 3);
    },
    restart: { steps: [], check(s) { assert.equal(s[0].items.length, 3, "students.txt is read at start-up"); } } },
  { label: "variant/L3-2", main: "InventoryApp", name: "variant L3-2 Inventory (Sell/Restock limits, display format)",
    steps: ["type:0:P100", "type:1:Pen", "type:2:2", "type:3:5.5", "click:Add", "select:0", "click:Sell", "click:Sell", "click:Sell",
      "click:Restock", "click:Display All", "click:Sell"],
    check(s, out, dir) {
      assert.deepEqual(s[5].items, ["P100 | Pen | Qty: 2 | $5.50"]);
      assert.deepEqual(s[8].items, ["P100 | Pen | Qty: 0 | $5.50"]);
      assert.deepEqual(s[9].alerts, ["Out of stock."]);
      assert.deepEqual(s[10].items, ["P100 | Pen | Qty: 10 | $5.50"]);
      assert.deepEqual(s[12].alerts, ["Please select a product first."]);
      assert.equal(fs.readFileSync(path.join(dir, "inventory.txt"), "utf8").trim(), "P100,Pen,10,5.5");
    } },
  { label: "variant/L3-3", main: "LibraryApp", name: "variant L3-3 Library (given Book.java, TextArea, borrow by typed ISBN)",
    steps: ["type:0:0131450913", "type:1:HTML How to Program", "click:Add", "type:0:0131857576", "type:1:C++ How to Program", "click:Add",
      "type:0:0131450913", "click:Borrow", "click:Borrow", "click:Return", "type:0:999", "click:Delete", "click:Add"],
    check(s, out, dir) {
      assert.equal(s[6].areas[0], "0131450913 | HTML How to Program | true\n0131857576 | C++ How to Program | true\n");
      assert.match(s[8].areas[0], /^0131450913 \| HTML How to Program \| false$/m);
      assert.deepEqual(s[9].alerts, ["The selected book is not available."]);
      assert.match(s[10].areas[0], /^0131450913 \| HTML How to Program \| true$/m);
      assert.deepEqual(s[12].alerts, ["Book with ISBN 999 cannot be found."]);
      assert.deepEqual(s[13].alerts, ["Please enter both ISBN and Title."]);
      assert.equal(fs.readFileSync(path.join(dir, "books.txt"), "utf8").trim().split(/\r?\n/)[0], "0131450913,HTML How to Program,true");
    } },
  // ----- round 2: the examinee check (keyboard, mouse, Timeline, custom buttons, manual save, filters, radio buttons, text results) -----
  { label: "round2/Q1", main: "PainterApp", name: "round 2 Q1 Square Painter (arrow keys, click to place, area label)",
    steps: ["click:New Square", "key:RIGHT", "key:LEFT", "key:LEFT", "mouse:CLICKED:200:150", "click:Blue", "click:Clear", "key:LEFT"],
    check(s, out) {
      assert.match(s[0].title, /^Square Painter - Test Student$/);
      assert.ok(s[0].labels.includes("No square"));
      const r = s[1].shapes[0];
      assert.deepEqual([r.type, r.x, r.y, r.w, r.h, r.fill], ["Rectangle", 100, 100, 80, 80, RED]);
      assert.ok(s[1].labels.includes("Area: 6400.00"), s[1].labels.join("|"));
      assert.equal(s[2].shapes[0].x, 125);
      assert.equal(s[4].shapes[0].x, 75);
      assert.deepEqual([s[5].shapes[0].x, s[5].shapes[0].y], [200, 150]);
      assert.equal(s[6].shapes[0].fill, BLUE);
      assert.equal(s[8].shapes.length, 0);
      assert.match(out, /Area of square = 6400\.0/);
    } },
  { label: "round2/Q2", main: "BallApp", name: "round 2 Q2 Moving Ball (Timeline start, stop, reset)",
    steps: ["click:Add Ball", "click:Start", "wait:600", "click:Stop", "wait:300", "click:Reset", "wait:200"],
    check(s) {
      assert.deepEqual([s[1].shapes[0].cx, s[1].shapes[0].cy, s[1].shapes[0].r, s[1].shapes[0].fill], [40, 100, 20, ORANGE]);
      assert.ok(s[3].shapes[0].cx >= 60, "ball moved while the timeline ran: " + s[3].shapes[0].cx);
      assert.equal(s[5].shapes[0].cx, s[4].shapes[0].cx, "ball stays where it stopped");
      assert.equal(s[7].shapes[0].cx, 40, "reset stops the animation and restores the start position");
    } },
  { label: "round2/Q3", main: "ContactApp", name: "round 2 Q3 Contact Book (button texts, explicit save and load, count label)",
    steps: ["type:0:Amy", "type:1:123", "type:2:amy@example.test", "click:Add Contact", "type:0:Ben", "type:1:456", "type:2:ben@example.test", "click:Add Contact",
      "click:Save to File", "type:0:Cat", "type:1:789", "type:2:cat@example.test", "click:Add Contact", "click:Remove"],
    check(s, out, dir) {
      assert.ok(s[0].labels.includes("Total contacts: 0"));
      assert.ok(s[13].labels.includes("Total contacts: 3"));
      assert.deepEqual(s[14].alerts, ["Please enter or select a Name."]);
      assert.deepEqual(fs.readFileSync(path.join(dir, "contacts.txt"), "utf8").trim().split(/\r?\n/), ["Amy,123,amy@example.test", "Ben,456,ben@example.test"],
        "only Save to File writes the file");
    },
    restart: { steps: ["click:Load from File"], check(s) {
      assert.equal(s[0].items.length, 0, "nothing is loaded automatically");
      assert.equal(s[1].items.length, 2);
      assert.ok(s[1].labels.includes("2 contact(s) loaded.") && s[1].labels.includes("Total contacts: 2"), s[1].labels.join("|"));
    } } },
  { label: "round2/Q4", main: "GradeApp", name: "round 2 Q4 Grade Book (given class, getGrade() in the list, filter, total)",
    steps: ["type:0:S001", "type:1:Amy", "type:2:78", "click:Add", "type:0:S002", "type:1:Ben", "type:2:91", "click:Add",
      "type:0:S003", "type:1:Chris", "type:2:45", "click:Add", "click:Summary", "click:Pass List", "click:Display All"],
    check(s) {
      assert.deepEqual(s[12].items, ["S001 Amy 78 B", "S002 Ben 91 A", "S003 Chris 45 F"]);
      assert.ok(s[13].labels.includes("Count: 3   Total: 214   Average: 71.33"), s[13].labels.join("|"));
      assert.deepEqual(s[14].items, ["S001 Amy 78 B", "S002 Ben 91 A"]);
      assert.equal(s[15].items.length, 3);
    } },
  { label: "round2/Q5", main: "TrafficLight", name: "round 2 Q5 Traffic Light (radio buttons, check box)",
    steps: ["click:Red", "click:Green", "click:Show frame", "click:Show frame"],
    check(s) {
      const GREY = "0xd3d3d3ff";
      assert.deepEqual(s[0].shapes.map(x => x.fill), ["0xa9a9a9ff", GREY, GREY, GREY]);
      assert.deepEqual(s[1].shapes.map(x => x.fill).slice(1), [RED, GREY, GREY]);
      assert.deepEqual(s[2].shapes.map(x => x.fill).slice(1), [GREY, GREY, GREEN]);
      assert.equal(s[3].shapes[0].visible, false);
      assert.equal(s[4].shapes[0].visible, true);
    } },
  { label: "round2/Q6", main: "BMICalculator", name: "round 2 Q6 BMI Calculator (category text by range)",
    steps: ["click:Compute BMI", "type:0:95", "click:Compute BMI", "type:0:abc", "click:Compute BMI"],
    check(s) {
      assert.ok(s[1].labels.includes("20.76") && s[1].labels.includes("Normal"), s[1].labels.join("|"));
      assert.ok(s[3].labels.includes("32.87") && s[3].labels.includes("Obese"), s[3].labels.join("|"));
      assert.deepEqual(s[5].alerts, ["Please enter valid numbers."]);
    } },
  // ----- presets added with the practice page -----
  { label: "calc/grade/single", main: "GradeCalculator", name: "preset grade calculator: text by range, edges and bad input",
    steps: ["click:Get Grade", "type:0:49", "click:Get Grade", "type:0:50", "click:Get Grade", "type:0:80", "click:Get Grade",
      "type:0:101", "click:Get Grade", "type:0:abc", "click:Get Grade"],
    check(s) {
      const grade = i => s[i].labels[s[i].labels.indexOf("Grade:") + 1];
      assert.deepEqual([grade(1), grade(3), grade(5), grade(7)], ["B", "F", "C", "A"]);
      assert.deepEqual(s[9].alerts, ["Mark (0-100): must be >= 0 and <= 100."]);
      assert.deepEqual(s[11].alerts, ["Please enter valid numbers."]);
    } },
  { label: "example/HandlerStylesDemo", main: "HandlerStylesDemo", name: "worked example: four handler styles",
    steps: ["click:1 Separate class", "click:2 Inner class", "click:3 Anonymous class", "click:4 Lambda"],
    check(s) {
      assert.deepEqual([1, 2, 3, 4].map(i => s[i].labels[0]), ["Separate class", "Inner class", "Anonymous class", "Lambda"]);
    } },
  { label: "example/InputCheckDemo", main: "InputCheckDemo", name: "worked example: number input, range and Alert",
    steps: ["type:0:abc", "click:Area", "type:0:500", "enter:0", "type:0:10", "click:Area"],
    check(s) {
      assert.deepEqual(s[2].alerts, ["Please enter a number."]);
      assert.deepEqual(s[4].alerts, ["Radius must be between 1 and 100."]);
      assert.ok(s[6].labels.includes("Area: 314.16"), JSON.stringify(s[6].labels));
    } },
  { label: "example/A2ShapeApp", main: "A2ShapeApp", name: "worked example: A2 structure with a circle and a square",
    steps: ["click:Red", "click:Add Circle", "click:Move Down", "click:Red", "click:Add Square", "click:Clear"],
    check(s) {
      assert.ok(s[1].labels.includes("Add a shape."), "no shape: nothing happens");
      assert.ok(s[2].labels.includes("y = 100, area = 5026.5"));
      assert.ok(s[3].labels.includes("y = 115, area = 5026.5"));
      assert.ok(s[5].labels.includes("y = 100, area = 3600.0"));
      assert.ok(s[6].labels.includes("Cleared."));
    } },
  { label: "example/MiniLibraryDemo", main: "MiniLibraryDemo", name: "worked example: Lab 3 structure with books.txt",
    steps: ["type:0:111", "type:1:Java", "click:Add", "click:Add", "type:0:222", "type:1:FX", "click:Add", "type:0:111", "click:Borrow/Return",
      "type:0:999", "click:Delete", "type:0:222", "click:Delete"],
    check(s, out, dir) {
      assert.deepEqual(s[3].items, ["111 | Java | Available"]);
      assert.deepEqual(s[4].alerts, ["Duplicate ISBN: 111 already exists."]);
      assert.deepEqual(s[9].items, ["111 | Java | Borrowed", "222 | FX | Available"]);
      assert.deepEqual(s[11].alerts, ["Book not found."]);
      assert.deepEqual(fs.readFileSync(path.join(dir, "books.txt"), "utf8").trim().split(/\r?\n/), ["111,Java,false"]);
    } },
  { label: "example/WindowFlowDemo", main: "WindowFlowDemo", name: "worked example: run-time FlowPane buttons and a second Stage",
    steps: ["type:0:Java", "click:Add Tag", "type:0:FX", "click:Add Tag", "click:Java", "click:Settings...", "window:Settings",
      "type:0:Chan", "click:Save", "window:main"],
    check(s) {
      assert.ok(s[4].buttons.includes("Java") && s[4].buttons.includes("FX"), JSON.stringify(s[4].buttons));
      assert.ok(!s[5].buttons.includes("Java") && s[5].buttons.includes("FX"));
      assert.match(JSON.stringify(s[6].windows), /Settings/);
      assert.ok(s[10].labels.includes("Owner: Chan"), JSON.stringify(s[10].labels));
    } },
  { label: "blocks/paneRoot", main: "PaneRootApp", name: "preset Pane root: shapes and relocated controls straight in the root, click moves the circle",
    steps: ["click:Bigger", "click:Red", "mouse:CLICKED:120:200"],
    check(s) {
      assert.equal(s[0].root, "Pane");
      assert.ok(s[3].labels.includes("Circle at (120.0, 200.0), radius 35.0"), JSON.stringify(s[3].labels));
      assert.match(JSON.stringify(s[2].shapes), /ff0000/i);
    } },
  { label: "blocks/rootEvents", main: "RootEventsApp", name: "preset root events: clicks and arrow keys handled by the BorderPane root",
    steps: ["mouse:CLICKED:50:60", "key:RIGHT", "key:DOWN", "mouse:CLICKED:10:10:SECONDARY"],
    check(s) {
      assert.ok(s[1].labels.includes("Root clicked at (50.0, 60.0)"), JSON.stringify(s[1].labels));
      assert.ok(s[2].labels.includes("Key RIGHT: (60.0, 60.0)"), JSON.stringify(s[2].labels));
      assert.ok(s[3].labels.includes("Key DOWN: (60.0, 70.0)"), JSON.stringify(s[3].labels));
      assert.match(JSON.stringify(s[4].shapes), /ff0000/i);
    } },
  { label: "blocks/flowTags", main: "FlowTagsApp", name: "preset FlowPane tags: add at run time, empty input, Clear keeps 3, second Stage",
    steps: ["type:0:Swing", "click:Add Tag", "type:0:FX", "enter:0", "click:Add Tag", "click:Clear", "click:About"],
    check(s) {
      assert.deepEqual(s[0].labels, ["Java", "JavaFX", "OOP", "3 fixed tags"]);
      assert.deepEqual(s[2].labels, ["Java", "JavaFX", "OOP", "Swing", "Added: Swing"]);
      assert.deepEqual(s[4].labels, ["Java", "JavaFX", "OOP", "Swing", "FX", "Added: FX"]);
      assert.ok(s[5].labels.includes("Type a tag first"));
      assert.deepEqual(s[6].labels, ["Java", "JavaFX", "OOP", "Back to the 3 fixed tags"]);
      assert.match(JSON.stringify(s[7].windows), /About/);
    } },
  { label: "blocks/borderLayout", main: "BorderLayoutApp", name: "preset BorderPane: five regions, colour buttons, click moves the circle",
    steps: ["click:Blue", "mouse:CLICKED:60:70"],
    check(s) {
      // Labels are listed in scene-graph order (the order the regions were set), so compare without order.
      assert.deepEqual([...s[0].labels].sort(), ["Radius: 40", "Ready", "Shape Board"]);
      assert.ok(s[1].labels.includes("Color: BLUE"));
      assert.ok(s[2].labels.includes("Centre: (60.0, 70.0)"), JSON.stringify(s[2].labels));
    } },
  { label: "blocks/counter", main: "ClickCounter", name: "preset counter: +1, -1 and Reset change the label",
    steps: ["click:+1", "click:+1", "click:+1", "click:-1", "click:Reset"],
    check(s) {
      assert.ok(s[0].labels.includes("Count: 0"));
      assert.ok(s[3].labels.includes("Count: 3"));
      assert.ok(s[4].labels.includes("Count: 2"));
      assert.ok(s[5].labels.includes("Count: 0"));
    } },
  { label: "blocks/traffic", main: "TrafficLight", name: "preset traffic light: radio buttons and check box",
    steps: ["click:Red", "click:Green", "click:Show frame", "click:Show frame"],
    check(s) {
      const GREY = "0xd3d3d3ff";
      assert.deepEqual(s[1].shapes.map(x => x.fill).slice(1), [RED, GREY, GREY]);
      assert.deepEqual(s[2].shapes.map(x => x.fill).slice(1), [GREY, GREY, GREEN]);
      assert.deepEqual([s[2].shapes[0].visible, s[3].shapes[0].visible, s[4].shapes[0].visible], [true, false, true]);
    } },
  { label: "blocks/clickColor", main: "ClickCircle", name: "preset click circle: left click red, right click blue, reset",
    steps: ["mouse:CLICKED:120:80", "mouse:CLICKED:200:150:SECONDARY", "click:Reset"],
    check(s) {
      const c = i => [s[i].shapes[0].cx, s[i].shapes[0].cy, s[i].shapes[0].fill];
      assert.deepEqual(c(1), [120, 80, RED]);
      assert.deepEqual(c(2), [200, 150, BLUE]);
      assert.deepEqual(c(3), [100, 100, "0x808080ff"]);
      assert.match(s[1].labels.join("|"), /Clicked at/);
    } },
  { label: "blocks/closeGuard", main: "CloseGuard", name: "preset close guard: close request blocked until the box is ticked",
    steps: ["close", "click:I have saved my work", "close"],
    check(s, out) {
      assert.ok(s[1].labels.includes("Please tick the box first"), s[1].labels.join("|"));
      assert.equal((out.match(/Window closed/g) || []).length, 1, "only the ticked close request is allowed");
    } },
  { label: "calc/loan/single", main: "LoanCalculator", name: "Loan calculator result and invalid input",
    steps: ["click:Compute Payment", "type:0:0", "click:Compute Payment", "type:0:abc", "click:Compute Payment"],
    check(s) {
      assert.ok(s[1].labels.includes("177.47") && s[1].labels.includes("10648.42"), s[1].labels.join("|"));
      assert.ok(s[3].labels.includes("166.67") && s[3].labels.includes("10000.00"), s[3].labels.join("|"));
      assert.deepEqual(s[5].alerts, ["Please enter valid numbers."]);
    } },
  { label: "blocks/mouse", main: "JavaFXPractice", name: "blocks: follow inside the range, red outside, reset",
    steps: ["mouse:MOVED:120:100", "mouse:MOVED:10:10", "click:Reset"],
    check(s) {
      assert.deepEqual([s[1].shapes[0].cx, s[1].shapes[0].cy, s[1].shapes[0].fill], [120, 100, GREEN]);
      assert.deepEqual([s[2].shapes[0].cx, s[2].shapes[0].fill], [120, RED]);
      assert.match(s[1].labels.join("|"), /Inside: \(120\.0, 100\.0\)/);
      assert.deepEqual([s[3].shapes[0].cx, s[3].shapes[0].fill], [100, BLUE]);
    } },
  { label: "blocks/keys", main: "JavaFXPractice", name: "blocks: arrow keys with boundary",
    steps: ["key:RIGHT", "key:LEFT", "key:LEFT"],
    check(s) {
      assert.equal(s[1].shapes[0].cx, 110);
      assert.equal(s[3].shapes[0].cx, 90);
      assert.match(s[3].labels.join("|"), /X: 90\.0/);
    } },
  { label: "blocks/shift", main: "JavaFXPractice", name: "Q3: Shift moves 20, normal moves 5, neither can cross the boundary",
    steps: ["key:RIGHT", "key:RIGHT:SHIFT", ...Array(12).fill("key:RIGHT:SHIFT"), "key:RIGHT", "click:Reset"],
    check(s) {
      assert.equal(s[1].shapes[0].cx, 105);
      assert.equal(s[2].shapes[0].cx, 125);
      assert.equal(s[14].shapes[0].cx, 345);
      assert.ok(s[14].labels.includes("Boundary reached"));
      assert.equal(s[15].shapes[0].cx, 350);
      assert.equal(s[16].shapes[0].cx, 100);
    } },
  { label: "blocks/keyPractice", main: "KeyPractice", name: "KeyPractice: top-row and numpad digits, R, and movement after Reset",
    steps: ["key:LEFT", "key:UP", "key:DIGIT1", "key:DIGIT3", "key:NUMPAD9", "key:NUMPAD0", "key:A", "key:R",
      "click:Reset", "key:RIGHT", "key:DOWN"],
    check(s) {
      const readout = n => s[n].shapes.find(shape => shape.type === "Text").text;
      assert.equal(readout(2), "x = 190, y = 140, r = 30");
      assert.equal(readout(3), "x = 190, y = 140, r = 10");
      assert.equal(readout(4), "x = 190, y = 140, r = 30");
      for (const n of [5, 6, 7]) assert.equal(readout(n), "x = 190, y = 140, r = 90");
      assert.equal(readout(8), "x = 200, y = 150, r = 90");
      assert.equal(readout(9), "x = 200, y = 150, r = 30");
      assert.equal(readout(11), "x = 210, y = 160, r = 30");
    } },
  { label: "blocks/safeInput", main: "JavaFXPractice", name: "Q8: Apply and Enter share a handler and reject non-finite input",
    steps: ["type:0:42", "click:Apply", "type:0:65", "enter:0", "type:0:Infinity", "enter:0", "type:0:0", "click:Apply", "click:Reset"],
    check(s) {
      assert.equal(s[2].shapes[0].r, 42);
      assert.equal(s[4].shapes[0].r, 65);
      for (const at of [6, 8]) {
        assert.equal(s[at].shapes[0].r, 65);
        assert.ok(s[at].labels.includes("Invalid radius"));
      }
      assert.equal(s[9].shapes[0].r, 25);
      assert.equal(s[9].fields[0], "25");
    } },
  { label: "upgrade/wk8", main: "Lesson01StackPane", name: "Q2: no-code WK8 values and centered StackPane",
    steps: [],
    check([s]) {
      assert.deepEqual([s.title, s.root, s.sceneWidth, s.sceneHeight, s.button],
        ["EIE3320 - WK8 Practice 01", "StackPane", 500, 300, "EIE3320"]);
      assert.ok(Math.abs(s.buttonX - 250) < 2 && Math.abs(s.buttonY - 150) < 2);
    } },
  { label: "upgrade/rect", main: "RectangleWorkshop", name: "Q7: size limits apply to Add, Shrink and Enlarge",
    steps: ["click:Add Rectangle", "type:0:9", "click:Add Rectangle", "type:0:121", "click:Add Rectangle",
      "type:0:10", "type:1:10", "click:Add Rectangle", "click:Shrink",
      "type:0:120", "type:1:90", "click:Add Rectangle", "click:Enlarge"],
    check(s) {
      assert.deepEqual([s[1].shapes[0].w, s[1].shapes[0].h], [40,25]);
      for (const at of [3,5]) {
        assert.equal(s[at].shapes[0].w, 40);
        assert.ok(s[at].labels.includes("Invalid size"));
      }
      assert.deepEqual([s[9].shapes[0].w,s[9].shapes[0].h], [10,10]);
      assert.deepEqual([s[13].shapes[0].w,s[13].shapes[0].h], [120,90]);
    } },
  { label: "upgrade/search", main: "AndBookSearch", name: "Q10: AND matches both nonblank criteria and ignores empty fields",
    steps: ["click:Load Test Data","type:1:jAvA","click:Search","type:0:00","click:Search","click:Display All","click:Clear","click:Search"],
    check(s) {
      assert.equal(s[3].items.length, 2);
      assert.equal(s[5].items.length, 1);
      assert.match(s[5].items[0], /^001 /);
      assert.equal(s[8].items.length, 3);
      assert.match(s[8].alerts[0], /Please enter/);
    } },
  { label: "upgrade/stock", main: "CappedStock", name: "Q9: one stock range applies to Add, Edit and stock actions",
    steps: ["click:Load Test Data","select:0","click:Sell 2","click:Sell 2","click:Restock 3","click:Restock 3",
      "type:0:P2","type:1:Pencil","type:2:6","type:3:2.25","click:Add","select:0","click:Edit","type:2:-1","click:Save"],
    check(s, out, dir) {
      assert.match(s[3].items[0], /Qty: 0/);
      assert.deepEqual(s[4].alerts, ["Out of stock."]);
      assert.match(s[5].items[0], /Qty: 3/);
      assert.deepEqual(s[6].alerts, ["Stock limit reached."]);
      assert.equal(s[11].items.length, 1);
      for (const at of [11, 15]) assert.match(s[at].alerts[0], /Quantity must be/);
      assert.equal(fs.readFileSync(path.join(dir, "stock.txt"), "utf8").trim(), "P1,Pen,3,1.5");
    } },
  { label: "upgrade/files", main: "DelimitedLibrary", name: "Q4: UTF-8 semicolon header and quotes round-trip",
    prepare(dir) {
      fs.writeFileSync(path.join(dir, "inventory.txt"), '\uFEFFisbn;title;available;copies\n001;"Intro; ""Quote"", Java";true;3\n', "utf8");
    },
    steps: ["type:0:002","type:1:Java; \"Book\", 2","type:2:4","click:Add"],
    check(s, out, dir) {
      assert.match(s[0].items[0], /Intro; "Quote", Java/);
      assert.equal(s[4].items.length, 2);
      assert.equal(fs.readFileSync(path.join(dir, "inventory.txt"), "utf8").replace(/\r/g, "").trim(),
        'isbn;title;available;copies\n001;"Intro; ""Quote"", Java";true;3\n002;"Java; ""Book"", 2";true;4');
    },
    restart: { steps: [], check([s]) { assert.equal(s.items.length, 2); assert.match(s.items[1], /Java; "Book", 2/); } } },
  { label: "upgrade/filelock", main: "ManualLibrary", name: "bad file reports the physical line and cannot replace or overwrite records",
    prepare(dir) { fs.writeFileSync(path.join(dir, "inventory.txt"), badInventory, "utf8"); },
    steps: ["click:Load Test Data","click:Load from File","click:Save to File"],
    check(s, out, dir) {
      assert.match(s[1].items[0], /^001 /);
      assert.deepEqual(s[2].items, s[1].items);
      assert.match(s[2].alerts[0], /Line 3: Available must be true or false/);
      assert.match(s[3].alerts[0], /Correct the data file/);
      assert.equal(fs.readFileSync(path.join(dir, "inventory.txt"), "utf8"), badInventory);
    } },
  { label: "upgrade/files", main: "DelimitedLibrary", name: "failed startup load prevents autosave from overwriting the original file",
    prepare(dir) { fs.writeFileSync(path.join(dir, "inventory.txt"), badInventory, "utf8"); },
    steps: ["type:0:555","type:1:New book","type:2:4","click:Add"],
    check(s, out, dir) {
      assert.match(s[0].alerts[0], /Line 3/);
      assert.equal(s[4].items.length, 0);
      assert.match(s[4].alerts[0], /Correct it and reopen/);
      assert.equal(fs.readFileSync(path.join(dir, "inventory.txt"), "utf8"), badInventory);
    } },
  { label: "upgrade/tab", main: "TabbedLibrary", name: "Tab-separated data round-trips with commas in the title",
    prepare(dir) { fs.writeFileSync(path.join(dir, "inventory.txt"), 'isbn\ttitle\tavailable\tcopies\n001\tText, with comma\ttrue\t3\n', "utf8"); },
    steps: ["type:0:002","type:1:Another title, with comma","type:2:4","click:Add"],
    check(s, out, dir) {
      assert.match(s[0].items[0], /Text, with comma/);
      assert.equal(s[4].items.length, 2);
      assert.equal(fs.readFileSync(path.join(dir, "inventory.txt"), "utf8").trim().split(/\r?\n/)[2],
        "002\tAnother title, with comma\ttrue\t4");
    } },
  { label: "example/ControlCircle", main: "ControlCircle", name: "lecture ControlCircle: enlarge and shrink",
    steps: ["click:Enlarge", "click:Shrink", "click:Shrink"],
    check(s) {
      assert.equal(s[1].shapes[0].r, 52);
      assert.equal(s[3].shapes[0].r, 48);
    } },
  { label: "draw/smiley/custom/split", main: "SmileyApp", name: "drawing in a custom Pane subclass",
    steps: [],
    check(s) {
      assert.equal(s[0].shapes.length, 4);
      assert.equal(s[0].shapes[0].fill, "0xffff00ff");
    } },
  { label: "practice/q19", main: "PracticeQ19", name: "practice Q19 exists and starts",
    steps: [], check(s) { assert.equal(s[0].shapes.length, 1); } },

  // ---------- round 3: hand-written reference answers on the practice page ----------
  { label: "manual/R3-Q18", console: true, main: "ShapeTest", name: "round 3 Q18 answer: interface, inheritance, ArrayList<Drawable>",
    check(out) { assert.equal(out.trim(), "Circle: area = 12.57\nRectangle: area = 12.00"); } },
  { label: "manual/R3-Q22", console: true, main: "Q22Check", name: "round 3 Q22 answer: Book.toString and Library add / find / borrow / return",
    check(out) {
      assert.equal(out.trim(), ["true false false", "001 - Java Basics [Available]", "null", "true false false",
        "001 - Java Basics [Borrowed]", "true false false", "1"].join("\n"));
    } },
  { label: "manual/R3-Q24", console: true, main: "Q24Check", name: "round 3 Q24 answer: static save / load, overwrite, missing file",
    check(out) {
      assert.equal(out.trim(), ["001,Java Basics,true|002,Python Intro,false", "001/Java Basics/true", "002/Python Intro/false", "1", "0"].join("\n"));
    } },
  { label: "manual/R3-Q26", console: true, main: "Q26Check", name: "round 3 Q26 answer: exact find, case-insensitive search, delete twice",
    check(out) { assert.equal(out.trim(), ["Java Basics;Advanced Java;", "0 0 3", "3", "Advanced Java null null", "true false 2"].join("\n")); } },
  { label: "manual/R3-Q19", main: "TwoWindowApp", name: "round 3 Q19 answer: one settings Stage, Invalid name, Save updates the main window",
    steps: ["click:Open Settings", "click:Open Settings", "window:Settings", "click:Save", "type:0:Amy", "click:Save", "click:Reset",
      "click:Open Settings", "window:Settings", "type:0:Bob", "click:Save"],
    check(s) {
      assert.ok(s[0].labels.includes("Welcome") && !s[0].windows);
      assert.deepEqual(s[2].windows.map(w => w.title), ["Settings"], "a second click must not open another window");
      assert.ok(s[4].windows[0].labels.includes("Invalid name"), "blank nickname keeps the window open");
      assert.ok(!s[6].windows && s[6].labels.includes("Welcome, Amy"));
      assert.ok(s[7].labels.includes("Welcome"));
      assert.equal(s[8].windows.length, 1);
      assert.ok(!s[11].windows && s[11].labels.includes("Welcome, Bob"));
    } },
  { label: "manual/R3-Q20", main: "FlowTagsApp", name: "round 3 Q20 answer: tags added at run time, Clear keeps the first three",
    steps: ["click:Add", "type:0:Go", "click:Add", "type:0:Kotlin", "click:Add", "click:Clear"],
    check(s) {
      const tags = i => s[i].labels.filter(l => !/^(Ready|Added |Invalid)/.test(l));
      assert.deepEqual(tags(0), ["Java", "Python", "C++"]);
      assert.equal(s[0].styled.filter(x => /-fx-background-color/.test(x.style)).length, 3);
      assert.ok(s[1].labels.includes("Invalid input"));
      assert.deepEqual(tags(5), ["Java", "Python", "C++", "Go", "Kotlin"]);
      assert.equal(s[5].fields[0], "");
      assert.deepEqual(tags(6), ["Java", "Python", "C++"]);
    } },
  { label: "manual/R3-Q23", main: "NotesApp", name: "round 3 Q23 answer: ArrayList<String>, save, clear keeps the file, load",
    steps: ["click:Add", "type:0:Buy milk", "click:Add", "type:0:Call Tom", "click:Add", "click:Save", "click:Clear", "click:Load"],
    check(s, out, dir) {
      const file = () => fs.readFileSync(path.join(dir, "notes.txt"), "utf8").trim().split(/\r?\n/);
      assert.ok(s[1].labels.includes("Empty note"));
      assert.equal(s[5].areas[0], "Buy milk\nCall Tom");
      assert.deepEqual(file(), ["Buy milk", "Call Tom"]);
      assert.equal(s[7].areas[0], "");
      assert.equal(s[8].areas[0], "Buy milk\nCall Tom");
      assert.ok(s[8].labels.includes("2 note(s) loaded"));
    } },
  { label: "manual/R3-Q23", main: "NotesApp", name: "round 3 Q23 answer: Load without notes.txt says File not found and keeps working",
    steps: ["click:Load", "type:0:After", "click:Add"],
    check(s) {
      assert.ok(s[1].labels.includes("File not found"));
      assert.equal(s[3].areas[0], "After");
    } },
  { label: "manual/R3-Q29", main: "MiniLibraryApp", name: "round 3 Q29 answer: Library class, errors, save, restart keeps the borrowed state",
    steps: ["type:0:001", "type:1:Java Basics", "click:Add", "type:0:002", "type:1:Python Intro", "click:Add", "type:0:001", "type:1:Again", "click:Add",
      "type:0:001", "click:Borrow", "type:0:001", "click:Borrow", "type:0:002", "click:Delete", "type:0:002", "click:Delete", "click:Add", "click:Save"],
    check(s, out, dir) {
      assert.deepEqual(s[0].items, []);
      assert.deepEqual(s[6].items, ["001 - Java Basics [Available]", "002 - Python Intro [Available]"]);
      assert.ok(s[9].labels.includes("Duplicate ISBN") && s[9].items.length === 2);
      assert.equal(s[11].items[0], "001 - Java Basics [Borrowed]");
      assert.ok(s[13].labels.includes("Book is already borrowed"));
      assert.deepEqual(s[15].items, ["001 - Java Basics [Borrowed]"]);
      assert.ok(s[17].labels.includes("Book not found"));
      assert.ok(s[18].labels.includes("Please enter ISBN and Title"));
      assert.deepEqual(fs.readFileSync(path.join(dir, "books.txt"), "utf8").trim().split(/\r?\n/), ["001,Java Basics,false"]);
    },
    restart: { steps: ["click:Load", "type:0:001", "click:Return"],
      check(s) {
        assert.deepEqual(s[0].items, ["001 - Java Basics [Borrowed]"]);
        assert.deepEqual(s[1].items, ["001 - Java Basics [Borrowed]"]);
        assert.deepEqual(s[3].items, ["001 - Java Basics [Available]"]);
      } } },
  { label: "manual/R3-Q29", main: "MiniLibraryApp", name: "round 3 Q29 answer preserves an invalid input file",
    prepare(dir) { fs.writeFileSync(path.join(dir, "books.txt"), "001,Java Basics,invalid\n"); },
    steps: ["click:Save"],
    check(s, out, dir) {
      assert.match(s[0].labels.join(" "), /Cannot read books\.txt: Availability must be true or false/);
      assert.ok(s[0].disabled.includes("Save"));
      assert.equal(fs.readFileSync(path.join(dir, "books.txt"), "utf8"), "001,Java Basics,invalid\n");
    } },
  { label: "manual/R4-Q07", main: "TagBoard", name: "round 4 Q07 answer adds separate labels with duplicate text",
    steps: ["type:0:Revision", "click:Add", "click:Add"],
    check(s) {
      assert.deepEqual(s[0].labels, ["Ready"]);
      assert.deepEqual(s[2].labels, ["Ready", "Revision"]);
      assert.deepEqual(s[3].labels, ["Ready", "Revision", "Revision"]);
    } },
  { label: "manual/R4-Q30", main: "EditDesk", name: "round 4 Q30 answer saves edits and restores the saved row on Cancel",
    steps: ["type:0:E1", "type:1:Original", "click:Add", "select:0", "click:Edit", "type:1:Saved Title", "click:Save"],
    check(s, out, dir) {
      assert.deepEqual(s[4].fields, ["E1", "Original"]);
      assert.deepEqual(s[7].items, ["E1 - Saved Title"]);
      assert.equal(fs.readFileSync(path.join(dir, "edit-books.txt"), "utf8").trim(), "E1,Saved Title,true");
      const old = new Date("2000-01-01T00:00:00Z");
      fs.utimesSync(path.join(dir, "edit-books.txt"), old, old);
    },
    restart: { steps: ["select:0", "click:Edit", "type:0:E2", "type:1:Discard Me", "click:Cancel"],
      check(s, out, dir) {
        assert.deepEqual(s[0].items, ["E1 - Saved Title"]);
        assert.deepEqual(s[4].fields, ["E2", "Discard Me"]);
        assert.deepEqual(s[5].fields, ["E1", "Saved Title"]);
        assert.deepEqual(s[5].items, s[0].items);
        assert.ok(s[5].disabled.includes("Save") && !s[5].disabled.includes("Edit"));
        const file = path.join(dir, "edit-books.txt");
        assert.equal(fs.readFileSync(file, "utf8").trim(), "E1,Saved Title,true");
        assert.equal(fs.statSync(file).mtimeMs, Date.parse("2000-01-01T00:00:00Z"));
      } } }
];

// JavaFX 17 on Windows can print a StringIndexOutOfBoundsException from its own UI Automation provider
// (WinTextRangeProvider.GetText) when an accessibility client reads a TextField while its text changes.
// The program under test keeps running. Only a block that matches this exact shape is dropped:
// that exception type, a GetText frame, and every frame inside java.lang.String/Thread or the Windows glass
// classes. Any other exception, method or frame (generated program, FxSmoke) still fails the run.
const NOISE_HEADER = /^Exception in thread "JavaFX Application Thread" java\.lang\.StringIndexOutOfBoundsException\b/;
const NOISE_SOURCE = /^\s+at javafx\.graphics\/com\.sun\.glass\.ui\.win\.WinTextRangeProvider\.GetText\(/;
const NOISE_FRAME = /^\s+at (java\.base\/java\.lang\.(String|Thread)\.|javafx\.graphics\/com\.sun\.glass\.ui\.win\.Win(TextRangeProvider|Application)\.)/;

export function dropAccessibilityNoise(output) {
  const kept = [];
  let dropped = 0;
  const lines = output.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (NOISE_HEADER.test(lines[i])) {
      let end = i + 1;
      while (end < lines.length && /^\s+at /.test(lines[end])) end++;
      const frames = lines.slice(i + 1, end);
      if (frames.length && frames.some(l => NOISE_SOURCE.test(l)) && frames.every(l => NOISE_FRAME.test(l))) {
        dropped++;
        i = end - 1;
        continue;
      }
    }
    kept.push(lines[i]);
  }
  return { output: kept.join("\n"), dropped };
}

export async function runSmoke({ fxPath, compileCases, run }) {
  let failures = 0, ignoredTotal = 0;
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "fxsmoke-"));
  const runner = path.join(work, "runner");
  const nativeCache = path.join(work, "native");
  fs.mkdirSync(runner);
  fs.mkdirSync(nativeCache);
  const compiled = await run("javac", ["-encoding", "UTF-8", "-nowarn", "--module-path", fxPath, "--add-modules", "javafx.controls",
    "-d", runner, path.join(here, "FxSmoke.java")]);
  if (compiled.code !== 0) {
    console.log("FAIL compile FxSmoke.java\n" + compiled.out);
    return 1;
  }
  for (const c of cases) {
    const target = compileCases.find(x => x.label === c.label);
    if (!target?.dir) { console.log("FAIL smoke " + c.name + ": compile case " + c.label + " not found"); failures++; continue; }
    const cwd = fs.mkdtempSync(path.join(work, "run-"));
    const cp = [runner, path.join(target.dir, "out")].join(path.delimiter);
    let ignored = 0;
    const launch = async steps => {
      const r = await run("java", ["-Dprism.order=sw", "-Djavafx.cachedir=" + nativeCache, "--module-path", fxPath, "--add-modules", "javafx.controls", "-cp", cp, "FxSmoke", c.main, ...steps],
        { cwd, timeout: 60000 });
      const snapshots = [];
      const console_ = [];
      const filtered = dropAccessibilityNoise(r.out);
      r.out = filtered.output;
      ignored += filtered.dropped;
      for (const line of r.out.split(/\r?\n/)) {
        const m = /^STEP (\d+) (\{.*\})$/.exec(line);
        if (m) snapshots[Number(m[1])] = JSON.parse(m[2]);
        else if (line.trim()) console_.push(line);
      }
      assert.equal(snapshots.length, steps.length + 1, "expected a snapshot for every step; output:\n" + r.out.slice(0, 1500));
      assert.equal(r.code, 0, "JavaFX driver did not exit cleanly");
      assert.doesNotMatch(r.out, /Exception in|at javafx\.|\tat /, "exception during run:\n" + r.out.slice(0, 2000));
      return { snapshots, console: console_.join("\n") };
    };
    try {
      if (c.console) {
        // A console program (no JavaFX window): run main and compare what it prints.
        const r = await run("java", ["-cp", path.join(target.dir, "out"), c.main], { cwd, timeout: 30000 });
        assert.equal(r.code, 0, "program did not exit cleanly:\n" + r.out.slice(0, 1500));
        // The JVM reports some environment variables on stderr ("Picked up JAVA_TOOL_OPTIONS: ..."); that is not program output.
        const printed = r.out.replace(/\r\n/g, "\n").split("\n").filter(l => !/^Picked up (JAVA_TOOL_OPTIONS|_JAVA_OPTIONS|JDK_JAVA_OPTIONS):/.test(l)).join("\n");
        c.check(printed, cwd);
        console.log("ok   run " + c.name);
        continue;
      }
      c.prepare?.(cwd);
      const first = await launch(c.steps);
      c.check(first.snapshots, first.console, cwd);
      if (c.restart) {
        // Start the program again in the same folder: the data file must be read back.
        const again = await launch(c.restart.steps);
        c.restart.check(again.snapshots, again.console, cwd);
      }
      console.log("ok   run " + c.name + (ignored ? "  [ignored " + ignored + " known JavaFX accessibility exception(s)]" : ""));
    } catch (error) {
      failures++;
      console.log("FAIL run " + c.name + "\n     " + String(error.message).split("\n").slice(0, 12).join("\n     "));
    }
    ignoredTotal += ignored;
  }
  console.log((failures ? "FAIL " : "ok   ") + "JavaFX runtime: " + (cases.length - failures) + "/" + cases.length + " scenarios passed" +
    (ignoredTotal ? " (ignored " + ignoredTotal + " known JavaFX accessibility exception(s), see the scenarios marked above)" : ""));
  fs.rmSync(work, { recursive: true, force: true });
  return failures;
}

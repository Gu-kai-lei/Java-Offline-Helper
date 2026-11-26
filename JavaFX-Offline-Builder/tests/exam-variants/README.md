# Test 2 practical: self-written variant questions

Six practice questions in the style of the Test 2 practical (Assignment 2 and Lab 3 variants). Each one changes something a real paper could change, to check that **the JavaFX Offline Builder alone** is enough to answer it. The builder settings used for each answer are kept in `solutions.json`. From `JavaFX-Offline-Builder/`, `node tests/run_builder_tests.mjs --jdk --run` regenerates every answer, compiles it, runs it and checks the acceptance steps below.

All programs: put your name, student ID and the tool (BlueJ) in a comment at the top of every `.java` file; use the window titles exactly as given, with your own full name.

---

## A2-1 · Rectangle Mover (code given)

You are given `Drawable.java`, `Shape.java` and an incomplete `JavaFXRectangle.java` (folder `A2-1-rectangle-mover/given`). **Do not change `Drawable` or `Shape`.**

(a) Complete every method of `JavaFXRectangle`. The no-argument constructor creates a 120 × 60 rectangle. `draw()` draws the rectangle with its top-left corner at `(x, y)`, filled with `fillColor`. `displayShape()` prints the area and the perimeter.

(b) Write `RectangleApp`:
- Title `Rectangle Mover - <your full name>`; a white 500 × 300 canvas in the centre of a `BorderPane`.
- One row of buttons at the bottom (`HBox`, spacing 10, padding 10), in this order: `Add Rectangle`, `Yellow`, `Green`, `Left`, `Right`, `Up`, `Down`, `Clear`.
- `Add Rectangle` replaces any previous rectangle with a new default rectangle and prints its area and perimeter. The colour buttons recolour it, the four direction buttons call the matching `Shape` method, `Clear` removes it. Nothing may crash when there is no rectangle.

Acceptance: Add → orange rectangle at (80, 60), 120 × 60, console `Area of rectangle = 7200.0` · Right ×2 → x = 120 · Up → y = 40 · Yellow → yellow · Clear → empty · Left with no rectangle → no error.

## A2-2 · Circle Studio (UML only, radius typed by the user)

Write all classes yourself:
- `interface Drawable { void draw(Pane pane); }`
- `abstract class Shape implements Drawable` with `protected double area, perimeter`, `protected double x = 150, y = 120` (the centre of the shape), `protected Color color = Color.BLUE`, abstract `computeArea()`, `computePerimeter()`, `enlarge()`, `shrink()`, and `setColor(Color c)`.
- `class MyCircle extends Shape` with `private double radius` and a constructor `MyCircle(double radius)`. `enlarge()` adds 5 to the radius; `shrink()` subtracts 5 but never makes it smaller than 5.

`CircleStudio` (title `Circle Studio - <your full name>`):
- Top (`HBox`): `Radius:` label, a text field showing `40`, button `Add Circle`.
- Left (`VBox`, spacing 10, padding 10): `Enlarge`, `Shrink`, `Red`, `Clear`.
- Centre: white 400 × 300 canvas. Bottom: a label `Area: 5026.55   Perimeter: 251.33` for the current circle (two decimals), or `No circle` when there is none.
- `Add Circle` reads the radius; if it is not a positive number the bottom label shows `Invalid radius` and nothing is added.

Acceptance: Add (40) → blue circle centred (150, 120), r = 40, label `Area: 5026.55   Perimeter: 251.33` · Enlarge → r = 45 · Shrink ×9 → r = 5 (never below) · Red → red · radius `abc` + Add → `Invalid radius` · Clear → `No circle`.

## A2-3 · Shape Collection with a text file

Classes `Drawable`, abstract `Shape` (centre `x = 100`, `y = 100`, colour green), `CircleShape(double radius)` default 30 and `SquareShape(double side)` default 60. Keep all shapes in an `ArrayList<Shape>`.

`ShapeCollection` (title `Shape Collection - <your full name>`), buttons in a right `VBox`: `Add Circle`, `Add Square`, `Move Right` (moves the newest shape 30 px), `Blue`, `Save`, `Load`, `Clear`.
- `Save` writes `shapes.txt`, one line per shape: class name, x, y, colour and size, separated by commas.
- `Load` replaces the current shapes with the shapes read from `shapes.txt`.

Acceptance: Add Circle, Add Square, Move Right, Blue, Save → 2 lines in `shapes.txt` · Clear → empty · Load → the two shapes come back in the same position and colour.

## L3-1 · Student Records (statistics)

`Student` (private `id`, `name`, `double score`, getters/setters) and `StudentApp` (title `Student Records`), data file `students.txt`.
- Top: `Name: <name>        Student ID: <id>` and `Program Started: yyyy-MM-dd HH:mm:ss`. Centre: list of students. Below: `ID`, `Name`, `Score` fields and `Clear`.
- Buttons `Add`, `Delete`, `Search`, `Display All`, `Sort by Score`, `Statistics`, `Exit`.
- Errors in an `Alert` and in the message label: `Please enter ID, Name and Score.`, `Duplicate ID: <id> already exists.`, `Please enter a valid number for Score.`
- `Statistics` shows `Count: 3   Average: 71.50   Highest: 91.00   Lowest: 45.00` in the message label.
- Load the file at start-up, save after every successful change.

Acceptance: add S001 Amy 78.5, S002 Ben 91, S003 Chris 45 · Statistics → `Count: 3   Average: 71.50   Highest: 91.00   Lowest: 45.00` · Sort by Score → Chris, Amy, Ben · Score `x` → number error · duplicate S001 → duplicate error · restart → 3 students loaded.

## L3-2 · Inventory (numeric buttons)

`Product` (private `code`, `name`, `int quantity`, `double price`) and `InventoryApp` (title `Inventory`), data file `inventory.txt`.
- The list shows each product as `P100 | Pen | Qty: 120 | $5.50`.
- Buttons `Add`, `Edit`, `Save`, `Delete`, `Search`, `Display All`, `Sell`, `Restock`, `Exit`.
- `Sell` lowers the quantity of the selected product by 1; at 0 it shows `Out of stock.` `Restock` adds 10 but never above 999 (`Stock limit reached.`). Without a selection: `Please select a product first.`

Acceptance: add P100 Pen 2 5.5 · select · Sell ×2 → `Qty: 0` · Sell → `Out of stock.` · Restock → `Qty: 10` · file line `P100,Pen,10,5.5`.

## L3-3 · Library in a TextArea (Book.java given)

`Book.java` is given (folder `L3-3-library-textarea/given`); complete it without changing its method headers. `toString()` returns e.g. `0131450913 | HTML How to Program | true`.

`LibraryApp` (title `Library`), data file `books.txt`:
- All books are shown in a non-editable `TextArea`, one `toString()` per line.
- Fields `ISBN`, `Title`; buttons `Add`, `Delete`, `Search`, `Display All`, `Borrow`, `Return`, `Clear`, `Exit`. Borrow/Return/Delete work on the ISBN typed in the field.
- Errors: `Please enter both ISBN and Title.`, `Duplicate ISBN: <isbn> already exists.`, `Book with ISBN <isbn> cannot be found.`, `The selected book is not available.`, `The selected book is already available.`

Acceptance: add two books · TextArea shows two lines in `toString()` format · type the first ISBN, Borrow → line ends with `false` · Borrow again → not-available error · Return → `true` · unknown ISBN + Delete → cannot-be-found error.

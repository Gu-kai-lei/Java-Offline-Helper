# Mock practical paper, round 2 (examinee check)

Second set of self-written questions. This time the examinee "knows no Java" and may only use the builder page: no Java is typed by hand. Each question adds twists that round 1 did not have. `solutions.json` records the builder settings that answered each one.

## Q1 · Square Painter (code given, keyboard and mouse)

Given: `Drawable.java`, `Shape.java`, incomplete `JavaFXSquare.java`. Do not change `Drawable` or `Shape`.

(a) Complete `JavaFXSquare`. `displayInfo()` prints the area and perimeter.
(b) Write `PainterApp`, title `Square Painter - <your full name>`:
- Top `HBox`: buttons `New Square`, `Blue`, `Green`, `Left`, `Right`, `Clear`. Centre: white 500 x 300 canvas.
- `New Square` shows a red square with side 80 at (100, 100).
- The LEFT and RIGHT arrow keys do the same as the `Left` and `Right` buttons.
- Clicking on the canvas moves the square so that its top-left corner is at the mouse position (use `setPosition`).
- A label at the bottom shows `Area: 6400.00` for the current square, or `No square`.

## Q2 · Moving Ball (Timeline in an OOP program)

Classes `Drawable`, abstract `Shape` (x = 40, y = 100 is the centre; colour orange) and `Ball(double radius)` with radius 20.
`BallApp` (title `Moving Ball - <your full name>`): buttons at the bottom `Add Ball`, `Start`, `Stop`, `Reset`.
- `Start` moves the ball 5 pixels to the right every 50 ms (call `moveRight()` and redraw); `Stop` pauses it.
- `Reset` stops the animation and puts a new ball at the start position.

## Q3 · Contact Book (custom button texts, explicit Save/Load)

`Contact` (private `name`, `phone`, `email`, getters/setters) and `ContactApp` (title `Contact Book`), file `contacts.txt`.
- Fields `Name`, `Phone`, `Email`; list of contacts in the centre.
- Buttons exactly: `Add Contact`, `Remove`, `Find`, `Show All`, `Save to File`, `Load from File`, `Quit`.
- Nothing is written automatically: only `Save to File` writes the file and only `Load from File` reads it. After loading, the message label shows `3 contact(s) loaded.`
- The name is the key. A label always shows `Total contacts: N`.

## Q4 · Grade Book (complete class given, filter and total)

`Student.java` is given and complete (constructor `Student(String id, String name, int mark)`, `getGrade()`); do not modify it.
`GradeApp` (title `Grade Book`), file `grades.txt`:
- The list shows each student as `S001 Amy 78 B` (id, name, mark, grade).
- Buttons `Add`, `Delete`, `Display All`, `Pass List`, `Summary`, `Exit`.
- `Pass List` shows only the students whose mark is at least 50.
- `Summary` shows `Count: 3   Total: 214   Average: 71.33` in the message label.

## Q5 · Traffic Light (RadioButton and CheckBox)

Draw a traffic light: dark grey rounded rectangle and three circles (radius 30) that are all light grey at first.
Three radio buttons `Red`, `Yellow`, `Green` in one group at the bottom: the chosen light gets its colour, the other two turn light grey.
A check box `Show frame` hides or shows the rectangle. Title `Traffic Light - <your full name>`.

## Q6 · BMI Calculator (result text depends on the number)

Fields `Weight (kg)` and `Height (m)`, button `Compute BMI`. Show `BMI: 22.86` and a category:
`Underweight` below 18.5, `Normal` below 25, `Overweight` below 30, otherwise `Obese`. Invalid input shows an error Alert.

# EIE3320 Test 2 · Practical Practice Bank

Thirty original practice tasks. The announced practical time is two hours. To practise under exam conditions, pick a lecture task and an Assignment 2 or Lab 3 task rather than trying all 30 in one sitting.

Copy the materials and fixtures to your local disk before starting. Work with local files and notes without internet access or the network P-drive. Do not use TableView, GridPane or GNN. Submit Java source for the named main class and any helper classes the question requires. Compile and run each program and check the specified behaviour before submitting.

## Lecture 7 · JavaFX basics

### Q01 · Welcome Desk

Main class: WelcomeDesk.

Create a Stage titled "Workshop Desk", with a 360 × 180 Scene and a StackPane holding one centred button labeled "Check In".

### Q02 · A Centred Target

Main class: CentredTarget.

Draw a white circle of radius 50 with a black outline. Use property bindings to keep it centred when the window is resized.

### Q03 · Resizable Corner Guides

Main class: CornerGuides.

Draw two green diagonal guides in a custom Pane. Their points must keep a 10 px inset as the window changes size.

### Q04 · Five-Point Trail Marker

Main class: TrailMarker.

Draw a blue polygon in a Pane using the five vertices (40,120), (100,30), (160,120), (140,170), (60,170). Use a white background.

### Q05 · Workshop Studio Sign

Main class: StudioSign.

Draw a house sign with a triangular roof, beige wall and door. Put the bold text "FX Studio" below the door at y=305. Use a 400 × 320 scene.

### Q06 · Two Windows at Startup

Main class: DualDesk.

Show two distinct Stage instances at launch, each with its own Scene. Title the first "MyJavaFX" with an "OK" button, and the second "Second Stage" with a "New Stage" button.

### Q07 · Runtime Tag Board

Main class: TagBoard.

Use FlowPane for a tag board. Start with at least one label and a text field. Add must append a fresh Label with the entered text, including when a previous label has the same text.

## Lecture 8 · Event handling

### Q08 · Radio-Button Signal Panel

Main class: SignalPanel.

Build a three-light signal panel. Radio buttons select one lit colour at a time. A checkbox hides the frame independently of the lights.

### Q09 · Two-Button Route Pointer

Main class: RoutePointer.

Move a radius-20 marker to the clicked coordinates. Primary click paints red, secondary click paints blue. Reset restores the initial grey marker and prompt.

### Q10 · Seat Adjustment Counter

Main class: SeatCounter.

Start from Count: 0. Provide +2, -1 and Reset buttons, permit negative totals, and keep the correct count across separate clicks.

### Q11 · Draft Close Gate

Main class: DraftGate.

Use a checkbox to allow closing only after the draft is marked saved. Closing while unchecked must be consumed. Unchecking again must re-enable the guard.

### Q12 · Shift-Accelerated Lane

Main class: LaneKeys.

Set up a horizontal marker. Right moves 5 px, Shift+Right moves 20 px, Left moves back 5 px. An unrelated key does nothing. Reject moves beyond the configured boundary and support Reset.

### Q13 · Workshop Timer

Main class: WorkshopTimer.

Use a one-second Timeline. Start begins counting, Pause freezes the display, and Reset stops and returns it to zero even after Start is pressed twice.

### Q14 · Confirm a Score Reset

Main class: ResetScore.

Show "Score: 7". Reset must ask "Reset score?". Cancel keeps 7 and OK sets the label to "Score: 0".

### Q15 · Laboratory Thermometer

Main class: LabThermometer.

Convert Celsius to Fahrenheit and display one decimal place. Validate non-numeric input using an Alert. Clear empties the field and resets the output.

### Q16 · Average Speed Desk

Main class: PaceDesk.

Compute km/h from kilometres and minutes. Accept zero distance, reject zero time and reject negative distance. Show one decimal place.

### Q17 · Zero-Rate Loan

Main class: NoFeeLoan.

Calculate monthly payment and total payment to two decimals. At 0% interest the monthly payment is principal divided by months. Reject negative rates and invalid years.

### Q18 · Two Actions, One Handler

Main class: DualAction.

On a single Submit click, change the status to "Accepted" and print "Accepted by handler". Register only one action handler on Submit.

## Assignment 2 · Shapes and object-oriented design

### Q19 · Bounded Circle Gauge

Main class: GaugeMover.

Use Drawable, an abstract Shape and JavaFXCircle. Add keeps exactly one green circle of radius 35 centred at (100,90). Move Up moves it 12 px and refuses any y less than 66. Red recolours it and Clear Screen removes it.

### Q20 · Parcel Rectangle Mover

Main class: ParcelMover.

Add an orange 100 × 60 rectangle. Left/Right and Up/Down move it 13 px along the matching axis. Green recolours it; repeated Clear leaves the drawing empty.

### Q21 · Dimension-Limited Panel

Main class: PanelSizer.

Read width and height from text fields. Permit width 10–60 and height 10–40 inclusive. Enlarge or shrink both by 5 within the same limits. Display area to two decimals.

### Q22 · Restartable Tile Collection

Main class: TileStore.

Keep a circle and a square in an ArrayList. Move the last shape 30 px right and paint only that shape blue. Save to tiles.txt, then restore positions and colours on reopening via Load.

### Q23 · Square Navigation with Two Step Sizes

Main class: SquareNavigator.

Use buttons for 25 px steps and arrow keys for 12 px steps. A canvas click repositions the active square. Show its area and preserve area when it moves.

### Q24 · Polymorphic Geometry Tray

Main class: GeometryTray.

Keep MyCircle, MyRectangle and MySquare subclasses in an ArrayList<Shape>. Add all three to one canvas, recolour only the last to yellow, remove it without changing the earlier shapes, and provide Clear.

## Lab 3 · Records and text files

### Q25 · Explicit Contact Save

Main class: WorkshopContacts.

Manage name, phone and email records in a ListView with unique names and a contact count. Add two, explicitly save to workshop-contacts.txt, then add a third without saving. A new launch starts empty until Load, which restores only the saved two.

### Q26 · Capped Parts Inventory

Main class: PartsStock.

A Part has code, name, integer quantity and price. Set an inclusive cap of 12 units. Sell subtracts one, Restock adds ten, and operations exceeding either limit leave the quantity unchanged. Save successful changes.

### Q27 · Two-Criterion Shelf Search

Main class: ShelfFilter.

Seed AA1 Networks Primer, AA2 Graphics Primer, BB1 Networks Advanced and BB2 Java Essentials. Use a ListView and case-insensitive partial search by ISBN and title. Require both nonblank criteria, ignore blank criteria, and show an error if both are blank. Display All restores the four books.

### Q28 · Merit List and Class Summary

Main class: MeritRoster.

Allow integer marks from 0 to 100. Show a Merit List for marks at least 70. Summary shows count, total and average of all stored records.

### Q29 · Quoted Titles and Rejected Imports

Main class: ShelfImport.

Load a semicolon-separated shelf file with a header and quoted titles. Keep semicolons and quotes inside titles after writing and restarting. If a row is malformed, report its line number and keep the original file unchanged.

Use the [valid input file](fixtures/valid-shelf.txt) and the [malformed input file](fixtures/invalid-shelf.txt) in separate runs. Copy each to the working directory as `shelf-import.txt` before launching.

### Q30 · Book Editing with Dedicated Cancel

Main class: EditDesk.

Build a Book editing UI using a ListView. Select an existing row to fill the fields. Edit and Save must update the file. Also provide a separate Cancel button that discards pending input and restores the saved row without writing it.

// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Rectangle;
import javafx.stage.Stage;

/** Main window: 6 buttons and a drawing canvas. */
public class CircleApp extends Application {
    private Pane canvasPane = new Pane();
    private Shape activeShape;   // the shape the buttons act on; null when none
    private Label statusLabel = new Label("Ready");   // messages: no shape, boundary, last action

    @Override
    public void start(Stage stage) {
        Button addCircleButton = new Button("Add Circle");
        Button clearButton = new Button("Clear");
        Button redButton = new Button("Red");
        Button blueButton = new Button("Blue");
        Button moveUpButton = new Button("Move Up");
        Button moveDownButton = new Button("Move Down");

        // Register one event handler for each button
        addCircleButton.setOnAction(e -> addShape(new JavaFXCircle()));
        clearButton.setOnAction(e -> clearScreen());
        redButton.setOnAction(e -> changeColor(Color.RED));
        blueButton.setOnAction(e -> changeColor(Color.BLUE));
        moveUpButton.setOnAction(e -> {
            if (hasActiveShape()) {
                if (canMove(0, -15)) {
                    activeShape.moveUp();
                    redraw();
                }
            }
        });
        moveDownButton.setOnAction(e -> {
            if (hasActiveShape()) {
                if (canMove(0, 15)) {
                    activeShape.moveDown();
                    redraw();
                }
            }
        });

        // Top HBox
        HBox topBox = new HBox(10, statusLabel);
        topBox.setPadding(new Insets(15));
        topBox.setAlignment(Pos.CENTER_LEFT);
        // Bottom HBox
        HBox controlPanel = new HBox(10, addCircleButton, clearButton, redButton, blueButton, moveUpButton, moveDownButton);
        controlPanel.setPadding(new Insets(15));
        controlPanel.setAlignment(Pos.CENTER_LEFT);

        // Drawing canvas
        canvasPane.setPrefSize(500, 300);
        canvasPane.setStyle("-fx-background-color: white;");
        // Keep moved shapes inside the canvas area
        Rectangle clip = new Rectangle();
        clip.widthProperty().bind(canvasPane.widthProperty());
        clip.heightProperty().bind(canvasPane.heightProperty());
        canvasPane.setClip(clip);

        BorderPane root = new BorderPane();
        root.setCenter(canvasPane);
        root.setTop(topBox);
        root.setBottom(controlPanel);

        stage.setTitle("Circle Controller");
        stage.setScene(new Scene(root, 500, 400));
        stage.show();
    }

    /** Add button: replaces the previous shape with a new one. */
    private void addShape(Shape shape) {
        shape.readShape();
        shape.computeArea();
        shape.computePerimeter();
        activeShape = shape;
        redraw();
    }

    /** Clear button: removes every drawn shape. */
    private void clearScreen() {
        activeShape = null;
        redraw();
    }

    /** True when the active shape may move by (dx, dy): its new (x, y) stays inside the allowed area. */
    private boolean canMove(double dx, double dy) {
        double nextX = activeShape.x + dx;
        double nextY = activeShape.y + dy;
        if (nextY < 30 || nextY > 270) {
            statusLabel.setText("Boundary reached");
            return false;
        }
        return true;
    }

    /** Colour buttons: recolour the active shape. */
    private void changeColor(Color color) {
        if (hasActiveShape()) {
            activeShape.setColor(color);
            redraw();
        }
    }

    private boolean hasActiveShape() {
        if (activeShape == null) {
            statusLabel.setText("No circle available");
            return false;
        }
        return true;
    }

    /** Draw the canvas again after every change. */
    private void redraw() {
        canvasPane.getChildren().clear();
        if (activeShape != null) {
            activeShape.draw(canvasPane);
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}

/** A shape that can draw itself on a JavaFX Pane. */
interface Drawable {
    void draw(Pane canvasPane);
}

/** Parent of all shapes: area, perimeter, position and colour. */
abstract class Shape implements Drawable {
    protected double area;
    protected double perimeter;
    protected double x = 200;
    protected double y = 150;
    protected Color shapeColor = Color.GREEN;

    public abstract void readShape();
    public abstract void computeArea();
    public abstract void computePerimeter();
    public abstract void displayShape();

    public void setColor(Color color) {
        this.shapeColor = color;
    }

    public void moveUp() {
        this.y -= 15;
    }

    public void moveDown() {
        this.y += 15;
    }
}

/** Circle that computes its area and perimeter and draws itself. */
class JavaFXCircle extends Shape {
    private double radius;

    public JavaFXCircle() {
        this(30);
    }

    public JavaFXCircle(double radius) {
        this.radius = radius;
    }

    @Override
    public void readShape() {
        // A GUI has no console input, so keep the size from the constructor.
        if (radius <= 0) {
            radius = 30;
        }
    }

    @Override
    public void computeArea() {
        area = Math.PI * radius * radius;
    }

    @Override
    public void computePerimeter() {
        perimeter = 2 * Math.PI * radius;
    }

    @Override
    public void displayShape() {
        System.out.println("Area of circle = " + area);
        System.out.println("Perimeter of circle = " + perimeter);
    }

    @Override
    public void draw(Pane canvasPane) {
        // (x, y) is the centre of the shape.
        Circle circle = new Circle(x, y, radius);
        circle.setFill(shapeColor);
        canvasPane.getChildren().add(circle);
    }
}

// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.stage.Stage;

/** Main window: 5 buttons and a drawing canvas. */
public class ShapeViewerApp extends Application {
    private Pane canvasPane = new Pane();
    private Shape activeShape;   // the shape the buttons act on; null when none
    private Label infoLabel = new Label("No shape selected");
    private double angle = 0;   // rotation of the active shape in degrees

    @Override
    public void start(Stage stage) {
        Button circleButton = new Button("Circle");
        Button rectangleButton = new Button("Rectangle");
        Button ellipseButton = new Button("Ellipse");
        Button clearButton = new Button("Clear");
        Button rotateButton = new Button("Rotate");

        // Same width for every button
        circleButton.setPrefWidth(120);
        rectangleButton.setPrefWidth(120);
        ellipseButton.setPrefWidth(120);
        clearButton.setPrefWidth(120);
        rotateButton.setPrefWidth(120);

        // Register one event handler for each button
        circleButton.setOnAction(e -> addShape(paint(new Circle(), Color.BLUE)));
        rectangleButton.setOnAction(e -> addShape(paint(new Rectangle(), Color.RED)));
        ellipseButton.setOnAction(e -> addShape(paint(new Ellipse(), Color.GREEN)));
        clearButton.setOnAction(e -> clearScreen());
        rotateButton.setOnAction(e -> {
            if (hasActiveShape()) {
                angle = (angle + 45) % 360;
                redraw();
            }
        });

        // Left VBox
        VBox controlPanel = new VBox(10, circleButton, rectangleButton, ellipseButton, clearButton, rotateButton);
        controlPanel.setPadding(new Insets(15));

        // Drawing canvas
        canvasPane.setPrefSize(450, 320);
        canvasPane.setStyle("-fx-background-color: white;");
        // Keep moved shapes inside the canvas area
        javafx.scene.shape.Rectangle clip = new javafx.scene.shape.Rectangle();
        clip.widthProperty().bind(canvasPane.widthProperty());
        clip.heightProperty().bind(canvasPane.heightProperty());
        canvasPane.setClip(clip);

        BorderPane root = new BorderPane();
        root.setCenter(canvasPane);
        root.setLeft(controlPanel);
        infoLabel.setPadding(new Insets(8));
        root.setBottom(infoLabel);

        stage.setTitle("Shape Viewer");
        stage.setScene(new Scene(root, 600, 360));
        stage.show();
    }

    /** Add button: replaces the previous shape with a new one. */
    private void addShape(Shape shape) {
        shape.readShape();
        shape.computeArea();
        shape.computePerimeter();
        angle = 0;
        activeShape = shape;
        redraw();
    }

    /** Clear button: removes every drawn shape. */
    private void clearScreen() {
        angle = 0;
        activeShape = null;
        redraw();
    }

    /** Gives a new shape its own colour before it is added. */
    private Shape paint(Shape shape, Color color) {
        shape.setColor(color);
        return shape;
    }

    private boolean hasActiveShape() {
        if (activeShape == null) {
            System.out.println("No shape selected");
            return false;
        }
        return true;
    }

    /** Draw the canvas again after every change. */
    private void redraw() {
        canvasPane.getChildren().clear();
        if (activeShape != null) {
            activeShape.draw(canvasPane);
            // The Shape class has no angle, so the drawn node is turned here.
            for (javafx.scene.Node node : canvasPane.getChildren()) {
                node.setRotate(angle);
            }
        }
        if (activeShape == null) {
            infoLabel.setText("No shape selected");
        } else {
            infoLabel.setText(activeShape.getClass().getSimpleName() + ", angle: " + angle);
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
class Circle extends Shape {
    private double radius;

    public Circle() {
        this(35);
    }

    public Circle(double radius) {
        this.radius = radius;
    }

    @Override
    public void readShape() {
        // A GUI has no console input, so keep the size from the constructor.
        if (radius <= 0) {
            radius = 35;
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
        javafx.scene.shape.Circle circle = new javafx.scene.shape.Circle(x, y, radius);
        circle.setFill(shapeColor);
        canvasPane.getChildren().add(circle);
    }
}

/** Rectangle that computes its area and perimeter and draws itself. */
class Rectangle extends Shape {
    private double width;
    private double height;

    public Rectangle() {
        this(100, 60);
    }

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public void readShape() {
        // A GUI has no console input, so keep the size from the constructor.
        if (width <= 0 || height <= 0) {
            width = 100;
            height = 60;
        }
    }

    @Override
    public void computeArea() {
        area = width * height;
    }

    @Override
    public void computePerimeter() {
        perimeter = 2 * (width + height);
    }

    @Override
    public void displayShape() {
        System.out.println("Area of rectangle = " + area);
        System.out.println("Perimeter of rectangle = " + perimeter);
    }

    @Override
    public void draw(Pane canvasPane) {
        // (x, y) is the centre of the shape.
        javafx.scene.shape.Rectangle rect = new javafx.scene.shape.Rectangle(x - width / 2, y - height / 2, width, height);
        rect.setFill(shapeColor);
        canvasPane.getChildren().add(rect);
    }
}

/** Ellipse that computes its area and perimeter and draws itself. */
class Ellipse extends Shape {
    private double radiusX;
    private double radiusY;

    public Ellipse() {
        this(60, 30);
    }

    public Ellipse(double radiusX, double radiusY) {
        this.radiusX = radiusX;
        this.radiusY = radiusY;
    }

    @Override
    public void readShape() {
        // A GUI has no console input, so keep the size from the constructor.
        if (radiusX <= 0 || radiusY <= 0) {
            radiusX = 60;
            radiusY = 30;
        }
    }

    @Override
    public void computeArea() {
        area = Math.PI * radiusX * radiusY;
    }

    @Override
    public void computePerimeter() {
        perimeter = Math.PI * (3 * (radiusX + radiusY) - Math.sqrt((3 * radiusX + radiusY) * (radiusX + 3 * radiusY)));
    }

    @Override
    public void displayShape() {
        System.out.println("Area of ellipse = " + area);
        System.out.println("Perimeter of ellipse = " + perimeter);
    }

    @Override
    public void draw(Pane canvasPane) {
        // (x, y) is the centre of the shape.
        javafx.scene.shape.Ellipse ellipse = new javafx.scene.shape.Ellipse(x, y, radiusX, radiusY);
        ellipse.setFill(shapeColor);
        canvasPane.getChildren().add(ellipse);
    }
}

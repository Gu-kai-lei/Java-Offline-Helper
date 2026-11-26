// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Rectangle;
import javafx.stage.Stage;
import javafx.util.Duration;

/** Main window: 3 buttons and a drawing canvas. */
public class PlayerApp extends Application {
    private Pane canvasPane = new Pane();
    private Shape activeShape;   // the shape the buttons act on; null when none
    private Label statusLabel = new Label("Ready");   // messages: no shape, boundary, last action
    private Timeline timeline;   // moves the active shape again and again

    @Override
    public void start(Stage stage) {
        Button startButton = new Button("Start");
        Button pauseButton = new Button("Pause");
        Button resetButton = new Button("Reset");

        // Register one event handler for each button
        startButton.setOnAction(e -> {
            timeline.play();
            statusLabel.setText("Started");
        });
        pauseButton.setOnAction(e -> {
            timeline.pause();
            statusLabel.setText("Paused");
        });
        resetButton.setOnAction(e -> {
            timeline.stop();
            addShape(new Ball());
            statusLabel.setText("Reset");
        });

        // Animation: every 300 ms move the active shape and draw it again
        timeline = new Timeline(new KeyFrame(Duration.millis(300), e -> {
            if (activeShape != null) {
                if (canMove(5, 0)) {
                    activeShape.moveRight();
                    redraw();
                    statusLabel.setText("X: " + activeShape.x);
                } else {
                    timeline.stop();   // stop at the boundary
                }
            }
        }));
        timeline.setCycleCount(Timeline.INDEFINITE);

        // Mouse: clicking the shape switches it between BLUE and RED
        canvasPane.setOnMouseClicked(e -> {
            if (activeShape != null && e.getTarget() instanceof javafx.scene.shape.Shape) {
                activeShape.setColor(activeShape.shapeColor.equals(Color.RED) ? Color.BLUE : Color.RED);
                redraw();
            }
        });

        // Buttons must not keep the keyboard focus, otherwise the arrow keys would move between buttons
        startButton.setFocusTraversable(false);
        pauseButton.setFocusTraversable(false);
        resetButton.setFocusTraversable(false);

        // Top HBox
        HBox topBox = new HBox(10, statusLabel);
        topBox.setPadding(new Insets(15));
        topBox.setAlignment(Pos.CENTER_LEFT);
        // Bottom HBox
        HBox controlPanel = new HBox(10, startButton, pauseButton, resetButton);
        controlPanel.setPadding(new Insets(15));
        controlPanel.setAlignment(Pos.CENTER_LEFT);

        // Drawing canvas
        canvasPane.setPrefSize(450, 300);
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

        stage.setTitle("Player Controller");
        Scene scene = new Scene(root);
        // Keyboard: the arrow keys move the active shape
        scene.setOnKeyPressed(e -> {
            if (activeShape == null) {
                return;
            }
            if (e.getCode() == KeyCode.LEFT) {
                if (canMove(-10, 0)) {
                    activeShape.x -= 10;
                    statusLabel.setText("X: " + activeShape.x);
                }
            } else if (e.getCode() == KeyCode.RIGHT) {
                if (canMove(10, 0)) {
                    activeShape.x += 10;
                    statusLabel.setText("X: " + activeShape.x);
                }
            }
            redraw();
        });
        stage.setScene(scene);
        addShape(new Ball());   // the window starts with one shape
        stage.show();
        canvasPane.requestFocus();
        stage.setOnCloseRequest(e -> timeline.stop());
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
        if (nextX < 20 || nextX > 280) {
            statusLabel.setText("Boundary reached");
            return false;
        }
        return true;
    }

    private boolean hasActiveShape() {
        if (activeShape == null) {
            statusLabel.setText("No shape yet. Click an Add button first.");
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
    protected double x = 50;
    protected double y = 100;
    protected Color shapeColor = Color.BLUE;

    public abstract void readShape();
    public abstract void computeArea();
    public abstract void computePerimeter();
    public abstract void displayShape();

    public void setColor(Color color) {
        this.shapeColor = color;
    }

    public void moveLeft() {
        this.x -= 5;
    }

    public void moveRight() {
        this.x += 5;
    }
}

/** Circle that computes its area and perimeter and draws itself. */
class Ball extends Shape {
    private double radius;

    public Ball() {
        this(15);
    }

    public Ball(double radius) {
        this.radius = radius;
    }

    @Override
    public void readShape() {
        // A GUI has no console input, so keep the size from the constructor.
        if (radius <= 0) {
            radius = 15;
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

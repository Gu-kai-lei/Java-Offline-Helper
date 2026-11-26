//Student Name & ID: xxxxxx
import javafx.scene.layout.Pane;
import javafx.scene.shape.Circle;

public class JavaFXCircle extends Shape {
    private float radius;

    public JavaFXCircle() {
        // Initialize default field value
    }
    public JavaFXCircle(float r) {
        // Initialize constructor parameter with parent context metrics
    }

    @Override
    public void readShape() {
        //  Default initialized radius 
    }

    @Override
    public void computeArea() {
        // Implement mathematical formula for circle area calculation
    }

    @Override
    public void computePerimeter() {
        // Implement mathematical formula for circle perimeter calculation
    }

    @Override
    public void displayShape() {
        // Print the calculated area and perimeter results to the console window
    }

    @Override
    public void draw(Pane canvasPane) {
        // Render the circle dynamically onto the JavaFX Pane container
    }
}

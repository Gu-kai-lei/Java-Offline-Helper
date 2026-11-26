import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;

public abstract class Shape implements Drawable {
    protected float area;
    protected float perimeter;
    
    // New fields to support coordinates and dynamic styling
    protected double x = 50;
    protected double y = 50;
    protected Color shapeColor = Color.GREEN; 

    public abstract void readShape();               
    public abstract void computeArea();
    public abstract void computePerimeter();  
    public abstract void displayShape();

    // Setters to allow the UI controls to interact with the object state
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

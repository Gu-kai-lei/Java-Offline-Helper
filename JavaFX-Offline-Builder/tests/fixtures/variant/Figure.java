import javafx.scene.paint.Color;

/* Abstract parent class. Do not modify. */
public abstract class Figure implements Displayable {
    protected double area;
    protected double perimeter;
    protected double xPos = 100;
    protected double yPos = 80;
    protected Color fillColor = Color.ORANGE;

    public abstract void calculateArea();
    public abstract void calculatePerimeter();
    public abstract void printInfo();
    public abstract void enlarge();

    public void setFillColor(Color c) {
        fillColor = c;
    }

    public void moveLeft() {
        xPos -= 20;
    }

    public void moveRight() {
        xPos += 20;
    }
}

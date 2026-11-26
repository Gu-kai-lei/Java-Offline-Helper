import javafx.scene.paint.Color;

public abstract class Shape implements Drawable {
    protected double area;
    protected double perimeter;
    protected double x = 100;
    protected double y = 100;
    protected Color color = Color.RED;

    public abstract void computeArea();
    public abstract void computePerimeter();
    public abstract void displayInfo();

    public void setColor(Color color) {
        this.color = color;
    }

    public void setPosition(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public void moveLeft() {
        x -= 25;
    }

    public void moveRight() {
        x += 25;
    }
}

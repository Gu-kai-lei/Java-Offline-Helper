import javafx.scene.paint.Color;

public abstract class Shape implements Drawable {
    protected double area;
    protected double perimeter;
    protected double x = 80;
    protected double y = 60;
    protected Color fillColor = Color.ORANGE;

    public abstract void computeArea();
    public abstract void computePerimeter();
    public abstract void displayShape();

    public void setColor(Color color) {
        this.fillColor = color;
    }

    public void moveUp() {
        y -= 20;
    }

    public void moveDown() {
        y += 20;
    }

    public void moveLeft() {
        x -= 20;
    }

    public void moveRight() {
        x += 20;
    }
}

import javafx.scene.paint.Color;
import javafx.scene.shape.Shape;

/** (x, y) is the centre of the shape. The only constructor takes the position. */
public abstract class GameShape implements Movable {
    protected double x;
    protected double y;
    protected Color color = Color.GREEN;

    public GameShape(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public abstract double getArea();
    public abstract String getName();
    public abstract Shape toNode();

    @Override
    public void moveBy(double dx, double dy) {
        x += dx;
        y += dy;
    }
}

/** 矩形继承 BaseShape 的名称，并实现 Drawable 声明的 describe()。 */
public class RectangleShape extends BaseShape implements Drawable {
    private double width;
    private double height;

    public RectangleShape(double width, double height) {
        super("Rectangle");
        this.width = width;
        this.height = height;
    }

    public double getWidth() {
        return width;
    }

    public double getHeight() {
        return height;
    }

    @Override
    public String describe() {
        double area = width * height;
        return getName() + ": area = " + String.format("%.2f", area);
    }
}

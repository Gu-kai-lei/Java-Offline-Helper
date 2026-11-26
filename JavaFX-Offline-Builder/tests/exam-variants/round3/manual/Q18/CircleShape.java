/** 圆继承 BaseShape 的名称，并实现 Drawable 声明的 describe()。 */
public class CircleShape extends BaseShape implements Drawable {
    private double radius;

    public CircleShape(double radius) {
        super("Circle");
        this.radius = radius;
    }

    public double getRadius() {
        return radius;
    }

    @Override
    public String describe() {
        double area = Math.PI * radius * radius;
        return getName() + ": area = " + String.format("%.2f", area);
    }
}

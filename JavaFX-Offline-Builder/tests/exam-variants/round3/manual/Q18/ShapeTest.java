import java.util.ArrayList;

/** 多态：列表以接口为元素类型，每个对象执行各自的 describe()。 */
public class ShapeTest {
    public static void main(String[] args) {
        ArrayList<Drawable> shapes = new ArrayList<>();
        shapes.add(new CircleShape(2));
        shapes.add(new RectangleShape(3, 4));
        for (Drawable shape : shapes) {
            System.out.println(shape.describe());
        }
    }
}

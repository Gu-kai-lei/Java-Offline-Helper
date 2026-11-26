/** 图形共有的名称设为私有字段，通过 getter 读取。 */
public class BaseShape {
    private String name;

    public BaseShape(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}

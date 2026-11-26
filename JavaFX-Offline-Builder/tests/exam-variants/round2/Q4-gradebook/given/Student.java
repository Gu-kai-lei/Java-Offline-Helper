// Given class. Do not modify.
public class Student {
    private String id;
    private String name;
    private int mark;

    public Student(String id, String name, int mark) {
        this.id = id;
        this.name = name;
        this.mark = mark;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getMark() {
        return mark;
    }

    public void setMark(int mark) {
        this.mark = mark;
    }

    public String getGrade() {
        if (mark >= 80) {
            return "A";
        } else if (mark >= 65) {
            return "B";
        } else if (mark >= 50) {
            return "C";
        }
        return "F";
    }
}

public class Postgraduate extends Student {
    private String supervisor;

    public Postgraduate(String id, String name, double score, String supervisor) {
    }

    public String getSupervisor() {
    }

    @Override
    public String getGrade() {
        return getScore() >= 75 ? "B" : "F";
    }
}

class StudentRecord{
    private int id;
    private String name;
    private double score;
    private static int count;

    public StudentRecord(int id, String name, double score){
        this.id = id;
        this.name = name;
        this.score = score;
        count ++;
    }

    public char calculateGrade(){
        if(score >= 80){
            return 'A';
        }else if(score >= 70){
            return 'B';
        }else if(score >= 60){
            return 'C';
        }else{
            return 'F';
        }
    }

    public static int getCount(){
        return count;
    }

    @Override
    public String toString(){
        System.out.println(id +'|'+ name+'|'+ score+'|'+ calculateGrade());
    }
}

String rawData = "101,John Smith,85.5;102,Eric Jones,68.0;103,Alice Wong,92.0;104,Bob Chan,54.5";
String[] data = rawData.split(";");
double total = 0;
for(int i =0; i< data.length; i++){
    String[] record = data.split(",");
    StudentRecord studnet = new StudentRecord(record[0], record[1], record[2]);
    total += record[2];
    student.toString();
}
System.out.println("Average:" + total/count);
System.out.println("Total student:"+ count);

public class Main {
    public static int countNegative(int[] values) {
        int count = 0;
        for (int i = 0; i < values.length; i++) {
            if (values[i] < 0) {
                count++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countNegative(new int[]{-3, 0, 5, -1}));
    }
}

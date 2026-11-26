/** Test driver for the round 3 Q22 reference answer (not shown to students). */
public class Q22Check {
    public static void main(String[] args) {
        Library library = new Library();
        System.out.println(library.addBook(new Book("001", "Java Basics")) + " " + library.addBook(new Book("001", "Again")) + " " + library.addBook(null));
        System.out.println(library.findBook("001"));
        System.out.println(library.findBook("999"));
        System.out.println(library.borrowBook("001") + " " + library.borrowBook("001") + " " + library.borrowBook("999"));
        System.out.println(library.findBook("001"));
        System.out.println(library.returnBook("001") + " " + library.returnBook("001") + " " + library.returnBook("999"));
        library.getBooks().clear();
        System.out.println(library.getBooks().size());
    }
}

import java.util.ArrayList;

/** Test driver for the round 3 Q26 reference answer (not shown to students). */
public class Q26Check {
    public static void main(String[] args) {
        Library library = new Library();
        library.addBook(new Book("001", "Java Basics", true));
        library.addBook(new Book("002", "Advanced Java", true));
        library.addBook(new Book("003", "Python Intro", false));
        ArrayList<Book> found = library.searchByTitle("java");
        StringBuilder titles = new StringBuilder();
        for (Book book : found) titles.append(book.getTitle()).append(";");
        System.out.println(titles);
        System.out.println(library.searchByTitle("").size() + " " + library.searchByTitle("   ").size() + " " + library.size());
        found.clear();
        System.out.println(library.size());
        System.out.println(library.findByIsbn("002").getTitle() + " " + library.findByIsbn("02") + " " + library.findByIsbn("999"));
        System.out.println(library.deleteBook("002") + " " + library.deleteBook("002") + " " + library.size());
    }
}

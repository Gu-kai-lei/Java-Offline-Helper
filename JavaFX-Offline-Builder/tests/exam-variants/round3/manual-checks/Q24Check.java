import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;

/** Test driver for the round 3 Q24 reference answer (not shown to students). */
public class Q24Check {
    public static void main(String[] args) throws Exception {
        ArrayList<Book> books = new ArrayList<>();
        books.add(new Book("001", "Java Basics", true));
        books.add(new Book("002", "Python Intro", false));
        LibraryFileManager.save(books, "books.txt");
        System.out.println(String.join("|", Files.readAllLines(Paths.get("books.txt"))));
        for (Book book : LibraryFileManager.load("books.txt")) {
            System.out.println(book.getIsbn() + "/" + book.getTitle() + "/" + book.isAvailable());
        }
        books.remove(1);
        LibraryFileManager.save(books, "books.txt");
        System.out.println(LibraryFileManager.load("books.txt").size());
        System.out.println(LibraryFileManager.load("missing.txt").size());
    }
}

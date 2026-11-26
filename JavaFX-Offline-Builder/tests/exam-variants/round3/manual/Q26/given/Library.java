import java.util.ArrayList;

/** 题给骨架，请补全标有 TODO 的三个方法。 */
public class Library {
    private ArrayList<Book> books;

    public Library() {
        books = new ArrayList<>();
    }

    public void addBook(Book book) {
        books.add(book);
    }

    public int size() {
        return books.size();
    }

    public Book findByIsbn(String isbn) {
        // TODO：待补全
        return null;
    }

    public ArrayList<Book> searchByTitle(String keyword) {
        // TODO：待补全
        return null;
    }

    public boolean deleteBook(String isbn) {
        // TODO：待补全
        return false;
    }
}

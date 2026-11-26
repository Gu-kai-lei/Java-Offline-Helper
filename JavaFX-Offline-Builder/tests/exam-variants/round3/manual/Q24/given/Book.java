/** Given: do not change this class. */
public class Book {
    private String isbn;
    private String title;
    private boolean available;

    public Book(String isbn, String title, boolean available) {
        this.isbn = isbn;
        this.title = title;
        this.available = available;
    }

    public String getIsbn() {
        return isbn;
    }

    public String getTitle() {
        return title;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}

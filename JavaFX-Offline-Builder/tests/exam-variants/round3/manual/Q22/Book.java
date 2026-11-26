/** 图书包含私有字段、构造器、getter 及图书馆需要的 setter。 */
public class Book {
    private String isbn;
    private String title;
    private boolean available;

    /** 新书默认可借。 */
    public Book(String isbn, String title) {
        this(isbn, title, true);
    }

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

    public void setAvailable(boolean available) {
        this.available = available;
    }

    /** 显示示例：001 - Java Basics [Available] */
    @Override
    public String toString() {
        return isbn + " - " + title + " [" + (available ? "Available" : "Borrowed") + "]";
    }
}

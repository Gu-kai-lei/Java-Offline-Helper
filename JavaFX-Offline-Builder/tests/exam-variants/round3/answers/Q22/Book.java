// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

/** One book record stored in books.txt. */
public class Book {
    private String isbn;
    private String title;
    private boolean available;

    /** New book from the input form; available starts as true. */
    public Book(String isbn, String title) {
        this(isbn, title, true);
    }

    public Book(String isbn, String title, boolean available) {
        this.isbn = isbn;
        this.title = title;
        this.available = available;
    }

    public String getISBN() {
        return isbn;
    }

    public void setISBN(String isbn) {
        this.isbn = isbn;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    /** Serializes one record in the selected text file format. */
    public String toFileLine() {
        return String.join(",", escapeFileField(isbn), escapeFileField(title), String.valueOf(available));
    }

    private static String escapeFileField(String text) {
        if (text.contains(",") || text.contains("\"") || !text.equals(text.trim())) {
            return "\"" + text.replace("\"", "\"\"") + "\"";
        }
        return text;
    }

    /** Text shown in the list. */
    @Override
    public String toString() {
        return isbn + " - " + title + " [" + (available ? "Available" : "Borrowed") + "]";
    }
}

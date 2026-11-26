import java.util.ArrayList;

/** 用一个 ArrayList 保存全部图书，并提供界面可调用的操作。 */
public class Library {
    private ArrayList<Book> books = new ArrayList<>();

    /** ISBN 未被使用时添加图书，添加成功返回 true。 */
    public boolean addBook(Book book) {
        if (book == null || findBook(book.getIsbn()) != null) {
            return false;
        }
        books.add(book);
        return true;
    }

    /** 返回该 ISBN 对应的图书，找不到时返回 null。 */
    public Book findBook(String isbn) {
        for (Book book : books) {
            if (book.getIsbn().equals(isbn)) {
                return book;
            }
        }
        return null;
    }

    /** 借出可借图书；找不到图书或图书已被借出时返回 false。 */
    public boolean borrowBook(String isbn) {
        Book book = findBook(isbn);
        if (book == null || !book.isAvailable()) {
            return false;
        }
        book.setAvailable(false);
        return true;
    }

    /** 归还已借出的图书；图书不存在或尚未借出时返回 false。 */
    public boolean returnBook(String isbn) {
        Book book = findBook(isbn);
        if (book == null || book.isAvailable()) {
            return false;
        }
        book.setAvailable(true);
        return true;
    }

    /** 返回列表副本，避免调用者改变图书馆原有的列表。 */
    public ArrayList<Book> getBooks() {
        return new ArrayList<>(books);
    }
}

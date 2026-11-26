import java.util.ArrayList;
import java.util.Locale;

/** 内存图书馆，支持按 ISBN 精确查找、按书名搜索及删除。 */
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

    /** 精确匹配 ISBN，找不到时返回 null。 */
    public Book findByIsbn(String isbn) {
        if (isbn == null) {
            return null;
        }
        for (Book book : books) {
            if (book.getIsbn().equals(isbn)) {
                return book;
            }
        }
        return null;
    }

    /** 返回书名含关键词的图书，不区分大小写。结果存入新列表，原列表保持原样。 */
    public ArrayList<Book> searchByTitle(String keyword) {
        ArrayList<Book> result = new ArrayList<>();
        if (keyword == null || keyword.trim().isEmpty()) {
            return result;   // 关键词为空时返回空列表
        }
        String key = keyword.trim().toLowerCase(Locale.ROOT);
        for (Book book : books) {
            if (book.getTitle().toLowerCase(Locale.ROOT).contains(key)) {
                result.add(book);
            }
        }
        return result;
    }

    /** 移除该 ISBN 对应的图书，找不到时返回 false。 */
    public boolean deleteBook(String isbn) {
        Book book = findByIsbn(isbn);
        if (book == null) {
            return false;
        }
        books.remove(book);
        return true;
    }
}

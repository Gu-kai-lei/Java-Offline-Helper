import java.io.File;
import java.io.IOException;
import java.io.BufferedWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Scanner;

/** 集中保存图书与相关操作，界面负责读取输入并显示结果。 */
public class Library {
    private ArrayList<Book> books = new ArrayList<>();

    public Book findBook(String isbn) {
        for (Book book : books) {
            if (book.getIsbn().equals(isbn)) {
                return book;
            }
        }
        return null;
    }

    /** ISBN 已被使用时返回 false。 */
    public boolean addBook(Book book) {
        if (findBook(book.getIsbn()) != null) {
            return false;
        }
        books.add(book);
        return true;
    }

    /** 找不到该 ISBN 对应的图书时返回 false。 */
    public boolean deleteBook(String isbn) {
        Book book = findBook(isbn);
        if (book == null) {
            return false;
        }
        books.remove(book);
        return true;
    }

    /** 图书不存在或已被借出时返回 false。 */
    public boolean borrowBook(String isbn) {
        Book book = findBook(isbn);
        if (book == null || !book.isAvailable()) {
            return false;
        }
        book.setAvailable(false);
        return true;
    }

    /** 图书不存在或尚未借出时返回 false。 */
    public boolean returnBook(String isbn) {
        Book book = findBook(isbn);
        if (book == null || book.isAvailable()) {
            return false;
        }
        book.setAvailable(true);
        return true;
    }

    public ArrayList<Book> getBooks() {
        return new ArrayList<>(books);
    }

    /** 每本书一行，例如 001,Java Basics,true。 */
    public void saveToFile(String filename) throws IOException {
        try (BufferedWriter out = Files.newBufferedWriter(Path.of(filename))) {
            for (Book book : books) {
                out.write(book.getIsbn() + "," + book.getTitle() + "," + book.isAvailable());
                out.newLine();
            }
        }
    }

    /**
     * 用读入的图书替换当前列表；文件不存在时从空列表开始。
     * 完整读取后再替换列表，遇到无效记录时保留当前数据。
     */
    public void loadFromFile(String filename) throws IOException {
        ArrayList<Book> loaded = new ArrayList<>();
        File file = new File(filename);
        if (file.exists()) {
            try (Scanner in = new Scanner(file, "UTF-8")) {
                while (in.hasNextLine()) {
                    String line = in.nextLine().trim();
                    if (line.isEmpty()) {
                        continue;
                    }
                    String[] parts = line.split(",", -1);
                    if (parts.length != 3) {
                        throw new IOException("Bad line: " + line);
                    }
                    String available = parts[2].trim();
                    if (!available.equalsIgnoreCase("true") && !available.equalsIgnoreCase("false")) {
                        throw new IOException("Availability must be true or false: " + line);
                    }
                    loaded.add(new Book(parts[0].trim(), parts[1].trim(), Boolean.parseBoolean(available)));
                }
                if (in.ioException() != null) {
                    throw in.ioException();
                }
            }
        }
        books = loaded;
    }
}

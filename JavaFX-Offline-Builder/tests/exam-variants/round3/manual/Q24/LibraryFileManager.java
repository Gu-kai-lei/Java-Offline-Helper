import java.io.File;
import java.io.IOException;
import java.io.BufferedWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Scanner;

/** 保存并读取图书文本文件。每本书一行，例如 001,Java Basics,true。 */
public class LibraryFileManager {

    /** 覆盖写入文件，每本书一行。即使出错，try-with-resources 也会关闭文件。 */
    public static void save(ArrayList<Book> books, String filename) throws IOException {
        try (BufferedWriter out = Files.newBufferedWriter(Path.of(filename))) {
            for (Book book : books) {
                out.write(book.getIsbn() + "," + book.getTitle() + "," + book.isAvailable());
                out.newLine();
            }
        }
    }

    /** 逐行读取并构造 Book。文件不存在时返回空列表。 */
    public static ArrayList<Book> load(String filename) throws IOException {
        ArrayList<Book> books = new ArrayList<>();
        File file = new File(filename);
        if (!file.exists()) {
            return books;
        }
        try (Scanner in = new Scanner(file, "UTF-8")) {
            while (in.hasNextLine()) {
                String line = in.nextLine().trim();
                if (line.isEmpty()) {
                    continue;   // 跳过空行，包括文件末尾的空行
                }
                String[] parts = line.split(",");
                if (parts.length != 3) {
                    throw new IOException("Bad line in " + filename + ": " + line);
                }
                books.add(new Book(parts[0].trim(), parts[1].trim(), Boolean.parseBoolean(parts[2].trim())));
            }
            if (in.ioException() != null) {
                throw in.ioException();
            }
        }
        return books;
    }
}

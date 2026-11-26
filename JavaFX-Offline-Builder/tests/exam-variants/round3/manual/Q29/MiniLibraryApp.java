import java.io.IOException;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

/** Library 的界面，包含 ISBN、Title 输入框、六个按钮、图书列表和状态标签。 */
public class MiniLibraryApp extends Application {
    private static final String DATA_FILE = "books.txt";
    private Library library = new Library();
    private TextField isbnField = new TextField();
    private TextField titleField = new TextField();
    private ListView<String> bookList = new ListView<>();
    private Button saveBtn = new Button("Save");
    private Label statusLabel = new Label("Ready");

    @Override
    public void start(Stage stage) {
        isbnField.setPromptText("ISBN");
        titleField.setPromptText("Title");
        Button addBtn = new Button("Add");
        Button deleteBtn = new Button("Delete");
        Button borrowBtn = new Button("Borrow");
        Button returnBtn = new Button("Return");
        Button loadBtn = new Button("Load");

        addBtn.setOnAction(e -> addBook());
        deleteBtn.setOnAction(e -> {
            String isbn = readIsbn();
            if (isbn != null) {
                show(library.deleteBook(isbn), "Book deleted", "Book not found");
            }
        });
        borrowBtn.setOnAction(e -> {
            String isbn = readIsbn();
            if (isbn != null) {
                show(library.borrowBook(isbn), "Book borrowed", library.findBook(isbn) == null ? "Book not found" : "Book is already borrowed");
            }
        });
        returnBtn.setOnAction(e -> {
            String isbn = readIsbn();
            if (isbn != null) {
                show(library.returnBook(isbn), "Book returned", library.findBook(isbn) == null ? "Book not found" : "Book is not borrowed");
            }
        });
        loadBtn.setOnAction(e -> loadBooks());
        saveBtn.setOnAction(e -> {
            try {
                library.saveToFile(DATA_FILE);
                statusLabel.setText(library.getBooks().size() + " book(s) saved");
            } catch (IOException ex) {
                statusLabel.setText("Cannot save " + DATA_FILE);
            }
        });

        HBox fields = new HBox(8, new Label("ISBN"), isbnField, new Label("Title"), titleField);
        HBox buttons = new HBox(8, addBtn, deleteBtn, borrowBtn, returnBtn, loadBtn, saveBtn);
        VBox bottom = new VBox(8, fields, buttons, statusLabel);
        bottom.setPadding(new Insets(10));
        BorderPane root = new BorderPane();
        root.setCenter(bookList);
        root.setBottom(bottom);

        stage.setTitle("Mini Library");
        stage.setScene(new Scene(root, 560, 400));
        stage.show();
        loadBooks();   // 启动时读取 books.txt；文件不存在时图书列表为空
    }

    private void addBook() {
        String isbn = isbnField.getText().trim();
        String title = titleField.getText().trim();
        if (isbn.isEmpty() || title.isEmpty()) {
            statusLabel.setText("Please enter ISBN and Title");
            return;
        }
        if (isbn.contains(",") || title.contains(",")) {
            statusLabel.setText("Commas are not allowed");   // 文件以逗号分隔各列
            return;
        }
        show(library.addBook(new Book(isbn, title)), "Book added", "Duplicate ISBN");
    }

    /** 返回用户输入的 ISBN；输入为空时显示提示并返回 null。 */
    private String readIsbn() {
        String isbn = isbnField.getText().trim();
        if (isbn.isEmpty()) {
            statusLabel.setText("Please enter an ISBN");
            return null;
        }
        return isbn;
    }

    /** 操作成功时立即刷新列表，失败时显示原因。 */
    private void show(boolean ok, String done, String failed) {
        if (ok) {
            refreshList();
            isbnField.clear();
            titleField.clear();
        }
        statusLabel.setText(ok ? done : failed);
    }

    private void loadBooks() {
        try {
            library.loadFromFile(DATA_FILE);
            saveBtn.setDisable(false);
            refreshList();
            statusLabel.setText(library.getBooks().size() + " book(s) loaded");
        } catch (IOException ex) {
            saveBtn.setDisable(true);
            statusLabel.setText("Cannot read " + DATA_FILE + ": " + ex.getMessage());
        }
    }

    private void refreshList() {
        bookList.getItems().clear();
        for (Book book : library.getBooks()) {
            bookList.getItems().add(book.toString());
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}

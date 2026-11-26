import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
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

public class EditDesk extends Application {
    private static final Path DATA_FILE = Path.of("edit-books.txt").toAbsolutePath();

    // Same shape as the Lab 3 record class: private fields, a constructor and getters.
    private static class Book {
        private final String isbn;
        private final String title;
        private final boolean available;

        Book(String isbn, String title, boolean available) {
            this.isbn = isbn;
            this.title = title;
            this.available = available;
        }

        String getIsbn() {
            return isbn;
        }

        String getTitle() {
            return title;
        }

        boolean isAvailable() {
            return available;
        }

        @Override
        public String toString() {
            return isbn + " - " + title;
        }

        String fileLine() {
            return isbn + "," + title + "," + available;
        }
    }

    private final ListView<Book> books = new ListView<>();
    private final TextField isbn = new TextField();
    private final TextField title = new TextField();
    private final Label status = new Label("Ready");
    private final Button add = new Button("Add");
    private final Button edit = new Button("Edit");
    private final Button save = new Button("Save");
    private final Button cancel = new Button("Cancel");
    private int editingIndex = -1;
    private boolean loaded;

    @Override
    public void start(Stage stage) {
        books.getSelectionModel().selectedItemProperty().addListener((observable, previous, selected) -> {
            showBook(selected);
            updateButtons();
        });
        add.setOnAction(event -> writeBook());
        edit.setOnAction(event -> {
            editingIndex = books.getSelectionModel().getSelectedIndex();
            updateButtons();
        });
        save.setOnAction(event -> writeBook());
        cancel.setOnAction(event -> {
            showBook(books.getItems().get(editingIndex));
            editingIndex = -1;
            updateButtons();
            status.setText("Edit cancelled");
        });

        HBox fields = new HBox(8, new Label("ISBN"), isbn, new Label("Title"), title);
        HBox buttons = new HBox(8, add, edit, save, cancel);
        VBox controls = new VBox(8, fields, buttons, status);
        controls.setPadding(new Insets(10));
        BorderPane root = new BorderPane(books);
        root.setBottom(controls);

        loadBooks();
        updateButtons();
        stage.setTitle("Edit Desk");
        stage.setScene(new Scene(root, 560, 340));
        stage.show();
    }

    private void showBook(Book selected) {
        isbn.setText(selected == null ? "" : selected.getIsbn());
        title.setText(selected == null ? "" : selected.getTitle());
    }

    private void updateButtons() {
        boolean editing = editingIndex >= 0;
        books.setDisable(editing);
        add.setDisable(!loaded || editing);
        edit.setDisable(!loaded || editing || books.getSelectionModel().getSelectedIndex() < 0);
        save.setDisable(!editing);
        cancel.setDisable(!editing);
    }

    private void loadBooks() {
        List<Book> loadedBooks = new ArrayList<>();
        try {
            for (String line : Files.readAllLines(DATA_FILE)) {
                String[] parts = line.split(",", -1);
                if (parts.length != 3 || invalidField(parts[0]) || invalidField(parts[1])
                        || !(parts[2].equals("true") || parts[2].equals("false"))) {
                    throw new IOException("Invalid book record");
                }
                loadedBooks.add(new Book(parts[0], parts[1], Boolean.parseBoolean(parts[2])));
            }
            books.getItems().setAll(loadedBooks);
            loaded = true;
        } catch (NoSuchFileException ex) {
            loaded = true;
        } catch (IOException ex) {
            status.setText("Cannot read edit-books.txt");
        }
    }

    private static boolean invalidField(String value) {
        return value.isBlank() || value.contains(",") || value.contains("\n") || value.contains("\r");
    }

    private void writeBook() {
        String key = isbn.getText().trim();
        String name = title.getText().trim();
        if (invalidField(key) || invalidField(name)) {
            status.setText("Enter an ISBN and title without commas");
            return;
        }

        List<Book> next = new ArrayList<>(books.getItems());
        for (int i = 0; i < next.size(); i++) {
            if (i != editingIndex && next.get(i).getIsbn().equals(key)) {
                status.setText("Duplicate ISBN");
                return;
            }
        }

        int index = editingIndex;
        if (index >= 0) {
            next.set(index, new Book(key, name, next.get(index).isAvailable()));
        } else {
            index = next.size();
            next.add(new Book(key, name, true));
        }
        try {
            saveBooks(next);
        } catch (IOException ex) {
            status.setText("Cannot write edit-books.txt");
            return;
        }

        editingIndex = -1;
        books.getItems().setAll(next);
        books.getSelectionModel().select(index);
        showBook(next.get(index));
        updateButtons();
        status.setText("Book saved");
    }

    private void saveBooks(List<Book> next) throws IOException {
        Path pending = Files.createTempFile(DATA_FILE.getParent(), "edit-books-", ".tmp");
        try {
            List<String> lines = new ArrayList<>();
            for (Book book : next) {
                lines.add(book.fileLine());
            }
            Files.write(pending, lines);
            Files.move(pending, DATA_FILE, StandardCopyOption.REPLACE_EXISTING);
        } finally {
            Files.deleteIfExists(pending);
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}

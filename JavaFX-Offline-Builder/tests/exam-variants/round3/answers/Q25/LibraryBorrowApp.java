// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Scanner;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

/** Library Borrowing: add, edit, delete, search and save book records. */
public class LibraryBorrowApp extends Application {
    private static final String DATA_FILE = "books.txt";
    private boolean fileReadFailed;  // Never overwrite a file that could not be read.

    private ArrayList<Book> books = new ArrayList<>();
    private ListView<String> listView = new ListView<>();
    private ArrayList<Book> shown = new ArrayList<>();   // records now in the list, same order
    private Label messageLabel = new Label("Ready");

    // Input fields
    private TextField isbnField = new TextField();

    // Buttons
    private Button saveButton = new Button("Save");
    private Button borrowButton = new Button("Borrow");
    private Button returnButton = new Button("Return");

    private Book selectedBook;   // book chosen in the list, or null

    @Override
    public void start(Stage stage) {
        // Top: student information and the time the program started
        String started = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        VBox header = new VBox(4,
                new Label("Name: Test Student        Student ID: DEMO-ID"),
                new Label("Program Started: " + started));
        header.setPadding(new Insets(10));

        // Below the list: input fields
        HBox form = new HBox(8, new Label("ISBN:"), isbnField);
        form.setAlignment(Pos.CENTER_LEFT);

        // Bottom: rows of buttons and the message label
        HBox row1 = new HBox(8, borrowButton, returnButton, saveButton);
        VBox bottom = new VBox(8, form, row1, messageLabel);
        bottom.setPadding(new Insets(10));

        listView.setPlaceholder(new Label("No book records"));

        BorderPane root = new BorderPane();
        root.setTop(header);
        root.setCenter(listView);
        root.setBottom(bottom);

        // Event handlers
        listView.getSelectionModel().selectedIndexProperty().addListener((observable, oldIndex, newIndex) -> selectFromList());
        borrowButton.setOnAction(e -> changeAvailable(false, "The selected book is not available.", "Book borrowed."));
        returnButton.setOnAction(e -> changeAvailable(true, "The selected book is already available.", "Book returned."));
        saveButton.setOnAction(e -> {
            if (saveToFile()) showMessage("" + books.size() + " record(s) saved to " + DATA_FILE + ".");
        });

        stage.setTitle("Library Borrowing");
        stage.setScene(new Scene(root, 820, 560));
        stage.show();
        if (books.isEmpty()) {   // no saved records yet: start with the records given in the question
            books.add(new Book("001", "Java Basics", true));
            books.add(new Book("002", "Python Intro", false));
            books.add(new Book("003", "Web Systems", true));
        }
        showBooks(books);
        updateButtons();
    }

    /** Clicking a row copies its values into the input fields. */
    private void selectFromList() {
        int index = listView.getSelectionModel().getSelectedIndex();
        if (index >= 0) {
            selectedBook = shown.get(index);
            fillFields(selectedBook);
        }
        updateButtons();
    }

    /** Puts the values of a book into the input fields. */
    private void fillFields(Book book) {
        isbnField.setText(book.getISBN());
    }

    /** Returns the book with this ISBN, or null if there is none. */
    private Book findBook(String isbn) {
        for (Book book : books) {
            if (book.getISBN().equals(isbn)) {
                return book;
            }
        }
        return null;
    }

    /** The selected book, or the one whose ISBN was typed. Shows an error and returns null if there is none. */
    private Book chooseBook() {
        String isbn = isbnField.getText().trim();
        if (selectedBook != null && (isbn.isEmpty() || selectedBook.getISBN().equals(isbn))) {
            return selectedBook;
        }
        if (isbn.isEmpty()) {
            showError("Please enter or select an ISBN.");
            return null;
        }
        Book book = findBook(isbn);
        if (book == null) {
            showError("Book with ISBN " + isbn + " cannot be found.");
        }
        return book;
    }

    /** Status buttons: change available of the selected book and save. */
    private void changeAvailable(boolean value, String alreadyMessage, String doneMessage) {
        Book book = chooseBook();
        if (book == null) {
            return;
        }
        if (book.isAvailable() == value) {
            showError(alreadyMessage);
            return;
        }
        book.setAvailable(value);
        showBooks(books);
        if (selectedBook != null) {
            listView.getSelectionModel().select(shown.indexOf(selectedBook));
        }
        updateButtons();
        showMessage(doneMessage);
    }

    /** Shows a list of records in the ListView. */
    private void showBooks(ArrayList<Book> records) {
        shown = new ArrayList<>(records);
        listView.getItems().clear();
        for (Book book : shown) {
            listView.getItems().add(book.toString());
        }
    }

    /** Clears the input fields and the selection, and returns to normal mode. */
    private void clearFields() {
        isbnField.clear();
        listView.getSelectionModel().clearSelection();
        selectedBook = null;
        updateButtons();
    }

    /** Status buttons need a selected book in the right state. */
    private void updateButtons() {
        // Every button is always enabled in this version.
    }

    /** Every error appears in a pop-up Alert and in the message label. */
    private void showError(String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle("Library Borrowing");
        alert.setHeaderText("Error");
        alert.setContentText(message);
        alert.showAndWait();
        messageLabel.setText(message);
    }

    /** Success and state messages only go to the message label. */
    private void showMessage(String message) {
        messageLabel.setText(message);
    }

    private static String[] splitFileLine(String line) {
        char separator = ",".charAt(0);
        char quote = "\"".charAt(0);
        ArrayList<String> parts = new ArrayList<>();
        StringBuilder value = new StringBuilder();
        boolean inQuotes = false;
        boolean afterQuote = false;
        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (inQuotes) {
                if (ch != quote) {
                    value.append(ch);
                } else if (i + 1 < line.length() && line.charAt(i + 1) == quote) {
                    value.append(ch);
                    i++;
                } else {
                    inQuotes = false;
                    afterQuote = true;
                }
            } else if (ch == separator) {
                parts.add(afterQuote ? value.toString() : value.toString().trim());
                value.setLength(0);
                afterQuote = false;
            } else if (afterQuote) {
                if (!Character.isWhitespace(ch)) throw new IllegalArgumentException("Unexpected text after a closing quote.");
            } else if (ch == quote) {
                if (!value.toString().trim().isEmpty()) throw new IllegalArgumentException("Unexpected quote inside a field.");
                value.setLength(0);
                inQuotes = true;
            } else {
                value.append(ch);
            }
        }
        if (inQuotes) throw new IllegalArgumentException("Unclosed quote.");
        parts.add(afterQuote ? value.toString() : value.toString().trim());
        return parts.toArray(new String[0]);
    }

    /** Checks one file record without changing the current list. */
    private Book parseFileRecord(String[] parts) {
        if (parts.length != 3) throw new IllegalArgumentException("Expected 3 fields.");
        String value0 = parts[0];
        if (value0.isBlank()) throw new IllegalArgumentException("ISBN cannot be empty.");
        String value1 = parts[1];
        if (!"true".equalsIgnoreCase(parts[2].trim()) && !"false".equalsIgnoreCase(parts[2].trim()))
            throw new IllegalArgumentException("Available must be true or false.");
        boolean value2 = Boolean.parseBoolean(parts[2].trim());
        return new Book(value0, value1, value2);
    }

    /** Load button: replaces the list with the records stored in books.txt. */
    private boolean loadFromFile() {
        Path file = Paths.get(DATA_FILE);
        ArrayList<Book> loaded = new ArrayList<>();
        HashSet<String> keys = new HashSet<>();
        int lineNumber = 0;
        try (Scanner input = new Scanner(file, StandardCharsets.UTF_8)) {
            while (input.hasNextLine()) {
                lineNumber++;
                String line = input.nextLine();
                if (lineNumber == 1 && !line.isEmpty() && line.charAt(0) == 0xfeff) line = line.substring(1);
                if (line.isBlank() && !line.contains(",")) continue;
                String[] parts = splitFileLine(line);
                Book entry = parseFileRecord(parts);
                if (!keys.add(entry.getISBN())) throw new IllegalArgumentException("Duplicate ISBN: " + entry.getISBN());
                loaded.add(entry);
            }
            if (input.ioException() != null) throw input.ioException();
        } catch (IOException | IllegalArgumentException ex) {
            fileReadFailed = true;
            showError("Unable to load book records from books.txt. Line " + Math.max(1, lineNumber) + ": " + ex.getMessage());
            return false;
        }
        books.clear();
        books.addAll(loaded);
        fileReadFailed = false;
        showMessage("" + books.size() + " record(s) loaded from " + DATA_FILE + ".");
        return true;
    }

    /** Writes UTF-8 records to a temporary file before replacing the data file. */
    private boolean saveToFile() {
        if (fileReadFailed) { showError("Correct the data file and load it successfully before saving."); return false; }
        Path destination = Paths.get(DATA_FILE).toAbsolutePath();
        Path temp = null;
        try {
            temp = Files.createTempFile(destination.getParent(), ".builder-", ".tmp");
            try (PrintWriter output = new PrintWriter(Files.newBufferedWriter(temp, StandardCharsets.UTF_8))) {
                for (Book book : books) {
                    output.println(book.toFileLine());
                }
                if (output.checkError()) throw new IOException("Write failed.");
            }
            try {
                Files.move(temp, destination, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException ex) {
                Files.move(temp, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            return true;
        } catch (IOException ex) {
            showError("Unable to save book records to books.txt.");
            return false;
        } finally {
            if (temp != null) {
                try { Files.deleteIfExists(temp); } catch (IOException ex) { /* keep the original save result */ }
            }
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}

/** One book record stored in books.txt. */
class Book {
    private String isbn;
    private String title;
    private boolean available;

    /** New book from the input form; title starts as "", available starts as true. */
    public Book(String isbn) {
        this(isbn, "", true);
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
        return isbn + "  |  " + title + "  |  " + (available ? "Available" : "Not available");
    }
}

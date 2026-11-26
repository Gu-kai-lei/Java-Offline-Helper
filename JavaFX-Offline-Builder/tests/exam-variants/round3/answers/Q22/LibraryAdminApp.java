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

/** Library Admin System: add, edit, delete, search and save book records. */
public class LibraryAdminApp extends Application {
    private static final String DATA_FILE = "books.txt";
    private boolean fileReadFailed;  // Never overwrite a file that could not be read.

    private ArrayList<Book> books = new ArrayList<>();
    private ListView<String> listView = new ListView<>();
    private ArrayList<Book> shown = new ArrayList<>();   // records now in the list, same order
    private Label messageLabel = new Label("Ready");

    // Input fields
    private TextField isbnField = new TextField();
    private TextField titleField = new TextField();

    // Buttons
    private Button addButton = new Button("Add");
    private Button editButton = new Button("Edit");
    private Button saveButton = new Button("Save");
    private Button deleteButton = new Button("Delete");
    private Button searchButton = new Button("Search");
    private Button displayAllButton = new Button("Display All");
    private Button loadTestDataButton = new Button("Load Test Data");
    private Button borrowButton = new Button("Borrow");
    private Button returnButton = new Button("Return");
    private Button sortByISBNButton = new Button("Sort by ISBN");
    private Button sortByTitleButton = new Button("Sort by Title");
    private Button clearButton = new Button("Clear");
    private Button exitButton = new Button("Exit");

    private Book selectedBook;   // book chosen in the list, or null
    private Book editingBook;    // not null while in edit mode
    private boolean isbnAscending = true;
    private boolean titleAscending = true;

    @Override
    public void start(Stage stage) {
        // Top: student information and the time the program started
        String started = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        VBox header = new VBox(4,
                new Label("Name: Test Student        Student ID: DEMO-ID"),
                new Label("Program Started: " + started));
        header.setPadding(new Insets(10));

        // Below the list: input fields and the Clear button
        HBox form = new HBox(8, new Label("ISBN:"), isbnField, new Label("Title:"), titleField, clearButton);
        form.setAlignment(Pos.CENTER_LEFT);

        // Bottom: rows of buttons and the message label
        HBox row1 = new HBox(8, addButton, editButton, saveButton, deleteButton, searchButton);
        HBox row2 = new HBox(8, displayAllButton, loadTestDataButton, borrowButton, returnButton, exitButton);
        HBox row3 = new HBox(8, sortByISBNButton, sortByTitleButton);
        VBox bottom = new VBox(8, form, row1, row2, row3, messageLabel);
        bottom.setPadding(new Insets(10));

        listView.setPlaceholder(new Label("No book records"));

        BorderPane root = new BorderPane();
        root.setTop(header);
        root.setCenter(listView);
        root.setBottom(bottom);

        // Event handlers
        listView.getSelectionModel().selectedIndexProperty().addListener((observable, oldIndex, newIndex) -> selectFromList());
        addButton.setOnAction(e -> {
            if (fileReadFailed) {
                showError("The data file could not be read. Correct it and reopen the program before editing.");
                return;
            }
            addBook();
        });
        editButton.setOnAction(e -> {
            if (fileReadFailed) {
                showError("The data file could not be read. Correct it and reopen the program before editing.");
                return;
            }
            editBook();
        });
        saveButton.setOnAction(e -> {
            if (fileReadFailed) {
                showError("The data file could not be read. Correct it and reopen the program before editing.");
                return;
            }
            saveEdit();
        });
        deleteButton.setOnAction(e -> {
            if (fileReadFailed) {
                showError("The data file could not be read. Correct it and reopen the program before editing.");
                return;
            }
            deleteBook();
        });
        searchButton.setOnAction(e -> search());
        displayAllButton.setOnAction(e -> displayAll());
        loadTestDataButton.setOnAction(e -> {
            if (fileReadFailed) {
                showError("The data file could not be read. Correct it and reopen the program before editing.");
                return;
            }
            loadTestData();
        });
        borrowButton.setOnAction(e -> {
            if (fileReadFailed) {
                showError("The data file could not be read. Correct it and reopen the program before editing.");
                return;
            }
            changeAvailable(false, "The selected book is not available.", "Book borrowed.");
        });
        returnButton.setOnAction(e -> {
            if (fileReadFailed) {
                showError("The data file could not be read. Correct it and reopen the program before editing.");
                return;
            }
            changeAvailable(true, "The selected book is already available.", "Book returned.");
        });
        sortByISBNButton.setOnAction(e -> sortByIsbn());
        sortByTitleButton.setOnAction(e -> sortByTitle());
        clearButton.setOnAction(e -> {
            clearFields();
            showMessage("Fields cleared.");
        });
        exitButton.setOnAction(e -> stage.close());

        stage.setTitle("Library Admin System");
        stage.setScene(new Scene(root, 820, 560));
        stage.show();
        loadFromFile();
        showBooks(books);
        updateButtons();
    }

    /** Clicking a row copies its values into the input fields. */
    private void selectFromList() {
        if (editingBook != null) {
            return;   // the list is locked while editing
        }
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
        titleField.setText(book.getTitle());
    }

    /** Reads the input fields. Shows an error and returns null if something is missing or invalid. */
    private Book readFields() {
        String isbnText = isbnField.getText().trim();
        String titleText = titleField.getText().trim();
        if (isbnText.isEmpty() || titleText.isEmpty()) {
            showError("Please enter both ISBN and Title.");
            return null;
        }
        if (isbnText.contains("\n") || isbnText.contains("\r") || titleText.contains("\n") || titleText.contains("\r")) {
            showError("Text fields must fit on one line.");
            return null;
        }
        return new Book(isbnText, titleText);
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
        if (selectedBook != null) {
            return selectedBook;
        }
        String isbn = isbnField.getText().trim();
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

    /** Add button: adds a new book if the ISBN is not used yet. */
    private void addBook() {
        Book book = readFields();
        if (book == null) {
            return;
        }
        if (findBook(book.getISBN()) != null) {
            showError("Duplicate ISBN: " + book.getISBN() + " already exists.");
            return;
        }
        books.add(book);
        if (!saveToFile()) { showBooks(books); updateButtons(); return; }
        showBooks(books);
        clearFields();
        showMessage("Book added: " + book.getISBN());
    }

    /** Edit button: enters edit mode. Only Save and Exit stay enabled. */
    private void editBook() {
        if (books.isEmpty()) {
            showError("No book record is available for editing.");
            return;
        }
        Book book = chooseBook();
        if (book == null) {
            return;
        }
        editingBook = book;
        fillFields(book);
        updateButtons();
        showMessage("Editing ISBN " + book.getISBN() + ". Change the fields and click Save.");
    }

    /** Save button: copies the input fields into the book being edited. */
    private void saveEdit() {
        if (editingBook == null) {
            showError("No book is selected for editing.");
            return;
        }
        Book changed = readFields();
        if (changed == null) {
            return;   // stay in edit mode
        }
        Book other = findBook(changed.getISBN());
        if (other != null && other != editingBook) {
            showError("Duplicate ISBN: " + changed.getISBN() + " already exists.");
            return;
        }
        editingBook.setISBN(changed.getISBN());
        editingBook.setTitle(changed.getTitle());
        editingBook = null;
        if (!saveToFile()) { showBooks(books); updateButtons(); return; }
        showBooks(books);
        clearFields();
        showMessage("Book updated.");
    }

    /** Delete button: removes the selected or typed book. */
    private void deleteBook() {
        if (books.isEmpty()) {
            showError("No book record is available for deletion.");
            return;
        }
        Book book = chooseBook();
        if (book == null) {
            return;
        }
        books.remove(book);
        if (!saveToFile()) { showBooks(books); updateButtons(); return; }
        showBooks(books);
        clearFields();
        showMessage("Book deleted: " + book.getISBN());
    }

    /** Search button: partial, case-insensitive; any filled-in criteria must match. */
    private void search() {
        String isbnKey = isbnField.getText().trim().toLowerCase(java.util.Locale.ROOT);
        String titleKey = titleField.getText().trim().toLowerCase(java.util.Locale.ROOT);
        if (isbnKey.isEmpty() && titleKey.isEmpty()) {
            showError("Please enter a partial ISBN and/or partial Title for searching.");
            return;
        }
        ArrayList<Book> matches = new ArrayList<>();
        for (Book book : books) {
            boolean match = (!isbnKey.isEmpty() && book.getISBN().toLowerCase(java.util.Locale.ROOT).contains(isbnKey))
                    || (!titleKey.isEmpty() && book.getTitle().toLowerCase(java.util.Locale.ROOT).contains(titleKey));
            if (match) {
                matches.add(book);
            }
        }
        selectedBook = null;
        showBooks(matches);
        updateButtons();
        showMessage(matches.size() + " matching record(s). Click Display All to see every record.");
    }

    /** Display All button: shows every book in the current ArrayList order. */
    private void displayAll() {
        selectedBook = null;
        showBooks(books);
        updateButtons();
        showMessage(books.size() + " record(s).");
    }

    /** Sort button: sorts the ArrayList by ISBN; each click switches between ascending and descending. */
    private void sortByIsbn() {
        if (isbnAscending) {
            books.sort((a, b) -> a.getISBN().compareToIgnoreCase(b.getISBN()));
        } else {
            books.sort((a, b) -> b.getISBN().compareToIgnoreCase(a.getISBN()));
        }
        showMessage("Sorted by ISBN (" + (isbnAscending ? "ascending" : "descending") + ").");
        isbnAscending = !isbnAscending;
        selectedBook = null;
        showBooks(books);
        updateButtons();
    }

    /** Sort button: sorts the ArrayList by Title; each click switches between ascending and descending. */
    private void sortByTitle() {
        if (titleAscending) {
            books.sort((a, b) -> a.getTitle().compareToIgnoreCase(b.getTitle()));
        } else {
            books.sort((a, b) -> b.getTitle().compareToIgnoreCase(a.getTitle()));
        }
        showMessage("Sorted by Title (" + (titleAscending ? "ascending" : "descending") + ").");
        titleAscending = !titleAscending;
        selectedBook = null;
        showBooks(books);
        updateButtons();
    }

    /** Load Test Data button: adds the sample records whose ISBN is not used yet. */
    private void loadTestData() {
        Book[] samples = {
            new Book("0131450913", "HTML How to Program", true),
            new Book("0131857576", "C++ How to Program", true),
            new Book("0132222205", "Java How to Program", true)
        };
        int added = 0;
        String skipped = "";
        for (Book sample : samples) {
            if (findBook(sample.getISBN()) == null) {
                books.add(sample);
                added++;
            } else {
                skipped = skipped.isEmpty() ? sample.getISBN() : skipped + ", " + sample.getISBN();
            }
        }
        if (added > 0) {
            if (!saveToFile()) { showBooks(books); updateButtons(); return; }
        }
        showBooks(books);
        if (!skipped.isEmpty()) {
            showError("Duplicate ISBN: " + skipped + " already exists.");
        } else {
            showMessage(added + " test record(s) added.");
        }
    }

    /** Status buttons: change available of the selected book and save. */
    private void changeAvailable(boolean value, String alreadyMessage, String doneMessage) {
        Book book = selectedBook;
        if (book == null) {
            showError("Please select a book first.");
            return;
        }
        if (book.isAvailable() == value) {
            showError(alreadyMessage);
            return;
        }
        book.setAvailable(value);
        if (!saveToFile()) { showBooks(books); updateButtons(); return; }
        showBooks(books);
        listView.getSelectionModel().select(shown.indexOf(selectedBook));
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
        titleField.clear();
        listView.getSelectionModel().clearSelection();
        selectedBook = null;
        editingBook = null;
        updateButtons();
    }

    /** Edit mode: only Save and Exit work. Status buttons need a selected book in the right state. */
    private void updateButtons() {
        boolean editing = editingBook != null;
        addButton.setDisable(editing);
        editButton.setDisable(editing);
        saveButton.setDisable(!editing);
        deleteButton.setDisable(editing);
        searchButton.setDisable(editing);
        displayAllButton.setDisable(editing);
        loadTestDataButton.setDisable(editing);
        sortByISBNButton.setDisable(editing);
        sortByTitleButton.setDisable(editing);
        clearButton.setDisable(editing);
        listView.setDisable(editing);
        borrowButton.setDisable(editing || selectedBook == null || selectedBook.isAvailable() == false);
        returnButton.setDisable(editing || selectedBook == null || selectedBook.isAvailable() == true);
    }

    /** Every error appears in a pop-up Alert and in the message label. */
    private void showError(String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle("Library Admin System");
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
        if (value1.isBlank()) throw new IllegalArgumentException("Title cannot be empty.");
        if (!"true".equalsIgnoreCase(parts[2].trim()) && !"false".equalsIgnoreCase(parts[2].trim()))
            throw new IllegalArgumentException("Available must be true or false.");
        boolean value2 = Boolean.parseBoolean(parts[2].trim());
        return new Book(value0, value1, value2);
    }

    /** Reads books.txt at startup. A missing file means an empty list. */
    private boolean loadFromFile() {
        Path file = Paths.get(DATA_FILE);
        if (Files.notExists(file)) return true;
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

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
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

/** Notes Manager: add, edit, delete, search and save note records. */
public class NotesApp extends Application {
    private static final String DATA_FILE = "notes.txt";
    private boolean fileReadFailed;  // Never overwrite a file that could not be read.

    private ArrayList<Note> notes = new ArrayList<>();
    private TextArea recordArea = new TextArea();
    private Label messageLabel = new Label("Ready");

    // Input fields
    private TextField textField = new TextField();

    // Buttons
    private Button addButton = new Button("Add");
    private Button saveButton = new Button("Save");
    private Button loadButton = new Button("Load");
    private Button clearButton = new Button("Clear");


    @Override
    public void start(Stage stage) {
        // Top: student information and the time the program started
        String started = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        VBox header = new VBox(4,
                new Label("Name: Test Student        Student ID: DEMO-ID"),
                new Label("Program Started: " + started));
        header.setPadding(new Insets(10));

        // Below the list: input fields and the Clear button
        HBox form = new HBox(8, new Label("Note:"), textField, clearButton);
        form.setAlignment(Pos.CENTER_LEFT);

        // Bottom: rows of buttons and the message label
        HBox row1 = new HBox(8, addButton);
        HBox row2 = new HBox(8, saveButton, loadButton);
        VBox bottom = new VBox(8, form, row1, row2, messageLabel);
        bottom.setPadding(new Insets(10));

        recordArea.setEditable(false);   // display only

        BorderPane root = new BorderPane();
        root.setTop(header);
        root.setCenter(recordArea);
        root.setBottom(bottom);

        // Event handlers
        addButton.setOnAction(e -> addNote());
        saveButton.setOnAction(e -> {
            if (saveToFile()) showMessage("" + notes.size() + " record(s) saved to " + DATA_FILE + ".");
        });
        loadButton.setOnAction(e -> {
            if (loadFromFile()) {
                showNotes(notes);
                clearFields();
            }
        });
        clearButton.setOnAction(e -> {
            notes.clear();   // memory only: the data file is not changed
            showNotes(notes);
            clearFields();
            showMessage("All records cleared.");
        });

        stage.setTitle("Notes Manager");
        stage.setScene(new Scene(root, 820, 560));
        stage.show();
        showNotes(notes);
        updateButtons();
    }

    /** Puts the values of a note into the input fields. */
    private void fillFields(Note note) {
        textField.setText(note.getText());
    }

    /** Reads the input fields. Shows an error and returns null if something is missing or invalid. */
    private Note readFields() {
        String textText = textField.getText().trim();
        if (textText.isEmpty()) {
            showError("Empty note");
            return null;
        }
        if (textText.contains("\n") || textText.contains("\r")) {
            showError("Text fields must fit on one line.");
            return null;
        }
        return new Note(textText);
    }

    /** Returns the note with this Note, or null if there is none. */
    private Note findNote(String text) {
        for (Note note : notes) {
            if (note.getText().equals(text)) {
                return note;
            }
        }
        return null;
    }

    /** The note whose Note was typed. Shows an error and returns null if there is none. */
    private Note chooseNote() {
        String text = textField.getText().trim();
        if (text.isEmpty()) {
            showError("Please enter a Note.");
            return null;
        }
        Note note = findNote(text);
        if (note == null) {
            showError("Note with Note " + text + " cannot be found.");
        }
        return note;
    }

    /** Add button: adds a new note if the Note is not used yet. */
    private void addNote() {
        Note note = readFields();
        if (note == null) {
            return;
        }
        if (findNote(note.getText()) != null) {
            showError("Duplicate Note: " + note.getText() + " already exists.");
            return;
        }
        notes.add(note);
        showNotes(notes);
        clearFields();
        showMessage("Note added: " + note.getText());
    }

    /** Shows a list of records in the text area, one per line. */
    private void showNotes(ArrayList<Note> records) {
        String text = "";
        for (Note note : records) {
            text += note.toString() + "\n";
        }
        recordArea.setText(text);
    }

    /** Clears the input fields, and returns to normal mode. */
    private void clearFields() {
        textField.clear();
        updateButtons();
    }

    /** Buttons act on the typed Note. */
    private void updateButtons() {
        // Every button is always enabled in this version.
    }

    /** Every error appears in a pop-up Alert and in the message label. */
    private void showError(String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle("Notes Manager");
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
    private Note parseFileRecord(String[] parts) {
        if (parts.length != 1) throw new IllegalArgumentException("Expected 1 fields.");
        String value0 = parts[0];
        if (value0.isBlank()) throw new IllegalArgumentException("Note cannot be empty.");
        return new Note(value0);
    }

    /** Load button: replaces the list with the records stored in notes.txt. */
    private boolean loadFromFile() {
        Path file = Paths.get(DATA_FILE);
        ArrayList<Note> loaded = new ArrayList<>();
        HashSet<String> keys = new HashSet<>();
        int lineNumber = 0;
        try (Scanner input = new Scanner(file, StandardCharsets.UTF_8)) {
            while (input.hasNextLine()) {
                lineNumber++;
                String line = input.nextLine();
                if (lineNumber == 1 && !line.isEmpty() && line.charAt(0) == 0xfeff) line = line.substring(1);
                if (line.isBlank() && !line.contains(",")) continue;
                String[] parts = splitFileLine(line);
                Note entry = parseFileRecord(parts);
                if (!keys.add(entry.getText())) throw new IllegalArgumentException("Duplicate Note: " + entry.getText());
                loaded.add(entry);
            }
            if (input.ioException() != null) throw input.ioException();
        } catch (IOException | IllegalArgumentException ex) {
            fileReadFailed = true;
            showError("File not found. Line " + Math.max(1, lineNumber) + ": " + ex.getMessage());
            return false;
        }
        notes.clear();
        notes.addAll(loaded);
        fileReadFailed = false;
        showMessage("" + notes.size() + " contact(s) loaded.");
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
                for (Note note : notes) {
                    output.println(note.toFileLine());
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
            showError("Unable to save note records to notes.txt.");
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

/** One note record stored in notes.txt. */
class Note {
    private String text;

    public Note(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    /** Serializes one record in the selected text file format. */
    public String toFileLine() {
        return String.join(",", escapeFileField(text));
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
        return text;
    }
}

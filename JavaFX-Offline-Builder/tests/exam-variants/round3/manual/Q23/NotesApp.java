import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.BufferedWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Scanner;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;

/** 用 ArrayList<String> 保存笔记。Save 每行写入一条笔记，Load 从 notes.txt 读取。 */
public class NotesApp extends Application {
    private static final String DATA_FILE = "notes.txt";
    private ArrayList<String> notes = new ArrayList<>();
    private TextField noteInput = new TextField();
    private TextArea notesArea = new TextArea();
    private Label statusLabel = new Label("Ready");

    @Override
    public void start(Stage stage) {
        notesArea.setEditable(false);
        noteInput.setPromptText("Type a note");
        Button addBtn = new Button("Add");
        Button saveBtn = new Button("Save");
        Button loadBtn = new Button("Load");
        Button clearBtn = new Button("Clear");

        addBtn.setOnAction(e -> addNote());
        saveBtn.setOnAction(e -> saveNotes());
        loadBtn.setOnAction(e -> loadNotes());
        clearBtn.setOnAction(e -> {
            notes.clear();   // 仅清空内存，保留 notes.txt
            showNotes();
            statusLabel.setText("Notes cleared");
        });

        HBox top = new HBox(8, noteInput, addBtn);
        HBox bottom = new HBox(8, saveBtn, loadBtn, clearBtn, statusLabel);
        top.setPadding(new Insets(10));
        bottom.setPadding(new Insets(10));
        BorderPane root = new BorderPane();
        root.setTop(top);
        root.setCenter(notesArea);
        root.setBottom(bottom);

        stage.setTitle("Notes Manager");
        stage.setScene(new Scene(root, 460, 320));
        stage.show();
    }

    private void addNote() {
        String text = noteInput.getText().trim();
        if (text.isEmpty()) {
            statusLabel.setText("Empty note");
            return;
        }
        notes.add(text);
        noteInput.clear();
        showNotes();
        statusLabel.setText("Note added");
    }

    /** 用当前列表覆盖 notes.txt。 */
    private void saveNotes() {
        try (BufferedWriter out = Files.newBufferedWriter(Path.of(DATA_FILE))) {
            for (String note : notes) {
                out.write(note);
                out.newLine();
            }
        } catch (IOException ex) {
            statusLabel.setText("Cannot save " + DATA_FILE);
            return;
        }
        statusLabel.setText(notes.size() + " note(s) saved");
    }

    /** 读取 notes.txt 并替换当前列表。 */
    private void loadNotes() {
        File file = new File(DATA_FILE);
        if (!file.exists()) {
            statusLabel.setText("File not found");
            return;
        }
        ArrayList<String> loaded = new ArrayList<>();
        try (Scanner in = new Scanner(file, "UTF-8")) {
            while (in.hasNextLine()) {
                String line = in.nextLine().trim();
                if (!line.isEmpty()) {
                    loaded.add(line);
                }
            }
            if (in.ioException() != null) {
                statusLabel.setText("Cannot read " + DATA_FILE);
                return;
            }
        } catch (FileNotFoundException ex) {
            statusLabel.setText("File not found");
            return;
        }
        notes = loaded;
        showNotes();
        statusLabel.setText(notes.size() + " note(s) loaded");
    }

    private void showNotes() {
        notesArea.setText(String.join("\n", notes));
    }

    public static void main(String[] args) {
        launch(args);
    }
}

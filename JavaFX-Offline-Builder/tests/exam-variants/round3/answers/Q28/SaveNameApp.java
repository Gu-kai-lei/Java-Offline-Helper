// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonType;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;

public class SaveNameApp extends Application {
    private String savedName = "";

    @Override
    public void start(Stage stage) {
        TextField studentName = new TextField("");
        Label statusLabel = new Label("Ready");
        Button saveBtn = new Button("Save");
        Button resetBtn = new Button("Reset");

        BorderPane root = new BorderPane();
        HBox topBox = new HBox(8, studentName, statusLabel);
        topBox.setPadding(new Insets(10));
        root.setTop(topBox);
        HBox bottomBox = new HBox(8, saveBtn, resetBtn);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        saveBtn.setOnAction(e -> {
            if (studentName.getText().trim().isEmpty()) {
                statusLabel.setText("Invalid name");
            } else {
                savedName = studentName.getText().trim();
                statusLabel.setText("Saved");
            }
        });

        resetBtn.setOnAction(e -> {
            savedName = "";
            studentName.clear();
            statusLabel.setText("Ready");
        });

        stage.setOnCloseRequest(e -> {
            if (!(studentName.getText().trim().equals(savedName))) {
                Alert confirm = new Alert(Alert.AlertType.CONFIRMATION, "Unsaved changes. Exit?");
                if (confirm.showAndWait().orElse(ButtonType.CANCEL) == ButtonType.OK) {
                } else {
                    e.consume();
                }
            }
        });

        stage.setTitle("Save Name");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

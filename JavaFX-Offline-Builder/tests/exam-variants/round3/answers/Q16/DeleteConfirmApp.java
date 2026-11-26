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
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;

public class DeleteConfirmApp extends Application {
    private boolean deleted = false;

    @Override
    public void start(Stage stage) {
        Label itemLabel = new Label("Item available");
        Button deleteBtn = new Button("Delete");
        Button resetBtn = new Button("Reset");

        BorderPane root = new BorderPane();
        HBox topBox = new HBox(8, itemLabel);
        topBox.setPadding(new Insets(10));
        root.setTop(topBox);
        HBox bottomBox = new HBox(8, deleteBtn, resetBtn);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        deleteBtn.setOnAction(e -> {
            if (deleted) {
                new Alert(Alert.AlertType.INFORMATION, "No item to delete").showAndWait();
            } else {
                Alert confirm = new Alert(Alert.AlertType.CONFIRMATION, "Are you sure you want to delete?");
                if (confirm.showAndWait().orElse(ButtonType.CANCEL) == ButtonType.OK) {
                    itemLabel.setText("Item deleted");
                    deleted = true;
                }
            }
        });

        resetBtn.setOnAction(e -> {
            deleted = false;
            itemLabel.setText("Item available");
        });

        stage.setTitle("Delete Confirm");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

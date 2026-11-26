// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;

public class WindowLockApp extends Application {
    private boolean locked = true;

    @Override
    public void start(Stage stage) {
        Label statusLabel = new Label("Window locked");
        Button unlockBtn = new Button("Unlock");

        BorderPane root = new BorderPane();
        HBox topBox = new HBox(8, statusLabel);
        topBox.setPadding(new Insets(10));
        root.setTop(topBox);
        HBox bottomBox = new HBox(8, unlockBtn);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        stage.setOnCloseRequest(e -> {
            if (locked) {
                e.consume();
                statusLabel.setText("Closing is not allowed");
            }
        });

        unlockBtn.setOnAction(e -> {
            locked = false;
            statusLabel.setText("Window unlocked");
        });

        stage.setTitle("Window Lock");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import javafx.application.Application;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;

public class RegistrationApp extends Application {
    @Override
    public void start(Stage stage) {
        TextField nameInput = new TextField("");
        TextField ageInput = new TextField("");
        Button registerBtn = new Button("Register");
        Button clearBtn = new Button("Clear");
        Label statusLabel = new Label("Ready");

        BorderPane root = new BorderPane();
        HBox topBox = new HBox(8, nameInput, ageInput);
        topBox.setPadding(new Insets(10));
        root.setTop(topBox);
        HBox bottomBox = new HBox(8, registerBtn, clearBtn, statusLabel);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        EventHandler<ActionEvent> sharedHandler1 = e -> {
            if (nameInput.getText().trim().isEmpty()) {
                statusLabel.setText("Invalid name");
            } else {
                try {
                    int age = Integer.parseInt(ageInput.getText().trim());
                    if (age < 10 || age > 100) throw new NumberFormatException();
                    statusLabel.setText("Registered: " + nameInput.getText().trim() + ", Age: " + age);
                } catch (NumberFormatException ex) {
                    statusLabel.setText("Invalid age");
                }
            }
        };
        registerBtn.setOnAction(sharedHandler1);
        ageInput.setOnAction(sharedHandler1);

        clearBtn.setOnAction(e -> {
            nameInput.clear();
            ageInput.clear();
            statusLabel.setText("Ready");
        });

        stage.setTitle("Student Registration");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class KeyboardGame extends Application {
    @Override
    public void start(Stage stage) {
        Pane pane = new Pane();
        pane.setPrefSize(300, 200);
        pane.setStyle("-fx-background-color: white; -fx-border-color: lightgray;");
        Circle c = new Circle(150, 120, 15, Color.BLUE);
        Label statusLabel = new Label("Position: (150, 120)");
        Button resetBtn = new Button("Reset");
        pane.getChildren().add(c);

        BorderPane root = new BorderPane();
        root.setCenter(pane);
        HBox bottomBox = new HBox(8, statusLabel, resetBtn);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);
        resetBtn.setFocusTraversable(false);   // keep arrow keys for the key handler

        // Event handlers
        scene.setOnKeyPressed(e -> {
            if (e.getCode() == KeyCode.LEFT) {
                if (c.getCenterX() - 10 >= 20 && c.getCenterX() - 10 <= 280) {
                    c.setCenterX(c.getCenterX() - 10);
                    statusLabel.setText("Position: (" + c.getCenterX() + ", " + c.getCenterY() + ")");
                } else {
                    statusLabel.setText("Boundary reached");
                }
            }
            if (e.getCode() == KeyCode.UP) {
                if (c.getCenterY() - 10 >= 20 && c.getCenterY() - 10 <= 180) {
                    c.setCenterY(c.getCenterY() - 10);
                    statusLabel.setText("Position: (" + c.getCenterX() + ", " + c.getCenterY() + ")");
                } else {
                    statusLabel.setText("Boundary reached");
                }
            }
            if (e.getCode() == KeyCode.DOWN) {
                if (c.getCenterY() + 10 >= 20 && c.getCenterY() + 10 <= 180) {
                    c.setCenterY(c.getCenterY() + 10);
                    statusLabel.setText("Position: (" + c.getCenterX() + ", " + c.getCenterY() + ")");
                } else {
                    statusLabel.setText("Boundary reached");
                }
            }
            if (e.getCode() == KeyCode.RIGHT) {
                if (c.getCenterX() + 10 >= 20 && c.getCenterX() + 10 <= 280) {
                    c.setCenterX(c.getCenterX() + 10);
                    statusLabel.setText("Position: (" + c.getCenterX() + ", " + c.getCenterY() + ")");
                } else {
                    statusLabel.setText("Boundary reached");
                }
            }
        });

        resetBtn.setOnAction(e -> {
            c.setCenterX(150);
            c.setCenterY(120);
            c.setRadius(15);
            c.setFill(Color.BLUE);
            c.setRotate(0);
            statusLabel.setText("Position: (150, 120)");
        });

        stage.setTitle("Keyboard Game");
        stage.setScene(scene);
        stage.show();
        root.requestFocus();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

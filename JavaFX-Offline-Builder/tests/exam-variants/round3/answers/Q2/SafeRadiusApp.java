// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class SafeRadiusApp extends Application {
    @Override
    public void start(Stage stage) {
        Pane pane = new Pane();
        pane.setPrefSize(400, 260);
        pane.setStyle("-fx-background-color: white; -fx-border-color: lightgray;");
        Circle c = new Circle(100, 100, 30, Color.BLUE);
        Label statusLabel = new Label("Radius: 30");
        Button resetBtn = new Button("Reset");
        TextField radiusInput = new TextField("30");
        Button applyBtn = new Button("Apply");
        pane.getChildren().add(c);

        BorderPane root = new BorderPane();
        root.setCenter(pane);
        HBox bottomBox = new HBox(8, statusLabel, resetBtn, radiusInput, applyBtn);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        applyBtn.setOnAction(e -> {
            try {
                double value = Double.parseDouble(radiusInput.getText().trim());
                if (!Double.isFinite(value) || value < 5.0 || value > 80.0) throw new NumberFormatException();
                c.setRadius(value);
                statusLabel.setText("Radius: " + (value));
            } catch (NumberFormatException ex) {
                statusLabel.setText("Invalid radius");
            }
        });

        resetBtn.setOnAction(e -> {
            c.setCenterX(100);
            c.setCenterY(100);
            c.setRadius(30);
            c.setFill(Color.BLUE);
            c.setRotate(0);
            statusLabel.setText("Radius: 30");
            radiusInput.setText("30");
        });

        stage.setTitle("Safe Radius Controller");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

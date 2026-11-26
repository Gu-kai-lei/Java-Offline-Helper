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

public class RgbApp extends Application {
    @Override
    public void start(Stage stage) {
        Pane pane = new Pane();
        pane.setPrefSize(400, 260);
        pane.setStyle("-fx-background-color: white; -fx-border-color: lightgray;");
        Circle c = new Circle(100, 100, 40, Color.BLUE);
        TextField redInput = new TextField("0");
        TextField greenInput = new TextField("0");
        TextField blueInput = new TextField("255");
        Button applyBtn = new Button("Apply");
        Button resetBtn = new Button("Reset");
        Label statusLabel = new Label("Ready");
        pane.getChildren().add(c);

        BorderPane root = new BorderPane();
        root.setCenter(pane);
        HBox topBox = new HBox(8, redInput, greenInput, blueInput);
        topBox.setPadding(new Insets(10));
        root.setTop(topBox);
        HBox bottomBox = new HBox(8, applyBtn, resetBtn, statusLabel);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        applyBtn.setOnAction(e -> {
            try {
                int r = Integer.parseInt(redInput.getText().trim());
                if (r < 0 || r > 255) throw new NumberFormatException();
                try {
                    int g = Integer.parseInt(greenInput.getText().trim());
                    if (g < 0 || g > 255) throw new NumberFormatException();
                    try {
                        int b = Integer.parseInt(blueInput.getText().trim());
                        if (b < 0 || b > 255) throw new NumberFormatException();
                        c.setFill(Color.rgb(r, g, b));
                        statusLabel.setText("RGB: (" + r + ", " + g + ", " + b + ")");
                    } catch (NumberFormatException ex) {
                        statusLabel.setText("Invalid RGB values");
                    }
                } catch (NumberFormatException ex) {
                    statusLabel.setText("Invalid RGB values");
                }
            } catch (NumberFormatException ex) {
                statusLabel.setText("Invalid RGB values");
            }
        });

        resetBtn.setOnAction(e -> {
            c.setCenterX(100);
            c.setCenterY(100);
            c.setRadius(40);
            c.setFill(Color.BLUE);
            c.setRotate(0);
            redInput.setText("0");
            greenInput.setText("0");
            blueInput.setText("255");
            statusLabel.setText("Ready");
        });

        stage.setTitle("RGB Colour Controller");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

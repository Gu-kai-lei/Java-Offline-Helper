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
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class MouseCounterApp extends Application {
    private int clicks = 0;

    @Override
    public void start(Stage stage) {
        Pane pane = new Pane();
        pane.setPrefSize(400, 260);
        pane.setStyle("-fx-background-color: white; -fx-border-color: lightgray;");
        Circle c = new Circle(150, 100, 40, Color.BLUE);
        Label statusLabel = new Label("Ready");
        Label countLabel = new Label("Clicks: 0");
        Button resetBtn = new Button("Reset");
        pane.getChildren().add(c);

        BorderPane root = new BorderPane();
        root.setCenter(pane);
        HBox topBox = new HBox(8, statusLabel, countLabel);
        topBox.setPadding(new Insets(10));
        root.setTop(topBox);
        HBox bottomBox = new HBox(8, resetBtn);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        c.setOnMouseEntered(e -> {
            c.setFill(Color.GREEN);
            statusLabel.setText("Mouse inside");
        });

        c.setOnMouseExited(e -> {
            c.setFill(Color.BLUE);
            statusLabel.setText("Mouse outside");
        });

        c.setOnMouseClicked(e -> {
            clicks += 1;
            countLabel.setText("Clicks: " + clicks);
        });

        resetBtn.setOnAction(e -> {
            clicks = 0;
            c.setCenterX(150);
            c.setCenterY(100);
            c.setRadius(40);
            c.setFill(Color.BLUE);
            c.setRotate(0);
            statusLabel.setText("Ready");
            countLabel.setText("Clicks: 0");
        });

        stage.setTitle("Mouse Counter");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

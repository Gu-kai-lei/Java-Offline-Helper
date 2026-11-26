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
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class IncreaseApp extends Application {
    @Override
    public void start(Stage stage) {
        Pane pane = new Pane();
        pane.setPrefSize(400, 260);
        pane.setStyle("-fx-background-color: white; -fx-border-color: lightgray;");
        Circle c = new Circle(100, 100, 30, Color.BLUE);
        Button increaseBtn = new Button("Increase");
        Button resetBtn = new Button("Reset");
        Label radiusLabel = new Label("Radius: 30");
        pane.getChildren().add(c);

        BorderPane root = new BorderPane();
        root.setCenter(pane);
        HBox bottomBox = new HBox(8, increaseBtn, resetBtn, radiusLabel);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        increaseBtn.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent e) {
                if (c.getRadius() + 10 >= 10 && c.getRadius() + 10 <= 80) {
                    c.setRadius(c.getRadius() + 10);
                    radiusLabel.setText("Radius: " + c.getRadius());
                } else {
                    radiusLabel.setText("Maximum radius reached");
                }
            }
        });

        resetBtn.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent e) {
                c.setCenterX(100);
                c.setCenterY(100);
                c.setRadius(30);
                c.setFill(Color.BLUE);
                c.setRotate(0);
                radiusLabel.setText("Radius: 30");
            }
        });

        stage.setTitle("Increase Radius");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

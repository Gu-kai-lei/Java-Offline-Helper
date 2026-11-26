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

public class CircleCalculatorApp extends Application {
    @Override
    public void start(Stage stage) {
        Pane pane = new Pane();
        pane.setPrefSize(400, 260);
        pane.setStyle("-fx-background-color: white; -fx-border-color: lightgray;");
        Circle c = new Circle(150, 120, 30, Color.BLUE);
        Label radiusLabel = new Label("Radius: 30");
        Label opLabel = new Label("Last operation: none");
        Button plusBtn = new Button("+5");
        Button minusBtn = new Button("-5");
        Button doubleBtn = new Button("Double");
        Button resetBtn = new Button("Reset");
        pane.getChildren().add(c);

        BorderPane root = new BorderPane();
        root.setCenter(pane);
        HBox topBox = new HBox(8, radiusLabel, opLabel);
        topBox.setPadding(new Insets(10));
        root.setTop(topBox);
        HBox bottomBox = new HBox(8, plusBtn, minusBtn, doubleBtn, resetBtn);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        EventHandler<ActionEvent> sharedHandler1 = e -> {
            if (e.getSource() == plusBtn) {
                if (c.getRadius() + 5 >= 5 && c.getRadius() + 5 <= 100) {
                    c.setRadius(c.getRadius() + 5);
                    radiusLabel.setText("Radius: " + c.getRadius());
                    opLabel.setText("Last operation: +5");
                } else {
                    opLabel.setText("Invalid radius");
                }
            } else {
                if (e.getSource() == minusBtn) {
                    if (c.getRadius() - 5 >= 5 && c.getRadius() - 5 <= 100) {
                        c.setRadius(c.getRadius() - 5);
                        radiusLabel.setText("Radius: " + c.getRadius());
                        opLabel.setText("Last operation: -5");
                    } else {
                        opLabel.setText("Invalid radius");
                    }
                } else {
                    if (c.getRadius() * 2 >= 5 && c.getRadius() * 2 <= 100) {
                        c.setRadius(c.getRadius() * 2);
                        radiusLabel.setText("Radius: " + c.getRadius());
                        opLabel.setText("Last operation: Double");
                    } else {
                        opLabel.setText("Invalid radius");
                    }
                }
            }
        };
        plusBtn.setOnAction(sharedHandler1);
        minusBtn.setOnAction(sharedHandler1);
        doubleBtn.setOnAction(sharedHandler1);

        resetBtn.setOnAction(e -> {
            c.setCenterX(150);
            c.setCenterY(120);
            c.setRadius(30);
            c.setFill(Color.BLUE);
            c.setRotate(0);
            radiusLabel.setText("Radius: 30");
            opLabel.setText("Last operation: none");
        });

        stage.setTitle("Circle Calculator");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

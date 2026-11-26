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

public class GrowApp extends Application {
    /** Event handler class: gets the objects it changes through the constructor. */
    private class GrowHandler implements EventHandler<ActionEvent> {
        private Circle c;
        private Label label;

        public GrowHandler(Circle c, Label label) {
            this.c = c;
            this.label = label;
        }

        @Override
        public void handle(ActionEvent e) {
            if (c.getRadius() + 5 >= 5 && c.getRadius() + 5 <= 60) {
                c.setRadius(c.getRadius() + 5);
                label.setText("Radius: " + c.getRadius());
            } else {
                label.setText("Maximum radius reached");
            }
        }
    }

    @Override
    public void start(Stage stage) {
        Pane pane = new Pane();
        pane.setPrefSize(400, 260);
        pane.setStyle("-fx-background-color: white; -fx-border-color: lightgray;");
        Circle c = new Circle(100, 100, 30, Color.BLUE);
        Label label = new Label("Radius: 30");
        Button growBtn = new Button("Grow");
        pane.getChildren().add(c);

        BorderPane root = new BorderPane();
        root.setCenter(pane);
        HBox topBox = new HBox(8, label);
        topBox.setPadding(new Insets(10));
        root.setTop(topBox);
        HBox bottomBox = new HBox(8, growBtn);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        growBtn.setOnAction(new GrowHandler(c, label));

        stage.setTitle("Grow Handler");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

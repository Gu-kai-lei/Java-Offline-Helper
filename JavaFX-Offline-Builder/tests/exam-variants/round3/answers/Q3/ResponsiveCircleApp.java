// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class ResponsiveCircleApp extends Application {
    @Override
    public void start(Stage stage) {
        Pane canvas = new Pane();
        canvas.setPrefSize(400, 300);
        canvas.setStyle("-fx-background-color: white; -fx-border-color: lightgray;");
        Circle c = new Circle(100, 100, 30, Color.BLUE);
        Button growBtn = new Button("Grow");
        Button shrinkBtn = new Button("Shrink");
        Button resetBtn = new Button("Reset");
        canvas.getChildren().add(c);
        c.centerXProperty().bind(canvas.widthProperty().divide(2));
        c.centerYProperty().bind(canvas.heightProperty().divide(2));

        BorderPane root = new BorderPane();
        root.setCenter(canvas);
        HBox bottomBox = new HBox(8, growBtn, shrinkBtn, resetBtn);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        growBtn.setOnAction(e -> {
            if (c.getRadius() + 10 >= 10 && c.getRadius() + 10 <= 1000) {
                c.setRadius(c.getRadius() + 10);
            }
        });

        shrinkBtn.setOnAction(e -> {
            if (c.getRadius() - 10 >= 10 && c.getRadius() - 10 <= 1000) {
                c.setRadius(c.getRadius() - 10);
            }
        });

        resetBtn.setOnAction(e -> {
            c.setRadius(30);
            c.setFill(Color.BLUE);
            c.setRotate(0);
        });

        stage.setTitle("Responsive Circle");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

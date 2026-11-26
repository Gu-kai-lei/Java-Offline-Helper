// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
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
import javafx.util.Duration;

public class CircleMoverApp extends Application {
    @Override
    public void start(Stage stage) {
        Pane pane = new Pane();
        pane.setPrefSize(400, 260);
        pane.setStyle("-fx-background-color: white; -fx-border-color: lightgray;");
        Circle c = new Circle(50, 100, 20, Color.BLUE);
        Timeline timeline = new Timeline();   // its KeyFrame is added with the event handlers below
        timeline.setCycleCount(Timeline.INDEFINITE);
        Button startBtn = new Button("Start");
        Button stopBtn = new Button("Stop");
        Button resetBtn = new Button("Reset");
        pane.getChildren().add(c);

        BorderPane root = new BorderPane();
        root.setCenter(pane);
        HBox bottomBox = new HBox(8, startBtn, stopBtn, resetBtn);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        timeline.getKeyFrames().add(new KeyFrame(Duration.millis(200), e -> {
            if (c.getCenterX() + 5 >= 0 && c.getCenterX() + 5 <= 280) {
                c.setCenterX(c.getCenterX() + 5);
            } else {
                timeline.stop();
            }
        }));

        startBtn.setOnAction(e -> {
            timeline.play();
        });

        stopBtn.setOnAction(e -> {
            timeline.pause();
        });

        resetBtn.setOnAction(e -> {
            timeline.stop();
            c.setCenterX(50);
            c.setCenterY(100);
            c.setRadius(20);
            c.setFill(Color.BLUE);
            c.setRotate(0);
        });

        stage.setTitle("Circle Mover");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

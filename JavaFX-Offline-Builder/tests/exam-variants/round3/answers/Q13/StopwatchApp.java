// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;
import javafx.util.Duration;

public class StopwatchApp extends Application {
    private int seconds = 0;

    @Override
    public void start(Stage stage) {
        Label timeLabel = new Label("Time: 0");
        Timeline timeline = new Timeline();   // its KeyFrame is added with the event handlers below
        timeline.setCycleCount(Timeline.INDEFINITE);
        Button startBtn = new Button("Start");
        Button pauseBtn = new Button("Pause");
        Button resetBtn = new Button("Reset");

        BorderPane root = new BorderPane();
        HBox topBox = new HBox(8, timeLabel);
        topBox.setPadding(new Insets(10));
        root.setTop(topBox);
        HBox bottomBox = new HBox(8, startBtn, pauseBtn, resetBtn);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        timeline.getKeyFrames().add(new KeyFrame(Duration.millis(1000), e -> {
            seconds += 1;
            timeLabel.setText("Time: " + seconds);
        }));

        startBtn.setOnAction(e -> {
            timeline.play();
        });

        pauseBtn.setOnAction(e -> {
            timeline.pause();
        });

        resetBtn.setOnAction(e -> {
            timeline.stop();
            seconds = 0;
            timeLabel.setText("Time: 0");
        });

        stage.setTitle("Stopwatch");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

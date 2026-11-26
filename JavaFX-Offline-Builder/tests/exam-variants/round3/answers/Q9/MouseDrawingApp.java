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

public class MouseDrawingApp extends Application {
    @Override
    public void start(Stage stage) {
        Pane canvas = new Pane();
        canvas.setPrefSize(320, 220);
        canvas.setStyle("-fx-background-color: white; -fx-border-color: lightgray;");
        Circle c = new Circle(100, 100, 15, Color.BLUE);
        Label statusLabel = new Label("Ready");
        Button resetBtn = new Button("Reset");
        canvas.getChildren().add(c);

        BorderPane root = new BorderPane();
        root.setCenter(canvas);
        HBox topBox = new HBox(8, statusLabel);
        topBox.setPadding(new Insets(10));
        root.setTop(topBox);
        HBox bottomBox = new HBox(8, resetBtn);
        bottomBox.setPadding(new Insets(10));
        root.setBottom(bottomBox);
        Scene scene = new Scene(root);

        // Event handlers
        canvas.setOnMousePressed(e -> {
            c.setFill(Color.YELLOW);
            statusLabel.setText("Dragging");
        });

        canvas.setOnMouseDragged(e -> {
            double mouseX = e.getX();
            double mouseY = e.getY();
            if (mouseX >= 15 && mouseX <= 305 && mouseY >= 15 && mouseY <= 205) {
                c.setCenterX(mouseX);
                c.setCenterY(mouseY);
            } else {
                statusLabel.setText("Outside canvas");
            }
        });

        canvas.setOnMouseReleased(e -> {
            c.setFill(Color.GREEN);
            statusLabel.setText("Position: (" + c.getCenterX() + ", " + c.getCenterY() + ")");
        });

        resetBtn.setOnAction(e -> {
            c.setCenterX(100);
            c.setCenterY(100);
            c.setRadius(15);
            c.setFill(Color.BLUE);
            c.setRotate(0);
            statusLabel.setText("Ready");
        });

        stage.setTitle("Mouse Drawing");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

// Name: Test Student
// Student ID: DEMO-ID
// Tools: BlueJ + JavaFX Offline Builder

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class ImageViewerApp extends Application {
    @Override
    public void start(Stage stage) {
        // images/logo.png in the project folder; if it cannot be read, getImage().isError() is true
        ImageView logo = new ImageView(new Image("file:images/logo.png"));
        logo.setFitWidth(200);
        logo.setPreserveRatio(true);
        Label caption = new Label("Logo");
        Button rotateBtn = new Button("Rotate");
        Button styleBtn = new Button("Style");

        BorderPane root = new BorderPane();
        VBox leftBox = new VBox(8, logo, caption, rotateBtn, styleBtn);
        leftBox.setPadding(new Insets(10));
        root.setLeft(leftBox);
        Scene scene = new Scene(root);

        // Event handlers
        rotateBtn.setOnAction(e -> {
            logo.setRotate(logo.getRotate() + 90);
        });

        styleBtn.setOnAction(e -> {
            caption.setStyle("-fx-text-fill: red; -fx-font-size: 20px;");
        });

        stage.setOnShown(e -> {
            if (logo.getImage().isError()) {
                caption.setText("Image unavailable");
            }
        });

        stage.setTitle("Image Viewer");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

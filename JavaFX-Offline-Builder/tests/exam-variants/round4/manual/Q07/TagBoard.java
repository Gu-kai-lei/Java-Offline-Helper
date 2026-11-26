import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;

public class TagBoard extends Application {
    @Override
    public void start(Stage stage) {
        FlowPane tags = new FlowPane(8, 8, new Label("Ready"));
        tags.setPadding(new Insets(10));

        TextField input = new TextField();
        Button add = new Button("Add");
        add.setOnAction(event -> {
            String text = input.getText().trim();
            if (!text.isEmpty()) {
                tags.getChildren().add(new Label(text));
            }
        });

        HBox controls = new HBox(8, input, add);
        controls.setPadding(new Insets(10));
        BorderPane root = new BorderPane(tags);
        root.setBottom(controls);

        stage.setTitle("Tag Board");
        stage.setScene(new Scene(root, 360, 210));
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

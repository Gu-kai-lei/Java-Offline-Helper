import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

/** 设置窗口使用第二个 Stage，可修改主窗口的内容。 */
public class TwoWindowApp extends Application {
    private Label welcomeLabel = new Label("Welcome");
    private Stage settingsStage;   // 首次打开设置窗口前为 null

    @Override
    public void start(Stage stage) {
        Button openBtn = new Button("Open Settings");
        Button resetBtn = new Button("Reset");
        openBtn.setOnAction(e -> openSettings(stage));
        resetBtn.setOnAction(e -> welcomeLabel.setText("Welcome"));

        HBox buttons = new HBox(10, openBtn, resetBtn);
        buttons.setAlignment(Pos.CENTER);
        VBox root = new VBox(15, welcomeLabel, buttons);
        root.setAlignment(Pos.CENTER);
        root.setPadding(new Insets(20));

        stage.setTitle("Two Windows");
        stage.setScene(new Scene(root, 360, 180));
        stage.show();
    }

    /** 打开设置窗口。若它已打开，则将现有窗口置于前台。 */
    private void openSettings(Stage owner) {
        if (settingsStage != null && settingsStage.isShowing()) {
            settingsStage.toFront();
            return;
        }
        TextField nicknameField = new TextField();
        nicknameField.setPromptText("Nickname");
        Label errorLabel = new Label("");
        Button saveBtn = new Button("Save");

        Stage settings = new Stage();
        saveBtn.setOnAction(e -> {
            String nickname = nicknameField.getText().trim();
            if (nickname.isEmpty()) {
                errorLabel.setText("Invalid name");   // 保持设置窗口打开
            } else {
                welcomeLabel.setText("Welcome, " + nickname);
                settings.close();
            }
        });

        VBox root = new VBox(10, new Label("Nickname:"), nicknameField, saveBtn, errorLabel);
        root.setPadding(new Insets(15));
        settings.setTitle("Settings");
        settings.initOwner(owner);
        settings.setScene(new Scene(root, 260, 170));
        settingsStage = settings;
        settings.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}

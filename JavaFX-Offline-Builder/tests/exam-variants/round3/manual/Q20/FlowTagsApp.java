import java.util.ArrayList;
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

/** 运行时创建 Label 并加入 FlowPane，由它自动换行。 */
public class FlowTagsApp extends Application {
    private FlowPane tagPane = new FlowPane(8, 8);              // 水平间距和垂直间距
    private ArrayList<Label> addedTags = new ArrayList<>();     // 仅记录用户添加的标签
    private Label statusLabel = new Label("Ready");

    @Override
    public void start(Stage stage) {
        tagPane.setPadding(new Insets(10));
        tagPane.setPrefWrapLength(300);   // 首选换行宽度约为 300 像素，由容器安排坐标
        for (String name : new String[] {"Java", "Python", "C++"}) {
            tagPane.getChildren().add(makeTag(name));
        }

        TextField tagInput = new TextField();
        tagInput.setPromptText("New tag");
        Button addBtn = new Button("Add");
        Button clearBtn = new Button("Clear");

        addBtn.setOnAction(e -> {
            String text = tagInput.getText().trim();
            if (text.isEmpty()) {
                statusLabel.setText("Invalid input");
                return;
            }
            Label tag = makeTag(text);
            addedTags.add(tag);
            tagPane.getChildren().add(tag);
            tagInput.clear();
            statusLabel.setText("Added " + text);
        });
        clearBtn.setOnAction(e -> {
            tagPane.getChildren().removeAll(addedTags);   // 保留最初的三个标签
            addedTags.clear();
            statusLabel.setText("Ready");
        });

        HBox controls = new HBox(8, tagInput, addBtn, clearBtn);
        controls.setPadding(new Insets(10));
        BorderPane root = new BorderPane();
        root.setCenter(tagPane);
        root.setBottom(controls);
        root.setTop(statusLabel);
        BorderPane.setMargin(statusLabel, new Insets(10, 10, 0, 10));

        stage.setTitle("Tags");
        stage.setScene(new Scene(root, 340, 240));
        stage.show();
    }

    /** 创建带内边距和背景色的标签。 */
    private Label makeTag(String text) {
        Label tag = new Label(text);
        tag.setPadding(new Insets(4, 10, 4, 10));
        tag.setStyle("-fx-background-color: lightblue; -fx-background-radius: 4;");
        return tag;
    }

    public static void main(String[] args) {
        launch(args);
    }
}

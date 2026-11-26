/*
 * Lecture example library: the programs from the Lecture 7 (JavaFX Basics) and Lecture 8
 * (Event-Driven Programming) slides, completed with imports and main so that each compiles on
 * its own, plus a few extra drills for points the slides only describe in words.
 */
"use strict";

const EXAMPLES = [
  // ---------------- Lecture 7 ----------------
  { id: "MyJavaFX", lecture: "L7", title: "第一个 JavaFX 程序：Button 放进 Scene",
    keywords: "Application start Stage Scene Button launch main primaryStage setTitle setScene show",
    note: "Stage 是窗口，Scene(node, width, height)，start() 被 JavaFX 自动调用；main 只在 IDE 需要时调用 launch(args)。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.stage.Stage;

public class MyJavaFX extends Application {
    @Override // Override the start method in the Application class
    public void start(Stage primaryStage) {
        // Create a button and place it in the scene
        Button btOK = new Button("OK");
        Scene scene = new Scene(btOK, 200, 250);
        primaryStage.setTitle("MyJavaFX"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "MultipleStageDemo", lecture: "L7", title: "两个窗口：再建一个 Stage",
    keywords: "Stage second window new Stage multiple stages",
    note: "每个窗口是一个 Stage，各自有自己的 Scene。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.stage.Stage;

public class MultipleStageDemo extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a scene and place a button in the scene
        Scene scene = new Scene(new Button("OK"), 200, 250);
        primaryStage.setTitle("MyJavaFX"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage

        Stage stage = new Stage(); // Create a new stage
        stage.setTitle("Second Stage"); // Set the stage title
        // Set a scene with a button in the stage
        stage.setScene(new Scene(new Button("New Stage"), 200, 250));
        stage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "ButtonInPane", lecture: "L7", title: "StackPane 中放按钮：getChildren().add()",
    keywords: "StackPane Pane getChildren add centre center",
    note: "StackPane 把子节点居中并叠放；子节点通过 pane.getChildren().add() 加入。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

public class ButtonInPane extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a scene and place a button in the scene
        StackPane pane = new StackPane();
        pane.getChildren().add(new Button("OK"));
        Scene scene = new Scene(pane, 200, 50);
        primaryStage.setTitle("Button in a pane"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "ShowCircle", lecture: "L7", title: "坐标系：在 Pane 中画圆",
    keywords: "Circle setCenterX setCenterY setRadius setStroke setFill coordinate pixel Pane",
    note: "左上角是 (0, 0)，x 向右增大，y 向下增大，单位是像素。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class ShowCircle extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a circle and set its properties
        Circle circle = new Circle();
        circle.setCenterX(100);
        circle.setCenterY(100);
        circle.setRadius(50);
        circle.setStroke(Color.BLACK);
        circle.setFill(Color.WHITE);

        // Create a pane to hold the circle
        Pane pane = new Pane();
        pane.getChildren().add(circle);

        // Create a scene and place it in the stage
        Scene scene = new Scene(pane, 200, 200);
        primaryStage.setTitle("ShowCircle"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "ShowCircleCentered", lecture: "L7", title: "属性绑定：圆心永远在窗口中央",
    keywords: "bind centerXProperty widthProperty divide binding property centered resize",
    note: "target.bind(source)：目标属性跟随源属性变化。改变窗口大小时圆一直居中。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class ShowCircleCentered extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a pane to hold the circle
        Pane pane = new Pane();

        // Create a circle and set its properties
        Circle circle = new Circle();
        circle.centerXProperty().bind(pane.widthProperty().divide(2));
        circle.centerYProperty().bind(pane.heightProperty().divide(2));
        circle.setRadius(50);
        circle.setStroke(Color.BLACK);
        circle.setFill(Color.WHITE);
        pane.getChildren().add(circle); // Add circle to the pane

        // Create a scene and place it in the stage
        Scene scene = new Scene(pane, 200, 200);
        primaryStage.setTitle("ShowCircleCentered"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "NodeStyleRotateDemo", lecture: "L7", title: "setStyle 与 setRotate（CSS 和旋转）",
    keywords: "setStyle -fx-border-color -fx-background-color setRotate rotate CSS style",
    note: "样式写法 \"-fx-属性: 值;\"，多个用分号；setRotate 正数顺时针（注意与 Arc 角度相反）。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

public class NodeStyleRotateDemo extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a scene and place a button in the scene
        StackPane pane = new StackPane();
        Button btOK = new Button("OK");
        btOK.setStyle("-fx-border-color: blue;");
        pane.getChildren().add(btOK);

        pane.setRotate(45);
        pane.setStyle("-fx-border-color: red; -fx-background-color: lightgray;");

        Scene scene = new Scene(pane, 200, 250);
        primaryStage.setTitle("NodeStyleRotateDemo"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "FontDemo", lecture: "L7", title: "Color 与 Font：圆上的粗斜体 Label",
    keywords: "Font font FontWeight BOLD FontPosture ITALIC Color opacity Label StackPane new Color",
    note: "new Color(r, g, b, opacity) 取值 0.0–1.0；Font.font(名称, 粗细, 姿态, 字号)。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.Pane;
import javafx.scene.layout.StackPane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.text.Font;
import javafx.scene.text.FontPosture;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;

public class FontDemo extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a pane to hold the circle
        Pane pane = new StackPane();

        // Create a circle and set its properties
        Circle circle = new Circle();
        circle.setRadius(50);
        circle.setStroke(Color.BLACK);
        circle.setFill(new Color(0.5, 0.5, 0.5, 0.1));
        pane.getChildren().add(circle); // Add circle to the pane

        // Create a label and set its properties
        Label label = new Label("JavaFX");
        label.setFont(Font.font("Times New Roman", FontWeight.BOLD, FontPosture.ITALIC, 20));
        pane.getChildren().add(label);

        // Create a scene and place it in the stage
        Scene scene = new Scene(pane);
        primaryStage.setTitle("FontDemo"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "FontListApp", lecture: "L7", title: "列出系统字体：ListView + VBox",
    keywords: "Font getFontNames ListView ObservableList FXCollections VBox",
    note: "Font.getFontNames() 返回系统字体名；ListView 显示列表。",
    code: String.raw`import javafx.application.Application;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.scene.Scene;
import javafx.scene.control.ListView;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.stage.Stage;

public class FontListApp extends Application {
    @Override
    public void start(Stage primaryStage) {
        ObservableList<String> fontNames = FXCollections.observableArrayList(Font.getFontNames());
        ListView<String> fontListView = new ListView<>(fontNames);
        VBox vbox = new VBox(fontListView);
        Scene scene = new Scene(vbox, 400, 300);
        primaryStage.setTitle("Available Fonts");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "ShowImage", lecture: "L7", title: "Image 与 ImageView（HBox 三张图）",
    keywords: "Image ImageView setFitHeight setFitWidth HBox setPadding Insets image gif share",
    note: "一个 Image 可给多个 ImageView 共用，但一个 ImageView 只能出现一次。图片放在项目文件夹的 image/us.gif，否则运行时报找不到资源。",
    code: String.raw`import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.stage.Stage;

public class ShowImage extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a pane to hold the image views
        Pane pane = new HBox(10);
        pane.setPadding(new Insets(5, 5, 5, 5));
        Image image = new Image("image/us.gif");
        pane.getChildren().add(new ImageView(image));

        ImageView imageView2 = new ImageView(image);
        imageView2.setFitHeight(100);
        imageView2.setFitWidth(100);
        pane.getChildren().add(imageView2);

        ImageView imageView3 = new ImageView(image);
        imageView3.setRotate(90);
        pane.getChildren().add(imageView3);

        // Create a scene and place it in the stage
        Scene scene = new Scene(pane);
        primaryStage.setTitle("ShowImage"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "ShowFlowPane", lecture: "L7", title: "FlowPane：自动换行排列 + setPrefColumnCount",
    keywords: "FlowPane setHgap setVgap setPadding Insets TextField Label setPrefColumnCount addAll",
    note: "Insets(上, 右, 下, 左)；hgap/vgap 是水平/垂直间距；窗口变窄时自动换行。",
    code: String.raw`import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.FlowPane;
import javafx.stage.Stage;

public class ShowFlowPane extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a pane and set its properties
        FlowPane pane = new FlowPane();
        pane.setPadding(new Insets(11, 12, 13, 14)); // top, right, bottom, left
        pane.setHgap(5);
        pane.setVgap(5);

        // Place nodes in the pane
        pane.getChildren().addAll(new Label("First Name:"), new TextField(), new Label("MI:"));
        TextField tfMi = new TextField();
        tfMi.setPrefColumnCount(1);
        pane.getChildren().addAll(tfMi, new Label("Last Name:"), new TextField());

        // Create a scene and place it in the stage
        Scene scene = new Scene(pane, 200, 250);
        primaryStage.setTitle("ShowFlowPane"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "ShowBorderPane", lecture: "L7", title: "BorderPane 五个区域 + 自定义 CustomPane",
    keywords: "BorderPane setTop setBottom setLeft setRight setCenter CustomPane extends StackPane setPadding",
    note: "setTop(null) 可移除顶部节点；没有节点的区域不占空间。CustomPane extends StackPane 是 OOP 用法。",
    code: String.raw`import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

public class ShowBorderPane extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a border pane
        BorderPane pane = new BorderPane();

        // Place nodes in the pane
        pane.setTop(new CustomPane("Top"));
        pane.setRight(new CustomPane("Right"));
        pane.setBottom(new CustomPane("Bottom"));
        pane.setLeft(new CustomPane("Left"));
        pane.setCenter(new CustomPane("Center"));

        // Create a scene and place it in the stage
        Scene scene = new Scene(pane);
        primaryStage.setTitle("ShowBorderPane"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}

// Define a custom pane to hold a label in the center of the pane
class CustomPane extends StackPane {
    public CustomPane(String title) {
        getChildren().add(new Label(title));
        setStyle("-fx-border-color: red");
        setPadding(new Insets(11.5, 12.5, 13.5, 14.5));
    }
}` },
  { id: "ShowHBoxVBox", lecture: "L7", title: "HBox 与 VBox + VBox.setMargin",
    keywords: "HBox VBox spacing setMargin BorderPane setTop setLeft gold Label array for",
    note: "HBox 单行横排，VBox 单列竖排；VBox.setMargin(子节点, Insets) 是静态方法。",
    code: String.raw`import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class ShowHBoxVBox extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a border pane
        BorderPane pane = new BorderPane();

        // Place nodes in the pane
        pane.setTop(getHBox());
        pane.setLeft(getVBox());

        // Create a scene and place it in the stage
        Scene scene = new Scene(pane);
        primaryStage.setTitle("ShowHBoxVBox"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    private HBox getHBox() {
        HBox hBox = new HBox(15);
        hBox.setPadding(new Insets(15, 15, 15, 15));
        hBox.setStyle("-fx-background-color: gold");
        hBox.getChildren().add(new Button("Computer Science"));
        hBox.getChildren().add(new Button("Chemistry"));
        // The slide also adds an ImageView of image/us.gif here.
        return hBox;
    }

    private VBox getVBox() {
        VBox vBox = new VBox(15);
        vBox.setPadding(new Insets(15, 5, 5, 5));
        vBox.getChildren().add(new Label("Courses"));

        Label[] courses = {new Label("CSCI 1301"), new Label("CSCI 1302"),
            new Label("CSCI 2410"), new Label("CSCI 3720")};

        for (Label course : courses) {
            VBox.setMargin(course, new Insets(0, 0, 0, 15));
            vBox.getChildren().add(course);
        }
        return vBox;
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "ShowText", lecture: "L7", title: "Text：字体、颜色、下划线、删除线、换行",
    keywords: "Text Font FontWeight FontPosture setFill setUnderline setStrikethrough newline",
    note: "new Text(x, y, 字符串) 从 (x, y) 开始画；字符串中的反斜杠 n 表示换行。",
    code: String.raw`import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontPosture;
import javafx.scene.text.FontWeight;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class ShowText extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a pane to hold the texts
        Pane pane = new Pane();
        pane.setPadding(new Insets(5, 5, 5, 5));
        Text text1 = new Text(20, 20, "Programming is fun");
        text1.setFont(Font.font("Courier", FontWeight.BOLD, FontPosture.ITALIC, 15));
        pane.getChildren().add(text1);

        Text text2 = new Text(60, 60, "Programming is fun\nDisplay text");
        pane.getChildren().add(text2);

        Text text3 = new Text(10, 100, "Programming is fun\nDisplay text");
        text3.setFill(Color.RED);
        text3.setUnderline(true);
        text3.setStrikethrough(true);
        pane.getChildren().add(text3);

        // Create a scene and place it in the stage
        Scene scene = new Scene(pane);
        primaryStage.setTitle("ShowText"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "ShowLine", lecture: "L7", title: "Line + 绑定：两条对角线跟随窗口",
    keywords: "Line endXProperty bind widthProperty subtract setStrokeWidth LinePane extends Pane",
    note: "LinePane extends Pane，在构造器里画线；终点绑定到宽高减 10。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Line;
import javafx.stage.Stage;

public class ShowLine extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a scene and place it in the stage
        Scene scene = new Scene(new LinePane(), 200, 200);
        primaryStage.setTitle("ShowLine"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}

class LinePane extends Pane {
    public LinePane() {
        Line line1 = new Line(10, 10, 10, 10);
        line1.endXProperty().bind(widthProperty().subtract(10));
        line1.endYProperty().bind(heightProperty().subtract(10));
        line1.setStrokeWidth(5);
        line1.setStroke(Color.GREEN);
        getChildren().add(line1);

        Line line2 = new Line(10, 10, 10, 10);
        line2.startXProperty().bind(widthProperty().subtract(10));
        line2.endYProperty().bind(heightProperty().subtract(10));
        line2.setStrokeWidth(5);
        line2.setStroke(Color.GREEN);
        getChildren().add(line2);
    }
}` },
  { id: "ShowRectangle", lecture: "L7", title: "Rectangle、圆角、Group 与随机颜色旋转",
    keywords: "Rectangle setArcWidth setArcHeight Group setRotate Color.color Math.random for loop BorderPane",
    note: "圆角由 arcWidth/arcHeight 决定；Group 把一组节点作为整体加入 BorderPane 中央。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Group;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class ShowRectangle extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create rectangles
        Rectangle r1 = new Rectangle(25, 10, 60, 30);
        r1.setStroke(Color.BLACK);
        r1.setFill(Color.WHITE);
        Rectangle r2 = new Rectangle(25, 50, 60, 30);
        Rectangle r3 = new Rectangle(25, 90, 60, 30);
        r3.setArcWidth(15);
        r3.setArcHeight(25);

        // Create a group and add nodes to the group
        Group group = new Group();
        group.getChildren().addAll(new Text(10, 27, "r1"), r1,
            new Text(10, 67, "r2"), r2, new Text(10, 107, "r3"), r3);

        for (int i = 0; i < 4; i++) {
            Rectangle r = new Rectangle(100, 50, 100, 30);
            r.setRotate(i * 360 / 8);
            r.setStroke(Color.color(Math.random(), Math.random(), Math.random()));
            r.setFill(Color.WHITE);
            group.getChildren().add(r);
        }

        // Create a scene and place it in the stage
        Scene scene = new Scene(new BorderPane(group), 250, 150);
        primaryStage.setTitle("ShowRectangle"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "ShowEllipse", lecture: "L7", title: "Ellipse + 重写 setWidth/setHeight 重绘",
    keywords: "Ellipse MyEllipse extends Pane override setWidth setHeight paint getChildren clear random",
    note: "窗口改变大小时 JavaFX 调用根节点的 setWidth/setHeight；重写它们以便重绘（OOP 重写）。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Ellipse;
import javafx.stage.Stage;

public class ShowEllipse extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a scene and place it in the stage
        Scene scene = new Scene(new MyEllipse(), 300, 200);
        primaryStage.setTitle("ShowEllipse"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}

class MyEllipse extends Pane {
    private void paint() {
        getChildren().clear();
        for (int i = 0; i < 16; i++) {
            // Create an ellipse and add it to pane
            Ellipse e1 = new Ellipse(getWidth() / 2, getHeight() / 2,
                getWidth() / 2 - 50, getHeight() / 2 - 50);
            e1.setStroke(Color.color(Math.random(), Math.random(), Math.random()));
            e1.setFill(Color.WHITE);
            e1.setRotate(i * 180 / 16);
            getChildren().add(e1);
        }
    }

    @Override
    public void setWidth(double width) {
        super.setWidth(width);
        paint();
    }

    @Override
    public void setHeight(double height) {
        super.setHeight(height);
        paint();
    }
}` },
  { id: "ShowArc", lecture: "L7", title: "Arc：OPEN / CHORD / ROUND 三种类型",
    keywords: "Arc ArcType OPEN CHORD ROUND startAngle length Group Text",
    note: "new Arc(cx, cy, rx, ry, startAngle, length)：0° 指向东，正数逆时针。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Group;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Arc;
import javafx.scene.shape.ArcType;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class ShowArc extends Application {
    @Override
    public void start(Stage primaryStage) {
        Arc arc1 = new Arc(150, 100, 80, 80, 30, 35); // Create an arc
        arc1.setFill(Color.RED); // Set fill color
        arc1.setType(ArcType.ROUND); // Set arc type

        Arc arc2 = new Arc(150, 100, 80, 80, 30 + 90, 35);
        arc2.setFill(Color.WHITE);
        arc2.setType(ArcType.OPEN);
        arc2.setStroke(Color.BLACK);

        Arc arc3 = new Arc(150, 100, 80, 80, 30 + 180, 35);
        arc3.setFill(Color.WHITE);
        arc3.setType(ArcType.CHORD);
        arc3.setStroke(Color.BLACK);

        Arc arc4 = new Arc(150, 100, 80, 80, 30 + 270, 35);
        arc4.setFill(Color.GREEN);
        arc4.setType(ArcType.CHORD);
        arc4.setStroke(Color.BLACK);

        // Create a group and add nodes to the group
        Group group = new Group();
        group.getChildren().addAll(new Text(210, 40, "arc1: round"), arc1,
            new Text(20, 40, "arc2: open"), arc2,
            new Text(20, 170, "arc3: chord"), arc3,
            new Text(210, 170, "arc4: chord"), arc4);

        // Create a scene and place it in the stage
        Scene scene = new Scene(new BorderPane(group), 300, 200);
        primaryStage.setTitle("ShowArc"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "ShowPolygon", lecture: "L7", title: "Polygon：随窗口缩放的六边形",
    keywords: "Polygon getPoints ObservableList Math.cos Math.sin hexagon MyPolygon override setWidth",
    note: "polygon.getPoints() 是 ObservableList<Double>，依次加入 x、y。Polygon 自动闭合。",
    code: String.raw`import javafx.application.Application;
import javafx.collections.ObservableList;
import javafx.scene.Scene;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Polygon;
import javafx.stage.Stage;

public class ShowPolygon extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Create a scene and place it in the stage
        Scene scene = new Scene(new MyPolygon(), 400, 400);
        primaryStage.setTitle("ShowPolygon"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}

class MyPolygon extends Pane {
    private void paint() {
        // Create a polygon and place polygon to pane
        Polygon polygon = new Polygon();
        polygon.setFill(Color.WHITE);
        polygon.setStroke(Color.BLACK);
        ObservableList<Double> list = polygon.getPoints();

        double centerX = getWidth() / 2, centerY = getHeight() / 2;
        double radius = Math.min(getWidth(), getHeight()) * 0.4;

        // Add points to the polygon list
        for (int i = 0; i < 6; i++) {
            list.add(centerX + radius * Math.cos(2 * i * Math.PI / 6));
            list.add(centerY - radius * Math.sin(2 * i * Math.PI / 6));
        }
        getChildren().clear();
        getChildren().add(polygon);
    }

    @Override
    public void setWidth(double width) {
        super.setWidth(width);
        paint();
    }

    @Override
    public void setHeight(double height) {
        super.setHeight(height);
        paint();
    }
}` },
  { id: "SineFunctionPlotter", lecture: "L7", title: "Polyline：画正弦曲线",
    keywords: "Polyline getPoints sine Math.sin scale plot curve",
    note: "Polyline 不闭合。y 向下增大，所以用 100 - 50 * sin(...) 让曲线向上。",
    code: String.raw`import javafx.application.Application;
import javafx.collections.ObservableList;
import javafx.scene.Scene;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Polyline;
import javafx.stage.Stage;

public class SineFunctionPlotter extends Application {
    @Override
    public void start(Stage primaryStage) {
        Pane pane = new Pane();

        // Create and plot sine function
        Polyline sinFunction = new Polyline();
        sinFunction.setStroke(Color.RED);
        ObservableList<Double> list = sinFunction.getPoints();
        double scaleFactor = 50;
        for (int x = -170; x <= 170; x++) {
            list.add(x + 200.0); // x position
            // Vertical position centred at y = 100 and scaled by 50
            list.add(100 - scaleFactor * Math.sin((x / 100.0) * 2 * Math.PI));
        }
        pane.getChildren().add(sinFunction);

        Scene scene = new Scene(pane, 400, 200);
        primaryStage.setTitle("Sine Function");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },

  // ---------------- Lecture 8 ----------------
  { id: "ControlCircle", lecture: "L8", title: "ControlCircle：Enlarge / Shrink（内部类 Handler）",
    keywords: "EventHandler ActionEvent handle inner class EnlargeHandler ShrinkHandler CirclePane enlarge shrink setOnAction HBox BorderPane",
    note: "课件只注册了 Enlarge；这里补全了 ShrinkHandler。内部类可以直接用外部类的 circlePane。",
    code: String.raw`import javafx.application.Application;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class ControlCircle extends Application {
    private CirclePane circlePane = new CirclePane();

    @Override // Override the start method in the Application class
    public void start(Stage primaryStage) {
        // Hold two buttons in an HBox
        HBox hBox = new HBox();
        hBox.setSpacing(10);
        hBox.setAlignment(Pos.CENTER);
        Button btEnlarge = new Button("Enlarge");
        Button btShrink = new Button("Shrink");
        hBox.getChildren().add(btEnlarge);
        hBox.getChildren().add(btShrink);

        // Create and register the handlers
        btEnlarge.setOnAction(new EnlargeHandler());
        btShrink.setOnAction(new ShrinkHandler());

        BorderPane borderPane = new BorderPane();
        borderPane.setCenter(circlePane);
        borderPane.setBottom(hBox);
        BorderPane.setAlignment(hBox, Pos.CENTER);

        // Create a scene and place it in the stage
        Scene scene = new Scene(borderPane, 200, 150);
        primaryStage.setTitle("ControlCircle"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    class EnlargeHandler implements EventHandler<ActionEvent> {
        @Override // Override the handle method
        public void handle(ActionEvent e) {
            circlePane.enlarge();
        }
    }

    class ShrinkHandler implements EventHandler<ActionEvent> {
        @Override
        public void handle(ActionEvent e) {
            circlePane.shrink();
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}

class CirclePane extends StackPane {
    private Circle circle = new Circle(50);

    public CirclePane() {
        getChildren().add(circle);
        circle.setStroke(Color.BLACK);
        circle.setFill(Color.WHITE);
    }

    public void enlarge() {
        circle.setRadius(circle.getRadius() + 2);
    }

    public void shrink() {
        circle.setRadius(circle.getRadius() > 2 ? circle.getRadius() - 2 : circle.getRadius());
    }
}` },
  { id: "LambdaControlCircle", lecture: "L8", title: "同一程序改用 Lambda：e -> circlePane.enlarge()",
    keywords: "lambda expression arrow functional interface setOnAction e ->",
    note: "EventHandler<ActionEvent> 只有一个抽象方法（函数式接口），所以可以写成 Lambda。",
    code: String.raw`import javafx.application.Application;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class LambdaControlCircle extends Application {
    private Circle circle = new Circle(50);

    @Override
    public void start(Stage primaryStage) {
        circle.setStroke(Color.BLACK);
        circle.setFill(Color.WHITE);
        StackPane circlePane = new StackPane(circle);

        Button btEnlarge = new Button("Enlarge");
        Button btShrink = new Button("Shrink");
        HBox hBox = new HBox(10, btEnlarge, btShrink);
        hBox.setAlignment(Pos.CENTER);

        // Lambda expressions: parameter -> body
        btEnlarge.setOnAction(e -> circle.setRadius(circle.getRadius() + 2));
        btShrink.setOnAction(e -> {
            if (circle.getRadius() > 2) {
                circle.setRadius(circle.getRadius() - 2);
            }
        });

        BorderPane borderPane = new BorderPane();
        borderPane.setCenter(circlePane);
        borderPane.setBottom(hBox);

        primaryStage.setTitle("LambdaControlCircle");
        primaryStage.setScene(new Scene(borderPane, 200, 150));
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "AnonymousHandlerDemo", lecture: "L8", title: "匿名内部类：Up/Down/Left/Right 移动 Text",
    keywords: "anonymous inner class new EventHandler<ActionEvent>() Text setX setY getX getY move up down left right boundary",
    note: "匿名内部类 = 声明类 + 创建对象一步完成；不能写 extends/implements，必须实现全部抽象方法。含边界判断。",
    code: String.raw`import javafx.application.Application;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class AnonymousHandlerDemo extends Application {
    @Override // Override the start method in the Application class
    public void start(Stage primaryStage) {
        Text text = new Text(40, 40, "Programming is fun");
        Pane pane = new Pane(text);

        // Hold four buttons in an HBox
        Button btUp = new Button("Up");
        Button btDown = new Button("Down");
        Button btLeft = new Button("Left");
        Button btRight = new Button("Right");
        HBox hBox = new HBox(btUp, btDown, btLeft, btRight);
        hBox.setSpacing(10);
        hBox.setAlignment(Pos.CENTER);

        BorderPane borderPane = new BorderPane(pane);
        borderPane.setBottom(hBox);

        // Create and register the handler
        btUp.setOnAction(new EventHandler<ActionEvent>() {
            @Override // Override the handle method
            public void handle(ActionEvent e) {
                text.setY(text.getY() > 10 ? text.getY() - 5 : 10);
            }
        });

        btDown.setOnAction(new EventHandler<ActionEvent>() {
            @Override // Override the handle method
            public void handle(ActionEvent e) {
                text.setY(text.getY() < pane.getHeight() ? text.getY() + 5 : pane.getHeight());
            }
        });

        btLeft.setOnAction(new EventHandler<ActionEvent>() {
            @Override // Override the handle method
            public void handle(ActionEvent e) {
                text.setX(text.getX() > 0 ? text.getX() - 5 : 0);
            }
        });

        btRight.setOnAction(new EventHandler<ActionEvent>() {
            @Override // Override the handle method
            public void handle(ActionEvent e) {
                text.setX(text.getX() < pane.getWidth() - 100 ? text.getX() + 5 : pane.getWidth() - 100);
            }
        });

        // Create a scene and place it in the stage
        Scene scene = new Scene(borderPane, 400, 350);
        primaryStage.setTitle("AnonymousHandlerDemo"); // Set title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "DetectSourceDemo", lecture: "L8", title: "一个 Handler 给四个按钮：getSource() 判断来源",
    keywords: "getSource cast Button one handler shared handler register same handler compare reference",
    note: "(Button) e.getSource() 取得触发事件的按钮，用 == 比较对象引用。",
    code: String.raw`import javafx.application.Application;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class DetectSourceDemo extends Application {
    @Override
    public void start(Stage primaryStage) {
        Text text = new Text(40, 40, "Programming is fun");
        Pane pane = new Pane(text);

        // Hold four buttons in an HBox
        Button btUp = new Button("Up");
        Button btDown = new Button("Down");
        Button btLeft = new Button("Left");
        Button btRight = new Button("Right");
        HBox hBox = new HBox(btUp, btDown, btLeft, btRight);
        hBox.setSpacing(10);
        hBox.setAlignment(Pos.CENTER);

        BorderPane borderPane = new BorderPane(pane);
        borderPane.setBottom(hBox);

        // Create a single handler for all buttons
        EventHandler<ActionEvent> handler = new EventHandler<ActionEvent>() {
            @Override // Override the handle method
            public void handle(ActionEvent e) {
                // Determine which button was clicked by comparing object references
                Button sourceButton = (Button) e.getSource();
                if (sourceButton == btUp) {
                    text.setY(text.getY() > 10 ? text.getY() - 5 : 10);
                } else if (sourceButton == btDown) {
                    text.setY(text.getY() < pane.getHeight() ? text.getY() + 5 : pane.getHeight());
                } else if (sourceButton == btLeft) {
                    text.setX(text.getX() > 0 ? text.getX() - 5 : 0);
                } else if (sourceButton == btRight) {
                    text.setX(text.getX() < pane.getWidth() - 100 ? text.getX() + 5 : pane.getWidth() - 100);
                }
            }
        };

        // Register the same handler for all buttons
        btUp.setOnAction(handler);
        btDown.setOnAction(handler);
        btLeft.setOnAction(handler);
        btRight.setOnAction(handler);

        // Create a scene and place it in the stage
        Scene scene = new Scene(borderPane, 400, 350);
        primaryStage.setTitle("DetectSourceDemo"); // Set title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "MouseEventDemo", lecture: "L8", title: "鼠标拖动 Text：setOnMouseDragged",
    keywords: "MouseEvent setOnMouseDragged getX getY drag mouse anonymous",
    note: "按住并移动鼠标触发 MouseDragged；e.getX()/getY() 是鼠标在节点坐标系中的位置。",
    code: String.raw`import javafx.application.Application;
import javafx.event.EventHandler;
import javafx.scene.Scene;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.Pane;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class MouseEventDemo extends Application {
    @Override // Override the start method in the Application class
    public void start(Stage primaryStage) {
        // Create a pane and set its properties
        Pane pane = new Pane();
        Text text = new Text(20, 20, "Programming is fun");
        pane.getChildren().addAll(text);

        // Set mouse drag event handler using an anonymous inner class
        text.setOnMouseDragged(new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent e) {
                text.setX(e.getX());
                text.setY(e.getY());
            }
        });

        // Create a scene and place it in the stage
        Scene scene = new Scene(pane, 300, 100);
        primaryStage.setTitle("MouseEventDemo"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "MouseButtonDemo", lecture: "L8", title: "区分左键/右键/中键：getButton() 与 MouseButton",
    keywords: "MouseButton PRIMARY SECONDARY MIDDLE getButton getClickCount right click left click double click",
    note: "课件文字：getButton() == MouseButton.SECONDARY 判断右键；getClickCount() 判断双击。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.input.MouseButton;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class MouseButtonDemo extends Application {
    @Override
    public void start(Stage primaryStage) {
        Circle circle = new Circle(150, 100, 30, Color.BLUE);
        Pane pane = new Pane(circle);
        Label status = new Label("Left click: move here. Right click: red. Double click: reset.");

        pane.setOnMouseClicked(e -> {
            if (e.getButton() == MouseButton.PRIMARY && e.getClickCount() == 2) {
                circle.setCenterX(150);
                circle.setCenterY(100);
                circle.setFill(Color.BLUE);
                status.setText("Double click: reset");
            } else if (e.getButton() == MouseButton.PRIMARY) {
                circle.setCenterX(e.getX());
                circle.setCenterY(e.getY());
                status.setText("Left click at (" + e.getX() + ", " + e.getY() + ")");
            } else if (e.getButton() == MouseButton.SECONDARY) {
                circle.setFill(Color.RED);
                status.setText("Right click");
            } else if (e.getButton() == MouseButton.MIDDLE) {
                status.setText("Middle button");
            }
        });

        BorderPane root = new BorderPane(pane);
        root.setBottom(status);
        primaryStage.setTitle("MouseButtonDemo");
        primaryStage.setScene(new Scene(root, 300, 230));
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "KeyEventDemo", lecture: "L8", title: "键盘移动字母：setOnKeyPressed + switch(getCode())",
    keywords: "KeyEvent setOnKeyPressed getCode KeyCode UP DOWN LEFT RIGHT getText requestFocus switch",
    note: "show() 之后调用 text.requestFocus()，Text 才能收到键盘事件；default 分支用 getText() 显示按下的字母。",
    code: String.raw`import javafx.application.Application;
import javafx.event.EventHandler;
import javafx.scene.Scene;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.Pane;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class KeyEventDemo extends Application {
    @Override // Override the start method in the Application class
    public void start(Stage primaryStage) {
        // Create a pane and set its properties
        Pane pane = new Pane();
        Text text = new Text(20, 20, "A");
        pane.getChildren().add(text);

        // Set key press event handler using an anonymous inner class
        text.setOnKeyPressed(new EventHandler<KeyEvent>() {
            @Override
            public void handle(KeyEvent e) {
                switch (e.getCode()) {
                    case DOWN:
                        text.setY(text.getY() + 10);
                        break;
                    case UP:
                        text.setY(text.getY() - 10);
                        break;
                    case LEFT:
                        text.setX(text.getX() - 10);
                        break;
                    case RIGHT:
                        text.setX(text.getX() + 10);
                        break;
                    default:
                        if (e.getText().length() > 0) {
                            text.setText(e.getText());
                        }
                }
            }
        });

        // Create a scene and place the pane in the stage
        Scene scene = new Scene(pane);
        primaryStage.setTitle("KeyEventDemo"); // Set the stage title
        primaryStage.setScene(scene); // Place the scene in the stage
        primaryStage.show(); // Display the stage

        text.requestFocus(); // text is focused to receive key input
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "CarGame", lecture: "L8", title: "2D 小游戏：方向键移动 emoji（switch 箭头写法）",
    keywords: "emoji game switch arrow case -> KeyCode lambda setOnKeyPressed player",
    note: "课件第 48 页。emoji 用 Character.toChars(0x1F697) 生成，源码保持纯英文字符；case X -> 是 Java 14+ 写法。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.Pane;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class CarGame extends Application {
    @Override
    public void start(Stage primaryStage) {
        Pane pane = new Pane();
        String car = new String(Character.toChars(0x1F697)); // car emoji
        Text text = new Text(100, 100, car);
        text.setFont(Font.font(40));
        pane.getChildren().add(text);

        text.setOnKeyPressed(e -> {
            switch (e.getCode()) {
                case DOWN -> text.setY(text.getY() + 10);
                case UP -> text.setY(text.getY() - 10);
                case LEFT -> text.setX(text.getX() - 10);
                case RIGHT -> text.setX(text.getX() + 10);
                default -> { }
            }
        });

        primaryStage.setTitle("CarGame");
        primaryStage.setScene(new Scene(pane, 400, 300));
        primaryStage.show();
        text.requestFocus();
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "WindowEventsDemo", lecture: "L8", title: "WindowEvent：Showing / Shown / Hiding / Hidden / CloseRequest",
    keywords: "WindowEvent setOnShowing setOnShown setOnHiding setOnHidden setOnCloseRequest consume terminal",
    note: "顺序：Showing → Shown → (点关闭) CloseRequest → Hiding → Hidden。在 CloseRequest 里 consume() 可阻止关闭。输出在 BlueJ 的 Terminal 窗口。",
    code: String.raw`import javafx.application.Application;
import javafx.event.EventHandler;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;

public class WindowEventsDemo extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Register event handlers for various window events using anonymous inner classes
        primaryStage.setOnShowing(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent event) {
                System.out.println("Window is about to be shown.");
            }
        });

        primaryStage.setOnShown(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent event) {
                System.out.println("Window has been shown.");
            }
        });

        primaryStage.setOnHiding(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent event) {
                System.out.println("Window is about to be hidden.");
            }
        });

        primaryStage.setOnHidden(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent event) {
                System.out.println("Window has been hidden.");
            }
        });

        primaryStage.setOnCloseRequest(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent event) {
                System.out.println("Close request received.");
                // Optionally consume the event to prevent closing
                // event.consume();
            }
        });

        primaryStage.setTitle("Window Events Demo");
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "TimelineExample", lecture: "L8", title: "Timeline 计时器：每秒加一",
    keywords: "Timeline KeyFrame Duration seconds setCycleCount INDEFINITE play lambda timer counter Label",
    note: "new KeyFrame(Duration.seconds(1), e -> {...})；setCycleCount(Timeline.INDEFINITE) 无限重复；play() 开始。",
    code: String.raw`import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;
import javafx.util.Duration;

public class TimelineExample extends Application {
    private Label timerLabel;
    private int seconds = 0;

    @Override
    public void start(Stage primaryStage) {
        timerLabel = new Label("Time: 0 seconds");
        StackPane pane = new StackPane();
        pane.getChildren().add(timerLabel);
        Scene scene = new Scene(pane, 300, 250);

        primaryStage.setTitle("Timeline Example");
        primaryStage.setScene(scene);
        primaryStage.show();

        // Create a timeline that increments every second
        Timeline timeline = new Timeline(new KeyFrame(Duration.seconds(1), e -> {
            seconds++;
            timerLabel.setText("Time: " + seconds + " seconds");
        }));
        timeline.setCycleCount(Timeline.INDEFINITE); // Run indefinitely
        timeline.play(); // Start execution
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "TimelineControl", lecture: "L8", title: "Timeline 动画：Play / Pause / Stop 控制移动的球",
    keywords: "Timeline play pause stop animation moving ball bounce KeyFrame millis",
    note: "play() 开始或继续，pause() 暂停，stop() 停止并回到开头；碰到边界时反向。",
    code: String.raw`import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Application;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;
import javafx.util.Duration;

public class TimelineControl extends Application {
    private double dx = 3;

    @Override
    public void start(Stage primaryStage) {
        Pane pane = new Pane();
        pane.setPrefSize(400, 200);
        Circle ball = new Circle(30, 100, 20, Color.ORANGE);
        pane.getChildren().add(ball);

        Timeline timeline = new Timeline(new KeyFrame(Duration.millis(20), e -> {
            // Reverse direction at the left or right edge
            if (ball.getCenterX() + dx > pane.getWidth() - ball.getRadius() || ball.getCenterX() + dx < ball.getRadius()) {
                dx = -dx;
            }
            ball.setCenterX(ball.getCenterX() + dx);
        }));
        timeline.setCycleCount(Timeline.INDEFINITE);

        Button btPlay = new Button("Play");
        Button btPause = new Button("Pause");
        Button btStop = new Button("Stop");
        btPlay.setOnAction(e -> timeline.play());
        btPause.setOnAction(e -> timeline.pause());
        btStop.setOnAction(e -> {
            timeline.stop();
            ball.setCenterX(30);
        });

        HBox buttons = new HBox(10, btPlay, btPause, btStop);
        buttons.setAlignment(Pos.CENTER);
        BorderPane root = new BorderPane(pane);
        root.setBottom(buttons);

        primaryStage.setOnCloseRequest(e -> timeline.stop());
        primaryStage.setTitle("TimelineControl");
        primaryStage.setScene(new Scene(root));
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "TwoHandlersDemo", lecture: "L8", title: "同一按钮 setOnAction 两次：只有后一个生效",
    keywords: "setOnAction twice overwrite replace second handler addEventHandler pro tip",
    note: "setOnAction 是 setter，第二次覆盖第一次（像 x = 1; x = 2;）。要两个都执行就写在同一个 Lambda 里。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

public class TwoHandlersDemo extends Application {
    @Override
    public void start(Stage primaryStage) {
        Button btOK = new Button("OK");
        btOK.setOnAction(e -> System.out.println("First Event"));
        btOK.setOnAction(e -> System.out.println("Second Event")); // replaces the first handler

        // To run both, put both statements in one handler:
        // btOK.setOnAction(e -> {
        //     System.out.println("First Event");
        //     System.out.println("Second Event");
        // });

        primaryStage.setTitle("TwoHandlersDemo");
        primaryStage.setScene(new Scene(new StackPane(btOK), 200, 100));
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "ControlsDemo", lecture: "L8", title: "CheckBox / RadioButton / ComboBox 也触发 ActionEvent",
    keywords: "CheckBox RadioButton ToggleGroup ComboBox TextField ActionEvent isSelected getValue setOnAction controls",
    note: "课件的事件表：点 CheckBox、RadioButton、在 TextField 按回车、ComboBox 选新项，都是 ActionEvent，用 setOnAction 注册。",
    code: String.raw`import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.CheckBox;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.RadioButton;
import javafx.scene.control.TextField;
import javafx.scene.control.ToggleGroup;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class ControlsDemo extends Application {
    @Override
    public void start(Stage primaryStage) {
        Text text = new Text("Programming is fun");
        text.setFont(Font.font(20));

        CheckBox chkBold = new CheckBox("Bold");
        chkBold.setOnAction(e -> text.setFont(Font.font("Arial",
            chkBold.isSelected() ? FontWeight.BOLD : FontWeight.NORMAL, 20)));

        RadioButton rbRed = new RadioButton("Red");
        RadioButton rbBlue = new RadioButton("Blue");
        ToggleGroup group = new ToggleGroup();
        rbRed.setToggleGroup(group);
        rbBlue.setToggleGroup(group);
        rbRed.setOnAction(e -> text.setFill(Color.RED));
        rbBlue.setOnAction(e -> text.setFill(Color.BLUE));

        ComboBox<String> cboSize = new ComboBox<>();
        cboSize.getItems().addAll("Small", "Medium", "Large");
        cboSize.setValue("Medium");
        cboSize.setOnAction(e -> {
            String size = cboSize.getValue();
            if (size.equals("Small")) {
                text.setFont(Font.font(12));
            } else if (size.equals("Large")) {
                text.setFont(Font.font(30));
            } else {
                text.setFont(Font.font(20));
            }
        });

        TextField tfMessage = new TextField();
        Label hint = new Label("Type and press Enter:");
        tfMessage.setOnAction(e -> text.setText(tfMessage.getText()));

        HBox options = new HBox(10, chkBold, rbRed, rbBlue, cboSize);
        VBox root = new VBox(10, text, options, new HBox(10, hint, tfMessage));
        root.setPadding(new Insets(15));

        primaryStage.setTitle("ControlsDemo");
        primaryStage.setScene(new Scene(root, 420, 170));
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  // ----- Worked examples: short complete programs that together cover every Test 2 topic -----
  { id: "HandlerStylesDemo", lecture: "L8", title: "四种 Handler 写法对照：独立类、内部类、匿名内部类、Lambda",
    keywords: "handler class inner class anonymous lambda EventHandler ActionEvent implements handle constructor delegation 独立类 内部类 匿名类 委托模型",
    note: "同一个程序里四个按钮各用一种写法：独立类要通过构造器拿到 Label；内部类直接用外部类字段；匿名内部类声明和创建一步完成；EventHandler 只有一个抽象方法，所以能写成 Lambda。",
    code: String.raw`import javafx.application.Application;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class HandlerStylesDemo extends Application {
    private Label message = new Label("Click a button");

    @Override
    public void start(Stage primaryStage) {
        Button b1 = new Button("1 Separate class");
        Button b2 = new Button("2 Inner class");
        Button b3 = new Button("3 Anonymous class");
        Button b4 = new Button("4 Lambda");

        b1.setOnAction(new SeparateHandler(message));      // gets the Label through its constructor
        b2.setOnAction(new InnerHandler());                // uses the field message directly
        b3.setOnAction(new EventHandler<ActionEvent>() {   // declared and created in one step
            @Override
            public void handle(ActionEvent e) {
                message.setText("Anonymous class");
            }
        });
        b4.setOnAction(e -> message.setText("Lambda"));    // EventHandler has one method, so a lambda fits

        VBox root = new VBox(10, message, b1, b2, b3, b4);
        root.setStyle("-fx-padding: 15;");
        primaryStage.setTitle("HandlerStylesDemo");
        primaryStage.setScene(new Scene(root));
        primaryStage.show();
    }

    /** Inner class: can use the private fields of the outer class. */
    class InnerHandler implements EventHandler<ActionEvent> {
        @Override
        public void handle(ActionEvent e) {
            message.setText("Inner class");
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}

/** Separate handler class: the objects it changes come in through the constructor. */
class SeparateHandler implements EventHandler<ActionEvent> {
    private Label message;

    public SeparateHandler(Label message) {
        this.message = message;
    }

    @Override
    public void handle(ActionEvent e) {
        message.setText("Separate class");
    }
}` },
  { id: "InputEventsDemo", lecture: "L8", title: "鼠标与键盘事件全家：进入/离开、按下/松开、移动、双击、右键、KEY_TYPED、退格",
    keywords: "MouseEvent setOnMouseEntered setOnMouseExited setOnMousePressed setOnMouseReleased setOnMouseMoved setOnMouseClicked getClickCount getSceneX isShiftDown SECONDARY KeyEvent setOnKeyTyped getCharacter setOnKeyPressed BACK_SPACE ESCAPE requestFocus 双击 右键 键盘",
    note: "getX() 相对事件源，getSceneX() 相对 Scene；getClickCount()==2 是双击。KEY_TYPED 用 getCharacter() 读字符，功能键用 KEY_PRESSED 的 getCode()。按键交给有焦点的节点，所以最后 requestFocus()。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.input.KeyCode;
import javafx.scene.input.MouseButton;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class InputEventsDemo extends Application {
    private String typed = "";

    @Override
    public void start(Stage primaryStage) {
        Circle circle = new Circle(150, 90, 40, Color.GREEN);
        Pane pane = new Pane(circle);
        pane.setPrefSize(300, 180);
        Label mouseLabel = new Label("Mouse: -");
        Label keyLabel = new Label("Typed: ");

        // Mouse: entered/exited, pressed/released, moved, clicked
        circle.setOnMouseEntered(e -> circle.setFill(Color.RED));
        circle.setOnMouseExited(e -> circle.setFill(Color.GREEN));
        circle.setOnMousePressed(e -> circle.setStroke(Color.BLACK));
        circle.setOnMouseReleased(e -> circle.setStroke(null));
        pane.setOnMouseMoved(e -> mouseLabel.setText("Mouse: pane (" + e.getX() + ", " + e.getY()
                + ") scene (" + e.getSceneX() + ", " + e.getSceneY() + ")"));
        pane.setOnMouseClicked(e -> mouseLabel.setText("Clicked: "
                + (e.getButton() == MouseButton.SECONDARY ? "right" : "left")
                + ", clicks = " + e.getClickCount() + (e.isShiftDown() ? ", Shift" : "")));

        BorderPane root = new BorderPane(pane);
        root.setBottom(new VBox(4, mouseLabel, keyLabel));
        Scene scene = new Scene(root);

        // Keys: KEY_TYPED gives the character, KEY_PRESSED gives the KeyCode
        scene.setOnKeyTyped(e -> {
            if (Character.isLetterOrDigit(e.getCharacter().charAt(0))) typed += e.getCharacter();
            keyLabel.setText("Typed: " + typed);
        });
        scene.setOnKeyPressed(e -> {
            if (e.getCode() == KeyCode.BACK_SPACE && !typed.isEmpty()) typed = typed.substring(0, typed.length() - 1);
            if (e.getCode() == KeyCode.ESCAPE) typed = "";
            keyLabel.setText("Typed: " + typed);
        });

        primaryStage.setTitle("InputEventsDemo");
        primaryStage.setScene(scene);
        primaryStage.show();
        root.requestFocus();   // key events go to the focused node
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "ColorBindingDemo", lecture: "L7", title: "Color 的各种写法 + 属性绑定（圆随窗口变大、Label 跟着半径）",
    keywords: "Color RED new Color rgb color opacity brighter darker immutable bind binding radiusProperty widthProperty divide textProperty asString 颜色 透明度 绑定",
    note: "new Color / Color.color 用 0.0–1.0，Color.rgb 用 0–255，第 4 个值是透明度；Color 不可变，darker()/brighter() 返回新颜色。target.bind(source) 让目标自动跟随源；绑定后不能再 set。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class ColorBindingDemo extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Colours: new Color uses 0.0-1.0, Color.rgb uses 0-255, the 4th value is the opacity
        Color base = Color.rgb(30, 144, 255);
        HBox swatches = new HBox(8,
                new Circle(15, Color.RED),
                new Circle(15, new Color(0.2, 0.6, 0.2, 1.0)),
                new Circle(15, base),
                new Circle(15, Color.color(1.0, 0.5, 0.0, 0.3)),
                new Circle(15, base.darker()),       // Color is immutable: a new, darker colour
                new Circle(15, base.brighter()));

        // Binding: the circle stays in the middle and grows with the window; the Label follows the radius
        Pane pane = new Pane();
        Circle circle = new Circle();
        circle.setFill(Color.ORANGE);
        circle.centerXProperty().bind(pane.widthProperty().divide(2));
        circle.centerYProperty().bind(pane.heightProperty().divide(2));
        circle.radiusProperty().bind(pane.widthProperty().divide(8));
        pane.getChildren().add(circle);
        Label info = new Label();
        info.textProperty().bind(circle.radiusProperty().asString("Radius: %.0f"));

        BorderPane root = new BorderPane(pane);
        root.setTop(swatches);
        root.setBottom(info);
        primaryStage.setTitle("ColorBindingDemo");
        primaryStage.setScene(new Scene(root, 400, 300));
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "InputCheckDemo", lecture: "L8", title: "输入框读数字：try/catch + 范围检查 + Alert，回车与按钮共用处理器",
    keywords: "TextField Double.parseDouble NumberFormatException try catch Alert ERROR String.format EventHandler shared Enter 输入验证 弹窗 两位小数",
    note: "非数字时 parseDouble 抛 NumberFormatException，catch 后弹 Alert；超出范围也弹 Alert。按钮和输入框回车都是 ActionEvent，共用一个 EventHandler。",
    code: String.raw`import javafx.application.Application;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class InputCheckDemo extends Application {
    private TextField input = new TextField();
    private Label result = new Label("Area: -");

    @Override
    public void start(Stage primaryStage) {
        Button btCalc = new Button("Area");
        EventHandler<ActionEvent> calc = e -> calculate();  // shared: button click and Enter in the field
        btCalc.setOnAction(calc);
        input.setOnAction(calc);

        VBox root = new VBox(10, new HBox(8, new Label("Radius (1-100):"), input, btCalc), result);
        root.setStyle("-fx-padding: 15;");
        primaryStage.setTitle("InputCheckDemo");
        primaryStage.setScene(new Scene(root));
        primaryStage.show();
    }

    private void calculate() {
        try {
            double r = Double.parseDouble(input.getText().trim());
            if (r < 1 || r > 100) {
                new Alert(Alert.AlertType.ERROR, "Radius must be between 1 and 100.").showAndWait();
                return;
            }
            result.setText(String.format("Area: %.2f", Math.PI * r * r));
        } catch (NumberFormatException ex) {
            new Alert(Alert.AlertType.ERROR, "Please enter a number.").showAndWait();
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "A2ShapeApp", lecture: "A2", title: "A2 结构精简版：接口 + 抽象类 + 两个子类 + 多态",
    keywords: "Assignment 2 interface Drawable abstract class Shape extends super constructor draw Pane polymorphism dynamic binding setColor moveDown clear 多态 抽象类 接口",
    note: "Drawable 接口 → 抽象类 Shape（protected 字段、构造器、抽象方法）→ 子类第一行 super(x, y)。主程序只存 Shape active，调用 draw 时按实际类型执行（动态绑定）；重画前先 clear()。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Rectangle;
import javafx.stage.Stage;

interface Drawable {
    void draw(Pane canvas);
}

abstract class Shape implements Drawable {
    protected double x, y;                 // centre
    protected Color color = Color.GREEN;

    public Shape(double x, double y) { this.x = x; this.y = y; }
    public abstract double getArea();
    public void setColor(Color color) { this.color = color; }
    public void moveDown() { y += 15; }
}

class CircleShape extends Shape {
    private double radius;
    public CircleShape(double x, double y, double radius) { super(x, y); this.radius = radius; }
    @Override public double getArea() { return Math.PI * radius * radius; }
    @Override public void draw(Pane canvas) { canvas.getChildren().add(new Circle(x, y, radius, color)); }
}

class SquareShape extends Shape {
    private double side;
    public SquareShape(double x, double y, double side) { super(x, y); this.side = side; }
    @Override public double getArea() { return side * side; }
    @Override public void draw(Pane canvas) {   // Rectangle is placed by its upper-left corner
        Rectangle r = new Rectangle(x - side / 2, y - side / 2, side, side);
        r.setFill(color);
        canvas.getChildren().add(r);
    }
}

public class A2ShapeApp extends Application {
    private Pane canvas = new Pane();
    private Label status = new Label("Add a shape.");
    private Shape active;                  // a CircleShape or a SquareShape (polymorphism)

    @Override
    public void start(Stage stage) {
        Button btCircle = new Button("Add Circle"), btSquare = new Button("Add Square");
        Button btRed = new Button("Red"), btDown = new Button("Move Down"), btClear = new Button("Clear");
        btCircle.setOnAction(e -> { active = new CircleShape(100, 100, 40); redraw(); });
        btSquare.setOnAction(e -> { active = new SquareShape(100, 100, 60); redraw(); });
        btRed.setOnAction(e -> { if (active != null) { active.setColor(Color.RED); redraw(); } });
        btDown.setOnAction(e -> { if (active != null) { active.moveDown(); redraw(); } });
        btClear.setOnAction(e -> { active = null; canvas.getChildren().clear(); status.setText("Cleared."); });

        BorderPane root = new BorderPane(canvas);
        root.setLeft(new VBox(10, btCircle, btSquare, btRed, btDown, btClear));
        root.setBottom(status);
        stage.setTitle("A2ShapeApp - YOUR NAME");
        stage.setScene(new Scene(root, 450, 300));
        stage.show();
    }

    private void redraw() {
        canvas.getChildren().clear();      // remove the old drawing first
        active.draw(canvas);               // dynamic binding chooses CircleShape.draw or SquareShape.draw
        status.setText(String.format("y = %.0f, area = %.1f", active.y, active.getArea()));
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "MiniLibraryDemo", lecture: "Lab 3", title: "Lab 3 结构精简版：ArrayList + ListView + 读写 books.txt + Alert",
    keywords: "Lab 3 Book ArrayList ListView books.txt Scanner PrintWriter File load save Alert duplicate ISBN borrow return 图书 文件读写",
    note: "数据放在 ArrayList<Book>；启动时 Scanner 读 books.txt（没有文件就是空列表），每次成功修改用 PrintWriter 整个写回；空输入、重复 ISBN、找不到都弹 Alert。",
    code: String.raw`import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Scanner;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;

class Book {
    private String isbn, title;
    private boolean available = true;

    public Book(String isbn, String title) { this.isbn = isbn; this.title = title; }
    public String getIsbn() { return isbn; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public String toFileLine() { return isbn + "," + title + "," + available; }
    @Override public String toString() { return isbn + " | " + title + " | " + (available ? "Available" : "Borrowed"); }
}

public class MiniLibraryDemo extends Application {
    private ArrayList<Book> books = new ArrayList<>();
    private ListView<String> list = new ListView<>();
    private TextField isbnField = new TextField(), titleField = new TextField();

    @Override
    public void start(Stage stage) {
        Button btAdd = new Button("Add"), btDelete = new Button("Delete"), btBorrow = new Button("Borrow/Return");
        btAdd.setOnAction(e -> {
            String isbn = isbnField.getText().trim(), title = titleField.getText().trim();
            if (isbn.isEmpty() || title.isEmpty()) error("Please enter both ISBN and Title.");
            else if (find(isbn) != null) error("Duplicate ISBN: " + isbn + " already exists.");
            else { books.add(new Book(isbn, title)); saveAndShow(); }
        });
        btDelete.setOnAction(e -> {
            Book b = find(isbnField.getText().trim());
            if (b == null) error("Book not found.");
            else { books.remove(b); saveAndShow(); }
        });
        btBorrow.setOnAction(e -> {
            Book b = find(isbnField.getText().trim());
            if (b == null) error("Book not found.");
            else { b.setAvailable(!b.isAvailable()); saveAndShow(); }
        });

        isbnField.setPromptText("ISBN");
        titleField.setPromptText("Title");
        BorderPane root = new BorderPane(list);
        root.setBottom(new HBox(8, isbnField, titleField, btAdd, btDelete, btBorrow));
        load();
        show();
        stage.setTitle("MiniLibraryDemo");
        stage.setScene(new Scene(root, 600, 320));
        stage.show();
    }

    private Book find(String isbn) {
        for (Book b : books) if (b.getIsbn().equals(isbn)) return b;
        return null;
    }

    private void show() {
        list.getItems().clear();
        for (Book b : books) list.getItems().add(b.toString());
    }

    private void saveAndShow() {           // PrintWriter rewrites the whole file each time
        try (PrintWriter out = new PrintWriter(new File("books.txt"))) {
            for (Book b : books) out.println(b.toFileLine());
        } catch (FileNotFoundException ex) {
            error("Unable to save books.txt.");
        }
        show();
    }

    private void load() {                  // a missing file means an empty list
        File file = new File("books.txt");
        if (!file.exists()) return;
        try (Scanner in = new Scanner(file)) {
            while (in.hasNextLine()) {
                String[] p = in.nextLine().split(",");
                if (p.length != 3) continue;
                Book b = new Book(p[0], p[1]);
                b.setAvailable(Boolean.parseBoolean(p[2]));
                books.add(b);
            }
        } catch (FileNotFoundException ex) {
            error("Unable to load books.txt.");
        }
    }

    private void error(String text) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setContentText(text);
        alert.showAndWait();
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "WindowFlowDemo", lecture: "L7", title: "第二个窗口（只开一个）+ 运行时往 FlowPane 添加 / 移除按钮",
    keywords: "second Stage new Stage isShowing toFront close FlowPane getChildren add remove dynamic runtime 第二个窗口 新窗口 运行时添加 动态",
    note: "new Stage() 是新窗口，用字段保存，已打开就 toFront()；Save 时改主窗口的 Label 再 close()。运行中 getChildren().add / remove 增删控件，新按钮点击时移除自己。",
    code: String.raw`import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;

public class WindowFlowDemo extends Application {
    private FlowPane tags = new FlowPane(6, 6);       // hgap, vgap; wraps to a new row
    private Label owner = new Label("Owner: -");
    private Stage settings;                           // the second window, opened only once

    @Override
    public void start(Stage primaryStage) {
        TextField input = new TextField();
        Button btAdd = new Button("Add Tag");
        Button btSettings = new Button("Settings...");
        btAdd.setOnAction(e -> {
            if (input.getText().trim().isEmpty()) return;
            Button tag = new Button(input.getText().trim());
            tag.setOnAction(ev -> tags.getChildren().remove(tag));   // added at run time, removes itself
            tags.getChildren().add(tag);
            input.clear();
        });
        btSettings.setOnAction(e -> openSettings());

        BorderPane root = new BorderPane(tags);
        root.setTop(new HBox(8, input, btAdd, btSettings));
        root.setBottom(owner);
        primaryStage.setTitle("WindowFlowDemo");
        primaryStage.setScene(new Scene(root, 420, 220));
        primaryStage.show();
    }

    private void openSettings() {
        if (settings != null && settings.isShowing()) { settings.toFront(); return; }
        TextField name = new TextField();
        Button btSave = new Button("Save");
        btSave.setOnAction(e -> { owner.setText("Owner: " + name.getText().trim()); settings.close(); });
        settings = new Stage();
        settings.setTitle("Settings");
        settings.setScene(new Scene(new HBox(8, new Label("Name:"), name, btSave)));
        settings.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}` },
  { id: "OopFileDemo", lecture: "OOP", title: "纯 Java：继承、super、覆写、抽象类、接口、多态、instanceof、重载 + 文本文件读写",
    keywords: "inheritance extends super override toString abstract interface implements polymorphism instanceof cast overloading PrintWriter FileWriter append Scanner hasNextLine split parseInt NumberFormatException 继承 多态 重载 文件读写 控制台",
    note: "没有界面的 OOP 与文件题：构造器第一行 super(...)；ArrayList<Person> 放不同子类；instanceof 后强转用接口方法；同名不同参数是重载。PrintWriter 覆盖写，FileWriter(file, true) 追加，Scanner 逐行读、split、parseInt，坏行用 try/catch 跳过。",
    code: String.raw`import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Scanner;

interface Payable {
    double monthlyPay();
}

abstract class Person {
    private String name;
    protected int age;

    public Person(String name, int age) { this.name = name; this.age = age; }
    public String getName() { return name; }
    public abstract String getRole();
    @Override public String toString() { return getRole() + ": " + name + " (" + age + ")"; }
}

class Student extends Person {
    private double gpa;
    public Student(String name, int age, double gpa) { super(name, age); this.gpa = gpa; }   // super(...) first
    @Override public String getRole() { return "Student"; }
    @Override public String toString() { return super.toString() + ", GPA " + gpa; }
}

class Teacher extends Person implements Payable {
    private double salary;
    public Teacher(String name, int age, double salary) { super(name, age); this.salary = salary; }
    @Override public String getRole() { return "Teacher"; }
    @Override public double monthlyPay() { return salary / 12; }
}

public class OopFileDemo {
    static void greet(Person p) { System.out.println("Hello, " + p.getName()); }                 // overloading:
    static void greet(Person p, String word) { System.out.println(word + ", " + p.getName()); }   // same name, other parameters

    public static void main(String[] args) {
        ArrayList<Person> people = new ArrayList<>();   // polymorphism: different subclasses in one list
        people.add(new Student("Chan Tai Man", 19, 3.4));
        people.add(new Teacher("Wong Ka Ho", 45, 600000));
        for (Person p : people) {
            System.out.println(p);                       // dynamic binding: the real class's toString
            if (p instanceof Payable) System.out.println("  pay = " + ((Payable) p).monthlyPay());
        }
        greet(people.get(0));
        greet(people.get(1), "Good morning");

        File file = new File("scores.txt");
        try (PrintWriter out = new PrintWriter(file)) {                         // write (replaces old content)
            out.println("Chan,78");
            out.println("Lee,91");
        } catch (FileNotFoundException ex) {
            System.out.println("Cannot write scores.txt");
        }
        try (PrintWriter out = new PrintWriter(new FileWriter(file, true))) {   // append
            out.println("Wong,abc");
        } catch (IOException ex) {
            System.out.println("Cannot append");
        }
        int total = 0, count = 0;
        try (Scanner in = new Scanner(file)) {                                  // read line by line
            while (in.hasNextLine()) {
                String[] parts = in.nextLine().split(",");
                try {
                    total += Integer.parseInt(parts[1]);
                    count++;
                } catch (NumberFormatException ex) {
                    System.out.println("Skipped: " + parts[0]);
                }
            }
        } catch (FileNotFoundException ex) {
            System.out.println("scores.txt not found");
        }
        System.out.println("Average: " + (double) total / count);
    }
}` }
];

const Examples = {
  list: EXAMPLES,
  parameters(id) {
    if (id === "ButtonInPane") return { title: "Button in a pane", button: "OK", width: "200", height: "50" };
    if (id === "MyJavaFX") return { title: "MyJavaFX", button: "OK", width: "200", height: "250" };
    return null;
  },

  search(query) {
    const words = String(query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return EXAMPLES;
    return EXAMPLES.filter(e => {
      const hay = (e.id + " " + e.title + " " + e.keywords + " " + e.note + " " + e.code).toLowerCase();
      return words.every(w => hay.includes(w));
    });
  },

  // The example as a file named after className, with the required header comment.
  build(id, className, profile, parameters) {
    const example = EXAMPLES.find(e => e.id === id);
    if (!example) throw new Error("找不到例程 " + id);
    const name = Java.ident(className || example.id, "类名");
    const helpers = [...example.code.matchAll(/^class\s+(\w+)/gm)].map(m => m[1]);
    if (helpers.includes(name)) throw new Error("类名 " + name + " 和例程里的辅助类重名。");
    let code = example.code;
    if (name !== example.id) code = code.replace(new RegExp("\\b" + example.id + "\\b", "g"), name);
    const defaults = Examples.parameters(id);
    if (defaults && parameters) {
      const p = { ...defaults, ...parameters };
      const width = Java.number(p.width, "场景宽", { integer: true, min: 1, max: 4000 });
      const height = Java.number(p.height, "场景高", { integer: true, min: 1, max: 4000 });
      // Only these two maintained examples expose parameters. No arbitrary source rewriting.
      code = code.replace('new Button("OK")', () => "new Button(" + Java.str(p.button) + ")")
        .replace(/new Scene\((pane|btOK), 200, (?:50|250)\)/, (_, node) => "new Scene(" + node + ", " + width + ", " + height + ")")
        .replace(/primaryStage\.setTitle\("[^"]*"\)/, () => "primaryStage.setTitle(" + Java.str(Java.fillProfile(p.title, profile)) + ")");
    }
    if (profile?.imports === "universal") {
      // Same universal block as the generators; the example's own classes keep their exact imports when needed.
      const imports = [...code.matchAll(/^import\s+([\w.*]+)\s*;[^\n]*\n/gm)].map(m => m[1]);
      const types = [name, ...[...code.matchAll(/\b(?:class|interface|enum)\s+([A-Za-z_]\w*)/g)].map(m => m[1])];
      code = Java.universalImports(imports, types) + "\n\n" + code.replace(/^import\s+[\w.*]+\s*;[^\n]*\n/gm, "").replace(/^\s+/, "");
    }
    return { files: [{ filename: name + ".java", code: Java.withHeader(code, profile), kind: "class" }], main: name, warnings: [], example };
  }
};

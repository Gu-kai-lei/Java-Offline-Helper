/* Offline Java and JavaFX reference. Examples use the context stated in the notes. */
"use strict";

const Knowledge = (() => {
  const entries = [
    { id: "imports-fx", group: "模板与 import", title: "通用 import 块 · 任何 JavaFX 程序都能用",
      keywords: "import 导入 通用import 万能import import块 头部 包 通配符 星号 wildcard javafx.* java.util.* java.io.* 找不到符号 cannot find symbol",
      notes: [
        "整段复制到每个 .java 文件最上面（头注释下面、class 前面），就不用再查某个类在哪个包。没用到的 import 不影响编译。",
        "唯一的同名冲突是 Path：java.nio.file.Path 和 javafx.scene.shape.Path 都被导入。要用其中一个时，另加一行精确 import，例如 import java.nio.file.Path;。",
        "如果自己写了与 JavaFX 同名的类（如 Shape、Circle），同一文件夹里的自己的类优先；要用 JavaFX 的那个，写全名 javafx.scene.shape.Shape，或加一行精确 import。",
        "builder 生成的代码也可以用这一段：在「考生信息」或代码面板上方把 import 写法改成「通用 import 块」。"
      ], code: Java.universalBlock("fx"), related: ["imports-java", "template-fx", "template-java"] },
    { id: "imports-java", group: "模板与 import", title: "通用 import 块 · 普通 Java 类（OOP、控制台、文件读写）",
      keywords: "import 导入 通用import 万能import 普通java 控制台 Scanner ArrayList File PrintWriter 文件读写 日期 LocalDate",
      notes: [
        "没有界面的类（Book、Student、Library、接口和抽象类）用这一段即可：集合、Scanner、文件读写、路径、日期时间都在里面。",
        "类里要用 JavaFX（如 Pane、Color），改用「通用 import 块 · 任何 JavaFX 程序都能用」。"
      ], code: Java.universalBlock("java"), related: ["imports-fx", "template-java"] },
    { id: "template-fx", group: "模板与 import", title: "JavaFX 程序模板 · BorderPane 五个区域",
      keywords: "模板 骨架 空程序 新建程序 主程序 start launch BorderPane setTop setLeft setCenter setRight setBottom 布局 五个区域 HBox VBox Insets",
      notes: [
        "从这个文件开始手写：类名改成题目要求的名字（文件名要一致），按 1 控件 → 2 布局 → 3 事件 → 4 窗口 的顺序往下填。",
        "BorderPane 每个区域只能放一个节点；一个区域要放多个控件，就先放进 HBox / VBox，再把这个盒子放进区域。没放东西的区域不占位置。",
        "几个事件都要用的对象（状态 Label、计数变量）写成字段，放在 start() 外面。"
      ], file: "MyApp.java", code: `${Java.header({ name: "YOUR NAME", id: "YOUR STUDENT ID", tools: "BlueJ" })}
${Java.universalBlock("fx")}

public class MyApp extends Application {
    // Fields: objects that several event handlers use
    private Label status = new Label("Ready");
    private int clicks = 0;

    @Override
    public void start(Stage stage) {
        // ===== 1. Controls =====
        Button btAdd = new Button("Add");
        Button btClear = new Button("Clear");
        Pane canvas = new Pane();
        canvas.setPrefSize(400, 300);
        canvas.setStyle("-fx-background-color: white; -fx-border-color: gray;");

        // ===== 2. Layout: top / left / center / right / bottom =====
        Label title = new Label("My Application");
        title.setFont(Font.font("Arial", FontWeight.BOLD, 16));
        VBox buttons = new VBox(10, btAdd, btClear);
        buttons.setPadding(new Insets(10));
        BorderPane root = new BorderPane();
        root.setTop(title);
        root.setLeft(buttons);
        root.setCenter(canvas);
        root.setBottom(status);
        BorderPane.setAlignment(title, Pos.CENTER);
        BorderPane.setMargin(status, new Insets(5, 10, 5, 10));

        // ===== 3. Events =====
        btAdd.setOnAction(e -> {
            clicks++;
            canvas.getChildren().add(new Circle(30 * clicks, 50, 20, Color.GREEN));
            status.setText("Circles: " + clicks);
        });
        btClear.setOnAction(e -> {
            canvas.getChildren().clear();
            clicks = 0;
            status.setText("Cleared");
        });

        // ===== 4. Window =====
        stage.setTitle("MyApp - YOUR NAME");
        stage.setScene(new Scene(root, 600, 400));
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}`, related: ["imports-fx", "template-java"] },
    { id: "template-java", group: "模板与 import", title: "Java 控制台程序模板 · Scanner 输入、ArrayList、文件读写",
      keywords: "模板 骨架 控制台 console main 纯java 普通java Scanner System.in ArrayList PrintWriter 读文件 写文件 FileNotFoundException 没有界面",
      notes: [
        "题目只要求 OOP 或文件读写、不要界面时用这个模板：main 方法 + Scanner 读键盘 + ArrayList 存数据 + PrintWriter / Scanner(File) 读写文本文件。",
        "PrintWriter(File) 和 Scanner(File) 都会抛出 FileNotFoundException（受检异常），必须 try/catch 或在方法上写 throws。",
        "写文件会覆盖旧内容；读之前先用 file.exists() 判断文件是否存在。"
      ], file: "MyProgram.java", code: `${Java.header({ name: "YOUR NAME", id: "YOUR STUDENT ID", tools: "BlueJ" })}
${Java.universalBlock("java")}

public class MyProgram {
    public static void main(String[] args) {
        Scanner keyboard = new Scanner(System.in);
        ArrayList<String> names = new ArrayList<>();

        // 1. Read input until the user types "end"
        System.out.print("Name (end to stop): ");
        String name = keyboard.nextLine().trim();
        while (!name.equalsIgnoreCase("end")) {
            names.add(name);
            System.out.print("Name (end to stop): ");
            name = keyboard.nextLine().trim();
        }

        // 2. Write one line per name
        File file = new File("names.txt");
        try (PrintWriter output = new PrintWriter(file)) {
            for (String n : names) {
                output.println(n);
            }
        } catch (FileNotFoundException ex) {
            System.out.println("Unable to save names.txt");
        }

        // 3. Read the file back
        if (file.exists()) {
            try (Scanner input = new Scanner(file)) {
                while (input.hasNextLine()) {
                    System.out.println("Saved: " + input.nextLine());
                }
            } catch (FileNotFoundException ex) {
                System.out.println("Unable to read names.txt");
            }
        }
    }
}`, related: ["imports-java", "template-fx"] },
    { id: "key-code", group: "键盘与输入", title: "KeyEvent.getCode() 判断按键",
      keywords: "键码 方向键 回车 空格 KeyCode KeyEvent.getCode setOnKeyPressed setOnKeyReleased KEY_PRESSED KEY_RELEASED getText isShiftDown isControlDown key code",
      notes: [
        "getCode() 返回 KeyCode 枚举。用 == 或 switch 比较 KeyCode.LEFT、KeyCode.ENTER、KeyCode.SPACE 等常量。按下和松开事件都可以按键码判断。",
        "KEY_TYPED 的 getCode() 是 KeyCode.UNDEFINED。读取实际输入的字符用 getCharacter()。getText() 是按键描述。",
        "KeyCode 也有一个同名的 getCode()，返回内部整数键码。该整数并非数字键的数值。组合键用 isShiftDown()、isControlDown() 等方法判断。",
        "片段放在 start()。scene 是当前场景，circle 是已添加的圆。按 Shift + LEFT 会移动更远。"
      ], code: `scene.setOnKeyPressed(event -> {
    switch (event.getCode()) {
        case LEFT -> circle.setCenterX(circle.getCenterX()
                - (event.isShiftDown() ? 20 : 5));
        case RIGHT -> circle.setCenterX(circle.getCenterX() + 5);
        default -> { }
    }
});`, related: ["key-number", "key-character", "key-focus"] },
    { id: "key-number", group: "键盘与输入", title: "数字键转 int · 主键区和小键盘",
      keywords: "数字键盘转化为数字 数字键盘转数字 数字键盘转为数字 键盘数字转int 小键盘数字 主键区 数字键转换 数字键转数字 KeyEvent KeyCode DIGIT0 DIGIT1 DIGIT9 NUMPAD0 NUMPAD1 NUMPAD9 Num Lock digit switch",
      notes: [
        "把 digitOf 方法放在类里，导入 javafx.scene.input.KeyCode。在 KEY_PRESSED 处理器中调用 int digit = digitOf(event.getCode());。主键区和小键盘的 3 都返回 int 3，其他按键返回 -1。",
        "关闭 Num Lock 后，小键盘可能产生方向键等导航事件，此时返回 -1。按键码识别的是键；如果要判断 Shift + 数字键实际输入的字符，请用 getCharacter()。",
        "每次事件只得到一位。输入多位数、小数点或负号时，可用 TextField 收集完整内容，再在提交时解析。"
      ], code: `private static int digitOf(KeyCode code) {
    return switch (code) {
        case DIGIT0, NUMPAD0 -> 0;
        case DIGIT1, NUMPAD1 -> 1;
        case DIGIT2, NUMPAD2 -> 2;
        case DIGIT3, NUMPAD3 -> 3;
        case DIGIT4, NUMPAD4 -> 4;
        case DIGIT5, NUMPAD5 -> 5;
        case DIGIT6, NUMPAD6 -> 6;
        case DIGIT7, NUMPAD7 -> 7;
        case DIGIT8, NUMPAD8 -> 8;
        case DIGIT9, NUMPAD9 -> 9;
        default -> -1;
    };
}`, related: ["key-code", "key-character", "parse-int"] },
    { id: "key-character", group: "键盘与输入", title: "getCharacter() 读取实际输入的字符",
      keywords: "键盘输入 字符转数字 字符转int key typed KEY_TYPED setOnKeyTyped KeyEvent charAt",
      notes: [
        "用 setOnKeyTyped 接收实际输入的字符。getCharacter() 返回 String。修饰键和键盘布局可能改变输入的字符。",
        "示例放在 start()。仅收到一个 0–9 字符时，减去 '0' 得到整数。涉及输入法、粘贴或编辑完整字符串时，用 TextField.getText() 读取最终内容。"
      ], code: `scene.setOnKeyTyped(event -> {
    String text = event.getCharacter();
    if (text.length() == 1 && text.charAt(0) >= '0' && text.charAt(0) <= '9') {
        int digit = text.charAt(0) - '0';
        System.out.println(digit);
    }
});`, related: ["key-code", "key-number", "parse-int"] },
    { id: "key-focus", group: "键盘与输入", title: "键盘焦点与 requestFocus()",
      keywords: "按键不响应 没反应 键盘焦点 focus focusTraversable setFocusTraversable setOnKeyPressed Tab Scene Pane",
      notes: [
        "键盘事件先送往获得焦点的节点，再沿事件路径传播。给画布注册按键事件时，可让它参与焦点切换，并在窗口显示后申请焦点。",
        "示例放在 start()。canvas 已放入 stage 的 Scene，circle 在画布上。点击画布可以取回焦点。"
      ], code: `canvas.setFocusTraversable(true);
canvas.setOnMouseClicked(event -> canvas.requestFocus());
canvas.setOnKeyPressed(event -> {
    if (event.getCode() == javafx.scene.input.KeyCode.SPACE) {
        circle.setRadius(circle.getRadius() + 5);
    }
});
stage.show();
canvas.requestFocus();`, related: ["key-code", "event-filter"] },
    { id: "parse-int", group: "键盘与输入", title: "TextField 转 int · Integer.parseInt()",
      keywords: "输入框取整数 文本转整数 字符串转数字 TextField.getText Integer.parseInt parse int 数字 NumberFormatException trim 验证",
      notes: [
        "在按钮事件或输入框回车事件中读取 getText().trim()，再用 Integer.parseInt() 转十进制整数。空字符串、小数、字母和超出 int 范围的数字会抛出 NumberFormatException。",
        "转换成功后再检查业务范围。示例放在 start()，field 是 TextField，apply 是 Button，status 是 Label。"
      ], code: `apply.setOnAction(event -> {
    try {
        int mark = Integer.parseInt(field.getText().trim());
        if (mark < 0 || mark > 100) {
            status.setText("Mark must be 0-100");
            return;
        }
        status.setText("Mark: " + mark);
    } catch (NumberFormatException ex) {
        status.setText("Enter a whole number");
    }
});`, related: ["parse-double", "text-formatter", "shared-handler"] },
    { id: "parse-double", group: "键盘与输入", title: "TextField 转 double · Double.parseDouble()",
      keywords: "小数 浮点数 输入框 字符串转数字 Double.parseDouble TextField.getText finite isFinite NaN Infinity NumberFormatException",
      notes: [
        "用 Double.parseDouble() 解析小数。它也接受 NaN 和 Infinity 等特殊值，读半径、价格等数值时用 Double.isFinite() 检查。",
        "示例放在事件处理器中。field 是 TextField，status 是 Label，circle 是 Circle。输入无效时保留原半径。"
      ], code: `try {
    double radius = Double.parseDouble(field.getText().trim());
    if (Double.isFinite(radius) && radius > 0) {
        circle.setRadius(radius);
    } else {
        status.setText("Invalid radius");
    }
} catch (NumberFormatException ex) {
    status.setText("Invalid radius");
}`, related: ["parse-int", "text-formatter"] },
    { id: "text-formatter", group: "键盘与输入", title: "TextFormatter 限制输入字符",
      keywords: "输入过滤 只能输入数字 粘贴 正则 TextFormatter getControlNewText setTextFormatter",
      notes: [
        "TextFormatter 的过滤函数能看到修改后的整段文字。返回 change 接受修改，返回 null 拒绝。这里允许空串，以便删除并重新输入。",
        "片段放在 start()，field 是 TextField。提交时仍须校验空值、溢出和范围。每个输入框需要独立的 formatter。"
      ], code: `field.setTextFormatter(new javafx.scene.control.TextFormatter<String>(change ->
    change.getControlNewText().matches("[0-9]*") ? change : null
));`, related: ["parse-int", "parse-double"] },

    { id: "action-handler", group: "事件与交互", title: "EventHandler<ActionEvent> 与 setOnAction()",
      keywords: "事件处理器 接口 按钮回车 Button TextField ActionEvent EventHandler handle lambda Lambda表达式 匿名内部类 动作",
      notes: [
        "EventHandler<T> 是事件处理接口。实现 handle(T event)，再把处理器注册到触发事件的控件。按钮点击和 TextField 按 Enter 都能产生 ActionEvent。只有一个抽象方法，因而可以用 Lambda 实现。",
        "示例放在 start()，导入 javafx.event.ActionEvent 和 EventHandler。apply 是 Button，status 是 Label。再次调用同一控件的 setOnAction() 会替换已有处理器。"
      ], code: `EventHandler<ActionEvent> handler = new EventHandler<>() {
    @Override
    public void handle(ActionEvent event) {
        status.setText("Applied");
    }
};
apply.setOnAction(handler);`, related: ["shared-handler", "interface"] },
    { id: "shared-handler", group: "事件与交互", title: "共用事件处理器与 getSource()",
      keywords: "共用handler 共享处理器 事件来源 多个按钮 输入框回车 ActionEvent EventHandler getSource lambda",
      notes: [
        "把同一个 EventHandler 注册给多个控件，可以复用逻辑。需要区分来源时，比较 event.getSource() 和控件对象。",
        "示例放在 start()，导入 javafx.event.ActionEvent 和 EventHandler。apply 与 clear 是按钮，field 是 TextField，status 是 Label。"
      ], code: `EventHandler<ActionEvent> handler = event -> {
    if (event.getSource() == clear) {
        field.clear();
        status.setText("");
    } else {
        status.setText(field.getText());
    }
};
apply.setOnAction(handler);
clear.setOnAction(handler);
field.setOnAction(handler);`, related: ["action-handler", "parse-int"] },
    { id: "mouse-event", group: "事件与交互", title: "鼠标事件、左右键和坐标",
      keywords: "鼠标点击 拖拽 拖动 MouseEvent MouseButton setOnMouseClicked setOnMouseDragged setOnMousePressed getButton getX getY getSceneX sceneToLocal PRIMARY SECONDARY",
      notes: [
        "setOnMouseClicked 处理点击，setOnMouseDragged 接收按住鼠标移动的事件。点击时可用 getButton() 区分 PRIMARY 与 SECONDARY。",
        "getSceneX()/getSceneY() 是场景坐标。把坐标转成 canvas 的坐标后再移动圆，即使点到画布子节点也适用。示例放在 start()，导入 javafx.scene.input.MouseButton。"
      ], code: `canvas.setOnMouseClicked(event -> {
    if (event.getButton() == MouseButton.PRIMARY) {
        var point = canvas.sceneToLocal(event.getSceneX(), event.getSceneY());
        circle.setCenterX(point.getX());
        circle.setCenterY(point.getY());
    }
});`, related: ["shape-position", "event-filter"] },
    { id: "event-filter", group: "事件与交互", title: "addEventFilter() 与 consume()",
      keywords: "事件传播 捕获 冒泡 消费 拦截 快捷键 addEventHandler addEventFilter consume KEY_PRESSED",
      notes: [
        "过滤器在事件往目标传递时执行，处理器通常在事件从目标往回传播时执行。消费事件会停止它沿事件路径继续传播。",
        "示例在 start() 给 scene 注册 Escape 快捷键，status 是 Label。导入 javafx.scene.input.KeyEvent 和 KeyCode。仅消费已经处理的按键。"
      ], code: `scene.addEventFilter(KeyEvent.KEY_PRESSED, event -> {
    if (event.getCode() == KeyCode.ESCAPE) {
        status.setText("Cancelled");
        event.consume();
    }
});`, related: ["key-focus", "close-request"] },
    { id: "close-request", group: "事件与交互", title: "关闭确认 · setOnCloseRequest()",
      keywords: "关窗 关闭窗口 确认框 Alert CONFIRMATION ButtonType showAndWait Optional WindowEvent setOnCloseRequest consume",
      notes: [
        "setOnCloseRequest() 接收窗口关闭请求。调用 consume() 会阻止默认关闭。Alert.showAndWait() 返回 Optional<ButtonType>，可用 orElse 处理没有返回按钮的情况。",
        "示例放在 start()，导入 javafx.scene.control.Alert 和 ButtonType。用户确认才让关闭请求继续。"
      ], code: `stage.setOnCloseRequest(event -> {
    Alert prompt = new Alert(Alert.AlertType.CONFIRMATION, "Close the window?");
    if (prompt.showAndWait().orElse(ButtonType.CANCEL) != ButtonType.OK) {
        event.consume();
    }
});`, related: ["event-filter", "alert"] },
    { id: "timeline", group: "事件与交互", title: "Timeline 与 KeyFrame 定时动作",
      keywords: "动画 定时器 计时器 Timeline KeyFrame Duration millis setCycleCount INDEFINITE play pause stop",
      notes: [
        "KeyFrame 设定到达指定时间时运行的动作。play() 开始或继续，pause() 暂停并保留进度，stop() 停止并重置播放位置。图形位置或计数等业务数据要按需自行重置。",
        "示例放在 start()。导入 javafx.animation.Timeline、KeyFrame 和 javafx.util.Duration。使用三个已创建的按钮与画布上的 circle。"
      ], code: `Timeline timer = new Timeline(new KeyFrame(Duration.millis(100),
        event -> circle.setCenterX(circle.getCenterX() + 5)));
timer.setCycleCount(Timeline.INDEFINITE);
startButton.setOnAction(event -> timer.play());
pauseButton.setOnAction(event -> timer.pause());
resetButton.setOnAction(event -> {
    timer.stop();
    circle.setCenterX(40);
});`, related: ["shape-position", "action-handler"] },

    { id: "interface", group: "类与接口", title: "定义和实现接口 · interface / implements",
      keywords: "接口怎么用 自定义接口 实现接口 implements interface 接口方法 抽象方法 多态 Drawable draw 类",
      notes: [
        "接口声明调用方可以使用的方法。类用 implements 实现接口。void draw(Pane pane) 这样的接口方法隐式为 public abstract，具体类实现时须声明 public。",
        "下面两个类型可放在同一文件的类外声明区，导入 javafx.scene.layout.Pane 和 javafx.scene.shape.Circle。在 start() 中执行 Drawable item = new Dot(); 和 item.draw(canvas);。"
      ], code: `interface Drawable {
    void draw(Pane pane);
}

class Dot implements Drawable {
    @Override
    public void draw(Pane pane) {
        pane.getChildren().add(new Circle(50, 50, 10));
    }
}`, related: ["inheritance", "polymorphism", "action-handler"] },
    { id: "inheritance", group: "类与接口", title: "抽象类、extends、super 和 @Override",
      keywords: "继承 抽象类 抽象方法 重写 构造器 父类 子类 extends implements super override public protected private",
      notes: [
        "抽象类可保存字段、提供已实现的方法，也可以留下抽象方法。子类用 extends 继承，具体子类须实现未实现的抽象方法。",
        "子类构造器里的 super(...) 调用父类构造器，在 Java 17 中必须是第一条语句。写 @Override 让编译器检查签名。下面两个类型放在类外声明区。"
      ], code: `abstract class BaseShape {
    protected final String name;
    BaseShape(String name) { this.name = name; }
    public abstract double area();
}

class Square extends BaseShape {
    private final double side;
    Square(double side) {
        super("Square");
        this.side = side;
    }

    @Override
    public double area() { return side * side; }
}`, related: ["interface", "polymorphism"] },
    { id: "polymorphism", group: "类与接口", title: "多态 · 用接口类型保存不同对象",
      keywords: "接口多态 ArrayList<Drawable> 父类引用 接口引用 子类 instanceof 动态绑定",
      notes: [
        "用接口作变量、参数或集合的元素类型。调用接口方法时，运行时根据实际对象执行对应实现。",
        "示例放在 start()。Dot 和 Tile 都是已经实现 Drawable 的类。导入 java.util.ArrayList。"
      ], code: `ArrayList<Drawable> shapes = new ArrayList<>();
shapes.add(new Dot());
shapes.add(new Tile());
for (Drawable shape : shapes) {
    shape.draw(canvas);
}`, related: ["interface", "array-list"] },
    { id: "getter-setter", group: "类与接口", title: "private 字段、构造器和 getter / setter",
      keywords: "封装 构造函数 this getter setter isAvailable getTitle setTitle 对象 Book private constructor",
      notes: [
        "构造器初始化字段，getter 供外部读取，setter 可在改变字段前校验。boolean 字段的 getter 常用 is 开头。",
        "这个 Book 类型可放在类外声明区或单独的 Book.java。this.title 表示字段，title 表示参数。"
      ], code: `class Book {
    private final String title;
    private boolean available = true;

    Book(String title) { this.title = title; }
    String getTitle() { return title; }
    boolean isAvailable() { return available; }
    void setAvailable(boolean available) {
        this.available = available;
    }
}`, related: ["interface", "listview", "library-class"] },
    { id: "library-class", group: "类与接口", title: "Library 类 · 封装 ArrayList，找不到返回 null",
      keywords: "Library 图书馆类 Library类 图书类操作 管理类 封装列表 findBook addBook borrowBook returnBook deleteBook 找不到 返回null 返回boolean 重复主键 ISBN getBooks 副本",
      notes: [
        "把 ArrayList 设为 private，增删查借还都写成方法：查找时找不到返回 null，修改类操作返回 boolean 表示是否成功。界面只调用这些方法，根据返回值显示提示，成功时才刷新列表。",
        "下面的类型放在单独的 Library.java 或类外声明区，导入 java.util.ArrayList。Book 提供 getIsbn()、isAvailable() 和 setAvailable()。getBooks() 返回副本，外部修改副本不影响图书馆。returnBook、deleteBook 按同样的结构写。"
      ], code: `class Library {
    private final ArrayList<Book> books = new ArrayList<>();

    Book findBook(String isbn) {
        for (Book book : books) {
            if (book.getIsbn().equals(isbn)) {
                return book;
            }
        }
        return null;
    }

    boolean addBook(Book book) {
        if (findBook(book.getIsbn()) != null) {
            return false;   // ISBN 重复
        }
        books.add(book);
        return true;
    }

    boolean borrowBook(String isbn) {
        Book book = findBook(isbn);
        if (book == null || !book.isAvailable()) {
            return false;
        }
        book.setAvailable(false);
        return true;
    }

    ArrayList<Book> getBooks() {
        return new ArrayList<>(books);
    }
}`, related: ["getter-setter", "array-list", "string-match"] },
    { id: "compare", group: "类与接口", title: "Comparable 和 Comparator 如何选",
      keywords: "比较接口 自定义排序 compare compareTo Comparator Comparable comparing thenComparing reversed 升序 降序",
      notes: [
        "Comparable<T> 的 compareTo(T other) 定义自然顺序。Comparator<T> 的 compare(T a, T b) 由调用方按场景提供。返回负数表示第一个在前，0 表示顺序相同，正数表示第一个在后。",
        "示例中 books 是可修改的图书列表，Book 提供 getTitle() 和 getIsbn()。先按书名忽略大小写排序，再按 ISBN 排同名图书。导入 java.util.Comparator。"
      ], code: `books.sort(Comparator.comparing(Book::getTitle, String.CASE_INSENSITIVE_ORDER)
        .thenComparing(Book::getIsbn));`, related: ["array-list", "string-match"] },

    { id: "stage-scene", group: "控件与布局", title: "Application、Stage 与 Scene",
      keywords: "窗口 场景 根节点 Application launch start Stage Scene setTitle setScene show 第二个窗口",
      notes: [
        "应用类继承 Application，重写 start(Stage stage)。Stage 是窗口，Scene 持有根节点。先设置 Scene，再调用 show()。第二个窗口可另建 Stage 并设置自己的 Scene。",
        "下面是 start() 的实现。导入 javafx.stage.Stage、javafx.scene.Scene、javafx.scene.control.Button 和 javafx.scene.layout.StackPane。"
      ], code: `@Override
public void start(Stage stage) {
    StackPane root = new StackPane(new Button("OK"));
    stage.setTitle("Demo");
    stage.setScene(new Scene(root, 360, 180));
    stage.show();
}`, related: ["layout", "close-request", "second-stage"] },
    { id: "second-stage", group: "控件与布局", title: "第二个窗口 · 新建 Stage 并只打开一个",
      keywords: "第二个窗口 第二个Stage 打开新窗口 新窗口 设置窗口 弹出窗口 多窗口 只能打开一个 Stage initOwner initModality Modality isShowing toFront close 跨窗口 更新主窗口 Label",
      notes: [
        "再 new 一个 Stage 并设置它自己的 Scene，就是第二个窗口。把它存进字段，打开前先检查 isShowing()：已经打开就 toFront() 后返回，保证最多只有一个。initOwner() 让它属于主窗口；要求先关掉它才能操作主窗口时，再加 initModality(Modality.WINDOW_MODAL)。",
        "字段和方法放在类里、start() 外。在 start() 中写 openButton.setOnAction(event -> openSettings(stage, welcome));，welcome 是主窗口的 Label。第二个窗口的按钮直接修改它，然后用 close() 关闭自己；名字为空时只显示提示，窗口保持打开。"
      ], code: `private Stage settings;   // 已打开的设置窗口；还没打开时为 null

private void openSettings(Stage owner, Label welcome) {
    if (settings != null && settings.isShowing()) {
        settings.toFront();
        return;
    }
    TextField name = new TextField();
    Label error = new Label();
    Button save = new Button("Save");
    Stage window = new Stage();
    save.setOnAction(event -> {
        String text = name.getText().trim();
        if (text.isEmpty()) {
            error.setText("Invalid name");
        } else {
            welcome.setText("Welcome, " + text);
            window.close();
        }
    });
    window.setTitle("Settings");
    window.initOwner(owner);
    window.setScene(new Scene(new VBox(8, name, save, error), 240, 140));
    settings = window;
    window.show();
}`, related: ["stage-scene", "close-request", "action-handler"] },
    { id: "layout", group: "控件与布局", title: "BorderPane、HBox、VBox、FlowPane 布局",
      keywords: "布局容器 面板 上下左右中 横排 竖排 自动换行 BorderPane HBox VBox StackPane FlowPane Pane setCenter getChildren Insets",
      notes: [
        "BorderPane 分成上、下、左、右、中五个区域。HBox 横排，VBox 竖排，StackPane 默认居中叠放，FlowPane 空间不足时自动换行，Pane 适合按坐标放图形。",
        "示例放在 start()。导入 javafx.scene.layout 中使用的容器及 javafx.geometry.Insets。已有 canvas、add、clear 和 status。"
      ], code: `HBox buttons = new HBox(8, add, clear);
buttons.setPadding(new Insets(10));
BorderPane root = new BorderPane(canvas);
root.setLeft(new VBox(6, status));
root.setBottom(buttons);`, related: ["flow-pane", "stage-scene"] },
    { id: "flow-pane", group: "控件与布局", title: "运行时给 FlowPane 添加或移除控件",
      keywords: "动态FlowPane 动态控件 标签 重复标签 运行时创建 getChildren add removeAll new Label 换行",
      notes: [
        "每次点击创建一个新的 Label，即使文字相同也能成为两个节点。同一个节点对象只能在容器中出现一次。",
        "示例放在 start()。tags 是 FlowPane，input 是 TextField，add 是 Button。导入 javafx.scene.control.Label。需要移除某个标签时，保留其引用并传给 tags.getChildren().remove(...)。"
      ], code: `add.setOnAction(event -> {
    String text = input.getText().trim();
    if (!text.isEmpty()) {
        tags.getChildren().add(new Label(text));
    }
});`, related: ["layout", "action-handler"] },
    { id: "listview", group: "控件与布局", title: "ListView 选中项、监听与刷新",
      keywords: "列表选择 ListView getItems setAll ObservableList getSelectionModel getSelectedItem selectedItemProperty addListener",
      notes: [
        "getSelectionModel().getSelectedItem() 获取选中的数据，未选中时返回 null。selectedItemProperty() 可监听鼠标和键盘引起的选择变化。setAll() 替换内容时，选择也可能改变。",
        "示例放在 start()。list 是 ListView<Book>，books 是 Book 集合，titleField 是 TextField。Book 提供 getTitle()。"
      ], code: `list.getItems().setAll(books);
list.getSelectionModel().selectedItemProperty().addListener((obs, oldBook, book) ->
        titleField.setText(book == null ? "" : book.getTitle()));`, related: ["array-list", "getter-setter", "listener", "edit-cancel"] },
    { id: "edit-cancel", group: "控件与布局", title: "编辑、保存与取消 · 恢复未保存的输入",
      keywords: "取消编辑 编辑取消 放弃修改 编辑 修改记录 保存 取消 Cancel 撤销 恢复 丢弃 未保存 选中行 填入输入框 ListView refresh setTitle 编辑模式",
      notes: [
        "选中一行时，把记录里已保存的值填进输入框。Save 才把输入框的内容写回记录（需要时再写文件）；Cancel 只用记录里的值重新填写输入框，不改记录，也不写文件。",
        "示例放在 start()。list 是 ListView<Book>，titleField 是 TextField，save 和 cancel 是 Button，Book 有 getTitle() 和 setTitle()。记录的字段变了而列表元素没有替换时，调用 list.refresh() 让 ListView 重新显示。"
      ], code: `list.getSelectionModel().selectedItemProperty().addListener((obs, oldBook, book) -> {
    if (book != null) {
        titleField.setText(book.getTitle());   // 选中时填入已保存的值
    }
});
save.setOnAction(event -> {
    Book book = list.getSelectionModel().getSelectedItem();
    if (book != null) {
        book.setTitle(titleField.getText().trim());
        list.refresh();
    }
});
cancel.setOnAction(event -> {
    Book book = list.getSelectionModel().getSelectedItem();
    titleField.setText(book == null ? "" : book.getTitle());   // 丢弃未保存的输入
});`, related: ["listview", "getter-setter", "write-file"] },
    { id: "toggle", group: "控件与布局", title: "RadioButton、ToggleGroup 与 CheckBox",
      keywords: "单选框 单选按钮 复选框 ToggleGroup CheckBox RadioButton isSelected getSelectedToggle setToggleGroup",
      notes: [
        "同组的 RadioButton 通过 ToggleGroup 实现互斥。CheckBox 通常独立选择。用 isSelected() 读取布尔值，用 getSelectedToggle() 查组内选项，未选择时可能返回 null。",
        "示例放在 start()。导入 javafx.scene.control.ToggleGroup。red、green 是 RadioButton，showFrame 是 CheckBox，frame 是图形。"
      ], code: `ToggleGroup colors = new ToggleGroup();
red.setToggleGroup(colors);
green.setToggleGroup(colors);
red.setSelected(true);
frame.visibleProperty().bind(showFrame.selectedProperty());`, related: ["binding", "action-handler"] },
    { id: "combo-box", group: "控件与布局", title: "ComboBox 下拉选择及 getValue()",
      keywords: "下拉框 下拉列表 ComboBox addAll getItems getValue setValue valueProperty setOnAction ChoiceBox",
      notes: [
        "getItems() 管理可选项。用 getValue() 读取当前值，未选时可能为 null。setOnAction() 处理值变化引发的动作，valueProperty() 也可以用来监听。",
        "示例放在 start()，mode 是 ComboBox<String>，status 是 Label。"
      ], code: `mode.getItems().setAll("Add", "Edit", "Delete");
mode.setValue("Add");
mode.setOnAction(event -> {
    String selected = mode.getValue();
    status.setText(selected == null ? "Select a mode" : selected);
});`, related: ["listview", "listener"] },
    { id: "alert", group: "控件与布局", title: "Alert 错误提示和确认对话框",
      keywords: "弹窗 Alert AlertType ERROR INFORMATION WARNING CONFIRMATION show showAndWait ButtonType",
      notes: [
        "错误提示用 Alert.AlertType.ERROR，普通信息用 INFORMATION，询问用户用 CONFIRMATION。show() 立即返回，showAndWait() 等待对话框关闭。",
        "示例放在 JavaFX 事件处理器中。导入 javafx.scene.control.Alert。需要判断确认结果时参见关闭确认。"
      ], code: `Alert alert = new Alert(Alert.AlertType.ERROR);
alert.setTitle("Input error");
alert.setHeaderText(null);
alert.setContentText("Please enter a valid number.");
alert.showAndWait();`, related: ["close-request", "parse-int"] },

    { id: "shape-position", group: "图形与绑定", title: "图形坐标、颜色和移动",
      keywords: "画圆 正方形 Rectangle Circle centerX centerY x y radius setCenterX getCenterX setFill Color.rgb setX 坐标 颜色",
      notes: [
        "Circle 的 centerX、centerY 表示圆心，Rectangle 的 x、y 表示左上角。JavaFX 默认原点在左上角，x 向右增加，y 向下增加。",
        "示例放在 start()。canvas 是 Pane，moveUp 是 Button，导入 javafx.scene.shape.Circle 和 javafx.scene.paint.Color。向上移动时减小 y。"
      ], code: `Circle dot = new Circle(100, 80, 20);
dot.setFill(Color.rgb(0, 120, 255));
canvas.getChildren().add(dot);
moveUp.setOnAction(event -> dot.setCenterY(dot.getCenterY() - 10));`, related: ["binding", "mouse-event"] },
    { id: "binding", group: "图形与绑定", title: "属性绑定 · bind() / unbind()",
      keywords: "属性绑定 自动更新 窗口缩放 圆心居中 bind unbind widthProperty heightProperty centerXProperty divide addListener A bound value cannot be set",
      notes: [
        "单向 bind() 让目标属性随来源变化。下面例子让圆心始终保持在 canvas 的中心。要改回手动移动，先对目标属性调用 unbind()。",
        "示例放在 start()。circle 是 Circle，canvas 是 Pane。需要在变化时执行动作，可使用 addListener()。"
      ], code: `circle.centerXProperty().bind(canvas.widthProperty().divide(2));
circle.centerYProperty().bind(canvas.heightProperty().divide(2));
// 改回手动定位前，对需要移动的坐标调用 unbind()。`, related: ["shape-position", "listener"] },
    { id: "listener", group: "图形与绑定", title: "addListener() 监听属性变化",
      keywords: "ChangeListener ObservableValue oldValue newValue addListener removeListener textProperty 监听 输入变化 属性改变",
      notes: [
        "ChangeListener<T> 接收属性对象、旧值和新值。addListener() 每次变化都会执行，可用于实时更新提示或启用状态。",
        "示例放在 start()。field 是 TextField，count 是 Label。若之后需要移除监听器，先把它存入变量，再传给 removeListener()。"
      ], code: `field.textProperty().addListener((observable, oldText, text) -> {
    count.setText("Length: " + text.length());
});`, related: ["binding", "listview", "text-formatter"] },
    { id: "image", group: "图形与绑定", title: "ImageView 加载本地图像",
      keywords: "离线图片 本地图片 文件路径 Image ImageView setFitWidth setPreserveRatio toUri isError",
      notes: [
        "Image 读取图像，ImageView 显示它。用 Path.toUri() 将本地路径转成 URL，可正确处理路径中的空格。相对路径从程序的工作目录解析。",
        "示例放在 start()。导入 javafx.scene.image.Image、ImageView 和 java.nio.file.Path。imageBox 是布局容器，status 是 Label。"
      ], code: `Image photo = new Image(Path.of("images", "logo.png").toUri().toString());
if (photo.isError()) {
    status.setText("Image unavailable");
} else {
    ImageView view = new ImageView(photo);
    view.setFitWidth(200);
    view.setPreserveRatio(true);
    imageBox.getChildren().add(view);
}`, related: ["layout", "read-file"] },

    { id: "array-list", group: "集合与文件", title: "ArrayList 增删、查找与遍历",
      keywords: "ArrayList 集合 List add set remove removeIf for循环 foreach 泛型 查找 ISBN 删除 ConcurrentModificationException",
      notes: [
        "add() 追加元素，set(index, value) 替换元素，remove(index) 按下标删。增强 for 适合读取数据。遍历时要删除元素，使用 removeIf() 或 Iterator.remove()。",
        "示例放在持有 books 的方法中。books 是 ArrayList<Book>，Book 有 getIsbn()，targetIsbn 是要删除的 ISBN，list 是 ListView<Book>。removeIf() 会删除所有匹配项。"
      ], code: `boolean removed = books.removeIf(book -> book.getIsbn().equals(targetIsbn));
if (removed) {
    list.getItems().setAll(books);
}`, related: ["listview", "string-match", "compare", "library-class", "string-list"] },
    { id: "string-list", group: "集合与文件", title: "ArrayList<String> 保存文字 · TextArea 显示全部",
      keywords: "ArrayList<String> 字符串列表 笔记 文本列表 TextArea String.join 多行显示 添加 空输入 Empty setText setEditable 换行",
      notes: [
        "只需要保存一段段文字时，用 ArrayList<String>，不必另写记录类。String.join(\"\\n\", notes) 把元素接成一行一条的文字，交给 TextArea.setText() 显示；setEditable(false) 让 TextArea 只读。",
        "把 notes 设为字段，Add、Save、Load、Clear 都能使用它。示例方法放在类里，在 start() 中写 addButton.setOnAction(event -> addNote(input, area, status));。Clear 只需 notes.clear() 再刷新 TextArea，不改文件。"
      ], code: `private final ArrayList<String> notes = new ArrayList<>();

private void addNote(TextField input, TextArea area, Label status) {
    String text = input.getText().trim();
    if (text.isEmpty()) {
        status.setText("Empty note");
        return;
    }
    notes.add(text);
    area.setText(String.join("\\n", notes));
    input.clear();
}`, related: ["array-list", "missing-file", "write-file"] },
    { id: "string-match", group: "集合与文件", title: "字符串比较、部分搜索和空白检查",
      keywords: "字符串比较 忽略大小写 关键词搜索 equals equalsIgnoreCase contains trim strip isBlank Locale.ROOT",
      notes: [
        "equals() 比较文本内容，equalsIgnoreCase() 用于忽略大小写的相等判断。contains() 做部分匹配，忽略大小写时可在 Locale.ROOT 下统一转换。isBlank() 能判断空串和只含空白的字符串。",
        "示例放在搜索方法中。导入 java.util.Locale。search 和 title 是 String。"
      ], code: `String keyword = search.strip().toLowerCase(Locale.ROOT);
boolean match = !keyword.isBlank()
        && title.toLowerCase(Locale.ROOT).contains(keyword);`, related: ["array-list", "compare"] },
    { id: "number-format", group: "集合与文件", title: "String.format() 显示两位小数",
      keywords: "格式化 保留两位 小数 四舍五入 printf String.format Locale.ROOT %d %.2f %s",
      notes: [
        "%.2f 把浮点数格式化为两位小数，%d 用于整数，%s 用于字符串。计算仍可以使用原始数值。",
        "示例中的 area 是 double，status 是 Label。Locale.ROOT 让小数点显示为 .，便于和题目输出比对。"
      ], code: `status.setText(String.format(java.util.Locale.ROOT, "Area: %.2f", area));`,
      related: ["parse-double", "shape-position"] },
    { id: "read-file", group: "集合与文件", title: "读取 UTF-8 文本 · Files / Scanner",
      keywords: "文件读取 文本按行 试题数据 文件不存在 IOException NoSuchFileException readAllLines BufferedReader Scanner nextLine hasNextLine try-with-resources UTF-8",
      notes: [
        "小文本可用 Files.readAllLines(Path) 一次读取，默认 UTF-8。逐行读取可用 Files.newBufferedReader 或 Scanner 的 hasNextLine() / nextLine()，将资源放在 try-with-resources 中自动关闭。",
        "示例放在读取方法中，调用方处理或继续抛出 IOException。导入 java.nio.file.Files 和 Path。加载业务记录时，先读完并校验全部行，再替换原有数据。"
      ], code: `for (String line : Files.readAllLines(Path.of("books.txt"))) {
    if (!line.isBlank()) {
        System.out.println(line);
    }
}`, related: ["write-file", "split-fields", "missing-file"] },
    { id: "missing-file", group: "集合与文件", title: "文件不存在时 · Files.exists() 与空列表",
      keywords: "文件不存在 文件找不到 第一次运行 没有文件 File not found NoSuchFileException Files.exists 空列表 读取失败 加载 Load 启动时读取",
      notes: [
        "第一次运行时，数据文件往往还不存在。读取前用 Files.exists() 判断：不存在时返回空列表（启动时读取），或显示提示（点 Load 时），不要让异常中断程序。",
        "示例方法放在类里，导入 java.util.ArrayList、java.io.IOException 和 java.nio.file.Files、Path，调用方处理 IOException。先读进新列表，读取成功后再替换原有数据，读到一半出错时原数据保持不变。按钮中可写：if (!Files.exists(Path.of(\"notes.txt\"))) { status.setText(\"File not found\"); return; }"
      ], code: `private static ArrayList<String> loadLines(String filename) throws IOException {
    ArrayList<String> lines = new ArrayList<>();
    Path file = Path.of(filename);
    if (!Files.exists(file)) {
        return lines;   // 还没有文件：从空列表开始
    }
    for (String line : Files.readAllLines(file)) {
        if (!line.isBlank()) {
            lines.add(line.trim());
        }
    }
    return lines;
}`, related: ["read-file", "string-list", "static-save"] },
    { id: "write-file", group: "集合与文件", title: "写入 UTF-8 文本 · 覆盖与追加",
      keywords: "本地保存 写文件 BufferedWriter PrintWriter Files.newBufferedWriter StandardOpenOption APPEND CREATE 覆盖写入 UTF-8 IOException AutoCloseable try-with-resources",
      notes: [
        "Files.newBufferedWriter(Path) 默认用 UTF-8 覆盖写入。需要追加时，打开文件时传入 StandardOpenOption.CREATE 与 APPEND。实现了 AutoCloseable 的资源可交给 try-with-resources 自动关闭。",
        "示例放在保存方法。导入 java.io.BufferedWriter、IOException 和 java.nio.file.Files、Path。rows 是已序列化好的记录行，status 是 Label。"
      ], code: `try (BufferedWriter out = Files.newBufferedWriter(Path.of("books.txt"))) {
    for (String row : rows) {
        out.write(row);
        out.newLine();
    }
} catch (IOException ex) {
    status.setText("Cannot save books.txt");
    return;
}
status.setText("Saved");`, related: ["read-file", "split-fields", "static-save"] },
    { id: "static-save", group: "集合与文件", title: "static 文件方法 · throws IOException 交给调用方",
      keywords: "static 静态方法 工具类 FileManager LibraryFileManager save load throws IOException 抛出异常 类名调用 不用new try-with-resources",
      notes: [
        "static 方法属于类本身，用类名调用，例如 BookFiles.save(books, \"books.txt\")，不需要先 new 对象。签名写了 throws IOException 时，方法内部可以不 catch，异常交给调用方处理；try-with-resources 仍会关闭文件。",
        "下面的类型放在单独的 BookFiles.java 或类外声明区，导入 java.util.ArrayList、java.io.BufferedWriter、IOException 和 java.nio.file.Files、Path。Book 提供 getIsbn()、getTitle() 和 isAvailable()。调用方写：try { BookFiles.save(books, \"books.txt\"); } catch (IOException ex) { status.setText(\"Cannot save\"); }"
      ], code: `class BookFiles {
    static void save(ArrayList<Book> books, String filename) throws IOException {
        try (BufferedWriter out = Files.newBufferedWriter(Path.of(filename))) {
            for (Book book : books) {
                out.write(book.getIsbn() + "," + book.getTitle() + "," + book.isAvailable());
                out.newLine();
            }
        }
    }
}`, related: ["write-file", "missing-file", "split-fields"] },
    { id: "split-fields", group: "集合与文件", title: "split() 拆字段、保留空列与 CSV",
      keywords: "split split(\",\", -1) 分隔符 CSV 分号 split正则 空字段 引号 Pattern.quote 严格校验 保存",
      notes: [
        "split() 的第一个参数是正则。如果分隔符可由用户选择，可用 Pattern.quote(delimiter)。第二个参数用 -1 保留尾部空列，便于检查缺失值。",
        "下面的片段放在读取方法内，调用方处理 IOException。若允许含逗号的书名用引号包裹，需使用支持引号和转义的 CSV 解析。"
      ], code: `String[] fields = line.split(",", -1);
if (fields.length != 3 || fields[0].isBlank() || fields[1].isBlank()) {
    throw new java.io.IOException("Invalid book record: " + line);
}`, related: ["read-file", "write-file"] },
    { id: "line", group: "图形与绑定", title: "Line 直线 · 两个端点、颜色、线宽、绑定端点",
      keywords: "直线 线段 画线 Line startX startY endX endY setStartX setEndX setStroke setStrokeWidth getStrokeDashArray 虚线 对角线 交叉线 ShowLine endXProperty bind",
      notes: [
        "new Line(startX, startY, endX, endY)：起点和终点四个数。Line 没有内部，只有线条：颜色用 setStroke，线宽用 setStrokeWidth（默认黑色、宽 1），setFill 对 Line 没有效果。",
        "移动一条线要同时改起点和终点（setStartX/setEndX…）。长度可以用 Math.hypot(endX - startX, endY - startY)。",
        "课件 ShowLine：端点绑定到 pane.widthProperty().subtract(10)，窗口缩放时对角线跟着变。只有绑定的端点会动。",
        "片段放在 start() 里，canvas 是一个 Pane。"
      ], code: `// Line(startX, startY, endX, endY): a segment between two points
Line diagonal = new Line(10, 10, 200, 150);
diagonal.setStroke(Color.RED);           // a Line has no fill: colour it with setStroke
diagonal.setStrokeWidth(3);
diagonal.getStrokeDashArray().addAll(10.0, 5.0);   // optional: dashed
canvas.getChildren().add(diagonal);

// Ends that follow the pane when the window is resized (Lecture 7 ShowLine)
Line cross = new Line(10, 10, 10, 10);
cross.endXProperty().bind(canvas.widthProperty().subtract(10));
cross.endYProperty().bind(canvas.heightProperty().subtract(10));
canvas.getChildren().add(cross);

// Move a line 15 pixels to the right: change both ends
diagonal.setStartX(diagonal.getStartX() + 15);
diagonal.setEndX(diagonal.getEndX() + 15);
double length = Math.hypot(diagonal.getEndX() - diagonal.getStartX(), diagonal.getEndY() - diagonal.getStartY());`, related: ["binding", "polygon", "shape-position"] },
    { id: "rectangle", group: "图形与绑定", title: "Rectangle 矩形 · 左上角、圆角、角点和中心计算",
      keywords: "矩形 正方形 圆角 Rectangle x y width height setArcWidth setArcHeight 左上角 右下角 中心 setRotate 旋转",
      notes: [
        "new Rectangle(x, y, width, height)：(x, y) 是左上角，不是中心。右下角 = (x + width, y + height)，中心 = (x + width/2, y + height/2)。",
        "圆角：setArcWidth / setArcHeight 是角上圆弧的横向 / 纵向直径，不改变矩形的宽高。",
        "要让正方形以 (cx, cy) 为中心：new Rectangle(cx - s/2, cy - s/2, s, s)。默认填充黑色，可用 setFill(null) 只留边框。"
      ], code: `Rectangle box = new Rectangle(25, 10, 60, 30);   // x, y = upper-left corner; width, height
box.setFill(Color.WHITE);
box.setStroke(Color.BLACK);
box.setArcWidth(15);                              // rounded corners
box.setArcHeight(25);
double right = box.getX() + box.getWidth();       // 85
double bottom = box.getY() + box.getHeight();     // 40
double centreX = box.getX() + box.getWidth() / 2; // 55
box.setRotate(45);                                // turns around its centre, clockwise
canvas.getChildren().add(box);

// A square of side 60 centred at (100, 100)
Rectangle square = new Rectangle(100 - 60 / 2.0, 100 - 60 / 2.0, 60, 60);
square.setFill(null);                             // outline only
square.setStroke(Color.BLUE);`, related: ["shape-position", "circle-ellipse"] },
    { id: "circle-ellipse", group: "图形与绑定", title: "Circle 与 Ellipse · 构造器、放大缩小、横纵半径",
      keywords: "圆 椭圆 Circle Ellipse centerX centerY radius radiusX radiusY setRadius 放大 缩小 enlarge shrink 随机颜色",
      notes: [
        "Circle(centerX, centerY, radius)、Circle(radius)、Circle(radius, fill)、Circle(cx, cy, r, fill)：圆心坐标，不是左上角。默认填充黑色。",
        "放大 / 缩小：setRadius(getRadius() ± 2)；缩小前检查不要小于 0（课件 shrink：r > 2 ? r - 2 : r）。上移 = centerY 减小。",
        "Ellipse(centerX, centerY, radiusX, radiusY)：radiusX 是横向半径，radiusY 是纵向半径；外框宽 2*radiusX、高 2*radiusY。"
      ], code: `Circle c1 = new Circle(100, 80, 30);              // centre (100, 80), radius 30, black
Circle c2 = new Circle(30, Color.ORANGE);         // radius and fill; centre (0, 0)
c1.setRadius(c1.getRadius() + 2);                 // enlarge
c1.setRadius(c1.getRadius() > 2 ? c1.getRadius() - 2 : c1.getRadius());   // shrink, never below 0
c1.setCenterY(c1.getCenterY() - 15);              // move up (y grows downward)

Ellipse e = new Ellipse(150, 100, 80, 40);        // centre, radiusX (horizontal), radiusY (vertical)
e.setFill(Color.WHITE);
e.setStroke(Color.color(Math.random(), Math.random(), Math.random()));   // random colour
e.setRotate(30);
canvas.getChildren().addAll(c1, c2, e);`, related: ["shape-position", "rectangle", "color"] },
    { id: "arc", group: "图形与绑定", title: "Arc 圆弧 · 起始角、扫过角度、OPEN / CHORD / ROUND",
      keywords: "圆弧 弧 扇形 Arc ArcType OPEN CHORD ROUND startAngle length 起始角 角度 逆时针 ShowArc",
      notes: [
        "Arc(centerX, centerY, radiusX, radiusY, startAngle, length)：从 startAngle 开始扫过 length 度，终点角 = start + length。",
        "0° 指向正东（右边），90° 正上；正角度是逆时针（和 setRotate 的方向相反），length 为负就顺时针扫。",
        "setType：OPEN 不封闭；CHORD 用直线连接两端；ROUND 两端连到圆心，是扇形。课件 ShowArc 四个弧的起始角依次加 90。"
      ], code: `// Arc(centreX, centreY, radiusX, radiusY, startAngle, length)
Arc pie = new Arc(150, 100, 80, 80, 30, 35);   // from 30 degrees, 35 degrees counterclockwise -> ends at 65
pie.setType(ArcType.ROUND);                    // pie slice
pie.setFill(Color.RED);

Arc open = new Arc(150, 100, 80, 80, 30 + 90, 35);
open.setType(ArcType.OPEN);                    // not closed
open.setFill(Color.WHITE);
open.setStroke(Color.BLACK);

Arc chord = new Arc(150, 100, 80, 80, 30 + 180, 35);
chord.setType(ArcType.CHORD);                  // the two ends joined by a straight line
chord.setFill(Color.GREEN);
canvas.getChildren().addAll(pie, open, chord);`, related: ["circle-ellipse", "polygon"] },
    { id: "polygon", group: "图形与绑定", title: "Polygon 与 Polyline · getPoints()、正多边形、正弦曲线",
      keywords: "多边形 三角形 六边形 折线 正弦 曲线 Polygon Polyline getPoints ObservableList<Double> Math.cos Math.sin 弧度 ShowPolygon SineFunctionPlotter",
      notes: [
        "Polygon 自动闭合（最后一点连回第一点）；Polyline 不闭合。点按 x0, y0, x1, y1… 的顺序放进 getPoints()，每个点占两个 double。",
        "getPoints() 是 ObservableList<Double>：add(10) 会编译错误，要写 add(10.0) 或 double 表达式。构造器 new Polygon(10, 10, 80, 10, …) 可以直接写整数。",
        "正 n 边形：角 θ = 2πi/n（弧度），x = cx + r·cosθ，y = cy − r·sinθ（屏幕 y 向下，所以用减号）。Math.sin / cos 的参数是弧度。"
      ], code: `Polygon triangle = new Polygon(10, 10, 80, 10, 45, 70);   // x0, y0, x1, y1, x2, y2 (closed)
triangle.setFill(Color.WHITE);
triangle.setStroke(Color.BLACK);

// Regular hexagon centred at (cx, cy)
Polygon hexagon = new Polygon();
double cx = 200, cy = 150, r = 60;
for (int i = 0; i < 6; i++) {
    hexagon.getPoints().add(cx + r * Math.cos(2 * Math.PI * i / 6));
    hexagon.getPoints().add(cy - r * Math.sin(2 * Math.PI * i / 6));   // minus: y grows downward
}

// Polyline: not closed, e.g. a sine curve (Lecture 7 SineFunctionPlotter)
Polyline wave = new Polyline();
for (int x = -170; x <= 170; x++) {
    wave.getPoints().add(x + 200.0);
    wave.getPoints().add(100 - 50 * Math.sin(x / 100.0 * 2 * Math.PI));
}
wave.setStroke(Color.RED);
canvas.getChildren().addAll(triangle, hexagon, wave);`, related: ["line", "resize-redraw"] },
    { id: "text-node", group: "图形与绑定", title: "Text 文字图形 · 基线坐标、换行、字体、下划线、删除线",
      keywords: "文字 文本 Text setText setX setY 基线 baseline 换行 \\n setFont setUnderline setStrikethrough setFill Label setTextFill ShowText",
      notes: [
        "new Text(x, y, \"...\")：(x, y) 是第一行文字基线的起点，不是左上角；所以 y 太小时文字会跑出窗口顶部。",
        "\\n 换行；setText 改内容，setX / setY 移动。Text 是 Shape，颜色用 setFill；Label 是 Control，颜色用 setTextFill。",
        "setUnderline(true) 下划线，setStrikethrough(true) 删除线；字体见「Font 字体」。"
      ], code: `Text t1 = new Text(20, 20, "Programming is fun");   // (x, y): start of the BASELINE, not the top
t1.setFont(Font.font("Courier", FontWeight.BOLD, FontPosture.ITALIC, 15));
Text t2 = new Text(60, 60, "Line 1\\nLine 2");        // \\n starts a new line
t2.setFill(Color.RED);                                // Text is a Shape: colour with setFill
t2.setUnderline(true);
t2.setStrikethrough(true);
t1.setText("Changed");                                // new content
t1.setX(t1.getX() + 10);                              // move
canvas.getChildren().addAll(t1, t2);
status.setTextFill(Color.RED);                        // a Label (Control) uses setTextFill`, related: ["font", "color"] },
    { id: "color", group: "图形与绑定", title: "Color 颜色 · 常量、new Color、Color.rgb、透明度、brighter / darker",
      keywords: "颜色 透明度 半透明 Color RED new Color Color.rgb Color.color opacity brighter darker 不可变 immutable setOpacity 随机颜色",
      notes: [
        "new Color(r, g, b, opacity) 和 Color.color(r, g, b) 的分量都是 0.0–1.0；Color.rgb(r, g, b) 是 0–255。透明度 0 = 完全透明，1 = 不透明。",
        "Color 不可变：c.darker() / c.brighter() 返回新颜色，c 本身不变，要用变量接住结果。透明度不变。",
        "node.setOpacity(0.5) 是整个节点半透明，和颜色的透明度是两回事。new Color(255, 0, 0, 1) 运行时会抛 IllegalArgumentException。"
      ], code: `Color c1 = Color.RED;                          // constant
Color c2 = new Color(0.2, 0.6, 0.8, 1.0);       // r, g, b, opacity: all 0.0 - 1.0
Color c3 = Color.color(0.2, 0.6, 0.8);          // same range, opaque
Color c4 = Color.rgb(255, 165, 0);              // r, g, b: 0 - 255
Color c5 = Color.rgb(255, 165, 0, 0.5);         // half transparent
Color dark = c4.darker();                       // a NEW colour; c4 is unchanged
c4 = c4.brighter();                             // keep the result to use it
Color random = Color.color(Math.random(), Math.random(), Math.random());
circle.setFill(c2);
circle.setStroke(c1);
circle.setOpacity(0.5);                         // the whole node`, related: ["text-node", "style-rotate"] },
    { id: "font", group: "图形与绑定", title: "Font 字体 · 字号、粗体斜体、FontWeight 数值、系统字体",
      keywords: "字体 字号 粗体 斜体 加粗 Font Font.font FontWeight BOLD NORMAL FontPosture ITALIC REGULAR getFontNames getFamilies setFont",
      notes: [
        "构造器只有两个：new Font(size)、new Font(name, size)。要粗体或斜体必须用 Font.font(name, FontWeight, FontPosture, size) 或 Font.font(name, FontWeight, size)。",
        "FontWeight：THIN 100、EXTRA_LIGHT 200、LIGHT 300、NORMAL 400、MEDIUM 500、SEMI_BOLD 600、BOLD 700、EXTRA_BOLD 800、BLACK 900。FontPosture 只有 REGULAR 和 ITALIC。",
        "Font 不可变。Font.getFontNames() / getFamilies() 列出系统字体（课件 FontListApp 放进 ListView）。Label、Button、Text 都有 setFont。"
      ], code: `Font f1 = new Font(20);                                   // size only
Font f2 = new Font("Arial", 20);                          // name, size
Font f3 = Font.font("Times New Roman", FontWeight.BOLD, FontPosture.ITALIC, 20);
Font f4 = Font.font("Arial", FontWeight.BOLD, 16);        // bold, not italic
status.setFont(f3);                                       // Label, Button and Text have setFont
apply.setFont(f4);
List<String> names = Font.getFontNames();                 // installed fonts
List<String> families = Font.getFamilies();`, related: ["text-node", "style-rotate"] },
    { id: "style-rotate", group: "图形与绑定", title: "setStyle（JavaFX CSS）与 setRotate 旋转",
      keywords: "样式 CSS setStyle -fx-fill -fx-stroke -fx-background-color -fx-border-color -fx-text-fill -fx-font-size 背景色 边框 旋转 setRotate getRotate 顺时针",
      notes: [
        "格式 \"-fx-属性: 值;\"，多个属性用分号隔开。写错的 CSS 不会编译错误，也不抛异常，只是被忽略。",
        "常用：-fx-background-color（背景）、-fx-border-color / -fx-border-width（边框）、-fx-fill / -fx-stroke（图形）、-fx-text-fill / -fx-font-size / -fx-font-weight（文字）。",
        "setRotate(角度) 绕节点中心旋转，正数顺时针；setRotate(30) 再 setRotate(45) 结果是 45，不会累加；要累加写 setRotate(getRotate() + 15)。"
      ], code: `// JavaFX CSS: "-fx-property: value;" pairs separated by semicolons
circle.setStyle("-fx-stroke: black; -fx-fill: red;");
status.setStyle("-fx-text-fill: blue; -fx-font-size: 18px; -fx-font-weight: bold;");
canvas.setStyle("-fx-background-color: white; -fx-border-color: gray; -fx-border-width: 2;");
apply.setStyle("-fx-background-color: lightgreen;");

// Rotation in degrees around the node's centre: positive = clockwise
frame.setRotate(45);
frame.setRotate(frame.getRotate() + 15);   // 15 more degrees`, related: ["color", "font"] },
    { id: "resize-redraw", group: "图形与绑定", title: "窗口缩放时重画 · 继承 Pane 并重写 setWidth / setHeight",
      keywords: "重画 重绘 缩放 窗口大小改变 resize repaint paint 重写 override setWidth setHeight super MyEllipse MyPolygon 继承Pane",
      notes: [
        "课件 MyEllipse / MyPolygon：自己的类 extends Pane，重写 setWidth / setHeight：先 super.setWidth(width) 保留 Pane 原来的行为，再调用 paint() 按新尺寸重画。",
        "paint() 里先 getChildren().clear() 去掉旧图形，否则越画越多。只是让圆居中这类简单情况，用属性绑定更简单。",
        "这是 Test 1 旧知识（继承 + 重写 + super）在 JavaFX 里的用法。"
      ], code: `class HexagonPane extends Pane {
    private void paint() {
        Polygon polygon = new Polygon();
        double cx = getWidth() / 2, cy = getHeight() / 2;
        double r = Math.min(getWidth(), getHeight()) * 0.4;
        for (int i = 0; i < 6; i++) {
            polygon.getPoints().add(cx + r * Math.cos(2 * i * Math.PI / 6));
            polygon.getPoints().add(cy - r * Math.sin(2 * i * Math.PI / 6));
        }
        polygon.setFill(Color.WHITE);
        polygon.setStroke(Color.BLACK);
        getChildren().clear();           // remove the old drawing first
        getChildren().add(polygon);
    }

    @Override
    public void setWidth(double width) {
        super.setWidth(width);           // keep what Pane does
        paint();
    }

    @Override
    public void setHeight(double height) {
        super.setHeight(height);
        paint();
    }
}
// In start(): Scene scene = new Scene(new HexagonPane(), 400, 400);`, related: ["polygon", "binding", "inheritance"] },
    { id: "insets-margin", group: "控件与布局", title: "Padding、spacing、margin 与对齐 · Insets、Pos、setMargin",
      keywords: "内边距 外边距 间距 留白 对齐 居中 Insets setPadding spacing setSpacing setMargin setAlignment Pos CENTER TOP_LEFT hgap vgap Orientation",
      notes: [
        "padding：容器内部留白，new Insets(all) 或 new Insets(top, right, bottom, left)（上右下左）。spacing：子节点之间的距离，new HBox(10, …) 的 10。",
        "margin：单个子节点外侧，用静态方法 HBox.setMargin / VBox.setMargin / BorderPane.setMargin，只在节点放进对应容器时有效。",
        "setAlignment(Pos.CENTER) 决定子节点在容器里的位置；BorderPane.setAlignment(node, Pos.CENTER) 决定节点在所在区域里的位置。FlowPane 的间距用 hgap / vgap。"
      ], code: `VBox box = new VBox(10, add, clear);          // 10 = spacing between the children
box.setPadding(new Insets(15));                // inside the box, all four sides
box.setPadding(new Insets(11, 12, 13, 14));    // top, right, bottom, left
box.setAlignment(Pos.CENTER);                  // where the children sit inside the box
VBox.setMargin(add, new Insets(0, 0, 0, 15));  // outside one child (static method of the parent's class)

BorderPane root = new BorderPane();
root.setTop(status);
BorderPane.setAlignment(status, Pos.CENTER);   // position inside its region
BorderPane.setMargin(status, new Insets(5));

FlowPane flow = new FlowPane(5, 10);           // hgap 5, vgap 10
flow.setOrientation(Orientation.VERTICAL);     // top to bottom, then a new column`, related: ["layout", "children-crud"] },
    { id: "children-crud", group: "控件与布局", title: "getChildren() 增删 add / remove / clear / removeAll · StackPane 叠放 · Group",
      keywords: "添加 删除 移除 清空 getChildren add addAll remove clear removeAll StackPane 叠放 居中 Group 整体旋转 resizable 一个父节点",
      notes: [
        "add 一个、addAll 多个、remove(节点) 或 remove(下标)、clear() 清空。注意：不带参数的 removeAll() 什么都不删（课件写的是“全部移除”，笔试按课件答，写代码用 clear()）。",
        "一个节点同时只能在一个父容器里：加到另一个容器会被移走；同一个节点加两次到同一个容器会抛异常。",
        "StackPane：子节点居中叠放，后加的在上面，可用 StackPane.setAlignment 单独改位置。Group：不自动排列，可整体旋转 / 缩放。Pane 和控件可调整大小；Group、Shape、Text 不可以。"
      ], code: `Pane pane = new Pane();
Circle dot = new Circle(20);
pane.getChildren().add(dot);                       // one node
pane.getChildren().addAll(new Label("A"), new Label("B"));
pane.getChildren().remove(dot);                    // by object
pane.getChildren().remove(0);                      // by index
int n = pane.getChildren().size();
pane.getChildren().clear();                        // everything

StackPane stack = new StackPane(new Circle(50, Color.LIGHTGRAY), new Label("Top"));   // centred; later = on top
StackPane.setAlignment(stack.getChildren().get(1), Pos.TOP_LEFT);
Group group = new Group(new Rectangle(0, 0, 50, 30), new Text(5, 20, "G"));        // kept together
group.setRotate(30);`, related: ["layout", "flow-pane", "insets-margin"] },
    { id: "control-methods", group: "控件与布局", title: "TextField / Label / Button 常用方法 · 读写文字、提示、停用",
      keywords: "输入框 标签 按钮 getText setText clear setPromptText setPrefColumnCount setEditable setTextFill setDisable 停用 禁用 setVisible setPrefWidth",
      notes: [
        "getText() 永远返回 String，数字要 parse；setText 只接受 String，数字用 \"\" + n 或 String.valueOf(n)。",
        "setDisable(true) 让按钮变灰、点不了（Lab 3 编辑模式）；setVisible(false) 隐藏但仍占位置。",
        "setPromptText 是空白时的灰色提示；setPrefColumnCount(5) 大约 5 个字符宽；setEditable(false) 只读。"
      ], code: `String text = field.getText().trim();      // always a String
field.setText("0");
field.clear();
field.setPromptText("Radius");            // grey hint while empty
field.setPrefColumnCount(5);              // about 5 characters wide
field.setEditable(false);                 // read only
status.setText("Count: " + 3);            // numbers become text with + or String.valueOf
status.setTextFill(Color.RED);
apply.setDisable(true);                    // greyed out, cannot be clicked
apply.setDisable(text.isEmpty());          // enabled only when there is input
apply.setPrefWidth(120);
moveUp.setVisible(false);`, related: ["parse-int", "alert"] },
    { id: "date-time", group: "控件与布局", title: "日期时间 · 程序启动时间 yyyy-MM-dd HH:mm:ss",
      keywords: "日期 时间 启动时间 当前时间 LocalDateTime LocalDate DateTimeFormatter ofPattern yyyy-MM-dd HH:mm:ss now format Program Started",
      notes: [
        "Lab 3 顶部的「Program Started」：启动时用 LocalDateTime.now() 记录一次，再用 DateTimeFormatter 格式化，不必每秒刷新。",
        "大小写有区别：MM 是月、mm 是分钟；HH 是 0–23 时、hh 是 1–12 时；yyyy 是年、dd 是日。",
        "需要 import java.time.LocalDateTime 和 java.time.format.DateTimeFormatter（通用 import 块已包含）。"
      ], code: `// Lab 3 header: the time the program started, recorded once
String started = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
status.setText("Program Started: " + started);
// MM = month, mm = minutes, HH = 0-23 hours, hh = 1-12 hours
String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));`, related: ["control-methods"] },
    { id: "handler-styles", group: "事件与交互", title: "四种 Handler 写法 · 内部类、匿名内部类、Lambda（对照）",
      keywords: "事件处理 写法 内部类 匿名内部类 Lambda 表达式 inner class anonymous lambda EventHandler handle 函数式接口 functional interface effectively final",
      notes: [
        "内部类：写在 Application 类里面，可以直接用外部类的字段和方法（包括 private），不用通过构造器传入。",
        "匿名内部类：new EventHandler<ActionEvent>() { ... }，声明和创建一步完成，不能写显式 extends / implements，必须实现 handle。",
        "Lambda：EventHandler 只有一个抽象方法（函数式接口），所以能写 e -> 语句；多条语句要加 { } 和分号。Lambda 和匿名类里用到的局部变量必须是 final 或 effectively final；计数要用字段。",
        "独立的 Handler 类见「独立 Handler 类」。片段是类的成员：放在 start() 外面，再在 start() 里调用 registerHandlers()。"
      ], code: `private class InnerHandler implements EventHandler<ActionEvent> {
    @Override
    public void handle(ActionEvent e) {
        status.setText("inner class");     // uses a field of the outer class directly
    }
}

private void registerHandlers() {
    add.setOnAction(new InnerHandler());                   // 1. inner class

    clear.setOnAction(new EventHandler<ActionEvent>() {    // 2. anonymous inner class
        @Override
        public void handle(ActionEvent e) {
            status.setText("anonymous class");
        }
    });

    save.setOnAction(e -> status.setText("lambda"));       // 3. lambda, one statement

    cancel.setOnAction(e -> {                              // lambda with several statements
        status.setText("lambda block");
        field.clear();
    });
}`, related: ["handler-class", "action-handler", "shared-handler"] },
    { id: "handler-class", group: "事件与交互", title: "独立 Handler 类 · implements EventHandler，构造器传入对象",
      keywords: "独立类 外部类 handler class OKHandlerClass implements EventHandler 构造器 委托模型 delegation model 事件源 监听器 listener",
      notes: [
        "委托模型：事件源（按钮）用 setOnAction(监听器对象) 注册；监听器是实现 EventHandler<ActionEvent> 并重写 handle 的对象。餐厅类比：顾客 = 事件源，订单 = 事件对象，服务员 = 处理器。",
        "独立的类拿不到 Application 的字段，要改的 Label 等对象通过构造器传进去，存成 private 字段。好处是可以复用。",
        "片段是放在主类外面的类；在 start() 里注册：apply.setOnAction(new StatusHandler(status, \"Applied\"));"
      ], code: `class StatusHandler implements EventHandler<ActionEvent> {
    private Label label;
    private String text;

    public StatusHandler(Label label, String text) {   // the objects it changes come in here
        this.label = label;
        this.text = text;
    }

    @Override
    public void handle(ActionEvent e) {
        label.setText(text);
    }
}
// In start(): apply.setOnAction(new StatusHandler(status, "Applied"));`, related: ["handler-styles", "action-handler"] },
    { id: "window-events", group: "事件与交互", title: "WindowEvent 顺序 · Showing、Shown、CloseRequest、Hiding、Hidden",
      keywords: "窗口事件 WindowEvent setOnShowing setOnShown setOnHiding setOnHidden setOnCloseRequest WINDOW_SHOWING WINDOW_SHOWN 顺序 consume 关窗",
      notes: [
        "show()：先 WINDOW_SHOWING（即将显示），再 WINDOW_SHOWN（已显示）。",
        "用户点 X：先 CLOSE_REQUEST，再 HIDING、HIDDEN。在 setOnCloseRequest 里调用 e.consume() 会阻止关闭，后面两个事件就不会发生。",
        "程序自己调用 stage.close() / hide() 不会产生 close request，只有 HIDING、HIDDEN。注册方法都在 Stage 上。"
      ], code: `stage.setOnShowing(e -> System.out.println("1 showing"));
stage.setOnShown(e -> System.out.println("2 shown"));
stage.setOnCloseRequest(e -> System.out.println("close request"));   // only when the user closes it
stage.setOnHiding(e -> System.out.println("3 hiding"));
stage.setOnHidden(e -> System.out.println("4 hidden"));
// show():         showing -> shown
// user clicks X:  close request -> hiding -> hidden   (e.consume() in the close request keeps it open)`, related: ["close-request"] },
    { id: "set-on-action-twice", group: "事件与交互", title: "setOnAction 调用两次 · 后一个覆盖前一个",
      keywords: "两个处理器 覆盖 替换 setOnAction 两次 setter 只执行最后一个 addEventHandler 追加 ActionEvent.ACTION",
      notes: [
        "setOnAction 是 setter：像 x = 1; x = 2;，第二次注册会替换第一次，点一下只执行后一个。",
        "要两件事都做：写在同一个 Lambda 的 { } 里；或用 addEventHandler(ActionEvent.ACTION, ...) 追加。"
      ], code: `apply.setOnAction(e -> System.out.println("A"));
apply.setOnAction(e -> System.out.println("B"));   // replaces A: one click prints only B

// Both: one handler with two statements
apply.setOnAction(e -> {
    System.out.println("A");
    System.out.println("B");
});
// Or add another handler instead of replacing
apply.addEventHandler(ActionEvent.ACTION, e -> System.out.println("C"));`, related: ["action-handler", "handler-styles"] },
    { id: "mouse-hover", group: "事件与交互", title: "鼠标进入 / 离开、按下 / 松开、双击、修饰键",
      keywords: "鼠标进入 鼠标离开 悬停 双击 按下 松开 setOnMouseEntered setOnMouseExited setOnMousePressed setOnMouseReleased setOnMouseMoved getClickCount isShiftDown MIDDLE getSceneX",
      notes: [
        "Entered / Exited：鼠标进入 / 离开节点；Pressed / Released：按键按下 / 松开；Moved：不按键移动；Dragged：按住移动；Clicked：点击。",
        "getClickCount() == 2 是双击；getButton() 返回 PRIMARY（左）、SECONDARY（右）、MIDDLE（中）；isShiftDown()、isControlDown() 判断修饰键。",
        "getX() / getY() 相对事件源节点；getSceneX() / getSceneY() 相对 Scene；getScreenX() 相对屏幕。"
      ], code: `circle.setOnMouseEntered(e -> circle.setFill(Color.RED));      // the mouse comes in
circle.setOnMouseExited(e -> circle.setFill(Color.GREEN));     // the mouse leaves
circle.setOnMousePressed(e -> circle.setStroke(Color.BLACK));  // button down
circle.setOnMouseReleased(e -> circle.setStroke(null));        // button up
canvas.setOnMouseClicked(e -> {
    if (e.getClickCount() == 2) status.setText("double click");
    if (e.getButton() == MouseButton.MIDDLE) status.setText("middle button");
    if (e.isShiftDown()) status.setText("Shift + click at " + e.getX() + ", " + e.getY());
});
canvas.setOnMouseMoved(e -> status.setText("scene (" + e.getSceneX() + ", " + e.getSceneY() + ")"));`, related: ["mouse-event"] },
    { id: "overload-override", group: "类与接口", title: "重载 vs 重写 · @Override、动态绑定、强制转换",
      keywords: "重载 重写 覆写 覆盖 overload override 同名方法 参数不同 动态绑定 dynamic binding @Override 向下转型 cast instanceof",
      notes: [
        "重写（override）：子类方法与父类同名、同参数，返回类型相同（或子类型），访问权限不能更严格；加 @Override 让编译器检查签名。",
        "重载（overload）：同名、参数个数 / 类型 / 顺序不同；只有返回类型不同不算重载，会编译错误。",
        "动态绑定：Animal a = new Dog(); a.sound() 在运行时调用 Dog 的版本。能调用哪些方法由声明类型（Animal）决定，要调用子类特有的方法先 instanceof 再强制转换。"
      ], code: `class Animal {
    public String sound() { return "..."; }
    public String describe() { return "I say " + sound(); }   // uses the subclass version at run time
}

class Dog extends Animal {
    @Override                                    // same name, same parameters: overriding
    public String sound() { return "Woof"; }

    public String sound(int times) {             // same name, other parameters: overloading
        return "Woof".repeat(times);
    }
}
// Animal a = new Dog();
// a.sound()     -> "Woof"        (dynamic binding: the real class decides)
// a.describe()  -> "I say Woof"
// a.sound(2)    -> compile error: Animal has no sound(int)
// if (a instanceof Dog) { Dog d = (Dog) a; d.sound(2); }   -> "WoofWoof"`, related: ["inheritance", "polymorphism"] },
    { id: "constructor-chain", group: "类与接口", title: "构造器 · this(...)、super(...)、默认构造器规则",
      keywords: "构造器 构造方法 constructor this super 父类构造器 默认构造器 无参构造器 第一行 隐式 super() 编译错误 cannot be applied",
      notes: [
        "构造器和类同名、没有返回类型。this(...) 调用本类另一个构造器，super(...) 调用父类构造器，都必须是第一行。",
        "子类构造器没写 super(...) 时，Java 自动插入 super()。父类只有带参构造器时，这会编译错误：constructor ... cannot be applied to given types。",
        "类里写了任何构造器，Java 就不再自动提供无参构造器。父类字段是 private 时，子类只能通过 super(...) 给它赋值。"
      ], code: `class Account {
    private String owner;
    private double balance;

    public Account(String owner, double balance) {
        this.owner = owner;            // this.owner = the field, owner = the parameter
        this.balance = balance;
    }

    public Account(String owner) {
        this(owner, 0);                // the other constructor; must be the first statement
    }
}

class SavingAccount extends Account {
    private double rate;

    public SavingAccount(String owner, double balance, double rate) {
        super(owner, balance);         // parent constructor first (owner and balance are private there)
        this.rate = rate;
    }
}
// Account has no Account() constructor, so SavingAccount(...) without super(...) would not compile.`, related: ["inheritance", "getter-setter"] },
    { id: "abstract-rules", group: "类与接口", title: "抽象类与接口的规则 · 不能 new、常量、default 方法、instanceof",
      keywords: "抽象类 接口 规则 abstract interface 不能实例化 不能new 常量 public static final default 方法 instanceof 强制转换 implements 多个接口",
      notes: [
        "抽象类：不能 new；可以有字段、构造器、普通方法和抽象方法；非抽象子类必须实现全部抽象方法。抽象类可以不实现所继承接口的方法。",
        "接口：方法默认 public abstract，字段默认 public static final（常量）；可有 default 方法；实现类的方法必须写 public。一个类只能 extends 一个父类，但可以 implements 多个接口。",
        "抽象类 / 接口都可以作为变量类型：Figure f = new SquareFigure();。用 instanceof 判断实际类型后再强制转换。"
      ], code: `interface Resizable {
    int MAX = 100;                         // a constant: public static final
    void resize(double factor);            // public abstract
    default String info() { return "resizable"; }
}

abstract class Figure implements Resizable {
    protected double size = 10;
    public abstract double area();         // no body; subclasses must write it

    @Override
    public void resize(double factor) {
        size = Math.min(MAX, size * factor);
    }
}

class SquareFigure extends Figure {
    @Override
    public double area() { return size * size; }
}
// Figure f = new Figure();          -> compile error: abstract
// Figure f = new SquareFigure();    -> fine
// if (f instanceof SquareFigure) { SquareFigure s = (SquareFigure) f; }`, related: ["interface", "inheritance", "polymorphism"] },
    { id: "string-methods", group: "Java 基础", title: "String 常用方法 · substring、indexOf、equals 与 ==、不可变",
      keywords: "字符串 String length charAt substring indexOf lastIndexOf equals == compareTo toUpperCase toLowerCase replace trim split join 不可变 immutable",
      notes: [
        "String 不可变：trim()、replace()、toUpperCase() 都返回新字符串，原字符串不变，要接住结果。",
        "比较内容用 equals / equalsIgnoreCase，不要用 ==（== 比较的是是不是同一个对象）；compareTo 按字典序，返回负数 / 0 / 正数。",
        "下标从 0 开始：charAt(i)，i 为 0 到 length()-1；substring(a, b) 含 a 不含 b；indexOf 找不到返回 -1。"
      ], code: `String s = "  JavaFX  ".trim();             // "JavaFX" (strings never change: keep the result)
int n = s.length();                          // 6
char first = s.charAt(0);                    // 'J'; index 0 .. length() - 1
String sub = s.substring(1, 4);              // "ava": from 1 up to, not including, 4
int at = s.indexOf("FX");                    // 4, or -1 if not found
boolean same = s.equals("javafx");           // false: compare text with equals, not ==
boolean sameIgnoringCase = s.equalsIgnoreCase("javafx");   // true
int order = "apple".compareTo("banana");     // negative: "apple" comes first
String changed = s.toUpperCase().replace("FX", "-FX");
String[] parts = "a,b,c".split(",");         // 3 parts
String joined = String.join(" | ", parts);   // "a | b | c"`, related: ["string-match", "type-conversion", "split-fields"] },
    { id: "type-conversion", group: "Java 基础", title: "类型转换 · parse、String.valueOf、整数除法、字符串拼接顺序",
      keywords: "类型转换 转换 parseInt parseDouble parseBoolean String.valueOf 整数除法 取整 四舍五入 Math.round 强制转换 (int) 拼接 字符串加数字",
      notes: [
        "String → 数字：Integer.parseInt、Double.parseDouble（格式错误抛 NumberFormatException）；Boolean.parseBoolean 只有不分大小写的 \"true\" 才是 true，其它都是 false。",
        "数字 → String：String.valueOf(n) 或 \"\" + n。int / int 会丢掉小数（7 / 2 = 3），要小数写 7 / 2.0。",
        "+ 从左到右算：\"X=\" + 2 + 3 是 \"X=23\"，\"X=\" + (2 + 3) 是 \"X=5\"。(int) 2.6 是 2，Math.round(2.6) 是 3。"
      ], code: `int i = Integer.parseInt("123");
double d = Double.parseDouble("12.5");
boolean b = Boolean.parseBoolean("TRUE");      // true; anything except "true" (any case) is false
String s1 = String.valueOf(d);                 // "12.5"
String s2 = "" + i;                            // "123"
int whole = 7 / 2;                             // 3: int / int drops the fraction
double exact = 7 / 2.0;                        // 3.5
int rounded = (int) Math.round(2.6);           // 3
int cut = (int) 2.6;                           // 2
System.out.println("X=" + 2 + 3);              // X=23: + works left to right
System.out.println("X=" + (2 + 3));            // X=5`, related: ["parse-int", "parse-double", "number-format"] },
    { id: "exceptions", group: "Java 基础", title: "异常 · try / catch / finally、受检与非受检、throw 与 throws",
      keywords: "异常 报错 try catch finally throw throws checked unchecked 受检异常 IOException FileNotFoundException NumberFormatException NullPointerException IndexOutOfBounds try-with-resources",
      notes: [
        "非受检异常（NumberFormatException、NullPointerException、IndexOutOfBoundsException）：不写 try 也能编译，运行时出错才崩溃。",
        "受检异常（IOException、FileNotFoundException）：必须 try / catch，或在方法头写 throws，否则编译错误。",
        "多个 catch 时具体的写前面（FileNotFoundException 在 IOException 前）。finally 一般总会执行。try (资源) 会自动关闭 Scanner / PrintWriter。throw new ... 抛出，throws 只是声明。"
      ], code: `try {
    int value = Integer.parseInt(field.getText().trim());
    status.setText("Value: " + value);
} catch (NumberFormatException ex) {           // unchecked: compiles without try
    status.setText("Not a whole number");
} finally {
    System.out.println("finally always runs");
}

// Checked exceptions must be caught (or declared with throws)
try (Scanner in = new Scanner(new File("data.txt"))) {   // closed automatically
    System.out.println(in.nextLine());
} catch (FileNotFoundException ex) {
    System.out.println("No data.txt");
}

if (area < 0) throw new IllegalArgumentException("Area cannot be negative");`, related: ["file-course", "parse-int"] },
    { id: "scanner-tokens", group: "Java 基础", title: "Scanner 读法 · next / nextInt / nextLine、hasNext、分隔符",
      keywords: "Scanner next nextInt nextDouble nextLine hasNext hasNextLine hasNextInt useDelimiter System.in 键盘输入 读一行 读一个词 token 换行 坑",
      notes: [
        "next() 读一个词（以空格 / 换行分隔），nextInt() / nextDouble() 读数字，nextLine() 读到行末。hasNext() / hasNextLine() 判断还有没有。",
        "坑：nextInt() 之后马上 nextLine() 会读到这一行剩下的部分（通常是空字符串）；需要时先多调用一次 nextLine() 跳过行末。",
        "Scanner(System.in) 读键盘，Scanner(File) 读文件，Scanner(String) 读字符串本身。按记录逐行读文件时用 hasNextLine / nextLine + split。"
      ], code: `Scanner in = new Scanner("Chan 78\\nLee 91");     // a Scanner can read a String too
while (in.hasNext()) {
    String name = in.next();                       // one word
    int score = in.nextInt();                      // one number
    System.out.println(name + " " + score);
}

Scanner keyboard = new Scanner(System.in);        // console input
// int age = keyboard.nextInt();
// keyboard.nextLine();                            // skip the rest of that line first
// String fullName = keyboard.nextLine();

Scanner csv = new Scanner("a;b;c").useDelimiter(";");   // tokens split by ;`, related: ["file-course", "read-file"] },
    { id: "loops-arrays", group: "Java 基础", title: "循环与数组 · for、for-each、while、length / length() / size()",
      keywords: "循环 for while do-while for-each 增强for 数组 array length size 遍历 倒序删除 ConcurrentModificationException break continue",
      notes: [
        "数组用 length（没有括号），String 用 length()，ArrayList 用 size()。",
        "for-each 适合只读遍历；遍历时要删除元素，用倒序的下标循环（for-each 中删除会抛 ConcurrentModificationException）。",
        "while 先判断后执行，do-while 至少执行一次；break 跳出循环，continue 跳过本次。"
      ], code: `int[] scores = {78, 91, 64};
int total = 0;
for (int i = 0; i < scores.length; i++) {        // array: length
    total += scores[i];
}
for (int s : scores) {                           // for-each
    System.out.println(s);
}
System.out.println("Java".length());             // String: length()
System.out.println(books.size());                // ArrayList: size()

int k = 0;
while (k < 3) { k++; }
do { k--; } while (k > 0);                       // runs at least once

// Remove while looping: go backwards with an index
for (int i = books.size() - 1; i >= 0; i--) {
    if (!books.get(i).isAvailable()) books.remove(i);
}`, related: ["array-list", "string-methods"] },
    { id: "file-course", group: "集合与文件", title: "File + Scanner + PrintWriter · 课程第 9 章写法（读、覆盖写、追加）",
      keywords: "文件 读文件 写文件 追加 File exists Scanner hasNextLine nextLine PrintWriter println print printf FileWriter true 覆盖 Chapter 9 books.txt",
      notes: [
        "File 只表示路径，本身不读写；exists() 判断文件在不在。相对路径以程序的工作目录为准（BlueJ 是项目文件夹）。",
        "PrintWriter(file)：文件不存在就创建，存在就清空重写；println 换行，print 不换行，printf 格式化。要追加用 new PrintWriter(new FileWriter(file, true))。",
        "Scanner(file) 和 PrintWriter(file) 都会抛受检异常 FileNotFoundException；用 try (…) 写法会自动 close，不 close 可能写不进文件。"
      ], code: `File file = new File("books.txt");                // a path; File itself does not read or write
if (file.exists()) {
    try (Scanner input = new Scanner(file)) {
        while (input.hasNextLine()) {
            String[] parts = input.nextLine().split(",");
            System.out.println(parts[0]);
        }
    }
}

try (PrintWriter output = new PrintWriter(file)) {      // creates the file or REPLACES its content
    output.println("0131450913,HTML How to Program,true");
    output.print("no new line ");
    output.printf("%.2f%n", 12.345);                   // 12.35
}

try (PrintWriter output = new PrintWriter(new FileWriter(file, true))) {   // append instead
    output.println("one more line");
}`, related: ["read-file", "write-file", "exceptions", "missing-file"] }
  ];

  const normalize = text => text.normalize("NFKC").toLowerCase().replace(/[.()]/g, "").trim();
  const index = entries.map(item => ({
    item,
    title: normalize(item.title),
    keywords: normalize(item.keywords),
    text: normalize([item.group, ...item.notes, item.code].join(" "))
  }));

  // Where a term is found: in the title it counts most, in the body least.
  // An English word that stands on its own in the title (Line, not Timeline or Polyline) counts most.
  const wholeWord = (text, term) => /^[a-z0-9]+$/.test(term) && new RegExp("(^|[^a-z0-9])" + term + "([^a-z0-9]|$)").test(text);
  const weight = (entry, term) => wholeWord(entry.title, term) ? 5 : entry.title.includes(term) ? 4 : entry.keywords.includes(term) ? 2 : entry.text.includes(term) ? 1 : 0;

  // Exact search: every space-separated word must appear somewhere in the entry.
  function exactSearch(query, group) {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    const matches = [];
    for (const entry of index) {
      if (group && entry.item.group !== group) continue;
      let score = 0;
      for (const token of tokens) {
        const w = weight(entry, token);
        if (!w) { score = -1; break; }
        score += w;
      }
      if (score >= 0) matches.push({ item: entry.item, score });
    }
    return matches.sort((a, b) => b.score - a.score).map(match => match.item);
  }

  // Words a student adds to a question that say nothing about the topic. Longest first.
  const FILLERS = ["可不可以", "能不能", "怎么样", "为什么", "怎么", "怎样", "如何", "什么", "可以", "我想", "想要", "需要", "一下",
    "请问", "应该", "实现", "使用", "让", "把", "用", "的", "地", "得", "了", "吗", "呢", "吧", "啊", "到", "去", "要", "会", "能", "在", "给", "一个"];
  // Everyday phrasings mapped to the words the entries use. A piece of the question matches an entry
  // when the piece itself or one of the words of a trigger it contains is found there.
  const SYNONYMS = [
    [["读文件", "读取", "读入", "载入", "加载", "打开文件", "读"], ["文件读取", "readalllines", "scanner"]],
    [["写文件", "写入", "保存", "存档", "存到", "写"], ["写文件", "本地保存", "printwriter"]],
    [["改颜色", "换颜色", "变色", "换色", "颜色", "填充"], ["颜色", "setfill", "color"]],
    [["方向键", "箭头键", "上下左右键"], ["方向键", "keycode"]],
    [["键盘控制", "键盘", "按键"], ["键盘", "keyevent"]],
    [["数字输入", "输入数字", "读数字", "转数字", "转成数字", "转整数", "变成数字"], ["字符串转数字", "parseint"]],
    [["小数输入", "输入小数"], ["parsedouble"]],
    [["按钮", "点击按钮", "点按钮"], ["setonaction", "actionevent"]],
    [["没反应", "没有反应", "不响应", "有反应", "反应"], ["没反应", "setonaction"]],
    [["弹窗", "提示框", "错误框", "报错提示", "对话框", "错误提示"], ["alert"]],
    [["排序", "排列"], ["排序", "comparator"]],
    [["移动", "位置", "坐标"], ["坐标", "setcenterx"]],
    [["鼠标", "点击画布", "拖动", "拖拽"], ["鼠标", "mouseevent"]],
    [["动画", "定时", "每隔", "计时"], ["timeline"]],
    [["居中", "中间"], ["居中", "stackpane"]],
    [["单选", "复选", "勾选"], ["radiobutton", "checkbox"]],
    [["下拉"], ["combobox"]],
    [["列表"], ["listview", "arraylist"]],
    [["搜索", "查找", "查询"], ["查找", "contains"]],
    [["删除", "移除"], ["删除", "remove"]],
    [["关闭窗口", "关窗", "关掉窗口"], ["关窗", "setoncloserequest"]],
    [["两位小数", "保留小数", "小数点"], ["string.format", "保留两位"]],
    [["继承", "父类", "子类"], ["extends", "继承"]],
    [["接口"], ["interface", "implements"]],
    [["抽象"], ["abstract", "抽象类"]],
    [["直线", "线段", "画线", "连线", "对角线"], ["line", "直线"]],
    [["圆弧", "弧形", "扇形"], ["arc", "圆弧"]],
    [["多边形", "三角形", "六边形", "折线", "曲线", "正弦"], ["polygon", "polyline"]],
    [["椭圆"], ["ellipse"]],
    [["矩形", "长方形", "圆角"], ["rectangle", "矩形"]],
    [["字体", "粗体", "斜体", "加粗", "字号"], ["font", "字体"]],
    [["样式", "css", "背景色", "边框"], ["setstyle", "-fx-"]],
    [["旋转", "转动"], ["setrotate", "旋转"]],
    [["透明", "半透明"], ["opacity", "透明度"]],
    [["重载"], ["overload", "重载"]],
    [["重写", "覆写", "覆盖"], ["override", "重写"]],
    [["构造器", "构造方法", "构造函数"], ["constructor", "构造器"]],
    [["异常", "报错", "崩溃"], ["exception", "异常"]],
    [["日期", "时间", "启动时间"], ["localdatetime", "日期"]],
    [["循环", "遍历", "数组"], ["for", "循环"]],
    [["类型转换", "转字符串", "整数除法"], ["类型转换", "string.valueof"]],
    [["内部类", "匿名类", "匿名内部类"], ["内部类", "anonymous"]],
    [["窗口事件", "显示窗口"], ["windowevent", "setonshowing"]],
    [["双击", "悬停", "进入", "离开"], ["getclickcount", "setonmouseentered"]],
    [["间距", "内边距", "外边距", "对齐"], ["insets", "setalignment"]]
  ].map(([triggers, words]) => [triggers.map(normalize), words.map(normalize)]);

  // Relaxed search for questions typed in Chinese without spaces, e.g. 怎么读文件.
  function relaxedSearch(query, group) {
    let text = normalize(query);
    for (const filler of FILLERS) text = text.split(filler).join(" ");
    const pieces = text.split(/[\s,，。.？?！!、;；:：]+/).filter(Boolean);
    if (!pieces.length) return [];
    const concepts = pieces.map(piece => {
      const terms = new Set([piece]);
      for (const [triggers, words] of SYNONYMS) if (triggers.some(t => piece.includes(t))) words.forEach(w => terms.add(w));
      return [...terms];
    });
    // Two pieces or fewer must all match; a longer question may miss one.
    const needed = concepts.length <= 2 ? concepts.length : concepts.length - 1;
    const matches = [];
    for (const entry of index) {
      if (group && entry.item.group !== group) continue;
      let found = 0, score = 0;
      for (const terms of concepts) {
        // Every related word found adds to the score, so the entry that covers the topic best comes first.
        const hits = terms.map(term => weight(entry, term)).filter(Boolean);
        if (hits.length) { found++; score += hits.reduce((sum, w) => sum + w, 0); }
      }
      if (found >= needed) matches.push({ item: entry.item, score: found * 10 + score });
    }
    return matches.sort((a, b) => b.score - a.score).map(match => match.item);
  }

  function search(query, group = "") {
    const exact = exactSearch(query, group);
    return exact.length ? exact : relaxedSearch(query, group);
  }

  return { entries, groups: [...new Set(entries.map(item => item.group))], search };
})();

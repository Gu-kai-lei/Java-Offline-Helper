import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.event.Event;
import javafx.geometry.Point2D;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonType;
import javafx.scene.control.DialogPane;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Paint;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Ellipse;
import javafx.scene.shape.Line;
import javafx.scene.shape.Polygon;
import javafx.scene.shape.Rectangle;
import javafx.scene.shape.Shape;
import javafx.scene.text.Text;
import javafx.stage.Stage;
import javafx.stage.Window;

/**
 * Test driver for generated programs: starts an Application, performs scripted steps on the FX
 * thread and prints one JSON snapshot of the window after each step ("STEP n {...}").
 * Steps: click:TEXT  type:INDEX:VALUE  enter:INDEX  select:ROW  mouse:MOVED|CLICKED|DRAGGED:X:Y[:BUTTON]  key:CODE[:SHIFT]  close
 *        try-click:TEXT (missing button is reported, not fatal)  hit:PRESSED|RELEASED|DRAGGED|CLICKED|MOVED|ENTERED|EXITED:X:Y
 *        (topmost shape under the point, else the canvas)  resize:W:H  closecheck (reports whether the close request was consumed)
 *        answer:OK|CANCEL (button pressed in the dialogs that follow)  pixel:X:Y (sample the rendered scene)
 *        window:TITLE (click / type / enter work in that open window; window:main goes back; a closed window falls back to main)
 */
public class FxSmoke {
    private static final List<String> alerts = Collections.synchronizedList(new ArrayList<>());
    private static final List<String> missing = new ArrayList<>();
    private static final List<String> headers = Collections.synchronizedList(new ArrayList<>());
    private static volatile String answer = "OK";   // the button that answerDialogs presses: OK or CANCEL
    private static String lastClose;
    private static String lastPixel;
    private static Stage mainStage;
    private static Stage current;   // the window that click / type / enter work in (window: step)

    public static void main(String[] args) throws Exception {
        Platform.startup(() -> { });
        Platform.setImplicitExit(false);
        ScheduledExecutorService closer = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r);
            t.setDaemon(true);
            return t;
        });
        closer.scheduleAtFixedRate(() -> Platform.runLater(FxSmoke::answerDialogs), 40, 40, TimeUnit.MILLISECONDS);
        onFx(() -> {
            Application app = (Application) Class.forName(args[0]).getDeclaredConstructor().newInstance();
            mainStage = new Stage();
            app.start(mainStage);
            return null;
        });
        System.out.println("STEP 0 " + onFx(FxSmoke::snapshot));
        for (int i = 1; i < args.length; i++) {
            String step = args[i];
            if (step.startsWith("wait:")) {
                Thread.sleep(Long.parseLong(step.substring(5)));   // let a Timeline run
            } else {
                onFx(() -> { perform(step); return null; });
            }
            Thread.sleep(60);
            System.out.println("STEP " + i + " " + onFx(FxSmoke::snapshot));
        }
        System.out.flush();
        Platform.exit();
        System.exit(0);
    }

    private static <T> T onFx(Callable<T> task) throws Exception {
        AtomicReference<T> result = new AtomicReference<>();
        AtomicReference<Exception> failure = new AtomicReference<>();
        CountDownLatch done = new CountDownLatch(1);
        Platform.runLater(() -> {
            try {
                result.set(task.call());
            } catch (Exception e) {
                failure.set(e);
            } finally {
                done.countDown();
            }
        });
        if (!done.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("FX task timed out");
        if (failure.get() != null) throw failure.get();
        return result.get();
    }

    // Alerts block in showAndWait; this runs inside their nested event loop and presses OK.
    private static void answerDialogs() {
        for (Window w : new ArrayList<>(Window.getWindows())) {
            if (w == mainStage || w.getScene() == null || !(w.getScene().getRoot() instanceof DialogPane)) continue;
            DialogPane pane = (DialogPane) w.getScene().getRoot();
            alerts.add(pane.getContentText());
            headers.add(String.valueOf(pane.getHeaderText()));
            Node chosen = "CANCEL".equals(answer) ? pane.lookupButton(ButtonType.CANCEL) : null;
            if (chosen instanceof Button) { ((Button) chosen).fire(); continue; }
            Node ok = pane.lookupButton(ButtonType.OK);
            if (ok instanceof Button) ((Button) ok).fire();
            else if (w instanceof Stage) ((Stage) w).close();
        }
    }

    private static List<Node> all(Parent root) {
        List<Node> out = new ArrayList<>();
        for (Node n : root.getChildrenUnmodifiable()) {
            out.add(n);
            if (n instanceof Parent) out.addAll(all((Parent) n));
        }
        return out;
    }

    private static <T> List<T> find(Class<T> type) {
        if (current == null || !current.isShowing()) current = mainStage;
        return find(type, current.getScene().getRoot());
    }

    private static <T> List<T> find(Class<T> type, Parent root) {
        List<T> out = new ArrayList<>();
        if (type.isInstance(root)) out.add(type.cast(root));
        for (Node n : all(root)) if (type.isInstance(n)) out.add(type.cast(n));
        return out;
    }

    // Controls such as TextField draw their caret with shapes inside their skin; those are not the canvas.
    private static boolean insideControl(Node node) {
        for (Node p = node.getParent(); p != null; p = p.getParent()) {
            if (p instanceof javafx.scene.control.Control) return true;
        }
        return false;
    }

    private static Pane canvas() {
        Pane best = null;
        int most = -1;
        for (Pane p : find(Pane.class)) {
            if (insideControl(p)) continue;
            int shapes = 0;
            for (Node n : p.getChildren()) if (n instanceof Shape) shapes++;
            if (shapes > most || (shapes == most && best != null && p.getWidth() * p.getHeight() > best.getWidth() * best.getHeight())) {
                most = shapes;
                best = p;
            }
        }
        return best;
    }

    private static void perform(String step) {
        String[] p = step.split(":", 3);
        switch (p[0]) {
            case "click": {
                String text = step.substring("click:".length());
                // ButtonBase covers Button, CheckBox and RadioButton
                for (javafx.scene.control.ButtonBase b : find(javafx.scene.control.ButtonBase.class)) {
                    if (text.equals(b.getText())) { b.fire(); return; }
                }
                throw new IllegalArgumentException("No button " + text);
            }
            case "type": find(TextField.class).get(Integer.parseInt(p[1])).setText(p[2]); return;
            case "enter": find(TextField.class).get(Integer.parseInt(p[1])).fireEvent(new ActionEvent()); return;
            case "select": {
                ListView<?> list = find(ListView.class).get(0);
                list.getSelectionModel().select(Integer.parseInt(p[1]));
                list.fireEvent(new MouseEvent(MouseEvent.MOUSE_CLICKED, 1, 1, 1, 1, MouseButton.PRIMARY, 1,
                        false, false, false, false, false, false, false, true, false, true, null));
                return;
            }
            case "mouse": {
                String[] q = step.split(":");
                Pane pane = canvas();
                Point2D s = pane.localToScene(Double.parseDouble(q[2]), Double.parseDouble(q[3]));
                javafx.event.EventType<MouseEvent> type = q[1].equals("MOVED") ? MouseEvent.MOUSE_MOVED
                        : q[1].equals("DRAGGED") ? MouseEvent.MOUSE_DRAGGED : MouseEvent.MOUSE_CLICKED;
                MouseButton button = q.length > 4 ? MouseButton.valueOf(q[4]) : (type == MouseEvent.MOUSE_MOVED ? MouseButton.NONE : MouseButton.PRIMARY);
                Event.fireEvent(pane, new MouseEvent(type, s.getX(), s.getY(), s.getX(), s.getY(), button, 1,
                        false, false, false, false, button == MouseButton.PRIMARY, false, button == MouseButton.SECONDARY, true, false, true, null));
                return;
            }
            case "key": {
                Scene scene = mainStage.getScene();
                KeyEvent event = new KeyEvent(KeyEvent.KEY_PRESSED, "", p[1].length() == 1 ? p[1].toLowerCase() : "", KeyCode.valueOf(p[1]),
                        p.length > 2 && p[2].equals("SHIFT"), false, false, false);
                Node focus = scene.getFocusOwner();
                if (focus != null) Event.fireEvent(focus, event); else Event.fireEvent(scene, event);
                return;
            }
            case "answer": answer = p[1]; return;   // answer:OK or answer:CANCEL for the dialogs that follow
            case "pixel": {
                var pixels = mainStage.getScene().snapshot(null).getPixelReader();
                lastPixel = pixels.getColor(Integer.parseInt(p[1]), Integer.parseInt(p[2])).toString();
                return;
            }
            case "window": {
                String title = step.substring("window:".length());
                if (title.equals("main")) { current = mainStage; return; }
                for (Stage w : otherWindows()) if (title.equals(w.getTitle())) { current = w; return; }
                throw new IllegalArgumentException("No open window " + title);
            }
            case "try-click": {
                // Like click, but a missing button is recorded in the snapshot instead of stopping the run.
                String text = step.substring("try-click:".length());
                for (javafx.scene.control.ButtonBase b : find(javafx.scene.control.ButtonBase.class)) {
                    if (text.equals(b.getText())) { b.fire(); return; }
                }
                missing.add(text);
                return;
            }
            case "hit": {
                // hit:PRESSED|RELEASED|DRAGGED|CLICKED|MOVED|ENTERED|EXITED:X:Y (canvas coordinates).
                // The event goes to the topmost shape under the point, otherwise to the canvas, and bubbles up from there.
                String[] q = step.split(":");
                Pane pane = canvas();
                double x = Double.parseDouble(q[2]), y = Double.parseDouble(q[3]);
                Node target = pane;
                List<Node> children = new ArrayList<>(pane.getChildren());
                Collections.reverse(children);
                for (Node n : children) {
                    if (n instanceof Shape && n.isVisible() && n.contains(n.parentToLocal(x, y))) { target = n; break; }
                }
                javafx.event.EventType<MouseEvent> type;
                switch (q[1]) {
                    case "PRESSED": type = MouseEvent.MOUSE_PRESSED; break;
                    case "RELEASED": type = MouseEvent.MOUSE_RELEASED; break;
                    case "DRAGGED": type = MouseEvent.MOUSE_DRAGGED; break;
                    case "MOVED": type = MouseEvent.MOUSE_MOVED; break;
                    case "ENTERED": type = MouseEvent.MOUSE_ENTERED; break;
                    case "EXITED": type = MouseEvent.MOUSE_EXITED; break;
                    default: type = MouseEvent.MOUSE_CLICKED;
                }
                boolean down = type == MouseEvent.MOUSE_PRESSED || type == MouseEvent.MOUSE_DRAGGED;
                MouseButton button = type == MouseEvent.MOUSE_MOVED || type == MouseEvent.MOUSE_ENTERED || type == MouseEvent.MOUSE_EXITED
                        ? MouseButton.NONE : MouseButton.PRIMARY;
                // This constructor takes scene coordinates; dispatch converts them for each node on the way.
                Point2D s = pane.localToScene(x, y);
                Event.fireEvent(target, new MouseEvent(type, s.getX(), s.getY(), s.getX(), s.getY(), button, 1,
                        false, false, false, false, down, false, false, true, false, true, null));
                return;
            }
            case "resize": {
                String[] q = step.split(":");
                mainStage.setWidth(Double.parseDouble(q[1]));
                mainStage.setHeight(Double.parseDouble(q[2]));
                return;
            }
            case "closecheck": {
                // Calls the window's close-request handler directly, so the snapshot can say whether it consumed the event.
                javafx.event.EventHandler<javafx.stage.WindowEvent> handler = mainStage.getOnCloseRequest();
                if (handler == null) { lastClose = "allowed"; return; }
                javafx.stage.WindowEvent request = new javafx.stage.WindowEvent(mainStage, javafx.stage.WindowEvent.WINDOW_CLOSE_REQUEST);
                handler.handle(request);
                lastClose = request.isConsumed() ? "consumed" : "allowed";
                return;
            }
            case "close": {
                // Like clicking the window's close button: the close-request handlers run (the window itself stays open).
                javafx.stage.WindowEvent request = new javafx.stage.WindowEvent(mainStage, javafx.stage.WindowEvent.WINDOW_CLOSE_REQUEST);
                Event.fireEvent(mainStage, request);
                return;
            }
            default: throw new IllegalArgumentException("Unknown step " + step);
        }
    }

    private static String q(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (char c : String.valueOf(s).toCharArray()) {
            if (c == '"' || c == '\\') b.append('\\').append(c);
            else if (c == '\n') b.append("\\n");
            else if (c < 32) b.append(' ');
            else b.append(c);
        }
        return b.append('"').toString();
    }

    private static String paint(Paint p) { return p == null ? "null" : q(p.toString()); }

    /** Open windows besides the main one, without dialogs (Alert windows are answered by answerDialogs). */
    private static List<Stage> otherWindows() {
        List<Stage> out = new ArrayList<>();
        for (Window w : new ArrayList<>(Window.getWindows())) {
            if (w == mainStage || !(w instanceof Stage) || !w.isShowing() || w.getScene() == null) continue;
            if (w.getScene().getRoot() instanceof DialogPane) continue;
            out.add((Stage) w);
        }
        return out;
    }

    private static String snapshot() {
        // The snapshot always describes the main window; other open windows are listed under "windows".
        Stage working = current;
        current = mainStage;
        try {
            return snapshotMain();
        } finally {
            current = working;
        }
    }

    private static String snapshotMain() {
        StringBuilder b = new StringBuilder("{\"title\":").append(q(mainStage.getTitle()));
        Scene scene = mainStage.getScene();
        b.append(",\"root\":").append(q(scene.getRoot().getClass().getSimpleName()))
                .append(",\"sceneWidth\":").append(scene.getWidth()).append(",\"sceneHeight\":").append(scene.getHeight());
        List<Button> buttons = find(Button.class);
        if (buttons.size() == 1) {
            var bounds = buttons.get(0).localToScene(buttons.get(0).getBoundsInLocal());
            b.append(",\"button\":").append(q(buttons.get(0).getText()))
                    .append(",\"buttonX\":").append((bounds.getMinX() + bounds.getMaxX()) / 2)
                    .append(",\"buttonY\":").append((bounds.getMinY() + bounds.getMaxY()) / 2);
        }
        b.append(",\"shapes\":[");
        Pane pane = canvas();
        boolean first = true;
        if (pane != null) {
            for (Node n : pane.getChildren()) {
                if (!(n instanceof Shape)) continue;
                if (!first) b.append(',');
                first = false;
                b.append("{\"type\":").append(q(n.getClass().getSimpleName())).append(",\"fill\":").append(paint(((Shape) n).getFill()))
                        .append(",\"visible\":").append(n.isVisible());
                if (n.getRotate() != 0) b.append(",\"rot\":").append(n.getRotate());
                if (n instanceof Circle) {
                    Circle c = (Circle) n;
                    b.append(",\"cx\":").append(c.getCenterX()).append(",\"cy\":").append(c.getCenterY()).append(",\"r\":").append(c.getRadius());
                } else if (n instanceof Rectangle) {
                    Rectangle r = (Rectangle) n;
                    b.append(",\"x\":").append(r.getX()).append(",\"y\":").append(r.getY()).append(",\"w\":").append(r.getWidth()).append(",\"h\":").append(r.getHeight());
                } else if (n instanceof Ellipse) {
                    Ellipse e = (Ellipse) n;
                    b.append(",\"cx\":").append(e.getCenterX()).append(",\"cy\":").append(e.getCenterY())
                            .append(",\"rx\":").append(e.getRadiusX()).append(",\"ry\":").append(e.getRadiusY());
                } else if (n instanceof Text) {
                    Text t = (Text) n;
                    b.append(",\"x\":").append(t.getX()).append(",\"y\":").append(t.getY()).append(",\"text\":").append(q(t.getText()));
                } else if (n instanceof Polygon) {
                    b.append(",\"points\":").append(((Polygon) n).getPoints().size());
                } else if (n instanceof Line line) {
                    b.append(",\"stroke\":").append(paint(line.getStroke()))
                            .append(",\"x1\":").append(line.getStartX()).append(",\"y1\":").append(line.getStartY())
                            .append(",\"x2\":").append(line.getEndX()).append(",\"y2\":").append(line.getEndY());
                }
                b.append('}');
            }
        }
        b.append("],\"labels\":[");
        List<Label> labels = find(Label.class);
        for (int i = 0; i < labels.size(); i++) b.append(i > 0 ? "," : "").append(q(labels.get(i).getText()));
        b.append("],\"buttons\":[");
        List<Button> allButtons = find(Button.class);
        for (int i = 0; i < allButtons.size(); i++) b.append(i > 0 ? "," : "").append(q(allButtons.get(i).getText()));
        b.append("],\"fields\":[");
        List<TextField> fields = find(TextField.class);
        for (int i = 0; i < fields.size(); i++) b.append(i > 0 ? "," : "").append(q(fields.get(i).getText()));
        b.append("],\"disabled\":[");
        first = true;
        for (Button button : find(Button.class)) {
            if (!button.isDisabled()) continue;
            b.append(first ? "" : ",").append(q(button.getText()));
            first = false;
        }
        b.append("],\"items\":[");
        List<ListView> lists = find(ListView.class);
        if (!lists.isEmpty()) {
            List<?> items = lists.get(0).getItems();
            for (int i = 0; i < items.size(); i++) b.append(i > 0 ? "," : "").append(q(String.valueOf(items.get(i))));
        }
        b.append("],\"areas\":[");
        List<javafx.scene.control.TextArea> areas = find(javafx.scene.control.TextArea.class);
        for (int i = 0; i < areas.size(); i++) b.append(i > 0 ? "," : "").append(q(areas.get(i).getText()));
        b.append("],\"alerts\":[");
        synchronized (alerts) {
            for (int i = 0; i < alerts.size(); i++) b.append(i > 0 ? "," : "").append(q(alerts.get(i)));
            alerts.clear();
        }
        b.append("]");
        if (pane != null) b.append(",\"canvas\":[").append(pane.getWidth()).append(',').append(pane.getHeight()).append(']');
        if (lastClose != null) { b.append(",\"close\":").append(q(lastClose)); lastClose = null; }
        if (lastPixel != null) { b.append(",\"pixel\":").append(q(lastPixel)); lastPixel = null; }
        synchronized (headers) {
            if (!headers.isEmpty()) {
                b.append(",\"alertHeaders\":[");
                for (int i = 0; i < headers.size(); i++) b.append(i > 0 ? "," : "").append(q(headers.get(i)));
                b.append(']');
                headers.clear();
            }
        }
        List<javafx.scene.image.ImageView> images = find(javafx.scene.image.ImageView.class);
        if (!images.isEmpty()) {
            b.append(",\"images\":[");
            for (int i = 0; i < images.size(); i++) {
                javafx.scene.image.ImageView v = images.get(i);
                b.append(i > 0 ? "," : "").append("{\"rot\":").append(v.getRotate()).append(",\"fitWidth\":").append(v.getFitWidth())
                        .append(",\"ratio\":").append(v.isPreserveRatio()).append(",\"error\":").append(v.getImage() == null || v.getImage().isError()).append('}');
            }
            b.append(']');
        }
        StringBuilder styled = new StringBuilder();
        for (Label label : labels) {
            if (label.getStyle() == null || label.getStyle().isEmpty()) continue;
            styled.append(styled.length() > 0 ? "," : "").append("{\"text\":").append(q(label.getText())).append(",\"style\":").append(q(label.getStyle())).append('}');
        }
        if (styled.length() > 0) b.append(",\"styled\":[").append(styled).append(']');
        List<Stage> others = otherWindows();
        if (!others.isEmpty()) {
            b.append(",\"windows\":[");
            for (int i = 0; i < others.size(); i++) {
                Parent root = others.get(i).getScene().getRoot();
                b.append(i > 0 ? "," : "").append("{\"title\":").append(q(others.get(i).getTitle())).append(",\"labels\":[");
                List<Label> texts = find(Label.class, root);
                for (int j = 0; j < texts.size(); j++) b.append(j > 0 ? "," : "").append(q(texts.get(j).getText()));
                b.append("],\"fields\":[");
                List<TextField> inputs = find(TextField.class, root);
                for (int j = 0; j < inputs.size(); j++) b.append(j > 0 ? "," : "").append(q(inputs.get(j).getText()));
                b.append(']');
                if (root instanceof Button button) b.append(",\"button\":").append(q(button.getText()));
                b.append('}');
            }
            b.append(']');
        }
        if (!missing.isEmpty()) {
            b.append(",\"missing\":[");
            for (int i = 0; i < missing.size(); i++) b.append(i > 0 ? "," : "").append(q(missing.get(i)));
            b.append(']');
            missing.clear();
        }
        return b.append("}").toString();
    }
}

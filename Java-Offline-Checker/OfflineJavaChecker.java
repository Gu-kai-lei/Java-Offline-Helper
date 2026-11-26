import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.FileObject;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.StandardLocation;
import javax.tools.ToolProvider;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;

/** Local compilation only. Never loads or runs submitted classes. No external dependencies. */
public class OfflineJavaChecker {
    private static final String VERSION = "2.1";
    private static final int LIMIT = 600_000;
    private static final String TOKEN = UUID.randomUUID().toString();
    private static final Semaphore COMPILING = new Semaphore(1);
    private static Path home;
    private static String origin;

    private static class Source extends SimpleJavaFileObject {
        final String name, text;
        Source(String name, String text) {
            super(URI.create("string:///" + name), Kind.SOURCE);
            this.name = name;
            this.text = text;
        }
        @Override public CharSequence getCharContent(boolean ignoreEncodingErrors) { return text; }
        @Override public String getName() { return name; }
    }
    /** Class files are discarded in memory: nothing is written to disk, so there is nothing to clean up or load. */
    private static class DiscardingFileManager extends ForwardingJavaFileManager<StandardJavaFileManager> {
        DiscardingFileManager(StandardJavaFileManager manager) { super(manager); }
        private static JavaFileObject discard(JavaFileObject.Kind kind) {
            return new SimpleJavaFileObject(URI.create("discard:///output" + kind.extension), kind) {
                @Override public OutputStream openOutputStream() { return OutputStream.nullOutputStream(); }
            };
        }
        @Override public JavaFileObject getJavaFileForOutput(Location location, String className, JavaFileObject.Kind kind, FileObject sibling) {
            return discard(kind);
        }
        @Override public FileObject getFileForOutput(Location location, String packageName, String relativeName, FileObject sibling) {
            return discard(JavaFileObject.Kind.OTHER);
        }
    }
    private static String quote(String value) {
        if (value == null) return "null";
        StringBuilder b = new StringBuilder("\"");
        for (char c : value.toCharArray()) {
            switch (c) {
                case '"': b.append("\\\""); break;
                case '\\': b.append("\\\\"); break;
                case '\n': b.append("\\n"); break;
                case '\r': b.append("\\r"); break;
                case '\t': b.append("\\t"); break;
                default:
                    if (c < 32) b.append(String.format(Locale.ROOT, "\\u%04x", (int)c));
                    else b.append(c);
            }
        }
        return b.append('"').toString();
    }
    private static void send(HttpExchange exchange, int status, String type, String text) throws IOException {
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", type + "; charset=utf-8");
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        exchange.getResponseHeaders().set("Content-Security-Policy", "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
        exchange.sendResponseHeaders(status, bytes.length);
        try (var body = exchange.getResponseBody()) { body.write(bytes); }
    }
    private static void error(HttpExchange ex, int status, String text) throws IOException {
        send(ex, status, "application/json", "{\"error\":" + quote(text) + "}");
    }
    private static Map<String,String> form(String body) {
        Map<String,String> result = new HashMap<>();
        for (String entry : body.split("&")) {
            int equals = entry.indexOf('=');
            if (equals >= 0) result.put(URLDecoder.decode(entry.substring(0, equals), StandardCharsets.UTF_8),
                    URLDecoder.decode(entry.substring(equals + 1), StandardCharsets.UTF_8));
        }
        return result;
    }
    private static void compile(HttpExchange ex) throws IOException {
        if (!"POST".equals(ex.getRequestMethod())) { error(ex, 405, "POST required"); return; }
        String suppliedOrigin = ex.getRequestHeaders().getFirst("Origin");
        if (suppliedOrigin != null && !origin.equals(suppliedOrigin)) { error(ex, 403, "Open the checker on its printed local URL"); return; }
        String contentType = ex.getRequestHeaders().getFirst("Content-Type");
        if (contentType == null || !contentType.startsWith("application/x-www-form-urlencoded")) { error(ex, 415, "Invalid request type"); return; }
        byte[] bytes = ex.getRequestBody().readNBytes(LIMIT + 1);
        if (bytes.length > LIMIT) { error(ex, 413, "Project is too large for this small-coursework checker"); return; }
        Map<String,String> data;
        try { data = form(new String(bytes, StandardCharsets.UTF_8)); }
        catch (IllegalArgumentException e) { error(ex, 400, "Malformed request"); return; }
        if (!TOKEN.equals(data.get("token"))) { error(ex, 403, "Reload the local checker page"); return; }
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) { error(ex, 503, "A full JDK 17 or later is required; a JRE alone is insufficient"); return; }
        int count;
        try { count = Integer.parseInt(data.getOrDefault("count", "0")); }
        catch (NumberFormatException e) { count = 0; }
        if (count < 1 || count > 20) { error(ex, 400, "Supply 1 to 20 Java source files"); return; }
        ArrayList<Source> sources = new ArrayList<>();
        java.util.HashSet<String> names = new java.util.HashSet<>();
        for (int i = 0; i < count; i++) {
            String name = data.getOrDefault("name" + i, "");
            String text = data.getOrDefault("source" + i, "");
            if (!name.matches("[A-Za-z_$][A-Za-z0-9_$]*\\.java") || !names.add(name) || text.length() > 100_000) {
                error(ex, 400, "Use distinct simple .java filenames; each source must be at most 100000 characters"); return;
            }
            sources.add(new Source(name, text));
        }
        if (!COMPILING.tryAcquire()) { error(ex, 409, "Another compilation is in progress"); return; }
        try {
            DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
            boolean success;
            try (StandardJavaFileManager manager = compiler.getStandardFileManager(diagnostics, Locale.ENGLISH, StandardCharsets.UTF_8)) {
                // Empty paths: only the submitted sources and the JDK API are visible, never stray .class files.
                manager.setLocation(StandardLocation.CLASS_PATH, List.of());
                manager.setLocation(StandardLocation.SOURCE_PATH, List.of());
                List<String> options = List.of("--release", "17", "-proc:none");
                JavaCompiler.CompilationTask task = compiler.getTask(null, new DiscardingFileManager(manager), diagnostics, options, null, sources);
                task.setLocale(Locale.ENGLISH);
                success = Boolean.TRUE.equals(task.call());
            }
            StringBuilder json = new StringBuilder("{\"success\":").append(success).append(",\"diagnostics\":[");
            boolean first = true;
            for (Diagnostic<? extends JavaFileObject> d : diagnostics.getDiagnostics()) {
                if (!first) json.append(',');
                first = false;
                String name = d.getSource() == null ? "" : d.getSource().getName();
                json.append("{\"filename\":").append(quote(name))
                    .append(",\"kind\":").append(quote(d.getKind().name()))
                    .append(",\"line\":").append(d.getLineNumber())
                    .append(",\"column\":").append(d.getColumnNumber())
                    .append(",\"code\":").append(quote(d.getCode()))
                    .append(",\"message\":").append(quote(d.getMessage(Locale.ENGLISH))).append('}');
            }
            json.append("],\"executed\":false}");
            send(ex, 200, "application/json", json.toString());
        } catch (RuntimeException e) {
            error(ex, 500, "Compilation could not finish: " + e.getClass().getSimpleName());
        } finally {
            COMPILING.release();
        }
    }
    public static void main(String[] args) throws Exception {
        home = Path.of("").toAbsolutePath().normalize();
        if (!Files.isRegularFile(home.resolve("index.html"))) {
            System.err.println("Run this program from the folder containing index.html."); return;
        }
        HttpServer server = null;
        int port = 8765;
        for (; port <= 8775; port++) {
            try { server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0); break; }
            catch (java.net.BindException ignored) { }
        }
        if (server == null) throw new IOException("Local ports 8765 to 8775 are already occupied");
        origin = "http://127.0.0.1:" + port;
        server.createContext("/", ex -> {
            try {
                String host = ex.getRequestHeaders().getFirst("Host");
                if (!("127.0.0.1:" + ex.getLocalAddress().getPort()).equals(host)) { error(ex, 403, "Invalid Host"); return; }
                String path = ex.getRequestURI().getPath();
                if ("/api/compile".equals(path)) { compile(ex); return; }
                if (!"GET".equals(ex.getRequestMethod())) { error(ex, 405, "GET required"); return; }
                if ("/".equals(path) || "/index.html".equals(path)) {
                    send(ex, 200, "text/html", Files.readString(home.resolve("index.html"), StandardCharsets.UTF_8));
                } else if ("/api/status".equals(path)) {
                    send(ex, 200, "application/json", "{\"compilerAvailable\":" + (ToolProvider.getSystemJavaCompiler() != null)
                            + ",\"javaVersion\":" + quote(System.getProperty("java.version")) + ",\"version\":" + quote(VERSION)
                            + ",\"folder\":" + quote(home.toString()) + ",\"token\":" + quote(TOKEN) + "}");
                } else { error(ex, 404, "Not found"); }
            } catch (Exception e) {
                try { error(ex, 500, "Local checker error: " + e.getClass().getSimpleName()); } catch (IOException ignored) { }
            } finally { ex.close(); }
        });
        server.setExecutor(Executors.newFixedThreadPool(2));
        server.start();
        HttpServer running = server;
        Runtime.getRuntime().addShutdownHook(new Thread(() -> running.stop(0)));
        System.out.println("Offline Java Checker " + VERSION + " - local computer only");
        System.out.println("Local: " + origin);
        System.out.println("Java: " + System.getProperty("java.version") + "; compiler: " + (ToolProvider.getSystemJavaCompiler() != null));
        System.out.println("Open the Local URL in your browser. No internet service is used.");
        System.out.println("Submitted classes are compiled, never executed. Press Ctrl+C to stop.");
        if (java.util.Arrays.asList(args).contains("--open-browser")) {
            try {
                if (java.awt.Desktop.isDesktopSupported() && java.awt.Desktop.getDesktop().isSupported(java.awt.Desktop.Action.BROWSE)) {
                    java.awt.Desktop.getDesktop().browse(URI.create(origin));
                } else { System.out.println("Browser did not open automatically. Copy the Local URL above into your browser address bar."); }
            } catch (Exception e) { System.out.println("Browser did not open automatically. Copy the Local URL above into your browser address bar."); }
        }
    }
}

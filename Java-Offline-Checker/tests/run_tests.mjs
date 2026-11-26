// Regression tests for the offline checker. Node 18+, no dependencies.
//   node tests/run_tests.mjs        rule engine, examples and page scripts
//   node tests/run_tests.mjs --jdk  also starts OfflineJavaChecker.java with the local JDK 17+ and compiles over HTTP
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const html = read('index.html');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const context = vm.createContext({});
vm.runInContext(scripts[0], context);
vm.runInContext(scripts[1], context);
const rules = context.JavaOfflineRules, fixes = context.JavaOfflineFixes;

const tests = [];
const test = (name, fn) => tests.push({ name, fn });
// Arrays created inside the vm context have another realm's prototype; copy them before deepEqual.
const ids = (source, file = 'Main.java') => Array.from(rules.analyse(source, file, 'file'), i => i.id);
const automatic = (source, file = 'Main.java') => Array.from(rules.analyse(source, file, 'file')).filter(i => fixes.isAutomatic(i));
const generate = (source, file = 'Main.java') => fixes.generate(source, file, 'file', {}).source;
const program = body => 'public class Main {\n    public static void main(String[] args) {\n' + body + '\n    }\n}\n';

// Valid sources: none of these may receive an automatic patch.
const valid = {
  hello: program('        System.out.println("Hello, EIE3320!");'),
  scannerNamedIn: 'import java.util.Scanner;\n' + program(
    '        Scanner in = new Scanner(System.in);\n        while (!in.hasNextInt()) { in.next(); }\n        System.out.println(in.nextInt());'),
  textBlock: program('        String s = """\n            hello\n            """;\n        System.out.println(s);'),
  continuations: 'import java.util.List;\n' + program([
    '        List<Integer> xs = List.of(1, 2, 3);',
    '        int total = xs.stream()',
    '            .mapToInt(Integer::intValue)',
    '            .sum();',
    '        int y = total',
    '            - 1;',
    '        String grade = y > 2',
    '            ? "pass"',
    '            : "fail";',
    '        String[] names = {',
    '            String.valueOf(y),',
    '            grade.trim()',
    '        };',
    '        System.out.println(',
    '            names.length',
    '        );'].join('\n')),
  allmanAndEnum: [
    'public class Main',
    '{',
    '    enum Color',
    '    {',
    '        RED("r"),',
    '        GREEN("g");',
    '        final String code;',
    '        Color(String code)',
    '        {',
    '            this.code = code;',
    '        }',
    '    }',
    '    Main()',
    '    {',
    '    }',
    '    public static void main(String[] args)',
    '    {',
    '        int i = 0;',
    '        do',
    '        {',
    '            i++;',
    '        } while (i < 3);',
    '        synchronized (Main.class)',
    '        {',
    '            System.out.println(Color.RED.code + i);',
    '        }',
    '    }',
    '}',
    ''].join('\n'),
  receivers: 'import java.util.ArrayList;\nimport java.util.List;\n' + program([
    '        List<String> list = List.of("a");',
    '        ArrayList<String> shapes = new ArrayList<>(list);',
    '        for (String shape : shapes) {',
    '            shape.trim();',
    '        }',
    '        shapes.forEach(item -> item.trim());',
    '        try {',
    '            Thread.sleep(1);',
    '        } catch (InterruptedException e) {',
    '            System.out.println(e);',
    '        }'].join('\n')),
  commentsAndStrings: program('        // System.out.printIn("x") if x > 0 {\n        System.out.println("printIn nuul ; if x {");'),
  fixedExample: read('examples/fixed/Main.java'),
  studentRecordFixed: read('examples/student_record/fixed/Main.java')
};

for (const [name, source] of Object.entries(valid)) {
  test('valid source keeps its text: ' + name, () => {
    assert.deepEqual(automatic(source).map(i => i.id + '@' + i.line), []);
    assert.equal(generate(source), source);
  });
}

test('broken example regenerates the stored fixed example', () => {
  assert.equal(generate(read('examples/broken/Main.java')), read('examples/fixed/Main.java'));
});

test('StudentRecord regenerates the stored syntax draft and leaves semantic choices unchecked', () => {
  const broken = read('examples/student_record/broken/Main.java');
  assert.equal(generate(broken), read('examples/student_record/syntax_draft/Main.java'));
  const manual = rules.analyse(broken, 'Main.java', 'file').filter(i => i.patch && !fixes.isAutomatic(i)).map(i => i.id);
  for (const id of ['numeric-char-concat', 'receiver-spelling', 'discarded-tostring', 'private-count-getter']) assert.ok(manual.includes(id), id);
});

// [description, broken line, expected line] inside a main method.
const missingSemicolons = [
  ['local declaration', 'int count = 0', 'int count = 0;'],
  ['generic declaration', 'ArrayList<Integer> list = new ArrayList<>()', 'ArrayList<Integer> list = new ArrayList<>();'],
  ['assignment', 'count = count + 1', 'count = count + 1;'],
  ['compound assignment', 'count += 2', 'count += 2;'],
  ['method call', 'list.clear()', 'list.clear();'],
  ['print with trailing comment', 'System.out.println(count) // show', 'System.out.println(count); // show'],
  ['increment', 'count++', 'count++;']
];
for (const [name, line, expected] of missingSemicolons) {
  test('missing semicolon is repaired: ' + name, () => {
    const lines = ['        ArrayList<Integer> list = new ArrayList<>();', '        int count = 0;', '        ' + line, '        System.out.println(list);'];
    if (name.endsWith('declaration')) lines.splice(lines.findIndex(l => l.includes(line.split(' = ')[0] + ' = ')), 1);
    const source = 'import java.util.ArrayList;\n' + program(lines.join('\n'));
    assert.ok(generate(source).includes('        ' + expected + '\n'), generate(source));
  });
}

test('missing semicolons in fields, constructors, switch and do-while are repaired', () => {
  const source = [
    'import java.util.Scanner',
    'public class Item {',
    '    private String name',
    '    private static int count = 0',
    '    public Item(String name) {',
    '        this.name = name',
    '        count++;',
    '    }',
    '    public static void main(String[] args) {',
    '        int i = 0;',
    '        do {',
    '            i++;',
    '        } while (i < 3)',
    '        switch (i) {',
    '            case 3:',
    '                System.out.println(new Item("x").name);',
    '                break',
    '            default:',
    '                i = 0;',
    '        }',
    '    }',
    '}',
    ''].join('\n');
  const result = generate(source, 'Item.java');
  for (const expected of ['import java.util.Scanner;', 'private String name;', 'private static int count = 0;', 'this.name = name;', '} while (i < 3);', 'break;']) {
    assert.ok(result.includes(expected + '\n'), expected);
  }
});

test('else-if and while conditions get parentheses', () => {
  const source = program('        int score = 75;\n        if (score >= 80) {\n            score = 0;\n        } else if score >= 70 {\n            score = 1;\n        }\n        while score < 100 {\n            score++;\n        }');
  const result = generate(source);
  assert.ok(result.includes('} else if (score >= 70) {'));
  assert.ok(result.includes('while (score < 100) {'));
});

test('!in is reported only between two operands', () => {
  assert.ok(ids(program('        int[] a = {1};\n        if (x !in a) { }')).includes('not-in'));
  assert.ok(!ids(valid.scannerNamedIn).includes('not-in'));
});

test('a missing class header is rebuilt with clean indentation', () => {
  const expected = program('        System.out.println("ok");');
  const method = '    public static void main(String[] args) {\n        System.out.println("ok");\n    }\n';
  assert.equal(generate(method), expected);
  assert.equal(generate(method + '}\n'), expected, 'stray closing brace becomes the class end');
  assert.equal(generate('    System.out.println("ok");\n'), expected, 'top-level statements move into main');
  assert.equal(generate(method.replace(/\n/g, '\r\n')), expected.replace(/\n/g, '\r\n'), 'CRLF files stay CRLF');
});

test('receiver typo is still suggested for a lower-case variable', () => {
  const issue = rules.analyse(program('        String studnet = "a";\n        student.trim();'), 'Main.java', 'file').find(i => i.id === 'receiver-spelling');
  assert.equal(issue?.patch.replacement, 'studnet');
});

test('declared variable named nul is not rewritten', () => {
  const source = 'public class Main {\n    static Object nul = null;\n    static Object get() { return nul; }\n}\n';
  assert.ok(!ids(source).includes('null-typo'));
  assert.ok(ids(source.replace('static Object nul = null;\n', '')).includes('null-typo'));
});

test('overlapping patches are rejected', () => {
  assert.throws(() => rules.applyPatches('abcdef', [{ start: 0, end: 3, replacement: 'x' }, { start: 2, end: 4, replacement: 'y' }]));
});

test('missing close brace is reported without a guessed insertion', () => {
  const issue = rules.analyse('public class Main {\n    void f() {\n}\n', 'Main.java', 'file').find(i => i.id === 'unclosed-delimiter');
  assert.ok(issue && !issue.patch);
});

test('completion offers templates and known members, but not inside strings', () => {
  const source = 'public class Main {\n    String name = "";\n    void f() {\n        so\n        name.\n        String s = "na\n    }\n}\n';
  const at = text => source.indexOf(text) + text.length;
  assert.ok(fixes.complete(source, at('        so')).items.some(i => i.label === 'sout'));
  assert.ok(fixes.complete(source, at('name.')).items.some(i => i.label === 'length'));
  assert.deepEqual([...fixes.complete(source, at('"na')).items], []);
});

test('page is self-contained and every inline script parses', () => {
  assert.equal(scripts.length, 3);
  for (const script of scripts) new vm.Script(script);
  assert.ok(!/<script[^>]+src=|<link[^>]+href=|@import|url\(\s*['"]?https?:/i.test(html));
  assert.ok(!/(?:src|href)=["']https?:/i.test(html));
});

test('rule check stays fast on a large file', () => {
  const body = Array.from({ length: 400 }, (_, i) => `        int v${i} = ${i};\n        System.out.println(v${i} + 1);`).join('\n');
  const started = performance.now();
  fixes.generate(program(body), 'Main.java', 'file', {});
  assert.ok(performance.now() - started < 3000);
});

async function jdkTests() {
  const java = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
  const workDir = path.join(root, '.checker-work'), hadWorkDir = fs.existsSync(workDir);
  const server = spawn(java, ['--add-modules', 'jdk.httpserver', 'OfflineJavaChecker.java'], { cwd: root });
  const port = await new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error('Server did not start:\n' + output)), 30000);
    const collect = chunk => {
      output += chunk;
      const match = /Local: http:\/\/127\.0\.0\.1:(\d+)/.exec(output);
      if (match) { clearTimeout(timer); resolve(Number(match[1])); }
    };
    server.stdout.on('data', collect);
    server.stderr.on('data', collect);
    server.on('exit', code => reject(new Error('Server exited with ' + code + ':\n' + output)));
  });
  const request = (method, pathname, body, headers = {}) => new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path: pathname, headers }, res => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { text += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(text) }));
    });
    req.on('error', reject);
    req.end(body);
  });
  const status = (await request('GET', '/api/status')).data;
  const compile = (sources, overrides = {}) => {
    const body = new URLSearchParams({ token: status.token, count: String(sources.length) });
    sources.forEach(([name, source], i) => { body.set('name' + i, name); body.set('source' + i, source); });
    for (const [key, value] of Object.entries(overrides.fields || {})) body.set(key, value);
    return request('POST', '/api/compile', body.toString(), { 'Content-Type': 'application/x-www-form-urlencoded', ...overrides.headers });
  };
  const jdk = [];
  const jdkTest = (name, fn) => jdk.push({ name: '[jdk] ' + name, fn });

  jdkTest('status reports version 2.1 and a full compiler', () => {
    assert.equal(status.version, '2.1');
    assert.equal(status.compilerAvailable, true);
  });
  jdkTest('broken example fails with diagnostics on the original lines', async () => {
    const { data } = await compile([['Main.java', read('examples/broken/Main.java')]]);
    assert.equal(data.success, false);
    assert.equal(data.executed, false);
    assert.ok(data.diagnostics.some(d => d.kind === 'ERROR' && d.line === 3 && d.filename === 'Main.java'));
  });
  jdkTest('generated drafts compile', async () => {
    for (const source of [read('examples/broken/Main.java'), '    public static void main(String[] args) {\n        System.out.println("ok")\n    }\n}\n']) {
      const { data } = await compile([['Main.java', generate(source)]]);
      assert.equal(data.success, true, JSON.stringify(data.diagnostics));
    }
  });
  jdkTest('all valid samples compile', async () => {
    for (const [name, source] of Object.entries(valid)) {
      const { data } = await compile([['Main.java', source]]);
      assert.equal(data.success, true, name + ': ' + JSON.stringify(data.diagnostics));
    }
  });
  jdkTest('dependent files compile together and a missing dependency fails honestly', async () => {
    const item = ['Item.java', 'public class Item {\n    public String title() { return "t"; }\n}\n'];
    const main = ['Main.java', program('        System.out.println(new Item().title());')];
    assert.equal((await compile([item, main])).data.success, true);
    const alone = (await compile([main])).data;
    assert.equal(alone.success, false);
    assert.ok(alone.diagnostics.some(d => /cant\.resolve/.test(d.code)));
  });
  jdkTest('submitted code is compiled but never executed', async () => {
    const marker = path.join(root, 'executed-marker.txt');
    const source = 'public class Main {\n    static { try { java.nio.file.Files.writeString(java.nio.file.Path.of("executed-marker.txt"), "x"); } catch (Exception e) { } System.exit(9); }\n    public static void main(String[] args) { }\n}\n';
    assert.equal((await compile([['Main.java', source]])).data.success, true);
    assert.equal(fs.existsSync(marker), false);
    assert.equal((await request('GET', '/api/status')).status, 200);
  });
  jdkTest('path-like or duplicate names, bad token, foreign origin and foreign host are rejected', async () => {
    const main = ['Main.java', valid.hello];
    assert.equal((await compile([['../Main.java', valid.hello]])).status, 400);
    assert.equal((await compile([main, main])).status, 400);
    assert.equal((await compile([main], { fields: { token: 'wrong' } })).status, 403);
    assert.equal((await compile([main], { headers: { Origin: 'http://example.com' } })).status, 403);
    assert.equal((await request('GET', '/api/status', undefined, { Host: 'evil.example:' + port })).status, 403);
  });
  jdkTest('compilation writes nothing to disk', () => {
    assert.equal(fs.existsSync(workDir), hadWorkDir);
    assert.deepEqual(fs.readdirSync(root).filter(f => f.endsWith('.class')), []);
  });
  try { return { failed: await run(jdk), count: jdk.length }; } finally { server.kill(); }
}

async function run(list) {
  let failed = 0;
  for (const { name, fn } of list) {
    try { await fn(); console.log('ok   ' + name); }
    catch (e) { failed++; console.log('FAIL ' + name + '\n     ' + String(e.message).split('\n').join('\n     ')); }
  }
  return failed;
}

let failed = await run(tests);
let total = tests.length;
if (process.argv.includes('--jdk')) { const jdk = await jdkTests(); failed += jdk.failed; total += jdk.count; }
console.log(`\n${total - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;

#!/usr/bin/env python3
"""ไร่สุขใจ 2: tiny game server (standard library only).
Serves the game files and keeps the 2 save slots of every player on disk.
  python server.py            (port 8771)    python server.py --port 8080
API:  GET /api/ping   GET /api/save?id=<dev>_<slot>   POST /api/save {id, save}   (save = null deletes the slot)
"""
import argparse, json, os, re, shutil, socket, sys, time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.abspath(__file__))
SAVES = os.path.join(ROOT, 'saves')
BACKUP = os.path.join(SAVES, 'backup')
ID_RE = re.compile(r'^[A-Za-z0-9_-]{4,60}_[12]$')       # <player code>_<slot 1|2>
MAX_BODY = 1_000_000
os.makedirs(BACKUP, exist_ok=True)


def rotate_backup(pid):
    f = os.path.join(SAVES, pid + '.json')
    if not os.path.exists(f):
        return
    shutil.copyfile(f, os.path.join(BACKUP, '%s.%d.json' % (pid, int(time.time()))))
    olds = sorted(x for x in os.listdir(BACKUP) if x.startswith(pid + '.'))
    for x in olds[:-3]:                                   # keep the 3 newest
        os.remove(os.path.join(BACKUP, x))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):
        if not self.path.startswith('/api/ping'):
            sys.stderr.write('%s %s\n' % (self.address_string(), fmt % args))

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == '/api/ping':
            return self.json({'ok': True, 'time': time.time()})
        if u.path == '/api/save':
            pid = (parse_qs(u.query).get('id') or [''])[0]
            if not ID_RE.match(pid):
                return self.json({'error': 'bad id'}, 400)
            f = os.path.join(SAVES, pid + '.json')
            if not os.path.exists(f):
                return self.json({'save': None})
            with open(f, encoding='utf-8') as fh:
                return self.json({'save': json.load(fh)})
        return super().do_GET()

    def do_POST(self):
        u = urlparse(self.path)
        n = int(self.headers.get('Content-Length') or 0)
        if u.path != '/api/save' or n <= 0 or n > MAX_BODY:
            return self.json({'error': 'bad request'}, 400)
        try:
            data = json.loads(self.rfile.read(n).decode('utf-8'))
        except Exception:
            return self.json({'error': 'bad body'}, 400)
        pid = str(data.get('id', ''))
        if not ID_RE.match(pid):
            return self.json({'error': 'bad id'}, 400)
        f = os.path.join(SAVES, pid + '.json')
        sv = data.get('save')
        if sv is None:                                    # delete the slot (a backup is kept)
            rotate_backup(pid)
            if os.path.exists(f):
                os.remove(f)
            return self.json({'ok': True, 'deleted': True})
        if not isinstance(sv, dict) or sv.get('v') != 1:
            return self.json({'error': 'bad save'}, 400)
        rotate_backup(pid)
        tmp = f + '.tmp'
        with open(tmp, 'w', encoding='utf-8') as fh:
            json.dump(sv, fh, ensure_ascii=False)
        os.replace(tmp, f)
        return self.json({'ok': True})


def ips():
    out = set()
    try:
        for i in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            out.add(i[4][0])
    except Exception:
        pass
    return sorted(out)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--port', type=int, default=int(os.environ.get('PORT', 8771)))
    port = ap.parse_args().port
    srv = ThreadingHTTPServer(('0.0.0.0', port), Handler)
    print('ไร่สุขใจ 2 server: http://localhost:%d/' % port)
    for ip in ips():
        print('  เครื่องอื่นในวงเดียวกัน: http://%s:%d/' % (ip, port))
    print('เซฟเก็บที่', SAVES)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass

#!/usr/bin/env python3
"""Local preview server for Aurès Céramique.

Plain `python -m http.server` does NOT understand the pretty URLs, so the
extensionless links (/collection, /piece?id=…) would 404 locally. This tiny
server mirrors the rewrite rules in netlify.toml (Netlify applies the same
mapping live). Run from the site root:

    python3 dev.py        # serves http://127.0.0.1:8787
"""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote
import os

REWRITES = {
    '/': '/index.html',
    '/index.html': '/index.html',
    '/collection': '/collection.html',
    '/atelier': '/atelier.html',
    '/gallery': '/gallery.html',
    '/contact': '/contact.html',
    '/checkout': '/checkout.html',
    '/panier': '/checkout.html',
    '/track': '/track.html',
    '/suivi': '/track.html',
    '/piece': '/piece.html',
    '/admin': '/admin.html',
}

PORT = int(os.environ.get('PORT', '8787'))


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path in REWRITES:
            self.path = REWRITES[parsed.path]
            if parsed.query:
                self.path += '?' + parsed.query
        return super().do_GET()

    def log_message(self, fmt, *args):  # quieter logs
        print('%s - %s' % (self.address_string(), fmt % args))


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f'Aurès Céramique dev server → http://127.0.0.1:{PORT}  (Ctrl+C to stop)')
    # serve .html with correct type even for extensionless-mapped paths
    Handler.extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                              '': 'text/html'}
    ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()

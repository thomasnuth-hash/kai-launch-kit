#!/bin/bash
# Double-click to see the kit in a browser before you publish.
# Close this window when you are finished.
#
# Serves with caching switched off, so a rebuild always shows up on refresh.
# Plain `python3 -m http.server` does not, and the browser will happily keep
# running an old lib/kai.js through a hard reload.
cd "$(dirname "$0")" || exit 1
PORT=4311

# If a preview is already up — an earlier window, or one left behind by a crash
# — take the port back rather than failing or sending you hunting for a window.
# The address stays the same every time, so a bookmark to it always works.
if lsof -ti tcp:$PORT >/dev/null 2>&1; then
  echo "Stopping the preview that was already running, and starting a fresh one."
  lsof -ti tcp:$PORT | xargs kill -9 2>/dev/null
  sleep 1
fi

echo "Serving the launch kit at http://localhost:$PORT"
echo "Caching is off — rebuild, then just refresh."
echo "Close this window to stop."
echo
sleep 1 && open "http://localhost:$PORT" &
python3 - "$PORT" <<'PY'
import sys, functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):          # keep the window readable
        if "GET" in (fmt % args) and " 200 " not in (fmt % args):
            super().log_message(fmt, *args)

port = int(sys.argv[1])
ThreadingHTTPServer(("", port), NoCache).serve_forever()
PY

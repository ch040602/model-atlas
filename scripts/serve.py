"""Serve the course on a free loopback port, independent of the current directory."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


ROOT = Path(__file__).resolve().parent.parent


class CourseHandler(SimpleHTTPRequestHandler):
    # Module scripts and WebAssembly need these types even if Windows registry
    # associations happen to map them to a different type.
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".wasm": "application/wasm",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--no-open", action="store_true", help="Print the address without opening a browser")
    args = parser.parse_args()
    handler = partial(CourseHandler, directory=str(ROOT))
    # Port 0 asks the OS for an unused port, avoiding stale or unrelated servers.
    with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server:
        url = f"http://127.0.0.1:{server.server_port}/"
        print(f"Model Atlas: {url}", flush=True)
        print("Keep this window open while studying. Press Ctrl+C to stop.", flush=True)
        if not args.no_open:
            try:
                if not webbrowser.open(url, new=2):
                    print("Could not open a browser. Open the address above manually.", flush=True)
            except webbrowser.Error as error:
                print(f"Could not open a browser: {error}. Open the address above manually.", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nModel Atlas stopped.", flush=True)


if __name__ == "__main__":
    main()

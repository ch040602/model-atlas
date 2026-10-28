#!/usr/bin/env python3
"""Restore pinned upstream sources and the Model Atlas integration patches.

Existing checkouts are never reset or cleaned. Pass --check for read-only checks,
or --build to additionally install dependencies and build the interactive tools.
"""
from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = {
    "cnn-explainer": ("https://github.com/poloclub/cnn-explainer.git", "d0971f9447ed9806022a3d47587b62394682bc51"),
    "transformer-explainer": ("https://github.com/poloclub/transformer-explainer.git", "bfe50afba10b9b560b84143ee1107d977defa74f"),
    "diffusion-explainer": ("https://github.com/poloclub/diffusion-explainer.git", "0820016ce908a8e66619b7a1c9369af1498160d6"),
    "ganlab": ("https://github.com/poloclub/ganlab.git", "09073e8d8c05ff572e287ba5e69007b3fb9101cd"),
}


def run(args: list[str], cwd: Path, *, check: bool = True, capture: bool = False):
    return subprocess.run(args, cwd=cwd, check=check, text=True, capture_output=capture)


def executable(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise RuntimeError(f"Required executable not found: {name}")
    return path


def restore(name: str, url: str, revision: str, check_only: bool) -> None:
    path = ROOT / "upstream" / name
    if not path.exists():
        if check_only:
            raise RuntimeError(f"Missing checkout: {path}")
        # Keep a failed fetch or checkout away from the final path. An existing
        # checkout is never moved, reset or cleaned by this recovery mechanism.
        path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix=f".{name}-", dir=path.parent) as temporary:
            checkout = Path(temporary) / "checkout"
            checkout.mkdir()
            run(["git", "init", "-q"], checkout)
            run(["git", "remote", "add", "origin", url], checkout)
            run(["git", "fetch", "--depth", "1", "origin", revision], checkout)
            run(["git", "checkout", "--detach", "FETCH_HEAD"], checkout)
            if path.exists() or path.is_symlink():
                raise RuntimeError(f"Checkout appeared during fetch: {path}; no files were replaced")
            checkout.rename(path)
    if not (path / ".git").exists():
        raise RuntimeError(f"Not a standalone checkout: {path}")
    head = run(["git", "rev-parse", "HEAD"], path, check=False, capture=True)
    if head.returncode != 0:
        raise RuntimeError(f"Cannot read HEAD in {path}; inspect the existing directory before retrying. No files were reset or removed.")
    actual = head.stdout.strip()
    if actual != revision:
        raise RuntimeError(f"Unexpected revision in {path}: {actual}; expected {revision}. No files were reset.")
    patch = ROOT / "patches" / f"{name}.patch"
    if patch.exists():
        base = ["git", "apply"]
        reverse = run(base + ["--reverse", "--check", str(patch)], path, check=False, capture=True)
        if reverse.returncode != 0:
            if check_only:
                raise RuntimeError(f"Integration patch is missing or differs in {path}")
            check = run(base + ["--check", str(patch)], path, check=False, capture=True)
            if check.returncode != 0:
                raise RuntimeError(f"Cannot safely apply patch in {path}:\n{check.stderr}")
            run(base + [str(patch)], path)
    print(f"OK {name}: {revision[:12]}", flush=True)


def build() -> None:
    npm, corepack, node = map(executable, ("npm", "corepack", "node"))
    cnn = ROOT / "upstream" / "cnn-explainer"
    transformer = ROOT / "upstream" / "transformer-explainer"
    gan = ROOT / "upstream" / "ganlab"
    run([npm, "install", "--no-audit", "--no-fund"], cnn)
    run([npm, "run", "build"], cnn)
    run([npm, "ci", "--no-audit", "--no-fund"], transformer)
    run([npm, "run", "build"], transformer)
    run([corepack, "yarn", "install", "--non-interactive", "--ignore-scripts", "--ignore-engines"], gan)
    run([node, "node_modules/browserify/bin/cmd.js", "demo/ganlab.ts", "-p", "[tsify", "-p", "tsconfig-dev.json]", "-o", "demo/bundle.js"], gan)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Only check existing sources and patches")
    parser.add_argument("--build", action="store_true", help="Install dependencies and build the local labs")
    args = parser.parse_args()
    if args.check and args.build:
        parser.error("--check and --build cannot be combined")
    executable("git")
    try:
        for name, (url, rev) in SOURCES.items():
            restore(name, url, rev, args.check)
        if args.build:
            build()
    except (RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"Bootstrap failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Verify the pinned GAN Lab checkpoint files and their weight manifest sizes."""
import hashlib
import json
import math
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT / "upstream" / "ganlab"
REVISION = "09073e8d8c05ff572e287ba5e69007b3fb9101cd"
DIRECTORY = Path("demo/pretrained_models")
SHAPES = ("disjoint", "gaussians", "line", "ring")


def git(*args):
    return subprocess.run(["git", *args], cwd=REPO, check=True, stdout=subprocess.PIPE).stdout


def main():
    if git("rev-parse", "HEAD").decode().strip() != REVISION:
        raise ValueError("GAN Lab checkout is not at the audited revision")
    expected = {f"pretrained_{name}{suffix}" for name in SHAPES for suffix in (".json", ".weights.bin")}
    directory = REPO / DIRECTORY
    found = {p.name for p in directory.iterdir() if p.is_file()}
    if found != expected:
        raise ValueError(f"Unexpected checkpoint files: {sorted(found ^ expected)}")
    for name in sorted(expected):
        relative = (DIRECTORY / name).as_posix()
        data = (directory / name).read_bytes()
        if data != git("show", f"{REVISION}:{relative}"):
            raise ValueError(f"Local file differs from pinned Git blob: {relative}")
        print(f"{name}  {len(data)} bytes  sha256={hashlib.sha256(data).hexdigest()}")
    for shape in SHAPES:
        manifest = json.loads((directory / f"pretrained_{shape}.json").read_text(encoding="utf-8"))
        groups = manifest["weightsManifest"]
        if len(groups) != 1 or len(groups[0]["paths"]) != 1:
            raise ValueError(f"Unexpected manifest layout: {shape}")
        weight_path = (directory / groups[0]["paths"][0]).resolve()
        if weight_path != (directory / f"pretrained_{shape}.weights.bin").resolve():
            raise ValueError(f"Unexpected weights path: {shape}")
        weights = groups[0]["weights"]
        if any(w["dtype"] != "float32" or "quantization" in w for w in weights):
            raise ValueError(f"Unexpected weight encoding: {shape}")
        expected_size = sum(math.prod(w["shape"]) * 4 for w in weights)
        if expected_size != weight_path.stat().st_size:
            raise ValueError(f"Weight sizes do not match manifest: {shape}")
        print(f"{shape}: {len(weights)} float32 tensors, {expected_size} bytes, iteration {manifest['modelTopology']['iter_count']}")
    print("PASS: pinned checkpoint bytes and manifest sizes (not a license or training provenance verification)")


if __name__ == "__main__":
    main()

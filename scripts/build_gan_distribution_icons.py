"""Generate original GAN Lab selector diagrams from its sampling formulas.

The sampling formulas are adapted from the Apache-2.0 GAN Lab source:
https://github.com/poloclub/ganlab/blob/09073e8d8c05ff572e287ba5e69007b3fb9101cd/demo/ganlab_input_providers.ts
The generated points are illustrative, not the lab's current samples.
"""

import argparse
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "vendor" / "ganlab"
SHAPES = ("line", "gaussians", "ring", "disjoint")


def make_svg(shape, seed):
    rng = random.Random(seed)
    circles = []
    for _ in range(180):
        value = rng.random()
        normal = lambda: rng.gauss(0, 1)
        if shape == "line":
            x, y = 0.8 - 0.75 * value + 0.01 * normal(), 0.6 + 0.3 * value + 0.01 * normal()
        elif shape == "gaussians":
            x, y = ((0.3 + 0.1 * normal(), 0.7 + 0.1 * normal()) if value < 0.5
                    else (0.7 + 0.05 * normal(), 0.4 + 0.2 * normal()))
        elif shape == "ring":
            x = 0.5 + 0.3 * math.cos(value * 2 * math.pi) + 0.025 * normal()
            y = 0.45 + 0.25 * math.sin(value * 2 * math.pi) + 0.025 * normal()
        else:
            cx, cy = ((0.35, 0.75) if value < 0.333 else
                      (0.75, 0.6) if value < 0.666 else (0.45, 0.35))
            x, y = cx + 0.025 * normal(), cy + 0.025 * normal()
        if 0 <= x <= 1 and 0 <= y <= 1:
            circles.append(f'<circle cx="{2 + 52*x:.2f}" cy="{54 - 52*y:.2f}" r="0.85"/>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">\n'
            '<!-- Illustrative samples generated from GAN Lab distribution formulas; see third-party-licenses/ganlab-figures-and-images.md. -->\n'
            '<rect width="56" height="56" fill="white"/>\n'
            '<g fill="#4b9b71" fill-opacity="0.65">\n' + '\n'.join(circles) + '\n</g>\n</svg>\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="check the checked-in SVGs without changing them")
    args = parser.parse_args()
    if not args.check:
        OUTPUT.mkdir(parents=True, exist_ok=True)
    for seed, shape in enumerate(SHAPES, start=261027):
        file = OUTPUT / f"distribution-{shape}.svg"
        content = make_svg(shape, seed)
        if args.check:
            if not file.is_file() or file.read_text(encoding="utf-8") != content:
                raise SystemExit(f"Generated diagram differs: {file}")
        else:
            file.write_text(content, encoding="utf-8", newline="\n")
    print("GAN Lab distribution diagrams " + ("match" if args.check else "generated"))


if __name__ == "__main__":
    main()

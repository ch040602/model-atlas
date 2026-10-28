"""Create original schematic illustrations for the GAN Lab article.

These are invented points and functions, not samples or weights from GAN Lab.
Run with --check to compare generated SVGs without changing files.
"""
import argparse
import math
from pathlib import Path

OUTPUT = Path(__file__).resolve().parents[1] / 'vendor' / 'ganlab'
GREEN, PURPLE, PINK = '#31946e', '#8846a9', '#e15f96'


def circle(x, y, color, radius=3):
    return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{radius}" fill="{color}"/>'


def panel(x, y, width, height):
    return f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="8" fill="#fff" stroke="#c8d8cf"/>'


def svg(contents):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 190" role="img">\n'
            '<!-- Original conceptual diagram: fictional points and functions. -->\n'
            '<rect width="640" height="190" rx="12" fill="#f4f9f5"/>\n'
            '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker></defs>\n'
            + '\n'.join(contents) + '\n</svg>\n')


def ring(cx, cy, rx, ry, color, offset=0):
    return [circle(cx+rx*math.cos(i*math.pi/6+offset), cy+ry*math.sin(i*math.pi/6+offset), color)
            for i in range(12)]


def figures():
    # One fictional set of points shown in two panels.
    selected=[panel(35,20,230,150),panel(375,20,230,150),
              '<path d="M286 95 H354" stroke="#5c7869" stroke-width="3" marker-end="url(#arrow)"/>']
    selected+=ring(150,95,68,48,GREEN)+ring(490,95,68,48,GREEN)
    # Independent snapshots, not a promise of convergence or an actual run.
    evolution=[panel(30,20,170,150),panel(235,20,170,150),panel(440,20,170,150),
               '<path d="M207 95 H226" stroke="#5c7869" stroke-width="2" marker-end="url(#arrow)"/>',
               '<path d="M412 95 H431" stroke="#5c7869" stroke-width="2" marker-end="url(#arrow)"/>']
    for cx in (115,320,525): evolution+=ring(cx,95,59,50,GREEN)
    evolution+=ring(120,95,15,13,PURPLE,0.15)+ring(325,95,39,32,PURPLE,0.15)+ring(529,95,54,45,PURPLE,0.15)
    # A 1D input segment maps to a curved 2D output, using invented points.
    mapping=[panel(35,20,230,150),panel(375,20,230,150),
             '<path d="M65 95 H235" stroke="#aabeb2" stroke-width="2"/>',
             '<path d="M405 145 H570 M405 145 V43" stroke="#aabeb2" stroke-width="2" fill="none"/>',
             '<path d="M286 95 H354" stroke="#5c7869" stroke-width="3" marker-end="url(#arrow)"/>',
             '<path d="M420 125 C445 55 515 140 560 55" fill="none" stroke="#8846a9" stroke-width="2"/>']
    for x,y in [(420,125),(438,93),(460,85),(485,95),(510,102),(535,91),(560,55)]: mapping.append(circle(x,y,PURPLE))
    mapping += [circle(72+i*25,95,PURPLE) for i in range(7)]
    heat=[panel(55,20,530,150),
          '<defs><linearGradient id="scores"><stop stop-color="#9ed9b9"/><stop offset="0.5" stop-color="#e6e6e6"/><stop offset="1" stop-color="#c4a2d5"/></linearGradient></defs>',
          '<rect x="75" y="35" width="490" height="120" rx="6" fill="url(#scores)"/>',
          circle(180,80,GREEN,5),circle(240,115,GREEN,5),circle(424,76,PURPLE,5),circle(492,120,PURPLE,5)]
    gradient=[panel(55,20,530,150),
              '<path d="M85 145 H555 M85 145 V40" stroke="#aabeb2" stroke-width="2" fill="none"/>']
    for x,y in [(185,120),(270,110),(355,100),(440,90)]:
        gradient.append(circle(x,y,PURPLE,5))
        gradient.append(f'<path d="M{x} {y} l45 -25" fill="none" stroke="{PINK}" stroke-width="3" marker-end="url(#arrow)"/>')
    return {'selected':svg(selected),'evolution':svg(evolution),'mapping':svg(mapping),
            'heatmap':svg(heat),'gradient':svg(gradient)}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    if not args.check: OUTPUT.mkdir(parents=True,exist_ok=True)
    for name,content in figures().items():
        path=OUTPUT / f'article-{name}.svg'
        if args.check:
            if not path.is_file() or path.read_text(encoding='utf-8') != content:
                raise SystemExit(f'Diagram differs: {path}')
        else:
            path.write_text(content,encoding='utf-8',newline='\n')
    print('GAN article diagrams '+('match' if args.check else 'generated'))


if __name__ == '__main__':
    main()

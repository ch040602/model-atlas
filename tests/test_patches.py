"""Check patches against pristine pinned files without downloading model assets."""
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
for name in ("cnn-explainer", "transformer-explainer", "diffusion-explainer", "ganlab"):
    repo = ROOT / "upstream" / name
    patch = ROOT / "patches" / f"{name}.patch"
    changed = subprocess.check_output(["git", "diff", "--name-only"], cwd=repo, text=True).splitlines()
    assert changed, f"No modified files in {name}"
    with tempfile.TemporaryDirectory(prefix="model-atlas-patch-") as temp:
        dest = Path(temp)
        for relative in changed:
            target = dest / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(subprocess.check_output(["git", "show", f"HEAD:{relative}"], cwd=repo))
        subprocess.run(["git", "apply", "--check", str(patch)], cwd=dest, check=True)
        subprocess.run(["git", "apply", str(patch)], cwd=dest, check=True)
        for relative in changed:
            expected = (repo / relative).read_bytes().replace(b"\r\n", b"\n")
            actual = (dest / relative).read_bytes().replace(b"\r\n", b"\n")
            assert actual == expected, f"Patch differs from checkout: {name}/{relative}"
    print(f"PASS {name}: patch restores {len(changed)} changed files")

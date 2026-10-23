from pathlib import Path
import base64, hashlib, urllib.request

ROOT = Path(__file__).resolve().parent.parent
EXPECTED = {
    "demo-a.mp4": "3dd7360cdbf05816857360aeef9633eecdd9c5f46f6898fad32c3374034e5e93",
    "demo-b.mp4": "d1b0d4c1b42ffbf53034664b7962821e2102979262727a78244a38280690650e",
    "portrait.webp": "f9050a17ff316e03c42368a42957c6a327e735a39a81a536d8fa0c0862ea386a",
    "rig-detail.webp": "56d7dded243b25bd1801ad16cf2beb48fa4a41457a1106f0ec252a5ffc60b5c1",
    "rig.webp": "d1583a3dc59975d8cfd0033326e4e3080d943752ad58e8fbb4b93260a017a80e",
    "robot-arena.webp": "949bc3389e541bb2e585f1da2b1e9465b123785ec1eef518570e22380afc3205",
    "robot-track.webp": "2838a599edd8a5dcca64c84f668a831adae819e704bd9cc4c70f62e287cde4ec",
    "Soft-Actuator-Project-Summary.pdf": "be984d6a53fe06f84b1be9cd60e5d46d25bc08536499c4ada60c9cc855b8b5f6",
    "Yuzhou-Li-CV.pdf": "1c11bf37e9ef25f8765a34fd92e5f6ede39f15c1f8dac4adb8ebe371572c89f7"
}
STAGED = {"portrait.webp", "Soft-Actuator-Project-Summary.pdf"}
ORIGIN = "https://yuzhou-li-robotics.activelake1.chatgpt.site/assets/"
for name, expected in EXPECTED.items():
    target = ROOT / "assets" / name
    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() == expected:
        continue
    if name in STAGED:
        payload = base64.b64decode((ROOT / "_migration" / (name + ".b64")).read_text())
    else:
        request = urllib.request.Request(ORIGIN + name, headers={"User-Agent": "YuzhouLi-Portfolio-Asset-Migration"})
        with urllib.request.urlopen(request, timeout=60) as response:
            payload = response.read()
    if hashlib.sha256(payload).hexdigest() != expected:
        raise RuntimeError("Asset checksum mismatch: " + name)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(payload)
    print("Imported and verified:", name)

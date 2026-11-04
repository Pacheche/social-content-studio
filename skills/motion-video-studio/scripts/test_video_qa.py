"""Tests for video_qa.py. Run: python3 -I scripts/test_video_qa.py
Parsing tests always run; end-to-end tests run only when ffmpeg is installed."""
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import video_qa  # noqa: E402

EBUR = """[Parsed_ebur128_0 @ 0x1] Summary:

  Integrated loudness:
    I:         -14.3 LUFS
    Threshold: -24.5 LUFS

  Loudness range:
    LRA:         6.1 LU

  True peak:
    Peak:       -1.4 dBFS"""


class Parsing(unittest.TestCase):
    def test_ebur128_summary(self):
        self.assertEqual(video_qa.parse_ebur128(EBUR), {"integrated": -14.3, "lra": 6.1, "true_peak": -1.4})

    def test_intervals(self):
        err = "black_start:0 black_end:0.5 black_duration:0.5\nblack_start:4.2 black_end:4.6"
        self.assertEqual(video_qa.parse_intervals(err, "black_start", "black_end"), [(0.0, 0.5), (4.2, 4.6)])
        err = "lavfi.freezedetect.freeze_start: 2.0\nlavfi.freezedetect.freeze_end: 6.5"
        self.assertEqual(video_qa.parse_intervals(err, "freeze_start", "freeze_end"), [(2.0, 6.5)])

    def test_cuts(self):
        self.assertEqual(video_qa.parse_cuts("lavfi.scd.time: 1.5\nlavfi.scd.time: 3.25"), [1.5, 3.25])

    def test_evaluate_flags(self):
        info = {"duration": 20.0, "width": 1080, "height": 1920, "fps": 30.0, "vcodec": "h264", "pix_fmt": "yuv444p",
                "color_space": "bt709", "color_primaries": "bt709", "color_transfer": "bt709", "acodec": "aac",
                "sample_rate": 48000}
        an = {"black": [(0.0, 0.3)], "freezes": [(5.0, 10.0)], "cuts": [],
              "loudness": {"integrated": -9.0, "true_peak": 0.2, "lra": 6.0}, "silences": []}
        bad = {x["check"] for x in video_qa.evaluate(info, an, {"duration": 15.0}) if not x["ok"]}
        self.assertTrue({"duration", "pixel format", "first frame", "dead stretches",
                         "integrated loudness", "true peak"} <= bad, bad)

    def test_evaluate_clean(self):
        info = {"duration": 10.0, "width": 1080, "height": 1080, "fps": 30.0, "vcodec": "h264", "pix_fmt": "yuv420p",
                "color_space": "bt709", "color_primaries": "bt709", "color_transfer": "bt709", "acodec": None,
                "sample_rate": None}
        an = {"black": [], "freezes": [(1.0, 2.5)], "cuts": []}
        self.assertEqual([x for x in video_qa.evaluate(info, an, {"width": 1080}) if not x["ok"]], [])


@unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "ffmpeg not installed")
class EndToEnd(unittest.TestCase):
    def test_runs_on_a_generated_clip(self):
        with tempfile.TemporaryDirectory() as d:
            clip = str(Path(d) / "t.mp4")
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "testsrc2=s=320x240:r=30:d=3",
                            "-f", "lavfi", "-i", "sine=f=440:d=3", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                            "-c:a", "aac", "-shortest", clip], check=True)
            code = video_qa.main([clip, "--sheets", str(Path(d) / "qa")])
            self.assertIn(code, (0, 1))
            self.assertTrue((Path(d) / "qa" / "contact-sheet.jpg").exists())

    def test_unreadable_file(self):
        with tempfile.TemporaryDirectory() as d:
            bad = Path(d) / "bad.mp4"
            bad.write_text("not a video")
            self.assertEqual(video_qa.main([str(bad)]), 2)


if __name__ == "__main__":
    unittest.main()

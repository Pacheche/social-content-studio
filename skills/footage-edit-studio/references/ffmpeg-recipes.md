# FFmpeg recipes and traps

Check the FFmpeg version first (`ffmpeg -version`): some behavior below changed in 7.1 and 8.0. Write outputs to a temporary file and rename it when the command succeeds, so a failed run never leaves a half-written final.

## Probe and look

```bash
ffprobe -v error -show_streams -show_format -of json in.mp4
# Contact sheet with timecodes: one frame every 5 s, 4x3 tiles
ffmpeg -i in.mp4 -vf "fps=1/5,scale=480:-2,drawtext=fontfile=/path/font.ttf:text='%{pts\:hms}':x=8:y=8:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6,tile=4x3" -frames:v 1 -update 1 sheet.jpg
# One frame at 12.5 s
ffmpeg -ss 12.5 -i in.mp4 -frames:v 1 frame.png
# Hard cuts
ffmpeg -i in.mp4 -vf "scdet=threshold=10" -an -f null - 2>&1 | grep scd.time
```

### Sample VFR before stream copy

Probe frame timestamp deltas in five 6-second windows spread over the duration, including the start and end. For each window, replace START below; compare deltas with the intended frame period. Irregular deltas or differing stream rates require CFR normalization; matching samples alone do not prove CFR.

```bash
ffprobe -v error -select_streams v:0 -read_intervals "START%+6" -show_entries frame=best_effort_timestamp_time -of csv=p=0 in.mp4
```

## Cut

- **Stream copy** (`-c copy`) is lossless but cuts land on keyframes. Use it only for a single segment with no fades, when the nearest keyframe is within about 0.5 s of the wanted start.
- **Accurate cut** (re-encode): seek about 1 s early before the input, then the rest after it, and re-encode:

```bash
ffmpeg -ss 41.0 -i in.mp4 -ss 1.0 -t 12.3 -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k -af "afade=t=in:d=0.02,afade=t=out:st=12.28:d=0.02" out.mp4
```

- Do not add `-avoid_negative_ts make_zero` on video cuts: it shifts audio by one AAC priming packet (about 21 ms).
- Variable frame rate or open-GOP HEVC across segments: re-encode instead of stream copy. Convert VFR to constant first: `-vf fps=30 -fps_mode cfr`.
- Join segments that share codec, size, frame rate, time base and audio format with the concat demuxer; otherwise normalize them first. Never assume a concat avoids re-encoding.
- Snap cuts to a beat only when beat confidence is high, within about 0.12 s.

For MP4 output, use `-use_editlist 1` so the muxer writes edit-list timing (`elst`) for encoder delay. Verify the first audible syllable and A/V sync in the exported file. This does not make arbitrary stream-copy cuts frame accurate.

## Remove silences

FFmpeg 8.0.0 and 8.0.1 broke expression evaluation in `aselect`. Keep video with `select` and audio with metadata selection instead:

```bash
# video: select='between(t,0,4.2)+between(t,5.1,9.8)',setpts=N/FRAME_RATE/TB
# audio: ametadata=mode=add:key=lavfi.keep:value=1 on kept ranges, then
#        ametadata=mode=select:key=lavfi.keep:value=1:function=same_str,asetpts=N/SR/TB
```

Simpler and safer for many cuts: render each kept segment and concat them.

## Fit to 9:16 with a blurred background

```bash
ffmpeg -i in.mp4 -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20,eq=brightness=-0.15[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:a copy out.mp4
```

Keep overlay coordinates on even pixels. A tracked crop uses per-frame x offsets (`sendcmd`, or a crop expression from a smoothed trajectory).

## Burn captions

```bash
ffmpeg -i cut.mp4 -vf "ass=captions.ass" -c:a copy captioned.mp4
```

Captions go last in the filter chain. On Windows, give `drawtext` an explicit `fontfile=` and a `textfile=...:expansion=none`; escape the drive colon in paths inside filters (`C\:/fonts/x.ttf`).

## Ducking and mixing

```bash
ffmpeg -i voice.wav -i music.wav -filter_complex "[1:a]volume=-14dB[m];[m][0:a]sidechaincompress=threshold=0.05:ratio=4:attack=20:release=400[d];[0:a][d]amix=inputs=2:normalize=0[out]" -map "[out]" mix.wav
```

## Loudness, two passes

```bash
# pass 1: measure
ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | tail -12
# pass 2: apply with the measured values
ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=-19.2:measured_TP=-3.1:measured_LRA=7.4:measured_thresh=-29.6:offset=0.3:linear=true -ar 48000 mix_norm.wav
# after encoding, measure the final file again
ffmpeg -i final.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12
```

## Color

- Tag BT.709 through the encoder: `-x264-params colorprim=bt709:transfer=bt709:colormatrix=bt709`. On FFmpeg 7.1 and later, output `-colorspace` flags can insert an automatic scale that corrupts untagged media.
- HDR to SDR:

```bash
-vf "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
```

- Log footage: apply the camera maker's conversion LUT (`lut3d=file.cube`) before any creative grade.

### Bounded neutral auto grade

Without an approved creative grade, sample ten evenly spaced frames. Read YAVG, YMIN, YMAX and SATAVG; normalize by the native code maximum `(2**bit_depth - 1)` from the input pixel format. Across sampled YAVG values, compute mean and standard deviation, then `spread = 4 * std`. Target mean 0.48, spread 0.72 and saturation 0.25. Below spread 0.65, interpolate contrast from 1.08 at 0.50 to 1.03 at 0.65; otherwise use 1.03. Below mean 0.42, interpolate gamma from 1.10 at 0.30 to 1.02 at 0.42; above 0.60 use 0.97, otherwise 1. Set saturation to 1.04 below 0.18, 0.96 above 0.38, otherwise 0.98. Clamp contrast to 0.94-1.08, gamma to 0.94-1.10 and saturation to 0.94-1.06. Inspect skin and clipping before accepting.

```bash
# Set fps to 10 / clip_duration to sample about ten frames.
ffmpeg -i in.mp4 -vf "fps=1,signalstats,metadata=mode=print" -frames:v 10 -an -f null -
# Replace these example coefficients with the bounded measurements.
ffmpeg -i in.mp4 -vf "eq=contrast=1.03:gamma=1.02:saturation=0.98" -c:a copy graded.mp4
```

For complex SDR filtergraphs, tag after conversion with `scale=out_color_matrix=bt709:out_range=tv,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv`; tagging alone does not convert HDR. Extend the last video frame with `tpad=stop_mode=clone:stop_duration=0.1` so the video ends at least 0.1 s after the audio; verify durations and preserve the final syllable.

## Sync

- Offset between two recordings: cross-correlate their audio (coarse at 20 ms, then fine at 1 ms) over a couple of minutes; accept the offset only with a clear correlation peak.
- Drift on long recordings: resample the audio by the measured parts-per-million (`aresample=async=1` or an explicit `atempo`), then check sync at the start and the end.

## Final export

```bash
ffmpeg -i edit.mp4 -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 20 -preset medium -maxrate 10M -bufsize 20M -x264-params colorprim=bt709:transfer=bt709:colormatrix=bt709 -c:a aac -b:a 192k -ar 48000 -movflags +faststart final.mp4
```

Keep provenance metadata and tool watermarks. Remove only specifically identified private location or device fields when authorized; preserve the original with its content credentials.

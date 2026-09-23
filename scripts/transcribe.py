"""Local, offline speech recognition. stdout is a single bounded JSON result."""
import json
import sys
import av
from faster_whisper import WhisperModel

with av.open(sys.argv[1], options={"protocol_whitelist": "file,pipe"}) as video:
    if not video.duration or not video.streams.audio:
        raise RuntimeError("A video with a known duration and an audio track is required.")
    duration = video.duration / av.time_base
    if duration > 7200:
        raise RuntimeError("Split recordings longer than two hours into lessons.")
model = WhisperModel(sys.argv[2], device="cpu", compute_type="int8", cpu_threads=4,
                     local_files_only=True)
segments, info = model.transcribe(sys.argv[1], beam_size=3, vad_filter=True,
                                 condition_on_previous_text=False)
result = []
for segment in segments:
    if segment.start >= duration:
        continue
    result.append({"start": round(segment.start, 3), "end": round(min(segment.end, duration), 3),
                   "text": segment.text.strip()})
    if len(result) > 20000:
        raise RuntimeError("Recording is too long. Split it into shorter lessons.")
print(json.dumps({"language": info.language, "segments": result}, ensure_ascii=False))

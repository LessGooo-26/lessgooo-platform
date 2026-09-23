"""Download the multilingual model once. No campus content is uploaded."""
from pathlib import Path
from faster_whisper.utils import download_model

target = Path(__file__).resolve().parent.parent / ".local-data" / "whisper-base"
download_model("base", output_dir=str(target))
print("Local multilingual transcription model is ready.")

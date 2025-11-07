from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uuid
import os
from audio_extract import extract_audio  # from audio-extract package

app = FastAPI(title="Video to Audio Extractor API")

class AudioExtractRequest(BaseModel):
    output_format: str | None = "mp3"
    start_time: str | None = None  # e.g., "00:00:10"
    duration: float | None = None  # in seconds

@app.post("/upload-video/")
async def upload_video(file: UploadFile = File(...),
                       params: AudioExtractRequest = None):
    try:
        # Step 1: Save uploaded video to disk
        tmp_folder = "tmp_uploads"
        os.makedirs(tmp_folder, exist_ok=True)
        unique_id = str(uuid.uuid4())
        input_path = os.path.join(tmp_folder, f"{unique_id}_{file.filename}")
        with open(input_path, "wb") as f:
            contents = await file.read()
            f.write(contents)

        # Step 2: Decide output audio path
        out_folder = "extracted_audio"
        os.makedirs(out_folder, exist_ok=True)
        out_filename = f"{unique_id}_audio.{params.output_format if params else 'mp3'}"
        output_path = os.path.join(out_folder, out_filename)

        # Step 3: Call audio-extract
        kwargs = {}
        if params:
            if params.start_time:
                kwargs["start_time"] = params.start_time
            if params.duration:
                kwargs["duration"] = params.duration
            if params.output_format:
                kwargs["output_format"] = params.output_format

        extract_audio(input_path=input_path,
                      output_path=output_path,
                      **kwargs)

        # Step 4: Return the resulting audio file for download
        return FileResponse(output_path,
                            media_type="audio/mpeg",
                            filename=out_filename)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/")
def home():
    return {
        "message": "Welcome to the Video→Audio Extractor API",
        "usage": {
            "endpoint": "/upload-video/",
            "method": "POST",
            "form_data": {
                "file": "video file (mp4 / mkv / etc)",
                "params": {
                    "output_format": "mp3 (default) or wav/ogg etc",
                    "start_time": "optional start, e.g. ‘00:00:10’",
                    "duration": "optional duration in seconds"
                }
            }
        }
    }

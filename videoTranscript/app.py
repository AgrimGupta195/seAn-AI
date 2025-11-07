from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import uuid
import os
import re
import subprocess
import boto3
from botocore.exceptions import ClientError

app = FastAPI(title="SeAn AI Python Services")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

s3_client = boto3.client(
    's3',
    region_name=os.getenv('AWS_REGION'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
ytt_api = YouTubeTranscriptApi()

class TranscriptRequest(BaseModel):
    video_url: str
    language: str | None = None

def extract_video_id(url: str) -> str:
    pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(pattern, url)
    if not match:
        raise ValueError("Invalid YouTube URL")
    return match.group(1)

def upload_to_s3(file_path: str, s3_key: str) -> str:
    try:
        s3_client.upload_file(
            file_path,
            BUCKET_NAME,
            s3_key,
            ExtraArgs={'ContentType': 'audio/mpeg'}
        )
        s3_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{s3_key}"
        return s3_url
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")

@app.post("/transcript")
def get_transcript(req: TranscriptRequest):
    try:
        video_id = extract_video_id(req.video_url)
        
        languages = [req.language] if req.language else ['en']
        fetched_transcript = ytt_api.fetch(video_id, languages=languages)
        
        raw_data = fetched_transcript.to_raw_data()
        
        segments = [
            {
                'text': item['text'],
                'start': item['start'],
                'end': item.get('start', 0) + item.get('duration', 0)
            }
            for item in raw_data
        ]
        
        full_text = " ".join([item['text'] for item in raw_data if item['text'].strip()])
        
        return {
            "video_id": video_id,
            "text": full_text,
            "segments": segments
        }
    except TranscriptsDisabled:
        raise HTTPException(status_code=404, detail="Transcripts are disabled for this video.")
    except NoTranscriptFound:
        raise HTTPException(status_code=404, detail="No transcript found for this video.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/extract-audio")
async def extract_audio_endpoint(
    file: UploadFile = File(...),
    output_format: str = "mp3"
):
    try:
        tmp_folder = "tmp_uploads"
        os.makedirs(tmp_folder, exist_ok=True)
        unique_id = str(uuid.uuid4())
        input_path = os.path.join(tmp_folder, f"{unique_id}_{file.filename}")
        
        with open(input_path, "wb") as f:
            contents = await file.read()
            f.write(contents)

        out_folder = "extracted_audio"
        os.makedirs(out_folder, exist_ok=True)
        out_filename = f"{unique_id}_audio.{output_format}"
        output_path = os.path.join(out_folder, out_filename)

        subprocess.run([
            "ffmpeg",
            "-i", input_path,
            "-vn",
            "-acodec", "libmp3lame" if output_format == "mp3" else "pcm_s16le",
            "-y",
            output_path
        ], check=True, capture_output=True)

        os.remove(input_path)

        s3_key = f"audio/{out_filename}"
        s3_url = upload_to_s3(output_path, s3_key)
        
        os.remove(output_path)

        return {
            "message": "Audio extracted and uploaded successfully",
            "s3_url": s3_url,
            "filename": out_filename
        }
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=f"FFmpeg error: {e.stderr.decode()}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/")
def home():
    return {
        "message": "SeAn AI Python Services",
        "endpoints": {
            "/transcript": "POST - Get YouTube transcript",
            "/extract-audio": "POST - Extract audio from video (uploads to S3)"
        }
    }
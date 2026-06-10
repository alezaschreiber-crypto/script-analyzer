from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Script(BaseModel):
    text: str

@app.get("/")
def home():
    return {"message": "Backend is working!"}

@app.post("/upload")
def upload_script(script: Script):
    return {"received": script.text}
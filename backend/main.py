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
    title: str
    content: str

@app.get("/")
def home():
    return {"message": "Backend is working!"}
scripts= []

@app.post("/upload")
def upload_script(script: Script):
    scripts.append(script.text)
    return {"message": "Script saved"}

@app.get("/scripts")
def get_scripts():
    return scripts
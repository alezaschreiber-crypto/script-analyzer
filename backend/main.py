from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

scripts = []
next_id = 1

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

@app.post("/upload")
def upload_script(script: Script):
    global next_id

    new_script = {
        "id": next_id,
        "title": script.title,
        "content": script.content
    }

    scripts.append(new_script)
    next_id += 1

    return {"message": "Script saved"}

@app.get("/scripts")
def get_scripts():
    return scripts
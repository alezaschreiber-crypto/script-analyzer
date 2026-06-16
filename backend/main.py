from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import connection, cursor 
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

@app.post("/upload")
def upload_script(script: Script):

    cursor.execute(
    """
    INSERT INTO scripts (title, content)
    VALUES (%s, %s)
    """,
    (script.title, script.content)
    )

    connection.commit()

    return {"message": "Script saved"}

@app.get("/scripts")
def get_scripts():
    cursor.execute(
        """
        SELECT *
        FROM scripts
        """
    )
    return cursor.fetchall()
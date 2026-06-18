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

@app.get("/scripts/{script_id}/stats")
def get_script_stats(script_id: int):

    cursor.execute(
        """
        SELECT content
        FROM scripts
        WHERE id = %s
        """,
        (script_id,)
    )

    script = cursor.fetchone()

    if not script:
        return {"error": "Script not found"}

    content = script["content"]

    word_count = len(content.split())

    lines = content.splitlines()
    line_count = len(lines)

    unique_words = len(set(content.lower().split()))

    return {
        "word_count": word_count,
        "line_count": line_count,
        "unique_words": unique_words
    }

@app.get("/scripts/{script_id}/characters")
def get_script_characters(script_id: int):

    cursor.execute(
        """
        SELECT content
        FROM scripts
        WHERE id = %s
        """,
        (script_id,)
    )

    script = cursor.fetchone()

    if not script:
        return {"error": "Script not found"}

    content = script["content"]

    lines = content.splitlines()

    characters = {}

    for line in lines:

        line = line.strip()

        if (
            line.isupper()
            and len(line) < 30
            and any(char.isalpha() for char in line)
        ):
            if line in characters:
                characters[line] += 1
            else:
                characters[line] = 1

    return characters
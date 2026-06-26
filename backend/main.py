import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import connection, cursor 
app = FastAPI()

# Structural headings in Project Gutenberg plays that are uppercase but are NOT
# speakers (acts, scenes, front matter, etc.).
STRUCTURAL_HEADING = re.compile(
    r"^(ACT|SCENE|PROLOGUE|EPILOGUE|DRAMATIS\s+PERSONAE|CONTENTS|"
    r"THE\s+END|FINIS|INDUCTION)\b",
    re.IGNORECASE,
)

# Stage directions usually open with a bracket/paren or one of these verbs.
STAGE_DIRECTION = re.compile(r"^(Enter|Exit|Exeunt|Re-enter|Aside|Scene)\b")


def is_structural_heading(line: str) -> bool:
    return bool(STRUCTURAL_HEADING.match(line))


def character_cue(line: str) -> str | None:
    """Return the speaker name if `line` is a character cue, else None.

    Gutenberg cues are short, all-uppercase, and often end with a period
    (e.g. ``HAMLET.``). Act/scene headings are excluded.
    """
    name = line.rstrip(".")
    if (
        name
        and len(name) < 30
        and name == name.upper()
        and any(char.isalpha() for char in name)
        and not is_structural_heading(line)
    ):
        return name
    return None


def is_stage_direction(line: str) -> bool:
    return line.startswith(("(", "[")) or bool(STAGE_DIRECTION.match(line))

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
@app.get("/scripts/{script_id}/dialogue")
def get_script_dialogues(script_id: int):
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

      dialogue_counts = {}
      character = None

      for line in lines:
          line = line.strip()

          if not line:
              continue

          # Act/scene headings end the current speaker's turn.
          if is_structural_heading(line):
              character = None
              continue

          # Is this line a character cue?
          speaker = character_cue(line)
          if speaker is not None:
              character = speaker
              dialogue_counts.setdefault(character, 0)
              continue

          # Otherwise it's dialogue, unless it's a stage direction.
          if character and not is_stage_direction(line):
              dialogue_counts[character] += 1

      return dialogue_counts
              

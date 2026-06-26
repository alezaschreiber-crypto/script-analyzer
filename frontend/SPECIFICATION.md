# ScriptScope: Theatre Script Analytics Platform

## Overview

ScriptScope is a web application that helps theatre students, directors, and performers analyze dramatic scripts. Users can upload a script and receive insights about character participation, dialogue distribution, scene structure, and overall script composition.

The goal is to transform raw scripts into interactive visualizations and statistics that help users better understand a play before auditions, casting, rehearsals, or performance preparation.

## Problem Statement

When preparing a production, theatre participants often need to answer questions such as:

- Which characters have the most dialogue?
- Which scenes contain a specific character?
- How balanced is the cast?
- Which characters interact most frequently?
- How much stage time does each character receive?

These analyses are typically performed manually and can be time-consuming for longer plays.

ScriptScope automates this process and presents the results through an intuitive dashboard.

## Target Users

### Primary Users
- Theatre students
- Actors preparing for auditions
- Directors
- Drama teachers

### Secondary Users
- Playwrights
- Community theatre organizations
- Literature students studying dramatic works

## Core Features (MVP)

### Script Upload
Users can:
- Upload a script file (.txt)
- Enter a title
- Store multiple scripts

### Script Parsing
The system identifies:
- Character names
- Dialogue lines
- Scenes
- Acts (if present)

Parsed data is stored in the database for future analysis.

### Character Analytics
For each character:
- Total lines spoken
- Total words spoken
- Percentage of dialogue
- Number of scenes appearing in

### Scene Analytics
For each scene:
- Characters present
- Dialogue volume
- Scene length

### Dashboard
Interactive visualizations including:
- Dialogue distribution by character
- Top speaking characters
- Character participation by scene

## Stretch Features

### Character Interaction Graph
Visualize which characters appear together most frequently.

### Casting Insights
Estimate role size and categorize characters as:
- Lead
- Supporting
- Minor

based on dialogue volume.

### Comparative Analysis
Compare multiple scripts and answer questions such as:
- Which play has the largest cast?
- Which play has the most balanced dialogue distribution?

### Search
Allow users to search:
- Character names
- Specific lines
- Scenes

## Technology Stack

### Frontend
**Vue.js**

Responsibilities:
- User interface
- Upload forms
- Analytics dashboard
- Data visualizations

### Backend
**Python (FastAPI)**

Responsibilities:
- Script processing
- Parsing logic
- Analytics calculations
- API endpoints

### Database
**MySQL**

Responsibilities:
- Store scripts
- Store characters
- Store scenes
- Store analytics data

## High-Level Database Design

### Scripts
- id
- title
- upload_date

### Characters
- id
- script_id
- name

### Scenes
- id
- script_id
- scene_number

### Dialogue
- id
- character_id
- scene_id
- line_text
- word_count

## Success Metrics

The project will be considered successful if it can:
- Store multiple scripts
- Parse at least 5 full plays
- Identify major characters automatically
- Generate character dialogue statistics
- Display interactive visualizations
- Support analysis of scripts containing 10,000+ lines

## Learning Goals

This project is intended to demonstrate:
- Full-stack development
- REST API design
- Database design and normalization
- Data processing in Python
- SQL querying
- Frontend-backend integration
- Data visualization for software engineering internship and entry-level backend development roles.

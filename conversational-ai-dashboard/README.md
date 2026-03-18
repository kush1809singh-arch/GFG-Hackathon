# Conversational AI Business Dashboard

## Overview
A full-stack dashboard for CSV data analysis using natural language queries with chart visualizations.

## Features
- CSV file upload
- Natural language query processing
- Interactive chart generation (bar, line, pie)
- Optional Python backend for advanced NLP

## Frontend (Static)
1. Open `public/index.html` in browser
2. Upload CSV from `public/data/sample-sales.csv`
3. Use chat interface for queries like "show sales by region"

## Backend (Optional)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Project Structure
```
conversational-ai-dashboard/
├── README.md
├── public/
│   ├── index.html
│   ├── css/styles.css
│   ├── js/
│   │   ├── main.js
│   │   ├── csv-parser.js
│   │   ├── query-processor.js
│   │   └── chart-renderer.js
│   └── data/
│       └── sample-sales.csv
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── nlp_processor.py
│   └── utils.py
└── .gitignore
```

## Quick Start
```
# Frontend only
open public/index.html
```


from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import json
import os
from nlp_processor import NLPProcessor
from utils import safe_eval

app = Flask(__name__)
CORS(app)

nlp = NLPProcessor()

@app.route('/api/query', methods=['POST'])
def process_query():
    data = request.json
    csv_data = data.get('csv_data')
    query = data.get('query', '').lower()
    
    if not csv_data:
        return jsonify({'error': 'CSV data required'}), 400
    
    # Convert CSV string to DataFrame
    df = pd.read_csv(pd.StringIO(csv_data))
    
    try:
        result = nlp.process_query(df, query)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)


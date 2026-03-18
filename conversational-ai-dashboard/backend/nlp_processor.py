import pandas as pd
import re
from typing import Dict, Any
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# Download required NLTK data (run once)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

class NLPProcessor:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
    
    def process_query(self, df: pd.DataFrame, query: str) -> Dict[str, Any]:
        """Process natural language query and return visualization config"""
        
        # Extract intent and parameters
        intent = self.extract_intent(query, df.columns.tolist())
        
        if not intent['group_by'] or not intent['metric']:
            return {
                'text': 'Try queries like: "sales by region", "revenue by product", "top units by region"',
                'chartConfig': None
            }
        
        # Aggregate data
        agg_df = self.aggregate_data(df, intent)
        
        if agg_df.empty:
            return {'text': 'No data found for your query', 'chartConfig': None}
        
        # Generate response and chart config
        response_text = self.generate_response(agg_df, intent)
        chart_config = self.generate_chart_config(agg_df, intent)
        
        return {
            'text': response_text,
            'chartConfig': chart_config
        }
    
    def extract_intent(self, query: str, columns: list) -> Dict[str, str]:
        """Extract intent from natural language query"""
        query_lower = query.lower()
        intent = {'group_by': None, 'metric': None, 'chart_type': 'bar'}
        
        # Metric detection
        metric_map = {
            'sales': 'sales',
            'revenue': 'revenue', 
            'unit': 'units',
            'sale': 'sales'
        }
        
        for word, metric in metric_map.items():
            if word in query_lower:
                intent['metric'] = metric
                break
        
        if not intent['metric']:
            intent['metric'] = 'sales'  # default
        
        # Group by detection
        group_map = {
            'region': 'region', 'area': 'region',
            'product': 'product', 'item': 'product',
            'date': 'date', 'time': 'date'
        }
        
        for word, col in group_map.items():
            if word in query_lower and col in columns:
                intent['group_by'] = col
                break
        
        # Column matching
        for col in columns:
            if col.lower() in query_lower:
                intent['group_by'] = col
        
        # Chart type
        if 'trend' in query_lower or 'time' in query_lower:
            intent['chart_type'] = 'line'
        elif 'pie' in query_lower or 'top' in query_lower:
            intent['chart_type'] = 'pie'
        
        return intent
    
    def aggregate_data(self, df: pd.DataFrame, intent: Dict) -> pd.DataFrame:
        """Aggregate data based on intent"""
        group_col = intent['group_by']
        metric_col = intent['metric']
        
        if group_col not in df.columns or metric_col not in df.columns:
            return pd.DataFrame()
        
        agg_df = df.groupby(group_col)[metric_col].agg(['sum', 'count']).reset_index()
        agg_df.columns = [group_col, metric_col, 'record_count']
        agg_df = agg_df.sort_values(metric_col, ascending=False)
        
        return agg_df.head(10)  # Top 10
    
    def generate_response(self, df: pd.DataFrame, intent: Dict) -> str:
        """Generate natural language response"""
        group_col = intent['group_by']
        metric_col = intent['metric']
        
        top_item = df.iloc[0]
        total = df[metric_col].sum()
        
        response = f"**Top {group_col}s by {metric_col}:**\n\n"
        for _, row in df.head(5).iterrows():
            response += f"• {row[group_col]}: {row[metric_col]:,.0f}\n"
        
        response += f"\n**Total {metric_col}: {total:,.0f}** (across {len(df)} groups)"
        return response
    
    def generate_chart_config(self, df: pd.DataFrame, intent: Dict) -> Dict:
        """Generate Chart.js compatible config"""
        group_col = intent['group_by']
        metric_col = intent['metric']
        
        labels = df[group_col].tolist()
        data = df[metric_col].tolist()
        
        colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
                 '#FF9F40', '#FF6384', '#C9CBCF']
        
        config = {
            'type': intent['chart_type'],
            'data': {
                'labels': labels,
                'datasets': [{
                    'label': metric_col.title(),
                    'data': data,
                    'backgroundColor': colors[:len(labels)],
                    'borderColor': '#667eea',
                    'borderWidth': 2
                }]
            },
            'options': {
                'responsive': True,
                'maintainAspectRatio': False,
                'plugins': {
                    'title': {
                        'display': True,
                        'text': f"{metric_col.title()} by {group_col.title()}"
                    }
                }
            }
        }
        
        return config


import ast
import re

def safe_eval(expression):
    """Safely evaluate simple numeric expressions"""
    try:
        # Only allow basic math operations
        allowed_nodes = (ast.Expression, ast.Load, ast.Num, ast.BinOp, 
                        ast.Add, ast.Sub, ast.Mult, ast.Div, ast.USub)
        
        tree = ast.parse(expression, mode='eval')
        
        def _check_tree(node):
            if isinstance(node, allowed_nodes):
                for child in ast.iter_child_nodes(node):
                    if not _check_tree(child):
                        return False
                return True
            return False
        
        if not _check_tree(tree.body):
            raise ValueError("Unsafe expression")
        
        return eval(compile(tree, filename='safe_eval', mode='eval'))
    except:
        return None

def clean_column_name(name):
    """Clean column names for safe processing"""
    return re.sub(r'[^a-zA-Z0-9_]', '_', str(name))


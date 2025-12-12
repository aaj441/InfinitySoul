#!/usr/bin/env python3
"""
Vibe Lint: Check for emotional dissonance in code.
This script analyzes code for "extractive" or "diminishing" vibes.
"""

import sys
import os
import ast
import argparse
from typing import List, Dict, Any


def check_function_vibe(node: ast.FunctionDef) -> Dict[str, Any]:
    """
    Check if a function has extractive or diminishing vibe.
    
    Args:
        node: AST node for function
        
    Returns:
        Vibe report
    """
    extractive_patterns = [
        "extract",
        "take",
        "grab",
        "steal",
        "hijack",
        "bypass",
        "circumvent"
    ]
    
    diminishing_patterns = [
        "disable",
        "suppress",
        "ignore",
        "skip",
        "override_safety",
        "remove_protection"
    ]
    
    # Get function source as string
    func_name = node.name.lower()
    docstring = ast.get_docstring(node) or ""
    docstring = docstring.lower()
    
    # Check for extractive patterns
    extractive_score = sum(1 for pattern in extractive_patterns if pattern in func_name or pattern in docstring)
    
    # Check for diminishing patterns
    diminishing_score = sum(1 for pattern in diminishing_patterns if pattern in func_name or pattern in docstring)
    
    # Check for positive patterns
    generous_patterns = ["share", "give", "empower", "enable", "support", "help"]
    generous_score = sum(1 for pattern in generous_patterns if pattern in func_name or pattern in docstring)
    
    if extractive_score > 0:
        return {
            "status": "FAIL",
            "reason": f"Extractive vibe detected in function '{node.name}'",
            "line": node.lineno
        }
    elif diminishing_score > 0:
        return {
            "status": "FAIL",
            "reason": f"Diminishing vibe detected in function '{node.name}'",
            "line": node.lineno
        }
    elif generous_score > 0:
        return {
            "status": "PASS",
            "reason": f"Generous vibe in function '{node.name}'",
            "line": node.lineno
        }
    else:
        return {
            "status": "PASS",
            "reason": f"Clean vibe in function '{node.name}'",
            "line": node.lineno
        }


def lint_file(filepath: str) -> List[Dict[str, Any]]:
    """
    Lint a Python file for vibe issues.
    
    Args:
        filepath: Path to Python file
        
    Returns:
        List of vibe issues
    """
    try:
        with open(filepath, 'r') as f:
            source = f.read()
        
        tree = ast.parse(source, filepath)
        issues = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                vibe_check = check_function_vibe(node)
                if vibe_check["status"] == "FAIL":
                    issues.append(vibe_check)
        
        return issues
    except SyntaxError as e:
        return [{"status": "ERROR", "reason": f"Syntax error: {e}", "line": e.lineno}]
    except Exception as e:
        return [{"status": "ERROR", "reason": f"Error: {e}", "line": 0}]


def main():
    parser = argparse.ArgumentParser(description="Check code for emotional dissonance")
    parser.add_argument("--file", help="File to check", required=True)
    args = parser.parse_args()
    
    if not os.path.exists(args.file):
        print(f"Error: File '{args.file}' not found")
        sys.exit(1)
    
    # Only lint Python files
    if not args.file.endswith('.py'):
        print(f"Skipping non-Python file: {args.file}")
        sys.exit(0)
    
    issues = lint_file(args.file)
    
    if not issues:
        print(f"✓ {args.file}: Clean vibe, no dissonance detected")
        sys.exit(0)
    else:
        print(f"✗ {args.file}: Vibe issues detected:")
        for issue in issues:
            print(f"  Line {issue['line']}: {issue['reason']}")
        sys.exit(1)


if __name__ == "__main__":
    main()

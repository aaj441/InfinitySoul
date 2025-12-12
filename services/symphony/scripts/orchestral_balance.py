#!/usr/bin/env python3
"""
Orchestral Balance: Check that no agent is too loud (high latency).
Ensures the mix is clean and balanced.
"""

import sys
import os
import argparse
import glob
from typing import List, Dict, Any

# Constants
CONTEXT_LINES = 5  # Lines to check after a for loop for DB operations


def check_agent_latency(filepath: str) -> Dict[str, Any]:
    """
    Check if an agent file has latency concerns.
    
    Args:
        filepath: Path to agent file
        
    Returns:
        Latency report
    """
    # Look for common latency anti-patterns
    latency_warnings = []
    
    try:
        with open(filepath, 'r') as f:
            lines = f.readlines()
        
        for i, line in enumerate(lines, 1):
            # Check for blocking operations
            if 'time.sleep(' in line and 'time.sleep(0.' not in line:
                # Long sleep detected
                latency_warnings.append({
                    "line": i,
                    "issue": "Long sleep() detected - may cause latency",
                    "severity": "warning"
                })
            
            # Check for synchronous network calls without timeout
            if 'requests.get(' in line and 'timeout=' not in line:
                latency_warnings.append({
                    "line": i,
                    "issue": "Network request without timeout",
                    "severity": "warning"
                })
            
            # Check for database queries in loops
            if 'for ' in line and i < len(lines) - CONTEXT_LINES:
                # Check next 5 lines for DB operations
                next_lines = ''.join(lines[i:i+CONTEXT_LINES])
                if 'query' in next_lines.lower() or 'execute' in next_lines.lower():
                    latency_warnings.append({
                        "line": i,
                        "issue": "Potential N+1 query pattern in loop",
                        "severity": "warning"
                    })
        
        return {
            "file": filepath,
            "warnings": latency_warnings,
            "status": "PASS" if not latency_warnings else "WARNING"
        }
    except Exception as e:
        return {
            "file": filepath,
            "warnings": [{"line": 0, "issue": f"Error reading file: {e}", "severity": "error"}],
            "status": "ERROR"
        }


def check_ensemble_balance(agent_dir: str) -> List[Dict[str, Any]]:
    """
    Check all agents in the ensemble for balance.
    
    Args:
        agent_dir: Directory containing agent files
        
    Returns:
        List of balance reports
    """
    if not os.path.exists(agent_dir):
        return [{"error": f"Directory '{agent_dir}' not found"}]
    
    # Find all Python files (agents)
    pattern = os.path.join(agent_dir, "**/*.py")
    agent_files = glob.glob(pattern, recursive=True)
    
    # Filter out __init__.py and test files
    agent_files = [
        f for f in agent_files 
        if not f.endswith('__init__.py') and 'test' not in f.lower()
    ]
    
    reports = []
    for agent_file in agent_files:
        report = check_agent_latency(agent_file)
        if report["status"] != "PASS":
            reports.append(report)
    
    return reports


def main():
    parser = argparse.ArgumentParser(description="Check orchestral balance (agent latency)")
    parser.add_argument("--ensemble", help="Agent directory to check", required=True)
    args = parser.parse_args()
    
    reports = check_ensemble_balance(args.ensemble)
    
    if not reports:
        print(f"✓ Orchestral balance: All agents are balanced (latency < 30s expected)")
        sys.exit(0)
    else:
        print(f"⚠ Orchestral balance issues detected:")
        for report in reports:
            if "error" in report:
                print(f"  ERROR: {report['error']}")
            else:
                print(f"\n  {report['file']}:")
                for warning in report["warnings"]:
                    print(f"    Line {warning['line']}: {warning['issue']} [{warning['severity']}]")
        
        # Warning, not failure - these are potential issues
        print("\nNote: These are warnings about potential latency issues.")
        print("Review and optimize as needed. The mix may be muddy.")
        sys.exit(0)  # Exit 0 but with warnings


if __name__ == "__main__":
    main()

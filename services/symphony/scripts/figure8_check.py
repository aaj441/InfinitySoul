#!/usr/bin/env python3
"""
Figure 8 Check: Verify that vibe drift is acceptable in the infinite loop.
"""

import sys
import json
import argparse
from typing import Dict, Any


def check_figure8_loop(loop_file: str) -> Dict[str, Any]:
    """
    Check the Figure 8 loop for vibe drift.
    
    Args:
        loop_file: Path to infinite_tape.json
        
    Returns:
        Loop health report
    """
    try:
        with open(loop_file, 'r') as f:
            records = json.load(f)
        
        if not records:
            return {
                "status": "EMPTY",
                "message": "No iterations recorded yet"
            }
        
        if len(records) < 2:
            return {
                "status": "PASS",
                "message": "Not enough iterations to measure drift"
            }
        
        # Calculate vibe drift between consecutive iterations
        drifts = []
        for i in range(len(records) - 1):
            vibe1 = records[i].get("vibe_output", {})
            vibe2 = records[i + 1].get("vibe_output", {})
            
            # Calculate drift
            score1 = (
                vibe1.get("confidence", 0.5) + 
                vibe1.get("generosity", 0.5) + 
                vibe1.get("sovereignty", 0.5)
            ) / 3
            score2 = (
                vibe2.get("confidence", 0.5) + 
                vibe2.get("generosity", 0.5) + 
                vibe2.get("sovereignty", 0.5)
            ) / 3
            
            drift = abs(score1 - score2)
            drifts.append(drift)
        
        avg_drift = sum(drifts) / len(drifts)
        max_drift = max(drifts)
        
        # Check thresholds
        if max_drift > 0.3:
            return {
                "status": "FAIL",
                "message": f"Excessive vibe drift detected: {max_drift:.3f} > 0.3",
                "avg_drift": avg_drift,
                "max_drift": max_drift,
                "total_iterations": len(records)
            }
        elif avg_drift > 0.1:
            return {
                "status": "WARNING",
                "message": f"Moderate vibe drift: {avg_drift:.3f} > 0.1",
                "avg_drift": avg_drift,
                "max_drift": max_drift,
                "total_iterations": len(records)
            }
        else:
            return {
                "status": "PASS",
                "message": f"Vibe drift within acceptable range: {avg_drift:.3f}",
                "avg_drift": avg_drift,
                "max_drift": max_drift,
                "total_iterations": len(records)
            }
    
    except FileNotFoundError:
        return {
            "status": "EMPTY",
            "message": f"Infinite tape not found at {loop_file}"
        }
    except json.JSONDecodeError as e:
        return {
            "status": "ERROR",
            "message": f"Invalid JSON in infinite tape: {e}"
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "message": f"Error checking loop: {e}"
        }


def main():
    parser = argparse.ArgumentParser(description="Check Figure 8 loop health")
    parser.add_argument("--loop", help="Path to infinite_tape.json", 
                       default="/tmp/infinite_tape.json")
    args = parser.parse_args()
    
    result = check_figure8_loop(args.loop)
    
    status_symbols = {
        "PASS": "✓",
        "WARNING": "⚠",
        "FAIL": "✗",
        "EMPTY": "○",
        "ERROR": "⚠"
    }
    
    symbol = status_symbols.get(result["status"], "?")
    print(f"{symbol} Figure 8 Loop Check: {result['message']}")
    
    if "avg_drift" in result:
        print(f"  Average drift: {result['avg_drift']:.3f}")
        print(f"  Maximum drift: {result['max_drift']:.3f}")
        print(f"  Total iterations: {result['total_iterations']}")
    
    # Exit codes
    if result["status"] == "FAIL":
        sys.exit(1)
    elif result["status"] == "ERROR":
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()

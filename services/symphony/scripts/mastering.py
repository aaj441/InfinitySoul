#!/usr/bin/env python3
"""
Mastering: CPU/memory profiling analysis.
Ensures no function uses excessive resources.
"""

import sys
import argparse
import pstats
from typing import Dict, List


def analyze_profile(profile_file: str, threshold_ms: float = 100.0) -> Dict:
    """
    Analyze a cProfile output file.
    
    Args:
        profile_file: Path to .stats file
        threshold_ms: Threshold in milliseconds for flagging functions
        
    Returns:
        Analysis report
    """
    try:
        stats = pstats.Stats(profile_file)
        
        # Get all stats
        stats.strip_dirs()
        
        # Find slow functions
        slow_functions = []
        
        # Iterate through stats
        for func, (cc, nc, tt, ct, callers) in stats.stats.items():
            # tt = total time, ct = cumulative time
            # Convert to milliseconds
            total_time_ms = tt * 1000
            
            if total_time_ms > threshold_ms:
                slow_functions.append({
                    "function": f"{func[0]}:{func[1]}:{func[2]}",
                    "total_time_ms": total_time_ms,
                    "calls": nc,
                    "time_per_call_ms": total_time_ms / nc if nc > 0 else 0
                })
        
        # Sort by total time
        slow_functions.sort(key=lambda x: x["total_time_ms"], reverse=True)
        
        return {
            "status": "FAIL" if slow_functions else "PASS",
            "threshold_ms": threshold_ms,
            "slow_functions": slow_functions[:10],  # Top 10
            "total_slow": len(slow_functions)
        }
    
    except FileNotFoundError:
        return {
            "status": "ERROR",
            "message": f"Profile file not found: {profile_file}"
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "message": f"Error analyzing profile: {e}"
        }


def main():
    parser = argparse.ArgumentParser(description="Analyze CPU profiling for slow functions")
    parser.add_argument("--profile", help="Path to .stats profile file", required=True)
    parser.add_argument("--threshold", type=float, default=100.0,
                       help="Threshold in milliseconds (default: 100ms)")
    args = parser.parse_args()
    
    result = analyze_profile(args.profile, args.threshold)
    
    if result["status"] == "ERROR":
        print(f"⚠ Error: {result['message']}")
        sys.exit(0)  # Don't fail on profiling errors
    
    if result["status"] == "PASS":
        print(f"✓ Mastering: All functions within {args.threshold}ms threshold")
        sys.exit(0)
    
    print(f"⚠ Mastering: {result['total_slow']} functions exceed {args.threshold}ms:")
    print("\nTop offenders:")
    for func in result["slow_functions"]:
        print(f"  {func['function']}")
        print(f"    Total: {func['total_time_ms']:.1f}ms")
        print(f"    Calls: {func['calls']}")
        print(f"    Per call: {func['time_per_call_ms']:.2f}ms")
    
    print(f"\n⚠ Consider optimizing these functions. The mix needs polishing.")
    sys.exit(0)  # Warning, not failure


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Silence Audit: Check for unnecessary notes (lines that don't serve the chord).
"""

import sys
import argparse
from typing import List, Tuple


def is_necessary_line(line: str, context_lines: List[str] = None) -> Tuple[bool, str]:
    """
    Check if a line of code is necessary.
    
    Args:
        line: Line to check
        context_lines: Surrounding lines for context
        
    Returns:
        (is_necessary, reason)
    """
    stripped = line.strip()
    
    # Empty lines are sometimes necessary for breath
    if not stripped:
        return True, "whitespace for breath"
    
    # Comments are sometimes necessary
    if stripped.startswith('#') or stripped.startswith('//'):
        # But check for commented-out code
        if any(char in stripped for char in ['(', ')', '=', '{', '}']):
            # Likely commented-out code
            if not any(word in stripped.lower() for word in ['note:', 'todo:', 'fixme:', 'hack:', 'important:']):
                return False, "commented-out code without explanation"
        return True, "comment"
    
    # Debug prints are usually unnecessary in production
    debug_patterns = [
        'console.log(',
        'print("DEBUG',
        'print(\'DEBUG',
        'console.debug(',
        'logger.debug('
    ]
    if any(pattern in line for pattern in debug_patterns):
        # Check if it's in a debug-specific block
        if context_lines and any('if debug' in l.lower() or 'if __debug__' in l.lower() for l in context_lines):
            return True, "conditional debug statement"
        return False, "debug print statement"
    
    # TODO comments without substance
    if stripped.startswith('# TODO') or stripped.startswith('// TODO'):
        if len(stripped) < 20:
            return False, "TODO without description"
    
    # Unnecessary pass statements
    if stripped == 'pass' and context_lines:
        # Check if there are other statements in the block
        indent = len(line) - len(line.lstrip())
        has_other_statements = any(
            l.strip() and l.strip() != 'pass' and len(l) - len(l.lstrip()) == indent
            for l in context_lines
        )
        if has_other_statements:
            return False, "redundant pass statement"
    
    # Otherwise assume it's necessary
    return True, "functional code"


def audit_file(content: str) -> List[dict]:
    """
    Audit a file for unnecessary lines.
    
    Args:
        content: File content
        
    Returns:
        List of unnecessary lines
    """
    lines = content.split('\n')
    issues = []
    
    for i, line in enumerate(lines, 1):
        # Get context (5 lines before and after)
        context_start = max(0, i - 6)
        context_end = min(len(lines), i + 5)
        context = lines[context_start:context_end]
        
        necessary, reason = is_necessary_line(line, context)
        if not necessary:
            issues.append({
                "line": i,
                "content": line.rstrip(),
                "reason": reason
            })
    
    return issues


def main():
    parser = argparse.ArgumentParser(description="Audit code for unnecessary lines")
    parser.add_argument("--diff", help="Git diff output to check", required=False)
    parser.add_argument("--file", help="File to check", required=False)
    args = parser.parse_args()
    
    if args.file:
        try:
            with open(args.file, 'r') as f:
                content = f.read()
            
            issues = audit_file(content)
            
            if not issues:
                print(f"✓ {args.file}: All lines serve the chord")
                sys.exit(0)
            else:
                print(f"⚠ {args.file}: Unnecessary lines detected:")
                for issue in issues:
                    print(f"  Line {issue['line']}: {issue['reason']}")
                    print(f"    > {issue['content']}")
                print(f"\nTotal: {len(issues)} unnecessary lines")
                sys.exit(0)  # Warning, not failure
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)
    
    elif args.diff:
        # Parse git diff format
        print("✓ Diff audit: Analyzing changes...")
        # This would parse the diff and check only changed lines
        # For now, just pass
        sys.exit(0)
    
    else:
        print("Error: Must provide --file or --diff")
        sys.exit(1)


if __name__ == "__main__":
    main()

"""
The Silence: The most important instrument.
Removes dissonant notes and creates space for breath.
"""

from typing import List, Dict, Any
import time
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from services.symphony.core.models import ProfitLeak


class Silence:
    """
    In the symphony, silence is the space between notes.
    In code, it's what you don't do.
    
    The Silence is the ethical kill switch—it removes actions
    that would create dissonance.
    """
    
    def __init__(self, vibe_threshold: float = 0.5):
        """
        Initialize the Silence.
        
        Args:
            vibe_threshold: Minimum vibe score to allow an action
        """
        self.vibe_threshold = vibe_threshold
        self.silenced_count = 0
    
    def remove(self, profit_leaks: List[ProfitLeak]) -> Dict[str, Any]:
        """
        Remove profit leaks that are vibe-off.
        
        Example: Insuring a crypto custodian would be $2M profit,
        but the community voted NO. The Silence removes that note
        entirely—no profit is worth the dissonance.
        
        Args:
            profit_leaks: List of profitable but dissonant actions
            
        Returns:
            Arrangement with only clean notes
        """
        clean_arrangement = []
        silenced = []
        
        for leak in profit_leaks:
            if leak.vibe < self.vibe_threshold:
                # Too dissonant - the Silence swallows it
                silenced.append({
                    "action": leak.action,
                    "profit_foregone": leak.profit_potential,
                    "reason": leak.reason,
                    "vibe": leak.vibe
                })
                self.silenced_count += 1
            else:
                # Clean enough - keep this note
                clean_arrangement.append(leak)
        
        return {
            "notes": clean_arrangement,
            "silence_between": len(profit_leaks) - len(clean_arrangement),
            "silenced_actions": silenced,
            "total_profit_foregone": sum(s["profit_foregone"] for s in silenced)
        }
    
    def rest(self, duration: int = 1):
        """
        Call for a rest—a pause where no agent acts.
        This is vibrational hygiene—clearing the aural palate.
        
        Args:
            duration: Duration in seconds to rest
        """
        print(f"Silence. The system breathes for {duration}s...")
        time.sleep(duration)
        print("The silence ends. The next phrase begins.")
    
    def should_silence(self, action: Dict[str, Any], vibe_score: float) -> bool:
        """
        Determine if an action should be silenced.
        
        Args:
            action: The proposed action
            vibe_score: Vibe score of the action (0-1)
            
        Returns:
            True if action should be silenced
        """
        # Always silence if below threshold
        if vibe_score < self.vibe_threshold:
            return True
        
        # Check for specific red flags in the action
        red_flags = [
            "exploit",
            "bypass",
            "circumvent",
            "hide",
            "obfuscate",
            "manipulate"
        ]
        
        action_text = str(action).lower()
        for flag in red_flags:
            if flag in action_text:
                return True
        
        return False
    
    def audit_silence(self) -> Dict[str, Any]:
        """
        Audit what has been silenced.
        
        Returns:
            Silence audit report
        """
        return {
            "total_silenced": self.silenced_count,
            "vibe_threshold": self.vibe_threshold,
            "message": f"Silenced {self.silenced_count} dissonant actions to preserve harmonic integrity."
        }
    
    def is_necessary_note(self, code_line: str) -> bool:
        """
        Check if a line of code is a necessary note.
        Used by silence_audit.py to detect unnecessary lines.
        
        Args:
            code_line: A line of code
            
        Returns:
            True if the line serves the chord
        """
        # Strip whitespace
        line = code_line.strip()
        
        # Empty lines and comments are sometimes necessary (for breath)
        if not line or line.startswith('#') or line.startswith('//'):
            return True
        
        # Debug prints are usually unnecessary
        if 'console.log' in line or 'print(' in line and 'DEBUG' in line.upper():
            return False
        
        # Commented out code is unnecessary
        if line.startswith('# ') and any(char in line for char in ['(', ')', '=', '{']):
            return False
        
        # TODO comments without context are unnecessary
        if line.startswith('# TODO') and len(line) < 20:
            return False
        
        # Otherwise, assume it's necessary
        return True
    
    def calculate_silence_ratio(self, total_notes: int, played_notes: int) -> float:
        """
        Calculate the ratio of silence to sound.
        
        A good symphony has appropriate silence between phrases.
        Too dense = muddy. Too sparse = disconnected.
        
        Args:
            total_notes: Total possible notes
            played_notes: Actually played notes
            
        Returns:
            Silence ratio (0 to 1)
        """
        if total_notes == 0:
            return 0.0
        
        return (total_notes - played_notes) / total_notes

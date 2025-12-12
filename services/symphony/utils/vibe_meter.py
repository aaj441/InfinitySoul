"""
The VibeMeter: Detects "off-ness" in agent outputs.
Measures emotional residue and ethical alignment.
"""

from typing import Dict, Any
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from services.symphony.core.models import Vibe, VibeSignature


class VibeMeter:
    """
    The VibeMeter measures the emotional residue of agent actions.
    
    It asks:
    - Was this action generous or extractive?
    - Did it empower or diminish?
    - Is the energy clean or muddy?
    """
    
    def __init__(self):
        self.baseline_vibe = 0.7  # Neutral baseline
    
    def read(
        self,
        sovereignty_delta: float = 0.0,
        dignity_delta: float = 0.0,
        defense_delta: float = 0.0,
        profit_delta: float = 0.0
    ) -> Vibe:
        """
        Read the vibe of an action based on its impact deltas.
        
        Args:
            sovereignty_delta: Change in user sovereignty (-1 to 1)
            dignity_delta: Change in human dignity (-1 to 1)
            defense_delta: Change in community defense (-1 to 1)
            profit_delta: Change in profit (can be any value)
            
        Returns:
            Vibe object with signature and metrics
        """
        # Calculate generosity: positive deltas in sovereignty/dignity/defense
        generosity = (sovereignty_delta + dignity_delta + defense_delta) / 3
        
        # Determine signature based on deltas
        if sovereignty_delta < -0.3 or dignity_delta < -0.3:
            signature = VibeSignature.DIMINISHING
        elif profit_delta > 0 and generosity < -0.1:
            signature = VibeSignature.EXTRACTIVE
        elif generosity > 0.3:
            signature = VibeSignature.GENEROUS
        elif sovereignty_delta > 0.2 or dignity_delta > 0.2:
            signature = VibeSignature.EMPOWERING
        elif abs(generosity) < 0.1 and abs(profit_delta) < 0.1:
            signature = VibeSignature.CLEAN
        else:
            # Check if there's muddiness (conflicting signals)
            if profit_delta > 0 and generosity < 0:
                signature = VibeSignature.MUDDY
            else:
                signature = VibeSignature.WARM
        
        # Determine aura
        if signature in [VibeSignature.GENEROUS, VibeSignature.EMPOWERING]:
            aura = "warm"
        elif signature in [VibeSignature.EXTRACTIVE, VibeSignature.DIMINISHING]:
            aura = "cold"
        elif signature == VibeSignature.MUDDY:
            aura = "muddy"
        else:
            aura = "neutral"
        
        # Calculate confidence based on clarity of signal
        signal_clarity = abs(generosity) + abs(sovereignty_delta)
        confidence = min(0.95, 0.6 + signal_clarity * 0.3)
        
        # Calculate sovereignty score
        sovereignty = max(0.0, min(1.0, 0.5 + sovereignty_delta))
        
        return Vibe(
            signature=signature,
            confidence=confidence,
            generosity=max(0.0, min(1.0, 0.5 + generosity)),
            sovereignty=sovereignty,
            aura=aura,
            sovereignty_delta=sovereignty_delta,
            dignity_delta=dignity_delta,
            defense_delta=defense_delta,
            profit_delta=profit_delta
        )
    
    def detect_dissonance(self, vibe: Vibe) -> bool:
        """
        Detect if a vibe is dissonant (off).
        
        Args:
            vibe: The vibe to check
            
        Returns:
            True if dissonant
        """
        # Dissonant if extractive, diminishing, or muddy
        if vibe.signature in [
            VibeSignature.EXTRACTIVE,
            VibeSignature.DIMINISHING,
            VibeSignature.MUDDY
        ]:
            return True
        
        # Also dissonant if overall score is too low
        if vibe.overall_score() < 0.5:
            return True
        
        return False
    
    def measure_drift(self, vibe1: Vibe, vibe2: Vibe) -> float:
        """
        Measure drift between two vibes (for Figure 8 loop).
        
        Args:
            vibe1: First vibe
            vibe2: Second vibe
            
        Returns:
            Drift magnitude (0 to 1)
        """
        score_drift = abs(vibe1.overall_score() - vibe2.overall_score())
        generosity_drift = abs(vibe1.generosity - vibe2.generosity)
        sovereignty_drift = abs(vibe1.sovereignty - vibe2.sovereignty)
        
        return (score_drift + generosity_drift + sovereignty_drift) / 3

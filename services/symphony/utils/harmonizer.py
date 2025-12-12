"""
The Harmonizer: Auto-tunes agent coordination.
Resolves ethical clashes and blends agent outputs into chords.
"""

from typing import List, Dict, Any
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from services.symphony.core.models import Vibe, VibeSignature


class Harmonizer:
    """
    The Harmonizer resolves dissonance and blends agent outputs.
    Like a mixing engineer, it adjusts levels to create harmony.
    """
    
    def __init__(self):
        self.target_harmony = 0.7  # Target harmonic balance
    
    def resolve(self, ethical_clashes: List[str]) -> float:
        """
        Resolve ethical clashes and return adjustment value.
        
        Args:
            ethical_clashes: List of ethical violation descriptions
            
        Returns:
            Vibe adjustment value (-1 to 1)
        """
        if not ethical_clashes:
            return 0.0
        
        # More clashes = bigger negative adjustment
        severity = len(ethical_clashes) / 10.0  # Normalize to max of 10 clashes
        severity = min(1.0, severity)
        
        # Return negative adjustment to cool down extractive behavior
        return -severity * 0.5
    
    def blend_vibes(self, vibes: List[Vibe]) -> Vibe:
        """
        Blend multiple vibes into a harmonic chord.
        
        Args:
            vibes: List of vibes from different agents
            
        Returns:
            Blended vibe
        """
        if not vibes:
            return Vibe(signature=VibeSignature.CLEAN)
        
        # Average the metrics
        avg_confidence = sum(v.confidence for v in vibes) / len(vibes)
        avg_generosity = sum(v.generosity for v in vibes) / len(vibes)
        avg_sovereignty = sum(v.sovereignty for v in vibes) / len(vibes)
        
        # Average the deltas
        avg_sov_delta = sum(v.sovereignty_delta for v in vibes) / len(vibes)
        avg_dig_delta = sum(v.dignity_delta for v in vibes) / len(vibes)
        avg_def_delta = sum(v.defense_delta for v in vibes) / len(vibes)
        avg_profit_delta = sum(v.profit_delta for v in vibes) / len(vibes)
        
        # Determine dominant signature
        signature_counts: Dict[VibeSignature, int] = {}
        for vibe in vibes:
            signature_counts[vibe.signature] = signature_counts.get(vibe.signature, 0) + 1
        
        dominant_signature = max(signature_counts.items(), key=lambda x: x[1])[0]
        
        # Determine aura based on dominant vibes
        warm_count = sum(1 for v in vibes if v.aura == "warm")
        cold_count = sum(1 for v in vibes if v.aura == "cold")
        muddy_count = sum(1 for v in vibes if v.aura == "muddy")
        
        if warm_count > len(vibes) / 2:
            aura = "warm"
        elif cold_count > len(vibes) / 3:
            aura = "cold"
        elif muddy_count > len(vibes) / 3:
            aura = "muddy"
        else:
            aura = "neutral"
        
        return Vibe(
            signature=dominant_signature,
            confidence=avg_confidence,
            generosity=avg_generosity,
            sovereignty=avg_sovereignty,
            aura=aura,
            sovereignty_delta=avg_sov_delta,
            dignity_delta=avg_dig_delta,
            defense_delta=avg_def_delta,
            profit_delta=avg_profit_delta
        )
    
    def check_resonance(self, vibe1: Vibe, vibe2: Vibe) -> bool:
        """
        Check if two vibes are in resonance (harmonically aligned).
        
        Args:
            vibe1: First vibe
            vibe2: Second vibe
            
        Returns:
            True if vibes resonate
        """
        # Check if signatures are compatible
        compatible_pairs = [
            {VibeSignature.GENEROUS, VibeSignature.EMPOWERING},
            {VibeSignature.CLEAN, VibeSignature.WARM},
            {VibeSignature.GENEROUS, VibeSignature.WARM},
            {VibeSignature.EMPOWERING, VibeSignature.WARM},
        ]
        
        signature_set = {vibe1.signature, vibe2.signature}
        
        # Same signature always resonates
        if len(signature_set) == 1:
            return True
        
        # Check compatible pairs
        for pair in compatible_pairs:
            if signature_set == pair or signature_set.issubset(pair):
                return True
        
        # Check if scores are close
        score_diff = abs(vibe1.overall_score() - vibe2.overall_score())
        return score_diff < 0.2
    
    def auto_tune(self, vibe: Vibe, target_signature: VibeSignature) -> Vibe:
        """
        Auto-tune a vibe toward a target signature.
        
        Args:
            vibe: The vibe to adjust
            target_signature: Desired signature
            
        Returns:
            Adjusted vibe
        """
        adjustments = {
            VibeSignature.GENEROUS: {"generosity": 0.8, "sovereignty": 0.9},
            VibeSignature.EMPOWERING: {"sovereignty": 0.9, "confidence": 0.9},
            VibeSignature.CLEAN: {"confidence": 0.8, "generosity": 0.6},
            VibeSignature.WARM: {"generosity": 0.7, "confidence": 0.8},
        }
        
        if target_signature in adjustments:
            adj = adjustments[target_signature]
            return Vibe(
                signature=target_signature,
                confidence=adj.get("confidence", vibe.confidence),
                generosity=adj.get("generosity", vibe.generosity),
                sovereignty=adj.get("sovereignty", vibe.sovereignty),
                aura="warm" if target_signature in [VibeSignature.GENEROUS, VibeSignature.WARM] else vibe.aura,
                sovereignty_delta=vibe.sovereignty_delta,
                dignity_delta=vibe.dignity_delta,
                defense_delta=vibe.defense_delta,
                profit_delta=vibe.profit_delta
            )
        
        return vibe

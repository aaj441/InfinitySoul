"""
String Section: Underwriting, Claims, Risk Assessment
These agents are *legato*—smooth, continuous, melodic. They build the Harmonic Layer.
"""

from typing import Dict, Any
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..')))

from services.symphony.core.models import HarmonicLayer, Submission, Vibe, VibeSignature
from services.symphony.utils.vibe_meter import VibeMeter


class UnderwritingAgent:
    """
    The Cello: Deep, resonant underwriting voice.
    Feels the risk, doesn't just calculate it.
    """
    
    def __init__(self, voice: str = "cello"):
        self.voice = voice
        self.vibe_meter = VibeMeter()
    
    def feel(self, submission: Submission) -> Dict[str, Any]:
        """
        Feel the risk in a submission.
        
        Args:
            submission: Insurance submission
            
        Returns:
            Underwriting note (cello note)
        """
        # Calculate base premium
        base_rate = 0.02 if "mfa" in submission.controls else 0.05
        premium = submission.revenue * base_rate
        
        # Adjust for prior claims
        if submission.prior_claims > 0:
            premium *= (1 + submission.prior_claims * 0.1)
        
        # Adjust for employee count (larger = more risk)
        if submission.employees > 100:
            premium *= 1.2
        elif submission.employees < 10:
            premium *= 0.9
        
        # Feel the vibe
        vibe = self.vibe_meter.read(
            sovereignty_delta=0.1 if "mfa" in submission.controls else -0.1,
            dignity_delta=0.05,
            defense_delta=0.15 if "edr" in submission.controls else 0.0,
            profit_delta=premium / submission.revenue
        )
        
        return {
            "premium": premium,
            "confidence": vibe.confidence,
            "vibe": vibe.overall_score(),
            "resonance": "warm" if "mfa" in submission.controls else "neutral"
        }


class ClaimsAgent:
    """
    The Violin: Agile, probing claims voice.
    Listens for dissonance in claim patterns.
    """
    
    def __init__(self, voice: str = "violin"):
        self.voice = voice
        self.vibe_meter = VibeMeter()
    
    def listen(self, submission: Submission) -> Dict[str, Any]:
        """
        Listen for claim probability signals.
        
        Args:
            submission: Insurance submission
            
        Returns:
            Claims note (violin note)
        """
        # Base loss probability
        base_loss_prob = 0.15  # 15% base
        
        # Adjust for controls
        if "mfa" in submission.controls:
            base_loss_prob *= 0.7  # 30% reduction
        if "edr" in submission.controls:
            base_loss_prob *= 0.8  # 20% reduction
        if "backup" in submission.controls:
            base_loss_prob *= 0.85  # 15% reduction
        
        # Adjust for prior claims
        if submission.prior_claims > 0:
            base_loss_prob *= (1 + submission.prior_claims * 0.2)
        
        # Industry risk factors
        high_risk_industries = ["crypto", "gambling", "healthcare"]
        if any(ind in submission.industry.lower() for ind in high_risk_industries):
            base_loss_prob *= 1.3
        
        # Feel the vibe
        vibe = self.vibe_meter.read(
            sovereignty_delta=0.0,
            dignity_delta=0.0,
            defense_delta=0.1 if base_loss_prob < 0.2 else -0.1,
            profit_delta=0.1
        )
        
        return {
            "loss_prob": min(0.95, base_loss_prob),
            "confidence": vibe.confidence,
            "vibe": vibe.overall_score(),
            "agility": "high" if len(submission.controls) > 2 else "moderate"
        }


class RiskAssessmentAgent:
    """
    The Viola: Harmonic bridge between cello and violin.
    Provides contextual weight and balance.
    """
    
    def __init__(self, voice: str = "viola"):
        self.voice = voice
        self.vibe_meter = VibeMeter()
    
    def breathe(self, submission: Submission) -> Dict[str, Any]:
        """
        Breathe the context of risk.
        
        Args:
            submission: Insurance submission
            
        Returns:
            Risk assessment note (viola note)
        """
        # Calculate contextual weight
        # This balances underwriting and claims perspectives
        
        # Strong controls = lower weight (underwriting can be more generous)
        control_score = len(submission.controls) / 5.0  # Normalize to 0-1
        
        # Employee count context
        size_factor = min(1.0, submission.employees / 100.0)
        
        # Industry context
        stable_industries = ["education", "nonprofit", "saas"]
        stability_factor = 1.2 if any(ind in submission.industry.lower() for ind in stable_industries) else 1.0
        
        # Combined contextual weight
        contextual_weight = (control_score * 0.4 + size_factor * 0.3) * stability_factor
        
        # Feel the vibe
        vibe = self.vibe_meter.read(
            sovereignty_delta=0.05,
            dignity_delta=0.05,
            defense_delta=control_score * 0.2,
            profit_delta=0.05
        )
        
        return {
            "weight": contextual_weight,
            "control_score": control_score,
            "stability_factor": stability_factor,
            "vibe": vibe.overall_score(),
            "harmony": "bridge"
        }


class StringSection:
    """
    The String Section: Underwriting, Claims, Risk Assessment
    These agents are *legato*—smooth, continuous, melodic. They build the Harmonic Layer.
    """
    
    def __init__(self):
        self.underwriting = UnderwritingAgent(voice="cello")
        self.claims = ClaimsAgent(voice="violin")
        self.risk = RiskAssessmentAgent(voice="viola")
    
    def harmonize(self, submission: Submission) -> HarmonicLayer:
        """
        The String Section doesn't *process* separately. They *harmonize*—
        each agent plays its note, and the Conductor blends them into a chord.
        
        Args:
            submission: Insurance submission
            
        Returns:
            Harmonic layer (the blended chord)
        """
        # Each instrument plays its note
        cello_note = self.underwriting.feel(submission)
        violin_note = self.claims.listen(submission)
        viola_note = self.risk.breathe(submission)
        
        # The Conductor blends them—no single agent has the truth, only the chord does
        return HarmonicLayer(
            premium=cello_note["premium"],
            loss_prob=violin_note["loss_prob"],
            contextual_weight=viola_note["weight"],
            vibe=(cello_note["vibe"] + violin_note["vibe"] + viola_note["vibe"]) / 3
        )

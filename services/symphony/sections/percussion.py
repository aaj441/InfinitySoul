"""
Percussion Section: Governance, Biometric, Finance
These agents are *tempo*—they keep the beat, the heartbeat, the pulse.
"""

from typing import Dict, Any
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..')))

from services.symphony.core.models import TempoLayer, SystemState
from services.symphony.utils.vibe_meter import VibeMeter


class GovernanceAgent:
    """
    The Kick Drum: The heartbeat of the community.
    Tracks community votes and governance pulse.
    """
    
    def __init__(self, voice: str = "kick_drum"):
        self.voice = voice
        self.vibe_meter = VibeMeter()
    
    def beat(self, state: SystemState) -> Dict[str, Any]:
        """
        Feel the heartbeat of community governance.
        
        Args:
            state: Current system state
            
        Returns:
            Governance pulse (kick drum beat)
        """
        governance_metrics = state.governance_metrics
        
        # Extract governance signals
        vote_participation = governance_metrics.get("vote_participation", 0.5)
        community_satisfaction = governance_metrics.get("satisfaction", 0.7)
        proposal_count = governance_metrics.get("proposals", 5)
        
        # Calculate BPM based on governance activity
        # High activity = faster tempo, low activity = slower
        base_bpm = 30
        activity_factor = (vote_participation + community_satisfaction) / 2
        bpm = int(base_bpm * (0.8 + activity_factor * 0.4))  # 24-36 BPM range
        
        vibe = self.vibe_meter.read(
            sovereignty_delta=vote_participation * 0.3,
            dignity_delta=community_satisfaction * 0.2,
            defense_delta=0.1,
            profit_delta=0.0  # Governance is not profit-driven
        )
        
        return {
            "bpm": bpm,
            "vibe": vibe.overall_score(),
            "vote_participation": vote_participation,
            "satisfaction": community_satisfaction,
            "heartbeat": "strong" if activity_factor > 0.7 else "moderate"
        }


class BiometricAgent:
    """
    The Snare: The snap of attention.
    Tracks individual health metrics (HRV, stress, focus).
    """
    
    def __init__(self, voice: str = "snare"):
        self.voice = voice
        self.vibe_meter = VibeMeter()
    
    def snap(self, state: SystemState) -> Dict[str, Any]:
        """
        Snap of attention - check biometric health.
        
        Args:
            state: Current system state
            
        Returns:
            Biometric pulse (snare snap)
        """
        health_metrics = state.health_metrics
        
        # Extract health signals
        hrv = health_metrics.get("hrv", 65)  # Heart Rate Variability
        stress_level = health_metrics.get("stress", 0.4)
        focus_score = health_metrics.get("focus", 0.7)
        
        # Normalize HRV to 0-1 (typical range 20-100)
        hrv_normalized = min(1.0, max(0.0, (hrv - 20) / 80))
        
        # Calculate overall health score
        health_score = (hrv_normalized + (1 - stress_level) + focus_score) / 3
        
        vibe = self.vibe_meter.read(
            sovereignty_delta=0.1 if health_score > 0.7 else -0.1,
            dignity_delta=0.1,
            defense_delta=health_score * 0.2,
            profit_delta=0.0  # Health is not profit-driven
        )
        
        return {
            "hrv": hrv_normalized,
            "health_score": health_score,
            "vibe": vibe.overall_score(),
            "stress_level": stress_level,
            "snap": "crisp" if health_score > 0.7 else "muffled"
        }


class FinanceAgent:
    """
    The Hi-Hat: The shimmer of capital.
    Tracks cash flow, runway, and financial health.
    """
    
    def __init__(self, voice: str = "hi-hat"):
        self.voice = voice
        self.vibe_meter = VibeMeter()
    
    def shimmer(self, state: SystemState) -> Dict[str, Any]:
        """
        Shimmer of capital - check financial health.
        
        Args:
            state: Current system state
            
        Returns:
            Financial pulse (hi-hat shimmer)
        """
        financial_metrics = state.financial_metrics
        
        # Extract financial signals
        cash_balance = financial_metrics.get("cash", 100000)
        monthly_burn = financial_metrics.get("burn", 10000)
        monthly_revenue = financial_metrics.get("revenue", 15000)
        
        # Calculate runway in months
        if monthly_burn > 0:
            net_burn = monthly_burn - monthly_revenue
            if net_burn > 0:
                runway = cash_balance / net_burn
            else:
                runway = 999  # Profitable, infinite runway
        else:
            runway = 999
        
        # Calculate financial health
        burn_rate_ratio = monthly_revenue / monthly_burn if monthly_burn > 0 else 1.0
        health_factor = min(1.0, burn_rate_ratio)
        
        vibe = self.vibe_meter.read(
            sovereignty_delta=0.1 if runway > 12 else -0.1,
            dignity_delta=0.0,
            defense_delta=0.1 if health_factor > 0.8 else -0.1,
            profit_delta=monthly_revenue / 100000  # Normalize profit delta
        )
        
        return {
            "runway": min(runway, 999),
            "vibe": vibe.overall_score(),
            "cash_balance": cash_balance,
            "burn_rate_ratio": burn_rate_ratio,
            "shimmer": "bright" if health_factor > 0.8 else "dim"
        }


class PercussionSection:
    """
    The Percussion Section: Governance, Biometric, Finance
    These agents are *tempo*—they keep the beat, the heartbeat, the pulse.
    """
    
    def __init__(self):
        self.governance = GovernanceAgent(voice="kick_drum")
        self.biometric = BiometricAgent(voice="snare")
        self.finance = FinanceAgent(voice="hi-hat")
    
    def pulse(self, state: SystemState) -> TempoLayer:
        """
        The Percussion Section doesn't *analyze*—it *feels the pulse*.
        Is the system in 4/4 (stable) or 7/8 (complex)? Adjust the beat.
        
        Args:
            state: Current system state
            
        Returns:
            Tempo layer (the pulse)
        """
        # Each instrument plays its beat
        heartbeat = self.governance.beat(state)
        snap = self.biometric.snap(state)
        shimmer = self.finance.shimmer(state)
        
        # The Conductor adjusts tempo based on pulse
        return TempoLayer(
            bpm=heartbeat["bpm"],
            health=snap["health_score"],
            runway=shimmer["runway"],
            vibe=heartbeat["vibe"] * snap["vibe"] * shimmer["vibe"]
        )

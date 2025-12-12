"""
The Conductor: The sensitive membrane that feels the room.
Not a God object, but a listener and adjuster.
"""

from typing import List, Dict, Any
import time
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from services.symphony.core.models import (
    ConductorScore,
    Vibe,
    ProfitLeak
)
from services.symphony.utils.metronome import Metronome
from services.symphony.utils.vibe_meter import VibeMeter
from services.symphony.utils.harmonizer import Harmonizer
from services.symphony.utils.silence import Silence


class Agent:
    """
    Base Agent class for the ensemble.
    All agents have latency, vibe, ROI, and can apply adjustments.
    """
    
    def __init__(self, name: str, voice: str = "neutral"):
        self.name = name
        self.voice = voice
        self.latency = 0.0
        self.vibe = 0.8  # Default vibe
        self.roi = 15.0  # Default ROI
        self.last_ethics_violation: str = ""
    
    def apply_vibe(self, adjustment: float):
        """Apply vibe adjustment from the Conductor."""
        self.vibe = max(0.0, min(1.0, self.vibe + adjustment))
    
    def apply_tempo(self, adjustment: float):
        """Apply tempo adjustment from the Conductor."""
        # Tempo adjustment affects expected latency
        pass
    
    def apply_arrangement(self, adjustments: List[str]):
        """Apply arrangement adjustments from the Conductor."""
        # Remove certain behaviors from the agent's repertoire
        pass


class Conductor:
    """
    The Conductor doesn't execute. It *feels* the room and adjusts the mix.
    
    It senses dissonance:
    - Latency spikes (agents too slow)
    - Ethical violations (vibe off)
    - Profit leaks (profitable but dissonant actions)
    
    And adjusts the arrangement in real-time.
    """
    
    def __init__(self):
        self.metronome = Metronome(bpm=30)  # 30-second quote cycles
        self.vibe_meter = VibeMeter()
        self.harmonizer = Harmonizer()
        self.silence = Silence()
        self.ensemble: List[Agent] = []
    
    def add_agent(self, agent: Agent):
        """Add an agent to the ensemble."""
        self.ensemble.append(agent)
    
    def listen(self, ensemble: List[Agent] = None) -> ConductorScore:
        """
        The Conductor *listens* to the entire ensemble and returns a *score*—
        not a command—suggesting adjustments.
        
        Args:
            ensemble: Optional list of agents to listen to. If None, uses self.ensemble
            
        Returns:
            ConductorScore with suggested adjustments
        """
        if ensemble is None:
            ensemble = self.ensemble
        
        if not ensemble:
            # Empty ensemble - return neutral score
            return ConductorScore()
        
        # Check for latency dissonance
        latency_spikes = [
            a.latency for a in ensemble 
            if a.latency > self.metronome.threshold
        ]
        
        # Check for ethical dissonance (vibe off)
        ethical_clashes = [
            a.last_ethics_violation for a in ensemble 
            if a.vibe < 0.7 and a.last_ethics_violation
        ]
        
        # Check for profit dissonance (notes out of tune)
        profit_leaks = [
            ProfitLeak(
                action=a.name,
                profit_potential=a.roi * 100000,  # Rough estimate
                vibe=a.vibe,
                reason=f"ROI {a.roi} but vibe {a.vibe:.2f}"
            )
            for a in ensemble 
            if a.roi < 10 or a.vibe < 0.5
        ]
        
        # The Conductor *feels* the room and whispers adjustments
        tempo_adjustment = self.metronome.calibrate(latency_spikes)
        vibe_adjustment = self.harmonizer.resolve(ethical_clashes)
        
        # The Silence removes dissonant profit leaks
        arrangement = self.silence.remove(profit_leaks)
        
        return ConductorScore(
            tempo_adjustment=tempo_adjustment,
            vibe_adjustment=vibe_adjustment,
            arrangement_adjustment=[s["action"] for s in arrangement.get("silenced_actions", [])],
            latency_spikes=latency_spikes,
            ethical_clashes=ethical_clashes,
            profit_leaks=[leak.model_dump() for leak in profit_leaks]
        )
    
    def adjust(self, score: ConductorScore):
        """
        The Conductor doesn't *order*. It *adjusts the mix*—
        maybe an agent needs more reverb (compute),
        maybe another needs less attack (slower cadence).
        
        Args:
            score: The ConductorScore from listen()
        """
        for agent in self.ensemble:
            # Apply vibe adjustment
            agent.apply_vibe(score.vibe_adjustment)
            
            # Apply tempo adjustment
            agent.apply_tempo(score.tempo_adjustment)
            
            # Apply arrangement adjustments
            agent.apply_arrangement(score.arrangement_adjustment)
    
    def conduct(self, duration_beats: int = 1) -> Dict[str, Any]:
        """
        Conduct a full cycle: listen → adjust → play.
        
        Args:
            duration_beats: Number of beats to conduct
            
        Returns:
            Performance report
        """
        performance_log = []
        
        for beat in range(duration_beats):
            # Mark the beat
            elapsed = self.metronome.beat()
            
            # Listen to the ensemble
            score = self.listen()
            
            # Adjust based on what we heard
            self.adjust(score)
            
            # Log this beat
            performance_log.append({
                "beat": beat + 1,
                "elapsed": elapsed,
                "tempo_adjustment": score.tempo_adjustment,
                "vibe_adjustment": score.vibe_adjustment,
                "latency_spikes": len(score.latency_spikes),
                "ethical_clashes": len(score.ethical_clashes),
                "profit_leaks_removed": len(score.arrangement_adjustment)
            })
            
            # Brief silence between beats (vibrational hygiene)
            if beat < duration_beats - 1:
                self.silence.rest(duration=0.1)
        
        return {
            "total_beats": duration_beats,
            "performance_log": performance_log,
            "final_ensemble_vibe": sum(a.vibe for a in self.ensemble) / len(self.ensemble) if self.ensemble else 0,
            "silence_audit": self.silence.audit_silence()
        }
    
    def feel_the_room(self) -> Dict[str, Any]:
        """
        The Conductor feels the room and returns a vibe report.
        
        Returns:
            Room vibe report
        """
        if not self.ensemble:
            return {"vibe": "empty", "message": "No ensemble present"}
        
        vibes = [
            self.vibe_meter.read(
                sovereignty_delta=0.1 if a.vibe > 0.7 else -0.1,
                dignity_delta=0.05,
                defense_delta=0.0,
                profit_delta=a.roi
            )
            for a in self.ensemble
        ]
        
        blended_vibe = self.harmonizer.blend_vibes(vibes)
        
        return {
            "ensemble_size": len(self.ensemble),
            "blended_vibe": blended_vibe.model_dump(),
            "avg_latency": sum(a.latency for a in self.ensemble) / len(self.ensemble),
            "avg_roi": sum(a.roi for a in self.ensemble) / len(self.ensemble),
            "dissonant_agents": sum(1 for a in self.ensemble if a.vibe < 0.6),
            "resonance": sum(
                1 for i, a1 in enumerate(self.ensemble)
                for a2 in self.ensemble[i+1:]
                if self.harmonizer.check_resonance(
                    self.vibe_meter.read(sovereignty_delta=a1.vibe),
                    self.vibe_meter.read(sovereignty_delta=a2.vibe)
                )
            )
        }

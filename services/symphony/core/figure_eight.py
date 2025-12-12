"""
The Figure 8: Double-tracking infinity loops.
Like Elliott Smith layering vocals and guitar.
"""

from typing import Dict, Any, List
import time
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from services.symphony.core.models import (
    Output,
    Vibe,
    Adjustment,
    InfinityTapeRecord,
    VibeSignature
)
from services.symphony.utils.vibe_meter import VibeMeter
from services.symphony.core.conductor import Conductor


class InfiniteTape:
    """
    The Infinite Tape: Records every iteration of the Figure 8 loop.
    Like an 8-track, but digital and infinite.
    """
    
    def __init__(self, filepath: str = "/tmp/infinite_tape.json"):
        self.filepath = filepath
        self.records: List[InfinityTapeRecord] = []
        self.count = 0
        self.current_aura = "neutral"
    
    def record(
        self,
        iteration: int,
        function: Dict[str, Any],
        vibe: Vibe,
        adjustment: Adjustment
    ):
        """
        Record a single iteration to the tape.
        
        Args:
            iteration: Iteration number
            function: Function output (Track 1)
            vibe: Vibe output (Track 2)
            adjustment: Adjustment for next iteration
        """
        record = InfinityTapeRecord(
            iteration=iteration,
            function_output=function,
            vibe_output=vibe,
            adjustment=adjustment,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S")
        )
        
        self.records.append(record)
        self.count = iteration + 1
        self.current_aura = vibe.aura
    
    def save(self):
        """Save tape to disk."""
        try:
            with open(self.filepath, 'w') as f:
                json.dump(
                    [r.dict() for r in self.records],
                    f,
                    indent=2
                )
        except Exception as e:
            print(f"Warning: Could not save infinite tape: {e}")
    
    def load(self):
        """Load tape from disk."""
        try:
            with open(self.filepath, 'r') as f:
                data = json.load(f)
                self.records = [InfinityTapeRecord(**r) for r in data]
                self.count = len(self.records)
                if self.records:
                    self.current_aura = self.records[-1].vibe_output.aura
        except FileNotFoundError:
            pass
        except Exception as e:
            print(f"Warning: Could not load infinite tape: {e}")
    
    def get_last_n(self, n: int = 10) -> List[InfinityTapeRecord]:
        """Get last N records from the tape."""
        return self.records[-n:] if len(self.records) >= n else self.records
    
    def calculate_drift(self) -> float:
        """
        Calculate vibe drift across recent iterations.
        
        Returns:
            Drift magnitude (0 to 1)
        """
        if len(self.records) < 2:
            return 0.0
        
        recent = self.get_last_n(5)
        if len(recent) < 2:
            return 0.0
        
        vibe_meter = VibeMeter()
        total_drift = 0.0
        comparisons = 0
        
        for i in range(len(recent) - 1):
            drift = vibe_meter.measure_drift(
                recent[i].vibe_output,
                recent[i + 1].vibe_output
            )
            total_drift += drift
            comparisons += 1
        
        return total_drift / comparisons if comparisons > 0 else 0.0


class RaWkusAgent:
    """
    Base agent class for Figure 8 execution.
    RaWkus = RAUCOUS (Revolutionary Actuarial Underwriting Collective Universal System)
    """
    
    def __init__(self, name: str):
        self.name = name
    
    def propose(self, input_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Propose an action based on input.
        This is Track 1 (the function).
        
        Args:
            input_dict: Input data
            
        Returns:
            Proposal output
        """
        # Default implementation - override in subclasses
        return {
            "proposal": f"{self.name} proposes action",
            "confidence": 0.8,
            **input_dict
        }


class FigureEight:
    """
    Every agent action is double-tracked:
    - Track 1: The "Function" (what it does)
    - Track 2: The "Vibe" (how it feels, the emotional residue)
    
    The loop is infinite: Function → Vibe → Adjust → Function → Vibe...
    """
    
    # Constants
    SAVE_FREQUENCY = 10  # Save tape every N iterations
    
    def __init__(self, agent: RaWkusAgent, tape_filepath: str = "/tmp/infinite_tape.json"):
        self.agent = agent
        self.loop = InfiniteTape(filepath=tape_filepath)
        self.vibe_meter = VibeMeter()
        self.conductor = Conductor()
    
    def execute_with_vibe(self, input_data: Dict[str, Any]) -> Output:
        """
        Execute an action with double-tracking: function + vibe.
        
        Args:
            input_data: Input for the agent
            
        Returns:
            Output with both data and feeling
        """
        # Track 1: Record the function (the note)
        function_output = self.agent.propose(input_data)
        
        # Track 2: Record the vibe (the emotional residue of the note)
        vibe_output = self._feel_the_vibe(function_output)
        
        # Calculate adjustment based on vibe
        adjustment = self._adjust_based_on_vibe(function_output, vibe_output)
        
        # Loop it: The vibe feeds back into the next iteration
        self.loop.record(
            iteration=self.loop.count,
            function=function_output,
            vibe=vibe_output,
            adjustment=adjustment
        )
        
        # The Conductor listens to the loop and whispers micro-adjustments
        # (In a full implementation, the Conductor would have the full ensemble)
        
        # Save the tape periodically
        if self.loop.count % self.SAVE_FREQUENCY == 0:
            self.loop.save()
        
        return Output(
            data=function_output,
            feeling=vibe_output,
            aura=self.loop.current_aura
        )
    
    def _feel_the_vibe(self, output: Dict[str, Any]) -> Vibe:
        """
        The VibeMeter measures emotional residue:
        - Was this action generous or extractive?
        - Did it empower or diminish?
        - Is the energy clean or muddy?
        
        Args:
            output: Function output to analyze
            
        Returns:
            Vibe reading
        """
        return self.vibe_meter.read(
            sovereignty_delta=output.get("sovereignty_delta", 0),
            dignity_delta=output.get("dignity_delta", 0),
            defense_delta=output.get("defense_delta", 0),
            profit_delta=output.get("profit_delta", 0)
        )
    
    def _adjust_based_on_vibe(self, function: Dict[str, Any], vibe: Vibe) -> Adjustment:
        """
        If the vibe is "extractive," the next iteration is softer, more generous.
        If the vibe is "diminishing," the next iteration is more empowering.
        The loop is **self-correcting**—it tends toward **clean, generous energy**.
        
        Args:
            function: Function output
            vibe: Vibe reading
            
        Returns:
            Adjustment for next iteration
        """
        if vibe.signature == VibeSignature.EXTRACTIVE:
            return Adjustment(
                gain=-0.2,
                generosity=+0.3,
                tempo="slower"
            )
        elif vibe.signature == VibeSignature.DIMINISHING:
            return Adjustment(
                power_xfer=+0.5,
                empowerment=+0.4,
                tempo="warmer"
            )
        elif vibe.signature == VibeSignature.MUDDY:
            return Adjustment(
                gain=-0.1,
                generosity=+0.1,
                tempo="slower"
            )
        else:
            # The vibe is clean, push forward
            return Adjustment(
                gain=+0.1,
                tempo="steady"
            )
    
    def check_loop_health(self) -> Dict[str, Any]:
        """
        Check the health of the Figure 8 loop.
        
        Returns:
            Loop health report
        """
        drift = self.loop.calculate_drift()
        recent_vibes = [r.vibe_output for r in self.loop.get_last_n(5)]
        
        avg_vibe_score = sum(v.overall_score() for v in recent_vibes) / len(recent_vibes) if recent_vibes else 0.0
        
        # Determine loop status
        if drift > 0.3:
            status = "unstable"
        elif drift > 0.1:
            status = "drifting"
        else:
            status = "stable"
        
        return {
            "status": status,
            "drift": drift,
            "avg_vibe_score": avg_vibe_score,
            "total_iterations": self.loop.count,
            "current_aura": self.loop.current_aura,
            "recommendation": self._get_recommendation(status, drift, avg_vibe_score)
        }
    
    def _get_recommendation(self, status: str, drift: float, vibe_score: float) -> str:
        """Get recommendation based on loop health."""
        if status == "unstable":
            return "Loop is unstable. Consider resetting or adjusting agent parameters."
        elif drift > 0.1 and vibe_score < 0.5:
            return "Loop is drifting toward dissonance. Apply corrective adjustments."
        elif vibe_score > 0.8:
            return "Loop is healthy and resonant. Continue current trajectory."
        else:
            return "Loop is stable. Monitor for drift."

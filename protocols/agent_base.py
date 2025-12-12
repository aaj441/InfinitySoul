"""
RawkusAgent Base Class

Every agent is an MC. They must pass the Rawkus Bar (ethics) before they spit.

"Lyrical integrity first, major label money second, indie soul always."
"""

import sys
import os
from typing import Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

# Add protocols to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'protocols'))

from ethical_constraint_engine import (
    EthicalConstraintEngine,
    ProfitOracle,
    ValueLedger,
    CornyBarError,
    NoHitError
)


@dataclass
class Verse:
    """A verse spit by an agent (the result of an action)."""
    data: Dict[str, Any]
    vibe: Optional['VibeReading'] = None
    aura: str = "clean"
    timestamp: str = ""
    
    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()


@dataclass
class VibeReading:
    """The emotional residue of a verse (Figure 8 double-tracking)."""
    sovereignty_delta: float
    dignity_delta: float
    defense_delta: float
    profit_delta: float
    overall_vibe: str = "neutral"
    
    def __post_init__(self):
        # Calculate overall vibe
        total_delta = (
            self.sovereignty_delta +
            self.dignity_delta +
            self.defense_delta +
            self.profit_delta
        )
        
        if total_delta > 0.5:
            self.overall_vibe = "immaculate"
        elif total_delta > 0:
            self.overall_vibe = "positive"
        elif total_delta == 0:
            self.overall_vibe = "neutral"
        elif total_delta > -0.5:
            self.overall_vibe = "concerning"
        else:
            self.overall_vibe = "corrupted"


class VibeMeter:
    """Reads the emotional residue of agent actions."""
    
    def read(
        self,
        sovereignty_delta: float = 0,
        dignity_delta: float = 0,
        defense_delta: float = 0,
        profit_delta: float = 0
    ) -> VibeReading:
        """Read the vibe of an action."""
        return VibeReading(
            sovereignty_delta=sovereignty_delta,
            dignity_delta=dignity_delta,
            defense_delta=defense_delta,
            profit_delta=profit_delta
        )


class Conductor:
    """
    The Conductor blends verses into a cohesive mix.
    This is the orchestration layer that coordinates all agents.
    """
    
    def __init__(self):
        self.verses = []
    
    def blend(self, verse: Verse, vibe: VibeReading):
        """Blend a verse into the overall mix."""
        verse.vibe = vibe
        self.verses.append(verse)
        
        # Log to console (in production, would log to Discord)
        self._log_verse(verse)
    
    def _log_verse(self, verse: Verse):
        """Log verse to output."""
        print(f"[{verse.timestamp}] Verse blended:")
        print(f"  Aura: {verse.aura}")
        print(f"  Vibe: {verse.vibe.overall_vibe if verse.vibe else 'unknown'}")
        print(f"  Data: {verse.data}")


class RawkusAgent:
    """
    The RawkusAgent: Lyrical integrity first, major label money second, indie soul always.
    
    Every agent inherits from this base class and must:
    1. Pass the Rawkus Bar (ethics check)
    2. Have major label appeal (profit >10x)
    3. Stay indie (community-owned, transparent)
    """
    
    def __init__(self, role: str, voice: str):
        """
        Initialize a Rawkus agent.
        
        Args:
            role: MC name (e.g., "Scout", "Underwriter", "Claims")
            voice: Instrument (e.g., "trumpet", "cello", "kick_drum")
        """
        self.role = role
        self.voice = voice
        self.ethics = EthicalConstraintEngine()
        self.profit = ProfitOracle()
        self.ledger = ValueLedger()
        self.conductor = Conductor()
    
    def spit(self, bars: Dict[str, Any]) -> Verse:
        """
        An agent doesn't "execute"—it spits a verse. The verse must:
        1. Pass the Rawkus Bar (ethics)
        2. Have major label appeal (profit >10x)
        3. Stay indie (community owns 20%)
        
        Args:
            bars: Action parameters
            
        Returns:
            Verse object containing action results
            
        Raises:
            CornyBarError: If ethics check fails
            NoHitError: If profit check fails
        """
        # Step 1: Pass the Rawkus Bar (lyrical integrity)
        ethics_ok, ethics_bars = self.ethics.check(bars)
        if not ethics_ok:
            self._log_bars(bars, ethics_bars, status="CORNY")
            raise CornyBarError(f"Lyrics weak: {ethics_bars}")
        
        # Step 2: Major label appeal (profit >10x)
        profit_ok, profit_bars = self.profit.check(bars)
        if not profit_ok:
            self._log_bars(bars, profit_bars, status="NO_HIT")
            raise NoHitError(f"Not a banger: {profit_bars}")
        
        # Step 3: Spit the verse (the action)
        verse_data = self._spit(bars)
        
        # Step 4: Double-track the vibe (Figure 8)
        vibe = self._feel_the_vibe(verse_data)
        
        # Step 5: Create verse object
        verse = Verse(data=verse_data, vibe=vibe, aura="clean")
        
        # Step 6: The Conductor blends it into the mix
        self.conductor.blend(verse, vibe)
        
        return verse
    
    def _log_bars(self, bars: Dict, rejection: str, status: str):
        """
        Log rejected bars publicly (transparency is the moat).
        
        In production, this would log to Discord #bar-rejections.
        """
        print(f"\n❌ MC {self.role} spit {status} bars")
        print(f"Rejection: {rejection}")
        print(f"Bars: {bars}\n")
    
    def _spit(self, bars: Dict[str, Any]) -> Dict[str, Any]:
        """
        Override in subclass with actual logic.
        
        This is where the agent performs its core action.
        """
        raise NotImplementedError(f"{self.role} must implement _spit()")
    
    def _feel_the_vibe(self, verse: Dict[str, Any]) -> VibeReading:
        """
        Read the emotional residue of the verse.
        
        Override in subclass for custom vibe calculations.
        """
        # Default implementation
        return VibeMeter().read(
            sovereignty_delta=verse.get("sovereignty_delta", 0),
            dignity_delta=verse.get("dignity_delta", 0),
            defense_delta=verse.get("defense_delta", 0),
            profit_delta=verse.get("profit_delta", 0)
        )


# Example usage: ScoutAgent inheriting from RawkusAgent
class ScoutAgent(RawkusAgent):
    """
    The A&R: Finds distressed MGAs for acquisition.
    Voice: Trumpet (high, piercing, attention-grabbing)
    """
    
    def __init__(self):
        super().__init__(role="Scout", voice="trumpet")
    
    def _spit(self, bars: Dict[str, Any]) -> Dict[str, Any]:
        """
        Scout for distressed MGAs.
        
        Expected bars:
        - target: "mga"
        - criteria: "cr>115,premium<20m,age>55"
        """
        target = bars.get("target")
        criteria = bars.get("criteria", "")
        
        # In production, this would query databases
        # For now, return mock data
        return {
            "action": "scout",
            "target": target,
            "criteria": criteria,
            "results": [
                {
                    "name": "Acme Cyber MGA",
                    "combined_ratio": 118,
                    "premium": 12000000,
                    "founder_age": 62,
                    "offer": 6000000
                }
            ],
            "sovereignty_delta": 0.1,  # Acquiring an MGA increases sovereignty
            "dignity_delta": 0.2,  # Offering fair price maintains dignity
            "defense_delta": 0,
            "profit_delta": 0.5  # Expected 10x+ return
        }
    
    def _feel_the_vibe(self, verse: Dict[str, Any]) -> VibeReading:
        """Custom vibe reading for scout actions."""
        return VibeMeter().read(
            sovereignty_delta=verse.get("sovereignty_delta", 0),
            dignity_delta=verse.get("dignity_delta", 0),
            defense_delta=verse.get("defense_delta", 0),
            profit_delta=verse.get("profit_delta", 0)
        )


# Example usage
if __name__ == "__main__":
    print("=== RAWKUS AGENT DEMO ===\n")
    
    # Example 1: Clean bars (should pass)
    scout = ScoutAgent()
    
    try:
        clean_bars = {
            "action": "scout",
            "target": "mga",
            "criteria": "cr>115,premium<20m,age>55",
            "explanation": "Scanning for distressed MGAs to acquire",
            "roi_projection": {
                "expected_multiple": 12.0
            }
        }
        
        print("Spitting clean bars...")
        verse = scout.spit(clean_bars)
        print(f"✅ Success! Verse: {verse.data}\n")
        
    except (CornyBarError, NoHitError) as e:
        print(f"❌ Failed: {e}\n")
    
    # Example 2: Corny bars (should fail)
    try:
        corny_bars = {
            "action": "scout",
            "target": "mga",
            "criteria": "cr>115,premium<20m,age>55",
            # Missing explanation (transparency violation)
            "roi_projection": {
                "expected_multiple": 5.0  # Below 10x threshold
            }
        }
        
        print("Spitting corny bars...")
        verse = scout.spit(corny_bars)
        print(f"✅ Success! Verse: {verse.data}\n")
        
    except (CornyBarError, NoHitError) as e:
        print(f"❌ Failed: {e}\n")
    
    print("=== DEMO COMPLETE ===")

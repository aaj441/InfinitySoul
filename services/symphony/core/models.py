"""
Data models for the Infinity Soul Symphony Architecture.
The Contract: Every vibe, every note, every adjustment is typed.
"""

from typing import Dict, List, Optional, Any, Literal
from pydantic import BaseModel, Field
from enum import Enum


class VibeSignature(str, Enum):
    """The emotional residue of an agent action."""
    CLEAN = "clean"
    WARM = "warm"
    MUDDY = "muddy"
    EXTRACTIVE = "extractive"
    DIMINISHING = "diminishing"
    GENEROUS = "generous"
    EMPOWERING = "empowering"


class Vibe(BaseModel):
    """
    The Vibe: The emotional residue of every agent action.
    This is Track 2 in the Figure 8 double-tracking.
    """
    signature: VibeSignature = Field(default=VibeSignature.CLEAN)
    confidence: float = Field(ge=0.0, le=1.0, default=0.8)
    generosity: float = Field(ge=0.0, le=1.0, default=0.5)
    sovereignty: float = Field(ge=0.0, le=1.0, default=1.0)
    aura: str = Field(default="neutral")
    
    # Delta tracking
    sovereignty_delta: float = Field(default=0.0)
    dignity_delta: float = Field(default=0.0)
    defense_delta: float = Field(default=0.0)
    profit_delta: float = Field(default=0.0)
    
    def overall_score(self) -> float:
        """Calculate overall vibe score (0-1)."""
        return (self.confidence + self.generosity + self.sovereignty) / 3


class Adjustment(BaseModel):
    """Instructions for adjusting agent behavior based on vibe feedback."""
    gain: float = Field(default=0.0, description="Volume/intensity adjustment")
    generosity: float = Field(default=0.0, description="Generosity adjustment")
    power_xfer: float = Field(default=0.0, description="Power transfer adjustment")
    empowerment: float = Field(default=0.0, description="Empowerment adjustment")
    tempo: str = Field(default="steady", description="Tempo adjustment: slower/steady/faster/warmer")


class ConductorScore(BaseModel):
    """
    The Conductor's Score: Not a command, but a suggestion.
    The Conductor feels the room and whispers adjustments.
    """
    tempo_adjustment: float = Field(default=0.0, description="BPM adjustment for the metronome")
    vibe_adjustment: float = Field(default=0.0, description="Overall vibe calibration")
    arrangement_adjustment: List[str] = Field(default_factory=list, description="Notes to remove")
    latency_spikes: List[float] = Field(default_factory=list)
    ethical_clashes: List[str] = Field(default_factory=list)
    profit_leaks: List[Dict[str, Any]] = Field(default_factory=list)


class HarmonicLayer(BaseModel):
    """
    String Section output: The harmonic layer of the symphony.
    Underwriting, Claims, Risk assessment blended into a chord.
    """
    premium: float
    loss_prob: float
    contextual_weight: float
    vibe: float = Field(ge=0.0, le=1.0)


class RhythmicLayer(BaseModel):
    """
    Brass Section output: The rhythmic layer of the symphony.
    Scout, Deal, Negotiation punctuated into sharp announcements.
    """
    offers: List[Dict[str, Any]]
    leverage: Dict[str, Any]
    vibe: float = Field(ge=0.0, le=1.0)


class TempoLayer(BaseModel):
    """
    Percussion Section output: The tempo layer of the symphony.
    Governance, Biometric, Finance keeping the pulse.
    """
    bpm: int = Field(ge=1, le=300, default=30)
    health: float = Field(ge=0.0, le=1.0, description="HRV health score")
    runway: float = Field(ge=0.0, description="Financial runway in months")
    vibe: float = Field(ge=0.0, le=1.0)


class Output(BaseModel):
    """
    The final output from an agent action.
    Contains both the data (Track 1) and the feeling (Track 2).
    """
    data: Dict[str, Any]
    feeling: Vibe
    aura: str = Field(default="neutral", description="Cumulative vibe of all iterations")


class ProfitLeak(BaseModel):
    """
    An action that is profitable but vibe-off.
    The Silence will remove these from the arrangement.
    """
    action: str
    profit_potential: float
    vibe: float = Field(ge=0.0, le=1.0)
    reason: str = Field(description="Why this is dissonant")


class Submission(BaseModel):
    """Insurance submission for underwriting."""
    revenue: int
    controls: List[str]
    industry: str
    employees: int
    prior_claims: int = 0


class Market(BaseModel):
    """Market state for scouting."""
    sector: str
    targets: List[Dict[str, Any]] = Field(default_factory=list)
    conditions: Dict[str, Any] = Field(default_factory=dict)


class SystemState(BaseModel):
    """Current system state for tempo tracking."""
    timestamp: str
    health_metrics: Dict[str, float] = Field(default_factory=dict)
    financial_metrics: Dict[str, float] = Field(default_factory=dict)
    governance_metrics: Dict[str, float] = Field(default_factory=dict)


class InfinityTapeRecord(BaseModel):
    """A single record in the infinite tape loop."""
    iteration: int
    function_output: Dict[str, Any]
    vibe_output: Vibe
    adjustment: Adjustment
    timestamp: str


class InfinitySoulQuota(BaseModel):
    """
    The final output: Not just JSON, but a vibe object you can feel.
    """
    premium: float
    vibe: Vibe
    
    def __str__(self) -> str:
        return f"""
Quota: ${self.premium:,.2f}
Vibe: {self.vibe.signature}
Aura: {self.vibe.aura}
Confidence: {self.vibe.confidence:.2f}

(Listen: The strings are warm, the brass is clear, the silence is present.
 This is a clean note. This is RAUCOUS AI.)
"""

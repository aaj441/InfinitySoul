"""
Infinity Soul Symphony: Orchestral AI Architecture

The "Figure 8" Manifesto - Code as Vibraharmonics

This package implements the orchestral AI architecture where agents are instruments
in a symphony, the Conductor feels the room and adjusts the mix, and every action
is double-tracked with vibe feedback.

Modules:
    core.conductor - The Conductor class that orchestrates agents
    core.figure_eight - The Figure 8 infinite loop with double-tracking
    core.models - Data models for vibes, scores, and outputs
    sections.strings - String section (Underwriting, Claims, Risk)
    sections.brass - Brass section (Scout, Deal, Negotiation)
    sections.percussion - Percussion section (Governance, Biometric, Finance)
    utils.metronome - 30-second quote cycle timing
    utils.vibe_meter - Emotional residue detection
    utils.harmonizer - Agent coordination and harmony
    utils.silence - Ethical kill switch and space
"""

__version__ = "1.0.0"
__author__ = "InfinitySoul"

from services.symphony.core.conductor import Conductor, Agent
from services.symphony.core.figure_eight import FigureEight, RaWkusAgent, InfiniteTape
from services.symphony.core.models import (
    Vibe,
    VibeSignature,
    Output,
    InfinitySoulQuota,
    Submission,
    Market,
    SystemState
)
from services.symphony.sections.strings import StringSection
from services.symphony.sections.brass import BrassSection
from services.symphony.sections.percussion import PercussionSection

__all__ = [
    "Conductor",
    "Agent",
    "FigureEight",
    "RaWkusAgent",
    "InfiniteTape",
    "Vibe",
    "VibeSignature",
    "Output",
    "InfinitySoulQuota",
    "Submission",
    "Market",
    "SystemState",
    "StringSection",
    "BrassSection",
    "PercussionSection",
]

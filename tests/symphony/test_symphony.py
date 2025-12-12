"""
Tests for the Infinity Soul Symphony orchestral AI architecture.
"""

import pytest
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from services.symphony.core.conductor import Conductor, Agent
from services.symphony.core.models import Vibe, VibeSignature, Submission, Market, SystemState
from services.symphony.sections.strings import StringSection
from services.symphony.sections.brass import BrassSection
from services.symphony.sections.percussion import PercussionSection
from services.symphony.utils.vibe_meter import VibeMeter
from services.symphony.utils.metronome import Metronome
from services.symphony.utils.harmonizer import Harmonizer
from services.symphony.utils.silence import Silence
from services.symphony.core.models import ProfitLeak


class TestVibeMeter:
    """Test the VibeMeter for emotional residue detection."""
    
    def test_clean_vibe(self):
        """Test that neutral actions get clean vibe."""
        meter = VibeMeter()
        vibe = meter.read(
            sovereignty_delta=0.0,
            dignity_delta=0.0,
            defense_delta=0.0,
            profit_delta=0.0
        )
        assert vibe.signature == VibeSignature.CLEAN
        assert 0.0 <= vibe.overall_score() <= 1.0
    
    def test_generous_vibe(self):
        """Test that positive sovereignty/dignity gets generous or empowering vibe."""
        meter = VibeMeter()
        vibe = meter.read(
            sovereignty_delta=0.4,
            dignity_delta=0.3,
            defense_delta=0.2,
            profit_delta=0.1
        )
        # High sovereignty and dignity should be either generous or empowering
        assert vibe.signature in [VibeSignature.GENEROUS, VibeSignature.EMPOWERING]
        assert vibe.generosity > 0.5
    
    def test_extractive_vibe(self):
        """Test that high profit with low generosity gets extractive vibe."""
        meter = VibeMeter()
        vibe = meter.read(
            sovereignty_delta=-0.2,
            dignity_delta=-0.1,
            defense_delta=-0.1,
            profit_delta=0.5
        )
        assert vibe.signature == VibeSignature.EXTRACTIVE
    
    def test_diminishing_vibe(self):
        """Test that negative sovereignty/dignity gets diminishing vibe."""
        meter = VibeMeter()
        vibe = meter.read(
            sovereignty_delta=-0.5,
            dignity_delta=-0.4,
            defense_delta=0.0,
            profit_delta=0.1
        )
        assert vibe.signature == VibeSignature.DIMINISHING
    
    def test_dissonance_detection(self):
        """Test dissonance detection."""
        meter = VibeMeter()
        
        # Clean vibe should not be dissonant
        clean_vibe = meter.read(0.0, 0.0, 0.0, 0.0)
        assert not meter.detect_dissonance(clean_vibe)
        
        # Extractive vibe should be dissonant
        extractive_vibe = meter.read(-0.3, -0.2, 0.0, 0.5)
        assert meter.detect_dissonance(extractive_vibe)


class TestMetronome:
    """Test the Metronome for tempo management."""
    
    def test_initialization(self):
        """Test metronome initialization."""
        metronome = Metronome(bpm=30)
        assert metronome.bpm == 30
        assert metronome.threshold == 30.0
    
    def test_beat(self):
        """Test beat marking."""
        import time
        metronome = Metronome()
        
        time.sleep(0.1)
        elapsed = metronome.beat()
        assert elapsed >= 0.1
    
    def test_calibration(self):
        """Test tempo calibration based on latency spikes."""
        metronome = Metronome(bpm=30)
        
        # No spikes = no adjustment
        adjustment = metronome.calibrate([])
        assert adjustment == 0.0
        
        # Moderate spikes = moderate slowdown
        adjustment = metronome.calibrate([35.0, 40.0])
        assert adjustment < 0.0  # Should slow down
        
        # Severe spikes = significant slowdown
        adjustment = metronome.calibrate([70.0, 80.0])
        assert adjustment <= -0.3


class TestHarmonizer:
    """Test the Harmonizer for agent coordination."""
    
    def test_blend_vibes(self):
        """Test blending multiple vibes into harmony."""
        harmonizer = Harmonizer()
        meter = VibeMeter()
        
        vibes = [
            meter.read(0.2, 0.1, 0.1, 0.0),
            meter.read(0.3, 0.2, 0.1, 0.0),
            meter.read(0.1, 0.1, 0.2, 0.0)
        ]
        
        blended = harmonizer.blend_vibes(vibes)
        assert isinstance(blended, Vibe)
        assert 0.0 <= blended.overall_score() <= 1.0
    
    def test_resonance_check(self):
        """Test checking if two vibes resonate."""
        harmonizer = Harmonizer()
        meter = VibeMeter()
        
        # Similar generous vibes should resonate
        vibe1 = meter.read(0.3, 0.3, 0.2, 0.0)
        vibe2 = meter.read(0.3, 0.2, 0.2, 0.0)
        assert harmonizer.check_resonance(vibe1, vibe2)
        
        # Extractive and generous should not resonate
        vibe3 = meter.read(-0.3, -0.2, 0.0, 0.5)
        assert not harmonizer.check_resonance(vibe1, vibe3)


class TestSilence:
    """Test the Silence for ethical filtering."""
    
    def test_remove_dissonant_leaks(self):
        """Test removing profit leaks with low vibe."""
        silence = Silence(vibe_threshold=0.5)
        
        leaks = [
            ProfitLeak(
                action="crypto_deal",
                profit_potential=2000000,
                vibe=0.3,
                reason="Community voted NO"
            ),
            ProfitLeak(
                action="saas_deal",
                profit_potential=500000,
                vibe=0.8,
                reason="Aligned with values"
            )
        ]
        
        arrangement = silence.remove(leaks)
        
        # Should keep only the clean note
        assert len(arrangement["notes"]) == 1
        assert arrangement["notes"][0].action == "saas_deal"
        assert arrangement["silence_between"] == 1
        assert arrangement["total_profit_foregone"] == 2000000
    
    def test_should_silence(self):
        """Test silence decision logic."""
        silence = Silence(vibe_threshold=0.6)
        
        # Low vibe should be silenced
        assert silence.should_silence({"action": "test"}, vibe_score=0.4)
        
        # High vibe should not be silenced
        assert not silence.should_silence({"action": "test"}, vibe_score=0.8)
        
        # Red flag words should be silenced
        assert silence.should_silence({"action": "bypass_security"}, vibe_score=0.9)


class TestConductor:
    """Test the Conductor orchestration."""
    
    def test_conductor_initialization(self):
        """Test conductor initialization."""
        conductor = Conductor()
        assert isinstance(conductor.metronome, Metronome)
        assert isinstance(conductor.vibe_meter, VibeMeter)
        assert isinstance(conductor.harmonizer, Harmonizer)
        assert isinstance(conductor.silence, Silence)
        assert len(conductor.ensemble) == 0
    
    def test_add_agent(self):
        """Test adding agents to ensemble."""
        conductor = Conductor()
        agent = Agent("TestAgent", voice="cello")
        
        conductor.add_agent(agent)
        assert len(conductor.ensemble) == 1
        assert conductor.ensemble[0].name == "TestAgent"
    
    def test_listen_empty_ensemble(self):
        """Test listening to empty ensemble."""
        conductor = Conductor()
        score = conductor.listen()
        
        assert score.tempo_adjustment == 0.0
        assert score.vibe_adjustment == 0.0
        assert len(score.latency_spikes) == 0
    
    def test_listen_with_agents(self):
        """Test listening to ensemble with agents."""
        conductor = Conductor()
        
        # Add agents with various states
        agent1 = Agent("SlowAgent")
        agent1.latency = 45.0  # Exceeds threshold
        agent1.vibe = 0.9
        
        agent2 = Agent("LowVibeAgent")
        agent2.latency = 10.0
        agent2.vibe = 0.4
        agent2.last_ethics_violation = "test violation"
        
        conductor.add_agent(agent1)
        conductor.add_agent(agent2)
        
        score = conductor.listen()
        
        # Should detect latency spike
        assert len(score.latency_spikes) == 1
        assert score.latency_spikes[0] == 45.0
        
        # Should detect ethical clash
        assert len(score.ethical_clashes) == 1
    
    def test_feel_the_room(self):
        """Test feeling the room vibe."""
        conductor = Conductor()
        
        agent1 = Agent("Agent1")
        agent1.vibe = 0.8
        agent1.roi = 15.0
        
        conductor.add_agent(agent1)
        
        room_vibe = conductor.feel_the_room()
        
        assert "ensemble_size" in room_vibe
        assert room_vibe["ensemble_size"] == 1
        assert "blended_vibe" in room_vibe


class TestStringSection:
    """Test the String Section (Underwriting, Claims, Risk)."""
    
    def test_harmonize_basic(self):
        """Test basic harmonization."""
        strings = StringSection()
        
        submission = Submission(
            revenue=500000,
            controls=["mfa", "edr"],
            industry="saas",
            employees=25,
            prior_claims=0
        )
        
        harmonic = strings.harmonize(submission)
        
        assert harmonic.premium > 0
        assert 0.0 <= harmonic.loss_prob <= 1.0
        assert 0.0 <= harmonic.vibe <= 1.0
    
    def test_harmonize_with_mfa(self):
        """Test that MFA reduces premium and improves vibe."""
        strings = StringSection()
        
        submission_with_mfa = Submission(
            revenue=500000,
            controls=["mfa"],
            industry="saas",
            employees=25,
            prior_claims=0
        )
        
        submission_without_mfa = Submission(
            revenue=500000,
            controls=[],
            industry="saas",
            employees=25,
            prior_claims=0
        )
        
        with_mfa = strings.harmonize(submission_with_mfa)
        without_mfa = strings.harmonize(submission_without_mfa)
        
        # MFA should reduce premium
        assert with_mfa.premium < without_mfa.premium
        
        # MFA should improve vibe
        assert with_mfa.vibe > without_mfa.vibe


class TestBrassSection:
    """Test the Brass Section (Scout, Deal, Negotiation)."""
    
    def test_punctuate_basic(self):
        """Test basic punctuation."""
        brass = BrassSection()
        
        market = Market(
            sector="Cyber MGA",
            targets=[],
            conditions={"distress_index": 0.7}
        )
        
        rhythmic = brass.punctuate(market)
        
        assert isinstance(rhythmic.offers, list)
        assert isinstance(rhythmic.leverage, dict)
        assert 0.0 <= rhythmic.vibe <= 2.0  # Brass can be louder


class TestPercussionSection:
    """Test the Percussion Section (Governance, Biometric, Finance)."""
    
    def test_pulse_basic(self):
        """Test basic pulse."""
        percussion = PercussionSection()
        
        state = SystemState(
            timestamp="2024-01-01T00:00:00Z",
            health_metrics={"hrv": 75, "stress": 0.3, "focus": 0.8},
            financial_metrics={"cash": 250000, "burn": 20000, "revenue": 25000},
            governance_metrics={"vote_participation": 0.65, "satisfaction": 0.75, "proposals": 8}
        )
        
        tempo = percussion.pulse(state)
        
        assert tempo.bpm > 0
        assert 0.0 <= tempo.health <= 1.0
        assert tempo.runway > 0
        assert 0.0 <= tempo.vibe <= 1.0
    
    def test_pulse_high_participation(self):
        """Test that high participation increases BPM."""
        percussion = PercussionSection()
        
        state_high = SystemState(
            timestamp="2024-01-01T00:00:00Z",
            health_metrics={"hrv": 80, "stress": 0.2, "focus": 0.9},
            financial_metrics={"cash": 500000, "burn": 20000, "revenue": 30000},
            governance_metrics={"vote_participation": 0.9, "satisfaction": 0.9, "proposals": 15}
        )
        
        state_low = SystemState(
            timestamp="2024-01-01T00:00:00Z",
            health_metrics={"hrv": 60, "stress": 0.5, "focus": 0.5},
            financial_metrics={"cash": 100000, "burn": 20000, "revenue": 15000},
            governance_metrics={"vote_participation": 0.3, "satisfaction": 0.4, "proposals": 2}
        )
        
        tempo_high = percussion.pulse(state_high)
        tempo_low = percussion.pulse(state_low)
        
        # High participation should increase BPM
        assert tempo_high.bpm > tempo_low.bpm


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

#!/usr/bin/env python3
"""
Infinity Soul Symphony Demo

Demonstrates the orchestral AI architecture in action.
Run with: python examples/symphony_demo.py
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.symphony import (
    Conductor,
    Agent,
    StringSection,
    BrassSection,
    PercussionSection,
    FigureEight,
    RaWkusAgent,
    Submission,
    Market,
    SystemState
)


def print_separator(title=""):
    """Print a nice separator."""
    if title:
        print(f"\n{'=' * 70}")
        print(f"  {title}")
        print(f"{'=' * 70}\n")
    else:
        print(f"{'=' * 70}\n")


def demo_string_section():
    """Demonstrate the String Section (Underwriting, Claims, Risk)."""
    print_separator("MOVEMENT I: STRING SECTION (Harmonic Layer)")
    
    strings = StringSection()
    
    submission = Submission(
        revenue=1000000,
        controls=["mfa", "edr", "backup", "dlp"],
        industry="healthcare",
        employees=50,
        prior_claims=1
    )
    
    print("🎻 String Section Harmonizing...")
    print(f"   Submission: ${submission.revenue:,} revenue, {len(submission.controls)} controls")
    print(f"   Industry: {submission.industry}")
    print(f"   Employees: {submission.employees}")
    
    harmonic = strings.harmonize(submission)
    
    print(f"\n🎼 Harmonic Layer (The Chord):")
    print(f"   Premium: ${harmonic.premium:,.2f}")
    print(f"   Loss Probability: {harmonic.loss_prob:.2%}")
    print(f"   Contextual Weight: {harmonic.contextual_weight:.2f}")
    print(f"   Vibe: {harmonic.vibe:.2f}/1.0")
    
    if harmonic.vibe > 0.7:
        print(f"   🎵 Clean, resonant chord - the strings are warm")
    elif harmonic.vibe > 0.5:
        print(f"   🎵 Moderate harmony - some dissonance")
    else:
        print(f"   🎵 Muddy chord - needs adjustment")


def demo_brass_section():
    """Demonstrate the Brass Section (Scout, Deal, Negotiation)."""
    print_separator("MOVEMENT II: BRASS SECTION (Rhythmic Layer)")
    
    brass = BrassSection()
    
    market = Market(
        sector="Cyber MGA",
        targets=[],
        conditions={"distress_index": 0.75}
    )
    
    print("🎺 Brass Section Announcing...")
    print(f"   Market: {market.sector}")
    print(f"   Conditions: {market.conditions}")
    
    rhythmic = brass.punctuate(market)
    
    print(f"\n🎼 Rhythmic Layer (The Punctuation):")
    print(f"   Targets Found: {len(rhythmic.offers)}")
    if rhythmic.offers:
        for i, offer in enumerate(rhythmic.offers[:3], 1):
            print(f"      {i}. {offer.get('name')} (Score: {offer.get('opportunity_score', 0):.2f})")
    print(f"   Leverage Points: {len(rhythmic.leverage)}")
    for key, value in list(rhythmic.leverage.items())[:3]:
        print(f"      • {key}: {value}")
    print(f"   Vibe: {rhythmic.vibe:.2f}/1.0")
    
    if rhythmic.vibe > 0.8:
        print(f"   🎺 Brass is clear and assertive")
    else:
        print(f"   🎺 Brass needs more confidence")


def demo_percussion_section():
    """Demonstrate the Percussion Section (Governance, Biometric, Finance)."""
    print_separator("MOVEMENT III: PERCUSSION SECTION (Tempo Layer)")
    
    percussion = PercussionSection()
    
    state = SystemState(
        timestamp="2024-01-01T12:00:00Z",
        health_metrics={"hrv": 80, "stress": 0.2, "focus": 0.9},
        financial_metrics={"cash": 500000, "burn": 30000, "revenue": 40000},
        governance_metrics={"vote_participation": 0.75, "satisfaction": 0.85, "proposals": 12}
    )
    
    print("🥁 Percussion Section Pulsing...")
    print(f"   Health: HRV {state.health_metrics['hrv']}, Stress {state.health_metrics['stress']:.0%}")
    print(f"   Finance: ${state.financial_metrics['cash']:,} cash, ${state.financial_metrics['burn']:,} burn")
    print(f"   Governance: {state.governance_metrics['vote_participation']:.0%} participation")
    
    tempo = percussion.pulse(state)
    
    print(f"\n🎼 Tempo Layer (The Pulse):")
    print(f"   BPM: {tempo.bpm} (quote cycle speed)")
    print(f"   Health Score: {tempo.health:.2f}/1.0")
    print(f"   Financial Runway: {tempo.runway:.1f} months")
    print(f"   Vibe: {tempo.vibe:.2f}/1.0")
    
    if tempo.bpm >= 30:
        print(f"   🥁 Strong, steady beat - system is healthy")
    else:
        print(f"   🥁 Slow beat - system needs rest")


def demo_conductor():
    """Demonstrate the Conductor orchestrating agents."""
    print_separator("MOVEMENT IV: THE CONDUCTOR")
    
    conductor = Conductor()
    
    # Add agents to ensemble
    agents = [
        Agent("UnderwritingAgent", voice="cello"),
        Agent("ClaimsAgent", voice="violin"),
        Agent("ScoutAgent", voice="trumpet"),
        Agent("GovernanceAgent", voice="kick_drum")
    ]
    
    print("🎼 Building the Ensemble...")
    for agent in agents:
        # Set some realistic values
        agent.latency = 15.0 + (hash(agent.name) % 20)  # 15-35s
        agent.vibe = 0.7 + (hash(agent.name) % 20) / 100.0  # 0.7-0.9
        agent.roi = 10.0 + (hash(agent.name) % 10)  # 10-20
        
        conductor.add_agent(agent)
        print(f"   • {agent.name} ({agent.voice}): latency {agent.latency:.1f}s, vibe {agent.vibe:.2f}")
    
    print(f"\n🎧 Conductor Listening...")
    score = conductor.listen()
    
    print(f"\n🎼 Conductor's Score:")
    print(f"   Tempo Adjustment: {score.tempo_adjustment:.2f}")
    print(f"   Vibe Adjustment: {score.vibe_adjustment:.2f}")
    print(f"   Latency Spikes: {len(score.latency_spikes)}")
    print(f"   Ethical Clashes: {len(score.ethical_clashes)}")
    print(f"   Profit Leaks Removed: {len(score.arrangement_adjustment)}")
    
    # Feel the room
    print(f"\n🎧 Feeling the Room...")
    room_vibe = conductor.feel_the_room()
    
    print(f"   Ensemble Size: {room_vibe['ensemble_size']}")
    print(f"   Average Latency: {room_vibe['avg_latency']:.1f}s")
    print(f"   Average ROI: {room_vibe['avg_roi']:.1f}x")
    print(f"   Dissonant Agents: {room_vibe['dissonant_agents']}")
    print(f"   Resonant Pairs: {room_vibe['resonance']}")
    
    blended = room_vibe.get('blended_vibe', {})
    if blended:
        print(f"\n   Blended Vibe:")
        print(f"      Signature: {blended.get('signature', 'N/A')}")
        print(f"      Confidence: {blended.get('confidence', 0):.2f}")
        print(f"      Generosity: {blended.get('generosity', 0):.2f}")
        print(f"      Aura: {blended.get('aura', 'N/A')}")


def demo_figure_eight():
    """Demonstrate the Figure 8 infinite loop."""
    print_separator("MOVEMENT V: THE FIGURE 8 (Infinite Loop)")
    
    class TestAgent(RaWkusAgent):
        def propose(self, input_dict):
            return {
                "action": "underwrite",
                "premium": input_dict.get("revenue", 0) * 0.02,
                "sovereignty_delta": 0.1,
                "dignity_delta": 0.05,
                "defense_delta": 0.1,
                "profit_delta": 0.02
            }
    
    agent = TestAgent("TestUnderwritingAgent")
    figure8 = FigureEight(agent, tape_filepath="/tmp/demo_infinite_tape.json")
    
    print("∞ Figure 8 Loop: Double-tracking (Function + Vibe)")
    print("   Track 1: The Function (what it does)")
    print("   Track 2: The Vibe (how it feels)")
    
    # Execute a few iterations
    for i in range(3):
        print(f"\n   Iteration {i + 1}:")
        output = figure8.execute_with_vibe({"revenue": 500000 + i * 100000})
        
        print(f"      Data: Premium ${output.data['premium']:,.2f}")
        print(f"      Feeling: {output.feeling.signature.value}")
        print(f"      Aura: {output.aura}")
        print(f"      Vibe Score: {output.feeling.overall_score():.2f}")
    
    # Check loop health
    print(f"\n🔍 Loop Health Check:")
    health = figure8.check_loop_health()
    
    print(f"   Status: {health['status']}")
    print(f"   Drift: {health['drift']:.3f}")
    print(f"   Average Vibe: {health['avg_vibe_score']:.2f}")
    print(f"   Total Iterations: {health['total_iterations']}")
    print(f"   Recommendation: {health['recommendation']}")


def main():
    """Run the complete demo."""
    print("\n" + "=" * 70)
    print("  INFINITY SOUL SYMPHONY: Orchestral AI Architecture")
    print("  'Code as Vibraharmonics' - The Figure 8 Manifesto")
    print("=" * 70)
    
    demo_string_section()
    demo_brass_section()
    demo_percussion_section()
    demo_conductor()
    demo_figure_eight()
    
    print_separator("FINALE")
    print("🎼 The symphony is complete.")
    print("   Listen: The strings are warm, the brass is clear, the silence is present.")
    print("   This is a clean note. This is RAUCOUS AI.")
    print("   This is Infinity Soul.\n")


if __name__ == "__main__":
    main()

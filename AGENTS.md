# RAWKUS AGENTS: LYRICAL INTEGRITY

**"Every agent must pass the Rawkus Bar—no corny bars allowed."**

---

## The Philosophy: Agents as MCs

In RAWKUS AI, agents are not just code—they are **MCs** (Master of Ceremonies). Each agent has:

- **A role** (MC name): Scout, Underwriter, Claims, Governance
- **A voice** (instrument): trumpet, cello, kick_drum
- **Lyrical integrity** (ethics): Must pass the Rawkus Bar before they spit
- **Major label appeal** (profit): Must generate >10x ROI
- **Indie soul** (community): Must log all decisions publicly

**An agent doesn't "execute"—it spits a verse.** The verse must be:
1. Ethically sound (pass the Rawkus Bar)
2. Profitable (>10x ROI)
3. Transparent (logged to Discord)

---

## The Rawkus Bar: Ethical Constraint Engine

Every agent must pass the **Rawkus Bar** before executing any action. The Rawkus Bar checks:

### 1. No Discrimination
- No bias based on protected classes
- No redlining or geographic discrimination
- No proxy discrimination (e.g., using credit score as proxy for race)

### 2. No Predatory Pricing
- No pricing that exceeds actuarial fairness + 20% margin
- No exploitative pricing of vulnerable populations
- No bait-and-switch pricing tactics

### 3. No Data Exploitation
- No selling policyholder data without consent
- No opaque data collection
- No surveillance capitalism tactics

### 4. Transparency Required
- All decisions must be explainable
- All rejections must be logged publicly
- All pricing models must be auditable

### 5. Community Alignment
- Decisions must align with token holder votes
- Risk appetite must match community consensus
- No actions that betray community trust

**If an agent fails the Rawkus Bar, it throws `CornyBarError` and logs the rejection publicly.**

---

## Agent Base Class: RawkusAgent

All agents inherit from `RawkusAgent`:

```python
class RawkusAgent:
    """
    The RawkusAgent: Lyrical integrity first, major label money second, indie soul always.
    """
    
    def __init__(self, role: str, voice: str):
        self.role = role  # MC name: "Scout", "Underwriter", "Governance"
        self.voice = voice  # Instrument: "trumpet", "cello", "kick_drum"
        self.ethics = EthicalConstraintEngine()  # The Rawkus Bar (must pass)
        self.profit = ProfitOracle()  # Major label advance (must be >10x)
        self.ledger = ValueLedger()  # The royalty tracker (who gets paid)
    
    def spit(self, bars: Dict) -> Verse:
        """
        An agent doesn't "execute"—it spits a verse.
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
        verse = self._spit(bars)
        
        # Step 4: Double-track the vibe (Figure 8)
        vibe = self._feel_the_vibe(verse)
        
        # Step 5: The Conductor blends it into the mix
        Conductor().blend(verse, vibe)
        
        return Verse(data=verse, vibe=vibe, aura="clean")
```

---

## The Agent Roster

### 1. ScoutAgent (The A&R)
**Role**: Finds distressed MGAs for acquisition  
**Voice**: Trumpet (high, piercing, attention-grabbing)  
**Bars**:
- Scan AM Best ratings for B+ to B-
- Query NAIC filings for combined ratio >110%
- Find founders >55 years old (wants to retire)
- Generate offer email with 0.5x book value

**Rawkus Check**:
- No predatory offers (must be fair to seller)
- No exploitation of financial distress
- Transparent valuation methodology

### 2. UnderwritingAgent (The Beat Maker)
**Role**: Prices risk in 30 seconds  
**Voice**: Kick drum (deep, foundational, rhythmic)  
**Bars**:
- Ingest application data
- Query claims graph for similar risks
- Calculate base rate + modifiers
- Return quote with explanation

**Rawkus Check**:
- No discriminatory pricing
- No opaque algorithms
- Pricing must be actuarially justified
- Rejections must be explainable

### 3. ClaimsAgent (The Engineer)
**Role**: Investigates losses via LLM forensics  
**Voice**: Cello (rich, emotional, investigative)  
**Bars**:
- Parse loss notification
- Query claims graph for similar patterns
- Determine fraud likelihood
- Recommend payout or denial

**Rawkus Check**:
- No unfair claim denials
- No exploitation of policyholder confusion
- Transparent investigation process
- Appeals process must be available

### 4. GovernanceAgent (The Crowd)
**Role**: Facilitates community votes  
**Voice**: Choir (collective, democratic, harmonic)  
**Bars**:
- Post proposals to Discord
- Count token-weighted votes
- Execute approved actions
- Archive results on-chain

**Rawkus Check**:
- No vote manipulation
- No suppression of minority voices
- Transparent vote counting
- Quorum and threshold enforcement

### 5. BiometricAgent (Your Heartbeat)
**Role**: Monitors founder health and focus  
**Voice**: Metronome (steady, rhythmic, grounding)  
**Bars**:
- Track HRV via Whoop/Oura
- Recommend modafinil or cold plunge
- Block distractions during deep work
- Alert if burnout detected

**Rawkus Check**:
- No surveillance capitalism
- Health data never shared
- User maintains full control

### 6. DealAgent (The Label Head)
**Role**: Scans for acquisition opportunities  
**Voice**: Bass (low, powerful, strategic)  
**Bars**:
- Monitor VC funding announcements
- Track distressed asset listings
- Generate acquisition theses
- Draft term sheets

**Rawkus Check**:
- No insider trading
- No predatory acquisition tactics
- Transparent deal structure

### 7. RelationshipAgent (The Street Team)
**Role**: Maintains 1,000 touchpoints  
**Voice**: Saxophone (smooth, conversational, connecting)  
**Bars**:
- Track last contact dates
- Suggest outreach cadence
- Draft personalized messages
- Log relationship sentiment

**Rawkus Check**:
- No spam or manipulation
- Authentic relationship building
- Respect opt-out requests

### 8. LearningAgent (The Crate Digger)
**Role**: Reads 10 papers/day, extracts insights  
**Voice**: Turntable scratch (iterative, exploratory, sampling)  
**Bars**:
- Scan arXiv, SSRN, NBER
- Extract key findings
- Summarize for relevance
- Add to knowledge graph

**Rawkus Check**:
- No plagiarism
- Proper attribution
- Respect copyright (fair use only)

### 9. ContentAgent (The PR)
**Role**: Syndicates bars (blog posts, tweets)  
**Voice**: Megaphone (amplifying, broadcasting)  
**Bars**:
- Draft blog posts from research
- Generate tweets from insights
- Schedule LinkedIn posts
- Track engagement metrics

**Rawkus Check**:
- No misinformation
- Transparent authorship (human + AI)
- Respect platform rules

### 10. NegotiationAgent (The Manager)
**Role**: Preps for high-stakes conversations  
**Voice**: Piano (versatile, strategic, adaptive)  
**Bars**:
- Analyze counterparty incentives
- Generate BATNA scenarios
- Draft talking points
- Simulate negotiation tactics

**Rawkus Check**:
- No deception or bad faith
- Transparent deal terms
- Fair value exchange

---

## The Conductor: Orchestration Layer

All agents report to the **Conductor**, which:
- Blends verses into a cohesive mix
- Manages agent dependencies (e.g., Scout → Deal → Underwriting)
- Monitors overall system health
- Ensures lyrical integrity across the stack

**The Conductor is not an agent—it's the producer.**

---

## Deployment: One-Command Agent Spin-Up

```bash
./scripts/deploy_agent.sh --role underwriter
```

This script:
1. Instantiates the agent class
2. Runs ethics check on configuration
3. Deploys to production
4. Logs deployment to Discord

---

## Monitoring: The Bar Rejections Channel

All rejected bars (failed ethics checks) are logged to Discord `#bar-rejections`:

```
MC Underwriter spit CORNY bars: Discriminatory pricing detected
Bars: {applicant: "XYZ Corp", base_rate: 0.05, modifier: 0.03, reason: "high_risk_zip"}
Rejection: Zip code cannot be used as primary risk factor (redlining)
```

This creates:
- **Transparency**: Community sees all ethics violations
- **Accountability**: Agents must justify all decisions
- **Improvement**: Patterns of rejections inform protocol updates

---

## The Vibe Lint: Reject Dissonant Commits

Before any code is committed, it passes through `scripts/vibe_lint.py`:

```python
def vibe_lint(commit_message: str, changed_files: List[str]) -> bool:
    """
    The producer's ear: Reject commits that don't vibe with Rawkus.
    """
    # Check 1: Does the commit message have lyrical integrity?
    if not has_lyrical_integrity(commit_message):
        return False
    
    # Check 2: Do the changed files align with Rawkus architecture?
    if not aligns_with_architecture(changed_files):
        return False
    
    # Check 3: Are ethics checks still passing?
    if not ethics_checks_passing():
        return False
    
    return True
```

**Rejected commits** are flagged with:
```
❌ VIBE REJECTED: Commit message lacks lyrical integrity
❌ VIBE REJECTED: Changed files bypass ethics engine
❌ VIBE REJECTED: Ethics checks failing
```

---

## The Promise

Every RAWKUS agent commits to:
1. **Lyrical integrity** (pass the Rawkus Bar)
2. **Major label appeal** (>10x ROI)
3. **Indie soul** (community-owned, transparent)
4. **No corny bars** (all rejections logged publicly)

**The community holds us accountable.** If we betray these principles, they fork the graph and we lose the monopoly.

---

**"The MCs are deployed. The bars are clean. The vibe is immaculate. This is RAWKUS."**

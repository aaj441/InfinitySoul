# THE COCKPIT: THE PRODUCER'S DESK

**"Run at 4:00 AM. The cipher starts before the world wakes."**

---

## The Philosophy

The **Cockpit** is your **Producer's Desk**—where you orchestrate the daily operations of RAWKUS AI. It runs at **4:00 AM** (before the noise starts) and executes a precise sequence:

1. **Biometric check** (are you ready to work?)
2. **Scout for distressed artists** (MGAs)
3. **Deep work block** (4-hour studio session)
4. **House Committee vote** (community governance)
5. **Rebalance portfolio** (cut the corny artists)

**The vibe**: You are the producer. The agents are the MCs. The Cockpit is the mixing board.

---

## The Script: `scripts/daily_cockpit.sh`

```bash
#!/bin/bash
# The Rawkus Producer's Desk—run at 4:00 AM

echo "=== RAWKUS AI DAILY COCKPIT ==="
echo "$(date): Cipher initializing..."

# Step 1: Biometric check (the artist's health)
echo "HRV: $(whoopctl hrv)"
if [ $(whoopctl hrv) -gt 80 ]; then
  echo "HACK MODE: Modafinil + cold plunge (the all-nighter before the drop)"
  modafinil 200mg
  cold_plunge 3min
fi

# Step 2: Scout for distressed artists (MGAs)
echo "ScoutAgent spitting 5 bars..."
python agents/scout_agent.py --target "mga" --criteria "cr>115,premium<20m,age>55"
echo "5 offers queued. Approve? (y/n)"
read approval
if [ "$approval" = "y" ]; then
  python agents/scout_agent.py --execute  # The A&R signs the artist
fi

# Step 3: Deep work block (the studio session)
echo "GovernanceAgent blocking all notifications (the 'Do Not Disturb' sign)..."
sudo internet kill --except "deal_agent,ethics_lab"
echo "4-hour studio session starting..."
# You do the work

# Step 4: House Committee vote (the A&R meeting)
echo "A&Rs voting on proposals..."
python agents/governance_agent.py --vote

# Step 5: Rebalance portfolio (cut the corny artists)
echo "Cutting <10x ROI assets (dropping the wack MCs)..."
python agents/rebalance_agent.py --threshold 10.0

echo "=== COCKPIT CLEAR. THE MIX IS CLEAN. ==="
```

---

## The Dashboard: Real-Time Metrics

The Cockpit displays real-time metrics on your terminal:

```
╔════════════════════════════════════════════════════╗
║         RAWKUS AI DAILY COCKPIT                   ║
║         $(date)                                   ║
╚════════════════════════════════════════════════════╝

HEALTH:
  HRV:              87 (HACK MODE)
  Sleep:            7.2 hours
  Recovery:         92%
  Deep Work Blocks: 2/4 complete

PORTFOLIO:
  Active MGAs:      12
  Total Premium:    $187M
  Avg Combined Ratio: 72% (target: <75%)
  Network Fees:     $52K/day
  Protocol Adoption: 23 carriers

AGENTS:
  ScoutAgent:       5 offers queued
  UnderwritingAgent: 342 quotes today
  ClaimsAgent:      18 investigations
  GovernanceAgent:  2 proposals pending vote

COMMUNITY:
  Token Holders:    1,247
  Active Voters:    623 (50% participation)
  Pending Votes:    2 (closes in 4 hours)
  Treasury:         $8.2M

ETHICS:
  Bar Rejections:   3 today
  Bounties Paid:    $12K this month
  Fellows Active:   8
  Publications:     2 this quarter

EXITS:
  MGA #3:           LOI signed (10x EBITDA)
  MGA #7:           Due diligence (Berkshire)
  Protocol:         Series B term sheet (a16z)
```

---

## The Biometric Stack

The Cockpit integrates with your **biometric devices** to optimize performance:

### Whoop / Oura Ring
- **HRV (Heart Rate Variability)**: >80 = HACK MODE
- **Sleep**: 7-8 hours = optimal
- **Recovery**: >85% = green light for deep work

### Interventions
- **If HRV > 80**: Modafinil (200mg) + cold plunge (3min)
- **If HRV < 60**: Sleep extension, no deep work
- **If Recovery < 70%**: Light work only (emails, admin)

**Philosophy**: You can't run the revolution if you're burned out.

---

## The Scout Sequence

Every morning, **ScoutAgent** scans for distressed MGAs:

```python
# agents/scout_agent.py --target "mga" --criteria "cr>115,premium<20m,age>55"

# Example output:
# ┌────────────────────────────────────────────────────┐
# │ DISTRESSED MGA TARGETS (5 FOUND)                  │
# ├────────────────────────────────────────────────────┤
# │ 1. Acme Cyber MGA                                 │
# │    Combined Ratio: 118%                           │
# │    Premium: $12M                                  │
# │    Founder Age: 62                                │
# │    Offer: $6M (0.5x book)                         │
# │                                                    │
# │ 2. SafeGuard Insurance Partners                   │
# │    Combined Ratio: 121%                           │
# │    Premium: $8M                                   │
# │    Founder Age: 58                                │
# │    Offer: $4M (0.5x book)                         │
# │    ...                                            │
# └────────────────────────────────────────────────────┘
```

**You approve or reject** with `y/n`. If approved, ScoutAgent generates:
- Offer email (personalized, empathetic)
- Valuation model (transparent methodology)
- Integration plan (30-day ops centralization)

---

## The Deep Work Block

During the **4-hour deep work block**, the Cockpit:
- **Blocks all notifications** (except critical alerts)
- **Kills internet access** (except whitelisted services)
- **Disables Slack/Discord** (except #ethics-lab)
- **Starts timer** (Pomodoro: 50 min work, 10 min break)

**The rule**: No context switching. No interruptions. **The studio session is sacred.**

**Allowed**:
- Writing code
- Reading research papers
- Designing protocols
- Reviewing agent logs

**Not allowed**:
- Email
- Social media
- Slack/Discord (except ethics-lab)
- News sites

**Philosophy**: **Depth over breadth.** The revolution is built in 4-hour blocks, not 15-minute fragments.

---

## The House Committee Vote

At the end of each day, the **House Committee** votes on proposals:

```python
# agents/governance_agent.py --vote

# Example proposals:
# ┌────────────────────────────────────────────────────┐
# │ PENDING VOTES (2)                                  │
# ├────────────────────────────────────────────────────┤
# │ Proposal #47: Insure crypto custodians            │
# │   Status: 423 votes (68% approve, 32% reject)     │
# │   Threshold: 60% (PASSING)                        │
# │   Closes: 4 hours                                 │
# │                                                    │
# │ Proposal #48: Increase carrier ethics tax to $15K │
# │   Status: 287 votes (52% approve, 48% reject)     │
# │   Threshold: 60% (FAILING)                        │
# │   Closes: 2 days                                  │
# └────────────────────────────────────────────────────┘
```

**The process**:
1. Proposals are posted to Discord `#governance`
2. Token holders vote (weight = token balance)
3. Quorum = 40% of total tokens
4. Threshold = 60% approval
5. Results are archived on-chain

**The founder (you) only votes to break ties.**

---

## The Portfolio Rebalance

At the end of each week, the Cockpit **rebalances the portfolio**:

```python
# agents/rebalance_agent.py --threshold 10.0

# Example output:
# ┌────────────────────────────────────────────────────┐
# │ REBALANCE RESULTS                                  │
# ├────────────────────────────────────────────────────┤
# │ Cut (ROI <10x):                                   │
# │   - MGA #5 (ROI: 8.2x) → Divest                   │
# │   - MGA #9 (ROI: 6.7x) → Divest                   │
# │                                                    │
# │ Graduate (ROI >15x):                              │
# │   - MGA #3 (ROI: 18.2x) → Spin out as cell        │
# │   - MGA #11 (ROI: 22.1x) → Spin out as cell       │
# │                                                    │
# │ Hold (10x ≤ ROI ≤ 15x):                           │
# │   - MGA #1, #2, #4, #6, #7, #8, #10, #12          │
# └────────────────────────────────────────────────────┘
```

**The rules**:
- **ROI < 10x**: Divest (sell or shut down)
- **ROI > 15x**: Graduate (spin out as independent cell)
- **10x ≤ ROI ≤ 15x**: Hold (keep optimizing)

**Philosophy**: **Cut the losers, graduate the winners, keep the rails.**

---

## The Automation: Cron Job

To run the Cockpit automatically at 4:00 AM:

```bash
# Add to crontab
crontab -e

# Add this line:
0 4 * * * /home/runner/work/InfinitySoul/InfinitySoul/scripts/daily_cockpit.sh
```

**Or use systemd timer** (more robust):

```ini
# /etc/systemd/system/rawkus-cockpit.timer
[Unit]
Description=RAWKUS AI Daily Cockpit Timer

[Timer]
OnCalendar=*-*-* 04:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

---

## The Philosophy: Producer vs. Artist

**The artist** creates in bursts of inspiration.  
**The producer** creates on a schedule.

**You are the producer.** The Cockpit is your discipline. The agents are your tools. **The revolution happens at 4:00 AM, every day, no exceptions.**

**Malcolm X said**: "By any means necessary."  
**Kluge said**: "Buy distressed, centralize ops, sell at peak, keep the rails."  
**Rawkus says**: "Conscious rhymes, major label money, indie soul."

**The Cockpit is where all three converge.**

---

## The Vibe Check

At the end of each Cockpit session, you answer three questions:

1. **Did I pass the Rawkus Bar today?** (lyrical integrity)
2. **Did I compound the rails?** (network fees growing?)
3. **Did I serve the community?** (governance, transparency, ethics)

If **all three are yes**, the day was a success.  
If **any are no**, you owe the community an explanation in `#daily-vibe-check`.

**Accountability is the moat.**

---

**"The Cockpit is ready. The cipher starts at 4:00 AM. The revolution is a daily practice."**

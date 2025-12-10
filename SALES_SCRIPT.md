# Cyber Audit Sales Script

## Quick Reference Guide

Use this script when conducting cyber security audits for prospects via DM.

---

## Step 1: Get the Domain from DM

**When someone DMs you, reply:**

```
Great. What's your domain? (e.g., yourbusiness.com)
```

**Copy their domain exactly as they write it.** No www. No https. Just `theirdomain.com`

---

## Step 2: Run the Scan

**Open terminal on your phone or laptop:**

```bash
cd ~/path/to/InfinitySoul
python audit.py --domain theirdomain.com
```

**What it does:**
- Checks if RDP port 3389 is open (ransomware risk)
- Checks for DMARC/SPF records (email spoofing risk)
- Checks SSL certificate validity (breach risk)

---

## Step 3: Read the Output (What You'll See)

**Example output:**

```
🏢 Domain: example.com
📊 Risk Score: 40/100

🔍 Issues Found:
   - CRITICAL: RDP exposed (ransomware risk)
   - WARNING: No SPF record (phishing risk)
   - WARNING: No DMARC record (spoofing risk)

🚨 High Risk - Must fix issues before coverage
```

**This is your sales script.** The scan tells you exactly what to say.

---

## Step 4: Reply with Results (The Pitch)

**Copy/paste this:**

```
🔴 CRITICAL: Your RDP port is exposed. Hackers can lock your files with ransomware.

⚠️ WARNING: No email security (SPF/DMARC). Scammers can spoof your domain.

💰 Fix cost: $500 (blocks RDP, adds email security, re-scans to verify)

Want me to fix it now? Takes 20 minutes.
```

**If they say "yes":**  
Send payment link: `paypal.me/YourName/500`

**If they say "how":**  
Say: "I'll screen share on Discord and walk you through it."

**If they say "no":**  
Say: "No problem. Here's the free report. DM me if you change your mind."

---

## Step 5: Fix It (If They Pay)

**Get on Discord screen share. Run these commands:**

### Block RDP

```bash
# Show them the open port (proof)
nmap -p 3389 theirdomain.com

# Guide them to block it:
# 1. Log into their router/firewall
# 2. Block inbound port 3389
# 3. Or disable Remote Desktop on their server
```

### Add DMARC/SPF

```bash
# Give them the DNS records to add:

# SPF:
theirdomain.com TXT "v=spf1 mx ~all"

# DMARC:
_dmarc.theirdomain.com TXT "v=DMARC1; p=quarantine; rua=mailto:admin@theirdomain.com"
```

### Verify Fix

```bash
python audit.py --domain theirdomain.com
```

**Show them the clean result:**
```
✅ Clean scan. You're now low risk and eligible for cyber insurance.
```

---

## Step 6: Get the Payment

**Send them a PayPal/Venmo/Zelle request for $500 IMMEDIATELY after they say "yes."**

**Don't wait. Don't invoice. Just get the money.**

### Why $500?

- **$200** for your time
- **$300** for the referral commission you'll earn on cyber insurance

**That's how you make $800 per client.**

---

## The Timeline (From DM to $500 in 15 Minutes)

| **Minute** | **Action** |
|------------|------------|
| 0 | They DM you with domain |
| 1 | You run `python audit.py --domain theirdomain.com` |
| 2 | You send them the results |
| 3 | They say "yes, fix it" |
| 4 | You send PayPal request |
| 5 | They pay |
| 6-14 | You screen share and fix it |
| 15 | You show them clean scan |

**Done. $500 in your account. 1 customer. Proof of concept.**

---

## Response Templates

### High Risk (Score < 60)

```
🚨 CRITICAL SECURITY ISSUES DETECTED 🚨

Your domain scored {SCORE}/100 on our cyber security audit.

Issues found:
{LIST_ISSUES}

This puts you at HIGH RISK for:
• Ransomware attacks ($50K+ average cost)
• Email spoofing & phishing attacks
• Data breaches & regulatory fines

Fix cost: $500
Includes: Security hardening + verification scan + cyber insurance eligibility

Ready to secure your business? Reply "YES" and I'll send the payment link.
```

### Medium Risk (Score 60-79)

```
⚠️ SECURITY GAPS DETECTED ⚠️

Your domain scored {SCORE}/100.

Issues found:
{LIST_ISSUES}

You're at MEDIUM RISK. These gaps should be fixed before:
• Seeking cyber insurance
• Processing customer data
• Growing your online presence

Fix cost: $350
Includes: Email security + verification scan

Want to close these gaps? Reply "YES"
```

### Low Risk (Score 80+)

```
✅ GOOD NEWS - You're in great shape!

Your domain scored {SCORE}/100.

Your security posture is solid. You're eligible for:
• Cyber insurance policies
• SOC 2 compliance preparation
• Security certifications

I can still help with:
• Advanced threat monitoring ($100/mo)
• Compliance documentation ($300)
• Security policy development ($500)

Interested in any of these? Let me know.
```

### No Response Follow-up (24 hours later)

```
Hey [NAME],

I sent you the security audit results yesterday. Did you get a chance to review?

The issues I found are actively being exploited:
• {MOST_CRITICAL_ISSUE}

I can fix this in 20 minutes today if you're available.

Still interested?
```

### Breakup Email (72 hours, no response)

```
Hey [NAME],

I'm closing your security audit file since I haven't heard back.

I'm assuming:
a) You hired another security consultant
b) Security isn't a priority right now
c) My timing is off

If I'm wrong, just reply "WRONG" and I'll reopen your file with priority support.

Your audit report stays active for 30 days at: [LINK]

Best,
[YOUR NAME]

P.S. - The RDP exposure is still there. That's a ticking time bomb.
```

---

## Objection Handlers

### "That's too expensive"

```
I get it. $500 feels like a lot.

But compare that to:
• Average ransomware recovery: $50,000
• Average data breach cost: $150,000
• Legal fees for email spoofing: $25,000

This is like buying fire insurance after seeing smoke. Except I can put out the fire before it starts.

Want to start with just the RDP fix for $200?
```

### "I need to talk to my IT team"

```
Absolutely. Your IT team should know about these issues.

Forward them the scan results. If they can fix it, great.

If they need help or don't have time, I'm here. Offer stands for 48 hours.

Want me to hop on a call with them? No charge.
```

### "How do I know this is real?"

```
Fair question. Here's how you can verify:

1. Run this yourself: `nmap -p 3389 yourdomain.com`
2. Check your DNS: `dig yourdomain.com TXT`
3. Test SSL: Visit https://www.ssllabs.com/ssltest/

The vulnerabilities are real. I'm just the messenger.

I'm offering to fix them because that's how I make money - but you can absolutely do it yourself with the instructions I'll send for free.

Want the DIY guide? Or want me to handle it?
```

### "Can you do it for less?"

```
I can break it down:

• RDP port fix: $200 (15 min)
• SPF record: $150 (5 min)  
• DMARC record: $150 (5 min)

Total: $500 (already discounted from $600)

Or you can do it yourself - I'll send free instructions.

But here's the truth: every day you wait is a day hackers can exploit this.

What makes sense for you?
```

---

## Upsell Opportunities

After successfully fixing the issues:

### Monitoring Service

```
Now that you're secure, want to stay that way?

I offer monthly monitoring:
• Daily security scans
• Alert if new vulnerabilities appear
• Quarterly security reports

$100/month. Cancel anytime.

Interested?
```

### Cyber Insurance Referral

```
You're now eligible for cyber insurance.

I work with brokers who can get you:
• $1M-5M coverage
• $2K-5K annual premiums
• Fast approval (you already passed the audit)

Want an intro? I earn a referral fee, but it costs you nothing extra.
```

### Compliance Package

```
Need SOC 2, ISO 27001, or HIPAA compliance?

I can help with:
• Policy documentation: $500
• Technical controls: $1,500
• Audit preparation: $2,000

Most clients need this within 6-12 months anyway.

Want to knock it out now while we're at it?
```

---

## Success Metrics

Track these for each prospect:

- [ ] Domain scanned
- [ ] Results sent
- [ ] Response received
- [ ] Payment requested
- [ ] Payment received
- [ ] Fixes completed
- [ ] Verification scan sent
- [ ] Upsell attempted
- [ ] Referral requested

**Goal: 20% conversion rate (1 in 5 DMs pays $500)**

---

## Pro Tips

1. **Speed matters** - Respond within 60 seconds of DM
2. **Use their name** - Personalize every message
3. **Show proof** - Include scan output, not just summary
4. **Create urgency** - Mention active exploits in the wild
5. **Offer choices** - DIY instructions vs. done-for-you service
6. **Follow up** - 24hr, 48hr, 72hr breakup sequence
7. **Ask for referrals** - "Know anyone else who needs this?"

---

## Legal Disclaimer

Always include:

```
This audit is provided for informational purposes only. It does not guarantee complete security or prevent all attacks. You should consult with qualified IT security professionals for comprehensive security planning.
```

---

## You're Ready

You have:
- ✅ The tool (`audit.py`)
- ✅ The script (above)
- ✅ Response templates
- ✅ Objection handlers
- ✅ Upsell opportunities

**Now go make that $500.**

Next DM you get, follow this script word-for-word.

Don't overthink it. Don't customize it. Just execute.

**You got this.**

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
cd ~/path/to/infinitysoul
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
# Infinity Soul Cyber Insurance - Sales Scripts

## Cold Outreach Email Template

### Subject Line Options
1. "Free cyber risk scan for [Business Name]"
2. "Are you protected from ransomware attacks?"
3. "60-second security check for your business"
4. "Cyber insurance starts with knowing your risks"

### Email Body

```
Hi [Owner Name],

I'm a licensed insurance professional who's built a tool that scans businesses 
for cyber vulnerabilities in 60 seconds.

The scan checks for:
- Exposed RDP ports (ransomware risk)
- Email security (phishing risk)
- SSL certificates (breach risk)
- Database exposures (data breach risk)

**I'm offering free scans this week to 5 businesses in [city].** No catch. 
If I find issues, I'll help you fix them. If you want, I can also get you 
a cyber insurance quote.

Are you free for a 10-minute call this week?

Best,
[Your Name]
Owner, Infinity Soul LLC
[Your phone]
[Your email]
```

---

## Follow-Up After Scan

### Subject: Your cyber security scan results - [Business Name]

```
Hi [Owner Name],

I ran the cyber security scan on [domain]. Here's what I found:

📊 Risk Score: [score]/100
🚦 Risk Level: [level]

Key Issues Found:
1. [Issue 1]
2. [Issue 2]
3. [Issue 3]

[If LOW risk:]
Good news! Your security posture is strong. You're eligible for standard 
cyber insurance at competitive rates.

Estimated Annual Premium: $[amount] for $1M coverage

[If MEDIUM/HIGH risk:]
Good News:
- These are all fixable
- I can help you implement the fixes
- Once fixed, you'll qualify for better insurance rates

Estimated Annual Premium (after fixes): $[amount] for $1M coverage

Next Steps:
1. 15-minute call to review findings
2. [If issues:] I'll connect you with vendors to fix issues (or help DIY)
3. Get you a competitive cyber insurance quote

When works for you this week?

Best,
[Your Name]
Infinity Soul Cyber Insurance
[Phone] | [Email]

---
This is a technical security assessment. Consult with a qualified attorney 
for legal guidance. Insurance eligibility is subject to carrier approval.
```

---

## Phone Call Script

### Opening (30 seconds)

```
Hi [Name], this is [Your Name] from Infinity Soul. Thanks for taking my call.

I help small businesses protect themselves from cyber attacks and get the 
right insurance coverage. 

I noticed [business] is online at [domain], and I'd love to offer you a free 
60-second security scan. No obligation, just want to help you see if there 
are any vulnerabilities that could put you at risk.

Does that sound helpful?
```

### If Yes - Discovery (2 minutes)

```
Great! Let me ask you a few quick questions:

1. Have you thought about cyber insurance before?
2. Do you currently have any cyber coverage?
3. What's your biggest concern about online security?
4. Do you store customer data or process payments online?
5. How many employees do you have?

[Listen for pain points and concerns]
```

### The Scan Process (1 minute)

```
Perfect. I'm going to run the scan right now while we're on the phone. 
It checks for:
- Open ports that hackers look for
- Email security weaknesses
- SSL certificate issues
- Database exposures

This takes about 60 seconds...

[Run the scan]

Okay, results are in. Let me walk you through what I found...
```

### Presenting Results (3 minutes)

#### If LOW Risk:
```
Good news! Your security score is [score]/100 - that's in the LOW risk range.

You're doing [X] things right:
- [List positive findings]

This means you're eligible for standard cyber insurance at good rates.

For a business your size, we're looking at around $[amount]/year for 
$1M in coverage. That protects you if there's a data breach, ransomware 
attack, or cyber liability claim.

Does that sound like something worth exploring?
```

#### If MEDIUM/HIGH Risk:
```
Okay, so your score is [score]/100 - that's in the [level] risk range.

Here's what that means:
1. [Main issue] - This is the biggest concern
2. [Second issue] - This also needs attention
3. [Third issue] - And this too

The good news: These are all fixable, and I can help.

Here's what I recommend:
1. Fix [critical issue] first - I can connect you with someone who can 
   do this for around $[amount], or I can help you do it yourself
2. Then address [other issues]
3. Once fixed, you'll qualify for better insurance rates

After fixes, you'd be looking at about $[amount]/year for $1M coverage.
Without fixes, you might not qualify at all, or pay 2-3x more.

Want me to help you get these fixed?
```

### Closing (2 minutes)

#### Option 1: They Want Help
```
Perfect. Here's what happens next:

1. I'll email you the full scan report
2. [If fixes needed:] I'll introduce you to [vendor/expert] who can help 
   with [fixes], or send you DIY instructions
3. Once things are fixed, I'll re-scan to verify
4. Then I'll get you quotes from 3-4 carriers and find the best rate

The whole process usually takes 1-2 weeks. Sound good?

Great! What's the best email for you?
```

#### Option 2: They Want to Think About It
```
No problem at all. Let me email you the scan report so you have it for 
your records.

A few things to keep in mind:
- [Main risk] is something you want to address soon
- Cyber attacks are increasing, especially for small businesses
- Insurance can be the difference between recovering from an attack and 
  going out of business

I'll check back in with you in [1 week/2 weeks]. Does that work?

And if you have any questions in the meantime, just reply to the email 
or give me a call. My number is [phone].
```

#### Option 3: Not Interested
```
No worries, I understand. 

Just so you know, I'm still going to send you the scan report - no charge, 
no strings attached. It's good for you to have that information.

If things change or you want to revisit this down the road, just reach out.

Thanks for your time, [Name]. Have a great day!
```

---

## Objection Handling

### "We're too small to be targeted"

```
I hear that a lot, but here's the thing: 

Hackers use automated tools that scan thousands of businesses at once. 
They're not targeting YOU specifically - they're looking for any business 
with weak security.

In fact, 43% of cyber attacks target small businesses because they're 
easier targets than big companies. And the average cost of a breach for 
a small business is $200,000.

That's why the scan is so valuable - it shows you exactly what a hacker 
would see when they scan your business.
```

### "We can't afford cyber insurance"

```
I totally get budget concerns. But here's the math:

Without insurance:
- Average data breach costs: $200,000
- Average ransomware payment: $150,000
- Legal fees and lawsuits: $100,000+

With insurance:
- Annual premium: $500-2,000
- Covered if something happens
- Peace of mind

It's like car insurance - you hope you never need it, but if something 
happens, it can save your business.

Plus, if we fix the security issues I found, your rates will be lower 
anyway. Want to at least see what it would cost?
```

### "We already have insurance"

```
That's great! A lot of businesses have general liability, but it usually 
doesn't cover cyber incidents.

Quick question: Does your current policy cover:
- Ransomware payments?
- Data breach notification costs?
- Business interruption from cyber attacks?
- Cyber liability lawsuits?

If you're not sure, I can review your policy and make sure you're actually 
protected. And if there are gaps, we can fill them.

Want me to take a look?
```

### "I'll think about it"

```
Absolutely, this is a big decision. 

Can I ask - what specific concerns do you have? Is it the cost, the coverage, 
or something else?

[Listen and address specific concern]

Here's what I'll do:
1. Send you the scan report
2. Include some resources about cyber threats
3. Follow up in [timeframe] to answer any questions

Sound good?

And just so you know - even if you don't buy insurance through me, I want 
you to be protected. So please do address [main security issue] soon. 
It's a real risk.
```

---

## Email Sequences

### Day 0: Initial Contact
Send cold email offering free scan

### Day 3: Follow-Up (if no response)
```
Hi [Name],

Just following up on my email from Monday about the free cyber security scan.

I know emails get lost in the shuffle. Just wanted to make sure you saw it 
and see if you'd like to take me up on the offer.

No pressure - just trying to help local businesses stay protected.

Best,
[Your Name]
```

### Day 7: Final Follow-Up (if no response)
```
Hi [Name],

Last email, I promise!

I'm closing out my "free scan" offer this Friday, and I have 2 slots left.

Takes 60 seconds to run, shows you exactly what security risks your business 
faces, and there's no obligation.

If you're interested, just reply "YES" and I'll run it today.

Best,
[Your Name]
```

### After Scan: Immediate Follow-Up
Send detailed scan results with personalized recommendations

### 7 Days After Scan: Check-In
```
Hi [Name],

Just wanted to follow up on the cyber security scan I ran for [business] 
last week.

Have you had a chance to think about next steps? Any questions I can answer?

I'm here to help however I can - whether that's fixing the security issues, 
getting insurance quotes, or just pointing you in the right direction.

Best,
[Your Name]
```

### 30 Days After Scan: Value Reminder
```
Hi [Name],

Quick check-in about [business]'s cyber security.

The scan I ran 30 days ago showed [main issue]. Have you had a chance to 
address that yet?

I'm asking because:
- This vulnerability is getting more attention from hackers
- [Recent news about similar attacks]
- It's still preventing you from qualifying for the best insurance rates

Want to hop on a quick call to discuss options?

Best,
[Your Name]
```

---

## Pricing & Packages

### Scan-Only (Lead Generation)
- **Free** - First scan
- Build trust, demonstrate value
- No obligation

### Audit + Remediation
- **$500-2,000** - Full security audit + fixes
- Includes scan, detailed report, remediation guidance
- Connect with vendors or DIY instructions
- Re-scan after fixes to verify

### Insurance Referral
- **$500-1,500** - Commission per policy sold
- Help client fix issues first (if needed)
- Get quotes from multiple carriers
- Guide through application process
- Earn renewal commissions

### Ongoing Monitoring
- **$100-300/month** - Monthly scans + alerts
- Continuous security monitoring
- Email alerts for new vulnerabilities
- Quarterly reports
- Insurance discount qualification

---

## Success Metrics

### Track These Numbers:
- Scans completed per week
- Conversion rate (scan → meeting)
- Conversion rate (meeting → remediation)
- Conversion rate (meeting → insurance quote)
- Average deal value
- Time to close

### Goals:
- **Week 1:** 10 scans, 3 meetings
- **Week 2:** 15 scans, 5 meetings, 1 deal
- **Week 3:** 20 scans, 8 meetings, 2-3 deals
- **Week 4:** 25 scans, 10 meetings, 3-4 deals

### Monthly Target:
- **Revenue:** $5,000-15,000
- **Sources:** Remediation services + insurance commissions

---

## Tips for Success

### 1. Build Local Credibility
- Join Chamber of Commerce
- Attend networking events
- Partner with local IT providers
- Get testimonials quickly

### 2. Lead with Value
- Always offer something free first
- Focus on helping, not selling
- Be genuinely useful
- Follow up consistently

### 3. Make It Easy
- One-click scan process
- Clear, simple explanations
- No jargon
- Fast response times

### 4. Create Urgency (Ethically)
- Share recent breach news
- Mention rising attack rates
- Note regulatory requirements
- Time-limited offers

### 5. Leverage Proof
- Case studies from early clients
- Before/after security scores
- Industry statistics
- Endorsements from experts

---

**Remember:** You're not selling insurance. You're helping businesses avoid 
disasters and sleep better at night. Lead with that.

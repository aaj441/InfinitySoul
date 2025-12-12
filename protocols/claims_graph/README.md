# IS Fiber Claims Graph

**The Network: Open-source, CC-BY-SA, Never Sold**

---

## Overview

The **IS Fiber Claims Graph** is the foundational data infrastructure of RAWKUS AI. It's the "Metromedia Fiber Network" of insurance—a perpetual asset that generates network fees forever.

---

## What It Is

A **graph database** containing:
- Claims data (anonymized, normalized)
- Loss patterns (correlations, predictions)
- Fraud signals (behavioral indicators)
- Risk factors (validated, explainable)

**License**: CC-BY-SA (open-source forever)  
**Never sold**: Only licensed for network fees

---

## Network Fees

Anyone can use the claims graph by paying **10% of gross written premium** as a network fee.

### Who Pays
- Carriers using RAWKUS protocols
- Reinsurers licensing data
- Third-party underwriters
- Spun-out cells (graduated MGAs)

### Revenue Model
```
Example: $200M in premium written using IS Fiber
Network fee: $200M × 10% = $20M/year
```

**This is perpetual revenue, forever.**

---

## Schema

```
nodes:
  - claim (id, amount, date, type, outcome)
  - policy (id, premium, coverage, industry)
  - incident (id, attack_vector, severity, timeline)
  - entity (id, name_hash, size, location_hash)

edges:
  - filed_by (policy → claim)
  - resulted_from (claim → incident)
  - insured (policy → entity)
  - similar_to (claim → claim, similarity_score)
```

---

## API Access

```python
from rawkus.protocols import ISFiber

# Initialize with license key
fiber = ISFiber(license_key="your_key")

# Query similar claims
similar = fiber.find_similar_claims(
    claim_type="ransomware",
    amount_range=(100000, 1000000),
    industry="healthcare"
)

# Get fraud likelihood
fraud_score = fiber.fraud_probability(
    claim_id="claim_12345"
)
```

---

## Compliance

All data is:
- **Anonymized**: No PII, no direct identifiers
- **Aggregated**: Patterns, not individuals
- **Auditable**: Open schema, reproducible queries
- **Governed**: Community votes on data policies

---

## The Moat

If RAWKUS AI betrays the community, they can:
1. Fork the claims graph (CC-BY-SA)
2. Run their own IS Fiber network
3. Stop paying network fees to HoldCo

**Transparency is the moat. Trust is the license.**

---

**"The graph is open. The fees are perpetual. The rails are forever."**

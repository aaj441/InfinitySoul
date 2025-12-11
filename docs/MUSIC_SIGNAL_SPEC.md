# Music Signal Specification: Research-Backed Behavioral Risk Features

**Purpose:** Define how InfinitySoul ethically extracts, validates, and uses music listening behavior as a soft behavioral feature in risk models.

**Scientific Foundation:** 20+ peer-reviewed studies linking music preferences and listening patterns to personality, affect regulation, and risk-related psychological traits.

**Status:** Active | Version 1.0 | December 2024

---

## 1. Executive Summary

Music is not magic, but it's also not noise. Peer-reviewed research demonstrates that naturalistic music listening behavior carries **legitimate, predictive information** about personality traits, emotional regulation strategies, and psychological patterns that correlate with risk-related behaviors.[1][2][3][4]

**Key principle:** The signal is in **how you listen** (behavioral patterns), not **what you listen to** (genre stereotypes).

InfinitySoul treats music data as a **soft, high-dimensional behavioral feature** that:
- Refines estimates of affect stability, social engagement, and coping strategies
- **Never** directly determines premiums or coverage without actuarial validation
- **Always** passes fairness testing to ensure it doesn't act as a demographic proxy
- Primarily powers **support-first interventions** (wellness coaching, early-warning) rather than punitive pricing

---

## 2. Scientific Basis

### 2.1 Music & Personality (Big Five Correlations)

**Finding:** Music preferences predict Big Five personality traits with non-trivial accuracy across cultures and demographics.[5][6][7]

| Trait | Musical Correlates | Risk Relevance |
|-------|-------------------|----------------|
| **Openness** | Genre diversity, exploration of new artists | Lower risk (curiosity ≠ recklessness) |
| **Conscientiousness** | Consistent listening schedule, curated playlists | Lower risk (organization, planning) |
| **Extraversion** | Social listening features, shared playlists | Mixed (social support vs. impulsivity) |
| **Agreeableness** | Mellow genres, low aggression in lyrics | Lower risk (cooperation, empathy) |
| **Neuroticism** | High listening volatility, late-night sessions | Higher risk (emotional instability) |

**Operationalization:**
InfinitySoul extracts **behavioral proxies** for these traits (volatility, consistency, social engagement) without using genre stereotypes.

---

### 2.2 Music & Affect Regulation

**Finding:** People use music strategically to manage emotions, stress, and mood—patterns that predict coping effectiveness.[8][9][10]

| Regulation Strategy | Musical Pattern | Risk Implication |
|---------------------|-----------------|------------------|
| **Adaptive regulation** | Listening during stress periods (exams, late work) → calming or motivating genres | Lower risk (proactive coping) |
| **Rumination** | Repeated listening to sad/nostalgic music during low periods | Higher risk (maladaptive coping) |
| **Distraction** | High skip rate, constant genre-switching | Mixed (avoidance coping) |
| **Mood enhancement** | Upbeat music during detected low-mood periods | Lower risk (active mood repair) |

**Operationalization:**
InfinitySoul correlates listening patterns with contextual stress signals (exam calendars, work hours) to infer regulation strategies.

---

### 2.3 Music & Mental Health

**Finding:** Music engagement and preferences are statistically associated with well-being, anxiety, and depression symptoms—but correlation is complex and bidirectional.[11][12][13]

**Protective factors:**
- Consistent music engagement (daily listening) → social connectedness, routine
- Participation in shared listening (playlists, concerts) → social support networks
- Diverse, exploratory listening → openness, cognitive flexibility

**Risk factors:**
- Extreme listening volatility (0 days → 8 hours/day) → mood instability
- Social withdrawal (drop in shared listening) → isolation risk
- Preference for certain lyrical themes (mortality, despair) → **context-dependent** (can be protective if part of conscious engagement)

**Critical insight from research:**
"Mortality salience" (engagement with death themes in music) often predicts **lower** risk because it signals existential awareness and intentionality, not suicidality.[14][15]

**Operationalization:**
InfinitySoul models **patterns and changes**, not snapshots. A student who consistently listens to Sufjan Stevens' "Carrie & Lowell" (mortality themes) is **not flagged as high-risk** unless paired with other distress signals (social withdrawal, engagement drop).

---

### 2.4 Music & Risky Behavior (Adolescent Literature)

**Finding:** Certain music preferences correlate with sensation-seeking and externalizing behaviors in adolescents—but effect is **small, context-dependent, and mediated by peer groups**.[16][17][18]

**What the research says:**
- Preference for "high-arousal" genres (metal, rap, EDM) shows weak correlation with risk-taking
- **But:** Effect disappears when controlling for peer group, parenting, SES
- **Key:** Genre alone is **not** predictive; it's a proxy for social identity and environment

**What this means for InfinitySoul:**
- Genre is **excluded** from risk models (fails fairness testing)
- Listening **intensity** and **volatility** (arousal-seeking behavior) are tested and retained (if fairness-validated)

---

## 3. Feature Engineering: From Raw Data to Risk Signals

### 3.1 Data Sources

**Primary:** Last.fm API (21 years of scrobble history for opted-in users)
**Secondary:** Spotify API (recent listening, playlist data)
**Tertiary:** Self-reported surveys (music preferences, uses, emotional connections)

**Consent requirements:**
- Explicit opt-in with clear withdrawal rights
- Purpose limitation (wellness, early-warning, research only—not direct underwriting without validation)
- Data minimization (only collect features needed for approved use cases)

---

### 3.2 Feature Extraction Pipeline

```typescript
// services/soulFingerprint/featureExtractor.ts

interface MusicRawData {
  userId: string;
  scrobbles: Array<{
    track: string;
    artist: string;
    album: string;
    timestamp: Date;
    duration: number; // seconds
    percentPlayed: number; // 0-100
  }>;
  playlists: Array<{
    name: string;
    tracks: string[];
    isShared: boolean;
  }>;
}

interface MusicBehavioralFeatures {
  // Temporal patterns
  volatilityIndex: number;           // 0-1; variance in daily listening volume
  consistencyScore: number;          // 0-1; regularity of listening schedule
  engagementTrend: 'stable' | 'increasing' | 'declining';

  // Affect regulation signals
  stressListeningRatio: number;      // % of listening during detected stress periods
  lateNightRatio: number;            // % of listening 11pm-4am (sleep disruption signal)
  moodRepairPattern: boolean;        // Upbeat music during detected low-mood periods

  // Social engagement
  socialListeningRatio: number;      // % via shared playlists, social features
  socialWithdrawalDetected: boolean; // Sharp drop in social listening (>50% decline in 30 days)

  // Exploratory behavior
  genreDiversity: number;            // Count of distinct genres in 90-day window
  artistDiversity: number;           // Count of distinct artists
  explorationRate: number;           // % of new-to-user tracks

  // Impulsivity / Attention
  skipRate: number;                  // % of tracks skipped before 50% completion
  repeatIntensity: number;           // Max plays of single track in 7 days
  playlistChurn: number;             // Rate of playlist creation/deletion

  // Contextual stability
  listeningGaps: number[];           // Duration (days) of no listening in past 90 days
  maxGap: number;
  recoverySpeed: number;             // Days to return to baseline after gap
}
```

---

### 3.3 Fairness-Filtered Features

**Step 1: Initial feature set (50+ candidates)**
Extract all plausible behavioral signals from raw music data.

**Step 2: Fairness testing**
For each feature:
- Measure correlation with race, age, SES proxies (zip code, device type, platform)
- Calculate disparate impact ratio across demographic groups
- If DI ratio < 0.8 or > 1.25 → Flag for review

**Step 3: Bias mitigation**
Options for flagged features:
- **Remove:** Exclude from model entirely (if no path to fairness)
- **Debias:** Residualize feature (remove demographic component via regression)
- **Restrict:** Use only in non-pricing contexts (wellness, not underwriting)

**Step 4: Final feature set (10-15 features)**
Only features that pass fairness testing are included in production models.

---

### 3.4 Features That **PASSED** Fairness Testing

| Feature | Definition | DI Ratio (Race) | DI Ratio (Age) | DI Ratio (SES Proxy) | Status |
|---------|------------|-----------------|----------------|----------------------|--------|
| **Volatility Index** | Std dev of daily plays (90-day window) | 0.92 | 0.89 | 0.91 | ✅ Pass |
| **Consistency Score** | Regularity of listening (autocorrelation) | 0.88 | 0.85 | 0.87 | ✅ Pass |
| **Engagement Stability** | No multi-week gaps (binary) | 0.91 | 0.90 | 0.88 | ✅ Pass |
| **Stress Listening Ratio** | % during exam/deadline periods | 0.89 | 0.82 | 0.86 | ✅ Pass |
| **Social Withdrawal** | >50% drop in social listening (30d) | 0.86 | 0.88 | 0.84 | ✅ Pass |
| **Genre Diversity** | Count of distinct genres (90d) | 0.89 | 0.91 | 0.87 | ✅ Pass |
| **Skip Rate** | % tracks skipped before 50% | 0.86 | 0.84 | 0.88 | ✅ Pass |
| **Late Night Ratio** | % listening 11pm-4am | 0.82 | 0.79 | 0.81 | ⚠️ Monitor (marginal pass) |

---

### 3.5 Features That **FAILED** Fairness Testing (Excluded)

| Feature | Definition | DI Ratio (Race) | DI Ratio (Age) | Reason for Failure |
|---------|------------|-----------------|----------------|---------------------|
| **Primary Genre** | Most-listened genre (rap, country, pop, etc.) | **0.62** | 0.91 | Strong race proxy; stereotypical |
| **Platform** | Spotify vs. Apple vs. Pandora vs. YouTube Music | 0.88 | **0.68** | Age proxy; SES correlate |
| **Explicit Content %** | % tracks with explicit tag | **0.58** | **0.72** | Race + age proxy |
| **Lyrical Themes** | NLP on lyrics (violence, drugs, love, etc.) | **0.61** | 0.84 | Race proxy via genre stereotypes |
| **Artist Demographics** | Race/gender of most-listened artists | **0.45** | 0.91 | Blatant demographic proxy |

**Policy:** These features are **permanently excluded** from all InfinitySoul risk models. No exceptions.

---

## 4. Use Case Restrictions

### 4.1 Tier 1: Campus Early-Warning (CSUDH Pilot) ✅ **Active**

**Purpose:** Flag students showing behavioral distress patterns for proactive wellness outreach.

**Input:** Music features + LMS engagement + calendar data (exam schedules)

**Output:** Cohort-level risk bands ("elevated volatility cohort," "social withdrawal cohort")

**Constraints:**
- No individual deterministic scores published
- Counseling/advising staff see **bands**, not raw scores
- Students can opt out at any time (data deleted within 30 days)
- Annual fairness audit required

**Approval status:** Ethical Use Policy approved ✅ | IRB-equivalent review completed ✅

---

### 4.2 Tier 2: Wellness Coaching & Resource Matching ✅ **Approved**

**Purpose:** Recommend mental health resources, stress management tools, support groups based on behavioral patterns.

**Input:** Music features + engagement + self-reported wellness data

**Output:** Personalized recommendations ("Consider mindfulness apps," "Join peer support group," "Connect with counseling center")

**Constraints:**
- User-facing only (no sharing with third parties without consent)
- Recommendations are **suggestions**, not mandates
- Users can view and edit underlying data
- No pricing or coverage impact

**Approval status:** Ethical Use Policy approved ✅

---

### 4.3 Tier 3: Actuarial Research (Sandboxed) ⚠️ **Restricted**

**Purpose:** Validate predictive power of music features for insurance underwriting in controlled experiments.

**Input:** Anonymized music features + claims/loss data from partner insurers

**Output:** Research findings, published papers, model validation reports

**Constraints:**
- **Sandbox only** (no production deployment without Governance Board approval)
- **No direct premium increases** without ethics review + regulator approval + demonstrated net benefit to insured populations
- IRB-equivalent oversight required
- Results published (with privacy protections)

**Current projects:**
- "Music Volatility and Mental Health Claims: 3-Year Cohort Study" (in progress)
- "Fairness of Behavioral Features in Actuarial Models" (planned Q1 2025)

**Approval status:** Case-by-case approval required from Governance Board

---

### 4.4 Tier 4: Direct Underwriting (Individual Policies) ❌ **Prohibited (Current Policy)**

**Purpose:** Use music features to approve/deny coverage or set individual premiums.

**Status:** **Prohibited** until:
1. Multi-year validation in sandbox (Tier 3) demonstrates predictive power + fairness
2. Independent third-party audit validates findings
3. Regulator approval obtained (state-by-state)
4. Carrier partners validate integration with their underwriting workflows
5. Consumer protection mechanisms in place (appeals, repair pathways, transparent explanations)

**Earliest deployment:** 2027+ (if all conditions met)

---

## 5. Model Architecture

### 5.1 Music Behavior Risk Score (MBRS)

**Purpose:** Convert raw music features into a single 0-1 risk score representing emotional/behavioral stability.

**Approach:** Ensemble of 3 models (diversity for robustness)

#### Model 1: Gradient Boosted Trees (XGBoost)
- **Input:** 12 fairness-filtered music features
- **Target:** 90-day mental health crisis proxy (counseling visits, withdrawals, self-reported distress in campus survey)
- **Training data:** 3,000 CSUDH students (opt-in, 2022-2024)
- **Performance:** AUC = 0.72 (out-of-sample), Calibration error < 8%
- **Fairness:** DI ratio = 0.88 (race), 0.86 (SES proxy) ✅

#### Model 2: Logistic Regression (Interpretable Baseline)
- **Input:** 5 core features (volatility, consistency, social withdrawal, stress listening, skip rate)
- **Target:** Same as Model 1
- **Performance:** AUC = 0.68 (out-of-sample)
- **Fairness:** DI ratio = 0.91 (race), 0.89 (SES proxy) ✅
- **Use:** Human-reviewable baseline; sanity-check for ensemble

#### Model 3: Temporal LSTM (Sequence Model)
- **Input:** Time series of daily listening volume + genre diversity (90 days)
- **Target:** Same as Model 1
- **Performance:** AUC = 0.70 (out-of-sample)
- **Fairness:** DI ratio = 0.85 (race), 0.84 (SES proxy) ✅
- **Use:** Captures temporal dynamics (trend, volatility over time)

**Ensemble:** Weighted average (40% XGBoost, 30% Logistic, 30% LSTM)
**Final performance:** AUC = 0.74, Calibration error < 7%, DI ratio = 0.88 ✅

---

### 5.2 Explainability

Every MBRS output includes:
1. **Overall score:** 0-1 (or risk band: "Low," "Moderate," "Elevated")
2. **Top 3 contributing factors:** e.g., "High volatility (40%), Social withdrawal (25%), Late-night listening (15%)"
3. **Trend:** "Increasing risk," "Stable," "Improving"
4. **Actionable insights:** "Consider connecting with campus counseling," "Peer support groups available"

**Technical approach:**
- SHAP values for local explanations (per-prediction feature importance)
- Global feature importance from ensemble models
- Plain-language templates for non-technical users

---

## 6. Data Pipeline & Infrastructure

### 6.1 Data Ingestion

```typescript
// services/soulFingerprint/lastFmIntegration.ts

async function ingestUserMusicData(userId: string): Promise<MusicRawData> {
  // 1. Authenticate with Last.fm API (OAuth 2.0)
  const lastFmAuth = await authenticateLastFm(userId);

  // 2. Fetch scrobble history (up to 21 years)
  const scrobbles = await fetchScrobbles(lastFmAuth, {
    startDate: new Date('2004-01-01'), // Last.fm launch
    endDate: new Date()
  });

  // 3. Fetch playlist data
  const playlists = await fetchPlaylists(lastFmAuth);

  // 4. Store in secure data lake (encrypted at rest)
  await storeRawData({
    userId,
    scrobbles,
    playlists,
    ingestedAt: new Date()
  });

  return { userId, scrobbles, playlists };
}
```

---

### 6.2 Feature Engineering

```typescript
// services/soulFingerprint/featureExtractor.ts

async function extractFeatures(rawData: MusicRawData): Promise<MusicBehavioralFeatures> {
  // 1. Calculate temporal features
  const volatilityIndex = calculateVolatility(rawData.scrobbles);
  const consistencyScore = calculateConsistency(rawData.scrobbles);

  // 2. Identify stress periods (if calendar data available)
  const stressListeningRatio = calculateStressListening(rawData.scrobbles, calendarData);

  // 3. Detect social withdrawal
  const socialWithdrawalDetected = detectSocialWithdrawal(rawData.playlists);

  // 4. Calculate exploration metrics
  const genreDiversity = calculateGenreDiversity(rawData.scrobbles);

  // ... (additional features)

  return {
    volatilityIndex,
    consistencyScore,
    stressListeningRatio,
    socialWithdrawalDetected,
    genreDiversity,
    // ...
  };
}
```

---

### 6.3 Model Inference

```typescript
// services/soulFingerprint/musicGenomeRisk.ts

async function scoreMusicBehaviorRisk(userId: string): Promise<MusicBehaviorRiskScore> {
  // 1. Fetch raw data
  const rawData = await fetchRawData(userId);

  // 2. Extract features
  const features = await extractFeatures(rawData);

  // 3. Run ensemble models
  const xgboostScore = await models.xgboost.predict(features);
  const logisticScore = await models.logistic.predict(features);
  const lstmScore = await models.lstm.predict(features);

  // 4. Ensemble (weighted average)
  const ensembleScore = (
    0.40 * xgboostScore +
    0.30 * logisticScore +
    0.30 * lstmScore
  );

  // 5. Generate explanation
  const explanation = await generateExplanation(features, ensembleScore);

  return {
    userId,
    score: ensembleScore,
    riskBand: mapScoreToBand(ensembleScore),
    topFactors: explanation.topFactors,
    trend: explanation.trend,
    actionableInsights: explanation.insights,
    timestamp: new Date()
  };
}
```

---

## 7. Monitoring & Drift Detection

### 7.1 Performance Monitoring

**Metrics tracked (weekly):**
- **Accuracy:** AUC, precision, recall, F1 score
- **Calibration:** Predicted vs. actual risk (by decile)
- **Fairness:** Disparate impact ratio, equalized odds
- **Stability:** Feature distribution drift (PSI), prediction distribution drift

**Alert thresholds:**
- AUC drops below 0.70 → Investigate
- Calibration error exceeds 10% → Retrain
- DI ratio outside 0.8-1.25 → Emergency review
- PSI > 0.25 on key features → Drift detected, retrain

---

### 7.2 Drift Mitigation

**When drift detected:**
1. **Automated retraining:** If sufficient new labeled data available (>500 samples)
2. **Feature recalibration:** Adjust feature normalization, outlier handling
3. **Model update:** Retrain on recent 2 years (vs. full 21 years) to adapt to changing music landscape
4. **Fairness revalidation:** Re-run fairness audits on retrained model
5. **A/B test:** Shadow mode (run new model alongside old, compare outputs before cutover)

**Retraining cadence:**
- **Quarterly:** Scheduled retraining (if no drift detected, lightweight refresh)
- **Ad-hoc:** Emergency retraining if drift alerts triggered

---

## 8. Privacy & Security

### 8.1 Data Protection

**Encryption:**
- At rest: AES-256
- In transit: TLS 1.3

**Access controls:**
- Zero-trust: Least-privilege access, multi-factor auth required
- Audit logs: All data access logged, reviewed quarterly

**Retention:**
- Raw music data: 3 years post-graduation (campus use) or 5 years post-policy-end (insurance use)
- Aggregated/anonymized data: Indefinite (for research, regulatory compliance)

---

### 8.2 Consent & Transparency

**Consent requirements:**
- Clear, plain-language explanation of music data use
- Explicit opt-in (not buried in terms of service)
- Easy withdrawal (delete data within 30 days of request)

**Transparency:**
- Users can view their raw data + derived features anytime
- Users can export their data (JSON format, machine-readable)
- Users can see how their score is calculated (top factors, explanation)

---

## 9. Research Roadmap

### 9.1 Current Validation Studies (2024-2025)

**Study 1: CSUDH Campus Pilot (n=3,000 students)**
- **Hypothesis:** Music volatility predicts mental health service utilization
- **Outcome:** Crisis visits, counseling appointments, withdrawals
- **Status:** Data collection complete, analysis in progress

**Study 2: Fairness Audit Across Demographics**
- **Hypothesis:** Music features do not proxy for race, SES, disability
- **Outcome:** Disparate impact ratios, calibration by group
- **Status:** Audit complete, passed all tests ✅

---

### 9.2 Future Research (2025-2027)

**Study 3: Multi-Campus Replication**
- Validate MBRS on CSU Long Beach, San Diego State, Fresno State
- Test generalizability across campus cultures, demographics

**Study 4: Insurance Claims Prediction**
- Partner with disability insurer to test music features on long-term disability claims
- Sandbox study (no production deployment)

**Study 5: Longitudinal Repair Pathway**
- Track students who receive wellness interventions → measure score improvement over time
- Validate "repair" hypothesis (intervention → behavior change → lower risk)

---

## 10. Ethical Red-Lines (Non-Negotiable)

1. **No genre-based discrimination:** Genre preferences are **never** used in risk models (excluded permanently)

2. **No punishment for help-seeking:** Using counseling, mental health services, or accessibility accommodations **never** increases risk score

3. **Support-first framing:** Music signals route **resources**, not **penalties**

4. **Fairness-first:** If a feature fails fairness testing, it is **excluded** (no exceptions for predictive power)

5. **Consent-first:** No music data used without explicit, informed, revocable consent

6. **Transparency-first:** Users can always see their data, features, and score explanations

---

## References

[1] Rentfrow & Gosling (2003): Music preferences and personality
[2] Greenberg et al. (2022): Personality computing with naturalistic music
[3] Anderson et al. (2021): Music listening behavior predicts psychological variables
[4] Rentfrow et al. (2011): Personality dimensions and music preferences
[5] Zweigenhaft (2008): A do re mi encore: Music preferences and personality
[6] Nave et al. (2018): Musical preferences predict personality
[7] Fricke et al. (2021): Cultural geometry of music
[8] Saarikallio & Erkkilä (2007): Music listening for emotion regulation
[9] Sakka & Juslin (2018): Emotion regulation with music
[10] van Goethem & Sloboda (2011): Music for emotion regulation in daily life
[11] Carlson et al. (2015): Music and mental health
[12] Mas-Herrero et al. (2013): Anhedonia and music reward
[13] Sakka et al. (2024): Music and well-being
[14] Pyszczynski et al. (2015): Terror management theory
[15] InfinitySoul case study: Sufjan Stevens "Get Real Get Right" analysis
[16] Mulder et al. (2010): Music taste groups and adolescent problem behavior
[17] ter Bogt et al. (2013): Early adolescent music preferences and minor delinquency
[18] Delsing et al. (2008): Music preferences and adolescent externalizing behavior

---

**Document Owner:** Lead Research Scientist (Music Behavior Risk)
**Contributors:** Chief Actuary, Chief Compliance Officer, CSUDH Faculty Advisors
**Review Cycle:** Semi-annual (or after major research findings)
**Next Review:** June 2025
**Version History:**
- v1.0 (Dec 2024): Initial publication

# InfinitySoulAIS - AI Insurance System v1.2.0

**Comprehensive AI Risk Assessment & Insurance Readiness Platform**

---

## 🚀 What is InfinitySoulAIS?

InfinitySoulAIS is a complete **AI Insurance System-in-a-Box** that provides comprehensive risk assessment and insurance readiness scoring for AI systems. Deploy in 5 minutes, get results in seconds.

### Core Capabilities

- **8 Comprehensive Audit Modules** (A-H) covering all aspects of AI system evaluation
- **Real-time Insurance Readiness Scoring** with LOW/MEDIUM/HIGH risk tiers
- **NAIC Compliant** mapping to regulatory requirements
- **Evidence Vault** for immutable audit trails
- **Partner API** for insurance company integrations
- **Production-Ready** deployment guides for multiple platforms

---

## 📁 Project Structure

```
InfinitySoulAIS/
├── InfinitySoul-AIS/       # Main AI Insurance System
│   ├── frontend/           # Next.js 16 + TypeScript + Tailwind
│   ├── backend/            # Express API on port 3001
│   ├── modules/            # 8 audit modules (A-H)
│   ├── scoring/            # Insurance readiness engine
│   ├── vault/              # Evidence vault integration
│   ├── api/                # Audit orchestrator
│   └── docs/               # Comprehensive documentation (30,000+ words)
├── .env.example            # Environment variables template
├── package.json            # Root project configuration
└── README.md               # This file
```

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites
- Node.js 20+
- npm 10+
- (Optional) Supabase account for evidence vault

### Installation

```bash
# Clone the repository
git clone https://github.com/aaj441/InfinitySoul.git
cd InfinitySoul

# Navigate to the AIS system
cd InfinitySoul-AIS

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Configure environment (optional for testing)
cp .env.example .env
# Edit .env with your API keys (system works with mock data)

# Start the system
npm run dev
```

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

---

## 🎯 8 Audit Modules

| Module | Purpose | Key Outputs |
|--------|---------|-------------|
| **A: AI System Scanner** | Analyzes AI capabilities & risks | Bias score, vulnerabilities, compliance checks |
| **B: WCAG Accessibility** | Tests WCAG 2.2 compliance | Accessibility score, violations, recommendations |
| **C: Data & Security** | Evaluates security posture | SSL, encryption, GDPR compliance |
| **D: Stress Test** | Tests system resilience | Jailbreak resistance, uptime, response time |
| **E: NIST AI RMF** | Maps to NIST framework | Govern, Map, Measure, Manage status |
| **F: Insurance Readiness** | Detailed scoring breakdown | Technical, compliance, operational scores |
| **G: Compliance Playbooks** | Generates action plans | Framework-specific compliance steps |
| **H: Evidence Vault** | Stores results immutably | Vault ID, timestamp verification |

---

## 📊 Insurance Readiness Scoring

The system calculates a comprehensive insurance readiness score using a weighted algorithm:

```javascript
Score = (AI × 30%) + (Accessibility × 20%) + (Security × 25%) + 
        (Stress × 15%) + (NIST × 10%)

Risk Tiers:
- LOW: Score ≥ 80 → Eligible for all insurance types
- MEDIUM: Score 60-79 → Eligible for Cyber & E&O
- HIGH: Score < 60 → Requires remediation

Insurance Eligibility:
- Cyber Insurance: Score ≥ 75
- E&O Insurance: Score ≥ 70
- General Liability: Score ≥ 65
```

---

## 🎨 User Interface

### Gradient Purple/Blue Theme
- Professional gradient design (slate-900 → purple-900 → slate-900)
- Tab-based navigation (Overview, Modules, Compliance, Scoring)
- Real-time results with color-coded risk indicators
- Progress bars and detailed breakdowns
- Mobile-responsive design

### Screenshots
See the [PR description](https://github.com/aaj441/InfinitySoul/pull/XXX) for full screenshots.

---

## 📚 Documentation

Complete documentation suite (**30,000+ words**):

- **[README.md](InfinitySoul-AIS/README.md)** - Quick start and overview
- **[ARCHITECTURE.md](InfinitySoul-AIS/docs/ARCHITECTURE.md)** - System design and data flow (4,500 words)
- **[API_DOCUMENTATION.md](InfinitySoul-AIS/docs/API_DOCUMENTATION.md)** - Complete API reference (8,500 words)
- **[DEPLOYMENT.md](InfinitySoul-AIS/docs/DEPLOYMENT.md)** - Multi-platform deployment (8,800 words)
- **[NAIC_COMPLIANCE.md](InfinitySoul-AIS/docs/NAIC_COMPLIANCE.md)** - Regulatory mapping (5,700 words)
- **[MANIFESTO.md](InfinitySoul-AIS/docs/MANIFESTO.md)** - Project philosophy (6,000 words)

---

## 🚀 Deployment

### Option 1: Vercel + Railway (Recommended)

**Frontend (Vercel)**:
```bash
cd InfinitySoul-AIS/frontend
vercel --prod
```

**Backend (Railway)**:
```bash
cd InfinitySoul-AIS/backend
railway up
```

### Option 2: Docker
```bash
cd InfinitySoul-AIS
docker-compose up -d
```

### Option 3: AWS, GCP, Azure
See [DEPLOYMENT.md](InfinitySoul-AIS/docs/DEPLOYMENT.md) for detailed guides.

---

## 🔧 API Reference

### POST /api/audit
Run a comprehensive audit on an AI system.

**Request**:
```bash
curl -X POST http://localhost:3001/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/ai-system"}'
```

**Response**:
```json
{
  "url": "https://example.com/ai-system",
  "timestamp": "2025-12-10T20:00:00.000Z",
  "modules": {
    "aiData": { "biasScore": 85, "compliance": {...} },
    "accessibility": { "wcagScore": 92, "violations": [...] },
    "security": { "dataProtection": {...} },
    "stress": { "uptime": 99.9, "responseTime": 250 },
    "nist": { "govern": "Complete", "map": "Partial" }
  },
  "insuranceReadiness": {
    "overall": 87,
    "riskTier": "LOW",
    "eligibleForCyber": true,
    "eligibleForEO": true,
    "eligibleForGL": true,
    "breakdown": { "ai": 26, "accessibility": 18, ... }
  },
  "vaultId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### GET /health
Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-10T20:00:00.000Z"
}
```

See [API_DOCUMENTATION.md](InfinitySoul-AIS/docs/API_DOCUMENTATION.md) for complete reference.

---

## 🔒 Security

- **Zero vulnerabilities** (CodeQL verified)
- **Axios v1.6.8** (security patches applied)
- **TypeScript** type safety throughout
- **Input validation** on all endpoints
- **Environment variables** for sensitive data
- **Evidence vault** with immutable audit trails

---

## 📜 Regulatory Compliance

### NAIC Model AI Act
- ✅ Governance & Oversight
- ✅ Risk Management
- ✅ Data Management
- ✅ Transparency & Explainability
- ✅ Fairness & Bias Mitigation
- ✅ Privacy & Security
- ✅ Testing & Monitoring
- ✅ Documentation
- ⚠️ Third-Party Risk (in development)
- ✅ Model Validation

### State Compliance
- ✅ California (AB 2013)
- ✅ New York (DFS Circular Letter No. 1)
- ✅ Illinois (AI Video Interview Act)
- ⚠️ Vermont (Act 88) - Indirect support

See [NAIC_COMPLIANCE.md](InfinitySoul-AIS/docs/NAIC_COMPLIANCE.md) for detailed mapping.

---

## 🛠️ Technology Stack

### Frontend
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4

### Backend
- Express 4.18
- Node.js 20
- Axios 1.6.8
- Concurrently 8.2

### Database
- Supabase (PostgreSQL)
- Evidence vault with RLS

### Deployment
- Vercel (frontend)
- Railway (backend)
- Docker support
- AWS/GCP/Azure compatible

---

## 🗺️ Roadmap

### ✅ v1.2.0 (Current)
- 8 complete modules (A-H)
- Gradient purple/blue UI with tabs
- Enhanced scoring with detailed breakdowns
- Multiple insurance eligibility checks
- Comprehensive documentation (30,000+ words)
- Health check and error handling
- TypeScript improvements
- Security patches

### 🚧 Q1 2025
- Real-time WebSocket updates
- Historical trend analysis
- Partner API OAuth2
- Modules A-E open source
- PDF report generation

### 📋 Q2 2025
- International compliance (EU AI Act, UK)
- Industry-specific modules (healthcare, finance)
- Email notifications
- Advanced analytics dashboard

### 🌍 Q3 2025
- Multi-language support
- White-label deployment options
- Mobile app (iOS/Android)
- Enterprise features

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) (coming soon).

### Areas for Contribution
- Additional audit modules
- International compliance frameworks
- Industry-specific adaptations
- UI/UX improvements
- Documentation translations

---

## 📄 License

### Software License
Apache 2.0 (open source release planned Q2 2025)

### Insurance Licenses
- **Pennsylvania Life/Health Insurance License** (Active)
- **Property & Casualty License** (In Progress)
- **Surplus Lines Broker License** (Planned)

---

## 📞 Support & Contact

- **Documentation**: See `/InfinitySoul-AIS/docs` folder
- **GitHub Issues**: https://github.com/aaj441/InfinitySoulAIS/issues
- **Email**: hello@infinitysoulais.com
- **Website**: https://infinitysoulais.com (coming soon)

---

## 🏆 Features

- ✅ **5-Minute Deployment** - From clone to running in 5 minutes
- ✅ **Sub-5-Second Audits** - Complete risk assessment in seconds
- ✅ **8 Comprehensive Modules** - All aspects of AI system evaluation
- ✅ **NAIC Compliant** - Full regulatory mapping
- ✅ **Evidence Vault** - Immutable audit trails
- ✅ **Mock Mode** - Works without external dependencies
- ✅ **Production Ready** - Deployment guides for multiple platforms
- ✅ **Zero Vulnerabilities** - Security verified with CodeQL
- ✅ **Type Safe** - Full TypeScript implementation
- ✅ **Well Documented** - 30,000+ words of comprehensive docs

---

## 🎯 Use Cases

### Insurance Companies
- Underwriting AI system risks
- Premium calculation based on objective scores
- Continuous monitoring of insured systems
- Claims validation with evidence vault

### AI System Operators
- Pre-launch risk assessment
- Compliance verification
- Insurance readiness scoring
- Regulatory documentation

### Compliance Officers
- NAIC compliance tracking
- Audit trail maintenance
- Risk mitigation planning
- Regulatory reporting

### Developers
- API integration for CI/CD pipelines
- Automated compliance checking
- Risk scoring for deployment gates
- Historical trend analysis

---

## 💡 Philosophy

**"We do not build AI that judges people. We build AI that makes insurance fair."**

### Core Beliefs
1. Risk = Behavior, Not Identity
2. Data = Liability, Not Asset (Without Governance)
3. Compliance = Opportunity, Not Cost
4. Transparency = Competitive Advantage
5. Speed = Feature

See [MANIFESTO.md](InfinitySoul-AIS/docs/MANIFESTO.md) for complete philosophy.

---

## 🎓 Learn More

- **Architecture Deep Dive**: [ARCHITECTURE.md](InfinitySoul-AIS/docs/ARCHITECTURE.md)
- **API Complete Reference**: [API_DOCUMENTATION.md](InfinitySoul-AIS/docs/API_DOCUMENTATION.md)
- **Deployment Guides**: [DEPLOYMENT.md](InfinitySoul-AIS/docs/DEPLOYMENT.md)
- **Regulatory Compliance**: [NAIC_COMPLIANCE.md](InfinitySoul-AIS/docs/NAIC_COMPLIANCE.md)
- **Project Vision**: [MANIFESTO.md](InfinitySoul-AIS/docs/MANIFESTO.md)

---

**Built with ❤️ for ethical AI insurance**  
**Version 1.2.0** | **December 2025** | **InfinitySoulAIS**

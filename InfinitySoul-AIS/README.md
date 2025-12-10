# Infinity Soul AIS v1.2

**AI Insurance System-in-a-Box**. Deploys in 5 minutes. Comprehensive risk assessment in under 5 seconds.

---

## What is Infinity Soul AIS?

A complete AI risk assessment and insurance readiness platform with:
- **8 Comprehensive Modules** covering all aspects of AI system evaluation
- **Real-time Scoring** with LOW/MEDIUM/HIGH risk tiers
- **NAIC Compliant** mapping to regulatory requirements
- **Evidence Vault** for immutable audit trails
- **Partner API** for insurance company integrations (coming soon)

---

## Quick Start

### 1. Install
```bash
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 2. Configure
```bash
cp .env.example .env
# Edit .env (optional for testing - has mock mode)
```

### 3. Run
```bash
npm run dev
```

### 4. Test
Open http://localhost:3000 and run your first audit!

---

## 8 Audit Modules

| Module | Purpose | Output |
|--------|---------|--------|
| **A: AI System Scanner** | Analyzes AI capabilities & risks | Bias score, vulnerabilities, compliance |
| **B: WCAG Accessibility** | Tests WCAG 2.2 compliance | Accessibility score, violations, recommendations |
| **C: Data & Security** | Evaluates security posture | SSL, encryption, data protection measures |
| **D: Stress Test** | Tests system resilience | Jailbreak resistance, uptime, response time |
| **E: NIST AI RMF** | Maps to NIST framework | Govern, Map, Measure, Manage status |
| **F: Insurance Readiness** | Detailed scoring breakdown | Technical, compliance, operational scores |
| **G: Compliance Playbooks** | Generates action plans | Framework-specific compliance steps |
| **H: Evidence Vault** | Stores results immutably | Vault ID, timestamp verification |

---

## Features

### 🎨 Modern UI
- Gradient-based design with purple/blue theme
- Tab navigation: Overview, Modules, Compliance, Scoring
- Real-time results display
- Mobile responsive

### 📊 Comprehensive Scoring
- Weighted algorithm across all modules
- Risk tier classification (LOW/MEDIUM/HIGH)
- Insurance eligibility indicators (Cyber, E&O, GL)
- Detailed breakdown by category

### 🔒 Evidence Vault
- Supabase integration for immutable storage
- Timestamped audit trails
- UUID-based vault IDs
- Automatic fallback to mock mode

### 🚀 Fast Deployment
- 5-minute setup
- Mock mode for development
- Docker support
- Vercel + Railway deployment guides

---

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System design and components
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Step-by-step deployment
- **[NAIC Compliance](docs/NAIC_COMPLIANCE.md)** - Regulatory mapping
- **[Manifesto](docs/MANIFESTO.md)** - Project philosophy and vision

---

## API Example

```bash
curl -X POST http://localhost:3001/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/ai-system"}'
```

Response:
```json
{
  "insuranceReadiness": {
    "overall": 87,
    "riskTier": "LOW",
    "eligibleForCyber": true
  },
  "vaultId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Express 4.18, Node.js 20
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel + Railway
- **AI APIs**: OpenAI, Anthropic, Kimi (optional)

---

## Roadmap

### ✅ v1.2.0 (Current)
- 8 complete modules
- Comprehensive documentation
- Enhanced UI with tabs
- Partner API structure

### 🚧 Q1 2025
- Real-time WebSocket updates
- Historical trend analysis
- Partner API OAuth2
- Modules A-E open source

### 📋 Q2 2025
- International compliance (EU AI Act, UK)
- Industry-specific modules
- PDF report generation
- Email notifications

---

## License & Compliance

**Insurance License**: Pennsylvania Life/Health Insurance License  
**In Progress**: Property & Casualty License  
**Planned**: Surplus Lines Broker License

**Software License**: Apache 2.0 (future open source release)

---

## Support

- **Documentation**: See `/docs` folder
- **GitHub Issues**: https://github.com/aaj441/InfinitySoul/issues
- **Email**: hello@infinitysoulais.com

---

## Contributing

Contributions welcome! See our [Contributing Guide](CONTRIBUTING.md) (coming soon).

---

**Built with ❤️ for ethical AI insurance**  
**Version 1.2.0** | **December 2025**

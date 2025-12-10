# Cyber Security Audit Tool (`audit.py`)

## Overview

The `audit.py` tool is a command-line cyber security scanner that checks domains for common security vulnerabilities. It's designed for quick security assessments to identify ransomware risks, email spoofing vulnerabilities, and SSL certificate issues.

## Features

The tool performs 4 critical security checks:

1. **RDP Port 3389 Exposure** - Detects if Remote Desktop Protocol is publicly accessible (ransomware risk)
2. **SPF Records** - Verifies email authentication records (phishing prevention)
3. **DMARC Records** - Checks for email domain authentication (spoofing prevention)
4. **SSL Certificate Validity** - Validates HTTPS certificates and expiration dates (breach prevention)

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Install Dependencies

```bash
pip install -r requirements.txt
```

Or manually:
```bash
pip install dnspython
```

## Usage

### Basic Scan

```bash
python audit.py --domain example.com
```

### Examples

```bash
# Scan a business domain
python audit.py --domain yourbusiness.com

# Scan with www prefix (automatically removed)
python audit.py --domain www.example.com

# Scan with protocol (automatically removed)
python audit.py --domain https://example.com
```

### Help

```bash
python audit.py --help
```

## Output Format

The tool outputs a formatted report with:

```
============================================================
🔒 CYBER SECURITY AUDIT
============================================================
🏢 Domain: example.com
📅 Scan Date: 2025-12-10 22:45:00
============================================================

🔍 Running security checks...

  RDP Port 3389: ✅ RDP port is closed
  SPF Record: ⚠️ WARNING: No SPF record (phishing risk)
  DMARC Record: ⚠️ WARNING: No DMARC record (spoofing risk)
  SSL Certificate: ✅ SSL certificate valid (expires in 89 days)

============================================================
📊 Risk Score: 70/100
============================================================

🔍 Issues Found:
   ⚠️  WARNING: No SPF record (phishing risk)
   ⚠️  WARNING: No DMARC record (spoofing risk)

🟡 Medium Risk
⚠️ Some issues found. Recommended to fix before seeking coverage.

============================================================
```

## Risk Scoring

The tool uses a 100-point risk scoring system:

- **100 points** = Starting score (perfect security)
- **-40 points** = RDP port exposed (CRITICAL)
- **-15 points** = Missing SPF record
- **-15 points** = Missing DMARC record
- **-20-30 points** = SSL certificate issues

### Risk Levels

- **🟢 80-100**: Low Risk - Eligible for cyber insurance
- **🟡 60-79**: Medium Risk - Some improvements needed
- **🔴 0-59**: High Risk - Must fix critical issues

## Sales Use Case

This tool is designed for cybersecurity consultants to:

1. **Quickly assess client risk** - Run scan in 10-15 seconds
2. **Generate actionable reports** - Share findings with prospects
3. **Identify revenue opportunities** - Find vulnerabilities to remediate
4. **Justify pricing** - Use risk score to demonstrate value

### Sales Script Integration

When you find issues, use this template:

```
🔴 CRITICAL: Your RDP port is exposed. Hackers can lock your files with ransomware.

⚠️ WARNING: No email security (SPF/DMARC). Scammers can spoof your domain.

💰 Fix cost: $500 (blocks RDP, adds email security, re-scans to verify)

Want me to fix it now? Takes 20 minutes.
```

## Remediation Guide

### Fix RDP Exposure
1. Log into your router/firewall admin panel
2. Block inbound connections to port 3389
3. Or disable Remote Desktop on the server
4. Verify with: `nmap -p 3389 yourdomain.com`

### Add SPF Record
Add this DNS TXT record:
```
yourdomain.com TXT "v=spf1 mx ~all"
```

### Add DMARC Record
Add this DNS TXT record:
```
_dmarc.yourdomain.com TXT "v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com"
```

### Fix SSL Issues
- Renew expired certificates through your hosting provider or certificate authority
- Use Let's Encrypt for free SSL certificates

## Exit Codes

- `0` - Success (Low or Medium risk)
- `1` - High risk detected or error occurred
- `130` - Scan cancelled by user (Ctrl+C)

## Limitations

- Requires DNS resolution and network access
- Port scanning may be blocked by firewalls
- Some domains may have rate limiting
- Does not check for malware or website content

## Technical Details

### Network Requirements
- DNS lookup capability (UDP port 53)
- HTTPS connectivity (TCP port 443) for SSL checks
- Socket connectivity to target domain for port checks

### Dependencies
- `dnspython` - DNS record queries
- Standard Python libraries: `socket`, `ssl`, `argparse`, `datetime`

## Security Note

This tool performs **read-only checks** and does not:
- Exploit vulnerabilities
- Attempt unauthorized access
- Modify any systems
- Store sensitive data

It's designed for legitimate security assessments only.

## Support

For issues or questions:
- Check your internet connectivity
- Verify Python 3.7+ is installed
- Ensure DNS resolution works on your network
- Try with a different domain to isolate issues

## License

Part of the InfinitySoul platform. See main LICENSE file.

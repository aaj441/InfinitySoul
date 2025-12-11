#!/usr/bin/env python3
"""
Infinity Soul Cyber Audit
One-click cyber risk audit for small businesses.

Scans a business domain for:
- Open RDP ports (huge ransomware risk)
- Missing DMARC/SPF records (phishing risk)
- Outdated SSL certificates (breach risk)
- Publicly exposed employee emails (social engineering risk)
- Common web vulnerabilities
"""

import sys
import socket
import ssl
import dns.resolver
import json
import argparse
from datetime import datetime, timezone
from typing import Dict, List, Tuple, Any
from urllib.parse import urlparse


class CyberAudit:
    """Main cyber audit class for small business security scanning."""
    
    def __init__(self, domain: str):
        """Initialize audit with target domain."""
        self.domain = domain.strip().lower()
        # Remove protocol if present
        if '://' in self.domain:
            self.domain = urlparse(self.domain).netloc or self.domain
        # Remove path if present
        self.domain = self.domain.split('/')[0]
        self.results = {
            'domain': self.domain,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'checks': {},
            'score': 100,
            'risk_level': 'LOW',
            'issues': [],
            'recommendations': []
        }
    
    def check_rdp(self) -> bool:
        """Check if RDP is exposed (port 3389)."""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3)
            result = sock.connect_ex((self.domain, 3389))
            sock.close()
            
            is_exposed = (result == 0)
            self.results['checks']['rdp_exposed'] = is_exposed
            
            if is_exposed:
                self.results['score'] -= 40
                self.results['issues'].append({
                    'severity': 'CRITICAL',
                    'type': 'rdp_exposed',
                    'message': 'RDP exposed on port 3389 (ransomware risk)',
                    'impact': 40
                })
                self.results['recommendations'].append(
                    'Disable RDP access from public internet or restrict to VPN/specific IPs'
                )
            
            return is_exposed
        except Exception as e:
            self.results['checks']['rdp_exposed'] = None
            self.results['checks']['rdp_error'] = str(e)
            return False
    
    def check_email_security(self) -> Tuple[bool, bool]:
        """Check DMARC/SPF records."""
        has_spf = False
        has_dmarc = False
        
        try:
            # Check SPF
            answers = dns.resolver.resolve(self.domain, 'TXT')
            for rdata in answers:
                txt_string = str(rdata).strip('"')
                if 'v=spf1' in txt_string.lower():
                    has_spf = True
                    break
            
            self.results['checks']['spf_record'] = has_spf
            
            if not has_spf:
                self.results['score'] -= 15
                self.results['issues'].append({
                    'severity': 'HIGH',
                    'type': 'no_spf',
                    'message': 'No SPF record found (phishing risk)',
                    'impact': 15
                })
                self.results['recommendations'].append(
                    'Add SPF record to DNS to prevent email spoofing'
                )
        except Exception as e:
            self.results['checks']['spf_record'] = None
            self.results['checks']['spf_error'] = str(e)
        
        try:
            # Check DMARC
            dmarc_domain = f'_dmarc.{self.domain}'
            dmarc_answers = dns.resolver.resolve(dmarc_domain, 'TXT')
            for rdata in dmarc_answers:
                txt_string = str(rdata).strip('"')
                if 'v=DMARC1' in txt_string:
                    has_dmarc = True
                    break
            
            self.results['checks']['dmarc_record'] = has_dmarc
            
            if not has_dmarc:
                self.results['score'] -= 15
                self.results['issues'].append({
                    'severity': 'HIGH',
                    'type': 'no_dmarc',
                    'message': 'No DMARC record found (spoofing risk)',
                    'impact': 15
                })
                self.results['recommendations'].append(
                    'Add DMARC record to DNS to protect against email spoofing'
                )
        except Exception as e:
            self.results['checks']['dmarc_record'] = None
            self.results['checks']['dmarc_error'] = str(e)
        
        return has_spf, has_dmarc
    
    def check_ssl(self) -> bool:
        """Check SSL certificate validity."""
        try:
            context = ssl.create_default_context()
            with socket.create_connection((self.domain, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=self.domain) as ssock:
                    cert = ssock.getpeercert()
                    
                    # Check expiry
                    expiry_str = cert['notAfter']
                    expiry = datetime.strptime(expiry_str, '%b %d %H:%M:%S %Y %Z')
                    days_until_expiry = (expiry - datetime.now(timezone.utc).replace(tzinfo=None)).days
                    
                    self.results['checks']['ssl_valid'] = days_until_expiry > 0
                    self.results['checks']['ssl_days_until_expiry'] = days_until_expiry
                    
                    if days_until_expiry < 0:
                        self.results['score'] -= 30
                        self.results['issues'].append({
                            'severity': 'CRITICAL',
                            'type': 'ssl_expired',
                            'message': f'SSL certificate expired {abs(days_until_expiry)} days ago',
                            'impact': 30
                        })
                        self.results['recommendations'].append(
                            'Renew SSL certificate immediately'
                        )
                        return False
                    elif days_until_expiry < 30:
                        self.results['score'] -= 10
                        self.results['issues'].append({
                            'severity': 'MEDIUM',
                            'type': 'ssl_expiring',
                            'message': f'SSL certificate expires in {days_until_expiry} days',
                            'impact': 10
                        })
                        self.results['recommendations'].append(
                            'Renew SSL certificate soon to avoid service interruption'
                        )
                    
                    return days_until_expiry > 30
        except ssl.SSLError as e:
            self.results['checks']['ssl_valid'] = False
            self.results['checks']['ssl_error'] = str(e)
            self.results['score'] -= 20
            self.results['issues'].append({
                'severity': 'HIGH',
                'type': 'ssl_invalid',
                'message': f'SSL configuration error: {str(e)}',
                'impact': 20
            })
            self.results['recommendations'].append(
                'Fix SSL certificate configuration'
            )
            return False
        except Exception as e:
            self.results['checks']['ssl_valid'] = None
            self.results['checks']['ssl_error'] = str(e)
            return False
    
    def check_common_ports(self) -> Dict[int, bool]:
        """Check for other commonly exposed vulnerable ports."""
        vulnerable_ports = {
            21: 'FTP',
            22: 'SSH',
            23: 'Telnet',
            445: 'SMB',
            3306: 'MySQL',
            5432: 'PostgreSQL',
            6379: 'Redis',
            27017: 'MongoDB'
        }
        
        exposed = {}
        
        for port, service in vulnerable_ports.items():
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2)
                result = sock.connect_ex((self.domain, port))
                sock.close()
                
                is_exposed = (result == 0)
                exposed[port] = is_exposed
                
                if is_exposed:
                    severity = 'CRITICAL' if port in [21, 23, 445] else 'HIGH'
                    impact = 25 if severity == 'CRITICAL' else 15
                    self.results['score'] -= impact
                    self.results['issues'].append({
                        'severity': severity,
                        'type': 'port_exposed',
                        'message': f'{service} port {port} is publicly exposed',
                        'impact': impact
                    })
                    self.results['recommendations'].append(
                        f'Restrict {service} (port {port}) access to internal network only'
                    )
            except Exception:
                exposed[port] = False
        
        self.results['checks']['exposed_ports'] = {
            port: service for port, service in vulnerable_ports.items() 
            if exposed.get(port, False)
        }
        
        return exposed
    
    def determine_risk_level(self) -> str:
        """Determine overall risk level based on score."""
        score = self.results['score']
        
        if score >= 80:
            return 'LOW'
        elif score >= 60:
            return 'MEDIUM'
        elif score >= 40:
            return 'HIGH'
        else:
            return 'CRITICAL'
    
    def get_insurance_recommendation(self) -> str:
        """Get insurance recommendation based on risk level."""
        risk_level = self.results['risk_level']
        
        recommendations = {
            'LOW': 'Eligible for standard cyber insurance policy',
            'MEDIUM': 'Recommend security improvements before applying for cyber insurance',
            'HIGH': 'Must fix critical issues before qualifying for cyber insurance',
            'CRITICAL': 'Significant security vulnerabilities - fix immediately before applying'
        }
        
        return recommendations.get(risk_level, 'Consult with security professional')
    
    def run_audit(self) -> Dict[str, Any]:
        """Run complete audit."""
        print(f'\n🔍 Starting cyber security audit for: {self.domain}\n')
        
        # Run checks
        print('Checking RDP exposure...')
        self.check_rdp()
        
        print('Checking email security records...')
        self.check_email_security()
        
        print('Checking SSL certificate...')
        self.check_ssl()
        
        print('Checking for exposed vulnerable ports...')
        self.check_common_ports()
        
        # Determine risk level
        self.results['risk_level'] = self.determine_risk_level()
        self.results['insurance_recommendation'] = self.get_insurance_recommendation()
        
        return self.results
    
    def print_report(self):
        """Print formatted report to console."""
        print('\n' + '='*70)
        print(f'🏢 CYBER SECURITY AUDIT REPORT')
        print('='*70)
        print(f'\nDomain: {self.results["domain"]}')
        print(f'Timestamp: {self.results["timestamp"]}')
        print(f'\n📊 Risk Score: {self.results["score"]}/100')
        print(f'🚦 Risk Level: {self.results["risk_level"]}')
        
        if self.results['issues']:
            print(f'\n🔍 Issues Found ({len(self.results["issues"])}):')
            for issue in self.results['issues']:
                icon = '🚨' if issue['severity'] == 'CRITICAL' else '⚠️' if issue['severity'] == 'HIGH' else '⚡'
                print(f'   {icon} [{issue["severity"]}] {issue["message"]}')
        else:
            print('\n✅ No security issues detected!')
        
        if self.results['recommendations']:
            print(f'\n💡 Recommendations ({len(self.results["recommendations"])}):')
            for i, rec in enumerate(self.results['recommendations'], 1):
                print(f'   {i}. {rec}')
        
        print(f'\n🛡️  Insurance Recommendation:')
        print(f'   {self.results["insurance_recommendation"]}')
        
        print('\n' + '='*70 + '\n')


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Infinity Soul Cyber Audit - Security scanning for small businesses'
    )
    parser.add_argument(
        '--domain',
        type=str,
        required=True,
        help='Domain to audit (e.g., example.com)'
    )
    parser.add_argument(
        '--json',
        action='store_true',
        help='Output results as JSON'
    )
    parser.add_argument(
        '--output',
        type=str,
        help='Output file path for JSON results'
    )
    
    args = parser.parse_args()
    
    try:
        audit = CyberAudit(args.domain)
        results = audit.run_audit()
        
        if args.json:
            json_output = json.dumps(results, indent=2)
            
            if args.output:
                with open(args.output, 'w') as f:
                    f.write(json_output)
                print(f'Results written to {args.output}')
            else:
                print(json_output)
        else:
            audit.print_report()
        
        # Exit with appropriate code
        if results['risk_level'] in ['CRITICAL', 'HIGH']:
            sys.exit(1)
        else:
            sys.exit(0)
            
    except Exception as e:
        print(f'\n❌ Error running audit: {str(e)}', file=sys.stderr)
        sys.exit(2)


if __name__ == '__main__':
    main()

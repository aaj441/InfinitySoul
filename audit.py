#!/usr/bin/env python3
"""
Cyber Security Audit Tool
Scans domains for common security vulnerabilities:
- RDP port exposure (ransomware risk)
- Email security (SPF/DMARC records)
- SSL certificate validity
"""

import argparse
import socket
import ssl
import dns.resolver
import sys
from datetime import datetime
from typing import Dict, List, Tuple


class CyberAudit:
    def __init__(self, domain: str):
        self.domain = domain.strip().lower()
        # Remove common prefixes
        if self.domain.startswith('http://') or self.domain.startswith('https://'):
            self.domain = self.domain.split('://')[1]
        if self.domain.startswith('www.'):
            self.domain = self.domain[4:]
        
        self.issues = []
        self.risk_score = 100
        
    def check_rdp_port(self) -> Tuple[bool, str]:
        """Check if RDP port 3389 is exposed"""
        try:
            # First, try to resolve the domain
            try:
                socket.getaddrinfo(self.domain, 3389, socket.AF_INET, socket.SOCK_STREAM)
            except socket.gaierror:
                return False, "⚠️ Could not resolve domain for RDP check"
            
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3)
            result = sock.connect_ex((self.domain, 3389))
            sock.close()
            
            if result == 0:
                self.risk_score -= 40
                message = "CRITICAL: RDP exposed (ransomware risk)"
                self.issues.append(message)
                return True, message
            else:
                return False, "✅ RDP port is closed"
        except socket.gaierror:
            return False, "⚠️ Could not resolve domain for RDP check"
        except Exception as e:
            return False, f"⚠️ RDP check failed: {str(e)}"
    
    def check_spf_record(self) -> Tuple[bool, str]:
        """Check for SPF email security record"""
        try:
            answers = dns.resolver.resolve(self.domain, 'TXT')
            for rdata in answers:
                for txt_string in rdata.strings:
                    txt = txt_string.decode('utf-8') if isinstance(txt_string, bytes) else txt_string
                    if txt.startswith('v=spf1'):
                        return True, "✅ SPF record found"
            
            self.risk_score -= 15
            message = "WARNING: No SPF record (phishing risk)"
            self.issues.append(message)
            return False, message
        except dns.resolver.NXDOMAIN:
            self.risk_score -= 15
            message = "WARNING: No SPF record (phishing risk)"
            self.issues.append(message)
            return False, message
        except dns.resolver.NoAnswer:
            self.risk_score -= 15
            message = "WARNING: No SPF record (phishing risk)"
            self.issues.append(message)
            return False, message
        except Exception as e:
            return False, f"⚠️ SPF check failed: {str(e)}"
    
    def check_dmarc_record(self) -> Tuple[bool, str]:
        """Check for DMARC email security record"""
        try:
            dmarc_domain = f'_dmarc.{self.domain}'
            answers = dns.resolver.resolve(dmarc_domain, 'TXT')
            for rdata in answers:
                for txt_string in rdata.strings:
                    txt = txt_string.decode('utf-8') if isinstance(txt_string, bytes) else txt_string
                    if txt.startswith('v=DMARC1'):
                        return True, "✅ DMARC record found"
            
            self.risk_score -= 15
            message = "WARNING: No DMARC record (spoofing risk)"
            self.issues.append(message)
            return False, message
        except dns.resolver.NXDOMAIN:
            self.risk_score -= 15
            message = "WARNING: No DMARC record (spoofing risk)"
            self.issues.append(message)
            return False, message
        except dns.resolver.NoAnswer:
            self.risk_score -= 15
            message = "WARNING: No DMARC record (spoofing risk)"
            self.issues.append(message)
            return False, message
        except Exception as e:
            return False, f"⚠️ DMARC check failed: {str(e)}"
    
    def check_ssl_certificate(self) -> Tuple[bool, str]:
        """Check SSL certificate validity"""
        try:
            # First, try to resolve the domain
            try:
                socket.getaddrinfo(self.domain, 443, socket.AF_INET, socket.SOCK_STREAM)
            except socket.gaierror:
                return False, "⚠️ Could not resolve domain for SSL check"
            
            context = ssl.create_default_context()
            with socket.create_connection((self.domain, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=self.domain) as ssock:
                    cert = ssock.getpeercert()
                    
                    # Check expiration
                    not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                    days_until_expiry = (not_after - datetime.now()).days
                    
                    if days_until_expiry < 0:
                        self.risk_score -= 30
                        message = "CRITICAL: SSL certificate expired (breach risk)"
                        self.issues.append(message)
                        return False, message
                    elif days_until_expiry < 30:
                        self.risk_score -= 20
                        message = "WARNING: SSL certificate expires soon (breach risk)"
                        self.issues.append(message)
                        return False, message
                    else:
                        return True, f"✅ SSL certificate valid (expires in {days_until_expiry} days)"
        except ssl.SSLError as e:
            self.risk_score -= 30
            message = f"CRITICAL: SSL error - {str(e)} (breach risk)"
            self.issues.append(message)
            return False, message
        except socket.gaierror:
            return False, "⚠️ Could not resolve domain for SSL check"
        except Exception as e:
            return False, f"⚠️ SSL check failed: {str(e)}"
    
    def get_risk_level(self) -> Tuple[str, str]:
        """Get risk level and recommendation based on score"""
        if self.risk_score >= 80:
            return "🟢 Low Risk", "✅ Clean scan. You're low risk and eligible for cyber insurance."
        elif self.risk_score >= 60:
            return "🟡 Medium Risk", "⚠️ Some issues found. Recommended to fix before seeking coverage."
        else:
            return "🔴 High Risk", "🚨 High Risk - Must fix issues before coverage"
    
    def run_audit(self) -> Dict:
        """Run all security checks"""
        print(f"\n{'='*60}")
        print(f"🔒 CYBER SECURITY AUDIT")
        print(f"{'='*60}")
        print(f"🏢 Domain: {self.domain}")
        print(f"📅 Scan Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}\n")
        
        print("🔍 Running security checks...\n")
        
        # Run checks
        rdp_exposed, rdp_msg = self.check_rdp_port()
        print(f"  RDP Port 3389: {rdp_msg}")
        
        spf_exists, spf_msg = self.check_spf_record()
        print(f"  SPF Record: {spf_msg}")
        
        dmarc_exists, dmarc_msg = self.check_dmarc_record()
        print(f"  DMARC Record: {dmarc_msg}")
        
        ssl_valid, ssl_msg = self.check_ssl_certificate()
        print(f"  SSL Certificate: {ssl_msg}")
        
        print(f"\n{'='*60}")
        print(f"📊 Risk Score: {self.risk_score}/100")
        print(f"{'='*60}\n")
        
        if self.issues:
            print("🔍 Issues Found:")
            for issue in self.issues:
                if issue.startswith("CRITICAL"):
                    print(f"   🔴 {issue}")
                else:
                    print(f"   ⚠️  {issue}")
            print()
        else:
            print("✅ No issues found!\n")
        
        risk_level, recommendation = self.get_risk_level()
        print(f"{risk_level}")
        print(f"{recommendation}\n")
        print(f"{'='*60}\n")
        
        return {
            'domain': self.domain,
            'risk_score': self.risk_score,
            'issues': self.issues,
            'checks': {
                'rdp_exposed': rdp_exposed,
                'spf_exists': spf_exists,
                'dmarc_exists': dmarc_exists,
                'ssl_valid': ssl_valid
            }
        }


def main():
    parser = argparse.ArgumentParser(
        description='Cyber Security Audit Tool - Scan domains for security vulnerabilities',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python audit.py --domain example.com
  python audit.py --domain yourbusiness.com
  
The tool checks for:
  - RDP port 3389 exposure (ransomware risk)
  - SPF email security records (phishing risk)
  - DMARC email security records (spoofing risk)
  - SSL certificate validity (breach risk)
        '''
    )
    
    parser.add_argument(
        '--domain',
        required=True,
        help='Domain to audit (e.g., example.com)'
    )
    
    args = parser.parse_args()
    
    try:
        audit = CyberAudit(args.domain)
        result = audit.run_audit()
        
        # Exit with appropriate code
        if result['risk_score'] < 60:
            sys.exit(1)  # High risk
        else:
            sys.exit(0)  # Low/medium risk
            
    except KeyboardInterrupt:
        print("\n\n⚠️ Audit cancelled by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Error running audit: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()

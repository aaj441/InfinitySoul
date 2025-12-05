"""
WCAG AI Platform - Python SDK Example

Simple SDK wrapper for the WCAG AI Platform API.
Install: pip install requests
"""

import requests
import time
from typing import Optional, List, Dict

class WCAGAIClient:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def scan(self, url: str, wcag_level: str = "AA") -> Dict:
        """Create a new accessibility scan"""
        response = self.session.post(
            f"{self.base_url}/api/scan",
            json={
                "url": url,
                "wcagLevel": wcag_level
            }
        )
        response.raise_for_status()
        return response.json()
    
    def batch_scan(self, urls: List[str], wcag_level: str = "AA") -> Dict:
        """Submit multiple URLs for batch scanning"""
        response = self.session.post(
            f"{self.base_url}/api/scan/batch",
            json={
                "urls": urls,
                "wcagLevel": wcag_level
            }
        )
        response.raise_for_status()
        return response.json()
    
    def get_scan_results(self, scan_id: str) -> Dict:
        """Retrieve scan results"""
        response = self.session.get(f"{self.base_url}/api/scans/{scan_id}")
        response.raise_for_status()
        return response.json()
    
    def get_batch_status(self, batch_id: str) -> Dict:
        """Get batch processing status"""
        response = self.session.get(f"{self.base_url}/api/scan/batch/{batch_id}")
        response.raise_for_status()
        return response.json()
    
    def poll_scan(self, scan_id: str, max_wait_seconds: int = 300) -> Dict:
        """Poll scan with exponential backoff"""
        delay = 5
        start_time = time.time()
        
        while time.time() - start_time < max_wait_seconds:
            result = self.get_scan_results(scan_id)
            
            if result['status'] in ['completed', 'failed']:
                return result
            
            print(f"Scan {scan_id} status: {result['status']}, waiting {delay}s...")
            time.sleep(delay)
            delay = min(delay * 2, 60)  # Exponential backoff, max 60s
        
        raise TimeoutError(f"Scan {scan_id} did not complete within {max_wait_seconds}s")
    
    def submit_intake(self, name: str, email: str, website: str) -> Dict:
        """Submit audit intake form"""
        response = self.session.post(
            f"{self.base_url}/api/intake",
            json={
                "name": name,
                "email": email,
                "website": website
            }
        )
        response.raise_for_status()
        return response.json()
    
    def get_blog_posts(self, limit: int = 10) -> List[Dict]:
        """Get blog posts"""
        response = self.session.get(
            f"{self.base_url}/api/blog",
            params={"limit": limit}
        )
        response.raise_for_status()
        return response.json()


# Usage example
if __name__ == "__main__":
    client = WCAGAIClient()
    
    # Single scan with polling
    print("Starting scan...")
    scan_resp = client.scan("https://example.com")
    scan_id = scan_resp['scanId']
    
    print(f"Scan created: {scan_id}")
    print("Polling for results...")
    
    result = client.poll_scan(scan_id)
    print(f"✅ Scan complete: {result['complianceScore']}% compliant")
    print(f"Violations: {result.get('violations', {})}")
    
    # Batch scan example
    print("\n\nStarting batch scan...")
    batch_resp = client.batch_scan([
        "https://example.com/page1",
        "https://example.com/page2",
        "https://example.com/page3",
    ])
    batch_id = batch_resp['batchId']
    
    print(f"Batch submitted: {batch_id}")
    print(f"Processing {batch_resp['totalUrls']} URLs...")

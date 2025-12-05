import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';

export interface BadgeRequest {
  scanJobId: string;
  websiteUrl: string;
  complianceScore: number;
  wcagLevel: 'A' | 'AA' | 'AAA';
  expiresAt?: Date;
}

export interface Badge {
  id: string;
  scanJobId: string;
  websiteUrl: string;
  complianceScore: number;
  wcagLevel: string;
  badgeCode: string;
  badgeUrl: string;
  isActive: boolean;
  createdAt: Date;
}

export const badgeService = {
  /**
   * Generate HTML/JavaScript embed code for the accessibility badge
   */
  generateBadgeCode(badgeId: string, complianceScore: number, wcagLevel: string): string {
    const badgeUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api/badge/${badgeId}/badge.svg`;
    
    return `<!-- Accessibility Certified by AI Badge -->
<div style="display: inline-block; margin: 10px 0;">
  <a href="${badgeUrl}" target="_blank" rel="noopener noreferrer" title="WCAG ${wcagLevel} Certified - ${complianceScore}% Compliant">
    <img src="${badgeUrl}" alt="Accessibility Certified - WCAG ${wcagLevel} ${complianceScore}% Compliant" style="border: none; height: 60px;">
  </a>
</div>
<script>
  (function() {
    const badgeId = '${badgeId}';
    const container = document.currentScript.previousElementSibling;
    fetch('${process.env.APP_URL || 'http://localhost:5000'}/api/badge/${badgeId}/verify')
      .then(r => r.json())
      .catch(e => console.log('Badge verification: ', e));
  })();
</script>`;
  },

  /**
   * Generate SVG badge image
   */
  generateBadgeSvg(complianceScore: number, wcagLevel: string): string {
    const color = complianceScore >= 90 ? '#10b981' : complianceScore >= 70 ? '#f59e0b' : '#ef4444';
    const bgColor = complianceScore >= 90 ? '#e6fffa' : complianceScore >= 70 ? '#fffbeb' : '#fef2f2';
    
    return `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .badge-bg { fill: ${bgColor}; }
      .badge-border { stroke: ${color}; stroke-width: 2; fill: none; }
      .badge-text { font-family: system-ui, -apple-system, Arial; font-size: 14px; font-weight: bold; }
      .badge-score { fill: ${color}; }
      .badge-wcag { fill: #666; font-size: 11px; }
    </style>
  </defs>
  
  <rect class="badge-bg" width="200" height="100" rx="8"/>
  <rect class="badge-border" x="2" y="2" width="196" height="96" rx="8"/>
  
  <text x="100" y="35" text-anchor="middle" class="badge-text badge-score">
    ${complianceScore}%
  </text>
  <text x="100" y="55" text-anchor="middle" class="badge-text" style="font-size: 12px;">
    Accessible
  </text>
  <text x="100" y="75" text-anchor="middle" class="badge-wcag">
    WCAG ${wcagLevel}
  </text>
  <text x="100" y="92" text-anchor="middle" class="badge-wcag">
    Certified by AI
  </text>
</svg>`;
  },

  /**
   * Format badge metadata for storage
   */
  formatBadgeMetadata(request: BadgeRequest): {
    badgeCode: string;
    badgeUrl: string;
  } {
    const badgeUrl = `/api/badge/${uuidv4()}/badge.svg`;
    const badgeCode = this.generateBadgeCode(
      request.scanJobId,
      request.complianceScore,
      request.wcagLevel
    );

    return {
      badgeCode,
      badgeUrl,
    };
  },

  /**
   * Verify badge is valid and active
   */
  async verifyBadge(badgeId: string): Promise<boolean> {
    // Implementation would check database for badge existence and active status
    logger.info(`Badge verification request: ${badgeId}`);
    return true;
  },

  /**
   * Generate badge embed HTML
   */
  generateEmbedHtml(badge: Badge): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Accessibility Badge - ${badge.websiteUrl}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; }
    .badge-section { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    code { background: #f3f4f6; padding: 10px; border-radius: 4px; display: block; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Accessibility Certification Badge</h1>
    
    <div class="badge-section">
      <h2>Website: ${badge.websiteUrl}</h2>
      <p><strong>Compliance Score:</strong> ${badge.complianceScore}%</p>
      <p><strong>WCAG Level:</strong> ${badge.wcagLevel}</p>
      <p><strong>Certified:</strong> ${badge.createdAt.toLocaleDateString()}</p>
    </div>
    
    <div class="badge-section">
      <h2>Embed Code</h2>
      <p>Copy this code to display the badge on your website:</p>
      <code>${badge.badgeCode}</code>
    </div>
    
    <div class="badge-section">
      <h2>Badge Preview</h2>
      ${badge.badgeCode}
    </div>
  </div>
</body>
</html>`;
  },
};

import { Copy, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AccessibilityBadgeProps {
  scanJobId: string;
  complianceScore: number;
  wcagLevel: 'A' | 'AA' | 'AAA';
  websiteUrl: string;
  badgeCode?: string;
}

export function AccessibilityBadge({
  scanJobId,
  complianceScore,
  wcagLevel,
  websiteUrl,
  badgeCode,
}: AccessibilityBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const getBadgeColor = () => {
    if (complianceScore >= 90) return '#10b981'; // green
    if (complianceScore >= 70) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const handleCopyCode = () => {
    if (badgeCode) {
      navigator.clipboard.writeText(badgeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="p-6 space-y-4" data-testid="card-badge">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" data-testid="text-badge-title">
          Accessibility Certification Badge
        </h3>
        {complianceScore >= 90 ? (
          <CheckCircle className="w-6 h-6 text-green-600" data-testid="icon-certified" />
        ) : (
          <XCircle className="w-6 h-6 text-gray-400" data-testid="icon-uncertified" />
        )}
      </div>

      {/* Badge Preview */}
      <div className="bg-gray-50 p-6 rounded-lg text-center space-y-2" data-testid="section-badge-preview">
        <div
          style={{
            display: 'inline-block',
            padding: '20px',
            backgroundColor: `${getBadgeColor()}20`,
            border: `2px solid ${getBadgeColor()}`,
            borderRadius: '8px',
            minWidth: '200px',
          }}
          data-testid="div-badge-visual"
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: getBadgeColor(),
            }}
            data-testid="text-score"
          >
            {complianceScore}%
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }} data-testid="text-badge-label">
            Accessible
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }} data-testid="text-wcag-level">
            WCAG {wcagLevel}
          </div>
          <div style={{ fontSize: '10px', color: '#999' }} data-testid="text-certification-text">
            Certified by AI
          </div>
        </div>
      </div>

      {/* Badge Details */}
      <div className="space-y-2 text-sm" data-testid="section-badge-details">
        <div className="flex justify-between">
          <span className="text-gray-600" data-testid="text-score-label">Compliance Score:</span>
          <span className="font-semibold" data-testid="text-score-value">
            {complianceScore}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600" data-testid="text-level-label">WCAG Level:</span>
          <span className="font-semibold" data-testid="text-level-value">{wcagLevel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600" data-testid="text-website-label">Website:</span>
          <span className="font-semibold text-blue-600 truncate" data-testid="text-website-value">
            {websiteUrl}
          </span>
        </div>
      </div>

      {/* Embed Code Section */}
      {badgeCode && (
        <div className="space-y-3 border-t pt-4" data-testid="section-embed-code">
          <div>
            <label className="text-sm font-semibold block mb-2" data-testid="label-embed-code">
              Embed on Your Website
            </label>
            <textarea
              value={badgeCode}
              readOnly
              className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded font-mono text-xs resize-none"
              data-testid="textarea-embed-code"
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCode}
              className="flex items-center gap-2"
              data-testid="button-copy-code"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPreview(!showPreview)}
              data-testid="button-toggle-preview"
            >
              {showPreview ? 'Hide Preview' : 'View Preview'}
            </Button>
          </div>
        </div>
      )}

      {/* Preview */}
      {showPreview && badgeCode && (
        <div
          className="border-t pt-4 space-y-2"
          data-testid="section-preview"
          dangerouslySetInnerHTML={{
            __html: `<div>${badgeCode}</div>`,
          }}
        />
      )}

      {/* Benefits */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-testid="section-benefits">
        <h4 className="font-semibold text-sm mb-2" data-testid="text-benefits-title">
          Why Display the Badge?
        </h4>
        <ul className="text-xs space-y-1 text-gray-700" data-testid="list-benefits">
          <li data-testid="item-benefit-1">✓ Build trust with users about accessibility commitment</li>
          <li data-testid="item-benefit-2">✓ Display compliance certification publicly</li>
          <li data-testid="item-benefit-3">✓ Improve SEO through accessibility signals</li>
          <li data-testid="item-benefit-4">✓ Demonstrate accessibility leadership</li>
        </ul>
      </div>
    </Card>
  );
}

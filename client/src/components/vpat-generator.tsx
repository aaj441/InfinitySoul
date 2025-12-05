import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const vpatFormSchema = z.object({
  productName: z.string().min(3, 'Product name required'),
  productVersion: z.string().optional(),
  vendorName: z.string().min(3, 'Vendor name required'),
  wcagLevel: z.enum(['A', 'AA', 'AAA']),
});

type VpatFormValues = z.infer<typeof vpatFormSchema>;

interface VpatGeneratorProps {
  scanJobId: string;
  complianceScore: number;
  violations: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
}

export function VpatGenerator({
  scanJobId,
  complianceScore,
  violations,
}: VpatGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [vpatUrl, setVpatUrl] = useState<string | null>(null);

  const form = useForm<VpatFormValues>({
    resolver: zodResolver(vpatFormSchema),
    defaultValues: {
      productName: '',
      productVersion: '',
      vendorName: '',
      wcagLevel: 'AA',
    },
  });

  const onSubmit = async (data: VpatFormValues) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/vpat/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanJobId,
          ...data,
          wcagScore: complianceScore,
          violations,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setVpatUrl(result.vpatUrl);
      }
    } catch (error) {
      console.error('VPAT generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 space-y-6" data-testid="card-vpat-generator">
      <div className="flex items-center gap-2" data-testid="header-vpat">
        <FileText className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Generate VPAT Document</h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-testid="section-vpat-info">
        <p className="text-sm text-gray-700" data-testid="text-vpat-description">
          A <strong>Voluntary Product Accessibility Template (VPAT)</strong> is an industry-standard document
          that details your product's accessibility conformance. It's required by federal agencies and many
          large enterprises for procurement.
        </p>
      </div>

      {/* Scan Summary */}
      <div className="grid grid-cols-4 gap-3" data-testid="grid-violation-summary">
        <div className="bg-gray-50 p-3 rounded text-center" data-testid="card-critical">
          <div className="text-2xl font-bold text-red-600" data-testid="text-critical-count">
            {violations.critical}
          </div>
          <div className="text-xs text-gray-600 mt-1" data-testid="text-critical-label">
            Critical
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded text-center" data-testid="card-serious">
          <div className="text-2xl font-bold text-orange-600" data-testid="text-serious-count">
            {violations.serious}
          </div>
          <div className="text-xs text-gray-600 mt-1" data-testid="text-serious-label">
            Serious
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded text-center" data-testid="card-moderate">
          <div className="text-2xl font-bold text-yellow-600" data-testid="text-moderate-count">
            {violations.moderate}
          </div>
          <div className="text-xs text-gray-600 mt-1" data-testid="text-moderate-label">
            Moderate
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded text-center" data-testid="card-compliance">
          <div className="text-2xl font-bold text-green-600" data-testid="text-score">
            {complianceScore}%
          </div>
          <div className="text-xs text-gray-600 mt-1" data-testid="text-score-label">
            Compliant
          </div>
        </div>
      </div>

      {/* Form */}
      {!vpatUrl && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-vpat">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem data-testid="field-product-name">
                    <FormLabel data-testid="label-product-name">Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MyApp Pro" {...field} data-testid="input-product-name" />
                    </FormControl>
                    <FormMessage data-testid="error-product-name" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productVersion"
                render={({ field }) => (
                  <FormItem data-testid="field-product-version">
                    <FormLabel data-testid="label-product-version">Product Version</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2.5.0" {...field} data-testid="input-product-version" />
                    </FormControl>
                    <FormMessage data-testid="error-product-version" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vendorName"
              render={({ field }) => (
                <FormItem data-testid="field-vendor-name">
                  <FormLabel data-testid="label-vendor-name">Vendor Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Acme Corp" {...field} data-testid="input-vendor-name" />
                  </FormControl>
                  <FormMessage data-testid="error-vendor-name" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wcagLevel"
              render={({ field }) => (
                <FormItem data-testid="field-wcag-level">
                  <FormLabel data-testid="label-wcag-level">WCAG Conformance Level *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-wcag-level">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent data-testid="dropdown-wcag-level">
                      <SelectItem value="A" data-testid="option-wcag-a">
                        Level A
                      </SelectItem>
                      <SelectItem value="AA" data-testid="option-wcag-aa">
                        Level AA (Recommended)
                      </SelectItem>
                      <SelectItem value="AAA" data-testid="option-wcag-aaa">
                        Level AAA (Enhanced)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage data-testid="error-wcag-level" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full"
              data-testid="button-generate-vpat"
            >
              {isGenerating ? 'Generating...' : 'Generate VPAT Document'}
            </Button>
          </form>
        </Form>
      )}

      {/* Success State */}
      {vpatUrl && (
        <div className="space-y-4" data-testid="section-vpat-success">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4" data-testid="alert-success">
            <p className="text-green-800 font-semibold" data-testid="text-success-message">
              ✓ VPAT Document Generated Successfully
            </p>
          </div>

          <div className="flex gap-2" data-testid="group-actions">
            <Button
              asChild
              className="flex-1 gap-2"
              data-testid="button-download-html"
            >
              <a href={vpatUrl} download>
                <Download className="w-4 h-4" />
                Download HTML
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={() => setVpatUrl(null)}
              data-testid="button-generate-another"
            >
              Generate Another
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2" data-testid="section-next-steps">
            <p className="font-semibold" data-testid="text-next-steps">Next Steps:</p>
            <ul className="space-y-1 text-gray-700" data-testid="list-next-steps">
              <li data-testid="item-step-1">1. Download and review the VPAT document</li>
              <li data-testid="item-step-2">2. Add organization-specific information as needed</li>
              <li data-testid="item-step-3">3. Get legal/compliance team sign-off</li>
              <li data-testid="item-step-4">4. Share with customers and procurement teams</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

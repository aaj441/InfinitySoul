import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Prospect } from "@shared/schema";

export function CSVImportDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [csvContent, setCsvContent] = useState("");
  const [preview, setPreview] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      setCsvContent(content);

      // Parse preview
      const lines = content.trim().split('\n');
      const headers = lines[0].split(',').map((h: string) => h.trim());
      const previewRows = lines.slice(1, 4).map((line: string) => {
        const fields = line.split(',').map((f: string) => f.trim());
        const row: any = {};
        headers.forEach((header: string, idx: number) => {
          row[header] = fields[idx] || '';
        });
        return row;
      });
      setPreview(previewRows);
      setImportResult(null);
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Failed to read CSV file",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!csvContent) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiRequest("POST", "/api/prospects/import/csv", {
        csvContent,
      });

      setImportResult(result);
      toast({
        title: "Import successful!",
        description: `Imported ${result.imported} out of ${result.total} prospects`,
      });

      // Invalidate prospects query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
      
      // Reset form after successful import
      setTimeout(() => {
        setCsvContent("");
        setPreview([]);
        setImportResult(null);
        setOpen(false);
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import CSV",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-import-csv">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" data-testid="dialog-csv-import">
        <DialogHeader>
          <DialogTitle>Import Prospects from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: company, industry, and optionally website, employees, revenue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            data-testid="area-csv-upload"
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">Click to upload CSV</p>
            <p className="text-sm text-muted-foreground">or drag and drop</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-csv-file"
            />
          </div>

          {/* CSV Format Example */}
          <div className="bg-muted p-3 rounded-md text-sm space-y-1" data-testid="section-csv-format">
            <p className="font-medium">Expected CSV format:</p>
            <code className="text-xs break-words">company,industry,website,employees,revenue</code>
            <code className="text-xs break-words block mt-1">Acme Corp,Finance,acme.com,500,50M</code>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="bg-muted p-3 rounded-md space-y-2" data-testid="section-preview">
              <p className="font-medium text-sm">Preview (first {preview.length} rows)</p>
              <div className="space-y-1 text-xs">
                {preview.map((row, idx) => (
                  <div key={idx} className="text-muted-foreground">
                    {row.company} - {row.industry}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md border border-green-200 dark:border-green-800 space-y-2" data-testid="section-result">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="font-medium text-sm text-green-700 dark:text-green-300">
                  Successfully imported {importResult.imported} prospects
                </p>
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Errors:</p>
                  {importResult.errors.map((error: string, idx: number) => (
                    <div key={idx} className="text-xs text-amber-600 dark:text-amber-300">
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={handleImport} 
              disabled={!csvContent || loading}
              className="flex-1"
              data-testid="button-import-submit"
            >
              {loading ? "Importing..." : "Import"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              data-testid="button-import-cancel"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

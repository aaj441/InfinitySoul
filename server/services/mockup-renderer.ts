/**
 * Mockup Renderer Service
 * Renders generated HTML/CSS mockups to files for before/after comparisons
 * Simplified to work with existing browser backend architecture
 */
import fs from "fs/promises";
import path from "path";

export interface MockupFiles {
  htmlPath: string;
  cssPath: string;
  htmlContent: string;
  cssContent: string;
}

export class MockupRendererService {
  private readonly mockupDir = path.join(process.cwd(), "mockups");

  constructor() {
    this.ensureMockupDirectory();
  }

  private async ensureMockupDirectory() {
    try {
      await fs.mkdir(this.mockupDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create mockup directory:", error);
    }
  }

  /**
   * Save generated HTML/CSS mockup to files
   */
  async saveMockup(
    html: string,
    css: string,
    scanJobId: string
  ): Promise<MockupFiles> {
    const timestamp = Date.now();
    const htmlFileName = `mockup-${scanJobId}-${timestamp}.html`;
    const cssFileName = `mockup-${scanJobId}-${timestamp}.css`;
    
    const htmlPath = path.join(this.mockupDir, htmlFileName);
    const cssPath = path.join(this.mockupDir, cssFileName);

    // Create complete HTML document with CSS link
    const completeHtml = this.createCompleteDocument(html, css, cssFileName);

    // Save files
    await Promise.all([
      fs.writeFile(htmlPath, completeHtml),
      fs.writeFile(cssPath, css)
    ]);

    console.log(`Mockup saved: ${htmlPath}`);

    return {
      htmlPath,
      cssPath,
      htmlContent: completeHtml,
      cssContent: css
    };
  }

  /**
   * Create a complete HTML document with CSS reference
   */
  private createCompleteDocument(html: string, css: string, cssFileName: string): string {
    // If HTML already has <!DOCTYPE>, inject CSS into head
    if (html.toLowerCase().includes("<!doctype")) {
      const headEndIndex = html.toLowerCase().indexOf("</head>");
      if (headEndIndex !== -1) {
        return (
          html.slice(0, headEndIndex) +
          `    <style>${css}</style>\n` +
          html.slice(headEndIndex)
        );
      }
      return html;
    }

    // Otherwise, wrap in complete document
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessible Website Mockup</title>
    <style>${css}</style>
</head>
<body>
${html}
</body>
</html>`;
  }

  /**
   * Get mockup file by path
   */
  async getMockup(htmlPath: string): Promise<string> {
    try {
      return await fs.readFile(htmlPath, "utf-8");
    } catch (error) {
      throw new Error(`Failed to read mockup file: ${error}`);
    }
  }

  /**
   * List all mockups for a scan job
   * Uses strict filename pattern matching to prevent crafted filename collisions
   */
  async listMockups(scanJobId: string): Promise<string[]> {
    try {
      const files = await fs.readdir(this.mockupDir);
      
      // Strict pattern: mockup-{UUID}-{timestamp}.html
      const pattern = new RegExp(`^mockup-${scanJobId.replace(/-/g, '\\-')}-\\d+\\.html$`);
      
      const matchingFiles = files
        .filter(file => pattern.test(file))
        .map(file => {
          // Normalize and validate path
          const fullPath = path.join(this.mockupDir, file);
          const normalized = path.normalize(fullPath);
          
          // Ensure path is within mockup directory (prevent traversal)
          if (!normalized.startsWith(this.mockupDir)) {
            console.warn(`Rejected path outside mockup directory: ${normalized}`);
            return null;
          }
          
          return normalized;
        })
        .filter((p): p is string => p !== null);
      
      return matchingFiles;
    } catch (error) {
      console.error("Failed to list mockups:", error);
      return [];
    }
  }

  /**
   * Clean up old mockups (older than 7 days)
   */
  async cleanupOldMockups(daysOld: number = 7): Promise<number> {
    try {
      const files = await fs.readdir(this.mockupDir);
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.mockupDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtimeMs < cutoffTime) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      console.log(`Cleaned up ${deletedCount} old mockup files`);
      return deletedCount;
    } catch (error) {
      console.error("Failed to cleanup mockups:", error);
      return 0;
    }
  }
}

export const mockupRendererService = new MockupRendererService();

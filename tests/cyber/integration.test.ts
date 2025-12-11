/**
 * Integration tests for the complete cyber scan pipeline
 * Tests the full flow: Scout → Analyst → Scribe → Files → Broker
 */

import { runScout } from "../../backend/cyber/scout";
import { analyzeScoutResult } from "../../backend/cyber/analyst";
import { renderMarkdownReport } from "../../backend/cyber/scribe";
import { writeEvidence, writeReport } from "../../backend/cyber/files";
import { logLead } from "../../backend/cyber/broker";
import { promises as fs } from "fs";
import * as path from "path";

describe("Cyber Scan Pipeline Integration", () => {
  const testDomain = "example.com";
  const evidenceDir = path.join(process.cwd(), "evidence");
  const reportsDir = path.join(process.cwd(), "reports");
  const leadsFile = path.join(process.cwd(), "leads", "leads.jsonl");

  // Clean up test outputs after tests
  afterAll(async () => {
    // Note: In a real test environment, we might want to clean up test files
    // For now, we'll leave them for manual inspection
  });

  test("should complete full scan pipeline without errors", async () => {
    // Step 1: Scout
    const scoutResult = await runScout(testDomain);
    expect(scoutResult).toBeDefined();
    expect(scoutResult.domain).toBe(testDomain);
    expect(scoutResult.scannedAt).toBeInstanceOf(Date);

    // Step 2: Analyst
    const analysis = analyzeScoutResult(scoutResult);
    expect(analysis).toBeDefined();
    expect(analysis.domain).toBe(testDomain);
    expect(analysis.issues).toBeInstanceOf(Array);
    expect(["low", "medium", "high"]).toContain(analysis.overallSeverity);

    // Step 3: Scribe
    const markdown = renderMarkdownReport(analysis);
    expect(markdown).toBeDefined();
    expect(markdown.length).toBeGreaterThan(100);
    expect(markdown).toContain(testDomain);

    // Step 4: Files - Write evidence
    const evidencePath = await writeEvidence(scoutResult);
    expect(evidencePath).toBeDefined();
    expect(evidencePath).toContain(evidenceDir);
    expect(evidencePath).toMatch(/\.json$/);

    // Verify evidence file exists and contains valid JSON with schema
    const evidenceContent = await fs.readFile(evidencePath, "utf-8");
    const evidenceJson = JSON.parse(evidenceContent);
    expect(evidenceJson.schemaVersion).toBe("1.0.0");
    expect(evidenceJson.data).toBeDefined();
    expect(evidenceJson.data.domain).toBe(testDomain);
    expect(evidenceJson.metadata).toBeDefined();
    expect(evidenceJson.metadata.generator).toContain("InfinitySoul");

    // Step 5: Files - Write report
    const reportPath = await writeReport(analysis, markdown);
    expect(reportPath).toBeDefined();
    expect(reportPath).toContain(reportsDir);
    expect(reportPath).toMatch(/\.md$/);

    // Verify report file exists and contains markdown
    const reportContent = await fs.readFile(reportPath, "utf-8");
    expect(reportContent).toBe(markdown);
    expect(reportContent).toContain("# Cyber Risk Scan Report");

    // Step 6: Broker - Log lead
    await logLead(analysis, "Integration test scan");

    // Verify lead was logged
    const leadsContent = await fs.readFile(leadsFile, "utf-8");
    const leadLines = leadsContent.trim().split("\n");
    const lastLead = JSON.parse(leadLines[leadLines.length - 1]);
    expect(lastLead.domain).toBe(testDomain);
    expect(lastLead.issuesCount).toBe(analysis.issues.length);
    expect(lastLead.overallSeverity).toBe(analysis.overallSeverity);
  }, 60000); // 60 second timeout for network operations

  test("should handle multiple concurrent scans", async () => {
    const domains = ["example.com", "example.org"];

    // Run scans in parallel
    const results = await Promise.all(
      domains.map(async (domain) => {
        const scout = await runScout(domain);
        const analysis = analyzeScoutResult(scout);
        const markdown = renderMarkdownReport(analysis);
        const evidencePath = await writeEvidence(scout);
        const reportPath = await writeReport(analysis, markdown);
        await logLead(analysis);

        return { domain, evidencePath, reportPath };
      })
    );

    // Verify all scans completed
    expect(results).toHaveLength(2);
    results.forEach((result) => {
      expect(result.evidencePath).toBeDefined();
      expect(result.reportPath).toBeDefined();
    });

    // Verify files are different (no collision)
    expect(results[0].evidencePath).not.toBe(results[1].evidencePath);
    expect(results[0].reportPath).not.toBe(results[1].reportPath);
  }, 90000); // 90 second timeout for parallel operations

  test("should preserve data through the pipeline", async () => {
    const scout = await runScout(testDomain);
    const originalScanTime = scout.scannedAt;

    const analysis = analyzeScoutResult(scout);

    // Verify timestamp is preserved
    expect(analysis.scannedAt).toEqual(originalScanTime);

    // Verify domain is preserved
    expect(analysis.domain).toBe(scout.domain);

    // Write and read back evidence
    const evidencePath = await writeEvidence(scout);
    const evidenceContent = await fs.readFile(evidencePath, "utf-8");
    const reloadedEvidence = JSON.parse(evidenceContent);

    // Verify schema structure
    expect(reloadedEvidence.schemaVersion).toBe("1.0.0");
    expect(reloadedEvidence.data).toBeDefined();
    expect(reloadedEvidence.metadata).toBeDefined();

    // Verify all key data is preserved in evidence.data
    expect(reloadedEvidence.data.domain).toBe(scout.domain);
    expect(reloadedEvidence.data.httpReachable).toBe(scout.httpReachable);
    expect(reloadedEvidence.data.httpsReachable).toBe(scout.httpsReachable);
  }, 60000);
});

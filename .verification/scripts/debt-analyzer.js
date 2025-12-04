#!/usr/bin/env node
/**
 * Technical Debt Analyzer
 * Scans codebase for technical debt indicators and generates reports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DebtAnalyzer {
  constructor() {
    this.debtItems = [];
    this.metrics = {
      totalFiles: 0,
      linesOfCode: 0,
      debtMarkers: 0,
      complexFunctions: 0,
      duplicateCode: 0,
      securityIssues: 0,
      wcagViolations: 0,
      estimatedHours: 0
    };
  }

  async analyze() {
    console.log('🔍 Starting Technical Debt Analysis...\n');

    await this.scanDebtMarkers();
    await this.analyzeComplexity();
    await this.checkDuplication();
    await this.auditSecurity();
    await this.validateWCAG();
    await this.calculateMetrics();

    return this.generateReport();
  }

  async scanDebtMarkers() {
    console.log('📋 Scanning for debt markers (TODO, FIXME, HACK, XXX)...');
    
    const patterns = ['TODO', 'FIXME', 'HACK', 'XXX', 'DEBT'];
    const excludeDirs = ['node_modules', '.git', 'dist', 'build', 'coverage'];
    
    try {
      const grepCmd = `grep -r -n -E "\\b(${patterns.join('|')})\\b" . \
        --exclude-dir={${excludeDirs.join(',')}} \
        --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
        2>/dev/null || true`;
      
      const output = execSync(grepCmd, { encoding: 'utf-8' });
      const lines = output.trim().split('\n').filter(l => l);
      
      this.metrics.debtMarkers = lines.length;
      
      lines.forEach(line => {
        const [file, lineNum, content] = line.split(':', 3);
        const match = content.match(/\b(TODO|FIXME|HACK|XXX|DEBT)\b:?\s*(.*)/);
        
        if (match) {
          this.debtItems.push({
            type: 'marker',
            severity: this.getMarkerSeverity(match[1]),
            file,
            line: lineNum,
            marker: match[1],
            description: match[2] || 'No description',
            estimatedHours: this.estimateEffort(match[1])
          });
        }
      });
      
      console.log(`  Found ${this.metrics.debtMarkers} debt markers\n`);
    } catch (error) {
      console.warn('  Warning: Could not scan debt markers\n');
    }
  }

  async analyzeComplexity() {
    console.log('🔄 Analyzing code complexity...');
    
    try {
      // Run complexity analysis using a tool like eslint with complexity plugin
      const output = execSync('npm run complexity:check 2>&1 || true', { encoding: 'utf-8' });
      
      // Parse output for high-complexity functions
      const complexityRegex = /Complexity of (\d+) for function '([^']+)'/g;
      let match;
      
      while ((match = complexityRegex.exec(output)) !== null) {
        const complexity = parseInt(match[1]);
        if (complexity > 10) {
          this.metrics.complexFunctions++;
          this.debtItems.push({
            type: 'complexity',
            severity: complexity > 20 ? 'high' : 'medium',
            function: match[2],
            complexity,
            estimatedHours: Math.ceil(complexity / 5)
          });
        }
      }
      
      console.log(`  Found ${this.metrics.complexFunctions} complex functions\n`);
    } catch (error) {
      console.warn('  Warning: Could not analyze complexity\n');
    }
  }

  async checkDuplication() {
    console.log('📑 Checking for code duplication...');
    
    try {
      // You could integrate jscpd or similar
      const output = execSync('npx jscpd . --format json 2>&1 || true', { encoding: 'utf-8' });
      
      try {
        const results = JSON.parse(output);
        this.metrics.duplicateCode = results.statistics?.total?.duplicatedLines || 0;
        
        if (this.metrics.duplicateCode > 0) {
          this.debtItems.push({
            type: 'duplication',
            severity: 'medium',
            lines: this.metrics.duplicateCode,
            estimatedHours: Math.ceil(this.metrics.duplicateCode / 100)
          });
        }
      } catch (parseError) {
        // Could not parse, skip
      }
      
      console.log(`  Found ${this.metrics.duplicateCode} duplicated lines\n`);
    } catch (error) {
      console.warn('  Warning: Could not check duplication\n');
    }
  }

  async auditSecurity() {
    console.log('🔒 Auditing security vulnerabilities...');
    
    try {
      const output = execSync('npm audit --json 2>&1', { encoding: 'utf-8' });
      const audit = JSON.parse(output);
      
      const vulnerabilities = audit.metadata?.vulnerabilities || {};
      const critical = vulnerabilities.critical || 0;
      const high = vulnerabilities.high || 0;
      const moderate = vulnerabilities.moderate || 0;
      
      this.metrics.securityIssues = critical + high + moderate;
      
      if (critical > 0) {
        this.debtItems.push({
          type: 'security',
          severity: 'critical',
          count: critical,
          level: 'critical',
          estimatedHours: critical * 4
        });
      }
      
      if (high > 0) {
        this.debtItems.push({
          type: 'security',
          severity: 'high',
          count: high,
          level: 'high',
          estimatedHours: high * 2
        });
      }
      
      console.log(`  Found ${this.metrics.securityIssues} security issues\n`);
    } catch (error) {
      console.warn('  Warning: Could not audit security\n');
    }
  }

  async validateWCAG() {
    console.log('♿ Validating WCAG compliance...');
    
    try {
      // Integration with your WCAG validation tools
      const output = execSync('npm run wcag:scan 2>&1 || true', { encoding: 'utf-8' });
      
      // Parse WCAG violations from output
      const violationRegex = /WCAG (\d\.\d\.\d) Level ([A-Z]+) violation/g;
      let match;
      let violations = 0;
      
      while ((match = violationRegex.exec(output)) !== null) {
        violations++;
        this.debtItems.push({
          type: 'wcag',
          severity: match[2] === 'A' ? 'high' : 'medium',
          guideline: match[1],
          level: match[2],
          estimatedHours: 1
        });
      }
      
      this.metrics.wcagViolations = violations;
      console.log(`  Found ${violations} WCAG violations\n`);
    } catch (error) {
      console.warn('  Warning: Could not validate WCAG\n');
    }
  }

  async calculateMetrics() {
    console.log('📊 Calculating metrics...');
    
    try {
      // Count total lines of code
      const locOutput = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
        grep -v node_modules | xargs wc -l 2>/dev/null | tail -1', { encoding: 'utf-8' });
      
      this.metrics.linesOfCode = parseInt(locOutput.trim().split(/\s+/)[0]) || 0;
      
      // Count total files
      const filesOutput = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
        grep -v node_modules | wc -l', { encoding: 'utf-8' });
      
      this.metrics.totalFiles = parseInt(filesOutput.trim()) || 0;
      
      // Calculate total estimated hours
      this.metrics.estimatedHours = this.debtItems.reduce((sum, item) => sum + (item.estimatedHours || 0), 0);
      
      console.log('  Metrics calculated\n');
    } catch (error) {
      console.warn('  Warning: Could not calculate metrics\n');
    }
  }

  getMarkerSeverity(marker) {
    const severityMap = {
      'FIXME': 'high',
      'HACK': 'high',
      'XXX': 'high',
      'TODO': 'medium',
      'DEBT': 'medium'
    };
    return severityMap[marker] || 'low';
  }

  estimateEffort(marker) {
    const effortMap = {
      'FIXME': 4,
      'HACK': 6,
      'XXX': 8,
      'TODO': 2,
      'DEBT': 4
    };
    return effortMap[marker] || 2;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDebtItems: this.debtItems.length,
        estimatedHours: this.metrics.estimatedHours,
        debtRatio: ((this.metrics.estimatedHours / (this.metrics.linesOfCode / 1000)) || 0).toFixed(2)
      },
      metrics: this.metrics,
      breakdown: {
        critical: this.debtItems.filter(i => i.severity === 'critical').length,
        high: this.debtItems.filter(i => i.severity === 'high').length,
        medium: this.debtItems.filter(i => i.severity === 'medium').length,
        low: this.debtItems.filter(i => i.severity === 'low').length
      },
      items: this.debtItems,
      recommendations: this.generateRecommendations()
    };

    // Save report
    const reportPath = path.join(process.cwd(), '.verification', 'reports', `debt-report-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n═══════════════════════════════════════════');
    console.log('📊 TECHNICAL DEBT ANALYSIS REPORT');
    console.log('═══════════════════════════════════════════\n');
    console.log(`Total Debt Items: ${report.summary.totalDebtItems}`);
    console.log(`Estimated Hours: ${report.summary.estimatedHours}`);
    console.log(`Debt Ratio: ${report.summary.debtRatio} hours/KLOC`);
    console.log(`\nBreakdown:`);
    console.log(`  Critical: ${report.breakdown.critical}`);
    console.log(`  High: ${report.breakdown.high}`);
    console.log(`  Medium: ${report.breakdown.medium}`);
    console.log(`  Low: ${report.breakdown.low}`);
    console.log(`\n📄 Full report saved to: ${reportPath}\n`);

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.metrics.securityIssues > 0) {
      recommendations.push({
        priority: 'critical',
        action: 'Address security vulnerabilities immediately',
        command: 'npm audit fix'
      });
    }

    if (this.metrics.complexFunctions > 5) {
      recommendations.push({
        priority: 'high',
        action: 'Refactor complex functions to improve maintainability',
        target: 'Reduce cyclomatic complexity below 10'
      });
    }

    if (this.metrics.duplicateCode > 500) {
      recommendations.push({
        priority: 'medium',
        action: 'Extract duplicated code into reusable functions/modules'
      });
    }

    if (this.metrics.wcagViolations > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Fix WCAG violations to ensure accessibility compliance'
      });
    }

    if (this.metrics.debtMarkers > 20) {
      recommendations.push({
        priority: 'medium',
        action: 'Schedule debt sprint to address TODO/FIXME items'
      });
    }

    return recommendations;
  }
}

// Run analyzer if called directly
if (require.main === module) {
  const analyzer = new DebtAnalyzer();
  analyzer.analyze()
    .then(report => {
      process.exit(report.breakdown.critical > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Error during debt analysis:', error.message);
      process.exit(1);
    });
}

module.exports = DebtAnalyzer;
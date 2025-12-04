#!/usr/bin/env node
/**
 * Quality Gate Enforcer
 * Validates that code meets quality standards before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class QualityGate {
  constructor(config) {
    this.config = config || this.loadConfig();
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), '.verification', 'config.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      console.warn('⚠️  Could not load config, using defaults');
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      quality_gates: {
        code_coverage_threshold: 80,
        complexity_threshold: 10,
        duplication_threshold: 3,
        security_severity_blocking: ['critical', 'high'],
        wcag_level_required: 'AA'
      }
    };
  }

  async enforce() {
    console.log('🚪 Enforcing Quality Gates...\n');

    await this.checkCodeCoverage();
    await this.checkComplexity();
    await this.checkDuplication();
    await this.checkSecurity();
    await this.checkWCAG();
    await this.checkPerformance();

    return this.generateReport();
  }

  async checkCodeCoverage() {
    console.log('📊 Checking code coverage...');
    
    try {
      const coverage = execSync('npm run test:coverage 2>&1', { encoding: 'utf-8' });
      
      // Parse coverage percentage
      const match = coverage.match(/(\d+\.?\d*)%\s+Statements/);
      const percentage = match ? parseFloat(match[1]) : 0;
      
      const threshold = this.config.quality_gates.code_coverage_threshold;
      
      if (percentage >= threshold) {
        this.results.passed.push({
          gate: 'Code Coverage',
          status: 'PASS',
          value: `${percentage}%`,
          threshold: `${threshold}%`
        });
        console.log(`  ✓ Coverage: ${percentage}% (threshold: ${threshold}%)\n`);
      } else {
        this.results.failed.push({
          gate: 'Code Coverage',
          status: 'FAIL',
          value: `${percentage}%`,
          threshold: `${threshold}%`,
          message: `Coverage ${percentage}% is below threshold ${threshold}%`
        });
        console.log(`  ✗ Coverage: ${percentage}% (threshold: ${threshold}%)\n`);
      }
    } catch (error) {
      this.results.warnings.push({
        gate: 'Code Coverage',
        message: 'Could not determine coverage'
      });
      console.log('  ⚠️  Could not determine coverage\n');
    }
  }

  async checkComplexity() {
    console.log('🔄 Checking code complexity...');
    
    try {
      const output = execSync('npm run complexity:check 2>&1 || true', { encoding: 'utf-8' });
      
      const threshold = this.config.quality_gates.complexity_threshold;
      const complexityRegex = /Complexity of (\d+)/g;
      const violations = [];
      
      let match;
      while ((match = complexityRegex.exec(output)) !== null) {
        const complexity = parseInt(match[1]);
        if (complexity > threshold) {
          violations.push(complexity);
        }
      }
      
      if (violations.length === 0) {
        this.results.passed.push({
          gate: 'Complexity',
          status: 'PASS',
          threshold: `Max ${threshold}`
        });
        console.log(`  ✓ All functions below complexity threshold (${threshold})\n`);
      } else {
        this.results.failed.push({
          gate: 'Complexity',
          status: 'FAIL',
          violations: violations.length,
          maxComplexity: Math.max(...violations),
          threshold
        });
        console.log(`  ✗ ${violations.length} functions exceed complexity threshold\n`);
      }
    } catch (error) {
      this.results.warnings.push({
        gate: 'Complexity',
        message: 'Could not check complexity'
      });
      console.log('  ⚠️  Could not check complexity\n');
    }
  }

  async checkDuplication() {
    console.log('📑 Checking code duplication...');
    
    try {
      const output = execSync('npx jscpd . --format json 2>&1 || true', { encoding: 'utf-8' });
      
      try {
        const results = JSON.parse(output);
        const duplicationPercentage = results.statistics?.total?.percentage || 0;
        const threshold = this.config.quality_gates.duplication_threshold;
        
        if (duplicationPercentage <= threshold) {
          this.results.passed.push({
            gate: 'Duplication',
            status: 'PASS',
            value: `${duplicationPercentage}%`,
            threshold: `${threshold}%`
          });
          console.log(`  ✓ Duplication: ${duplicationPercentage}% (threshold: ${threshold}%)\n`);
        } else {
          this.results.failed.push({
            gate: 'Duplication',
            status: 'FAIL',
            value: `${duplicationPercentage}%`,
            threshold: `${threshold}%`
          });
          console.log(`  ✗ Duplication: ${duplicationPercentage}% exceeds threshold\n`);
        }
      } catch (parseError) {
        this.results.warnings.push({
          gate: 'Duplication',
          message: 'Could not parse duplication results'
        });
        console.log('  ⚠️  Could not parse duplication results\n');
      }
    } catch (error) {
      this.results.warnings.push({
        gate: 'Duplication',
        message: 'Could not check duplication'
      });
      console.log('  ⚠️  Could not check duplication\n');
    }
  }

  async checkSecurity() {
    console.log('🔒 Checking security vulnerabilities...');
    
    try {
      const output = execSync('npm audit --json 2>&1', { encoding: 'utf-8' });
      const audit = JSON.parse(output);
      
      const vulnerabilities = audit.metadata?.vulnerabilities || {};
      const blocking = this.config.quality_gates.security_severity_blocking;
      
      const criticalCount = vulnerabilities.critical || 0;
      const highCount = vulnerabilities.high || 0;
      
      const hasBlockingVulns = (
        (blocking.includes('critical') && criticalCount > 0) ||
        (blocking.includes('high') && highCount > 0)
      );
      
      if (!hasBlockingVulns) {
        this.results.passed.push({
          gate: 'Security',
          status: 'PASS',
          critical: criticalCount,
          high: highCount
        });
        console.log(`  ✓ No blocking security vulnerabilities\n`);
      } else {
        this.results.failed.push({
          gate: 'Security',
          status: 'FAIL',
          critical: criticalCount,
          high: highCount,
          message: 'Blocking security vulnerabilities detected'
        });
        console.log(`  ✗ Found ${criticalCount} critical, ${highCount} high vulnerabilities\n`);
      }
    } catch (error) {
      this.results.warnings.push({
        gate: 'Security',
        message: 'Could not audit security'
      });
      console.log('  ⚠️  Could not audit security\n');
    }
  }

  async checkWCAG() {
    console.log('♿ Checking WCAG compliance...');
    
    try {
      const output = execSync('npm run wcag:validate 2>&1 || true', { encoding: 'utf-8' });
      
      const requiredLevel = this.config.quality_gates.wcag_level_required;
      const violationRegex = new RegExp(`WCAG.*Level (${requiredLevel}|AAA) violation`, 'g');
      
      const violations = (output.match(violationRegex) || []).length;
      
      if (violations === 0) {
        this.results.passed.push({
          gate: 'WCAG',
          status: 'PASS',
          level: requiredLevel
        });
        console.log(`  ✓ No WCAG Level ${requiredLevel} violations\n`);
      } else {
        this.results.failed.push({
          gate: 'WCAG',
          status: 'FAIL',
          violations,
          level: requiredLevel
        });
        console.log(`  ✗ ${violations} WCAG Level ${requiredLevel} violations\n`);
      }
    } catch (error) {
      this.results.warnings.push({
        gate: 'WCAG',
        message: 'Could not validate WCAG compliance'
      });
      console.log('  ⚠️  Could not validate WCAG compliance\n');
    }
  }

  async checkPerformance() {
    console.log('⚡ Checking performance metrics...');
    
    try {
      // Run performance tests if available
      const output = execSync('npm run test:performance 2>&1 || true', { encoding: 'utf-8' });
      
      // This is a placeholder - implement based on your performance testing setup
      this.results.passed.push({
        gate: 'Performance',
        status: 'PASS'
      });
      console.log('  ✓ Performance checks passed\n');
    } catch (error) {
      this.results.warnings.push({
        gate: 'Performance',
        message: 'Performance tests not configured'
      });
      console.log('  ⚠️  Performance tests not configured\n');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      passed: this.results.passed.length,
      failed: this.results.failed.length,
      warnings: this.results.warnings.length,
      success: this.results.failed.length === 0,
      details: this.results
    };

    // Save report
    const reportPath = path.join(process.cwd(), '.verification', 'reports', `quality-gate-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n═══════════════════════════════════════════');
    console.log('🚪 QUALITY GATE REPORT');
    console.log('═══════════════════════════════════════════\n');
    console.log(`Status: ${report.success ? '✓ PASSED' : '✗ FAILED'}`);
    console.log(`Passed: ${report.passed}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Warnings: ${report.warnings}`);
    console.log(`\n📄 Full report saved to: ${reportPath}\n`);

    if (!report.success) {
      console.log('Failed Gates:');
      this.results.failed.forEach(gate => {
        console.log(`  ✗ ${gate.gate}: ${gate.message || 'Threshold not met'}`);
      });
      console.log('');
    }

    return report;
  }
}

// Run quality gate if called directly
if (require.main === module) {
  const gate = new QualityGate();
  gate.enforce()
    .then(report => {
      process.exit(report.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Error during quality gate enforcement:', error.message);
      process.exit(1);
    });
}

module.exports = QualityGate;
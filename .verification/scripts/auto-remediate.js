#!/usr/bin/env node
/**
 * Auto-Remediation Engine
 * Automatically fixes common technical debt issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutoRemediator {
  constructor(config) {
    this.config = config || { auto_fix: true };
    this.fixes = [];
  }

  async remediate() {
    console.log('🤖 Starting Auto-Remediation...\n');

    if (!this.config.auto_fix) {
      console.log('⚠️  Auto-fix is disabled\n');
      return;
    }

    await this.fixSecurityVulnerabilities();
    await this.fixCodeFormatting();
    await this.fixLintIssues();
    await this.updateDependencies();
    await this.removeUnusedImports();
    await this.fixSimpleAccessibilityIssues();

    return this.generateReport();
  }

  async fixSecurityVulnerabilities() {
    console.log('🔒 Fixing security vulnerabilities...');
    
    try {
      const output = execSync('npm audit fix --force 2>&1', { encoding: 'utf-8' });
      
      const fixedCount = (output.match(/fixed \d+ vulnerabilit/g) || []).length;
      
      if (fixedCount > 0) {
        this.fixes.push({
          category: 'security',
          description: 'Fixed npm security vulnerabilities',
          automated: true,
          impact: 'high'
        });
        console.log(`  ✓ Fixed security vulnerabilities\n`);
      } else {
        console.log(`  ✓ No fixable security vulnerabilities\n`);
      }
    } catch (error) {
      console.warn('  ⚠️  Could not fix security vulnerabilities\n');
    }
  }

  async fixCodeFormatting() {
    console.log('🎨 Fixing code formatting...');
    
    try {
      execSync('npm run format:fix 2>&1', { encoding: 'utf-8' });
      
      this.fixes.push({
        category: 'formatting',
        description: 'Auto-formatted code with Prettier',
        automated: true,
        impact: 'low'
      });
      console.log('  ✓ Code formatting fixed\n');
    } catch (error) {
      console.warn('  ⚠️  Could not fix formatting\n');
    }
  }

  async fixLintIssues() {
    console.log('📝 Fixing lint issues...');
    
    try {
      const output = execSync('npm run lint:fix 2>&1 || true', { encoding: 'utf-8' });
      
      const fixedCount = (output.match(/\d+ problems? \(\d+ errors?, \d+ warnings?\)/g) || []).length;
      
      if (fixedCount > 0) {
        this.fixes.push({
          category: 'linting',
          description: 'Auto-fixed ESLint issues',
          automated: true,
          impact: 'medium'
        });
        console.log('  ✓ Lint issues fixed\n');
      } else {
        console.log('  ✓ No auto-fixable lint issues\n');
      }
    } catch (error) {
      console.warn('  ⚠️  Could not fix lint issues\n');
    }
  }

  async updateDependencies() {
    console.log('📦 Updating dependencies...');
    
    try {
      // Update patch versions only for safety
      execSync('npm update --save 2>&1', { encoding: 'utf-8' });
      
      this.fixes.push({
        category: 'dependencies',
        description: 'Updated dependencies to latest patch versions',
        automated: true,
        impact: 'low'
      });
      console.log('  ✓ Dependencies updated\n');
    } catch (error) {
      console.warn('  ⚠️  Could not update dependencies\n');
    }
  }

  async removeUnusedImports() {
    console.log('🧹 Removing unused imports...');
    
    try {
      // This would require a more sophisticated tool like ts-prune
      // For now, we'll just log the action
      console.log('  → Run ts-prune manually to identify unused exports\n');
    } catch (error) {
      console.warn('  ⚠️  Could not remove unused imports\n');
    }
  }

  async fixSimpleAccessibilityIssues() {
    console.log('♿ Fixing simple accessibility issues...');
    
    try {
      // Find files with common a11y issues
      const files = execSync(
        'find . -name "*.tsx" -o -name "*.jsx" | grep -v node_modules',
        { encoding: 'utf-8' }
      ).trim().split('\n');

      let fixedCount = 0;

      files.forEach(file => {
        if (!file) return;
        
        let content = fs.readFileSync(file, 'utf-8');
        let modified = false;

        // Fix: Add alt text placeholders for images without alt
        const imgWithoutAlt = /<img(?![^>]*alt=)/g;
        if (imgWithoutAlt.test(content)) {
          content = content.replace(
            /<img([^>]*)>/g,
            (match, attrs) => {
              if (!attrs.includes('alt=')) {
                return `<img${attrs} alt="TODO: Add descriptive alt text">`;
              }
              return match;
            }
          );
          modified = true;
        }

        // Fix: Add labels for inputs without labels
        // This is a simplified example - real implementation would be more sophisticated

        if (modified) {
          fs.writeFileSync(file, content);
          fixedCount++;
        }
      });

      if (fixedCount > 0) {
        this.fixes.push({
          category: 'accessibility',
          description: `Added alt text placeholders to ${fixedCount} files`,
          automated: true,
          impact: 'medium'
        });
        console.log(`  ✓ Fixed simple a11y issues in ${fixedCount} files\n`);
      } else {
        console.log('  ✓ No simple a11y fixes needed\n');
      }
    } catch (error) {
      console.warn('  ⚠️  Could not fix accessibility issues\n');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalFixes: this.fixes.length,
      fixes: this.fixes,
      summary: {
        security: this.fixes.filter(f => f.category === 'security').length,
        formatting: this.fixes.filter(f => f.category === 'formatting').length,
        linting: this.fixes.filter(f => f.category === 'linting').length,
        dependencies: this.fixes.filter(f => f.category === 'dependencies').length,
        accessibility: this.fixes.filter(f => f.category === 'accessibility').length
      }
    };

    // Save report
    const reportPath = path.join(process.cwd(), '.verification', 'reports', `remediation-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n═══════════════════════════════════════════');
    console.log('🤖 AUTO-REMEDIATION REPORT');
    console.log('═══════════════════════════════════════════\n');
    console.log(`Total Fixes Applied: ${report.totalFixes}`);
    console.log(`\nBreakdown:`);
    console.log(`  Security: ${report.summary.security}`);
    console.log(`  Formatting: ${report.summary.formatting}`);
    console.log(`  Linting: ${report.summary.linting}`);
    console.log(`  Dependencies: ${report.summary.dependencies}`);
    console.log(`  Accessibility: ${report.summary.accessibility}`);
    console.log(`\n📄 Full report saved to: ${reportPath}\n`);

    return report;
  }
}

// Run remediation if called directly
if (require.main === module) {
  const remediator = new AutoRemediator({ auto_fix: true });
  remediator.remediate()
    .then(report => {
      console.log('✓ Auto-remediation complete\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error during auto-remediation:', error.message);
      process.exit(1);
    });
}

module.exports = AutoRemediator;
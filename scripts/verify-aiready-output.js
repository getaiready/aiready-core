/**
 * CLI Output Verification Script
 * Validates that the generated report matches the UnifiedReportSchema.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use direct path to core dist since scripts don't resolve workspace:* packages automatically
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Script is in /scripts, core is in /packages/core
const corePath = path.resolve(__dirname, '../packages/core/dist/index.js');

// Import schema from built core
const { UnifiedReportSchema } = await import(corePath);

const reportPath = path.resolve(
  process.cwd(),
  process.argv[2] || 'aiready.json'
);

if (!fs.existsSync(reportPath)) {
  console.error(`❌ Verification failed: Report not found at ${reportPath}`);
  process.exit(1);
}

try {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  // Use Zod schema for deep validation (Tightening Contract)
  const result = UnifiedReportSchema.safeParse(report);

  if (!result.success) {
    console.error(
      '❌ Verification failed: Report does not match UnifiedReportSchema'
    );
    result.error.issues.forEach((issue) => {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  // Double check the score specifically as it's critical
  const score = report.scoring?.overall;
  if (score !== undefined && (score < 0 || score > 100)) {
    console.error(`❌ Verification failed: Invalid score value (${score})`);
    process.exit(1);
  }

  console.log('✅ CLI output verification successful (Zod validated)');
} catch (error) {
  console.error(
    `❌ Verification failed: Error parsing report: ${error.message}`
  );
  process.exit(1);
}

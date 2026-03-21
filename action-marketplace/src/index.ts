/**
 * AIReady GitHub Action
 * 
 * Runs AI readiness analysis and blocks PRs that break your AI context budget.
 */

import * as core from '@actions/core';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

export interface AnalysisResult {
  summary: {
    totalIssues: number;
    criticalIssues?: number;
    majorIssues?: number;
    toolsRun: string[];
    executionTime: number;
  };
  scoring?: {
    overall: number;
    rating: string;
    breakdown: Array<{ toolName: string; score: number; rating: string }>;
    costEstimate?: {
      total: string;
      model: string;
    };
  };
}

export interface ActionInputs {
  directory: string;
  include: string;
  exclude: string;
  threshold: number;
  failOn: string;
  tools: string;
  uploadToSaas: boolean;
  apiKey: string;
  repoId?: string;
}

export function getInputs(): ActionInputs {
  return {
    directory: core.getInput('directory') || '.',
    include: core.getInput('include'),
    exclude: core.getInput('exclude'),
    threshold: parseInt(core.getInput('threshold') || '70', 10),
    failOn: core.getInput('fail-on') || 'critical',
    tools: core.getInput('tools') || 'patterns,context,consistency,ai-signal,grounding,testability,doc-drift,deps,change-amp',
    uploadToSaas: core.getInput('upload-to-saas') === 'true',
    apiKey: core.getInput('api-key'),
    repoId: core.getInput('repo-id'),
  };
}

export function buildCliCommand(inputs: ActionInputs, outputFile: string): string {
  let cliCommand = `npx @aiready/cli scan "${inputs.directory}" --tools ${inputs.tools} --output json --output-file "${outputFile}" --score --ci`;
  
  if (inputs.include) cliCommand += ` --include "${inputs.include}"`;
  if (inputs.exclude) cliCommand += ` --exclude "${inputs.exclude}"`;
  
  return cliCommand;
}

export function parseResults(outputFile: string): AnalysisResult | null {
  if (!existsSync(outputFile)) {
    return null;
  }
  return JSON.parse(readFileSync(outputFile, 'utf8'));
}

export function calculatePassFail(
  results: AnalysisResult,
  threshold: number,
  failOn: string
): { passed: boolean; failReason: string } {
  const score = results.scoring?.overall || 0;
  const rating = results.scoring?.rating || 'Unknown';
  const totalIssues = results.summary.totalIssues || 0;
  const criticalCount = results.summary.criticalIssues || 0;
  const majorCount = results.summary.majorIssues || 0;

  let passed = true;
  let failReason = '';

  if (score < threshold) {
    passed = false;
    failReason = `AI Readiness Score ${score} is below threshold ${threshold}`;
  }

  if (failOnLevel(failOn, criticalCount, majorCount, totalIssues)) {
    passed = false;
    failReason = `Found issues exceeding ${failOn} threshold (critical: ${criticalCount}, major: ${majorCount})`;
  }

  return { passed, failReason };
}

export async function uploadToSaas(
  results: AnalysisResult,
  apiKey: string,
  baseUrl: string,
  repoId?: string
): Promise<{ success: boolean; error?: string }> {
  const uploadUrl = `${baseUrl}/api/analysis/upload`;
  
  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repoId,
        data: results
      }),
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      const errText = await response.text();
      return { success: false, error: `${response.status} ${errText}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function setOutputs(
  results: AnalysisResult,
  passed: boolean
): void {
  const score = results.scoring?.overall || 0;
  const totalIssues = results.summary.totalIssues || 0;
  const criticalCount = results.summary.criticalIssues || 0;
  const majorCount = results.summary.majorIssues || 0;

  core.setOutput('score', score);
  core.setOutput('issues', totalIssues);
  core.setOutput('critical', criticalCount);
  core.setOutput('major', majorCount);
  core.setOutput('passed', passed);
}

export function failOnLevel(level: string, critical: number, major: number, total: number): boolean {
  if (level === 'none') return false;
  if (level === 'critical') return critical > 0;
  if (level === 'major') return (critical + major) > 0;
  if (level === 'any') return total > 0;
  return false;
}

export async function run(): Promise<void> {
  try {
    const directory = core.getInput('directory') || '.';
    const include = core.getInput('include');
    const exclude = core.getInput('exclude');
    const threshold = parseInt(core.getInput('threshold') || '70', 10);
    const failOn = core.getInput('fail-on') || 'critical';
    const tools = core.getInput('tools') || 'patterns,context,consistency,ai-signal,grounding,testability,doc-drift,deps,change-amp';
    const uploadToSaas = core.getInput('upload-to-saas') === 'true';
    const apiKey = core.getInput('api-key');

    core.info('🚀 AIReady Check starting...');
    core.info(`   Directory: ${directory}`);
    core.info(`   Threshold: ${threshold}`);
    core.info(`   Fail on: ${failOn}`);

    const tmpDir = join(process.cwd(), '.aiready-action');
    if (!existsSync(tmpDir)) {
      mkdirSync(tmpDir, { recursive: true });
    }
    const outputFile = join(tmpDir, 'aiready-results.json');

    let cliCommand = `npx @aiready/cli scan "${directory}" --tools ${tools} --output json --output-file "${outputFile}" --score --ci`;
    
    if (include) cliCommand += ` --include "${include}"`;
    if (exclude) cliCommand += ` --exclude "${exclude}"`;
    
    core.info(`\n📦 Running: ${cliCommand}\n`);

    try {
      const { stdout } = await execAsync(cliCommand, { maxBuffer: 50 * 1024 * 1024 });
      core.info(stdout);
    } catch (error: any) {
      // In CI mode, the CLI might exit with 1 if issues are found, but we want to parse the JSON
      if (error.stdout) core.info(error.stdout);
      if (error.stderr) core.warning(error.stderr);
    }

    if (!existsSync(outputFile)) {
      core.setFailed('AIReady analysis failed - no output file generated');
      return;
    }

    const results: AnalysisResult = JSON.parse(readFileSync(outputFile, 'utf8'));

    const score = results.scoring?.overall || 0;
    const rating = results.scoring?.rating || 'Unknown';
    const totalIssues = results.summary.totalIssues || 0;
    const criticalCount = results.summary.criticalIssues || 0;
    const majorCount = results.summary.majorIssues || 0;

    core.setOutput('score', score);
    core.setOutput('issues', totalIssues);
    core.setOutput('critical', criticalCount);
    core.setOutput('major', majorCount);

    // Determine if passed
    let passed = true;
    let failReason = '';

    if (score < threshold) {
      passed = false;
      failReason = `AI Readiness Score ${score} is below threshold ${threshold}`;
    }

    if (failOnLevel(failOn, criticalCount, majorCount, totalIssues)) {
      passed = false;
      failReason = `Found issues exceeding ${failOn} threshold (critical: ${criticalCount}, major: ${majorCount})`;
    }

    core.setOutput('passed', passed);

    // Summary
    const summary = core.summary
      .addHeading('AI Readiness Check', 2)
      .addRaw(`**Score:** ${score}/100 (${rating})\n`)
      .addRaw(`**Threshold:** ${threshold}\n`)
      .addRaw(`**Issues:** ${totalIssues} (🔴 ${criticalCount} critical, 🟠 ${majorCount} major)\n`)
      .addRaw(`**Result:** ${passed ? '✅ PASSED' : '❌ FAILED'}\n`);

    if (results.scoring?.costEstimate) {
      summary.addRaw(`**Estimated AI Waste:** $${results.scoring.costEstimate.total}/month (model: ${results.scoring.costEstimate.model})\n`);
    }

    if (results.scoring?.breakdown) {
      summary.addHeading('Tool Breakdown', 3);
      const rows = [['Tool', 'Score', 'Rating']];
      results.scoring.breakdown.forEach(t => {
        rows.push([t.toolName, t.score.toString(), t.rating]);
      });
      summary.addTable(rows as any);
    }

    await summary.write();

    // SaaS Upload
    if (uploadToSaas && apiKey) {
      const isProd = !process.env.AIREADY_SERVER || process.env.AIREADY_SERVER.includes('getaiready.dev');
      const baseUrl = process.env.AIREADY_SERVER || 'https://platform.getaiready.dev';
      const uploadUrl = `${baseUrl}/api/analysis/upload`;
      
      core.info(`\n☁️ Uploading results to AIReady SaaS: ${baseUrl}...`);
      try {
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            repoId: core.getInput('repo-id'), // Optional, can be inferred by API
            data: results
          }),
        });
        
        if (response.ok) {
          core.info('✅ Successfully uploaded to AIReady SaaS');
        } else {
          const errText = await response.text();
          core.warning(`SaaS upload failed: ${response.status} ${errText}`);
        }
      } catch (err: any) {
        core.warning(`SaaS upload error: ${err.message}`);
      }
    }

    if (!passed) {
      core.error(`❌ PR BLOCKED: ${failReason}`);
      core.setFailed(failReason);
    } else {
      core.notice(`✅ AI Readiness Check passed with score ${score}/100`);
    }

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('Unknown error occurred');
    }
  }
}

run();

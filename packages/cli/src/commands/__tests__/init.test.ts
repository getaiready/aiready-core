import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync, unlinkSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { initAction } from '../init';

describe('initAction', () => {
  const testDir = join(process.cwd(), 'temp-test-init');
  const configPath = join(testDir, 'aiready.json');

  beforeEach(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
    // Mock process.cwd to use our test directory
    vi.spyOn(process, 'cwd').mockReturnValue(testDir);
    // Mock console.log to avoid noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (existsSync(configPath)) {
      unlinkSync(configPath);
    }
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should generate aiready.json with output field by default', async () => {
    await initAction({});

    expect(existsSync(configPath)).toBe(true);
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    expect(config).toHaveProperty('output');
    expect(config.output.format).toBe('console');
  });

  it('should include scan, tools, scoring, and visualizer sections', async () => {
    await initAction({ full: true });

    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    expect(config).toHaveProperty('scan');
    expect(config).toHaveProperty('tools');
    expect(config).toHaveProperty('scoring');
    expect(config).toHaveProperty('output');
    expect(config).toHaveProperty('visualizer');
    expect(config).toHaveProperty('threshold');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Mock @actions/core before importing the source
vi.mock('@actions/core', async () => {
  const mockGetInput = vi.fn();
  const mockSetOutput = vi.fn();
  const mockSetFailed = vi.fn();
  const mockInfo = vi.fn();
  const mockWarning = vi.fn();
  const mockError = vi.fn();
  const mockNotice = vi.fn();
  
  return {
    default: {
      getInput: mockGetInput,
      setOutput: mockSetOutput,
      setFailed: mockSetFailed,
      info: mockInfo,
      warning: mockWarning,
      error: mockError,
      notice: mockNotice,
      summary: {
        addHeading: vi.fn().mockReturnThis(),
        addRaw: vi.fn().mockReturnThis(),
        addTable: vi.fn().mockReturnThis(),
        write: vi.fn().mockResolvedValue(undefined),
      },
    },
    getInput: mockGetInput,
    setOutput: mockSetOutput,
    setFailed: mockSetFailed,
    info: mockInfo,
    warning: mockWarning,
    error: mockError,
    notice: mockNotice,
  };
});

// Get the mocked functions
import { getInput, setOutput, setFailed, info, warning, error, notice, summary } from '@actions/core';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

// Mock child_process
vi.mock('child_process', () => ({
  exec: vi.fn((cmd: string, opts: any, callback: any) => {
    if (typeof opts === 'function') {
      callback = opts;
    }
    callback(null, { stdout: 'Mock CLI output', stderr: '' });
  }),
}));

// Now import after mocking
vi.mock('../index', async () => {
  const actual = await vi.importActual('../index');
  return {
    ...actual,
  };
});

// Import after setting up mocks
import { 
  failOnLevel, 
  getInputs, 
  buildCliCommand, 
  parseResults, 
  calculatePassFail, 
  uploadToSaas,
  setOutputs,
  AnalysisResult,
  ActionInputs
} from '../index';

describe('failOnLevel', () => {
  describe('none level', () => {
    it('should never fail', () => {
      expect(failOnLevel('none', 5, 10, 20)).toBe(false);
      expect(failOnLevel('none', 0, 0, 0)).toBe(false);
    });
  });

  describe('critical level', () => {
    it('should fail when critical issues exist', () => {
      expect(failOnLevel('critical', 1, 0, 0)).toBe(true);
      expect(failOnLevel('critical', 5, 10, 20)).toBe(true);
    });

    it('should not fail when no critical issues', () => {
      expect(failOnLevel('critical', 0, 10, 20)).toBe(false);
      expect(failOnLevel('critical', 0, 0, 0)).toBe(false);
    });
  });

  describe('major level', () => {
    it('should fail when critical or major issues exist', () => {
      expect(failOnLevel('major', 1, 0, 0)).toBe(true);
      expect(failOnLevel('major', 0, 1, 0)).toBe(true);
      expect(failOnLevel('major', 5, 10, 20)).toBe(true);
    });

    it('should not fail when no critical or major issues', () => {
      expect(failOnLevel('major', 0, 0, 20)).toBe(false);
      expect(failOnLevel('major', 0, 0, 0)).toBe(false);
    });
  });

  describe('any level', () => {
    it('should fail when any issues exist', () => {
      expect(failOnLevel('any', 0, 0, 1)).toBe(true);
      expect(failOnLevel('any', 5, 10, 20)).toBe(true);
    });

    it('should not fail when no issues', () => {
      expect(failOnLevel('any', 0, 0, 0)).toBe(false);
    });
  });

  describe('unknown level', () => {
    it('should return false for unknown levels', () => {
      expect(failOnLevel('unknown', 5, 10, 20)).toBe(false);
      expect(failOnLevel('', 5, 10, 20)).toBe(false);
    });
  });
});

describe('getInputs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default values when no inputs provided', () => {
    vi.mocked(getInput).mockImplementation((name: string) => {
      const defaults: Record<string, string> = {
        directory: '.',
        include: '',
        exclude: '',
        threshold: '70',
        'fail-on': 'critical',
        tools: 'patterns,context,consistency,ai-signal,grounding,testability,doc-drift,deps,change-amp',
        'upload-to-saas': 'false',
        'api-key': '',
      };
      return defaults[name] || '';
    });

    const inputs = getInputs();

    expect(inputs.directory).toBe('.');
    expect(inputs.threshold).toBe(70);
    expect(inputs.failOn).toBe('critical');
    expect(inputs.uploadToSaas).toBe(false);
  });

  it('should parse custom threshold', () => {
    vi.mocked(getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        directory: '',
        threshold: '80',
        'fail-on': 'major',
        tools: 'patterns,context',
        'upload-to-saas': 'true',
        'api-key': 'test-key',
        'repo-id': 'repo-123',
      };
      return inputs[name] || '';
    });

    const inputs = getInputs();

    expect(inputs.threshold).toBe(80);
    expect(inputs.failOn).toBe('major');
    expect(inputs.tools).toBe('patterns,context');
    expect(inputs.uploadToSaas).toBe(true);
    expect(inputs.apiKey).toBe('test-key');
    expect(inputs.repoId).toBe('repo-123');
  });

  it('should handle include and exclude filters', () => {
    vi.mocked(getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        include: 'src/**/*.ts',
        exclude: 'node_modules/**',
      };
      return inputs[name] || '';
    });

    const inputs = getInputs();

    expect(inputs.include).toBe('src/**/*.ts');
    expect(inputs.exclude).toBe('node_modules/**');
  });
});

describe('buildCliCommand', () => {
  it('should build basic CLI command', () => {
    const inputs: ActionInputs = {
      directory: '.',
      include: '',
      exclude: '',
      threshold: 70,
      failOn: 'critical',
      tools: 'patterns,context',
      uploadToSaas: false,
      apiKey: '',
    };
    const outputFile = '/tmp/results.json';

    const command = buildCliCommand(inputs, outputFile);

    expect(command).toContain('npx @aiready/cli scan');
    expect(command).toContain('--tools patterns,context');
    expect(command).toContain('--output json');
    expect(command).toContain(`--output-file "${outputFile}"`);
    expect(command).toContain('--score');
    expect(command).toContain('--ci');
  });

  it('should include include filter when provided', () => {
    const inputs: ActionInputs = {
      directory: '.',
      include: 'src/**/*.ts',
      exclude: '',
      threshold: 70,
      failOn: 'critical',
      tools: 'patterns',
      uploadToSaas: false,
      apiKey: '',
    };
    const outputFile = '/tmp/results.json';

    const command = buildCliCommand(inputs, outputFile);

    expect(command).toContain('--include "src/**/*.ts"');
  });

  it('should include exclude filter when provided', () => {
    const inputs: ActionInputs = {
      directory: '.',
      include: '',
      exclude: 'node_modules/**',
      threshold: 70,
      failOn: 'critical',
      tools: 'patterns',
      uploadToSaas: false,
      apiKey: '',
    };
    const outputFile = '/tmp/results.json';

    const command = buildCliCommand(inputs, outputFile);

    expect(command).toContain('--exclude "node_modules/**"');
  });

  it('should handle custom directory', () => {
    const inputs: ActionInputs = {
      directory: './my-project',
      include: '',
      exclude: '',
      threshold: 70,
      failOn: 'critical',
      tools: 'patterns',
      uploadToSaas: false,
      apiKey: '',
    };
    const outputFile = '/tmp/results.json';

    const command = buildCliCommand(inputs, outputFile);

    expect(command).toContain('scan "./my-project"');
  });
});

describe('parseResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when output file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = parseResults('/nonexistent/file.json');

    expect(result).toBeNull();
    expect(fs.existsSync).toHaveBeenCalledWith('/nonexistent/file.json');
  });

  it('should parse valid JSON file', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const mockResult: AnalysisResult = {
      summary: {
        totalIssues: 5,
        criticalIssues: 2,
        majorIssues: 3,
        toolsRun: ['patterns', 'context'],
        executionTime: 1000,
      },
      scoring: {
        overall: 85,
        rating: 'Good',
        breakdown: [
          { toolName: 'patterns', score: 90, rating: 'Good' },
          { toolName: 'context', score: 80, rating: 'Good' },
        ],
      },
    };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockResult));

    const result = parseResults('/tmp/results.json');

    expect(result).toEqual(mockResult);
    expect(fs.readFileSync).toHaveBeenCalledWith('/tmp/results.json', 'utf8');
  });

  it('should throw on invalid JSON', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('invalid json');

    expect(() => parseResults('/tmp/results.json')).toThrow();
  });
});

describe('calculatePassFail', () => {
  const createMockResults = (overrides: Partial<AnalysisResult> = {}): AnalysisResult => ({
    summary: {
      totalIssues: 0,
      criticalIssues: 0,
      majorIssues: 0,
      toolsRun: [],
      executionTime: 0,
      ...overrides.summary,
    },
    scoring: {
      overall: 100,
      rating: 'Excellent',
      breakdown: [],
      ...overrides.scoring,
    },
    ...overrides,
  });

  it('should pass when score meets threshold and no critical issues', () => {
    const results = createMockResults({
      scoring: { overall: 80, rating: 'Good', breakdown: [] },
      summary: { totalIssues: 5, criticalIssues: 0, majorIssues: 2, toolsRun: [], executionTime: 0 },
    });

    const { passed, failReason } = calculatePassFail(results, 70, 'critical');

    expect(passed).toBe(true);
    expect(failReason).toBe('');
  });

  it('should fail when score is below threshold', () => {
    const results = createMockResults({
      scoring: { overall: 60, rating: 'Fair', breakdown: [] },
    });

    const { passed, failReason } = calculatePassFail(results, 70, 'critical');

    expect(passed).toBe(false);
    expect(failReason).toContain('below threshold');
  });

  it('should fail when critical issues exist with fail-on=critical', () => {
    const results = createMockResults({
      scoring: { overall: 90, rating: 'Excellent', breakdown: [] },
      summary: { totalIssues: 3, criticalIssues: 1, majorIssues: 0, toolsRun: [], executionTime: 0 },
    });

    const { passed, failReason } = calculatePassFail(results, 70, 'critical');

    expect(passed).toBe(false);
    expect(failReason).toContain('critical');
  });

  it('should fail when major issues exist with fail-on=major', () => {
    const results = createMockResults({
      scoring: { overall: 90, rating: 'Excellent', breakdown: [] },
      summary: { totalIssues: 2, criticalIssues: 0, majorIssues: 2, toolsRun: [], executionTime: 0 },
    });

    const { passed, failReason } = calculatePassFail(results, 70, 'major');

    expect(passed).toBe(false);
    expect(failReason).toContain('major');
  });

  it('should fail on any issue with fail-on=any', () => {
    const results = createMockResults({
      scoring: { overall: 90, rating: 'Excellent', breakdown: [] },
      summary: { totalIssues: 1, criticalIssues: 0, majorIssues: 0, toolsRun: [], executionTime: 0 },
    });

    const { passed } = calculatePassFail(results, 70, 'any');

    expect(passed).toBe(false);
  });

  it('should pass with fail-on=none when score meets threshold', () => {
    const results = createMockResults({
      scoring: { overall: 80, rating: 'Good', breakdown: [] },
      summary: { totalIssues: 100, criticalIssues: 50, majorIssues: 50, toolsRun: [], executionTime: 0 },
    });

    const { passed } = calculatePassFail(results, 70, 'none');

    expect(passed).toBe(true);
  });

  it('should fail with fail-on=none when score below threshold', () => {
    const results = createMockResults({
      scoring: { overall: 50, rating: 'Poor', breakdown: [] },
      summary: { totalIssues: 100, criticalIssues: 50, majorIssues: 50, toolsRun: [], executionTime: 0 },
    });

    const { passed, failReason } = calculatePassFail(results, 70, 'none');

    expect(passed).toBe(false);
    expect(failReason).toContain('below threshold');
  });

  it('should handle missing scoring data - score defaults to 0 and fails threshold', () => {
    const results: AnalysisResult = {
      summary: {
        totalIssues: 0,
        criticalIssues: 0,
        majorIssues: 0,
        toolsRun: [],
        executionTime: 0,
      },
    };

    const { passed, failReason } = calculatePassFail(results, 70, 'critical');

    // Score defaults to 0, which is below threshold 70
    expect(passed).toBe(false);
    expect(failReason).toContain('below threshold');
  });

  it('should handle only critical issues failing threshold', () => {
    const results: AnalysisResult = {
      summary: {
        totalIssues: 10,
        criticalIssues: 3,
        majorIssues: 5,
        toolsRun: [],
        executionTime: 0,
      },
      scoring: {
        overall: 80,
        rating: 'Good',
        breakdown: [],
      },
    };

    const { passed } = calculatePassFail(results, 70, 'critical');
    
    // Score meets threshold but critical issues exist
    expect(passed).toBe(false);
  });

  it('should handle results with costEstimate', () => {
    const results: AnalysisResult = {
      summary: {
        totalIssues: 5,
        criticalIssues: 0,
        majorIssues: 2,
        toolsRun: [],
        executionTime: 0,
      },
      scoring: {
        overall: 85,
        rating: 'Good',
        breakdown: [],
        costEstimate: {
          total: '150.00',
          model: 'gpt-4',
        },
      },
    };

    const { passed } = calculatePassFail(results, 70, 'critical');
    
    expect(passed).toBe(true);
    expect(results.scoring?.costEstimate?.total).toBe('150.00');
    expect(results.scoring?.costEstimate?.model).toBe('gpt-4');
  });

  it('should handle results with tool breakdown', () => {
    const results: AnalysisResult = {
      summary: {
        totalIssues: 3,
        criticalIssues: 0,
        majorIssues: 1,
        toolsRun: ['patterns', 'context'],
        executionTime: 500,
      },
      scoring: {
        overall: 90,
        rating: 'Excellent',
        breakdown: [
          { toolName: 'patterns', score: 95, rating: 'Excellent' },
          { toolName: 'context', score: 85, rating: 'Good' },
        ],
      },
    };

    const { passed } = calculatePassFail(results, 70, 'critical');
    
    expect(passed).toBe(true);
    expect(results.scoring?.breakdown).toHaveLength(2);
    expect(results.scoring?.breakdown?.[0].toolName).toBe('patterns');
  });
});

describe('setOutputs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set all output values', () => {
    const results: AnalysisResult = {
      summary: {
        totalIssues: 10,
        criticalIssues: 3,
        majorIssues: 5,
        toolsRun: ['patterns'],
        executionTime: 1000,
      },
      scoring: {
        overall: 85,
        rating: 'Good',
        breakdown: [],
      },
    };

    setOutputs(results, true);

    expect(setOutput).toHaveBeenCalledWith('score', 85);
    expect(setOutput).toHaveBeenCalledWith('issues', 10);
    expect(setOutput).toHaveBeenCalledWith('critical', 3);
    expect(setOutput).toHaveBeenCalledWith('major', 5);
    expect(setOutput).toHaveBeenCalledWith('passed', true);
  });

  it('should handle missing scoring data', () => {
    const results: AnalysisResult = {
      summary: {
        totalIssues: 5,
        toolsRun: [],
        executionTime: 0,
      },
    };

    setOutputs(results, false);

    expect(setOutput).toHaveBeenCalledWith('score', 0);
    expect(setOutput).toHaveBeenCalledWith('issues', 5);
  });
});

describe('uploadToSaas', () => {
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return success when upload succeeds', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
    });

    const results: AnalysisResult = {
      summary: { totalIssues: 5, toolsRun: [], executionTime: 0 },
      scoring: { overall: 80, rating: 'Good', breakdown: [] },
    };

    const result = await uploadToSaas(results, 'test-api-key', 'https://platform.example.com', 'repo-123');

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://platform.example.com/api/analysis/upload',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('should return error when upload fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: vi.fn().mockResolvedValue('Unauthorized'),
    });

    const results: AnalysisResult = {
      summary: { totalIssues: 5, toolsRun: [], executionTime: 0 },
    };

    const result = await uploadToSaas(results, 'bad-key', 'https://platform.example.com');

    expect(result.success).toBe(false);
    expect(result.error).toContain('401');
  });

  it('should return error on fetch exception', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));

    const results: AnalysisResult = {
      summary: { totalIssues: 5, toolsRun: [], executionTime: 0 },
    };

    const result = await uploadToSaas(results, 'test-key', 'https://platform.example.com');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });

  it('should send correct payload structure', async () => {
    fetchMock.mockResolvedValue({ ok: true });

    const results: AnalysisResult = {
      summary: { totalIssues: 5, toolsRun: ['patterns'], executionTime: 100 },
      scoring: { overall: 75, rating: 'Fair', breakdown: [] },
    };

    await uploadToSaas(results, 'test-key', 'https://platform.example.com', 'my-repo');

    const fetchCall = fetchMock.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);

    expect(body.repoId).toBe('my-repo');
    expect(body.data).toEqual(results);
  });
});

describe('Input Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle complete input flow', () => {
    vi.mocked(getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        directory: './src',
        include: '*.ts',
        exclude: '*.test.ts',
        threshold: '85',
        'fail-on': 'major',
        tools: 'patterns,consistency',
        'upload-to-saas': 'true',
        'api-key': 'secret-key',
        'repo-id': 'test-repo',
      };
      return inputs[name] || '';
    });

    const inputs = getInputs();
    const command = buildCliCommand(inputs, '/tmp/output.json');

    expect(inputs.directory).toBe('./src');
    expect(inputs.include).toBe('*.ts');
    expect(inputs.exclude).toBe('*.test.ts');
    expect(inputs.threshold).toBe(85);
    expect(inputs.failOn).toBe('major');
    expect(inputs.tools).toBe('patterns,consistency');
    expect(inputs.uploadToSaas).toBe(true);
    expect(command).toContain('--include "*.ts"');
    expect(command).toContain('--exclude "*.test.ts"');
  });
});
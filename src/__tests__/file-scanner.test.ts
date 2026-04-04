import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fsPromises from 'fs/promises';
import fs from 'fs';
import { glob } from 'glob';
import {
  scanFiles,
  scanEntries,
  isSourceFile,
  getFileExtension,
} from '../utils/file-scanner';

vi.mock('fs/promises');
vi.mock('fs');
vi.mock('glob');

describe('file-scanner', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(glob).mockResolvedValue([] as any);
    vi.mocked(fs.existsSync).mockReturnValue(false);
  });

  describe('scanFiles', () => {
    it('should scan files using default include and exclude', async () => {
      vi.mocked(glob).mockResolvedValue([
        '/root/src/index.ts',
        '/root/src/utils.ts',
      ] as any);
      vi.mocked(fs.existsSync).mockReturnValue(false); // No .aireadyignore

      const files = await scanFiles({ rootDir: '/root' });

      expect(files).toEqual(['/root/src/index.ts', '/root/src/utils.ts']);
      expect(glob).toHaveBeenCalledWith(
        expect.arrayContaining(['**/*.{ts,tsx,js,jsx,py,java,go,rs,cs}']),
        expect.objectContaining({ cwd: '/root' })
      );
    });

    it('should respect .aireadyignore if present', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path) =>
        path.toString().endsWith('.aireadyignore')
      );
      vi.mocked(fsPromises.readFile).mockResolvedValue(
        'ignored.ts\n# Comment\n!negation\n' as any
      );
      vi.mocked(glob).mockImplementation((pattern, options: any) => {
        if (pattern === '**/.gitignore') return Promise.resolve([]);
        return Promise.resolve(['/root/src/index.ts']);
      });

      const files = await scanFiles({ rootDir: '/root' });

      expect(vi.mocked(glob).mock.calls[0][1].ignore).toContain('ignored.ts');
      expect(vi.mocked(glob).mock.calls[0][1].ignore).not.toContain(
        '# Comment'
      );
      expect(vi.mocked(glob).mock.calls[0][1].ignore).not.toContain(
        '!negation'
      );
    });

    it('should handle nested .gitignore files', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(glob).mockImplementation((pattern, options: any) => {
        if (pattern === '**/.gitignore')
          return Promise.resolve(['/root/subdir/.gitignore']);
        return Promise.resolve([
          '/root/src/index.ts',
          '/root/subdir/ignored.ts',
        ]);
      });
      vi.mocked(fsPromises.readFile).mockResolvedValue('ignored.ts\n' as any);

      const files = await scanFiles({ rootDir: '/root' });

      // The 'ignore' package logic will filter the files
      expect(files).toEqual(['/root/src/index.ts']);
    });

    it('should fall back to raw glob if gitignore application fails', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(glob).mockImplementation((pattern) => {
        if (pattern === '**/.gitignore')
          return Promise.resolve(['/root/.gitignore']);
        return Promise.resolve(['/root/src/index.ts']);
      });
      vi.mocked(fsPromises.readFile).mockRejectedValue(
        new Error('Read failed')
      );

      const files = await scanFiles({ rootDir: '/root' });
      expect(files).toEqual(['/root/src/index.ts']);
    });
  });

  describe('scanEntries', () => {
    it('should scan files and directories', async () => {
      vi.mocked(glob).mockImplementation((pattern: any) => {
        if (pattern === '**/')
          return Promise.resolve(['/root/src/', '/root/dist/']);
        if (pattern === '**/.gitignore') return Promise.resolve([]);
        return Promise.resolve(['/root/src/index.ts']);
      });
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = await scanEntries({ rootDir: '/root' });
      expect(result.files).toEqual(['/root/src/index.ts']);
      expect(result.dirs).toContain('/root/src/');
    });

    it('should correctly handle directories when rootDir is empty', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      // glob is already mocked to return [] by default
      const result = await scanEntries({ rootDir: '' });
      expect(result.files).toBeDefined();
      expect(result.dirs).toBeDefined();
    });

    it('should handle nested gitignore files correctly', async () => {
      vi.mocked(glob).mockImplementation((pattern: any) => {
        if (pattern === '**/.gitignore')
          return Promise.resolve([
            '/root/.gitignore',
            '/root/subdir/.gitignore',
          ]);
        if (pattern === '**/')
          return Promise.resolve([
            '/root/subdir/',
            '/root/other/',
            '/root/node_modules/',
          ]);
        return Promise.resolve([
          '/root/root.log',
          '/root/subdir/test.tmp',
          '/root/other/file.ts',
        ]);
      });

      vi.mocked(fsPromises.readFile).mockImplementation(async (path: any) => {
        if (path.toString().endsWith('subdir/.gitignore')) return '*.tmp';
        if (path.toString().endsWith('.gitignore'))
          return '*.log\n/node_modules/';
        return '';
      });

      const result = await scanEntries({
        rootDir: '/root',
      });

      expect(result.dirs).toContain('/root/subdir/');
      expect(result.dirs).toContain('/root/other/');
      expect(result.dirs).not.toContain('/root/node_modules/');
    });
  });

  describe('isSourceFile', () => {
    it('should identify source files correctly', () => {
      expect(isSourceFile('index.ts')).toBe(true);
      expect(isSourceFile('script.py')).toBe(true);
      expect(isSourceFile('main.go')).toBe(true);
      expect(isSourceFile('main.rs')).toBe(true);
      expect(isSourceFile('types.d.ts')).toBe(false);
      expect(isSourceFile('test.wasm')).toBe(false);
      expect(isSourceFile('test.unknown')).toBe(false);
      expect(isSourceFile('readme.md')).toBe(false);
    });
  });

  describe('getFileExtension', () => {
    it('should extract extensions', () => {
      expect(getFileExtension('file.ts')).toBe('ts');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
      expect(getFileExtension('noextension')).toBe('noextension');
    });
  });
});

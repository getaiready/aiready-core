import { describe, it, expect, beforeEach } from 'vitest';
import {
  DIContainer,
  DI_TOKENS,
  defaultImplementations,
  type Logger,
  type ConfigProvider,
  type FileSystem,
} from '../utils/di-container';

describe('DIContainer', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  describe('register and resolve', () => {
    it('should register and resolve a singleton dependency', () => {
      const logger = defaultImplementations.noopLogger();
      container.registerInstance(DI_TOKENS.Logger, logger);

      const resolved = container.resolve<Logger>(DI_TOKENS.Logger);
      expect(resolved).toBe(logger);
    });

    it('should return same instance for singletons', () => {
      let callCount = 0;
      container.register(DI_TOKENS.Logger, () => {
        callCount++;
        return defaultImplementations.noopLogger();
      });

      container.resolve(DI_TOKENS.Logger);
      container.resolve(DI_TOKENS.Logger);

      expect(callCount).toBe(1);
    });

    it('should return new instance for transient dependencies', () => {
      let callCount = 0;
      container.register(
        DI_TOKENS.Logger,
        () => {
          callCount++;
          return defaultImplementations.noopLogger();
        },
        false
      );

      container.resolve(DI_TOKENS.Logger);
      container.resolve(DI_TOKENS.Logger);

      expect(callCount).toBe(2);
    });

    it('should throw error for unregistered token', () => {
      expect(() => container.resolve('unknown')).toThrow(
        'DI: No registration found for token: unknown'
      );
    });
  });

  describe('has', () => {
    it('should return true for registered token', () => {
      container.registerInstance(
        DI_TOKENS.Logger,
        defaultImplementations.noopLogger()
      );
      expect(container.has(DI_TOKENS.Logger)).toBe(true);
    });

    it('should return false for unregistered token', () => {
      expect(container.has(DI_TOKENS.Logger)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all registrations', () => {
      container.registerInstance(
        DI_TOKENS.Logger,
        defaultImplementations.noopLogger()
      );
      container.clear();

      expect(container.has(DI_TOKENS.Logger)).toBe(false);
    });
  });

  describe('createChild', () => {
    it('should inherit parent registrations', () => {
      const parentLogger = defaultImplementations.noopLogger();
      container.registerInstance(DI_TOKENS.Logger, parentLogger);

      const child = container.createChild();
      expect(child.has(DI_TOKENS.Logger)).toBe(true);
      expect(child.resolve(DI_TOKENS.Logger)).toBe(parentLogger);
    });

    it('should allow child to override parent registrations', () => {
      const parentLogger = defaultImplementations.noopLogger();
      const childLogger = defaultImplementations.consoleLogger();

      container.registerInstance(DI_TOKENS.Logger, parentLogger);

      const child = container.createChild();
      child.registerInstance(DI_TOKENS.Logger, childLogger);

      expect(container.resolve(DI_TOKENS.Logger)).toBe(parentLogger);
      expect(child.resolve(DI_TOKENS.Logger)).toBe(childLogger);
    });
  });

  describe('default implementations', () => {
    it('noopLogger should not throw', () => {
      const logger = defaultImplementations.noopLogger();
      expect(() => logger.info('test')).not.toThrow();
      expect(() => logger.error('test')).not.toThrow();
    });

    it('memoryConfig should store and retrieve values', () => {
      const config = defaultImplementations.memoryConfig({ key: 'value' });

      expect(config.get('key')).toBe('value');
      expect(config.has('key')).toBe(true);

      config.set('newKey', 'newValue');
      expect(config.get('newKey')).toBe('newValue');
    });

    it('memoryConfig should return default for missing key', () => {
      const config = defaultImplementations.memoryConfig();
      expect(config.get('missing', 'default')).toBe('default');
    });
  });

  describe('integration example', () => {
    it('should support mock injection for testing', async () => {
      const mockFs: FileSystem = {
        readFile: async () => 'mock content',
        writeFile: async () => {},
        exists: async () => true,
        readdir: async () => ['file1.ts', 'file2.ts'],
      };

      container.registerInstance(DI_TOKENS.FileSystem, mockFs);

      const fs = container.resolve<FileSystem>(DI_TOKENS.FileSystem);
      const content = await fs.readFile('test.ts');
      expect(content).toBe('mock content');
    });
  });
});

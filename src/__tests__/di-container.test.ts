import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DIContainer,
  defaultImplementations,
  globalContainer,
} from '../utils/di-container';

describe('DIContainer', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  it('should register and resolve a singleton', () => {
    let count = 0;
    const factory = () => ({ id: ++count });
    container.register('test', factory, true);

    const instance1 = container.resolve<{ id: number }>('test');
    const instance2 = container.resolve<{ id: number }>('test');

    expect(instance1.id).toBe(1);
    expect(instance2.id).toBe(1);
    expect(instance1).toBe(instance2);
  });

  it('should register and resolve a transient', () => {
    let count = 0;
    const factory = () => ({ id: ++count });
    container.register('test', factory, false);

    const instance1 = container.resolve<{ id: number }>('test');
    const instance2 = container.resolve<{ id: number }>('test');

    expect(instance1.id).toBe(1);
    expect(instance2.id).toBe(2);
    expect(instance1).not.toBe(instance2);
  });

  it('should register and resolve an instance', () => {
    const instance = { name: 'fixed' };
    container.registerInstance('test', instance);

    const resolved = container.resolve('test');
    expect(resolved).toBe(instance);
  });

  it('should throw if token not found', () => {
    expect(() => container.resolve('missing')).toThrow(
      'DI: No registration found'
    );
  });

  it('should check for registration', () => {
    expect(container.has('test')).toBe(false);
    container.register('test', () => ({}));
    expect(container.has('test')).toBe(true);
  });

  it('should clear registrations', () => {
    container.register('test', () => ({}));
    container.clear();
    expect(container.has('test')).toBe(false);
  });

  it('should create child container and inherit including singletons', () => {
    container.register('parent', () => 'from-parent');
    container.registerInstance('singleton', 'instance');
    const child = container.createChild();

    expect(child.resolve('parent')).toBe('from-parent');
    expect(child.resolve('singleton')).toBe('instance');

    child.register('child', () => 'from-child');
    expect(child.resolve('child')).toBe('from-child');
    expect(() => container.resolve('child')).toThrow();
  });

  describe('defaultImplementations', () => {
    it('consoleLogger should log to console', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      const logger = defaultImplementations.consoleLogger();
      logger.info('info', { a: 1 });
      logger.warn('warn', { b: 2 });
      logger.error('error', { c: 3 });
      logger.debug('debug', { d: 4 });

      expect(logSpy).toHaveBeenCalledWith('[INFO] info', { a: 1 });
      expect(warnSpy).toHaveBeenCalledWith('[WARN] warn', { b: 2 });
      expect(errorSpy).toHaveBeenCalledWith('[ERROR] error', { c: 3 });
      expect(debugSpy).toHaveBeenCalledWith('[DEBUG] debug', { d: 4 });

      vi.restoreAllMocks();
    });

    it('consoleLogger should handle missing meta', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = defaultImplementations.consoleLogger();
      logger.info('info');
      expect(logSpy).toHaveBeenCalledWith('[INFO] info', '');
      vi.restoreAllMocks();
    });

    it('noopLogger should do nothing', () => {
      const logger = defaultImplementations.noopLogger();
      expect(() => {
        logger.info('test');
        logger.warn('test');
        logger.error('test');
        logger.debug('test');
      }).not.toThrow();
    });

    it('memoryConfig should store values', () => {
      const config = defaultImplementations.memoryConfig({ existing: 'val' });
      expect(config.get('existing')).toBe('val');
      expect(config.get('missing', 'default')).toBe('default');

      config.set('new', 'newval');
      expect(config.get('new')).toBe('newval');
      expect(config.has('new')).toBe(true);
      expect(config.has('other')).toBe(false);
    });
  });

  it('globalContainer should be an instance of DIContainer', () => {
    expect(globalContainer).toBeDefined();
    expect(globalContainer.register).toBeTypeOf('function');
  });
});

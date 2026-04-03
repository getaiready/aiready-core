/**
 * Lightweight Dependency Injection Container for @aiready/core.
 *
 * Provides a simple, type-safe DI pattern that makes classes mockable
 * and AI-generated code verifiable through interface-based injection.
 *
 * @example
 * ```typescript
 * // Define an interface
 * interface Logger {
 *   info(message: string): void;
 *   error(message: string): void;
 * }
 *
 * // Register an implementation
 * const container = new DIContainer();
 * container.register('Logger', { info: console.log, error: console.error });
 *
 * // Resolve and use
 * const logger = container.resolve<Logger>('Logger');
 * logger.info('Hello from DI!');
 * ```
 */

export type Factory<T> = () => T;
export type Token = string | symbol;

/**
 * Simple Dependency Injection Container.
 * Supports singleton and transient lifetimes.
 */
export class DIContainer {
  private registrations = new Map<
    Token,
    { factory: Factory<unknown>; singleton: boolean }
  >();
  private singletons = new Map<Token, unknown>();

  /**
   * Register a dependency with a factory function.
   *
   * @param token - Unique identifier for the dependency
   * @param factory - Factory function that creates the dependency
   * @param singleton - If true, the same instance is returned on each resolve (default: true)
   */
  register<T>(token: Token, factory: Factory<T>, singleton = true): void {
    this.registrations.set(token, { factory, singleton });
  }

  /**
   * Register an existing instance as a singleton.
   *
   * @param token - Unique identifier for the dependency
   * @param instance - The instance to register
   */
  registerInstance<T>(token: Token, instance: T): void {
    this.registrations.set(token, { factory: () => instance, singleton: true });
    this.singletons.set(token, instance);
  }

  /**
   * Resolve a dependency by its token.
   *
   * @param token - The token to resolve
   * @returns The resolved dependency
   * @throws Error if token is not registered
   */
  resolve<T>(token: Token): T {
    const registration = this.registrations.get(token);
    if (!registration) {
      throw new Error(`DI: No registration found for token: ${String(token)}`);
    }

    if (registration.singleton) {
      if (!this.singletons.has(token)) {
        this.singletons.set(token, registration.factory());
      }
      return this.singletons.get(token) as T;
    }

    return registration.factory() as T;
  }

  /**
   * Check if a token is registered.
   */
  has(token: Token): boolean {
    return this.registrations.has(token);
  }

  /**
   * Clear all registrations and singletons.
   */
  clear(): void {
    this.registrations.clear();
    this.singletons.clear();
  }

  /**
   * Create a child container that inherits registrations from parent.
   * Child can override parent registrations without affecting parent.
   */
  createChild(): DIContainer {
    const child = new DIContainer();
    for (const [token, registration] of this.registrations) {
      child.registrations.set(token, registration);
    }
    for (const [token, instance] of this.singletons) {
      child.singletons.set(token, instance);
    }
    return child;
  }
}

/**
 * Well-known dependency tokens for @aiready/core.
 */
export const DI_TOKENS = {
  /** File system operations (fs/promises compatible) */
  FileSystem: Symbol('FileSystem'),
  /** Logger instance */
  Logger: Symbol('Logger'),
  /** AST parser factory */
  ParserFactory: Symbol('ParserFactory'),
  /** Configuration provider */
  ConfigProvider: Symbol('ConfigProvider'),
  /** Metrics collector */
  MetricsCollector: Symbol('MetricsCollector'),
} as const;

/**
 * Standard interfaces for core dependencies.
 */
export interface FileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  readdir(path: string): Promise<string[]>;
}

export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

export interface ConfigProvider {
  get<T>(key: string, defaultValue?: T): T;
  set(key: string, value: unknown): void;
  has(key: string): boolean;
}

/**
 * Default implementations for testing and production.
 */
export const defaultImplementations = {
  /** Console-based logger (production default) */
  consoleLogger: (): Logger => ({
    info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
    warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ''),
    error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || ''),
    debug: (msg, meta) => console.debug(`[DEBUG] ${msg}`, meta || ''),
  }),

  /** No-op logger (test default) */
  noopLogger: (): Logger => ({
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  }),

  /** In-memory config provider (test default) */
  memoryConfig: (initial?: Record<string, unknown>): ConfigProvider => {
    const store = new Map<string, unknown>(Object.entries(initial || {}));
    return {
      get: <T>(key: string, defaultValue?: T) =>
        (store.get(key) as T) ?? (defaultValue as T),
      set: (key, value) => store.set(key, value),
      has: (key) => store.has(key),
    };
  },
};

/**
 * Global container instance for convenience.
 * Prefer creating scoped containers in tests.
 */
export const globalContainer = new DIContainer();

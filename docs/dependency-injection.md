# Dependency Injection Container

A lightweight, type-safe DI container for `@aiready/core` that makes classes mockable and AI-generated code verifiable.

## Why Dependency Injection?

1. **Testability** — Inject mocks/stubs in tests without monkey-patching
2. **AI Signal Clarity** — Explicit dependencies are easier for AI models to understand
3. **Flexibility** — Swap implementations at runtime (e.g., dev vs prod logger)

## Quick Start

```typescript
import {
  DIContainer,
  DI_TOKENS,
  defaultImplementations,
  type Logger,
} from '@aiready/core';

// Create a container
const container = new DIContainer();

// Register a dependency
container.registerInstance(
  DI_TOKENS.Logger,
  defaultImplementations.consoleLogger()
);

// Resolve and use
const logger = container.resolve<Logger>(DI_TOKENS.Logger);
logger.info('Hello from DI!');
```

## Patterns

### Singleton (default)

```typescript
// Same instance returned every time
container.register(DI_TOKENS.Logger, () =>
  defaultImplementations.consoleLogger()
);
```

### Transient

```typescript
// New instance created each time
container.register(
  DI_TOKENS.Logger,
  () => defaultImplementations.consoleLogger(),
  false
);
```

### Child Containers

```typescript
// Create isolated scope for tests
const testContainer = globalContainer.createChild();
testContainer.registerInstance(
  DI_TOKENS.Logger,
  defaultImplementations.noopLogger()
);

// Parent unaffected
const parentLogger = globalContainer.resolve<Logger>(DI_TOKENS.Logger);
const testLogger = testContainer.resolve<Logger>(DI_TOKENS.Logger);
```

## Built-in Tokens

| Token                        | Purpose                |
| ---------------------------- | ---------------------- |
| `DI_TOKENS.FileSystem`       | File system operations |
| `DI_TOKENS.Logger`           | Logging                |
| `DI_TOKENS.ParserFactory`    | AST parser creation    |
| `DI_TOKENS.ConfigProvider`   | Configuration access   |
| `DI_TOKENS.MetricsCollector` | Metrics collection     |

## Built-in Implementations

```typescript
// Console logger (production)
defaultImplementations.consoleLogger();

// No-op logger (tests)
defaultImplementations.noopLogger();

// In-memory config (tests)
defaultImplementations.memoryConfig({ key: 'value' });
```

## Testing Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  DIContainer,
  DI_TOKENS,
  defaultImplementations,
  type Logger,
} from '@aiready/core';

describe('MyService', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
    container.registerInstance(
      DI_TOKENS.Logger,
      defaultImplementations.noopLogger()
    );
  });

  it('should use injected logger', () => {
    const service = new MyService(container);
    // Test uses noopLogger, no console output
  });
});
```

## Best Practices

1. **Define interfaces** — Always program to interfaces, not implementations
2. **Use tokens** — Use `DI_TOKENS` constants for consistency
3. **Scope containers** — Create child containers for tests
4. **Document dependencies** — List required tokens in class JSDoc

## Migration Guide

**Before (hardcoded):**

```typescript
class MyService {
  private logger = console; // Hardcoded
}
```

**After (injected):**

```typescript
class MyService {
  constructor(private container: DIContainer) {}

  private get logger(): Logger {
    return this.container.resolve<Logger>(DI_TOKENS.Logger);
  }
}
```

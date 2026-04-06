import { describe, it, expect } from 'vitest';
import {
  getErrorMessage,
  toErrorMessage,
  createErrorResponse,
  withErrorHandling,
} from '../utils/error-utils';

describe('error-utils', () => {
  it('getErrorMessage extracts messages for various inputs', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
    expect(getErrorMessage('hello')).toBe('hello');
    expect(getErrorMessage(123)).toBe('123');
    expect(getErrorMessage({})).toBe('[object Object]');
  });

  it('toErrorMessage uses fallback when appropriate', () => {
    expect(toErrorMessage(new Error('boom'))).toBe('boom');
    expect(toErrorMessage('ok')).toBe('ok');
    expect(toErrorMessage('', 'fallback')).toBe('fallback');
    expect(toErrorMessage(null as unknown, 'fallback')).toBe('fallback');
  });

  it('createErrorResponse formats response and includes details when provided', () => {
    const r1 = createErrorResponse('oops', 500, { code: 'X' });
    expect(r1).toEqual({ error: 'oops', status: 500, details: { code: 'X' } });

    const r2 = createErrorResponse('bad', 400);
    expect(r2).toEqual({ error: 'bad', status: 400 });
  });

  it('withErrorHandling returns success/data and catches errors', async () => {
    const ok = await withErrorHandling(async () => 'yay', 'ctx');
    expect(ok).toEqual({ success: true, data: 'yay' });

    const fail = await withErrorHandling(async () => {
      throw new Error('boom');
    }, 'ctx');
    expect(fail).toEqual({ success: false, error: 'ctx: boom' });

    const failString = await withErrorHandling(async () => {
      throw 'simple';
    });
    expect(failString).toEqual({ success: false, error: 'simple' });
  });
});
import { describe, it, expect } from 'vitest';
import { handleCLIError } from '../utils/cli-utils';

describe('Error Utils', () => {
  it('handleCLIError should be defined', () => {
    expect(handleCLIError).toBeDefined();
  });
});

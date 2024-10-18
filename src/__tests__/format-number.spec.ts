import { describe, it, expect } from 'vitest';

import { formatNumber } from '@/utils';

describe('utils.ts#formatNumber', () => {
  it('formats a dummy number', () => {
    expect(formatNumber(123456.789, 2)).toBe('123,456.79');
  });
});

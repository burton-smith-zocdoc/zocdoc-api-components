import { describe, expect, it } from 'vitest';
import { zocdocThemeCss, zocdocUtilitiesCss, zocdocAllCss } from '../zocdoc.js';

describe('zocdoc tokens', () => {
  it('generates CSS custom properties under the zd prefix', () => {
    expect(zocdocThemeCss).toContain('--zd-');
  });

  it('does not leak the default charm prefix', () => {
    expect(zocdocAllCss).not.toContain('--ch-');
    expect(zocdocAllCss).not.toContain('--charm-');
  });

  it('emits a non-empty stylesheet', () => {
    expect(zocdocThemeCss.length).toBeGreaterThan(0);
  });

  it('generates utility CSS', () => {
    expect(zocdocUtilitiesCss.length).toBeGreaterThan(0);
  });

  describe('color tokens', () => {
    it('includes brand color scale', () => {
      expect(zocdocThemeCss).toContain('--zd-color-brand-500');
    });

    it('includes success color scale', () => {
      expect(zocdocThemeCss).toContain('--zd-color-success-500');
    });

    it('includes warning color scale', () => {
      expect(zocdocThemeCss).toContain('--zd-color-warning-500');
    });

    it('includes danger color scale', () => {
      expect(zocdocThemeCss).toContain('--zd-color-danger-500');
    });

    it('includes neutral color scale', () => {
      expect(zocdocThemeCss).toContain('--zd-color-neutral-500');
    });
  });

  describe('spacing tokens', () => {
    it('includes spacing scale', () => {
      expect(zocdocThemeCss).toContain('--zd-spacing-sm');
      expect(zocdocThemeCss).toContain('--zd-spacing-md');
      expect(zocdocThemeCss).toContain('--zd-spacing-lg');
    });
  });
});

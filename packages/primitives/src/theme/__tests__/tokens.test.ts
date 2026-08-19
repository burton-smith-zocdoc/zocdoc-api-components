import { describe, expect, it } from 'vitest';
import { zocdocThemeCss, zocdocUtilitiesCss, zocdocAllCss } from '../zocdoc.js';
import { schweigerThemeCss, schweigerAllCss } from '../schweiger.js';
import { womensCareThemeCss, womensCareAllCss } from '../womensCare.js';
import { priviaThemeCss, priviaAllCss } from '../privia.js';

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

describe('schweiger tokens', () => {
  it('generates CSS under the zd prefix', () => {
    expect(schweigerThemeCss).toContain('--zd-');
  });

  it('does not leak the default charm prefix', () => {
    expect(schweigerAllCss).not.toContain('--ch-');
    expect(schweigerAllCss).not.toContain('--charm-');
  });

  it('includes schweiger brand color', () => {
    expect(schweigerThemeCss).toContain('#56bfed');
  });

  it('includes schweiger accent color', () => {
    expect(schweigerThemeCss).toContain('#233b6c');
  });

  it('uses Roboto font family', () => {
    expect(schweigerThemeCss).toContain('Roboto');
  });
});

describe('womensCare tokens', () => {
  it('generates CSS under the zd prefix', () => {
    expect(womensCareThemeCss).toContain('--zd-');
  });

  it('does not leak the default charm prefix', () => {
    expect(womensCareAllCss).not.toContain('--ch-');
    expect(womensCareAllCss).not.toContain('--charm-');
  });

  it('includes womensCare brand color', () => {
    expect(womensCareThemeCss).toContain('#50288d');
  });

  it('includes womensCare accent color', () => {
    expect(womensCareThemeCss).toContain('#dcc5b5');
  });

  it('uses Cambria font family', () => {
    expect(womensCareThemeCss).toContain('Cambria');
  });
});

describe('privia tokens', () => {
  it('generates CSS under the zd prefix', () => {
    expect(priviaThemeCss).toContain('--zd-');
  });

  it('does not leak the default charm prefix', () => {
    expect(priviaAllCss).not.toContain('--ch-');
    expect(priviaAllCss).not.toContain('--charm-');
  });

  it('includes privia brand color', () => {
    expect(priviaThemeCss).toContain('#18988b');
  });

  it('includes privia accent color', () => {
    expect(priviaThemeCss).toContain('#006bac');
  });
});

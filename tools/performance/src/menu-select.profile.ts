/**
 * Where menu and select mount time goes — style recalc, layout, or script — for the two
 * components whose bulk mounts the TEST-004 benchmarks flag as slowest. Run with
 * `pnpm test:profile`.
 *
 * Stricter than the benchmarks: the trigger is a zd-button, readiness covers every descendant,
 * and open menus are profiled separately from closed ones.
 *
 * Two variants isolate the suspects: select with `setInputPadding` (a forced layout read per
 * mount) stubbed out, and an open menu with its show transition set to `none`.
 */
import { describe, it } from 'vitest';
import { profileMounts, settleDescendants, until, type ProfileCase } from './profile.ts';

const repeat = (count: number, item: (n: number) => string) =>
  Array.from({ length: count }, (_, i) => item(i + 1)).join('');

const MENU =
  '<zd-button slot="trigger">Options</zd-button>' +
  repeat(5, (n) => `<zd-menu-item>Action ${n}</zd-menu-item>`);

const SELECT_OPTIONS = repeat(20, (n) => `<option value="sp_${n}">Specialty ${n}</option>`);

function mountMany(build: () => HTMLElement) {
  return (host: HTMLElement, count: number) => {
    host.append(...Array.from({ length: count }, build));
    return () => host.replaceChildren();
  };
}

/** Every menu-item has had its tabindex assigned, which `initializeItems` does last. */
const menuItemsReady = (host: HTMLElement) =>
  [...host.querySelectorAll('zd-menu-item')].every((item) => item.hasAttribute('tabindex'));

/** The popup has run floating-ui once — it stamps the resolved placement when it does. */
const menusPositioned = (host: HTMLElement) =>
  [...host.querySelectorAll('zd-menu')].every((element) =>
    element.shadowRoot?.querySelector('.popup')?.hasAttribute('data-current-placement')
  );

/** Each select has copied all 20 options into its shadow `<select>`. */
const selectsReady = (host: HTMLElement) =>
  [...host.querySelectorAll('zd-select')].every(
    (select) => select.shadowRoot?.querySelectorAll('select option').length === 20
  );

function menu(label: string, { open = false, transition = true } = {}): ProfileCase {
  return {
    label,
    mount: mountMany(() => {
      const element = document.createElement('zd-menu');
      element.innerHTML = MENU;
      if (open) element.setAttribute('open', '');
      if (!transition) element.style.setProperty('--zd-menu-transition', 'none');
      return element;
    }),
    ready: async (host) => {
      await settleDescendants(host);
      await until(() => menuItemsReady(host), 'menu items');
      if (open) await until(() => menusPositioned(host), 'menu position');
    },
  };
}

const select: ProfileCase = {
  label: 'zd select',
  mount: mountMany(() => {
    const element = document.createElement('zd-select');
    element.setAttribute('label', 'Specialty');
    element.innerHTML = SELECT_OPTIONS;
    return element;
  }),
  ready: async (host) => {
    await settleDescendants(host);
    await until(() => selectsReady(host), 'select options');
  },
};

type WithPadding = { setInputPadding: () => void };

/** Shadows Charm's `setInputPadding` on the zd-select prototype for the case's duration. */
const selectNoPadding: ProfileCase = {
  ...select,
  label: 'zd select (no setInputPadding)',
  mount: (host, count) => {
    const proto = customElements.get('zd-select')!.prototype as WithPadding;
    proto.setInputPadding = () => {};
    const dispose = select.mount(host, count);
    return () => {
      dispose();
      delete (proto as Partial<WithPadding>).setInputPadding;
    };
  },
};

describe('menu/select profile (zd)', () => {
  it('confirms the fixtures render what they claim', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    host.innerHTML = `<zd-menu open style="--zd-menu-transition: none">${MENU}</zd-menu>`;
    await settleDescendants(host);
    await until(() => menusPositioned(host), 'menu position');
    const popup = host.querySelector('zd-menu')!.shadowRoot!.querySelector('.popup')!;
    const dialog = popup.shadowRoot!.querySelector('dialog')!;
    // oxlint-disable-next-line no-console -- diagnostic output
    console.warn(
      `[fixtures] zd menu: ${host.querySelectorAll('zd-menu-item').length} items, ` +
        `no-transition dialog transition = "${getComputedStyle(dialog).transition}"`
    );
    host.remove();
  });

  it('closed menu and select, 1 and 50 instances', () =>
    profileMounts([menu('zd menu (closed)'), select, selectNoPadding]));

  // One at a time: an open menu closes on any outside click, so a real page holds one open.
  it('open menu, 1 instance', () =>
    profileMounts(
      [
        menu('zd menu (open)', { open: true }),
        menu('zd menu (open, no transition)', { open: true, transition: false }),
      ],
      { counts: [1] }
    ));
});

import { NavLink, Outlet } from 'react-router';
import type { SiteMode } from './config.ts';
import toothHat from './art/tooth-hat.svg';

export function Layout({ mode }: { mode: SiteMode }) {
  return (
    <>
      <aside aria-label="Demo notice">
        <p className="demo-ribbon">
          {mode.mode === 'live' ? 'Live sandbox' : 'Demo mode — sample data, no real appointments'}
          {mode.warning ? ` · ${mode.warning}` : null}
        </p>
      </aside>
      <header className="site-header">
        <NavLink to="/" className="brand">
          <img src={toothHat} alt="" width="56" height="56" />
          <span>Hillbilly Dentistry</span>
        </NavLink>
        <nav aria-label="Main">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/meet-the-doc">Meet the Doc</NavLink>
          <NavLink to="/book" className="cta">
            Book Now
          </NavLink>
        </nav>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          Hillbilly Dentistry · Est. whenever Pa found the pliers · Open till the cows come home
        </p>
        <p>
          Booking powered by{' '}
          <a href="https://www.zocdoc.com/?referrerType=demo-site&component=hillbilly-dentistry">
            Zocdoc
          </a>
        </p>
      </footer>
    </>
  );
}

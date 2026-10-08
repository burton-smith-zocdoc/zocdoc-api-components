import { Link } from 'react-router';

const SERVICES = [
  { name: 'Moonshine Damage Repair', blurb: 'What the still took, we give back. Mostly.' },
  { name: 'Full Set of Teeth — Not Just Some', blurb: 'Why settle for the seven you got?' },
  { name: 'Banjo-Assisted Sedation', blurb: 'Dueling banjos until you plumb forget the drill.' },
  { name: 'Gold Tooth Appraisals', blurb: 'Free with any cleaning. Pawn shop not included.' },
];

export function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title">We'll fix what the moonshine took.</h1>
        <p>
          Family dentistry for families, cousins, and folks who are both. This here site is a React
          19 app built with Vite, and booking runs on the Zocdoc <code>ZdBooking</code> React
          wrapper.
        </p>
        <Link to="/book" className="button-link">
          Book a cleanin'
        </Link>
      </section>
      <section aria-labelledby="services-title" className="services">
        <h2 id="services-title">Our Services</h2>
        <ul>
          {SERVICES.map((service) => (
            <li key={service.name} className="service">
              <h3>{service.name}</h3>
              <p>{service.blurb}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

import './globals.css';
import Navbar from '@/components/Navbar';
import Doodles from '@/components/Doodles';

export const metadata = {
  title: 'Matcharap Eto · Vendor Board ♢ BriarBear',
  description:
    'Matcharap Eto — matcha pop-up events around Metro Manila, a drink cost calculator, and a matcha powder sourcing guide. A BriarBear vendor board.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Shantell+Sans:ital,wght@0,400;0,600;0,700;1,500&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Doodles />
        <Navbar />
        <div className="wrap">
          {children}
          <footer className="foot">
            <p className="note">Size &amp; crowd figures marked “est.” are ballpark estimates from venue type &amp; vendor counts — confirm with organizers.</p>
            <p className="note">A <code>forms.app</code> “vendor application” link in some bazaar FB groups is a false match (a US event). Apply only via each organizer&apos;s own IG/FB.</p>
            <p className="sig">Matcharap Eto · a BriarBear brand · cream + forest · hand-drawn · 2026</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MascotMini } from '@/components/Doodles';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/powders', label: 'Powders' },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <MascotMini />
        Matcharap Eto
      </Link>
      <div className="nav-links">
        {LINKS.map((l) => {
          const active = l.href === '/' ? path === '/' : path.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={active ? 'active' : undefined}>
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

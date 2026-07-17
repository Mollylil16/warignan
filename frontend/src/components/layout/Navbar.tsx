import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { countItems, useCartStore } from '../../stores/cartStore';

const Navbar = () => {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const reserveLines = useCartStore((s) => s.reserveLines);
  const orderLines = useCartStore((s) => s.orderLines);
  const totalCount = countItems(reserveLines) + countItems(orderLines);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between px-4 sm:h-16 sm:px-6"
      style={{
        background: '#110F10',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-6">
        <Link
          to="/"
          className="shrink-0"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontWeight: 700,
            letterSpacing: '0.05em',
            fontSize: 'clamp(1.4rem, 5vw, 2rem)',
            color: '#BA4F64',
          }}
        >
          WARIGNAN
        </Link>
        <nav className="hidden min-w-0 items-center gap-6 text-sm font-semibold text-neutral-300 sm:flex">
          <Link to="/fouille" className="transition hover:text-tiktok-pink">
            Fouille
          </Link>
          <Link to="/suivi" className="transition hover:text-tiktok-pink">
            Suivi
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleCart()}
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
          aria-label={`Panier${totalCount > 0 ? `, ${totalCount} article${totalCount > 1 ? 's' : ''}` : ''}`}
        >
          <ShoppingCart className="h-5 w-5" strokeWidth={2} aria-hidden />
          {totalCount > 0 && (
            <span
              key={totalCount}
              className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-tiktok-pink px-1 text-[10px] font-bold text-white animate-scale-bounce motion-reduce:animate-none"
            >
              {totalCount > 99 ? '99+' : totalCount}
            </span>
          )}
        </button>

        {/* Hamburger Menu button on Mobile */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-white/5 hover:text-white sm:hidden"
          aria-label="Menu principal"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" strokeWidth={2} aria-hidden />
          ) : (
            <Menu className="h-6 w-6" strokeWidth={2} aria-hidden />
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-x-0 top-14 z-40 flex flex-col bg-[#110F10] border-b border-white/5 px-6 py-6 shadow-xl transition-all duration-200 ease-in-out sm:hidden"
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <nav className="flex flex-col gap-6 text-lg font-bold tracking-wide uppercase">
            <Link
              to="/fouille"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between border-b border-white/5 pb-4 text-neutral-200 hover:text-tiktok-pink"
            >
              <span>Fouille la caviar</span>
              <span className="text-xs text-neutral-500 font-mono">→</span>
            </Link>
            <Link
              to="/suivi"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between border-b border-white/5 pb-4 text-neutral-200 hover:text-tiktok-pink"
            >
              <span>Suivre un colis</span>
              <span className="text-xs text-neutral-500 font-mono">→</span>
            </Link>
          </nav>
          
          <div className="mt-auto pb-10 text-center">
            <p className="text-xs text-neutral-600">Warignan Shop — Friperie en ligne</p>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
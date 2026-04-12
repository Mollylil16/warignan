import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { countItems, useCartStore } from '../../stores/cartStore';

const Navbar = () => {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const reserveLines = useCartStore((s) => s.reserveLines);
  const orderLines = useCartStore((s) => s.orderLines);
  const totalCount = countItems(reserveLines) + countItems(orderLines);

  return (
    <header
      className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between px-4 sm:h-16 sm:px-6"
      style={{
        background: '#ffff',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-6">
        <Link
          to="/"
          className="shrink-0 text-2xl sm:text-[28px]"
          style={{
            fontFamily: 'cursive',
            fontWeight: 900,
            color: '#BA4F64',
          }}
        >
          WARIGNAN
        </Link>
        <nav className="hidden min-w-0 items-center gap-4 text-sm font-semibold text-neutral-700 sm:flex">
          <Link to="/fouille" className="hover:text-tiktok-pink">
            Fouille
          </Link>
          <Link to="/suivi" className="hover:text-tiktok-pink">
            Suivi
          </Link>
        </nav>
      </div>

      <button
        type="button"
        onClick={() => toggleCart()}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-neutral-800 transition-colors hover:bg-neutral-100"
        aria-label={`Panier${totalCount > 0 ? `, ${totalCount} article${totalCount > 1 ? 's' : ''}` : ''}`}
      >
        <ShoppingCart className="h-5 w-5" strokeWidth={2} aria-hidden />
        {totalCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-tiktok-pink px-1 text-[10px] font-bold text-white">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>
    </header>
  );
};

export default Navbar;
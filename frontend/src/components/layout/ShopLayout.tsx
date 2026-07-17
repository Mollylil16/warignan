import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import Navbar from './Navbar';
import CartDrawer from '../cart/CartDrawer';
import ActivePromotionsBanner from '../promotions/ActivePromotionsBanner';
import WhatsAppButton from './WhatsAppButton';
import Footer from './Footer';

/** Mise en page boutique client : barre du haut + panier + contenu des routes. */
const ShopLayout = () => {
  const [isOffline, setIsOffline] = useState(
    typeof window !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#0D0B0C]">
      <Navbar />
      {isOffline && (
        <div className="sticky top-14 z-50 flex items-center justify-center gap-2 bg-live-red py-2 px-4 text-center text-xs font-extrabold text-white shadow-lg animate-pulse sm:top-16">
          <WifiOff className="h-4 w-4" />
          <span>Connexion Internet perdue. Vérifie ton réseau.</span>
        </div>
      )}
      <ActivePromotionsBanner />
      <CartDrawer />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ShopLayout;

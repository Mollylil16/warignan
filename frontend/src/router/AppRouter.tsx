import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from '../components/layout/ScrollToTop';
import ShopLayout from '../components/layout/ShopLayout';
import HomePage from '../pages/client/HomePage';
import FouillePage from '../pages/client/FouillePage';
import PaiementReservationPage from '../pages/client/PaiementReservationPage';
import PaiementCommandePage from '../pages/client/PaiementCommandePage';
import VendeuseLayout from '../pages/vendeuse/VendeuseLayout';
import VendeuseDashboardPage from '../pages/vendeuse/VendeuseDashboardPage';
import VendeuseReservationsPage from '../pages/vendeuse/VendeuseReservationsPage';
import VendeuseCommandesPage from '../pages/vendeuse/VendeuseCommandesPage';
import VendeuseLivraisonsPage from '../pages/vendeuse/VendeuseLivraisonsPage';
import VendeuseLivreursPage from '../pages/vendeuse/VendeuseLivreursPage';
import VendeuseMediasPage from '../pages/vendeuse/VendeuseMediasPage';
import VendeusePromotionsPage from '../pages/vendeuse/VendeusePromotionsPage';

const CommandePage = () => (
  <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>
    <h1>Page Commander — À venir</h1>
  </div>
);

const ReservationPage = () => (
  <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>
    <h1>Page Réservation — À venir</h1>
  </div>
);

const SuiviPage = () => (
  <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>
    <h1>Page Suivi — À venir</h1>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/vendeuse" element={<VendeuseLayout />}>
          <Route index element={<VendeuseDashboardPage />} />
          <Route path="reservations" element={<VendeuseReservationsPage />} />
          <Route path="commandes" element={<VendeuseCommandesPage />} />
          <Route path="livraisons" element={<VendeuseLivraisonsPage />} />
          <Route path="livreurs" element={<VendeuseLivreursPage />} />
          <Route path="medias" element={<VendeuseMediasPage />} />
          <Route path="promotions" element={<VendeusePromotionsPage />} />
        </Route>

        <Route element={<ShopLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/fouille" element={<FouillePage />} />
          <Route path="/paiement/reservation" element={<PaiementReservationPage />} />
          <Route path="/paiement/commande" element={<PaiementCommandePage />} />
          <Route path="/commander/:productId" element={<CommandePage />} />
          <Route path="/reserver/:productId" element={<ReservationPage />} />
          <Route path="/suivi" element={<SuiviPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

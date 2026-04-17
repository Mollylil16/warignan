import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from '../components/layout/ScrollToTop';
import ShopLayout from '../components/layout/ShopLayout';
import HomePage from '../pages/client/HomePage';
import FouillePage from '../pages/client/FouillePage';
import PaiementReservationPage from '../pages/client/PaiementReservationPage';
import PaiementCommandePage from '../pages/client/PaiementCommandePage';
import PaiementRetourPage from '../pages/client/PaiementRetourPage';
import CommandePage from '../pages/client/CommandePage';
import ReservationPage from '../pages/client/ReservationPage';
import SuiviCommandePage from '../pages/client/SuiviCommandePage';
import VendeuseLayout from '../pages/vendeuse/VendeuseLayout';
import VendeuseDashboardPage from '../pages/vendeuse/VendeuseDashboardPage';
import VendeuseReservationsPage from '../pages/vendeuse/VendeuseReservationsPage';
import VendeuseCommandesPage from '../pages/vendeuse/VendeuseCommandesPage';
import VendeuseLivraisonsPage from '../pages/vendeuse/VendeuseLivraisonsPage';
import VendeuseLivreursPage from '../pages/vendeuse/VendeuseLivreursPage';
import VendeuseMediasPage from '../pages/vendeuse/VendeuseMediasPage';
import VendeusePaiementsPage from '../pages/vendeuse/VendeusePaiementsPage';
import VendeuseProduitsPage from '../pages/vendeuse/VendeuseProduitsPage';
import VendeusePromotionsPage from '../pages/vendeuse/VendeusePromotionsPage';
import AdminLayout from '../pages/admin/AdminLayout';
import StatsPage from '../pages/admin/StatsPage';
import AllOrdersPage from '../pages/admin/AllOrdersPage';
import UsersPage from '../pages/admin/UsersPage';
import LivreurLayout from '../pages/livreur/LivreurLayout';
import MesLivraisonsPage from '../pages/livreur/MesLivraisonsPage';
import StaffLoginGate from '../components/staff/StaffLoginGate';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/vendeuse"
          element={
            <StaffLoginGate title="Espace vendeuse" allowedRoles={['vendeuse', 'admin']}>
              <VendeuseLayout />
            </StaffLoginGate>
          }
        >
          <Route index element={<VendeuseDashboardPage />} />
          <Route path="produits" element={<VendeuseProduitsPage />} />
          <Route path="reservations" element={<VendeuseReservationsPage />} />
          <Route path="commandes" element={<VendeuseCommandesPage />} />
          <Route path="paiements" element={<VendeusePaiementsPage />} />
          <Route path="livraisons" element={<VendeuseLivraisonsPage />} />
          <Route path="livreurs" element={<VendeuseLivreursPage />} />
          <Route path="medias" element={<VendeuseMediasPage />} />
          <Route path="promotions" element={<VendeusePromotionsPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <StaffLoginGate title="Administration" allowedRoles={['admin']}>
              <AdminLayout />
            </StaffLoginGate>
          }
        >
          <Route index element={<StatsPage />} />
          <Route path="commandes" element={<AllOrdersPage />} />
          <Route path="utilisateurs" element={<UsersPage />} />
        </Route>

        <Route
          path="/livreur"
          element={
            <StaffLoginGate title="Espace livreur" allowedRoles={['livreur']}>
              <LivreurLayout />
            </StaffLoginGate>
          }
        >
          <Route index element={<MesLivraisonsPage />} />
        </Route>

        <Route element={<ShopLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/fouille" element={<FouillePage />} />
          <Route path="/paiement/reservation" element={<PaiementReservationPage />} />
          <Route path="/paiement/commande" element={<PaiementCommandePage />} />
          <Route path="/paiement/retour" element={<PaiementRetourPage />} />
          <Route path="/commander/:productId" element={<CommandePage />} />
          <Route path="/reserver/:productId" element={<ReservationPage />} />
          <Route path="/suivi" element={<SuiviCommandePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

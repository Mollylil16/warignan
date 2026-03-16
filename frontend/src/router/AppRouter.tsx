import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import FouillePage from '../pages/client/FouillePage';

// Les autres pages — on les crée plus tard
// Pour l'instant on met des placeholders
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
    // BrowserRouter = active le système de routing basé sur l'URL
    <BrowserRouter>
      {/* La Navbar est en dehors des Routes : elle s'affiche sur TOUTES les pages */}
      <Navbar />

      {/* Routes = le conteneur de toutes les routes */}
      <Routes>
        {/* Route principale : "/" → page d'accueil La Fouille */}
        <Route path="/" element={<FouillePage />} />

        {/* Route commande avec l'ID du produit dans l'URL */}
        {/* :productId = paramètre dynamique (ex: /commander/1, /commander/2) */}
        <Route path="/commander/:productId" element={<CommandePage />} />

        {/* Route réservation */}
        <Route path="/reserver/:productId" element={<ReservationPage />} />

        {/* Route suivi commande */}
        <Route path="/suivi" element={<SuiviPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
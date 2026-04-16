import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CartDrawer from '../cart/CartDrawer';
import ActivePromotionsBanner from '../promotions/ActivePromotionsBanner';

/** Mise en page boutique client : barre du haut + panier + contenu des routes. */
const ShopLayout = () => (
  <>
    <Navbar />
    <ActivePromotionsBanner />
    <CartDrawer />
    <Outlet />
  </>
);

export default ShopLayout;

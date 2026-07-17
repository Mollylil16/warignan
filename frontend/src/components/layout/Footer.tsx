import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Shield } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-[#110F10] text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand/About */}
          <div className="space-y-4">
            <Link
              to="/"
              className="text-2xl font-bold italic tracking-wide text-tiktok-pink font-playfair"
            >
              WARIGNAN
            </Link>
            <p className="text-sm leading-relaxed text-neutral-500">
              La friperie en ligne ivoirienne qui ne dort jamais. Pièces uniques, prix imbattables, et style assuré sans quitter votre canapé.
            </p>
            <div className="flex space-x-3 text-neutral-400">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/5 p-2 transition hover:bg-white/10 hover:text-white"
                aria-label="Instagram"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://wa.me/2250788608689"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/5 p-2 transition hover:bg-white/10 hover:text-white"
                aria-label="WhatsApp"
              >
                <MessageSquare className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Boutique</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/fouille" className="transition hover:text-white">
                  Fouiller la caviar (Catalogue)
                </Link>
              </li>
              <li>
                <Link to="/suivi" className="transition hover:text-white">
                  Suivi de colis / commande
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/2250788608689"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  Aide & Support WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Business Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Livraison & Acomptes</h3>
            <ul className="mt-4 space-y-2 text-xs text-neutral-500 leading-relaxed">
              <li>
                <span className="font-semibold text-neutral-400">Abidjan & Intérieur :</span> Expédition rapide à Koumassi, Cocody, Yopougon, et villes de l'intérieur.
              </li>
              <li>
                <span className="font-semibold text-neutral-400">Réservations :</span> Acompte de 30% obligatoire à valider sous 24h via Wave ou Orange Money (GeniusPay) pour bloquer vos pièces.
              </li>
            </ul>
          </div>

          {/* Admin portal (neatly tucked away) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Accès Staff</h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/vendeuse"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 transition hover:bg-white/10 hover:text-white"
              >
                <Shield className="h-3 w-3" />
                Vendeuse
              </Link>
              <Link
                to="/livreur"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 transition hover:bg-white/10 hover:text-white"
              >
                <Shield className="h-3 w-3" />
                Livreur
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 transition hover:bg-white/10 hover:text-white"
              >
                <Shield className="h-3 w-3" />
                Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/5 pt-6 text-center text-xs text-neutral-600 sm:flex sm:items-center sm:justify-between">
          <p>© {currentYear} Warignan. Tous droits réservés.</p>
          <p className="mt-2 flex items-center justify-center gap-1 sm:mt-0">
            Fait avec <Heart className="h-3.5 w-3.5 fill-tiktok-pink text-tiktok-pink" /> pour les warignan lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

const NotFoundPage = () => (
  <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-6 bg-bg-void px-6 text-center">
    <SearchX className="h-16 w-16 text-neutral-700" strokeWidth={1.25} aria-hidden />
    <div>
      <h1
        className="mb-2 text-4xl font-extrabold text-neutral-200"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        404
      </h1>
      <p className="text-sm text-neutral-500">Cette page n'existe pas ou a été déplacée.</p>
    </div>
    <Link
      to="/"
      className="rounded-lg bg-tiktok-pink px-6 py-3 text-sm font-bold text-white hover:brightness-110"
    >
      Retour à l'accueil
    </Link>
  </main>
);

export default NotFoundPage;

import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Handshake,
  Heart,
  Radio,
  Sparkles,
} from 'lucide-react';

/**
 * Page d'accueil : présentation, arguments, puis accès au catalogue via /fouille.
 */
const HomePage = () => {
  return (
    <div className="relative overflow-hidden bg-bg-void">
      {/* Fond décoratif discret */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(186, 79, 100, 0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(145, 70, 255, 0.12), transparent 50%), radial-gradient(ellipse 50% 40% at 0% 80%, rgba(37, 244, 238, 0.08), transparent 45%)',
        }}
      />

      {/* --- Hero plein écran (sous la navbar) --- */}
      <section className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-4xl flex-col justify-center px-4 pb-16 pt-8 text-center sm:min-h-[calc(100dvh-4rem)] sm:px-6 sm:pb-20 sm:pt-10 md:max-w-5xl md:px-8">
        <div className="mb-5 flex justify-center sm:mb-6">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-live-red/80 bg-live-red/10 px-3 py-1 text-xs font-bold tracking-widest text-live-red"
          >
            <span
              className="h-2 w-2 rounded-full bg-live-red animate-pulse-dot"
              aria-hidden
            />
            LIVE EN COURS
          </div>
        </div>

        <h1
          className="mb-3 text-[clamp(1.5rem,5vw,2.75rem)] font-extrabold uppercase leading-[1.1] tracking-tight text-[#BA4F64] sm:mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Viens fouiller ma caviar&nbsp;!
        </h1>

        <p className="mx-auto mb-2 max-w-lg text-sm leading-relaxed text-neutral-400 sm:text-base md:max-w-xl">
          La friperie qui ne dort jamais : pièces triées, prix qui claquent, et le
          genre qui va avec le genre. Ici, on chine comme à Koumassi — mais en
          ligne, sans te faire marcher sous le soleil.
        </p>
        <p className="mx-auto mb-10 flex max-w-md items-center justify-center gap-1.5 text-sm text-neutral-500 sm:mb-12 sm:text-[0.95rem]">
          <span>Fais ton choix, ma warignan love</span>
          <Heart
            className="h-4 w-4 shrink-0 fill-tiktok-pink text-tiktok-pink"
            strokeWidth={1.5}
            aria-hidden
          />
        </p>

        <div className="flex flex-col items-center gap-3">
          <Link
            to="/fouille"
            className="group relative inline-flex w-full max-w-md items-center justify-center gap-2 overflow-hidden rounded-lg bg-tiktok-pink px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition-transform duration-200 animate-cta-glow hover:scale-[1.03] hover:brightness-110 active:scale-[0.98] sm:max-w-lg sm:py-4 sm:text-base"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              aria-hidden
            />
            <span className="relative">Commencer la fouille</span>
            <ArrowRight
              className="relative h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2.5}
              aria-hidden
            />
          </Link>
          <p className="text-xs text-neutral-600">
            Accès direct au catalogue, filtres et commande
          </p>
        </div>
      </section>

      {/* --- Bloc argumentaire --- */}
      <section
        className="relative border-t border-white/[0.06] bg-black/20 px-4 py-14 sm:px-6 sm:py-16 md:py-20"
        aria-labelledby="home-why"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="home-why"
            className="mb-10 text-center text-lg font-bold uppercase tracking-wide text-white sm:mb-12 sm:text-xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Pourquoi c&apos;est le bon plan
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            <li className="rounded-xl border border-white/[0.07] bg-[#0c0c0c] p-5 text-left sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-tiktok-pink/10 text-tiktok-pink">
                <Sparkles className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="mb-2 font-semibold text-white">Pépites, pas surplus</h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                On te montre ce qui vaut le détour : robes, crops, pièces qui
                sortent du lot — pas un catalogue fourre-tout.
              </p>
            </li>
            <li className="rounded-xl border border-white/[0.07] bg-[#0c0c0c] p-5 text-left sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-live-red/10 text-live-red">
                <Radio className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="mb-2 font-semibold text-white">Live &amp; actu</h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                Quand c&apos;est parti, c&apos;est parti : suivis en direct,
                réservations et commandes pour ne pas rater ta taille.
              </p>
            </li>
            <li className="rounded-xl border border-white/[0.07] bg-[#0c0c0c] p-5 text-left sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-tiktok-cyan/10 text-tiktok-cyan">
                <Handshake className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="mb-2 font-semibold text-white">100 % Warignan</h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                Une équipe qui connaît le terrain, les prix et la qualité — le
                même esprit que sur les lives, sur le site.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* --- Rappel CTA bas de page --- */}
      <section className="relative px-4 py-16 text-center sm:px-6 sm:py-20">
        <p
          className="mx-auto mb-6 max-w-md text-base font-medium text-neutral-300 sm:text-lg"
        >
          Prête à chiner ? La boutique t&apos;attend derrière le bouton.
        </p>
        <Link
          to="/fouille"
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-tiktok-pink bg-transparent px-8 py-3 text-sm font-bold uppercase tracking-wide text-tiktok-pink transition-all duration-200 hover:bg-tiktok-pink hover:text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Entrer dans la fouille
          <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
        </Link>
        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-neutral-600">
          <Link to="/suivi" className="underline-offset-2 hover:text-neutral-500 hover:underline">
            Suivi commande
          </Link>
          <Link to="/vendeuse" className="underline-offset-2 hover:text-neutral-500 hover:underline">
            Espace vendeuse
          </Link>
          <Link to="/admin" className="underline-offset-2 hover:text-neutral-500 hover:underline">
            Admin
          </Link>
          <Link to="/livreur" className="underline-offset-2 hover:text-neutral-500 hover:underline">
            Livreur
          </Link>
        </p>
      </section>
    </div>
  );
};

export default HomePage;

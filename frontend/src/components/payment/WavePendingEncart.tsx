import { getWavePayBaseUrl } from '../../config/paymentLinks';

/**
 * Encart paiement Wave (lien marchand), affiché quand un dossier est encore en attente de paiement.
 */
const WavePendingEncart = () => {
  const url = getWavePayBaseUrl();
  if (!url) return null;

  return (
    <div className="mt-4 rounded-xl border border-[#1dc8cd]/35 bg-[#1dc8cd]/[0.07] p-4 text-left text-sm leading-relaxed text-neutral-200">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <img
          src="/images/wave_logo.avif"
          alt=""
          width={120}
          height={36}
          className="h-9 w-auto object-contain opacity-95"
          decoding="async"
        />
        <p className="font-semibold text-white">Payer avec Wave</p>
      </div>
      <p className="mb-2 text-xs text-neutral-400">
        Veuillez payer <span className="text-neutral-200">Warignan Shop</span> avec Wave en cliquant
        sur le lien ci-dessous. Indique bien ta référence sur le paiement si Wave te le demande.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block break-all font-medium text-[#1dc8cd] underline decoration-[#1dc8cd]/50 underline-offset-2 hover:brightness-110"
      >
        {url}
      </a>
      <p className="mt-3 text-[11px] text-neutral-500">
        Ajoutez cet expéditeur à vos contacts pour rendre le lien cliquable (ex. WhatsApp).
      </p>
    </div>
  );
};

export default WavePendingEncart;

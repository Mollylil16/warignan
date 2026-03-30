

const HeroSection = () => {
    // Fonction pour scroller vers le catalogue quand on clique sur le CTA
    const scrollToFeed = () => {
      // getElementById cherche l'élément avec l'id "feed" dans le DOM
      const feedElement = document.getElementById('feed');
      if (feedElement) {
        // scrollIntoView = scroll automatique vers l'élément
        // behavior: 'smooth' = animation fluide
        feedElement.scrollIntoView({ behavior: 'smooth' });
      }
    };
  
    return (
      <section
        className="mx-auto max-w-3xl px-4 pb-6 pt-6 text-center sm:px-6 sm:pb-8 sm:pt-8 md:max-w-4xl md:px-8"
      >
        {/* ---- BADGE LIVE ---- */}
        <div className="flex justify-center mb-4">
          <div  
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest"
            style={{
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid #FF0000',
              color: '#FF0000',
            }}
          >
            {/* Point rouge animé (pulse) */}
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FF0000',
                // Animation CSS via style inline
                animation: 'pulseRed 1.5s infinite',
              }}
            />
            LIVE EN COURS
          </div>
        </div>
  
        {/* ---- TITRE PRINCIPAL ---- */}
        <h1
          className="mb-2 text-[22px] leading-tight tracking-tight sm:text-3xl md:text-4xl"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800,
            color: '#BA4F64',
            textTransform: 'uppercase',
          }}
        >
          Viens fouiller ma caviar!
        </h1>
  
        {/* ---- SOUS-TITRE ---- */}
        <p
          className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-[#888] sm:mb-8 sm:text-base md:max-w-lg"
        >
          Nous avons, les pépites, le genre qui va avec le genre.
          <br />
          Fait ton choix , ma warignan love ❤️.
        </p>
  
        {/* ---- BOUTON CTA ---- */}
        <button
          type="button"
          onClick={scrollToFeed}
          className="w-full max-w-md px-4 py-3.5 text-sm font-bold uppercase tracking-wide sm:mx-auto sm:block sm:max-w-lg sm:py-4 sm:text-base"
          style={{
            background: '#FF0000',
            color: '#FFFFFF',
            fontFamily: "'Space Grotesk', sans-serif",
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          COMMENCER LA FOUILLE →
        </button>
      </section>
    );
  };
  
  export default HeroSection;
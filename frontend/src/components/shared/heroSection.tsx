

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
        className="px-4 text-center"
        style={{
          paddingTop: '32px',
          paddingBottom: '24px',
          // Dégradé rose en haut qui s'estompe vers le bas
          background:
            'linear-gradient(180deg, rgba(254,44,85,0.15) 0%, rgba(5,5,5,0) 100%)',
          borderBottom: '1px solid #2A2A2A',
        }}
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
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '28px',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-1px',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          Viens fouiller !
        </h1>
  
        {/* ---- SOUS-TITRE ---- */}
        <p
          style={{
            color: '#888',
            fontSize: '14px',
            marginBottom: '24px',
            lineHeight: 1.5,
          }}
        >
          Clique, fouille, commande.
          <br />
          Pas besoin de compte.
        </p>
  
        {/* ---- BOUTON CTA ---- */}
        <button
          onClick={scrollToFeed}
          className="w-full"
          style={{
            background: '#FFFFFF',
            color: '#050505',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '16px',
            padding: '16px',
            borderRadius: '4px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
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
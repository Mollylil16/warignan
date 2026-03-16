
const Navbar = () => {
    return (
      <header
        className="flex justify-between items-center px-4 py-5 sticky top-0 z-50"
        style={{
          borderBottom: '1px solid #2A2A2A',
          // Fond légèrement transparent avec flou (effet glassmorphism)
          background: 'rgba(5, 5, 5, 0.9)',
          // backdropFilter = flou sur ce qui est DERRIÈRE l'élément
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)', // Préfixe pour Safari (iPhone)
        }}
      >
        {/* Logo WARIGNAN avec style Space Grotesk */}
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '-1px',
            color: '#FFFFFF',
          }}
        >
          WARIGNAN
        </div>
  
        {/* Icône panier (simple emoji pour l'instant) */}
        <div style={{ fontSize: '20px', cursor: 'pointer' }}>🛒</div>
      </header>
    );
  };
  
  export default Navbar;
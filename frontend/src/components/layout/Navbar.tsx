const Navbar = () => {
  return (
    <header
      className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between px-4 sm:h-16 sm:px-6"
      style={{
        background: '#ffff',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* Logo WARIGNAN avec Yesteryear */}
      <div
        className="text-2xl sm:text-[28px]"
        style={{
          fontFamily: "cursive",
          fontWeight: 900,
          color: '#BA4F64',
        }}
      >
        WARIGNAN
      </div>

      {/* Icône panier */}
      <div
        className="text-lg sm:text-xl"
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        aria-label="Panier"
      >
        🛒
      </div>
    </header>
  );
};

export default Navbar;
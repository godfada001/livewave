import React from "react";

const Header = ({
  user,
  search,
  setSearch,
  onSearch,
  onLogout,
}) => {
  const displayName =
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand">
          <div className="brand-icon">▶</div>

          <div className="brand-text">
            <span className="brand-name">STREAMTV</span>
            <span className="brand-tagline">
              Live television, anywhere.
            </span>
          </div>
        </div>
      </div>

      <div className="header-search">
        <span className="search-icon">⌕</span>

        <input
          type="text"
          placeholder="Search channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            className="search-clear"
            onClick={() => setSearch("")}
            type="button"
          >
            ×
          </button>
        )}

        <span className="search-hint">Enter</span>
      </div>

      <div className="header-right">
        <div className="user-profile">
          <div className="user-avatar">{initial}</div>

          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-status">Online</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={onLogout}
          type="button"
        >
          <span>↪</span>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
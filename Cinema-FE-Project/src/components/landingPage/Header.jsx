import { Search, LogIn, LogOut, User, X, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../auth/AuthModal";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { movieService } from "../../services/movieService";

const API_BASE =
  process.env.BACKEND_URL?.replace(/\/$/, "") || "https://cinema-ticket-booking-system-3.onrender.com";

function getAvatarUrl(avatar) {
  if (!avatar) return `${API_BASE}/uploads/default-avatar.svg`;
  if (avatar.startsWith("data:")) return avatar;
  if (avatar.startsWith("http")) return avatar;
  return `${API_BASE}${avatar}`;
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const isLoggedIn = Boolean(user);

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await movieService.searchMovies(query, { limit: 10 });

      // Handle different response formats
      let results = [];
      if (response?.data && Array.isArray(response.data)) {
        results = response.data;
      } else if (Array.isArray(response)) {
        results = response;
      }

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const goToFullSearchResults = () => {
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      goToFullSearchResults();
    }
  };

  const handleMovieClick = (uuid) => {
    navigate(`/movies/${uuid}`);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // handle Profile click
  const handleProfileClick = () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        if (decoded.role === "admin") {
          navigate("/admin"); // 👉 admin vào trang admin
        } else if (decoded.role === "staff") {
          navigate("/staff");
        } else if (decoded.role === "manager") {
          navigate("/manager"); // 👉 staff vào dashboard
        } else {
          navigate("/profile"); // 👉 user thường
        }

      } catch (err) {
        console.error("Invalid token", err);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }

    setShowMenu(false);
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-black/70 backdrop-blur-md border-b border-white/10 px-6 lg:px-20 py-4 flex items-center justify-between">

      {/* LEFT */}
      <div className="flex items-center gap-12">
        <Link to={`/`} className="flex items-center gap-3 text-primary">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="font-bold text-2xl">S</span>
          </div>
          <h2 className="text-slate-100 text-xl font-bold tracking-tight">FCINEMA</h2>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" to="/movies">Movies</Link>
          <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Venues</a>
          <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Offers</a>
        </nav>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        {/* search */}
        <div ref={searchRef} className="relative hidden lg:block">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center glass-effect rounded-full px-4 py-1.5 gap-2 border border-white/5">
              {isSearching ? (
                <Loader2 className="text-slate-400 w-4 h-4 animate-spin" />
              ) : (
                <Search className="text-slate-400 w-4 h-4" />
              )}
              <input
                type="text"
                className="bg-transparent border-none focus:outline-none text-sm text-slate-100 placeholder:text-slate-500 w-48"
                placeholder="Tìm phim theo tên..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <>
                  {searchResults.map((movie) => (
                    <button
                      key={movie.UUID || movie._id}
                      onClick={() => handleMovieClick(movie.UUID)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors text-left"
                    >
                      <div
                        className="w-12 h-16 bg-cover bg-center rounded-md flex-shrink-0"
                        style={{
                          backgroundImage: `url('${movie.posterUrl || "/no-poster.jpg"}')`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-100 truncate">
                          {movie.title}
                        </h4>
                        <p className="text-slate-400 text-xs">
                          {movie.genres?.map((g) => g.name).join(", ") || "Movie"} • {movie.duration}m
                        </p>
                      </div>
                      <span className="text-yellow-500 text-sm flex items-center gap-0.5 flex-shrink-0">
                        ★ {movie.rating || "N/A"}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={goToFullSearchResults}
                    className="w-full p-3 text-center text-primary text-sm hover:bg-slate-700 transition-colors border-t border-white/5"
                  >
                    Xem tất cả kết quả cho “{searchQuery}”
                  </button>
                </>
              ) : (
                <div className="p-4 text-center text-slate-400">
                  <p className="text-sm">Không tìm thấy phim nào</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* auth */}
        {!user ? (
          <button
            type="button"
            onClick={() => setShowAuth(true)}
            className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium"
          >
            <LogIn className="w-4 h-4" /> Login
          </button>
        ) : (
          <div ref={menuRef} className="relative">

            {/* avatar */}
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 ring-primary transition"
            >
              {user?.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-primary flex items-center justify-center ${user?.avatar ? "hidden" : ""}`}>
                <User className="text-white w-5 h-5" />
              </div>
            </button>

            {/* dropdown */}
            {showMenu && (
              <div className="absolute right-0 mt-3 w-44 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden animate-fadeIn">

                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                  Profile
                </button>

                <Link
                  to="/booking-history"
                  onClick={() => setShowMenu(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                  Lịch sử đặt vé
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>

              </div>
            )}
          </div>
        )}

        <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full text-sm font-bold transition transform hover:scale-105">
          Book Now
        </button>

      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </header>
  );
}

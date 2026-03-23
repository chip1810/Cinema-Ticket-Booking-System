import { Search, LogIn, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../common/Modal/AuthModal";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_BASE =
  process.env.BACKEND_URL?.replace(/\/$/, "") || "http://localhost:3000";

function getAvatarUrl(avatar) {
  if (!avatar) return `${API_BASE}/uploads/default-avatar.svg`;
  if (avatar.startsWith("data:")) return avatar;
  if (avatar.startsWith("http")) return avatar;
  return `${API_BASE}${avatar}`;
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loginBtnRef = useRef(null);
  const menuRef = useRef(null);

  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isLoggedIn = Boolean(user);

  const openAuthModal = () => {
    const rect = loginBtnRef.current?.getBoundingClientRect();
    if (rect) {
      setModalPos({ x: rect.left, y: rect.bottom });
    }
    setShowAuth(true);
  };

  // close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          navigate("/staff"); // 👉 staff vào dashboard
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
    <header className="fixed top-0 z-50 w-full glass-effect border-b border-white/10 px-6 lg:px-20 py-4 flex items-center justify-between">

      {/* LEFT */}
      <div className="flex items-center gap-12">
        <Link to={`/`} className="flex items-center gap-3 text-primary">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="font-bold text-2xl">S</span>
          </div>
          <h2 className="text-slate-100 text-xl font-bold tracking-tight">FCINEMA</h2>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Movies</a>
          <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Venues</a>
          <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Offers</a>
          <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="/manager">Manager Portal</a>
        </nav>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        {/* search */}
        <div className="hidden lg:flex items-center glass-effect rounded-full px-4 py-1.5 gap-2 border border-white/5">
          <Search className="text-slate-400 w-4 h-4" />
          <input
            className="bg-transparent border-none focus:outline-none text-sm text-slate-100 placeholder:text-slate-500 w-48"
            placeholder="Search movies..."
          />
        </div>

        {/* auth */}
        {!user ? (
          <button
            ref={loginBtnRef}
            onClick={() => {
              const rect = loginBtnRef.current.getBoundingClientRect();
              setModalPos({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
              });
              setShowAuth(true);
            }}
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

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        origin={modalPos}
      />
    </header>
  );
}

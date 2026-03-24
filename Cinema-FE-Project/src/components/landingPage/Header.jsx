import { Search, LogIn, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../common/Modal/AuthModal";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProfileClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "admin") navigate("/admin");
        else if (decoded.role === "staff") navigate("/staff");
        else navigate("/profile");
      } catch (err) { navigate("/login"); }
    } else navigate("/login");
    setShowMenu(false);
  };

  return (
    <header className={`fixed top-0 z-[100] w-full transition-all duration-500 px-6 lg:px-24 py-5 flex items-center justify-between ${scrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 py-4' : 'bg-transparent'}`}>
      <div className="flex items-center gap-16">
        <Link to={`/`} className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
            <span className="font-black text-3xl italic">S</span>
          </div>
          <h2 className="text-white text-2xl font-black tracking-tighter uppercase italic group-hover:text-primary transition-colors">FCINEMA</h2>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {['Movies', 'Venues', 'Offers'].map(item => (
            <Link key={item} className="text-white/60 hover:text-white transition-all text-sm font-black uppercase tracking-[0.2em]" to="/">
              {item}
            </Link>
          ))}
          {user && (user.role === "manager" || user.role === "admin" || user.role === "staff") && (
            <Link className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors hover:text-white" to="/manager">
              Portal
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center bg-white/5 rounded-2xl px-5 py-2.5 gap-3 border border-white/5 focus-within:border-primary/50 transition-all">
          <Search className="text-white/20 w-4 h-4" />
          <input className="bg-transparent border-none focus:outline-none text-xs font-bold text-white placeholder:text-white/20 w-40" placeholder="SEARCH MOVIES..." />
        </div>

        {!user ? (
          <button ref={loginBtnRef} onClick={() => {
            const rect = loginBtnRef.current.getBoundingClientRect();
            setModalPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            setShowAuth(true);
          }} className="btn-primary !px-8 !py-3 !text-xs">
            Login
          </button>
        ) : (
          <div ref={menuRef} className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 hover:border-primary transition-all p-0.5">
              <div className="w-full h-full bg-primary/20 flex items-center justify-center rounded-[0.8rem]">
                {user?.avatar ? <img src={getAvatarUrl(user.avatar)} className="w-full h-full object-cover rounded-[0.8rem]" /> : <User className="text-white w-6 h-6" />}
              </div>
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-56 bg-neutral-900/95 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden p-2">
                  <button onClick={handleProfileClick} className="w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all">Profile Setup</button>
                  <div className="h-px bg-white/5 my-1 mx-2" />
                  <button onClick={() => { logout(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-5 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><LogOut className="w-4 h-4" /> Sign Out</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} origin={modalPos} />
    </header>
  );
}

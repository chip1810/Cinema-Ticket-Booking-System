import { Search, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full glass-effect border-b border-white/10 px-6 lg:px-20 py-4 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3 text-primary">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="font-bold text-2xl">S</span>
          </div>
          <h2 className="text-slate-100 text-xl font-bold tracking-tight">STARLIGHT</h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Movies</a>
          <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Venues</a>
          <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Offers</a>
          <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Membership</a>
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center glass-effect rounded-full px-4 py-1.5 gap-2 border border-white/5">
          <Search className="text-slate-400 w-4 h-4" />
          <input 
            className="bg-transparent border-none focus:outline-none text-sm text-slate-100 placeholder:text-slate-500 w-48" 
            placeholder="Search movies..." 
            type="text"
          />
        </div>
        
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              <LogIn className="w-4 h-4" /> Login
            </button>
          ) : (
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 text-slate-300 hover:text-primary transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          )}
          
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 active:scale-95">
            Book Now
          </button>
        </div>

        <div 
          className="w-10 h-10 rounded-full border-2 border-primary/20 bg-cover bg-center cursor-pointer" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCTR36E75QaZ4nMQ6zq0qHGrvInEoUbrN6T0_Ryr3DcI8soQ2Pmnv1SNMYJHjDHb1Gy_dmsOoX2PHp-28d7uRFCVZDsn8_bfzzUwOjbBjMWnr3HV4WkGD_KlnvfD9o6Fuco1CyTRMTQDs-pIU_34MzckbbFiwXWxwPrIqrjD6kaREbFw0m4XdqFPKdEhoWWaYY9girSkbl8EYFzrfQPJVC1Nw5avcm1UxJhng-jSPbKSdwo9A5VcF4ubCb9oShF2CT3chsJT2EGfw')" }}
        />
      </div>
    </header>
  );
}

import { Share2, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-background-dark border-t border-white/5 px-6 lg:px-20 py-12">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
              <span className="font-bold">S</span>
            </div>
            <h2 className="text-slate-100 text-xl font-bold">FCINEMA</h2>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Redefining the cinematic experience with luxury and cutting-edge technology. Experience film as it was meant to be seen.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Discover</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a className="hover:text-primary transition-colors" href="#">Movies</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Showtimes</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">IMAX Experiences</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Private Hire</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Contact Us</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Stay Connected</h4>
          <div className="flex gap-4 mb-4">
            <a className="w-10 h-10 rounded-full glass-effect flex items-center justify-center hover:bg-primary transition-all" href="#">
              <Share2 className="w-4 h-4" />
            </a>
            <a className="w-10 h-10 rounded-full glass-effect flex items-center justify-center hover:bg-primary transition-all" href="#">
              <Mail className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-slate-600">Subscribe for weekly premieres and exclusive offers.</p>
        </div>
      </div>
      <div className="border-t border-white/5 pt-8 text-center text-slate-600 text-xs">
        © 2024 FCINEMA Luxury Cinemas. All Rights Reserved.
      </div>
    </footer>
  );
}

export default function Promotions() {
  return (
    <section className="px-6 lg:px-20 py-16 bg-primary/5">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative h-[240px] rounded-xl overflow-hidden group cursor-pointer">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
            style={{ 
              backgroundImage: `linear-gradient(45deg, rgba(230, 10, 21, 0.8), transparent), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCf_zOnPvm-qoIBX5p1rvF1udrZyQED7T4WG9lM3UclHo0l_NOtFK1pF_vzWxxYgJGHV2F1jB_u0n7bXcxkPsQSMC-W_ZN8FS89wxSLphqgYady4LX934PWDk5EEfepizMk10N6oyngEJDN9p34PmQlgjO_qHtePyuyLmoy1D2y-HsuVkm7ZrzG3GFGBjbsy0mPLycs_xNSyT4Zkql57l3rrSZ_SC6q5MKVDQEYPP_aOGDOsmFZ3vRnmOofysbBSjVBHVopgPVGOg')` 
            }}
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-center">
            <h3 className="text-3xl font-bold text-white mb-2">Gourmet Tuesday</h3>
            <p className="text-white/80 max-w-xs mb-4">Get 50% off on all premium snack platters and artisan beverages every Tuesday.</p>
            <div>
              <span className="inline-block bg-white text-primary px-4 py-1 rounded-full text-sm font-bold">Claim Offer</span>
            </div>
          </div>
        </div>
        <div className="relative h-[240px] rounded-xl overflow-hidden group cursor-pointer">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
            style={{ 
              backgroundImage: `linear-gradient(45deg, #1e293b, transparent), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDB4EuMuimQY0T8tExX571Z6Q6RWsnw1fmvvBGdKmiOCjk2GHMQLN8D9BwJHTvYtqV4DMCwcEQETyCVgfuQemAogsCT7W4j3HWLCoxJEg829QS4ZxEcPwBHCh_UBNpd28E9_OdR02JE3cgvSrjYyvPKlG3Zw72oXKYJNdFMg8fnItshAhU8gl5Uyk5bBGFCRizsvg78YpvGUbB8GVYaXw2cMmVqqniT9NkF-7VNbxYDTEHIVSPoGMDfdOdHbTpK1pvpce68OS5TJA')` 
            }}
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-center">
            <h3 className="text-3xl font-bold text-white mb-2">Elite Membership</h3>
            <p className="text-white/80 max-w-xs mb-4">Unlimited movies, lounge access, and zero booking fees for just $29/mo.</p>
            <div>
              <span className="inline-block bg-white text-slate-900 px-4 py-1 rounded-full text-sm font-bold">Join the Club</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

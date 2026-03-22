import React from 'react';

export const OrderSummary = ({ items, total }) => {
  return (
    <aside className="w-96 bg-surface-container border-l border-outline-variant/15 flex flex-col">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <img
            alt="Movie Poster"
            className="w-20 h-28 object-cover rounded-lg shadow-xl"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwFL1olgB-EEgQzPUsH-oSPR2dmHgVzbobQ38WQENy8RnNKopwqB0BsCZo8XG6OnFey4SaeGIBovG0ZNrLrLY0Dg_itWxTxSSoxY_tdVWD1_9JfFAsJt1p_r9J8OdZnddE_Mc7tGGaJDeY832_fikDysq1Usawcxj-haBzdC4CgTG_D2ytmrDa1DmAhTv5huy8u8Z31oiMCUUFBzvjuKjL-PAyiLO8e6zG8qoywXIivD-VjPzBfE2E1AwQN2JOs55cRi_xIW3QkMvk"
          />
          <div>
            <h3 className="text-headline font-bold text-xl leading-tight">Order Summary</h3>
            <p className="text-on-surface-variant text-xs mt-1">Starlight Premium Cinema</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-on-surface font-semibold text-sm">Dune: Part Two</p>
              <p className="text-on-surface-variant text-xs">Seats A12, A13</p>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-wider mt-1">Tomorrow • 19:30</p>
            </div>
            <span className="font-bold text-sm">$32.00</span>
          </div>

          <div className="pt-6 border-t border-outline-variant/10">
            <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest mb-4">Snacks Added</p>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.name} x{item.quantity}</span>
                  <span className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-on-surface-variant text-xs italic">No snacks added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-8 bg-surface-container-high/50 border-t border-outline-variant/15">
        <div className="flex justify-between items-center mb-6">
          <span className="text-on-surface-variant font-label uppercase text-xs tracking-widest">Total Payable</span>
          <span className="text-3xl font-headline font-extrabold text-primary-container">${total.toFixed(2)}</span>
        </div>
        <button className="w-full bg-primary-container text-on-primary-container py-4 rounded-lg font-headline font-bold text-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(229,9,20,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2">
          Checkout
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
        <p className="text-center text-[10px] text-on-surface-variant mt-4">
          By clicking Checkout, you agree to our Terms of Service
        </p>
      </div>
    </aside>
  );
};
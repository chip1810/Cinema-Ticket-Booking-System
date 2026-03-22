import React from "react";

export const OrderSummary = ({
  movieTitle,
  posterUrl, // thêm prop poster
  bookingDetails = [],
  showtime,
  items = [],
  ticketTotal = 0,
  total = 0,
  onProceed
}) => {

  const formattedShowtime = showtime
    ? `${new Date(showtime).toLocaleDateString()} • ${new Date(showtime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`
    : "-";

  return (
    <aside className="w-96 bg-[#0a0a0a]/80 border-l border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex gap-4 items-center">
        {posterUrl && (
          <img
            src={posterUrl}
            alt={movieTitle}
            className="w-20 h-28 object-cover rounded-lg shadow-md"
          />
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{movieTitle || "Unknown Movie"}</h3>
          <p className="text-gray-400 text-sm">
            Seats: {bookingDetails.map(d => d.seatNumber).join(", ") || "-"}
          </p>
          <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">{formattedShowtime}</p>
        </div>
      </div>

      {/* Tickets + Snacks */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {/* Ticket */}
          <div className="flex justify-between items-center">
            <span className="text-white font-medium">Tickets</span>
            <span className="text-white font-bold">{ticketTotal.toLocaleString()}₫</span>
          </div>

          {/* Snacks */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-2">Snacks Added</p>
            <div className="space-y-2">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-white">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-bold">{(item.price * item.quantity).toLocaleString()}₫</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-[12px]">No snacks added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Total + Checkout */}
      <div className="p-6 border-t border-white/10 bg-[#111]/70">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400 uppercase text-xs tracking-widest">Total Payable</span>
          <span className="text-2xl font-bold text-white">{total.toLocaleString()}₫</span>
        </div>
        <button
          onClick={onProceed}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold uppercase tracking-wider shadow-md transition-transform active:scale-95"
        >
          Thanh toán
        </button>
      </div>
    </aside>
  );
};
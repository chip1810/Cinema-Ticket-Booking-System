import React from "react";

export const OrderSummary = ({
  movieTitle,
  posterUrl,
  bookingDetails = [],
  showtime,
  items = [],
  ticketTotal = 0,
  pricing = {},
  total = 0,
  onProceed
}) => {
  const formattedShowtime = showtime
    ? `${new Date(showtime).toLocaleDateString('vi-VN')} • ${new Date(showtime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`
    : "-";

  return (
    <aside className="w-full h-full bg-[#0a0a0a]/90 flex flex-col border-l border-white/10">
      {/* Header Phim */}
      <div className="p-6 border-b border-white/10 flex gap-4">
        {posterUrl && (
          <img src={posterUrl} alt={movieTitle} className="w-20 h-28 object-cover rounded-lg shadow-2xl border border-white/10" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white truncate uppercase">{movieTitle || "Unknown Movie"}</h3>
          <p className="text-red-500 text-[10px] font-black tracking-widest mt-1 uppercase">{formattedShowtime}</p>
        </div>
      </div>

      {/* Nội dung chi tiết */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div>
          <p className="...">Ghế đã chọn</p>
          <div className="space-y-3">
            {bookingDetails.length > 0 ? (
              bookingDetails.map((seat, idx) => (
                <div key={idx} className="...">
                  <div>
                    <span className="text-white font-bold block">Ghế {seat.seatNumber}</span>
                    <span className={`text-[9px] ... ${
                      seat.type === 'VIP' ? 'bg-yellow-500/20 text-yellow-500' : 
                      seat.type === 'COUPLE' ? 'bg-pink-500/20 text-pink-500' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {seat.type}
                    </span>
                  </div>
                  
                  {/* SỬA TẠI ĐÂY: Tra cứu giá dựa trên seat.type */}
                  <span className="text-white font-mono text-sm">
                    {(pricing[seat.type] || 0).toLocaleString()}₫
                  </span>
                </div>
              ))
            ) : (
              <p className="...">Chưa chọn ghế</p>
            )}
          </div>
        </div>

        {/* PHẦN ĐỒ ĂN (SNACKS) */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-3 font-bold">Bắp & Nước</p>
          <div className="space-y-3">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.name} <span className="text-gray-500 text-xs ml-1">x{item.quantity}</span></span>
                  <span className="text-white font-mono">{(item.price * item.quantity).toLocaleString()}₫</span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-[12px] italic">Chưa thêm combo nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Thanh Toán */}
      <div className="p-6 border-t border-white/10 bg-[#111]/80">
        <div className="flex justify-between items-end mb-4">
          <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Tổng thanh toán</span>
          <span className="text-2xl font-black text-white">{total.toLocaleString()}₫</span>
        </div>
        <button
          onClick={onProceed}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-600/20 transition-transform active:scale-95"
        >
          Thanh toán
        </button>
      </div>
    </aside>
  );
};
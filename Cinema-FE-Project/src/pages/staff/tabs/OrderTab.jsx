// OrderTab.jsx
import { useState } from "react";
import { staffService } from "../../../services/staffService";
import { 
  Search, 
  Ticket, 
  Calendar, 
  Clock, 
  Armchair, 
  Coffee, 
  QrCode, 
  Info,
  CheckCircle2
} from "lucide-react";

export default function OrderTab() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const data = await staffService.lookupOrder(orderId);
      setOrder(data);
    } catch (err) {
      console.error(err);
      setOrder(null);
      alert("Không tìm thấy đơn hàng!");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search Bar Section */}
      <div className="max-w-xl">
        <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
          <Ticket className="text-[#E50914]" /> Kiểm tra vé & Đơn hàng
        </h3>
        <div className="relative flex items-center group">
          <div className="absolute left-4 text-gray-400 group-focus-within:text-[#E50914] transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Nhập Mã đơn hàng (e.g. 65f...)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            className="w-full bg-[#2F2F2F] border-none text-white pl-12 pr-36 py-4 rounded-xl focus:ring-2 focus:ring-[#E50914]/50 outline-none transition-all shadow-lg placeholder:text-gray-500"
          />
          <button
            onClick={handleLookup}
            disabled={loading}
            className="absolute right-2 bg-[#E50914] hover:bg-[#b20710] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Đang tìm..." : "Tra cứu"}
          </button>
        </div>
      </div>

      {/* Ticket Result Section */}
      {order ? (
        <div className="max-w-3xl animate-slideUp">
          <div className="relative bg-[#232323] rounded-2xl overflow-hidden border border-white/5 shadow-2xl flex flex-col md:flex-row">
            
            {/* Left Part: Movie Poster & Main Info */}
            <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-dashed border-white/10 relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="bg-[#E50914]/10 text-[#E50914] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest mb-2 inline-block">
                    {order.status || "Confirmed"}
                  </span>
                  <h4 className="text-3xl font-black text-white leading-tight uppercase">
                    {order.movieTitle || "Tên Phim Chưa Cập Nhật"}
                  </h4>
                </div>
                <div className="text-right">
                   <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">Phòng chiếu</p>
                   <p className="text-white font-black text-xl">{order.hallName || "Hall 01"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#E50914]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Ngày chiếu</p>
                    <p className="text-sm font-bold text-white">
                      {order.showDate ? new Date(order.showDate).toLocaleDateString('vi-VN') : "---"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#E50914]">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Giờ chiếu</p>
                    <p className="text-sm font-bold text-white">{order.showTime || "--:--"}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 flex items-center gap-2">
                  <Armchair size={14} /> Ghế ngồi
                </p>
                <div className="flex flex-wrap gap-2">
                  {(order.seats || ["H12", "H13"]).map(seat => (
                    <span key={seat} className="text-lg font-black text-white px-2 py-1 bg-white/5 rounded border border-white/10">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ticket Cut-outs (Răng cưa) */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#141414] rounded-full hidden md:block"></div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#141414] rounded-full hidden md:block"></div>
            </div>

            {/* Right Part: QR & Combo */}
            <div className="w-full md:w-72 bg-[#1c1c1c] p-8 flex flex-col justify-between items-center">
              <div className="text-center w-full">
                <div className="bg-white p-3 rounded-lg inline-block mb-4 shadow-inner">
                   <QrCode size={120} className="text-black" />
                </div>
                <p className="text-[10px] text-gray-500 font-mono mb-6 uppercase">
                  Order ID: {order._id?.slice(-10).toUpperCase()}
                </p>
                
                <div className="text-left w-full space-y-4 border-t border-white/5 pt-6">
                   <div className="flex items-start gap-3">
                      <Coffee size={16} className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Combo đã mua</p>
                        <p className="text-xs text-gray-300">
                          {order.combos?.length > 0 
                            ? order.combos.map(c => `${c.name} (x${c.quantity})`).join(", ") 
                            : "Không có combo"}
                        </p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-8 text-center w-full">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Tổng cộng</p>
                <p className="text-3xl font-black text-[#E50914]">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-gray-500 text-xs italic px-2">
            <Info size={14} />
            <span>Vui lòng kiểm tra mã QR và đối chiếu thông tin ghế trước khi cho khách vào phòng.</span>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-6 text-gray-700">
              <QrCode size={40} />
            </div>
            <h4 className="text-white font-bold text-lg">Sẵn sàng quét vé</h4>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">
              Nhập mã định danh đơn hàng để truy xuất thông tin vé, combo và trạng thái thanh toán.
            </p>
          </div>
        )
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { ProgressBar }  from '../../../components/concession/ProgressBar';
import { HeroSnackCard } from '../../../components/concession/HeroSnackCard';
import { SnackCard }    from '../../../components/concession/SnackCard';
import { OrderSummary } from '../../../components/concession/OrderSummary';
import { concessionService } from '../../../services/concessionService';

const ConcessionPage = ({ bookingData, onNext, onBack }) => {
  const [snacks, setSnacks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [timeLeft, setTimeLeft] = useState(""); // State cho đồng hồ đếm ngược

  // 1. LOG ĐỂ KIỂM TRA DỮ LIỆU GHẾ
  useEffect(() => {
    if (bookingData) {
      console.log("🎬 [CONCESSION LOG] Dữ liệu từ trang ghế truyền sang:");
      console.log("- Suất chiếu UUID:", bookingData.showtime?.UUID);
      console.log("- Ghế đã chọn:", bookingData.details?.map(s => s.seatNumber).join(", "));
      console.log("- Tổng tiền vé:", bookingData.totalPrice?.toLocaleString(), "₫");
      console.log("- Thời hạn giữ ghế (expiresAt):", bookingData.holdExpiresAt);
    }
  }, [bookingData]);

  // 2. LOGIC ĐỒNG HỒ ĐẾM NGƯỢC
  useEffect(() => {
    if (!bookingData?.holdExpiresAt) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(bookingData.holdExpiresAt).getTime();
      const distance = expiresAt - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("00:00");
        alert("Hết thời gian giữ ghế! Trung vui lòng chọn lại nhé.");
        onBack(); // Đuổi về trang chọn ghế
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingData, onBack]);

  useEffect(() => {
    concessionService.getAll()
      .then((res) => {
        const items = res.data.map(item => ({
          ...item,
          price: Number(item.price),
          quantity: 0,
        }));
        setSnacks(items);
      })
      .catch((err) => {
          console.error("❌ Lỗi fetch bắp nước:", err);
          setError("Không thể tải danh sách bắp nước.");
      })
      .finally(() => setLoading(false));
  }, []);

  const updateQuantity = (id, delta) => {
    setSnacks(prev =>
      prev.map(snack =>
        snack.id === id
          ? { ...snack, quantity: Math.max(0, snack.quantity + delta) }
          : snack
      )
    );
  };

  const ticketTotal = bookingData?.totalPrice || 0; 
  const snacksTotal = snacks.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const totalPayable = ticketTotal + snacksTotal;

  const addedSnacks = snacks
    .filter(s => s.quantity > 0)
    .map(s => ({ 
        id: s.id, 
        name: s.name, 
        quantity: s.quantity, 
        price: s.price 
    }));

  const handlePayment = () => {
    onNext({
      ...bookingData,
      snacks: addedSnacks,
      snacksTotal,
      finalTotal: totalPayable
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-sm tracking-widest uppercase">Đang chuẩn bị bắp nước...</p>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white font-sans">
      {/* THANH THỜI GIAN ĐẾM NGƯỢC (STICKY) */}
      <div className="bg-red-600/10 border-b border-red-600/20 py-2 text-center backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">
             Ghế của bạn được giữ trong: <span className="text-white font-mono text-sm ml-2">{timeLeft}</span>
          </p>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-full h-[500px] bg-red-900/5 blur-[120px] pointer-events-none"></div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
          <ProgressBar currentStep={2} />

          <div className="max-w-6xl mx-auto mt-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 border-l-4 border-red-600 pl-4">
                Tiếp sức xem phim
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-24 lg:pb-0">
                {snacks.length > 0 && (
                <div className="md:col-span-12 lg:col-span-8">
                    <HeroSnackCard
                        {...snacks[0]}
                        onAdd={()    => updateQuantity(snacks[0].id, 1)}
                        onRemove={() => updateQuantity(snacks[0].id, -1)}
                    />
                </div>
                )}

                <div className="md:col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {snacks.slice(1).map(snack => (
                        <SnackCard
                            key={snack.id}
                            {...snack}
                            onAdd={()    => updateQuantity(snack.id, 1)}
                            onRemove={() => updateQuantity(snack.id, -1)}
                        />
                    ))}
                </div>
            </div>
          </div>
        </main>

        <aside className="hidden lg:block w-[400px] border-l border-white/5 bg-[#0a0a0a]/50 backdrop-blur-2xl">
            <OrderSummary 
                items={addedSnacks}
                ticketTotal={ticketTotal}
                total={totalPayable}
                onProceed={handlePayment}
                // Có thể truyền details ghế vào đây để hiển thị ở sidebar
                bookingDetails={bookingData?.details || []} 
            />
        </aside>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-[#111]/95 backdrop-blur-2xl border-t border-white/10 z-50">
          <div className="flex justify-between items-center max-w-md mx-auto">
              <div>
                  <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Tổng cộng</p>
                  <p className="text-xl font-black text-white italic">
                      {totalPayable.toLocaleString()}<span className="text-red-600 not-italic ml-1 text-sm">₫</span>
                  </p>
              </div>
              <button 
                onClick={handlePayment}
                className="bg-[#E50914] px-10 py-3.5 rounded-2xl font-black uppercase text-sm shadow-lg shadow-red-600/20 active:scale-95 transition-transform"
              >
                  Thanh toán
              </button>
          </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ConcessionPage;
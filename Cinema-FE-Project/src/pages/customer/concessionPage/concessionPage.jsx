import React, { useState, useEffect } from 'react';
import { TopNavBar } from '../../../components/concession/TopNavBar';
import { ProgressBar } from '../../../components/concession/ProgressBar';
import { HeroSnackCard } from '../../../components/concession/HeroSnackCard';
import { SnackCard } from '../../../components/concession/SnackCard';
import { OrderSummary } from '../../../components/concession/OrderSummary';
import { concessionService } from '../../../services/concessionService';

const ConcessionPage = ({ bookingData, onNext, onBack }) => {
  const [snacks, setSnacks] = useState([]);
  const [addedSnacks, setAddedSnacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  // Log dữ liệu ghế và vé
  useEffect(() => {
    if (bookingData) {
      console.log("🎬 [CONCESSION LOG] Dữ liệu từ trang ghế truyền sang:");
      console.log("- Suất chiếu UUID:", bookingData.showtime?.UUID);
      console.log("- Ghế đã chọn:", bookingData.details?.map(s => s.seatNumber).join(", "));
      console.log("- Tổng tiền vé:", bookingData.totalPrice?.toLocaleString(), "₫");
      console.log("- Thời hạn giữ ghế (expiresAt):", bookingData.holdExpiresAt);
    }
  }, [bookingData]);

  // Đồng hồ đếm ngược giữ ghế
  useEffect(() => {
    if (!bookingData?.holdExpiresAt) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(bookingData.holdExpiresAt).getTime();
      const distance = expiresAt - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("00:00");
        alert("Hết thời gian giữ ghế! Vui lòng chọn lại.");
        onBack();
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingData, onBack]);

  // Lấy danh sách snack từ API
  useEffect(() => {
    concessionService.getAll()
      .then(res => {
        const items = res.data.map(item => ({
          ...item,
          id: item._id, // QUAN TRỌNG: Gán _id vào id để đồng bộ logic
          price: Number(item.price),
          quantity: 0,
        }));
        setSnacks(items);
      })
      .catch(err => {
        console.error("❌ Lỗi fetch bắp nước:", err);
        setError("Không thể tải danh sách bắp nước.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Phân loại snacks thành các nhóm
  const categories = {
    combos: snacks.filter(s => s.type === 'Combo'),
    foods: snacks.filter(s => s.type === 'Food'),
    drinks: snacks.filter(s => s.type === 'Drink'),
    others: snacks.filter(s => !['Combo', 'Food', 'Drink'].includes(s.type))
  };

  const updateQuantity = (snackId, delta) => {
    setAddedSnacks(prev => {
      // snackId ở đây chính là item._id mà ta đã gán ở trên
      const existingItem = prev.find(item => item.id === snackId);

      if (existingItem) {
        const newQuantity = existingItem.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter(item => item.id !== snackId);
        }
        return prev.map(item =>
          item.id === snackId ? { ...item, quantity: newQuantity } : item
        );
      } else {
        if (delta > 0) {
          // Tìm trong danh sách gốc dùng .id (vừa gán)
          const snackData = snacks.find(s => s.id === snackId);
          if (snackData) {
            return [...prev, { ...snackData, quantity: 1 }];
          }
        }
      }
      return prev;
    });
  };
  // 2. Hàm tiện ích để lấy số lượng hiện tại của 1 món trong giỏ hàng
  const getItemQuantity = (id) => {
    const item = addedSnacks.find(s => s.id === id);
    return item ? item.quantity : 0;
  };

  const ticketTotal = bookingData?.totalPrice || 0;
  const snacksTotal = addedSnacks.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const totalPayable = ticketTotal + snacksTotal;

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
      <TopNavBar onBack={onBack} />

      {/* Đồng hồ đếm ngược */}
      <div className="bg-red-600/10 border-b border-red-600/20 py-2 text-center backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">
          Ghế của bạn được giữ trong:
          <span className="text-white font-mono text-sm ml-2">{timeLeft}</span>
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-full h-[500px] bg-red-900/5 blur-[120px] pointer-events-none"></div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar scroll-smooth">
          <ProgressBar currentStep={2} />

          <div className="max-w-6xl mx-auto mt-10">
            {/* Tiêu đề */}
            <div className="mb-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter border-l-8 border-red-600 pl-4">
                Tiếp sức xem phim
              </h2>
            </div>

            {/* Section: Combo - Thường combo ảnh to nên để 1 cột hoặc 2 cột tùy bạn, ở đây mình để 2 cột luôn cho đồng bộ */}
            {categories.combos.length > 0 && (
              <section className="mb-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-6 flex items-center gap-4">
                  <span>Combo Khuyến Mãi</span>
                  <div className="h-[1px] flex-1 bg-red-600/20"></div>
                </h3>
                {/* CHIA 2 CỘT CHO COMBO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">                  {categories.combos.map(combo => (
                  <HeroSnackCard
                    key={combo.id}
                    {...combo}
                    quantity={getItemQuantity(combo.id)}
                    onAdd={() => updateQuantity(combo.id, 1)}
                    onRemove={() => updateQuantity(combo.id, -1)}
                  />
                ))}
                </div>
              </section>
            )}

            {/* Section: Bắp & Đồ ăn nhẹ - CHIA 2 CỘT */}
            {categories.foods.length > 0 && (
              <section className="mb-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-4">
                  <span>Bắp & Đồ ăn</span>
                  <div className="h-[1px] flex-1 bg-white/10"></div>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.foods.map(snack => (
                    <SnackCard
                      key={snack.id}
                      {...snack}
                      quantity={getItemQuantity(snack.id)}
                      onAdd={() => updateQuantity(snack.id, 1)}
                      onRemove={() => updateQuantity(snack.id, -1)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Section: Nước uống - CHIA 2 CỘT */}
            {categories.drinks.length > 0 && (
              <section className="mb-24 lg:mb-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6 flex items-center gap-4">
                  <span>Nước giải khát</span>
                  <div className="h-[1px] flex-1 bg-blue-500/20"></div>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.drinks.map(snack => (
                    <SnackCard
                      key={snack.id}
                      {...snack}
                      quantity={getItemQuantity(snack.id)}
                      onAdd={() => updateQuantity(snack.id, 1)}
                      onRemove={() => updateQuantity(snack.id, -1)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block w-[400px] border-l border-white/5 bg-[#0a0a0a]/50 backdrop-blur-2xl">
          <OrderSummary
            items={addedSnacks}
            ticketTotal={ticketTotal}
            total={totalPayable}
            onProceed={handlePayment}
            bookingDetails={bookingData?.details || []}
            movieTitle={bookingData?.movie?.title || "Unknown Movie"}
            posterUrl={bookingData?.movie?.posterUrl}
            showtime={bookingData?.showtime?.startTime}
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
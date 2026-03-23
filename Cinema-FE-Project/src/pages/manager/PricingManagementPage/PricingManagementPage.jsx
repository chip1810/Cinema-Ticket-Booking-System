import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, DollarSign, Loader2, AlertCircle, CalendarDays, Save } from "lucide-react";
import { managerService } from "../../../services/managerService";

const SEAT_TYPES = ["NORMAL", "VIP", "COUPLE"];

const getId = (x) => x?.UUID || x?._id || x?.id || "";

const formatDateTime = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString("vi-VN");
};

const SeatTypeCard = ({ seatType, value, onChange }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-red-600/10 rounded-2xl text-red-500">
        <DollarSign size={24} />
      </div>
      <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded text-gray-400 uppercase tracking-widest">
        {seatType}
      </span>
    </div>

    <h3 className="text-xl font-bold mb-1">Giá ghế {seatType}</h3>
    <p className="text-gray-500 text-sm mb-6">Thiết lập giá cho loại ghế {seatType} theo suất chiếu.</p>

    <div className="space-y-4">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₫</span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(seatType, e.target.value)}
          className="w-full bg-[#140405] border border-white/5 rounded-2xl py-3 pl-8 pr-4 text-xl font-black focus:outline-none focus:border-red-600 transition-all"
        />
      </div>
    </div>
  </div>
);

export default function PricingManagementPage() {
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState("");
  const [prices, setPrices] = useState({
    NORMAL: 0,
    VIP: 0,
    COUPLE: 0,
  });

  const [loadingShowtimes, setLoadingShowtimes] = useState(true);
  const [loadingRules, setLoadingRules] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load showtimes
  useEffect(() => {
    const run = async () => {
      try {
        setLoadingShowtimes(true);
        const res = await managerService.getShowtimes();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setShowtimes(list);

        if (list.length > 0) {
          setSelectedShowtimeId(getId(list[0]));
        }
      } catch (e) {
        console.error("Failed to load showtimes:", e);
        setShowtimes([]);
      } finally {
        setLoadingShowtimes(false);
      }
    };
    run();
  }, []);

  // Load pricing rules by showtime
  useEffect(() => {
    const run = async () => {
      if (!selectedShowtimeId) return;

      try {
        setLoadingRules(true);
        const res = await managerService.getPricingRules(selectedShowtimeId);
        const rules = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

        const next = { NORMAL: 0, VIP: 0, COUPLE: 0 };
        for (const r of rules) {
          if (SEAT_TYPES.includes(r.seatType)) {
            next[r.seatType] = Number(r.price || 0);
          }
        }
        setPrices(next);
      } catch (e) {
        console.error("Failed to load pricing rules:", e);
        setPrices({ NORMAL: 0, VIP: 0, COUPLE: 0 });
      } finally {
        setLoadingRules(false);
      }
    };
    run();
  }, [selectedShowtimeId]);

  const selectedShowtime = useMemo(
    () => showtimes.find((s) => getId(s) === selectedShowtimeId),
    [showtimes, selectedShowtimeId]
  );

  const handleChangePrice = (seatType, val) => {
    setPrices((prev) => ({
      ...prev,
      [seatType]: Number(val || 0),
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedShowtimeId) {
      alert("Vui lòng chọn suất chiếu.");
      return;
    }

    const rules = SEAT_TYPES.map((seatType) => ({
      seatType,
      price: Number(prices[seatType] || 0),
    }));

    try {
      setSaving(true);
      await managerService.setPricingRules({
        showtimeId: selectedShowtimeId,
        rules,
      });
      alert("Lưu giá ghế thành công.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "Không thể lưu giá ghế.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Seat Pricing Management</h2>
          <p className="text-gray-400 mt-1">Thiết lập giá ghế theo từng suất chiếu.</p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving || !selectedShowtimeId}
          className="px-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl font-bold inline-flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Lưu giá ghế
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        {loadingShowtimes ? (
          <div className="h-20 flex items-center justify-center">
            <Loader2 className="animate-spin text-red-600" size={28} />
          </div>
        ) : showtimes.length === 0 ? (
          <div className="flex items-center gap-2 text-amber-400">
            <AlertCircle size={18} />
            <span>Chưa có suất chiếu để set giá ghế.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Chọn suất chiếu</label>
              <select
                value={selectedShowtimeId}
                onChange={(e) => setSelectedShowtimeId(e.target.value)}
                className="w-full bg-[#1a0607] border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white"
              >
                {showtimes.map((s) => {
                  const id = getId(s);
                  const movieTitle = s?.movie?.title || "Unknown movie";
                  const hallName = s?.hall?.name || "Unknown hall";
                  return (
                    <option key={id} value={id}>
                      {movieTitle} | {hallName} | {formatDateTime(s.startTime)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="inline-flex items-center gap-2">
                <CalendarDays size={16} className="text-red-500" />
                <span>
                  {selectedShowtime
                    ? `${selectedShowtime?.movie?.title || "Unknown"} - ${
                        selectedShowtime?.hall?.name || "Unknown hall"
                      }`
                    : "Chưa chọn suất chiếu"}
                </span>
              </div>
              <p className="text-gray-400 mt-1">
                {selectedShowtime ? formatDateTime(selectedShowtime.startTime) : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {loadingRules ? (
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="animate-spin text-red-600" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SEAT_TYPES.map((seatType) => (
            <SeatTypeCard
              key={seatType}
              seatType={seatType}
              value={prices[seatType]}
              onChange={handleChangePrice}
            />
          ))}
        </div>
      )}

      <div className="bg-gradient-to-br from-[#1a0607] to-[#0a0203] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <h3 className="text-lg font-bold mb-2 relative z-10 inline-flex items-center gap-2">
          <Ticket size={18} className="text-red-500" />
          Lưu ý
        </h3>
        <p className="text-sm text-gray-400 relative z-10">
          Giá bạn set ở đây sẽ được dùng khi khách giữ ghế và checkout (`PricingRule` theo `showtime + seatType`).
        </p>
      </div>
    </div>
  );
}
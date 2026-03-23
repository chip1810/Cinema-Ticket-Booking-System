const OrderStatus = {
  AWAITING_PAYMENT: "AWAITING_PAYMENT", // mới: tạo trước khi thanh toán
  PENDING: "PENDING",                   // vẫn giữ nếu cần cho một workflow khác
  PAID: "PAID",
  CANCELLED: "CANCELLED",
};

module.exports = OrderStatus;
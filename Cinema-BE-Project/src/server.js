const http = require("http");
const { app } = require("./app");
const { initSocket } = require("./socket");
const { connectMongo } = require("./mongo");

const PaymentService = require("./modules/payment/services/PaymentService");
const paymentService = new PaymentService();

setInterval(async () => {
  try {
    const expired = await paymentService.expirePendingTransactions();
    if (expired > 0) {
      console.log(`[payment-cleanup] expired ${expired} transaction(s)`);
    }
  } catch (e) {
    console.error("[payment-cleanup] error:", e.message || e);
  }
}, 60 * 1000);
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectMongo();
    console.log("Database connected");

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err.message || err);
    process.exit(1);
  }
}

startServer();
// server.js
const http = require("http");
const app = require("./app"); // nhớ export đúng bên app.js
const { initSocket } = require("./socket");
const { connectMongo } = require("./mongo");

const PORT = process.env.PORT || 3000;

connectMongo()
  .then(() => {
    console.log("✅ MongoDB connected");

    const server = http.createServer(app);

    // 🔥 INIT SOCKET
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  });
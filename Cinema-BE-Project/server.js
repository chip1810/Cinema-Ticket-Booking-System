const http = require("http");
const { app } = require("./src/app");
const { initSocket } = require("./src/socket");
const { connectMongo } = require("./src/mongo");

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

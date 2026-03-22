require("dotenv").config();
const http = require("http");
const { app } = require("./src/app");
const { connectMongo } = require("./src/mongo");
const { initSocket } = require("./src/socket");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectMongo();
    console.log("Database connection has been established successfully.");

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

startServer();

import http from "http";
import { app } from "./app"; // file express của bạn
import { initSocket } from "./socket";
import { AppDataSource } from "./mongo";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        console.log("✅ Database connected");

        const server = http.createServer(app);

        // 🔥 INIT SOCKET Ở ĐÂY
        initSocket(server);

        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1);
    });
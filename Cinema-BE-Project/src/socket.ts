import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 socket connected:", socket.id);

    socket.onAny((event, ...args) => {
      console.log("📡 event received:", event, args);
    });

    socket.on("join-showtime", (showtimeUUID: string) => {
      socket.join(showtimeUUID);
      console.log(`🎬 ${socket.id} joined room ${showtimeUUID}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
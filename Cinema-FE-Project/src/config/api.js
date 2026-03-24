export const API_BASE_URL = process.env.BACKEND_URL || "https://cinema-ticket-booking-system-3.onrender.com/api";
export const SOCKET_URL = API_BASE_URL.replace(/\/{0,1}api\/?$/, "");

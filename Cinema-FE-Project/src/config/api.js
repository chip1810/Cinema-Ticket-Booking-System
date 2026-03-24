/**
 * CRA chỉ expose biến môi trường bắt đầu bằng REACT_APP_.
 * Backend Cinema-BE mặc định: http://localhost:3000 (xem server.js).
 */
export function getBackendOrigin() {
  const raw =
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:3000";
  return String(raw).replace(/\/$/, "");
}

/** Prefix REST: /api/movies, /api/auth/login, ... */
export function getApiBaseUrl() {
  return `${getBackendOrigin()}/api`;
}

export const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3000/api";
export const SOCKET_URL = API_BASE_URL.replace(/\/{0,1}api\/?$/, "");

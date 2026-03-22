export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";
export const SOCKET_URL = API_BASE_URL.replace(/\/{0,1}api\/?$/, "");

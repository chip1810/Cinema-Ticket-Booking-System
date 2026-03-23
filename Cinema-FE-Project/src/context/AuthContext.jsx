import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ⬅️ mới
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // 🔥 check id hợp lệ
        if (!isValidObjectId(decoded.id)) {
          throw new Error("Invalid ObjectId");
        }

        setUser({ ...decoded, token });
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("token"); // 💥 xóa token lỗi
      }
    }
    setIsLoading(false);
  }, []);
  const login = (token) => {
    localStorage.setItem("token", token);
    try {
      const decoded = jwtDecode(token);
      setUser({ ...decoded, token });
    } catch (err) {
      console.error("Invalid token", err);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login as loginApi, register } from "../../../services/authService";
import { useAuth } from "../../../context/AuthContext";
import NetflixInput from "../Input/NetflixInput";
import Swal from "sweetalert2";
import {
    GOOGLE_OAUTH_BROADCAST,
    GOOGLE_OAUTH_WINDOW_NAME,
} from "../../../constants/googleOAuth";

/** Create React App: chỉ đọc biến REACT_APP_* — không dùng Vite (import.meta.env) */
const API_BASE =
    process.env.BACKEND_URL?.replace(/\/$/, "") || "http://localhost:3000";

export default function AuthModal({ isOpen, onClose, origin }) {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const focusMainContentAfterLogin = useCallback(() => {
        window.setTimeout(() => {
            if (pathname === "/") {
                document.getElementById("movies")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            } else {
                navigate("/", { state: { focusMovies: true } });
            }
        }, 200);
    }, [navigate, pathname]);

    const onGoogleAuthSuccess = useCallback(
        (token) => {
            if (!token) return;
            login(token);
            onClose();
            Swal.fire({
                icon: "success",
                title: "Đăng nhập thành công!",
                text: "Chào mừng bạn đến với Cinema",
                confirmButtonColor: "#E50914",
                timer: 2000,
                showConfirmButton: false,
            });
            focusMainContentAfterLogin();
        },
        [login, onClose, focusMainContentAfterLogin]
    );

    const onGoogleAuthError = useCallback(() => {
        Swal.fire({
            icon: "error",
            title: "Đăng nhập Google thất bại",
            text: "Vui lòng thử lại",
            confirmButtonColor: "#E50914",
        });
    }, []);

    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    // Reset form khi chuyển đổi Login/Register
    useEffect(() => {
        setFormData({ email: "", password: "", confirmPassword: "", fullName: "" });
    }, [isRegister]);

    useEffect(() => {
        if (isOpen) {
            setShow(false);
            const timer = setTimeout(() => setShow(true), 20);
            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e) => { e.key === "Escape" && onClose(); };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    // postMessage từ popup khi window.opener còn (tên cửa sổ có tên, không dùng _blank)
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
                onGoogleAuthSuccess(event.data.token);
            } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
                onGoogleAuthError();
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [onGoogleAuthSuccess, onGoogleAuthError]);

    // Khi opener === null (Chrome + _blank), popup gửi qua BroadcastChannel
    useEffect(() => {
        const ch = new BroadcastChannel(GOOGLE_OAUTH_BROADCAST);
        ch.onmessage = (event) => {
            if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
                onGoogleAuthSuccess(event.data.token);
            } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
                onGoogleAuthError();
            }
        };
        return () => ch.close();
    }, [onGoogleAuthSuccess, onGoogleAuthError]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isRegister && formData.password !== formData.confirmPassword) {
            return Swal.fire({
                icon: "warning",
                title: "Mật khẩu không khớp",
                text: "Vui lòng nhập lại mật khẩu xác nhận",
                confirmButtonColor: "#E50914"
            });
        }

        setLoading(true);
        try {
            if (isRegister) {
                await register({
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName
                });
                Swal.fire({
                    icon: "success",
                    title: "Đăng ký thành công!",
                    text: "Bạn có thể đăng nhập ngay bây giờ",
                    confirmButtonColor: "#E50914"
                });
                setIsRegister(false);
            } else {
                const res = await loginApi({ email: formData.email, password: formData.password });

                const token = res.data?.token || res.data?.accessToken;
                if (!token) throw new Error("Không nhận được token từ server");

                login(token);

                // ✅ THÊM ĐOẠN NÀY
                Swal.fire({
                    icon: "success",
                    title: "Đăng nhập thành công!",
                    text: "Chào mừng bạn đến với Cinema",
                    confirmButtonColor: "#E50914",
                    timer: 2000,
                    showConfirmButton: false,
                });

                onClose();
                focusMainContentAfterLogin();
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err.response?.data?.message || err.message,
                confirmButtonColor: "#E50914"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500
            ${show ? "bg-black/80 backdrop-blur-md opacity-100" : "opacity-0 pointer-events-none"}`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "fixed", left: "50%", top: "50%",
                    transformOrigin: origin
                        ? `${origin.x - window.innerWidth / 2 + 200}px ${origin.y - window.innerHeight / 2 + 100}px`
                        : "center"
                }}
                className={`relative w-[90%] max-w-[450px] p-8 md:p-14 rounded-md bg-black/90 border border-white/5 shadow-2xl
                transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${show ? "translate-x-[-50%] translate-y-[-50%] scale-100 opacity-100" : "translate-x-[-50%] translate-y-[-50%] scale-0 opacity-0"}`}
            >
                <button onClick={onClose} className="absolute right-6 top-6 text-gray-500 hover:text-white transition-colors text-2xl font-light">✕</button>

                <h2 className="text-white text-3xl font-bold mb-7">
                    {isRegister ? "Đăng ký" : "Đăng nhập"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <NetflixInput label="Họ và tên" name="fullName" value={formData.fullName} onChange={handleChange} />
                    )}

                    <NetflixInput
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <NetflixInput
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        showEye={true}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                    />

                    {isRegister && (
                        <NetflixInput
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            showEye={true}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                        />
                    )}

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-[#E50914] text-white py-3.5 rounded font-semibold hover:bg-[#c10712] transition-all mt-4 shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Đang xử lý..." : isRegister ? "Đăng ký" : "Đăng nhập"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-600"></div>
                    <span className="px-4 text-gray-500 text-sm">Hoặc</span>
                    <div className="flex-1 border-t border-gray-600"></div>
                </div>

                {/* Google Login Button */}
                <button
                    type="button"
                    onClick={() =>
                        window.open(
                            `${API_BASE}/api/auth/google`,
                            GOOGLE_OAUTH_WINDOW_NAME,
                            "popup=yes,width=520,height=640,left=80,top=80"
                        )
                    }
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 rounded font-medium hover:bg-gray-100 transition-all border border-gray-300"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Tiếp tục với Google
                </button>

                {/* Forgot Password — chỉ hiện khi đăng nhập */}
                {!isRegister && (
                    <div className="mt-4 text-right">
                        <button
                            type="button"
                            onClick={() => { onClose(); navigate("/forgot-password"); }}
                            className="text-[#737373] text-sm hover:text-white transition-colors"
                        >
                            Quên mật khẩu?
                        </button>
                    </div>
                )}

                <div className="mt-6">
                    <p className="text-[#737373]">
                        {isRegister ? "Đã có tài khoản?" : "Bạn mới tham gia ứng dụng?"}
                        <span
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-white cursor-pointer ml-2 hover:underline font-medium"
                        >
                            {isRegister ? "Đăng nhập ngay" : "Đăng ký ngay."}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
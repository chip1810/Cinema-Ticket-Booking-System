import { useState, useEffect } from "react";
import { login as loginApi, register } from "../../../services/authService";
import { useAuth } from "../../../context/AuthContext";
import NetflixInput from "../Input/NetflixInput";
import Swal from "sweetalert2";

export default function AuthModal({ isOpen, onClose, origin }) {
    const { login } = useAuth();

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
                login(res.data.token);
                onClose();
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

                <div className="mt-8">
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
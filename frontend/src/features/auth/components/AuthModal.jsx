import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../store";
import { Button } from "../../../components/ui";
import {
    X,
    Mail,
    Lock,
    User,
    Phone,
    ArrowLeft,
    Eye,
    EyeOff,
} from "lucide-react";
import { toast } from "sonner";

/* =========================
   INPUT FIELD COMPONENT
========================= */

const InputField = ({
    icon,
    className,
    showToggle,
    showPassword,
    setShowPassword,
    ...props
}) => {
    return (
        <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                {icon}
            </span>

            <input {...props} className={className} />

            {showToggle && (
                <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
        </div>
    );
};

/* =========================
   OTP INPUT COMPONENT
========================= */

const OtpInput = ({ otpDigits, setOtpDigits, otpRefs }) => {
    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1);
        setOtpDigits(newDigits);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const paste = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!paste) return;

        const newDigits = [...otpDigits];

        paste.split("").forEach((d, i) => {
            newDigits[i] = d;
        });

        setOtpDigits(newDigits);
    };

    return (
        <div className="flex justify-center gap-2.5 my-6">
            {otpDigits.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-border bg-surface-alt focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            ))}
        </div>
    );
};

/* =========================
   AUTH MODAL
========================= */

const AuthModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login, register, isLoading } = useAuthStore();

    const [view, setView] = useState("login");

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone_number: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const otpRefs = useRef([]);

    const inputCls =
        "w-full pl-11 pr-11 py-3 bg-surface-alt border border-border rounded-xl text-text text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

    useEffect(() => {
        const esc = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", esc);
        return () => document.removeEventListener("keydown", esc);
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* =========================
       LOGIN
    ========================= */

    const handleLogin = async (e) => {
        e.preventDefault();

        const result = await login(formData.email, formData.password);

        if (result.success) {
            toast.success("Đăng nhập thành công");
            onClose();

            // Admin → redirect to /admin
            if (result.data?.user?.role_id === 1) {
                navigate('/admin');
            }
        }
    };

    /* =========================
       REGISTER
    ========================= */

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const result = await register(formData);

        if (result.success) {
            toast.success("Register success");
            setView("otp");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-[420px] bg-surface rounded-2xl shadow-xl border border-border"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-text-muted hover:text-text"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    {view === "login" && (
                        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                            <h2 className="text-2xl font-bold text-center">
                                {t("auth.signIn")}
                            </h2>

                            <InputField
                                icon={<Mail size={18} />}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className={inputCls}
                            />

                            <InputField
                                icon={<Lock size={18} />}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className={inputCls}
                                showToggle
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />

                            <Button type="submit" loading={isLoading}>
                                {t("auth.signIn")}
                            </Button>

                            <p className="text-center text-sm">
                                No account?{" "}
                                <button
                                    type="button"
                                    onClick={() => setView("register")}
                                    className="text-primary"
                                >
                                    Register
                                </button>
                            </p>
                        </form>
                    )}

                    {view === "register" && (
                        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                            <h2 className="text-2xl font-bold text-center">
                                {t("auth.register")}
                            </h2>

                            <InputField
                                icon={<User size={18} />}
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Full name"
                                className={inputCls}
                            />

                            <InputField
                                icon={<Mail size={18} />}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className={inputCls}
                            />

                            <InputField
                                icon={<Phone size={18} />}
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                placeholder="Phone"
                                className={inputCls}
                            />

                            <InputField
                                icon={<Lock size={18} />}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className={inputCls}
                                showToggle
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />

                            <InputField
                                icon={<Lock size={18} />}
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                className={inputCls}
                                showToggle
                                showPassword={showConfirmPassword}
                                setShowPassword={setShowConfirmPassword}
                            />

                            <Button type="submit" loading={isLoading}>
                                Register
                            </Button>

                            <button
                                type="button"
                                onClick={() => setView("login")}
                                className="flex justify-center items-center gap-2 text-sm mt-2"
                            >
                                <ArrowLeft size={16} />
                                Back to login
                            </button>
                        </form>
                    )}

                    {view === "otp" && (
                        <div className="text-center">
                            <h2 className="text-xl font-bold mb-2">Verify OTP</h2>

                            <OtpInput
                                otpDigits={otpDigits}
                                setOtpDigits={setOtpDigits}
                                otpRefs={otpRefs}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoEyeOutline, IoEyeOffOutline, IoWarningOutline } from "react-icons/io5";
import { useAuthStore } from "../model/authStore";
import { useTranslation } from "react-i18next";

interface SignUpFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? <IoEyeOffOutline /> : <IoEyeOutline />;

export default function SignUpPage() {
  const [form, setForm] = useState<SignUpFormData>({ email: "", password: "", firstName: "", lastName: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setError(t("errors.fillFields"));
      return;
    }
    if (form.password.length < 8) {
      setError(t("errors.passwordTooShort"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
      });
      navigate("/applicant");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as Record<string, unknown> | undefined;
        const firstError = (val: unknown): string =>
          Array.isArray(val) ? String(val[0]) : typeof val === "string" ? val : "";
        const emailErr = firstError(data?.email);
        const passwordErr = firstError(data?.password);

        if (emailErr.includes("exist") || emailErr.includes("already")) {
          setError(t("errors.accountExists"));
        } else if (emailErr) {
          setError(emailErr);
        } else if (passwordErr) {
          setError(passwordErr);
        } else if (err.response) {
          setError(t("errors.generic"));
        } else {
          setError(t("errors.network"));
        }
      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
      <div className="flex bg-white" style={{ width: 1170, height: 550 }}>
        {/* Left: Form */}
        <div
          className="flex flex-col justify-center gap-10"
          style={{ width: 585, flexShrink: 0, padding: "20px 90px" }}
        >
          <div className="flex flex-col gap-5">
            <h1 className="text-3xl font-bold text-gray-900">{t("auth.signUp")}</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-md font-medium text-[#111928]">
                  {t("auth.email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("placeholders.email")}
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#9CA3AF] rounded-lg text-md text-[#111928] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* First Name + Last Name */}
              <div className="flex flex-row gap-3">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="firstName" className="text-md font-medium text-[#111928]">
                    {t("auth.firstName")}
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder={t("placeholders.firstName")}
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#9CA3AF] rounded-lg text-md text-[#111928] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="lastName" className="text-md font-medium text-[#111928]">
                    {t("auth.lastName")}
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder={t("placeholders.lastName")}
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#9CA3AF] rounded-lg text-md text-[#111928] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-md font-medium text-[#111928]">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={t("placeholders.createPassword")}
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-11 border border-[#9CA3AF] rounded-lg text-md text-[#111928] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 py-2 px-3">
                  <IoWarningOutline className="text-sm text-red-500" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full py-3 px-7 rounded-lg bg-[#3356AA] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-md transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? t("auth.signingUp") : t("auth.signUp")}
              </button>

              {/* Footer */}
              <p className="text-center text-md text-gray-500">
                {t("auth.haveAccount")}{" "}
                <Link to="/auth/login" className="text-[#3356AA] font-medium hover:text-blue-700 transition">
                  {t("auth.signIn")}
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right: Decorative panel */}
        <div className="flex relative bg-[#3356AA] overflow-hidden items-end p-15 w-[585px]">
          <div className="absolute -top-35 -left-24 w-[495px] h-[495px] rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.16) 18%, rgba(255,255,255,0) 100%)" }} />
          <div className="absolute top-0 -left-40 w-[354px] h-[354px] rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.2) 18%, rgba(255,255,255,0) 100%)" }} />
          <div className="absolute bottom-12 right-14 w-[85px] h-[85px] rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.16) 18%, rgba(255,255,255,0) 100%)" }} />
          <p className="relative z-10 text-white text-[28px] font-bold leading-snug whitespace-pre-line">
            {t("auth.newHere")}
          </p>
        </div>
      </div>
    </div>
  );
}
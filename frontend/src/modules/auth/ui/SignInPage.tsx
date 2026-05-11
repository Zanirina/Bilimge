import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiUser } from "react-icons/ci";
import { IoEyeOutline, IoEyeOffOutline, IoWarningOutline } from "react-icons/io5";
import { useAuthStore } from "../model/authStore";
import { useTranslation } from "react-i18next";

interface SignInFormData {
  email: string;
  password: string;
}

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? <IoEyeOffOutline /> : <IoEyeOutline />;

export default function SignInPage() {
  const [form, setForm] = useState<SignInFormData>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await login(form.email, form.password);
      if (user) {
        navigate(getDefaultRoute(user.role));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("not exist") || msg.includes("not found")) {
        setError("Account does not exist.");
      } else {
        setError("Invalid email or password.");
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
          style={{ width: 585, flexShrink: 0, padding: "0 85px" }}
        >
          <div className="flex flex-col gap-10">
            <h1 className="text-3xl font-bold text-gray-900">{t("auth.signIn")}</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-md font-medium text-[#111928]">
                  {t("auth.email")}
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t("placeholders.email")}
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-11 border border-[#9CA3AF] rounded-lg text-md text-[#111928] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <CiUser />
                  </span>
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
                    autoComplete="current-password"
                    placeholder={t("placeholders.password")}
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
                {loading ? t("auth.signingIn") : t("auth.signIn")}
              </button>
            </form>
          </div>

          {/* Footer links */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/auth/password" className="hover:text-gray-800 transition">
              {t("auth.forgotPassword")}
            </Link>
            <span>
              {t("auth.noAccount")}{" "}
              <Link to="/auth/register" className="text-[#3356AA] font-medium hover:text-blue-700 transition">
                {t("auth.signUp")}
              </Link>
            </span>
          </div>
        </div>

        {/* Right: Decorative panel */}
        <div className="flex relative bg-[#3356AA] overflow-hidden items-end p-15 w-[585px]">
          <div className="absolute -top-35 -left-24 w-[495px] h-[495px] rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.16) 18%, rgba(255,255,255,0) 100%)" }} />
          <div className="absolute top-0 -left-40 w-[354px] h-[354px] rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.2) 18%, rgba(255,255,255,0) 100%)" }} />
          <div className="absolute bottom-12 right-14 w-[85px] h-[85px] rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.16) 18%, rgba(255,255,255,0) 100%)" }} />
          <p className="relative z-10 text-white text-[28px] font-bold leading-snug">
            {t("auth.welcomeBack")}
          </p>
        </div>
      </div>
    </div>
  );
}

function getDefaultRoute(role: string): string {
  switch (role) {
    case "UNI_ADMIN": return "/uni/dashboard";
    case "NTC_ADMIN": return "/ntc/dashboard";
    case "SUPER_ADMIN": return "/admin";
    default: return "/applicant/dashboard";
  }
}
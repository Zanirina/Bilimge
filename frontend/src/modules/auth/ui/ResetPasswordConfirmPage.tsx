import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline, IoWarningOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { authService } from "../api/authService";
import { useTranslation } from "react-i18next";

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? <IoEyeOffOutline /> : <IoEyeOutline />;

export default function ResetPasswordConfirmPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-xl text-center max-w-sm">
          <p className="text-red-500 font-medium mb-4">{t("auth.invalidResetLink")}</p>
          <Link to="/auth/password" className="text-[#3356AA] hover:underline text-sm">
            {t("auth.requestNewLink")}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!password || !repeatPassword) {
      setError(t("errors.fillFields"));
      return;
    }
    if (password.length < 8) {
      setError(t("errors.passwordTooShort"));
      return;
    }
    if (password !== repeatPassword) {
      setError(t("errors.passwordsDoNotMatch"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.resetPasswordConfirm({ token, password });
      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("expired") || msg.includes("invalid")) {
        setError(t("errors.resetLinkExpired"));
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
          style={{ width: 585, flexShrink: 0, padding: "0 85px" }}
        >
          {done ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <IoCheckmarkCircleOutline className="text-4xl text-green-500 flex-shrink-0" />
                <h1 className="text-3xl font-bold text-gray-900">{t("auth.passwordUpdated")}</h1>
              </div>
              <p className="text-gray-600 text-md">
                {t("auth.passwordResetSuccess")}
              </p>
              <button
                onClick={() => navigate("/auth/login")}
                className="w-full py-3 px-7 rounded-lg bg-[#3356AA] hover:bg-blue-700 text-white font-medium text-md transition"
              >
                {t("auth.goToSignIn")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              <h1 className="text-3xl font-bold text-gray-900">{t("auth.setNewPassword")}</h1>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-md font-medium text-[#111928]">
                    {t("auth.newPassword")}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={t("placeholders.newPassword")}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                      className="w-full px-4 py-3 pr-11 border border-[#9CA3AF] rounded-lg text-md text-[#111928] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {/* Repeat Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="repeatPassword" className="text-md font-medium text-[#111928]">
                    {t("auth.repeatPassword")}
                  </label>
                  <div className="relative">
                    <input
                      id="repeatPassword"
                      name="repeatPassword"
                      type={showRepeat ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={t("placeholders.repeatPassword")}
                      value={repeatPassword}
                      onChange={(e) => { setRepeatPassword(e.target.value); if (error) setError(null); }}
                      className="w-full px-4 py-3 pr-11 border border-[#9CA3AF] rounded-lg text-md text-[#111928] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRepeat((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      <EyeIcon open={showRepeat} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 py-2 px-3">
                    <IoWarningOutline className="text-sm text-red-500" />
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full py-3 px-7 rounded-lg bg-[#3356AA] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-md transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? t("auth.resetting") : t("auth.resetPassword")}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right: Decorative panel */}
        <div className="flex relative bg-[#3356AA] overflow-hidden items-end p-15 w-[585px]">
          <div className="absolute -top-35 -left-24 w-[495px] h-[495px] rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.16) 18%, rgba(255,255,255,0) 100%)" }} />
          <div className="absolute top-0 -left-40 w-[354px] h-[354px] rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.2) 18%, rgba(255,255,255,0) 100%)" }} />
          <div className="absolute bottom-12 right-14 w-[85px] h-[85px] rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.16) 18%, rgba(255,255,255,0) 100%)" }} />
          <p className="relative z-10 text-white text-[28px] font-bold leading-snug whitespace-pre-line">
            {t("auth.welcomeBack")}
          </p>
        </div>
      </div>
    </div>
  );
}

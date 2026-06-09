import { useState } from "react";
import { Link } from "react-router-dom";
import { CiUser } from "react-icons/ci";
import { IoWarningOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const { t } = useTranslation();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t("errors.fillFields"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { authService } = await import("../api/authService");
      await authService.resetPassword({ email });
      setSent(true);
    } catch {
      setError(t("errors.generic"));
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
          {sent ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <IoCheckmarkCircleOutline className="text-4xl text-green-500 flex-shrink-0" />
                <h1 className="text-3xl font-bold text-gray-900">{t("auth.checkInbox")}</h1>
              </div>
              <p className="text-gray-600 text-md leading-relaxed">
                {t("auth.resetSentMessage", { email })}
              </p>
              <Link
                to="/auth/login"
                className="inline-block text-center w-full py-3 px-7 rounded-lg bg-[#3356AA] hover:bg-blue-700 text-white font-medium text-md transition"
              >
                {t("auth.backToSignIn")}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900">{t("auth.forgotPassword")}</h1>
                <p className="text-gray-500 text-sm">
                  {t("auth.forgotPasswordSubtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full px-4 py-3 pr-11 border border-[#9CA3AF] rounded-lg text-md text-[#111928] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <CiUser />
                    </span>
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
                  {loading ? t("auth.sending") : t("auth.sendResetLink")}
                </button>

                <p className="text-center text-sm text-gray-500">
                  {t("auth.rememberedPassword")}{" "}
                  <Link to="/auth/login" className="text-[#3356AA] font-medium hover:text-blue-700 transition">
                    {t("auth.signIn")}
                  </Link>
                </p>
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

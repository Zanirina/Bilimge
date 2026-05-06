import { useState } from "react";
import { CiUser } from "react-icons/ci";
import { IoEyeOutline, IoEyeOffOutline, IoWarningOutline } from "react-icons/io5";

interface ResetPasswordFormData {
  email: string;
  password: string;
  repeatPassword: string;
}

interface ResetPasswordProps {
  onResetPassword?: (data: ResetPasswordFormData) => Promise<void>;
}

export default function ResetPasswordPage({ onResetPassword }: ResetPasswordProps) {
  const [form, setForm] = useState<ResetPasswordFormData>({ email: "", password: "", repeatPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, repeatPassword } = form;

    if (!email || !password || !repeatPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onResetPassword?.(form);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("expired") || msg.includes("invalid token")) {
        setError("Reset link has expired. Please request a new one.");
      } else {
        setError("Something went wrong. Please try again.");
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
          style={{ width: 585, flexShrink: 0, padding: "0 90px" }}
        >
          <div className="flex flex-col gap-10">
            <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-md font-medium text-[#111928]">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-11 border border-[#9CA3AF] rounded-lg text-md text-[#111928] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <CiUser />
                  </span>
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-md font-medium text-[#111928]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="New password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-11 border border-[#9CA3AF] rounded-lg text-md text-[#111928] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
              </div>

              {/* Repeat Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="repeatPassword" className="text-md font-medium text-[#111928]">
                  Repeat Password
                </label>
                <div className="relative">
                  <input
                    id="repeatPassword"
                    name="repeatPassword"
                    type={showRepeatPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat new password"
                    value={form.repeatPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-11 border border-[#9CA3AF] rounded-lg text-md text-[#111928] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    aria-label={showRepeatPassword ? "Hide password" : "Show password"}
                  >
                    {showRepeatPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
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

              {/* FIX 3: correct button label */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full py-3 px-7 rounded-lg bg-[#3356AA] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-md transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Decorative panel */}
        <div className="flex relative bg-[#3356AA] overflow-hidden items-end p-15 w-[585px]">
          <div className="absolute -top-35 -left-24 w-[495px] h-[495px] rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.16) 18%, rgba(255,255,255,0) 100%)" }} />
          <div className="absolute top-0 -left-40 w-[354px] h-[354px] rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.2) 18%, rgba(255,255,255,0) 100%)" }} />
          <div className="absolute bottom-12 right-14 w-[85px] h-[85px] rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.16) 18%, rgba(255,255,255,0) 100%)" }} />
          <p className="relative z-10 text-white text-[28px] font-bold leading-snug">
            Hey,<br />welcome back to Bilimge!
          </p>
        </div>

      </div>
    </div>
  );
}
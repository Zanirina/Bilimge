import { useState } from "react";
import { Link } from "react-router-dom";
import { CiUser } from "react-icons/ci";
import { IoEyeOutline, IoEyeOffOutline, IoWarningOutline } from "react-icons/io5";

interface SignInFormData {
  email: string;
  password: string;
}

interface SignInProps {
  onSignIn?: (data: SignInFormData) => Promise<void>;
}

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <IoEyeOffOutline />
  ) : (
    <IoEyeOutline />
  );

export default function SignInPage({
  onSignIn,
}: SignInProps) {
  const [form, setForm] = useState<SignInFormData>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await onSignIn?.(form);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("not exist") || msg.includes("not found")) {
        setError("Account does not exist.");
      } else {
        setError("Invalid email or password.");
      }
    }
    finally {
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
            <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>

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

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-md font-medium text-[#111928]">
                  Your Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
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
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>

          {/* Footer links */}
          <div className="flex items-center gap-6 text-md text-gray-500">
            <button
              type="button"
              className="hover:text-gray-800 transition"
            >
              <Link to="/auth/password">Forget Password?</Link>
            </button>
            <span>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="text-[#3356AA] font-medium hover:text-blue-700 transition"
              >
                <Link to="/auth/register">Sign Up</Link>
              </button>
            </span>
          </div>
        </div>

        {/* Right: Decorative panel */}
        <div className="flex relative bg-[#3356AA] overflow-hidden items-end p-15 w-[585px]">
          {/* Decorative circles */}
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
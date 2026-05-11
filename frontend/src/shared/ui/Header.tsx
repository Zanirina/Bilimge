import { NavLink, Link } from "react-router-dom";
import { useAuthStore } from "../../modules/auth/model/authStore";
import { IoIosLogOut } from "react-icons/io";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const navItems = [
  { labelKey: "nav.universities", path: "/universities" },
  { labelKey: "nav.majors", path: "/majors" },
  { labelKey: "nav.exams", path: "/exams" },
  { labelKey: "nav.aiAssistant", path: "/chatbot" },
];

function Avatar({ email, name }: { email: string; name: string }) {
  const safeName = name?.trim() ?? "";
  const safeEmail = email?.trim() ?? "";
  const initials = safeName
    ? safeName.split(" ").filter(Boolean).map((n) => n[0] ?? "").join("").toUpperCase().slice(0, 2)
    : safeEmail ? safeEmail[0].toUpperCase() : "?";

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#3356AA] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
        {initials}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-[#111928]">{safeName || safeEmail}</span>
        <span className="text-xs text-gray-500">{safeEmail}</span>
      </div>
    </div>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAuth = useAuthStore((s) => s.isAuth);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);

  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link to="/" className="text-[30px] font-bold tracking-tight leading-none">
          <span className="text-[#3a4d8f]">bilim</span>
          <span className="text-[#f15a29]">ge</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-[#111928]" : "text-gray-700 hover:text-[#27315f]"
                }`
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Auth */}
          {isLoading ? (
            <div className="w-24 h-8 bg-gray-100 rounded animate-pulse" />
          ) : isAuth && user ? (
            <>
              <Avatar email={user.email ?? ""} name={fullName} />
              <button
                onClick={logout}
                className="text-gray-500 hover:text-red-500 transition"
                title={t("auth.logout")}
              >
                <IoIosLogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="text-[#111928] font-medium text-sm">
                {t("auth.signIn")}
              </Link>
              <Link
                to="/auth/register"
                className="rounded-md bg-[#3356AA] px-5 py-2 text-white font-medium text-sm hover:bg-[#2a386b] transition"
              >
                {t("auth.signUp")}
              </Link>
            </>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
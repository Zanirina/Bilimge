import { NavLink, Link } from "react-router-dom";

const navItems = [
  { label: "Universities", path: "/universities" },
  { label: "Majors", path: "/majors" },
  { label: "Exams", path: "/exams" },
  { label: "Preparation", path: "/preparation" },
  { label: "AI Assistant", path: "/chatbot" },
];

export default function Header() {
  return (
    <header className="w-full bg-white ">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link to="/" className="text-[30px] font-bold tracking-tight text-primary leading-none" >
          <span className="text-[#3a4d8f]">bilim</span>
          <span className="text-[#f15a29]">ge</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive
                  ? "text-[#111928]"
                  : "text-gray-700 hover:text-[#27315f]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link to="/auth/login" className="text-[#111928] font-medium text-sm">
            Log In
          </Link>
          <Link
            to="/auth/register"
            className="rounded-md bg-[#3356AA] px-5 py-2 text-white font-medium text-sm hover:bg-[#2a386b] transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
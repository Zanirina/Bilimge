import { NavLink, Link } from "react-router-dom";
import { useAuthStore } from "../../modules/auth/model/authStore";

export interface SidebarItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

interface SidebarProps {
  items: SidebarItem[];
  userSubtitle?: string; // ← e.g. university name
}

function Avatar({ email, name, subtitle }: { email: string; name: string; subtitle?: string }) {
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
        {subtitle && (
          <span className="text-xs text-gray-500">{subtitle}</span> // ← university name
        )}
        <span className="text-xs text-gray-400">{safeEmail}</span>
      </div>
    </div>
  );
}

export default function Sidebar({ items, userSubtitle }: SidebarProps) {
  const user = useAuthStore((s) => s.user);
  const fullName = `${user?.first_name ?? "Name"} ${user?.last_name ?? "Surname"}`.trim();

  return (
    <aside className="w-[260px] flex-shrink-0 bg-white flex flex-col justify-between py-8 px-6 shadow-sm">
      <div>
        <Link to="/" className="text-[28px] font-bold tracking-tight leading-none mb-10 block">
          <span className="text-[#3a4d8f]">bilim</span>
          <span className="text-[#f15a29]">ge</span>
        </Link>

        <nav className="flex flex-col gap-1 mt-8">
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? "bg-[#EEF2FF] text-[#3356AA]"
                  : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111928]"
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {user && (
        <Avatar
          email={user.email ?? ""}
          name={fullName}
          subtitle={userSubtitle}
        />
      )}
    </aside>
  );
}
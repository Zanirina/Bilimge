import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../modules/auth/model/authStore";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";

export interface SidebarItem {
  label: string;
  path: string;
  icon: React.ElementType;
  children?: Omit<SidebarItem, "children">[];
}

interface SidebarProps {
  items: SidebarItem[];
  userSubtitle?: string;
}

function Avatar({
  email,
  name,
  subtitle,
  collapsed,
}: {
  email: string;
  name: string;
  subtitle?: string;
  collapsed: boolean;
}) {
  const safeName = name?.trim() ?? "";
  const safeEmail = email?.trim() ?? "";
  const initials = safeName
    ? safeName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0] ?? "")
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : safeEmail
    ? safeEmail[0].toUpperCase()
    : "?";

  return (
    <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
      <div className="w-9 h-9 rounded-full bg-[#3356AA] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
        {initials}
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-tight overflow-hidden">
          <span className="text-sm font-semibold text-[#111928] truncate">
            {safeName || safeEmail}
          </span>
          {subtitle && (
            <span className="text-xs text-gray-500 truncate">{subtitle}</span>
          )}
          <span className="text-xs text-gray-400 truncate">{safeEmail}</span>
        </div>
      )}
    </div>
  );
}

function NavItemComponent({
  item,
  collapsed,
}: {
  item: SidebarItem;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-[#6B7280] hover:bg-gray-50 hover:text-[#111928] ${
            collapsed ? "justify-center" : "justify-between"
          }`}
          title={collapsed ? item.label : undefined}
        >
          <div className="flex items-center gap-3">
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </div>
          {!collapsed &&
            (open ? (
              <MdKeyboardArrowDown size={18} />
            ) : (
              <MdKeyboardArrowRight size={18} />
            ))}
        </button>

        {open && !collapsed && (
          <div className="ml-5 border-l border-gray-100 pl-2 flex flex-col gap-0.5 mt-0.5 mb-0.5">
            {item.children!.map((child) => {
              const ChildIcon = child.icon;
              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "text-[#3356AA] font-medium bg-[#EEF2FF]"
                        : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111928]"
                    }`
                  }
                >
                  <ChildIcon size={16} className="flex-shrink-0" />
                  {child.label}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-[#EEF2FF] text-[#3356AA]"
            : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111928]"
        } ${collapsed ? "justify-center" : ""}`
      }
      title={collapsed ? item.label : undefined}
    >
      <Icon size={20} className="flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ items, userSubtitle }: SidebarProps) {
  const user = useAuthStore((s) => s.user);
  const fullName = `${user?.first_name ?? "Name"} ${user?.last_name ?? "Surname"}`.trim();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-[72px]" : "w-[260px]"
      } flex-shrink-0 bg-white flex flex-col justify-between py-6 shadow-sm transition-[width] duration-200 overflow-hidden`}
    >
      <div className="flex flex-col min-h-0">
        {/* Logo — clicking toggles collapse */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`flex items-center mb-6 px-4 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? (
            <span className="text-[22px] font-extrabold tracking-tight leading-none select-none">
              <span className="text-[#3356AA]">b</span>
              <span className="text-[#E95C4B]">g</span>
            </span>
          ) : (
            <span className="text-[24px] font-bold tracking-tight leading-none select-none">
              <span className="text-[#3356AA]">bilim</span>
              <span className="text-[#E95C4B]">ge</span>
            </span>
          )}
        </button>

        <nav className="flex flex-col gap-0.5 px-3 overflow-y-auto">
          {items.map((item) => (
            <NavItemComponent key={item.path} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </div>
    </aside>
  );
}

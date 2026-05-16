import { useNavigate } from "react-router-dom";
import { MdLocationOn, MdSchool, MdAttachMoney } from "react-icons/md";

export interface UniversityCardProps {
  id: string;
  image: string | null;
  name: string;
  shortName?: string;
  city: string;
  programs: string[];
  programCount?: number;
  passingScore: string;
  tuitionCost?: number | null;
  basePath?: string;
}

function fmtMoney(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₸";
}

export default function UniversityCard({
  id,
  image,
  name,
  shortName,
  city,
  programs,
  programCount,
  passingScore,
  tuitionCost,
  basePath = "/universities",
}: UniversityCardProps) {
  const navigate = useNavigate();
  const total = programCount ?? programs.length;
  const visible = programs.slice(0, 3);
  const extra = Math.max(0, total - visible.length);

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer flex flex-col"
      onClick={() => navigate(`${basePath}/${id}`)}
    >
      {/* Cover */}
      <div className="relative w-full h-[160px] bg-gradient-to-br from-[#3356AA] to-[#5571c5] flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl font-bold text-white/40">{initials}</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-[#111928] mb-1 line-clamp-2 min-h-[3rem]">
          {shortName ? `${name} (${shortName})` : name}
        </h3>
        <p className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MdLocationOn size={14} />
          {city}
        </p>

        {/* Majors / Programs */}
        <div className="mb-4 min-h-[3.5rem]">
          <p className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
            <MdSchool size={12} /> Majors offered
          </p>
          {visible.length === 0 ? (
            <p className="text-xs text-gray-400">No majors listed.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {visible.map((p, i) => (
                <span
                  key={i}
                  className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-md truncate max-w-[180px]"
                  title={p}
                >
                  {p}
                </span>
              ))}
              {extra > 0 && (
                <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-md">
                  +{extra} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">UNT</p>
            <p className="text-sm font-semibold text-gray-900">{passingScore || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center justify-end gap-0.5">
              <MdAttachMoney size={12} /> Tuition
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {tuitionCost ? fmtMoney(tuitionCost) : "—"}
            </p>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`${basePath}/${id}`);
          }}
          className="mt-4 w-full py-2 text-white font-semibold text-sm bg-[#3356AA] rounded-md hover:bg-[#2c4892] transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

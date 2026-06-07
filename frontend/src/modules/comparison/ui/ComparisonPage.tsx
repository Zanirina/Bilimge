import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { universityService } from "../../universities/api/universityService";
import type { University, UniversityListItem } from "../../universities/model/types";
import { HiOutlinePlus, HiOutlineX } from "react-icons/hi";
import {
  MdLocationOn,
  MdCalendarToday,
  MdCheck,
  MdClose,
  MdArrowForward,
  MdRefresh,
} from "react-icons/md";
import { TbBuildingSkyscraper } from "react-icons/tb";

const MAX_UNIS = 3;

// ─── Color palette for university chips ──────────────────────────────────────
const UNI_COLORS = [
  { bg: "#FFE5DE", text: "#E85842" }, // orange
  { bg: "#DDE7FF", text: "#3356AA" }, // blue
  { bg: "#EADDFF", text: "#7C3AED" }, // purple
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter((w) => /[a-zа-я]/i.test(w))
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 4);
}

function fmtMoney(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M ₸/yr`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K ₸/yr`;
  return `${n.toLocaleString("ru-RU")} ₸/yr`;
}

function programCount(u: University) {
  return (u.programs_by_field ?? []).reduce(
    (s, f) => s + (f.programs?.length ?? 0),
    0
  );
}

function minProgramCost(u: University) {
  const costs = (u.programs_by_field ?? [])
    .flatMap((f) => (f.programs ?? []).map((p) => p.cost))
    .filter((c): c is number => typeof c === "number" && c > 0);
  if (!costs.length) return null;
  return Math.min(...costs);
}

function partnerCountries(u: University) {
  return [...new Set((u.academic_mobility ?? []).map((m) => m.country))];
}

// ─── Row definitions ─────────────────────────────────────────────────────────

type Direction = "high" | "low" | "none";

type RowDef = {
  label: string;
  icon?: React.ReactNode;
  /** Numeric (or null) value used to pick the "best" cell. */
  value: (u: University) => number | null;
  /** Rendered display in the cell. */
  render: (u: University) => React.ReactNode;
  direction?: Direction;
};

type SectionDef = {
  name: string;
  rows: RowDef[];
};

const I = {
  pin: <MdLocationOn size={14} />,
  cal: <MdCalendarToday size={13} />,
};

const SECTIONS: SectionDef[] = [
  {
    name: "Overview",
    rows: [
      {
        label: "City",
        value: () => null,
        render: (u) => u.city || "—",
      },
      {
        label: "Founded",
        value: (u) => u.year_established ?? null,
        render: (u) => u.year_established || "—",
        direction: "low",
      },
      {
        label: "Website",
        value: () => null,
        render: (u) =>
          u.website ? (
            <a
              href={u.website}
              target="_blank"
              rel="noreferrer"
              className="text-[#3356AA] hover:underline text-xs break-all"
            >
              {u.website.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            "—"
          ),
      },
    ],
  },
  {
    name: "Admissions",
    rows: [
      {
        label: "UNT minimum",
        value: (u) => u.passing_score ?? null,
        render: (u) => (
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-[#3356AA]">
              {u.passing_score ?? "—"}
            </span>
            {u.passing_score && (
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
                <div
                  className="h-full bg-[#3356AA] rounded-full"
                  style={{
                    width: `${Math.min(100, (u.passing_score / 140) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        ),
        direction: "low",
      },
      {
        label: "Entrance requirements",
        value: (u) => u.entrance_requirements?.length ?? null,
        render: (u) => u.entrance_requirements?.length ?? "—",
        direction: "none",
      },
      {
        label: "Entrance exams",
        value: (u) => u.entrance_exams?.length ?? null,
        render: (u) => u.entrance_exams?.length ?? "—",
        direction: "none",
      },
      {
        label: "Languages",
        value: (u) => u.teaching_languages?.length ?? null,
        render: (u) =>
          u.teaching_languages?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {u.teaching_languages.map((l) => (
                <span
                  key={l}
                  className="px-2 py-0.5 bg-[#EEF2FF] text-[#3356AA] text-xs font-medium rounded-full"
                >
                  {l.slice(0, 2).toUpperCase()}
                </span>
              ))}
            </div>
          ) : (
            "—"
          ),
        direction: "high",
      },
    ],
  },
  {
    name: "Costs",
    rows: [
      {
        label: "Annual tuition",
        value: (u) => u.tuition_cost ?? null,
        render: (u) => (
          <span className="text-base font-bold text-gray-900">
            {fmtMoney(u.tuition_cost)}
          </span>
        ),
        direction: "low",
      },
      {
        label: "Cheapest program",
        value: (u) => minProgramCost(u),
        render: (u) => {
          const c = minProgramCost(u);
          return c == null ? "—" : <span className="font-semibold">{fmtMoney(c)}</span>;
        },
        direction: "low",
      },
    ],
  },
  {
    name: "Academics",
    rows: [
      {
        label: "Programmes",
        value: (u) => programCount(u),
        render: (u) => (
          <span className="text-base font-bold text-gray-900">{programCount(u)}</span>
        ),
        direction: "high",
      },
      {
        label: "Fields of study",
        value: (u) => u.programs_by_field?.length ?? null,
        render: (u) => u.programs_by_field?.length ?? "—",
        direction: "high",
      },
      {
        label: "Accreditations",
        value: (u) => u.accreditations?.length ?? null,
        render: (u) =>
          u.accreditations?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {u.accreditations.map((a) => (
                <span
                  key={a.id}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md"
                  title={a.issued_by}
                >
                  {a.name}
                </span>
              ))}
            </div>
          ) : (
            "—"
          ),
        direction: "high",
      },
    ],
  },
  {
    name: "International",
    rows: [
      {
        label: "Partner universities",
        value: (u) => u.academic_mobility?.length ?? null,
        render: (u) => u.academic_mobility?.length ?? "—",
        direction: "high",
      },
      {
        label: "Countries",
        value: (u) => partnerCountries(u).length,
        render: (u) => {
          const c = partnerCountries(u);
          return c.length ? c.join(", ") : "—";
        },
        direction: "high",
      },
    ],
  },
  {
    name: "Campus life",
    rows: [
      {
        label: "Dormitory",
        value: (u) => (u.has_dormitory ? 1 : 0),
        render: (u) =>
          u.has_dormitory ? (
            <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
              <MdCheck size={16} /> Yes
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-400 text-sm">
              <MdClose size={16} /> No
            </span>
          ),
        direction: "high",
      },
      {
        label: "Military department",
        value: (u) => (u.has_military_department ? 1 : 0),
        render: (u) =>
          u.has_military_department ? (
            <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
              <MdCheck size={16} /> Yes
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-400 text-sm">
              <MdClose size={16} /> No
            </span>
          ),
        direction: "high",
      },
    ],
  },
];

// ─── Picker ──────────────────────────────────────────────────────────────────
function UniPicker({
  allUniversities,
  selectedCodes,
  onAdd,
  variant = "primary",
}: {
  allUniversities: UniversityListItem[];
  selectedCodes: Set<string>;
  onAdd: (code: string) => void;
  variant?: "primary" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = allUniversities.filter(
    (u) =>
      !selectedCodes.has(String(u.code)) &&
      u.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          variant === "primary"
            ? "flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3356AA] text-white text-sm font-medium hover:bg-[#2c4892] transition-colors"
            : "flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        }
      >
        <HiOutlinePlus size={16} /> Add university
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl z-30">
          <div className="p-3 border-b border-gray-100">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search universities…"
              className="w-full text-sm outline-none text-[#111928] placeholder-gray-400"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">No results</li>
            ) : (
              filtered.map((u) => (
                <li key={u.code}>
                  <button
                    onClick={() => {
                      onAdd(String(u.code));
                      setQuery("");
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.city}</p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Per-university header card ──────────────────────────────────────────────
function UniHeaderCard({
  university,
  index,
  onRemove,
}: {
  university: University;
  index: number;
  onRemove: () => void;
}) {
  const color = UNI_COLORS[index % UNI_COLORS.length];
  return (
    <div className="flex flex-col items-center text-center px-3">
      <div className="relative mb-3">
        {university.logo_url ? (
          <img
            src={university.logo_url}
            alt={university.name}
            className="w-16 h-16 rounded-2xl object-cover bg-white"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg"
            style={{ background: color.bg, color: color.text }}
          >
            {initialsOf(university.short_name || university.name)}
          </div>
        )}
        <button
          onClick={onRemove}
          aria-label="Remove"
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm"
        >
          <HiOutlineX size={12} />
        </button>
      </div>
      <p className="font-semibold text-gray-900 leading-snug">
        {university.short_name || university.name}
      </p>
      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
        {I.pin} {university.city || "—"}
        {university.year_established && (
          <>
            <span className="text-gray-300 mx-1">·</span>
            {I.cal} Est. {university.year_established}
          </>
        )}
      </p>
    </div>
  );
}

// ─── Programmes overlap card ─────────────────────────────────────────────────
function ProgrammesOverlap({ universities }: { universities: University[] }) {
  const fieldsByUni = universities.map((u) =>
    new Set((u.programs_by_field ?? []).map((f) => f.name))
  );
  const allFields = new Set<string>(fieldsByUni.flatMap((s) => [...s]));
  const sharedByAll = [...allFields].filter((f) =>
    fieldsByUni.every((s) => s.has(f))
  );
  const uniqueLists = universities.map((_, i) => {
    const others = fieldsByUni.filter((__, j) => j !== i);
    return [...fieldsByUni[i]].filter((f) => !others.some((o) => o.has(f)));
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Programmes overlap</h2>
        <p className="text-sm text-gray-500 mt-1">
          {sharedByAll.length} field{sharedByAll.length === 1 ? "" : "s"} offered by all{" "}
          {universities.length} universities
        </p>
      </div>

      {sharedByAll.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Offered by all
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sharedByAll.map((f) => (
              <span
                key={f}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium"
              >
                <MdCheck size={12} /> {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {universities.map((u, i) => {
          const color = UNI_COLORS[i % UNI_COLORS.length];
          const uniq = uniqueLists[i];
          return (
            <div
              key={u.code}
              className="border border-gray-100 rounded-xl p-4 bg-gray-50/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: color.bg, color: color.text }}
                >
                  {initialsOf(u.short_name || u.name)}
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  Only at {u.short_name || u.name}
                </p>
              </div>
              {uniq.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No fields unique to this university.
                </p>
              ) : (
                <ul className="space-y-1">
                  {uniq.map((f) => (
                    <li
                      key={f}
                      className="text-sm text-gray-700 bg-white rounded-md px-3 py-1.5 border border-gray-100"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Why pick each one card ──────────────────────────────────────────────────
function WhyPickEach({ universities }: { universities: University[] }) {
  type Reason = string;
  const reasons: Reason[][] = universities.map(() => []);

  function award(check: (u: University) => number | null, label: (u: University) => string, direction: "high" | "low") {
    const vals = universities.map((u) => check(u));
    const numeric = vals.filter((v): v is number => v != null);
    if (!numeric.length) return;
    const best = direction === "high" ? Math.max(...numeric) : Math.min(...numeric);
    vals.forEach((v, i) => {
      if (v === best) reasons[i].push(label(universities[i]));
    });
  }

  award(
    (u) => u.tuition_cost ?? null,
    () => "Lowest annual tuition",
    "low"
  );
  award(
    (u) => programCount(u) || null,
    (u) => `Largest catalogue (${programCount(u)} programs)`,
    "high"
  );
  award(
    (u) => u.passing_score ?? null,
    () => "Most accessible (lowest UNT minimum)",
    "low"
  );
  award(
    (u) => u.teaching_languages?.length || null,
    () => "Most languages of instruction",
    "high"
  );
  award(
    (u) => u.academic_mobility?.length || null,
    () => "Most international partners",
    "high"
  );
  award(
    (u) => u.accreditations?.length || null,
    () => "Most accreditations",
    "high"
  );
  award(
    (u) => u.year_established ?? null,
    () => "Oldest, most established",
    "low"
  );

  // Per-university facility badges
  universities.forEach((u, i) => {
    if (u.has_dormitory) reasons[i].push("On-campus dormitory");
    if (u.has_military_department) reasons[i].push("Military department available");
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Why pick each one</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {universities.map((u, i) => {
          const color = UNI_COLORS[i % UNI_COLORS.length];
          const list = reasons[i];
          return (
            <div
              key={u.code}
              className="border border-gray-100 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: color.bg, color: color.text }}
                >
                  {initialsOf(u.short_name || u.name)}
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {u.short_name || u.name}
                </p>
              </div>
              {list.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No standout metrics yet — add more data.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {list.map((r) => (
                    <li
                      key={r}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <MdCheck className="text-emerald-500 flex-shrink-0 mt-0.5" size={14} />
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function ComparisonPage() {
  const [allUniversities, setAllUniversities] = useState<UniversityListItem[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    universityService.getUniversities().then((res) => setAllUniversities(res.data));
  }, []);

  async function addUniversity(code: string) {
    if (universities.length >= MAX_UNIS) return;
    if (universities.some((u) => String(u.code) === code)) return;
    setLoading((prev) => new Set(prev).add(code));
    try {
      const res = await universityService.getUniversityByCode(code);
      setUniversities((prev) => [...prev, res.data]);
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    }
  }

  function removeUniversity(code: string) {
    setUniversities((prev) => prev.filter((u) => String(u.code) !== code));
  }

  function reorderUniversities() {
    setUniversities((prev) => {
      if (prev.length < 2) return prev;
      // simple cyclic shift; reorders the columns for a fresh side-by-side view.
      return [...prev.slice(1), prev[0]];
    });
  }

  function resetAll() {
    setUniversities([]);
  }

  const selectedCodes = useMemo(
    () => new Set(universities.map((u) => String(u.code))),
    [universities]
  );
  const canAdd = universities.length < MAX_UNIS;

  // For each row, pick the index of the "best" cell.
  function bestIndexFor(row: RowDef): number | null {
    if (!row.direction || row.direction === "none") return null;
    const values = universities.map(row.value);
    const numeric = values.filter((v): v is number => v != null);
    if (!numeric.length) return null;
    const target = row.direction === "high" ? Math.max(...numeric) : Math.min(...numeric);
    const idx = values.findIndex((v) => v === target);
    // Only mark "best" if it's strictly better than the others.
    const allEqual = values.every((v) => v === target);
    return allEqual ? null : idx;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compare universities</h1>
            <p className="text-sm text-gray-500 mt-1">
              Side-by-side breakdown of{" "}
              <span className="font-semibold text-gray-700">
                {universities.length} universit{universities.length === 1 ? "y" : "ies"}
              </span>{" "}
              <span className="text-gray-300 mx-1">·</span>
              best result in each row is highlighted
            </p>
          </div>
          <div className="flex items-center gap-2">
            {universities.length >= 2 && (
              <button
                onClick={reorderUniversities}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <MdRefresh size={16} /> Reorder
              </button>
            )}
            {universities.length > 0 && (
              <button
                onClick={resetAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111928] text-white text-sm font-medium hover:bg-[#2c2c33] transition-colors"
              >
                Clear all <MdArrowForward size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {universities.length === 0 && loading.size === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
            <TbBuildingSkyscraper size={32} className="text-[#3356AA]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">No universities selected</p>
            <p className="text-sm text-gray-500 mt-1">
              Add up to {MAX_UNIS} universities to compare side by side.
            </p>
          </div>
          <UniPicker
            allUniversities={allUniversities}
            selectedCodes={selectedCodes}
            onAdd={addUniversity}
          />
        </div>
      ) : (
        <>
          {/* Comparison table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              {/* University header row */}
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-44 min-w-[160px] bg-gray-50/50 px-5 py-6 text-left align-bottom">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Comparing
                    </p>
                  </th>
                  {universities.map((u, i) => (
                    <th
                      key={u.code}
                      className="px-5 py-6 align-bottom min-w-[200px] border-l border-gray-100"
                    >
                      <UniHeaderCard
                        university={u}
                        index={i}
                        onRemove={() => removeUniversity(String(u.code))}
                      />
                    </th>
                  ))}
                  {canAdd &&
                    Array.from({ length: MAX_UNIS - universities.length }).map((_, i) => (
                      <th
                        key={`empty-${i}`}
                        className="px-5 py-6 min-w-[200px] align-middle border-l border-gray-100"
                      >
                        <UniPicker
                          allUniversities={allUniversities}
                          selectedCodes={selectedCodes}
                          onAdd={addUniversity}
                          variant="ghost"
                        />
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {SECTIONS.map((section) => (
                  <SectionRows
                    key={section.name}
                    section={section}
                    universities={universities}
                    empties={MAX_UNIS - universities.length}
                    canAdd={canAdd}
                    bestIndexFor={bestIndexFor}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom cards — only useful with 2+ universities */}
          {universities.length >= 2 && (
            <>
              <ProgrammesOverlap universities={universities} />
              <WhyPickEach universities={universities} />
            </>
          )}
        </>
      )}
    </div>
  );
}

function SectionRows({
  section,
  universities,
  empties,
  canAdd,
  bestIndexFor,
}: {
  section: SectionDef;
  universities: University[];
  empties: number;
  canAdd: boolean;
  bestIndexFor: (row: RowDef) => number | null;
}) {
  const totalCols = 1 + universities.length + (canAdd ? empties : 0);
  return (
    <>
      <tr className="bg-gray-50/70">
        <td
          colSpan={totalCols}
          className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider"
        >
          {section.name}
        </td>
      </tr>
      {section.rows.map((row) => {
        const bestIdx = bestIndexFor(row);
        return (
          <tr key={row.label} className="border-t border-gray-50">
            <td className="px-5 py-3.5 text-sm text-gray-500 bg-gray-50/30 whitespace-nowrap align-middle">
              {row.label}
            </td>
            {universities.map((u, i) => {
              const isBest = bestIdx === i;
              return (
                <td
                  key={u.code}
                  className={`px-5 py-3.5 align-middle border-l border-gray-50 ${
                    isBest ? "bg-emerald-50/50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm text-gray-800">{row.render(u)}</div>
                    {isBest && (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        <MdCheck size={10} /> Best
                      </span>
                    )}
                  </div>
                </td>
              );
            })}
            {canAdd &&
              Array.from({ length: empties }).map((_, i) => (
                <td
                  key={`empty-cell-${i}`}
                  className="px-5 py-3.5 border-l border-gray-50"
                />
              ))}
          </tr>
        );
      })}
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { universityService } from "../../universities/api/universityService";
import type { University, UniversityListItem } from "../../universities/model/types";
import { HiOutlinePlus, HiOutlineX } from "react-icons/hi";
import { TbBuildingSkyscraper } from "react-icons/tb";
import { MdOutlineCheckCircle, MdOutlineCancel } from "react-icons/md";

const MAX_UNIS = 4;

// ─── helpers ────────────────────────────────────────────────────────────────

function Yes() {
  return <MdOutlineCheckCircle size={20} className="text-green-500 mx-auto" />;
}
function No() {
  return <MdOutlineCancel size={20} className="text-gray-300 mx-auto" />;
}

// ─── Add-university picker ────────────────────────────────────────────────────
function UniPicker({
  allUniversities,
  selectedCodes,
  onAdd,
}: {
  allUniversities: UniversityListItem[];
  selectedCodes: Set<string>;
  onAdd: (code: string) => void;
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
      !selectedCodes.has(u.code) &&
      u.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3356AA] text-white text-sm font-medium hover:bg-[#2a4699] transition-colors"
      >
        <HiOutlinePlus size={16} />
        Add University
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl z-30">
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
                      onAdd(u.code);
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

// ─── Table row types ─────────────────────────────────────────────────────────

type RowDef = {
  label: string;
  render: (u: University) => React.ReactNode;
  section?: string;
};

const ROWS: RowDef[] = [
  // Overview
  { section: "Overview", label: "City", render: (u) => u.city || "—" },
  { label: "Year Founded", render: (u) => u.year_established || "—" },
  { label: "Phone", render: (u) => u.phone || "—" },
  { label: "Email", render: (u) => u.email || "—" },
  {
    label: "Website",
    render: (u) =>
      u.website ? (
        <a
          href={u.website}
          target="_blank"
          rel="noreferrer"
          className="text-[#3356AA] underline text-xs break-all"
        >
          {u.website.replace(/^https?:\/\//, "")}
        </a>
      ) : (
        "—"
      ),
  },
  // Admissions
  { section: "Admissions", label: "Passing Score", render: (u) => u.passing_score ?? "—" },
  {
    label: "Dormitory",
    render: (u) => (u.has_dormitory ? <Yes /> : <No />),
  },
  {
    label: "Military Dept.",
    render: (u) => (u.has_military_department ? <Yes /> : <No />),
  },
  // Languages
  {
    section: "Languages",
    label: "Teaching Languages",
    render: (u) =>
      u.teaching_languages?.length ? (
        <div className="flex flex-wrap gap-1 justify-center">
          {u.teaching_languages.map((l) => (
            <span
              key={l}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              {l}
            </span>
          ))}
        </div>
      ) : (
        "—"
      ),
  },
  // Programs
  {
    section: "Programs",
    label: "Total Programs",
    render: (u) =>
      u.programs_by_field?.reduce((sum, f) => sum + f.programs.length, 0) ?? "—",
  },
  {
    label: "Fields of Study",
    render: (u) =>
      u.programs_by_field?.length ? (
        <ul className="text-xs text-gray-600 space-y-0.5 text-left">
          {u.programs_by_field.map((f) => (
            <li key={f.code}>
              {f.name}{" "}
              <span className="text-gray-400">({f.programs.length})</span>
            </li>
          ))}
        </ul>
      ) : (
        "—"
      ),
  },
  {
    label: "Min. Program Cost",
    render: (u) => {
      const all = u.programs_by_field?.flatMap((f) => f.programs.map((p) => p.cost)) ?? [];
      if (!all.length) return "—";
      return `${Math.min(...all).toLocaleString()} ₸`;
    },
  },
  // Facilities
  {
    section: "Facilities",
    label: "Entrance Requirements",
    render: (u) =>
      u.entrance_requirements?.length ? (
        <ul className="text-xs text-gray-600 space-y-0.5 text-left list-disc list-inside">
          {u.entrance_requirements.map((r) => (
            <li key={r.id}>{r.description}</li>
          ))}
        </ul>
      ) : (
        "—"
      ),
  },
  {
    label: "Entrance Exams",
    render: (u) =>
      u.entrance_exams?.length ? (
        <ul className="text-xs text-gray-600 space-y-0.5 text-left">
          {u.entrance_exams.map((e) => (
            <li key={e.id} className="font-medium">
              {e.name}
              {e.description && (
                <span className="font-normal text-gray-400"> — {e.description}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        "—"
      ),
  },
  // Mobility
  {
    section: "Academic Mobility",
    label: "Partner Universities",
    render: (u) => u.academic_mobility?.length ?? "—",
  },
  {
    label: "Countries",
    render: (u) => {
      const countries = [...new Set(u.academic_mobility?.map((m) => m.country) ?? [])];
      return countries.length ? countries.join(", ") : "—";
    },
  },
];

// ─── Main page ───────────────────────────────────────────────────────────────

export default function ComparisonPage() {
  const [allUniversities, setAllUniversities] = useState<UniversityListItem[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    universityService.getUniversities().then((res) => setAllUniversities(res.data));
  }, []);

  async function addUniversity(code: string) {
    if (universities.find((u) => u.code === code)) return;
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
    setUniversities((prev) => prev.filter((u) => u.code !== code));
  }

  const selectedCodes = new Set(universities.map((u) => u.code));
  const canAdd = universities.length < MAX_UNIS && loading.size === 0;

  // Group rows by section for rendering
  const sections: { name: string; rows: RowDef[] }[] = [];
  let current: { name: string; rows: RowDef[] } | null = null;
  for (const row of ROWS) {
    if (row.section) {
      current = { name: row.section, rows: [] };
      sections.push(current);
    }
    current?.rows.push(row);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111928]">Compare Universities</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Add up to {MAX_UNIS} universities to compare side by side
          </p>
        </div>
        {canAdd && (
          <UniPicker
            allUniversities={allUniversities}
            selectedCodes={selectedCodes}
            onAdd={addUniversity}
          />
        )}
      </div>

      {/* Loading skeletons for pending universities */}
      {loading.size > 0 && (
        <div className="mb-4 flex gap-2">
          {[...loading].map((code) => (
            <div
              key={code}
              className="h-6 w-40 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {universities.length === 0 && loading.size === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
            <TbBuildingSkyscraper size={32} className="text-[#3356AA]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#111928]">No universities selected</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Add University" to start comparing
            </p>
          </div>
          <UniPicker
            allUniversities={allUniversities}
            selectedCodes={selectedCodes}
            onAdd={addUniversity}
          />
        </div>
      )}

      {/* Comparison table */}
      {universities.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {/* row-label column */}
                <th className="w-44 min-w-[160px] bg-gray-50 px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  University
                </th>

                {/* university columns */}
                {universities.map((u) => (
                  <th
                    key={u.code}
                    className="px-5 py-4 text-center align-top min-w-[200px]"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                        <TbBuildingSkyscraper size={20} className="text-[#3356AA]" />
                      </div>
                      <p className="font-semibold text-[#111928] leading-snug text-center">
                        {u.name}
                      </p>
                      <p className="text-xs text-gray-400">{u.city}</p>
                      <button
                        onClick={() => removeUniversity(u.code)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors mt-1"
                      >
                        <HiOutlineX size={13} /> Remove
                      </button>
                    </div>
                  </th>
                ))}

                {/* placeholder columns */}
                {canAdd &&
                  Array.from({ length: MAX_UNIS - universities.length }).map((_, i) => (
                    <th
                      key={`empty-${i}`}
                      className="px-5 py-4 min-w-[200px] align-middle"
                    >
                      <button
                        onClick={() =>
                          document
                            .querySelector<HTMLButtonElement>("[data-add-btn]")
                            ?.click()
                        }
                        className="w-full h-20 border-2 border-dashed border-gray-200 rounded-xl text-gray-300 hover:border-[#3356AA] hover:text-[#3356AA] transition-colors flex flex-col items-center justify-center gap-1 text-xs"
                      >
                        <HiOutlinePlus size={18} />
                        Add university
                      </button>
                    </th>
                  ))}
              </tr>
            </thead>

            <tbody>
              {sections.map((section) => (
                <>
                  {/* section header */}
                  <tr key={`section-${section.name}`} className="bg-gray-50">
                    <td
                      colSpan={MAX_UNIS + 1}
                      className="px-5 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider"
                    >
                      {section.name}
                    </td>
                  </tr>

                  {/* data rows */}
                  {section.rows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-xs font-medium text-gray-500 bg-gray-50/50 whitespace-nowrap">
                        {row.label}
                      </td>
                      {universities.map((u) => (
                        <td
                          key={u.code}
                          className="px-5 py-3 text-sm text-[#374151] text-center align-top"
                        >
                          {row.render(u)}
                        </td>
                      ))}
                      {/* fill empty columns */}
                      {Array.from({
                        length: MAX_UNIS - universities.length,
                      }).map((_, i) => (
                        <td key={`empty-cell-${i}`} className="px-5 py-3" />
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

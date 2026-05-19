import { useEffect, useState, useMemo } from "react";
import { useUniversityStore } from "../../model/universityStore";
import { universityService } from "../../api/universityService";
import type {
  UniversityProgram, CreateProgramRequest,
  NtcProgram, Language, ProgramDegree, ProgramStudyType,
} from "../../model/types";
import { HiPlus, HiX } from "react-icons/hi";
import { LuPencil, LuTrash2, LuSearch } from "react-icons/lu";

// ─── constants ────────────────────────────────────────────────────────────────

const DEGREE_LABELS: Record<ProgramDegree, string> = {
  college:  "College",
  bachelor: "Bachelor",
  master:   "Master",
  phd:      "PhD",
};

const STUDY_TYPE_LABELS: Record<ProgramStudyType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  distance:  "Distance",
  evening:   "Evening",
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatCost(n: number) {
  return n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₸";
}

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({
  prog,
  onEdit,
  onDelete,
}: {
  prog: UniversityProgram;
  onEdit: (p: UniversityProgram) => void;
  onDelete: (code: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-5">
      {/* code square */}
      <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-gray-100 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-500 text-center leading-tight px-1">
          {prog.code.slice(0, 6)}
        </span>
      </div>

      {/* name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-[15px] font-bold text-[#111928]">{prog.local_name}</h3>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Open
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          {DEGREE_LABELS[prog.degree]}
          {prog.years_of_study ? ` · ${prog.years_of_study} years` : ""}
          {" · "}
          {STUDY_TYPE_LABELS[prog.study_type]}
        </p>
        {prog.language_name && (
          <p className="text-sm text-gray-400 mt-0.5">· {prog.language_name}</p>
        )}
      </div>

      {/* tuition */}
      <div className="flex-shrink-0 w-40">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tuition / Year</p>
        <p className="text-lg font-bold text-[#111928]">{formatCost(prog.cost)}</p>
        <p className="text-xs text-gray-400 mt-0.5">UNT ≥ {prog.passing_score ?? "—"}</p>
      </div>

      {/* subjects */}
      <div className="flex-shrink-0 w-44">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subjects</p>
        <div className="flex flex-col gap-1">
          {prog.subject_1_name && (
            <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-lg truncate">
              {prog.subject_1_name}
            </span>
          )}
          {prog.subject_2_name && (
            <span className="text-xs bg-purple-50 text-purple-700 font-medium px-2.5 py-1 rounded-lg truncate">
              {prog.subject_2_name}
            </span>
          )}
        </div>
      </div>

      {/* saved by */}
      <div className="flex-shrink-0 w-28">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Saved by</p>
        <p className="text-xl font-bold text-[#111928]">—</p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onEdit(prog)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LuPencil size={14} /> Edit
        </button>
        <button
          onClick={() => onDelete(prog.code)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
        >
          <LuTrash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Program Modal ────────────────────────────────────────────────────────────

const EMPTY: CreateProgramRequest = {
  code: "", ntc_program: "", local_name: "", cost: 0, language: 0,
  degree: "bachelor", years_of_study: null, study_type: "full_time",
  description: "", passing_score: 0, grant_score: 0, future_professions: "",
};

const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]";
const lbl = "block text-sm font-semibold text-[#111928] mb-1.5";

function ProgramModal({
  title,
  initial,
  ntcPrograms,
  languages,
  onClose,
  onSubmit,
}: {
  title: string;
  initial: CreateProgramRequest;
  ntcPrograms: NtcProgram[];
  languages: Language[];
  onClose: () => void;
  onSubmit: (data: CreateProgramRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateProgramRequest>(initial);
  const [saving, setSaving] = useState(false);

  const patch = (p: Partial<CreateProgramRequest>) => setForm((f) => ({ ...f, ...p }));
  const valid = form.local_name.trim() && form.cost > 0 && form.ntc_program;

  async function handleSubmit() {
    if (!valid || saving) return;
    setSaving(true);
    try { await onSubmit(form); onClose(); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#111928]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><HiX size={20} /></button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">

          {/* NTC programme */}
          <div>
            <label className={lbl}>NTC Programme <span className="text-[#3356AA]">*</span></label>
            <select className={inp} value={form.ntc_program}
              onChange={(e) => {
                const p = ntcPrograms.find((x) => x.code === e.target.value);
                patch({ ntc_program: e.target.value, code: e.target.value, local_name: p?.name ?? form.local_name });
              }}>
              <option value="">Select NTC programme…</option>
              {ntcPrograms.map((p) => (
                <option key={p.code} value={p.code}>{p.code} — {p.name}</option>
              ))}
            </select>
          </div>

          {/* local name */}
          <div>
            <label className={lbl}>Local name <span className="text-[#3356AA]">*</span></label>
            <input className={inp} value={form.local_name} placeholder="Programme name shown on your page"
              onChange={(e) => patch({ local_name: e.target.value })} />
          </div>

          {/* degree + years */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Degree</label>
              <select className={inp} value={form.degree}
                onChange={(e) => patch({ degree: e.target.value as ProgramDegree })}>
                <option value="college">College</option>
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
                <option value="phd">PhD</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Years of study</label>
              <input className={inp} type="number" min={1} max={10}
                value={form.years_of_study ?? ""}
                placeholder="e.g. 4"
                onChange={(e) => patch({ years_of_study: e.target.value ? +e.target.value : null })} />
            </div>
          </div>

          {/* study type + language */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Study type</label>
              <select className={inp} value={form.study_type}
                onChange={(e) => patch({ study_type: e.target.value as ProgramStudyType })}>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="distance">Distance</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Teaching language <span className="text-[#3356AA]">*</span></label>
              <select className={inp} value={form.language || ""}
                onChange={(e) => patch({ language: +e.target.value })}>
                <option value="">Select…</option>
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* cost + passing score */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Tuition / year (₸) <span className="text-[#3356AA]">*</span></label>
              <input className={inp} type="number" min={0}
                value={form.cost || ""} placeholder="e.g. 1360000"
                onChange={(e) => patch({ cost: +e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Passing score (UNT)</label>
              <input className={inp} type="number" min={0} max={140}
                value={form.passing_score || ""} placeholder="e.g. 90"
                onChange={(e) => patch({ passing_score: +e.target.value })} />
            </div>
          </div>

          {/* grant score */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Grant score (UNT)</label>
              <input className={inp} type="number" min={0} max={140}
                value={form.grant_score || ""} placeholder="e.g. 110"
                onChange={(e) => patch({ grant_score: +e.target.value })} />
            </div>
          </div>

          {/* description */}
          <div>
            <label className={lbl}>Description</label>
            <textarea className={inp + " resize-none"} rows={3}
              value={form.description} placeholder="Brief programme overview…"
              onChange={(e) => patch({ description: e.target.value })} />
          </div>

          {/* future professions */}
          <div>
            <label className={lbl}>Future professions</label>
            <textarea className={inp + " resize-none"} rows={2}
              value={form.future_professions} placeholder="e.g. Software Engineer, Data Analyst…"
              onChange={(e) => patch({ future_professions: e.target.value })} />
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!valid || saving}
            className="px-5 py-2.5 rounded-xl bg-[#3356AA] text-white text-sm font-semibold hover:bg-[#2c4892] disabled:opacity-50 transition-colors">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterKey = "all" | ProgramDegree;
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "college",  label: "College" },
  { key: "bachelor", label: "Bachelor" },
  { key: "master",   label: "Master" },
  { key: "phd",      label: "PhD" },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UniProgramsPage() {
  const { myPrograms, fetchMyPrograms, addMyProgram, updateMyProgram, deleteMyProgram } =
    useUniversityStore();

  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [ntcPrograms, setNtcPrograms] = useState<NtcProgram[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UniversityProgram | null>(null);

  useEffect(() => {
    fetchMyPrograms();
    universityService.getNtcPrograms().then((r) => setNtcPrograms(r.data));
    universityService.getLanguages().then((r) => setLanguages(r.data));
  }, [fetchMyPrograms]);

  const filtered = useMemo(() => {
    let list = myPrograms;
    if (filter !== "all") list = list.filter((p) => p.degree === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.local_name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      );
    }
    return list;
  }, [myPrograms, filter, search]);

  function buildInitial(prog: UniversityProgram): CreateProgramRequest {
    return {
      code: prog.code,
      ntc_program: prog.ntc_program,
      local_name: prog.local_name,
      cost: prog.cost,
      language: prog.language ?? 0,
      degree: prog.degree,
      years_of_study: prog.years_of_study,
      study_type: prog.study_type,
      description: prog.description,
      passing_score: prog.passing_score,
      grant_score: prog.grant_score,
      future_professions: prog.future_professions,
    };
  }

  return (
    <>
      {addOpen && (
        <ProgramModal
          title="Add programme"
          initial={EMPTY}
          ntcPrograms={ntcPrograms}
          languages={languages}
          onClose={() => setAddOpen(false)}
          onSubmit={addMyProgram}
        />
      )}
      {editTarget && (
        <ProgramModal
          title="Edit programme"
          initial={buildInitial(editTarget)}
          ntcPrograms={ntcPrograms}
          languages={languages}
          onClose={() => setEditTarget(null)}
          onSubmit={(data) => updateMyProgram(editTarget.code, data)}
        />
      )}

      {/* header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-2xl font-bold text-[#111928]">Programs</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {myPrograms.length} programme{myPrograms.length !== 1 ? "s" : ""} — {myPrograms.length} open for applications
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-[#3356AA] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2c4892] transition-colors"
        >
          <HiPlus size={18} /> Add programme
        </button>
      </div>

      {/* filter bar + search */}
      <div className="flex items-center gap-3 mt-5 mb-5">
        <div className="flex items-center bg-white border border-gray-100 rounded-full p-1 gap-0.5">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-[#111928] text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 relative max-w-md">
          <LuSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programmes…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#3356AA]/20 focus:border-[#3356AA]"
          />
        </div>

        <p className="ml-auto text-sm text-gray-400 flex-shrink-0">
          Showing {filtered.length} of {myPrograms.length}
        </p>
      </div>

      {/* list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-gray-400 text-sm">No programmes found.</p>
            {myPrograms.length === 0 && (
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 text-sm text-[#3356AA] font-medium hover:underline"
              >
                <HiPlus size={16} /> Add your first programme
              </button>
            )}
          </div>
        ) : (
          filtered.map((prog) => (
            <ProgramCard
              key={prog.code}
              prog={prog}
              onEdit={setEditTarget}
              onDelete={deleteMyProgram}
            />
          ))
        )}
      </div>
    </>
  );
}

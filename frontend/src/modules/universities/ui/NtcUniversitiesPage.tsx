import { useEffect, useState, useMemo } from "react";
import { universityService } from "../api/universityService";
import type { UniversityListItem, University, NtcEditUniversityRequest } from "../model/types";
import { HiX } from "react-icons/hi";
import { LuSearch, LuPencil } from "react-icons/lu";

// ─── colour helpers ───────────────────────────────────────────────────────────

const PALETTE = [
  { bg: "#EBF2FE", text: "#3D5AFE" },
  { bg: "#F1ECFE", text: "#7C5CFF" },
  { bg: "#EEF2FF", text: "#3356AA" },
  { bg: "#FFF4E0", text: "#E08900" },
  { bg: "#E6F7EF", text: "#10B981" },
  { bg: "#FDE8F3", text: "#E5499A" },
];

function uniColor(code: string) {
  let h = 0;
  for (const c of String(code)) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
}

function uniInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]";
const lbl = "block text-sm font-semibold text-[#111928] mb-1.5";

function EditModal({
  uni,
  onClose,
  onSaved,
}: {
  uni: UniversityListItem;
  onClose: () => void;
  onSaved: (code: string, updated: Partial<University>) => void;
}) {
  const [full, setFull] = useState<University | null>(null);
  const [form, setForm] = useState<NtcEditUniversityRequest>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    universityService.getUniversityByCode(String(uni.code)).then((r) => {
      setFull(r.data);
      setForm({
        name:       r.data.name,
        short_name: r.data.short_name,
        city:       r.data.city,
        address:    r.data.address,
        phone:      r.data.phone,
        email:      r.data.email,
        website:    r.data.website,
      });
    });
  }, [uni.code]);

  const patch = (p: Partial<NtcEditUniversityRequest>) => setForm((f) => ({ ...f, ...p }));

  async function handleSave() {
    if (saving || !full) return;
    setSaving(true);
    try {
      await universityService.ntcEditUniversity(String(uni.code), form);
      onSaved(String(uni.code), { ...full, ...form });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-[#111928]">Edit university</h2>
            <p className="text-sm text-gray-400 mt-0.5">General info shown to applicants and used for compliance.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><HiX size={20} /></button>
        </div>

        {!full ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Loading…</div>
        ) : (
          <>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className={lbl}>Full official name</label>
                <input className={inp} value={form.name ?? ""} placeholder="University name"
                  onChange={(e) => patch({ name: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Short name</label>
                <input className={inp} value={form.short_name ?? ""} placeholder="Abbrev. / short name"
                  onChange={(e) => patch({ short_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>City</label>
                  <input className={inp} value={form.city ?? ""} placeholder="Astana"
                    onChange={(e) => patch({ city: e.target.value })} />
                </div>
                <div>
                  <label className={lbl}>Phone</label>
                  <input className={inp} value={form.phone ?? ""} placeholder="+7 xxx xxx xxxx"
                    onChange={(e) => patch({ phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={lbl}>Address</label>
                <input className={inp} value={form.address ?? ""} placeholder="Street, City, Postal code"
                  onChange={(e) => patch({ address: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input className={inp} type="email" value={form.email ?? ""} placeholder="admin@university.kz"
                  onChange={(e) => patch({ email: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Website</label>
                <input className={inp} value={form.website ?? ""} placeholder="https://university.kz"
                  onChange={(e) => patch({ website: e.target.value })} />
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#3356AA] text-white text-sm font-semibold hover:bg-[#2c4892] disabled:opacity-50 transition-colors">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── University card (grid view) ──────────────────────────────────────────────

function UniCard({ uni, onEdit }: { uni: UniversityListItem; onEdit: () => void }) {
  const col = uniColor(String(uni.code));
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: col.bg, color: col.text }}>
          {uniInitials(uni.name)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[15px] text-[#111928] leading-snug">{uni.name}</h3>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          <span>{uni.city}</span>
          <span>·</span>
          <span>UNT ≥ {uni.passing_score}</span>
        </div>
      </div>
      <div className="pt-3 border-t border-gray-100">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 w-full justify-center px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LuPencil size={13} /> Edit
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type ViewMode = "grid" | "table";

export default function NtcUniversitiesPage() {
  const [universities, setUniversities] = useState<UniversityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [view, setView] = useState<ViewMode>("grid");
  const [editTarget, setEditTarget] = useState<UniversityListItem | null>(null);

  useEffect(() => {
    universityService.getUniversities().then((r) => {
      setUniversities(r.data);
      setLoading(false);
    });
  }, []);

  const cities = useMemo(() => {
    const s = new Set(universities.map((u) => u.city));
    return ["All", ...Array.from(s).sort()];
  }, [universities]);

  const filtered = useMemo(() => {
    let list = universities;
    if (cityFilter !== "All") list = list.filter((u) => u.city === cityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q));
    }
    return list;
  }, [universities, search, cityFilter]);

  function handleSaved(code: string, updated: Partial<University>) {
    setUniversities((prev) =>
      prev.map((u) =>
        String(u.code) === code
          ? { ...u, name: updated.name ?? u.name, city: updated.city ?? u.city }
          : u
      )
    );
  }

  const counts = useMemo(() => {
    const byCity: Record<string, number> = { All: universities.length };
    universities.forEach((u) => { byCity[u.city] = (byCity[u.city] ?? 0) + 1; });
    return byCity;
  }, [universities]);

  return (
    <>
      {editTarget && (
        <EditModal uni={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />
      )}

      {/* header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111928]">Universities</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {universities.length} universities registered on the platform
          </p>
        </div>
      </div>

      {/* stat strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL",   value: universities.length, sub: `${universities.length} universities`, tileBg: "#EBF2FE", tileText: "#3D5AFE" },
          { label: "ASTANA",  value: counts["Astana"]  ?? 0, sub: "in Astana",   tileBg: "#F1ECFE", tileText: "#7C5CFF" },
          { label: "ALMATY",  value: counts["Almaty"]  ?? 0, sub: "in Almaty",   tileBg: "#E6F7EF", tileText: "#10B981" },
          { label: "OTHER",   value: universities.length - ((counts["Astana"] ?? 0) + (counts["Almaty"] ?? 0)), sub: "in other cities", tileBg: "#FFF4E0", tileText: "#E08900" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: s.tileBg, color: s.tileText }}>
              {s.value}
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{s.label}</div>
              <div className="font-bold text-lg text-gray-900 mt-0.5">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* search */}
          <div className="flex-1 relative min-w-64 max-w-md">
            <LuSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or city…"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3356AA]/20 focus:border-[#3356AA]"
            />
          </div>

          {/* city filter pill */}
          <div className="flex items-center bg-gray-100 rounded-full p-1 gap-0.5">
            {cities.slice(0, 5).map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  cityFilter === city ? "bg-[#111928] text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* view toggle */}
          <div className="flex items-center bg-gray-100 rounded-full p-1 gap-0.5 ml-auto">
            {(["grid", "table"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                  view === v ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-400 flex-shrink-0">
            {filtered.length} of {universities.length}
          </p>
        </div>
      </div>

      {/* content */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No universities found.</div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((u) => (
            <UniCard key={u.code} uni={u} onEdit={() => setEditTarget(u)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">University</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-32">City</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-32">UNT Min. Score</th>
                <th className="px-5 py-3.5 w-24" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const col = uniColor(String(u.code));
                return (
                  <tr key={u.code} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${i === filtered.length - 1 ? "border-b-0" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: col.bg, color: col.text }}>
                          {uniInitials(u.name)}
                        </div>
                        <span className="font-semibold text-[#111928]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{u.city}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{u.passing_score}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setEditTarget(u)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LuPencil size={13} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

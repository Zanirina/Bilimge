import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUniversityStore } from "../../model/universityStore";
import { universityService } from "../../api/universityService";
import type {
  UniversityProgram, CreateProgramRequest,
  NtcProgram, Language, ProgramDegree, ProgramStudyType,
} from "../../model/types";
import { HiPlus, HiX } from "react-icons/hi";
import { LuPencil, LuTrash2, LuSearch } from "react-icons/lu";
import { LangPicker } from "../../../../shared/ui/LangPicker";
import { fieldKey, mlGet, mlView, resolveLang } from "../../../../shared/lib/i18n/multilang";
import type { Lang } from "../../../../shared/lib/i18n/multilang";

const P = "uniAdmin.programs";

const DEGREE_OPTIONS: ProgramDegree[] = ["college", "bachelor", "master", "phd"];
const STUDY_TYPE_OPTIONS: ProgramStudyType[] = ["full_time", "part_time", "distance", "evening"];

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatCost(n: number) {
  return n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₸";
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
  const { t, i18n } = useTranslation();
  const uiLang = resolveLang(i18n.language);
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
          <h3 className="text-[15px] font-bold text-[#111928]">{mlView(prog, "local_name", uiLang)}</h3>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            {t(`${P}.open`)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          {t(`${P}.degrees.${prog.degree}`)}
          {prog.years_of_study ? ` · ${t(`${P}.years`, { n: prog.years_of_study })}` : ""}
          {" · "}
          {t(`${P}.studyTypes.${prog.study_type}`)}
        </p>
        {prog.language_name && (
          <p className="text-sm text-gray-400 mt-0.5">· {prog.language_name}</p>
        )}
      </div>

      {/* tuition */}
      <div className="flex-shrink-0 w-40">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{t(`${P}.tuitionYear`)}</p>
        <p className="text-lg font-bold text-[#111928]">{formatCost(prog.cost)}</p>
        <p className="text-xs text-gray-400 mt-0.5">{t(`${P}.untMin`, { score: prog.passing_score ?? "—" })}</p>
      </div>

      {/* subjects */}
      <div className="flex-shrink-0 w-44">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t(`${P}.subjects`)}</p>
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
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{t(`${P}.savedBy`)}</p>
        <p className="text-xl font-bold text-[#111928]">—</p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onEdit(prog)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LuPencil size={14} /> {t(`${P}.edit`)}
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
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState<CreateProgramRequest>(initial);
  const [modalLang, setModalLang] = useState<Lang>(resolveLang(i18n.language));
  const [saving, setSaving] = useState(false);

  const patch = (p: Partial<CreateProgramRequest>) => setForm((f) => ({ ...f, ...p }));
  // Update a translatable field in the language currently selected by the picker.
  const setML = (base: string, value: string) =>
    patch({ [fieldKey(base, modalLang)]: value } as Partial<CreateProgramRequest>);
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

          {/* editing language */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{t(`${P}.modal.editLanguage`)}</span>
            <LangPicker value={modalLang} onChange={setModalLang} label={t(`${P}.modal.editLanguage`)} />
          </div>

          {/* NTC programme */}
          <div>
            <label className={lbl}>{t(`${P}.modal.ntcProgramme`)} <span className="text-[#3356AA]">*</span></label>
            <select className={inp} value={form.ntc_program}
              onChange={(e) => {
                const p = ntcPrograms.find((x) => x.code === e.target.value);
                patch({ ntc_program: e.target.value, code: e.target.value, local_name: p?.name ?? form.local_name });
              }}>
              <option value="">{t(`${P}.modal.ntcSelect`)}</option>
              {ntcPrograms.map((p) => (
                <option key={p.code} value={p.code}>{p.code} — {p.name}</option>
              ))}
            </select>
          </div>

          {/* local name */}
          <div>
            <label className={lbl}>{t(`${P}.modal.localName`)} <span className="text-[#3356AA]">*</span></label>
            <input className={inp} value={mlGet(form, "local_name", modalLang)} placeholder={t(`${P}.modal.localNamePlaceholder`)}
              onChange={(e) => setML("local_name", e.target.value)} />
          </div>

          {/* degree + years */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>{t(`${P}.modal.degree`)}</label>
              <select className={inp} value={form.degree}
                onChange={(e) => patch({ degree: e.target.value as ProgramDegree })}>
                {DEGREE_OPTIONS.map((d) => (
                  <option key={d} value={d}>{t(`${P}.degrees.${d}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>{t(`${P}.modal.yearsOfStudy`)}</label>
              <input className={inp} type="number" min={1} max={10}
                value={form.years_of_study ?? ""}
                placeholder={t(`${P}.modal.yearsPlaceholder`)}
                onChange={(e) => patch({ years_of_study: e.target.value ? +e.target.value : null })} />
            </div>
          </div>

          {/* study type + language */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>{t(`${P}.modal.studyType`)}</label>
              <select className={inp} value={form.study_type}
                onChange={(e) => patch({ study_type: e.target.value as ProgramStudyType })}>
                {STUDY_TYPE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{t(`${P}.studyTypes.${s}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>{t(`${P}.modal.teachingLanguage`)} <span className="text-[#3356AA]">*</span></label>
              <select className={inp} value={form.language || ""}
                onChange={(e) => patch({ language: +e.target.value })}>
                <option value="">{t(`${P}.modal.languageSelect`)}</option>
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* cost + passing score */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>{t(`${P}.modal.tuition`)} <span className="text-[#3356AA]">*</span></label>
              <input className={inp} type="number" min={0}
                value={form.cost || ""} placeholder={t(`${P}.modal.tuitionPlaceholder`)}
                onChange={(e) => patch({ cost: +e.target.value })} />
            </div>
            <div>
              <label className={lbl}>{t(`${P}.modal.passingScore`)}</label>
              <input className={inp} type="number" min={0} max={140}
                value={form.passing_score || ""} placeholder={t(`${P}.modal.passingPlaceholder`)}
                onChange={(e) => patch({ passing_score: +e.target.value })} />
            </div>
          </div>

          {/* grant score */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>{t(`${P}.modal.grantScore`)}</label>
              <input className={inp} type="number" min={0} max={140}
                value={form.grant_score || ""} placeholder={t(`${P}.modal.grantPlaceholder`)}
                onChange={(e) => patch({ grant_score: +e.target.value })} />
            </div>
          </div>

          {/* description */}
          <div>
            <label className={lbl}>{t(`${P}.modal.description`)}</label>
            <textarea className={inp + " resize-none"} rows={3}
              value={mlGet(form, "description", modalLang)} placeholder={t(`${P}.modal.descriptionPlaceholder`)}
              onChange={(e) => setML("description", e.target.value)} />
          </div>

          {/* future professions */}
          <div>
            <label className={lbl}>{t(`${P}.modal.futureProfessions`)}</label>
            <textarea className={inp + " resize-none"} rows={2}
              value={mlGet(form, "future_professions", modalLang)} placeholder={t(`${P}.modal.futureProfessionsPlaceholder`)}
              onChange={(e) => setML("future_professions", e.target.value)} />
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            {t(`${P}.modal.cancel`)}
          </button>
          <button onClick={handleSubmit} disabled={!valid || saving}
            className="px-5 py-2.5 rounded-xl bg-[#3356AA] text-white text-sm font-semibold hover:bg-[#2c4892] disabled:opacity-50 transition-colors">
            {saving ? t(`${P}.modal.saving`) : t(`${P}.modal.save`)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterKey = "all" | ProgramDegree;
const FILTER_KEYS: FilterKey[] = ["all", "college", "bachelor", "master", "phd"];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UniProgramsPage() {
  const { t } = useTranslation();
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
      local_name_ru: prog.local_name_ru,
      local_name_kk: prog.local_name_kk,
      cost: prog.cost,
      language: prog.language ?? 0,
      degree: prog.degree,
      years_of_study: prog.years_of_study,
      study_type: prog.study_type,
      description: prog.description,
      description_ru: prog.description_ru,
      description_kk: prog.description_kk,
      passing_score: prog.passing_score,
      grant_score: prog.grant_score,
      future_professions: prog.future_professions,
      future_professions_ru: prog.future_professions_ru,
      future_professions_kk: prog.future_professions_kk,
    };
  }

  return (
    <>
      {addOpen && (
        <ProgramModal
          title={t(`${P}.modal.addTitle`)}
          initial={EMPTY}
          ntcPrograms={ntcPrograms}
          languages={languages}
          onClose={() => setAddOpen(false)}
          onSubmit={addMyProgram}
        />
      )}
      {editTarget && (
        <ProgramModal
          title={t(`${P}.modal.editTitle`)}
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
          <h1 className="text-2xl font-bold text-[#111928]">{t(`${P}.title`)}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {t(`${P}.subtitle`, { total: myPrograms.length, open: myPrograms.length })}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-[#3356AA] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2c4892] transition-colors"
        >
          <HiPlus size={18} /> {t(`${P}.addProgramme`)}
        </button>
      </div>

      {/* filter bar + search */}
      <div className="flex items-center gap-3 mt-5 mb-5">
        <div className="flex items-center bg-white border border-gray-100 rounded-full p-1 gap-0.5">
          {FILTER_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-[#111928] text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t(`${P}.filters.${key}`)}
            </button>
          ))}
        </div>

        <div className="flex-1 relative max-w-md">
          <LuSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(`${P}.search`)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#3356AA]/20 focus:border-[#3356AA]"
          />
        </div>

        <p className="ml-auto text-sm text-gray-400 flex-shrink-0">
          {t(`${P}.showing`, { shown: filtered.length, total: myPrograms.length })}
        </p>
      </div>

      {/* list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-gray-400 text-sm">{t(`${P}.empty`)}</p>
            {myPrograms.length === 0 && (
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 text-sm text-[#3356AA] font-medium hover:underline"
              >
                <HiPlus size={16} /> {t(`${P}.addFirst`)}
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

import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { universityService } from "../../universities/api/universityService";
import type { NtcProgram, FieldOfStudy, Subject } from "../../universities/model/types";
import { HiX } from "react-icons/hi";
import { LuSearch, LuPencil, LuTrash2 } from "react-icons/lu";
import { LangPicker } from "../../../shared/ui/LangPicker";
import { fieldKey, resolveLang } from "../../../shared/lib/i18n/multilang";
import type { Lang } from "../../../shared/lib/i18n/multilang";

const inp =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3356AA]/30 focus:border-[#3356AA]";
const lbl = "block text-sm font-semibold text-[#111928] mb-1.5";

type EditForm = {
  name: string;
  name_ru: string;
  name_kk: string;
  field_of_study: string;
  subject_1: number;
  subject_2: number;
  minimum_score: number;
};

function EditModal({
  prog,
  fields,
  subjects,
  onClose,
  onSave,
}: {
  prog: NtcProgram;
  fields: FieldOfStudy[];
  subjects: Subject[];
  onClose: () => void;
  onSave: (code: string, form: EditForm) => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState<EditForm>({
    name: prog.name,
    name_ru: prog.name_ru ?? "",
    name_kk: prog.name_kk ?? "",
    field_of_study: prog.field_of_study,
    subject_1: prog.subject_1,
    subject_2: prog.subject_2,
    minimum_score: prog.minimum_score,
  });
  const [editLang, setEditLang] = useState<Lang>(resolveLang(i18n.language));
  const [saving, setSaving] = useState(false);

  const patch = (p: Partial<EditForm>) => setForm((f) => ({ ...f, ...p }));
  const nameField = fieldKey("name", editLang) as "name" | "name_ru" | "name_kk";
  const valid = form.name.trim() && form.field_of_study && form.subject_1 && form.subject_2;

  async function handleSubmit() {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await onSave(prog.code, form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-[#111928]">{t("ntcAdmin.programs.editModal.title")}</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{prog.code}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <HiX size={20} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-[#111928]">{t("ntcAdmin.programs.editModal.name")} <span className="text-[#3356AA]">*</span></label>
              <LangPicker value={editLang} onChange={setEditLang} label={t("ntcAdmin.programs.editModal.editLanguage")} />
            </div>
            <input
              className={inp}
              value={form[nameField]}
              onChange={(e) => patch({ [nameField]: e.target.value })}
              placeholder={t("ntcAdmin.programs.editModal.namePlaceholder")}
            />
          </div>

          <div>
            <label className={lbl}>{t("ntcAdmin.programs.editModal.fieldOfStudy")} <span className="text-[#3356AA]">*</span></label>
            <select
              className={inp}
              value={form.field_of_study}
              onChange={(e) => patch({ field_of_study: e.target.value })}
            >
              <option value="">{t("ntcAdmin.programs.editModal.selectField")}</option>
              {fields.map((f) => (
                <option key={f.code} value={f.code}>{f.code} — {f.name_localized || f.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>{t("ntcAdmin.programs.editModal.subject1")} <span className="text-[#3356AA]">*</span></label>
              <select
                className={inp}
                value={form.subject_1}
                onChange={(e) => patch({ subject_1: +e.target.value })}
              >
                <option value={0}>{t("ntcAdmin.programs.editModal.select")}</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name_localized || s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>{t("ntcAdmin.programs.editModal.subject2")} <span className="text-[#3356AA]">*</span></label>
              <select
                className={inp}
                value={form.subject_2}
                onChange={(e) => patch({ subject_2: +e.target.value })}
              >
                <option value={0}>{t("ntcAdmin.programs.editModal.select")}</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name_localized || s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={lbl}>{t("ntcAdmin.programs.editModal.minScore")}</label>
            <input
              className={inp}
              type="number"
              min={0}
              max={140}
              value={form.minimum_score}
              onChange={(e) => patch({ minimum_score: +e.target.value })}
              placeholder={t("ntcAdmin.programs.editModal.minScorePlaceholder")}
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!valid || saving}
            className="px-5 py-2.5 rounded-xl bg-[#3356AA] text-white text-sm font-semibold hover:bg-[#2c4892] disabled:opacity-50 transition-colors"
          >
            {saving ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NtcProgramsPage() {
  const { t } = useTranslation();
  const [programs, setPrograms] = useState<NtcProgram[]>([]);
  const [fields, setFields] = useState<FieldOfStudy[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<NtcProgram | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      universityService.getNtcPrograms(),
      universityService.getFields(),
      universityService.getSubjects(),
    ]).then(([progs, flds, subs]) => {
      setPrograms(progs.data);
      setFields(flds.data);
      setSubjects(subs.data);
      setLoading(false);
    });
  }, []);

  async function handleSave(code: string, form: EditForm) {
    const res = await universityService.updateNtcProgram(code, form);
    // The update endpoint returns the full localized program representation.
    setPrograms((prev) => prev.map((p) => (p.code === code ? { ...p, ...res.data } : p)));
  }

  async function handleDelete(code: string) {
    setDeletingCode(code);
    try {
      await universityService.deleteNtcProgram(code);
      setPrograms((prev) => prev.filter((p) => p.code !== code));
    } finally {
      setDeletingCode(null);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return programs;
    const q = search.toLowerCase();
    return programs.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.name_localized?.toLowerCase().includes(q) ||
        p.field_of_study_name?.toLowerCase().includes(q) ||
        p.field_of_study_name_localized?.toLowerCase().includes(q)
    );
  }, [programs, search]);

  return (
    <>
      {editTarget && (
        <EditModal
          prog={editTarget}
          fields={fields}
          subjects={subjects}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )}

      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-2xl font-bold text-[#111928]">{t("ntcAdmin.programs.title")}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {t("ntcAdmin.programs.subtitle", { n: programs.length })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5 mb-5">
        <div className="flex-1 relative max-w-md">
          <LuSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("ntcAdmin.programs.searchPlaceholder")}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#3356AA]/20 focus:border-[#3356AA]"
          />
        </div>
        <p className="ml-auto text-sm text-gray-400 flex-shrink-0">
          {t("ntcAdmin.programs.showing", { shown: filtered.length, total: programs.length })}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">{t("ntcAdmin.programs.th.code")}</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("ntcAdmin.programs.th.name")}</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-36">{t("ntcAdmin.programs.th.subject1")}</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-36">{t("ntcAdmin.programs.th.subject2")}</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">{t("ntcAdmin.programs.th.minScore")}</th>
              <th className="px-5 py-3.5 w-24" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">{t("common.loading")}</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">{t("ntcAdmin.programs.empty")}</td>
              </tr>
            ) : (
              filtered.map((prog, i) => (
                <tr
                  key={prog.code}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                    i === filtered.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                      {prog.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 max-w-[300px]">
                    <p className="font-medium text-[#111928]">{prog.name_localized || prog.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {prog.field_of_study_name_localized || prog.field_of_study_name || prog.field_of_study}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    {prog.subject_1_name ? (
                      <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-lg">
                        {prog.subject_1_name_localized || prog.subject_1_name}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {prog.subject_2_name ? (
                      <span className="text-xs bg-purple-50 text-purple-700 font-medium px-2.5 py-1 rounded-lg">
                        {prog.subject_2_name_localized || prog.subject_2_name}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-[#111928]">{prog.minimum_score}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => setEditTarget(prog)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LuPencil size={13} /> {t("common.edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(prog.code)}
                        disabled={deletingCode === prog.code}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <LuTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

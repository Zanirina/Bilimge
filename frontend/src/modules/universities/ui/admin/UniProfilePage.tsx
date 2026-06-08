import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useUniversityStore } from "../../model/universityStore";
import { universityService } from "../../api/universityService";
import type { Language, EntranceRequirement, EntranceExam } from "../../model/types";
import { LangPicker } from "../../../../shared/ui/LangPicker";
import { fieldKey, mlGet, mlView, resolveLang } from "../../../../shared/lib/i18n/multilang";
import type { Lang } from "../../../../shared/lib/i18n/multilang";

type Tab = "overview" | "contacts" | "accreditations" | "mobility";
type MLBase = "name" | "city" | "address" | "history";

type ReqForm = { description: string; description_ru: string; description_kk: string };
type ExamForm = { name: string; name_ru: string; name_kk: string; description: string; description_ru: string; description_kk: string };

const EMPTY_REQ: ReqForm = { description: "", description_ru: "", description_kk: "" };
const EMPTY_EXAM: ExamForm = { name: "", name_ru: "", name_kk: "", description: "", description_ru: "", description_kk: "" };

// ─── Icons ────────────────────────────────────────────────────────────────────
const IPin    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ICal    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IGlobe  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>;
const IMail   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>;
const IPhone  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.18 1.2 2 2 0 012.18 0h3a2 2 0 012 1.72c.17.97.44 1.9.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.9.26 1.84.53 2.81.7A2 2 0 0122 16.92z"/></svg>;
const ICheck  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>;
const IPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
const IXmark  = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IPen    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const ITrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const ICamera = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;

// ─── Shared styles ────────────────────────────────────────────────────────────
const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/20 focus:border-[#3356AA]/50 bg-white text-gray-800";
const lbl = "block text-xs text-gray-400 mb-1.5";

function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: () => void; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer select-none" onClick={onChange}>
      <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-[#3356AA]" : "bg-gray-200"}`}>
        <div className={`w-5 h-5 bg-white rounded-full mt-0.5 mx-0.5 shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

function IconInput({ icon, value, onChange, placeholder, type = "text" }: {
  icon: React.ReactNode; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">{icon}</div>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} className={inp} />
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Logo uploader ────────────────────────────────────────────────────────────
function LogoUploader({ logoUrl, initials, onUpload }: { logoUrl: string; initials: string; onUpload: (f: File) => Promise<void> }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <div className="relative w-20 h-20 flex-shrink-0 group cursor-pointer" onClick={() => ref.current?.click()}>
      {logoUrl ? (
        <img src={logoUrl} alt="logo" className="w-20 h-20 rounded-2xl object-fit" />
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
          <span className="text-3xl font-bold text-[#3356AA]">{initials}</span>
        </div>
      )}
      <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {uploading ? (
          <span className="text-white text-xs">{t("uniAdmin.profile.uploading")}</span>
        ) : (
          <ICamera />
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={async e => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        await onUpload(file).finally(() => setUploading(false));
        e.target.value = "";
      }} />
    </div>
  );
}

// ─── Cover uploader ───────────────────────────────────────────────────────────
function CoverUploader({ coverUrl, onUpload }: { coverUrl: string; onUpload: (f: File) => Promise<void> }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <div
      className="relative w-full h-65 rounded-2xl overflow-hidden cursor-pointer group mb-4"
      style={{ background: coverUrl ? undefined : "#F3F4F6" }}
      onClick={() => ref.current?.click()}
    >
      {coverUrl ? (
        <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm gap-2">
          <ICamera /> <span>{t("uniAdmin.profile.uploadCover")}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-medium">
        {uploading ? t("uniAdmin.profile.uploading") : <><ICamera /> {t("uniAdmin.profile.changeCover")}</>}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={async e => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        await onUpload(file).finally(() => setUploading(false));
        e.target.value = "";
      }} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function UniProfilePage() {
  const { t, i18n } = useTranslation();
  const P = "uniAdmin.profile";

  const {
    myUniversity, myLanguages, myRequirements, myExams, myMobility, myAccreditations,
    fetchMyUniversity, updateMyUniversityInfo,
    fetchMyLanguages, addMyLanguage, deleteMyLanguage,
    fetchMyRequirements, addMyRequirement, updateMyRequirement, deleteMyRequirement,
    fetchMyExams, addMyExam, updateMyExam, deleteMyExam,
    fetchMyMobility, addMyMobility, updateMyMobility, deleteMyMobility,
    fetchMyAccreditations, addMyAccreditation, updateMyAccreditation, deleteMyAccreditation,
    uploadLogo, uploadCover,
  } = useUniversityStore();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);

  const [editMode, setEditMode] = useState(false);
  const [editLang, setEditLang] = useState<Lang>("en");
  const [info, setInfo] = useState({
    name: "", name_ru: "", name_kk: "",
    short_name: "",
    city: "", city_ru: "", city_kk: "",
    address: "", address_ru: "", address_kk: "",
    year_established: 0,
    email: "", phone: "", website: "", passing_score: 0,
    history: "", history_ru: "", history_kk: "",
    has_dormitory: false, has_military_department: false,
    telegram_url: "", instagram_url: "", tuition_cost: "" as string | number,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [showAddLang, setShowAddLang] = useState(false);
  const [selLangId, setSelLangId] = useState<number | "">("");
  const [addingLang, setAddingLang] = useState(false);

  const [showAddReq, setShowAddReq] = useState(false);
  const [newReq, setNewReq] = useState<ReqForm>(EMPTY_REQ);
  const [reqAddLang, setReqAddLang] = useState<Lang>("en");
  const [editReqId, setEditReqId] = useState<number | null>(null);
  const [editReq, setEditReq] = useState<ReqForm>(EMPTY_REQ);
  const [reqEditLang, setReqEditLang] = useState<Lang>("en");

  const [showAddExam, setShowAddExam] = useState(false);
  const [newExam, setNewExam] = useState<ExamForm>(EMPTY_EXAM);
  const [examAddLang, setExamAddLang] = useState<Lang>("en");
  const [editExamId, setEditExamId] = useState<number | null>(null);
  const [editExam, setEditExam] = useState<ExamForm>(EMPTY_EXAM);
  const [examEditLang, setExamEditLang] = useState<Lang>("en");

  const [showAddMob, setShowAddMob] = useState(false);
  const [newMob, setNewMob] = useState({ partner_university_name: "", country: "" });
  const [editMobId, setEditMobId] = useState<number | null>(null);
  const [editMob, setEditMob] = useState({ partner_university_name: "", country: "" });

  const [showAddAcc, setShowAddAcc] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: "", issued_by: "", valid_until: "" });
  const [editAccId, setEditAccId] = useState<number | null>(null);
  const [editAcc, setEditAcc] = useState({ name: "", issued_by: "", valid_until: "" });

  useEffect(() => {
    Promise.all([
      fetchMyUniversity(),
      fetchMyLanguages(),
      fetchMyRequirements(),
      fetchMyExams(),
      fetchMyMobility(),
      fetchMyAccreditations(),
      universityService.getLanguages().then(r => setAllLanguages(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (myUniversity) {
      setInfo({
        name:                    myUniversity.name ?? "",
        name_ru:                 myUniversity.name_ru ?? "",
        name_kk:                 myUniversity.name_kk ?? "",
        short_name:              myUniversity.short_name ?? "",
        city:                    myUniversity.city ?? "",
        city_ru:                 myUniversity.city_ru ?? "",
        city_kk:                 myUniversity.city_kk ?? "",
        address:                 myUniversity.address ?? "",
        address_ru:              myUniversity.address_ru ?? "",
        address_kk:              myUniversity.address_kk ?? "",
        year_established:        myUniversity.year_established ?? 0,
        email:                   myUniversity.email ?? "",
        phone:                   myUniversity.phone ?? "",
        website:                 myUniversity.website ?? "",
        passing_score:           myUniversity.passing_score ?? 0,
        history:                 myUniversity.history ?? "",
        history_ru:              myUniversity.history_ru ?? "",
        history_kk:              myUniversity.history_kk ?? "",
        has_dormitory:           myUniversity.has_dormitory ?? false,
        has_military_department: myUniversity.has_military_department ?? false,
        telegram_url:            myUniversity.telegram_url ?? "",
        instagram_url:           myUniversity.instagram_url ?? "",
        tuition_cost:            myUniversity.tuition_cost ?? "",
      });
    }
  }, [myUniversity]);

  // ── Multilingual helpers ────────────────────────────────────────────────────
  // Current app language chosen in the topbar — drives what's shown in view mode.
  const uiLang = resolveLang(i18n.language);
  const mlKey = (base: MLBase, lang: Lang): keyof typeof info =>
    (lang === "en" ? base : `${base}_${lang}`) as keyof typeof info;
  // Edit value: the language selected with the switch next to the Edit button.
  const editVal = (base: MLBase) => String(info[mlKey(base, editLang)] ?? "");
  // View value: the topbar language, falling back to English when empty.
  const viewVal = (base: MLBase) => String(info[mlKey(base, uiLang)] || info[base] || "");
  const setML = (base: MLBase, value: string) =>
    setInfo(p => ({ ...p, [mlKey(base, editLang)]: value }));

  // Start editing in the language the admin is currently viewing.
  const startEdit = () => { setEditLang(uiLang); setEditMode(true); };

  const saveInfo = async () => {
    setSaving(true);
    await updateMyUniversityInfo({
      ...info,
      tuition_cost: info.tuition_cost === "" ? null : Number(info.tuition_cost),
    });
    setSaving(false);
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-gray-400 text-sm">{t(`${P}.loading`)}</div>;
  }

  // App-language variant for the page header.
  const headerField = (base: "name" | "city") => {
    if (!myUniversity) return "";
    if (uiLang === "en") return myUniversity[base] || "";
    const key = `${base}_${uiLang}` as keyof typeof myUniversity;
    return String(myUniversity[key] || myUniversity[base] || "");
  };
  const headerName = headerField("name");
  const headerCity = headerField("city");

  const initials = (myUniversity?.name ?? "U").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
  const availableLangs = allLanguages.filter(l => !myLanguages.some(ml => ml.id === l.id));

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview",       label: t(`${P}.tabs.overview`) },
    { id: "contacts",       label: t(`${P}.tabs.contacts`) },
    { id: "accreditations", label: t(`${P}.tabs.accreditations`) },
    { id: "mobility",       label: t(`${P}.tabs.mobility`) },
  ];

  // ── Language switch (sits next to the Edit button) ───────────────────────────
  const LangSwitch = <LangPicker value={editLang} onChange={setEditLang} label={t(`${P}.editLanguage`)} />;

  // Open the inline edit form for a requirement, seeded with the topbar language.
  const startEditReq = (req: EntranceRequirement) => {
    setReqEditLang(uiLang);
    setEditReq({ description: req.description, description_ru: req.description_ru, description_kk: req.description_kk });
    setEditReqId(req.id);
  };
  const openAddReq = () => { setReqAddLang(uiLang); setNewReq(EMPTY_REQ); setShowAddReq(true); };

  // Open the inline edit form for an exam, seeded with the topbar language.
  const startEditExam = (exam: EntranceExam) => {
    setExamEditLang(uiLang);
    setEditExam({
      name: exam.name, name_ru: exam.name_ru, name_kk: exam.name_kk,
      description: exam.description, description_ru: exam.description_ru, description_kk: exam.description_kk,
    });
    setEditExamId(exam.id);
  };
  const openAddExam = () => { setExamAddLang(uiLang); setNewExam(EMPTY_EXAM); setShowAddExam(true); };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <CoverUploader coverUrl={myUniversity?.cover_url ?? ""} onUpload={uploadCover} />
        <div className="px-6 py-6 flex items-center gap-5 -mt-6">
          <LogoUploader
            logoUrl={myUniversity?.logo_url ?? ""}
            initials={initials}
            onUpload={uploadLogo}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{headerName}</h1>

              {myUniversity?.short_name && (
                <span className="text-2xl font-bold text-gray-900">({myUniversity.short_name})</span>
              )}
            </div>
            <div className="flex items-center gap-5 mt-2 text-sm text-gray-500 flex-wrap">
              {headerCity && (
                <span className="flex items-center gap-1.5"><IPin />{headerCity}, {t(`${P}.kazakhstan`)}</span>
              )}
              {myUniversity?.year_established && (
                <span className="flex items-center gap-1.5"><ICal />{t(`${P}.founded`, { year: myUniversity.year_established })}</span>
              )}
              {myUniversity?.website && (
                <a href={myUniversity.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:underline">
                  <IGlobe />{myUniversity.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <div className="flex items-center gap-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === tab.id
                ? "border border-[#3356AA] text-gray-900 font-medium"
                : "text-gray-500 hover:text-gray-800"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW ══════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-[1.6fr_1fr] gap-5 items-start">
          <Card title={t(`${P}.basic.title`)}
            action={
              <div className="flex items-center gap-3">
                {editMode ? LangSwitch : (
                  <button onClick={startEdit}
                    className="flex items-center gap-1.5 text-sm text-[#3356AA] font-medium hover:text-[#2c4892]">
                    <IPen /> {t(`${P}.common.edit`)}
                  </button>
                )}
              </div>
            }>
            {!editMode ? (
              <>
                <div className="divide-y divide-gray-100">
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    <div className="py-4 pr-6">
                      <p className="text-xs text-gray-400 mb-1">{t(`${P}.basic.officialName`)}</p>
                      <p className="text-sm font-medium text-gray-900">{viewVal("name") || "—"}</p>
                    </div>
                    <div className="py-4 pl-6">
                      <p className="text-xs text-gray-400 mb-1">{t(`${P}.basic.shortName`)}</p>
                      <p className="text-sm font-medium text-gray-900">{info.short_name || "—"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    <div className="py-4 pr-6">
                      <p className="text-xs text-gray-400 mb-1">{t(`${P}.basic.yearFounded`)}</p>
                      <p className="text-sm font-medium text-gray-900">{info.year_established || "—"}</p>
                    </div>
                    <div className="py-4 pl-6">
                      <p className="text-xs text-gray-400 mb-1">{t(`${P}.basic.cityCountry`)}</p>
                      <p className="text-sm font-medium text-gray-900">{viewVal("city") ? `${viewVal("city")}, ${t(`${P}.kazakhstan`)}` : "—"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    <div className="py-4 pr-6">
                      <p className="text-xs text-gray-400 mb-1">{t(`${P}.basic.address`)}</p>
                      <p className="text-sm font-medium text-gray-900">{viewVal("address") || "—"}</p>
                    </div>
                    <div className="py-4 pl-6">
                      <p className="text-xs text-gray-400 mb-1">{t(`${P}.basic.tuition`)}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {info.tuition_cost ? `${Number(info.tuition_cost).toLocaleString()} ₸` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
                {viewVal("history") && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1.5">{t(`${P}.basic.about`)}</p>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{viewVal("history")}</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4">
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${info.has_dormitory ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
                    {t(`${P}.basic.dormitory`)} {info.has_dormitory ? "✓" : "✗"}
                  </span>
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${info.has_military_department ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-400"}`}>
                    {t(`${P}.basic.militaryDept`)} {info.has_military_department ? "✓" : "✗"}
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>{t(`${P}.basic.officialName`)}</label>
                    <input className={inp} value={editVal("name")} onChange={e => setML("name", e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>{t(`${P}.basic.shortName`)}</label>
                    <input className={inp} value={info.short_name} placeholder={t(`${P}.basic.shortNamePlaceholder`)}
                      onChange={e => setInfo(p => ({ ...p, short_name: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>{t(`${P}.basic.yearFounded`)}</label>
                    <input className={inp} type="number" value={info.year_established || ""}
                      onChange={e => setInfo(p => ({ ...p, year_established: +e.target.value }))} />
                  </div>
                  <div>
                    <label className={lbl}>{t(`${P}.basic.cityCountry`)}</label>
                    <input className={inp} value={editVal("city")} onChange={e => setML("city", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>{t(`${P}.basic.address`)}</label>
                  <input className={inp} value={editVal("address")} onChange={e => setML("address", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>{t(`${P}.basic.website`)}</label>
                    <input className={inp} type="url" value={info.website} onChange={e => setInfo(p => ({ ...p, website: e.target.value }))} />
                  </div>
                  <div>
                    <label className={lbl}>{t(`${P}.basic.tuition`)}</label>
                    <input className={inp} type="number" value={info.tuition_cost}
                      placeholder="e.g. 1500000"
                      onChange={e => setInfo(p => ({ ...p, tuition_cost: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>{t(`${P}.basic.passingScore`)}</label>
                  <input className={inp} type="number" value={info.passing_score || ""}
                    onChange={e => setInfo(p => ({ ...p, passing_score: +e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>{t(`${P}.basic.aboutHistory`)}</label>
                  <textarea className={inp + " resize-none h-24"} value={editVal("history")}
                    onChange={e => setML("history", e.target.value)} />
                </div>
                <div className="space-y-3 pt-1">
                  <p className={lbl}>{t(`${P}.basic.facilities`)}</p>
                  <Toggle checked={info.has_dormitory} onChange={() => setInfo(p => ({ ...p, has_dormitory: !p.has_dormitory }))} label={t(`${P}.basic.dormitory`)} sub={t(`${P}.basic.dormitorySub`)} />
                  <Toggle checked={info.has_military_department} onChange={() => setInfo(p => ({ ...p, has_military_department: !p.has_military_department }))} label={t(`${P}.basic.militaryLabel`)} sub={t(`${P}.basic.militarySub`)} />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"><ICheck /> {t(`${P}.common.saved`)}</span>}
                  <button onClick={saveInfo} disabled={saving}
                    className="bg-[#3356AA] text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-[#2c4892] disabled:opacity-60">
                    {saving ? t(`${P}.common.saving`) : t(`${P}.common.save`)}
                  </button>
                  <button onClick={() => setEditMode(false)} className="text-sm text-gray-400 hover:text-gray-600">{t(`${P}.common.cancel`)}</button>
                </div>
              </div>
            )}
          </Card>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Teaching Languages */}
            <Card title={t(`${P}.languages.title`)}
              action={
                <button onClick={() => setShowAddLang(p => !p)}
                  className="flex items-center gap-1 text-sm text-[#3356AA] font-medium hover:text-[#2c4892]">
                  <IPlus /> {t(`${P}.common.add`)}
                </button>
              }>
              {myLanguages.length === 0 && !showAddLang && (
                <p className="text-sm text-gray-400">{t(`${P}.languages.empty`)}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {myLanguages.map(lang => (
                  <span key={lang.id} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                    {lang.name}
                    <button onClick={() => deleteMyLanguage(lang.id)} className="hover:text-red-500"><IXmark /></button>
                  </span>
                ))}
              </div>
              {showAddLang && (
                <div className="mt-3 flex items-center gap-2">
                  <select className={inp + " max-w-xs"} value={selLangId}
                    onChange={e => setSelLangId(e.target.value ? +e.target.value : "")}>
                    <option value="">{t(`${P}.languages.select`)}</option>
                    {availableLangs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <button onClick={async () => {
                    if (!selLangId) return;
                    setAddingLang(true);
                    await addMyLanguage(selLangId as number);
                    setSelLangId(""); setShowAddLang(false); setAddingLang(false);
                  }} disabled={!selLangId || addingLang}
                    className="bg-[#3356AA] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2c4892] disabled:opacity-50">
                    {addingLang ? t(`${P}.common.adding`) : t(`${P}.common.add`)}
                  </button>
                  <button onClick={() => setShowAddLang(false)} className="text-sm text-gray-400 hover:text-gray-600">{t(`${P}.common.cancel`)}</button>
                </div>
              )}
            </Card>

            {/* Entrance Requirements */}
            <Card title={t(`${P}.requirements.title`)}
              action={
                <button onClick={() => showAddReq ? setShowAddReq(false) : openAddReq()}
                  className="flex items-center gap-1 text-sm text-[#3356AA] font-medium hover:text-[#2c4892]">
                  <IPlus /> {t(`${P}.common.add`)}
                </button>
              }>
              {myRequirements.length === 0 && !showAddReq && (
                <p className="text-sm text-gray-400">{t(`${P}.requirements.empty`)}</p>
              )}
              <ul className="space-y-2">
                {myRequirements.map(req => (
                  <li key={req.id} className="bg-gray-50 rounded-xl px-4 py-3">
                    {editReqId === req.id ? (
                      <div className="space-y-2">
                        <LangPicker value={reqEditLang} onChange={setReqEditLang} label={t(`${P}.editLanguage`)} />
                        <div className="flex items-center gap-2">
                          <input className={inp} autoFocus placeholder={t(`${P}.requirements.placeholder`)}
                            value={mlGet(editReq, "description", reqEditLang)}
                            onChange={e => setEditReq(p => ({ ...p, [fieldKey("description", reqEditLang)]: e.target.value }) as ReqForm)} />
                          <button onClick={async () => { await updateMyRequirement(req.id, editReq); setEditReqId(null); }}
                            className="text-emerald-600 hover:text-emerald-700 flex-shrink-0"><ICheck /></button>
                          <button onClick={() => setEditReqId(null)} className="text-gray-400 flex-shrink-0"><IXmark /></button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-700">{mlView(req, "description", uiLang)}</span>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => startEditReq(req)} className="text-gray-400 hover:text-blue-600"><IPen /></button>
                          <button onClick={() => deleteMyRequirement(req.id)} className="text-gray-400 hover:text-red-500"><ITrash /></button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {showAddReq && (
                <div className="mt-3 space-y-2">
                  <LangPicker value={reqAddLang} onChange={setReqAddLang} label={t(`${P}.editLanguage`)} />
                  <div className="flex items-center gap-2">
                    <input className={inp} autoFocus placeholder={t(`${P}.requirements.placeholder`)}
                      value={mlGet(newReq, "description", reqAddLang)}
                      onChange={e => setNewReq(p => ({ ...p, [fieldKey("description", reqAddLang)]: e.target.value }) as ReqForm)} />
                    <button onClick={async () => {
                      if (!mlGet(newReq, "description", reqAddLang).trim()) return;
                      await addMyRequirement(newReq);
                      setNewReq(EMPTY_REQ); setShowAddReq(false);
                    }} disabled={!mlGet(newReq, "description", reqAddLang).trim()}
                      className="flex-shrink-0 bg-[#3356AA] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2c4892] disabled:opacity-50">{t(`${P}.common.add`)}</button>
                    <button onClick={() => { setShowAddReq(false); setNewReq(EMPTY_REQ); }} className="flex-shrink-0 text-sm text-gray-400 hover:text-gray-600">{t(`${P}.common.cancel`)}</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Entrance Exams */}
            <Card title={t(`${P}.exams.title`)}
              action={
                <button onClick={() => showAddExam ? setShowAddExam(false) : openAddExam()}
                  className="flex items-center gap-1 text-sm text-[#3356AA] font-medium hover:text-[#2c4892]">
                  <IPlus /> {t(`${P}.common.add`)}
                </button>
              }>
              {myExams.length === 0 && !showAddExam && (
                <p className="text-sm text-gray-400">{t(`${P}.exams.empty`)}</p>
              )}
              <ul className="space-y-2">
                {myExams.map(exam => (
                  <li key={exam.id} className="bg-gray-50 rounded-xl px-4 py-3">
                    {editExamId === exam.id ? (
                      <div className="space-y-2">
                        <LangPicker value={examEditLang} onChange={setExamEditLang} label={t(`${P}.editLanguage`)} />
                        <input className={inp} autoFocus placeholder={t(`${P}.exams.namePlaceholder`)}
                          value={mlGet(editExam, "name", examEditLang)}
                          onChange={e => setEditExam(p => ({ ...p, [fieldKey("name", examEditLang)]: e.target.value }) as ExamForm)} />
                        <input className={inp} placeholder={t(`${P}.exams.descPlaceholder`)}
                          value={mlGet(editExam, "description", examEditLang)}
                          onChange={e => setEditExam(p => ({ ...p, [fieldKey("description", examEditLang)]: e.target.value }) as ExamForm)} />
                        <div className="flex gap-2">
                          <button onClick={async () => { await updateMyExam(exam.id, editExam); setEditExamId(null); }}
                            className="text-sm text-emerald-600 font-medium">{t(`${P}.common.save`)}</button>
                          <button onClick={() => setEditExamId(null)} className="text-sm text-gray-400">{t(`${P}.common.cancel`)}</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{mlView(exam, "name", uiLang)}</p>
                          {mlView(exam, "description", uiLang) && <p className="text-xs text-gray-500 mt-0.5">{mlView(exam, "description", uiLang)}</p>}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => startEditExam(exam)} className="text-gray-400 hover:text-blue-600"><IPen /></button>
                          <button onClick={() => deleteMyExam(exam.id)} className="text-gray-400 hover:text-red-500"><ITrash /></button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {showAddExam && (
                <div className="mt-3 space-y-2">
                  <LangPicker value={examAddLang} onChange={setExamAddLang} label={t(`${P}.editLanguage`)} />
                  <input className={inp} autoFocus placeholder={t(`${P}.exams.namePlaceholder`)}
                    value={mlGet(newExam, "name", examAddLang)}
                    onChange={e => setNewExam(p => ({ ...p, [fieldKey("name", examAddLang)]: e.target.value }) as ExamForm)} />
                  <input className={inp} placeholder={t(`${P}.exams.descPlaceholder`)}
                    value={mlGet(newExam, "description", examAddLang)}
                    onChange={e => setNewExam(p => ({ ...p, [fieldKey("description", examAddLang)]: e.target.value }) as ExamForm)} />
                  <div className="flex gap-2">
                    <button onClick={async () => {
                      if (!mlGet(newExam, "name", examAddLang).trim()) return;
                      await addMyExam(newExam);
                      setNewExam(EMPTY_EXAM); setShowAddExam(false);
                    }} disabled={!mlGet(newExam, "name", examAddLang).trim()}
                      className="bg-[#3356AA] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2c4892] disabled:opacity-50">{t(`${P}.exams.addExam`)}</button>
                    <button onClick={() => { setShowAddExam(false); setNewExam(EMPTY_EXAM); }}
                      className="text-sm text-gray-400 hover:text-gray-600">{t(`${P}.common.cancel`)}</button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ══ CONTACTS & SOCIAL ═════════════════════════════════════════════════ */}
      {activeTab === "contacts" && (
        <div className="grid grid-cols-2 gap-5 items-start">
          <Card title={t(`${P}.contacts.title`)}>
            <div className="space-y-3">
              <div>
                <label className={lbl}>{t(`${P}.contacts.email`)}</label>
                <IconInput icon={<IMail />} type="email" value={info.email}
                  onChange={v => setInfo(p => ({ ...p, email: v }))} placeholder={t(`${P}.contacts.emailPlaceholder`)} />
              </div>
              <div>
                <label className={lbl}>{t(`${P}.contacts.phone`)}</label>
                <IconInput icon={<IPhone />} type="tel" value={info.phone}
                  onChange={v => setInfo(p => ({ ...p, phone: v }))} placeholder={t(`${P}.contacts.phonePlaceholder`)} />
              </div>
              <div>
                <label className={lbl}>{t(`${P}.contacts.postalAddress`)}</label>
                <IconInput icon={<IPin />} value={info.address}
                  onChange={v => setInfo(p => ({ ...p, address: v }))} placeholder={t(`${P}.contacts.postalPlaceholder`)} />
              </div>
              <div className="pt-1 flex items-center gap-3">
                {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"><ICheck /> {t(`${P}.common.saved`)}</span>}
                <button onClick={saveInfo} disabled={saving}
                  className="bg-[#3356AA] text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-[#2c4892] disabled:opacity-60">
                  {saving ? t(`${P}.common.saving`) : t(`${P}.common.save`)}
                </button>
              </div>
            </div>
          </Card>

          <Card title={t(`${P}.social.title`)}>
            <div className="space-y-3">
              <div>
                <label className={lbl}>{t(`${P}.social.instagram`)}</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}>
                    IG
                  </div>
                  <input className={inp} value={info.instagram_url} placeholder={t(`${P}.social.instagramPlaceholder`)}
                    onChange={e => setInfo(p => ({ ...p, instagram_url: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={lbl}>{t(`${P}.social.telegram`)}</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ background: "#229ED9" }}>
                    TG
                  </div>
                  <input className={inp} value={info.telegram_url} placeholder={t(`${P}.social.telegramPlaceholder`)}
                    onChange={e => setInfo(p => ({ ...p, telegram_url: e.target.value }))} />
                </div>
              </div>
              <div className="pt-1 flex items-center gap-3">
                {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"><ICheck /> {t(`${P}.common.saved`)}</span>}
                <button onClick={saveInfo} disabled={saving}
                  className="bg-[#3356AA] text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-[#2c4892] disabled:opacity-60">
                  {saving ? t(`${P}.common.saving`) : t(`${P}.common.save`)}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ══ ACCREDITATIONS ════════════════════════════════════════════════════ */}
      {activeTab === "accreditations" && (
        <Card title={t(`${P}.accreditations.title`)}
          action={
            <button onClick={() => setShowAddAcc(p => !p)}
              className="flex items-center gap-1 text-sm text-[#3356AA] font-medium hover:text-[#2c4892]">
              <IPlus /> {t(`${P}.common.add`)}
            </button>
          }>
          {myAccreditations.length === 0 && !showAddAcc && (
            <p className="text-sm text-gray-400">{t(`${P}.accreditations.empty`)}</p>
          )}
          <ul className="space-y-2">
            {myAccreditations.map(acc => (
              <li key={acc.id} className="bg-gray-50 rounded-xl px-4 py-3">
                {editAccId === acc.id ? (
                  <div className="space-y-2">
                    <input className={inp} value={editAcc.name} autoFocus placeholder={t(`${P}.accreditations.namePlaceholder`)}
                      onChange={e => setEditAcc(p => ({ ...p, name: e.target.value }))} />
                    <input className={inp} value={editAcc.issued_by} placeholder={t(`${P}.accreditations.issuedByPlaceholder`)}
                      onChange={e => setEditAcc(p => ({ ...p, issued_by: e.target.value }))} />
                    <div>
                      <label className={lbl}>{t(`${P}.accreditations.validUntil`)}</label>
                      <input className={inp} type="date" value={editAcc.valid_until}
                        onChange={e => setEditAcc(p => ({ ...p, valid_until: e.target.value }))} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={async () => {
                        await updateMyAccreditation(acc.id, {
                          name: editAcc.name,
                          issued_by: editAcc.issued_by,
                          valid_until: editAcc.valid_until || null,
                        });
                        setEditAccId(null);
                      }} className="text-sm text-emerald-600 font-medium">{t(`${P}.common.save`)}</button>
                      <button onClick={() => setEditAccId(null)} className="text-sm text-gray-400">{t(`${P}.common.cancel`)}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{acc.name}</p>
                      {acc.issued_by && <p className="text-xs text-gray-500 mt-0.5">{t(`${P}.accreditations.issuedByLabel`, { name: acc.issued_by })}</p>}
                      {acc.valid_until && <p className="text-xs text-gray-400 mt-0.5">{t(`${P}.accreditations.validUntilLabel`, { date: acc.valid_until })}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => {
                        setEditAccId(acc.id);
                        setEditAcc({ name: acc.name, issued_by: acc.issued_by, valid_until: acc.valid_until ?? "" });
                      }} className="text-gray-400 hover:text-blue-600"><IPen /></button>
                      <button onClick={() => deleteMyAccreditation(acc.id)} className="text-gray-400 hover:text-red-500"><ITrash /></button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {showAddAcc && (
            <div className="mt-3 space-y-2">
              <input className={inp} value={newAcc.name} autoFocus placeholder={t(`${P}.accreditations.namePlaceholder`)}
                onChange={e => setNewAcc(p => ({ ...p, name: e.target.value }))} />
              <input className={inp} value={newAcc.issued_by} placeholder={t(`${P}.accreditations.issuedByPlaceholderLong`)}
                onChange={e => setNewAcc(p => ({ ...p, issued_by: e.target.value }))} />
              <div>
                <label className={lbl}>{t(`${P}.accreditations.validUntilOptional`)}</label>
                <input className={inp} type="date" value={newAcc.valid_until}
                  onChange={e => setNewAcc(p => ({ ...p, valid_until: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <button onClick={async () => {
                  if (!newAcc.name.trim()) return;
                  await addMyAccreditation({
                    name: newAcc.name.trim(),
                    issued_by: newAcc.issued_by.trim(),
                    valid_until: newAcc.valid_until || null,
                  });
                  setNewAcc({ name: "", issued_by: "", valid_until: "" });
                  setShowAddAcc(false);
                }} disabled={!newAcc.name.trim()}
                  className="bg-[#3356AA] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2c4892] disabled:opacity-50">
                  {t(`${P}.accreditations.add`)}
                </button>
                <button onClick={() => { setShowAddAcc(false); setNewAcc({ name: "", issued_by: "", valid_until: "" }); }}
                  className="text-sm text-gray-400 hover:text-gray-600">{t(`${P}.common.cancel`)}</button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ══ ACADEMIC MOBILITY ════════════════════════════════════════════════ */}
      {activeTab === "mobility" && (
        <Card title={t(`${P}.mobility.title`)}
          action={
            <button onClick={() => setShowAddMob(p => !p)}
              className="flex items-center gap-1 text-sm text-[#3356AA] font-medium hover:text-[#2c4892]">
              <IPlus /> {t(`${P}.common.add`)}
            </button>
          }>
          {myMobility.length === 0 && !showAddMob && (
            <p className="text-sm text-gray-400">{t(`${P}.mobility.empty`)}</p>
          )}
          <ul className="space-y-2">
            {myMobility.map(mob => (
              <li key={mob.id} className="bg-gray-50 rounded-xl px-4 py-3">
                {editMobId === mob.id ? (
                  <div className="space-y-2">
                    <input className={inp} value={editMob.partner_university_name} autoFocus placeholder={t(`${P}.mobility.namePlaceholder`)}
                      onChange={e => setEditMob(p => ({ ...p, partner_university_name: e.target.value }))} />
                    <input className={inp} value={editMob.country} placeholder={t(`${P}.mobility.country`)}
                      onChange={e => setEditMob(p => ({ ...p, country: e.target.value }))} />
                    <div className="flex gap-2">
                      <button onClick={async () => { await updateMyMobility(mob.id, editMob); setEditMobId(null); }}
                        className="text-sm text-emerald-600 font-medium">{t(`${P}.common.save`)}</button>
                      <button onClick={() => setEditMobId(null)} className="text-sm text-gray-400">{t(`${P}.common.cancel`)}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{mob.partner_university_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{mob.country}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => { setEditMobId(mob.id); setEditMob({ partner_university_name: mob.partner_university_name, country: mob.country }); }}
                        className="text-gray-400 hover:text-blue-600"><IPen /></button>
                      <button onClick={() => deleteMyMobility(mob.id)} className="text-gray-400 hover:text-red-500"><ITrash /></button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {showAddMob && (
            <div className="mt-3 space-y-2">
              <input className={inp} value={newMob.partner_university_name} autoFocus placeholder={t(`${P}.mobility.namePlaceholder`)}
                onChange={e => setNewMob(p => ({ ...p, partner_university_name: e.target.value }))} />
              <input className={inp} value={newMob.country} placeholder={t(`${P}.mobility.country`)}
                onChange={e => setNewMob(p => ({ ...p, country: e.target.value }))} />
              <div className="flex gap-2">
                <button onClick={async () => { if (!newMob.partner_university_name.trim()) return; await addMyMobility(newMob); setNewMob({ partner_university_name: "", country: "" }); setShowAddMob(false); }}
                  disabled={!newMob.partner_university_name.trim()}
                  className="bg-[#3356AA] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2c4892] disabled:opacity-50">{t(`${P}.mobility.add`)}</button>
                <button onClick={() => { setShowAddMob(false); setNewMob({ partner_university_name: "", country: "" }); }}
                  className="text-sm text-gray-400 hover:text-gray-600">{t(`${P}.common.cancel`)}</button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

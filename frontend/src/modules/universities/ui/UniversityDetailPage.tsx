import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  MdLocationOn,
  MdPhone,
  MdMail,
  MdLanguage,
  MdSchool,
  MdCalendarToday,
  MdAttachMoney,
  MdHome,
  MdMilitaryTech,
  MdArrowBack,
  MdOutlineSchool,
  MdBookmark,
  MdBookmarkBorder,
} from "react-icons/md";
import { FaTelegramPlane, FaInstagram } from "react-icons/fa";
import { useUniversityStore } from "../model/universityStore";
import { useAuthStore } from "../../auth/model/authStore";
import type { ProgramsByField } from "../model/types";

function fmtMoney(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₸";
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-4">
      <div className="bg-[#EEF2FF] text-[#3356AA] rounded-xl p-3 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-base font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function ProgramRow({ field, programCode, name, cost, passing, grant, language, programBase }: {
  field: string;
  programCode: string;
  name: string;
  cost: number;
  passing: number;
  grant: number;
  language: string;
  programBase: string;
}) {
  const navigate = useNavigate();
  const { isAuth, favorites, addFavorite, removeFavorite } = useAuthStore();
  const fav = favorites.find((f) => f.program === programCode);
  const [busy, setBusy] = useState(false);

  async function toggleFav(e: React.MouseEvent) {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (fav) await removeFavorite(fav.id);
      else await addFavorite(programCode);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={() => navigate(`${programBase}/${programCode}`)}
      className="grid grid-cols-12 gap-3 items-center bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-[#3356AA]/40 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="col-span-5 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{field} · {programCode}</p>
      </div>
      <div className="col-span-2">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Tuition</p>
        <p className="text-sm font-semibold text-gray-900">{fmtMoney(cost)}</p>
      </div>
      <div className="col-span-2">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Passing</p>
        <p className="text-sm font-semibold text-gray-900">{passing ?? "—"}</p>
      </div>
      <div className="col-span-2">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Grant</p>
        <p className="text-sm font-semibold text-gray-900">{grant ?? "—"}</p>
      </div>
      <div className="col-span-1 flex items-center justify-end gap-2">
        <span className="text-xs text-gray-500 px-2 py-1 rounded-md bg-gray-100">{language || "—"}</span>
        {isAuth && (
          <button
            type="button"
            onClick={toggleFav}
            disabled={busy}
            title={fav ? "Remove from favorites" : "Save program"}
            className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full border transition disabled:opacity-50 ${
              fav
                ? "bg-[#3356AA] border-[#3356AA] text-white hover:bg-[#2c4892]"
                : "bg-white border-gray-200 text-gray-400 hover:text-[#3356AA] hover:border-[#3356AA]/40"
            }`}
          >
            {fav ? <MdBookmark size={16} /> : <MdBookmarkBorder size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function UniversityDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const inApplicant = location.pathname.startsWith("/applicant");
  const programBase = inApplicant ? "/applicant/programs" : "/programs";
  const comparisonPath = inApplicant ? "/applicant/comparison" : "/applicant/comparison";
  const { currentUniversity, fetchUniversityDetail, isLoading, error } = useUniversityStore();
  const {
    isAuth: pageIsAuth,
    fetchFavorites,
    favoriteUniversities,
    fetchFavoriteUniversities,
    addFavoriteUniversity,
    removeFavoriteUniversity,
  } = useAuthStore();
  const [activeField, setActiveField] = useState<string>("all");
  const [uniFavBusy, setUniFavBusy] = useState(false);

  useEffect(() => {
    if (code) fetchUniversityDetail(code);
  }, [code]);

  useEffect(() => {
    if (pageIsAuth) {
      fetchFavorites();
      fetchFavoriteUniversities();
    }
  }, [pageIsAuth]);

  const savedUniRow = favoriteUniversities.find(
    (f) => code != null && String(f.university_code) === String(code)
  );

  async function toggleUniFavorite() {
    if (!code || uniFavBusy) return;
    setUniFavBusy(true);
    try {
      if (savedUniRow) await removeFavoriteUniversity(savedUniRow.id);
      else await addFavoriteUniversity(code);
    } finally {
      setUniFavBusy(false);
    }
  }

  const u = currentUniversity;

  const programsByField = useMemo<ProgramsByField[]>(
    () => u?.programs_by_field ?? [],
    [u]
  );
  const teachingLanguages = u?.teaching_languages ?? [];
  const entranceRequirements = u?.entrance_requirements ?? [];
  const entranceExams = u?.entrance_exams ?? [];
  const accreditations = u?.accreditations ?? [];
  const academicMobility = u?.academic_mobility ?? [];

  const totalPrograms = useMemo(
    () => programsByField.reduce((sum, f) => sum + (f.programs?.length ?? 0), 0),
    [programsByField]
  );

  const visibleFields: ProgramsByField[] = useMemo(() => {
    if (activeField === "all") return programsByField;
    return programsByField.filter((f) => f.code === activeField);
  }, [programsByField, activeField]);

  if (isLoading || !u) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        {error ? <span className="text-red-500">{error}</span> : "Loading university…"}
      </div>
    );
  }

  const initials = (u.name ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#3356AA]"
      >
        <MdArrowBack size={18} /> Back
      </button>

      {/* Header card with cover and logo */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="relative w-full h-56 bg-gradient-to-r from-[#3356AA] to-[#5571c5]">
          {u.cover_url && (
            <img src={u.cover_url} alt="cover" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="px-6 pb-6 -mt-12 relative flex items-end gap-5 flex-wrap">
          {u.logo_url ? (
            <img
              src={u.logo_url}
              alt={u.name}
              className="w-24 h-24 rounded-2xl bg-white object-cover border-4 border-white shadow"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-[#EEF2FF] border-4 border-white shadow flex items-center justify-center">
              <span className="text-3xl font-bold text-[#3356AA]">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0 pt-12">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{u.name}</h1>
              {u.short_name && (
                <span className="text-base font-medium text-gray-500">({u.short_name})</span>
              )}
            </div>
            <div className="flex items-center gap-5 mt-2 text-sm text-gray-500 flex-wrap">
              {u.city && (
                <span className="flex items-center gap-1.5">
                  <MdLocationOn size={16} /> {u.city}, Kazakhstan
                </span>
              )}
              {u.year_established && (
                <span className="flex items-center gap-1.5">
                  <MdCalendarToday size={14} /> Founded {u.year_established}
                </span>
              )}
              {u.website && (
                <a
                  href={u.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#3356AA] hover:underline"
                >
                  <MdLanguage size={16} /> {u.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-12">
            {pageIsAuth && (
              <button
                type="button"
                onClick={toggleUniFavorite}
                disabled={uniFavBusy}
                title={savedUniRow ? "Remove from favorites" : "Save university"}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-60 ${
                  savedUniRow
                    ? "bg-[#3356AA] text-white border-[#3356AA] hover:bg-[#2c4892]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {savedUniRow ? <MdBookmark size={16} /> : <MdBookmarkBorder size={16} />}
                {savedUniRow ? "Saved" : "Save"}
              </button>
            )}
            {u.telegram_url && (
              <a
                href={u.telegram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center hover:opacity-90"
                title="Telegram"
              >
                <FaTelegramPlane />
              </a>
            )}
            {u.instagram_url && (
              <a
                href={u.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                }}
                title="Instagram"
              >
                <FaInstagram />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<MdSchool size={20} />}
          label="Passing score"
          value={u.passing_score || "—"}
        />
        <StatCard
          icon={<MdOutlineSchool size={20} />}
          label="Programs offered"
          value={totalPrograms}
        />
        <StatCard
          icon={<MdAttachMoney size={20} />}
          label="Avg. tuition / year"
          value={u.tuition_cost ? fmtMoney(u.tuition_cost) : "—"}
        />
        <StatCard
          icon={<MdLanguage size={20} />}
          label="Languages"
          value={
            teachingLanguages.length > 0
              ? teachingLanguages.join(", ")
              : "—"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic information — mirrors admin Overview panel */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Basic information</h2>
            <div className="divide-y divide-gray-100">
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                <div className="py-3 pr-6">
                  <p className="text-xs text-gray-400 mb-1">Official name</p>
                  <p className="text-sm font-medium text-gray-900">{u.name || "—"}</p>
                </div>
                <div className="py-3 pl-6">
                  <p className="text-xs text-gray-400 mb-1">Short name</p>
                  <p className="text-sm font-medium text-gray-900">{u.short_name || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                <div className="py-3 pr-6">
                  <p className="text-xs text-gray-400 mb-1">Year founded</p>
                  <p className="text-sm font-medium text-gray-900">{u.year_established || "—"}</p>
                </div>
                <div className="py-3 pl-6">
                  <p className="text-xs text-gray-400 mb-1">City, Country</p>
                  <p className="text-sm font-medium text-gray-900">
                    {u.city ? `${u.city}, Kazakhstan` : "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                <div className="py-3 pr-6">
                  <p className="text-xs text-gray-400 mb-1">Address</p>
                  <p className="text-sm font-medium text-gray-900">{u.address || "—"}</p>
                </div>
                <div className="py-3 pl-6">
                  <p className="text-xs text-gray-400 mb-1">Tuition cost (₸/year)</p>
                  <p className="text-sm font-medium text-gray-900">
                    {u.tuition_cost ? fmtMoney(u.tuition_cost) : "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                <div className="py-3 pr-6">
                  <p className="text-xs text-gray-400 mb-1">Min. passing score (UNT)</p>
                  <p className="text-sm font-medium text-gray-900">
                    {u.passing_score || "—"}
                  </p>
                </div>
                <div className="py-3 pl-6">
                  <p className="text-xs text-gray-400 mb-1">Teaching languages</p>
                  <p className="text-sm font-medium text-gray-900">
                    {teachingLanguages.length > 0 ? teachingLanguages.join(", ") : "—"}
                  </p>
                </div>
              </div>
            </div>

            {u.history && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1.5">About</p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {u.history}
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
              <span
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
                  u.has_dormitory
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <MdHome size={14} /> Dormitory {u.has_dormitory ? "✓" : "✗"}
              </span>
              <span
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
                  u.has_military_department
                    ? "bg-purple-50 text-purple-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <MdMilitaryTech size={14} /> Military dept.{" "}
                {u.has_military_department ? "✓" : "✗"}
              </span>
            </div>
          </div>

          {/* Programs by field */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                Majors & Programs ({totalPrograms})
              </h2>
            </div>

            {programsByField.length === 0 && (
              <p className="text-sm text-gray-400">No programs published yet.</p>
            )}

            {programsByField.length > 0 && (
              <>
                <div className="flex flex-wrap gap-2 mb-5">
                  <button
                    onClick={() => setActiveField("all")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      activeField === "all"
                        ? "bg-[#111928] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All fields
                  </button>
                  {programsByField.map((f) => (
                    <button
                      key={f.code}
                      onClick={() => setActiveField(f.code)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        activeField === f.code
                          ? "bg-[#111928] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {f.name} ({f.programs?.length ?? 0})
                    </button>
                  ))}
                </div>

                <div className="space-y-5">
                  {visibleFields.map((f) => (
                    <div key={f.code}>
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">
                        {f.code} — {f.name}
                      </h3>
                      <div className="space-y-2">
                        {(f.programs ?? []).map((p) => (
                          <ProgramRow
                            key={p.code}
                            field={f.name}
                            programCode={p.code}
                            name={p.local_name}
                            cost={p.cost}
                            passing={p.passing_score}
                            grant={p.grant_score}
                            language={p.language_name}
                            programBase={programBase}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Entrance requirements */}
          {entranceRequirements.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Entrance Requirements</h2>
              <ul className="space-y-2">
                {entranceRequirements.map((req) => (
                  <li
                    key={req.id}
                    className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700"
                  >
                    {req.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Entrance exams */}
          {entranceExams.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Entrance Exams</h2>
              <ul className="space-y-2">
                {entranceExams.map((exam) => (
                  <li key={exam.id} className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{exam.name}</p>
                    {exam.description && (
                      <p className="text-xs text-gray-500 mt-1">{exam.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Contacts */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contacts</h2>
            <ul className="space-y-3 text-sm">
              {u.address && (
                <li className="flex items-start gap-3 text-gray-700">
                  <MdLocationOn className="text-gray-400 mt-0.5" /> {u.address}
                </li>
              )}
              {u.phone && (
                <li className="flex items-center gap-3 text-gray-700">
                  <MdPhone className="text-gray-400" />
                  <a href={`tel:${u.phone}`} className="hover:underline">
                    {u.phone}
                  </a>
                </li>
              )}
              {u.email && (
                <li className="flex items-center gap-3 text-gray-700">
                  <MdMail className="text-gray-400" />
                  <a href={`mailto:${u.email}`} className="hover:underline">
                    {u.email}
                  </a>
                </li>
              )}
              {u.website && (
                <li className="flex items-center gap-3 text-gray-700">
                  <MdLanguage className="text-gray-400" />
                  <a
                    href={u.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3356AA] hover:underline"
                  >
                    {u.website.replace(/^https?:\/\//, "")}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Accreditations */}
          {accreditations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Accreditations</h2>
              <ul className="space-y-2">
                {accreditations.map((acc) => (
                  <li key={acc.id} className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{acc.name}</p>
                    {acc.issued_by && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Issued by: {acc.issued_by}
                      </p>
                    )}
                    {acc.valid_until && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Valid until: {acc.valid_until}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Academic mobility */}
          {academicMobility.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Academic Mobility</h2>
              <ul className="space-y-2">
                {academicMobility.map((m) => (
                  <li key={m.id} className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">
                      {m.partner_university_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.country}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick CTA */}
          <Link
            to={comparisonPath}
            className="block bg-[#3356AA] text-white rounded-2xl px-5 py-4 text-center text-sm font-semibold hover:bg-[#2c4892] transition"
          >
            Compare with other universities →
          </Link>
        </div>
      </div>
    </div>
  );
}

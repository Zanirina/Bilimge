import { useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MdSchool,
  MdAttachMoney,
  MdLanguage,
  MdBookmark,
  MdBookmarkBorder,
  MdArrowBack,
  MdWorkOutline,
  MdLibraryBooks,
  MdTimer,
  MdAccessTime,
} from "react-icons/md";
import { useUniversityStore } from "../model/universityStore";
import { useAuthStore } from "../../auth/model/authStore";

function fmtMoney(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₸";
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center gap-3 mb-2 text-gray-400">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function ProgramDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const inApplicant = location.pathname.startsWith("/applicant");
  const universitiesBase = inApplicant ? "/applicant/universities" : "/universities";
  const {
    currentProgram,
    fetchProgramDetailIntoStore,
    isLoading,
    error,
  } = useUniversityStore();
  const { isAuth, favorites, fetchFavorites, addFavorite, removeFavorite } =
    useAuthStore();

  useEffect(() => {
    if (code) fetchProgramDetailIntoStore(code);
  }, [code, i18n.language]);

  useEffect(() => {
    if (isAuth) fetchFavorites();
  }, [isAuth]);

  const p = currentProgram;
  const fav = p
    ? favorites.find((f) => String(f.program) === String(p.code))
    : undefined;

  if (isLoading || !p) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        {error ? <span className="text-red-500">{error}</span> : t("program.loading")}
      </div>
    );
  }

  const subjects = [p.subject_1, p.subject_2].filter(Boolean);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#3356AA]"
      >
        <MdArrowBack size={18} /> {t("common.back")}
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-start justify-between gap-5 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#3356AA] uppercase tracking-wider mb-2">
              {p.field_of_study_name || t("program.program")}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">
              {p.local_name}
            </h1>
            <p className="text-sm text-gray-500">
              {t("program.offeredBy")}{" "}
              <span className="font-medium text-gray-700">
                {p.university_name}
              </span>{" "}
              · {t("program.code", { code: p.code })}
            </p>
          </div>

          {isAuth && (
            <button
              onClick={() => {
                if (fav) removeFavorite(fav.id);
                else addFavorite(p.code);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                fav
                  ? "bg-[#3356AA] text-white border-[#3356AA] hover:bg-[#2c4892]"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {fav ? <MdBookmark size={16} /> : <MdBookmarkBorder size={16} />}
              {fav ? t("program.saved") : t("program.save")}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          icon={<MdAttachMoney size={20} />}
          label={t("program.stats.tuition")}
          value={fmtMoney(p.cost)}
        />
        <Stat
          icon={<MdSchool size={20} />}
          label={t("program.stats.passingScore")}
          value={p.passing_score ?? "—"}
        />
        <Stat
          icon={<MdSchool size={20} />}
          label={t("program.stats.grantScore")}
          value={p.grant_score ?? "—"}
        />
        <Stat
          icon={<MdLanguage size={20} />}
          label={t("program.stats.teachingLanguage")}
          value={p.language_name || "—"}
        />
      </div>

      {/* Meta row */}
      <div className="bg-white rounded-2xl shadow-sm p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <MdSchool className="text-gray-400" size={20} />
          <div>
            <p className="text-xs text-gray-400">{t("program.degree")}</p>
            <p className="text-sm font-semibold text-gray-900">
              {p.degree ? t(`program.degrees.${p.degree}`, { defaultValue: "—" }) : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MdTimer className="text-gray-400" size={20} />
          <div>
            <p className="text-xs text-gray-400">{t("program.duration")}</p>
            <p className="text-sm font-semibold text-gray-900">
              {p.years_of_study ? t("program.years", { count: p.years_of_study }) : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MdAccessTime className="text-gray-400" size={20} />
          <div>
            <p className="text-xs text-gray-400">{t("program.studyMode")}</p>
            <p className="text-sm font-semibold text-gray-900">
              {p.study_type ? t(`program.studyTypes.${p.study_type}`, { defaultValue: "—" }) : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t("program.about")}</h2>
            {p.description ? (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {p.description}
              </p>
            ) : (
              <p className="text-sm text-gray-400">{t("program.noDescription")}</p>
            )}
          </div>

          {/* Future professions */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <MdWorkOutline className="text-[#3356AA]" size={20} />
              <h2 className="text-lg font-bold text-gray-900">{t("program.futureProfessions")}</h2>
            </div>
            {p.future_professions ? (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {p.future_professions}
              </p>
            ) : (
              <p className="text-sm text-gray-400">{t("program.notSpecified")}</p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* UNT subjects */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <MdLibraryBooks className="text-[#3356AA]" size={20} />
              <h2 className="text-lg font-bold text-gray-900">{t("program.untSubjects")}</h2>
            </div>
            {subjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {subjects.map((s, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">{t("program.notSpecified")}</p>
            )}
          </div>

          {/* University quick link */}
          <Link
            to={`${universitiesBase}/${p.university}`}
            className="block bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition"
          >
            <p className="text-xs text-gray-400 mb-1">{t("program.university")}</p>
            <p className="text-base font-semibold text-gray-900">
              {p.university_name}
            </p>
            <p className="text-xs text-[#3356AA] mt-2 hover:underline">
              {t("program.viewUniversity")}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

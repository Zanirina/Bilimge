import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Banner from "../../../shared/ui/Banner";
import Pagination from "../../../shared/ui/Pagination";
import SearchFilterMajors from "../../../shared/ui/SearchFilterMajors";
import { MdSchool, MdAttachMoney, MdGroups, MdChevronRight } from "react-icons/md";
import majorsBanner from "../../../assets/why-matters.jpg";
import { useUniversityStore } from "../../universities/model/universityStore";
import { tuitionMatches } from "../../../shared/ui/SearchFilterUniversities";
import { programMatchesCombos } from "../../../shared/lib/subjectCombinations";

function fmtMoney(n: number) {
  return n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₸";
}

export default function MajorsPage() {
  const {
    ntcPrograms,
    fields,
    subjects,
    programs,
    universities,
    fetchNtcPrograms,
    fetchSubjects,
    fetchFields,
    fetchPrograms,
    fetchUniversities,
  } = useUniversityStore();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const inApplicant = location.pathname.startsWith("/applicant");
  const programBase = inApplicant ? "/applicant/programs" : "/programs";

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectCombos, setSelectedSubjectCombos] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([]);
  const [selectedTuitions, setSelectedTuitions] = useState<string[]>([]);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const itemsPerPage = 9;

  useEffect(() => {
    fetchNtcPrograms();
    fetchSubjects();
    fetchFields();
    fetchPrograms();
    fetchUniversities();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubjectCombos, selectedFields, selectedDegrees, selectedTuitions]);

  const fieldByCode = useMemo(() => {
    const m: Record<string, string> = {};
    fields.forEach((f) => {
      m[f.code] = f.name;
    });
    return m;
  }, [fields]);

  const subjectById = useMemo(() => {
    const m: Record<string, string> = {};
    subjects.forEach((s) => {
      m[String(s.id)] = s.name;
    });
    return m;
  }, [subjects]);

  const universityNameByCode = useMemo(() => {
    const m: Record<string, string> = {};
    universities.forEach((u) => {
      m[String(u.code)] = u.name;
    });
    return m;
  }, [universities]);

  // Offerings per NTC program: list of UniversityProgram items
  const offeringsByNtcCode = useMemo(() => {
    const m: Record<string, typeof programs> = {};
    programs.forEach((p) => {
      const key = String(p.ntc_program ?? "");
      if (!key) return;
      if (!m[key]) m[key] = [];
      m[key].push(p);
    });
    return m;
  }, [programs]);

  const dataReady = ntcPrograms.length > 0 && fields.length > 0 && subjects.length > 0;

  const filteredPrograms = useMemo(() => {
    return ntcPrograms.filter((program) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        program.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesField =
        selectedFields.length === 0 ||
        selectedFields.includes(String(program.field_of_study));

      const matchesSubject = programMatchesCombos(
        selectedSubjectCombos,
        program.subject_1_name,
        program.subject_2_name
      );

      const offerings = offeringsByNtcCode[program.code] ?? [];

      const matchesDegree =
        selectedDegrees.length === 0 ||
        offerings.some((o) => selectedDegrees.includes(o.degree));

      const matchesTuition =
        selectedTuitions.length === 0 ||
        offerings.some((o) =>
          selectedTuitions.some((b) => tuitionMatches(o.cost, b))
        );

      return matchesSearch && matchesField && matchesSubject && matchesDegree && matchesTuition;
    });
  }, [
    ntcPrograms,
    searchQuery,
    selectedFields,
    selectedSubjectCombos,
    selectedDegrees,
    selectedTuitions,
    offeringsByNtcCode,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPrograms = filteredPrograms.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const clearAll = () => {
    setSelectedSubjectCombos([]);
    setSelectedFields([]);
    setSelectedDegrees([]);
    setSelectedTuitions([]);
  };

  return (
    <div>
      <Banner
        backgroundImage={majorsBanner}
        subtitle={t("majorsPage.bannerSubtitle")}
        title={t("majorsPage.bannerTitle")}
        description={t("majorsPage.bannerDescription")}
      />

      <div className="bg-[#F3F4F6] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-10">
          <SearchFilterMajors
            onSearch={setSearchQuery}
            onSubjectComboChange={setSelectedSubjectCombos}
            onFieldChange={setSelectedFields}
            onDegreeChange={setSelectedDegrees}
            onTuitionChange={setSelectedTuitions}
            selectedSubjectCombos={selectedSubjectCombos}
            selectedFields={selectedFields}
            selectedDegrees={selectedDegrees}
            selectedTuitions={selectedTuitions}
            onClear={clearAll}
          />

          <div className="mb-6 text-[#4B5563] font-medium text-center">
            {t("majorsPage.found", { count: filteredPrograms.length })}
          </div>

          {!dataReady ? (
            <div className="text-center py-12">
              <p className="text-gray-400">{t("majorsPage.loading")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedPrograms.map((program) => {
                const fieldName =
                  fieldByCode[String(program.field_of_study)] ?? program.field_of_study_name;
                const sub1 = subjectById[String(program.subject_1)] ?? program.subject_1_name;
                const sub2 = subjectById[String(program.subject_2)] ?? program.subject_2_name;
                const offerings = offeringsByNtcCode[program.code] ?? [];
                const costs = offerings.map((o) => o.cost).filter((c) => c > 0);
                const minCost = costs.length ? Math.min(...costs) : null;
                const maxCost = costs.length ? Math.max(...costs) : null;
                const isOpen = expandedCode === program.code;

                return (
                  <div
                    key={program.code}
                    className="bg-white rounded-2xl shadow-sm p-6 flex flex-col hover:shadow-md transition"
                  >
                    <div className="bg-[#3356AA] rounded-lg p-3 mb-4 inline-flex items-center justify-center w-12 h-12">
                      <MdSchool className="text-white" size={24} />
                    </div>

                    <h3 className="text-lg font-bold text-[#111928] mb-1 line-clamp-2">
                      {program.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">
                      {program.code} · {fieldName}
                    </p>

                    <div className="space-y-2 text-sm flex-1">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          {t("majorsPage.untSubjects")}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {[sub1, sub2].filter(Boolean).map((s, i) => (
                            <span
                              key={i}
                              className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-md"
                            >
                              {s}
                            </span>
                          ))}
                          {!sub1 && !sub2 && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1 font-semibold">
                            <MdGroups size={12} /> {t("majorsPage.offeredBy")}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {t("majorsPage.unis", { count: offerings.length })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1 font-semibold">
                            <MdAttachMoney size={12} /> {t("majorsPage.tuition")}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {minCost == null
                              ? "—"
                              : minCost === maxCost
                              ? fmtMoney(minCost)
                              : `${fmtMoney(minCost!)} – ${fmtMoney(maxCost!)}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {offerings.length > 0 && (
                      <button
                        onClick={() => setExpandedCode(isOpen ? null : program.code)}
                        className="mt-4 text-sm font-medium text-[#3356AA] hover:underline flex items-center gap-1"
                      >
                        {isOpen ? t("majorsPage.hideOfferings") : t("majorsPage.viewOfferings")}
                        <MdChevronRight
                          size={16}
                          className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
                        />
                      </button>
                    )}

                    {isOpen && offerings.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                        {offerings.map((o) => (
                          <button
                            key={o.code}
                            onClick={() => navigate(`${programBase}/${o.code}`)}
                            className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {universityNameByCode[String(o.university)] ?? o.university_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {o.local_name}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-gray-900 flex-shrink-0">
                              {fmtMoney(o.cost)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {dataReady && paginatedPrograms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary_text text-lg">
                {t("majorsPage.noResults")}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

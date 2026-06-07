import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Banner from "../../../shared/ui/Banner";
import UniversityCard from "../../../shared/ui/UniversityCard";
import Pagination from "../../../shared/ui/Pagination";
import universities from "../../../assets/universities.png";
import SearchFilterUniversities, {
  tuitionMatches,
} from "../../../shared/ui/SearchFilterUniversities";
import { useUniversityStore } from "../model/universityStore";
import { programMatchesCombos } from "../../../shared/lib/subjectCombinations";

export default function UniversitiesPage() {
  const {
    universities: universitiesData,
    programs,
    ntcPrograms,
    isLoading,
    error,
    fetchUniversities,
    fetchPrograms,
    fetchSubjects,
    fetchNtcPrograms,
    fetchFields,
  } = useUniversityStore();

  const { t } = useTranslation();
  const location = useLocation();
  const inApplicant = location.pathname.startsWith("/applicant");
  const basePath = inApplicant ? "/applicant/universities" : "/universities";

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSubjectCombos, setSelectedSubjectCombos] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedTuitions, setSelectedTuitions] = useState<string[]>([]);

  const itemsPerPage = 9;

  useEffect(() => {
    fetchUniversities();
    fetchPrograms();
    fetchSubjects();
    fetchFields();
    fetchNtcPrograms();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCities, selectedSubjectCombos, selectedFields, selectedTuitions]);

  // Build a lookup: ntc_program code -> field_of_study code
  const ntcFieldByCode = useMemo(() => {
    const m: Record<string, string> = {};
    ntcPrograms.forEach((np) => {
      m[np.code] = String(np.field_of_study);
    });
    return m;
  }, [ntcPrograms]);

  // Aggregate programs per university
  const aggByUniversity = useMemo(() => {
    const agg: Record<
      string,
      {
        majors: Set<string>;
        fieldCodes: Set<string>;
        pairs: Array<{ s1: string; s2: string }>;
        minCost: number | null;
      }
    > = {};
    programs.forEach((p) => {
      const key = String(p.university ?? "");
      if (!key) return;
      if (!agg[key]) {
        agg[key] = {
          majors: new Set(),
          fieldCodes: new Set(),
          pairs: [],
          minCost: null,
        };
      }
      const a = agg[key];
      a.majors.add(p.local_name);
      const fieldCode = ntcFieldByCode[String(p.ntc_program ?? "")];
      if (fieldCode) a.fieldCodes.add(fieldCode);
      if (p.subject_1_name || p.subject_2_name) {
        a.pairs.push({ s1: p.subject_1_name ?? "", s2: p.subject_2_name ?? "" });
      }
      if (typeof p.cost === "number") {
        a.minCost = a.minCost == null ? p.cost : Math.min(a.minCost, p.cost);
      }
    });
    return agg;
  }, [programs, ntcFieldByCode]);

  const filteredUniversities = useMemo(() => {
    return universitiesData.filter((uni) => {
      const agg = aggByUniversity[String(uni.code)];
      const matchesSearch =
        searchQuery.trim() === "" ||
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (uni.short_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesCity =
        selectedCities.length === 0 || selectedCities.includes(uni.city);

      const matchesField =
        selectedFields.length === 0 ||
        (agg && selectedFields.some((f) => agg.fieldCodes.has(f)));

      const matchesSubject =
        selectedSubjectCombos.length === 0 ||
        (agg &&
          agg.pairs.some((pp) =>
            programMatchesCombos(selectedSubjectCombos, pp.s1, pp.s2)
          ));

      const matchesTuition =
        selectedTuitions.length === 0 ||
        (agg &&
          agg.minCost != null &&
          selectedTuitions.some((bucket) => tuitionMatches(agg.minCost, bucket)));

      return (
        matchesSearch && matchesCity && matchesField && matchesSubject && matchesTuition
      );
    });
  }, [
    universitiesData,
    aggByUniversity,
    searchQuery,
    selectedCities,
    selectedSubjectCombos,
    selectedFields,
    selectedTuitions,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredUniversities.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUniversities = filteredUniversities.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAll = () => {
    setSelectedCities([]);
    setSelectedSubjectCombos([]);
    setSelectedFields([]);
    setSelectedTuitions([]);
  };

  return (
    <div>
      <Banner
        backgroundImage={universities}
        subtitle={t("universitiesPage.bannerSubtitle")}
        title={t("universitiesPage.bannerTitle")}
        description={t("universitiesPage.bannerDescription")}
      />

      <div className="bg-[#F3F4F6] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-10">
          <SearchFilterUniversities
            onSearch={setSearchQuery}
            onCityChange={setSelectedCities}
            onSubjectComboChange={setSelectedSubjectCombos}
            onFieldChange={setSelectedFields}
            onTuitionChange={setSelectedTuitions}
            selectedCities={selectedCities}
            selectedSubjectCombos={selectedSubjectCombos}
            selectedFields={selectedFields}
            selectedTuitions={selectedTuitions}
            onClear={clearAll}
          />

          <div className="mb-6 text-[#4B5563] font-medium text-center">
            {t("universitiesPage.found", { count: filteredUniversities.length })}
          </div>

          {isLoading && universitiesData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#4B5563] text-lg">{t("universitiesPage.loading")}</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          )}

          {!error && paginatedUniversities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedUniversities.map((uni) => {
                const agg = aggByUniversity[String(uni.code)];
                const majors = agg ? Array.from(agg.majors) : [];
                return (
                  <UniversityCard
                    key={uni.code}
                    id={String(uni.code)}
                    name={uni.name}
                    shortName={uni.short_name}
                    city={uni.city}
                    passingScore={String(uni.passing_score)}
                    image={uni.cover_url ?? ""}
                    programs={majors}
                    programCount={majors.length}
                    tuitionCost={uni.tuition_cost ?? agg?.minCost ?? null}
                    basePath={basePath}
                  />
                );
              })}
            </div>
          )}

          {!isLoading && !error && filteredUniversities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary_text text-lg">
                {t("universitiesPage.noResults")}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

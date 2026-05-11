import { useState, useMemo, useEffect } from "react";
import Banner from "../../../shared/ui/Banner";
import Pagination from "../../../shared/ui/Pagination";
import SearchFilterMajors from "../../../shared/ui/SearchFilterMajors";
import { Card } from "../../../shared/ui/Card";
import { MdSchool } from "react-icons/md";
import majorsBanner from "../../../assets/why-matters.jpg";
import { useUniversityStore } from "../../universities/model/universityStore";

export default function MajorsPage() {
  const { ntcPrograms, fields, subjects, fetchNtcPrograms, fetchSubjects, fetchFields } = useUniversityStore();

  const getField = (id: number) => fields.find((f) => f.code === String(id));
  const getSubject = (id: number) => subjects.find((s) => s.id === id);

  const dataReady = ntcPrograms.length > 0 && fields.length > 0 && subjects.length > 0;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const itemsPerPage = 9;

  useEffect(() => {
    fetchNtcPrograms();
    fetchSubjects();
    fetchFields();
  }, []);

  const filteredPrograms = useMemo(() => {
  return ntcPrograms.filter((program) => {
    const matchesSearch =
      program.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesField =
      selectedFields.length === 0 ||
      selectedFields.includes(String(program.field_of_study)); 

    const matchesSubject =
      selectedSubjects.length === 0 ||
      selectedSubjects.includes(String(program.subject_1)) || 
      selectedSubjects.includes(String(program.subject_2));

    return matchesSearch && matchesField && matchesSubject;
  });
}, [ntcPrograms, searchQuery, selectedFields, selectedSubjects]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubjects, selectedFields]);

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <Banner
        backgroundImage={majorsBanner}
        subtitle="Discover Your Future Field"
        title="Majors & Study Programs"
        description="Explore different fields of study and discover which universities in Kazakhstan offer programs that match your interests."
      />

      <div className="bg-[#F3F4F6] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-10">
          <SearchFilterMajors
            onSearch={setSearchQuery}
            onSubjectChange={setSelectedSubjects}
            onFieldChange={setSelectedFields}
            selectedSubjects={selectedSubjects}
            selectedFields={selectedFields}
          />

          <div className="mb-6 text-[#4B5563] font-medium text-center">
            Found {filteredPrograms.length} majors
          </div>

          {!dataReady ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedPrograms.map((program) => {
                const field = getField(program.field_of_study);
                const subject1 = getSubject(program.subject_1 as number);
                const subject2 = getSubject(program.subject_2 as number);

                console.log("field lookup:", program.field_of_study, "→", field); // ← temp debug

                return (
                  <Card
                    key={program.code}
                    icon={<MdSchool className="text-white w-6 h-6" />}
                    title={program.name}
                    description={
                      <div className="text-sm text-gray-500 mt-2 space-y-1">
                        <p>
                          <span className="font-medium text-gray-600">Field:</span>{" "}
                          {field?.name ?? `(${program.field_of_study})`}
                        </p>
                        <p>
                          <span className="font-medium text-gray-600">Subjects:</span>{" "}
                          {[subject1?.name, subject2?.name].filter(Boolean).join(" + ") || "—"}
                        </p>
                        <p>
                          <span className="font-medium text-gray-600">Code:</span>{" "}
                          {program.code}
                        </p>
                      </div>
                    }
                  />
                );
              })}
            </div>
          )}

          {paginatedPrograms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary_text text-lg">
                No majors found. Try adjusting your filters.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
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
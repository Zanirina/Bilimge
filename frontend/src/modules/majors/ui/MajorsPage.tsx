import { useState, useMemo, useEffect } from "react";
import Banner from "../../../shared/ui/Banner";
import Pagination from "../../../shared/ui/Pagination";
import SearchFilterMajors from "../../../shared/ui/SearchFilterMajors";
import { Card } from "../../../shared/ui/Card";
import { MdSchool } from "react-icons/md";
import majorsBanner from "../../../assets/why-matters.jpg";

interface Major {
  id: string;
  name: string;
  subjects: string[];
  minScore: string;
  universities: number;
}

const MAJORS_DATA: Major[] = [
  {
    id: "1",
    name: "Information Technologies",
    subjects: ["Mathematics", "Informatics"],
    minScore: "50+",
    universities: 30,
  },
  {
    id: "2",
    name: "Business Administration",
    subjects: ["Mathematics", "Geography"],
    minScore: "85+",
    universities: 12,
  },
  {
    id: "3",
    name: "Finance",
    subjects: ["Mathematics", "Geography"],
    minScore: "90+",
    universities: 10,
  },
  {
    id: "4",
    name: "Architecture",
    subjects: ["Creative Exam"],
    minScore: "85+",
    universities: 6,
  },
  {
    id: "5",
    name: "Law",
    subjects: ["KZ History", "World History"],
    minScore: "88+",
    universities: 13,
  },
  {
    id: "6",
    name: "Primary Education",
    subjects: ["Biology", "Geography"],
    minScore: "75+",
    universities: 14,
  },
  {
    id: "7",
    name: "International Relations",
    subjects: ["World History", "English"],
    minScore: "90+",
    universities: 9,
  },
  {
    id: "8",
    name: "Civil Engineering",
    subjects: ["Mathematics", "Physics"],
    minScore: "88+",
    universities: 11,
  },
  {
    id: "9",
    name: "Mathematics Teacher",
    subjects: ["Mathematics", "Physics"],
    minScore: "88+",
    universities: 11,
  },
];

export default function MajorsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const itemsPerPage = 6;

  // 🔎 Filtering
  const filteredMajors = useMemo(() => {
    return MAJORS_DATA.filter((major) => {
      const matchesSearch =
        major.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject =
        !selectedSubject ||
        major.subjects.some((s) =>
          s.toLowerCase().includes(selectedSubject.toLowerCase())
        );

      return matchesSearch && matchesSubject;
    });
  }, [searchQuery, selectedSubject]);

  // ✅ reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject]);

  const totalPages = Math.ceil(filteredMajors.length / itemsPerPage);

  const paginatedMajors = filteredMajors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            onSubjectChange={setSelectedSubject}
          />

          <div className="mb-6 text-[#4B5563] font-medium text-center">
            Found {filteredMajors.length} majors
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedMajors.map((major) => (
              <Card
                key={major.id}
                icon={<MdSchool className="text-white w-6 h-6" />}
                title={major.name}
                description={
                  <div className="text-sm text-gray-500 mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Subjects:</span>{" "}
                      {major.subjects.join(" + ")}
                    </p>
                    <p>
                      <span className="font-medium">
                        Minimum Passing Score:
                      </span>{" "}
                      {major.minScore}
                    </p>
                    <p>
                      <span className="font-medium">Universities:</span>{" "}
                      {major.universities}
                    </p>
                  </div>
                }
              />
            ))}
          </div>

          {paginatedMajors.length === 0 && (
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
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
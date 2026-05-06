import { useState, useMemo } from "react";
import Banner from "../../../shared/ui/Banner";
import UniversityCard from "../../../shared/ui/UniversityCard";
import Pagination from "../../../shared/ui/Pagination";
import universities from "../../../assets/universities.png";
import SearchFilterUniversities from "../../../shared/ui/SearchFilterUniversities";

interface University {
  id: string;
  image: string;
  name: string;
  city: string;
  programs: string[];
  passingScore: string;
}

const UNIVERSITIES_DATA: University[] = [
  {
    id: "1",
    image: "https://via.placeholder.com/300x200?text=AITU",
    name: "Astana IT University (AITU)",
    city: "Astana",
    programs: ["Computer Science", "AI", "Cybersecurity"],
    passingScore: "80+",
  },
  {
    id: "2",
    image: "https://via.placeholder.com/300x200?text=KBTU",
    name: "Kazakh-British Technical University (KBTU)",
    city: "Almaty",
    programs: ["Engineering", "IT", "Oil & Gas"],
    passingScore: "75+",
  },
  {
    id: "3",
    image: "https://via.placeholder.com/300x200?text=ENU",
    name: "L.N. Gumilyov Eurasian National University (ENU)",
    city: "Astana",
    programs: ["Engineering", "Science", "Humanities"],
    passingScore: "85+",
  },
  {
    id: "4",
    image: "https://via.placeholder.com/300x200?text=KazNU",
    name: "Al-Farabi Kazakh National University (KazNU)",
    city: "Almaty",
    programs: ["Engineering", "IT", "Architecture"],
    passingScore: "80+",
  },
  {
    id: "5",
    image: "https://via.placeholder.com/300x200?text=EKTU",
    name: "D. Serikbayev East Kazakhstan Technical University (EKTU)",
    city: "Ust-Kamenogorsk",
    programs: ["Engineering", "IT", "Architecture"],
    passingScore: "80+",
  },
  {
    id: "6",
    image: "https://via.placeholder.com/300x200?text=KazNPU",
    name: "Abai Kazakh National Pedagogical University (KazNPU)",
    city: "Almaty",
    programs: ["Education", "Languages", "Pedagogy"],
    passingScore: "75+",
  },
];

export default function UniversitiesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const itemsPerPage = 6;

  // Filter universities based on search and filters
  const filteredUniversities = useMemo(() => {
    return UNIVERSITIES_DATA.filter((uni) => {
      const matchesSearch =
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.programs.some((p) =>
          p.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCity =
        !selectedCity || uni.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesSubject =
        !selectedSubject ||
        uni.programs.some((p) =>
          p.toLowerCase().includes(selectedSubject.toLowerCase())
        );

      return matchesSearch && matchesCity && matchesSubject;
    });
  }, [searchQuery, selectedCity, selectedSubject]);

  const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
  const paginatedUniversities = filteredUniversities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewDetails = (id: string) => {
    console.log(`View details for university: ${id}`);
    // Navigate to university details page
  };

  return (
    <div>
      <Banner
        backgroundImage={universities}
        subtitle="Find the Best University for You"
        title="Universities in Kazakhstan"
        description="Explore universities, compare programs and admission requirements, and find the best option for your academic goals."
      />

      <div className="bg-[#F3F4F6] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-10">
          {/* Search and Filters */}
          <SearchFilterUniversities
            onSearch={setSearchQuery}
            onCityChange={setSelectedCity}
            onSubjectChange={setSelectedSubject}
            onMajorChange={() => {}}
            onTuitionChange={() => {}}
          />

          {/* Results count */}
          <div className="mb-6 text-[#4B5563] font-medium text-center">
            Found {filteredUniversities.length} universities
          </div>

          {/* University Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedUniversities.map((uni) => (
              <UniversityCard
                key={uni.id}
                {...uni}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Empty state */}
          {paginatedUniversities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary_text text-lg">
                No universities found. Try adjusting your filters.
              </p>
            </div>
          )}

          {/* Pagination */}
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
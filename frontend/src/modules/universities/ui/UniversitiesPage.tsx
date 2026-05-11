import { useState, useMemo, useEffect } from "react";
import Banner from "../../../shared/ui/Banner";
import UniversityCard from "../../../shared/ui/UniversityCard";
import Pagination from "../../../shared/ui/Pagination";
import universities from "../../../assets/universities.png";
import SearchFilterUniversities from "../../../shared/ui/SearchFilterUniversities";
import { useUniversityStore } from "../model/universityStore";

export default function UniversitiesPage() {
  const { universities: universitiesData, isLoading, error, fetchUniversities, fetchSubjects } = useUniversityStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const filteredUniversities = useMemo(() => {
    return universitiesData.filter((uni) => {
      const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCities.length === 0 || selectedCities.includes(uni.city);
      return matchesSearch && matchesCity;
    });
  }, [universitiesData, searchQuery, selectedCities]);

  const itemsPerPage = 9;

  useEffect(() => {
    fetchUniversities();
    fetchSubjects();
  }, []);

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
          <SearchFilterUniversities
            onSearch={setSearchQuery}
            onCityChange={setSelectedCities}
            onSubjectChange={setSelectedSubjects}
            onMajorChange={() => { }}
            onTuitionChange={() => { }}
            selectedCities={selectedCities}
            selectedSubjects={selectedSubjects}
          />

          {/* Results count */}
          <div className="mb-6 text-[#4B5563] font-medium text-center">
            Found {filteredUniversities.length} universities
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-[#4B5563] text-lg">Loading universities...</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          )}

          {/* University Cards Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedUniversities.map((uni) => (
                <UniversityCard
                  key={uni.code}
                  id={uni.code}
                  name={uni.name}
                  city={uni.city}
                  passingScore={String(uni.passing_score)}
                  image=""
                  programs={[]}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && paginatedUniversities.length === 0 && (
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
import { MdGridView } from "react-icons/md";
import SearchInput from "./SearchInput";
import FilterSelect from "./FilterSelect";
import { useUniversityStore } from "../../modules/universities/model/universityStore";
import { useMemo } from "react";

export interface SearchFilterUniversitiesProps {
  onSearch: (query: string) => void;
  onCityChange: (values: string[]) => void;
  onSubjectChange: (values: string[]) => void;
  onMajorChange: (values: string[]) => void;
  onTuitionChange: (values: string[]) => void;
  onViewChange?: (view: string) => void;
  selectedCities?: string[];
  selectedSubjects?: string[];
  selectedMajors?: string[];
  selectedTuitions?: string[];
}

const MAJOR_OPTIONS = [
  { value: "cs", label: "Computer Science" },
  { value: "ee", label: "Electrical Engineering" },
];

const TUITION_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function SearchFilterUniversities({
  onSearch,
  onCityChange,
  onSubjectChange,
  onMajorChange,
  onTuitionChange,
  onViewChange,
  selectedCities = [],
  selectedSubjects = [],
  selectedMajors = [],
  selectedTuitions = [],
}: SearchFilterUniversitiesProps) {
  const { universities, subjects } = useUniversityStore();

  const cityOptions = useMemo(() => {
    const unique = [...new Set(universities.map((u) => u.city))];
    return unique.map((city) => ({ value: city, label: city }));
  }, [universities]);

  const subjectOptions = useMemo(() => {
    return subjects.map((s) => ({ value: String(s.id), label: s.name }));
  }, [subjects]);

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchInput onSearch={onSearch} />

        <div className="flex gap-7 items-center flex-wrap">
          <FilterSelect
            label="City"
            options={cityOptions}
            onChange={onCityChange}
            values={selectedCities}
          />
          <FilterSelect
            label="Subjects"
            options={subjectOptions}
            onChange={onSubjectChange}
            values={selectedSubjects}
          />
          <FilterSelect
            label="Major"
            options={MAJOR_OPTIONS}
            onChange={onMajorChange}
            values={selectedMajors}
          />
          <FilterSelect
            label="Tuition"
            options={TUITION_OPTIONS}
            onChange={onTuitionChange}
            values={selectedTuitions}
          />
        </div>

        <button
          onClick={() => onViewChange?.("grid")}
          className="transition flex items-center justify-center"
        >
          <MdGridView size={36} className="text-[#3356AA]" />
        </button>
      </div>
    </div>
  );
}
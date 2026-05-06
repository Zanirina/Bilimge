import { MdGridView } from "react-icons/md";
import SearchInput from "./SearchInput";
import FilterSelect from "./FilterSelect";

export interface SearchFilterUniversitiesProps {
  onSearch: (query: string) => void;
  onCityChange: (city: string) => void;
  onSubjectChange: (subject: string) => void;
  onMajorChange: (major: string) => void;
  onTuitionChange: (tuition: string) => void;
  onViewChange?: (view: string) => void;
}

const CITY_OPTIONS = [
  { value: "almaty", label: "Almaty" },
  { value: "astana", label: "Astana" },
  { value: "karaganda", label: "Karaganda" },
];

const SUBJECT_OPTIONS = [
  { value: "engineering", label: "Engineering" },
  { value: "business", label: "Business" },
  { value: "medicine", label: "Medicine" },
];

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
}: SearchFilterUniversitiesProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <SearchInput onSearch={onSearch} />

        {/* Filters */}
        <div className="flex gap-7 items-center flex-wrap">
          <FilterSelect
            label="City"
            options={CITY_OPTIONS}
            onChange={onCityChange}
          />
          <FilterSelect
            label="Subjects"
            options={SUBJECT_OPTIONS}
            onChange={onSubjectChange}
          />
          <FilterSelect
            label="Major"
            options={MAJOR_OPTIONS}
            onChange={onMajorChange}
          />
          <FilterSelect
            label="Tuition"
            options={TUITION_OPTIONS}
            onChange={onTuitionChange}
          />
        </div>

        {/* Grid icon button */}
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

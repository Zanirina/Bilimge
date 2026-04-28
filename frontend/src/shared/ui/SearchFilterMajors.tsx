import { MdGridView } from "react-icons/md";
import SearchInput from "./SearchInput";
import FilterSelect from "./FilterSelect";

export interface SearchFilterMajorsProps {
  onSearch: (query: string) => void;
  onSubjectChange: (subject: string) => void;
  onViewChange?: (view: string) => void;
}

const SUBJECT_OPTIONS = [
  { value: "mathematics", label: "Mathematics" },
  { value: "informatics", label: "Informatics" },
  { value: "physics", label: "Physics" },
  { value: "geography", label: "Geography" },
  { value: "biology", label: "Biology" },
  { value: "chemistry", label: "Chemistry" },
  { value: "history", label: "History" },
  { value: "english", label: "English" },
  { value: "creative", label: "Creative Exam" },
];

export default function SearchFilterMajors({
  onSearch,
  onSubjectChange,
  onViewChange,
}: SearchFilterMajorsProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <SearchInput onSearch={onSearch} />

        {/* Filters */}
        <div className="flex gap-6 items-center flex-wrap">
          <FilterSelect
            label="Subjects"
            options={SUBJECT_OPTIONS}
            onChange={onSubjectChange}
          />
        </div>

        {/* View toggle */}
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
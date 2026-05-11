import { MdGridView } from "react-icons/md";
import SearchInput from "./SearchInput";
import FilterSelect from "./FilterSelect";
import { useUniversityStore } from "../../modules/universities/model/universityStore";
import { useMemo } from "react";

export interface SearchFilterMajorsProps {
  onSearch: (query: string) => void;
  onSubjectChange: (values: string[]) => void;
  onFieldChange?: (values: string[]) => void;
  onViewChange?: (view: string) => void;
  selectedSubjects?: string[];
  selectedFields?: string[];
}

const DEGREE_OPTIONS = [
  { value: "college", label: "College" },
  { value: "bachelor", label: "Bachelor" },
  { value: "master", label: "Master" },
  { value: "phd", label: "PhD" },
];

const TUITION_OPTIONS = [
  { value: "low", label: "Under 500,000 ₸" },
  { value: "medium", label: "500,000 – 1,000,000 ₸" },
  { value: "high", label: "Over 1,000,000 ₸" },
];

export default function SearchFilterMajors({
  onSearch,
  onSubjectChange,
  onFieldChange,
  onViewChange,
  selectedSubjects = [],
  selectedFields = [],
}: SearchFilterMajorsProps) {
  const { subjects, fields } = useUniversityStore();

  const subjectOptions = useMemo(() =>
    subjects.map((s) => ({ value: String(s.id), label: s.name })),
    [subjects]
  );

  const fieldOptions = useMemo(() =>
    fields.map((f) => ({ value: f.code, label: f.name })),
    [fields]
  );

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <SearchInput onSearch={onSearch} />

        <div className="flex gap-6 items-center flex-wrap">
          <FilterSelect
            label="Field"
            options={fieldOptions}
            onChange={onFieldChange ?? (() => {})}
            values={selectedFields}
          />
          <FilterSelect
            label="Subjects"
            options={subjectOptions}
            onChange={onSubjectChange}
            values={selectedSubjects}
          />
          <FilterSelect
            label="Degree"
            options={DEGREE_OPTIONS}
            onChange={() => {}}
            values={[]}
          />
          <FilterSelect
            label="Tuition"
            options={TUITION_OPTIONS}
            onChange={() => {}}
            values={[]}
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
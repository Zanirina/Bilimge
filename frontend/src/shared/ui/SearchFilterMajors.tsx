import SearchInput from "./SearchInput";
import FilterSelect from "./FilterSelect";
import { useUniversityStore } from "../../modules/universities/model/universityStore";
import { useMemo } from "react";
import { SUBJECT_COMBINATIONS } from "../lib/subjectCombinations";

export interface SearchFilterMajorsProps {
  onSearch: (query: string) => void;
  onSubjectComboChange: (values: string[]) => void;
  onFieldChange: (values: string[]) => void;
  onDegreeChange: (values: string[]) => void;
  onTuitionChange: (values: string[]) => void;
  selectedSubjectCombos?: string[];
  selectedFields?: string[];
  selectedDegrees?: string[];
  selectedTuitions?: string[];
  onClear?: () => void;
}

export const DEGREE_OPTIONS = [
  { value: "college", label: "College" },
  { value: "bachelor", label: "Bachelor" },
  { value: "master", label: "Master" },
  { value: "phd", label: "PhD" },
];

export const TUITION_OPTIONS = [
  { value: "low", label: "Under 500,000 ₸" },
  { value: "medium", label: "500,000 – 1,000,000 ₸" },
  { value: "high", label: "Over 1,000,000 ₸" },
];

export default function SearchFilterMajors({
  onSearch,
  onSubjectComboChange,
  onFieldChange,
  onDegreeChange,
  onTuitionChange,
  selectedSubjectCombos = [],
  selectedFields = [],
  selectedDegrees = [],
  selectedTuitions = [],
  onClear,
}: SearchFilterMajorsProps) {
  const { fields } = useUniversityStore();

  const subjectComboOptions = useMemo(
    () => SUBJECT_COMBINATIONS.map((c) => ({ value: c.id, label: c.label })),
    []
  );

  const fieldOptions = useMemo(
    () => fields.map((f) => ({ value: f.code, label: f.name })),
    [fields]
  );

  const activeCount =
    selectedFields.length +
    selectedSubjectCombos.length +
    selectedDegrees.length +
    selectedTuitions.length;

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchInput onSearch={onSearch} />

        <div className="flex gap-3 items-center flex-wrap">
          <FilterSelect
            label="Field"
            options={fieldOptions}
            onChange={onFieldChange}
            values={selectedFields}
          />
          <FilterSelect
            label="Subject pair"
            options={subjectComboOptions}
            onChange={onSubjectComboChange}
            values={selectedSubjectCombos}
          />
          <FilterSelect
            label="Degree"
            options={DEGREE_OPTIONS}
            onChange={onDegreeChange}
            values={selectedDegrees}
          />
          <FilterSelect
            label="Tuition"
            options={TUITION_OPTIONS}
            onChange={onTuitionChange}
            values={selectedTuitions}
          />
          {activeCount > 0 && onClear && (
            <button
              onClick={onClear}
              className="px-3 h-[50px] text-sm text-[#3356AA] font-medium hover:underline"
            >
              Clear all ({activeCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

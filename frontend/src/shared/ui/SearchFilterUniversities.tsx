import SearchInput from "./SearchInput";
import FilterSelect from "./FilterSelect";
import { useUniversityStore } from "../../modules/universities/model/universityStore";
import { useMemo } from "react";
import { SUBJECT_COMBINATIONS } from "../lib/subjectCombinations";

export interface SearchFilterUniversitiesProps {
  onSearch: (query: string) => void;
  onCityChange: (values: string[]) => void;
  onSubjectComboChange: (values: string[]) => void;
  onFieldChange: (values: string[]) => void;
  onTuitionChange: (values: string[]) => void;
  selectedCities?: string[];
  selectedSubjectCombos?: string[];
  selectedFields?: string[];
  selectedTuitions?: string[];
  onClear?: () => void;
}

export const TUITION_OPTIONS = [
  { value: "low", label: "Under 500,000 ₸" },
  { value: "medium", label: "500,000 – 1,000,000 ₸" },
  { value: "high", label: "Over 1,000,000 ₸" },
];

export const tuitionMatches = (cost: number | null | undefined, bucket: string) => {
  if (cost == null) return false;
  if (bucket === "low") return cost < 500_000;
  if (bucket === "medium") return cost >= 500_000 && cost <= 1_000_000;
  if (bucket === "high") return cost > 1_000_000;
  return true;
};

export default function SearchFilterUniversities({
  onSearch,
  onCityChange,
  onSubjectComboChange,
  onFieldChange,
  onTuitionChange,
  selectedCities = [],
  selectedSubjectCombos = [],
  selectedFields = [],
  selectedTuitions = [],
  onClear,
}: SearchFilterUniversitiesProps) {
  const { universities, fields } = useUniversityStore();

  const cityOptions = useMemo(() => {
    const unique = [...new Set(universities.map((u) => u.city))].filter(Boolean);
    return unique.sort().map((city) => ({ value: city, label: city }));
  }, [universities]);

  const subjectComboOptions = useMemo(
    () => SUBJECT_COMBINATIONS.map((c) => ({ value: c.id, label: c.label })),
    []
  );

  const fieldOptions = useMemo(() => {
    return fields.map((f) => ({ value: f.code, label: f.name }));
  }, [fields]);

  const activeCount =
    selectedCities.length +
    selectedSubjectCombos.length +
    selectedFields.length +
    selectedTuitions.length;

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchInput onSearch={onSearch} />

        <div className="flex gap-3 items-center flex-wrap">
          <FilterSelect
            label="City"
            options={cityOptions}
            onChange={onCityChange}
            values={selectedCities}
          />
          <FilterSelect
            label="Major"
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

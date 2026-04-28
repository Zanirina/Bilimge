import { MdKeyboardArrowDown } from "react-icons/md";

export interface FilterSelectProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  value?: string;
}

export default function FilterSelect({
  label,
  options,
  onChange,
  value = "",
}: FilterSelectProps) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[135px] px-4 py-3 border border-[#DFE4EA] rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-[#6B7280] appearance-none bg-white cursor-pointer pr-8"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <MdKeyboardArrowDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#6B7280]" size={20} />
    </div>
  );
}

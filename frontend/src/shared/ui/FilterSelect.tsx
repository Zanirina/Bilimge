import { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowDown, MdCheck } from "react-icons/md";

export interface FilterSelectProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  onChange: (values: string[]) => void;
  values?: string[];
}

export default function FilterSelect({
  label,
  options,
  onChange,
  values = [],
}: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (value: string) => {
    const updated = values.includes(value)
      ? values.filter((v) => v !== value)
      : [...values, value];
    onChange(updated);
  };

  const displayLabel = values.length > 0
    ? `${label} (${values.length})`
    : label;

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-[150px] px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white cursor-pointer flex items-center justify-between gap-2 transition
          ${values.length > 0
            ? "border-[#3356AA] text-[#3356AA]"
            : "border-[#DFE4EA] text-[#6B7280]"
          }`}
      >
        <span className="text-sm truncate">{displayLabel}</span>
        <MdKeyboardArrowDown
          size={20}
          className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-[200px] bg-white border border-[#DFE4EA] rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">No options</p>
          )}
          {options.map((option) => {
            const selected = values.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition
                  ${selected ? "text-[#3356AA] font-medium" : "text-[#111928]"}`}
              >
                <span>{option.label}</span>
                {selected && <MdCheck size={16} className="text-[#3356AA]" />}
              </button>
            );
          })}
          {values.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 border-t border-[#DFE4EA] transition"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
// Shared EN / RU / KZ segmented control for the multilingual admin edit forms.
import { EDIT_LANGS } from "../lib/i18n/multilang";
import type { Lang } from "../lib/i18n/multilang";

export function LangPicker({
  value,
  onChange,
  label,
}: {
  value: Lang;
  onChange: (l: Lang) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit" title={label}>
      {EDIT_LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => onChange(l.code)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
            value === l.code ? "bg-white text-[#3356AA] shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

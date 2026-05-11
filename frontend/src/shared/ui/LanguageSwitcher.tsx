import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "ru", label: "Русский", short: "RU" },
  { code: "kk", label: "Қазақша", short: "KZ" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative inline-flex justify-center" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-md px-2.5 py-2 transition"
      >
        <span className="text-sm font-semibold text-[#111928]">{current.short}</span>
      </button>

      {open && (
        <>
          {/* Arrow pointing up */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 mt-[3px] bg-white border-l border-t border-[#DFE4EA] rotate-45 z-50" />

          {/* Dropdown centered below button */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-[#DFE4EA] rounded-md shadow-lg z-40 p-1 flex gap-1 whitespace-nowrap">
            {LANGUAGES.map((lang) => {
              const isActive = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`px-2.5 py-1.5 rounded text-xs font-semibold transition
                    ${isActive
                      ? "bg-gray-100 text-[#3356AA]"
                      : "text-gray-500 hover:text-[#111928] hover:bg-gray-50"
                    }`}
                >
                  {lang.short}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
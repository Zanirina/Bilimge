import { useEffect, useState } from "react";
import {
  MdNotificationsActive,
  MdLanguage,
  MdLightMode,
  MdDarkMode,
  MdCheckCircle,
} from "react-icons/md";

type Theme = "light" | "dark";
type Lang = "en" | "ru" | "kz";

type Prefs = {
  email_announcements: boolean;
  email_grants: boolean;
  push_chat: boolean;
  language: Lang;
  theme: Theme;
};

const STORAGE_KEY = "bilimge.prefs.v1";

const DEFAULT_PREFS: Prefs = {
  email_announcements: true,
  email_grants: true,
  push_chat: true,
  language: "en",
  theme: "light",
};

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

function applyLanguage(lang: Lang) {
  document.documentElement.setAttribute("lang", lang);
}

function prefsEqual(a: Prefs, b: Prefs) {
  return (
    a.email_announcements === b.email_announcements &&
    a.email_grants === b.email_grants &&
    a.push_chat === b.push_chat &&
    a.language === b.language &&
    a.theme === b.theme
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-[#3356AA]" : "bg-gray-200"
      }`}
      aria-pressed={checked}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full mt-0.5 mx-0.5 shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function Row({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <header className="flex items-start gap-3 mb-2">
        <div className="bg-[#EEF2FF] text-[#3356AA] rounded-xl p-2.5 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </header>
      <div>{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  // Last-saved state (the source of truth in storage).
  const [saved, setSaved] = useState<Prefs>(() => loadPrefs());
  // Draft state shown in the UI; only persisted on Save.
  const [draft, setDraft] = useState<Prefs>(saved);
  const [savedFlash, setSavedFlash] = useState(false);

  // Live-preview theme & language while editing.
  useEffect(() => {
    applyTheme(draft.theme);
    applyLanguage(draft.language);
  }, [draft.theme, draft.language]);

  const dirty = !prefsEqual(draft, saved);

  function patch(p: Partial<Prefs>) {
    setDraft((prev) => ({ ...prev, ...p }));
  }

  function handleSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {}
    applyTheme(draft.theme);
    applyLanguage(draft.language);
    setSaved(draft);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  function handleCancel() {
    setDraft(saved);
    // Revert any live-applied theme/language right away.
    applyTheme(saved.theme);
    applyLanguage(saved.language);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage notifications, language and appearance.
        </p>
      </header>

      {/* Notifications */}
      <SectionCard
        icon={<MdNotificationsActive size={18} />}
        title="Notifications"
        subtitle="Choose what updates you want to receive."
      >
        <Row
          title="Announcement emails"
          description="Get an email when a university or NTC posts an announcement."
          control={
            <Toggle
              checked={draft.email_announcements}
              onChange={() =>
                patch({ email_announcements: !draft.email_announcements })
              }
            />
          }
        />
        <Row
          title="Grants check emails"
          description="Notify me when new grants are available for my profile."
          control={
            <Toggle
              checked={draft.email_grants}
              onChange={() => patch({ email_grants: !draft.email_grants })}
            />
          }
        />
        <Row
          title="Push: AI assistant"
          description="In-app push when the assistant finishes a long task."
          control={
            <Toggle
              checked={draft.push_chat}
              onChange={() => patch({ push_chat: !draft.push_chat })}
            />
          }
        />
      </SectionCard>

      {/* Language */}
      <SectionCard
        icon={<MdLanguage size={18} />}
        title="Language"
        subtitle="Pick the language of the interface."
      >
        <div className="grid grid-cols-3 gap-2 pt-2">
          {(
            [
              { value: "en", label: "English" },
              { value: "ru", label: "Русский" },
              { value: "kz", label: "Қазақша" },
            ] as Array<{ value: Lang; label: string }>
          ).map((opt) => {
            const active = draft.language === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => patch({ language: opt.value })}
                className={`px-4 py-3 rounded-2xl border text-sm font-medium transition-colors ${
                  active
                    ? "border-[#3356AA] bg-[#EEF2FF] text-[#3356AA]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Theme */}
      <SectionCard
        icon={draft.theme === "dark" ? <MdDarkMode size={18} /> : <MdLightMode size={18} />}
        title="Theme"
        subtitle="Switch between light and dark mode."
      >
        <div className="grid grid-cols-2 gap-2 pt-2">
          {(
            [
              { value: "light", label: "Light", icon: <MdLightMode size={16} /> },
              { value: "dark", label: "Dark", icon: <MdDarkMode size={16} /> },
            ] as Array<{ value: Theme; label: string; icon: React.ReactNode }>
          ).map((opt) => {
            const active = draft.theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => patch({ theme: opt.value })}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition-colors ${
                  active
                    ? "border-[#3356AA] bg-[#EEF2FF] text-[#3356AA]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Footer actions */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between flex-wrap gap-3 sticky bottom-4">
        <div className="text-sm">
          {savedFlash ? (
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <MdCheckCircle size={16} /> Settings saved
            </span>
          ) : dirty ? (
            <span className="text-gray-500">You have unsaved changes.</span>
          ) : (
            <span className="text-gray-400">All settings are up to date.</span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={!dirty}
            className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3356AA] text-white text-sm font-semibold hover:bg-[#2c4892] disabled:opacity-50"
          >
            <MdCheckCircle size={16} />
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

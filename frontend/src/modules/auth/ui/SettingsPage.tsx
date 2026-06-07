import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MdNotificationsActive,
  MdLanguage,
  MdLightMode,
  MdDarkMode,
  MdCheckCircle,
} from "react-icons/md";

type Theme = "light" | "dark";

type Prefs = {
  email_announcements: boolean;
  email_grants: boolean;
  push_chat: boolean;
  theme: Theme;
};

const STORAGE_KEY = "bilimge.prefs.v1";

const DEFAULT_PREFS: Prefs = {
  email_announcements: true,
  email_grants: true,
  push_chat: true,
  theme: "light",
};

// Languages shown in the selector — codes match i18n (and the TopBar switcher).
const LANGUAGES: Array<{ code: string; label: string }> = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "kk", label: "Қазақша" },
];

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

function prefsEqual(a: Prefs, b: Prefs) {
  return (
    a.email_announcements === b.email_announcements &&
    a.email_grants === b.email_grants &&
    a.push_chat === b.push_chat &&
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
  const { t, i18n } = useTranslation();
  // Last-saved state (the source of truth in storage).
  const [saved, setSaved] = useState<Prefs>(() => loadPrefs());
  // Draft state shown in the UI; only persisted on Save.
  const [draft, setDraft] = useState<Prefs>(saved);
  const [savedFlash, setSavedFlash] = useState(false);

  // Language is shared with the TopBar switcher: it applies instantly via i18n
  // (persisted by i18n's LanguageDetector) and is NOT part of the draft/save flow.
  const activeLang =
    LANGUAGES.find((l) => l.code === i18n.language)?.code ?? "en";

  // Keep the <html lang> attribute in sync with the active language.
  useEffect(() => {
    document.documentElement.setAttribute("lang", i18n.language);
  }, [i18n.language]);

  // Live-preview theme while editing.
  useEffect(() => {
    applyTheme(draft.theme);
  }, [draft.theme]);

  const dirty = !prefsEqual(draft, saved);

  function patch(p: Partial<Prefs>) {
    setDraft((prev) => ({ ...prev, ...p }));
  }

  function handleSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {}
    applyTheme(draft.theme);
    setSaved(draft);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  function handleCancel() {
    setDraft(saved);
    // Revert any live-applied theme right away.
    applyTheme(saved.theme);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">{t("settings.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("settings.subtitle")}
        </p>
      </header>

      {/* Notifications */}
      <SectionCard
        icon={<MdNotificationsActive size={18} />}
        title={t("settings.notifications.title")}
        subtitle={t("settings.notifications.subtitle")}
      >
        <Row
          title={t("settings.announcementEmails.title")}
          description={t("settings.announcementEmails.desc")}
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
          title={t("settings.grantEmails.title")}
          description={t("settings.grantEmails.desc")}
          control={
            <Toggle
              checked={draft.email_grants}
              onChange={() => patch({ email_grants: !draft.email_grants })}
            />
          }
        />
        <Row
          title={t("settings.pushChat.title")}
          description={t("settings.pushChat.desc")}
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
        title={t("settings.language.title")}
        subtitle={t("settings.language.subtitle")}
      >
        <div className="grid grid-cols-3 gap-2 pt-2">
          {LANGUAGES.map((opt) => {
            const active = activeLang === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => i18n.changeLanguage(opt.code)}
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
        title={t("settings.theme.title")}
        subtitle={t("settings.theme.subtitle")}
      >
        <div className="grid grid-cols-2 gap-2 pt-2">
          {(
            [
              { value: "light", label: t("settings.theme.light"), icon: <MdLightMode size={16} /> },
              { value: "dark", label: t("settings.theme.dark"), icon: <MdDarkMode size={16} /> },
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
              <MdCheckCircle size={16} /> {t("settings.settingsSaved")}
            </span>
          ) : dirty ? (
            <span className="text-gray-500">{t("settings.unsavedChanges")}</span>
          ) : (
            <span className="text-gray-400">{t("settings.upToDate")}</span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={!dirty}
            className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3356AA] text-white text-sm font-semibold hover:bg-[#2c4892] disabled:opacity-50"
          >
            <MdCheckCircle size={16} />
            {t("settings.saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { calculatorService } from "../api/calculatorService";
import type {
  CalculatorResponse,
  CalculatorScores,
  CalculatorSuccess,
  NtcProgramOption,
  QuotaKey,
  Subject,
  UniversityResult,
} from "../model/types";

const QUOTAS: { key: QuotaKey; label: string }[] = [
  { key: "rural", label: "calculator.quotas.rural" },
  { key: "large_family", label: "calculator.quotas.large_family" },
  { key: "incomplete_family", label: "calculator.quotas.incomplete_family" },
  { key: "serpin", label: "calculator.quotas.serpin" },
  { key: "disability", label: "calculator.quotas.disability" },
  { key: "family_disability", label: "calculator.quotas.family_disability" },
  { key: "orphan", label: "calculator.quotas.orphan" },
];

const SCORE_FIELDS: {
  key: keyof CalculatorScores;
  label: string;
  max: number;
  min: number;
}[] = [
  { key: "history", label: "calculator.scores.history", max: 20, min: 5 },
  { key: "math_literacy", label: "calculator.scores.math_literacy", max: 10, min: 5 },
  { key: "reading_literacy", label: "calculator.scores.reading_literacy", max: 10, min: 5 },
  { key: "subject_1", label: "calculator.scores.subject_1", max: 50, min: 5 },
  { key: "subject_2", label: "calculator.scores.subject_2", max: 50, min: 5 },
];

const TOTAL_MAX = SCORE_FIELDS.reduce((s, f) => s + f.max, 0);
const TOTAL_MIN = 50;

const EMPTY_SCORES: CalculatorScores = {
  history: 0,
  math_literacy: 0,
  reading_literacy: 0,
  subject_1: 0,
  subject_2: 0,
};

function isSuccess(r: CalculatorResponse | null): r is CalculatorSuccess {
  return !!r && "passed_minimum" in r && r.passed_minimum === true;
}

function chanceColor(chance: number) {
  if (chance >= 75) return { bg: "#E6F7EF", ink: "#10B981" };
  if (chance >= 50) return { bg: "#EBF2FE", ink: "#3D5AFE" };
  if (chance >= 25) return { bg: "#FFF4E0", ink: "#E08900" };
  return { bg: "#FEE7E2", ink: "#DC2626" };
}

export default function CalculatorPage() {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subject1Id, setSubject1Id] = useState<number | "">("");
  const [subject2Id, setSubject2Id] = useState<number | "">("");
  const [programs, setPrograms] = useState<NtcProgramOption[]>([]);
  const [programCode, setProgramCode] = useState<string>("");
  const [scores, setScores] = useState<CalculatorScores>(EMPTY_SCORES);
  const [quotas, setQuotas] = useState<QuotaKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculatorResponse | null>(null);

  useEffect(() => {
    calculatorService
      .listSubjects()
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    if (!subject1Id || !subject2Id || subject1Id === subject2Id) {
      setPrograms([]);
      setProgramCode("");
      return;
    }
    setProgramsLoading(true);
    calculatorService
      .getPrograms(Number(subject1Id), Number(subject2Id))
      .then((list) => {
        setPrograms(list);
        setProgramCode(list[0]?.code ?? "");
      })
      .catch(() => {
        setPrograms([]);
        setProgramCode("");
      })
      .finally(() => setProgramsLoading(false));
  }, [subject1Id, subject2Id]);

  const totalScore = useMemo(
    () =>
      SCORE_FIELDS.reduce((sum, f) => sum + (Number(scores[f.key]) || 0), 0),
    [scores]
  );

  const meetsMinimums =
    SCORE_FIELDS.every((f) => scores[f.key] >= f.min) && totalScore >= TOTAL_MIN;

  const canSubmit =
    subject1Id !== "" &&
    subject2Id !== "" &&
    subject1Id !== subject2Id &&
    meetsMinimums;

  const toggleQuota = (k: QuotaKey) =>
    setQuotas((prev) =>
      prev.includes(k) ? prev.filter((q) => q !== k) : [...prev, k]
    );

  const setScore = (key: keyof CalculatorScores, raw: string) => {
    const max = SCORE_FIELDS.find((f) => f.key === key)?.max ?? 45;
    const num = raw === "" ? 0 : Math.max(0, Math.min(max, Number(raw)));
    setScores((s) => ({ ...s, [key]: Number.isFinite(num) ? num : 0 }));
  };

  const onCalculate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await calculatorService.calculate({
        scores,
        quotas,
        subject_1_id: Number(subject1Id),
        subject_2_id: Number(subject2Id),
        ntc_program_code: programCode || undefined,
      });
      setResult(res);
      if ("error" in res) setError(res.error);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? t("calculator.calcError"));
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setSubject1Id("");
    setSubject2Id("");
    setProgramCode("");
    setPrograms([]);
    setScores(EMPTY_SCORES);
    setQuotas([]);
    setResult(null);
    setError(null);
  };

  const success = isSuccess(result) ? result : null;
  const failureMessage =
    result && "passed_minimum" in result && !result.passed_minimum
      ? result.message
      : null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#0D0D12]" style={{ fontFamily: "Manrope, system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Header totalScore={totalScore} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6 mt-8">
          <section className="space-y-6">
            <Card title={t("calculator.subjectsTitle")} subtitle={t("calculator.subjectsSubtitle")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectField
                  label={t("calculator.profileSubject1")}
                  value={subject1Id}
                  onChange={(v) => setSubject1Id(v ? Number(v) : "")}
                  options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                />
                <SelectField
                  label={t("calculator.profileSubject2")}
                  value={subject2Id}
                  onChange={(v) => setSubject2Id(v ? Number(v) : "")}
                  options={subjects
                    .filter((s) => s.id !== subject1Id)
                    .map((s) => ({ value: s.id, label: s.name }))}
                />
              </div>

              {subject1Id && subject2Id && subject1Id !== subject2Id && (
                <div className="mt-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8A8A95] mb-2">
                    {t("calculator.ntcProgram")}
                  </label>
                  {programsLoading ? (
                    <div className="h-11 rounded-xl bg-[#F2F2F5] animate-pulse" />
                  ) : programs.length === 0 ? (
                    <div className="text-sm text-[#8A8A95] px-3 py-2 rounded-xl bg-[#F2F2F5]">
                      {t("calculator.noProgramsMatch")}
                    </div>
                  ) : (
                    <select
                      value={programCode}
                      onChange={(e) => setProgramCode(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-[#E8E8EC] bg-white text-sm focus:outline-none focus:border-[#3356AA]"
                    >
                      {programs.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} — {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </Card>

            <Card title={t("calculator.scoresTitle")} subtitle={t("calculator.scoresSubtitle")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCORE_FIELDS.map((f) => (
                  <ScoreInput
                    key={f.key}
                    label={t(f.label)}
                    hint={t("calculator.scoreHint", { min: f.min, max: f.max })}
                    value={scores[f.key]}
                    max={f.max}
                    onChange={(v) => setScore(f.key, v)}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl bg-[#EEF2FF]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3356AA]">
                  {t("calculator.total")}
                </span>
                <span
                  className="text-2xl font-bold text-[#3356AA]"
                  style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
                >
                  {totalScore} / {TOTAL_MAX}
                </span>
              </div>
            </Card>

            <Card title={t("calculator.quotasTitle")} subtitle={t("calculator.quotasSubtitle")}>
              <div className="flex flex-wrap gap-2">
                {QUOTAS.map((q) => {
                  const active = quotas.includes(q.key);
                  return (
                    <button
                      key={q.key}
                      type="button"
                      onClick={() => toggleQuota(q.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        active
                          ? "bg-[#3356AA] border-[#3356AA] text-white"
                          : "bg-white border-[#E8E8EC] text-[#4A4A55] hover:border-[#D7D7DD]"
                      }`}
                    >
                      {t(q.label)}
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCalculate}
                disabled={!canSubmit || loading}
                className="flex-1 h-12 rounded-xl bg-[#3356AA] text-white font-semibold text-sm hover:bg-[#2a4699] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? t("calculator.calculating") : t("calculator.calculate")}
              </button>
              <button
                type="button"
                onClick={onReset}
                className="px-5 h-12 rounded-xl border border-[#E8E8EC] bg-white text-sm font-semibold text-[#4A4A55] hover:border-[#D7D7DD]"
              >
                {t("calculator.reset")}
              </button>
            </div>
          </section>

          <section className="space-y-6">
            {error && <ErrorPanel message={error} />}
            {failureMessage && <ErrorPanel message={failureMessage} />}

            {!result && !error && <EmptyResults />}

            {success && (
              <>
                <SummaryCard data={success} />
                {success.grant_stats_2025 && (
                  <GrantStatsCard stats={success.grant_stats_2025} />
                )}
                {success.ai_analysis && (
                  <AIAnalysisCard text={success.ai_analysis} />
                )}
                <UniversitiesCard universities={success.universities} />
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Header({ totalScore }: { totalScore: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
          style={{ background: "#EEF2FF", color: "#3356AA" }}
        >
          {t("calculator.badge")}
        </span>
        <h1
          className="mt-3 text-4xl font-bold text-[#0D0D12]"
          style={{ fontFamily: "DM Sans, system-ui, sans-serif", letterSpacing: "-0.02em" }}
        >
          {t("calculator.title")}
        </h1>
        <p className="mt-2 text-[#4A4A55] max-w-2xl">
          {t("calculator.description")}
        </p>
      </div>
      <div className="flex flex-col items-start md:items-end">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A95]">
          {t("calculator.currentTotal")}
        </span>
        <span
          className="text-3xl font-bold text-[#0D0D12] tabular-nums"
          style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
        >
          {totalScore}
          <span className="text-[#B5B5BE] text-lg font-medium"> / {TOTAL_MAX}</span>
        </span>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white border border-[#E8E8EC] p-5">
      <div className="mb-4">
        <h2
          className="text-lg font-bold text-[#0D0D12]"
          style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
        >
          {title}
        </h2>
        {subtitle && <p className="text-xs text-[#8A8A95] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number | "";
  onChange: (v: string) => void;
  options: { value: number; label: string }[];
}) {
  const { t } = useTranslation();
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8A8A95] mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 rounded-xl border border-[#E8E8EC] bg-white text-sm focus:outline-none focus:border-[#3356AA]"
      >
        <option value="">{t("calculator.select")}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ScoreInput({
  label,
  hint,
  value,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  max: number;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A95]">
          {label}
        </label>
        <span className="text-[10px] text-[#B5B5BE]">{hint}</span>
      </div>
      <input
        type="number"
        min={0}
        max={max}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full h-11 px-3 rounded-xl border border-[#E8E8EC] bg-white text-sm tabular-nums focus:outline-none focus:border-[#3356AA]"
      />
    </div>
  );
}

function EmptyResults() {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-white border border-dashed border-[#D7D7DD] p-10 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center text-2xl text-[#3356AA]">
        ✦
      </div>
      <h3
        className="mt-4 text-lg font-bold text-[#0D0D12]"
        style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
      >
        {t("calculator.emptyTitle")}
      </h3>
      <p className="mt-1 text-sm text-[#8A8A95]">
        {t("calculator.emptySubtitle")}
      </p>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-[#FEE7E2] border border-[#F4CBC0] p-4 text-sm text-[#DC2626]">
      {message}
    </div>
  );
}

function SummaryCard({ data }: { data: CalculatorSuccess }) {
  const { t } = useTranslation();
  const best = chanceColor(data.best_grant_chance);
  const avg = chanceColor(data.average_grant_chance);
  return (
    <div className="rounded-2xl bg-white border border-[#E8E8EC] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A95]">
            {t("calculator.program")}
          </p>
          <h2
            className="text-lg font-bold text-[#0D0D12]"
            style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
          >
            {data.ntc_program.name}
          </h2>
          <p className="text-xs text-[#8A8A95] mt-0.5">
            {data.ntc_program.code} · {data.ntc_program.field}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A95]">
            {t("calculator.total")}
          </p>
          <p
            className="text-2xl font-bold text-[#0D0D12]"
            style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
          >
            {data.total_score}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat
          label={t("calculator.bestGrantChance")}
          value={`${data.best_grant_chance}%`}
          bg={best.bg}
          ink={best.ink}
        />
        <Stat
          label={t("calculator.averageAcrossUnis")}
          value={`${data.average_grant_chance}%`}
          bg={avg.bg}
          ink={avg.ink}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  bg,
  ink,
}: {
  label: string;
  value: string;
  bg: string;
  ink: string;
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: bg }}>
      <p
        className="text-[11px] font-bold uppercase tracking-wider"
        style={{ color: ink, opacity: 0.85 }}
      >
        {label}
      </p>
      <p
        className="text-3xl font-bold mt-1 tabular-nums"
        style={{ color: ink, fontFamily: "DM Sans, system-ui, sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}

function GrantStatsCard({
  stats,
}: {
  stats: NonNullable<CalculatorSuccess["grant_stats_2025"]>;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-white border border-[#E8E8EC] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="text-base font-bold text-[#0D0D12]"
            style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
          >
            {t("calculator.grantWinners", { year: stats.year })}
          </h3>
          <p className="text-xs text-[#8A8A95]">{t("calculator.fieldCode", { code: stats.field_code })}</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
          style={{ background: "#F1ECFE", color: "#7C5CFF" }}
        >
          {t("calculator.winners", { count: stats.total_winners })}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label={t("calculator.min")} value={stats.min_score} />
        <MiniStat label={t("calculator.avg")} value={stats.avg_score} />
        <MiniStat label={t("calculator.max")} value={stats.max_score} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#F5F5F7] p-3 text-center">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A95]">
        {label}
      </p>
      <p
        className="text-xl font-bold text-[#0D0D12] tabular-nums"
        style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}

function AIAnalysisCard({ text }: { text: string }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-[#E8E8EC] p-5" style={{ background: "linear-gradient(135deg,#EEF2FF 0%,#F1ECFE 100%)" }}>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
          style={{ background: "white", color: "#3356AA" }}
        >
          {t("calculator.aiInsight")}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[#0D0D12] whitespace-pre-line">
        {text}
      </p>
    </div>
  );
}

function UniversitiesCard({
  universities,
}: {
  universities: UniversityResult[];
}) {
  const { t } = useTranslation();
  if (!universities.length) {
    return (
      <div className="rounded-2xl bg-white border border-[#E8E8EC] p-5 text-sm text-[#8A8A95]">
        {t("calculator.noUniversities")}
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-white border border-[#E8E8EC] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-base font-bold text-[#0D0D12]"
          style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
        >
          {t("calculator.universities")}
        </h3>
        <span className="text-xs text-[#8A8A95]">
          {t("calculator.programsCount", { count: universities.length })}
        </span>
      </div>
      <ul className="space-y-2">
        {universities.map((u) => (
          <UniversityRow key={`${u.university_code}-${u.program_code}`} u={u} />
        ))}
      </ul>
    </div>
  );
}

function UniversityRow({ u }: { u: UniversityResult }) {
  const { t } = useTranslation();
  const c = chanceColor(u.grant_chance);
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#E8E8EC] hover:border-[#D7D7DD] transition">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#0D0D12] truncate">
          {u.university_name}
        </p>
        <p className="text-xs text-[#8A8A95] truncate">
          {u.university_city} · {u.program_name} · {u.language}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {u.grant_score != null && (
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F2F2F5] text-[#4A4A55]">
              {t("calculator.grantScore", { score: u.grant_score })}
            </span>
          )}
          {u.passing_score != null && (
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F2F2F5] text-[#4A4A55]">
              {t("calculator.passScore", { score: u.passing_score })}
            </span>
          )}
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF2FE] text-[#3D5AFE]">
            {t("calculator.admission", { chance: u.admission_chance })}
          </span>
          {u.data_source === "grant_winners_2025_university" && (
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1ECFE] text-[#7C5CFF]">
              {t("calculator.fromThisUni")}
            </span>
          )}
          {u.data_source === "grant_winners_2025" && (
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF4E0] text-[#E08900]">
              {t("calculator.fieldWideFallback")}
            </span>
          )}
        </div>
      </div>
      <div
        className="shrink-0 px-3 py-2 rounded-xl text-right"
        style={{ background: c.bg }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: c.ink, opacity: 0.85 }}
        >
          {t("calculator.grant")}
        </p>
        <p
          className="text-xl font-bold tabular-nums"
          style={{ color: c.ink, fontFamily: "DM Sans, system-ui, sans-serif" }}
        >
          {u.grant_chance}%
        </p>
      </div>
    </li>
  );
}

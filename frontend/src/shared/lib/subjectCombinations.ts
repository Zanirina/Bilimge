// Canonical UNT subject-pair combinations.
//
// Display labels and matching strings both use the subject names stored
// in the DB (English, see backend/unipage/fixtures/subject.json).
//
// Each combo has two "sides". Each side is a list of subject names that
// satisfy that side (slash-combos like "Kazakh/Russian Language" have
// multiple entries). A program matches if {subject_1_name, subject_2_name}
// can be covered by one item from each side, in either order, case-insensitively.

export type SubjectCombo = {
  id: string;
  label: string;
  sideA: string[];
  sideB: string[];
};

export const SUBJECT_COMBINATIONS: SubjectCombo[] = [
  {
    id: "bio-geo",
    label: "Biology and Geography",
    sideA: ["Biology"],
    sideB: ["Geography"],
  },
  {
    id: "bio-chem",
    label: "Biology and Chemistry",
    sideA: ["Biology"],
    sideB: ["Chemistry"],
  },
  {
    id: "wh-geo",
    label: "World History and Geography",
    sideA: ["World History"],
    sideB: ["Geography"],
  },
  {
    id: "wh-law",
    label: "World History and Foundations of Law",
    sideA: ["World History"],
    sideB: ["Man. Society. Law"],
  },
  {
    id: "geo-foreign",
    label: "Geography and Foreign Language",
    sideA: ["Geography"],
    sideB: ["Foreign Language"],
  },
  {
    id: "foreign-wh",
    label: "Foreign Language and World History",
    sideA: ["Foreign Language"],
    sideB: ["World History"],
  },
  {
    id: "kaz-kazlit",
    label: "Kazakh Language and Kazakh Literature",
    sideA: ["Kazakh Language"],
    sideB: ["Kazakh Literature"],
  },
  {
    id: "kazru-lit",
    label: "Kazakh/Russian Language and Kazakh/Russian Literature",
    sideA: ["Kazakh Language", "Russian Language"],
    sideB: ["Kazakh Literature", "Russian Literature"],
  },
  {
    id: "math-geo",
    label: "Mathematics and Geography",
    sideA: ["Mathematics"],
    sideB: ["Geography"],
  },
  {
    id: "math-cs",
    label: "Mathematics and Informatics",
    sideA: ["Mathematics"],
    sideB: ["Informatics"],
  },
  {
    id: "math-phys",
    label: "Mathematics and Physics",
    sideA: ["Mathematics"],
    sideB: ["Physics"],
  },
  {
    id: "ru-rulit",
    label: "Russian Language and Russian Literature",
    sideA: ["Russian Language"],
    sideB: ["Russian Literature"],
  },
  {
    id: "creative",
    label: "Creative Exam (paired)",
    sideA: ["Creative Exam"],
    sideB: ["Creative Exam"],
  },
  {
    id: "chem-phys",
    label: "Chemistry and Physics",
    sideA: ["Chemistry"],
    sideB: ["Physics"],
  },
];

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

const comboMatches = (
  combo: SubjectCombo,
  s1: string | null | undefined,
  s2: string | null | undefined
) => {
  const x = norm(s1);
  const y = norm(s2);
  const a = combo.sideA.map(norm);
  const b = combo.sideB.map(norm);
  // x belongs to A and y to B, OR vice versa.
  return (
    (a.includes(x) && b.includes(y)) ||
    (a.includes(y) && b.includes(x))
  );
};

export const programMatchesCombos = (
  selectedComboIds: string[],
  subject1Name: string | null | undefined,
  subject2Name: string | null | undefined
): boolean => {
  if (selectedComboIds.length === 0) return true;
  return selectedComboIds.some((id) => {
    const combo = SUBJECT_COMBINATIONS.find((c) => c.id === id);
    if (!combo) return false;
    return comboMatches(combo, subject1Name, subject2Name);
  });
};

import { useEffect, useState } from "react";
import { universityService } from "../../api/universityService";
import type { UniApplicant } from "../../model/types";

function getInitials(firstName: string, lastName: string, email: string) {
  if (firstName || lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  return email.charAt(0).toUpperCase();
}

function getDisplayName(applicant: UniApplicant) {
  const full = `${applicant.first_name} ${applicant.last_name}`.trim();
  return full || applicant.email;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

export default function UniApplicantsPage() {
  const [applicants, setApplicants] = useState<UniApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    universityService
      .getMyApplicants()
      .then((res) => setApplicants(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = applicants.filter((a) => {
    const q = search.toLowerCase();
    return (
      getDisplayName(a).toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.favorited_programs.some((p) => p.local_name.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <p className="text-sm text-gray-500 mt-1">
          Students who saved your university to favourites
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
            {loading ? "—" : applicants.length}
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total applicants</p>
            <p className="text-lg font-semibold text-gray-800">
              {loading ? "Loading…" : `${applicants.length} students`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl font-bold">
            {loading
              ? "—"
              : applicants.filter((a) => (a.unt_score ?? 0) >= 100).length}
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">UNT score ≥ 100</p>
            <p className="text-lg font-semibold text-gray-800">
              {loading
                ? "Loading…"
                : `${applicants.filter((a) => (a.unt_score ?? 0) >= 100).length} students`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl font-bold">
            {loading
              ? "—"
              : applicants.reduce((s, a) => s + a.favorited_programs.length, 0)}
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Programmes saved</p>
            <p className="text-lg font-semibold text-gray-800">
              {loading
                ? "Loading…"
                : `${applicants.reduce((s, a) => s + a.favorited_programs.length, 0)} total`}
            </p>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="px-6 py-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search by name, email or programme…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            Loading applicants…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <span className="text-4xl">👤</span>
            <p className="text-sm">
              {search ? "No applicants match your search." : "No applicants yet."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Applicant</th>
                <th className="px-6 py-3 font-medium">UNT Score</th>
                <th className="px-6 py-3 font-medium">Saved programmes</th>
                <th className="px-6 py-3 font-medium">Saved on</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((applicant) => (
                <tr
                  key={applicant.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar + name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${avatarColor(applicant.id)}`}
                      >
                        {getInitials(applicant.first_name, applicant.last_name, applicant.email)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 leading-tight">
                          {getDisplayName(applicant)}
                        </p>
                        <p className="text-xs text-gray-400">{applicant.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* UNT score */}
                  <td className="px-6 py-4">
                    {applicant.unt_score != null ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          applicant.unt_score >= 100
                            ? "bg-emerald-100 text-emerald-700"
                            : applicant.unt_score >= 70
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {applicant.unt_score}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Programmes */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {applicant.favorited_programs.map((p) => (
                        <span
                          key={p.code}
                          className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md"
                        >
                          {p.local_name}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                    {formatDate(applicant.first_favorited_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {applicants.length} applicants
          </div>
        )}
      </div>
    </div>
  );
}

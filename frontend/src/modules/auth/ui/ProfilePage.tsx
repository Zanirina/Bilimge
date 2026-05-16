import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MdCloudUpload, MdCheckCircle, MdClose, MdSchool } from "react-icons/md";
import { useAuthStore } from "../model/authStore";
import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";

type SubjectOption = { id: number; name: string };

type FavoriteProgram = {
  id: number;
  program_code: string;
  program_name: string;
};

type FavoriteGroup = {
  university_code: number | string;
  university_name: string;
  programs: FavoriteProgram[];
};

const ROLE_LABELS: Record<string, string> = {
  APPLICANT: "Applicant",
  UNI_ADMIN: "University Admin",
  NTC_ADMIN: "NTC Admin",
  SUPER_ADMIN: "Super Admin",
  applicant: "Applicant",
  uni_admin: "University Admin",
  ntc_admin: "NTC Admin",
  super_admin: "Super Admin",
};

const inp =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3356AA]/20 focus:border-[#3356AA]/50 bg-white text-gray-800 placeholder:text-gray-400";
const lbl = "block text-xs font-medium text-gray-500 mb-1.5";

export default function ProfilePage() {
  const {
    user,
    updateMe,
    updateProfile,
    changePassword,
    uploadAvatar,
    checkAuth,
    favoriteUniversities,
    fetchFavoriteUniversities,
    removeFavoriteUniversity,
  } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [info, setInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [applicant, setApplicant] = useState<{
    unt_score: number | "";
    subject_1: number | "";
    subject_2: number | "";
  }>({ unt_score: "", subject_1: "", subject_2: "" });
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [favorites, setFavorites] = useState<FavoriteGroup[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [pw, setPw] = useState({ current: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApplicant =
    user?.role === "APPLICANT" || user?.role === "applicant";

  useEffect(() => {
    if (!user) checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      setInfo({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
      });
      setApplicant({
        unt_score: user.unt_score ?? "",
        subject_1: user.subject_1 ?? "",
        subject_2: user.subject_2 ?? "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isApplicant) return;
    http
      .get<SubjectOption[]>(endpoints.subjects.list)
      .then((r) => setSubjects(r.data))
      .catch(() => setSubjects([]));
    setFavLoading(true);
    http
      .get<FavoriteGroup[]>(endpoints.auth.favorites)
      .then((r) => setFavorites(Array.isArray(r.data) ? r.data : []))
      .catch(() => setFavorites([]))
      .finally(() => setFavLoading(false));
    fetchFavoriteUniversities().catch(() => {});
  }, [isApplicant]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Loading account…
      </div>
    );
  }

  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`
    .toUpperCase() || user.email[0].toUpperCase();
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const subtitle = user.university_name
    ? `${roleLabel} · ${user.university_name}`
    : roleLabel;

  const dirty =
    info.first_name !== (user.first_name ?? "") ||
    info.last_name !== (user.last_name ?? "") ||
    info.email !== (user.email ?? "") ||
    info.phone !== (user.phone ?? "");

  const applicantDirty =
    isApplicant &&
    (Number(applicant.unt_score || 0) !== (user.unt_score ?? 0) ||
      (applicant.subject_1 || null) !== (user.subject_1 ?? null) ||
      (applicant.subject_2 || null) !== (user.subject_2 ?? null));

  const wantsPasswordChange = pw.current || pw.new || pw.confirm;

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      if (dirty) {
        await updateMe({
          first_name: info.first_name.trim(),
          last_name: info.last_name.trim(),
          email: info.email.trim(),
          phone: info.phone.trim(),
        });
      }
      if (applicantDirty) {
        await updateProfile({
          unt_score: Number(applicant.unt_score || 0),
          subject_1: applicant.subject_1 ? Number(applicant.subject_1) : null,
          subject_2: applicant.subject_2 ? Number(applicant.subject_2) : null,
        });
      }
      if (wantsPasswordChange) {
        if (pw.new !== pw.confirm) {
          throw new Error("New passwords do not match.");
        }
        if (pw.new.length < 8) {
          throw new Error("New password must be at least 8 characters.");
        }
        await changePassword({
          current_password: pw.current,
          new_password: pw.new,
        });
        setPw({ current: "", new: "", confirm: "" });
      }
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (e) {
      const err = e as {
        response?: { data?: { error?: string; email?: string[] } };
        message?: string;
      };
      setError(
        err.response?.data?.error ??
          err.response?.data?.email?.[0] ??
          err.message ??
          "Could not save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setInfo({
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    });
    setApplicant({
      unt_score: user?.unt_score ?? "",
      subject_1: user?.subject_1 ?? "",
      subject_2: user?.subject_2 ?? "",
    });
    setPw({ current: "", new: "", confirm: "" });
    setError(null);
  }

  async function handleRemoveFavorite(id: number) {
    try {
      await http.delete(endpoints.auth.favoriteById(id));
      setFavorites((groups) =>
        groups
          .map((g) => ({ ...g, programs: g.programs.filter((p) => p.id !== id) }))
          .filter((g) => g.programs.length > 0)
      );
    } catch {
      setError("Could not remove favorite.");
    }
  }

  async function handleAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadAvatar(file);
    } catch {
      setError("Could not upload avatar.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const canSave =
    (dirty || applicantDirty || wantsPasswordChange) && !saving;

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal information and password.
        </p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
        {/* Identity row */}
        <section className="bg-gray-50 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="avatar"
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#3356AA] text-white flex items-center justify-center text-lg font-semibold">
                {initials}
              </div>
            )}
            <div>
              <p className="text-base font-semibold text-gray-900">
                {user.first_name || user.last_name
                  ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                  : user.email}
              </p>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-60"
          >
            <MdCloudUpload size={16} />
            {uploading ? "Uploading…" : "Change photo"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarPick}
          />
        </section>

        {/* Account info */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-4">Account information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>First name</label>
              <input
                className={inp}
                value={info.first_name}
                onChange={(e) => setInfo((p) => ({ ...p, first_name: e.target.value }))}
              />
            </div>
            <div>
              <label className={lbl}>Last name</label>
              <input
                className={inp}
                value={info.last_name}
                onChange={(e) => setInfo((p) => ({ ...p, last_name: e.target.value }))}
              />
            </div>
            <div>
              <label className={lbl}>Email</label>
              <input
                className={inp}
                type="email"
                value={info.email}
                onChange={(e) => setInfo((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className={lbl}>Phone</label>
              <input
                className={inp}
                value={info.phone}
                placeholder="+7 (000) 000-00-00"
                onChange={(e) => setInfo((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
          </div>
        </section>

        {/* Applicant info: UNT score + subjects */}
        {isApplicant && (
          <section className="pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <MdSchool className="text-[#3356AA]" size={18} />
              <h2 className="text-base font-bold text-gray-900">UNT & subjects</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>UNT score</label>
                <input
                  className={inp}
                  type="number"
                  min={0}
                  max={140}
                  value={applicant.unt_score}
                  onChange={(e) =>
                    setApplicant((p) => ({
                      ...p,
                      unt_score:
                        e.target.value === ""
                          ? ""
                          : Math.max(0, Math.min(140, Number(e.target.value))),
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label className={lbl}>Profile subject 1</label>
                <select
                  className={inp}
                  value={applicant.subject_1}
                  onChange={(e) =>
                    setApplicant((p) => ({
                      ...p,
                      subject_1: e.target.value ? Number(e.target.value) : "",
                    }))
                  }
                >
                  <option value="">— not selected —</option>
                  {subjects
                    .filter((s) => s.id !== applicant.subject_2)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Profile subject 2</label>
                <select
                  className={inp}
                  value={applicant.subject_2}
                  onChange={(e) =>
                    setApplicant((p) => ({
                      ...p,
                      subject_2: e.target.value ? Number(e.target.value) : "",
                    }))
                  }
                >
                  <option value="">— not selected —</option>
                  {subjects
                    .filter((s) => s.id !== applicant.subject_1)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {/* Saved universities */}
        {isApplicant && (
          <section className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Saved universities
                <span className="ml-2 text-xs font-medium text-gray-400">
                  {favoriteUniversities.length}
                </span>
              </h2>
              <Link
                to="/applicant/universities"
                className="text-xs font-medium text-[#3356AA] hover:underline"
              >
                Browse universities →
              </Link>
            </div>
            {favoriteUniversities.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm text-gray-500">
                  You haven't saved any universities yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoriteUniversities.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-3"
                  >
                    <Link
                      to={`/applicant/universities/${u.university_code}`}
                      className="shrink-0"
                    >
                      {u.logo_url ? (
                        <img
                          src={u.logo_url}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#3356AA] font-bold flex items-center justify-center">
                          {u.university_name.charAt(0)}
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/applicant/universities/${u.university_code}`}
                        className="block text-sm font-semibold text-gray-900 truncate hover:text-[#3356AA]"
                      >
                        {u.university_name}
                      </Link>
                      {u.city && (
                        <p className="text-xs text-gray-400 truncate">{u.city}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFavoriteUniversity(u.id)}
                      className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                      title="Remove from favorites"
                    >
                      <MdClose size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Favorites */}
        {isApplicant && (
          <section className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Saved programs
                <span className="ml-2 text-xs font-medium text-gray-400">
                  {user.favorites_count ?? 0}
                </span>
              </h2>
              <Link
                to="/applicant/universities"
                className="text-xs font-medium text-[#3356AA] hover:underline"
              >
                Browse universities →
              </Link>
            </div>
            {favLoading ? (
              <div className="text-sm text-gray-400 py-6">Loading favorites…</div>
            ) : favorites.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm text-gray-500">
                  You haven't saved any programs yet.
                </p>
                <Link
                  to="/programs"
                  className="inline-block mt-2 text-sm font-medium text-[#3356AA] hover:underline"
                >
                  Explore programs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.map((g) => (
                  <div
                    key={g.university_code}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <Link
                      to={`/applicant/universities/${g.university_code}`}
                      className="text-sm font-semibold text-gray-900 hover:text-[#3356AA]"
                    >
                      {g.university_name}
                    </Link>
                    <ul className="mt-2 divide-y divide-gray-100">
                      {g.programs.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center justify-between gap-3 py-2"
                        >
                          <Link
                            to={`/applicant/programs/${p.program_code}`}
                            className="min-w-0 flex-1 text-sm text-gray-700 hover:text-[#3356AA] truncate"
                          >
                            <span className="text-gray-400 mr-2">
                              {p.program_code}
                            </span>
                            {p.program_name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleRemoveFavorite(p.id)}
                            className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                            title="Remove from favorites"
                          >
                            <MdClose size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Change password */}
        <section className="pt-6 border-t border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Change password</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Current</label>
              <input
                className={inp}
                type="password"
                value={pw.current}
                onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              />
            </div>
            <div>
              <label className={lbl}>New</label>
              <input
                className={inp}
                type="password"
                value={pw.new}
                onChange={(e) => setPw((p) => ({ ...p, new: e.target.value }))}
              />
            </div>
            <div>
              <label className={lbl}>Confirm new</label>
              <input
                className={inp}
                type="password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Leave blank to keep your current password.
          </p>
        </section>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 flex-wrap gap-3">
          <div className="text-sm">
            {error && <span className="text-red-500">{error}</span>}
            {savedFlash && !error && (
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <MdCheckCircle size={16} /> Changes saved
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3356AA] text-white text-sm font-semibold hover:bg-[#2c4892] disabled:opacity-50"
            >
              <MdCheckCircle size={16} />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

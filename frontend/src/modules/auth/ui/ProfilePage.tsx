import { useEffect, useRef, useState } from "react";
import { MdCloudUpload, MdCheckCircle } from "react-icons/md";
import { useAuthStore } from "../model/authStore";

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
  const { user, updateMe, changePassword, uploadAvatar, checkAuth } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [info, setInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [pw, setPw] = useState({ current: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    }
  }, [user]);

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
    setPw({ current: "", new: "", confirm: "" });
    setError(null);
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

  const canSave = (dirty || wantsPasswordChange) && !saving;

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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Camera, CheckCircle2, Edit2, LockKeyhole, LogOut,
  Mail, Phone, Save, Trash2, User, Briefcase, Building2, Shield, Eye, EyeOff,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

type Profile = {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  bio: string;
};

const ROLE_COLORS: Record<string, string> = {
  "Administrator": "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "Supervisor": "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "Operational Staff": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "admin": "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "depot-supervisor": "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "operational-staff": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0] || "").join("").slice(0, 2).toUpperCase() || "?";
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    name: "S. Admin", email: "admin@srmss.lk", phone: "",
    role: "Administrator", department: "Administration", bio: "",
  });
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Profile>(profile);
  const [errors, setErrors] = useState<Partial<Profile>>({});
  const [saved, setSaved] = useState(false);

  // Password change
  const [passwordSection, setPasswordSection] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<typeof pwForm>({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwSaved, setPwSaved] = useState(false);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load from localStorage
  useEffect(() => {
    const role = localStorage.getItem("srmss-demo-role") || "admin";
    const roleLabel = role === "admin" ? "Administrator" : role === "depot-supervisor" ? "Supervisor" : "Operational Staff";
    const dept = role === "admin" ? "Administration" : role === "operational-staff" ? "Operations" : "Operations";
    const name = role === "admin" ? "S. Admin" : role === "depot-supervisor" ? "A. De Silva" : "K. Bandara";
    const email = role === "admin" ? "admin@srmss.lk" : role === "depot-supervisor" ? "depot.admin@srmss.lk" : "depot.clerk@srmss.lk";

    const saved = localStorage.getItem("srmss-profile");
    if (saved) {
      const parsed = JSON.parse(saved) as Profile;
      setProfile(parsed);
      setFormData(parsed);
    } else {
      const def: Profile = { name, email, phone: "", role: roleLabel, department: dept, bio: "" };
      setProfile(def);
      setFormData(def);
    }
  }, []);

  const validate = (): boolean => {
    const next: Partial<Profile> = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) next.email = "Enter a valid email";
    if (formData.phone && !/^[\d\s\-+()]{7,15}$/.test(formData.phone)) next.phone = "Enter a valid phone number";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setProfile(formData);
    localStorage.setItem("srmss-profile", JSON.stringify(formData));
    setEditing(false);
    setSaved(true);
    showToast("Profile updated successfully");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancelEdit = () => {
    setFormData(profile);
    setErrors({});
    setEditing(false);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    const next = { current: "", next: "", confirm: "" };
    if (!pwForm.current) next.current = "Current password is required";
    if (!pwForm.next) next.next = "New password is required";
    else if (pwForm.next.length < 8) next.next = "Password must be at least 8 characters";
    if (!pwForm.confirm) next.confirm = "Please confirm new password";
    else if (pwForm.confirm !== pwForm.next) next.confirm = "Passwords do not match";
    setPwErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setPwSaved(true);
    showToast("Password changed successfully");
    setPwForm({ current: "", next: "", confirm: "" });
    setTimeout(() => { setPwSaved(false); setPasswordSection(false); }, 2000);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE") return;
    localStorage.removeItem("srmss-demo-auth");
    localStorage.removeItem("srmss-demo-role");
    localStorage.removeItem("srmss-profile");
    window.dispatchEvent(new Event("srmss-demo-role-changed"));
    router.push("/login");
  };

  const inputCls = (err?: string) =>
    `w-full rounded-xl border bg-[var(--panel)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-soft)] ${err ? "border-rose-400 focus:border-rose-400" : "border-[var(--border)] focus:border-[var(--accent)]"}`;

  const avatarBg = ["bg-[var(--accent)]", "bg-violet-600", "bg-emerald-600", "bg-amber-600"][profile.name.charCodeAt(0) % 4];

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      {/* Toast */}
      <div className={`fixed bottom-5 right-5 z-[9999] transition-all duration-300 ${toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
        <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-xl ${toast?.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast?.msg}
        </div>
      </div>

      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <button type="button" onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)] transition">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)] text-xs font-bold text-white">SR</div>
            <span className="text-sm font-bold">SRMSS</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">

        {/* ── Profile Card ── */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden shadow-[var(--shadow-soft)]">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-[var(--sidebar-bg)] via-[#0d2a46] to-[var(--accent)]/60" />

          <div className="px-6 pb-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between -mt-12 mb-5">
              {/* Avatar */}
              <div className="relative">
                <div className={`flex h-24 w-24 items-center justify-center rounded-2xl ${avatarBg} text-2xl font-bold text-white shadow-xl ring-4 ring-[var(--panel)]`}>
                  {getInitials(profile.name)}
                </div>
              </div>
              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {!editing ? (
                  <button type="button" onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)] transition">
                    <Edit2 className="h-4 w-4" /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={handleCancelEdit}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)] transition">
                      Cancel
                    </button>
                    <button type="button" onClick={handleSave}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)] transition">
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>

            {!editing ? (
              /* View mode */
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">{profile.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_COLORS[profile.role] || "bg-slate-100 text-slate-700"}`}>
                      <Shield className="mr-1 h-3 w-3" />{profile.role}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">· {profile.department}</span>
                  </div>
                  {profile.bio && <p className="mt-3 text-sm text-[var(--text-secondary)]">{profile.bio}</p>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Mail, label: "Email", value: profile.email },
                    { icon: Phone, label: "Phone", value: profile.phone || "Not set" },
                    { icon: Briefcase, label: "Role", value: profile.role },
                    { icon: Building2, label: "Department", value: profile.department },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3">
                      <Icon className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                      <div className="min-w-0">
                        <div className="text-xs text-[var(--text-muted)]">{label}</div>
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Edit mode */
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Full Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input type="text" value={formData.name} onChange={e => { setFormData(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: undefined })); }}
                        className={inputCls(errors.name)} />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Email <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input type="email" value={formData.email} onChange={e => { setFormData(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: undefined })); }}
                        className={inputCls(errors.email)} />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Phone</label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input type="tel" value={formData.phone} onChange={e => { setFormData(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: undefined })); }}
                        className={inputCls(errors.phone)} placeholder="077 123 4567" />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Role</label>
                    <div className="relative">
                      <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <select value={formData.role} onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                        className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--panel)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]">
                        {["Administrator", "Supervisor", "Operational Staff"].map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Department</label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <select value={formData.department} onChange={e => setFormData(f => ({ ...f, department: e.target.value }))}
                        className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--panel)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]">
                        {["Operations", "Maintenance", "Administration"].map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Bio</label>
                  <textarea value={formData.bio} onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Brief description about yourself…"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] resize-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Change Password ── */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 sm:p-8 shadow-[var(--shadow-soft)]">
          <button type="button" onClick={() => setPasswordSection(p => !p)}
            className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--soft)]"><LockKeyhole className="h-5 w-5 text-[var(--text-muted)]" /></div>
              <div className="text-left">
                <div className="text-sm font-bold text-[var(--text-primary)]">Change Password</div>
                <div className="text-xs text-[var(--text-muted)]">Update your account password</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[var(--accent)]">{passwordSection ? "Cancel" : "Update →"}</span>
          </button>

          {passwordSection && (
            <form onSubmit={handlePasswordSave} className="mt-6 space-y-4">
              {[
                { key: "current" as const, label: "Current Password", placeholder: "Enter current password" },
                { key: "next" as const, label: "New Password", placeholder: "Create new password (min 8 chars)" },
                { key: "confirm" as const, label: "Confirm New Password", placeholder: "Repeat new password" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">{label}</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input type={showPw[key] ? "text" : "password"} value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className={`w-full rounded-xl border bg-[var(--panel)] py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-soft)] ${pwErrors[key] ? "border-rose-400" : "border-[var(--border)] focus:border-[var(--accent)]"}`} />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                      {showPw[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {pwErrors[key] && <p className="mt-1 text-xs text-rose-500">{pwErrors[key]}</p>}
                </div>
              ))}
              <button type="submit" className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${pwSaved ? "bg-emerald-600" : "bg-[var(--accent)] hover:bg-[var(--accent-dark)]"}`}>
                {pwSaved ? <><CheckCircle2 className="h-4 w-4" />Password Updated</> : <><Save className="h-4 w-4" />Update Password</>}
              </button>
            </form>
          )}
        </div>

        {/* ── Sign Out ── */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 sm:p-8 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                <LogOut className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">Sign Out</div>
                <div className="text-xs text-[var(--text-muted)]">End your current session</div>
              </div>
            </div>
            <button type="button"
              onClick={() => {
                localStorage.removeItem("srmss-demo-auth");
                localStorage.removeItem("srmss-demo-role");
                window.dispatchEvent(new Event("srmss-demo-role-changed"));
                router.push("/login");
              }}
              className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20 transition">
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Delete Account ── */}
        <div className="rounded-3xl border border-rose-200 bg-rose-50/40 dark:border-rose-400/20 dark:bg-rose-500/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-500/15">
              <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-700 dark:text-rose-300">Delete Account</div>
              <div className="text-xs text-rose-600/70 dark:text-rose-400/70">This action is permanent and cannot be undone</div>
            </div>
          </div>

          {!deleteOpen ? (
            <button type="button" onClick={() => setDeleteOpen(true)}
              className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20 transition">
              Delete My Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-rose-700 dark:text-rose-300">
                Type <strong>DELETE</strong> to confirm account deletion:
              </p>
              <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full max-w-xs rounded-xl border border-rose-300 bg-white px-3 py-2.5 text-sm text-rose-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/30" />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setDeleteOpen(false); setDeleteConfirmText(""); }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)] transition">
                  Cancel
                </button>
                <button type="button" onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE"}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Permanently Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

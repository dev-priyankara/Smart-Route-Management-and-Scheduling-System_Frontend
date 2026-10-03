"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Eye, EyeOff, Mail, LockKeyhole,
  User, Phone, Briefcase, Building2, ShieldCheck,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

type Role = "Administrator" | "Supervisor" | "Operational Staff";
type Department = "Operations" | "Maintenance" | "Administration";

type FormState = {
  name: string;
  email: string;
  phone: string;
  role: Role;
  department: Department;
  password: string;
  confirmPassword: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const ROLES: Role[] = ["Administrator", "Supervisor", "Operational Staff"];
const DEPARTMENTS: Department[] = ["Operations", "Maintenance", "Administration"];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Administrator: "Full system access — manage users, depots, routes and all operations",
  Supervisor: "Depot-level access — manage fleet, schedules, drivers and exceptions",
  "Operational Staff": "Daily operations — update trip status, record fuel and maintenance",
};

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", ok: /[a-z]/.test(password) },
    { label: "Contains a number", ok: /[0-9]/.test(password) },
  ];
  const strength = checks.filter(c => c.ok).length;
  const colors = ["bg-rose-500", "bg-amber-500", "bg-amber-400", "bg-emerald-400", "bg-emerald-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : "bg-[var(--border)]"}`} />
        ))}
      </div>
      {password && <div className={`text-xs font-medium ${strength <= 1 ? "text-rose-500" : strength <= 2 ? "text-amber-500" : "text-emerald-500"}`}>{labels[strength]}</div>}
      <div className="grid grid-cols-2 gap-1">
        {checks.map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`h-3.5 w-3.5 rounded-full flex items-center justify-center ${ok ? "bg-emerald-500" : "bg-[var(--border)]"}`}>
              {ok && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
            </div>
            <span className={`text-[11px] ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text-muted)]"}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "", role: "Supervisor",
    department: "Operations", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Full name is required";
    else if (form.name.trim().length < 3) next.name = "Name must be at least 3 characters";

    if (!form.email.trim()) next.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address";

    if (form.phone && !/^[\d\s\-+()]{7,15}$/.test(form.phone)) next.phone = "Enter a valid phone number";

    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(form.password)) next.password = "Include at least one uppercase letter";

    if (!form.confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Save to localStorage (frontend demo)
    const existingRaw = localStorage.getItem("srmss-registered-users") || "[]";
    const existing = JSON.parse(existingRaw) as FormState[];
    if (existing.some(u => u.email.toLowerCase() === form.email.toLowerCase())) {
      setErrors({ email: "An account with this email already exists" });
      return;
    }
    localStorage.setItem("srmss-registered-users", JSON.stringify([
      ...existing,
      { ...form, createdAt: new Date().toISOString() },
    ]));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Account Created!</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            <strong>{form.name}</strong> has been registered as <strong>{form.role}</strong>.
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-6">The account is ready. Sign in with the registered email and password.</p>
          <div className="flex flex-col gap-3">
            <button type="button" onClick={() => router.push("/login")}
              className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]">
              Go to Sign In
            </button>
            <button type="button" onClick={() => router.push("/admin?section=settings")}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--soft)] py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--panel)]">
              Back to Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <button type="button" onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)] transition">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)] text-xs font-bold text-white">SR</div>
            <span className="text-sm font-bold text-[var(--text-primary)]">SRMSS</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* Left — info panel */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3">
                <ShieldCheck className="h-4 w-4" /> SRMSS User Registration
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] leading-tight">Create a new staff account</h1>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Register a new team member with the appropriate role and department. They can sign in immediately after registration.
              </p>
            </div>

            {/* Role cards */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Available Roles</div>
              {ROLES.map(role => (
                <button key={role} type="button" onClick={() => set("role", role)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${form.role === role ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--panel)] hover:bg-[var(--soft)]"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{role}</span>
                    {form.role === role && <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{ROLE_DESCRIPTIONS[role]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Account Details</h2>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Full Name <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                    placeholder="e.g. Amal De Silva" autoComplete="name"
                    className={`w-full rounded-xl border bg-[var(--panel)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-soft)] ${errors.name ? "border-rose-400 focus:border-rose-400" : "border-[var(--border)] focus:border-[var(--accent)]"}`} />
                </div>
                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Email Address <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    placeholder="user@srmss.lk" autoComplete="email"
                    className={`w-full rounded-xl border bg-[var(--panel)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-soft)] ${errors.email ? "border-rose-400 focus:border-rose-400" : "border-[var(--border)] focus:border-[var(--accent)]"}`} />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Phone Number <span className="text-xs text-[var(--text-muted)] font-normal">(optional)</span></label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                    placeholder="077 123 4567" autoComplete="tel"
                    className={`w-full rounded-xl border bg-[var(--panel)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-soft)] ${errors.phone ? "border-rose-400 focus:border-rose-400" : "border-[var(--border)] focus:border-[var(--accent)]"}`} />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
              </div>

              {/* Role + Department */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Role <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <select value={form.role} onChange={e => set("role", e.target.value as Role)}
                      className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--panel)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]">
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Department <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <select value={form.department} onChange={e => set("department", e.target.value as Department)}
                      className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--panel)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]">
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Password <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)}
                    placeholder="Create a strong password" autoComplete="new-password"
                    className={`w-full rounded-xl border bg-[var(--panel)] py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-soft)] ${errors.password ? "border-rose-400 focus:border-rose-400" : "border-[var(--border)] focus:border-[var(--accent)]"}`} />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
                {form.password && <PasswordStrength password={form.password} />}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Confirm Password <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
                    placeholder="Repeat your password" autoComplete="new-password"
                    className={`w-full rounded-xl border bg-[var(--panel)] py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-soft)] ${errors.confirmPassword ? "border-rose-400 focus:border-rose-400" : form.confirmPassword && form.confirmPassword === form.password ? "border-emerald-400 focus:border-emerald-400" : "border-[var(--border)] focus:border-[var(--accent)]"}`} />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword}</p>}
                {form.confirmPassword && form.confirmPassword === form.password && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-emerald-500"><CheckCircle2 className="h-3.5 w-3.5" />Passwords match</p>
                )}
              </div>

              <button type="submit"
                className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] active:scale-[0.99]">
                Create Account
              </button>

              <p className="text-center text-xs text-[var(--text-muted)]">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

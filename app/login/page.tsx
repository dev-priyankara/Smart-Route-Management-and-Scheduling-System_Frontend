"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

const features = ["Centralized Routes", "Smart Scheduling", "Fleet Monitoring", "Operational Analytics"];

function subscribeToAccountMode(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getAccountMode() {
  return window.location.hash === "#register" ? "register" : "signin";
}

function getServerAccountMode() {
  return "signin";
}

export default function LoginPage() {
  const router = useRouter();
  const mode = useSyncExternalStore(subscribeToAccountMode, getAccountMode, getServerAccountMode);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [registration, setRegistration] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [registrationErrors, setRegistrationErrors] = useState<{ name?: string; email?: string; phone?: string; password?: string; confirmPassword?: string }>({});
  const [notice, setNotice] = useState("");
  const [remember, setRemember] = useState(true);

  const selectMode = (nextMode: "signin" | "register") => {
    if (nextMode === mode) return;
    window.location.hash = nextMode === "register" ? "register" : "";
    setNotice("");
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};
    if (!form.email.trim()) nextErrors.email = "Email or username is required.";
    if (!form.password.trim()) nextErrors.password = "Password is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const isOperationalStaff = form.email.trim().toLowerCase() === "depot.clerk@srmss.lk";
    window.localStorage.setItem("srmss-demo-auth", "true");
    window.localStorage.setItem("srmss-demo-role", isOperationalStaff ? "operational-staff" : "depot-supervisor");
    window.dispatchEvent(new Event("srmss-demo-role-changed"));
    router.push(isOperationalStaff ? "/operational-staff" : "/dashboard");
  };

  const onRegister = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof registrationErrors = {};
    if (!registration.name.trim()) nextErrors.name = "Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email)) nextErrors.email = "Enter a valid email address.";
    if (!registration.phone.trim()) nextErrors.phone = "Phone number is required.";
    if (registration.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (registration.confirmPassword !== registration.password) nextErrors.confirmPassword = "Passwords do not match.";

    setRegistrationErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setForm({ email: registration.email.trim(), password: registration.password });
    setNotice("Demo profile is ready in this session. Sign in to open the dashboard.");
    window.location.hash = "";
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:flex" style={{ backgroundImage: "linear-gradient(135deg, rgba(6,26,46,0.82), rgba(6,26,46,0.7)), url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80')", backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#061A2E]/70 via-[#0A2647]/50 to-[#00AEEF]/15" />
          <div className="relative z-10 flex w-full flex-col justify-between p-10 text-white">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm font-bold backdrop-blur-sm">SR</div>
                <div>
                  <div className="text-xl font-bold">SRMSS</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-sky-100/90">Smart Route Management and Scheduling System</div>
                </div>
              </div>
              <div className="max-w-md space-y-4">
                <h1 className="text-4xl font-semibold leading-tight">Better Routes. Smarter Operations.</h1>
                <p className="text-base text-sky-100/90">
                  Digital route planning, scheduling, fleet monitoring, driver coordination, maintenance tracking and operational analytics for public transport depots.
                </p>
              </div>
            </div>

            <div className="grid max-w-lg grid-cols-2 gap-3">
              {features.map((feature) => (
                <div key={feature} className="rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-sm font-medium text-sky-50 backdrop-blur-sm">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 w-full items-center justify-center p-5 sm:p-8 lg:p-12">
          <div className="auth-access-card w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between px-6 pt-6 sm:px-8 sm:pt-8">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Secure Access</div>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">One account. Smarter journeys.</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="auth-mode-switch mx-6 mt-6 mb-2 grid grid-cols-2 rounded-xl bg-[var(--soft)] p-1 sm:mx-8" role="tablist" aria-label="Account access">
              <span className={`auth-mode-indicator${mode === "register" ? " auth-mode-indicator-register" : ""}`} />
              <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => selectMode("signin")} className={`relative z-10 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === "signin" ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>Sign In</button>
              <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => selectMode("register")} className={`relative z-10 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === "register" ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>Register</button>
            </div>

            <div className="auth-slider-window">
              <div className={`auth-slider-track${mode === "register" ? " auth-slider-track-register" : ""}`}>
                <section className="auth-slide p-6 pt-4 sm:p-8 sm:pt-5" role="tabpanel" aria-label="Sign in" aria-hidden={mode !== "signin"} inert={mode !== "signin"}>
            <div className="mb-5 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3 text-sm text-[var(--text-secondary)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">Depot Supervisor / Manager</div>
                  <div className="text-xs text-[var(--text-muted)]">depot.admin@srmss.lk · SRMSS2026!</div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setForm({ email: "depot.admin@srmss.lk", password: "SRMSS2026!" }); setErrors({}); }} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--soft)]">Fill</button>
                  <button type="button" onClick={() => {
                    window.localStorage.setItem("srmss-demo-auth", "true");
                    window.localStorage.setItem("srmss-demo-role", "depot-supervisor");
                    window.dispatchEvent(new Event("srmss-demo-role-changed"));
                    router.push("/dashboard");
                  }} className="rounded-lg bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[var(--accent-dark)]">Direct Login</button>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">Operational Staff / Depot Clerk</div>
                  <div className="text-xs text-[var(--text-muted)]">depot.clerk@srmss.lk · Clerk2026!</div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setForm({ email: "depot.clerk@srmss.lk", password: "Clerk2026!" }); setErrors({}); }} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--soft)]">Fill</button>
                  <button type="button" onClick={() => {
                    window.localStorage.setItem("srmss-demo-auth", "true");
                    window.localStorage.setItem("srmss-demo-role", "operational-staff");
                    window.dispatchEvent(new Event("srmss-demo-role-changed"));
                    router.push("/operational-staff");
                  }} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Login as Clerk</button>
                </div>
              </div>
            </div>

            {notice && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" role="status">{notice}</p>}

            <form className="space-y-5" onSubmit={onSubmit} noValidate>
              <label className="block text-sm text-[var(--text-secondary)]">
                <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Email / Username</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="depot.admin@srmss.lk"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                  />
                </div>
                {errors.email && <span className="mt-1.5 block text-xs text-rose-500">{errors.email}</span>}
              </label>

              <label className="block text-sm text-[var(--text-secondary)]">
                <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Password</span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                  />
                </div>
                {errors.password && <span className="mt-1.5 block text-xs text-rose-500">{errors.password}</span>}
              </label>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
                  <input type="checkbox" checked={remember} onChange={() => setRemember((value) => !value)} className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)]" />
                  Remember me
                </label>
                <button type="button" onClick={() => setNotice("Password reset is not connected in this demo.")} className="font-medium text-[var(--accent)] hover:text-[var(--accent-dark)]">
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
              </section>
              <section className="auth-slide p-6 pt-4 sm:p-8 sm:pt-5" role="tabpanel" aria-label="Register" aria-hidden={mode !== "register"} inert={mode !== "register"}>
              <p className="mb-5 text-sm text-[var(--text-muted)]">Create a demo profile to continue to the SRMSS dashboard. No server account is created.</p>
              <form className="space-y-4" onSubmit={onRegister} noValidate>
                <label className="block text-sm text-[var(--text-secondary)]"><span className="mb-1.5 block font-medium text-[var(--text-primary)]">Full name</span><input type="text" autoComplete="name" value={registration.name} onChange={(event) => setRegistration((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />{registrationErrors.name && <span className="mt-1 block text-xs text-rose-500">{registrationErrors.name}</span>}</label>
                <label className="block text-sm text-[var(--text-secondary)]"><span className="mb-1.5 block font-medium text-[var(--text-primary)]">Email</span><input type="email" autoComplete="email" value={registration.email} onChange={(event) => setRegistration((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />{registrationErrors.email && <span className="mt-1 block text-xs text-rose-500">{registrationErrors.email}</span>}</label>
                <label className="block text-sm text-[var(--text-secondary)]"><span className="mb-1.5 block font-medium text-[var(--text-primary)]">Phone</span><input type="tel" autoComplete="tel" value={registration.phone} onChange={(event) => setRegistration((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />{registrationErrors.phone && <span className="mt-1 block text-xs text-rose-500">{registrationErrors.phone}</span>}</label>
                <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm text-[var(--text-secondary)]"><span className="mb-1.5 block font-medium text-[var(--text-primary)]">Password</span><input type="password" autoComplete="new-password" value={registration.password} onChange={(event) => setRegistration((current) => ({ ...current, password: event.target.value }))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />{registrationErrors.password && <span className="mt-1 block text-xs text-rose-500">{registrationErrors.password}</span>}</label><label className="block text-sm text-[var(--text-secondary)]"><span className="mb-1.5 block font-medium text-[var(--text-primary)]">Confirm password</span><input type="password" autoComplete="new-password" value={registration.confirmPassword} onChange={(event) => setRegistration((current) => ({ ...current, confirmPassword: event.target.value }))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />{registrationErrors.confirmPassword && <span className="mt-1 block text-xs text-rose-500">{registrationErrors.confirmPassword}</span>}</label></div>
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]">Create Demo Account <ArrowRight className="h-4 w-4" /></button>
              </form>
                </section>
              </div>
            </div>

            <div className="mx-6 mt-2 mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300 sm:mx-8 sm:mb-8">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Demo ready
              </div>
              <p className="mt-1">Frontend-only access simulation for university project demonstration.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

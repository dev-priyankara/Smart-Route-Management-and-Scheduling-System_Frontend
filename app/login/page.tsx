"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

const features = ["Centralized Routes", "Smart Scheduling", "Fleet Monitoring", "Operational Analytics"];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [remember, setRemember] = useState(true);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};
    if (!form.email.trim()) nextErrors.email = "Email or username is required.";
    if (!form.password.trim()) nextErrors.password = "Password is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (typeof window !== "undefined") {
      window.localStorage.setItem("srmss-demo-auth", "true");
    }
    router.push("/dashboard");
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

        <div className="flex items-center justify-center p-5 sm:p-8 lg:p-12">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Secure Access</div>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Sign in</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2 text-sm text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-primary)]">Demo login:</span> use any valid email and password to continue.
            </div>

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
                <Link href="/login" className="font-medium text-[var(--accent)] hover:text-[var(--accent-dark)]">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
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

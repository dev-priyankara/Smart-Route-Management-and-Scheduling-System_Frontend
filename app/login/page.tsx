"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Home, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

// ─── Demo credentials ─────────────────────────────────────────────────────────

const DEMO_ACCOUNTS = [
  {
    label: "System Administrator",
    email: "admin@srmss.lk",
    password: "Admin2026!",
    role: "admin",
    redirect: "/manager",
    color: "bg-violet-600 hover:bg-violet-700",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  },
  {
    label: "Depot Supervisor",
    email: "depot.admin@srmss.lk",
    password: "SRMSS2026!",
    role: "depot-supervisor",
    redirect: "/supervisor",
    color: "bg-[var(--accent)] hover:bg-[var(--accent-dark)]",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  {
    label: "Operational Staff",
    email: "depot.clerk@srmss.lk",
    password: "Clerk2026!",
    role: "operational-staff",
    redirect: "/staff",
    color: "bg-emerald-600 hover:bg-emerald-700",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
];

// ─── Animated bus SVG ─────────────────────────────────────────────────────────

function AnimatedBusPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#05131e] via-[#072034] to-[#0a2e4a]">

      {/* Animated road */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Stars / particles */}
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              top: `${5 + ((i * 17) % 80)}%`,
              left: `${3 + ((i * 13) % 90)}%`,
              animation: `twinkle ${2 + (i % 4) * 0.6}s ease-in-out infinite`,
              animationDelay: `${(i * 0.3) % 3}s`,
            }}
          />
        ))}

        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030d14] to-transparent" />
        <div className="absolute bottom-20 left-0 right-0 h-3 bg-[#0d1f2d]" />

        {/* Road dashes — animated scroll */}
        <div className="absolute bottom-[84px] left-0 right-0 h-1.5 overflow-hidden">
          <div className="flex gap-6 animate-road-dash">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="h-full w-16 shrink-0 rounded-full bg-[#00AEEF]/40" />
            ))}
          </div>
        </div>

        {/* Glow under bus */}
        <div
          className="absolute bottom-24 h-12 w-72 rounded-full bg-[var(--accent)]/20 blur-2xl animate-bus-move"
          style={{ left: "50%", transform: "translateX(-50%)" }}
        />
      </div>

      {/* Bus SVG — animated driving */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center animate-bus-move">
        <svg
          viewBox="0 0 300 110"
          className="w-72 drop-shadow-[0_8px_32px_rgba(0,174,239,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Animated SRMSS bus"
        >
          {/* Body shadow */}
          <ellipse cx="150" cy="108" rx="110" ry="6" fill="rgba(0,0,0,0.4)" />

          {/* Main body */}
          <rect x="10" y="20" width="280" height="75" rx="12" fill="#0d2a46" />
          <rect x="10" y="20" width="280" height="75" rx="12" fill="url(#busGrad)" />

          {/* Roof stripe */}
          <rect x="10" y="20" width="280" height="14" rx="10" fill="#00AEEF" opacity="0.9" />
          <rect x="10" y="29" width="280" height="5" fill="#0078b8" opacity="0.6" />

          {/* Side stripe */}
          <rect x="10" y="60" width="280" height="6" fill="#00AEEF" opacity="0.5" rx="3" />

          {/* Front windshield */}
          <rect x="240" y="30" width="40" height="35" rx="6" fill="#a8d8f0" opacity="0.85" />
          <line x1="261" y1="30" x2="261" y2="65" stroke="#7ab8d4" strokeWidth="1.5" opacity="0.6" />

          {/* Side windows */}
          {[30, 65, 100, 135, 170].map((x, i) => (
            <g key={i}>
              <rect x={x + 5} y="30" width="28" height="22" rx="4" fill="#c8e8f8" opacity="0.8" />
              {/* Window tint */}
              <rect x={x + 5} y="30" width="28" height="22" rx="4" fill="#00AEEF" opacity="0.15" />
            </g>
          ))}

          {/* Headlight */}
          <rect x="268" y="58" width="20" height="8" rx="4" fill="#fff9c4" opacity="0.95" />
          <ellipse cx="285" cy="62" rx="10" ry="5" fill="#fffde7" opacity="0.6" />

          {/* Tail light */}
          <rect x="12" y="55" width="12" height="10" rx="3" fill="#ff5252" opacity="0.9" />

          {/* Door */}
          <rect x="205" y="38" width="20" height="38" rx="3" fill="#0a2038" opacity="0.7" />
          <line x1="215" y1="38" x2="215" y2="76" stroke="#00AEEF" strokeWidth="1" opacity="0.5" />

          {/* SRMSS text on bus */}
          <text x="100" y="82" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#00AEEF" opacity="0.8" letterSpacing="2">
            SRMSS
          </text>

          {/* Wheel arches */}
          <ellipse cx="65" cy="95" rx="22" ry="8" fill="#061626" />
          <ellipse cx="225" cy="95" rx="22" ry="8" fill="#061626" />

          {/* Wheels */}
          <circle cx="65" cy="96" r="16" fill="#1a2e42" />
          <circle cx="65" cy="96" r="10" fill="#0f1e2b" />
          <circle cx="65" cy="96" r="5" fill="#00AEEF" opacity="0.7" />
          <circle cx="225" cy="96" r="16" fill="#1a2e42" />
          <circle cx="225" cy="96" r="10" fill="#0f1e2b" />
          <circle cx="225" cy="96" r="5" fill="#00AEEF" opacity="0.7" />

          {/* Hubcap spokes */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <line
              key={i}
              x1="65" y1="96"
              x2={65 + 9 * Math.cos((angle * Math.PI) / 180)}
              y2={96 + 9 * Math.sin((angle * Math.PI) / 180)}
              stroke="#00AEEF"
              strokeWidth="1.2"
              opacity="0.5"
            />
          ))}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <line
              key={i}
              x1="225" y1="96"
              x2={225 + 9 * Math.cos((angle * Math.PI) / 180)}
              y2={96 + 9 * Math.sin((angle * Math.PI) / 180)}
              stroke="#00AEEF"
              strokeWidth="1.2"
              opacity="0.5"
            />
          ))}

          {/* Headlight beam */}
          <path d="M 288 58 L 310 46 L 310 70 Z" fill="#fffde7" opacity="0.12" />

          <defs>
            <linearGradient id="busGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d2a46" />
              <stop offset="100%" stopColor="#0a1e30" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top content */}
      <div className="relative z-10 flex flex-col h-full justify-between p-10 text-white">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm font-bold backdrop-blur-sm border border-white/10">SR</div>
            <div>
              <div className="text-xl font-bold">SRMSS</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#00AEEF]/90">Smart Route Management</div>
            </div>
          </div>
          <div className="max-w-xs space-y-4">
            <h1 className="text-3xl font-bold leading-tight">
              Smarter Routes.<br />
              <span className="text-[#00AEEF]">Better Operations.</span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Digital route planning, fleet monitoring, driver coordination and operational analytics for public transport depots.
            </p>
          </div>
          {/* Feature pills */}
          <div className="mt-8 grid grid-cols-2 gap-2.5">
            {["Centralized Routes", "Smart Scheduling", "Fleet Monitoring", "Real-time Analytics"].map(f => (
              <div key={f} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm text-xs font-medium text-slate-300">
                <div className="h-1.5 w-1.5 rounded-full bg-[#00AEEF] shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </span>
          <span>Sri Lanka Public Transport</span>
        </div>
      </div>

      {/* CSS keyframes injected via style tag */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 0.7;  transform: scale(1.4); }
        }
        @keyframes road-dash {
          from { transform: translateX(0); }
          to   { transform: translateX(-88px); }
        }
        @keyframes bus-move {
          0%   { transform: translateX(-4px); }
          50%  { transform: translateX(4px); }
          100% { transform: translateX(-4px); }
        }
        .animate-road-dash { animation: road-dash 1.2s linear infinite; }
        .animate-bus-move  { animation: bus-move 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [notice, setNotice] = useState("");

  const doLogin = (email: string, password: string, role: string, redirect: string) => {
    window.localStorage.setItem("srmss-demo-auth", "true");
    window.localStorage.setItem("srmss-demo-role", role);
    window.dispatchEvent(new Event("srmss-demo-role-changed"));
    router.push(redirect);
  };

  const handleFill = (email: string, password: string) => {
    setForm({ email, password });
    setErrors({});
    setNotice("");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.email.trim()) next.email = "Email is required.";
    if (!form.password.trim()) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const email = form.email.trim().toLowerCase();
    const account = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email);
    if (account) {
      doLogin(email, form.password, account.role, account.redirect);
    } else {
      // Fallback
      if (email === "admin@srmss.lk") {
        doLogin(email, form.password, "admin", "/manager");
      } else if (email === "depot.clerk@srmss.lk") {
        doLogin(email, form.password, "operational-staff", "/staff");
      } else {
        doLogin(email, form.password, "depot-supervisor", "/supervisor");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ── Left: Animated Bus Panel ── */}
        <AnimatedBusPanel />

        {/* ── Right: Login Form ── */}
        <div className="flex min-w-0 w-full items-center justify-center p-5 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">

            {/* Card */}
            <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 sm:px-8 sm:pt-8 pb-2">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--soft)] text-[var(--text-secondary)] transition hover:bg-[var(--panel)] hover:text-[var(--accent)]"
                  title="Go to homepage"
                >
                  <Home className="h-5 w-5" />
                </button>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Secure Access</div>
                  <h2 className="mt-1.5 text-2xl font-bold text-[var(--text-primary)]">Welcome back</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Sign in to your SRMSS account</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-6 mt-4">

                {/* Quick Demo Logins */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-4 space-y-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mb-3">
                    ⚡ Quick Demo Access
                  </div>
                  {DEMO_ACCOUNTS.map(acc => (
                    <div key={acc.role} className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[var(--text-primary)]">{acc.label}</span>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${acc.badge}`}>{acc.role === "admin" ? "Admin" : acc.role === "depot-supervisor" ? "Supervisor" : "Staff"}</span>
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{acc.email}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => handleFill(acc.email, acc.password)}
                          className="rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--panel)] transition">
                          Fill
                        </button>
                        <button type="button" onClick={() => doLogin(acc.email, acc.password, acc.role, acc.redirect)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm transition ${acc.color}`}>
                          Login →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs text-[var(--text-muted)]">or sign in manually</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>

                {/* Notice */}
                {notice && (
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" role="status">
                    {notice}
                  </p>
                )}

                {/* Sign In Form */}
                <form className="space-y-4" onSubmit={onSubmit} noValidate>
                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                      Email / Username
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        placeholder="depot.admin@srmss.lk"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className={`w-full rounded-xl border bg-[var(--panel)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-soft)] ${errors.email ? "border-rose-400 focus:border-rose-400" : "border-[var(--border)] focus:border-[var(--accent)]"}`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-sm font-medium text-[var(--text-primary)]">Password</label>
                      <button type="button"
                        onClick={() => setNotice("Password reset is not connected in this demo.")}
                        className="text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-dark)]">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        className={`w-full rounded-xl border bg-[var(--panel)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-soft)] ${errors.password ? "border-rose-400 focus:border-rose-400" : "border-[var(--border)] focus:border-[var(--accent)]"}`}
                      />
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
                  </div>

                  {/* Submit */}
                  <button type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] active:scale-[0.99]">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}

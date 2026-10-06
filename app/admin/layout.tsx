import { AppShell } from "@/ui/AppShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
